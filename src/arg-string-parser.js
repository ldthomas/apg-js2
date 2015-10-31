"use strict";
module.exports = function() {
	var thisFileName = "arg-string-parser.js: ";

	var fs = require("fs");
	var apglib = require("apg-lib");
	var id = apglib.ids;
	var ArgStringGrammar = require("./arg-string-grammar.js");
	var Config = require("./config.js");

	function semHelp(state, chars, phraseIndex, phraseCount, data) {
		if (state == id.SEM_PRE) {
			data.config.fHelp = true;
		}
		return id.SEM_OK;
	}
	function semVersion(state, chars, phraseIndex, phraseCount, data) {
		if (state == id.SEM_PRE) {
			data.config.fVersion = true;
		}
		return id.SEM_OK;
	}
	function semStrict(state, chars, phraseIndex, phraseCount, data) {
		if (state == id.SEM_PRE) {
			data.config.fStrict = true;
		}
		return id.SEM_OK;
	}
	function semCRLF(state, chars, phraseIndex, phraseCount, data) {
		if (state == id.SEM_PRE) {
			data.config.fCRLF = true;
		}
		return id.SEM_OK;
	}
	function semLF(state, chars, phraseIndex, phraseCount, data) {
		if (state == id.SEM_PRE) {
			data.config.fLF = true;
		}
		return id.SEM_OK;
	}
	function semCompressed(state, chars, phraseIndex, phraseCount, data) {
		if (state == id.SEM_PRE) {
			for(var i = 1; i < phraseCount; i += 1){
				switch(chars[phraseIndex + i]){
				case 104: // 'h'
					data.config.fHelp = true;
					break;
				case 118: // 'v'
					data.config.fVersion = true;
					break;
				case 115: // 's'
					data.config.fStrict = true;
					break;
				case 114: // 'r'
					data.config.fCRLF = true;
					break;
				case 108: // 'l'
					data.config.fLF = true;
					break;
				default:
					data.errors.push("unrecognized command line argument flag: "+ String.fromCharCode(chars[phraseIndex + i]));
				break;
				}
			}
		}
		return id.SEM_OK;
	}
	function semHTML(state, chars, phraseIndex, phraseCount, data) {
		if (state == id.SEM_POST) {
			data.config.vHTMLDir = data.value;
		}
		return id.SEM_OK;
	}
	function semCLang(state, chars, phraseIndex, phraseCount, data) {
		if (state == id.SEM_POST) {
			data.config.vCLang = data.value;
		}
		return id.SEM_OK;
	}
	function semCppLang(state, chars, phraseIndex, phraseCount, data) {
		if (state == id.SEM_POST) {
			data.config.vCppLang = data.value;
		}
		return id.SEM_OK;
	}
	function semJSLang(state, chars, phraseIndex, phraseCount, data) {
		if (state == id.SEM_POST) {
			data.config.vJSLang = data.value;
		}
		return id.SEM_OK;
	}
	function semJavaLang(state, chars, phraseIndex, phraseCount, data) {
		if (state == id.SEM_POST) {
			data.config.vJavaLang = data.value;
		}
		return id.SEM_OK;
	}
	function semInValue(state, chars, phraseIndex, phraseCount, data) {
		if (state == id.SEM_PRE) {
			var value = "";
			var end = phraseIndex + phraseCount
			for (var i = phraseIndex; i < end; i++) {
				value += String.fromCharCode(chars[i]);
			}
			data.config.vInput.push(value);
		}
		return id.SEM_OK;
	}
	function semValue(state, chars, phraseIndex, phraseCount, data) {
		if (state == id.SEM_PRE) {
			data.value = "";
			var end = phraseIndex + phraseCount
			for (var i = phraseIndex; i < end; i++) {
				data.value += String.fromCharCode(chars[i]);
			}
		}
		return id.SEM_OK;
	}
	function semOther(state, chars, phraseIndex, phraseCount, data) {
		if (state == id.SEM_PRE) {
			data.value = "";
			var end = phraseIndex + phraseCount
			for (var i = phraseIndex; i < end; i++) {
				data.value += String.fromCharCode(chars[i]);
			}
			data.errors.push("unrecognized command line argument value: "+ data.value);
		}
		return id.SEM_OK;
	}
	this.parse = function(input) {
		var result, data;
		var chars = apglib.utils.stringToChars(input);

		// constuctor
		var grammar = new ArgStringGrammar();
		var parser = new apglib.parser();
		parser.ast = new apglib.ast();

	    parser.ast.callbacks['c-lang'] = semCLang;
	    parser.ast.callbacks['c-long'] = false;
	    parser.ast.callbacks['c-short'] = false;
	    parser.ast.callbacks['cdvalue'] = false;
	    parser.ast.callbacks['cpp-lang'] = semCppLang;
	    parser.ast.callbacks['cpp-long'] = false;
	    parser.ast.callbacks['cpp-short'] = false;
	    parser.ast.callbacks['crlf'] = semCRLF;
	    parser.ast.callbacks['file'] = false;
	    parser.ast.callbacks['flag-param'] = false;
	    parser.ast.callbacks['help'] = semHelp;
	    parser.ast.callbacks['html'] = semHTML;
	    parser.ast.callbacks['html-long'] = false;
	    parser.ast.callbacks['html-short'] = false;
	    parser.ast.callbacks['in'] = false;
	    parser.ast.callbacks['in-long'] = false;
	    parser.ast.callbacks['in-short'] = false;
	    parser.ast.callbacks['invalue'] = semInValue;
	    parser.ast.callbacks['java-lang'] = semJavaLang;
	    parser.ast.callbacks['java-long'] = false;
	    parser.ast.callbacks['java-short'] = false;
	    parser.ast.callbacks['js-lang'] = semJSLang;
	    parser.ast.callbacks['js-long'] = false;
	    parser.ast.callbacks['js-short'] = false;
	    parser.ast.callbacks['linefeed'] = semLF;
	    parser.ast.callbacks['compressed'] = semCompressed;
	    parser.ast.callbacks['other'] = semOther;
	    parser.ast.callbacks['param'] = false;
	    parser.ast.callbacks['strict'] = semStrict;
	    parser.ast.callbacks['value'] = semValue;
	    parser.ast.callbacks['value-param'] = false;
	    parser.ast.callbacks['version'] = semVersion;

		result = parser.parse(grammar, 'file', chars);
		if (result.success !== true) {
			throw new Error("command line argument errors: unrecognized arguments");
		}
		data = {
			value : "",
			errors: [],
			config : new Config()
		};
		parser.ast.translate(data);
		if(data.errors.length > 0) {
			var msg = "command line argument errors:";
			data.errors.forEach(function(error){
				msg += "\n" + error;
			});
			throw new Error(msg);
		}
		return data.config;
	}
}
