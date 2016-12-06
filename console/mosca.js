var mosca = require('mosca');
var http = require("http");
 
// CONSTANTS
var httpPort   = 9001;
var mqttPort   = 1883;
var ajaxPort   = 9002;
var ajaxPollMs = 1000;
var ajaxToMs   = 60000;
var wwwStaticFolder = './www/';

// SHOW CONFIGURATION
console.log("");
console.log("HTTP PORT : " + httpPort);
console.log("AJAX PORT : " + ajaxPort);
console.log("MQTT PORT : " + mqttPort);
console.log("WWW DIR.  : " + wwwStaticFolder);
console.log("");

// MQTT
var settings = {
  port: mqttPort,
  http: {
    port:   httpPort,
    bundle: true,
    static: wwwStaticFolder
  }
};
var server = new mosca.Server(settings);

server.on('clientConnected',     function(client) { console.log('client connected', client.id); });
server.on('clientDisconnecting', function(client) { console.log('clientDisconnecting : ', client.id); });
server.on('clientDisconnected',  function(client) { console.log('clientDisconnected : ', client.id); });
server.on('published',    function(packet, client) { console.log('Published', packet.payload); });
server.on('subscribed',   function(topic, client) { console.log('subscribed : ', topic); });
server.on('unsubscribed', function(topic, client) { console.log('unsubscribed : ', topic); });
server.on('ready', function() { console.log('Mosca server is up and running'); });

// AJAX
http.createServer(function(request, response) {
	var requestDate = new Date();
	checkIOTStatus(request, requestDate, response);
}).listen(ajaxPort);

function checkIOTStatus(request, requestDate, response)
{
	var date = new Date();
	if (date-requestDate >= ajaxToMs) {
		response.writeHead(200, {
			'Content-Type'   : 'text/plain',
			'Access-Control-Allow-Origin' : '*'
		});
		response.write('OK', 'utf8');
		response.end();
		return false;
	}
 
	//TODO: iot logic
 
	setTimeout(function() { checkIOTStatus(request, requestDate, response) }, ajaxPollMs);
}