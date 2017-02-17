// This is the main or driver function for the parser generator.
// It handles:
//    - verification and interpretation of the command line parameters
//    - execution of immediate commands (help, version)
//    - reading and verifying the input SABNF grammar file
//    - parsing the input SABNF grammar, reporting errors, or generating a grammar object
//    - evaluation of the input grammar's attributes
//    - if all is OK, writing the generated grammar object to the specified file
/*
 * COPYRIGHT: Copyright (c) 2017 Lowell D. Thomas, all rights reserved
 *   LICENSE: BSD-3-Clause
 *    AUTHOR: Lowell D. Thomas
 *     EMAIL: lowell@coasttocoastresearch.com
 *   WEBSITE: http://coasttocoastresearch.com/
 *    GITHUB: https://github.com/ldthomas/apg-js2
 *       NPM: https://www.npmjs.com/package/apg
 */
module.exports = function(args) {
  "use strict";
  try {
    var fs = require("fs");
    var converter = require("apg-conv");
    var apglib = require("apg-lib");
    var getConfig = require("./command-line.js");
    var inputAnalysis = new (require("./input-analysis-parser.js"))();
    var sabnf = new (require("./abnf-for-sabnf-parser.js"))();
    var attrs = new (require("./attributes.js"))();
    var result, attrErrors;
    
    /* Get command line parameters and set up the configuration accordingly. */
    var config = getConfig(args);
    if(config.error){
      console.log(config.error);
      console.log(config.help);
      return
    }
    if (config.help) {
      console.log(config.help);
      return;
    }
    if (config.version) {
      console.log(config.version);
      return;
    }
    
    /* Get and validate the input SABNF grammar. */
    result = inputAnalysis.analyze(config.src, config.strict);
    if (result.hasErrors === true) {
      console.log("GRAMMAR CHARACTER ERRORS:");
      console.log(inputAnalysis.errorsToString(result.errors));
      console.log("\nORIGINAL GRAMMAR:");
      console.log(converter.encode("STRING", config.src));
      throw new Error("invalid input grammar");
    }
    
    /* parse the grammar - the syntax phase */
    result = sabnf.syntax(inputAnalysis, config.strict, false);
    if (result.hasErrors) {
      console.log("GRAMMAR SYNTAX ERRORS:");
      console.log(inputAnalysis.errorsToString(result.errors));
      console.log("\nORIGINAL GRAMMAR:");
      console.log(converter.encode("STRING", config.src));
      throw new Error("grammar has syntax errors");
    }
    
    /* translate the AST - the semantic phase */
    result = sabnf.semantic();
    if (result.hasErrors) {
      console.log("GRAMMAR SEMANTIC ERRORS:");
      console.log(inputAnalysis.errorsToString(result.errors));
      console.log("\nORIGINAL GRAMMAR:");
      console.log(converter.encode("STRING", config.src));
      throw new Error("grammar has semantic errors");
    }
    
    /* attribute generation */
    attrErrors = attrs.getAttributes(result.rules, result.udts, result.rulesLineMap);
    if (attrErrors.length > 0) {
      console.log("ATTRIBUTE ERRORS:");
      console.log(inputAnalysis.errorsToString(attrErrors));
      console.log("\nORIGINAL GRAMMAR:");
      console.log(converter.encode("STRING", config.src));
      throw new Error("grammar has attribute errors");
    }

    /* generate a JavaScript parser */
    fs.writeSync(config.outfd, sabnf.generateSource(result.rules, result.udts));
    console.log("\nJavaScript parser generated: " + config.outFilename);
  } catch (e) {
    var msg = "\nEXCEPTION THROWN: ";
    if (e instanceof Error) {
      msg += e.name + ": " + e.message;
    } else if (typeof (e) === "string") {
      msg += e;
    } else {
      msg += "\n";
      msg += require("util").inspect(e, {
        showHidden : true,
        depth : null,
        colors : true
      });
    }
    console.log(msg);
  }
}
