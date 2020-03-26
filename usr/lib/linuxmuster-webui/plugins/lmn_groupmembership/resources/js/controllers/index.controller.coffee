angular.module('lmn.groupmembership').config ($routeProvider) ->
  $routeProvider.when '/view/lmn/groupmembership',
    controller: 'LMNGroupMembershipController'
    templateUrl: '/lmn_groupmembership:resources/partial/index.html'

angular.module('lmn.groupmembership').controller 'LMNGroupMembershipController', ($scope, $http, identity, $uibModal, gettext, notify, pageTitle, messagebox, validation) ->

  pageTitle.set(gettext('Enrolle'))
  $scope.types = {
    schoolclass:
      typename: gettext('Schoolclass')
      name: gettext('Groupname')
      checkbox: true
      type: 'schoolclass'

    printergroup:
      typename: gettext('Printer')
      checkbox: true
      type: 'printergroup'

    project:
      typename: gettext('Projects')
      checkbox: true
      type: 'project'
  }

  $scope.sorts = [
    {
      name: gettext('Groupname')
      fx: (x) -> x.groupname
    }
    {
      name: gettext('Membership')
      fx: (x) -> x.membership
    }
  ]
  $scope.sort = $scope.sorts[0]
  $scope.sortReverse= false
  $scope.paging =
    page: 1
    pageSize: 20

  $scope.isActive = (group) ->
    if  group.type is 'printergroup'
      if $scope.types.printergroup.checkbox is true
        return true
    if  group.type is 'schoolclass'
      if $scope.types.schoolclass.checkbox is true
        return true
    if  group.type is 'project'
      if $scope.types.schoolclass.checkbox is true
        return true
    return false

  $scope.checkInverse = (sort ,currentSort) ->
    if sort == currentSort
      $scope.sortReverse = !$scope.sortReverse
    else
      $scope.sortReverse = false

  $scope.resetClass = () ->
# reset html class back (remove changed) so its not highlighted anymore
    result = document.getElementsByClassName("changed")
    while result.length
      result[0].className = result[0].className.replace( /(?:^|\s)changed(?!\S)/g , '' )
    # reset $scope.group attribute back not not changed so an additional enroll will not set these groups again
    for group in $scope.groups
      group['changed']= false
    return


  $scope.groupChanged = (item) ->
    for group in $scope.groups
      if group['groupname'] == item
        group['changed'] = !group['changed']

  $scope.filterGroupType = (val) ->
    return (dict) ->
      dict['type'] == val

  $scope.getGroups = (username) ->
    $http.post('/api/lmn/groupmembership', {action: 'list-groups', username: username, profil: $scope.identity.profile}).then (resp) ->
      $scope.groups = resp.data[0]
      $scope.identity.isAdmin = resp.data[1]
      $scope.classes = $scope.groups.filter($scope.filterGroupType('schoolclass'))
      $scope.projects = $scope.groups.filter($scope.filterGroupType('project'))
      $scope.printers = $scope.groups.filter($scope.filterGroupType('printergroup'))

  $scope.setGroups = (groups) ->
    $http.post('/api/lmn/groupmembership', {action: 'set-groups', username:$scope.identity.user, groups: groups, profil: $scope.identity.profile}).then (resp) ->
      if resp['data'][0] == 'ERROR'
        notify.error (resp['data'][1])
      if resp['data'][0] == 'LOG'
        notify.success gettext(resp['data'][1])
        $scope.resetClass()
        identity.init().then () ->
          $scope.getGroups($scope.identity.user)
      if resp.data == 0
        notify.success gettext("Nothing changed")

  $scope.createProject = () ->
    messagebox.prompt(gettext('Project Name'), '').then (msg) ->
      if not msg.value
        return
      test = validation.isValidProjectName(msg.value)
      if test != true
        notify.error gettext(test)
        return
      $http.post('/api/lmn/groupmembership', {action: 'create-project', username:$scope.identity.user, project: msg.value, profil: $scope.identity.profile}).then (resp) ->
        notify.success gettext('Project Created')
        $scope.getGroups ($scope.identity.user)

  $scope.showGroupDetails = (index, groupType, groupName) ->
    $uibModal.open(
      templateUrl: '/lmn_groupmembership:resources/partial/groupDetails.modal.html'
      controller:  'LMNGroupDetailsController'
      size: 'lg'
      resolve:
        groupType: () -> groupType
        groupName: () -> groupName
    ).result.then (result)->
      if result.response is 'refresh'
        $scope.getGroups ($scope.identity.user)

  $scope.projectIsJoinable = (project) ->
    return project['joinable'] == 'TRUE' or project.admin or $scope.identity.isAdmin or $scope.identity.profile.memberOf.indexOf(project['DN']) > -1

  $scope.$watch 'identity.user', ->
    if $scope.identity.user is undefined
      return
    if $scope.identity.user is null
      return
    if $scope.identity.user is 'root'
