var io    = require( 'socket.io' ).listen(3030),
    Bacon = require( 'baconjs' ).Bacon,
    _ = require( 'underscore' )._;

var newMessage = new Bacon.Bus(),
    userIsTyping = new Bacon.Bus(),

    userStoppedTyping,
    userIsTypingEvent,
    newMessageEvent,

    messages,
    typingUsers;

// If there's no activity from user for 800ms - he stopped typing
userStoppedTyping = userIsTyping.throttle( 800 ).map( function( name ){
  return { name: name, nontyper: true };
});

userIsTypingEvent = userIsTyping.map( function( name ){
  return { name: name, nontyper: false };
});

// If we get a new message from user - remove him from typers
newMessageEvent = newMessage.map( function( msg ){
  return { name: msg.name, nontyper: true };
});

typingUsers = userStoppedTyping.merge( userIsTypingEvent ).merge( newMessageEvent ).scan( [], function( names, event ){
  if( event.nontyper ){
    return _.without( names, event.name );
  } else {
    return _.uniq( names.concat( event.name ) );
  }
});

// Alias in case we'd like to make it as a propperty and pass all messages everytime
// Or we could always keep i.e. only last 20 messages and all new connections'd see that
messages = newMessage;

io.sockets.on( 'connection', function ( socket ) {

  messages.onValue( function( messages ){
    socket.emit( 'messages', messages );
  });

  typingUsers.onValue( function( typingUsers ){
    socket.emit( 'typers', typingUsers );
  });

  socket.on( 'typing', function( name ){
    userIsTyping.push( name );
  });

  socket.on( 'newMessage', function( msg ){
    newMessage.push( msg );
  });

});