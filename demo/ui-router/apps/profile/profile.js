angular.module('profile', [])
  .config(angular.module('overmind').control())
  .config(function($stateProvider){
    $stateProvider.state('profile', {
      url: '/profile',
      controller: 'ProfileCtrl',
      templateUrl: 'apps/profile/profile.html'
    });
  })
  .controller('ProfileCtrl', function($scope){
    console.log("profile ctrl");
  });