# $scope.identity.user = 'hulk'
      return
    $scope.getGroups($scope.identity.user)
    return

angular.module('lmn.groupmembership').controller 'LMNGroupDetailsController', ($scope, $route, $uibModal, $uibModalInstance, $http, gettext, notify, messagebox, pageTitle, groupType, groupName) ->

        $scope.showAdminDetails = true
        $scope.showMemberDetails = true
        $scope.changeState = false

        $scope.hidetext = gettext("Hide")
        $scope.showtext = gettext("Show")

        $scope.changeJoin = (group, type) ->
            $scope.changeState = true
            option = if $scope.joinable then '--join' else '--nojoin'
            $http.post('/api/lmn/changeGroup', {option: option, group: group, type: type}).then (resp) ->
                if resp['data'][0] == 'ERROR'
                    notify.error (resp['data'][1])
                if resp['data'][0] == 'LOG'
                    notify.success gettext(resp['data'][1])
                $scope.changeState = false

        $scope.changeHide = (group, type) ->
            $scope.changeState = true
            option = if $scope.hidden then '--hide' else '--nohide'
            $http.post('/api/lmn/changeGroup', {option: option, group: group, type: type}).then (resp) ->
                if resp['data'][0] == 'ERROR'
                    notify.error (resp['data'][1])
                if resp['data'][0] == 'LOG'
                    notify.success gettext(resp['data'][1])
                $scope.changeState = false

        $scope.killProject = (project) ->
             messagebox.show(text: "Do you really want to delete '#{project}'? This can't be undone!", positive: 'Delete', negative: 'Cancel').then () ->
                msg = messagebox.show(progress: true)
                $http.post('/api/lmn/groupmembership', {action: 'kill-project', username:$scope.identity.user, project: project, profil: $scope.identity.profile}).then (resp) ->
                    if resp['data'][0] == 'ERROR'
                        notify.error (resp['data'][1])
                    if resp['data'][0] == 'LOG'
                        notify.success gettext(resp['data'][1])
                        $uibModalInstance.close(response: 'refresh')
                .finally () ->
                    msg.close()

        $scope.nevertext = gettext('Never')

        $scope.formatDate = (date) ->
            if (date == "19700101000000.0Z")
                return $scope.nevertext
            else if (date == undefined)
                return "undefined"
            else
                # Sophomorix date format is yyyyMMddhhmmss.0Z
                year  = date.slice(0,4)
                month = +date.slice(4,6) - 1 # Month start at 0
                day   = date.slice(6,8)
                hour  = date.slice(8,10)
                min   = date.slice(10,12)
                sec   = date.slice(12,14)
                return new Date(year, month, day, hour, min, sec)

        $scope.getGroupDetails = (group) ->
            groupType = group[0]
            groupName = group[1]
            $http.post('/api/lmn/groupmembership/details', {action: 'get-specified', groupType: groupType, groupName: groupName}).then (resp) ->
                $scope.groupName    = groupName
                $scope.groupDetails = resp.data['GROUP'][groupName]
                $scope.adminList = resp.data['GROUP'][groupName]['sophomorixAdmins']
                $scope.groupmemberlist = resp.data['GROUP'][groupName]['sophomorixMemberGroups']
                $scope.groupadminlist = resp.data['GROUP'][groupName]['sophomorixAdminGroups']

                $scope.members = []
                for name,member of resp.data['MEMBERS'][groupName]
                    if member.sn != "null" # group member 
                        $scope.members.push({'sn':member.sn, 'givenName':member.givenName, 'login': member.sAMAccountName, 'sophomorixAdminClass':member.sophomorixAdminClass})

                $scope.admins = []
                for admin in $scope.adminList
                    member = resp.data['MEMBERS'][groupName][admin]
                    $scope.admins.push({'sn':member.sn, 'givenName':member.givenName, 'sophomorixAdminClass':member.sophomorixAdminClass, 'login': member.sAMAccountName})

                $scope.joinable = resp.data['GROUP'][groupName]['sophomorixJoinable'] == 'TRUE'
                $scope.hidden = resp.data['GROUP'][groupName]['sophomorixHidden'] == 'TRUE'

                # Admin or admin of the project can edit members of a project
                # Only admins can change hide and join option for a class
                if $scope.identity.isAdmin
                    $scope.editMembersButton = true
                else if (groupType == "project") and ($scope.adminList.indexOf($scope.identity.user) != -1 or $scope.groupadminlist.indexOf($scope.identity.profile.sophomorixAdminClass) != -1)
                    $scope.editMembersButton = true
                else
                    $scope.editMembersButton = false

        $scope.addMember = (user) ->
            $http.post('/api/lmn/groupmembership/membership', {action: 'addmembers', entity: user.login, project: groupName}).then (resp) ->
                if resp['data'][0] == 'ERROR'
                    notify.error (resp['data'][1])
                if resp['data'][0] == 'LOG'
                    notify.success gettext(resp['data'][1])
                    $scope.members.push(user)

        $scope.removeMember = (user) ->
            $http.post('/api/lmn/groupmembership/membership', {action: 'removemembers', entity: user.login, project: groupName}).then (resp) ->
                if resp['data'][0] == 'ERROR'
                  notify.error (resp['data'][1])
                if resp['data'][0] == 'LOG'
                  notify.success gettext(resp['data'][1])
                  position = $scope.members.indexOf(user)
                  $scope.members.splice(position, 1)

        $scope.addAdmin = (user) ->
            $http.post('/api/lmn/groupmembership/membership', {action: 'addadmins', entity: user.login, project: groupName}).then (resp) ->
                if resp['data'][0] == 'ERROR'
                    notify.error (resp['data'][1])
                if resp['data'][0] == 'LOG'
                    notify.success gettext(resp['data'][1])
                    $scope.admins.push(user)

        $scope.removeAdmin = (user) ->
            $http.post('/api/lmn/groupmembership/membership', {action: 'removeadmins', entity: user.login, project: groupName}).then (resp) ->
                if resp['data'][0] == 'ERROR'
                  notify.error (resp['data'][1])
                if resp['data'][0] == 'LOG'
                  notify.success gettext(resp['data'][1])
                  position = $scope.admins.indexOf(user)
                  $scope.admins.splice(position, 1)

        $scope.addMemberGroup = (group) ->
            $http.post('/api/lmn/groupmembership/membership', {action: 'addmembergroups', entity: group, project: groupName}).then (resp) ->
                if resp['data'][0] == 'ERROR'
                    notify.error (resp['data'][1])
                if resp['data'][0] == 'LOG'
                    notify.success gettext(resp['data'][1])
                    $scope.groupmemberlist.push(group)

        $scope.removeMemberGroup = (group) ->
            $http.post('/api/lmn/groupmembership/membership', {action: 'removeadmingroups', entity: group, project: groupName}).then (resp) ->
                if resp['data'][0] == 'ERROR'
                  notify.error (resp['data'][1])
                if resp['data'][0] == 'LOG'
                  notify.success gettext(resp['data'][1])
                  position = $scope.groupadminlist.indexOf(group)
                  $scope.groupmemberlist.splice(position, 1)

        $scope.addAdminGroup = (group) ->
            $http.post('/api/lmn/groupmembership/membership', {action: 'addadmingroups', entity: group, project: groupName}).then (resp) ->
                if resp['data'][0] == 'ERROR'
                    notify.error (resp['data'][1])
                if resp['data'][0] == 'LOG'
                    notify.success gettext(resp['data'][1])
                    $scope.groupadminlist.push(group)

        $scope.removeAdminGroup = (group) ->
            $http.post('/api/lmn/groupmembership/membership', {action: 'removeadmingroups', entity: group, project: groupName}).then (resp) ->
                if resp['data'][0] == 'ERROR'
                  notify.error (resp['data'][1])
                if resp['data'][0] == 'LOG'
                  notify.success gettext(resp['data'][1])
                  position = $scope.groupadminlist.indexOf(group)
                  $scope.groupadminlist.splice(position, 1)

        $scope.demoteGroup = (group) ->
            $scope.removeAdminGroup(group)
            $scope.addMemberGroup(group)

        $scope.demoteMember = (user) ->
            $scope.removeAdmin(user)
            $scope.addMember(user)

        $scope.elevateGroup = (group) ->
            $scope.removeMemberGroup(group)
            $scope.addAdminGroup(group)

        $scope.elevateMember = (user) ->
            $scope.removeMember(user)
            $scope.addAdmin(user)

        $scope.groupType = groupType
        $scope.getGroupDetails ([groupType, groupName])
        $scope.close = () ->
            $uibModalInstance.dismiss()



