var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');

var shooter_url = 'http://www.shooter.cn';
var shtg_filehash = 'duei7chy7gj59fjew73hdwh213f';

// check user gives a valid query string
if (process.length < 3) {
    console.log('node shooter.js <query>');
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

        // use the hashurl to get the hash text,
        // then use shtg_calcfilehash() to build a complete url
        request(hashUrl, function(err, res, body) {
            var hash = shtg_calcfilehash(body);
            var url = 'http://file1.shooter.cn' + hash;

            // we only want need zh-TW subtitle
            if (subtitle.indexOf('繁') >= 0) {
                var path = '';
                if (process.argv[3] !== undefined) {
                    path = process.argv[3];
                }

                var match = /file1\.shooter\.cn\/c\/(.*?)\?/i.exec(url);
                var file;
                if (match && match.length > 0) {
                    path += match[1];
                    file = fs.createWriteStream(path);
                } else {
                    path += id + '.rar';
                    file = fs.createWriteStream(path);
                }

                console.log('download', id, url);
                request(url, function(err) {
                    if (err) {
                        return;
                    }
                }).pipe(file);
            }
        });
    });
}

function shtg_calcfilehash(a) {
    function b(j) {
        var g = "";
        for (var f = 0; f < j.length; f++) {
            var h = j.charCodeAt(f);
            g += (h + 47 >= 126) ? String.fromCharCode(" ".charCodeAt(0) + (h +
                47) % 126) : String.fromCharCode(h + 47)
        }
        return g
    }

    function d(g) {
        var j = g.length;
        j = j - 1;
        var h = "";
        for (var f = j; f >= 0; f--) {
            h += (g.charAt(f))
        }
        return h
    }

    function c(j, h, g, f) {
        return j.substr(j.length - f + g - h, h) + j.substr(j.length - f, g - h) +
            j.substr(j.length - f + g, f - g) + j.substr(0, j.length - f)
    }
    if (a.length > 32) {
        switch (a.charAt(0)) {
            case "o":
                return (b((c(a.substr(1), 8, 17, 27))));
                break;
            case "n":
                return (b(d(c(a.substr(1), 6, 15, 17))));
                break;
            case "m":
                return (d(c(a.substr(1), 6, 11, 17)));
                break;
            case "l":
                return (d(b(c(a.substr(1), 6, 12, 17))));
                break;
            case "k":
                return (c(a.substr(1), 14, 17, 24));
                break;
            case "j":
                return (c(b(d(a.substr(1))), 11, 17, 27));
                break;
            case "i":
                return (c(d(b(a.substr(1))), 5, 7, 24));
                break;
            case "h":
                return (c(b(a.substr(1)), 12, 22, 30));
                break;
            case "g":
                return (c(d(a.substr(1)), 11, 15, 21));
            case "f":
                return (c(a.substr(1), 14, 17, 24));
            case "e":
                return (c(a.substr(1), 4, 7, 22));
            case "d":
                return (d(b(a.substr(1))));
            case "c":
                return (b(d(a.substr(1))));
            case "b":
                return (d(a.substr(1)));
            case "a":
                return b(a.substr(1));
                break
        }
    }
    return a
}
