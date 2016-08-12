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
                        result.userInfo.curso = data.next().html();
                    }

                    if( data.children().text() === 'Campus:'){
                        result.userInfo.campus = data.next().html();
                    }

                    if( data.children().text() === 'Usuário:'){
                        result.userInfo.usuario = data.next().html();
                    }

                });
            }
            callbackFunc(result);
        })
    }

    // more functionality soon


    // sorry the bad english, i'm working on it.

}
