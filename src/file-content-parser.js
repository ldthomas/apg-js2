// This module reads the contents of a file argument (`@filename`) and parses it into
// a [structured list](./arg-string-parser.html) of arguments. 
// (*See `resources/file-content-grammar.bnf` for the grammar file this parser is based on.*)
module.exports = function() {
  "use strict";
  var thisFileName = "file-content-parser.js: ";
  var fs = require("fs");
  var apglib = require("apg-lib");
  var id = apglib.ids;
  var fileContentGrammar = require("./file-content-grammar.js");
  var cwd = process.cwd();
  /* the translation callback functions */
  function semAnyToken(state, chars, phraseIndex, phraseCount, data) {
    if (state == id.SEM_PRE) {
      data.temp = "";
    } else {
      data.str += data.temp + "\n";
    }
    return id.SEM_OK;
  }
  function semToken(state, chars, phraseIndex, phraseCount, data) {
    if (state == id.SEM_POST) {
      var end = phraseIndex + phraseCount
      for (var i = phraseIndex; i < end; i++) {
        data.temp += String.fromCharCode(chars[i]);
      }
    }
    return id.SEM_OK;
  }
  function semDValue(state, chars, phraseIndex, phraseCount, data) {
    if (state == id.SEM_POST) {
      var end = phraseIndex + phraseCount
      for (var i = phraseIndex; i < end; i++) {
        data.temp += String.fromCharCode(chars[i]);
      }
    }
    return id.SEM_OK;
  }
  function semSValue(state, chars, phraseIndex, phraseCount, data) {
    if (state == id.SEM_POST) {
      var end = phraseIndex + phraseCount
      for (var i = phraseIndex; i < end; i++) {
        data.temp += String.fromCharCode(chars[i]);
      }
    }
    return id.SEM_OK;
  }
  /* format a file error message */
  var fsmsg = function(name, msg, e) {
    var ret = name;
    ret += "\n    " + msg;
    ret += "\ncwd: " + process.cwd();
    ret += "\n fs: ";
    ret += e.message;
    return ret;
  }
  // The public function to read the named file and parse it.
  this.parse = function(val) {
    var functionName = thisFileName + "parse()";
    var fileString;
    var data = {
      str : "",
      temp : ""
    };
    var result;
    var filename = val.substring(1);
    try {
      fileString = fs.readFileSync(filename, "utf-8");
    } catch (e) {
      throw new Error(fsmsg(functionName, "error reading command line file '" + val + "'", e));
    }
    var grammar = new fileContentGrammar();
    var parser = new apglib.parser();
    parser.ast = new apglib.ast();
    parser.trace = new apglib.trace();
    parser.trace.filter.operators["<all>"] = true;
    parser.ast.callbacks["any-token"] = semAnyToken;
    parser.ast.callbacks["token"] = semToken;
    parser.ast.callbacks["dvalue"] = semDValue;
    parser.ast.callbacks["svalue"] = semSValue;
    var chars = apglib.utils.stringToChars(fileString);
    try {
      result = parser.parse(grammar, "file", chars);
    } catch (e) {
      var html = parser.trace.displayHtml("good input");
      apglib.utils.htmlToPage(html, "html/filecontent.html");
    }
    if (result.success === false) {
      throw new Error(thisFileName + "parse: parse of command line file '" + val + "' failed");
    }
    parser.ast.translate(data);
    return data.str;
  }
}
