//Dependencies
var restify = require('restify');
var builder = require('botbuilder');
var azure = require('botbuilder-azure');
var Client = require('coinbase').Client; //Coinbase dependency
var client = new Client({
  'apiKey': 'HoOPwjQ5gPxmmrCV',
  'apiSecret': 'krqOA9EaKWsk9FErOPVBx6YavAlnpGby',
  'version':'2017-12-02'
}); //coinbase client creation

currencyCode = 'USD'; //currencyCode for Coinbase
var documentDbOptions = {
    host: 'https://trader-db.documents.azure.com:443/',
    masterKey: 'hwRHpNoNREov4xYITQnuyH1T9sMqIcKIIV9uiuIR94YZb25StqTIZkSltHLIMBJNo9yyFgu3ausa51lNmuAWRA==',
    database: 'botdocs',
    collection: 'botdata'
};
var docDbClient = new azure.DocumentDbClient(documentDbOptions);
var cosmosStorage = new azure.AzureBotStorage({ gzipData: false }, docDbClient);
//LUIS URL
var LUIS_MODEL_URL = "https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/6da5d499-5a63-4100-a229-d1d31cc46648?subscription-key=fe1edaedf937418d891e2482759bad8e&verbose=true&timezoneOffset=0";

// Setup Restify Server
var server = restify.createServer();

server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url);
});


// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: "a844a12d-1b82-4da3-8d52-fc2511f41764",
    appPassword: "yotoSBS156+[lezYPFX18:~"
});

//Create LUIS Bot
var bot = new builder.UniversalBot(connector, function (session) {
    session.send('Sorry, I did not understand \'%s\'. Type \'help\' if you need assistance.', session.message.text);
}).set('storage', cosmosStorage);

// Listen for messages from users
server.post('/api/messages', connector.listen());

//Recognizer
var currency = "";
var currencySymbol = "";
var id = "";
var recognizer = new builder.LuisRecognizer(LUIS_MODEL_URL);
bot.recognizer(recognizer);

bot.dialog('getPrice', function(session, args){ //Get Price of certain Cryptocurrency
	var intent = args.intent;
	console.log(args);
	currency = ((builder.EntityRecognizer.findEntity(intent.entities, 'Cryptocurrency')).entity).toLowerCase();
	console.log(currency);
	if(currency == "bitcoin"){currencySymbol = "BTC";}
	else if(currency == "ethereum"){currencySymbol = "ETH";}
	else if(currency == "litecoin"){currencySymbol = "LTC";}
	  client.getBuyPrice({'currencyPair': (currencySymbol + '-' + currencyCode)}, function(err, price) {
	  session.send( "The price of " + currency + " is " +  JSON.stringify(price.data.amount) + " dollars.");
	});
}).triggerAction({ matches: 'getPrice'});


bot.dialog('buyCrypto', function(session, args){//Buy crypto
  //Get Entities
  var intent = args.intent; console.log(intent);
  currency = ((builder.EntityRecognizer.findEntity(intent.entities, 'Cryptocurrency')).entity).toLowerCase();
  quantity = ((builder.EntityRecognizer.findEntity(intent.entities, 'quantity')).entity);
  if(currency == "bitcoin"){currencySymbol = "BTC";	}
  else if(currency == "ethereum"){currencySymbol = "ETH";}
  else if(currency == "litecoin"){currencySymbol = "LTC"; }
  	client.getPaymentMethods(null, function(err, pms) {
	  if (pms[0].verified) {
	  		// client.getAccount('primary', function(err, account) {
	  		// 	account.buy({'amount' : amount, 'currency': currencySymbol}, function(err, buy) {
	  		// 		console.log(buy);
	  		// 	});
	  		// });
	  		console.log("yee boi");
	  }
	  else
	  	session.send("Unable to complete sale due to invalidated payment option!");
	});
}).triggerAction({ matches: 'buyCrypto'});


bot.dialog('sellCrypto', function(session){//Sell Cryto

}).triggerAction({ matches: 'sellCrypto'});
