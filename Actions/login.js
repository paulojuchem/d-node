exports.action = function (data , callback , user , app) {

	var query = "SELECT * FROM funcionarios WHERE user_name='"+data.userName+"' AND password='"+app.md5encode(data.password)+"'";
	var pwd = data.password;

	app.connection.query(query , function(err , data)
	{

		if(!err)
		{
		
			if(data.length > 0)
			{

				var answer = {

					response 		: true ,
					time 			: new Date().getTime() ,
					id 				: new Buffer(data[0].id).toString('base64') ,
					nome 			: data[0].nome ,
					user_name 		: new Buffer(data[0].user_name).toString('base64') ,
					password		: new Buffer(pwd).toString('base64')

				}

				/*app.users[user.ref].id 		= data[0].id;
				app.users[user.ref].nome 	= data[0].nome;*/

				user.id 	= data[0].id;
				user.nome 	= data[0].nome;

				callback(answer);
				
			} 
			else 
			{
				
				callback({response : false } );
			
			}
		
		} else {
			
			console.log(err.message);
			console.log(query);
			callback({response : false});
		
		}
			
	});
}