// Generated by CoffeeScript 2.3.1
(function() {
  angular.module('lm.linbo', ['core', 'lm.common', 'angular-sortable-view']);

}).call(this);

// Generated by CoffeeScript 2.3.1
(function() {
  var isValidName;

  isValidName = function(name) {
    var regExp, validName;
    regExp = /^[a-z0-9]*$/i;
    validName = regExp.test(name);
    return validName;
  };

  angular.module('lm.linbo').config(function($routeProvider) {
    return $routeProvider.when('/view/lm/linbo', {
      controller: 'LMLINBOController',
      templateUrl: '/lm_linbo:resources/partial/index.html'
    });
  });

  angular.module('lm.linbo').controller('LMLINBOAcceptModalController', function($scope, $uibModalInstance, $http, partition, disk) {
    $scope.partition = partition;
    $scope.disk = disk;
    $scope.save = function() {
      return $uibModalInstance.close({
        response: 'accept'
      });
    };
    return $scope.close = function() {
      return $uibModalInstance.dismiss();
    };
  });

  angular.module('lm.linbo').controller('LMLINBOPartitionModalController', function($scope, $uibModalInstance, $http, partition, os) {
    $scope.partition = partition;
    $scope.os = os;
    $http.get('/api/lm/linbo/icons').then(function(resp) {
      return $scope.icons = resp.data;
    });
    $http.get('/api/lm/linbo/images').then(function(resp) {
      var i, len, oses, results;
      $scope.images = [];
      $scope.diffImages = [];
      oses = resp.data;
      results = [];
      for (i = 0, len = oses.length; i < len; i++) {
        os = oses[i];
        if (os.cloop) {
          $scope.images.push(os.name);
        }
        if (os.rsync) {
          results.push($scope.diffImages.push(os.name));
        } else {
          results.push(void 0);
        }
      }
      return results;
    });
    $scope.save = function() {
      return $uibModalInstance.close({
        partition: $scope.partition,
        os: $scope.os
      });
    };
    return $scope.close = function() {
      return $uibModalInstance.dismiss();
    };
  });

  angular.module('lm.linbo').controller('LMLINBOImageModalController', function($scope, $uibModal, $uibModalInstance, $http, gettext, filesystem, messagebox, image, images) {
    var x;
    $scope.image = image;
    $scope.imagesWithReg = (function() {
      var i, len, results;
      results = [];
      for (i = 0, len = images.length; i < len; i++) {
        x = images[i];
        if (x.reg) {
          results.push(x);
        }
      }
      return results;
    })();
    $scope.imagesWithPostsync = (function() {
      var i, len, results;
      results = [];
      for (i = 0, len = images.length; i < len; i++) {
        x = images[i];
        if (x.postsync) {
          results.push(x);
        }
      }
      return results;
    })();
    $http.get('/api/lm/linbo/examples-regs').then(function(resp) {
      return $scope.exampleRegs = resp.data;
    });
    $scope.setExampleReg = function(name) {
      return filesystem.read(`/srv/linbo/examples/${name}`).then(function(content) {
        return $scope.image.reg = content;
      });
    };
    $http.get('/api/lm/linbo/examples-postsyncs').then(function(resp) {
      return $scope.examplePostsyncs = resp.data;
    });
    $scope.setExamplePostsync = function(name) {
      return filesystem.read(`/srv/linbo/examples/${name}`).then(function(content) {
        return $scope.image.postsync = content;
      });
    };
    $scope.save = function() {
      return $uibModalInstance.close(image);
    };
    return $scope.close = function() {
      return $uibModalInstance.dismiss();
    };
  });

  angular.module('lm.linbo').controller('LMLINBOConfigModalController', function($scope, $uibModal, $uibModalInstance, $timeout, $http, $log, gettext, messagebox, config, lmFileBackups) {
    var DiskType, _device, _partition, disk, diskMap, i, j, len, len1, ref, ref1;
    $scope.config = config;
    $scope.kernelOptions = ['quiet', 'splash', 'acpi=noirq', 'acpi=off', 'irqpoll', 'dhcpretry=9'];
    $scope.colors = ['white', 'black', 'lightCyan', 'cyan', 'darkCyan', 'orange', 'red', 'darkRed', 'pink', 'magenta', 'darkMagenta', 'lightGreen', 'green', 'darkGreen', 'lightYellow', 'yellow', 'gold', 'lightBlue', 'blue', 'darkBlue', 'lightGray', 'gray', 'darkGray'];
    $scope.disks = [];
    diskMap = {};
    $http.get('/api/lm/linbo/images').then(function(resp) {
      return $scope.oses = resp.data;
    });
    ref = config.partitions;
    for (i = 0, len = ref.length; i < len; i++) {
      _partition = ref[i];
      // Determine the position of the partition integer.
      // Different devices have it on a different position
      if (_partition['Dev'].indexOf("nvme") !== -1) {
        _device = _partition.Dev.substring(0, '/dev/nvme0n1p'.length);
      }
      if (_partition['Dev'].indexOf("mmcblk") !== -1) {
        _device = _partition.Dev.substring(0, '/dev/mmcblk0p'.length);
      }
      if (_partition['Dev'].indexOf("sd") !== -1) {
        _device = _partition.Dev.substring(0, '/dev/sdX'.length);
      }
      if (!diskMap[_device]) {
        if (_device.indexOf("sd") !== -1) {
          DiskType = 'sata';
        }
        if (_device.indexOf("mmcblk") !== -1) {
          DiskType = 'mmc';
        }
        if (_device.indexOf("nvme") !== -1) {
          DiskType = 'nvme';
        }
        diskMap[_device] = {
          name: _device,
          partitions: [],
          DiskType: DiskType
        };
        $scope.disks.push(diskMap[_device]);
      }
      diskMap[_device].partitions.push(_partition);
      _partition._isCache = _partition.Dev === config.config.LINBO.Cache;
    }
    ref1 = $scope.disks;
    for (j = 0, len1 = ref1.length; j < len1; j++) {
      disk = ref1[j];
      disk.partitions.sort(function(a, b) {
        if (a.Dev > b.Dev) {
          return 1;
        } else {
          return -1;
        }
      });
    }
    $scope.getAllInfo = function() {
      console.log($scope.disks);
      console.log($scope.config);
      return console.log($scope.diskMap);
    };
    $scope.updateDiskType = function(disk, newDiskType) {
      var oldDiskName;
      oldDiskName = disk.name;
      if (newDiskType === 'sata') {
        disk.name = 'a';
        while (true) {
          if (diskMap[`/dev/sd${disk.name}`]) {
            disk.name = String.fromCharCode(disk.name.charCodeAt(0) + 1);
            continue;
          }
          break;
        }
        disk.name = `/dev/sd${disk.name}`;
      }
      if (newDiskType === 'mmc') {
        disk.name = '0';
        while (true) {
          if (diskMap[`/dev/mmcblk${disk.name}p`]) {
            disk.name = String.fromCharCode(disk.name.charCodeAt(0) + 1);
            continue;
          }
          break;
        }
        disk.name = `/dev/mmcblk${disk.name}p`;
      }
      if (newDiskType === 'nvme') {
        disk.name = '0';
        while (true) {
          if (diskMap[`/dev/nvme${disk.name}n1p`]) {
            disk.name = String.fromCharCode(disk.name.charCodeAt(0) + 1);
            continue;
          }
          break;
        }
        disk.name = `/dev/nvme${disk.name}n1p`;
      }
      //diskMap
      $scope.rebuildDisks();
      // create new object with the actual diskname
      diskMap[disk.name] = disk;
      // remove the old diskname
      return delete diskMap[oldDiskName];
    };
    $scope.addDisk = function() {
      disk = 'a';
      while (true) {
        if (diskMap[`/dev/sd${disk}`]) {
          disk = String.fromCharCode(disk.charCodeAt(0) + 1);
          continue;
        }
        break;
      }
      disk = `/dev/sd${disk}`;
      diskMap[disk] = {
        name: disk,
        partitions: [],
        DiskType: 'sata'
      };
      return $scope.disks.push(diskMap[disk]);
    };
    $scope.removeDisk = function(disk) {
      delete diskMap[disk.name];
      return $scope.disks.remove(disk);
    };
    $scope.getSize = function(partition) {
      var ps, s;
      if (!partition.Size || !partition.Size.toLowerCase) {
        return;
      }
      ps = partition.Size.toLowerCase();
      s = parseInt(ps) * 1024;
      if (ps[ps.length - 1] === 'm') {
        s *= 1024;
      }
      if (ps[ps.length - 1] === 'g') {
        s *= 1024 * 1024;
      }
      if (ps[ps.length - 1] === 't') {
        s *= 1024 * 1024 * 1024;
      }
      return s;
    };
    $scope.isSwapPartition = function(partition) {
      return partition.FSType === 'swap';
    };
    $scope.isCachePartition = function(partition) {
      return partition.Dev === config.config.LINBO.Cache;
    };
    $scope.getOS = function(partition) {
      var k, len2, os, ref2;
      ref2 = config.os;
      for (k = 0, len2 = ref2.length; k < len2; k++) {
        os = ref2[k];
        if (os.Root === partition.Dev) {
          return os;
        }
      }
      return null;
    };
    $scope.getName = function(partition) {
      if ($scope.getOS(partition) && $scope.getOS(partition).Name) {
        return $scope.getOS(partition).Name;
      }
      if (partition.Label) {
        return partition.Label;
      }
      if ($scope.isSwapPartition(partition)) {
        return gettext('Swap');
      }
      if (partition._isCache) {
        return gettext('LINBO Cache');
      }
      if (partition.Id === 'ef') {
        return 'EFI';
      }
      if (partition.Id === '0c01') {
        return 'MSR';
      }
      if (partition.Label) {
        return partition.Label;
      }
      return 'Partition';
    };
    $scope.addSwap = function(disk) {
      disk.partitions.push({
        Bootable: false,
        FSType: 'swap',
        Id: '82',
        Size: '4G',
        Label: ''
      });
      return $scope.rebuildDisks();
    };
    $scope.addData = function(disk) {
      disk.partitions.push({
        Bootable: false,
        FSType: 'ntfs',
        Id: '7',
        Size: '10G',
        Label: ''
      });
      return $scope.rebuildDisks();
    };
    $scope.addEFI = function(disk) {
      disk.partitions.splice(0, 0, {
        Bootable: true,
        FSType: 'vfat',
        Id: 'ef',
        Size: 1024 * 200,
        Label: ''
      });
      return $scope.rebuildDisks();
    };
    $scope.addMSR = function(disk) {
      disk.partitions.splice(1, 0, {
        Bootable: false,
        FSType: '',
        Id: '0c01',
        Size: 1024 * 128,
        Label: ''
      });
      return $scope.rebuildDisks();
    };
    $scope.addExtended = function(disk) {
      disk.partitions.push({
        Bootable: false,
        FSType: '',
        Id: '5',
        Size: '',
        Label: ''
      });
      return $scope.rebuildDisks();
    };
    $scope.addCache = function(disk) {
      disk.partitions.push({
        Bootable: true,
        FSType: 'ext4',
        Id: '83',
        Size: '',
        Label: '',
        _isCache: true
      });
      return $scope.rebuildDisks();
    };
    $scope.addWindows = function(disk) {
      var partition;
      partition = {
        Bootable: true,
        FSType: 'ntfs',
        Id: '7',
        Size: '40G',
        Label: ''
      };
      disk.partitions.push(partition);
      $scope.rebuildDisks();
      return $scope.config.os.push({
        Name: 'Windows 10',
        Version: '',
        Description: 'Windows 10',
        IconName: 'win10.png',
        Image: '',
        BaseImage: '',
        Root: partition.Dev,
        Boot: partition.Dev,
        Kernel: 'auto',
        Initrd: '',
        Append: '',
        StartEnabled: true,
        SyncEnabled: true,
        NewEnabled: true,
        Hidden: true,
        Autostart: false,
        AutostartTimeout: 5,
        DefaultAction: 'sync'
      });
    };
    $scope.addLinux = function(disk) {
      var partition;
      partition = {
        Bootable: true,
        FSType: 'ext4',
        Id: '83',
        Size: '20G',
        Label: ''
      };
      disk.partitions.push(partition);
      $scope.rebuildDisks();
      return $scope.config.os.push({
        Name: 'Ubuntu',
        Version: '',
        Description: 'Ubuntu 16.04',
        IconName: 'ubuntu.png',
        Image: '',
        BaseImage: '',
        Root: partition.Dev,
        Boot: partition.Dev,
        Kernel: 'vmlinuz',
        Initrd: 'initrd.img',
        Append: 'ro splash',
        StartEnabled: true,
        SyncEnabled: true,
        NewEnabled: true,
        Hidden: true,
        Autostart: false,
        AutostartTimeout: 5,
        DefaultAction: 'sync'
      });
    };
    $scope.removePartition = function(partition, disk) {
      return $uibModal.open({
        templateUrl: '/lm_linbo:resources/partial/accept.modal.html',
        controller: 'LMLINBOAcceptModalController',
        resolve: {
          partition: function() {
            return angular.copy(partition.Dev);
          },
          disk: function() {
            return angular.copy(disk);
          }
        }
      }).result.then(function(result) {
        if (result.response === 'accept') {
          disk.partitions.remove(partition);
          return $scope.rebuildDisks();
        }
      });
    };
    $scope.rebuildDisks = function() {
      var k, l, len2, len3, len4, m, newDev, os, partition, partitionIndex, ref2, ref3, ref4, remap, results;
      remap = {};
      ref2 = $scope.disks;
      for (k = 0, len2 = ref2.length; k < len2; k++) {
        disk = ref2[k];
        partitionIndex = 1;
        ref3 = disk.partitions;
        for (l = 0, len3 = ref3.length; l < len3; l++) {
          partition = ref3[l];
          newDev = `${disk.name}${partitionIndex}`;
          if (partition.Dev) {
            remap[partition.Dev] = newDev;
          }
          partition.Dev = newDev;
          partitionIndex++;
          if (partition._isCache) {
            config.config.LINBO.Cache = partition.Dev;
          }
        }
      }
      $log.log('Remapping OSes', remap);
      ref4 = config.os;
      results = [];
      for (m = 0, len4 = ref4.length; m < len4; m++) {
        os = ref4[m];
        if (os.Boot) {
          os.Boot = remap[os.Boot];
        }
        if (os.Root) {
          results.push(os.Root = remap[os.Root]);
        } else {
          results.push(void 0);
        }
      }
      return results;
    };
    $scope.getBorderColor = function(partition) {
      if ($scope.isCachePartition(partition)) {
        return '#F3E000';
      }
      if ($scope.isSwapPartition(partition)) {
        return '#E09305';
      }
      if (partition.Id === 'ef') {
        return '#737373';
      }
      if (partition.Id === '0c01') {
        return '#737373';
      }
      if ($scope.getOS(partition)) {
        return '#3232B7';
      }
      return '#58B158';
    };
    $scope.addKernelOption = function(option) {
      return $scope.config.config.LINBO.KernelOptions += ' ' + option;
    };
    $scope.editPartition = function(partition) {
      var os;
      os = $scope.getOS(partition);
      return $uibModal.open({
        templateUrl: '/lm_linbo:resources/partial/partition.modal.html',
        controller: 'LMLINBOPartitionModalController',
        resolve: {
          partition: function() {
            return angular.copy(partition);
          },
          os: function() {
            return angular.copy(os);
          }
        }
      }).result.then(function(result) {
        angular.copy(result.partition, partition);
        if (os) {
          angular.copy(result.os, os);
        }
        return $scope.rebuildDisks();
      });
    };
    $scope.save = function() {
      var k, l, len2, len3, partition, ref2, ref3;
      config.partitions = [];
      ref2 = $scope.disks;
      for (k = 0, len2 = ref2.length; k < len2; k++) {
        disk = ref2[k];
        ref3 = disk.partitions;
        for (l = 0, len3 = ref3.length; l < len3; l++) {
          partition = ref3[l];
          config.partitions.push(partition);
        }
      }
      return $uibModalInstance.close(config);
    };
    $scope.backups = function() {
      return lmFileBackups.show('/srv/linbo/start.conf.' + $scope.config.config.LINBO.Group).then(function() {
        return $uibModalInstance.dismiss();
      });
    };
    return $scope.close = function() {
      return $uibModalInstance.dismiss();
    };
  });

  angular.module('lm.linbo').controller('LMLINBOController', function($scope, $http, $uibModal, $log, $route, gettext, notify, pageTitle, tasks, messagebox) {
    pageTitle.set(gettext('LINBO'));
    $http.get('/api/lm/linbo/configs').then(function(resp) {
      return $scope.configs = resp.data;
    });
    $http.get('/api/lm/linbo/examples').then(function(resp) {
      return $scope.examples = resp.data;
    });
    $http.get('/api/lm/linbo/images').then(function(resp) {
      return $scope.images = resp.data;
    });
    $scope.createConfig = function(example) {
      return messagebox.prompt('New name', '').then(function(msg) {
        var newName;
        newName = msg.value;
        if (!isValidName(newName)) {
          notify.error(gettext('Not a valid name! Only alphanumeric characters are allowed!'));
          return;
        }
        if (newName) {
          if (example) {
            return $http.get(`/api/lm/linbo/config/examples/${example}`).then(function(resp) {
              resp.data['config']['LINBO']['Group'] = newName;
              return $http.post(`/api/lm/linbo/config/start.conf.${newName}`, resp.data).then(function() {
                return $route.reload();
              });
            });
          } else {
            return $http.post(`/api/lm/linbo/config/start.conf.${newName}`, {
              config: {
                LINBO: {
                  Group: newName
                }
              },
              os: [],
              partitions: []
            }).then(function() {
              return $route.reload();
            });
          }
        }
      });
    };
    $scope.deleteConfig = function(configName) {
      return messagebox.prompt({
        text: `Delete '${configName}'?`,
        positive: 'Delete',
        negative: 'Cancel'
      }).then(function() {
        return $http.delete(`/api/lm/linbo/config/${configName}`).then(function() {
          return $route.reload();
        });
      });
    };
    $scope.duplicateConfig = function(configName) {
      var newName;
      newName = configName.substring('start.conf.'.length);
      return messagebox.prompt('New name', newName).then(function(msg) {
        newName = msg.value;
        if (newName) {
          return $http.get(`/api/lm/linbo/config/${configName}`).then(function(resp) {
            resp.data.config.LINBO.Group = newName;
            return $http.post(`/api/lm/linbo/config/start.conf.${newName}`, resp.data).then(function() {
              return $route.reload();
            });
          });
        }
      });
    };
    $scope.editConfig = function(configName) {
      return $http.get(`/api/lm/linbo/config/${configName}`).then(function(resp) {
        var config;
        config = resp.data;
        return $uibModal.open({
          templateUrl: '/lm_linbo:resources/partial/config.modal.html',
          controller: 'LMLINBOConfigModalController',
          size: 'lg',
          resolve: {
            config: function() {
              return config;
            }
          }
        }).result.then(function(result) {
          return $http.post(`/api/lm/linbo/config/${configName}`, result).then(function(resp) {
            return notify.success(gettext('Saved'));
          });
        });
      });
    };
    $scope.deleteImage = function(image) {
      return messagebox.show({
        text: `Delete '${image.name}'?`,
        positive: 'Delete',
        negative: 'Cancel'
      }).then(function() {
        return $http.delete(`/api/lm/linbo/image/${image.name}`).then(function() {
          return $route.reload();
        });
      });
    };
    $scope.duplicateImage = function(image) {
      return messagebox.prompt('New name', image.name).then(function(msg) {
        var newFileName, newName;
        newName = msg.value;
        if (newName) {
          newFileName = newName;
          if (!newFileName.endsWith('.cloop') && !newFileName.endsWith('.rsync')) {
            newFileName += image.cloop ? '.cloop' : '.rsync';
          }
          tasks.start('aj.plugins.filesystem.tasks.Transfer', [], {
            destination: `/srv/linbo/${newFileName}`,
            items: [
              {
                mode: 'copy',
                item: {
                  name: image.name,
                  path: `/srv/linbo/${image.name}`
                }
              }
            ]
          });
          image = angular.copy(image);
          image.name = newFileName;
          return $http.post(`/api/lm/linbo/image/${image.name}`, image).then(function() {
            return $scope.images.push(image);
          });
        }
      });
    };
    return $scope.editImage = function(image) {
      return $uibModal.open({
        templateUrl: '/lm_linbo:resources/partial/image.modal.html',
        controller: 'LMLINBOImageModalController',
        resolve: {
          image: function() {
            return angular.copy(image);
          },
          images: function() {
            return $scope.images;
          }
        }
      }).result.then(function(result) {
        angular.copy(result, image);
        return $http.post(`/api/lm/linbo/image/${image.name}`, result).then(function(resp) {
          return notify.success(gettext('Saved'));
        });
      });
    };
  });

}).call(this);

