
var currentValue,
    ticker,
    socketEvents,
    raiseValue;


var snd = function( a, b ){ return b; };

var initSocket = function(ticker){
  var bus = new Bacon.Bus();

  var socket = io.connect( "http://localhost:3030" );

  ticker.onValue( function(value){
    socket.send(value);
  });

  socket.on( "connect", function(){
    socket.on( "message", function( value ){
      bus.push( value );
    });
  });
  return bus;
};


var displayCurrentValue = function( value ){
  $( "#valueHolder" ).html( value );
};


$(function(){

  raiseValue = $( "input" ).asEventStream( "change" ).map(".target").map(".value").scan( 1, snd );

  // Little ticker, he'll signal that something's happening
  ticker = raiseValue.sample( 1000 );

  socketEvents = initSocket( ticker );
  currentValue = socketEvents.scan( 0, snd );


  currentValue.onValue( displayCurrentValue );
  
});