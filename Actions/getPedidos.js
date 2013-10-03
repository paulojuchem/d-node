exports.action = function(search , callback , user , app){

	var query = "SELECT DATE_FORMAT(p.ts_registro, '%H:%i') AS ts_registro , p.fk_enderecos , p.id , p.status , t.ddd , t.numero , c.nome AS cliente FROM pedidos p INNER JOIN clientes c ON p.fk_clientes=c.id INNER JOIN telefones t ON p.fk_telefones=t.id WHERE"

	var type = true;

	if(search!=undefined && search.length > 0){
			
		var intValues = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
	
		var chars = search.split("");
		var isInt = true;
		for(var j in chars){
			
			if(!(chars[j] in intValues)){
				
				isInt = false;
				
			}
			
		}

		if(isInt){

			query += " p.id="+search+" OR CONCAT(t.ddd , t.numero) LIKE '%"+search+"%'";

		} else {

			query += " c.nome LIKE '%"+search+"%'";

		}
		
		query += " ORDER BY p.id DESC";

	} else {

		query += " p.status < 2 ORDER BY p.id ASC";
		type = false;
	
	}
		
	app.connection.query(query , function(err , pedidos){

		if(!err){

			if(pedidos.length > 0){

				callback({pedidos : pedidos , type : type , search : search});

			} else {

				callback({response : false});

			}

		} else {

			console.log(err.message);
			console.log(query);
			callback({response : false});

		}

	});

};