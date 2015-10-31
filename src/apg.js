module.exports = function(args) {
	"use strict";
	var thisFileName = "generator.js: ";
	var thisSectionName = "";
	var files= null;
	var nodeUtil;
	try {
		// SETUP - get all dependencies first (make sure they are available)
		thisSectionName = "set up: ";
		nodeUtil = require("util");
		var apglib = require("apg-lib");
		var Attributes = new require("./attributes.js");
		var CommandLineObject = require("./command-line.js");
		var GrammarObject = require("./input-analysis-parser.js");
		var FilesObject = require("./html-files.js");
		var SabnfObject = require("./abnf-for-sabnf-parser.js");

		// CONFIGURATION - 	get command line parameters
		thisSectionName = "command line configuration: ";
		var config = (new CommandLineObject()).commandLine(args);

		// - process immediate options, --help, --version
		if (config.fHelp === true || args.length === 0) {
			// help screen requested - display and exit
			console.log(config.helpScreen(args));
			return;
		}
		if (config.fVersion === true) {
			// version number requested - display and exit
			var msg = "";
			msg += config.getVersion();
			msg += ", ";
			msg += config.getCopyright();
			console.log(msg);
			return;
		}

		// HTML SETUP - opening the html file for outout
		thisSectionName = "HTML setup: ";
		files = new FilesObject();
		files.open(config);
		files.writePage("console", "\nconsole opened");
		files.writePage("configuration", config.displayHtml());

		// GRAMMAR VALIDATION - get and validate the input grammar
		thisSectionName = "grammar validation: ";
		if (config.vInput.length === 0) {
			throw new Error("no input grammar file specified");
		}
		var grammar = new GrammarObject();
		grammar.get(config.vInput);
		var grammarResult = grammar.analyze(config.fStrict);
		files.writePage("grammar", grammar.toHtml());

		if (config.fCRLF || config.fLF) {
			// LINE END CONVERSIONS - process  --CRLF and --LF
			thisSectionName = "line end conversions: ";
			if (config.fCRLF) {
				var name = config.vInput[0] + ".crlf";
				grammar.toCRLF(name);
				files.writePage("console", "\nconverted input grammar file(s)  to '" + name+ "' with CRLF line ends");
				console.log(thisFileName
						+ "converted input grammar file(s)  to '" + name
						+ "' with CRLF line ends");
			}
			if (config.fLF) {
				var name = config.vInput[0] + ".lf";
				grammar.toLF(name);
				files.writePage("console", "\nconverted input grammar file(s)  to '" + name+ "' with LF line ends");
				console.log(thisFileName
						+ "converted input grammar file(s)  to '" + name
						+ "' with LF line ends");
			}
			// check for errors before return
		}
		if (grammarResult.hasErrors === true) {
			thisSectionName = "grammar validation: ";
			files.writePage("grammar", grammar.errorsToHtml())
			var msg = "invalid input grammar"
			throw new Error(msg);
		}
		if (config.fCRLF || config.fLF) {
			// line end conversions end processing
			return;
		}
		
		// GENERATOR - parse the input grammar generating the parser rules and opcodes
		thisSectionName = "generater syntax: ";
		var sabnf = new SabnfObject(grammar);
		grammarResult = sabnf.syntax(config.fStrict);
		files.writePage("state", apglib.utils.stateToHtml(grammarResult.state));
		files.writePage("grammarStats", grammarResult.stats.displayHtml("ops"));
		if (grammarResult.hasErrors) {
			files.writePage("grammar", sabnf.errorsToHtml("Grammar Syntax Errors"));
			throw "grammar has syntax errors";
		}
		files.writePage("console", "\ngrammar syntax OK");

		thisSectionName = "generater semantics: ";
		grammarResult = sabnf.semantic();
		if (grammarResult.hasErrors) {
			files.writePage("grammar", sabnf.errorsToHtml("Grammar Semantic Errors"));
			throw "grammar has semantic errors";
		}
		files.writePage("console", "\ngrammar semantics OK");

		// ATTRIBUTES - use the parser-generated rules and opcodes to find the grammar attributes
		thisSectionName = "grammar attributes: ";
		var attrs = new Attributes(grammarResult.rules);
		var attrErrors = attrs.getAttributes();
		files.writePage("rules", attrs.rulesWithReferencesToHtml());
		files.writePage("attributes", attrs.ruleAttrsToHtml());
		if(attrErrors > 0){
			throw "grammar has attribute errors";
		}
		files.writePage("console", "\ngrammar Attributes OK");

		// OUTPUT - output configured parsers
		thisSectionName = "generate output : ";
		var msg;
		if(config.vJSLang !== ""){
			var filename = sabnf.generateJavaScript(grammarResult.rules, grammarResult.udts, config.vJSLang);
			msg = "\nJavaScript parser generated: "+filename;
			console.log(msg);
			files.writePage("console", msg);
		}
		if(config.vCLang !== ""){
			msg = "\nC language generator: not yet implemented";
			console.log(msg);
			files.writePage("console", msg);
		}
		if(config.vCppLang !== ""){
			msg = "\nC++ language generator: not yet implemented";
			console.log(msg);
			files.writePage("console", msg);
		}
		if(config.vJavaLang !== ""){
			msg = "\nJava language generator: not yet implemented";
			console.log(msg);
			files.writePage("console", msg);
		}
	} catch (e) {
		var msg = "\nEXCEPTION THROWN: " + thisFileName + thisSectionName + "\n";
		if (e instanceof Error) {
			msg += e.name + ": " + e.message;
		} else if (typeof (e) === "string") {
			msg += e;
		} else {
			msg += nodeUtil.inspect(e, {
				showHidden : true,
				depth : null,
				colors : true
			});
		}
		console.log(msg);
		if(files !== null){
			files.writePage("console", msg);
		}
	} finally {
		// attempt a graceful close of any remaining open files
		if(files !== null){
			files.close();
		}
	}
}
