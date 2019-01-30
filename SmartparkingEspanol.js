var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var o = require('odata');
var request = require('request');
var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'holymotion.notifications@gmail.com',
    pass: 'Welcome1.'
  }
});

app.use(bodyParser.json());

var port = process.env.PORT || '8080';
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true})); 

o().config({
  // format: 'json',
  username: 'i848070', 	// the basic auth username
  password: 'Welcome1.',
  isWithCredentials: true
});

app.get('/', function(req, res) {
	res.render('login');
});

app.get('/bienvenido', function(req, res) {
	res.render('bienvenido');
});

app.get('/ContactUs', function(req, res) {
	res.render('ContactUs');
});

app.get('/MyAccount', function(req, res) {
	res.render('MyAccount');
});

app.get('/OurTeam', function(req, res) {
	res.render('OurTeam');
});

app.get('/home', function(req,res){
	res.render('home');
});

app.listen(port, function(req,res){
   console.log("Servidor Corriendo en puerto: " + port); 
});

app.get('/Signin', function(req,res){
	res.render('signup')
});

app.get('/Recast', function(req,res){
	res.render('recast')
});



// INICIAN POSTS DE FUNCIONALIDAD -----------------------------

app.post('/consultarVehiculos',function(req,res){
	usuario = req.body.usuario;
	url = "https://xs01b14ae55f1.us1.hana.ondemand.com/HOLY_MOTION/usuarios.xsodata/vehiculos?$filter=ID_USUARIO eq " + usuario;
	o(url).get(function(data){
		if(typeof data.d.results[0] !== 'undefined'){
			console.log(data.d.results);
			respuesta = ({"vehiculos":data.d.results,"existe":true});
			res.send({"resultado": respuesta});
		} else {
			respuesta = ({"existe":false});
			res.send({"resultado": respuesta});
		};
	});
});

app.post('/consultarCoches', function(req,res){
	id_usuario = req.body.id_usuario;
	url = "https://xs01b14ae55f1.us1.hana.ondemand.com/HOLY_MOTION/usuarios.xsodata/vehiculos?$filter=ID_USUARIO eq " + id_usuario;
	o(url).get(function(data){
		vehiculos = data.d.results;
		console.log("El resultado de consultar vehiculos: " + vehiculos);
		res.send({"vehiculos":vehiculos});
	})
});

app.post('/EliminarObjeto', function(req, res){
	console.log(req.body);
	tabla = req.body.tabla
	console.log("El objeto a eliminar es: " + req.body.id_objeto);
	id_objeto = req.body.id_objeto;

	// opciones para configuración del DELETE
	var options = {
	    url: "https://xs01b14ae55f1.us1.hana.ondemand.com/HOLY_MOTION/usuarios.xsodata/"+ tabla +"(" + id_objeto +")",
	    method: 'DELETE',
	    auth: {
	    'user': 'i848070',
	    'pass': 'Welcome1.'
		}
	};

	console.log(options.url);

	request(options, function (error, response, body) {
	    if (!error && response.statusCode == 204) {
	        console.log("El status de respuesta de eliminar es:" + response.statusCode);
	        res.send({"resultado":"success"}); 
	    } else {
	    	console.log("El error de respuesta de eliminar es: " + error);
	    	res.send({"resultado":"fail"}); 
	    };
	});
});

