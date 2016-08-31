var request = require('request');
var cheerio = require('cheerio');
var iconv = require('iconv-lite');
module.exports = {

    /**
     *  Used to log in in the Controle Academico UFCG
     *
     * @param login {string} user's number of registration
     * @param password {string} user's password
     * @param callbackFunc {function} A callback function that is called when the function completes. It should have the signature `function (result)`.
     */
    login : function(login, password, callbackFunc){

        // the login URL of Controle Academico UFCG
        var url = 'https://pre.ufcg.edu.br:8443/ControleAcademicoOnline/Controlador';

        // Params to be passed in the request
        var params = {
            method: 'POST',
            encoding: null,
            url: url,
            form: {
                login: login,
                senha: password,
                command: 'AlunoLogin'
            },
            //remember cookies for future use
            jar: true
        };

        // model of the resultant JSON
        var result = {
            response : undefined,
            error : undefined,
            userInfo : {
                usuario: '',
                curso: '',
                campus: ''
            }
        };

        // the request recive the params containing the info and a callback function
        request(params, function(error, response, html){

            // enconde the html that comes from the controle academico to the original format
            var encoding = 'iso-8859-1';
            var html = iconv.decode(html, encoding);

            // passing to the result model the response and error that comes from the request
            result.response = response;
            result.response.body = {};
            result.error = error;

            if(!error){

                // loading html into cheerio that give us jQuery functionality
                var $ = cheerio.load(html);

                // tracking the info that we are looking for
                // to do this, we are filtering the html by this three classes without spaces between them, that means that the jQuery ir looking for intersections of these classes
                $('.col-sm-3.col-xs-5.text-right').filter(function(){

                    // store the data filtered into a variable
                    var data = $(this);

                    // after analysing the DOM, the best way to find the info we need is using this strategy
                    if( data.children().text() === 'Curso:'){
                        result.userInfo.curso = data.next().text();
                    }

                    if( data.children().text() === 'Campus:'){
                        result.userInfo.campus = data.next().text();
                    }

                    if( data.children().text() === 'Usuário:'){
                        result.userInfo.usuario = data.next().text();
                    }

                });
            }
            callbackFunc(result);
        })
    },


    /**
     *  Used to get all the disciplines of the student.
     *  You need to run the login route first
     *
     * @param callbackFunc {function} A callback function that is called when the function completes. It should have the signature `function (result)`.
     */
    getDisciplinas : function(callbackFunc){

        // the disciplines URL of Controle Academico UFCG
        var url = 'https://pre.ufcg.edu.br:8443/ControleAcademicoOnline/Controlador?command=AlunoTurmasListar';

        // Params to be passed in the request
        var params = {
            method: 'GET',
            encoding: null,
            url: url,
            //remember cookies for future use
            jar: true
        };

        // the request recive the params containing the info and a callback function
        request(params, function(error, response, html){

            // enconde the html that comes from the controle academico to the original format
            var encoding = 'iso-8859-1';
            var html = iconv.decode(html, encoding);

            var arrayData = [];

            if(!error){

                function Disciplina( titulo, codigo, turma, horario, periodo ){
                    this.titulo = titulo;
                    this.codigo = codigo;
                    this.turma = turma;
                    this.horario = horario;
                    this.periodo = periodo;
                    this.urlNotas = urlNotas = 'Controlador?command=AlunoTurmaNotas&codigo='+ codigo +'&turma='+ turma +'&periodo=' + periodo;
                }

                // loading html into cheerio that give us jQuery functionality
                var $ = cheerio.load(html);

                $('.table-striped > tbody > tr').filter(function(){

                    var infoArray = [];

                    $(this).find('td').each (function() {
                        infoArray.push($(this).text());
                    });

                    var periodo = infoArray[0];
                    var codigo = infoArray[1];
                    var titulo = infoArray[2].replace(/(\r\n|\n|\r)/gm,"");
                    var turma = infoArray[3];
                    var horario = infoArray[4].replace(/(\r\n|\n|\r)/gm,"");

                    //var disciplina = disciplinaFactory(titulo, codigo, turma, horario, periodo);
                    var disciplina = new Disciplina(titulo, codigo, turma, horario, periodo);

                    arrayData.push(disciplina);

                });

                callbackFunc(arrayData);
            }else{
                console.log(error);
            }
        })
    },

    getInfoDisciplina : function(urlDisciplina, callbackFunc){

        var urlBase = 'https://pre.ufcg.edu.br:8443/ControleAcademicoOnline/' + urlDisciplina;

        // Params to be passed in the request
        var params = {
            method: 'GET',
            encoding: null,
            url: urlBase,
            //remember cookies for future use
            jar: true
        };

        // the request recive the params containing the info and a callback function
        request(params, function(error, response, html) {

            // enconde the html that comes from the controle academico to the original format
            var encoding = 'iso-8859-1';
            var html = iconv.decode(html, encoding);

            if (!error) {

                results = [];

                // loading html into cheerio that give us jQuery functionality
                var $ = cheerio.load(html);

                var info = {};

                var notas = [];
                $('.table-striped > tbody > tr').filter(function(){

                    $(this).find('.text-right').each (function() {
                        notas.push($(this).text());
                    });
                });

                var pesos = [];
                $('.table-striped > thead > tr').filter(function(){
                    $(this).find('.text-muted').each (function() {
                        pesos.push($(this).text());
                    });
                });

                info.notas = [];

                pesos.forEach(function (peso){
                    var nota = {
                        nota: notas.shift(),
                        peso: peso
                    };
                    info.notas.push(nota);
                });

                info.mediaParcial = notas.shift();
                info.exameFinal = notas.shift();
                info.mediaFinal = notas.shift();
                callbackFunc(info);
            }

        });

    }

    // more functionality soon


    // sorry the bad english, i'm working on it.

}
