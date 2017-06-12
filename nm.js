var Nightmare = require('nightmare');
var cheerio = require('cheerio');
var Crawler = require("crawler");
var userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36";

function getEpl() {
    var link = 'http://www.healthjobsnationwide.com/index.php?action=company_list&ltr=';
    var arrLetters = 'a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z'.split(',');
    // var arrLetters = 'a'.split(',');
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
                var epl = [];
                epl['name'] = t.find('.lcol1 .co_t').text();
                epl['urlAllJobs'] = t.find('.co_j a').attr('href');
                epl['url'] = '';
                var temp = t.find('.co_u a').attr('href');
                var id = 0;
                if(temp){
                    temp = temp.match(/\d+/);
                    if(temp)
                        id = temp[0];
                    epl['url'] = 'http://www.healthjobsnationwide.com/index.php?action=co_info&border=1&logoID=' + id;
                }
                epl['id'] = id;
                console.log(id);
                epl['logo'] = t.find('.rcol1 img').attr('src') ? t.find('.rcol1 img').attr('src') : '';
                epl['website'] = t.find('tr').eq(3).find('.co_u a').attr('href') ? t.find('tr').eq(3).find('.co_u a').attr('href') : '';
                arrEpls.push(epl);
            });
            done();
        }
    });
    crlByLetters.queue(eplByLetter);
    crlByLetters.on('drain', function () {
        // console.log(arrEpls);
        console.log(arrEpls.length);
        process.exit();
    });
}
getEpl();

module.exports = {
    getEpl: function () {
        var nm = Nightmare({
            show: true,
            // openDevTools: {
            //     mode: 'detach'
            // }
        });
        nm.useragent(userAgent)
            .goto(link)
            .wait()
            .evaluate(function () {return document.body.innerHTML;})
            .end()
            .then(function (result) {
                var $ = cheerio.load(result);
                // var voucher = $('.np-voucher').html();
                // var thumbnail = '';
                // $('.itm-img').each(function (index,el) {
                //     if(index === $('.itm-img').length - 1)
                //         thumbnail = $(this).attr('src');
                // });
                // console.log(voucher,thumbnail);
            })
            .catch(function (error) {
                console.error(error);
            });
    }
};