const bodyParser = require("body-parser");
const express = require("express");
const admin = require("firebase-admin");
var axios = require('axios');

const PORT = process.env.PORT || 5002;
const app = express();
// Import the functions you need from the SDKs you need
const  initialize  =  require("firebase/app");
const lib = require("firebase/auth");
var serviceAccount = require("./serviceAccountKey.json");
const cookieParser = require("cookie-parser");
const e = require("express");
const { response } = require("express");
//const { default: axios } = require("axios");

//const axios = require('axios').create({ baseURL: 'http://localhost:8080/', responseType: 'json', withCredentials: true });

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

const { initializeApp } = initialize
const { getAuth, createUserWithEmailAndPassword } = lib
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());


app.set("view engine", "ejs");

const firebaseConfig = {
	apiKey: "AIzaSyCot_E1fN8PxtN99o0pomZ2Bb8mOADsdn8",
	authDomain: "fir-app-test-2b991.firebaseapp.com",
	projectId: "fir-app-test-2b991",
	storageBucket: "fir-app-test-2b991.appspot.com",
	messagingSenderId: "783859737357",
	appId: "1:783859737357:web:becaba1ca9b73ba3d14644"
  };
  
  // Initialize Firebase
  var firebase = initializeApp(firebaseConfig);

app.engine("html", require("ejs").renderFile);
app.use(express.static("static"));

app.get('/logout',(req,res)=>{
    res.clearCookie('__session');
	firebase.auth().signOut().then(() => {
		res.redirect('/');
	});
});

app.get("/login", function (req, res) {

	firebase.auth().signInWithEmailAndPassword(req.query.username, req.query.password) // email, pass
	.then((userCredential) => {
	  // Signed in
	  var user = userCredential.user;
	  console.log("inside signin")
	  console.log(user)
	  var result = {"success": "true", "emailId": req.query.username};
	  res.send(result);
	  res.redirect("/profile")
	  // ...
	})
	.catch((error) => {
	  var errorCode = error.code;
	  var errorMessage = error.message;
	  var result = {"success": "false"};
	  res.send(result);
	  console.log(error)
	});
});

// app.get("/login", function (req, res) {
// 	res.render("login.html");
// });

app.get("/signup", function (req, res) {
	console.log("inside sign up post")
	console.log(req.query.username)
	console.log(req.query.password)

	// axios.post("http://localhost:8082/patient/psignup")
	// 	.then((response) => {
	// 		console.log(response);
	// 		console.log(response.username);
	// 		console.log(response.password);
	// 	})
	// 	.catch((error) =>console.log(error));
	  firebase.auth().createUserWithEmailAndPassword(req.query.username, req.query.password) // email, pass
		.then((userCredential) => {
			// Signed in 
			const user = userCredential.user;
			console.log("user created successfully")
			console.log(userCredential.user)
			//res.send(userCredential.user)
			var result = {"success": "true", "emailId": req.query.username};
			res.send(result);
			//res.redirect("/profile")
			// ...
		})
		.catch((error) => {
			const errorCode = error.code;
			const errorMessage = error.message;
			console.log(error)
			var result = {"success": "false"};
			res.send(result);
			// ..
		});

  	// res.render("signup.html");
});

// app.get("/signup", function (req, res) {
// 	console.log("inside sign up get")
//   	res.render("signup.ejs");
// });
app.get("/profile", function (req, res) {
	console.log("inside firebase profile ",firebase.auth())
    res.render("profile.html");
	console.log("after profile ")
	firebase.auth().onAuthStateChanged(function(user) {
		if (user) {
			console.log("Auth State changed", user.email)
		}else{
			console.log("No Auth State changed")
		}
	})
});

			app.get("/verify-email", function (req, res) {
				var user = firebase.auth().currentUser;
                console.log("inside sendverification ",user)
                // window.location.assign("/verify-email");
				firebase.auth().onAuthStateChanged(function(user) {
					user.sendEmailVerification().then(function() {
						console.log("Verification link sent to your email. Kinldy check to verify your account")
					}).catch(function(error) {
					// An error happened.
					console.log(error)
					});               
				  });

                user.sendEmailVerification().then(function() {
                    console.log("Verification link sent to your email. Kinldy check to verify your account")
                }).catch(function(error) {
                // An error happened.
                console.log(error)
                });               
	// res.render("login.html");
});


app.get("/", function (req, res) {
	
	res.render("login.html");
});

app.get('/success',checkCookie,(req,res)=>{
    res.sendFile(__dirname + '/success.html');
    console.log("UID of Signed in User is" + req.decodedClaims.uid);
    //You will reach here only if session is working Fine
});



function checkCookie(req,res,next){


	const sessionCookie = req.cookies.__session || '';
	admin.auth().verifySessionCookie(
		sessionCookie, true).then((decodedClaims) => {
			req.decodedClaims = decodedClaims;
			next();
		})
		.catch(error => {
			// Session cookie is unavailable or invalid. Force user to login.
			res.redirect('/login');
		});

}

function savecookie(idtoken,res){

    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    admin.auth().createSessionCookie(idtoken,{expiresIn})
    .then((sessionCookie)=>{
        const options = {maxAge: expiresIn, httpOnly: true, secure: true};
        res.cookie('__session', sessionCookie, options);
	
        admin.auth().verifyIdToken(idtoken).then(function(decodedClaims){
            res.redirect('/profile');
        });

    },error=>{
        console.log(error);
        res.status(401).send("UnAuthorised Request");

    });
}

app.get('/savecookie',(req,res)=>{
    const Idtoken=req.query.idToken;
    console.log(Idtoken);
    savecookie(Idtoken,res);
});

// var clients = await axios.get("http://localhost:8082/patient/psignup")
// .then(response=> {console.log(response.data)}).catch(err=>{console.log(err)});


app.listen(PORT, () => {
  	console.log(`Listening on http://localhost:${PORT}`);
});