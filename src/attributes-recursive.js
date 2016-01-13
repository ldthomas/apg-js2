// This module is used by [`attributes.js`](./attributes.html) to determine recursive attributes
// (`left`, `nested`, `right` & `cyclic`) of each rule.
//
// Assumes non-recursive attributes, `finite`, `empty` & `not empty` have already been determined.
// Follows the same logic of walking the `SEPT` as with the non-recursive attributes
// (*see the `SEPT` discussion [there](./attributes-non-recursive.html)*)
// but with different rules of discovery as it goes.
// Knowing the non-recursive attributes of the recursive rules in advance
// is required by this algorithm.
module.exports = function(rules) {
  "use strict";
  var thisFileName = "attributes-recursive.js: ";
  var id = require("apg-lib").ids;
  var that = this;

  // Walk the `SEPT` for one specific rule.
  var ruleAttr = function(startIndex, rule, attr) {
    while (true) {
      if (rule.index === startIndex && rule.ctrl.isOpen === true) {
        /* start rule is open, use previously initialized (leaf) values */
        attr.left = rule.attr.left;
        attr.nested = rule.attr.nested;
        attr.right = rule.attr.right;
        attr.cyclic = rule.attr.cyclic;
        attr.finite = rule.attr.finite;
        attr.empty = rule.attr.empty;
        attr.notEmpty = rule.attr.notEmpty;
        break;
      }
      if (rule.ctrl.refCount[startIndex] === 0) {
        /* rule does not refer to start rule - use terminal leaf values */
        attr.left = false;
        attr.nested = false;
        attr.right = false;
        attr.cyclic = false;
        attr.finite = rule.attr.finite;
        attr.empty = rule.attr.empty;
        attr.notEmpty = rule.attr.notEmpty;
        break;
      }
      if (rule.ctrl.isOpen === true) {
        /* rule refers to start rule and is open - use terminal leaf values */
        attr.left = false;
        attr.nested = false;
        attr.right = false;
        attr.cyclic = false;
        attr.finite = rule.attr.finite;
        attr.empty = rule.attr.empty;
        attr.notEmpty = rule.attr.notEmpty;
        break;
      }

      /* rule refers to the start rule and is NOT open -
         look it up to see if it has been traversed in this branch configuration before */
      var branchName = branchNames[branchNames.length - 1] + rule.lower;
      var found = nameList.find(branchName);
      if (found !== -1) {
        /* use attributes of completed branch rule */
        attr.left = found.left;
        attr.nested = found.nested;
        attr.right = found.right;
        attr.cyclic = found.cyclic;
        attr.finite = found.finite;
        attr.empty = found.empty;
        attr.notEmpty = found.notEmpty;
        break;
      }
      /* rule refers to start rule and has not been traversed in this branch configuration
         - open the rule an traverse its opcodes */
      branchNames.push(branchName);
      rule.ctrl.isOpen = true;
      opcodeAttr(startIndex, rule, 0, attr);
      rule.ctrl.isOpen = false;
      nameList.add(branchName, attr);
      branchNames.pop();
      break;
    }
  }

  var altAttr = function(startIndex, rule, opIndex, attr) {
    var opcode = rule.opcodes[opIndex];
    var childAttrs = [];
    for (var i = 0; i < opcode.children.length; i += 1) {
      var attri = new rules.attrConstructor();
      childAttrs.push(attri);
      opcodeAttr(startIndex, rule, opcode.children[i], attri);
    }
    attr.left = false;
    attr.nested = false;
    attr.right = false;
    attr.cyclic = false;
    attr.finite = false;
    attr.empty = false;
    attr.notEmpty = false;
    /* if any child attribute is true, that ALT attribute is true */
    for (var i = 0; i < childAttrs.length; i += 1) {
      var child = childAttrs[i];
      if (child.left === true) {
        attr.left = true;
      }
      if (child.nested === true) {
        attr.nested = true;
      }
      if (child.right === true) {
        attr.right = true;
      }
      if (child.cyclic === true) {
        attr.cyclic = true;
      }
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

  /* CAT nested is complicated !! */
  var isCatNested = function(childAttrs) {
    var ret = false;
    var child, found, foundLeft, foundRecursive;
    /* 1.) if any child is nested, CAT is nested */
    for (var i = 0; i < childAttrs.length; i += 1) {
      var child = childAttrs[i];
      if (child.nested === true) {
        return true;
      }
    }

    /* 2.) the left-most, right recursive child is followed by a non-empty child */
    foundRecursive = false;
    for (var i = 0; i < childAttrs.length; i += 1) {
      var child = childAttrs[i];
      if (foundRecursive) {
        if (child.notEmpty === true) {
          return true;
        }
      } else {
        if (child.right === true && child.left === false
            && child.notEmpty === true) {
          foundRecursive = true;
        }
      }
    }

    /* 3.) the right-most, left recursive child is followed by a non-empty child */
    foundRecursive = false;
    for (var i = childAttrs.length - 1; i >= 0; i -= 1) {
      var child = childAttrs[i];
      if (foundRecursive) {
        if (child.notEmpty === true) {
          return true;
        }
      } else {
        if (child.left === true && child.right === false
            && child.notEmpty === true) {
          foundRecursive = true;
        }
      }
    }

    /* 4.) there is at least one recursive term between the left-most and right-most non-empty-only terms */
    var isRecursive
    foundLeft = false;
    foundRecursive = false;
    found = false;
    for (var i = 0; i < childAttrs.length; i += 1) {
      var child = childAttrs[i];
      if (foundLeft === false) {
        if (child.notEmpty === true) {
          foundLeft = true;
        }
      } else {
        if (foundRecursive === false) {
          if (child.left === true || child.right === true
              || child.cyclic === true) {
            foundRecursive = true;
          }
        } else {
          if (child.notEmpty === true) {
            return true;
          }
        }
      }
    }

    return false;
  }
  var isCatLeft = function(childAttrs) {
    var ret = false;
    for (var i = 0; i < childAttrs.length; i += 1) {
      if (childAttrs[i].left === true) {
        ret = true; /* left-most non-empty is left - CAT is left */
        break;
      }
      if (childAttrs[i].empty === false) {
        ret = false; /* non-empty child - CAT is not left */
        break;
      }
      /* else keep looking */
    }
    return ret;
  }
  var isCatRight = function(childAttrs) {
    var ret = false;
    for (var i = childAttrs.length - 1; i >= 0; i -= 1) {
      if (childAttrs[i].right === true) {
        ret = true; /* right-most non-empty is right - CAT is right */
        break;
      }
      if (childAttrs[i].empty === false) {
        ret = false; /* non-empty child - CAT is not right */
        break;
      }
      /* else keep looking */
    }
    return ret;
  }
  var isCatCyclic = function(childAttrs) {
    var ret = true;
    for (var i = 0; i < childAttrs.length; i += 1) {
      if (childAttrs[i].cyclic === false) {
        ret = false; /* if any child is NOT cyclic, CAT is not cyclic */
        break;
      }
    }
    return ret;
  }
  var catAttr = function(startIndex, rule, opIndex, attr) {
    var opcode = rule.opcodes[opIndex];
    var childAttrs = [];
    for (var i = 0; i < opcode.children.length; i += 1) {
      var attri = new rules.attrConstructor();
      childAttrs.push(attri);
      opcodeAttr(startIndex, rule, opcode.children[i], attri);
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
    attr.left = isCatLeft(childAttrs);
    attr.nested = isCatNested(childAttrs);
    attr.right = isCatRight(childAttrs);
    attr.cyclic = isCatCyclic(childAttrs);
  }

  var repAttr = function(startIndex, rule, opIndex, attr) {
    opcodeAttr(startIndex, rule, opIndex + 1, attr);
  }
  var opcodeAttr = function(startIndex, rule, opIndex, attr) {
    var opcode = rule.opcodes[opIndex];
    attr.left = false;
    attr.nested = false;
    attr.right = false;
    attr.cyclic = false;
    switch (opcode.type) {
    case id.ALT:
      altAttr(startIndex, rule, opIndex, attr);
      break;
    case id.CAT:
      catAttr(startIndex, rule, opIndex, attr);
      break;
    case id.REP:
      repAttr(startIndex, rule, opIndex, attr);
      break;
    case id.RNM:
      ruleAttr(startIndex, rules[opcode.index], attr);
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

  // Initialize the attribute and controls of all rules.
  var branchNames = [];
  var nameList = new rules.nameListConstructor();
  var workAttr = new rules.attrConstructor();
  rules.forEach(function(rule) {
    rule.ctrl.isOpen = false;
    rule.ctrl.isComplete = false;
  });
  
  // Walk through the `SEPT`, determining attributes as we go.
  for (var i = 0; i < rules.length; i += 1) {
    if (rules[i].ctrl.type === id.ATTR_R || rules[i].ctrl.type === id.ATTR_MR
        || rules[i].ctrl.type === id.ATTR_RMR) {
      var rule = rules[i];
      var attri = rules[i].attr;
      nameList.clear();
      branchNames.length = 0;
      branchNames.push("");
      ruleAttr(i, rules[i], workAttr);
      rule.attr.left = workAttr.left;
      rule.attr.nested = workAttr.nested;
      rule.attr.right = workAttr.right;
      rule.attr.cyclic = workAttr.cyclic;
    }
  }
}
