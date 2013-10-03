exports.action = function(pedidoId , callback , user , app){

	//pegar id do caixa -- para pedidos entregues na recepção
	var query = "UPDATE pedidos SET status=1 , fk_entregadores="+app.config.caixaId+" WHERE id="+pedidoId;

	app.connection.query(query , function(err , data){

		if(!err){

			var query = "UPDATE pedidos SET status=2 WHERE id="+pedidoId;
			app.connection.query(query , function(err , data){

				if(!err){

					callback(pedidoId);
					callback({status : 2 , pedido : pedidoId} , 'updatePedido' , true);
					callback({status : 2 , pedido : pedidoId} , 'updatePedido');

				} else {

					console.log(query);
					console.log(err.message);
					callback(false);

				}

			});

		} else {

			console.log(query);
			console.log(err.message);
			callback(false);

		}

	})

};