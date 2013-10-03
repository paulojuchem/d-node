exports.action = function(pedidoId , callback , user , app){

	var query = "SELECT h.* , p.nome FROM pedidos_tem_produtos h INNER JOIN produtos p ON h.fk_produtos=p.id WHERE h.fk_pedidos="+pedidoId;
	app.connection.query(query , function(err , produtos){

		if(!err){

			var send = function(){

				callback(produtos);

			}

			if(produtos.length > 0){
				
				var counter = produtos.length;

				for(var i in produtos){

					produtos[i].complementos = new Array();

					(function(ref){
						query = "SELECT h.* , c.descricao , c.id FROM backup_ped_t_prod_cat_t_comp h INNER JOIN complementos c ON h.fk_complementos=c.id WHERE h.fk_pedidos_tem_produtos="+produtos[i].id;
						app.connection.query(query , function(err , data){

							if(!err){

								produtos[ref].complementos = data;
								counter--;

								if(counter==0){

									send();

								}

							} else {

								console.log(err.message)

							}
							
						});
					})(i)
					
				}
				
			} else {

				callback(false);

			}

		} else {

			console.log(err.message);

		}

	});

};	