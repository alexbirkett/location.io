[![build status](https://secure.travis-ci.org/alexbirkett/location.io.png)](http://travis-ci.org/alexbirkett/location.io)
location.io
===========

Universal GPS tracker interface for Node.js



# Protocol Implementation #

## Terminology ##
### Up messages ###
Up messages are sent from the tracking device to the server.

### Down messages ###
Down messages are sent from the server to the tracking device.

### Up messsage ACKs ###
Some protocols require up messages to be acknowledged by the server. The 'Up message ACK' is a special case of a 'down message'.

### Down message ACKs ###
Some protocols require down messages to be acknowledged by the tracker. The 'Down message ACK' is a special case of an 'up message'.


