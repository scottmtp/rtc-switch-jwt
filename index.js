'use strict';

var url = require('url');
var debug = require('debug')('rtc-switch-jwt');
var jsonparse = require('cog/jsonparse');
var jwt = require('jwt-simple');

function RtcSwitchJwt(wss, jwtSecret) {
  if (!(this instanceof RtcSwitchJwt)) {
    return new RtcSwitchJwt(wss, jwtSecret);
  }
  
  this.jwtSecret = jwtSecret;
  this.board = require('rtc-switch')();
  wss.on('connection', this.onWssConnection.bind(this));
}

module.exports = RtcSwitchJwt;

RtcSwitchJwt.prototype.isValidCommand = function(data) {
  return data.charAt(0) === '/';
};

RtcSwitchJwt.prototype.getCommand = function(data) {
  return data.slice(1, data.indexOf('|', 1)).toLowerCase();
};


RtcSwitchJwt.prototype.getPayload = function(command, data) {
  return data.slice(command.length + 2).split('|').map(jsonparse);
};

RtcSwitchJwt.prototype.getRoomFromPayload = function(payload) {
  var room;
  if (payload && payload.length > 0) {
    room = payload[1].room;
  }

  return room;
};

RtcSwitchJwt.prototype.verifyClient = function(wsUrl) {
  var parsed, decoded;
  
  parsed = url.parse(wsUrl, true);
  if (!parsed.query.token) {
    console.log('Missing token: ' + wsUrl);
    return false;
  }
  
  try {
    decoded = jwt.decode(parsed.query.token, this.jwtSecret);
  } catch (e) {
    debug('jwt decode error: ' + e);
    return false;
  }
  
  return decoded;
};

RtcSwitchJwt.prototype.onWssConnection = function(ws) {
  console.log('connection: ', ws.upgradeReq.url);
  var self = this;
  
  var decodedToken = self.verifyClient(ws.upgradeReq.url);
  if (decodedToken) {
    var peer = this.board.connect();
    peer.on('data', function(data) {
      self.onPeerData(ws, data);
    });
  
    ws.on('message', function(data) {
      self.onWsMessage(peer, data, decodedToken);
    });
  
    ws.on('close', peer.leave);
  } else {
    console.log('Rejected invalid token');
    ws.close();
  }
};

RtcSwitchJwt.prototype.onWsMessage = function(peer, data, decodedToken) {
  var command, payload, room;
  var self = this;
  debug('IN ==> ' + data);
  
  if (!self.isValidCommand(data)) {
    console.warn('Rejecting invalid command: ' + data);
    return false;
  }
  
  command = self.getCommand(data);
  
  // validate room against jwt during announce
  if (command === 'announce') {
    payload = self.getPayload(command, data);
    room = self.getRoomFromPayload(payload);

    if (!room) {
      console.warn('Rejecting announce without room: ' + data);
      return false;
    }

    if (decodedToken.rooms.indexOf(room) < 0) {
      console.warn('Rejecting room name not present in jwt claim: ' + data);
      return false;
    }
    
  }

  peer.process(data);
  
};

RtcSwitchJwt.prototype.onPeerData = function(ws, data) {
  if (ws.readyState === 1) {
    debug('OUT <== ' + data);
    ws.send(data);
  }
};