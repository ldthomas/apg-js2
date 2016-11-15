// This module has all of the syntax callback functions for the [ABNF for SABNF parser](./abnf-for-sabnf-parser.html).
// (*See `resources/abnf-for-sabnf-grammar.bnf` for the grammar file these callback functions are based on.*)
// These functions are called by the parser's RNM operators (see `apg-lib` documentation).
module.exports = function() {
  "use strict";
  var thisFileName = "SyntaxCallbacks.js: ";
  var apglib = require("apg-lib");
  var id = apglib.ids;
  var topAlt;
  /* syntax, RNM, callback functions */
  var synFile = function(result, chars, phraseIndex, data) {
    switch (result.state) {
    case id.ACTIVE:
      data.altStack = [];
      data.repCount = 0;
      break;
    case id.EMPTY:
      data.errors.push({
        line : 0,
        char : 0,
        msg : "grammar file is empty"
      });
      break;
    case id.MATCH:
      if (data.ruleCount === 0) {
        data.errors.push({
          line : 0,
          char : 0,
          msg : "no rules defined"
        });
      }
      break;
    case id.NOMATCH:
      throw new Error(thisFileName + "synFile: grammar file NOMATCH: design error: should never happen.");
      break;
    }
  }
  var synRule = function(result, chars, phraseIndex, data) {
    switch (result.state) {
    case id.ACTIVE:
      data.altStack.length = 0;
      topAlt = {
        groupOpen : null,
        groupError : false,
        optionOpen : null,
        optionError : false,
        tlsOpen : null,
        clsOpen : null,
        prosValOpen : null,
        basicError : false
      }
      data.altStack.push(topAlt);
      break;
    case id.EMPTY:
      throw new Error(thisFileName + "synRule: EMPTY: rule cannot be empty");
      break;
    case id.NOMATCH:
      break;
    case id.MATCH:
      data.ruleCount += 1;
      break;
    }
  }
  var synRuleError = function(result, chars, phraseIndex, data) {
    switch (result.state) {
    case id.ACTIVE:
      break;
    case id.EMPTY:
      break;
    case id.NOMATCH:
      break;
    case id.MATCH:
      data.errors.push({
        line : data.findLine(phraseIndex),
        char : phraseIndex,
        msg : "Unrecognized SABNF line. Invalid rule, comment or blank line."
      });
      break;
    }
  }
  var synRuleNameError = function(result, chars, phraseIndex, data) {
    switch (result.state) {
    case id.ACTIVE:
      break;
    case id.EMPTY:
      break;
    case id.NOMATCH:
      break;
    case id.MATCH:
      data.errors.push({
        line : data.findLine(phraseIndex),
        char : phraseIndex,
        msg : "Rule names must be alphanum and begin with alphabetic character."
      });
      break;
    }
  }
  var synDefinedAsError = function(result, chars, phraseIndex, data) {
    switch (result.state) {
    case id.ACTIVE:
      break;
    case id.EMPTY:
      break;
    case id.NOMATCH:
      break;
    case id.MATCH:
      var l = data.findLine(phraseIndex);
      data.errors.push({
        line : data.findLine(phraseIndex),
        char : phraseIndex,
        msg : "Expected '=' or '=/'. Not found."
      });
      break;
    }
  }
  var synAndOp = function(result, chars, phraseIndex, data) {
    switch (result.state) {
    case id.ACTIVE:
      break;
    case id.EMPTY:
      break;
    case id.NOMATCH:
      break;
    case id.MATCH:
      if (data.strict) {
        data.errors.push({
          line : data.findLine(phraseIndex),
          char : phraseIndex,
          msg : "AND operator(&) found - strict ABNF specified."
        });
      }
      break;
    }
  }
  var synNotOp = function(result, chars, phraseIndex, data) {
    switch (result.state) {
    case id.ACTIVE:
      break;
    case id.EMPTY:
      break;
    case id.NOMATCH:
      break;
    case id.MATCH:
      if (data.strict) {
        data.errors.push({
          line : data.findLine(phraseIndex),
          char : phraseIndex,
          msg : "NOT operator(!) found - strict ABNF specified."
        });
      }
      break;
    }
  }
  var synBkaOp = function(result, chars, phraseIndex, data) {
    switch (result.state) {
    case id.ACTIVE:
      break;
    case id.EMPTY:
      break;
    case id.NOMATCH:
      break;
    case id.MATCH:
      if (data.strict) {
        data.errors.push({
          line : data.findLine(phraseIndex),
          char : phraseIndex,
          msg : "Positive look-behind operator(&&) found - strict ABNF specified."
        });
      }
      break;
    }
  }
  var synBknOp = function(result, chars, phraseIndex, data) {
    switch (result.state) {
    case id.ACTIVE:
      break;
    case id.EMPTY:
      break;
    case id.NOMATCH:
      break;
    case id.MATCH:
      if (data.strict) {
        data.errors.push({
          line : data.findLine(phraseIndex),
          char : phraseIndex,
          msg : "Negative look-behind operator(!!) found - strict ABNF specified."
        });
      }
      break;
    }
  }
  var synAbgOp = function(result, chars, phraseIndex, data) {
    switch (result.state) {
    case id.ACTIVE:
      break;
    case id.EMPTY:
      break;
    case id.NOMATCH:
      break;
    case id.MATCH:
      if (data.strict) {
        data.errors.push({
          line : data.findLine(phraseIndex),
          char : phraseIndex,
          msg : "Beginning of string anchor(%^) found - strict ABNF specified."
        });
      }
      break;
    }
  }
  var synAenOp = function(result, chars, phraseIndex, data) {
    switch (result.state) {
    case id.ACTIVE:
      break;
    case id.EMPTY:
      break;
    case id.NOMATCH:
      break;
    case id.MATCH:
      if (data.strict) {
        data.errors.push({
          line : data.findLine(phraseIndex),
          char : phraseIndex,
          msg : "End of string anchor(%$) found - strict ABNF specified."
        });
      }
      break;
    }
  }
  var synBkrOp = function(result, chars, phraseIndex, data) {
    switch (result.state) {
    case id.ACTIVE:
      break;
    case id.EMPTY:
      break;
    case id.NOMATCH:
      break;
    case id.MATCH:
      if (data.strict) {
        var name = apglib.utils.charsToString(chars, phraseIndex, result.phraseLength);
        data.errors.push({
          line : data.findLine(phraseIndex),
          char : phraseIndex,
          msg : "Back reference operator(" + name + ") found - strict ABNF specified."
        });
      }
      break;
    }
  }
  var synUdtOp = function(result, chars, phraseIndex, data) {
    switch (result.state) {
    case id.ACTIVE:
      break;
    case id.EMPTY:
      break;
    case id.NOMATCH:
      break;
    case id.MATCH:
      if (data.strict) {
        var name = apglib.utils.charsToString(chars, phraseIndex, result.phraseLength);
        data.errors.push({
          line : data.findLine(phraseIndex),
          char : phraseIndex,
          msg : "UDT operator found("+name+") - strict ABNF specified."
        });
      }
      break;
    }
  }
  var synTlsOpen = function(result, chars, phraseIndex, data) {
    switch (result.state) {
    case id.ACTIVE:
      break;
    case id.EMPTY:
      break;
    case id.NOMATCH:
      break;
    case id.MATCH:
      topAlt.tlsOpen = phraseIndex;
      break;
    }
  }
  var synTlsString = function(result, chars, phraseIndex, data) {
    switch (result.state) {
    case id.ACTIVE:
      data.stringTabChar = false;
      break;
    case id.EMPTY:
      break;
    case id.NOMATCH:
      break;
    case id.MATCH:
      if (data.stringTabChar !== false) {
        data.errors.push({
          line : data.findLine(data.stringTabChar),
          char : data.stringTabChar,
          msg : "Tab character (\\t, x09) not allowed in literal string (see 'quoted-string' definition, RFC 7405.)"
        });
      }
      break;
    }
  }
  var synStringTab = function(result, chars, phraseIndex, data) {
    switch (result.state) {
    case id.ACTIVE:
      break;
    case id.EMPTY:
      break;
    case id.NOMATCH:
      break;
    case id.MATCH:
      data.stringTabChar = phraseIndex;
      break;
    }
  }
  var synTlsClose = function(result, chars, phraseIndex, data) {
    switch (result.state) {
    case id.ACTIVE:
      break;
    case id.EMPTY:
      break;
    case id.NOMATCH:
      data.errors.push({
        line : data.findLine(topAlt.tlsOpen),
        char : topAlt.tlsOpen,
        msg : 'Case-insensitive literal string("...") opened but not closed.'
      });
      topAlt.basicError = true;
      topAlt.tlsOpen = null;
      break;
    case id.MATCH:
      topAlt.tlsOpen = null;
      break;
    }
  }
  var synClsOpen = function(result, chars, phraseIndex, data) {
    switch (result.state) {
    case id.ACTIVE:
      break;
    case id.EMPTY:
      break;
    case id.NOMATCH:
      break;
    case id.MATCH:
      topAlt.clsOpen = phraseIndex;
      break;
    }
  }
  var synClsString = function(result, chars, phraseIndex, data) {
    switch (result.state) {
    case id.ACTIVE:
      data.stringTabChar = false;
      break;
    case id.EMPTY:
      break;
    case id.NOMATCH:
      break;
    case id.MATCH:
      if (data.stringTabChar !== false) {
        data.errors.push({
          line : data.findLine(data.stringTabChar),
          char : data.stringTabChar,
          msg : "Tab character (\\t, x09) not allowed in literal string."
        });
      }
      break;
    }
  }
  var synClsClose = function(result, chars, phraseIndex, data) {
    switch (result.state) {
    case id.ACTIVE:
      break;
    case id.EMPTY:
      break;
    case id.NOMATCH:
      data.errors.push({
        line : data.findLine(topAlt.clsOpen),
        char : topAlt.clsOpen,
        msg : "Case-sensitive literal string('...') opened but not closed."
      });
      topAlt.clsOpen = null;
      topAlt.basicError = true;
      break;
    case id.MATCH:
      if (data.strict) {
        data.errors.push({
          line : data.findLine(topAlt.clsOpen),
          char : topAlt.clsOpen,
          msg : "Case-sensitive string operator('...') found - strict ABNF specified."
        });
      }
      topAlt.clsOpen = null;
      break;
    }
  }
  var synProsValOpen = function(result, chars, phraseIndex, data) {
    switch (result.state) {
    case id.ACTIVE:
      break;
    case id.EMPTY:
      break;
    case id.NOMATCH:
      break;
    case id.MATCH:
      topAlt.prosValOpen = phraseIndex;
      break;
    }
  }
  var synProsValString = function(result, chars, phraseIndex, data) {
    switch (result.state) {
    case id.ACTIVE:
      data.stringTabChar = false;
      break;
    case id.EMPTY:
      break;
    case id.NOMATCH:
      break;
    case id.MATCH:
      if (data.stringTabChar !== false) {
        data.errors.push({
          line : data.findLine(data.stringTabChar),
          char : data.stringTabChar,
          msg : "Tab character (\\t, x09) not allowed in prose value string."
        });
      }
      break;
    }
  }
  var synProsValClose = function(result, chars, phraseIndex, data) {
    switch (result.state) {
    case id.ACTIVE:
      break;
    case id.EMPTY:
      break;
    case id.NOMATCH:
      data.errors.push({
        line : data.findLine(topAlt.prosValOpen),
        char : topAlt.prosValOpen,
        msg : "Prose value operator(<...>) opened but not closed."
      });
      topAlt.basicError = true;
      topAlt.prosValOpen = null;
      break;
    case id.MATCH:
      data.errors
          .push({
            line : data.findLine(topAlt.prosValOpen),
            char : topAlt.prosValOpen,
            msg : "Prose value operator(<...>) found. The ABNF syntax is valid, but a parser cannot be generated from this grammar."
          });
      topAlt.prosValOpen = null;
      break;
    }
  }
  var synGroupOpen = function(result, chars, phraseIndex, data) {
    switch (result.state) {
    case id.ACTIVE:
      break;
    case id.EMPTY:
      break;
    case id.NOMATCH:
      break;
    case id.MATCH:
      topAlt = {
        groupOpen : phraseIndex,
        groupError : false,
        optionOpen : null,
        optionError : false,
        tlsOpen : null,
        clsOpen : null,
        prosValOpen : null,
        basicError : false
      }
      data.altStack.push(topAlt);
      break;
    }
  }
  var synGroupClose = function(result, chars, phraseIndex, data) {
    switch (result.state) {
    case id.ACTIVE:
      break;
    case id.EMPTY:
      break;
    case id.NOMATCH:
      data.errors.push({
        line : data.findLine(topAlt.groupOpen),
        char : topAlt.groupOpen,
        msg : "Group \"(...)\" opened but not closed."
      });
      topAlt = data.altStack.pop();
      topAlt.groupError = true;
      break;
    case id.MATCH:
      topAlt = data.altStack.pop();
      break;
    }
  }
  var synOptionOpen = function(result, chars, phraseIndex, data) {
    switch (result.state) {
    case id.ACTIVE:
      break;
    case id.EMPTY:
      break;
    case id.NOMATCH:
      break;
    case id.MATCH:
      topAlt = {
        groupOpen : null,
        groupError : false,
        optionOpen : phraseIndex,
        optionError : false,
        tlsOpen : null,
        clsOpen : null,
        prosValOpen : null,
        basicError : false
      }
      data.altStack.push(topAlt);
      break;
    }
  }
  var synOptionClose = function(result, chars, phraseIndex, data) {
    switch (result.state) {
    case id.ACTIVE:
      break;
    case id.EMPTY:
      break;
    case id.NOMATCH:
      data.errors.push({
        line : data.findLine(topAlt.optionOpen),
        char : topAlt.optionOpen,
        msg : "Option \"[...]\" opened but not closed."
      });
      topAlt = data.altStack.pop();
      topAlt.optionError = true;
      break;
    case id.MATCH:
      topAlt = data.altStack.pop();
      break;
    }
  }
  var synBasicElementError = function(result, chars, phraseIndex, data) {
    switch (result.state) {
    case id.ACTIVE:
      break;
    case id.EMPTY:
      break;
    case id.NOMATCH:
      break;
    case id.MATCH:
      if (topAlt.basicError === false) {
        data.errors.push({
          line : data.findLine(phraseIndex),
          char : phraseIndex,
          msg : "Unrecognized SABNF element."
        });
      }
      break;
    }
  }
  var synLineEndError = function(result, chars, phraseIndex, data) {
    switch (result.state) {
    case id.ACTIVE:
      break;
    case id.EMPTY:
      break;
    case id.NOMATCH:
      break;
    case id.MATCH:
      data.errors.push({
        line : data.findLine(phraseIndex),
        char : phraseIndex,
        msg : "Unrecognized grammar element or characters."
      });
      break;
    }
  }
  var synRepetition = function(result, chars, phraseIndex, data) {
    switch (result.state) {
    case id.ACTIVE:
      break;
    case id.EMPTY:
      break;
    case id.NOMATCH:
      data.repCount += 1;
      break;
    case id.MATCH:
      data.repCount += 1;
      break;
    }
  }
  /* define the list of callback functions */
  this.callbacks = [];
  this.callbacks['andop'] = synAndOp;
  this.callbacks['basicelementerr'] = synBasicElementError;
  this.callbacks['clsclose'] = synClsClose;
  this.callbacks['clsopen'] = synClsOpen;
  this.callbacks['clsstring'] = synClsString;
  this.callbacks['definedaserror'] = synDefinedAsError;
  this.callbacks['file'] = synFile;
  this.callbacks['groupclose'] = synGroupClose;
  this.callbacks['groupopen'] = synGroupOpen;
  this.callbacks['lineenderror'] = synLineEndError;
  this.callbacks['notop'] = synNotOp;
  this.callbacks['optionclose'] = synOptionClose;
  this.callbacks['optionopen'] = synOptionOpen;
  this.callbacks['prosvalclose'] = synProsValClose;
  this.callbacks['prosvalopen'] = synProsValOpen;
  this.callbacks['prosvalstring'] = synProsValString;
  this.callbacks['repetition'] = synRepetition;
  this.callbacks['rule'] = synRule;
  this.callbacks['ruleerror'] = synRuleError;
  this.callbacks['rulenameerror'] = synRuleNameError;
  this.callbacks['stringtab'] = synStringTab;
  this.callbacks['tlsclose'] = synTlsClose;
  this.callbacks['tlsopen'] = synTlsOpen;
  this.callbacks['tlsstring'] = synTlsString;
  this.callbacks['udtop'] = synUdtOp;
  this.callbacks['bkaop'] = synBkaOp;
  this.callbacks['bknop'] = synBknOp;
  this.callbacks['bkrop'] = synBkrOp;
  this.callbacks['abgop'] = synAbgOp;
  this.callbacks['aenop'] = synAenOp;
}
