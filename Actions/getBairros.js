exports.action = function(data , callback , user , app){

	var query = "SELECT * FROM bairros WHERE fk_cidades = 1 ORDER BY nome";

	app.connection.query(query , function(err , bairros){

		if(!err){

			if(bairros.length > 0){

				callback(bairros);

			}

		} else {

			console.log(err.message);

		}

	});

};