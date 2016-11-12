var express = require('express');
var bodyParser= require('body-parser')
var caHelper = require('./controleAcademicoHelper');
var app = express();
app.use(bodyParser.urlencoded({extended: true}))


app.post('/login', function(req, res){
    if(req.body && req.body.login && req.body.password){
        caHelper.login(req.body.login, req.body.password, function (result) {
            res.json(result.userInfo);
        });
    }else{
        var response = {
            statusCode: 401,
            error: "login or password missing."
        }
        res.json(response);
    }

});

app.get('/disciplinas', function(req, res){
    caHelper.getDisciplinas(function (responseHtml) {
        res.send(responseHtml);
    });
});

app.get('/disciplina', function(req, res){
    console.log(req.params);
    caHelper.getInfoDisciplina('Controlador?command=AlunoTurmaNotas&codigo=1304013&turma=01&periodo=2016.2', function (responseHtml) {
        res.send(responseHtml);
    });
});

app.listen('8081');
console.log('Magic happens on port 8081');
exports = module.exports = app;