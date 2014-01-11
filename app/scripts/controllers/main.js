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

  		var doRequest = function () {

        requestTimeout += 50;

        // $timeout returns a promise that will be resolved when timeout ends
        // We use Math.exp to economize on number of requests
        var timeout = $timeout(function(){}, Math.exp(requestTimeout/100));


        timeout.then(doRequest); // If the request times out, make a new one

  			// The API call using $http
  			$http.get('/api/ngparis/_all_docs', {
  				params: {include_docs: true},
          // If timeout is reached the request is aborted
          timeout: timeout 
  			}).finally(function(){
          $timeout.cancel(timeout); // If request is successful abort the timeout
        })

  		}

  		doRequest();
  	}

  });
