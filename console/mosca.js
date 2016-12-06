var mosca = require('mosca');

// CONSTANTS
var httpPort = 9001;
var ajaxPort = 9002;
var mqttPort = 1883;
var wwwStaticFolder = './www/';

// SHOW CONFIGURATION
console.log("");
console.log("HTTP PORT : " + httpPort);
console.log("MQTT PORT : " + mqttPort);
console.log("WWW DIR.  : " + wwwStaticFolder);
console.log("");

var settings = {
  port: mqttPort,
  http: {
    port:   httpPort,
    bundle: true,
    static: wwwStaticFolder
  }
  //backend: ascoltatore
};

var server = new mosca.Server(settings);

server.on('clientConnected',     function(client) { console.log('client connected', client.id); });
server.on('clientDisconnecting', function(client) { console.log('clientDisconnecting : ', client.id); });
server.on('clientDisconnected',  function(client) { console.log('clientDisconnected : ', client.id); });

server.on('published',    function(packet, client) { console.log('Published', packet.payload); });
server.on('subscribed',   function(topic, client) { console.log('subscribed : ', topic); });
server.on('unsubscribed', function(topic, client) { console.log('unsubscribed : ', topic); });

server.on('ready', setup);

// fired when the mqtt server is ready
function setup() {
  console.log('Mosca server is up and running');
}

//To see for other functions
/*
server.on('ready', setup);

// fired when the mqtt server is ready
function setup() {
  console.log('Mosca server is up and running')
}

// fired whena  client is connected
server.on('clientConnected', function(client) {
  console.log('client connected', client.id);
});

// fired when a message is received
server.on('published', function(packet, client) {
  if (packet.cmd === 'publish') {
    //Qui uso mongo DB 
    console.log('Published: ', packet.payload.toString('utf8'));
  }
});

// fired when a client subscribes to a topic
server.on('subscribed', function(topic, client) {
  console.log('subscribed : ', topic);
});

// fired when a client subscribes to a topic
server.on('unsubscribed', function(topic, client) {
  console.log('unsubscribed : ', topic);
});

// fired when a client is disconnecting
server.on('clientDisconnecting', function(client) {
  console.log('clientDisconnecting : ', client.id);
});

// fired when a client is disconnected
server.on('clientDisconnected', function(client) {
  console.log('clientDisconnected : ', client.id);
});
client.html
*/