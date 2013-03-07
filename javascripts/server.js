var io    = require('socket.io').listen(3030),
    Bacon = require("baconjs").Bacon;

var bus = new Bacon.Bus();

var currentValue = bus.scan( 0, function( a, b ){ return a + b; });

io.sockets.on( 'connection', function (socket) {

  currentValue.onValue( function(value){
    socket.send( value );
  });

  socket.on( 'message', function (value) {
    bus.push( parseInt( value, 10 ) );
  });
});