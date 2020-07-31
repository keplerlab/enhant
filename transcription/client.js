const express = require('express');
const http = require('http');
const https = require('https');
const fs = require('fs');
const CONFIG = require('./config');
const path = require('path');


const app = express();

// static path dir
app.use("/static",express.static(path.join(__dirname, CONFIG.server.static_dir)));
const privateKey = fs.readFileSync('certificates/key.pem', 'utf-8');
const certificate = fs.readFileSync('certificates/cert.pem', 'utf-8');

var credentials = { key: privateKey, cert: certificate };

// The https server
var httpsServer = https.createServer(credentials, app);

// creating the http server
http.createServer(app).listen(8001);
console.log("Started http server on ", 8001);

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'recorder.html'));
});

httpsServer.listen(8000);
console.log("Started HTTPS server on ", 8000);
