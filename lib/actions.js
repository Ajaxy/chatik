var _ = require('lodash'),
    path = require('path'),
    vow = require('vow'),
    vowFs = require('vow-fs'),
    multiparty = require('multiparty'),
    store = require('./store');

module.exports = setupActions;

var uploadsPath = path.resolve('./public/uploads') + '/';

function setupActions (app) {
    app.get('/', function (req, res) {
        return store.load()
            .then(function (strings) {
                res.render('index', { content: prepare(strings, 'http://' + req.get('host')) });
            }).timeout(5000).fail(function (err) {
                console.error(err);
                res.send(500);
            });
    });

    app.post('/post', function (req, res) {
        if (req.method == 'POST') {
            var user = req.host.split('.')[0],
                form = new multiparty.Form(),
                saveTextPromise = vow.resolve(),
                saveFilePromise = vow.resolve();

            form.parse(req, function(err, fields, files) {
                if (err) {
                    console.error(err);
                    res.send(500);
                    return;
                }

                if (fields.text && fields.text.length && fields.text[0].length) {
                    saveTextPromise = store.add('@' + user + ': ' + fields.text[0]);
                }

                if (files.file && files.file.length) {
                    var file = files.file[0];

                    if (file.size > 0) {
                        var filename = file.originalFilename.replace(/[\s\\\/]/g, '_');

                        saveFilePromise = vowFs.exists(uploadsPath + filename)
                            .then(function (exists) {
                                if (exists) {
                                    filename = path.basename(filename, path.extname(filename)) +
                                        '-' + Date.now() + path.extname(filename);
                                }

                                return vowFs.copy(file.path, uploadsPath + filename);
                            }).then(function () {
                                return store.add('@' + user + ': file#' + filename);
                            });
                    }

                    saveFilePromise.then(function () {
                        vowFs.remove(file.path);
                    });
                }

                vow.all([saveTextPromise, saveFilePromise]).then(function () {
                    res.redirect('/');
                }).fail(function (err) {
                    console.error(err);
                    res.send(500);
                });
            });
        }
    });
}

function prepare (strings, baseUrl) {
    strings = _.map(strings, function (string) {
        string = _.escape(string);
        string = string.replace(/(https?\:\/\/[^\s]+)/gi, '<a href="$1" target="_blank">$1</a>');
        string = string.replace(/file#([^\s]+)/gi, '<b>[файл]</b> <a href="' + baseUrl + '/uploads/$1" target="_blank">$1</a>');
        string = string.replace(/^@([a-z])([a-z]+:)/gi, '<span class="login"><span class="first-letter">$1</span>$2</span>');

        return string;
    });

    return strings;
}