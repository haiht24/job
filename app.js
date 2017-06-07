// Libs
var request = require('request');
var cheerio = require('cheerio');
var Crawler = require("crawler");
// Connect Db
var dbName = 'job-sjb';
var strConnection = 'mongodb://127.0.0.1:27017/' + dbName;
var Epl = require('./models/Employer');
var Jb = require('./models/Job');
var helper = require('./helper');
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect(strConnection);

/* Functions */

// Get and insert employer list to mongodb (43 seconds)
function insertEmployersToMongoDb(next) {
    // Get employer detail
    var epl;
    var crlGetEplDetail = new Crawler({
        rateLimit: 0,
        maxConnections: 10,
        callback: function (error, res, done) {
            var $ = res.$;
            var thisUrl = res.request.uri.href;
            var t = thisUrl.split('/');
            var eplId = t[t.length - 1];
            var about = $('#empabout').html();
            var emailsContact = '';
            if (about) {
                emailsContact = helper.extractWebsite(about);
            }
            var etc = $('.job-title-etc h2').text();
            var name = $('.job-title-etc h1').text();
            var logoUrl = $('.employer-logo img').attr('src');
            var logo = typeof logoUrl !== 'undefined' ? 'https://www.healthecareers.com' + logoUrl : '';
            var bannerUrl = $('.employer-hero img').attr('src');
            var banner = typeof bannerUrl !== 'undefined' ? 'https://www.healthecareers.com' + bannerUrl : '';
            var urlAllJobs = "https://www.healthecareers.com/search-jobs/?empid=" + eplId + "&specialty=*&ps=100";

            epl = {
                eplId: eplId,
                name: name,
                emailsContact: emailsContact,
                about: about,
                logo: logo,
                banner: banner,
                etc: etc,
                urlAllJobs: urlAllJobs,
                url: thisUrl
            };

            // insert epl to mongodb
            var newEpl = new Epl(epl);
            newEpl.save(function (err) {
                if (err) throw err;
                console.log('Created %s', epl.name);
            });

            done();
        }
    });
    crlGetEplDetail.on('drain', function () {
        console.timeEnd('getEplDetailAndInsert');
        if (next === true) {
            // Them epl moi thanh cong, gio add job
            getAndInsertJobToMongo(true);
        } else {
            process.exit(0);
        }
    });

    var link = 'https://www.healthecareers.com/healthcare-employers';
    var letters = 'a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,1';
    var arrLetters = letters.split(',');
    var eplByLetter = [];
    var linkEpl = [];
    for (var i = 0; i < arrLetters.length; i++) {
        eplByLetter.push('https://www.healthecareers.com/healthcare-employers/?emplLetter=' + arrLetters[i].toUpperCase());
    }

    var crl = new Crawler({
        rateLimit: 0,
        maxConnections: 10,
        callback: function (error, res, done) {
            var $ = res.$;
            var thisUrl = res.request.uri.href;
            $('.grey-content a').each(function (i, el) {
                linkEpl.push($(this).attr('href'));
            });
            done();
        }
    });

    crl.queue(eplByLetter);
    crl.on('drain', function () {
        console.timeEnd('getListEpl');
        console.log(linkEpl.length);

        console.time('getEplDetailAndInsert');
        crlGetEplDetail.queue(linkEpl);
    });
}

