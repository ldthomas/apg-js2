// This module converts an input SABNF grammar text file into a 
// grammar object that can be used with [`apg-lib`](https://github.com/ldthomas/apg-js2-lib) in an application parser.
//
// This parser generator is itself a parser.
// (*See `resources/ABNFforSABNF.bnf` for the grammar file this parser is based on.*)
// It can, in fact, generate itself by using the ABNF for SABNF grammar as input.
// This can lead to some circular arguments in the discussion and caution is required.
// There are two grammars involved and we need to make a clear distinction:
// - the ABNF for SABNF (see resources/ABNFforSABNF.bnf) is the grammar that this parser is built from.
// Its grammar object is the local file `src/abnf-for-sabnf-grammar.js`.
// - the user's input grammar is the input to this module.
// It is first processed by [`input-analysis-parser.js`](./docs/input-analysis-parser.html)
// to verify its integrity and catalog its lines.
// That object, rather than the raw grammar text, is the input to this module.
module.exports = function() {
  "use strict";
  var thisFileName = "abnf-for-sabnf-parser.js: ";
  var fs = require("fs");
  var apglib = require("apg-lib");
  var id = apglib.ids;
  var utils = apglib.utils;
  var syntaxOk = null;
  var syn = new (require("./syntax-callbacks.js"))();
  var sem = new (require("./semantic-callbacks.js"))();
  var errors = [];
  var grammarAnalysisParser;
  var sabnfGrammar = new (require("./abnf-for-sabnf-grammar.js"))();
  var parser = new apglib.parser();
  var trace = new apglib.trace();
  parser.ast = new apglib.ast();
  parser.stats = new apglib.stats();
  parser.callbacks = syn.callbacks;
  parser.ast.callbacks = sem.callbacks;
  
  // If errors are found during parsing, this function will convert the
  // error messages to a
  // string suitable for `console.log()`.
  this.errorsToString = function(title) {
    var str = "";
    if (typeof (title) === "string") {
      str += title + "\n";
    }
    errors.forEach(function(val, index) {
      str += "error: " + index + ": line: " + val.line + ": char: " + val.char
          + ": msg: " + val.msg + "\n";
    });
    return str;
  }
  // If errors are found during parsing, this function will convert the
  // error messages to
  // HTML suitable for display on an HTML page.
  this.errorsToHtml = function(title) {
    return utils.errorsToHtml(grammarAnalysisParser.chars,
        grammarAnalysisParser.lines, errors, title);
  }

  var translateIndex = function(map, index) {
    var ret = -1;
    if (index < map.length) {
      for (var i = index; i < map.length; i += 1) {
        if (map[i] !== null) {
          ret = map[i];
          break;
        }
      }
    }
    return ret;
  }

  // Remove redundant ALT, CAT and REP operators.
  var reduceOpcodes = function(rules) {
    rules.forEach(function(rule, ir) {
      var opcodes = [];
      var map = [];
      var reducedIndex = 0;
      rule.opcodes.forEach(function(op, iop) {
        if (op.type === id.ALT && op.children.length === 1) {
          map.push(null);
        } else if (op.type === id.CAT && op.children.length === 1) {
          map.push(null);
        } else if (op.type === id.REP && op.min === 1 && op.max === 1) {
          map.push(null);
        } else {
          map.push(reducedIndex);
          opcodes.push(op);
          reducedIndex += 1;
        }
      });
      map.push(reducedIndex);

      // translate original opcode indexes to the reduced set.
      opcodes.forEach(function(op, iop) {
        if (op.type === id.ALT || op.type === id.CAT) {
          for (var i = 0; i < op.children.length; i += 1) {
            op.children[i] = translateIndex(map, op.children[i]);
          }
        }
      });
      rule.opcodes = opcodes;
    });
  }

  // Parse the grammar. This is the syntax phase.
  // SABNF grammar syntax errors are caught and reported here.
  // (They will be displayed on the `html/grammar.html` output page.)
  this.syntax = function(grammar, strict, doTrace) {
    grammarAnalysisParser = grammar;
    var ret = {
      hasErrors : false,
      errors : errors,
      state : null,
      stats : parser.stats,
      trace : null
    }
    if (strict !== true) {
      strict = false;
    }
    if (doTrace !== true) {
      doTrace = false;
    } else {
      doTrace = true;
      parser.trace = trace;
      ret.trace = trace;
    }

    var data = {};
    errors.length = 0;
    data.errors = errors;
    data.strict = strict;
    data.findLine = grammarAnalysisParser.findLine;
    data.ruleCount = 0;
    ret.state = parser.parse(sabnfGrammar, 'file', grammarAnalysisParser.chars,
        data);
    if (ret.state.success !== true) {
      errors.push({
        line : 0,
        char : 0,
        msg : "syntax analysis of input grammar failed"
      });
    }
    if (errors.length === 0) {
      syntaxOk = true;
    } else {
      ret.hasErrors = true;
      syntaxOk = false;
    }
    return ret;
  }

  // Once the grammar syntax has been verified and the AST generated,
  // this function will translate the AST, generating the rules and opcodes
  // defined by the grammar.
  this.semantic = function() {
    var ret = {
      hasErrors : false,
      errors : errors,
      rules : null,
      udts : null
    }
    while (true) {
      if (!syntaxOk) {
        errors
            .push({
              line : 0,
              char : 0,
              msg : "cannot do semantic analysis until syntax analysis has completed without errors"
            });
        ret.errors = errors;
        break;
      }
      var test;

      var data = {};
      errors.length = 0;
      data.errors = errors;
      data.findLine = grammarAnalysisParser.findLine;
      parser.ast.translate(data);
      if (data.errors.length > 0) {
        ret.hasErrors = true;
        break;
      }

      // Remove unneeded operators.
      // ALT operators with a single alternate as well as
      // CAT operators with a single phrase to concatenate are not needed.
      // Similarly, REP(1,1) (e.g. `1*1RuleName` or `1RuleName` is the same as
      // just `RuleName`.)
      ret.rules = reduceOpcodes(data.rules);
      ret.rules = data.rules;
      ret.udts = data.udts;
      break;
    }
    return ret;
  }
  // Error messages, if any, are converted to a string suitable for
  // `console.log()`.
  this.displayErrors = function() {
    return errorsToString(thisFileName + ": displayErrors()", errors);
  }
  // Error messages, if any, are converted to HTML for display on the
  // `html/grammr.html` output page.
  this.displayErrorsHtml = function(className) {
    return errorsToHtml(thisFileName + ": displayErrors()", errors);
  }
  // Iterate through the rules, UDTs and opcodes, writing a `node.js` module to
  // the designated file name.
  this.generateJavaScript = function(rules, udts, fileName) {
    var i;
    var bkrname;
    var bkrlower;
    var opcodeCount = 0;
    var charCodeMin = Infinity;
    var charCodeMax = 0;
    var ruleNames = [];
    var udtNames = [];
    var alt = 0, cat = 0, rnm = 0, udt = 0, rep = 0, and = 0, not = 0, tls = 0, tbs = 0, trg = 0;
    var bkr = 0, bka = 0, bkn = 0;
    rules.forEach(function(rule) {
      ruleNames.push(rule.lower);
      opcodeCount += rule.opcodes.length;
      rule.opcodes.forEach(function(op, iop) {
        switch (op.type) {
        case id.ALT:
          alt += 1;
          break;
        case id.CAT:
          cat += 1;
          break;
        case id.RNM:
          rnm += 1;
          break;
        case id.UDT:
          udt += 1;
          break;
        case id.REP:
          rep += 1;
          break;
        case id.AND:
          and += 1;
          break;
        case id.NOT:
          not += 1;
          break;
        case id.BKA:
          bka += 1;
          break;
        case id.BKN:
          bkn += 1;
          break;
        case id.BKR:
          bkr += 1;
          break;
        case id.TLS:
          tls += 1;
          for (i = 0; i < op.string.length; i += 1) {
            if (op.string[i] < charCodeMin) {
              charCodeMin = op.string[i];
            }
            if (op.string[i] > charCodeMax) {
              charCodeMax = op.string[i];
            }
          }
          break;
        case id.TBS:
          tbs += 1;
          for (i = 0; i < op.string.length; i += 1) {
            if (op.string[i] < charCodeMin) {
              charCodeMin = op.string[i];
            }
            if (op.string[i] > charCodeMax) {
              charCodeMax = op.string[i];
            }
          }
          break;
        case id.TRG:
          trg += 1;
          if (op.min < charCodeMin) {
            charCodeMin = op.min;
          }
          if (op.max > charCodeMax) {
            charCodeMax = op.max;
          }
          break;
        }
      });
    });
    ruleNames.sort();
    if (udts.length > 0) {
      udts.forEach(function(udt) {
        udtNames.push(udt.lower);
      });
      udtNames.sort();
    }

    fileName += ".js";
    try {
      var fd = fs.openSync(fileName, "w");
      fs
          .writeSync(
              fd,
              "// Generated by JavaScript APG, Version 2.0 [`apg-js2`](https://github.com/ldthomas/apg-js2)\n");
      fs.writeSync(fd, "module.exports = function(){\n");
      fs.writeSync(fd, "\"use strict\";\n");
      // fs.writeSync(fd, "\n");
      fs.writeSync(fd, "  //```\n");
      fs.writeSync(fd, "  // SUMMARY\n");
      fs.writeSync(fd, "  //      rules = " + rules.length + "\n");
      fs.writeSync(fd, "  //       udts = " + udts.length + "\n");
      fs.writeSync(fd, "  //    opcodes = " + opcodeCount + "\n");
      fs.writeSync(fd, "  //        ALT = " + alt + "\n");
      fs.writeSync(fd, "  //        CAT = " + cat + "\n");
      fs.writeSync(fd, "  //        RNM = " + rnm + "\n");
      fs.writeSync(fd, "  //        UDT = " + udt + "\n");
      fs.writeSync(fd, "  //        BKR = " + bkr + "\n");
      fs.writeSync(fd, "  //        REP = " + rep + "\n");
      fs.writeSync(fd, "  //        AND = " + and + "\n");
      fs.writeSync(fd, "  //        NOT = " + not + "\n");
      fs.writeSync(fd, "  //        BKA = " + bka + "\n");
      fs.writeSync(fd, "  //        BKN = " + bkn + "\n");
      fs.writeSync(fd, "  //        TLS = " + tls + "\n");
      fs.writeSync(fd, "  //        TBS = " + tbs + "\n");
      fs.writeSync(fd, "  //        TRG = " + trg + "\n");
      fs.writeSync(fd, "  // characters = [");
      if ((tls + tbs + trg) === 0) {
        fs.writeSync(fd, " none defined ]");
      } else {
        fs.writeSync(fd, charCodeMin + " - " + charCodeMax + "]");
      }
      if (udt > 0) {
        fs.writeSync(fd, " + user defined");
      }
      fs.writeSync(fd, "\n");
      fs.writeSync(fd, "  //```\n");
      // fs.writeSync(fd, "\n");
      fs
          .writeSync(fd,
              "  /* CALLBACK LIST PROTOTYPE (true, false or function reference) */\n");
      fs.writeSync(fd, "  this.callbacks = [];\n");
      ruleNames.forEach(function(name) {
        fs.writeSync(fd, "  this.callbacks['" + name + "'] = false;\n");
      });
      if (udts.length > 0) {
        udtNames.forEach(function(name) {
          fs.writeSync(fd, "  this.callbacks['" + name + "'] = false;\n");
        });
      }
      fs.writeSync(fd, "\n");
      fs.writeSync(fd, "  /* OBJECT IDENTIFIER (for internal parser use) */\n");
      fs.writeSync(fd, "  this.grammarObject = 'grammarObject';\n");
      fs.writeSync(fd, "\n");
      fs.writeSync(fd, "  /* RULES */\n");
      fs.writeSync(fd, "  this.rules = [];\n");
      rules.forEach(function(rule, i) {
        fs.writeSync(fd, "  this.rules[" + i + "] = {name: '" + rule.name
            + "', lower: '" + rule.lower + "', index: " + rule.index + ", isBkr: " + rule.isBkr + ", hasBkr: " + rule.hasBkr  + "};\n");
      });
      fs.writeSync(fd, "\n");
      fs.writeSync(fd, "  /* UDTS */\n");
      fs.writeSync(fd, "  this.udts = [];\n");
      if (udts.length > 0) {
        udts.forEach(function(udt, i) {
          fs.writeSync(fd, "  this.udts[" + i + "] = {name: '" + udt.name
              + "', lower: '" + udt.lower+ "', index: " + udt.index + ", empty: " + udt.empty
               + ", isBkr: " + udt.isBkr + "};\n");
        });
      }
      fs.writeSync(fd, "\n");
      fs.writeSync(fd, "  /* OPCODES */\n");
      rules.forEach(function(rule, ruleIndex) {
        if (ruleIndex > 0) {
          fs.writeSync(fd, "\n");
        }
        fs.writeSync(fd, "  /* " + rule.name + " */\n");
        fs.writeSync(fd, "  this.rules[" + ruleIndex + "].opcodes = [];\n");
        rule.opcodes.forEach(function(op, opIndex) {
          switch (op.type) {
          case id.ALT:
            fs.writeSync(fd, "  this.rules[" + ruleIndex + "].opcodes["
                + opIndex + "] = {type: " + op.type + ", children: ["
                + op.children.toString() + "]};// ALT\n");
            break;
          case id.CAT:
            fs.writeSync(fd, "  this.rules[" + ruleIndex + "].opcodes["
                + opIndex + "] = {type: " + op.type + ", children: ["
                + op.children.toString() + "]};// CAT\n");
            break;
          case id.RNM:
            fs.writeSync(fd, "  this.rules[" + ruleIndex + "].opcodes["
                + opIndex + "] = {type: " + op.type + ", index: " + op.index
                + "};// RNM(" + rules[op.index].name + ")\n");
            break;
          case id.BKR:
            if(op.index >= rules.length){
              bkrname = udts[op.index - rules.length].name;
              bkrlower = udts[op.index - rules.length].lower;
            }else{
              bkrname = rules[op.index].name;
              bkrlower = rules[op.index].lower;
            }
            if(op.insensitive){
              bkrname = "%i" + bkrname;
            }else{
              bkrname = "%s" + bkrname;
            }
            fs.writeSync(fd, "  this.rules[" + ruleIndex + "].opcodes["
                + opIndex + "] = {type: " + op.type + ", index: " + op.index 
                + ", lower: '" + bkrlower + "'"
                + ", insensitive: " + op.insensitive
                + "};// BKR(\\" + bkrname + ")\n");
            break;
          case id.UDT:
            fs.writeSync(fd, "  this.rules[" + ruleIndex + "].opcodes["
                + opIndex + "] = {type: " + op.type + ", empty: " + op.empty
                + ", index: " + op.index + "};// UDT(" + udts[op.index].name
                + ")\n");
            break;
          case id.REP:
            fs.writeSync(fd, "  this.rules[" + ruleIndex + "].opcodes["
                + opIndex + "] = {type: " + op.type + ", min: " + op.min
                + ", max: " + op.max + "};// REP\n");
            break;
          case id.AND:
            fs.writeSync(fd, "  this.rules[" + ruleIndex + "].opcodes["
                + opIndex + "] = {type: " + op.type + "};// AND\n");
            break;
          case id.NOT:
            fs.writeSync(fd, "  this.rules[" + ruleIndex + "].opcodes["
                + opIndex + "] = {type: " + op.type + "};// NOT\n");
            break;
          case id.BKA:
            fs.writeSync(fd, "  this.rules[" + ruleIndex + "].opcodes["
                + opIndex + "] = {type: " + op.type + "};// BKA\n");
            break;
          case id.BKN:
            fs.writeSync(fd, "  this.rules[" + ruleIndex + "].opcodes["
                + opIndex + "] = {type: " + op.type + "};// BKN\n");
            break;
          case id.TLS:
            fs.writeSync(fd, "  this.rules[" + ruleIndex + "].opcodes["
                + opIndex + "] = {type: " + op.type + ", string: ["
                + op.string.toString() + "]};// TLS\n");
            break;
          case id.TBS:
            fs.writeSync(fd, "  this.rules[" + ruleIndex + "].opcodes["
                + opIndex + "] = {type: " + op.type + ", string: ["
                + op.string.toString() + "]};// TBS\n");
            break;
          case id.TRG:
            fs.writeSync(fd, "  this.rules[" + ruleIndex + "].opcodes["
                + opIndex + "] = {type: " + op.type + ", min: " + op.min
                + ", max: " + op.max + "};// TRG\n");
            break;
          }
        });
      });

      // The `toString()` function will display the original grammar file(s) that produced these opcodes.
      fs.writeSync(fd, "\n");
      fs.writeSync(fd, "  // The `toString()` function will display the original grammar file(s) that produced these opcodes.\n");
      fs.writeSync(fd, "  this.toString = function(){\n");
      fs.writeSync(fd, '    var str = "";\n');
      var str;
      grammarAnalysisParser.lines.forEach(function(line, index) {
        var end = line.beginChar + line.length;
        str = "";
        fs.writeSync(fd, '    str += "');
        for (var i = line.beginChar; i < end; i += 1) {
          switch (grammarAnalysisParser.chars[i]) {
          case 9:
            str = ' ';
            break;
          case 10:
            str = '\\n';
            break;
          case 13:
            str = '\\r';
            break;
          case 34:
            str = '\\"';
            break;
          case 92:
            str = '\\\\';
            break;
          default:
            str = String.fromCharCode(grammarAnalysisParser.chars[i]);
            break;
          }
          fs.writeSync(fd, str);
        }
        fs.writeSync(fd, '";\n');
      });
      fs.writeSync(fd, '    return str;\n');
      fs.writeSync(fd, '  }\n');
      fs.writeSync(fd, "}\n");

//      fs.writeSync(fd, "\n");
//      fs.writeSync(fd, "//```\n");
//      fs.writeSync(fd, "// INPUT GRAMMAR FILE(s)\n");
//      fs.writeSync(fd, "//\n");
//      grammarAnalysisParser.lines.forEach(function(line, index) {
//        var end = line.beginChar + line.textLength;
//        str = "";
//        for (var i = line.beginChar; i < end; i += 1) {
//          str += String.fromCharCode(grammarAnalysisParser.chars[i]);
//        }
//        fs.writeSync(fd, "// " + str + "\n");
//      });
//      fs.writeSync(fd, "//```\n");

      fs.close(fd);
    } catch (e) {
      throw new Error(thisFileName
          + "generateJavaScript(): file system error\n" + e.message);
    }
    return fileName;
  }
  // Iterate through the rules, UDTs and opcodes, generating a JavaScript
  // object.
  // This will be the same object as if the file written by the function
  // `generateJavaScript()`
  // had been loaded (`require()`) and constructed with the `new` operator.
  this.generateObject = function(rules, udts) {
    var obj = {};
    if(grammarAnalysisParser){
      var ruleNames = [];
      var udtNames = [];
      var string = grammarAnalysisParser.originalString.slice(0);
      obj.grammarObject = 'grammarObject';
      rules.forEach(function(rule) {
        ruleNames.push(rule.lower);
      });
      ruleNames.sort();
      if (udts.length > 0) {
        udts.forEach(function(udt) {
          udtNames.push(udt.lower);
        });
        udtNames.sort();
      }

      /* the callback prototype list */
      obj.callbacks = [];
      ruleNames.forEach(function(name) {
        obj.callbacks[name] = false;
      });
      if (udts.length > 0) {
        udtNames.forEach(function(name) {
          obj.callbacks[name] = false;
        });
      }
      obj.rules = rules;
      obj.udts = udts;
      obj.toString = function() {
        return string;
      }
    }
    return obj;
  }
}
