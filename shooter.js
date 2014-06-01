var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var shtg_calcfilehash = require('./shtg_calcfilehash');

var shooter_url = 'http://www.shooter.cn';
var shtg_filehash = 'duei7chy7gj59fjew73hdwh213f';

// check user gives a valid query string
if (process.length < 3) {
    console.log('node shooter.js <query> [output path]');
    process.exit(1);
}

var url = process.argv[2];

// user gives a single subtitle page, don't need to find every subtitle
if (url.indexOf('sub') >= 0) {
    downloadSub(url);
} else {
    // user only gives the keyword not an url
    if (url.indexOf('search') == -1) {
        // encode the search string
        url = encodeURIComponent(url);
        url = shooter_url + '/search/' + url;
    }
    findSub(url, 0);
}

// find every subtitle from the url
function findSub(url, page) {
    console.log('search', url + '/?page=' + page);
    request(url + '/?page=' + page, function(err, res, body) {
        if (err) {
            console.log(err);
            return;
        }

        $ = cheerio.load(body);

        var titles = $('a[class="introtitle"]');
        // check this page contains titles
        if (titles.length > 0) {
            findSub(url, page + 1);

            titles.each(function(i, elem) {
                var subUrl = shooter_url + $(this).attr('href');
                downloadSub(subUrl, function() {});
            });
        }
    });
}

// download subtitle from the url
function downloadSub(url, callback) {
    console.log('found sub:', url);
    request(url, function(err, res, body) {
        if (err) {
            console.log(err);
            return callback();
        }

        $ = cheerio.load(body);

        // get the download id of this subtitle
        var download = $('td[class="download"]');
        var match = /var gFileidToBeDownlaod = (\d+);/i.exec(download.html());
        if (match.length <= 0) {
            return callback();
        }
        var id = match[1];
        var hashUrl = 'http://www.shooter.cn/files/file3.php?hash=' +
            shtg_filehash + '&fileid=' + id;

        // var title = $('span[id="movietitle1"]').text();

        // var rankbox = $('div[class="rankbox"]');
        // var rank = 0;
        // var ranknum = rankbox.find('span[class="ranknum"]').text();
        // if (ranknum) {
        //     match = /(\d+)分/.exec(ranknum)
        //     if (match.length > 0) {
        //         rank = ~~match[1];
        //     }
        // }
        //
        // var comment = 0;
        // var commentnum = rankbox.find('em[class="f12"]').text();
        // if (commentnum) {
        //     match = /\((\d+)人评价\)/.exec(commentnum);
        //     if (match.length > 0) {
        //         comment = ~~match[1]
        //     }
        // }

        // get subtitle languages
        var subtitle = '';

        var subdes_td = $('td[class="subdes_td"]');
        subdes_td.each(function(i, elem) {
            // there are two subdes_td, but we only want the last one
            if (i === subdes_td.length - 1) {
                subtitle = $(this).text();
            }
        });

        // we only want zh-TW subtitles
        if (subtitle.indexOf('繁') < 0) {
            return callback();
        }

        // use the hashurl to get the hash text,
        // then use shtg_calcfilehash() to build a complete url
        request(hashUrl, function(err, res, body) {
            var hash = shtg_calcfilehash(body);
            var url = 'http://file1.shooter.cn' + hash;

            var directory = '';
            var filename = '';

            // if user gave the output directory parameter,
            // then set directory to it
            if (process.argv[3] !== undefined) {
                directory = process.argv[3];
                path = directory;
            }

            var match = /file1\.shooter\.cn\/c\/(.*?)\?/i.exec(url);
            if (match && match.length > 0) {
                filename = match[1];
            } else {
                filename = id + '.rar';
            }
            var file = fs.createWriteStream(directory + filename);

            console.log('download', id, url);
            request(url).pipe(file);
        });
    });
}