/* Crawl all jobs and insert them to mongodb */
function getAndInsertJobToMongo(next) {
    var arrLinks = [];
    var crl = new Crawler({
        rateLimit: 0,
        maxConnections: 10,
        callback: function (error, res, done) {
            var $ = res.$;
            var thisUrl = res.request.uri.href;

            var el = $('.pagination li');
            var l = el.length;
            var maxPage = 0;
            el.each(function (i, el) {
                if (i === l - 2) {
                    maxPage = parseInt($(this).text());
                    if (maxPage > 1) {
                        for (var j = 1; j < maxPage + 1; j++) {
                            arrLinks.push(thisUrl + '&pg=' + j);
                        }
                    } else {
                        arrLinks.push(thisUrl + '&pg=1');
                    }
                }
            });
            console.log('arrLinks: %s', arrLinks.length);
            done();
        }
    });
    // Emitted when queue is empty
    crl.on('drain', function () {
        console.timeEnd('buildUrlJobDetail');
        getListJobs(arrLinks);
    });
    // Get list job url
    function getListJobs(jobUrls) {
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
                    jobUrl += '#' + helper.getParameterByName('empid', thisUrl);
                    arr.push(jobUrl);
                });
                console.timeEnd('getJobUrl');
                console.log(thisUrl, arr.length);

                done();
            }
        });

        console.time('getJobUrl');
        crl.queue(jobUrls);

        crl.on('drain', function () {
            console.log('length now %s', arr.length);
            getJobDetail(arr);
        });
    }
    // Get job detail from source url
    function getJobDetail(jobsList) {
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

                var date, jobId, type, vwa, specialty;
                $('.details-data li').each(function (i, el) {
                    var _t = $(this);
                    var text = _t.find('label').text();
                    if (text === 'Date Posted:') {
                        date = _t.find('p').text().trim();
                    } else if (text === 'Job Id:') {
                        jobId = _t.find('p').text().trim();
                    } else if (text === 'Employment Type(s):') {
                        type = _t.find('p').text().trim();
                    } else if (text === 'Visa Waiver Available:') {
                        vwa = _t.find('p').text().trim();
                    } else if (text === 'Specialty:') {
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
                var newJob = new Jb(job);
                newJob.save(function (err) {
                    if(err){
                        // throw err;
                        console.log('Error, continue');
                        console.log(job);
                    }else{
                        console.log('Created job: %s', job.title);
                    }
                });
                done();
            }
        });

        console.time('pushJob');
        crl.queue(jobsList);

        crl.on('drain', function () {
            setTimeout(function () {
                console.timeEnd('pushJob');
                // insert xong job moi vao mongo, gio add vao sjb

                if (next === true) {
                    addNewEplToSJB(true);
                } else {
                    process.exit(0);
                }
            }, 3000);
        });
    }
    // Get all urlAllJobs and return _id and field urlAllJobs only
    Epl.find({
        urlAllJobs: { $not: {$type: 10}, $exists: true }
    },{urlAllJobs: 1}, function (err, empl) {
        if (err) throw err;
        if (empl.length > 0) {
            var arr = [];
            for (var i = 0; i < empl.length; i++) {
                arr.push(empl[i].urlAllJobs);
            }
            // build array list url job detail
            console.time('buildUrlJobDetail');
            crl.queue(arr);
        }
    });
}

// Compare epl mongo and sjb
function compareEpl() {
    var SJBEpl = require('./json-files/existed-employers-in-SJB.json');
    for(var i = 0; i < SJBEpl.length; i++){
        var epl = SJBEpl[i];
        var sourceEplId = parseInt(epl.sourceEplId);
        var sjbEplId = parseInt(epl.sjbEplId);
        Epl.update({eplId: sourceEplId}, {$set: {sjbId: sjbEplId}}, function (err) {
            if(err)
                console.log('update fail');
            else
                console.log('update success');
        });
    }
}
// Compare job mongo and sjb
function compareJob() {
    var SJBJob = require('./json-files/existed-jobs-in-SJB.json');
    for(var i = 0; i < SJBJob.length; i++){
        var job = SJBJob[i];
        var sourceJobId = parseInt(job.sourceJobId);
        var ejbJobId = parseInt(job.ejbJobId);
        Jb.update({jobId: sourceJobId}, {$set: {sjbId: ejbJobId}}, function (err) {
            if(err)
                console.log('update fail');
            else
                console.log('update success');
        });
    }
}

// insert new epl to sjb
function addNewEplToSJB(next) {
    Epl.findOne({sjbId: 0}, function (err, data) {
        if(err) throw err;

        if(data){
            var originPath = 'https://health.mysmartjobboard.com/api/';
            var apiKey = 'f59b583aa1b4ada293a40f17c10adabc';
            var url = originPath + 'employers?api_key=' + apiKey;

            var obj = data;
            console.log('new epl %s', obj.name);

            var email = helper.randomEmail();
            var cpnName = obj.name,
                cpnDescription = obj.about,
                etc = obj.etc,
                logo = obj.logo,
                banner = obj.banner,
                source = obj.url,
                emailContacts = obj.emailsContact
            ;

            // dont insert empty etc
            if (etc === ',  ')
                etc = '';
            if (etc[0] === ',')
                etc = etc.substring(1).trim();
            if (cpnName === '') {
                // if empty company name then git it from url ahihi
                var arrUrl = obj.url.split('/');
                arrUrl = arrUrl[arrUrl.length - 2];
                arrUrl = arrUrl.split('-').join(' ');
                cpnName = arrUrl;
            }

            var body = {
                'password': 'yourdefaultpassword',
                'email': email,
                'registration_date': '',
                'active': 1,
                'featured': 0,
                'company_name': cpnName,
                'company_description': cpnDescription,
                'full_name': cpnName,
                'location': etc,
                'phone': '0966666666',
                'logo': logo,
                'website': helper.extractWebsite(cpnDescription),
                'custom_fields': [
                    {
                        name: 'Logo Url',
                        value: logo
                    },
                    {
                        name: 'Banner Url',
                        value: banner
                    },
                    {
                        name: 'Source Url',
                        value: source
                    },
                    {
                        name: 'Email Contacts',
                        value: emailContacts
                    },
                    {
                        name: "Source Employer Id",
                        value: obj.eplId.toString()
                    },
                    {
                        name: "Employer Logo",
                        value: logo
                    }
                ]
            };

            request.post({
                method: 'POST', url: url, headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body)
            }, function (err, res, body) {
                if (typeof res.statusCode === 'undefined') {
                    console.log('###########################Error############################');
                    console.log(res);
                    process.exit();
                }
                if (!err && res.statusCode === 201) {
                    console.log('successful');
                    body = JSON.parse(body);
                    var sjbEplId = body.id;
                    var updateThisEplToMongodb = 0;
                    for(var i = 0; i < body.custom_fields.length; i++){
                        if(body.custom_fields[i].name === 'Source Employer Id'){
                            updateThisEplToMongodb = parseInt(body.custom_fields[i].value);
                        }
                    }
                    if(updateThisEplToMongodb > 0){
                        Epl.update({eplId: updateThisEplToMongodb},
                            {$set: {sjbId: sjbEplId}},
                            function (err) {
                                if(err) throw err;
                                console.log('Update back to mongo success');
                                // De quy, tiep tuc tim epl moi va insert vao sjb
                                addNewEplToSJB(true);
                            }
                        );
                    }

                } else {
                    console.log('Code %s', res.statusCode);
                    console.log(res);
                }
            });
        }
        else{
            // Sau khi add new het epl, chuyen sang add job vao sjb
            addNewJobToSJB();
        }
    });
}