app.post('/ConfirmarObjeto', function(req, res){
	tabla = req.body.tabla
	console.log("El objeto a confirmar es: " + req.body.id_objeto);
	id_objeto = req.body.id_objeto;

	url = "https://xs01b14ae55f1.us1.hana.ondemand.com/HOLY_MOTION/usuarios.xsodata/reservas?$filter=ID_RESERVA eq " + id_objeto
	o(url).get(function(data){
		reserva = data.d.results;
		// opciones para configuración del DELETE
		var options = {
		    url: "https://xs01b14ae55f1.us1.hana.ondemand.com/HOLY_MOTION/usuarios.xsodata/"+ tabla +"(" + id_objeto +")",
		    method: 'PUT',
		    auth: {
		    'user': 'i848070',
		    'pass': 'Welcome1.'
			},
			json: {
				ID_RESERVA: reserva[0].ID_RESERVA,
				ID_SPOT: reserva[0].ID_SPOT,
				ID_USUARIO_RESERVA: reserva[0].ID_USUARIO_RESERVA,
				FECHA_INICIO: reserva[0].FECHA_INICIO,
				FECHA_FIN: reserva[0].FECHA_FIN,
				HORA_INICIO: reserva[0].HORA_INICIO,
				HORA_FIN: reserva[0].HORA_FIN,
				ESTATUS: "Confirmed",
				PLACA: reserva[0].PLACA,
				FECHA_RENT_INICIO: reserva[0].FECHA_RENT_INICIO,
				FECHA_RENT_FIN: reserva[0].FECHA_RENT_FIN,
				UBICACION_DESC: reserva[0].UBICACION_DESC
			}
		};

		console.log(options.url);

		request(options, function (error, response, body) {
		    if (!error && response.statusCode == 204) {
		        console.log("El status de respuesta de confirmar es: " + response.statusCode);

				var mailOptions = {
				  from: 'holymotion.notifications@gmail.com',
				  to: 'fernando.sanchez@sap.com',
				  subject: 'Your reservation of the spot ' + reserva[0].UBICACION_DESC + ' in HolyMotion has been confirmed!',
				  html: '<h2> Access your account at http://holymotionjs.cfapps.eu10.hana.ondemand.com/MyAccount in order to review your spot status. </h2>'
				};

				transporter.sendMail(mailOptions, function(error, info){
				  if (error) {
				    console.log(error);
				  } else {
				    console.log('Email sent: ' + info.response);
				    res.send({"resultado":"success"});
				  }
				});

		    } else {
		    	console.log("El error de respuesta de confirmar es: " + error);
		    	res.send({"resultado":"fail"}); 
		    };
		});

	})
});

app.post('/ActualizarImagenes', function(req, res){
	imagenes = req.body.imagenes;
	id_usuario = req.body.id_usuario;
	console.log(imagenes);

	url = "https://xs01b14ae55f1.us1.hana.ondemand.com/HOLY_MOTION/usuarios.xsodata/usuarios?$filter=ID_USUARIO eq " + id_usuario
	o(url).get(function(data){
		usuario = data.d.results;
		// opciones para configuración del DELETE
		var options = {
		    url: "https://xs01b14ae55f1.us1.hana.ondemand.com/HOLY_MOTION/usuarios.xsodata/usuarios(" + id_usuario +")",
		    method: 'PUT',
		    auth: {
		    'user': 'i848070',
		    'pass': 'Welcome1.'
			},
			json: {
				ID_USUARIO: usuario[0].ID_USUARIO,
				NOMBRE: usuario[0].NOMBRE,
				APELLIDO: usuario[0].APELLIDO,
				ID_LUGAR: usuario[0].ID_LUGAR,
				DIRECCION: usuario[0].DIRECCION,
				EMAIL: usuario[0].EMAIL,
				TELEFONO: usuario[0].TELEFONO,
				PASSWORD: usuario[0].PASSWORD,
				IMAGE_CONTENT1: usuario[0].IMAGE_CONTENT1,
				IMAGE_CONTENT2: usuario[0].IMAGE_CONTENT2,
				IMAGEN_1: imagenes[0],
				IMAGEN_2: imagenes[1],
				IMAGEN_3: imagenes[2]
			}
		};

		console.log(options.url);

		request(options, function (error, response, body) {
		    if (!error && response.statusCode == 204) {
		       console.log("Imagenes y usuario actualizado");
		       res.send({"resultado":"success"});
		    } else {
		    	console.log("El error de respuesta de confirmar es: " + error);
		    	res.send({"resultado":"fail"}); 
		    };
		});

	})
});

