var io = require('socket.io-client');
var request = require('request');
var MessagePack = require('msgpack-lite');

//this should be an env or better yet call to Paramater Store
var socket = io.connect('https://message.customhousesystems.com:8889', { path: '/message' });
//var socket = io.connect('http://localhost:8889', { path: '/client' });
//var socket = io.connect('http://192.168.0.22:8889', { path: '/message' });
var messageCount = 0;
var currentId = 0

socket.on('connect', function(){
	console.log("Connected");
});

socket.on('disconnect', function(){
	console.log("disconnect");
	process.exit();
});

socket.on('message', function(message){

	var serverData = MessagePack.decode(message);

	if(serverData.id != currentId){
		currentId = serverData.id;
		console.log("******* New Message *******");
		console.log("GOT AN ENCODED MESSAGE: " + JSON.stringify(message));
		console.log("Message size in bytes: " + message.length);
		console.log("Message id: " + serverData.id);
		console.log("DESERIALIZED OBJECT: " + JSON.stringify(serverData) + "\n\n");
		messageCount += 1;
	}
});
