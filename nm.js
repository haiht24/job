var Nightmare = require('nightmare');
var cheerio = require('cheerio');
var Crawler = require("crawler");
var userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36";
var defaultDir = './json-files/';

// Connect Db
var Epl = require('./models/Site-2/Employer');
var Job = require('./models/Site-2/Job');

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
    });
}

function insertJobsToMongoDb(arrEpls) {
    // var prx = require('./json-files/proxies.json');
    // var proxyServer = prx[0].ipAddress + ':' + prx[0].port;
    // console.log('proxy now %s', proxyServer);

    var arrJobUrls = [];
    var option = {
        show: true,
        // openDevTools: {
        //     mode: 'detach'
        // },
        // switches: {
        //     'proxy-server': proxyServer
        // }
    };
    var nm = Nightmare(option);

    function _getJobAll(start) {
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
                            var objJob = new Job({url: _url});
                            objJob.save(function (err) {
                                if(err) throw err;
                            });
                        }
                        // Neu 1 page co ket qua thi moi chuyen sang page tiep theo
                        if(unique.length > 0){
                            start += 10;
                            _getJobAll(start);
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

    // getJobUrl();
    _getJobAll();
}

function getProxy() {
    console.time('getProxy');
    var ProxyLists = require('proxy-lists');

    var options = {
        countries: ['us'],
        bitproxies: {
            apiKey: 'GCOWR9G8fWalzG1tjQeKM6vRU4H19pzM'
        },
        kingproxies: {
            apiKey: 'e3e36e6755857958654d6ff7970f22'
        },
        anonymityLevels: ['elite']
    };
    var arr = [];

    // `gettingProxies` is an event emitter object.
    var gettingProxies = ProxyLists.getProxies(options);

    gettingProxies.on('data', function(proxies) {
        // Received some proxies.
        arr = arr.concat(proxies);
    });

    gettingProxies.on('error', function(error) {
        // Some error has occurred.
        console.error(error);
    });

    gettingProxies.once('end', function() {
        // Done getting proxies.
        var fs = require('node-fs');
        var json = JSON.stringify(arr);
        var filePath = defaultDir + 'proxies.json';
        fs.writeFile(filePath, json, null, function () {
            console.log('done write to file: %s', filePath);
            console.timeEnd('getProxy');
            // insertEmployersToMongoDb();
        });
    });
}

// getProxy();
// insertEmployersToMongoDb();
insertJobsToMongoDb();
