exports.action = function(name, callback , user , app){
	var intValues = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
	
	var chars = name.split("");
	var isInt = true;
	for(var j in chars){
		
		if(!(chars[j] in intValues)){
			
			isInt = false;
			
		}
		
	}
	
	//var query 	= "SELECT p.id , IF((SELECT h.fk_produtos FROM categorias_tem_complementos h WHERE h.fk_categorias=c.id) IS NOT NULL , true , false) AS complementos , CONCAT(IF(c.label IS NULL , '' , CONCAT(c.label,' ')), p.nome) AS nome , p.valor , p.fk_categorias , c.nome AS categoria FROM produtos p INNER JOIN categorias c ON p.fk_categorias=c.id WHERE true";
	var query = "SELECT p.id , IF(c.id IN (SELECT h.fk_categorias FROM categorias_tem_complementos h WHERE h.fk_categorias=c.id) , true , false) AS complementos , CONCAT(IF(c.label IS NULL , '' , CONCAT(c.label,' ')), p.nome) AS nome , p.valor , p.fk_categorias , c.nome AS categoria FROM produtos p INNER JOIN categorias c ON p.fk_categorias=c.id WHERE true";
	if(isInt){
		

		query+=" AND p.id="+name;
		
	} else{
	
		name = name.split(' ');
	
		var like 	= "";
	
		for(var i in name){
			
			query 	+=" AND CONCAT(p.nome , c.nome) LIKE '%"+name[i]+"%'"
			
		}
	
	}
	
	query += " LIMIT 5";
	
	
	app.connection.query(query , function(err , produtos){
		
		if(!err){
			
			if(produtos.length > 0){
				
				callback(produtos);
				
			} else {
				
				callback(false);
				
			}
			
		} else {
			
			console.log(err.message);
			callback(false);
			
		}
		
	});
	
};