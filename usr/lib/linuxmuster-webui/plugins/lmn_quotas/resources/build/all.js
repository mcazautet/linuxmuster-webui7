// Generated by CoffeeScript 2.3.2
(function() {
  angular.module('lm.quotas', ['core', 'lm.common']);

}).call(this);

// Generated by CoffeeScript 2.3.2
(function() {
  var indexOf = [].indexOf;

  angular.module('lm.quotas').config(function($routeProvider) {
    $routeProvider.when('/view/lm/quotas', {
      controller: 'LMQuotasController',
      templateUrl: '/lmn_quotas:resources/partial/index.html'
    });
    return $routeProvider.when('/view/lm/quotas-disabled', {
      templateUrl: '/lmn_quotas:resources/partial/disabled.html'
    });
  });

  angular.module('lm.quotas').controller('LMQuotasApplyModalController', function($scope, $http, $uibModalInstance, gettext, notify) {
    $scope.logVisible = false;
    $scope.isWorking = true;
    $scope.showLog = function() {
      return $scope.logVisible = true;
    };
    $http.get('/api/lm/quotas/apply').then(function() {
      $scope.isWorking = false;
      return notify.success(gettext('Update complete'));
    }).catch(function(resp) {
      notify.error(gettext('Update failed'), resp.data.message);
      $scope.isWorking = false;
      return $scope.showLog();
    });
    return $scope.close = function() {
      return $uibModalInstance.close();
    };
  });

  angular.module('lm.quotas').controller('LMQuotasController', function($scope, $http, $uibModal, $location, $q, gettext, lmEncodingMap, notify, pageTitle, lmFileBackups) {
    pageTitle.set(gettext('Quotas'));
    $scope._ = {
      addNewSpecial: null
    };
    //$http.get("/api/lm/users/teachers-list").then (resp) ->
    //$scope.teachers = resp.data
    //for teacher in $scope.teachers
    //teacher.quota = parseInt(teacher.quota)
    //teacher.mailquota = parseInt(teacher.mailquota)

    //$http.get('/api/lm/settings').then (resp) ->
    //if not resp.data.use_quota
    //$location.path('/view/lm/quotas-disabled')
    $http.get('/api/lm/schoolsettings').then(function(resp) {
      var school;
      school = 'default-school';
      return $scope.settings = resp.data;
    });
    $http.get('/api/lm/quotas').then(function(resp) {
      $scope.quotas = resp.data[0];
      $scope.teachers = resp.data[1];
      return $scope.standardQuota = $scope.quotas['standard-lehrer'];
    });
    $http.get('/api/lm/class-quotas').then(function(resp) {
      $scope.classes = resp.data;
      return $scope.originalClasses = angular.copy($scope.classes);
    });
    $http.get('/api/lm/project-quotas').then(function(resp) {
      $scope.projects = resp.data;
      return $scope.originalProjects = angular.copy($scope.projects);
    });
    $scope.specialQuotas = [
      {
        login: 'www-data',
        name: gettext('Webspace')
      },
      {
        login: 'administrator',
        name: gettext('Main admin')
      },
      {
        login: 'pgmadmin',
        name: gettext('Program admin')
      },
      {
        login: 'wwwadmin',
        name: gettext('Web admin')
      }
    ];
    $scope.defaultQuotas = [
      {
        login: 'standard-workstations',
        name: gettext('Workstation default')
      },
      {
        login: 'standard-schueler',
        name: gettext('Student default')
      },
      {
        login: 'standard-lehrer',
        name: gettext('Teacher default')
      }
    ];
    $scope.$watch('_.addNewSpecial', function() {
      if ($scope._.addNewSpecial) {
        $scope.quotas[$scope._.addNewSpecial] = angular.copy($scope.standardQuota);
        return $scope._.addNewSpecial = null;
      }
    });
    $scope.findUsers = function(q) {
      return $http.get(`/api/lm/ldap-search?q=${q}`).then(function(resp) {
        return resp.data;
      });
    };
    $scope.isSpecialQuota = function(login) {
      var x;
      return indexOf.call((function() {
        var i, len, ref, results;
        ref = $scope.specialQuotas;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          x = ref[i];
          results.push(x.login);
        }
        return results;
      })(), login) >= 0;
    };
    $scope.isDefaultQuota = function(login) {
      var x;
      return indexOf.call((function() {
        var i, len, ref, results;
        ref = $scope.defaultQuotas;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          x = ref[i];
          results.push(x.login);
        }
        return results;
      })(), login) >= 0;
    };
    $scope.NameCache = {};
    $scope.getName = function(login) {
      if (!angular.isDefined($scope.NameCache[login])) {
        $scope.NameCache[login] = '...';
        $http.get(`/api/lm/ldap-search?q=${login}`).then(function(resp) {
          if (resp.data.length > 0) {
            return $scope.NameCache[login] = resp.data[0][1].sn[0] + " " + resp.data[0][1].givenName[0];
          } else {
            return $scope.NameCache[login] = login;
          }
        });
      }
      return $scope.NameCache[login];
    };
    $scope.remove = function(login) {
      return delete $scope.quotas[login];
    };
    $scope.save = function() {
      var base, base1, base2, base3, classesToChange, cls, i, index, j, k, len, len1, len2, project, projectsToChange, qs, ref, ref1, teacher, teachers;
      teachers = angular.copy($scope.teachers);
      for (i = 0, len = teachers.length; i < len; i++) {
        teacher = teachers[i];
        if (!teacher.quota.home && !teacher.quota.var) {
          teacher.quota = '';
        } else {
          teacher.quota = `${teacher.quota.home || $scope.standardQuota.home}+${teacher.quota.var || $scope.standardQuota.var}`;
        }
        teacher.mailquota = `${teacher.mailquota || ''}`;
      }
      classesToChange = [];
      ref = $scope.classes;
      for (index = j = 0, len1 = ref.length; j < len1; index = ++j) {
        cls = ref[index];
        if (!angular.equals(cls, $scope.originalClasses[index])) {
          if ((base = cls.quota).home == null) {
            base.home = $scope.standardQuota.home;
          }
          if ((base1 = cls.quota).var == null) {
            base1.var = $scope.standardQuota.var;
          }
          classesToChange.push(cls);
        }
      }
      projectsToChange = [];
      ref1 = $scope.projects;
      for (index = k = 0, len2 = ref1.length; k < len2; index = ++k) {
        project = ref1[index];
        if (!angular.equals(project, $scope.originalProjects[index])) {
          if ((base2 = project.quota).home == null) {
            base2.home = $scope.standardQuota.home;
          }
          if ((base3 = project.quota).var == null) {
            base3.var = $scope.standardQuota.var;
          }
          projectsToChange.push(project);
        }
      }
      qs = [];
      qs.push($http.post(`/api/lm/users/teachers?encoding=${$scope.teachersEncoding}`, teachers));
      qs.push($http.post('/api/lm/quotas', $scope.quotas));
      if (classesToChange.length > 0) {
        qs.push($http.post("/api/lm/class-quotas", classesToChange).then(function() {}));
      }
      if (projectsToChange.length > 0) {
        qs.push($http.post("/api/lm/project-quotas", projectsToChange).then(function() {}));
      }
      return $q.all(qs).then(function() {
        $scope.originalClasses = angular.copy($scope.classes);
        $scope.originalProjects = angular.copy($scope.projects);
        return notify.success(gettext('Saved'));
      });
    };
    $scope.saveApply = function() {
      return $scope.save().then(function() {
        return $uibModal.open({
          templateUrl: '/lmn_quotas:resources/partial/apply.modal.html',
          controller: 'LMQuotasApplyModalController',
          backdrop: 'static'
        });
      });
    };
    return $scope.backups = function() {
      return lmFileBackups.show('/etc/linuxmuster/sophomorix/user/quota.txt');
    };
  });

}).call(this);

