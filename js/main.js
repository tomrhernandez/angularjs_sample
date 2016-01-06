
var app = angular.module('myApp', []);

app.factory('audio', ['$document', function($document) {
  var audio = $document[0].createElement('audio');
  return audio;
}]);

app.directive('nprLink', function() {
  return {
    restrict: 'EA',
    require: ['^ngModel'],
    replace: true,
    scope: {
      ngModel: '=',
      play: '&'
    },
    templateUrl: '/views/nprListItem.html',
    link: function(scope, ele, attr) {
      scope.duration = scope.ngModel.audio[0].duration.$text;
    }
  }
})
var apiKey = 'MDE1NzI0MTYyMDE0MDcxNTIxMTk4OGQ0MQ001',
    nprUrl = 'http://api.npr.org/query?id=61&fields=relatedLink,title,byline,text,audio,image,pullQuote,all&output=JSON';

app.controller('PlayerController', ['$scope', '$http', function($scope, $http){
  $scope.test = "test hurr";
  $http({
    method: 'JSONP',
    url: nprUrl + '&apiKey=' + apiKey + '&callback=JSON_CALLBACK'
  }).success(function(data, status) {
    // Now we have a list of the stories (data.list.story)
    // in the data object that the NPR API 
    // returns in JSON that looks like:
    // data: { "list": {
    //   "title": ...
    //   "story": [
    //     { "id": ...
    //       "title": ...
    // Store the list of stories on the scope
    // from the NPR API response object (described above)
    $scope.programs = data.list.story;
  }).error(function(data, status) {
    //some error occurred
    });
  
  $scope.playing = false;
  var audio = document.createElement('audio');
  $scope.audio = audio;
  $scope.play = function(program) {
    if ($scope.playing) $scope.audio.pause();
    var url = program.audio[0].format.mp4.$text;
    audio.src = url;
    audio.play();
    $scope.playing = true;
  };
  $scope.stop = function() {
    $scope.audio.pause();
    $scope.playing = false;
  };
  $scope.audio.addEventListener('ended', function(){
    $scope.$apply(function() {
      $scope.stop()
    });
  });
}]);




/* Example Code
app.controller('RelatedController', ['$scope', function($scope){
  
  }]);

app.controller('MyController', function($scope){
  $scope.person = {name: ""};
  var updateClock = function() {
    $scope.clock = new Date();
  };
  var timer = setInterval(function() {
    $scope.$apply(updateClock);
  }, 1000);
  updateClock();
});

app.controller("DemoController", function($scope) {
  $scope.counter = 0;
  $scope.add = function(amount) {
    $scope.counter += amount;
  };
  $scope.subtract = function(amount) {
    $scope.counter -= amount;
  };
})

app.factory('githubService', ['$http', function($http) {
  
    var doRequest = function(username, path) {
      return $http({
        method: 'JSONP',
        url: 'https://api.github.com/users/' + username + '/' + path + '?callback=JSON_CALLBACK'
    });
  }
  return {
    events: function(username) { return doRequest(username, 'events'); },
    setUsername: function(newUsername) { githubusername = newUsername; }
  };
}]);

app.controller('ServiceController', ['$scope', '$timeout', 'githubService', function($scope, $timeout, githubService) {
  var timeout;
  //watch for changes on the username property.
  // If there is a change, run the function.
  $scope.$watch('username', function(newVal) {
    // Uses the $http service to call the GitHub API
    // and returns the resulting promise
    if (newVal){
      if (timeout) $timeout.cancel(timeout);
      timeout = $timeout(function() {
        githubService.events(newVal)
        .success(function(data, status){
          $scope.events = data.data;
        });
      }, 350);
    }
  });
}]);

*/


