exports.action = function(data , callback , user , app){

	//gambizinha

	var intValues = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9 , '-'];
	var chars = data.numero.split("");
	var isInt = true;
	for(var j in chars){
		
		if(!(chars[j] in intValues)){
			
			isInt = false;
			
		}
		
	}

	//gambizinha ends

	if(isInt){
		var tel = data;
		var query = "SELECT t.* FROM telefones t WHERE REPLACE(t.numero , '-' , '')='"+data.numero+"' AND t.ddd="+data.ddd;
		app.connection.query(query , function(err , telefones){

			
			if(!err){

				if(telefones.length > 0){

					tel = telefones[0];
					var query = "SELECT c.* FROM clientes c WHERE c.id IN(SELECT fk_clientes FROM clientes_tem_telefones h INNER JOIN telefones t ON h.fk_telefones=t.id WHERE REPLACE(t.numero , '-' , '')='"+data.numero+"' AND t.ddd="+data.ddd+")";
		
					app.connection.query(query , function(err , data){
						
						if(!err){
						
							if(data.length > 0){
								
								var clientes = "0";
								
								for(var i in data){
									
									clientes+=" ,"+data[i].id
									
								}
								
								var query = "SELECT e.* , b.nome AS bairro FROM enderecos e INNER JOIN bairros b ON e.fk_bairros=b.id WHERE e.id IN(SELECT h.fk_enderecos FROM clientes_tem_enderecos h INNER JOIN clientes c ON h.fk_clientes=c.id WHERE c.id IN("+clientes+"))";
								
								app.connection.query(query , function(err , enderecos){
									
									if(!err){
										
										if(enderecos.length > 0){
											
											callback({clientes : data , telefone : tel , enderecos : enderecos } );
											
										}else{
											
											callback({clientes : data , telefone : tel , enderecos : false } );
											
										}
										
									} else {
										
										callback({clientes : data , telefone : tel , enderecos : false } );							
									}
									
									
								});		
								
							} else {
								
								callback({ response : false , telefone : tel });
								
							}
								
						} else {
						
							callback({ response : false , telefone : tel });
						
						}
						
					});

				} else {

					callback({ response : false , telefone : { ddd : tel.ddd , numero : tel.numero } });

				}

			} else {
			
				callback({ response : false , telefone : { ddd : tel.ddd , numero : tel.numero } });
			
			}

		});
	} else {

		var query = "SELECT c.* , t.ddd , t.numero FROM clientes c INNER JOIN clientes_tem_telefones h ON h.fk_clientes=c.id INNER JOIN telefones t ON h.fk_telefones=t.id WHERE c.nome LIKE '%"+data.numero+"%' LIMIT 5";
		app.connection.query(query , function(err , data){

			if(!err){

				if(data.length > 0){

					callback({response : true , string : true , data : data});

				} else {

					//string eh se ele pesquisou por um numero ou por uma string
					callback({response : false , string : true})

				}

			} else {

				console.log(err.message);
				console.log(query);

			}

		})
	}
	
};