app.post('/CrearSpot', function(req,res){
	// id de vehiculo, id de usuario, marca, anio, placa y el color
	url2 = "https://xs01b14ae55f1.us1.hana.ondemand.com/HOLY_MOTION/usuarios.xsodata/spots?$select=ID_SPOT&$orderby=ID_SPOT%20desc&$top=1"
	o(url2).get(function(data){
		console.log(data.d.results[0].ID_SPOT);
		numero_nuevo = Number(data.d.results[0].ID_SPOT) + 1;
		console.log(numero_nuevo);
		url = "https://xs01b14ae55f1.us1.hana.ondemand.com/HOLY_MOTION/usuarios.xsodata/spots";
			info = {
				"ID_SPOT": numero_nuevo,
				"ID_USUARIO": Number(req.body.ID_USUARIO),
				"DIRECCION": req.body.DIRECCION
			};
			console.log(info);
			o(url).post(info).save(function(data){
				console.log("Información agregada satisfactoriamente");
				res.send({"resultado":"success"});  
			}, function(status, error){
				console.error(status + " " + error);
				res.send({"resultado":"error"});  
			});
	});
});

app.post('/CrearCoche', function(req,res){
	url2 = "https://xs01b14ae55f1.us1.hana.ondemand.com/HOLY_MOTION/usuarios.xsodata/vehiculos?$select=ID_VEHICULO&$orderby=ID_VEHICULO%20desc&$top=1"
	o(url2).get(function(data){
		console.log(data.d.results[0].ID_VEHICULO);
		numero_nuevo = Number(data.d.results[0].ID_VEHICULO) + 1;
		console.log(numero_nuevo);
		url = "https://xs01b14ae55f1.us1.hana.ondemand.com/HOLY_MOTION/usuarios.xsodata/vehiculos";
			info = {
				"ID_VEHICULO": numero_nuevo,
				"ID_USUARIO": Number(req.body.info.ID_USUARIO),
				"MARCA": req.body.info.MARCA,
				"ANIO": req.body.info.ANIO,
				"PLACA": req.body.info.PLACA,
				"COLOR": req.body.info.COLOR_COCHE 
			};
			console.log(info);
			o(url).post(info).save(function(data){
				console.log("Información agregada satisfactoriamente");
				res.send({"resultado":"success"});  
			}, function(status, error){
				console.error(status + " " + error);
				res.send({"resultado":"error"});  
			});
	});
	// id de vehiculo, id de usuario, marca, anio, placa y el color
});

app.post('/consultarReservas',function(req,res){
id_usuario = req.body.id_usuario;
	url = "https://xs01b14ae55f1.us1.hana.ondemand.com/HOLY_MOTION/usuarios.xsodata/reservas?$filter=ID_USUARIO_RESERVA eq " + id_usuario
	o(url).get(function(data){
		reservas = data.d.results;
		console.log("El resultado de consultar reservas: " + reservas);
		res.send({"reservas":reservas});
	})
});

app.post('/consultarReservasPorSpot',function(req,res){
spot = req.body.spot_id;
console.log(spot);
	url = "https://xs01b14ae55f1.us1.hana.ondemand.com/HOLY_MOTION/usuarios.xsodata/reservas?$filter=ID_SPOT eq " + spot
	o(url).get(function(data){
		reservas = data.d.results;
		console.log("El resultado de reservas por spot " + reservas);
		res.send({"reservas":reservas});
	})
});

app.post('/consultarSpots',function(req,res){
	id_usuario = req.body.id_usuario;
	url = "https://xs01b14ae55f1.us1.hana.ondemand.com/HOLY_MOTION/usuarios.xsodata/spots?$filter=ID_USUARIO eq " + id_usuario
	o(url).get(function(data){
		spots = data.d.results;
		console.log(spots);
		res.send({"spots":spots});
	})
})

