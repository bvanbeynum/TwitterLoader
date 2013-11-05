var http = require('http');
var express = require('express');
var webClient = require('request');
var app = express();

var twitter = {};
twitter.tokenBasic = new Buffer('fVsr6j9arIiYeZqPy0m7xg:Yzwtrvgmm1TnJTj4KujYnJvfwLtPyfHX4NVhaDTmJYY').toString('Base64');

app.use(express.static(__dirname));

app.get('/getTwitter', function (request, response) {
	if (request.query.search) {
		if (!twitter.tokenBearer) {
			var webRequest = {
				uri: 'https://api.twitter.com/oauth2/token',
				method: 'POST',
				form: { grant_type: 'client_credentials' },
				headers: { Authorization: 'Basic ' + twitter.tokenBasic }
			};

			webClient(webRequest, function (webError, webResponse, webData) {
				data = JSON.parse(webData);
				twitter.tokenBearer = data.access_token;
				getTwitter(request, response);
			});
		}
		else {
			getTwitter(request, response);
		}
	}
	else {
		response.send(501, 'Invalid Parameters');
	}
});

app.post('/saveTweet', function (request, response) {
	var webData = '';
	request.on('data', function (data) {
		webData += data;
	});
	request.on('end', function () {
		var webRequest = {
			uri: 'http://couchdb.beynum.com:5984/twitter_couchdb/',
			method: 'POST',
			json: JSON.parse(webData)
		};

		webClient(webRequest, function (webError, webResponse, webData) {
			response.send(JSON.stringify(webData));
		});
	});
});

app.get('/test', function (request, response) {
	var webRequest = {
		uri: 'http://localhost:5500/saveTweet',
		method: 'POST',
		json: { test: 'test data', test2: 'test 2 data' }
	};
	webClient(webRequest, function (webError, webResponse, webData) {
		response.send('test complete: ' + webData);
	});
});

app.listen(5500);
console.log('listening on port 5500');

function getTwitter(request, response) {
	var webRequest = {
		uri: 'https://api.twitter.com/1.1/search/tweets.json',
		headers: { Authorization: 'Bearer ' + twitter.tokenBearer },
		qs: {
			q: request.query.search,
			max_id: (request.query.maxid || '')
		}
	};
	webClient(webRequest, function (webError, webResponse, webData) {
		data = JSON.parse(webData);
		console.log('max: ' + data.statuses[data.statuses.length - 1].id_str);
		console.log('query ' + data.search_metadata.query);

		response.send(webData);
	});
}
