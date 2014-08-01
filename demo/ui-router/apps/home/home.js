angular.module('home', [])
  .config(angular.module('overmind').control())
  .config(function($stateProvider){
    $stateProvider.state('home', {
      url: '/',
      controller: 'HomeCtrl',
      templateUrl: 'apps/home/home.html'
    });
  })
  .controller('HomeCtrl', function($scope){
    console.log('home ctrl');
  });
