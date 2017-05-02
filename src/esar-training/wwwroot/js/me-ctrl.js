angular.module('esarTraining').controller('MeCtrl', ['$scope', '$http', '$mdPanel', function ($scope, $http, $mdPanel) {
  var s = $scope;

  function finishLogin() {
    window.location.hash = window.location.hash.replace("/id_token", "id_token");
    if (window.location.hash.indexOf("id_token=") >= 0 && window.location.hash.indexOf("session_state") >= 0) {
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
      var p = null;
      if (user == null) {
        p = Promise.resolve();
      } else if (user.expires_in < 30) {
        p = mgr.clearStaleState();
      }

      return p == null
        ? user
        : p.then(function() { return mgr.signinRedirect(); });
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

  //mgr.events.addSilentRenewError(function (e) {
  //  console.log("silent renew error", e.message);
  //  //log("silent renew error", e.message);
  //});

  //mgr.events.addUserLoaded(function (user) {
  //  console.log("user loaded", user);
  //  mgr.getUser().then(function () {
  //    console.log("getUser loaded user after userLoaded event fired");
  //  });
  //});

  //mgr.events.addUserUnloaded(function (e) {
  //  console.log("user unloaded");
  //});

  var panelPosition = $mdPanel.newPanelPosition()
      .absolute()
      .center();
  var _loadingPanel = $mdPanel.create({
    attachTo: angular.element(document.body),
    disableParentScroll: false,
    template: '<div role="dialog" aria-label="Eat me!" layout="column" layout-align="center center">' +
              '<div class="sar-dialog-content"><p>Loading ...</p></div></div>',
    hasBackdrop: true,
    panelClass: 'sar-dialog',
    position: panelPosition,
    trapFocus: true,
    zIndex: 150,
    clickOutsideToClose: false,
    escapeToClose: false,
    focusOnOpen: true
  });

  function loadData (urlPart, applyCb) {
    s.$pending = true;
    return $http.get(databaseRoot + urlPart, { headers: { 'Authorization': 'Bearer ' + s.access_token } }).then(
      applyCb,
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





  function didCourse(title) {
    var record = s.data.trainingRecords[title];
    return record !== undefined;
  }
  function getTask(title) {
    for (var i=0;i<s.tasks.length;i++){
      if (s.tasks[i].title == title) return s.tasks[i];
    }
    return null;
  }
  function course(title) {
    return function () {
      return didCourse(title) ? 2 : 0;
    }
  }
  angular.extend($scope, {
    $pending: true,
    initialized: false,
    data: {
      user: { },
      emergencyContacts: 0,
      contacts: [
        { 'type': 'email', 'value': 'george@tester.com' }
      ]
    },

    tasks: [
      { 'title': 'Contact Information', summary: 'Address, Email, Phone Number', category: 'personal', tester: function () { return s.data.contacts.length > 1 ? 1 : 0 } },
      { 'title': 'Emergency Contacts', summary: 'Who to call in an emergency', category: 'personal', tester: function () { return Math.min(s.data.emergencyContactCount, 2) } },
      { 'title': 'ICS-100 and ICS-700', summary: 'FEMA required online courses', category: 'online', blocked: false, tester: function () { return (didCourse('ICS-100') ? 1 : 0) + (didCourse('ICS-700') ? 1 : 0) } },
      { 'title': 'Course A', summary: 'Evening orientation', category: 'session', blocked: false, tester: course('Course A') },
      { 'title': 'Course B', summary: 'Indoor navigation course', category: 'session', blocked: false, tester: course('Course B') },
      { 'title': 'Background Check', summary: "Sheriff's Office application", category: 'paperwork', blocked: false, tester: function () { return s.data.user.backgroundKnown ? 2 : 0; } },
      { 'title': 'LFL Registration', summary: "For youth members", category: 'paperwork', blocked: false },
      { 'title': 'Submit Photo', summary: "Submit portrait for ID card", category: 'paperwork', blocked: false, tester: function () { return s.data.user.photo ? 2 : 0 } },
      { 'title': 'First Aid / CPR', summary: "Obtain first aid and CPR training", category: 'session', blocked: false, tester: function () { return (didCourse('Core/FirstAid') ? 1 : 0) + (didCourse('Core/CPR') ? 1 : 0) } },
      { 'title': 'Course C', summary: "Outdoor weekend - Intro to SAR", category: 'session', blocked: false, tester: course('Course C'), prereqs: ['Course B'] },
      { 'title': 'Course I', summary: "Outdoor weekend - Navigation", category: 'session', blocked: false, tester: course('Course I'), prereqs: ['Course C'] },
      { 'title': 'Course II', summary: "Outdoor weekend - Evaluation", category: 'session', blocked: false, tester: course('Course II'), prereqs: ['Course I'] },
      { 'title': 'Searcher First Aid', summary: "SAR specific first aid", category: 'session', blocked: false, tester: course('Searcher First Aid'), prereqs: ['Course II'] },
      { 'title': 'Course III', summary: "Outdoor weekend - mock mission", category: 'session', blocked: false, tester: course('Course III'), prereqs: ['Searcher First Aid'] },
    ],
    completedFilter: function (value) {
      return function (item) {
        return value == (item.progress == 2)
      }
    },
    loadContacts: function() { return loadData('/members/' + s.data.user.id + '/contacts', function(response) {
      s.data.contacts = response.data;
    })
    },
    loadEmergencyStatus: function() { return loadData('/members/' + s.data.user.id + '/emergencycontacts/count', function(response) {
      s.data.emergencyContactCount = response.data.count;
    })},
    loadMember: function () {
      return loadData('/members/' + s.data.user.id, function (response) {
      s.data.user = response.data;
      s.$pending = false;
    })},
    loadTraining: function () { return loadData('/members/' + s.data.user.id + '/training/records', function(response) {
      s.data.trainingRecords = {};
      for (var i = 0; i < response.data.items.length; i++) {
        s.data.trainingRecords[response.data.items[i].course.name] = response.data.items[i];
      }
      s.$pending = false;
    })},
    load: function (user) {
      _loadingPanel.open();
      var altMemberId = getParameterByName("memberId");
      s.data.user.id = altMemberId ? altMemberId : user.profile.memberId;
      s.access_token = user.access_token;
      s.authMemberId = user.profile.memberId;
      return s.loadMember()
       .then(s.loadTraining)
       .then(s.loadContacts)
       .then(s.loadEmergencyStatus)
       .then(function() {
        for (var i = 0; i < s.tasks.length; i++) {
          s.tasks[i].progress = s.tasks[i].tester ? s.tasks[i].tester() : -1;
        }
        for (var i = 0; i < s.tasks.length; i++) {
          var t = s.tasks[i];
          t.blocked = false;
          if (t.prereqs) {
            t.blocked = t.prereqs.reduce(function (prev, curr) {
              return prev || !didCourse(curr);
            }, t.blocked)
          }
        }
        _loadingPanel.close();
      });
    }
  });


  finishLogin().then(loginIfNot).then(function (user) {
    s.load(user);
  });
}])
;