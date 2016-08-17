angular.module('esarTraining', ['ngMessages', 'ngMaterial', 'jkAngularCarousel'])
  .config(['$mdThemingProvider', '$mdDateLocaleProvider', function ($mdThemingProvider, $mdDateLocaleProvider) {
    //http://mcg.mbitson.com/
    $mdThemingProvider.definePalette('sar-yellow', {
      '50': '#ffffff',
      '100': '#fce7c6',
      '200': '#f9d190',
      '300': '#f6b44c',
      '400': '#f4a82f',
      '500': '#f39c12',
      '600': '#db8b0b',
      '700': '#be780a',
      '800': '#a16608',
      '900': '#845307',
      'A100': '#ffffff',
      'A200': '#fce7c6',
      'A400': '#f4a82f',
      'A700': '#be780a',
      'contrastDefaultColor': 'light',
      'contrastDarkColors': '50 100 200 300 400 A100 A200 A400 A700'
    })
    .definePalette('sar-green', {
      '50': '#97ffb1',
      '100': '#4bff77',
      '200': '#13ff4d',
      '300': '#00ca32',
      '400': '#00ac2b',
      '500': '#008d23',
      '600': '#006e1b',
      '700': '#005014',
      '800': '#00310c',
      '900': '#001305',
      'A100': '#97ffb1', // hue-1
      'A200': '#008d23', // 
      'A400': '#00ac2b', // hue-2
      'A700': '#005014', // hue-3
      'contrastDefaultColor': 'light',
      'contrastDarkColors': '50 100 200 300 A100 A200'
    });;

    $mdThemingProvider.theme('default')
    .primaryPalette('sar-green')
    .accentPalette('sar-yellow')
    .backgroundPalette('grey');

    $mdDateLocaleProvider.parseDate = function (dateString) {
      var m = moment(dateString, ['YYYY-MM-DD', 'M/D/YYYY'], true)
      return m.isValid() ? m.toDate() : new Date(NaN);
    }
  }]);


angular.module('esarTraining').directive('serverError', function () {
  return {
    restrict: 'A',
    require: '?ngModel',
    link: function (scope, element, attrs, ctrl) {
      return element.on('change keyup', function () {
        return scope.$apply(function () {
          return ctrl.$setValidity('server', true);
        });
      });
    }
  };
})


.directive("compareTo", function () {
  return {
    require: "ngModel",
    scope: {
      otherModelValue: "=compareTo"
    },
    link: function (scope, element, attributes, ngModel) {

      ngModel.$validators.compareTo = function (modelValue) {
        return modelValue == scope.otherModelValue;
      };

      scope.$watch("otherModelValue", function () {
        ngModel.$validate();
      });
    }
  };
})

.directive('usernameAvailableValidator', ['$q', '$http', function ($q, $http) {
  return {
    require: 'ngModel',
    link: function ($scope, element, attrs, ngModel) {
      ngModel.$asyncValidators.usernameAvailable = function (username) {
        var defer = $q.defer();
        $http.get(authApi + '/checkusername/' + encodeURIComponent(username)).then(function (response) {
          console.log(response.data);
          if (response.data == "Available") defer.resolve();
          else defer.reject();
        });
        return defer.promise;
      };
    }
  }
}])

.controller('HomeCtrl', ['$scope', function ($scope) {
  $scope.pics = [
    { src: '/images/can2-checkin.jpg' },
    { src: '/images/litter-wheel.jpg' },
    { src: '/images/in-the-woods.jpg' },
    { src: '/images/team-evac.jpg' }
  ];
}])

.controller('SignupCtrl', ['$scope', '$http', '$window', '$mdDialog', function ($scope, $http, $window, $mdDialog) {
  var s = $scope;

  angular.extend($scope, {
    user: {

    },
    postSignup: function () {
      s.signupForm.$pending = true;
      $http.post(appRoot + '/signup', s.user).then(
        function (response) {
          $window.location.href = appRoot + '/me';
        },
        function (response) {
          $mdDialog.show(
            $mdDialog.alert()
              .parent(angular.element(document.querySelector('#content')))
              .clickOutsideToClose(true)
              .title('Server Error')
              .textContent(response.statusText)
              .ariaLabel('Error report')
              .ok('Okay')
          );
          s.signupForm.$pending = false;
        });
    }
  });
}])

