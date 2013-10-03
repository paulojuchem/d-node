exports.action = function(data , callback , user , app){

	var intValues = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
	
	var chars = data.complemento.split("");
	var isInt = true;
	for(var j in chars){
		
		if(!(chars[j] in intValues)){
			
			isInt = false;
			
		}
		
	}

	var query = "SELECT c.* FROM complementos c WHERE c.id IN(SELECT fk_complementos FROM categorias_tem_complementos h WHERE h.fk_categorias="+data.categoria+")"
	
	if(isInt){

		query+=" AND c.id="+data.complemento;

	} else {

		query+=" AND c.descricao LIKE '%"+data.complemento+"%' LIMIT 5";

	}
	
	app.connection.query(query , function(err , complementos){
		
		if(!err){
			
			if(complementos.length > 0){
				
				callback(complementos );
				
			} else {
				
				callback(false );
				
			}
			
		} else{
			
			callback(false );
			
		}
		
	});
	
};