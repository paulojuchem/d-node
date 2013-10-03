var req 		= require('http');
var http 		= require('http').createServer();
var crypto 		= require('crypto');
var sockjs 		= require('sockjs').createServer();
var mysql 		= require('mysql');
var email   	= require("emailjs");
var config 		= require("./config");
var users 		= new Array();
var counter 	= 0;
var actions 	= new Array();
var helpers 	= {};
var app 		= null;

Models = {};

actions.caixa_abrir 				= require("./Actions/caixa_abrir").action;
actions.caixa_fechar 				= require("./Actions/caixa_fechar").action;
actions.getCaixaStatus 				= require("./Actions/getCaixaStatus").action;
actions.login 						= require("./Actions/login").action;
actions.getCaixaDetails 			= require("./Actions/getCaixaDetails").action;
actions.getOrderProducts			= require("./Actions/getOrderProducts").action;
actions.getPedidoInfo				= require("./Actions/getPedidoInfo").action;
actions.newBairro					= require("./Actions/newBairro").action;
actions.getCaixaInfo				= require("./Actions/getCaixaInfo").action;
actions.getFormaPgto				= require("./Actions/getFormaPgto").action;
actions.entregarPedido				= require("./Actions/entregarPedido").action;
actions.search						= require("./Actions/search").action;
actions.getPedidos					= require("./Actions/getPedidos").action;
actions.novoPedido					= require("./Actions/novoPedido").action;
actions.cancelar_pedido				= require("./Actions/cancelar_pedido").action;
actions.getProduto					= require("./Actions/getProduto").action;
actions.getDefaultProducts			= require("./Actions/getDefaultProducts").action;
actions.getBairros					= require("./Actions/getBairros").action;
actions.checkUserData				= require("./Actions/checkUserData").action;
actions.getComplemento				= require("./Actions/getComplemento").action;
actions.entregas_getPedidoInfo		= require("./Actions/entregas_getPedidoInfo").action;
actions.entregas_getOrderProducts	= require("./Actions/entregas_getOrderProducts").action;
actions.entregas_getEntregadorInfo  = require("./Actions/entregas_getEntregadorInfo").action;
actions.entregas_cancelar		 	= require("./Actions/entregas_cancelar").action;
actions.entregas_encaminhar		 	= require("./Actions/entregas_encaminhar").action;
actions.entregas_finalizar		 	= require("./Actions/entregas_finalizar").action;

helpers.on = function(evento , callback){

	actions[evento](callback);

}

sockjs.on('connection', function(conn) {

	var ref = counter;
	counter++;
	users[ref] = {connection : conn , group : "handle this" };

	//autentica o usuario
	require('crypto').randomBytes(48, function(ex, buf) {

  		var token 			= buf.toString('hex');
  		users[ref].token 	= token;
  		users[ref].ref 		= ref;
  		conn.write(JSON.stringify({action : "auth" , response : true ,  data : { ref : ref , token : token }}));

	});

    conn.on('data', function(data) {

    	data = JSON.parse(data);

    	if(users[data.ref]!=undefined)
    	{

    		if(users[data.ref].token==data.token)
    		{

    			//autenticado
    			if(actions[data.action])
		    	{

		    		//r = data; j = broadcast; k = action default current_action;
			        actions[data.action](data.data , function(r , k , j){

			        	if(j===true)
			        	{

			        		var response = {action : k ? k : data.action , response : true ,  data : r};
			        		//TODO : dont broadcast to the broadcaster , or add a option to not do so
			        		for(var i in users)
			        		{

			        			if(users[i] && users[i].token != data.token)
			        			{
			        				
			        				//broadcast only for other users, not to yourself
			        				users[i].connection.write(JSON.stringify(response));
			        			
			        			}

			        		}

			        	}
			        	else
			        	{
			        		
			        		var response = {action : k ? k : data.action , response : true , data : r};
				        	conn.write(JSON.stringify(response));

			        	}

			        } , users[data.ref] , app );

			    }
			    else
			    {

			    	//invalid action
			    	conn.write(JSON.stringify({action : data.action , response : false , error : "Ação desconhecida" , data : false}));
			    	console.log("Action not found on server => "+data.action);

			    }

    		}
    		else
    		{

    			//invalid token
    			console.log('Invalid token =>'+data.token);
    			conn.write(JSON.stringify({action : data.action , response : false , error : "Invalid token" , data : false}));

    		}

    	}
    	else
    	{

    		console.log('Invalid ref => '+data.ref);
    		//ref not found
    		conn.write(JSON.stringify({action : data.action , response : false , error : "Invalid ref" , data : false}));

    	}

    });
    
    conn.on('close', function() {

    	users[ref] = null;

    });

});

