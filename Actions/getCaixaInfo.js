exports.action = function(data, callback , user , app){

	var query;

	if(data.indexOf('/') > 0)
	{

		//tipo data
		data = data.split('/');
		query = "SELECT c.id , f.nome AS fk_funcionarios , CONCAT(DATE_FORMAT(c.ts_abertura , '%d/%m/%Y') , ', ' , TIME_FORMAT(c.ts_abertura , '%H:%i')) AS ts_abertura , CONCAT(DATE_FORMAT(c.ts_encerramento , '%d/%m/%Y') , ', ' , TIME_FORMAT(c.ts_encerramento , '%H:%i')) AS ts_encerramento FROM caixas c INNER JOIN funcionarios f ON c.fk_funcionarios=f.id WHERE DATE(c.ts_abertura)='"+data[2]+"-"+data[1]+"-"+data[0]+"'";

	} 
	else 
	{

		query = "SELECT * FROM caixas WHERE id="+data;

	}

	app.connection.query(query , function(err , data){

		if(!err){

			if(data.length > 0){

				var status;

				if(data.length > 1){

					status = true;

				} else {

					status = false;

				}

				callback({status : status , data : status ? data : data[0]});

			} else {

				callback(false);

			}

		} else {

			console.log(query);
			console.log(err.message);

		}

	})

};