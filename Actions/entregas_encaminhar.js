exports.action = function(data , callback , user , app){

	var query = "UPDATE pedidos SET status=1 , fk_entregadores="+data.entregador+" WHERE id="+data.pedido;
	var pedidoId = data.pedido;
	app.connection.query(query , function(err , data){

		//TODO : handle exceptions;
		callback({status : 1 , pedido : pedidoId } , 'updatePedido' , true);//broadcast
		callback({status : 1 , pedido : pedidoId } , 'updatePedido');//to myself
		query = "SELECT p.id , CONCAT(DATE_FORMAT(p.ts_registro, '%d/%m/%Y') , ' às ' ,  TIME(p.ts_registro)) AS ts_registro , c.nome AS cliente FROM pedidos p INNER JOIN clientes c ON p.fk_clientes=c.id WHERE p.status = 1 AND p.id="+pedidoId;

		app.connection.query(query , function(err , data){

			if(!err)
			{

				if(data.length > 0)
				{

					callback(data[0]);

				}
				else
				{

					callback(false);

				}

			}
			else
			{

				callback(false);
				console.log(err.message);

			}

		})

	});

};