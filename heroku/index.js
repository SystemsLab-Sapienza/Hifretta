var request = require('request');
var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var XMLHttpRequest = require('xhr2');

/*
Static Variables
*/
var staticVar = require('./static_var.js');
var DEV_KEY = staticVar.DEV_KEY;
var helplist = staticVar.helplist;
var benvenuto = staticVar.benvenuto;
var hellomessage = staticVar.hellomessage;
var helpPalina = staticVar.helpPalina;
var helpLoc = staticVar.helpLoc;
var helpLinea = staticVar.helpLinea;
var access_token = staticVar.access_token;
var errorMessage = staticVar.errorMessage;
var hellolist = staticVar.hellolist;

/*
Static images URL
 */
var gif_cat_URL = staticVar.cat_gif_URL;
var logo_atac_URL = staticVar.logo_atac_URL;
var posizione_gif_URL = staticVar.posizione_gif_URL;
var id_palina_URL = staticVar.id_palina_URL;
var bus_example_URL = staticVar.bus_example_URL;



var app = express();
app.set('case sensitive routing', true);
app.set('port', (process.env.PORT || 5000));
app.listen(app.get('port'));
app.use(bodyParser.json())

var httpServer = http.createServer(app);

app.get('/', function (req, res, next) {
  res.send('Welcome to HiFretta! Roma Bus');
	console.log('devkey' + DEV_KEY);
});

app.get('/webhook/', handleVerify);
app.post('/webhook/', receiveMessage);

function handleVerify(req, res, next){
	if (req.query['hub.verify_token'] === 'token') {
    return res.send(req.query['hub.challenge']);
  }
  res.send('Validation failed, Verify token mismatch');
}

function isASCII(str) {
    return /^[\x00-\x7F]*$/.test(str);
}

//Main handler for incoming requests
function receiveMessage(req, res, next){
	var message_instances = req.body.entry[0].messaging;
	message_instances.forEach(function(instance){
		console.log('%j', instance);
		var sender = instance.sender.id;
		console.log('MESSAGGIO RICEVUTO: %j', instance.message);
		
		//case of String recived
		if(instance.message && instance.message.text) {

			var msg_text = instance.message.text.toLowerCase();
			//if the incoming message is in helplist (User asking for help)
			if (helplist.indexOf(msg_text) > -1) {
				console.log('RICEVUTO MESSAGGIO DI HELP');
				console.log('lunghezza benvenuto '+benvenuto.length);

			var payload = { 
							"recipient":{
							"id":sender
							},
							"message":{
								 "attachment":{
							     "type":"template",
							     "payload":{
							    	  	"template_type":"button",
							       		"text":benvenuto,
							        	"buttons":[
							          	{
							          		"type":"postback",
							          		"title":"La tua posizione",
							          		"payload":"esempio-posizione"
							          	},
							          	{
							            	"type":"postback",
							            	"title":"Un codice fermata",
							            	"payload": "esempio-palina"
							          	},
							          	{
							          	  	"type":"postback",
							            	"title":"Una linea autobus",
							            	"payload": "esempio-auto"
							          	}
							        	]	
							      	}
							    }
							}

				}
				sendPayload(sender, payload);
			}

			//if it's a message of greetings
			else if(hellolist.indexOf(msg_text) > -1){
				console.log('DENTRO HELLO, stampa id '+sender);
				getNameFromId(sender);
				}
			//easter egg
			else if(msg_text=='gif'){
				sendImage(sender, gif_cat_URL);
			}

			//print credits
			else if(msg_text=='credits' || msg_text == 'credit'){
				sendMessage(sender, 'Eugenio Nerio Nemmi\nSimone Ferretti\nMassimo La Morgia\nDaniele Mattiacci', true);
			}

			//
			else{
				//if the message is ASCII
				if(isASCII(msg_text)){
					callAtac(msg_text, sender);
				}
				//otherwise we consider the message an Emoji
				else
				{
					console.log('EMOJI RICEVUTA');
					sendMessage(sender, errorMessage, true);
				}
			}
		}

		//postback for sent buttons
		else if(instance.postback){
			console.log('PREMUTO UN BOTTONE');
			console.log('payload = %j', instance.postback);
			var payload = instance.postback.payload;
			var element = payload.split("-");

			//all possible cases of buttons' actions
			if (element[0] == 'fermata') {
				sendMessage(sender, 'Inserisci il numero della fermata di cui vuoi avere informazioni', true);
			}
			else if(element[0] == 'linea'){
				sendMessage(sender, 'Inserisci il numero della linea di cui vuoi avere informazioni', true);
			}
			else if(element[0] == 'capolinea'){
				callAtac(element, sender);
			}
			else if(element[0] == 'idPalina'){
				callAtac(element[1], sender);
			}
			else if(element[0] == 'esempio'){
				if(element[1] == 'palina'){
					sendImage(sender, id_palina_URL);
					sendMessage(sender, helpPalina, true);
				}
				else if(element[1] == 'posizione'){
					sendImage(sender, posizione_gif_URL);
					sendMessage(sender, helpLoc, true);
				}
				else if(element[1] == 'auto'){
					sendImage(sender, bus_example_URL);
					sendMessage(sender, helpLinea, true);
				}
				
			}
			else if(element[0] == 'tempi_attesa'){
				console.log('DENTRO TEMPI ATTESA DI POSTBACK');
				callAtac(element[1], sender);
				}
		}

		//if the recived message contains coordinates
		else if (instance.message && instance.message.hasOwnProperty("attachments") && instance.message.attachments[0].type == "location"){
			console.log('RICEVUTA UNA POSIZIONE');
			lat = instance.message.attachments[0].payload.coordinates.lat;
			long = instance.message.attachments[0].payload.coordinates.long;
			
			xmlhttp = new XMLHttpRequest();
			xmlhttp.onreadystatechange = function(){
				if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
					var json = JSON.parse(xmlhttp.responseText);
					var result = 'via,' + json.results[0].formatted_address;
					var msg = result.split(",");
					callAtac(msg, sender);
				}
			}
			url = "http://maps.googleapis.com/maps/api/geocode/json?latlng=" + lat + "," + long;
			xmlhttp.open("GET", url, true);
			xmlhttp.send();			
		}

		//other cases are not handled yet
		else if(instance.message && (instance.message.sticker_id || 
				 instance.message.attachments[0].type == "audio" || 
				 instance.message.attachments[0].type == "image")){
			console.log('RICEVUTO AUDIO O IMMAGINE');
			console.log('MESSAGGIO %j', instance.message.attachments[0])
			sendMessage(sender, errorMessage, true);
		}
	});
  res.sendStatus(200);
}

