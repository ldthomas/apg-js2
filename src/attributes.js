module.exports = function(rules){
	"use strict";
	var thisFileName = "attributes.js: ";
	var id = require("apg-lib").ids;
	var attrTypes = require("./attribute-types.js");
	var attrNonRecursive = require("./attributes-non-recursive.js");
	var attrRecursive = require("./attributes-recursive.js");
	var that = this;

	// LOCAL FUNCTIONS
	var ruleErrorCount = 0;
	var attrChar =  function(value, error) {
		var text;
		var ret;
		while(true){
			if(value === true){
				text = "yes";
			}else if(value === false){
				text = "no";
			}else{
				ret = '<kbd><em>&#9548</em></kbd>';
				break;
			}
			if (error === true) {
				ret = '<b><strong>' + text + '</b></strong>';
			}else{
				ret = '<kbd><strong>' + text + '</kbd></strong>';
			}
			break;
		}
		return ret;
	}

	var attrTypeToString = function(ctrl) {
		var ret = 'unknown';
		switch (ctrl.type) {
		case id.ATTR_N:
			ret = 'N';
			break;

		case id.ATTR_R:
			ret = 'R';
			break;

		case id.ATTR_MR:
			ret = 'MR(' + ctrl.mrGroupId + ')';
			break;

		case id.ATTR_NMR:
			ret = 'NMR';
			break;

		case id.ATTR_RMR:
			ret = 'RMR';
			break;
		}
		return ret;
	}

	var sortByError = function(r, l) {
		var rerror = (r.attr.left === true || r.attr.cyclic === true || r.attr.finite === false) ? true : false;
		var lerror = (l.attr.left === true || l.attr.cyclic === true || l.attr.finite === false) ? true : false;
		
		if (rerror === false && lerror === true ) {
			return 1;
		}
		if (rerror === true && lerror === false) {
			return -1;
		}
		return 0;
	}
	
	var sortByIndex = function(r, l) {
		if (r.index < l.index) {
			return -1;
		}
		if (r.index > l.index) {
			return 1;
		}
		return 0;
	}
	
	var sortByName = function(r, l) {
		if (r.lower < l.lower) {
			return -1;
		}
		if (r.lower > l.lower) {
			return 1;
		}
		return 0;
	}
	
	var sortByType = function(r, l) {
		var ar = r.ctrl;
		var al = l.ctrl;
		if (ar.type < al.type) {
			return -1;
		}
		if (ar.type > al.type) {
			return 1;
		}
		if (ar.type === id.ATTR_MR) {
			// sort by mr group
			if (ar.mrGroupId < al.mrGroupId) {
				return -1;
			}
			if (ar.mrGroupId < al.mrGroupId) {
				return 1;
			}
		}
		return sortByName(r, l);
	}
	
	var attrsToHtml = function(rules, title, className) {
		var html = '';
		var error, attr;
		var hasErrors = false;
		var className = "apg-table";
		var title = "Grammar Attributes";
		html += "<script>\n";
		html += 'var attrSortCol = "index"\n';
		html += 'var attrSortErrors = true\n';
		html += 'var attrSortDir = 0\n';
		html += 'var attrDirs = {index: 0, rule: 0, type: 0, left: 0, nested: 0, right: 0, cyclic: 0, finite: 0, empty: 0, notempty: 0}\n';
		html += 'var attrRows = [\n';
		var rcount = 0;
		rules.forEach(function(rule) {
			if(rcount === 0){
				rcount += 1;
			}else{
				html += ',\n';
			}
			attr = rule.attr;
			error = false;
			if(attr.left === true || attr.cyclic === true || attr.finite === false){
				error = true;
				hasErrors = true;
			}
			html += '{error: '+error+', index: '+rule.index+', rule: "'+rule.name+'", lower: "'+rule.lower+'"';
			html += ', type: ' + rule.ctrl.type + ', typename: "' + attrTypeToString(rule.ctrl) +'"';
			html += ', left: '+attr.left+', nested: '+attr.nested+', right: '+attr.right+', cyclic: '+attr.cyclic;
			html += ', finite: '+attr.finite+', empty: '+attr.empty+', notempty: '+attr.notEmpty;
			html += '}';
		});
		html += '\n]\n';
		html += 'var attrHasErrors = '+hasErrors+'\n';
		html += "</script>\n";
		html += '<div id="sort-links" >\n';
		html += "</div>\n";

		return html;
	}
	var AttrCtrl = function(emptyArray) {
		this.isOpen = false;
		this.isComplete = false;
		this.type = id.ATTR_N;
		this.mrGroupId = -1;
		this.refCount = emptyArray.slice(0);
		this.isScanned = emptyArray.slice(0);
	}

	var Attr = function(recursive){
		if(recursive === true){
			this.left = true;
			this.nested = false;
			this.right = true;
			this.cyclic = true;
		}else{
			this.left = false;
			this.nested = false;
			this.right = false;
			this.cyclic = false;
		}
		this.finite = false;
		this.empty = true;
		this.notEmpty = false;
		this.error = false;

		this.copy = function(attr){
			attr.left = this.left;
			attr.nested = this.nested;
			attr.right = this.right;
			attr.cyclic = this.cyclic;
			attr.finite = this.finite;
			attr.empty = this.empty;
			attr.notEmpty = this.notEmpty;
			attr.error= this.error;
		}
		this.copyNR = function(attr){
			attr.finite = this.finite;
			attr.empty = this.empty;
		}
		this.copyR = function(attr){
			attr.left = this.left;
			attr.nested = this.nested;
			attr.right = this.right;
			attr.cyclic = this.cyclic;
		}
	}
	
	var NameList = function() {
		var list = [];
		this.add = function(name, attr) {
			var ret = -1;
			var find = this.find(name);
			if (find === -1) {
				ret = {
					name : name,
					left : attr.left,
					nested : attr.nested,
					right : attr.right,
					cyclic : attr.cyclic,
					finite : attr.finite,
					empty : attr.empty,
					notEmpty: attr.notEmpty
				};
				list.push(ret);
			}
			return ret;
		}

		this.find = function(name) {
			var ret = -1;
			for (var i = 0; i < list.length; i += 1) {
				if (list[i].name === name) {
					ret = list[i];
					break;
				}
			}
			return ret;
		}
		this.clear = function(){
			list.length = 0;
		}
	}

	// PUBLIC FUNCTIONS
	this.ruleDependenciesToString = function() {
		var ret = "";
		rules.forEach(function(rule) {
			ret += "\n";
			ret += "\nRULE: " + rule.name;
			for (var i = 0; i < rules.length; i += 1) {
				if (rule.attr.refCount[i] > 0) {
					ret += "\n          " + rules[i].name;
				}
			}
		});

		return ret;
	}
	this.rulesWithReferencesToHtml = function() {
		var html = '';
		var className = "apg-table";
		var title = "Grammar Rules with Dependencies";
		html += "<script>\n";
		html += 'var tableData= {indexSort: "up", nameSort: "up", rows: [\n';
		var rcount = 0;
		rules.forEach(function(rule) {
			if(rcount === 0){
				rcount += 1;
			}else{
				html += ',';
			}
			html += '{name: "'+rule.name+'", lower: "'+rule.lower+'", index: '+rule.index;
			html += ', indexSort: "up", nameSort: "up", visible: true, dependents: [';
			var icount = 0;
			for (var i = 0; i < rules.length; i += 1) {
				if (rule.ctrl.refCount[i] > 0) {
					if(icount === 0){
						html += '{name: "'+rules[i].name+'", index: '+i+'}'
						icount += 1;
					}else{
						html += ','; 
						html += '{name: "'+rules[i].name+'", index: '+i+'}'
					}
				}
			}
			html += ']}\n';
		});
		html += ']};\n';
		html += "</script>\n";
		html += '<div id="sort-links" >\n';
		html += "</div>\n";

		return html;
	}
	this.ruleAttrsToHtml = function() {
		var html = "";
		rules.sort(sortByIndex);
		if(ruleErrorCount > 0){
			rules.sort(sortByError);
		}
		html += attrsToHtml(rules, "Attributes by Rule Index");
		rules.sort(sortByIndex); // make sure rules are left sorted by index - errors may change this
		return html;
	}

	// PUBLIC FUNCTIONS
	this.getAttributes = function(){
		
		// initialize each rule with an control object
		rules.attrConstructor = Attr;
		rules.nameListConstructor = NameList;
		var emptyArray = [];
		rules.forEach(function() {
			emptyArray.push(0); // empty array of length rules.length initialized to zero
		});
		rules.forEach(function(rule) {
			rule.ctrl = new AttrCtrl(emptyArray);
		});

		// rule dependencies and types
		attrTypes(rules);

		// initialize each rule with an attribute object
		rules.forEach(function(rule) {
			if(rule.ctrl.type === id.ATTR_R || rule.ctrl.type === id.ATTR_MR || rule.ctrl.type === id.ATTR_RMR){
				rule.attr = new Attr(true);
			}else{
				rule.attr = new Attr();
			}
		});
		
		// non-recursive attributes (finite & empty & notEmpty)
		attrNonRecursive(rules);
		
		// recursive attributes
		attrRecursive(rules);
		
		// rule errors
		ruleErrorCount = 0;
		rules.forEach(function(rule){
			if(rule.attr.left === true || rule.attr.finite === false || rule.attr.cyclic === true){
				rule.error = true;
				ruleErrorCount += 1;
			}else{
				rule.error = false;
			}
		});
		return ruleErrorCount;
	}
}
