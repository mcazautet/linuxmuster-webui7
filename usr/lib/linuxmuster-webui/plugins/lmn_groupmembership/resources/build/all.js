// Generated by CoffeeScript 2.4.1
(function() {
  angular.module('lmn.groupmembership', ['core', 'lm.common']);

}).call(this);

// Generated by CoffeeScript 2.4.1
(function() {
  angular.module('lmn.groupmembership').config(function($routeProvider) {
    return $routeProvider.when('/view/lmn/groupmembership', {
      controller: 'LMNGroupMembershipController',
      templateUrl: '/lmn_groupmembership:resources/partial/index.html'
    });
  });

  angular.module('lmn.groupmembership').controller('LMNGroupMembershipController', function($scope, $http, identity, $uibModal, gettext, notify, pageTitle, messagebox, validation) {
    pageTitle.set(gettext('Enrolle'));
    $scope.types = {
      schoolclass: {
        typename: gettext('Schoolclass'),
        name: gettext('Groupname'),
        checkbox: true,
        type: 'schoolclass'
      },
      printergroup: {
        typename: gettext('Printer'),
        checkbox: true,
        type: 'printergroup'
      },
      project: {
        typename: gettext('Projects'),
        checkbox: true,
        type: 'project'
      }
    };
    $scope.sorts = [
      {
        name: gettext('Groupname'),
        fx: function(x) {
          return x.groupname;
        }
      },
      {
        name: gettext('Membership'),
        fx: function(x) {
          return x.membership;
        }
      }
    ];
    $scope.sort = $scope.sorts[0];
    $scope.sortReverse = false;
    $scope.paging = {
      page: 1,
      pageSize: 20
    };
    $scope.isActive = function(group) {
      if (group.type === 'printergroup') {
        if ($scope.types.printergroup.checkbox === true) {
          return true;
        }
      }
      if (group.type === 'schoolclass') {
        if ($scope.types.schoolclass.checkbox === true) {
          return true;
        }
      }
      if (group.type === 'project') {
        if ($scope.types.schoolclass.checkbox === true) {
          return true;
        }
      }
      return false;
    };
    $scope.checkInverse = function(sort, currentSort) {
      if (sort === currentSort) {
        return $scope.sortReverse = !$scope.sortReverse;
      } else {
        return $scope.sortReverse = false;
      }
    };
    $scope.resetClass = function() {
      var group, i, len, ref, result;
      // reset html class back (remove changed) so its not highlighted anymore
      result = document.getElementsByClassName("changed");
      while (result.length) {
        result[0].className = result[0].className.replace(/(?:^|\s)changed(?!\S)/g, '');
      }
      ref = $scope.groups;
      // reset $scope.group attribute back not not changed so an additional enroll will not set these groups again
      for (i = 0, len = ref.length; i < len; i++) {
        group = ref[i];
        group['changed'] = false;
      }
    };
    $scope.groupChanged = function(item) {
      var group, i, len, ref, results;
      ref = $scope.groups;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        group = ref[i];
        if (group['groupname'] === item) {
          results.push(group['changed'] = !group['changed']);
        } else {
          results.push(void 0);
        }
      }
      return results;
    };
    $scope.filterGroupType = function(val) {
      return function(dict) {
        return dict['type'] === val;
      };
    };
    $scope.getGroups = function(username) {
      return $http.post('/api/lmn/groupmembership', {
        action: 'list-groups',
        username: username,
        profil: $scope.identity.profile
      }).then(function(resp) {
        $scope.groups = resp.data[0];
        $scope.identity.isAdmin = resp.data[1];
        $scope.classes = $scope.groups.filter($scope.filterGroupType('schoolclass'));
        $scope.projects = $scope.groups.filter($scope.filterGroupType('project'));
        return $scope.printers = $scope.groups.filter($scope.filterGroupType('printergroup'));
      });
    };
    $scope.setGroups = function(groups) {
      return $http.post('/api/lmn/groupmembership', {
        action: 'set-groups',
        username: $scope.identity.user,
        groups: groups,
        profil: $scope.identity.profile
      }).then(function(resp) {
        if (resp['data'][0] === 'ERROR') {
          notify.error(resp['data'][1]);
        }
        if (resp['data'][0] === 'LOG') {
          notify.success(gettext(resp['data'][1]));
          $scope.resetClass();
          identity.init().then(function() {
            return $scope.getGroups($scope.identity.user);
          });
        }
        if (resp.data === 0) {
          return notify.success(gettext("Nothing changed"));
        }
      });
    };
    $scope.createProject = function() {
      return messagebox.prompt(gettext('Project Name'), '').then(function(msg) {
        var test;
        if (!msg.value) {
          return;
        }
        test = validation.isValidProjectName(msg.value);
        if (test !== true) {
          notify.error(gettext(test));
          return;
        }
        return $http.post('/api/lmn/groupmembership', {
          action: 'create-project',
          username: $scope.identity.user,
          project: msg.value,
          profil: $scope.identity.profile
        }).then(function(resp) {
          notify.success(gettext('Project Created'));
          return $scope.getGroups($scope.identity.user);
        });
      });
    };
    $scope.showGroupDetails = function(index, groupType, groupName) {
      return $uibModal.open({
        templateUrl: '/lmn_groupmembership:resources/partial/groupDetails.modal.html',
        controller: 'LMNGroupDetailsController',
        size: 'lg',
        resolve: {
          groupType: function() {
            return groupType;
          },
          groupName: function() {
            return groupName;
          }
        }
      }).result.then(function(result) {
        if (result.response === 'refresh') {
          return $scope.getGroups($scope.identity.user);
        }
      });
    };
    $scope.projectIsJoinable = function(project) {
      return project['joinable'] === 'TRUE' || project.admin || $scope.identity.isAdmin || $scope.identity.profile.memberOf.indexOf(project['DN']) > -1;
    };
    return $scope.$watch('identity.user', function() {
      if ($scope.identity.user === void 0) {
        return;
      }
      if ($scope.identity.user === null) {
        return;
      }
      if ($scope.identity.user === 'root') {
        return;
      }
      // $scope.identity.user = 'hulk'
      $scope.getGroups($scope.identity.user);
    });
  });

  angular.module('lmn.groupmembership').controller('LMNGroupDetailsController', function($scope, $route, $uibModal, $uibModalInstance, $http, gettext, notify, messagebox, pageTitle, groupType, groupName) {
    $scope.showAdminDetails = true;
    $scope.showMemberDetails = true;
    $scope.changeState = false;
    $scope.hidetext = gettext("Hide");
    $scope.showtext = gettext("Show");
    $scope.changeJoin = function(group, type) {
      var option;
      $scope.changeState = true;
      option = $scope.joinable ? '--join' : '--nojoin';
      return $http.post('/api/lmn/changeGroup', {
        option: option,
        group: group,
        type: type
      }).then(function(resp) {
        if (resp['data'][0] === 'ERROR') {
          notify.error(resp['data'][1]);
        }
        if (resp['data'][0] === 'LOG') {
          notify.success(gettext(resp['data'][1]));
        }
        return $scope.changeState = false;
      });
    };
    $scope.changeHide = function(group, type) {
      var option;
      $scope.changeState = true;
      option = $scope.hidden ? '--hide' : '--nohide';
      return $http.post('/api/lmn/changeGroup', {
        option: option,
        group: group,
        type: type
      }).then(function(resp) {
        if (resp['data'][0] === 'ERROR') {
          notify.error(resp['data'][1]);
        }
        if (resp['data'][0] === 'LOG') {
          notify.success(gettext(resp['data'][1]));
        }
        return $scope.changeState = false;
      });
    };
    $scope.killProject = function(project) {
      return messagebox.show({
        text: `Do you really want to delete '${project}'? This can't be undone!`,
        positive: 'Delete',
        negative: 'Cancel'
      }).then(function() {
        var msg;
        msg = messagebox.show({
          progress: true
        });
        return $http.post('/api/lmn/groupmembership', {
          action: 'kill-project',
          username: $scope.identity.user,
          project: project,
          profil: $scope.identity.profile
        }).then(function(resp) {
          if (resp['data'][0] === 'ERROR') {
            notify.error(resp['data'][1]);
          }
          if (resp['data'][0] === 'LOG') {
            notify.success(gettext(resp['data'][1]));
            return $uibModalInstance.close({
              response: 'refresh'
            });
          }
        }).finally(function() {
          return msg.close();
        });
      });
    };
    $scope.nevertext = gettext('Never');
    $scope.formatDate = function(date) {
      var day, hour, min, month, sec, year;
      if (date === "19700101000000.0Z") {
        return $scope.nevertext;
      } else if (date === void 0) {
        return "undefined";
      } else {
        // Sophomorix date format is yyyyMMddhhmmss.0Z
        year = date.slice(0, 4);
        month = +date.slice(4, 6) - 1; // Month start at 0
        day = date.slice(6, 8);
        hour = date.slice(8, 10);
        min = date.slice(10, 12);
        sec = date.slice(12, 14);
        return new Date(year, month, day, hour, min, sec);
      }
    };
    $scope.getGroupDetails = function(group) {
      groupType = group[0];
      groupName = group[1];
      return $http.post('/api/lmn/groupmembership/details', {
        action: 'get-specified',
        groupType: groupType,
        groupName: groupName
      }).then(function(resp) {
        var admin, i, len, member, name, ref, ref1;
        $scope.groupName = groupName;
        $scope.groupDetails = resp.data['GROUP'][groupName];
        $scope.adminList = resp.data['GROUP'][groupName]['sophomorixAdmins'];
        $scope.groupmemberlist = resp.data['GROUP'][groupName]['sophomorixMemberGroups'];
        $scope.groupadminlist = resp.data['GROUP'][groupName]['sophomorixAdminGroups'];
        $scope.members = [];
        ref = resp.data['MEMBERS'][groupName];
        for (name in ref) {
          member = ref[name];
          if (member.sn !== "null") { // group member 
            $scope.members.push({
              'sn': member.sn,
              'givenName': member.givenName,
              'login': member.sAMAccountName,
              'sophomorixAdminClass': member.sophomorixAdminClass
            });
          }
        }
        $scope.admins = [];
        ref1 = $scope.adminList;
        for (i = 0, len = ref1.length; i < len; i++) {
          admin = ref1[i];
          member = resp.data['MEMBERS'][groupName][admin];
          $scope.admins.push({
            'sn': member.sn,
            'givenName': member.givenName,
            'sophomorixAdminClass': member.sophomorixAdminClass,
            'login': member.sAMAccountName
          });
        }
        $scope.joinable = resp.data['GROUP'][groupName]['sophomorixJoinable'] === 'TRUE';
        $scope.hidden = resp.data['GROUP'][groupName]['sophomorixHidden'] === 'TRUE';
        // Admin or admin of the project can edit members of a project
        // Only admins can change hide and join option for a class
        if ($scope.identity.isAdmin) {
          return $scope.editMembersButton = true;
        } else if ((groupType === "project") && ($scope.adminList.indexOf($scope.identity.user) !== -1 || $scope.groupadminlist.indexOf($scope.identity.profile.sophomorixAdminClass) !== -1)) {
          return $scope.editMembersButton = true;
        } else {
          return $scope.editMembersButton = false;
        }
      });
    };
    $scope.addMember = function(user) {
      return $http.post('/api/lmn/groupmembership/membership', {
        action: 'addmembers',
        entity: user.login,
        project: groupName
      }).then(function(resp) {
        if (resp['data'][0] === 'ERROR') {
          notify.error(resp['data'][1]);
        }
        if (resp['data'][0] === 'LOG') {
          notify.success(gettext(resp['data'][1]));
          return $scope.members.push(user);
        }
      });
    };
    $scope.removeMember = function(user) {
      return $http.post('/api/lmn/groupmembership/membership', {
        action: 'removemembers',
        entity: user.login,
        project: groupName
      }).then(function(resp) {
        var position;
        if (resp['data'][0] === 'ERROR') {
          notify.error(resp['data'][1]);
        }
        if (resp['data'][0] === 'LOG') {
          notify.success(gettext(resp['data'][1]));
          position = $scope.members.indexOf(user);
          return $scope.members.splice(position, 1);
        }
      });
    };
    $scope.addAdmin = function(user) {
      return $http.post('/api/lmn/groupmembership/membership', {
        action: 'addadmins',
        entity: user.login,
        project: groupName
      }).then(function(resp) {
        if (resp['data'][0] === 'ERROR') {
          notify.error(resp['data'][1]);
        }
        if (resp['data'][0] === 'LOG') {
          notify.success(gettext(resp['data'][1]));
          return $scope.admins.push(user);
        }
      });
    };
    $scope.removeAdmin = function(user) {
      return $http.post('/api/lmn/groupmembership/membership', {
        action: 'removeadmins',
        entity: user.login,
        project: groupName
      }).then(function(resp) {
        var position;
        if (resp['data'][0] === 'ERROR') {
          notify.error(resp['data'][1]);
        }
        if (resp['data'][0] === 'LOG') {
          notify.success(gettext(resp['data'][1]));
          position = $scope.admins.indexOf(user);
          return $scope.admins.splice(position, 1);
        }
      });
    };
    $scope.addMemberGroup = function(group) {
      return $http.post('/api/lmn/groupmembership/membership', {
        action: 'addmembergroups',
        entity: group,
        project: groupName
      }).then(function(resp) {
        if (resp['data'][0] === 'ERROR') {
          notify.error(resp['data'][1]);
        }
        if (resp['data'][0] === 'LOG') {
          notify.success(gettext(resp['data'][1]));
          return $scope.groupmemberlist.push(group);
        }
      });
    };
    $scope.removeMemberGroup = function(group) {
      return $http.post('/api/lmn/groupmembership/membership', {
        action: 'removeadmingroups',
        entity: group,
        project: groupName
      }).then(function(resp) {
        var position;
        if (resp['data'][0] === 'ERROR') {
          notify.error(resp['data'][1]);
        }
        if (resp['data'][0] === 'LOG') {
          notify.success(gettext(resp['data'][1]));
          position = $scope.groupadminlist.indexOf(group);
          return $scope.groupmemberlist.splice(position, 1);
        }
      });
    };
    $scope.addAdminGroup = function(group) {
      return $http.post('/api/lmn/groupmembership/membership', {
        action: 'addadmingroups',
        entity: group,
        project: groupName
      }).then(function(resp) {
        if (resp['data'][0] === 'ERROR') {
          notify.error(resp['data'][1]);
        }
        if (resp['data'][0] === 'LOG') {
          notify.success(gettext(resp['data'][1]));
          return $scope.groupadminlist.push(group);
        }
      });
    };
    $scope.removeAdminGroup = function(group) {
      return $http.post('/api/lmn/groupmembership/membership', {
        action: 'removeadmingroups',
        entity: group,
        project: groupName
      }).then(function(resp) {
        var position;
        if (resp['data'][0] === 'ERROR') {
          notify.error(resp['data'][1]);
        }
        if (resp['data'][0] === 'LOG') {
          notify.success(gettext(resp['data'][1]));
          position = $scope.groupadminlist.indexOf(group);
          return $scope.groupadminlist.splice(position, 1);
        }
      });
    };
    $scope.demoteGroup = function(group) {
      $scope.removeAdminGroup(group);
      return $scope.addMemberGroup(group);
    };
    $scope.demoteMember = function(user) {
      $scope.removeAdmin(user);
      return $scope.addMember(user);
    };
    $scope.elevateGroup = function(group) {
      $scope.removeMemberGroup(group);
      return $scope.addAdminGroup(group);
    };
    $scope.elevateMember = function(user) {
      $scope.removeMember(user);
      return $scope.addAdmin(user);
    };
    $scope.groupType = groupType;
    $scope.getGroupDetails([groupType, groupName]);
    return $scope.close = function() {
      return $uibModalInstance.dismiss();
    };
  });

}).call(this);

