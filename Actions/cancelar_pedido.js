exports.action = function(data , callback , user , app){

	var query = "UPDATE pedidos SET status=4 , cancelation_user="+user.id+(data.reason.length > 0 ? " , cancel_reason='"+data.reason+"'" : "")+" WHERE id="+data.pedidoId;
	app.connection.query(query , function(err , r){

		if(!err){

			callback({pedido : data.pedidoId , status : 4} , 'updatePedido' );
			callback({pedido : data.pedidoId , status : 4} , 'updatePedido' , true);

		} else {

			console.log(query);
			console.log(err.message);

		}

	})
	

};