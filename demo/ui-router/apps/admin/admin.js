angular.module('admin', [])
  .config(angular.module('overmind').control())
  .config(function($stateProvider){
    $stateProvider.state('admin', {
      url: '/admin',
      controller: 'AdminCtrl',
      templateUrl: 'apps/admin/admin.html'
    });
    $stateProvider.state('admin.settings', {
      url: '/settings',
      controller: 'AdminSettingsCtrl',
      templateUrl: 'apps/admin/admin-settings.html'
    });
  })
  .controller('AdminCtrl', function($scope){
    console.log("admin ctrl");
  })
  .controller('AdminSettingsCtrl', function($scope){
    console.log("admin settings ctrl");
    $scope.message = 'update settings';
  });