sockjs.installHandlers(http, {prefix:'/sockjs'});

Application = function(){

	var self = this;
	
	this.connection = mysql.createClient(config.db);
	
	this.connection.query('USE dtalia');

	this.mail 		= email.server.connect(config.mail);

	this.caixa 		= null;

	this.users 		= users;

	this.config 	= config;

	this.req 		= req;

	this.md5encode = function(value){

		if(value && value.length > 0)
		{

			return crypto.createHash('md5').update(value).digest('hex');

		}
		else
		{

			return null;

		}

	}

	this.sendMail = function(pedido){

		var mensagem = "<html>Atencao : Nao responda a este email. Esta caixa postal não é monitorada.<br />";
		mensagem+="Olá "+pedido.cliente+"<br /><br />";
		mensagem+="Voce podera acompanhar o processo de entrega pelo link abaixo: <br />";
		mensagem+="===============================================================<br />";
		mensagem+="<a href='services.pizzariadtalia.com?ref="+pedido.id+"'>clique aqui</a><br />";
		mensagem+="===============================================================<br />";
		mensagem+="Agradecemos a preferência!</html>";

		var mailConfig = {

			text : mensagem,
			from : "noreply@pizzariadtalia.com",
			to 	: pedido.email , 
			subject : "o seu pedido esta sendo processado",
			attachment: 
			   [
			        {data: mensagem, alternative:true}
			   ]

		};

		app.mail.send(mailConfig,function(err , message){

			if(!err){

				//TODO:

			} else {

				//TODO: Handle this!
				console.log(err);

			}

		});

	}

	

	//selecionar db a cada meia hora para tentar evitar perda de conexao
	setInterval(function(){ self.connection.query("USE dtalia") , function(){ return false; }; } , 360000);

	this.updateCaixa = function(cb){

		var query = "SELECT c.* , CONCAT(DATE_FORMAT(c.ts_abertura , '%d/%m/%Y') , ', ' , TIME_FORMAT(c.ts_abertura , '%H:%i')) AS abertura , CONCAT(DATE_FORMAT(c.ts_encerramento , '%d/%m/%Y') , ', ' , TIME_FORMAT(c.ts_encerramento , '%H:%i')) AS encerramento , IF(c.ts_encerramento=0 , true , false) AS status , f.nome AS funcionario FROM caixas c INNER JOIN funcionarios f ON c.fk_funcionarios=f.id ORDER BY ID DESC LIMIT 1";

		this.connection.query(query , function(err , data){

			if(!err){

				self.caixa = data[0];
				
				if(cb)
				{
					
					cb(data[0] , 'updateCaixa');//to myself
					cb(data[0] , 'updateCaixa' , true);//broadcast

				}

			} else {

				console.log(err.message);

			}

		});

	}

	this.updateCaixa();

	
	
}

app = new Application();

/*actions['re-print'] = function(pedidoId){

	try{

		req.get({host : '192.168.254.215' , path : '/index1.php?pid='+pedidoId+"&re=1"}, function(response){

			var str = '';

			response.on('data', function (chunk) {
				str += chunk;

			});

			response.on('end', function () {

				//console.log(str);

			});

		}).on('error' , function(e){

			console.log(e);

		})

	} catch (e){

		console.log(e);

	}

};
*/
http.listen(8000);
