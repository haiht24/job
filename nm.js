var Nightmare = require('nightmare');
var cheerio = require('cheerio');
var Crawler = require("crawler");
var userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36";
var defaultDir = './json-files/';

// Connect Db
var Epl_2 = require('./models/Site-2/Employer');
var Job_2 = require('./models/Site-2/Job');

var Epl_1 = require('./models/Employer');
var Job_1 = require('./models/Job');

var dbName = 'job-sjb';
var strConnection = 'mongodb://127.0.0.1:27017/' + dbName;
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect(strConnection);

var helper = require('./helper');

function insertEmployersToMongoDb() {
    var link = 'http://www.healthjobsnationwide.com/index.php?action=company_list&ltr=';
    var arrLetters = 'a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z'.split(',');
    var eplByLetter = [];
    var linkEpl = [];
    for (var i = 0; i < arrLetters.length; i++) {
        eplByLetter.push(link + arrLetters[i].toUpperCase());
    }

    var arrEpls = [];
    var crlByLetters = new Crawler({
        rateLimit: 0,
        maxConnections: 10,
        callback: function (error, res, done) {
            var $ = res.$;
            var thisUrl = res.request.uri.href;
            $('.co_b').each(function (i, el) {
                var t = $(this);
                var name = t.find('.lcol1 .co_t').text();
                var urlAllJobs = t.find('.co_j a').attr('href');
                var url = '';
                var temp = t.find('.co_u a').attr('href');
                var logoId = 0;
                if(temp){
                    temp = temp.match(/\d+/);
                    if(temp)
                        logoId = temp[0];
                    url = 'http://www.healthjobsnationwide.com/index.php?action=co_info&border=1&logoID=' + logoId;
                }
                var eplId = 0;
                if(urlAllJobs){
                    var findId = urlAllJobs.match(/co_display_name=\d+/);
                    if(findId){
                        eplId = findId[0];
                        eplId = eplId.replace('co_display_name=', '');
                        urlAllJobs += '#co_display_name=' + eplId;
                    }
                }
                var logo = t.find('.rcol1 img').attr('src') ? t.find('.rcol1 img').attr('src') : '';
                var website = t.find('tr').eq(3).find('.co_u a').attr('href') ? t.find('tr').eq(3).find('.co_u a').attr('href') : '';

                var epl = {
                    eplId: eplId,
                    name: name,
                    // emailsContact: emailsContact,
                    // about: about,
                    logo: logo,
                    // banner: banner,
                    // etc: etc,
                    urlAllJobs: urlAllJobs,
                    url: url
                };

                var newEpl = new Epl_2(epl);
                newEpl.save(function (err) {
                    if (err) throw err;
                    console.log('Created %s', epl.name);
                });
                arrEpls.push(epl.urlAllJobs);
            });
            done();
        }
    });
    crlByLetters.queue(eplByLetter);
    crlByLetters.on('drain', function () {
        console.log(arrEpls.length);
        insertJobsToMongoDb(arrEpls);
    });
}

function insertJobsToMongoDb(arrEpls) {
    var prx = require('./json-files/proxies.json');
    var proxyServer = prx[0];
    console.log('proxy now %s', proxyServer);

    var arrJobUrls = [];
    var option = {
        show: true,
        // openDevTools: {
        //     mode: 'detach'
        // },
        switches: {
            'proxy-server': proxyServer
        }
    };
    var nm = Nightmare(option);

    function get1000Job(start) {
        if(typeof start === 'undefined')
            start = 10;
        url = 'http://www.healthjobsnationwide.com/index.php?action=show_all&pID=';
        url += '#start=' + start;
        console.log('url now: %s', url);
        nm.useragent(userAgent).goto(url).wait('.searchtd1').evaluate(function () {return document.body.innerHTML;})
            .then(function (result) {
                var $ = cheerio.load(result);
                var box = $('.searchtd1');
                if(box.length > 0){
                    var tempArr = [];
                    box.each(function (i,el) {
                        var t = $(this);
                        if(t.find('.showvisited').length > 0) {
                            var jobUrl = t.find('.showvisited').attr('href');
                            // only get internal job url, skip job link to other website
                            if(jobUrl.indexOf('healthjobsnationwide') >= 0)
                                tempArr.push(jobUrl);
                        }
                    });
                    // remove duplicate url
                    var unique = tempArr.filter(function(elem, index, self) {
                        return index === self.indexOf(elem);
                    });
                    arrJobUrls = arrJobUrls.concat(unique);

                    console.log('found job %s', unique.length);
                    console.log('current count arrJobUrls', arrJobUrls.length);

                    if(unique.length > 0){
                        // Save job url to mongo
                        for(var i = 0; i < unique.length; i++){
                            var _url = unique[i];
                            var objJob = new Job_2({url: _url});
                            objJob.save(function (err) {
                                if(err) throw err;
                            });
                        }
                        // Neu 1 page co ket qua thi moi chuyen sang page tiep theo
                        if(unique.length > 0){
                            start += 10;
                            get1000Job(start);
                        }else{
                            console.log('khong co them job duoc tim thay. Ket thuc');
                            process.exit();
                        }
                    }
                }else{
                    console.log('box not found. Next url');
                    console.log('current url: %s', url);
                    process.exit();
                }
            })
            .catch(function (error) {
                console.error(error);
                process.exit();
            });
    }
    get1000Job();
}

