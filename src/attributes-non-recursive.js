// This module is used by [`attributes.js`](./attributes.html) to determine non-recursive attributes
// (`finite`, `empty` and `not empty`) of each rule.
// The non-recursive attributes of all rules are needed by the algorithms which determine the recursive attributes.
//
// In a nut shell, the general algorithm is to generate a "single-expansion parse tree" (`SEPT`).
// That is, each rule name in a rule definition
// is expanded once. If any rule name appears a second time on any branch of the `SEPT` (e.g. it is a recursive rule),
// the second occurrence is considered a terminal leaf node with initial leaf properties.
// Those leaf properties are then modified by the various `ALT`, `CAT`, `REP`, etc. operators as the algorithm
// walks back up to the root node of the `SEPT`.
module.exports = function(rules) {
  "use strict";
  var thisFileName = "attributes-non-recursive.js: ";
  var id = require("apg-lib").ids;
  var that = this;
  /* Walks through the `SEPT` of opcodes for non-recursive and recursive rules. */
  var ruleAttr = function(rule, attr) {
    while (true) {
      if (rule.ctrl.isOpen === true || rule.ctrl.isComplete === true) {
        /* rule is complete - use previously computed values */
        /* or rule is open - use leaf values which have been previously initialized to this rule */
        attr.finite = rule.attr.finite;
        attr.empty = rule.attr.empty;
        attr.notEmpty = rule.attr.notEmpty;
        break;
      }
      /* open the rule an traverse its opcodes */
      rule.ctrl.isOpen = true;
      opcodeAttr(rule, 0, attr);
      rule.ctrl.isOpen = false;
      rule.ctrl.isComplete = true;
      rule.attr.finite = attr.finite;
      rule.attr.empty = attr.empty;
      rule.attr.notEmpty = attr.notEmpty;
      break;
    }
  }
  /* Walks through the `SEPT` of opcodes for mutually-recursive sets of rules. */
  var mrRuleAttr = function(rule, attr) {
    while (true) {
      var branchName = branchNames[branchNames.length - 1] + rule.lower;
      if (rule.ctrl.isOpen === true || rule.ctrl.isComplete === true) {
        /* rule is complete - use previously computed values */
        /* or rule is open - use leaf values which have been previously initialized to this rule */
        attr.finite = rule.attr.finite;
        attr.empty = rule.attr.empty;
        attr.notEmpty = rule.attr.notEmpty;
        break;
      }
      var found = nameList.find(branchName);
      if (found !== -1) {
        /* use attributes of competed rule */
        attr.finite = found.finite;
        attr.empty = found.empty;
        attr.notEmpty = found.notEmpty;
        break;
      }
      /* branch name not found, open the rule an traverse its opcodes */
      branchNames.push(branchName);
      rule.ctrl.isOpen = true;
      opcodeAttr(rule, 0, attr);
      rule.ctrl.isOpen = false;
      rule.attr.finite = attr.finite;
      rule.attr.empty = attr.empty;
      rule.attr.notEmpty = attr.notEmpty;
      nameList.add(branchName, attr);
      branchNames.pop();
      break;
    }
  }
  /* process attributes through an ALT node */
  var altAttr = function(rule, opIndex, attr) {
    var opcode = rule.opcodes[opIndex];
    var childAttrs = [];
    for (var i = 0; i < opcode.children.length; i += 1) {
      var attri = new rules.attrConstructor();
      childAttrs.push(attri);
      opcodeAttr(rule, opcode.children[i], attri);
    }
    attr.finite = false;
    attr.empty = false;
    attr.notEmpty = false;
    for (var i = 0; i < childAttrs.length; i += 1) {
      var child = childAttrs[i];
      if (child.finite === true) {
        attr.finite = true;
      }
      if (child.empty === true) {
        attr.empty = true;
      } else {
        attr.notEmpty = true;
      }
    }
  }
  /* process attributes through a CAT node */
  var catAttr = function(rule, opIndex, attr) {
    var opcode = rule.opcodes[opIndex];
    var childAttrs = [];
    for (var i = 0; i < opcode.children.length; i += 1) {
      var attri = new rules.attrConstructor();
      childAttrs.push(attri);
      opcodeAttr(rule, opcode.children[i], attri);
    }
    attr.finite = true;
    attr.empty = true;
    attr.notEmpty = false;
    for (var i = 0; i < childAttrs.length; i += 1) {
      var child = childAttrs[i];
      if (child.finite === false) {
        attr.finite = false;
      }
      if (child.empty === false) {
        attr.empty = false;
        attr.notEmpty = true;
      }
    }
  }
  /* process attributes through a REP node */
  var repAttr = function(rule, opIndex, attr) {
    var opcode = rule.opcodes[opIndex];
    opcodeAttr(rule, opIndex + 1, attr);
    if (opcode.min === 0) {
      attr.finite = true;
      attr.empty = true;
    }
  }
  /* process attributes through an opcode */
  var opcodeAttr = function(rule, opIndex, attr) {
    var opcode = rule.opcodes[opIndex];
    switch (opcode.type) {
    case id.ALT:
      altAttr(rule, opIndex, attr);
      break;
    case id.CAT:
      catAttr(rule, opIndex, attr);
      break;
    case id.REP:
      repAttr(rule, opIndex, attr);
      break;
    case id.RNM:
      ruleAttrFunc(rules[opcode.index], attr);
      break;
    case id.UDT:
      attr.finite = true;
      attr.empty = opcode.empty;
      attr.notEmpty = true;
      break;
    case id.AND:
    case id.NOT:
    case id.BKA:
    case id.BKN:
    case id.ABG:
    case id.AEN:
      attr.finite = true;
      attr.empty = true;
      attr.notEmpty = false;
      break;
    case id.TLS:
      attr.finite = true;
      attr.empty = opcode.string.length > 0 ? false : true;
      attr.notEmpty = !attr.empty;
      break;
    case id.TBS:
      attr.finite = true;
      attr.empty = false;
      attr.notEmpty = true;
      break;
    case id.BKR:
      attr.finite = true;
      attr.empty = true;
      attr.notEmpty = true;
      break;
    case id.TRG:
      attr.finite = true;
      attr.empty = false;
      attr.notEmpty = true;
      break;
    }

  }
  /* Initialize the attributes and attribute controls for all rules. */
  var branchNames = [];
  var nameList = new rules.nameListConstructor();
  var ruleAttrFunc = ruleAttr;
  var workAttr = new rules.attrConstructor();
  rules.forEach(function(rule) {
    rule.ctrl.isOpen = false;
    rule.ctrl.isComplete = false;
  });
  /* Get the attributes of the recursive and non-recursive rules. */ 
  rules.forEach(function(rule) {
    if (rule.ctrl.type === id.ATTR_N || rule.ctrl.type === id.ATTR_R) {
      if (rule.ctrl.isComplete === false) {
        ruleAttrFunc(rule, workAttr);
      }
    }
  });
  /* Get the attributes of the mutually-recursive sets of rules. */ 
  ruleAttrFunc = mrRuleAttr;
  rules.mrGroups.forEach(function(group) {
    group.forEach(function(ruleIndex) {
      var rule = rules[ruleIndex];
      nameList.clear();
      branchNames.length = 0;
      branchNames.push("");
      ruleAttrFunc(rule, workAttr);
      rule.ctrl.isComplete = true;
    });
  });
  /* Get the attributes of the recursive and non-recursive rules the refer to mutually recursive sets. */
  ruleAttrFunc = ruleAttr;
  var workAttr = new rules.attrConstructor();
  rules.forEach(function(rule) {
    if (rule.ctrl.type === id.ATTR_NMR || rule.ctrl.type === id.ATTR_RMR) {
      if (rule.ctrl.isComplete === false) {
        ruleAttrFunc(rule, workAttr);
      }
    }
  });
}
