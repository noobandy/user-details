"use strict";
(function() {

	angular.module("UserDetailsApp", ["ngMessages", "ui.router", "anandmCollection"]);

	angular.module("UserDetailsApp").config(function($urlRouterProvider, $stateProvider) {

		$urlRouterProvider.otherwise("/");

		$stateProvider.state("home", {
			url: "/",
			templateUrl: "assets/templates/home.html"
		}).state("about", {
			url: "/about",
			templateUrl: "assets/templates/about.html"
		}).state("users", {
			url: "/users",
			template: "<user-list></user-list>"
		}).state("user-details", {
			url: "/users/:id",
			template: "<user-details></user-details>"
		});

	});

	//custom validation directive for value equality check
	angular.module("UserDetailsApp").directive("udMatchValue", function() {
		return {
			restrict: "A",
			require: 'ngModel',
			link: function(scope, element, attrs, controller) {
				controller.$validators.udMatchValue = function(modelValue, viewValue) {
					if (controller.$isEmpty(modelValue)) {
						return true;
					}
					return attrs.udMatchValue == viewValue;
				};
			}
		};
	});

	  // cutom validation directive for username availability
	angular.module("UserDetailsApp").directive("udUsernameAvailable", function($q, $timeout, userCollection) {
	  	return {
	  		restrict: "A",
	  		require: 'ngModel',
	  		link: function(scope, element, attrs, controller) {
	  			var users = userCollection.list();
	  			controller.$asyncValidators.udUsernameAvailable = function(modelValue, viewValue) {
	  				var deffered = $q.defer();

	  				$timeout(function() {
	  					var found = false;
	  					// Mock a delayed response
	  					for(var i = 0; i < users.length; i++) {
	  						if(users[i].username == modelValue) {
	  							found = true;
	  							break;
	  						}
	  					}

	  					if (!found) {
	  						// The username is available
	  						deffered.resolve();
	  					} else {
	  						deffered.reject();
	  					}
	  			}, 1000);
	  				return deffered.promise;
	  			};
	  		}
	  	};
	});

	//age filter

	angular.module("UserDetailsApp").filter("age", function($interpolate) {
		var now = new Date();
		return function(dob,template) {
			var data = {};
			data.ageYear = now.getYear() - dob.getYear();
			data.ageMonth = now.getMonth() - dob.getMonth();
			data.ageDays = now.getDate() - dob.getDate();
			var exp = $interpolate(template);

			return exp(data);
		}
	});

	//user colledction
	angular.module("UserDetailsApp").factory("userCollection", function(collection) {
		return collection("users", {
			dob: {
				type: "date"
			}
		});
	});

//reusable navabr component
	angular.module("UserDetailsApp").component("navbar", {
		bindings: {
			brand: '<',
			menus: "<",
			inverse: "<?inverse"
		},
		templateUrl: "assets/templates/navbar.html",
		controller : function() {
			var ctrl = this;

			ctrl.onMenuClick = function(menu) {
				ctrl.activeMenu = menu;
			}
		}
	});

	//navbar controller
	angular.module("UserDetailsApp").controller("NavbarController", function() {
		this.brand = {
			name: "MKCL",
			url:"#/",
			logo: "assets/img/MKCL-Logo.jpg"
		};

		this.menus = [{
			name: "Users",
			url: "#/users"
		}, {
			name: "About",
			url: "#/about"
		}];
	});

	//application specific view components
	angular.module("UserDetailsApp").component("userList", {
		templateUrl : "assets/templates/users.html",
		controller: function(userCollection) {
			var self = this;
			this.$onInit = function() {
				self.ageTemplate = "{{ageYear}} years old.";

				self.users = userCollection.list();
			}
		}
	});


	angular.module("UserDetailsApp").component("userDetails", {
		templateUrl: "assets/templates/user-details.html",
		controller: function($stateParams, $state, userCollection) {
			var masterDetails = {
				agreeTotermsAndCondition : true
			};
			
			var self = this;

			this.$onInit = function() {
				self.now = new Date();
				self.countries = [{
					name: "India",
					value: "India"
				}];

				self.alerts = [];
				self.reset();
			}
			
			this.dismisAlert = function(alert) {
				var idx = self.alerts.indexOf(alert);
				if(idx > -1) {
					self.alerts.splice(idx, 1);
				}
			}

			this.reset = function(form) {
				console.log("Reset: ", form);
			

				if ($stateParams.id == 'new') {
					self.userDetails = angular.copy(masterDetails);
				} else {
					//load from store
					self.userDetails = userCollection.find($stateParams.id);
				}
				//reset form
				if(form) {
					 form.$setPristine();
					 form.$setUntouched();
				}
			}

			this.delete = function(userDetails) {
				console.log("Delete: ", userDetails);
				if(userDetails.id) {

					//remove from store
					userCollection.delete(userDetails);
					$state.go("users");

					self.alerts.push({
						type: "Success",
						message: "Data deleted successfully."
					});
				} else {

					self.alerts.push({
						type: "Error",
						message: "Opps! no id."
					});
				}
			}

			this.save = function(userDetails) {
				console.log("Save: ", userDetails);
				//save to store

				userCollection.save(userDetails);

				self.alerts.push({
					type: "Success",
					message: "Data saved successfully."
				});
			}

			
		}
	});


})();