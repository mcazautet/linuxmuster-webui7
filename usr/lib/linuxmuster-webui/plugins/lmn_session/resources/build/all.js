'use strict';

// the module should depend on 'core' to use the stock Angular components
angular.module('ajenti.demo2', ['core']);

angular.module('ajenti.demo2').config(function ($routeProvider) {
    $routeProvider.when('/view/lmn/session', {
        templateUrl: '/session:resources/index.html',
        controller: 'SessionIndexController'
    });
});

angular.module('ajenti.demo2').controller('Demo2IndexController', function ($scope, notify, pageTitle) {
    pageTitle.set('Demo: UI');

    $scope.counter = 0;

    $scope.click = function () {
        $scope.counter += 1;
        notify.info('+1');
    };
});


