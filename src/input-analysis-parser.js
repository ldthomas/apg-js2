// This module reads the input grammar file and does a preliminary analysis
//before attempting to parse it into a grammar object.
// (*See `resources/input-analysis-grammar.bnf` for the grammar file this parser is based on.*)
// It has two primary functions.
// - verify the character codes - no non-printing ASCII characters
// - catalog the lines - create an array with a line object for each line.
// The object carries information about the line number and character length which is used
// by the parser generator primarily for error reporting.
module.exports = function() {
  "use strict";
  var thisFileName = "input-file-analysis.js: ";
  var fs = require("fs");
  var apglib = require("apg-lib");
  var id = apglib.ids;
  var Grammar = require("./input-analysis-grammar.js");
  var that = this;
  this.hasInvalidCharacters = false;
  this.originalString = "";
  this.chars = [];
  this.lines = [];
  var CRLF = new Buffer([ 13, 10 ]);
  var LF = new Buffer([ 10 ]);
  var inputFileCount = 0;
  var errors = [];
  /* AST translation callback functions used to analyze the lines. */
  function semLine(state, chars, phraseIndex, phraseCount, data) {
    if (state == id.SEM_PRE) {
      data.endLength = 0;
      data.textLength = 0;
    } else {
      data.catalog.push({
        lineNo : data.catalog.length,
        beginChar : phraseIndex,
        length : phraseCount,
        textLength : data.textLength,
        endLength : data.endLength,
        endType : data.endType,
        invalidChars : data.invalidCount
      });
    }
    return id.SEM_OK;
  }
  function semLineText(state, chars, phraseIndex, phraseCount, data) {
    if (state == id.SEM_PRE) {
      data.textLength = phraseCount;
    }
    return id.SEM_OK;
  }
  function semLastLine(state, chars, phraseIndex, phraseCount, data) {
    if (state == id.SEM_PRE) {
      data.invalidCount = 0;
    } else {
      data.errors.push({
        line : data.catalog.length,
        char : phraseIndex + phraseCount,
        msg : "last line has no line end characters"
      });
      data.catalog.push({
        lineNo : data.catalog.length,
        beginChar : phraseIndex,
        length : phraseCount,
        textLength : phraseCount,
        endLength : 0,
        endType : "none",
        invalidChars : data.invalidCount
      });
    }
    return id.SEM_OK;
  }
  function semInvalid(state, chars, phraseIndex, phraseCount, data) {
    if (state == id.SEM_PRE) {
      data.errors.push({
        line : data.lineNo,
        char : phraseIndex,
        msg : "invalid character found '\\x" + apglib.utils.charToHex(chars[phraseIndex]) + "'"
      });
    }
    return id.SEM_OK;
  }
  function semEnd(state, chars, phraseIndex, phraseCount, data) {
    if (state == id.SEM_POST) {
      data.lineNo += 1;
    }
    return id.SEM_OK;
  }
  function semLF(state, chars, phraseIndex, phraseCount, data) {
    if (state == id.SEM_PRE) {
      if (data.strict) {
        data.errors.push({
          line : data.lineNo,
          char : phraseIndex,
          msg : "line end character is new line only (\\n, \\x0A) - strict ABNF specified"
        });
      }
    }
    return id.SEM_OK;
  }
  function semCR(state, chars, phraseIndex, phraseCount, data) {
    if (state == id.SEM_PRE) {
      if (data.strict) {
        data.errors.push({
          line : data.lineNo,
          char : phraseIndex,
          msg : "line end character is carriage return only(\\r, \\x0D) - strict ABNF specified"
        });
      }
    }
    return id.SEM_OK;
  }
  // Get the grammar from the named file.
  this.get = function(filename) {
    var files = [];
    this.chars.length = 0;
    this.lines.length = 0;
    if (typeof (filename) === "string") {
      files.push(filename);
    } else if (Array.isArray(filename)) {
      files = filename
    } else {
      throw new Error("get(): unrecognized input: must be string or array of strings");
    }
    inputFileCount = files.length;
    try {
      for (var j = 0; j < files.length; j += 1) {
        var buf = fs.readFileSync(files[j]);
        for (var i = 0; i < buf.length; i += 1) {
          this.chars.push(buf[i]);
        }
        this.originalString = apglib.utils.charsToString(this.chars);
      }
    } catch (e) {
      throw new Error(thisFileName + "get(): error reading input grammar file\n" + e.message);
    }
  };
  // Get the grammar from the input string.
  this.getString = function(str) {
    if (typeof (str) !== "string" || str === "") {
      throw new Error(thisFileName + 'getString(): input not a valid string: "' + str + '"');
    }
    this.originalString = str.slice(0);
    this.chars.length = 0;
    this.lines.length = 0;
    this.chars = apglib.utils.stringToChars(str);
  }
  // Analyze the grammar for character code errors and catalog the lines.
  /*
   * grammar error format 
   * { 
   *  line: 0, 
   *  char: 0, 
   *  msg: "" 
   * }
   * grammar line object format 
   * {
   *   lineNo : line number, // zero-based  
   *   beginChar : index of first character, 
   *   length : number of characters in line, including line ending characters, 
   *   textLength : number of characters of text, 
   *   endLength : number of characters in the line end - 1 (LF or CR) or 2(CRLF), 
   *   endType: "CRLF" or "LF" or "CR" or "none", 
   *   invalidChars : number of invalid characters - e.g. 0x255 
   * }
   */
  this.analyze = function(strict, doTrace) {
    var ret = {
      hasErrors : false,
      errors : errors,
      trace : null
    }
    if (strict === undefined || strict !== true) {
      strict = false;
    }
    for(var i = 0; i < this.chars.length; i += 1){
      var thisChar = this.chars[i]; 
      if(thisChar > 65535){
        errors.push({
          line : 0,
          char : i,
          msg : "input SABNF grammar has invalid character code > 65535: char["+i+"]" + thisChar
        });
      }
    }
    if(errors.length > 0){
      ret.hasErrors = true;
      return ret;
    }
    var grammar = new Grammar();
    var parser = new apglib.parser();
    parser.ast = new apglib.ast();
    if (doTrace === true) {
      parser.trace = new apglib.trace();
      parser.trace.filter.operators['trg'] = true;
      parser.trace.filter.operators['tbs'] = true;
      parser.trace.filter.operators['tls'] = true;
      ret.trace = parser.trace;
    }
    parser.ast.callbacks["line"] = semLine;
    parser.ast.callbacks["line-text"] = semLineText;
    parser.ast.callbacks["last-line"] = semLastLine;
    parser.ast.callbacks["invalid"] = semInvalid;
    parser.ast.callbacks["end"] = semEnd;
    parser.ast.callbacks["lf"] = semLF;
    parser.ast.callbacks["cr"] = semCR;
    var test = parser.parse(grammar, 'file', this.chars);
    if (test.success !== true) {
      errors.push({
        line : 0,
        char : 0,
        msg : "syntax analysis error analyzing input SABNF grammar"
      });
      ret.hasErrors = true;
      return ret;
    }
    errors.length = 0;
    var data = {
      catalog : that.lines,
      lineNo : 0,
      errors : errors,
      strict : strict,
      endLength : 0
    };
    parser.ast.translate(data);
    if (errors.length > 0) {
      ret.hasErrors = true;
    }
    return ret;
  };
  /* convert the line ends and output the converted file */
  var convert = function(filename, end) {
    if (typeof (filename) !== "string") {
      throw new Error(thisFileName + "filename is not a string");
    }
    try {
      var fd;
      var buf;
      var count;
      buf = new Buffer(that.chars);
      fd = fs.openSync(filename, "w");
      that.lines.forEach(function(val, index) {
        count = fs.writeSync(fd, buf, val.beginChar, val.textLength);
        count = fs.writeSync(fd, end, 0, end.length);
      });
    } catch (e) {
      var msg = thisFileName + "convert: can't open file'" + filename + "'\n";
      msg += e.message;
      throw new Error(msg);
    }
  }
  // Converts all line ends (`CRLF`, `LF`, `CR` or `EOF`) to `CRLF`, including
  // last line.
  this.toCRLF = function(filename) {
    convert(filename, CRLF);
  };
  // Converts all line ends (`CRLF`, `LF`, `CR` or `EOF`) to `LF`, including
  // last line.
  this.toLF = function(filename) {
    convert(filename, LF);
  };
  // Given a character position, find the line that the character is in.
  this.findLine = function(charIndex) {
    var ret = -1;
    if (charIndex < 0) {
      ret = 0;
    } else if (charIndex >= that.chars.length) {
      ret = that.lines.length === 0 ? 0 : that.lines.length - 1;
    } else {
      for (var i = 0; i < that.lines.length; i += 1) {
        if (charIndex >= that.lines[i].beginChar && charIndex < (that.lines[i].beginChar + that.lines[i].length)) {
          ret = i;
          break;
        }
      }
    }
    return ret;
  }
  // Debug function to list the cataloged line objects to the console.
  this.dump = function() {
    this.lines.forEach(function(val, index) {
      console.log("line: " + val.lineNo);
      console.log("begin: " + val.beginChar);
      console.log("length: " + val.length);
      console.log("textLength: " + val.textLength);
      console.log("endLength: " + val.endLength);
      console.log("invalidChars: " + val.invalidChars);
      console.log("");
    });
  }
  var abnfToHtml = function(chars, beg, len) {
    var NORMAL = 0;
    var CONTROL = 1;
    var INVALID = 2;
    var CONTROL_BEG = '<span class="' + apglib.utils.styleNames.CLASS_CTRL + '">';
    var CONTROL_END = "</span>";
    var INVALID_BEG = '<span class="' + apglib.utils.styleNames.CLASS_NOMATCH + '">';
    var INVALID_END = "</span>";
    var end;
    var html = '';
    while (true) {
      if (!Array.isArray(chars) || chars.length === 0) {
        break;
      }
      if (typeof (beg) !== "number") {
        beg = 0;
      }
      if (beg >= chars.length) {
        break;
      }
      if (typeof (len) !== 'number' || beg + len >= chars.length) {
        end = chars.length;
      } else {
        end = beg + len;
      }
      var state = NORMAL
      for (var i = beg; i < end; i += 1) {
        var ch = chars[i];
        if (ch >= 32 && ch <= 126) {
          /* normal - printable ASCII characters */
          if (state === CONTROL) {
            html += CONTROL_END;
            state = NORMAL;
          } else if (state === INVALID) {
            html += INVALID_END;
            state = NORMAL;
          }
          /* handle reserved HTML entity characters */
          switch (ch) {
          case 32:
            html += '&nbsp;';
            break;
          case 60:
            html += '&lt;';
            break;
          case 62:
            html += '&gt;';
            break;
          case 38:
            html += '&amp;';
            break;
          case 34:
            html += '&quot;';
            break;
          case 39:
            html += '&#039;';
            break;
          case 92:
            html += '&#092;';
            break;
          default:
            html += String.fromCharCode(ch);
            break;
          }
        } else if (ch === 9 || ch === 10 || ch === 13) {
          /* control characters */
          if (state === NORMAL) {
            html += CONTROL_BEG;
            state = CONTROL;
          } else if (state === INVALID) {
            html += INVALID_END + CONTROL_BEG;
            state = CONTROL;
          }
          if (ch === 9) {
            html += "TAB";
          }
          if (ch === 10) {
            html += "LF";
          }
          if (ch === 13) {
            html += "CR";
          }
        } else {
          /* invalid characters */
          if (state === NORMAL) {
            html += INVALID_BEG;
            state = INVALID;
          } else if (state === CONTROL) {
            html += CONTROL_END + INVALID_BEG;
            state = INVALID;
          }
          /* display character as hexidecimal value */
          html += "\\x" + apglib.utils.charToHex(ch);
        }
      }
      if (state === INVALID) {
        html += INVALID_END;
      }
      if (state === CONTROL) {
        html += CONTROL_END;
      }
      break;
    }
    return html;
  }
  var abnfErrorsToHtml = function(chars, lines, errors, title) {
    var style = apglib.utils.styleNames;
    var html = "";
    if (!(Array.isArray(chars) && Array.isArray(lines) && Array.isArray(errors))) {
      return html;
    }
    if (typeof (title) !== "string" || title === "") {
      title = null;
    }
    var errorArrow = '<span class="' + style.CLASS_NOMATCH + '">&raquo;</span>';
    html += '<p><table class="' + style.CLASS_LAST_LEFT_TABLE + '">\n';
    if (title) {
      html += '<caption>' + title + '</caption>\n';
    }
    html += '<tr><th>line<br>no.</th><th>line<br>offset</th><th>error<br>offset</th><th><br>text</th></tr>\n';
    /*
     * grammar error format 
     * { 
     *  line: 0, 
     *  char: 0, 
     *  msg: "" 
     * }
     */
    errors.forEach(function(val) {
      var line, relchar, beg, end, len, length, text, prefix = "", suffix = "";
      if (lines.length === 0) {
        text = errorArrow;
        relchar = 0;
      } else {
        line = lines[val.line];
        beg = line.beginChar;
        if (val.char > beg) {
          prefix = abnfToHtml(chars, beg, val.char - beg);
        }
        beg = val.char;
        end = line.beginChar + line.length;
        if (beg < end) {
          suffix = abnfToHtml(chars, beg, end - beg);
        }
        text = prefix + errorArrow + suffix;
        relchar = val.char - line.beginChar;
      }
      html += '<tr>';
      html += '<td>' + val.line + '</td><td>' + line.beginChar + '</td><td>' + relchar + '</td><td>' + text + '</td>';
      html += '</tr>\n';
      html += '<tr>';
      html += '<td colspan="3"></td>' + '<td>&uarr;:&nbsp;' + apglib.utils.stringToAsciiHtml(val.msg) + '</td>'
      html += '</tr>\n';
    });
    html += '</table></p>\n';
    return html;
  }
  // Format the error messages to HTML, for page display.
  this.errorsToHtml = function(errors, title) {
    return abnfErrorsToHtml(this.chars, this.lines, errors, title);
  }
  // Display the input string.
  this.toString = function() {
    var str = "";
    var thisChars = this.chars;
    var end;
    this.lines.forEach(function(line){
      str += line.lineNo + ": ";
      str += line.beginChar + ": ";
      end = line.beginChar + line.textLength;
      for(var i = line.beginChar; i < end; i += 1){
        str += String.fromCharCode(thisChars[i]);
      }
      str += "\n";
    });
    return str;
  }
  // Display an array of errors of the form `{line: 0, char: 0, msg: "message"}` as ASCII text.
  this.errorsToString = function(errors){
    var str, thisChars, thisLines, line, beg, end;
    str = "";
    thisChars = this.chars;
    thisLines = this.lines;
    errors.forEach(function(error){
      line = thisLines[error.line];
      str += line.lineNo + ": ";
      str += line.beginChar + ": ";
      str += error.char - line.beginChar + ": ";
      beg = line.beginChar;
      end = error.char;
      for(var i = beg; i < end; i += 1){
        str += String.fromCharCode(thisChars[i]);
      }
      str += " >> ";
      beg = end;
      end = line.beginChar + line.textLength;
      for(var i = beg; i < end; i += 1){
        str += String.fromCharCode(thisChars[i]);
      }
      str += "\n";
      str += line.lineNo + ": ";
      str += line.beginChar + ": ";
      str += error.char - line.beginChar + ": ";
      str += "error: ";
      str += error.msg;
      str += "\n";
    });
    
    return str;
  }
  // Generate an HTML table of the lines.
  this.toHtml = function() {
    var html = "";
    html += "<p>";
    html += '<table class="' + apglib.utils.styleNames.CLASS_LAST_LEFT_TABLE + '">\n';
    var title = "Annotated Input Grammar File";
    if (inputFileCount > 1) {
      title += "s(" + inputFileCount + ")"
    }
    html += '<caption>' + title + '</caption>\n';
    html += '<tr>';
    html += '<th>line<br>no.</th><th>first<br>char</th><th><br>length</th><th><br>text</th>';
    html += '</tr>\n';
    this.lines.forEach(function(val, index) {
      html += '<tr>';
      html += '<td>' + val.lineNo + '</td><td>' + val.beginChar + '</td><td>' + val.length + '</td><td>'
          + abnfToHtml(that.chars, val.beginChar, val.length);
      +'</td>';
      html += '</tr>\n';
    });

    html += '</table></p>\n';
    return html;
  }
}
