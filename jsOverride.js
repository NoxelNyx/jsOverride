var Override = function() { 
    /*Private variables*/
		var fxnObjList = []; //Array to hold all override functions created with the .add method of the return object
		var supportedTypes = ['array', 'boolean', 'date', 'error', 'function', 'number', 'object', 'regexp', 'string', 'type', 'xml']; /*Private Methods*/

		function _add(fxn, typeArray) {
			//Parse user input
			if (typeof fxn === "function") {
				//Get the amount of arguments the fxn requires
				var nArgs = fxn.length;
				//Format the typeArray
				typeArray = _parseTypeArray(typeArray, nArgs);
				var isDuplicateTypeArray = _checkTypeArray(typeArray); //This could use a better name, but I'm hung over
				if (!isDuplicateTypeArray) {
					//Store the function
					fxnObjList.push({
						fxn: fxn,
						nArgs: nArgs,
						typeArray: typeArray
					});
				} else {
					postError('There is already an override method with this constructor');
				}
			} else {
				postError('Cannot add type of ' + typeof fxn + ' as a function');
			}
		}

		function _checkTypeArray(typeArray) {
            var isDuplicate = false;
			for (var index in fxnObjList) {
				var existingTypeArray = fxnObjList[index].typeArray;
				if (existingTypeArray.toString() === typeArray.toString()) {
                  isDuplicate = true;
                }
            }
			return isDuplicate;
		}

		function _parseTypeArray(typeArray, nArgs) {
			//Force typeArray to be an array
			typeArray = typeArray || [];
			//If the user passed in anything but an array for their types, cast typeArray to empty array
			if (typeArray.constructor.name !== "Array") {
				typeArray = [];
				postWarning('You did not pass in your types as an array - all types will be casted to null');
			}
			//Format all passed in types, if any
			for (var j in typeArray) {
				var type = typeArray[j];
				if (type === null) {
					typeArray[j] = 'null';
				} else if (typeof type != 'string') {
					//Check if the type if a constructor
					if (type.hasOwnProperty('name') && (typeof type === "function")) {
						typeArray[j] = type.name.toLowerCase();
					} else {
						//Assume the user passed in an example
						typeArray[j] = type.constructor.name.toLowerCase();
					}
				} else if (supportedTypes.indexOf(type.toLowerCase()) != -1) {
					//If this type was found in the supported types keep it as is* (except for casting it to lowercase)
					typeArray[j] = type.toLowerCase();
				} else {
					//We couldn't parse it so cast it to null and let the user know* (if they check the console)
					typeArray[j] = 'null';
					postWarning('Unknown type detected from ' + type + ' - casting to null');
				}
			}

			if (nArgs > typeArray.length) {
				//If typeArray was too short, pad any empty space with 'null's
				for (var i = 0; i < (nArgs); i++) {
					typeArray.push('null');
				}
			} else {
				//If typeArray was too long, truncate it
				typeArray = typeArray.splice(0, nArgs);
			}
			return typeArray;
		}

		function _call(args) {
			var methodCalled = false;
			//Loop over the stored override functions
			for (var index in fxnObjList) {
				var fxnObj = fxnObjList[index];
				//If the argument counts match up
				if (fxnObj.nArgs == args.length) {
					//Run a type comparison
					if (_checkTypes(fxnObj.typeArray, args)) {
						//Call the stored override
						fxnObj.fxn.apply(this, args);
						methodCalled = true;
						break;
					}
				}
			}
			if (!methodCalled) {
				postError('There is no override method that accepts ' + args.length + ' arguments');
			}
		}

		function _checkTypes(typeArray, args) {
			var output = true; //Declare return variable
			if (args.length == typeArray.length) {
				//Loop over the both the argument and type sets
				for (var index in args) {
					var arg = args[index];
					var type = typeArray[index];
					//If the type isn't null we need to do some considering
					if (type != 'null') {
						if (arg === null) {
							//Expected an argument besides null
							output = false;
							break;
						} else if (typeof arg === "undefined") {
							//Uninitalized argument
							output = false;
							break;
						} else if (arg.hasOwnProperty('name') && (typeof arg === 'function')) {
							//The user passed in a constructor
							if (arg.name !== type) {
								//The constructor type was incorrect
								output = false;
								break;
							}
						} else if (arg.constructor.name.toLowerCase() !== type) {
							//The constructor type was incorrect
							output = false;
							break;
						} else {
							continue;
						}
					}
				}
			} else {
				output = false;
				postError('An unexpected error has occurred');
			}
			return output;
		}

		function postMsg(msg) {
			console.info('Msg from jsOverride: ' + msg);
		}

		function postWarning(msg) {
			console.warn('Warning from jsOverride: ' + msg);
		}

		function postError(error) {
			console.error('Error from jsOverride: ' + error);
		}
		var returnObject = function() {
				_call(arguments);
			}; /*Public Variables*/
		/*Public Methods*/
		returnObject.add = function(fxn, typeArray) {
			_add(fxn, typeArray);
			return returnObject;
		};
		returnObject.call = function() {
			_call(arguments);
			return returnObject;
		};
		return returnObject;
	};
