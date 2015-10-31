module.exports = function(rules) {
	"use strict";

	// LOCAL VARIABLES
	var thisFileName = "attribute-types.js: ";
	var id = require("apg-lib").ids;
	var that = this;

	// LOCAL FUNCTIONS
	var scan = function(rule, index) {
		rule.ctrl.isScanned[index] += 1;
		rules[index].opcodes.forEach(function(op) {
			if (op.type === id.RNM) {
				rule.ctrl.refCount[op.index] += 1;
				if (rule.ctrl.isScanned[op.index] === 0)
					scan(rule, op.index);
			}
		});
	}


	// PUBLIC FUNCTIONS
	// get rule dependencies
	rules.forEach(function(rule) {
		scan(rule, rule.index);
	});

	// get recursive rules
	for (var i = 0; i < rules.length; i += 1) {
		if (rules[i].ctrl.refCount[i] > 0) {
			rules[i].ctrl.type = id.ATTR_R;
		}
	}

	// get mutually-recursive rules
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

	// get the rules that refer to mutually-recursive groups
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
