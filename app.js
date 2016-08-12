var express = require('express');
var caHelper = require('./controleAcademicoHelper');

var app = express();

app.get('/login', function(req, res){
    caHelper.login('115110107','', function (result) {
      res.json(result.userInfo);
    });
})

app.listen('8081')
console.log('Magic happens on port 8081');
exports = module.exports = app;