.controller('MeCtrl', ['$scope', '$attrs', '$http', function ($scope, $attrs, $http) {
  var s = $scope;
  var memberId = '';
  var token = '';

  function finishLogin() {
    if (window.location.hash.indexOf("id_token=") >= 0 && window.location.hash.indexOf("session_state") >= 0) {
      debugger;
      return mgr.signinRedirectCallback().then(function (user) {
        window.location.hash = '';
        return user;
      }).catch(function (err) {
        console.log(err);
      });
    } else {
      return Promise.resolve();
    }
  }

  function loginIfNot() {
    return mgr.getUser().then(function (user) {
      if (user == null) {
        mgr.signinRedirect({ data: 'some data' })
           .catch(function (err) {
             console.log(err);
           });
      }
      return user;
    }).catch(function (err) {
      console.log(err);
    });
  }

  Oidc.Log.logger = console;
  Oidc.Log.level = Oidc.Log.INFO;
  var mgr = new Oidc.UserManager(oidcSettings);

  mgr.events.addAccessTokenExpiring(function () {
    console.log("token expiring");
    //log("token expiring");
  });

  mgr.events.addAccessTokenExpired(function () {
    console.log("token expired");
    //log("token expired");
  });

  mgr.events.addSilentRenewError(function (e) {
    console.log("silent renew error", e.message);
    //log("silent renew error", e.message);
  });

  mgr.events.addUserLoaded(function (user) {
    console.log("user loaded", user);
    mgr.getUser().then(function () {
      console.log("getUser loaded user after userLoaded event fired");
    });
  });

  mgr.events.addUserUnloaded(function (e) {
    console.log("user unloaded");
  });







  function didCourse(title) {
    var record = s.data.trainingRecords[title];
    return record === undefined;
  }

  function course(title) {
    return function () {
      return didCourse(title) ? 2 : 0;
    }
  }
  angular.extend($scope, {
    $pending: true,
    data: {
      emergencyContacts: 0,
      contacts: [
        { 'type': 'email', 'value': 'george@tester.com' }
      ]
    },

    tasks: [
      { 'title': 'Contact Information', 'category': 'personal', tester: function () { return s.data.contacts.length > 1 ? 1 : 0 } },
      { 'title': 'Emergency Contacts', 'category': 'personal', tester: function () { return Math.min(s.data.emergencyContacts, 2) } },
      { 'title': 'ICS-100 and ICS-700', 'category': 'online', tester: function () { return didCourse('ICS-100') ? 1 : 0 + didCourse('ICS-700') ? 1 : 0 } },
      { 'title': 'Course A', 'category': 'session', blocked: false, tester: course('Course A') },
      { 'title': 'Course B', 'category': 'session', blocked: true, tester: course('Course B') },
      { 'title': 'Background Check', 'category': 'paperwork', blocked: false, tester: function () { return 0 } },
      { 'title': 'LFL Registration', 'category': 'paperwork', blocked: false, tester: function () { return 0 } },
      { 'title': 'Submit Photo', 'category': 'paperwork', blocked: true, tester: function () { return s.data.photo ? 2 : 0 } },
      { 'title': 'First Aid / CPR', 'category': 'session', blocked: false, tester: function () { return didCourse('Core/FirstAid') ? 1 : 0 + didCourse('Core/CPR') ? 1 : 0 } },
      { 'title': 'Course C', 'category': 'session', blocked: true, tester: course('Course C') },
      { 'title': 'Course I', 'category': 'session', blocked: true, tester: course('Course I') },
      { 'title': 'Course II', 'category': 'session', blocked: false, tester: course('Course II') },
      { 'title': 'Searcher First Aid', 'category': 'session', blocked: true, tester: course('Searcher First Aid') },
      { 'title': 'Course III', 'category': 'session', blocked: true, tester: course('Course III') },
    ],
    completedFilter: function (value) {
      return function (item) {
        return value == (item.progress == 2)
      }
    },
    load: function (user) {
      s.$pending = true;
      s.user = user;
      $http.get(databaseRoot + '/members/' + user.profile.memberId + '/trainingrecords', { headers: { 'Authorization': 'Bearer ' + user.access_token } }).then(
        function (response) {
          console.log(response);
          s.data.trainingRecords = {};
          for (var i = 0; i < response.data.length; i++) {
            s.data.trainingRecords[response.data[i].course.name] = response.data[i];
          }
          for (var i = 0; i < s.tasks.length; i++) {
            s.tasks[i].progress = s.tasks[i].tester();
          }
          s.$pending = false;
        },
        function (response) {
        alert(response.statusText)
          //$mdDialog.show(
          //  $mdDialog.alert()
          //    .parent(angular.element(document.querySelector('#content')))
          //    .clickOutsideToClose(true)
          //    .title('Server Error')
          //    .textContent(response.statusText)
          //    .ariaLabel('Error report')
          //    .ok('Okay')
          //);
          s.$pending = false;
        });
    }
  });


  finishLogin().then(loginIfNot).then(function (user) {
    s.load(user);
  });
}])
;