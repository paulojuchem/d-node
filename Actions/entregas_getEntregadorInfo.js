exports.action = function(data , callback , user , app)
{

	var query = "SELECT f.nome , e.id , e.fk_funcionarios FROM entregadores e INNER JOIN funcionarios f ON e.fk_funcionarios=f.id WHERE e.id="+data;
	
	app.connection.query(query , function(err , entregador){

		if(!err)
		{

			if(entregador.length > 0 )
			{
				
				//selecionando as entregas que o entregador ja possui
				var query = "SELECT p.id , CONCAT(DATE_FORMAT(p.ts_registro, '%d/%m/%Y') , ' às ' ,  TIME(p.ts_registro)) AS ts_registro , c.nome AS cliente FROM pedidos p INNER JOIN clientes c ON p.fk_clientes=c.id WHERE p.status = 1 AND p.fk_entregadores="+entregador[0].id;
				app.connection.query(query , function(err , pedidos)
				{

					if(!err)
					{

						if(pedidos.length > 0)
						{

							callback({entregador : entregador[0] , pedidos : pedidos});

						}
						else
						{

							callback({entregador : entregador[0] , pedidos : false});

						}
						

					}
					else
					{

						console.log(err.message);
						callback(false);

					}

				});
				

			} 
			else 
			{

				callback(false);

			}

		} 
		else 
		{
			
			console.log(err.message);	
			callback(false);

		}

	});
	
};