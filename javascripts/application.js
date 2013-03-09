
var messages,
    source;

var lineTemplate = _.template( "<div class='line'><strong><%= name %></strong>: <%- text %></div>" ),
    typerTemplate = _.template( "<div class='typing'><%= names.join(', ') %> <%= verb %> typing...</div>" );

function addNewMessage( message ){
  html = $( lineTemplate( message ) ).hide();
  html.insertBefore( ".typers" );
  html.slideDown( 300 );
}

function renderTypers( names ){
  verb = names.length > 1 ? "are" : "is";
  html = names.length > 0 ? typerTemplate( { names: names, verb: verb } ) : "";
  $( ".typers" ).html( html );
}

function clearMessageInput(){
  $( ".message" ).val( "" ).focus();
}

function enterPressed( event ){
  return event.keyCode == 13;
}

function getName(){
  return $( ".name" ).val();
}

function initSocket( newMessageSource, typingSource ){
  var messagesBus = new Bacon.Bus();
  var typersBus = new Bacon.Bus();

  var socket = io.connect( "http://localhost:3030" );

  newMessageSource.onValue( function( newMessage ){
    socket.emit( "newMessage", newMessage );
  });

  typingSource.onValue( function( name ){
    socket.emit( "typing", name );
  });

  socket.on( "connect", function(){
    socket.on( "messages", function( newMessage ){
      messagesBus.push( newMessage );
    });

    socket.on( "typers", function( names ){
      typersBus.push( names );
    });
  });

  return {
    messages: messagesBus,
    typers: typersBus
  };
}

$(function(){

  var textInputEvent = $( ".message" ).asEventStream( "keydown" );
  var enterPressedEvent = textInputEvent.filter( enterPressed ).filter( ".target.value" );
  source = enterPressedEvent.map( ".target.value" ).map( function( text ){
    return {
      text: text,
      name: getName()
    };
  });
  var typing = textInputEvent.map( getName );

  pipe = initSocket( source, typing );
  enterPressedEvent.onValue( clearMessageInput );

  pipe.messages.onValue( addNewMessage );
  pipe.typers.onValue( renderTypers );

});