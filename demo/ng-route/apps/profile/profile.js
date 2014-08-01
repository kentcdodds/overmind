angular.module('profile', ['ngRoute'])
  .config(angular.module('overmind').control())
  .config(function($routeProvider){
    $routeProvider.when('/profile', {controller: 'ProfileCtrl', templateUrl: '../common/apps/profile/profile.html'})
  })
  .controller('ProfileCtrl', function($scope){
    console.log("profile ctrl");
  })
