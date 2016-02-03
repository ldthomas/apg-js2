// This is the main or driver function for the parser generator.
// It handles:
//    - verification and interpretation of the command line parameters
//    - execution of immediate commands (help, version, line end conversion)
//    - setting up and opening the HTML files for display of the output
//    - reading and verifying the input SABNF grammar file
//    - parsing the input SABNF grammar, reporting errors, or generating a grammar object
//    - evaluation of the input grammar's attributes
//    - if all is OK, writing the generated grammar object to the specified file
/*
 * COPYRIGHT: Copyright (c) 2015 Lowell D. Thomas, all rights reserved
 *   LICENSE: BSD-3-Clause
 *    AUTHOR: Lowell D. Thomas
 *     EMAIL: lowell@coasttocoastresearch.com
 *   WEBSITE: http://coasttocoastresearch.com/
 */
module.exports = function(args) {
  "use strict";
  var thisFileName = "apg: ";
  var thisSectionName = "";
  var files = null;
  var nodeUtil;
  // The try block - all unrecoverable errors throw exceptions.
  try {
    // Setup section - get all dependencies first.
    thisSectionName = "set up: ";
    nodeUtil = require("util");
    var htmlFiles = require("./html-files.js");
    var apglib = require("apg-lib");
    var cmdLine = require("./command-line.js");
    var inputAnalysis = new (require("./input-analysis-parser.js"))();
    var sabnf = new (require("./abnf-for-sabnf-parser.js"))();
    var Attributes = require("./attributes.js");

    // Get command line parameters and set up the configuration accordingly.
    thisSectionName = "command line configuration: ";
    var config = cmdLine(args);

    // Process immediate options, `--help` & `--version`
    if (config.fHelp === true || args.length === 0) {
      console.log(config.helpScreen(args));
      return;
    }
    if (config.fVersion === true) {
      var msg = "";
      msg += config.getVersion();
      msg += ", ";
      msg += config.getCopyright();
      console.log(msg);
      return;
    }

    // Open the HTML output files.
    // (e.g. after running apg view `html/index.html` and its links to see the
    // output.)
    thisSectionName = "HTML setup: ";
    files = new htmlFiles();
    files.open(config);
    files.writePage("console", "\nconsole opened");
    files.writePage("configuration", config.displayHtml());

    // Get and validate the input SABNF grammar.
    thisSectionName = "grammar validation: ";
    if (config.vInput.length === 0) {
      throw new Error("no input grammar file specified");
    }
    inputAnalysis.get(config.vInput);
    var grammarResult = inputAnalysis.analyze(config.fStrict);
    files.writePage("grammar", inputAnalysis.toHtml());

    // Do line end conversions (`--CRLF` and `--LF` options) here before
    // reporting any grammar validation errors.
    if (config.fCRLF || config.fLF) {
      thisSectionName = "line end conversions: ";
      if (config.fCRLF) {
        var name = config.vInput[0] + ".crlf";
        inputAnalysis.toCRLF(name);
        files.writePage("console", "\nconverted input grammar file(s)  to '" + name + "' with CRLF line ends");
        console.log(thisFileName + "converted input grammar file(s)  to '" + name + "' with CRLF line ends");
      }
      if (config.fLF) {
        var name = config.vInput[0] + ".lf";
        inputAnalysis.toLF(name);
        files.writePage("console", "\nconverted input grammar file(s)  to '" + name + "' with LF line ends");
        console.log(thisFileName + "converted input grammar file(s)  to '" + name + "' with LF line ends");
      }
    }
    // Exit here if grammar has validation errors.
    if (grammarResult.hasErrors === true) {
      thisSectionName = "grammar validation: ";
      files.writePage("grammar", inputAnalysis.errorsToHtml(grammarResult.errors, "Grammar Validation Errors"));
      files.writePage("rules", "<h3>Rules not generated due to grammar validation errors.</h3>");
      files.writePage("attributes", "<h3>Attributes not generated due to grammar validation errors.</h3>");
      var msg = "invalid input grammar"
      throw new Error(msg);
    }
    if (config.fCRLF || config.fLF) {
      return;
    }

    // Parse the input SABNF grammar and generate a grammar object for the
    // user's parser.
    //
    // The syntax phase (see `syntax-callbacks.js` for the code that handles
    // this).
    // Any grammar syntax errors caught are reported to the `html/grammar.html`
    // page.
    thisSectionName = "generater syntax: ";
    grammarResult = sabnf.syntax(inputAnalysis, config.fStrict, false);
    files.writePage("state", apglib.utils.parserResultToHtml(grammarResult.state));
    files.writePage("grammarStats", grammarResult.stats.toHtml("ops"));
    if (grammarResult.hasErrors) {
      files.writePage("grammar", inputAnalysis.errorsToHtml(grammarResult.errors, "Grammar Syntax Errors"));
      files.writePage("rules", "<h3>Rules not generated due to grammar syntax errors.</h3>");
      files.writePage("attributes", "<h3>Attributes not generated due to grammar syntax errors.</h3>");
      throw "grammar has syntax errors";
    }
    files.writePage("console", "\ngrammar syntax OK");

    // The semantic phase. The grammar's rules and opcodes are generated here
    // (see
    // `semantic-callbacks.js` for the code that handles this).
    // Any grammar semantic errors caught are reported to the
    // `html/grammar.html` page.
    thisSectionName = "generater semantics: ";
    grammarResult = sabnf.semantic();
    if (grammarResult.hasErrors) {
      files.writePage("grammar", inputAnalysis.errorsToHtml(grammarResult.errors, "Grammar Semantic Errors"));
      files.writePage("rules", "<h3>Rules not generated due to grammar semantic errors.</h3>");
      files.writePage("attributes", "<h3>Attributes not generated due to grammar semantic errors.</h3>");
      throw "grammar has semantic errors";
    }
    files.writePage("console", "\ngrammar semantics OK");

    // Attribute generation. Output results to `html/attributes.html`.
    // Exit if there are attribute errors, such as left recursion.
    thisSectionName = "grammar attributes: ";
    var attrs = new Attributes();
    var attrErrors = attrs.getAttributes(grammarResult.rules);
    files.writePage("rules", attrs.rulesWithReferencesToHtml());
    files.writePage("attributes", attrs.ruleAttrsToHtml());
    if (attrErrors.length > 0) {
      throw "grammar has attribute errors";
    }
    files.writePage("console", "\ngrammar Attributes OK");

    // Check the configuration for requested parsers.
    thisSectionName = "generate output : ";
    var msg;
    // Generate a grammar object to be used in the user's parser for this
    // input SABNF grammar.
    if (config.vJSLang !== null) {
      var filename;
      if (config.vJSLang === "") {
        filename = sabnf.generateJavaScript(grammarResult.rules, grammarResult.udts, filename);
      } else {
        filename = sabnf.generateJavaScript(grammarResult.rules, grammarResult.udts, config.vJSLang);
      }
      msg = "\nJavaScript parser generated: " + filename;
      console.log(msg);
      files.writePage("console", msg);
    }
    // Output in languages other than JavaScript not implemented.
    // Maybe some day.
    if (config.vCLang !== null) {
      msg = "\nC language generator: not yet implemented";
      console.log(msg);
      files.writePage("console", msg);
    }
    if (config.vCppLang !== null) {
      msg = "\nC++ language generator: not yet implemented";
      console.log(msg);
      files.writePage("console", msg);
    }
    if (config.vJavaLang !== null) {
      msg = "\nJava language generator: not yet implemented";
      console.log(msg);
      files.writePage("console", msg);
    }

    // The catch block.
    //
    // Generate an appropriate error message and write it to the console
    // and the HTML console page (`html/index.html`) if it is open.
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
    if (files !== null) {
      files.writePage("console", msg);
    }

    // The finally block.
    //
    // Attempt a graceful close of any remaining open files.
  } finally {
    if (files !== null) {
      files.close();
    }
  }
}