//functions to get the sender's name from id
function getNameFromId(id){
	console.log('DENTRO getNameFromId');		
	request({
    url: 'https://graph.facebook.com/'+id,
    method: 'GET',
    qs: {
    	access_token: access_token
    }
  }, function (error, response) {
  	if(error) console.log('Error sending message: ', error);
  	if(response.body.error) console.log('Error: ', response.body.error);
  	var risposta = response["body"];
  	var separatore = '\"' + '\\'
;  	var arrayRisp = risposta.split(separatore);
  	jsonRisp = JSON.parse(arrayRisp);
	console.log(jsonRisp["first_name"]);
  	var name = jsonRisp["first_name"];
  });
  	sendMessage(id, 'Ciao '+ name + hellomessage, true);
}

//sendPayload
function sendPayload(receiver ,payload){   	
	console.log('DENTRO PAYLOAD');		
	request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    method: 'POST',
    qs: {
    	access_token: access_token
    },
    json: payload
  }, function (error, response) {
  	if(error) console.log('Error sending message: ', error);
  	if(response.body.error) console.log('Error: ', response.body.error);
  });
}

//sendImage
function sendImage(receiver, url){
	var payload = { 
  				"recipient":{
    			"id":receiver
  				},
  				"message":{
    			"attachment":{
    				"type": "image",
    				"payload": {
    					"url": url
    				} 
    			}
				}
			}
	request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    method: 'POST',
    qs: {
    	access_token: access_token
    },
    json: payload
  }, function (error, response) {
  	if(error) console.log('Error sending message: ', error);
  	if(response.body.error) console.log('Error: ', response.body.error);
  });
}

//sendMessage to the user
function sendMessage(receiver, data, isText){
	var payload = {};
	payload = data;
		if(isText) {
			payload = {
				text: data
			}

		request({
	    url: 'https://graph.facebook.com/v2.6/me/messages',
	    method: 'POST',
	    qs: {
	    	access_token: access_token
	    },
	    json: {
	      recipient: {id: receiver},
	      message: payload
	    }
	  }, function (error, response) {
	  	if(error) console.log('Error sending message: ', error);
	  	if(response.body.error) console.log('Error: ', response.body.error);
	  });
	}
}


//Atac API for waiting time given stop's id number
function callAtac(msg, sender){
	var xmlrpc = require('./lib/xmlrpc.js')
	var token = xmlrpc.createClient('http://muovi.roma.it/ws/xml/autenticazione/1')
	var autenticazione
	console.log('MESSAGGIO ARRIVATO A CALLATAC ' + msg);
	token.methodCall('autenticazione.Accedi', [DEV_KEY, ''],
		function(error, value){console.log('AUTENTICAZIONE: ' + value),
			autenticazione = value;
			getAnswer(msg, autenticazione, sender);
			})
}

