// Run this script to launch the server.
// The server should run on localhost port 8000.
// This is where you should start writing server-side code for this application.
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors');


const app = express();
const port = 8000;

app.use(cors());
// {timestamps: true}, could use this for schemas
// MUST STORE USER SESSION IN DB
app.use(
    session({
      secret: "supersecret difficult to guess string",
      cookie: {},
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({ mongoUrl: 'mongodb://127.0.0.1:27017/bcrypt_test'})
    })
  );
// Store userID on session, get user data as needed from sessionID
    //the userID could be their username, it is unique   


app.get("/", function (req, res) {
    res.send("Hello Phreddit (for the last time)!");
});

app.listen(port, () => {console.log("Server listening on port 8000...");});

