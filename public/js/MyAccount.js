console.log("JS Conectado");
miStorage = window.localStorage;
var usuario = JSON.parse(miStorage.user)
var reservas = [];
var reservas2 = [];
var spots = [];
var imagenes = [];
var contador_imagenes = 0;
var id_cerrado;

$("#NombreUsuario").text(usuario.NOMBRE + " " + usuario.APELLIDO);
$("#CorreoUsuario").text(usuario.EMAIL);

$.post('/ConsultarEstatusPuerta',function(result){
  resultado = result.resultado
  
  if(resultado == 0){
    id_cerrado = 1;
    console.log("Puerta Cerrada");
    $("#BotonPuerta").text("Open Door");
    $("#BotonPuerta").removeClass("btn-secondary").addClass("btn-warning");
    $("#BotonPuerta").on('click',puerta);
    // Checar como agregar una clase para el color del boton y el onclick 
  } else if (resultado == 1) {
    id_cerrado = 0;
    console.log("Puerta Abierta");
    $("#BotonPuerta").text("Close Door");
    $("#BotonPuerta").removeClass("btn-secondary").addClass("btn-danger");
    $("#BotonPuerta").on('click',puerta);
    // Checar como agregar una clase para el color del boton y el onclick 
  } else {
    console.log("No hay resultado de la puerta");
  };
});

$.post("/obtenerImagenesUsuario",{id_usuario:usuario.ID_USUARIO}, function(result) {
      foto_usuario = result.foto1;
      foto_usuario = foto_usuario.replace('www','dl');
      foto_usuario = foto_usuario.replace('?dl=0','');
      $("#ImagenUsuario").attr('src',foto_usuario);
});

// trae info de las reservas hechas por este usuario
$.post("/consultarReservas",{id_usuario:usuario.ID_USUARIO},function(result){
      reservas = result.reservas;
      // console.log(reservas);
      if(reservas.length>0){
      for(i=0; i < reservas.length ;i++){
        $("#tabla_reservas").append('<tr><th scope="row">' + reservas[i].ID_RESERVA + '</th><td>' + reservas[i].UBICACION_DESC + '</td><td>' + reservas[i].FECHA_INICIO + '</td><td>' + reservas[i].FECHA_FIN + '</td><td> ' + reservas[i].HORA_INICIO + '</td><td> ' + reservas[i].HORA_FIN + '</td><td>$' + Math.floor(Math.random()*100) + '</td><td>' + reservas[i].PLACA + '</td><td>' + reservas[i].ESTATUS + '</td><td><p><a class="btn btn-danger" onclick="EliminarObjeto(1,' + reservas[i].ID_RESERVA + '); return false" href="#"" role="button">Delete</a></td></tr>');
      }
    }
});

