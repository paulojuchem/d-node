exports.action = function(caixa , callback , user , app){

	var query = "SELECT * FROM caixas WHERE fk_funcionarios_encerramento IS NULL LIMIT 1";
	//abrir caixa
	app.connection.query(query,function(err , caixa)
	{

		if(!err)
		{

			if(caixa.length > 0)
			{

				query = "UPDATE caixas SET ts_encerramento=CURRENT_TIMESTAMP , fk_funcionarios_encerramento="+user.id+" WHERE id="+app.caixa.id;
				app.connection.query(query , function(err , caixa)
				{

					if(!err)
					{

						app.updateCaixa(callback);

						/*req.get({host : '192.168.254.215' , path : '/relatorio.php?cId='+app.caixa.id}, function(response){

							var str = '';

							response.on('data', function (chunk) {
								str += chunk;

							});

							response.on('end', function () {

								//console.log(str);

							});

						}).on('error' , function(e){

							console.log(e);

						});
						*/

					}
					else
					{

						console.log(err.message)

					}

				});

			}
			else
			{

				console.log('caixa não pode ser fechado pois não esta aberto')

			}
			
		}
		else
		{

			console.log(err.message)

		}

	})

};