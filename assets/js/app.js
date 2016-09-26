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
	  			}, 2000);
	  				return deffered.promise;
	  			};
	  		}
	  	};
	});


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

	angular.module("UserDetailsApp").factory("userCollection", function(collection) {
		return collection("users", {
			dob: {
				type: "date"
			}
		});
	});

	//
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

				self.reset();
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
				//remove from store
				userCollection.delete(userDetails);
				$state.go("users");
			}

			this.save = function(userDetails) {
				console.log("Save: ", userDetails);
				//save to store

				userCollection.save(userDetails);
			}

			
		}
	});


})();