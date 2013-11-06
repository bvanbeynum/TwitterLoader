var loaderApp = angular.module('loaderApp', []);

loaderApp.controller('LoaderControl', function LoaderControl($scope, $http) {
	$scope.testing = 'test';
	$scope.resultsVisible = false;
	$scope.results = 'nothing yet';
	$scope.twitterData = {};
	$scope.tweets = [];
	$scope.consoleOutput = '';

	$scope.doSearch = function () {
		if ($scope.searchText && $scope.searchText.length > 0) {
			$http.get('/getTwitter?search=' + escape($scope.searchText)).success(function (data) {
				console.log('data complete');
				$scope.consoleOutput = 'data complete<br/>' + $scope.consoleOutput;
				$scope.twitterData = data;
				$scope.resultsVisible = true;

				$scope.tweets = [];
				for (var tweetIndex = 0; tweetIndex < data.statuses.length; tweetIndex++) {
					$scope.tweets.push({
						id: data.statuses[tweetIndex].id_str,
						text: data.statuses[tweetIndex].text,
						status: 'unsaved',
						data: data.statuses[tweetIndex]
					});
				}
			});
		}
		else {
			console.log('no text entered');
			alert('You must first enter text');
		}
	};

	$scope.doNext = function () {
		if ($scope.twitterData.statuses) {
			console.log($scope.twitterData.statuses[$scope.twitterData.statuses.length - 1].id_str);
			$http.get('/getTwitter?search=' + escape($scope.searchText) + '&maxid=' + $scope.twitterData.statuses[$scope.twitterData.statuses.length - 1].id_str).success(function (data) {
				console.log('next complete');
				$scope.consoleOutput = 'next complete<br/>' + $scope.consoleOutput;
				$scope.twitterData = data;
				$scope.resultsVisible = true;

				$scope.tweets = [];
				for (var tweetIndex = 0; tweetIndex < data.statuses.length; tweetIndex++) {
					$scope.tweets.push({
						id: data.statuses[tweetIndex].id_str,
						text: data.statuses[tweetIndex].text,
						status: 'unsaved',
						data: data.statuses[tweetIndex]
					});
				}
			});
		}
		else {
			console.log('data not available');
			alert('You must first do a search');
		}
	};

	$scope.doSave = function () {
		if ($scope.tweets && $scope.tweets.length > 0) {
			for (var tweetIndex = 0; tweetIndex < $scope.tweets.length; tweetIndex++) {
				$http.post('/saveTweet', $scope.tweets[tweetIndex].data).success(function (data) {
					console.log(JSON.stringify(data));
					$scope.consoleOutput = JSON.stringify(data) + '<br/>' + $scope.consoleOutput;
				});
			}
		}
		else {
			console.log('data not available');
			alert('You must first do a search');
		}
	};
});