app.post('/consultarAlertas',function(req,res){
	id_spot = req.body.id_spot;
	url = "https://xs01b14ae55f1.us1.hana.ondemand.com/HOLY_MOTION/usuarios.xsodata/alertasspots?$filter=ID_SPOT eq " + id_spot;
	o(url).get(function(data){
		alertas = data.d.results;
		console.log(alertas);
		res.send({"alerts":alertas});
	})
});

app.post('/SignUp', function(req,res){
	array = req.body.signup_array;
	email = array[2];
	url_usuarios = "https://xs01b14ae55f1.us1.hana.ondemand.com/HOLY_MOTION/usuarios.xsodata/usuarios";
	url_busqueda = "https://xs01b14ae55f1.us1.hana.ondemand.com/HOLY_MOTION/usuarios.xsodata/usuarios?$filter=EMAIL eq '" + email + "'"
	console.log(array);
	var respuesta ="";
	console.log("Buscando usuario: " + email)
	o(url_busqueda).get(function(data) {
		if(typeof data.d.results[0] !== 'undefined'){
			var user = {
				NOMBRE: data.d.results[0].NOMBRE,
				APELLIDO: data.d.results[0].APELLIDO,
				ID_LUGAR: data.d.results[0].ID_LUGAR,
				DIRECCION: data.d.results[0].DIRECCION,
				EMAIL: data.d.results[0].EMAIL
			};
			respuesta = {"existe":true,user:user};
			console.log("usuario existe: " + respuesta.existe);
		} else {
			respuesta = ({"existe":false});
			console.log("usuario no existe: " + respuesta.existe);
		}

		existe = respuesta.existe;
		console.log("existe: " + existe);

		if (existe == false) {
			console.log("creando nuevo usuario");
			o(url_usuarios).get(function(data) {
				numero_nuevo = Number(data.d.results.length) + 1;
				info = {
					"ID_USUARIO": numero_nuevo, 
					"NOMBRE": array[0], 
					"APELLIDO":array[1],
					"DIRECCION":array[3], 
					"EMAIL":array[2], 
					"TELEFONO":array[4], 
					"PASSWORD":array[5]
				};
				console.log("numero nuevo: " + numero_nuevo);

				o(url_usuarios).post(info).save(function(data){
					console.log("Información agregada satisfactoriamente");
					res.send({"resultado":"nuevo"});  
				}, function(status, error){
					console.error(status + " " + error);
					res.send({"resultado":"error"});  
				});
				}, function(status) {
			console.error(status); // error with status
			});
			} else {
			console.log("enviando resultado existente")
			res.send({"resultado":"existente"});
		};
	}, function(status) {
		console.error(status); // error with status
		respuesta = ({"existe":"error"})
	});
});

app.post('/validarLogin', function(req,res){
	console.log("Imprimiendo información");
	email = req.body.email;
	pass = req.body.pass;
	console.log(email);
	console.log(pass);

	url = "https://xs01b14ae55f1.us1.hana.ondemand.com/HOLY_MOTION/usuarios.xsodata/usuarios?$filter=EMAIL eq '" + email + "'"
	o(url).get(function(data) {
		if(typeof data.d.results[0] !== 'undefined'){
			var user = {
				"ID_USUARIO": data.d.results[0].ID_USUARIO,
				"NOMBRE": data.d.results[0].NOMBRE,
				"APELLIDO": data.d.results[0].APELLIDO,
				"ID_LUGAR": data.d.results[0].ID_LUGAR,
				"DIRECCION": data.d.results[0].DIRECCION,
				"EMAIL": data.d.results[0].EMAIL
			}
			console.log(data.d.results[0]);
			if(pass == data.d.results[0].PASSWORD){
			console.log('Usuario autenticado satisfactoriamente: ' + email);
			res.json({"login":true,user:user});
			} else {
				console.log('Usuario no autenticado: ' + email);
				res.send({"login":false});
			}
		} else {
			console.log('Usuario no encontrado: ' + email);
			res.send({"login":false});
		}
	}, function(status) {
	console.error(status); // error with status
	});
});

