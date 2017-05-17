var request = require('request');
var cheerio = require('cheerio');
var Crawler = require("crawler");

var Epl = require('./models/Employer');
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://127.0.0.1:27017/jobs");

var fileLinksJobs = 'link-jobs-will-crawl-data.json';
var fileJobsList = 'jobs-list.json';

var live = false;

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

var writeJSON = function (filePath, data, exitApp) {
    var fs = require('node-fs');
    var json = JSON.stringify(data);
    filePath = './' + filePath;
    fs.writeFile(filePath, json, null, function () {
        console.log('done write to file: %s', filePath);
        if(typeof exitApp !== 'undefined')
            process.exit(0);
    });
};

// Get employer list
var insertEmployeers = function () {
    // Get employer detail
    var epl;
    var arrEplDetails = [];
    var crlGetEplDetail = new Crawler({
        rateLimit: 0,
        maxConnections: 10,
        callback: function (error, res, done) {
            var $ = res.$;
            var thisUrl = res.request.uri.href;
            var t = thisUrl.split('/');
            var eplId = t[t.length - 1];
            var about = $('#empabout').html();
            var etc = $('.job-title-etc h2').text();
            var name = $('.job-title-etc h1').text();
            var logoUrl = $('.employer-logo img').attr('src');
            var logo = typeof logoUrl !== 'undefined' ? 'https://www.healthecareers.com' + logoUrl : '';
            var bannerUrl = $('.employer-hero img').attr('src');
            var banner = typeof bannerUrl !== 'undefined' ? 'https://www.healthecareers.com' + bannerUrl : '';
            var urlAllJobs = "https://www.healthecareers.com/search-jobs/?empid="+eplId+"&specialty=*&ps=100";

            epl = {
                eplId: eplId,
                name: name,
                about: about,
                logo: logo,
                banner: banner,
                etc: etc,
                urlAllJobs: urlAllJobs,
                url: thisUrl
            };
            var arrEpls = [];
            arrEpls.push(epl);
            Epl.insertMany(arrEpls);
            // arrEplDetails.push(epl);

            done();
        }
    });
    crlGetEplDetail.on('drain',function(){
        console.log(arrEplDetails.length);
        console.timeEnd('getEplDetailAndInsert');
        process.exit(0);
    });

    var link = 'https://www.healthecareers.com/healthcare-employers';
    var letters = 'a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,1';
    var arrLetters = letters.split(',');
    var eplByLetter = [];
    var linkEpl = [];
    for(var i=0;i<arrLetters.length;i++){
        eplByLetter.push('https://www.healthecareers.com/healthcare-employers/?emplLetter=' + arrLetters[i].toUpperCase());
    }

    var crl = new Crawler({
        rateLimit: 0,
        maxConnections: 10,
        callback: function (error, res, done) {
            var $ = res.$;
            var thisUrl = res.request.uri.href;
            $('.grey-content a').each(function (i,el) {
                linkEpl.push($(this).attr('href'));
            });
            done();
        }
    });

    crl.queue(eplByLetter);
    crl.on('drain', function(){
        console.timeEnd('getListEpl');
        console.log(linkEpl.length);
        console.time('getEplDetailAndInsert');
        crlGetEplDetail.queue(linkEpl);
    });
};

var buildJSONJobList = function () {
    var arrLinks = [];
    var crl = new Crawler({
        rateLimit: 0,
        maxConnections: 10,
        callback: function (error, res, done) {
            var $ = res.$;
            var thisUrl = res.request.uri.href;

            var l = $('.pagination li').length;
            var maxPage = 0;
            $('.pagination li').each(function (i, el) {
                if(i === l - 2){
                    maxPage = parseInt($(this).text());
                    if(maxPage > 1){
                        for(var j=1;j< maxPage+1;j++){
                            arrLinks.push(thisUrl + '&pg=' + j);
                        }
                    }else{
                        arrLinks.push(thisUrl + '&pg=1');
                    }
                }
            });
            console.log(arrLinks.length);
            done();
        }
    });
    // Emitted when queue is empty
    crl.on('drain',function(){
        writeJSON(fileLinksJobs, arrLinks, 'close app after done');
        console.timeEnd('buildUrlJobDetail');
    });
    // Get all urlAllJobs
    Epl.find({urlAllJobs: {
        $not : { $type : 10 },
        $exists : true
    }}, function (err, empl) {
        if(err) throw err;
        if(empl.length > 0){
            var arr = [];
            for(var i=0; i< empl.length;i++){
                arr.push(empl[i].urlAllJobs);
            }
            // build array list url job detail
            console.time('buildUrlJobDetail');
            crl.queue(arr);
        }
    });
};