//parse API return message and construct the payload for the answer
function getAnswer(msg, autenticazione, sender){
	var xmlrpc = require('./lib/xmlrpc.js')
	var client = xmlrpc.createClient('http://muovi.roma.it/ws/xml/paline/7')
	var risposta

	if (Object.prototype.toString.call(msg) === '[object String]' && (!isNaN(parseInt(msg))) && msg.length == 5) {
		client.methodCall('paline.Previsioni',
			[autenticazione, parseInt(msg), ''],
			function(error, value){
				if (!error) {
					risposta = value;
				 	var arrivi = risposta["risposta"]["arrivi"];
				 	var primalinea ='Fermata ' + risposta["risposta"]["nome"] + ' situata in ' + risposta["risposta"]["collocazione"] + '\n';
				 	var nuovo_auto = '';
				 	for(bus in arrivi){
				 		if(arrivi[bus]["nessun_autobus"]){
				 			sendMessage(sender, "Nessun autobus in arrivo", true);
				 		}
				 		else if(arrivi[bus]["non_monitorata"]){
				 			sendMessage(sender, "Questa fermata non è monitorata", true);
				 		}
				 		else{
					 		if(arrivi[bus]["a_capolinea"]){
					 			nuovo_auto = '🚌 ' + arrivi[bus]["linea"] + ' a capolinea (partenza prevista ' + arrivi[bus]["partenza"] + ')';
					 		}
					 		else if(arrivi[bus]["in_arrivo"]){
								nuovo_auto = '🚌 ' + arrivi[bus]["linea"] + ' in arrivo';
							}
							else if(arrivi[bus]["tempo_attesa"] == 1){
								nuovo_auto = '🚌 ' + arrivi[bus]["linea"] + ' tra ' + arrivi[bus]["tempo_attesa"] + ' minuto (' + arrivi[bus]["distanza_fermate"] + ' fermata)';
							}
							else{
								nuovo_auto = '🚌 ' + arrivi[bus]["linea"] + ' tra ' + arrivi[bus]["tempo_attesa"] + ' minuti (' + arrivi[bus]["distanza_fermate"] + ' fermate)';
							}
							console.log('aria condizionata: '+ arrivi[bus]["aria"]);
							if(arrivi[bus]["aria"]){
								nuovo_auto = nuovo_auto + '✳';
							}
							nuovo_auto = nuovo_auto + '\n';
						}
						if((primalinea+nuovo_auto).length > 319){
					 		sendMessage(sender, primalinea, true);
					 		primalinea = '';
					 	}else {
					 		primalinea = primalinea + nuovo_auto;
					 	}

					}
				}else{
				 	primalinea = 'Si è verificato un errore di comunicazione, verificare che sia stato inserito un codice della fermata esistente';
				}
			 	sendMessage(sender, primalinea, true);})
	}
		else if(msg[0] == 'capolinea') {

		client.methodCall('paline.Percorsi', [autenticazione, msg[1], ''],
		function(error, value){
			risposta = value["risposta"];

			for(cap in risposta["percorsi"])
			{
				if(risposta["percorsi"][cap]["capolinea"] == msg[2])
				{
					client.methodCall('paline.Percorso',
			 		[autenticazione, risposta["percorsi"][cap]["id_percorso"], '', '', ''],
			 		function(error, value){
			 			risposta = value;
			 			var listFermate = risposta["risposta"]["fermate"];
			 			var percorso = '';
			 			var delay = 100;
			 			for (var i = 0; i<listFermate.length; i++){
			 				percorso = listFermate[i]["nome"];
			 				sendOrderMessages(sender, percorso, i);
			 			}
			 		}
			 		)
				}
			}
		})
	}

	else if(msg[0] == 'via'){
		var civico = msg[2];
		if(msg[2].indexOf("-") >-1 ){
			civico = msg[2].split("-");
			civico = civico[0]
		}

		var msgStreet = msg[1] + civico;
		client.methodCall('paline.SmartSearch', [autenticazione, msgStreet],
		function(error, value){
			risposta = value;
			console.log('%j', risposta);

		var payload = {
				 "recipient":{
				   "id":sender
				  },
				  "message":{
				    "attachment":{
				      "type":"template",
				      "payload":{
				        "template_type":"generic",
				        "elements":[
				      ]
				      }
				    }
				  }
				}

		for (i in risposta.risposta.paline_extra){
			if(i<9){
				var palinaVicina = risposta.risposta.paline_extra[i].id_palina;
				var nomePalinaVicina = risposta.risposta.paline_extra[i].nome;
				var lineeInfo = '';
				var subtitle = 'ciao';

				for (j in risposta.risposta.paline_extra[i].linee_info){
					lineeInfo = lineeInfo + ' ' + risposta.risposta.paline_extra[i].linee_info[j].id_linea + '(' + risposta.risposta.paline_extra[i].linee_info[j].direzione + ')';
				}
				var element = {
				        	"title":nomePalinaVicina + " (" + palinaVicina + ")",
				        	"subtitle": lineeInfo,
				        	"buttons":[
				        			{
										"type":"postback",
										"title": "Tempi d'attesa",
										"payload": "idPalina-" + palinaVicina
									}
				        		]
							}
				payload.message.attachment.payload.elements.push(element);

			}

		}
				console.log("%j", payload);
	request({
    	url: 'https://graph.facebook.com/v2.6/me/messages',
    	method: 'POST',
    	qs: {
    		access_token: access_token
    	},
    	json: payload
  	},  function (error, response) {
  		if(error) console.log('Error sending message: ', error);
  		if(response.body.error) console.log('Error: ', response.body.error);
  	});

 	})


	}
	else{
		client.methodCall('paline.Percorsi',
			[autenticazione, msg, ''],
			function(error, value){
				if(!error){
					risposta = value;
				 	var linea = risposta["risposta"]["percorsi"];
				 	client.methodCall('paline.Percorso',
				 		[autenticazione, linea[0]["id_percorso"], msg, '', ''],
				 		function(error, value){
				 			risposta = value;
				 			var listFermate = risposta["risposta"]["fermate"];
				 			var percorso = '';
				 			var delay = 100;
				 			var capolineas = []
				 			for(cap in linea){
				 				capolineas.push(linea[cap]["capolinea"]);
				 			}
				 			sendBubblesCap(sender,msg,capolineas);
				 		}
				 	)
				}else{
					sendMessage(sender, errorMessage, true);				}
			})
	}
}

