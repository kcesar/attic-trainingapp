angular.module('esarTraining', ['ngMessages', 'ngMaterial', 'jkAngularCarousel'])
  .config(['$mdThemingProvider', '$mdDateLocaleProvider', '$locationProvider', function ($mdThemingProvider, $mdDateLocaleProvider, $locationProvider) {
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

    $locationProvider.html5Mode(true);
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

  var ageCut = new Date();
  ageCut.setFullYear(ageCut.getFullYear() - 13);

  angular.extend($scope, {
    minBirth: new Date(1900, 1, 1),
    maxBirth: ageCut,
    user: {
      birthdate: null
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
;