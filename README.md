<p align="center">
  <img src="http://location.io/wp-content/themes/responsive-location/images/logo.jpg" alt="Location.IO Logo"/>
</p>

[![build status](https://secure.travis-ci.org/alexbirkett/location.io.png)](http://travis-ci.org/alexbirkett/location.io)
Location.IO
===========
Location.IO facilitates the creation of tracking solutions by providing a common interface to GPS tracking hardware.

Location.IO supports multiple GPS tracker protocols on a single TCP/IP port relieving users of the need to know which protocol their tracking device uses.

Location.IO is written in JavaScript for Node.js. Node.js was chosen because its non-blocking, event-driven IO model is well suited to a server that will have a large number of symultaneous connections, each sending a small amout of data.
 


Currently supported protocols
===========

* [GOTOP protocol] (http://location.io/index.php/2012/11/26/gotop-protocol/)
* [Tk103 protocol] (http://location.io/index.php/2013/04/11/tk103-protocol/)
* [GPS108 watch protocol] (http://location.io/index.php/2013/05/30/gps-108-watch-tracker-protocol/)
* [Globalsat TR-203 protocol - partial support] (http://location.io/index.php/2013/05/30/globalsat-tr-203-protocol/)

Demo Application
===========
[Demo appliation using SocketStream, angular.js and Google Maps](https://github.com/alexbirkett/demo.location.io)


Basic Example
==========
Listens on port 1337 for incoming connections from trackers and logs messages from trackers to console:

```js

var LocationIo = require('location.io');

var locationIo = new LocationIo();

locationIo.on('tracker-connected', function(trackerId, protocolName) {
  console.log('new connection ' + trackerId + ' using protocol ' + protocolName);
});

locationIo.on('tracker-disconnected', function(id) {
	console.log('connection closed ' + id);
});

locationIo.on('message', function(trackerId, message) {
	console.log('message from ' + trackerId);
	console.log(message);
});


locationIo.createServer(1337);
```
More info
=====
More info about supported trackers and protocols can be found on the [Location.IO webstie](http://location.io)


## Terminology ##
### Up messages ###
Up messages are sent from the tracking device to the server.

### Down messages ###
Down messages are sent from the server to the tracking device.

### Up messsage ACKs ###
Some protocols require up messages to be acknowledged by the server. The 'Up message ACK' is a special case of a 'down message'.

### Down message ACKs ###
Some protocols require down messages to be acknowledged by the tracker. The 'Down message ACK' is a special case of an 'up message'.

License
=====
The MIT License (MIT)

Copyright (c) 2013 Alex Birkett <alex@birkett.co.uk>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
