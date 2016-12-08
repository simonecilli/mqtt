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

// NODE 
var iotNewDataFlag = true;
var iotNodes = {};
function IOTNode (id) {
	this.id        = id;
	this.state     = "?";
	this.topics    = [];
	this.publishN  = 0;
	this.lastTms   = 0;
	this.connect = function() {
		this.state   = "connected";
		this.lastTms = new Date().getTime();
		iotNewDataFlag = true;
	};
	this.disconnect = function() {
		this.state   = "disconnected";
		this.topics  = [];
		this.lastTms = new Date().getTime();
		iotNewDataFlag = true;
	};
	this.subscribe = function(topic) {
		if (!this.topics.contains(topic))
			this.topics.push(topic);
		this.lastTms = new Date().getTime();
		iotNewDataFlag = true;
	};
	this.unsubscribe = function(topic) {		
		if (this.topics.contains(topic))
			this.topics.remove(topic);
		this.lastTms = new Date().getTime();
		iotNewDataFlag = true;
	};
	this.publish = function(packet) {
		this.lastTms = new Date().getTime();
		if (this.id != packet.payload)
			this.publishN++
	};
	this.serialize = function() {
		var str =
			'{ "id": "'    + this.id       + '",' +
			'"state":"'    + this.state    + '",' +
			'"publishN":"' + this.publishN + '",' +
			'"lastTms":"'  + this.lastTms  + '",' +
			'"topics": [';
		for (var i = 0; i < this.topics.length; i++) {
			str += '"' + this.topics[i] + '"';
			if (i != (this.topics.length-1))
				str += ",";
		}
		str += ']}';
		return str;
	};
}
function serializeIOTNodes(){
	var str = "[";
	for (var key in iotNodes) str += iotNodes[key].serialize() + ',';
	if (str[str.length-1] == ',') str = str.slice(0, -1);
	str += "]";
	return str;
}
Array.prototype.contains = function(obj) {
	var i = this.length;
	while (i--) {
		if (this[i] == obj) return true;
	}
	return false;
}
Array.prototype.remove = function(obj) {
	var index = this.indexOf(obj);
	if (index > -1) this.splice(index, 1);
}

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

// MQTT CALLBACK
server.on('clientConnected', function(client) {
	var node = iotNodes[client.id];
	if (node == undefined) node = new IOTNode(client.id);
	node.connect();
	iotNodes[client.id] = node;
	console.log('Client ' + client.id + ' connected');
});
server.on('clientDisconnected',  function(client) {
	var node = iotNodes[client.id]; 
	if (node == undefined) node = new IOTNode(client.id);
	node.disconnect();
	iotNodes[client.id] = node;
	console.log('Client ' + client.id + ' disconnected');
});
server.on('clientDisconnecting', function(client) {
	console.log('Client ' + client.id + ' disconnecting');
});
server.on('subscribed', function(topic, client) {
	var node = iotNodes[client.id];
	if (node == undefined) node = new IOTNode(client.id);
	node.subscribe(topic);
	iotNodes[client.id] = node;
	console.log('Client ' + client.id + ' subscribe ' + topic);
});
server.on('unsubscribed', function(topic, client) {
	var node = iotNodes[client.id];
	if (node == undefined) node = new IOTNode(client.id);
	node.unsubscribe(topic);
	iotNodes[client.id] = node
	console.log('Client ' + client.id + ' unsubscribe ' + topic);
});
server.on('published', function(packet, client) {
	//var node = iotNodes[client.id];
	//if (node == undefined) node = new IOTNode(client.id);
	//node.publish(packet);
	//console.log('Client ' + client.id + ' publish ' + packet.payload);
});
server.on('ready', function() { console.log('Mosca server is up and running'); });

// AJAX
http.createServer(function(request, response) {
	var requestT = new Date().getTime();
	checkIOTStatus(request, requestT, response);
}).listen(ajaxPort);

function checkIOTStatus(request, requestT, response)
{
	var date = new Date().getTime();
	if (date-requestT >= ajaxToMs) {
		response.writeHead(200, {
			'Content-Type'   : 'text/plain',
			'Access-Control-Allow-Origin' : '*'
		});
		response.write(serializeIOTNodes(), 'utf8');
		response.end();
		return false;
	}
	// New data to send
	if (iotNewDataFlag)
	{
		iotNewDataFlag = false;
		response.writeHead(200, {
			'Content-Type'   : 'text/plain',
			'Access-Control-Allow-Origin' : '*'
		});
		response.write(serializeIOTNodes(), 'utf8');
		response.end();
		return false;
	}
	setTimeout(function() { checkIOTStatus(request, requestT, response) }, ajaxPollMs);
}