//force messages to be sent in order (delay time)
function sendOrderMessages(sender, percorso, i){
console.log('DENTRO SENDORDERMESSAGES');
setTimeout(function(){
sendMessage(sender, percorso, true);}, i*100);}

function sendButtonCap(receiver, msg, capolinea){

	var payload = { 
  "recipient":{
    "id":receiver
  },
  "message":{
    "attachment":{
      "type":"template",
      "payload":{
        "template_type":"generic",
        "elements":[
        
      ]
      }
    }
  }
}
var i = -1;


	if(capolinea < 4){
		payload.message.attachment.payload.elements.push(element);

		for(cap in capolinea){
		var button = {
			"type":"postback",
			"title":capolinea[cap],
			"payload": "capolinea-" + msg + "-" + capolinea[cap]

	}
	payload.message.attachment.payload.elements[0].buttons.push(button);
	}
}else{
	console.log('la linea ha più di 4 capolinea');
	payload.message.attachment.payload.elements.push(element);
	for(cap in capolinea){
		var button = {
		"type":"postback",
		"title":capolinea[cap],
		"payload": "capolinea-" + msg + "-" + capolinea[cap]
	}
		if(cap > (capolinea.length/2)){
			console.log('cap è maggiore della metà dei capolinea');
			payload.message.attachment.payload.elements.push(element);
			i = i+1;
			payload.message.attachment.payload.elements[i].buttons.push(button);	
		}else{
			payload.message.attachment.payload.elements[i].buttons.push(button);
		}
}
}
request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    method: 'POST',
    qs: { 
    	access_token: access_token
    },
    json: payload
  }, function (error, response) {
  	if(error) console.log('Error sending message: ', error);
  	if(response.body.error) console.log('Error: ', response.body.error);
  });

}

//bubbles for terminal choose
function sendBubblesCap(receiver, msg, capolinea){

	console.log('DENTRO SENDBUBBLECAP');

	console.log('numero capolinea: ' + capolinea.length);

	var payload = { 
  "recipient":{
    "id":receiver
  },
  "message":{
    "attachment":{
      "type":"template",
      "payload":{
        "template_type":"generic",
        "elements":[
        
      ]
      }
    }
  }
}
var i = -1;

for(cap in capolinea){
	var button = {
		"type":"postback",
		"title":capolinea[cap],
		"payload": "capolinea-" + msg + "-" + capolinea[cap]

	}
		if(cap%2==0 ){
			var element = {
        	"title":msg,
        	"image_url": logo_atac_URL,
        	"buttons":[

        		]
			};
			payload.message.attachment.payload.elements.push(element);
			i = i+1;
			payload.message.attachment.payload.elements[i].buttons.push(button);
		}else{
			payload.message.attachment.payload.elements[i].buttons.push(button);
		}
}

request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    method: 'POST',
    qs: {
    	access_token: access_token
    },
    json: payload
  }, function (error, response) {
  	if(error) console.log('Error sending message: ', error);
  	if(response.body.error) console.log('Error: ', response.body.error);
  });}