app.post('/crearReserva',function(req,res){
	url2 = "https://xs01b14ae55f1.us1.hana.ondemand.com/HOLY_MOTION/usuarios.xsodata/reservas?$select=ID_RESERVA&$orderby=ID_RESERVA%20desc&$top=1"

	o(url2).get(function(data){
		if(typeof data.d.results[0] == 'undefined'){
			numero_nuevo = 1;
		} else {
			console.log(data.d.results[0].ID_RESERVA);
			numero_nuevo = Number(data.d.results[0].ID_RESERVA) + 1;
			console.log(numero_nuevo);
		};
		url = "https://xs01b14ae55f1.us1.hana.ondemand.com/HOLY_MOTION/usuarios.xsodata/reservas";

		fecha1 = new Date(req.body.FECHA_INICIO + " " + req.body.HORA_INICIO);
		fecha2 = new Date(req.body.FECHA_FIN+ " " + req.body.HORA_FIN);

		console.log(fecha1);
		console.log(fecha2);

			info = {
				ID_RESERVA: numero_nuevo,
				ID_SPOT: Number(req.body.ID_SPOT),
				ID_USUARIO_RESERVA: Number(req.body.ID_USUARIO_RESERVA),
				FECHA_INICIO: req.body.FECHA_INICIO,
				FECHA_FIN: req.body.FECHA_FIN,
				HORA_INICIO: req.body.HORA_INICIO,
				HORA_FIN: req.body.HORA_FIN,
				UBICACION_DESC: req.body.UBICACION_DESC,
				FECHA_RENT_INICIO: '/Date('+ (fecha1.getTime()) +')/',
				FECHA_RENT_FIN: '/Date('+ (fecha2.getTime())+')/',
				PLACA: req.body.PLACA,
				ESTATUS: "Pending"
			}
			console.log(info);
			o(url).post(info).save(function(data){

				// obtener bearer de blockchain

				var options = {
				method:'GET',
				url: 'https://i848070trial.authentication.us10.hana.ondemand.com/oauth/token?grant_type=client_credentials',
				// url: 'https://innovator.authentication.eu10.hana.ondemand.com/oauth/token?grant_type=client_credentials',
				  // url: 'https://i861443trial.authentication.eu10.hana.ondemand.com/oauth/token?grant_type=client_credentials',
				  headers: {
				    'Authorization': 'Basic c2ItZDIwNzlmYzItZjg0Ni00ZjhmLWE0N2MtZDBmYmU0YTM1YWI2IWIxNTg5fG5hLTNhMDFmMWUyLWJjMzMtNGUxMi04NmEyLWZmZmZhZWE3OTkxOCFiMzM6R3BxQ2NSYS9tQ25qS1dRTDdNY0w4U1VmRmdvPQ=='
				  }
				};

				request(options,function(error,response,body){
					console.log("TOKEN -----------------------------")
					cuerpo = JSON.parse(body)
					if(error){
						console.log(error);
					}
					// post a blockchain
					console.log(cuerpo);

					var options = {
					method:'POST',
					url: 'https://hyperledger-fabric.cfapps.us10.hana.ondemand.com/api/v1/chaincodes/8a8a09c1-2ef9-4a2b-bcc0-fa896d1af9dc-com-sap-icn-blockchain-sapsmartparking-booking/latest/' + numero_nuevo,
					// url: 'https://hyperledger-fabric.cfapps.eu10.hana.ondemand.com/api/v1/chaincodes/2ddcc9f0-bdc0-4ef4-89b9-870622edcfb2-com-sap-icn-blockchain-holymotion-booking/latest/' + numero_nuevo,
					  // url: 'https://hyperledger-fabric.cfapps.eu10.hana.ondemand.com/api/v1/chaincodes/279dd4fb-5a3e-46fe-9b7b-2b20ee7c5dd1-com-sap-icn-blockchain-holymotion-booking/latest/' + numero_nuevo,
					  headers: {
					    'Authorization': 'bearer ' + cuerpo.access_token,
					    'Content-type': 'application/x-www-form-urlencoded'
					  },
					  form: 'placa='+ info.PLACA +'&idlugar='+info.ID_SPOT+'&fechahorainicio='+fecha1.toISOString()+'&fechahorafin='+fecha2.toISOString()+'&estatus='+info.ESTATUS+'&usuario='+req.body.NOMBRE_USUARIO
					};

					request(options,function(error,response,body){
						console.log(options);
						res.send({"resultado":"success","id_reserva":data.d.ID_RESERVA}); 

					});

				});
			}, function(status, error){
				console.error(status + " " + error);
				res.send({"resultado":"error"});  
			});
	});
});

