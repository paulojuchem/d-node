exports.action = function(data , callback , user , app){
	
	//TODO handle other products
	var query 	= "SELECT p.* , c.nome AS categoria FROM produtos p INNER JOIN categorias c ON p.fk_categorias=c.id WHERE p.id=17";
	app.connection.query(query , function(err, data){
		
		if(!err){
			
			if(data.length > 0){
				
				callback(data);
				
			}
			
		} else {

			console.log(err.message);

		}
		
	});
	
};