"use strict";
(function() {
	angular.module("anandmCollection",["anandmLocalStorage"]);

	angular.module("anandmCollection").config(["localStorageProvider", function(localStorageProvider) {
		localStorageProvider.setNamespace("db");
	}]);

	angular.module("anandmCollection").factory("collection", ["localStorage", function(localStorage) {

			function collection(name, schema) {
				//helper function
				function indexOf(items, id) {
					for(var i = 0; i < items.length; i++) {
						if(items[i].id == id) {
							return i;
						}
					}
					return -1;
				};

	/*			function preSave(items) {
					for(var i = 0; i < items.length; i++) {
						for(var prop in items[i]) {

							switch(schema[prop].type) {
								case 'date': 
								break;
								case 'datetime':
								break;
								default:
								//do nothing
							}
						}
					}

					return items;
				}*/

				function postRetrieve(items) {
					for(var i = 0; i < items.length; i++) {
						for(var prop in items[i]) {

							if(schema[prop]) {
								switch(schema[prop].type) {
									case 'date': 
										items[i][prop] = new Date(items[i][prop]);
									break;
									case 'datetime':
										items[i][prop] = new Date(items[i][prop]);
									break;
									default:
									//do nothing
								}
							}
						}
					}

					return items;
				}

				var nextId = localStorage.getItem("nextId");

				if(!nextId) {
					nextId = 1;
				}

				return {
					list: function() {
						var items =  localStorage.getItem(name);
							if(!items) {
								items = [];
							} 

						return postRetrieve(items);
					},
					find: function(id) {
						var items = this.list();
						for(var i = 0; i < items.length; i++) {
							if(items[i].id == id) {
								return items[i];
							}
						}
					},
					save: function(item) {
						var items = this.list();
						if(item.id) {
							//update
							var index = indexOf(items, item.id);
							if(index > -1) {
								for(var prop in item) {
									items[index][prop] = item[prop];
								}
							}
						} else {
							//save
							item.id = nextId++;
							items.push(item);
							localStorage.setItem("nextId", nextId);
						}
						//save in local storage
						localStorage.setItem(name, items);
						
					},
					delete: function(item) {

						if(item.id) {
							var items = this.list();
							var index = indexOf(items, item.id);
							if(index > -1) {
								items.splice(index, 1);
							}
							//save in local storage
							localStorage.setItem(name, items);
						}
					}
				};
			}

			return collection;
	}]);
})();