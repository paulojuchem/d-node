exports.action = function(pedidoId , callback , user , app){

	var query = "UPDATE pedidos SET status=2 WHERE id="+pedidoId;
	app.connection.query(query , function(err , data){

		if(!err)
		{

			callback({status : 2 , pedido : pedidoId }, 'updatePedido' , true);
			callback({status : 2 , pedido : pedidoId }, 'updatePedido');
			callback(pedidoId);

		}
		else
		{

			callback(false);
			console.log(err.message);

		}

	});

};