var getListJobs = function () {
    var jobUrls = require('./' + fileLinksJobs);
    jobUrls = jobUrls.toString().split(',');

    var arr = [];
    var crl = new Crawler({
        rateLimit: 0,
        maxConnections: 10,
        callback: function (error, res, done) {
            var $ = res.$;
            var thisUrl = res.request.uri.href;
            $('.search-result-list').each(function (i, el) {
                var t = $(this);
                var jobUrl = t.find('a').attr('href');
                jobUrl += '#' + getParameterByName('empid', thisUrl);
                arr.push(jobUrl);
            });
            console.timeEnd('getJobUrl');
            console.log(thisUrl,arr.length);

            done();
        }
    });
    console.time('getJobUrl');
    crl.queue(jobUrls);
    // var temp = ['https://www.healthecareers.com/search-jobs/?empid=349519&specialty=*&ps=100&pg=1'];
    // crl.queue(temp);
    crl.on('drain',function(){
        console.log(arr);
        console.log(arr.length);
        writeJSON(fileJobsList, arr, true);
    });
};

var getJobDetail = function () {
    var jobsList = require('./' + fileJobsList);
    jobsList = jobsList.toString().split(',');

    var crl = new Crawler({
        rateLimit: 0,
        maxConnections: 10,
        callback: function (error, res, done) {
            var $ = res.$;
            var thisUrl = res.request.uri.href;
            var panel = $('.tab-pane-content');
            var jobTitle = panel.find('h1').text().trim();
            var location = panel.find('h2').text().trim();
            var description = panel.find('.job-description').html();

            var date,jobId,type,vwa,specialty;
            $('.details-data li').each(function (i, el) {
                var _t = $(this);
                var text = _t.find('label').text();
                if(text === 'Date Posted:'){
                    date = _t.find('p').text().trim();
                }else if(text === 'Job Id:'){
                    jobId = _t.find('p').text().trim();
                }else if(text === 'Employment Type(s):'){
                    type = _t.find('p').text().trim();
                }else if(text === 'Visa Waiver Available:'){
                    vwa = _t.find('p').text().trim();
                }else if(text === 'Specialty:'){
                    specialty = _t.find('p').html().trim();
                }
            });
            var findEplId = /empid=(\d+)/.exec($('h4.center a').attr('href'));
            var employerId = thisUrl.split('#');
            employerId = employerId[1];
            var job = {
                employerId: employerId,
                jobId: jobId,
                title: jobTitle,
                description: description,
                location: location,
                date: date,
                type: type,
                vwa: vwa,
                specialty: specialty,
                url: thisUrl,
                inserted: 0
            };

            // Viet function check exist ra ngoai roi moi push
            Epl.update(
                {eplId: employerId},
                {$push: {jobs: job}},
                function (err) {
                    if(err) console.log(err);
                    else console.log(employerId + ' changed');
                }
            );

            done();
        }
    });
    console.time('pushJob');
    crl.queue(jobsList);
    // var temp = ['https://www.healthecareers.com/job/ent-md/1822440'];
    // crl.queue(temp);
    crl.on('drain',function(){
        setTimeout(function(){
            console.timeEnd('pushJob');
            process.exit(0);
        }, 3000);
    });
};

// wait seconds
var wait = 1;
function schedulerAddUsers() {
    setTimeout(function () {
        Epl.find({inserted: 0}, function (err, obj) {
            if(err) throw err;
            if(obj.length){
                obj = obj[0];
                console.log('Inserting employer %s', obj.eplId);
                addUserToWordpress(obj);
            }else{
                console.log('Finish add users');
                process.exit();
            }
        }).limit(1);
    }, wait*1000);
}

