## What is that?

It's a compilation of FRP on both client and server sides - **chat example**.
In other words **Socket.IO + Bacon.JS (FRP) + $**

Why? Because I wanted to try reactive stuff. It tastes good.
Lots of things could be smoothly represented with EventStreams (you can do al function stuff on them) and Properties (some kind of accumulators).
I.e. *newMessage* may be an EventStream, when *allMessages* is a Property (Behavior, in few Haskell papers).

You should give FRP a try ;)


### Install

Clone the repo, and then run:
```
$ npm install baconjs
$ npm install socketio
$ npm install underscore
```
*I'd add deps in a package later*

### Running

```
$ ./bin/server
$ ./bin/socketio
```

You may also need to change ips/urls in index.html, application.js
