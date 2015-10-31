"use strict";
module.exports = function() {
	var thisFileName = "command-line.js";
	var fcp = new (require("./file-content-parser.js"))();
	var asp = new (require("./arg-string-parser.js"))();

	this.commandLine = function(commandlineArgs) {
		var args, argString = "";
		var config;

		// generate an argument string
		commandlineArgs.forEach(function(arg){
			if(arg.charCodeAt(0) === 64){
				argString += fcp.parse(arg);
			}else{
				argString += arg + "\n";
			}
		});

		// test for spaces and tabs
		var tokens = argString.split("\n");
		var rx = new RegExp("\t");
		var errors = [];
		tokens.forEach(function(token){
			if(rx.test(token)){
				errors.push("tabs not allowed in command line arguments: '"+token+"';")
			}
		});
		if(errors.length > 0){
			var msg = "command line errors:";
			errors.forEach(function(error){
				msg += "\n" + error;
			});
			throw new Error(msg);
		}
		
		config = asp.parse(argString);
		if (config.fDisplayVerbose === true) {
			config.fDisplayAst = true;
			config.fDisplayAttributes = true;
			config.fDisplayGrammar = true;
			config.fDisplayGrammarStats = true;
			config.fDisplayConfig = true;
			config.fDisplayRules = true;
			config.fDisplayState = true;
			config.fDisplayWarnings = true;
		}
		return config;
	}
}
