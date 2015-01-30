var path = require('path'),
    vow = require('vow'),
    vowFs = require('vow-fs');

module.exports = {
    load: load,
    add: add
};

var FILENAME = path.resolve(__dirname, './db.txt');

function add (string) {
    if (!string || !string.length) {
        return vow.reject();
    }

    string = string.split('\n').join('\t') + '\n';

    return vowFs.append(FILENAME, new Buffer(string));
}

function load () {
    return vowFs.read(FILENAME).then(function (content) {
        return content.toString().replace(/\n+$/, '').split('\n').reverse();
    });
}