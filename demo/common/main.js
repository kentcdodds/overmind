(function() {
  require.config({baseUrl: '' });
  require(['../common/apps/nav/nav'], function(){
    // configure overmind
    var overmind = angular.module('overmind');

    overmind.config(function($locationProvider){
      // $locationProvider.html5Mode(true); off for gh-pages
      // but this is where you would do stuff like this.
    });

    overmind.apps = {
      '/profile': {
        ngModule: 'profile',
        file: 'apps/profile/profile'
      },
      '/admin': {
        ngModule: 'admin',
        file: 'apps/admin/admin'
      }
    };
    window.overmind = overmind;

    overmind.default = { ngModule: 'home', file: 'apps/home/home'};

    // bootstrap overmind and any initial app(s)
    angular.bootstrap(document.getElementById('overmind'), ['overmind']);
    angular.bootstrap(document.getElementById('nav'), ['nav']);
  });
})();