var arrJobs = [];
var waitJob = 0;
var countCurrentEmployer = 1;
function schedulerBuildJSONJobs() {
    setTimeout(function () {
        Epl.find({inserted: 1}, function (err, obj) {
            if(err) throw err;
            if(obj.length){
                obj = obj[0];
                if(obj.jobs.length > 0){
                    arrJobs = arrJobs.concat(obj.jobs);
                    console.log('No %s | employer %s | length now %s', countCurrentEmployer, obj.eplId, arrJobs.length);
                }

                // stop here to test
                // if(countCurrentEmployer === 2){
                //     writeJSON('array-jobs-will-add-to-wordpress.json', arrJobs, true);
                //     console.timeEnd('buildJSONJobsAddToWordpress');
                // }
                // end

                countCurrentEmployer++;
                updateInserted(obj.eplId, 0);
                schedulerBuildJSONJobs();
            }else{
                console.log('array %s', arrJobs.length);
                writeJSON('array-jobs-will-add-to-wordpress.json', arrJobs, true);
                console.timeEnd('buildJSONJobsAddToWordpress');
            }

        }).limit(1);
    }, wait*1000);
}

var jobsJSON = require('./' + 'array-jobs-will-add-to-wordpress.json');
function addJobsToWordpress() {
    var request = require('request');
    if(live)
        var endpoint = 'http://healthcareerslist.com/wp-admin/admin-ajax.php';
    else
        var endpoint = 'http://localhost:8080/health/wp-admin/admin-ajax.php';

    // exit when finish
    if(typeof jobsJSON[0] === 'undefined'){
        console.log('done');
        process.exit();
    }

    var form = {
        action: 'api_add_job',
        job: jobsJSON[0]
    };
    request.post({url: endpoint, form: form, json: true}, function (err,res,body) {
        if (!err && res.statusCode === 200) {
            console.log(body);
            // remove index 0 from array
            console.log(jobsJSON.length);
            jobsJSON.splice(0, 1);
            console.log('No %s', countProcessingJob);
            console.timeEnd('timeProcessingJob');
            countProcessingJob++;
            addJobsToWordpress();
        }
        if(res.statusCode !== 200 || err){
            console.log(res.statusCode);
            console.log(jobsJSON[0]);
            process.exit();
        }
    });
}

function addUserToWordpress(obj) {
    var request = require('request');
    if(live)
        var endpoint = 'http://healthcareerslist.com/wp-admin/admin-ajax.php';
    else
        var endpoint = 'http://localhost:8080/health/wp-admin/admin-ajax.php';
    var form = {
        action: 'api_add_user',
        eplId: obj.eplId,
        name: obj.name,
        about: obj.about,
        logo: obj.logo,
        banner: obj.banner,
        etc: obj.etc,
        urlAllJobs: obj.urlAllJobs,
        url: obj.url
    };
    request.post({
        url: endpoint,
        form: form
    }, function (err,res,body) {
        if (!err && res.statusCode === 200) {
            console.log(body);
            console.log('update inserted %s', obj.eplId);
            updateInserted(obj.eplId, 1, true);
            schedulerAddUsers();
        }
    });
}

function updateInserted(eplId, inserted, printMessage) {
    Epl.findOneAndUpdate({eplId: eplId}, { inserted: inserted }, function(err, epl) {
        if (err) throw err;
        if(printMessage === true)
            console.log('updated inserted status %s', eplId);
    });
}

function addCities() {
    if(live)
        var endpoint = 'http://healthcareerslist.com/wp-admin/admin-ajax.php';
    request.post({
        url: endpoint,
        form: {
            action: 'api_add_user'
        }
    }, function (err,res,body) {
        if (!err && res.statusCode === 200) {
            console.log(res);
        }
    });
}

function deleteAll() {
    if(live)
        var endpoint = 'http://healthcareerslist.com/wp-admin/admin-ajax.php';
    else
        var endpoint = 'http://localhost:8080/health/wp-admin/admin-ajax.php';
    var form = {
        action: 'delete'
    };
    request.post({
        url: endpoint,
        form: form
    }, function (err,res,body) {
        if (!err && res.statusCode === 200) {
            console.log(body);
            process.exit();
        }
    });
}

// ########################################################################################################
//1

// console.time('getListEpl');
// insertEmployeers();

//2
// buildJSONJobList();

//3
// getListJobs();

//4
// getJobDetail();

//5
live = true;
// schedulerAddUsers();

// console.time('buildJSONJobsAddToWordpress');
// schedulerBuildJSONJobs();

var countProcessingJob = 1;
console.time('timeProcessingJob');
addJobsToWordpress();

// addCities();
// deleteAll();