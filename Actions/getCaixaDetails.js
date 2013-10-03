exports.action = function(caixaId , callback , user , app){
	
	var query = "SELECT CONCAT(DATE_FORMAT(c.ts_abertura , '%Y-%m-%d') , ' ' , TIME_FORMAT(c.ts_abertura , '%H:%i:%s')) AS ts_abertura , IF(c.ts_encerramento=0 , NOW() , CONCAT(DATE_FORMAT(c.ts_encerramento , '%Y-%m-%d') , ' ' , TIME_FORMAT(c.ts_encerramento , '%H:%i'))) AS ts_encerramento FROM caixas c WHERE c.id="+caixaId;
	app.connection.query(query , function(err , data){

		if(!err){

			if(data.length > 0){
				query = "(SELECT f.nome AS entregador , SUM(h.quantidade*h.valor) AS total  , COUNT(DISTINCT(p.id)) AS quantidade FROM pedidos p INNER JOIN entregadores e ON p.fk_entregadores=e.id INNER JOIN funcionarios f ON e.fk_funcionarios=f.id INNER JOIN pedidos_tem_produtos h ON h.fk_pedidos=p.id WHERE p.status!=4 AND p.ts_registro BETWEEN '"+data[0].ts_abertura+"' AND '"+data[0].ts_encerramento+"' GROUP BY p.fk_entregadores) UNION ALL (SELECT 'em aberto' ,  SUM(h.valor*h.quantidade) AS total  , COUNT(DISTINCT(p.id)) AS quantidade FROM pedidos p INNER JOIN pedidos_tem_produtos h ON h.fk_pedidos=p.id WHERE p.status=0 AND p.ts_registro BETWEEN '"+data[0].ts_abertura+"' AND '"+data[0].ts_encerramento+"' ) UNION ALL (SELECT 'cancelados' , SUM(h.valor*h.quantidade) AS total  , COUNT(DISTINCT(p.id)) AS quantidade FROM pedidos p INNER JOIN pedidos_tem_produtos h ON h.fk_pedidos=p.id WHERE p.status=4 AND p.ts_registro BETWEEN '"+data[0].ts_abertura+"' AND '"+data[0].ts_encerramento+"')";
				app.connection.query(query , function(err , data){

					if(!err){

						if(data.length > 0){

							callback(data);

						} else {

							callback(false)

						}


					} else {

						console.log(err.message);
						console.log(query);

					}

				});

			}

		} else {

			console.log(query);
			console.log(err.message);

		}

	})

};