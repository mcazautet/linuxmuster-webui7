(function() {
  angular.module('lm.workstations', ['core', 'lm.common']);

}).call(this);

(function() {
  angular.module('lm.workstations').config(function($routeProvider) {
    return $routeProvider.when('/view/lm/workstations', {
      controller: 'LMWorkstationsController',
      templateUrl: '/lm_workstations:resources/partial/index.html'
    });
  });

  angular.module('lm.workstations').controller('LMWorkstationsApplyModalController', function($scope, $http, $uibModalInstance, gettext, notify) {
    $scope.logVisible = false;
    $scope.isWorking = true;
    $scope.showLog = function() {
      return $scope.logVisible = true;
    };
    $http.get('/api/lm/workstations/import').then(function(resp) {
      $scope.isWorking = false;
      return notify.success(gettext('Import complete'));
    })["catch"](function(resp) {
      notify.error(gettext('Import failed'), resp.data.message);
      $scope.isWorking = false;
      return $scope.showLog();
    });
    return $scope.close = function() {
      return $uibModalInstance.close();
    };
  });

  angular.module('lm.workstations').controller('LMWorkstationsController', function($scope, $http, $uibModal, $route, gettext, notify, pageTitle, lmFileEditor, lmFileBackups) {
    pageTitle.set(gettext('Workstations'));
    $scope.sorts = [
      {
        name: gettext('Room'),
        fx: function(x) {
          return x.room;
        }
      }, {
        name: gettext('Group'),
        fx: function(x) {
          return x.group;
        }
      }, {
        name: gettext('Hostname'),
        fx: function(x) {
          return x.hostname;
        }
      }, {
        name: gettext('MAC'),
        fx: function(x) {
          return x.mac;
        }
      }, {
        name: gettext('IP'),
        fx: function(x) {
          return x.ip;
        }
      }
    ];
    $scope.sort = $scope.sorts[0];
    $scope.paging = {
      page: 1,
      pageSize: 100
    };
    $scope.stripComments = function(value) {
      return !value.room || value.room[0] !== '#';
    };
    $scope.add = function() {
      $scope.paging.page = Math.floor(($scope.workstations.length - 1) / $scope.paging.pageSize) + 1;
      $scope.filter = '';
      return $scope.workstations.push({
        _isNew: true,
        accountType: '1',
        pxeFlag: '1'
      });
    };
    $scope.fields = {
      room: {
        visible: true,
        name: gettext('Room')
      },
      hostname: {
        visible: true,
        name: gettext('Hostname')
      },
      group: {
        visible: true,
        name: gettext('Group')
      },
      mac: {
        visible: true,
        name: gettext('MAC')
      },
      ip: {
        visible: true,
        name: gettext('IP')
      },
      officeKey: {
        visible: false,
        name: gettext('Office Key')
      },
      windowsKey: {
        visible: false,
        name: gettext('Windows Key')
      },
      userReserved: {
        visible: false,
        name: gettext('User-defined')
      },
      accountType: {
        visible: false,
        name: gettext('Account type')
      },
      pxeFlag: {
        visible: true,
        name: gettext('PXE')
      }
    };
    $http.get('/api/lm/workstations').then(function(resp) {
      return $scope.workstations = resp.data;
    });
    $scope.remove = function(workstation) {
      return $scope.workstations.remove(workstation);
    };
    $scope.save = function() {
      return $http.post('/api/lm/workstations', $scope.workstations).then(function() {
        return notify.success(gettext('Saved'));
      });
    };
    $scope.saveAndImport = function() {
      return $scope.save().then(function() {
        return $uibModal.open({
          templateUrl: '/lm_workstations:resources/partial/apply.modal.html',
          controller: 'LMWorkstationsApplyModalController',
          backdrop: 'static'
        });
      });
    };
    $scope.editCSV = function() {
      return lmFileEditor.show('/etc/linuxmuster/sophomorix/default-school/devices.csv').then(function() {
        return $route.reload();
      });
    };
    return $scope.backups = function() {
      return lmFileBackups.show('/etc/linuxmuster/sophomorix/default-school/devices.csv');
    };
  });

}).call(this);