// trae info de las reservas de los spots de este usuario
$.post("/consultarSpots",{id_usuario:usuario.ID_USUARIO},function(result){
      spots = result.spots;
      for(i=0; i<spots.length ;i++){
        if(spots[i].ID_SPOT !=='undefined'){
        // console.log("Se encontro el id de spot, siguiendo");
        id_spot = spots[i].ID_SPOT;
          $.post("/consultarReservasPorSpot",{spot_id:id_spot},function(result){
            reservas2 = result.reservas;
            // console.log("Imprimiendo la información de las reservas para segunda tabla");
            // console.log(reservas2);
            for(x=0;x<reservas2.length;x++){
              console.log(reservas2[x]);
              if(reservas2[x].ID_RESERVA!=='undefined'){
                if(reservas2[x].ESTATUS == 'Confirmed'){
                  $("#tabla_reservas_spots").append('<tr><th scope="row">' + reservas2[x].ID_RESERVA + '</th><td>' +reservas2[x].UBICACION_DESC + '</td><td>' + reservas2[x].FECHA_INICIO + '</td><td>' + reservas2[x].FECHA_FIN + '</td><td> ' + reservas2[x].HORA_INICIO + '</td><td> ' + reservas2[x].HORA_FIN + '</td><td>$' + Math.floor(Math.random()*100) + '</td><td><a id="Placa_usuario" href="https://google.com" class="btn btn-warning" data-toggle="modal" data-target="#modalPlacasUsuario" role="button">' + reservas2[x].PLACA + '</a></td><td>' + reservas2[x].ESTATUS + '</td><td><a class="btn btn-danger" onclick="EliminarObjeto(2,' + reservas2[x].ID_RESERVA + '); return false" href="#"" role="button">Delete</a></td></tr>');
                } else if (reservas2[x].ESTATUS == 'Pending'){
                  $("#tabla_reservas_spots").append('<tr><th scope="row">' + reservas2[x].ID_RESERVA + '</th><td>' +reservas2[x].UBICACION_DESC + '</td><td>' + reservas2[x].FECHA_INICIO + '</td><td>' + reservas2[x].FECHA_FIN + '</td><td> ' + reservas2[x].HORA_INICIO + '</td><td> ' + reservas2[x].HORA_FIN + '</td><td>$' + Math.floor(Math.random()*100) + '</td><td><a id="Placa_usuario" href="https://google.com" class="btn btn-warning" data-toggle="modal" data-target="#modalPlacasUsuario" role="button">' + reservas2[x].PLACA + '</a></td><td>' + reservas2[x].ESTATUS + '<td><p><a class="btn btn-success" onclick="ConfirmarObjeto(2,' + reservas2[x].ID_RESERVA + '); return false" href="#"" role="button">Confirm</a></td>' + '</td><td><p><a class="btn btn-danger" onclick="EliminarObjeto(2,' + reservas2[x].ID_RESERVA + '); return false" href="#"" role="button">Delete</a></td></tr>');
                } else {
                    $("#tabla_reservas_spots").append('<tr><th scope="row">' + reservas2[x].ID_RESERVA + '</th><td>' +reservas2[x].UBICACION_DESC + '</td><td>' + reservas2[x].FECHA_INICIO + '</td><td>' + reservas2[x].FECHA_FIN + '</td><td> ' + reservas2[x].HORA_INICIO + '</td><td> ' + reservas2[x].HORA_FIN + '</td><td>$' + Math.floor(Math.random()*100) + '</td><td><a id="Placa_usuario" href="https://google.com" class="btn btn-warning" data-toggle="modal" data-target="#modalPlacasUsuario" role="button">' + reservas2[x].PLACA + '</a></td><td>' + reservas2[x].ESTATUS + '</td><td><a class="btn btn-danger" onclick="EliminarObjeto(2,' + reservas2[x].ID_RESERVA + '); return false" href="#"" role="button">Delete</a></td></tr>');
                };
              };
            };
          });
      };
      }
});

// Trae la info de los coches del usuario
$.post("/consultarCoches",{id_usuario:usuario.ID_USUARIO},function(result){
      vehiculos = result.vehiculos;
      var tabla = "vehiculos";
      // console.log(vehiculos);
      for(i=0; i < vehiculos.length ;i++){
        $("#tabla_my_vehicles").append('<tr><th scope="row">' + vehiculos[i].ID_VEHICULO + '</th><td>' + vehiculos[i].MARCA + '</td><td>' + vehiculos[i].ANIO + '</td><td>' + vehiculos[i].PLACA + '</td><td> ' + vehiculos[i].COLOR + '</td><td>' +'</td><td><p><a class="btn btn-danger" onclick="EliminarObjeto(3,' + vehiculos[i].ID_VEHICULO + '); return false" href="#" role="button">Delete</a></td></tr>');
    }
});

// Trae la info de los spots de este usuario
$.post("/consultarSpots",{id_usuario:usuario.ID_USUARIO},function(result){
      spots = result.spots;
      var tabla = "spots";
      // console.log(spots);
      for(i=0; i < spots.length ;i++){
        $("#tabla_my_spots").append('<tr><th scope="row">' + spots[i].ID_SPOT + '</th><td>' + spots[i].DIRECCION + '</td>' + '<td><p><a class="btn btn-danger" onclick="EliminarObjeto(4,' + spots[i].ID_SPOT + '); return false" href="#" role="button">Delete</a></td></tr>');
    }
});

