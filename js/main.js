
var app = angular.module('myApp', []);
var apiKey = 'MDE1NzI0MTYyMDE0MDcxNTIxMTk4OGQ0MQ001',
    nprUrl = 'http://api.npr.org/query?id=61&fields=relatedLink,title,byline,text,audio,image,pullQuote,all&output=JSON';

app.factory('audio', ['$document', function($document) {
  var audio = $document[0].createElement('audio');
  return audio;
}]);

app.factory('player', ['audio', '$rootScope', function(audio, $rootScope) {
  var player = {
    playing: false,
    progress: 0,
    current: null,
    ready: false,
    
    play: function(program) {
      //if we are playing, stop the current playback
      if (player.playing) player.stop();
      var url = program.audio[0].format.mp4.$text; //from the npr API
      player.current = program; // store the current program
      audio.src = url;
      audio.play(); //start playback of the url
      player.playing = true
    },
    
    stop: function() {
      if (player.playing) {
        audio.pause(); //stop playback
        //clear the state of the player
        player.playing = false;
        player.current = null;
      }
    },
    
    currentTime: function() {
      return audio.currentTime;
    },
    
    currentDuration: function() {
      return parseInt(audio.duration);
    }
  };
  
  audio.addEventListener('timeupdate', function(evt) {
  $rootScope.$apply(function() {
    player.progress = player.currentTime();
    player.progress_percent = player.progress / player.currentDuration();
    });
  });
  audio.addEventListener('ended', function() {
    $rootScope.$apply(player.stop());
  });
  
  audio.addEventListener('canplay', function(evt) {
    $rootScope.$apply(function() {
      player.ready = true;
    });
  });
  
  return player;
}]);

app.factory('nprService', ['$http', function($http) {
  var doRequest = function(apikey) {
    return $http({ 
      method: 'JSONP',
      url: nprUrl + '&apiKey=' + apiKey + '&callback=JSON_CALLBACK'
    });
  }
  
  return {
    programs: function(apiKey) {return doRequest(apiKey); }
  };
}]);



app.directive('nprLink', function() {
  return {
    restrict: 'EA',
    require: ['^ngModel'],
    replace: true,
    scope: {
      ngModel: '=',
      player: '='
    },
    templateUrl: 'views/nprListItem.html',
    link: function(scope, ele, attr) {
      scope.duration = scope.ngModel.audio[0].duration.$text;
    }
  }
});

app.directive('playerView', [function() {
  
  return {
    restrict: 'EA',
    require: ['^ngModel'],
    scope: {
      ngModel: '='
    },
    templateUrl: 'views/playerView.html',
    link: function(scope, iElm, iAttrs, controller) {
      scope.$watch('ngModel.current', function(newVal) {
        if (newVal) {
          scope.playing = true;
          scope.title = scope.ngModel.current.title.$text;
          scope.$watch('ngModel.ready', function(newVal) {
            if (newVal) {
              scope.duration = scope.ngModel.currentDuration();
            }
          });
          
          scope.$watch('ngModel.progress', function(newVal) {
            scope.secondsProgress = scope.ngModel.progress;
            scope.percentComplete = scope.ngModel.progress_percent;
          });
        }
      });
      scope.stop = function() {
        scope.ngModel.stop();
        scope.playing = false;
      }
    }
  };
}]);


app.controller('PlayerController', ['$scope', 'nprService', 'player',
  function($scope, nprService, player){
  $scope.player = player;
  nprService.programs(apiKey)
    .success(function(data, status) {
      $scope.programs = data.list.story;
  });
  /* Moved the $http method to the nprService service
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
  
  Moved playing, stopping, and pausing to it's own service
  $scope.playing = false;
  // var audio = document.createElement('audio');
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
  }); */
}]);

app.controller('RelatedController', ['$scope', 'player',
  function($scope, player) {
  $scope.player = player;
    
  $scope.$watch('player.current', function(program){
    if (program){
      $scope.related = [];
      angular.forEach(program.relatedLink, function(link) {
        $scope.related.push({
          link: link.link[0].$text,
          caption: link.caption.$text
        });
      });
    }
  });
}]);

app.controller('FrameController', function($scope) {
});

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

