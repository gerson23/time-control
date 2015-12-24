angular.module("MyApp", ["ui.bootstrap"])
  .controller("MainController", function($location, $http) {
    var vm = this;
    vm.show_login = true;
    vm.show_home = false;

    // Login function
    vm.login = function() {
      $http.post('/login', vm.user).then(function(response) {
        console.log(response);
        vm.profile = response.data;
        vm.failed_login = false;
        vm.suceed_login = true;
        vm.show_login = false;
        vm.show_home = true;
      }, function(response) {
        console.log(response);
        vm.failed_login = true;
      });
    };
  });