// Trae la info de las alertas de los spots de este usuario
$.post("/consultarSpots",{id_usuario:usuario.ID_USUARIO},function(result){
      spots = result.spots;
      console.log("Empezando con la revision de las alertas");
      console.log(spots);
      for(i=0; i<spots.length ;i++){
        if(spots[i].ID_SPOT !=='undefined'){
        id_spot = spots[i].ID_SPOT;
        $.post("/consultarAlertas",{id_spot:id_spot},function(result){
              alerts = result.alerts;
              for(i=0; i < alerts.length ;i++){
                if(alerts[i].ID_ALERTA==1){
                  alerta_desc = "Vehicle ocuppying empty spot";
                  priority = "Medium";
                } else if(alerts[i].ID_ALERTA==2){
                  alerta_desc = "Not the correct vehicle parked";
                  priority = "Low";
                } else if(alerts[i].ID_ALERTA==3){
                  alerta_desc = "Time Exceeded";
                  priority = "Low";
                } else if(alerts[i].ID_ALERTA==4){
                  alerta_desc = "Door Open";
                  priority = "High";
                  $("#tabla_alert_my_spots").append('<tr><th scope="row">' + alerts[i].ID_ALERTA + '</th><td>' + alerts[i].ID_SPOT + '</td>' + '<td>' + priority + '</td>' + '<td>' + alerta_desc + '</td>' + '<td><p><a class="btn btn-danger" onclick="EliminarObjeto(4,' + alerts[i].PLACA + '); return false" href="#" role="button">Delete</a></td></tr>');
                };
           }
       });
     }
   }
});


function AgregarNuevoVehiculo(){
  $("#input_usuario").val(usuario.NOMBRE + " "  + usuario.APELLIDO);
};

function ConfirmarCreacionVehiculo(){
  info = {
      "ID_USUARIO": usuario.ID_USUARIO,
      "MARCA": $("#dropdown_brand").val(),
      "ANIO": $("#dropdown_year").val(),
      "PLACA": $("#input_plates").val(),
      "COLOR_COCHE": $("#dropdown_color").val()
  };

$.post("/CrearCoche",{"info":info},function(result){
    resultado = result.resultado;
    if (resultado == "success"){
        console.log(resultado);
        mensaje = "Your vehicle was added successfully";
        console.log(mensaje);
      } else {
        mensaje = "Hubo un error en tu reservación. Inténtalo de nuevo más tarde."
      }
      console.log("Se realizó el post satisfactoriamente.");
      $("#modalCreacionVehiculo").modal('hide');
      $("#MensajeModalConfirmacionVehiculo").text(mensaje);
      $("#modalConfirmacionVehiculo").modal('show');
      $("#Close_modal_confirmacion_vehiculo").on('click',function(){
        location.reload();
      });

  });
};

function AgregarNuevoSpot(){
  $("#input_usuario_spot").val(usuario.NOMBRE + " "  + usuario.APELLIDO);
};

function confirmarCreacionSpot(){
  if($("#pac-input").val()==""){
    alert("It is necessary to have a valid address");
  } else {
    direccion = $("#pac-input").val()
    $.post('/CrearSpot', {"ID_USUARIO":usuario.ID_USUARIO, "DIRECCION":direccion}, function(result){
      var resultado = result.resultado;
      console.log(resultado);
      if (resultado == "success"){
          mensaje = "Tu Spot se ha agregado de manera exitosa";
          console.log("Se realizó el post satisfactoriamente.");
          $("#modalCreacionSpot").modal('hide');
          $("#MensajeModalConfirmacionSpot").text("Your spot has been saved successfully");
          $("#modalConfirmacionCreacionSpot").modal('show');
          $("#Close_modal_confirmacion_spot").on('click',function(){
            location.reload();
          });
        } else {
          mensaje = "Hubo un error. Inténtalo de nuevo más tarde."
        }
    });
  }
};

