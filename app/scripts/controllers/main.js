'use strict';

angular.module('angularPromisesApp')
  .controller('MainCtrl', function ($scope, $http, $q, $timeout) {


  	$scope.timeout = 500 // timeout in ms for each request


  	$scope.loadData = function() {
  		$scope.result = null

	  	$http.get('/api/ngparis/_all_docs', {
	  			params: {include_docs: true},
	  			timeout: $scope.timeout})
	  			.success(function(result){ // .success = .then(onFulfilled)
	  		$scope.result = result
	  	})
  	}

  	$scope.loadDataWithFailOver = function() {
  		var requestTimeout = $scope.timeout;
  		var retries = 10;

  		var doRequest = function () {
  			var timedOut;

  			/*
  				This deferred will handle the timeout of requests
  				and notify the promise handlers 	
  			 */
  			var tryRequest = $q.defer();


  			/*
  				Timeout + retries of requests is actually processed here
  				with $timeout
  			 */
  			var timeout = $timeout(function(){
  				timedOut = true;
  				if (retries === 0) {
  					tryRequest.resolve('timeout')
  					console.log('timeout abort request');
  				} else {
  					console.log('trying new request')
  					retries--;
  					tryRequest.resolve('timeout')
  					doRequest();
  				}
  			// }, requestTimeout);

  			// Using exponential max timeout latency
  			}, Math.exp(requestTimeout/100));
  			requestTimeout += 50;


  			/*
	  			If the promise of the request is fulfilled or
	  			failed, then cancel the timeout/retries processing
  			 */ 
  			tryRequest.promise.then(undefined, function(){
  				$timeout.cancel(timeout);  				
  			})


  			// The API call using $http
  			$http.get('/api/ngparis/_all_docs', {
  				params: {include_docs: true},
  				timeout: tryRequest.promise // A promise that will abort the request if resolved
  			}).success(function(result){
  				if (timedOut)
  					return;
  				else {
  					console.log('success')
  					tryRequest.reject('request success')
  				}
  			})

  		}

  		doRequest();
  	}

  });
