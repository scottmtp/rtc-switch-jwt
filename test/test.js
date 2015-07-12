'use strict';

var chai = require('chai');
var assert = chai.assert;
var EventEmitter = require('events').EventEmitter;
var RtcSwitchJwt = require('../');

describe('a working rtc switch', function (done) {
  var announce = '/announce|cibz8lhf100003l5a5ijpap0t|{"browser":"chrome",'
    + '"browserVersion":"43.0.2357","agent":"signaller@6.2.1","id":'
    + '"cibz8lhf100003l5a5ijpap0t","room":"pluto"}';
    
  var decodedToken = { rooms: ['pluto', 'venus', 'jupiter'] };
  var token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb29tcyI6WyJwbHV0byI'
    + 'sInZlbnVzIiwianVwaXRlciJdfQ.uMMkNdDdIXolau6UrDlmLT2e7JkMumJze2vvBNnNTX0';
    
  var sut;
  
  beforeEach(function() {
    var wss = new EventEmitter();
    wss.options = {};
    
    sut = new RtcSwitchJwt(wss, 'nosecret');
  });
  
  it('should detect a valid command', function() {
    var isValid = sut.isValidCommand(announce);
    assert.equal(true, isValid);
  });
  
  it('should detect an invalid command', function() {
    var isValid = sut.isValidCommand('foo');
    assert.equal(false, isValid);
  });
  
  it('should find the announce command', function() {
    var cmd = sut.getCommand(announce);
    assert.equal('announce', cmd);
  });
  
  it('should find the room name', function() {
    var payload = sut.getPayload('announce', announce);
    var room = sut.getRoomFromPayload(payload);
    assert.equal('pluto', room);
  });
  
  it('should reject a connection without a token', function() {
    var verify = sut.verifyClient('/a/b');
    assert.equal(false, verify);
  });
  
  it('should reject a connection with an invalid token', function() {
    var verify = sut.verifyClient('/a/b?token=foo');
    assert.equal(false, verify);
  });
  
  it('should accept a connection with a valid token', function() {
    var verify = sut.verifyClient('/a/b?token=' + token);
    assert.equal(decodedToken.rooms[0], verify.rooms[0]);
    assert.equal(decodedToken.rooms[1], verify.rooms[1]);
    assert.equal(decodedToken.rooms[2], verify.rooms[2]);
  });
  
});