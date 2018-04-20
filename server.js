/**
 * Created by Alnim on 4/8/2018
 */

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
app.set('port', (process.env.PORT || 5000));
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
    uIP = req.ip;
});

app.use(express.static(__dirname + '/'));
io.on('connection', function (socket) {
    console.log("A view has been collected " + socket.id);
});
http.listen(app.get('port'), '127.0.0.1', function () {
    console.log(' +' + app.get('port'));
});