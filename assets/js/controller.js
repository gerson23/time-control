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
      else if (page == 'working_time') {
        var today = new Date();
        // Set time to 8:00:000 AM
        today.setMilliseconds(0);
        today.setSeconds(0);
        today.setMinutes(0);
        today.setHours(8);
        vm.entry_date = new Date(today);
        vm.end_date = new Date(today);
        vm.selected_date = new Date(today);
        vm.date_format = "dd-MMMM-yyyy";
        //vm.get_working();
        vm.worked_time = {};
        vm.worked_time.comment = "";
        vm.get_projects();
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
      data = {'username': vm.edituser.username};
      $http.post('user/delete', data).then(function(response) {
        vm.edituser = {};
        vm.suceed_deletion = true;
        vm.failed_deletion = false;
      }, function(response) {
        vm.suceed_deletion = false;
        vm.failed_deletion = true;
      });
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

    // Update worked_time after a time change
    vm.update_worked = function() {
      vm.worked_time.total = vm.end_date - vm.entry_date;
      if (vm.worked_time.total < 0) {
        h = 0;
        m = 0;
        vm.invalid_hours = true;
      }
      else {
        h = parseInt(vm.worked_time.total / 3600000);
        m = parseInt((vm.worked_time.total % 3600000) / 60000);
        vm.invalid_hours = false;
      }
      vm.worked_time.total_str = h.toString() + "h " + m.toString() + "min";
    };

    // Add working time
    vm.add_working = function() {
      data = {};
      data.usermame = vm.user.username;
      // get miliseconds from epoch
      data.start_time = vm.entry_date.getTime();
      data.end_time = vm.end_date.getTime();
      data.total = vm.worked_time.total;
      data.project = vm.worked_time.project;
      data.comment = vm.worked_time.comment;
      $http.post('user/report/add', data).then(function(response) {
        console.log(response);
      }, function(response) {
        console.log(response);
      });
    };

    vm.get_working = function() {
      $http.post('user/report/get', {'username': vm.user.username}).then(function(response) {
        vm.reports = response.data.reports;
        vm.update_date();
      }, function(response) {
        console.log("ERROU");
      });
    };

    vm.update_date = function() {
      // updating start date and end date to selected day
      vm.entry_date = new Date(vm.selected_date);
      vm.end_date = new Date(vm.selected_date);
      vm.update_worked();

      // verify reported stuff to show
      vm.working_vector = [];
      console.log(vm.reports)
      for(i=0; i < vm.reports.length; i++) {
        report = vm.reports[i];
        date = new Date(report.start_time);
        if((date.getFullYear() == vm.selected_date.getFullYear()) &&
           (date.getMonth() == vm.selected_date.getMonth()) &&
           (date.getDate() == vm.selected_date.getDate())) {
             vm.working_vector.push(report);
           }
      }
    };
  });