app.post('/contarSpots',function(req,res){
	url = "https://xs01b14ae55f1.us1.hana.ondemand.com/HOLY_MOTION/usuarios.xsodata/spots"
	o(url).get(function(data) {
				numero_nuevo = Number(data.d.results.length);
				res.send({"contador":numero_nuevo,"spots":data});
	});
});

app.post('/nuevoIDReserva',function(req,res){
	url = "https://xs01b14ae55f1.us1.hana.ondemand.com/HOLY_MOTION/usuarios.xsodata/reservas"
	o(url).get(function(data) {
				numero_nuevo = Number(data.d.results.length);
				res.send({"ultima_reserva":numero_nuevo,"reservas":data});
	});
});

app.post('/obtenerImagenesUsuario', function(req,res){
	id_usuario = req.body.id_usuario;
	url = "https://xs01b14ae55f1.us1.hana.ondemand.com/HOLY_MOTION/usuarios.xsodata/usuarios?$filter=ID_USUARIO eq " + id_usuario
	o(url).get(function(data){
		usuario = data.d.results[0];
		console.log(usuario);
		foto1 = usuario.IMAGEN_1;
		foto2 = usuario.IMAGEN_2;
		res.send({"foto1":foto1,"foto2":foto2});
	})
});

app.post('/ConsultarEstatusPuerta',function(req,res){
	url = "https://xs01b14ae55f1.us1.hana.ondemand.com/HOLY_MOTION/checkparking/checkdoorstatus.xsjs?ir=1&is=1";
	o(url).get(function(data){
		estatus = data;
		console.log("La puerta se encuentra en estatus: " + estatus);
		res.send({"resultado":estatus});
	});
});

app.post('/AbrirCerrarPuerta', function(req,res){
	abrirocerrar = req.body.id_cerrado
	console.log("Valor a colocar en la tabla de la puerta = " + abrirocerrar);
	url = "https://xs01b14ae55f1.us1.hana.ondemand.com/HOLY_MOTION/checkparking/changedoorstatus.xsjs?ir=1&is=1&es=" + abrirocerrar;
	o(url).get(function(data){
		console.log(data);
		estatus = data;
		res.send({"resultado":estatus});
	});
});

// Servicios para recast -> Consultar spots y crear una reserva. 

