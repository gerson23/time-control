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
      vm.page = "view/" + page + ".html";
      if (page == 'add_user') {
        vm.newuser = null;
        vm.failed_creation = false;
      }
      else if (page == 'edit_user') {
        vm.edituser = {};
      }
      else if (page == 'projects') {
        vm.get_projects();
      }
      else if (page == 'profile') {
        console.log(vm.profile);
        console.log(vm.user);
      }
    };

    // Add user function
    vm.add_user = function() {
      $http.post('user/add', vm.newuser).then(function(response) {
        vm.failed_creation = false;
        vm.suceed_addition = true;
      }, function(response) {
        res = response.data;
        vm.failed_creation = true;
        vm.suceed_addition = false;
        // check username failure
        if (res.username) {
          vm.failed_username = true;
        }
        else {
          vm.failed_username = false;
        }
        // check project failure
        if (res.project) {
          vm.failed_project = true;
        }
        else {
          vm.failed_project = false;
        }
      });
    };

    // Get user function
    vm.get_user = function() {
      $http.post('user/get', vm.edituser).then(function(response) {
        vm.edituser = response.data.profile;
        vm.edituser.username = response.data.username;
      }, function(response) {
        console.log(response);
      });
    };

    // Delete user function
    vm.delete_user = function() {
      if(confirm("Are you sure you want to delete this user?")) {
        data = {'username': vm.edituser.username};
        $http.post('user/delete', data).then(function(response) {
          vm.edituser = {};
          vm.suceed_deletion = true;
          vm.failed_deletion = false;
        }, function(response) {
          vm.suceed_deletion = false;
          vm.failed_deletion = true;
        });
      }
    };

    // Update user function
    vm.update_user = function() {
      $http.post('user/update', vm.edituser).then(function(response) {
        if (response.data.modified) {
          vm.failed_update = false;
          vm.succeed_half_update = false;
          vm.succeed_update = true;
        }
        else {
          vm.failed_update = false;
          vm.succeed_half_update = true;
          vm.succeed_update = false;
        }
      }, function(response) {
        vm.failed_update = true;
        vm.succeed_half_update = false;
        vm.succeed_update = false;
      });
    };

    // Logout function
    vm.logout = function() {
      vm.profile = null;
      vm.show_login = true;
      vm.show_home = false;
      vm.suceed_login = false;
    };

    // Clear edit user
    vm.clean_edituser = function() {
      register = vm.edituser.register;
      vm.edituser = {};
      vm.edituser.register = register;
    }

    // Get all projects
    vm.get_projects = function() {
      data = {};
      $http.post('project/get', data).then(function(response) {
        vm.projects = response.data.projects;
      }, function(response) {
        console.log(response);
      });
    };

    // Add a new project
    vm.add_project = function() {
      data = {'name': vm.newproject}
      $http.post('project/add', data).then(function(response) {
        vm.get_projects();
        vm.newproject = "";
        vm.failed_creation = false;
        vm.suceed_addition = true;
      }, function(response) {
        vm.failed_creation = true;
        vm.suceed_addition = false;
      });
    };

    // Remove an project
    vm.delete_project = function(name) {
      data = {'name': name};
      $http.post('project/delete', data).then(function(response) {
        vm.get_projects();
        vm.suceed_deletion = true;
        vm.failed_deletion = false;
      }, function(response) {
        vm.suceed_deletion = false;
        vm.failed_deletion = true;
      });
    };

    // Change password
    vm.change_pass = function() {
      if(vm.newpass1 != vm.newpass2) {
        vm.differ_pass = true;
        vm.newpass1 = "";
        vm.newpass2 = "";
      }
      else {
        data = {}
        data.username = vm.user.username;
        data.oldpass = vm.oldpass;
        data.newpass = vm.newpass1;
        $http.post('user/psw', data).then(function(response) {
          vm.succed_pass = true;
          vm.newpass1 = "";
          vm.newpass2 = "";
          vm.oldpass = "";
        }, function(response) {
          console.log(response);
        });
      }
    };
  });
