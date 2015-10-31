/*
 * Determine the non-recursive attributes, finite & empty, only.
 */
module.exports = function(rules) {
	"use strict";
	var thisFileName = "attributes-non-recursive.js: ";
	var id = require("apg-lib").ids;
	var that = this;
	
	// for non-recursive and recursive rules
	var ruleAttr = function(rule, attr) {
		while (true) {
			if(rule.ctrl.isOpen === true || rule.ctrl.isComplete === true){
				// rule is complete, use previously computed values
				// or rule is open, use leaf values (which have been previously initialized to this rule)
				attr.finite = rule.attr.finite;
				attr.empty = rule.attr.empty;
				attr.notEmpty = rule.attr.notEmpty;
				break;
			}
			// open the rule an traverse its opcodes
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

	// for mutually-recursive rules
	var mrRuleAttr = function(rule, attr) {
		while (true) {
			var branchName = branchNames[branchNames.length - 1] + rule.lower;
			if(rule.ctrl.isOpen === true || rule.ctrl.isComplete === true){
				// rule is complete, use previously computed values
				// or rule is open, use leaf values (which have been previously initialized to this rule)
				attr.finite = rule.attr.finite;
				attr.empty = rule.attr.empty;
				attr.notEmpty = rule.attr.notEmpty;
				break;
			}
			var found = nameList.find(branchName);
			if(found !== -1){
				// use attributes of competed rule
				attr.finite = found.finite;
				attr.empty = found.empty;
				attr.notEmpty = found.notEmpty;
				break;
			}
			// branch name not found, open the rule an traverse its opcodes
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
			}else{
				attr.notEmpty = true;
			}
		}
	}

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

	var repAttr = function(rule, opIndex, attr) {
		var opcode = rule.opcodes[opIndex];
		opcodeAttr(rule, opIndex + 1, attr);
		if (opcode.min === 0) {
			attr.finite = true;
			attr.empty = true;
		}
	}
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
		case id.TRG:
			attr.finite = true;
			attr.empty = false;
			attr.notEmpty = true;
			break;
		}

	}

	// recursive and non-recursive rules
	var branchNames = [];
	var nameList = new rules.nameListConstructor();
	var ruleAttrFunc = ruleAttr;
	var workAttr = new rules.attrConstructor();
	rules.forEach(function(rule) {
		rule.ctrl.isOpen = false;
		rule.ctrl.isComplete = false;
	});
	rules.forEach(function(rule) {
		if (rule.ctrl.type === id.ATTR_N || rule.ctrl.type === id.ATTR_R) {
			if(rule.ctrl.isComplete === false){
				ruleAttrFunc(rule, workAttr);
			}
		}
	});
	
	// mutually-recursive groups
	ruleAttrFunc = mrRuleAttr;
	rules.mrGroups.forEach(function(group) {
		group.forEach(function(ruleIndex){
			var rule = rules[ruleIndex];
			nameList.clear();
			branchNames.length = 0;
			branchNames.push("");
			ruleAttrFunc(rule, workAttr);
			rule.ctrl.isComplete = true;
		});
	});

	// refers to mutually recursive
	ruleAttrFunc = ruleAttr;
	var workAttr = new rules.attrConstructor();
	rules.forEach(function(rule) {
		if (rule.ctrl.type === id.ATTR_NMR || rule.ctrl.type === id.ATTR_RMR) {
			if(rule.ctrl.isComplete === false){
				ruleAttrFunc(rule, workAttr);
			}
		}
	});
}
