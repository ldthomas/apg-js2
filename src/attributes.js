// This module, along with
// [`attribute-types.js`](./attribute-types.html), 
// [`attributes-recursive.js`](./attributes-recursive.html),
//  and [`attributes-non-recursive.js`](./attributes-non-recursive.html)
// determines the rule dependencies (the list of rules referenced by each rule)
// and rule attributes.
// Attributes are displayed on the `html/attributes.html` output page.
//
// It is well known that recursive-descent parsers will fail if a rule is left recursive.
// e.g.<br>
// `S = S / "y"`<br>
// Left recursion, here, is considered to be a fatal attribute of the grammar.
// There are a couple of other fatal attributes that need to be disclosed
// but, in addition, there are several non-fatal attributes that are of interest as well.
// This module will determine seven different attributes:
// 1. left recursion(fatal)<br>
//    `S = S "x" / "y"`
// 2. nested recursion(OK)<br>
// `S = "a" S "b" / "y"`
// 3. right recursion(OK)<br>
// `S = "x" S / "y"`
// 4. cyclic(fatal)<br>
// `S = S`
// 5. finite(fatal if not finite)<br>
// `S = "y" S` (defines only infinite strings)
// 6. empty(OK, but very important to know about)<br>
// `S = "x" S / ""`
// 7. not empty(OK, *see below*)<br>
// `S = "x" S / "y"`
//
// Note that these are "aggregate" attributes, in that if the attribute is true it only means that it *can* be true,
// not that it will always be true for every input string. It also means that more than one attribute may be true for a given rule.
//
// You may wonder why we would be interested in both `empty` and `not empty` as separate attributes. First of all note that<br>
// `S = "" / "y"`<br>
// demonstrates a rule that is both empty and non-empty. The importance is not apparent here, and won't be explained
// in detail, but both attributes turn out to be important to the algorithms that determine the recursiveness of a rule.
// But if your really, really want to know, take a look at the function `catAttr()` and how it is used in 
// [`attributes-recursive.js`](./attributes-recursive.html).
module.exports = function() {
  "use strict";
  var thisFileName = "attributes.js: ";
  var apglib = require("apg-lib");
  var style = apglib.utils.styleNames;
  var id = apglib.ids;
  var attrTypes = require("./attribute-types.js");
  var attrNonRecursive = require("./attributes-non-recursive.js");
  var attrRecursive = require("./attributes-recursive.js");
  var htmlSources = require("./html-files-sources.js");
  var that = this;
  var rules = null;
  var ruleErrorCount = 0;
  var attrChar = function(value, error) {
    var text;
    var ret;
    while (true) {
      if (value === true) {
        text = "yes";
      } else if (value === false) {
        text = "no";
      } else {
        ret = '<kbd><em>&#9548</em></kbd>';
        break;
      }
      if (error === true) {
        ret = '<b><strong>' + text + '</b></strong>';
      } else {
        ret = '<kbd><strong>' + text + '</kbd></strong>';
      }
      break;
    }
    return ret;
  }

  // Simple conversion of the attribute ID to a human-readable string.
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

  // Array.sort() callback, sort putting errors at top.
  var sortByError = function(r, l) {
    var rerror = (r.attr.left === true || r.attr.cyclic === true || r.attr.finite === false) ? true : false;
    var lerror = (l.attr.left === true || l.attr.cyclic === true || l.attr.finite === false) ? true : false;

    if (rerror === false && lerror === true) {
      return 1;
    }
    if (rerror === true && lerror === false) {
      return -1;
    }
    return 0;
  }

  // Array.sort() callback, sort by rule index.
  var sortByIndex = function(r, l) {
    if (r.index < l.index) {
      return -1;
    }
    if (r.index > l.index) {
      return 1;
    }
    return 0;
  }

  // Array.sort() callback, sort by rule name.
  var sortByName = function(r, l) {
    if (r.lower < l.lower) {
      return -1;
    }
    if (r.lower > l.lower) {
      return 1;
    }
    return 0;
  }

  // Array.sort() callback, sort by rule type.
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
      if (ar.mrGroupId < al.mrGroupId) {
        return -1;
      }
      if (ar.mrGroupId < al.mrGroupId) {
        return 1;
      }
    }
    return sortByName(r, l);
  }

  // Convert an attribute to an HTML `<script>` of JavaScript data.
  // Used by the click-to-sort anchors.
  // Uses `attrsort` below.
  var attrsToHtml = function(rules, title) {
    var html = '';
    var error, attr;
    var hasErrors = false;
    var title = "Grammar Attributes";
    html += '<script type="text/javascript">\n';
    html += 'var attrSortCol = "index"\n';
    html += 'var attrSortErrors = true\n';
    html += 'var attrSortDir = 0\n';
    html += 'var attrDirs = {index: 0, rule: 0, type: 0, left: 0, nested: 0, right: 0, cyclic: 0, finite: 0, empty: 0, notempty: 0}\n';
    html += 'var attrRows = [\n';
    var rcount = 0;
    rules.forEach(function(rule) {
      if (rcount === 0) {
        rcount += 1;
      } else {
        html += ',\n';
      }
      attr = rule.attr;
      error = false;
      if (attr.left === true || attr.cyclic === true || attr.finite === false) {
        error = true;
        hasErrors = true;
      }
      html += '{error: ' + error + ', index: ' + rule.index + ', rule: "' + rule.name + '", lower: "' + rule.lower + '"';
      html += ', type: ' + rule.ctrl.type + ', typename: "' + attrTypeToString(rule.ctrl) + '"';
      html += ', left: ' + attr.left + ', nested: ' + attr.nested + ', right: ' + attr.right + ', cyclic: ' + attr.cyclic;
      html += ', finite: ' + attr.finite + ', empty: ' + attr.empty + ', notempty: ' + attr.notEmpty;
      html += '}';
    });
    html += '\n]\n';
    html += 'var attrHasErrors = ' + hasErrors + '\n';
    html += "</script>\n";
    html += '<div id="sort-links" >\n';
    html += "</div>\n";

    return html;
  }

  // Attribute control object constructor.
  var AttrCtrl = function(emptyArray) {
    this.isOpen = false;
    this.isComplete = false;
    this.type = id.ATTR_N;
    this.mrGroupId = -1;
    this.refCount = emptyArray.slice(0);
    this.isScanned = emptyArray.slice(0);
  }

  // Attribute object constructor.
  var Attr = function(recursive) {
    if (recursive === true) {
      this.left = true;
      this.nested = false;
      this.right = true;
      this.cyclic = true;
    } else {
      this.left = false;
      this.nested = false;
      this.right = false;
      this.cyclic = false;
    }
    this.finite = false;
    this.empty = true;
    this.notEmpty = false;
    this.error = false;

    this.copy = function(attr) {
      attr.left = this.left;
      attr.nested = this.nested;
      attr.right = this.right;
      attr.cyclic = this.cyclic;
      attr.finite = this.finite;
      attr.empty = this.empty;
      attr.notEmpty = this.notEmpty;
      attr.error = this.error;
    }
    this.copyNR = function(attr) {
      attr.finite = this.finite;
      attr.empty = this.empty;
    }
    this.copyR = function(attr) {
      attr.left = this.left;
      attr.nested = this.nested;
      attr.right = this.right;
      attr.cyclic = this.cyclic;
    }
  };

  // Name list object constructor.
  // Used to keep the list of rule names referenced by each rule.
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
          notEmpty : attr.notEmpty
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
    this.clear = function() {
      list.length = 0;
    }
  };

  // Convert a list of rule dependencies to a human-readable list.
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

  // Convert the list of rule dependencies to an HTML `<script>` of JavaScript data.
  // Used by the click-to-hide/show anchors.
  // Uses `rulesort` below.
  this.rulesWithReferencesToHtml = function() {
    var html = '';
    var title = "Grammar Rules with Dependencies";
    html += '<script type="text/javascript">\n';
    html += 'var tableData= {indexSort: "up", nameSort: "up", rows: [\n';
    var rcount = 0;
    rules.forEach(function(rule) {
      if (rcount === 0) {
        rcount += 1;
      } else {
        html += ',';
      }
      html += '{name: "' + rule.name + '", lower: "' + rule.lower + '", index: ' + rule.index;
      html += ', indexSort: "up", nameSort: "up", visible: true, dependents: [';
      var icount = 0;
      for (var i = 0; i < rules.length; i += 1) {
        if (rule.ctrl.refCount[i] > 0) {
          if (icount === 0) {
            html += '{name: "' + rules[i].name + '", index: ' + i + '}'
            icount += 1;
          } else {
            html += ',';
            html += '{name: "' + rules[i].name + '", index: ' + i + '}'
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

  // Perform the initial sorting of the rule names.
  // The actual work is done by the Array.sort() callbacks.
  this.ruleAttrsToHtml = function() {
    var html = "";
    rules.sort(sortByIndex);
    if (ruleErrorCount > 0) {
      rules.sort(sortByError);
    }
    html += attrsToHtml(rules, "Attributes by Rule Index");
    rules.sort(sortByIndex); // make sure rules are left sorted by index - errors may change this
    return html;
  }

  // The main, driver function that controls the flow of attribute generation.
  // - determine rule dependencies and types (recursive, non-recursive, etc.)
  // - determine all of the non-recursive attributes first(finite, empty & non-empty).
  // These are required by the alogrithms that determine the recursive attributes.
  // - finally, determine the recursive attributes (left, nested, right & cyclic)
  this.getAttributes = function(grammarRules) {
    rules = grammarRules;
    rules.attrConstructor = Attr;
    rules.nameListConstructor = NameList;
    var emptyArray = [];
    rules.forEach(function() {
      emptyArray.push(0);
    });
    rules.forEach(function(rule) {
      rule.ctrl = new AttrCtrl(emptyArray);
    });

    attrTypes(rules);
    rules.forEach(function(rule) {
      if (rule.ctrl.type === id.ATTR_R || rule.ctrl.type === id.ATTR_MR || rule.ctrl.type === id.ATTR_RMR) {
        rule.attr = new Attr(true);
      } else {
        rule.attr = new Attr();
      }
    });

    attrNonRecursive(rules);
    attrRecursive(rules);
    ruleErrorCount = 0;
    var attrErrors = [];
    rules.forEach(function(rule) {
      rule.error = false;
      if (rule.attr.left === true) {
        rule.error = true;
        ruleErrorCount += 1;
        attrErrors.push({
          name : rule.name,
          error : "left recursive"
        });
      }
      if (rule.attr.finite === false) {
        rule.error = true;
        ruleErrorCount += 1;
        attrErrors.push({
          name : rule.name,
          error : "infinite"
        });
      }
      if (rule.attr.cyclic === true) {
        rule.error = true;
        ruleErrorCount += 1;
        attrErrors.push({
          name : rule.name,
          error : "cyclic"
        });
      }
    });
    return attrErrors;
  };
}
