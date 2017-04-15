// This is the main or driver function for the parser generator.
// It handles:
//    - verification and interpretation of the command line parameters
//    - execution of immediate commands (help, version)
//    - reading and verifying the input SABNF grammar file(s)
//    - parsing the input SABNF grammar and reporting errors, if any
//    - evaluation of the input grammar's attributes
//    - if all is OK, generating the source code for a grammar object
//    - writing the source to a specified file
//
// Note on teminology.
//
// APG is a parser generator.
// However, it really only generates a "grammar object" (see below) from the defining SABNF grammar.
// The generated parser is incomplete at this stage.
// Remaining, it is the job of the user to develop the generated parser from the grammar object and the APG Library (**apg-lib**).
// 
// The following terminology my help clear up the confusion between the idea of a "generated parser" versus a "generated grammar object".

// - The generating parser: APG is an APG parser (yes, there is a circular dependence between **apg** and **apg-lib**). We'll call it the generating parser.
// - The target parser: APG's goal is to generate a parser. We'll call it the target parser.
// - The target grammar: this is the (ASCII) SABNF grammar defining the target parser.
// - The target grammar object: APG parses the SABNF grammar and generates the JavaScript source for a target grammar object.
// - The final target parser: The user then develops the final target parser using the generated target grammar
// object and the APG parsing library, **apg-lib**.
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
  function logErrors(api, header){
    console.log("\n");
    console.log(header + ":");
    console.log(api.errorsToAscii());
    console.log("\nORIGINAL GRAMMAR:");
    console.log(api.linesToAscii());
  }
  try {
    debugger;
    var thisFileName = "apg.js: ";
    var fs = require("fs");
    var api = require("apg-api");
    var apglib = require("apg-lib");
    var converter = require("apg-conv-api").converter;
    var getConfig = require("./command-line.js");
    
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
    api = new api(config.src);
    
    /* !!!! DEBUG !!!! */
    /* test complete generation */
//    api.generate(config.strict);
//    if (api.errors.length) {
//      logErrors(api, "GRAMMAR ERRORS");
//      throw new Error(thisFileName + "grammar has errors");
//    }else{
//      fs.writeSync(config.outfd, api.toSource());
//      console.log("\nJavaScript parser generated: " + config.outFilename);
//    }
//    return;
    /* !!!! DEBUG !!!! */

    api.scan(config.strict);
    if (api.errors.length) {
      logErrors(api, "GRAMMAR CHARACTER ERRORS");
      
      /* !!!! DEBUG !!!! */
//      var html = apglib.utils.htmlToPage(api.errorsToHtml());
//      fs.writeFileSync("errors.html", html);
//      html = apglib.utils.htmlToPage(api.linesToHtml());
//      fs.writeFileSync("lines.html", html);
      /* !!!! DEBUG !!!! */

      throw new Error(thisFileName + "invalid input grammar");
    }
    
    /* parse the grammar - the syntax phase */
    api.parse(config.strict);
    if (api.errors.length) {
      logErrors(api, "GRAMMAR SYNTAX ERRORS");
      throw new Error(thisFileName + "grammar has syntax errors");
    }
    
    /* translate the AST - the semantic phase */
    api.translate();
    if (api.errors.length) {
      logErrors(api, "GRAMMAR SEMANTIC ERRORS");
      throw new Error(thisFileName + "grammar has semantic errors");
    }
    
    /* attribute generation */
    api.attributes();
    if (api.errors.length) {
      logErrors(api, "GRAMMAR ATTRIBUTE ERRORS");
      throw new Error(thisFileName + "grammar has semantic errors");
    }

    /* generate a JavaScript parser */
    fs.writeSync(config.outfd, api.toSource());
    console.log("\nJavaScript parser generated: " + config.outFilename);
  } catch (e) {
    var msg = "EXCEPTION THROWN: ";
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
