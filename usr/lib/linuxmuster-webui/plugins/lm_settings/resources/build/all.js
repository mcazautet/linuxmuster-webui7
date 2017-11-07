(function() {
  angular.module('lm.settings', ['core', 'lm.common']);

}).call(this);

(function() {
  angular.module('lm.settings').config(function($routeProvider) {
    return $routeProvider.when('/view/lm/settings', {
      controller: 'LMSettingsController',
      templateUrl: '/lm_settings:resources/partial/index.html'
    });
  });

  angular.module('lm.settings').controller('LMSettingsController', function($scope, $http, $uibModal, gettext, notify, pageTitle, lmFileBackups) {
    pageTitle.set(gettext('Settings'));
    $scope.logLevels = [
      {
        name: gettext('Minimal'),
        value: 0
      }, {
        name: gettext('Average'),
        value: 1
      }, {
        name: gettext('Maximal'),
        value: 2
      }
    ];
    $scope.encodings = ['ascii', '8859-1', '8859-15', 'win1252', 'utf8'];
    $http.get('/api/lm/settings').then(function(resp) {
      return $scope.settings = resp.data;
    });
    $http.get('/api/lm/settings/school-share').then(function(resp) {
      return $scope.schoolShareEnabled = resp.data;
    });
    $scope.setSchoolShare = function(enabled) {
      $scope.schoolShareEnabled = enabled;
      return $http.post('/api/lm/settings/school-share', enabled);
    };
    $scope.save = function() {
      return $http.post('/api/lm/settings', $scope.settings).then(function() {
        return notify.success(gettext('Saved'));
      });
    };
    return $scope.backups = function() {
      return lmFileBackups.show('/etc/sophomorix/user/sophomorix.conf');
    };
  });

}).call(this);