app.post('/consultarSpotsRecast',function(req,res){
	id_usuario = req.body.id_usuario;
	url = "https://xs01b14ae55f1.us1.hana.ondemand.com/HOLY_MOTION/usuarios.xsodata/spots?$top(3)"
	o(url).get(function(data){
		spots = data.d.results;
		console.log(spots);
		res.send({
		    replies: [{
			    "type": "list",
			    "content": {
			      "elements": [
			        {
			          "title": spots[0].DIRECCION,
			          "imageUrl": "https://dqbasmyouzti2.cloudfront.net/assets/content/cache/made/content/images/articles/Office_Buildings_Demand_Response_XL_721_420_80_s_c1.jpg",
			          "subtitle": "2.8km $2 per hour",
			          "buttons": [
			            {
			              "title": "Reserve",
			              "type": "BUTTON_TYPE",
			              "value": "Quiero confirmar mi reserva en el lugar "  + spots[0].ID_SPOT,
			            }
			          ]
			        },
			        {
			          "title": spots[1].DIRECCION,
			          "imageUrl": "https://2qibqm39xjt6q46gf1rwo2g1-wpengine.netdna-ssl.com/wp-content/uploads/2018/06/12184802_web1_M1-Alderwood-EDH-180611.jpg",
			          "subtitle": "3.6km $2.4 per hour",
			          "buttons": [
			            {
			              "title": "Reserve",
			              "type": "BUTTON_TYPE",
			              "value": "Quiero confirmar mi reserva en el lugar "  + spots[1].ID_SPOT,
			            }
			          ]
			        },
			        {
			          "title": spots[2].DIRECCION,
			          "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Industrial_Trust_Building_Providence_RI.jpg/1200px-Industrial_Trust_Building_Providence_RI.jpg",
			          "subtitle": "5.3km $4.2 per hour",
			          "buttons": [
			            {
			              "title": "Reserve",
			              "type": "BUTTON_TYPE",
			              "value": "Quiero confirmar mi reserva en el lugar " + spots[2].ID_SPOT,
			            }
			          ]
			        }
			      ],
			      "buttons": [
			        {
			          "title": "Selecciona un lugar para estacionarte",
			          "type": "BUTTON_TYPE",
			          "value": ""
			        }
			      ],
			    }
			  }]
		  }); 
	})
})