function EliminarObjeto(tabla,id_objeto){
  if(tabla == 1 || tabla == 2){
    tabla_eliminar = "reservas";
    texto_mensaje = "reservation"
  } else if(tabla == 3 ){
    tabla_eliminar = "vehiculos";
    texto_mensaje = "vehicle"
  } else if(tabla == 4 ){
    tabla_eliminar = "spots";
    texto_mensaje = "spot"
  };
  console.log(tabla_eliminar);
  mensaje_confirmacion = "You are sure you want to delete this " + texto_mensaje; 
  $("#MensajeModalConfirmacionConfirmacion").text(mensaje_confirmacion);
  $("#modalConfirmacionVehiculoEliminado").modal('show');
  $("#Close_modal_confirmacion_eliminado").on('click',function(){ 
    console.log(tabla + " " + id_objeto);
    $.post('/EliminarObjeto', {"tabla":tabla_eliminar, "id_objeto":id_objeto}, function(result){
      var resultado = result.resultado;
      mensaje = "Your " + texto_mensaje + " was deleted successfully";
      console.log(resultado);
      if (resultado == "success"){
          console.log("Se realizó el post satisfactoriamente.");
          $("#modalConfirmacionVehiculoEliminado").modal('hide');
          $("#MensajeModalConfirmacionVehiculo").text(mensaje);
          $("#modalConfirmacionVehiculo").modal('show');
          $("#Close_modal_confirmacion_vehiculo").on('click',function(){
            location.reload();
          });
        } else {
          mensaje = "Hubo un error. Inténtalo de nuevo más tarde."
        }
    });
  });
};

function ConfirmarObjeto(tabla,id_objeto){
  if(tabla == 1 || tabla == 2){
    tabla_confirmar = "reservas";
    texto_mensaje = "reservation"
  } else if(tabla == 3 ){
    tabla_confirmar = "vehiculos";
    texto_mensaje = "vehicle"
  } else if(tabla == 4 ){
    tabla_confirmar = "spots";
    texto_mensaje = "spot"
  };
  console.log(tabla_confirmar);
  mensaje_confirmacion = "You are sure you want to confirm this " + texto_mensaje; 
  $("#MensajeModalConfirmacionConfirmacion").text(mensaje_confirmacion);
  $("#Close_modal_confirmacion_eliminado").text("YES CONFIRM!")
  $("#modalConfirmacionVehiculoEliminado").modal('show');
  $("#Close_modal_confirmacion_eliminado").on('click',function(){ 
    console.log(tabla + " " + id_objeto);
    $.post('/ConfirmarObjeto', {"tabla":tabla_confirmar, "id_objeto":id_objeto}, function(result){
      var resultado = result.resultado;
      mensaje = "Your " + texto_mensaje + " was confirmed successfully";
      console.log(resultado);
      if (resultado == "success"){
          console.log("Se realizó el post satisfactoriamente.");
          $("#modalConfirmacionVehiculoEliminado").modal('hide');
          $("#MensajeModalConfirmacionVehiculo").html(mensaje);
          $("#modalConfirmacionVehiculo").modal('show');
          $("#Close_modal_confirmacion_vehiculo").on('click',function(){
          location.reload();
          });
        } else {
          mensaje = "Hubo un error. Inténtalo de nuevo más tarde."
        }
    });
  });
};

