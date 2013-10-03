exports.action = function(data , callback , user , app){

	var query = "SELECT * FROM forma_pagamento";
	app.connection.query(query , function(err , data){

		if(!err){

			callback(data);

		} else {

			console.log(err.message);
			console.log(query);

		}

	})

};