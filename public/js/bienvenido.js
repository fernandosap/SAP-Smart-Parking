console.log("JS Conectado");
var map, marker
var cantidad_spots;
miStorage = window.localStorage;
var usuario = JSON.parse(miStorage.user)

var markers = [];
var contentString = [];

var coches = [];
var info;
var test ;
var placaSeleccionada = "";

function initMap() {
map = new google.maps.Map(document.getElementById('map'), {
  center: {lat: 19.391003, lng: -99.284041},
  zoom: 5
});

marker = new google.maps.Marker;
var infowindow =  new google.maps.InfoWindow();

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(function(position) {
    $.post( "/contarSpots", function(result) {
      cantidad_spots = result.contador;
      spots = result.spots.d.results;

      console.log("Cantidad de marcadores a agregar: " + cantidad_spots);

      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      var image = {
          url: "circulo_verde3.png",
          scaledSize: new google.maps.Size(30, 30)
        };

      console.log(pos);

      marker.setPosition(pos);
      marker.setMap(map);
      map.setCenter(pos);
      map.setZoom(16);

      for(i=0;i<cantidad_spots;i++){
        console.log("agregando nuevo marcador");

        rand1 = Math.random() * (.008 - .001) + .001;
        rand2 = Math.random() * (.008 - .001) + .001;

        var pos2 = {
          lat: Number(position.coords.latitude) + (rand1),
          lng: Number(position.coords.longitude) + (rand2)
        };

        console.log(pos2);

        markers[i] = new google.maps.Marker({
          position: pos2,
          map: map,
          icon:image,
          id_marker: spots[i].ID_SPOT,
          direccion: spots[i].DIRECCION,
          direccion_gmaps: "https://maps.google.com/?q=" + pos2.lat + "," + pos2.lng
        });

      };

      for(x=0;x<markers.length;x++){
        console.log("Entrando a for de marcadores");
        var id_coche_seleccionado;
        google.maps.event.addListener(markers[x], 'click', function() {
          var marcador = this;
          console.log("marcador" + x + " agregado");
          infowindow.setContent(infoMensaje(this));
          infowindow.open(map, this);

            $("#botonConfirmarReserva").click(function(){
              console.log("Realizando reserva");
              // Hacer un post a la tabla de hana para guardar la reserva, pasando ID de lugar, fecha y hora.
              info = {
               "ID_SPOT": marcador.id_marker,
               "UBICACION_DESC": marcador.direccion,
               "ID_USUARIO_RESERVA": usuario.ID_USUARIO,
               "NOMBRE_USUARIO": usuario.NOMBRE + " " + usuario.APELLIDO,
               "FECHA_INICIO": $("#fecha_inicio").val(),
               "FECHA_FIN": $("#fecha_fin").val(),
               "HORA_INICIO": $("#hora_inicio").val(),
               "HORA_FIN": $("#hora_fin").val(),
               "PLACA": placaSeleccionada
               };

               var mensaje = ""; 

               console.log(info);

              if($("#fecha_inicio").val()==""||$("#fecha_fin").val()==""||$("#hora_inicio").val()==""||$("#hora_fin").val()==""){
                console.log("alguno de los valores esta en blanco");
              } else {
              $.post( "/crearReserva",info,function(result) {
                resultado = result.resultado;
                console.log(result.resultado);
                console.log(result.id_reserva);
                if (resultado == "success"){
                  mensaje = "Tu reserva se realizó de manera exitosa. <p> El id de tu reserva es: " + result.id_reserva + "</p>"
                  $("#fecha_inicio").val("");
                  $("#fecha_fin").val("");
                  $("#hora_inicio").val("");
                  $("#hora_fin").val("");
                  info = "";
                  $("#direccion_gmaps").attr('href',String(marcador.direccion_gmaps));
                  $("#direccion_gmaps_boton").show();
                } else {
                  mensaje = "Realizando reservación ... Espera unos segundos";
                  $("#fecha_inicio").val("");
                  $("#fecha_fin").val("");
                  $("#hora_inicio").val("");
                  $("#hora_fin").val("");
                  info = "";
                  $("#direccion_gmaps_boton").hide();
                }
                console.log("Se realizó el post satisfactoriamente.");
                $("#exampleModal").modal('hide');
                $("#MensajeModalConfirmacion").html(mensaje);
                $("#modalConfirmacion").modal('show');
                infowindow.close();
              });
            };
          });
      console.log("Proceso de carga de mapa terminado");
          });
      };


  		})},
	)}
};

function reservar(direccion){
  $("#exampleModal").modal('show');
  $("#tituloModal").text(direccion);
  $.post("/consultarVehiculos",{usuario:usuario.ID_USUARIO},function(result){
    if(result.resultado.existe==true){
      console.log(result.resultado.vehiculos);
      coches = result.resultado.vehiculos;
      for(var i = 0; i<coches.length; i++){
        coche_desc = coches[i].MARCA + ' ' + coches[i].ANIO + ' ' + coches[i].PLACA;
        $("#dropdownVehiculos").append("<a class='dropdown-item' href='#' title='" + coches[i].ID_VEHICULO + "' name='" + coches[i].PLACA + "' id='cocheOpcion" + (i+1) + "'>" + coche_desc + "</a>");
        $("#cocheOpcion" + (i+1)).on('click', function(){
          coche = this.text;
          placaSeleccionada = this.name;
          $("#dropdownMenuButton").text(coche);
        });
      };
    } else {
      $("#dropdownVehiculos").append("<a class='dropdown-item' href='#''> Sin vehículos registrados </a>");
    }
    console.log("resultado vehículo " + String(result.resultado.existe));
  })
};


function infoMensaje(marker){
  var mensaje = ""
  var rand = Math.floor((Math.random() * (2 - 0) + 0));

  mensaje = '<div class="text-center" id="content">'+
          '<div id="siteNotice">'+
          '</div>'+
          '<h2 id="firstHeading" class="firstHeading">'+marker.direccion+'</h2>'+
          '<div id="bodyContent">'+
          '<p><b>Estatus:</b> Disponible</p>'+
          '<p><b>Estacionamiento:</b> Público</p>'+
          '<p><b>Costo por hora:</b> $25</p>'+
          '<p><b>Tiempo de llegada:</b> 3 min</p>'+
          '<p><button class="btn btn-lg btn-primary btn-block" onclick="reservar(\'' + String(marker.direccion).trim() + '\');return false" id="botonReservar">¡Reservar Lugar!</button></p>'+
          // '<p>id_spot: '+ marker.id_marker + '</p>'+
          '</div></div>'
          ;
  return mensaje;
};
