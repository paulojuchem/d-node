exports.action = function(pedidoId , callback , user , app){
	
	var query = "SELECT p.id , p.status , p.pago , p.obs , p.fk_clientes , p.fk_telefones, p.fk_enderecos , IF(p.id IN(SELECT y.fk_pedidos FROM backup_pedidos_retornos y WHERE y.fk_pedidos="+pedidoId+"), true , false )AS returns, f1.nome AS funcionario , f.nome AS entregador , CONCAT(DATE_FORMAT(p.ts_registro , '%d/%m/%Y') , ', ' , TIME_FORMAT(p.ts_registro , '%H:%i')) AS ts_registro , IF(p.ts_to_delivery > 0 , CONCAT(DATE_FORMAT(p.ts_to_delivery , '%d/%m/%Y') , ', ' , TIME_FORMAT(p.ts_to_delivery , '%H:%i')) , null ) AS ts_to_delivery ,IF(p.ts_delivery > 0 , CONCAT(DATE_FORMAT(p.ts_delivery , '%d/%m/%Y') , ', ' , TIME_FORMAT(p.ts_delivery , '%H:%i')) , null ) AS ts_delivery FROM pedidos p LEFT JOIN entregadores e ON p.fk_entregadores=e.id LEFT JOIN funcionarios f ON e.fk_funcionarios=f.id LEFT JOIN funcionarios f1 ON p.fk_funcionarios=f1.id INNER JOIN clientes cl ON p.fk_clientes=cl.id LEFT JOIN enderecos end ON p.fk_enderecos=end.id WHERE p.id="+pedidoId;

	app.connection.query(query , function(err , data){

		if(!err){

			if(data.length > 0){

				query = "SELECT CONCAT(DATE_FORMAT(p.ts_registro , '%d/%m/%Y') , ', ' , TIME_FORMAT(p.ts_registro , '%H:%i')) AS ts_registro , f.nome AS entregador FROM backup_pedidos_retornos p INNER JOIN entregadores e  ON p.fk_entregadores=e.id INNER JOIN funcionarios f ON e.fk_funcionarios=f.id WHERE p.fk_pedidos="+pedidoId;
				
				app.connection.query(query , function(err , r){

					if(!err){

						if(data.length > 0){

							data[0].retornos = r;

						} else {

							console.log('no data found "getOrderReturns"');

						}

					} else {

						console.log(err.message);

					}

					query = "SELECT * FROM clientes WHERE id="+data[0].fk_clientes;
					app.connection.query(query , function(err , c){

						if(!err){

							data[0].cliente = c[0];

						} else {

							console.log(err.message);

						}

						query= "SELECT * FROM telefones WHERE id="+data[0].fk_telefones;
						app.connection.query(query , function(err , t){

							if(!err){

								data[0].telefone=t[0];

							} else {

								console.log(err.message)

							}

							query = "SELECT e.* , b.nome AS bairro FROM enderecos e INNER JOIN bairros b ON e.fk_bairros=b.id WHERE e.id="+data[0].fk_enderecos
							app.connection.query(query , function(err , e){

								if(!err){

									data[0].endereco=e[0];

								} else {

									console.log(err.message);

								}

								callback(data[0]);

							});

						});

					});

				});

			} else {

				//TODO : handle this on client side, but this event pobably wont happen anyways
				callback(false);

			}

		} else {

			console.log(err.message);

		}

	});

};