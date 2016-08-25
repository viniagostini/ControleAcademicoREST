var express = require('express');
var caHelper = require('./controleAcademicoHelper');

var app = express();

app.get('/login', function(req, res){
    caHelper.login('','', function (result) {
        res.json(result.userInfo);
    });
})

app.get('/disciplinas', function(req, res){
    caHelper.getDisciplinas(function (responseHtml) {
        res.send(responseHtml);
    });
})

app.listen('8081');
console.log('Magic happens on port 8081');
exports = module.exports = app;