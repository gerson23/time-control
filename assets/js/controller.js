angular.module("MyApp", ["ui.bootstrap"])
  .controller("MainController", function($location, $http) {
    // Initializing variables
    var vm = this;
    vm.show_login = true;
    vm.show_home = false;
    vm.page = null;

    // Login function
    vm.login = function() {
      $http.post('/login', vm.user).then(function(response) {
        vm.profile = response.data;
        vm.failed_login = false;
        vm.suceed_login = true;
        vm.show_login = false;
        vm.show_home = true;
      }, function(response) {
        vm.failed_login = true;
      });
    };

    // Load page function
    vm.load = function(page) {
      vm.page = "view/" + page + ".html"
    };

    // Add user function
    vm.add_user = function() {
      console.log(vm.newuser);
      $http.post('user/add', vm.newuser).then(function(response) {
        console.log("sucess");
      }, function(response) {
        console.log("failure");
        console.log(response.data);
      });
    };
  });
