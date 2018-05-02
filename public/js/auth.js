// Initialize Firebase
var config = {
    apiKey: "AIzaSyCTL57pt6-P941H44oDRtUqGgZ_FyIodXA",
    authDomain: "watch-it-b1404.firebaseapp.com",
    databaseURL: "https://watch-it-b1404.firebaseio.com",
    projectId: "watch-it-b1404",
    storageBucket: "watch-it-b1404.appspot.com",
    messagingSenderId: "30602514850"
};
firebase.initializeApp(config);
var database = firebase.database();
$(function () {
    firebase.auth().onAuthStateChanged(function (user) {
        if(user){
            //go to console
                var location = window.location.pathname;
                console.log("You are logged in");
                if(location.indexOf("login") !== -1 || location.indexOf("register") !== -1 || location.indexOf("resetPwd") !== -1){
                    window.location.replace("index");
                }
                if(location.indexOf("console")!==-1){
                    $("div.authPage").show();
                    loadData(user);
                }
                $("li.auth").show();
                $("li.unauth").hide();

        }
        else{
                console.log("You are logged out");
                $("li.unauth").show();
                $("li.auth").hide();
                $("div.authPage").hide();

                location = window.location.pathname;
                if(location.indexOf("console") !== -1){
                    window.location.replace("403");
                }

        }
   });
});

$().ready(function () {

   $("#registrationForm").validate({
      rules: {
          email:{
              required:true,
              email:true
          },
          password_id:{
              required: true,
              minlength:8
          },
          passwordConfirm_id:{
              required: true,
              minlength: 8,
              equalTo: "#password_id"
          }
      },
       messages:{
           password_id:{
               required:"Please provide a password",
               minlength:jQuery.validator.format("Your password must be at least {0} characters long")
           },
           passwordConfirm_id:{
               required:"Please provide a password",
               minlength:jQuery.validator.format("Your password must be at least {0} characters long"),
               equalTo: "Both passwords must match"
           }
       },
       errorPlacement:function (error, element) {
          error.appendTo(element.parent().next("div"));
       },
       highlight:function (element,errorClass){
         $(element).addClass("alert-danger");
       },
       focusInvalid:true,
       submitHandler: function (form) {
           register();
       },
       unhighlight: function(element, errorClass, validClass) {
           $(element).removeClass("alert-danger");
       }
   });



    $("#loginForm").validate({
        rules: {
            email:{
                required:true,
                email:true
            },
            password_id:{
                required: true,
                minlength:8
            }
        },
        messages:{
            password_id:{
                required:"Please provide a password"
            }
        },
        errorPlacement:function (error, element) {
            error.appendTo(element.parent().next("div"));
        },
        highlight:function (element,errorClass){
            $(element).addClass("alert-danger");
        },
        focusInvalid:true,
        submitHandler: function (form) {
            login();
        },
        unhighlight: function(element, errorClass, validClass) {
            $(element).removeClass("alert-danger");
        }
    });



    $("#resetPwdForm").validate({
        rules: {
            email:{
                required:true,
                email:true
            }
        },
        errorPlacement:function (error, element) {
            error.appendTo(element.parent().next("div"));
        },
        highlight:function (element,errorClass){
            $(element).addClass("alert-danger");
        },
        focusInvalid:true,
        submitHandler: function (form) {
            forgotPwd();
        },
        unhighlight: function(element, errorClass, validClass) {
            $(element).removeClass("alert-danger");
        }
    });
});

function register() {

   var password = $("#password_id").val();
   var email = $("#email").val();
   firebase.auth().createUserWithEmailAndPassword(email, password).then(function (user) {
       if(user) {
           database.ref("Therapists/"+user.uid+"/").set({
               email: email
           });

           window.location.replace("index.html")
       }
   }).catch(function(error){
        console.log(error.message);
        $("#regErrorArea").html(error.message).addClass("alert-danger");

   });
}

function userCheck(uid){
    firebase.database().ref('/Therapists/' + uid+'/').once('value').then(function(snapshot) {
        //user is therapist
        if(snapshot.val()) {
            //add callback here
            window.location.replace("index");
        }
    });
    firebase.database().ref('/Wearers/' + uid+'/').once('value').then(function(snapshot) {
        //user is wearer
        if(snapshot.val()) {
            firebase.auth().signOut();
            $("#loginError").html("Wearers cannot login to web console").addClass("alert-danger");
        }
    });
}

function login(){
    var password = $("#password_id").val();
    var email = $("#email").val();
    firebase.auth().signInWithEmailAndPassword(email,password).then(function (user) {
        if(user){
            userCheck(user.uid);
        }
    }).catch(function (error) {
        console.log(error.message);
        $("#loginError").html("Incorrect email or password").addClass("alert-danger");
    });
}

function forgotPwd(){
    var email = $("#email").val();
    firebase.auth().sendPasswordResetEmail(email).then(function () {
        $("#messageArea").html("Email sent").addClass("alert-success");
    })
    .catch(function (error) {
        console.log(error.message);
        $("#messageArea").html(error.message).addClass("alert-danger");

    });
}

function logout() {

   firebase.auth().signOut().then(function () {
       window.location.replace("index");
   });
}