app.post('/reservarRecast',function(req,res){
	url2 = "https://xs01b14ae55f1.us1.hana.ondemand.com/HOLY_MOTION/usuarios.xsodata/reservas?$select=ID_RESERVA&$orderby=ID_RESERVA%20desc&$top=1"

	id_spot = req.body.id_spot;
	id_usuario_reserva = req.body.id_usuario_reserva

	fecha1 = new Date(req.body.FECHA_INICIO + " " + req.body.HORA_INICIO);
	fecha2 = new Date(req.body.FECHA_FIN+ " " + req.body.HORA_FIN);

	o(url2).get(function(data){
		if(typeof data.d.results[0] == 'undefined'){
			numero_nuevo = 1;
		} else {
			console.log(data.d.results[0].ID_RESERVA);
			numero_nuevo = Number(data.d.results[0].ID_RESERVA) + 1;
			console.log(numero_nuevo);
		};

		url3 = "https://xs01b14ae55f1.us1.hana.ondemand.com/HOLY_MOTION/usuarios.xsodata/spots?$filter=ID_SPOT eq " + id_spot

		o(url3).get(function(data){
			var spots = data.d.results;
			console.log(spots);
			url = "https://xs01b14ae55f1.us1.hana.ondemand.com/HOLY_MOTION/usuarios.xsodata/reservas";

			var ID_RESERVA = numero_nuevo;
			var ID_SPOT = id_spot;
			var ID_USUARIO_RESERVA = Number(id_usuario_reserva);
			var FECHA_INICIO = String(yyyymmdd());
			var FECHA_FIN = String(yyyymmdd());
			var HORA_INICIO = '00:10';
			var HORA_FIN =  '20:30';
			var UBICACION_DESC = spots[0].DIRECCION;
			var fecha1 =  new Date(Date.now()-7200000-120000-14400000);
			var fecha2 = new Date(Date.now()+99999999);
			var PLACA =  '556HRZ';
			var ESTATUS = "Pending";

			info = {
				ID_RESERVA: numero_nuevo,
				ID_SPOT: id_spot,
				ID_USUARIO_RESERVA: Number(id_usuario_reserva),
				FECHA_INICIO: String(yyyymmdd()),
				FECHA_FIN: String(yyyymmdd()),
				HORA_INICIO: '00:10',
				HORA_FIN: '20:30',
				UBICACION_DESC: spots[0].DIRECCION,
				FECHA_RENT_INICIO: '/Date('+String(fecha1.getTime())+')/',
				FECHA_RENT_FIN: '/Date('+String(fecha2.getTime())+')/',
				PLACA: '556HRZ',
				ESTATUS: "Pending"
			}
			console.log(info);
			o(url).post(info).save(function(data){
				console.log(data.d);

				var options = {
				method:'GET',
				url: 'https://i848070trial.authentication.us10.hana.ondemand.com/oauth/token?grant_type=client_credentials',
				// url: 'https://innovator.authentication.eu10.hana.ondemand.com/oauth/token?grant_type=client_credentials',
				  // url: 'https://i861443trial.authentication.eu10.hana.ondemand.com/oauth/token?grant_type=client_credentials',
				  headers: {
				    'Authorization': 'Basic c2ItZDIwNzlmYzItZjg0Ni00ZjhmLWE0N2MtZDBmYmU0YTM1YWI2IWIxNTg5fG5hLTNhMDFmMWUyLWJjMzMtNGUxMi04NmEyLWZmZmZhZWE3OTkxOCFiMzM6R3BxQ2NSYS9tQ25qS1dRTDdNY0w4U1VmRmdvPQ=='
				  }
				};

				request(options,function(error,response,body){
					console.log("TOKEN -----------------------------")
					cuerpo = JSON.parse(body)
					if(error){
						console.log(error);
					}
					// post a blockchain
					console.log(cuerpo);

					var options = {
					method:'POST',
					url: 'https://hyperledger-fabric.cfapps.us10.hana.ondemand.com/api/v1/chaincodes/8a8a09c1-2ef9-4a2b-bcc0-fa896d1af9dc-com-sap-icn-blockchain-sapsmartparking-booking/latest/' + numero_nuevo,
					// url: 'https://hyperledger-fabric.cfapps.eu10.hana.ondemand.com/api/v1/chaincodes/2ddcc9f0-bdc0-4ef4-89b9-870622edcfb2-com-sap-icn-blockchain-holymotion-booking/latest/' + numero_nuevo,
					  // url: 'https://hyperledger-fabric.cfapps.eu10.hana.ondemand.com/api/v1/chaincodes/279dd4fb-5a3e-46fe-9b7b-2b20ee7c5dd1-com-sap-icn-blockchain-holymotion-booking/latest/' + numero_nuevo,
					  headers: {
					    'Authorization': 'bearer ' + cuerpo.access_token,
					    'Content-type': 'application/x-www-form-urlencoded'
					  },
					  form: 'placa='+ PLACA +'&idlugar='+ID_SPOT+'&fechahorainicio='+fecha1.toISOString()+'&fechahorafin='+fecha2.toISOString()+'&estatus='+ESTATUS+'&usuario=BrunoRaulGuerreroPadilla'
					};

					request(options,function(error,response,body){
						console.log(options);
						res.send({
					    replies: [{
					      type: 'text',
					      content: 'Tu reserva se realizó de manera satisfactoria con el ID ' + data.d.ID_RESERVA
					    }]
					  });   

					});

				});
			}, function(status, error){
				res.send({
				    replies: [{
				      type: 'text',
				      content: 'There has been an error, try later.'
				    }]
				  });  
			});
		});		
	});
});


function yyyymmdd() {
    var now = new Date();
    var y = now.getFullYear();
    var m = now.getMonth() + 1;
    var d = now.getDate();
    var mm = m < 10 ? '0' + m : m;
    var dd = d < 10 ? '0' + d : d;
    return '' + y + '-' + mm + '-' + dd;
}