// insert new job to sjb
function addNewJobToSJB() {
    var originPath = 'https://health.mysmartjobboard.com/api/';
    var apiKey = 'f59b583aa1b4ada293a40f17c10adabc';
    var url = originPath + 'jobs?api_key=' + apiKey;

    // Tim cac jobs moi, co sjbId = 0
    Jb.find({sjbId: 0}, function (err, data) {
        if(err) throw err;
        if(data.length > 0){
            console.log('New jobs found %s', data.length);
            var j = data[0];
            addSingleJobToSJB(j);
        }else{
            console.timeEnd('TongThoiGian');
            console.log('Exit app');
            process.exit();
        }
    }).limit(1);

    function addSingleJobToSJB(job) {
        var arrTags = [];
        if (job.specialty)
            arrTags = job.specialty.split('<br>');
        var tags = '';
        if (arrTags.length > 0) {
            for (var i = 0; i < arrTags.length; i++) {
                tags += arrTags[i] + ' job';
                tags = tags.replace(/NP/g, 'Nurse Practitioner');
                tags = tags.replace(/RN/g, 'Registered Nurse');
                tags = tags.replace(/NP/g, 'Physician Assistant');
                if (i !== arrTags.length - 1)
                    tags += ', ';
            }
        }

        job = helper.dataCleaned(job);

        // Tim sjbEplId trong epl tuong ung o mongo
        Epl.findOne({eplId: job.employerId}, {sjbId: 1}, function (err, result) {
            if(err) throw err;
            if(result){
                var sjbId = result.sjbId;
                var title = job.title ? job.title : 'default job title';
                var url = originPath + 'jobs?api_key=' + apiKey;
                var data = {
                    "active": 1,
                    "featured": 0,
                    "activation_date": job.date,
                    "employer_id": sjbId,
                    "title": title,
                    "job_type": job.type,
                    "categories": job.catsConverted,
                    "location": job.location,
                    "description": job.description,
                    "custom_fields": [
                        {
                            name: 'Tags',
                            value: tags
                        },
                        {
                            name: 'Source Employer Id',
                            value: job.employerId
                        },
                        {
                            name: 'Source Job Id',
                            value: job.jobId
                        }
                    ]
                };

                if(job.howToApply){
                    data.how_to_apply = job.howToApply;
                }

                request.post({
                    method: 'POST', url: url, headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data)
                }, function (err, res, body) {
                    if (typeof res.statusCode === 'undefined') {
                        console.log('###########################Error############################');
                        console.log(res);
                    }
                    if (!err && res.statusCode === 201) {
                        body = JSON.parse(body);
                        // update inserted sjbId to job in mongodb
                        Jb.update({jobId: job.jobId},
                            {$set: {sjbId: body.id}},
                            function (err) {
                                if(err) throw err;
                                console.log('Added new job: sjbId %s | mongoId: %s', body.id, job.jobId);

                                // De quy, tiep tuc tim job moi trong mongo va add vao sjb
                                addNewJobToSJB();
                            }
                        )
                    } else {
                        console.log('########################Error when add new job to SJB################################');
                        console.log('Code %s', res.statusCode);
                        console.log('#########################Data sending###############################');
                        console.log(data);
                    }
                });

            }
        })
    }
}

/* Run code */
/* Chay tu dau tien */
console.time('TongThoiGian');
console.time('getListEpl');
insertEmployersToMongoDb(true);
/* End */

/* Chay tach roi */

// getAndInsertJobToMongo();

// compareEpl();
// compareJob();

// addNewEplToSJB(true);
// addNewJobToSJB();