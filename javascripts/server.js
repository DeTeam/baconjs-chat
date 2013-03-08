var io    = require( 'socket.io' ).listen(3030),
    Bacon = require( 'baconjs' ).Bacon,
    _ = require( 'underscore' )._;

var messagesBus = new Bacon.Bus(),
    typingBus = new Bacon.Bus();

var nonTypersStream = typingBus.throttle( 800 ).map( function( name ){
  return { name: name, nontyper: true };
});

var typingStream = typingBus.map( function( name ){
  return { name: name, nontyper: false };
});

var gotAMessage = messagesBus.map( function( msg ){
  return { name: msg.name, nontyper: true };
});

var typers = nonTypersStream.merge( typingStream ).merge( gotAMessage ).scan( [], function( names, event ){
  if( event.nontyper ){
    return _.without( names, event.name );
  } else {
    return _.uniq( names.concat( event.name ) );
  }
});

// Alias in case we'd like to make it as a propperty and pass all messages everytime;
var messages = messagesBus;

io.sockets.on( 'connection', function ( socket ) {

  messages.onValue( function( messages ){
    socket.emit( 'messages', messages );
  });

  typers.onValue( function( typers ){
    socket.emit( 'typers', typers );
  });

  socket.on( 'typing', function( name ){
    typingBus.push( name );
  });

  socket.on( 'newMessage', function( msg ){
    messagesBus.push( msg );
  });

});