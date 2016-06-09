angular
  .module('Transcode', [
    'ngResource',
    'ngMessages',
    'ngSanitize',
    'ngAnimate',
    'toastr',
    'ui.router',
    'ui.bootstrap.modal',
    'satellizer',
    'ngFileUpload'
  ]);

angular
  .module('Transcode')
  .config(function($stateProvider, $urlRouterProvider, $authProvider, toastrConfig, TcConfig) {
    $stateProvider
      .state('home', {
        url: '/',
        controller: 'HomeCtrl',
        templateUrl: 'components/landing.tpl.html'
      })
      .state('login', {
        url: '/login',
        templateUrl: 'security/login.tpl.html',
        controller: 'LoginCtrl',
        resolve: {
          skipIfLoggedIn: skipIfLoggedIn
        }
      })
      .state('signup', {
        url: '/signup',
        templateUrl: 'account/signup.tpl.html',
        controller: 'SignupCtrl',
        params: {
          hasPendingTask: false
        },
        resolve: {
          skipIfLoggedIn: skipIfLoggedIn
        }
      })
      .state('logout', {
        url: '/logout',
        template: null,
        controller: 'LogoutCtrl'
      })
      .state('profile', {
        url: '/profile',
        templateUrl: 'account/account.tpl.html',
        controller: 'AccountCtrl',
        resolve: {
          loginRequired: loginRequired
        }
      })
      .state('getstarted', {
        url: '/getstarted',
        templateUrl: 'tasks/getstarted.tpl.html',
        controller: 'TaskCreationCtrl',
      })
      .state('pricing', {
        url: '/pricing',
        templateUrl: 'pricing/pricing.tpl.html',
        controller: 'PricingCtrl',
        controllerAs: 'vm'
      })
      .state('contact', {
        url: '/contact',
        templateUrl: 'contact/contact.tpl.html',
        controller: 'ContactCtrl'
      })
      .state('tasks', {
        url: '/tasks',
        templateUrl: 'tasks/task-index.tpl.html',
        controller: 'TaskIndexCtrl',
        resolve: {
          loginRequired: loginRequired
        }
      });

    $urlRouterProvider.otherwise('/');

    $authProvider.baseUrl = TcConfig.API;

    $authProvider.facebook({
      clientId: 1350651101627198,
      name: 'facebook',
      url: '/auth/facebook',
      authorizationEndpoint: 'https://www.facebook.com/v2.5/dialog/oauth',
      redirectUri: window.location.origin + '/',
      requiredUrlParams: ['display', 'scope'],
      scope: ['email'],
      scopeDelimiter: ',',
      display: 'popup',
      type: '2.0',
      popupOptions: {
        width: 580,
        height: 400
      }
    });

    $authProvider.google({
      clientId: '298208586935-e4c6ud48023kfgmsl3h8qlus5tbpkcso.apps.googleusercontent.com',
      url: '/auth/google',
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/auth',
      redirectUri: window.location.origin,
      requiredUrlParams: ['scope'],
      optionalUrlParams: ['display'],
      scope: ['profile', 'email'],
      scopePrefix: 'openid',
      scopeDelimiter: ' ',
      display: 'popup',
      type: '2.0',
      popupOptions: {
        width: 452,
        height: 633
      }
    });

    function skipIfLoggedIn($q, $auth) {
      var deferred = $q.defer();
      if ($auth.isAuthenticated()) {
        deferred.reject();
      } else {
        deferred.resolve();
      }
      return deferred.promise;
    }

    function loginRequired($q, $location, $auth, Account) {
      var deferred = $q.defer();
      if ($auth.isAuthenticated()) {
        deferred.resolve();
      } else {
        $location.path('/login');
      }
      return deferred.promise;
    }

    angular.extend(toastrConfig, {
      positionClass: 'toast-bottom-right'
    });
  });

angular
  .module('Transcode')
  .run(function($rootScope, $auth, Account, Tasks, TcNotifs) {
    Tasks.getCurrentTask();

    if ($auth.isAuthenticated()) {
      TcNotifs.connect();
      try {
        $rootScope.user = localStorage.getItem('user') ? angular.fromJson(localStorage.getItem('user')) : {};
      } catch (e) {
        localStorage.removeItem('user');
        Account.getProfile(function(response) {
          if (response.data.user) {
            localStorage.setItem('user', response.data.user);
            $rootScope.user = response.data.user;
          }
        });
      }
    }
  });