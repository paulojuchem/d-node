exports.action = function(bairro , callback, user , callback){

	var query = "INSERT INTO bairros(nome , fk_cidades) VALUES ('"+bairro+"', 1)";
	app.connection.query(query , function(err , data){

		if(!err){

			callback({ bairro : {id : data.insertId , nome : bairro} , select : true});
			callback({bairro : {id : data.insertId , nome : bairro} } , false , true);

		} else {

			console.log(err.message);

		}

	});

};