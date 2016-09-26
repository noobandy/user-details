"use strict";
(function(ls) {
	angular.module("anandmLocalStorage", []);

	angular.module("anandmLocalStorage").provider("localStorage", function() {

		function LocalStorage(namespace) {
			this.namespace = namespace;
		}

		LocalStorage.prototype.getItem = function(key) {
			
			var itemValueAsString = ls.getItem(this.namespace+"."+key);
			if(itemValueAsString) {
				return JSON.parse(itemValueAsString);
			}
			return itemValueAsString;
		};

		LocalStorage.prototype.setItem = function(key, item) {
			var itemValueAsString = JSON.stringify(item/*, function(key, value) {
				if(typeof key === 'string' && value instanceof Date) {
					return {
						type: "date",
						time: value.getTime()
					}
				} else {
					return value;
				}
			}*/);

			ls.setItem(this.namespace+"."+key, itemValueAsString);

		};
		//default namespace
		this.namespace = "app";

		this.setNamespace = function(namespace) {
			this.namespace = namespace;
		};

		this.$get = function() {
			return new LocalStorage(this.namespace);
		}
	});
})(window.localStorage);