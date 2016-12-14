// This module is used by [`attributes.js`](./attributes.html) to determine rule dependencies
// (which rules are referenced by the given rule)
// and the attribute type of each rule.
// In general, rules are either recursive (the rule refers to itself)
// or non-recursive (the rule never refers to itself).
// However, for the purposes of determining these types, several refinements of these types are required.
//
// Sometimes it happens that several rules my refer to one another. e.g.
// ````
// S = "x" A / "y"
// A = "a" S / "b"
// ````
// These are called "mutually recursive sets".
// Note that within a mutually recursive set, each rule in the set refers to *all* other rules in the set
// directly or indirectly.
//Additionally, and important to the algorithms internally, are
// non-recursive rules that refer to mutually recursive sets, and simple recursive rules
// that refer to mutually recursive sets.
// On the output page `html/attributes.html` these are designated as:
// - N - non-recursive
// - R - simple recursive
// - MR - belongs to a mutually recursive set
// - NMR - non-recursive, but refers to one or more mutually recursive set member
// - RMR -  simple recursive, but refers to one or more mutually recursive set member
module.exports = function(rules) {
  "use strict";
  var thisFileName = "attribute-types.js: ";
  var id = require("apg-lib").ids;
  var that = this;
  /* scan a specific rule */
  /* see if it refers to itself (recursive) */
  /* see which other rules it refers to */
  var scan = function(rule, index) {
    rule.ctrl.isScanned[index] += 1;
    rules[index].opcodes.forEach(function(op) {
      if (op.type === id.RNM) {
        rule.ctrl.refCount[op.index] += 1;
        if (rule.ctrl.isScanned[op.index] === 0)
          scan(rule, op.index);
      }
      if (op.type === id.UDT) {
        rule.ctrl.udtRefCount[op.index] += 1;
      }
    });
  }
  rules.forEach(function(rule) {
    scan(rule, rule.index);
  });
  /* Determine which rules are recursive. */
  for (var i = 0; i < rules.length; i += 1) {
    if (rules[i].ctrl.refCount[i] > 0) {
      rules[i].ctrl.type = id.ATTR_R;
    }
  }
  /* Discover the mutually-recursive sets of rules. */
  rules.mrGroups = [];
  for (var i = 0; i < rules.length; i += 1) {
    var ctrli = rules[i].ctrl;
    if (ctrli.type === id.ATTR_R) {
      var group = [];
      for (var j = 0; j < rules.length; j += 1) {
        if (i !== j) {
          var ctrlj = rules[j].ctrl;
          if (ctrlj.type === id.ATTR_R && ctrli.refCount[j] > 0
              && ctrlj.refCount[i]) {
            if (group.length == 0) {
              group.push(i);
              ctrli.type = id.ATTR_MR;
              ctrli.mrGroupId = rules.mrGroups.length;
            }
            group.push(j);
            ctrlj.type = id.ATTR_MR;
            ctrlj.mrGroupId = rules.mrGroups.length;
          }
        }
      }
      if (group.length > 0) {
        rules.mrGroups.push(group);
      }
    }
  }
  /* Discover the rules that refer to mutually-recursive sets. */
  for (var i = 0; i < rules.length; i += 1) {
    var ctrli = rules[i].ctrl;
    for (var j = 0; j < rules.length; j += 1) {
      var ctrlj = rules[j].ctrl;
      if (ctrli.refCount[j] > 0 && ctrlj.type === id.ATTR_MR) {
        if (ctrli.type === id.ATTR_N) {
          ctrli.type = id.ATTR_NMR;
        } else if (ctrli.type === id.ATTR_R) {
          ctrli.type = id.ATTR_RMR;
        }
      }
    }
  }
}
