var mosca = require('mosca');

// VARIABLES
var numOfConnectedCli = 0;

// CONSTANTS
var httpPort = 9001;
var mqttPort = 1883;
var wwwStaticFolder = './www/';

// SHOW CONFIGURATION
console.log("");
console.log("HTTP PORT : " + httpPort);
console.log("MQTT PORT : " + mqttPort);
console.log("WWW DIR.  : " + wwwStaticFolder);
console.log("");

// MOSCA SERVER SETTINGS
var settings = {
  port: mqttPort,
  http: {
    port: httpPort,
    bundle: true,
    static: wwwStaticFolder
  }
};

var server = new mosca.Server(settings);

server.on('ready', setup);

// fired when the mqtt server is ready
function setup() {
	  console.log('Mosca server is up and running ...');

	// fired when a client is connected
	server.on('clientConnected', function(client) {
		numOfConnectedCli ++;
		console.log('Client connected - Client Id: ', client.id);
		console.log('Number of connected clients: ', numOfConnectedCli);
	});

	// fired when a message is received
	server.on('published', function(packet, client) {
	  console.log('Published: ', packet);
	});

	// fired when a client subscribes to a topic
	server.on('subscribed', function(topic, client) {
	  console.log('Client Id: ', client.id);
	  console.log('Subscribed - Topic: ', topic);
	});

	// fired when a client subscribes to a topic
	server.on('unsubscribed', function(topic, client) {
	  console.log('Client Id: ', client.id);
	  console.log('Unsubscribed - Topic: ', topic);
	});

	// fired when a client is disconnecting
	server.on('clientDisconnecting', function(client) {
	  console.log('Client Disconnecting - Client Id: ', client.id);
	});

	// fired when a client is disconnected
	server.on('clientDisconnected', function(client) {
	  numOfConnectedCli --;
	  console.log('Client Disconnected - Client Id: ', client.id);
	  console.log('Number of connected clients: ', numOfConnectedCli);
	});
}
