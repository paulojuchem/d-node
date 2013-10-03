exports.action = function(pedido , callback,user , app){

	if(app.caixa.status){

		var codigoPedido = null;

		var sendResponse = function(){

			//selecionando o pedido
			
			var query = "SELECT DATE_FORMAT(p.ts_registro, '%H:%i') AS ts_registro , p.id , p.fk_enderecos , p.status , t.ddd , c.nome AS cliente , c.email , t.numero FROM pedidos p INNER JOIN telefones t ON p.fk_telefones=t.id INNER JOIN clientes c ON p.fk_clientes=c.id WHERE p.id="+codigoPedido;
			app.connection.query(query , function(err , pedido){

				if(!err){

					if(pedido.length > 0){

						//enviando o pedido para todos os listeners
						callback(pedido[0]);
						callback(pedido[0] , false , true);//broadcast
						callback(false , 'novoPedido_accepted');

						//sending data to print server
						try{

							app.req.get({host : '192.168.254.215' , path : '/index1.php?pid='+pedido[0].id}, function(response){

								var str = '';

								response.on('data', function (chunk) {
									str += chunk;

								});

								response.on('end', function () {

									//console.log(str);

								});

							}).on('error' , function(e){

								console.log(e);

							})

						} catch (e){

							console.log(e);

						}
						
						if(pedido[0].email){

							//app.sendMail(pedido[0]);

						}
							

					} else {

						callback(false);

					}

				} else {

					console.log(err.message);
					callback(false);

				}

			});
			
		}

		var helper = pedido.orderProducts;

		var checkStatus = function(i , j){
			/*
				i = orderProduct,
				j = complemento
			*/

			if(j==undefined){

				helper[i].produto = true;

			} else {

				helper[i].complementos[j] = true;

			}

			var send = true;

			for(var i in helper){

				if(helper[i].complementos.length > 0){

					for(var j in helper[i].complementos){

						if(helper[i].complementos[j]!==true){

							send = false;

						}

					}

				} 

				if(helper[i].produto!==true){

					send = false;

				}

			}

			if(send){

				//console.log("pedido criado com sucesso");
				sendResponse();

			} 

		}

		var gravarComplementos = function(complemento , id , i , j , obs){

			/*backup_ped_t_prod_cat_t_comp
				fk_pedidos_tem_produtos	-- campo que armazenara o codigo do pedido em questao
				fk_complementos			-- campo que armazenara o/os complementos do produto
			*/
			//sera chamado se existirem complementos para o produto
			var query = "INSERT INTO backup_ped_t_prod_cat_t_comp(fk_pedidos_tem_produtos , fk_complementos"+(obs ? ", obs" : "")+") VALUES("+id+","+complemento+(obs ? ",'"+obs+"'" : "")+")";
			//console.log(query);
			app.connection.query(query , function(err , data){

				if(!err){

					//aqui eu chamo somente o callback da funcao que sera chamada no final
					helper[i].complementos[j] = true;
					checkStatus(i , j);

				} else {

					console.log(err.message);
				
				}

			});
		}

		var gravarProdutos = function(pedidoId){

			for(var i in pedido.orderProducts){
				(function(i){

					var query = "INSERT INTO pedidos_tem_produtos(quantidade , fk_produtos , fk_pedidos"+(pedido.orderProducts[i].obs!="" ? ", obs" : "")+") VALUES ("+pedido.orderProducts[i].quantidade+","+pedido.orderProducts[i].produto.codigo+","+pedidoId+(pedido.orderProducts[i].obs!="" ? ", '"+pedido.orderProducts[i].obs+"'" : "")+")";
					app.connection.query(query , function(err , data){

						if(!err){

							checkStatus(i);

							for(var j in pedido.orderProducts[i].complementos){

								//talvez isso aqui nunca ocorra, eh opcional
								gravarComplementos(pedido.orderProducts[i].complementos[j].codigo , data.insertId , i , j , pedido.orderProducts[i].complementos[j].obs);

							}
							

						} else {

							console.log(query);
							console.log(err.message);

						}

					});

				})(i)
				
			}

		}

		var gravarPedido = function(config){

			var query = "INSERT INTO pedidos(fk_clientes , fk_enderecos , fk_funcionarios , fk_telefones , pago , troco , fk_forma_pagamento "+(pedido.obs.length > 0 ? ", obs": "")+") VALUES ("+config.cliente.codigo+","+config.endereco.codigo+","+user.id+","+config.telefone.codigo+","+pedido.pgto+",'"+pedido.troco+"',"+pedido.formaPgto+(pedido.obs.length > 0 ? ",'"+pedido.obs+"'" : "")+")";

			app.connection.query(query , function(err , data){

				if(!err){

					codigoPedido = data.insertId;
					gravarProdutos(data.insertId);

				} else {

					console.log(err.message);
					console.log(query);
					socket.emit('novoPedido_answer' , false );

				}
				
			});

		}

		var grudarEndereco = function(config){

			if(pedido.endereco){
				if(config.endereco.status || config.cliente.status){

					var query = "INSERT INTO clientes_tem_enderecos(fk_enderecos , fk_clientes) VALUES ("+config.endereco.codigo+","+config.cliente.codigo+")";
					app.connection.query(query , function(err , data){

						if(!err){

							gravarPedido(config);

						} else {

							console.log(err.message);
							console.log(query);

						}

					})

				} else {

					gravarPedido(config);

				}
			} else {

				gravarPedido(config);

			}

		}

		var grudar = function(config){
			//gruda telefones e enderecos com os clientes
			if(config.telefone.status || config.cliente.status ){

				var query = "INSERT INTO clientes_tem_telefones(fk_clientes , fk_telefones) VALUES("+config.cliente.codigo+","+config.telefone.codigo+")";
				//console.log(query);
				app.connection.query(query , function(err , data){

					if(!err){

						grudarEndereco(config);

					} else {

						console.log(err.message);
						console.log(query);

					}

				});

			} else {

				grudarEndereco(config);

			}

		}

		var checkCliente = function(statusPhone , fk_telefones , statusAddress , fk_enderecos){
			if(pedido.cliente.codigo==null){

				var query = "INSERT INTO clientes(nome , cpf_cnpj , rg_ie , email) VALUES ('"+pedido.cliente.nome+"','"+pedido.cliente.cpf_cnpj+"','"+pedido.cliente.rg_ie+"','"+pedido.cliente.email+"')";
				app.connection.query(query , function(err , cliente){

					if(!err){

						grudar({telefone : {status : statusPhone , codigo : fk_telefones} , endereco : {status : statusAddress , codigo : fk_enderecos} , cliente : {status : true , codigo : cliente.insertId}});

					} else {

						console.log(err.message);
						console.log(query);

					}

				});

			} else {

				grudar({telefone : {status : statusPhone , codigo : fk_telefones} , endereco : {status : statusAddress , codigo : fk_enderecos} , cliente : {status : false , codigo : pedido.cliente.codigo}});

			}

		}

		var checkAddress = function(status , fk_telefones){
			
			if(pedido.endereco){
				if(pedido.endereco.codigo==null){

					var query = "INSERT INTO enderecos(logradouro , numero  , complemento , fk_bairros , obs) VALUES ('"+pedido.endereco.logradouro +"','"+pedido.endereco.numero+"','"+pedido.endereco.complemento+"','"+pedido.endereco.bairro+"','"+pedido.endereco.obs+"')";
					app.connection.query(query , function(err , endereco){

						if(!err){
							
							checkCliente(status , fk_telefones , true , endereco.insertId);
						
						} else {

							console.log(err.message);
							console.log(query);

						}

					});
					

				} else {

					checkCliente(status , fk_telefones , false , pedido.endereco.codigo);

				}
			} else {

				checkCliente(status , fk_telefones , false , null);

			}

		}
		
		var checkPhone = function(){
			if(pedido.telefone.codigo==null){

				var query = "INSERT INTO telefones(ddd , numero) VALUES ("+pedido.telefone.ddd+","+pedido.telefone.numero+")";
				app.connection.query(query , function(err , telefone){

					if(!err){

						checkAddress(true , telefone.insertId);

					} else {

						console.log(err.message);
						console.log(query);

					}

				});
				
			} else {

				checkAddress(false , pedido.telefone.codigo)

			}

		}

		checkPhone();
		
	} else {

		callback( false );

	}

};