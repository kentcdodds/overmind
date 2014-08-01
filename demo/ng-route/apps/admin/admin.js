angular.module('admin', ['ngRoute'])
  .config(angular.module('overmind').control())
  .config(function($routeProvider){
    $routeProvider.when('/admin', {controller: 'AdminCtrl', templateUrl: '../common/apps/admin/admin.html'})
    $routeProvider.when('/admin/settings', {controller: 'AdminSettingsCtrl', templateUrl: '../common/apps/admin/admin-settings.html'})
  })
  .controller('AdminCtrl', function($scope){
    console.log("admin ctrl");
  })
  .controller('AdminSettingsCtrl', function($scope){
    console.log("admin settings ctrl");
    $scope.message = 'update settings';
  })