function cargarImagen(image){
  /**
 * Two variables should already be set.
 * dropboxToken = OAuth access token, specific to the user.
 * file = file object selected in the file widget.
 */

 var dropboxToken = 'G8yo7qskgYAAAAAAAAAAKZNbGFrkMNPKXN76oP4BFwRNLPwTzsYcPLtBzlPMZm0i';
  
  var xhr = new XMLHttpRequest();
  var xhr2 = new XMLHttpRequest();
   
  xhr.upload.onprogress = function(evt) {
    var percentComplete = parseInt(100.0 * evt.loaded / evt.total);
    // Upload in progress. Do something here with the percent complete.
    console.log(percentComplete);
    $("#Estatus_carga").text("Uploading percentage: " + percentComplete + "%");
    $("#Estatus_carga2").text("Uploading percentage: " + percentComplete + "%");
    $("#Estatus_carga3").text("Uploading percentage: " + percentComplete + "%");
  };
   
  xhr.onload = function() {
    if (xhr.status === 200) {
      $("#Estatus_carga").text("");
      $("#Estatus_carga2").text("");
      $("#Estatus_carga3").text("");
      $('#Close_modal_photo' + contador_imagenes).prop('disabled', false);
      contador_imagenes = contador_imagenes + 1;
      var fileInfo = JSON.parse(xhr.response);
      console.log(fileInfo);
      // Upload succeeded. Do something here with the file info.
      xhr2.open('POST', 'https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings');
      xhr2.setRequestHeader('Authorization', 'Bearer ' + dropboxToken);
      xhr2.setRequestHeader('Content-Type', 'application/json');
      var body = '{"path": "'+fileInfo.path_lower+'","settings": {"requested_visibility":"public"}}';
      xhr2.send(body);
    }
    else {
      var errorMessage = xhr.response || 'Unable to upload file';
      console.log(errorMessage);
      // Upload failed. Do something here with the error.
    }
  };
  
  carpeta = String(usuario.NOMBRE).trim() + String(usuario.APELLIDO).trim();
  carpeta = carpeta.replace(/\s/g, '');
  carpeta = carpeta.normalize('NFD').replace(/[\u0300-\u036f]/g, "");

  console.log(carpeta);
  xhr.open('POST', 'https://content.dropboxapi.com/2/files/upload');
  xhr.setRequestHeader('Authorization', 'Bearer ' + dropboxToken);
  xhr.setRequestHeader('Content-Type', 'application/octet-stream');
  xhr.setRequestHeader('Dropbox-API-Arg', JSON.stringify({
    path: '/'+ carpeta +'/' +  '000'+contador_imagenes+'.jpg',
    mode: 'overwrite',
    autorename: false,
    mute: false
  }));

  xhr.send(image[0]);
   
  xhr2.onload = function() {
    if (xhr2.status === 200) {
      var fileInfo2 = JSON.parse(xhr2.response);
      console.log(fileInfo2);
      imagenes[imagenes.length] = fileInfo2.url
      if(contador_imagenes==3){
        console.log("Contador_restaurado");
        contador_imagenes = 0;
        if(imagenes.length==3){
        console.log("Enviando imagenes a servidor");
         $.post('/ActualizarImagenes', {"imagenes":imagenes, "id_usuario":usuario.ID_USUARIO}, function(result){
          console.log(imagenes);
            var resultado = result.resultado;
            mensaje = resultado;
            console.log(resultado);
            if (resultado == "success"){
                console.log("Se realizó el post satisfactoriamente.");
                location.reload();
              } else {
                mensaje = "Hubo un error. Inténtalo de nuevo más tarde."
              }
          });
         };
      }
      // Upload succeeded. Do something here with the file info.
    }
    else {
      var errorMessage = xhr2.response || 'Unable to upload file';
      console.log(errorMessage);
      if(contador_imagenes==3){
          location.reload();
      }
      // Upload failed. Do something here with the error.
    }
  };
};

function resetImage(){
 contador_imagenes = 0;
 $('#Close_modal_photo0').prop('disabled', true);
 $('#Close_modal_photo1').prop('disabled', true);
 $('#Close_modal_photo2').prop('disabled', true);
 $("#Estatus_carga").text("");
 $("#Estatus_carga2").text("");
 $("#Estatus_carga3").text("");
};

function puerta(){
  if(id_cerrado==1){
    console.log("Abriendo Puerta")
  } else if(id_cerrado==0){
    console.log("Cerrando Puerta")
  };

  $.post("/AbrirCerrarPuerta",{"id_cerrado":id_cerrado},function(result){
    resultado = result.resultado;
    // console.log(resultado);
    if(resultado=="Actualizado"&&id_cerrado==1){
      id_cerrado = 0;
      // console.log("Puerta Abierta satisfactoriamente");
      $("#BotonPuerta").text("Close Door");
      $("#BotonPuerta").removeClass("btn-warning").addClass("btn-danger");

    } else if (resultado=="Actualizado"&&id_cerrado==0){
      id_cerrado = 1;   
      // console.log("Puerta Cerrada satisfactoriamente");
      $("#BotonPuerta").text("Open Door");
      $("#BotonPuerta").removeClass("btn-danger").addClass("btn-warning");

    };
  });
}