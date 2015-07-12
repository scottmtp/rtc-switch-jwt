'use strict';
var express = require('express');
var http = require('http');
var app = express();
var RtcSwitchJwt = require('./');

var server = http.createServer(app);
server.listen(3000);

var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({ server: server, path: '/ws' });

var jwtSecret = process.env.SECRET || 'nosecret';
var rtcswitch = new RtcSwitchJwt(wss, jwtSecret);

console.log('Server listening on port 3000.');