function updateJobDetailToMongo() {
    var crl = new Crawler({
        rateLimit: 0,
        maxConnections: 5,
        callback: function (error, res, done) {
            var $ = res.$;
            var thisUrl = res.request.uri.href;
            console.log('processing %s', thisUrl);

            var objJob = {};
            if($('.pz_job_desc').length > 0){
                objJob = jobType_1($, thisUrl);
            }else{
                console.log('type 2');
                if(thisUrl.indexOf('healthjobsnationwide.com') >= 0){
                    objJob = jobType_2($, thisUrl);
                }else{
                    console.log('Other site');
                    process.exit();

                }
            }

            // Get epl id from epl_1 or epl_2
            if(typeof objJob.eplName !== 'undefined'){
                // Find in epl_1 first
                Epl_1.find({name: objJob.eplName}, function (err, epl) {
                    if(err) throw err;
                    // If not found in epl_1 then find in epl_2
                    if(epl.length === 0){
                        Epl_2.find({name: objJob.eplName}, function (error, employer) {
                            if(error) throw error;
                            if(employer.length > 0){
                                // ya found it!!!
                                console.log('found in epl 2');
                                employer = employer[0];
                                objJob.employerId = employer.eplId;
                                updateJobInfo(objJob);
                            }
                        }).limit(1);
                    }else{
                        console.log('found in epl 1');
                        // If found in epl_1
                        epl = epl[0];
                        objJob.employerId = epl.eplId;
                        updateJobInfo(objJob);
                    }
                }).limit(1);
            }

            done();
        }
    });

    // When crawler finish
    crl.on('drain', function () {
        console.log('done');
    });

    Job_2.find({
        title: null,
        url: {$regex: /healthjobsnationwide.com/}
    }, {url: 1}, function (err, jobs) {
        if(err) throw err;
        if(typeof jobs !== 'undefined' && jobs.length > 0){
            var arr = [];
            for(var i = 0; i < jobs.length; i++){
                arr.push(jobs[i].url);
            }
            // chay thu 1 link
            // crl.queue(arr[0]);
            // chay tat ca link
            crl.queue(arr);
        }
    });

    function updateJobInfo(job) {
        var updateValues = {
            jobId: job.jobId,
            title: job.title,
            description: job.description,
            location: job.location,
            date: job.date,
            specialty: job.specialty,
            employerId: parseInt(job.employerId),
            url: job.url
        };
        Job_2.update(
            {url: job.url},
            {$set: updateValues},
            function (err) {
                if(err) throw err;
                console.log('updated %s', job.url);
            }
        );
    }

    function jobType_1($, thisUrl) {
        var objJob = {};
        objJob.url = thisUrl;
        objJob.description = $('.pz_job_desc').html();
        $('td[valign=top]').each(function (i,e) {
            var t = $(this);
            // find other job information
            if(i === 2){
                var arrInfo = t.html().split('<div class="details_div"></div>');
                // remove special characters
                for(var i = 0; i < arrInfo.length; i++){
                    arrInfo[i] = arrInfo[i].replace(/\n/g, '');
                    arrInfo[i] = arrInfo[i].replace(/\t/g, '');
                }
                for(var i = 0; i < arrInfo.length; i++){
                    var _t = arrInfo[i];
                    var _findMe = '';
                    // get job code
                    _findMe = 'Job Code:<br>';
                    if(_t.indexOf(_findMe) >= 0){
                        objJob.jobId = _t.replace(_findMe, '').trim();
                    }
                    // get posted date
                    _findMe = 'Date Posted:<br>';
                    if(_t.indexOf(_findMe) >= 0){
                        objJob.date = _t.replace(_findMe, '').trim();
                        objJob.date = helper.convertDate(objJob.date);
                    }
                    // get specialty
                    _findMe = 'Specialty Type<br>';
                    if(_t.indexOf(_findMe) >= 0){
                        objJob.specialty = _t.replace(_findMe, '').trim();
                    }
                }
            }
            // find job description
            if(i === 7){
                objJob.title = t.find('div').eq(0).text().trim();
                objJob.location = t.find('div').eq(1).text().trim();
                objJob.location = objJob.location.replace('Geographic Location: ', '');
            }
        });
        // find Employer name
        var eplName = $('td[valign=TOP]').find('span').eq(0).html();
        if(typeof eplName !== 'undefined' && eplName !== null){
            eplName = eplName.replace(/<br>/g, '').trim();
            objJob.eplName = eplName;
        }
        return objJob;
    }

    function jobType_2($, thisUrl) {
        var objJob = {};
        objJob.url = thisUrl;
        // objJob.description = $('#MainContent_lblComments').html();
        objJob.title = $('#MainContent_lblPosition').html() || '';
        objJob.location = $('#MainContent_lblJobState').html() || '';
        objJob.specialty = $('#MainContent_lblCategory').html() || '';
        var findJobId = $('#apply_off a').attr('href');
        findJobId = findJobId.match(/[0-9]+/);
        objJob.jobId = findJobId[0] || '';
        objJob.eplName = '';
        console.log(objJob);
        process.exit();

    }
}

// helper.getProxy();
// insertEmployersToMongoDb();
// insertJobsToMongoDb();
updateJobDetailToMongo();
