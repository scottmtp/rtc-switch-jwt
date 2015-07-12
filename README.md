#  rtc-switch-jwt

A [rtc-switch](https://github.com/rtc-io/rtc-switch) with JWT for security.

## About

A proof-of-concept rtc-switch that adds the following constraints for security:

* A room must be specified in the rtc-switch connection options
* A [JSON Web Token](https://en.wikipedia.org/wiki/JSON_Web_Token) must be included in the connection URL
* The JWT must contain a "rooms" claim that includes the room specified above


## Example

```
var quickconnect = require('rtc-quickconnect');
var token = '<jwt token>';

quickconnect('https://localhost:3000/', { room: 'qc-simple-demo', endpoints: ['/ws?token=' + token] })
  .on('call:started', function(id, pc, data) {
    console.log('we have a new connection to: ' + id);
  });

```

## License

MIT © [Scott Dietrich](http://minutestopost.com)
