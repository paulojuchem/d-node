exports.action = function(status , callback , user , app){

	var query = "SELECT * FROM caixas WHERE fk_funcionarios_encerramento IS NULL LIMIT 1";
	//abrir caixa
	app.connection.query(query,function(err , caixa)
	{

		if(!err)
		{

			if(caixa.length > 0)
			{

				console.log('existe outro caixa aberto');

			}
			else
			{

				query = "INSERT INTO caixas(fk_funcionarios) VALUES("+user.id+")";
				app.connection.query(query , function(err , caixa)
				{

					if(!err)
					{

						app.updateCaixa(callback);

					}
					else
					{

						console.log(err.message)

					}

				});

			}
			
		}
		else
		{

			console.log(err.message)

		}

	})

};