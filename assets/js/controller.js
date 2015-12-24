angular.module("MyApp", ["ui.bootstrap"])
  .controller("MainController", function($location, $http) {
    var vm = this;
    vm.login = function() {
      $http.post('/login', vm.user).then(function(response) {
        console.log(response);
        vm.failed_login = false;
        vm.suceed_login= true;
      }, function(response) {
        console.log(response);
        vm.failed_login = true;
      });
    };
  });
