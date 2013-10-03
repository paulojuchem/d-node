exports.action = function(pedidoId , callback, user, app){

	var query = "UPDATE pedidos SET status=0 , fk_entregadores = NULL WHERE id="+pedidoId;
	app.connection.query(query , function(err , data){

		//TODO : handle exceptions;
		callback({ status : 0 , pedido : pedidoId} , 'updatePedido' , true);//broadcast
		callback({ status : 0 , pedido : pedidoId} , 'updatePedido');//to myself
		callback(pedidoId);

	});

};