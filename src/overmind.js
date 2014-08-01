/**
 * Overmind
 * Copyright 2014 Dave Geddes @geddski
 * Version 0.2.0
 */

(function () {

  var routers = {
    ui: {
      $routeProvider: '$urlRouterProvider',
      $route: '$state',
      moduleName: 'ui.router',
      $routeParams: '$stateParams',
      $routeChangeSuccess: '$stateChangeSuccess'
    },
    ng: {
      $routeProvider: '$routeProvider',
      $route: '$route',
      moduleName: 'ngRoute',
      $routeParams: '$routeParams',
      $routeChangeSuccess: '$routeChangeSuccess'
    }
  };

  var routerName = 'ui';

  try {
    angular.module(routers[routerName].moduleName);
  } catch (e) {
    // ui router not created, default to ngRoute
    routerName = 'ng';
  }
  var routeModule = routers[routerName];

  var overmind = angular.module('overmind', [routeModule.moduleName]);
  overmind.shared = {};
  var isUi = routerName === 'ui';

  overmind.config([routeModule.$routeProvider, function ($routeProvider) {
    if (!isUi) {
      $routeProvider.otherwise({});
    }

    // share the $routeProvider (or $stateProvider) with all the other apps
    overmind.shared[routeModule.$routeProvider] = $routeProvider;
  }]);

  overmind.run([ '$rootScope', '$location', routeModule.$route, '$templateCache', routeModule.$routeParams, '$browser', '$rootElement',
    function ($rootScope, $location, $route, $templateCache, $routeParams, $browser, $rootElement) {
      decorate($location, 'url');
      decorate($location, 'replace');
      decorate($location, 'path');
      decorate($location, 'search');
      decorate($location, 'hash');

      // patch a service to update overmind's scope when called
      function decorate(service, method) {
        var original = service[method];
        service[method] = function () {
          // apply scope for setters
          if (arguments.length > 0) {
            setTimeout(function () {
              $rootScope.$apply();
            });
          }
          return original.apply(service, arguments);
        }
      }

      // make routing components available to other apps
      var shared = overmind.shared;
      shared[routeModule.$route] = $route;
      shared[routeModule.$routeParams] = $routeParams;
      shared.$location = $location;
      shared.$templateCache = $templateCache;
      shared.$browser = $browser;
      shared.overmindScope = $rootScope;

      // listen for clicks on the root like $location does, but do it for the body so it will apply to all apps
      angular.element(document.body).on('click', function (event) {
        if (event.ctrlKey || event.metaKey || event.which == 2) return;

        var elm = angular.element(event.target);

        // traverse the DOM up to find first A tag
        while ((elm[0].nodeName).toLowerCase() !== 'a') {
          // ignore rewriting if no A tag (reached root element, or no parent - removed from document)
          if (elm[0] === $rootElement[0] || !(elm = elm.parent())[0]) return;
        }

        var absHref = elm.prop('href');

        var rewrittenUrl = $location.$$rewrite(absHref);

        if (absHref && !elm.attr('target') && rewrittenUrl && !event.isDefaultPrevented()) {
          event.preventDefault();
          if (rewrittenUrl != $browser.url()) {
            // update location manually
            $location.$$parse(rewrittenUrl);
            $rootScope.$apply();
            // hack to work around FF6 bug 684208 when scenario runner clicks on links
            window.angular['ff-684208-preventDefault'] = true;
            if (isUi) {
              $route.reload();
            }
          }
        }
      });
    }]);

  // allow shared resources.
  // these will be provided to apps controlled by the overmind
  angular.module('overmind').share = function (shared) {
    angular.forEach(shared, function (val, key) {
      overmind.shared[key] = val;
    });
  };

  // Surrender your will to the overmind.
  // Configures other applications to use routeProvider etc from overmind
  angular.module('overmind').control = function () {

    return ['$provide', function ($provide) {
      var shared = overmind.shared;
      if (!shared) return;
      angular.forEach(overmind.shared, function (val, key) {
        $provide.constant(key, val);
      });
    }]
  };


  // overmind directive, replaces ng-view
  angular.module('overmind').directive('overmind', ['$rootScope', '$location', routeModule.$route, function ($rootScope, $location, $route) {
    return {
      restrict: 'E',
      link: function (scope) {
        var currentlyBootstrapped;
        var currentViewScope;

        $rootScope.$on(routeModule.$routeChangeSuccess, function () {
          var app = getCurrentMatchingApp();

          // if the app is registered and is different from the current app, bootstrap it
          if (app && app !== currentlyBootstrapped) {
            cleanupApp();
            bootstrap(app);
          } else {
            cleanupView();
            setView();
          }
        });

        function bootstrap(app) {
          require([app.file], function () {
            var newApp = getCurrentApp();
            angular.bootstrap(newApp, [app.ngModule]);
            currentlyBootstrapped = app;

            // check for new matching routes
            $route.reload();
          });
        }

        function getCurrentMatchingApp() {
          // determine the app (if any) to bootstrap or use default
          var overmind = angular.module('overmind');
          var match = $location.path().match(/\/\w+/) || [];
          return overmind.apps[match[0]] || overmind.default;
        }

        // delete scopes and reset app html
        function cleanupApp() {
          var previousApp = getCurrentApp();
          var previousScope = previousApp.scope();
          var template = '<div id="current-app"><div id="current-view"></div></div>';
          if (previousScope) {
            previousScope.$destroy();
          }
          previousApp.replaceWith(template);
        }

        function cleanupView() {
          var previousView = getCurrentView();
          if (currentViewScope) {
            currentViewScope.$destroy();
          }
          previousView.replaceWith('<div id="current-view"></div>');
        }

        function setView() {
          var currentRoute = $route.current;
          var locals = currentRoute && currentRoute.locals;
          var template = locals && locals.$template;

          if (!angular.isDefined(template)) {
            return;
          }

          var currentApp = getCurrentApp();
          var currentView = getCurrentView();
          var currentAppScope = currentApp.scope();
          var currentAppInjector = currentApp.injector();
          var $compile = currentAppInjector.get('$compile');

          currentView.html(template);

          var link = $compile(currentView.contents());

          currentViewScope = currentAppScope.$new();
          if (currentRoute.controller) {
            locals.$scope = currentViewScope;
            var $controller = currentAppInjector.get('$controller');
            var controller = $controller(currentRoute.controller, locals);
            if (currentRoute.controllerAs) {
              currentViewScope[current.controllerAs] = controller;
            }
            currentView.data('$ngControllerController', controller);
            currentView.children().data('$ngControllerController', controller);
          }
          link(currentViewScope);
          currentAppScope.$apply();
        }

        function getCurrentApp() {
          return angular.element(document.getElementById('current-app'));
        }

        function getCurrentView() {
          return angular.element(document.getElementById('current-view'));
        }
      }
    }
  }]);
})();
