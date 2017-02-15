// This module converts an input SABNF grammar text file into a 
// grammar object that can be used with [`apg-lib`](https://github.com/ldthomas/apg-js2-lib) in an application parser.
// **apg** is, in fact itself, an ABNF parser that generates and SABNF parser.
// It is based on the grammar<br>
//`abnf/abnf-for-sabnf-grammar.bnf`.<br>
// In its syntax phase, **apg** analyzes the user's input SABNF grammar for correct syntax, generating an AST as it goes.
// In its semantic phase, **apg** translates the AST to generate the parser for the input grammar.
module.exports = function() {
  "use strict";
  var thisFileName = "abnf-for-sabnf-parser.js: ";
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
  /* helper function when removing redundant opcodes */
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
  /* helper function when removing redundant opcodes */
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
      /* translate original opcode indexes to the reduced set. */
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
  /* Parse the grammar - the syntax phase. */
  /* SABNF grammar syntax errors are caught and reported here. */
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
    ret.state = parser.parse(sabnfGrammar, 'file', grammarAnalysisParser.chars, data);
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
  /* Parse the grammar - the semantic phase, translates the AST. */
  /* SABNF grammar syntax errors are caught and reported here. */
  this.semantic = function() {
    var ret = {
      hasErrors : false,
      errors : errors,
      rules : null,
      udts : null
    }
    while (true) {
      if (!syntaxOk) {
        errors.push({
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
      /* Remove unneeded operators. */
      /* ALT operators with a single alternate */
      /* CAT operators with a single phrase to concatenate */
      /* REP(1,1) operators (`1*1RuleName` or `1RuleName` is the same as just `RuleName`.) */
      ret.rules = reduceOpcodes(data.rules);
      ret.rules = data.rules;
      ret.udts = data.udts;
      ret.rulesLineMap = data.rulesLineMap;
      break;
    }
    return ret;
  }
  // Generate a grammar constructor function.
  // An object instantiated from this constructor is used with the `apg-lib` `parser()` function.
  this.generateSource = function(rules, udts, name) {
    var source = "";
    var i;
    var bkrname;
    var bkrlower;
    var opcodeCount = 0;
    var charCodeMin = Infinity;
    var charCodeMax = 0;
    var ruleNames = [];
    var udtNames = [];
    var alt = 0, cat = 0, rnm = 0, udt = 0, rep = 0, and = 0, not = 0, tls = 0, tbs = 0, trg = 0;
    var bkr = 0, bka = 0, bkn = 0, abg = 0, aen = 0;
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
        case id.ABG:
          abg += 1;
          break;
        case id.AEN:
          aen += 1;
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
    try {
      var funcname = "module.exports";
      if(name && typeof(name) === "string"){
        funcname = "var " +name;
      }
      source += "// Generated by JavaScript APG, Version 2.0 [`apg-js2`](https://github.com/ldthomas/apg-js2)\n";
      source += funcname + " = function(){\n";
      source += "\"use strict\";\n";
      source += "  //```\n";
      source += "  // SUMMARY\n";
      source += "  //      rules = " + rules.length + "\n";
      source += "  //       udts = " + udts.length + "\n";
      source += "  //    opcodes = " + opcodeCount + "\n";
      source += "  //        ---   ABNF original opcodes\n";
      source += "  //        ALT = " + alt + "\n";
      source += "  //        CAT = " + cat + "\n";
      source += "  //        REP = " + rep + "\n";
      source += "  //        RNM = " + rnm + "\n";
      source += "  //        TLS = " + tls + "\n";
      source += "  //        TBS = " + tbs + "\n";
      source += "  //        TRG = " + trg + "\n";
      source += "  //        ---   SABNF superset opcodes\n";
      source += "  //        UDT = " + udt + "\n";
      source += "  //        AND = " + and + "\n";
      source += "  //        NOT = " + not + "\n";
      source += "  //        BKA = " + bka + "\n";
      source += "  //        BKN = " + bkn + "\n";
      source += "  //        BKR = " + bkr + "\n";
      source += "  //        ABG = " + abg + "\n";
      source += "  //        AEN = " + aen + "\n";
      source += "  // characters = [";
      if ((tls + tbs + trg) === 0) {
        source += " none defined ]";
      } else {
        source += charCodeMin + " - " + charCodeMax + "]";
      }
      if (udt > 0) {
        source += " + user defined";
      }
      source += "\n";
      source += "  //```\n";
      source += "  /* OBJECT IDENTIFIER (for internal parser use) */\n";
      source += "  this.grammarObject = 'grammarObject';\n";
      source += "\n";
      source += "  /* RULES */\n";
      source += "  this.rules = [];\n";
      rules.forEach(function(rule, i) {
        var thisRule = "  this.rules[";
        thisRule += i;
        thisRule += "] = {name: '";
        thisRule += rule.name;
        thisRule += "', lower: '";
        thisRule += rule.lower;
        thisRule += "', index: ";
        thisRule += rule.index;
        thisRule += ", isBkr: ";
        thisRule += rule.isBkr;
        thisRule += "};\n";
        source += thisRule;
      });
      source += "\n";
      source += "  /* UDTS */\n";
      source += "  this.udts = [];\n";
      if (udts.length > 0) {
        udts.forEach(function(udt, i) {
          var thisUdt = "  this.udts[";
          thisUdt += i;
          thisUdt += "] = {name: '";
          thisUdt += udt.name;
          thisUdt += "', lower: '";
          thisUdt += udt.lower;
          thisUdt += "', index: ";
          thisUdt += udt.index;
          thisUdt += ", empty: ";
          thisUdt += udt.empty;
          thisUdt += ", isBkr: ";
          thisUdt += udt.isBkr;
          thisUdt += "};\n";
          source += thisUdt;
        });
      }
      source += "\n";
      source += "  /* OPCODES */\n";
      rules.forEach(function(rule, ruleIndex) {
        if (ruleIndex > 0) {
          source += "\n";
        }
        source += "  /* " + rule.name + " */\n";
        source += "  this.rules[" + ruleIndex + "].opcodes = [];\n";
        rule.opcodes.forEach(function(op, opIndex) {
          switch (op.type) {
          case id.ALT:
            source += "  this.rules[" + ruleIndex + "].opcodes[" + opIndex + "] = {type: " + op.type
                + ", children: [" + op.children.toString() + "]};// ALT\n";
            break;
          case id.CAT:
            source += "  this.rules[" + ruleIndex + "].opcodes[" + opIndex + "] = {type: " + op.type
                + ", children: [" + op.children.toString() + "]};// CAT\n";
            break;
          case id.RNM:
            source += "  this.rules[" + ruleIndex + "].opcodes[" + opIndex + "] = {type: " + op.type
                + ", index: " + op.index + "};// RNM(" + rules[op.index].name + ")\n";
            break;
          case id.BKR:
            if (op.index >= rules.length) {
              bkrname = udts[op.index - rules.length].name;
              bkrlower = udts[op.index - rules.length].lower;
            } else {
              bkrname = rules[op.index].name;
              bkrlower = rules[op.index].lower;
            }
            var prefix = "%i";
            if (op.bkrCase === id.BKR_MODE_CS) {
              prefix = "%s";
            }
            if (op.bkrMode === id.BKR_MODE_UM) {
              prefix += "%u";
            } else {
              prefix += "%p";
            }
            bkrname = prefix + bkrname;
            source += "  this.rules[" + ruleIndex + "].opcodes[" + opIndex + "] = {type: " + op.type
                + ", index: " + op.index + ", lower: '" + bkrlower + "'" + ", bkrCase: " + op.bkrCase + ", bkrMode: "
                + op.bkrMode + "};// BKR(\\" + bkrname + ")\n";
            break;
          case id.UDT:
            source += "  this.rules[" + ruleIndex + "].opcodes[" + opIndex + "] = {type: " + op.type
                + ", empty: " + op.empty + ", index: " + op.index + "};// UDT(" + udts[op.index].name + ")\n";
            break;
          case id.REP:
            source += "  this.rules[" + ruleIndex + "].opcodes[" + opIndex + "] = {type: " + op.type + ", min: "
                + op.min + ", max: " + op.max + "};// REP\n";
            break;
          case id.AND:
            source += "  this.rules[" + ruleIndex + "].opcodes[" + opIndex + "] = {type: " + op.type
                + "};// AND\n";
            break;
          case id.NOT:
            source += "  this.rules[" + ruleIndex + "].opcodes[" + opIndex + "] = {type: " + op.type
                + "};// NOT\n";
            break;
          case id.ABG:
            source += "  this.rules[" + ruleIndex + "].opcodes[" + opIndex + "] = {type: " + op.type
                + "};// ABG(%^)\n";
            break;
          case id.AEN:
            source += "  this.rules[" + ruleIndex + "].opcodes[" + opIndex + "] = {type: " + op.type
                + "};// AEN(%$)\n";
            break;
          case id.BKA:
            source += "  this.rules[" + ruleIndex + "].opcodes[" + opIndex + "] = {type: " + op.type
                + "};// BKA\n";
            break;
          case id.BKN:
            source += "  this.rules[" + ruleIndex + "].opcodes[" + opIndex + "] = {type: " + op.type
                + "};// BKN\n";
            break;
          case id.TLS:
            source += "  this.rules[" + ruleIndex + "].opcodes[" + opIndex + "] = {type: " + op.type
                + ", string: [" + op.string.toString() + "]};// TLS\n";
            break;
          case id.TBS:
            source += "  this.rules[" + ruleIndex + "].opcodes[" + opIndex + "] = {type: " + op.type
                + ", string: [" + op.string.toString() + "]};// TBS\n";
            break;
          case id.TRG:
            source += "  this.rules[" + ruleIndex + "].opcodes[" + opIndex + "] = {type: " + op.type + ", min: "
                + op.min + ", max: " + op.max + "};// TRG\n";
            break;
          }
        });
      });
      source += "\n";
      source +=
          "  // The `toString()` function will display the original grammar file(s) that produced these opcodes.\n";
      source += "  this.toString = function(){\n";
      source += '    var str = "";\n';
      var str;
      grammarAnalysisParser.lines.forEach(function(line, index) {
        var end = line.beginChar + line.length;
        str = "";
        source += '    str += "';
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
          source += str;
        }
        source += '";\n';
      });
      source += '    return str;\n';
      source += '  }\n';
      source += "}\n";
    } catch (e) {
      throw new Error(thisFileName + "generateJavaScript(): file system error\n" + e.message);
    }
    return source;
  }
  // Generate a grammar file object.
  // Returns the same object as instantiating the constructor function returned by<br>
  //`this.generateSource()`.<br>
  // It is used internally by the **apg-exp** application.
  this.generateObject = function(rules, udts) {
    var obj = {};
    if (grammarAnalysisParser) {
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
