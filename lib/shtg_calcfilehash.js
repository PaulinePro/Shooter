module.exports = function(a) {
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
};
