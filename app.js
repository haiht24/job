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
function insertEmployersToMongoDb(runNextStep) {
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
        if (runNextStep === true) {
            // getAndInsertJobToMongo(true);
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
function getAndInsertJobToMongo() {
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

                // Viet function check exist ra ngoai roi moi push
                // Epl.update(
                //     {eplId: employerId},
                //     {$push: {jobs: job}},
                //     function (err) {
                //         if (err) console.log(err);
                //         else console.log('Employer %s have jobs changed', employerId);
                //     }
                // );

                done();
            }
        });

        console.time('pushJob');
        crl.queue(jobsList);

        crl.on('drain', function () {
            setTimeout(function () {
                console.timeEnd('pushJob');
                // insert xong job moi vao mongo, gio add vao sjb
                // if (runNextStep === true) {
                //     // step 5
                //     console.time('addEpmployerToSmartJob');
                //     schedulerAddUsers();
                // } else {
                //     process.exit(0);
                // }
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

/* Run code */
// console.time('getListEpl');
// insertEmployersToMongoDb();

getAndInsertJobToMongo();