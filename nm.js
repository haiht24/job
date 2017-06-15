var Nightmare = require('nightmare');
var cheerio = require('cheerio');
var Crawler = require("crawler");
var userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36";

// Connect Db
var Epl = require('./models/Site-2/Employer');

var dbName = 'job-sjb';
var strConnection = 'mongodb://127.0.0.1:27017/' + dbName;
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect(strConnection);

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

                var newEpl = new Epl(epl);
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
        // process.exit();
    });
}

function insertJobsToMongoDb(arrEpls) {
    var arrJobUrls = [];
    var option = {
        show: true,
        // openDevTools: {
        //     mode: 'detach'
        // }
    };
    var nm = Nightmare(option);
    function getJobUrl(start) {
        if(typeof start === 'undefined')
            start = 10;
        // var url = 'http://www.healthjobsnationwide.com/index.php?action=show_all&co_display_name=18540#co_display_name=18540';
        var url = arrEpls[0];
        url += '&start=' + start;
        nm.useragent(userAgent).goto(url).wait().evaluate(function () {return document.body.innerHTML;})
            // .end()
            .then(function (result) {
                console.log(url);
                var $ = cheerio.load(result);
                var box = $('.searchtd1');
                if(box.length > 0){
                    var tempArr = [];
                    box.each(function (i,el) {
                        var t = $(this);
                        if(t.find('.showvisited').length > 0) {
                            var jobUrl = t.find('.showvisited').attr('href');
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
                    // Neu 1 page co chinh xac 10 ket qua thi moi chuyen sang page tiep theo
                    if(unique.length === 10){
                        start += 10;
                        getJobUrl(start);
                    }else{
                        console.log('ket thuc crawl epl nay');
                        process.exit();
                        // Neu 1 page co it hon 10 kq thi chuyen sang epl tiep theo, remove index 0
                        if(arrEpls.length > 1){
                            arrEpls.splice(0,1);
                        }

                        if(arrEpls.length > 0){
                            // getJobUrl();
                        }
                    }
                }else{
                    console.log('arrJobUrls %s',arrJobUrls);
                    console.log(arrJobUrls.length);

                    // Neu page nay ko co kq thi chuyen sang epl tiep theo
                    if(arrEpls.length > 1){
                        arrEpls.splice(0,1);
                    }

                    if(arrEpls.length > 0){
                        // getJobUrl();
                    }
                }
            })
            .catch(function (error) {
                console.error(error);
            });
    }
    getJobUrl();
}

insertEmployersToMongoDb();
// insertJobsToMongoDb();