'use strict';

var jwt = require('jwt-simple');
var payload = { rooms: ['pluto', 'venus', 'jupiter'] };
var secret = 'nosecret';

var token = jwt.encode(payload, secret);
console.log(token);