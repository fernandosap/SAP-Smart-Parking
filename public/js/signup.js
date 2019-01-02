console.log("JS Conectado");
var signup_array;
miStorage = window.localStorage;

function SignUp(){
  var firstName = $.trim($("input[name='firstName']").val());
  var LastName = $.trim($("input[name='lastName']").val());
  var email = $.trim($("input[name='email']").val());
  var address = $.trim($("input[name='address']").val());
  var phone = $.trim($("input[name='phone']").val());
  var password1 = $.trim($("input[name='password1']").val());
  var password2 = $.trim($("input[name='password2']").val());

  if(password1!==password2){
    alert("The password confirmation doesn't match, try again");
    return false;
  }

  signup_array = [firstName,LastName,email,address,phone,password1,password2];

    $.post( "/SignUp",{signup_array:signup_array}, function(result) {
      try{
      if(result.resultado == "existente"){
        alert("The user is already created, try logging in");
        $( location ).attr("href", '/');
      } else if(result.resultado == "nuevo") {
        alert("The user has been created successfully, you can login now");
        $( location ).attr("href", '/');
      } else {
        alert("Hubo un error en la creación del usuario, inténtelo de nuevo");
      }
    } catch (e){
      alert(e);
    }
    });
}

