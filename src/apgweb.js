// ## apgweb
// apgweb is the interface to the web page interface (GUI) to JavaScript APG 2.0.
/* Global HTML page information */
var GRAMMAR_AREA = 'grammar-area';
var PARSER_AREA = 'parser-area';
var INPUT_AREA = 'input-area';
var GRAMMAR_PAGE = 'grammar-page';
var RULES_PAGE = 'rules-page';
var ATTRS_PAGE = 'attrs-page';
var STATE_PAGE = 'state-page';
var STATS_PAGE = 'stats-page';
var TRACE_FRAME = 'trace-frame';
var PHRASES_FRAME = 'phrases-frame';
var TYPE_TEXTAREA = 1;
var TYPE_PAGE = 2;
var TYPE_FRAME = 3;
var PAGE_INFO = [];

// apgInput is an object for processing the input to a generated parser.
// It take the input string from the parser input area, performs validation
// checks and, if no errors, produces an array of characters for the parser to parse.
// - input: the input string
// - chars: an array of character codes matching the input string
// - parseChars: the array of character codes for the parser to process; may different from chars due to escaped character coding
// - invalidChars: the number of invalid characters found
// - invalidEscapes: the number of invalid escape sequences found (e.g. \xg - escape sequence not followed by hex digits)
var apgInput = function(input, mode){
  var apglib = require("apg-lib");
  var strings = [];
  var pmap = [];
  
  /* private functions */
  function ctrlChars(str){
    exp = /(\r\n)|(\n)|(\r)|(\t)/g;
    var out = "";
    var beg = 0;
    exp.lastIndex = 0;
    while((rx = exp.exec(str)) !== null){
      if(beg < rx.index){
        out += str.slice(beg, rx.index);
      }
      if(rx[1]){
        out += '<span class="apg-ctrl-char">CRLF</span><br>';
      }else if(rx[2]){
        out += '<span class="apg-ctrl-char">LF</span><br>';
      }else if(rx[3]){
        out += '<span class="apg-ctrl-char">CR</span><br>';
      }else if(rx[4]){
        out += '<span class="apg-ctrl-char">TAB</span>';
      }
      beg = rx.index + rx[0].length;
    }
    if(beg < str.length){
      out += str.slice(beg);
    }
    return out;
  }
  function findInvalidChars(str){
    function validRange(beg, end, chars, display){
      display.push(ctrlChars(str.slice(beg, end)));
    }
    function invalidRange(beg, end, chars, display){
      var str = '<span class="apg-error">\\x' + chars[beg].toString(16);
      for(var i = beg + 1; i < end; i +=1 ){
        str += '\\x' + chars[i].toString(16);
      }
      str += '</span>';
      display.push(str);
    }
    var exp = /[ -~\t\r\n]+/g;
    var rx = exp.exec(str);
    if(rx === null){
      /* entire string is invalid characters */
      var chars = apglib.utils.stringToChars(str);
      var display = [];
      invalidRange(0, str.length, chars, display);
      return false;
    }
    if(rx[0].length === str.length){
      /* entire string is valid*/
      return [];
    }
    var chars = apglib.utils.stringToChars(str);
    var display = [];
    var beg = 0;
    while(rx !== null){
      if(beg < rx.index){
        invalidRange(beg, rx.index, chars, display);
      }
      validRange(rx.index, rx.index + rx[0].length, chars, display);
      beg = exp.lastIndex;
      if(exp.lastIndex === 0){
        break;
      }
      rx = exp.exec(str);
    }
    if(beg < str.length){
      invalidRange(beg, str.length, chars, display);
    }
    return display;
  }
  function findInvalidEscapes(escapedStr, originalStr){
    function validRange(beg, end, chars, display){
      display.push(ctrlChars(originalStr.slice(beg, end)));
    }
    function invalidRange(beg, end, chars, display){
      display.push('<span class="apg-error">`</span>');
    }
    var display = [];
    var exp = /`/g;
    var rx = exp.exec(escapedStr);
    if(rx === null){
      /* no invalid escapes */
      return [];
    }
    var chars = apglib.utils.stringToChars(escapedStr);
    var display = [];
    var beg = 0;
    while(rx !== null){
      if(beg < rx.index){
        validRange(beg, rx.index, chars, display);
      }
      invalidRange(rx.index, rx.index + rx[0].length, chars, display);
      beg = exp.lastIndex;
      if(exp.lastIndex === 0){
        break;
      }
      rx = exp.exec(escapedStr);
    }
    if(beg < escapedStr.length){
      validRange(beg, escapedStr.length, chars, display);
    }
    return display;
  }
  function markupEscapes(str){
    var expd = /``/g
    var expx = /`x[0-9a-fA-F]{2}/g;
    var expX = /`X[0-9a-fA-F]{4}/g;
    var expu = /`u[0-9a-fA-F]{8}/g;
    var ret = str.replace(expd, '\x01\x01');
    ret = ret.replace(expx, function(match){return match.replace('`x', '\x02\x02');});
    ret = ret.replace(expX, function(match){return match.replace('`X', '\x03\x03');});
    ret = ret.replace(expu, function(match){return match.replace('`u', '\x04\x04');});
    return ret;
  }
  function translateEscapes(str, pchars, pmap){
    var tmp, ii;
    var chars = apglib.utils.stringToChars(str);
    var pi = 0;
    var i = 0;
    pchars.length = 0;
    pmap.length = 0;
    while(true){
      var char = chars[i];
      switch(char){
      case 1:
        ii = i + 2;
        pchars[pi] = 96;
        pmap[pi] = '`';
        chars[i] = 96;
        chars[i+1] = 96;
        break;
      case 2:
        ii = i + 4;
        tmp = str.slice(i+2, ii);
        pchars[pi] = parseInt(tmp, 16);
        pmap[pi] = '`x' + tmp;
        chars[i] = 96;
        chars[i+1] = 120;
        break;
      case 3:
        ii = i + 6;
        tmp = str.slice(i+2, ii);
        pchars[pi] = parseInt(tmp, 16);
        pmap[pi] = '`X' + tmp;
        chars[i] = 96;
        chars[i+1] = 88;
        break;
      case 4:
        ii = i + 10;
        tmp = str.slice(i+2, ii);
        pchars[pi] = parseInt(tmp, 16);
        pmap[pi] = '`u' + tmp;
        chars[i] = 96;
        chars[i+1] = 117;
        break;
      case 9:
        ii = i+1;
        pchars[pi] = char;
        pmap[pi] = '<span class="apg-ctrl-char">TAB</span>';
        break;
      case 10:
        ii = i+1;
        pchars[pi] = char;
        pmap[pi] = '<span class="apg-ctrl-char">LF</span><br>';
        break;
      case 13:
        ii = i+1;
        if(ii < chars.length && chars[ii] === 10){
          pchars[pi] = 13;
          pchars[pi+1] = 10;
          pmap[pi] = '<span class="apg-ctrl-char">CR</span>';
          pmap[pi+1] = '<span class="apg-ctrl-char">LF</span><br>';
          ii += 1;
          pi += 1;
        }else{
          pchars[pi] = char;
          pmap[pi] = '<span class="apg-ctrl-char">CR</span><br>';
        }
        break;
      default:
        ii = i + 1;
        pchars[pi] = char;
        pmap[pi] = String.fromCharCode(char);
        break;
      }
      i = ii;
      pi += 1;
      if(i >= chars.length){
        break;
      }
    }
    return chars;
  }
  function translateCtrl(str, pchars, pmap){
    var tmp, ii;
    var chars = apglib.utils.stringToChars(str);
    var pi = 0;
    var i = 0;
    pchars.length = 0;
    pmap.length = 0;
    while(true){
      var char = chars[i];
      switch(char){
      case 9:
        ii = i+1;
        pchars[pi] = char;
        pmap[pi] = '<span class="apg-ctrl-char">TAB</span>';
        break;
      case 10:
        ii = i+1;
        pchars[pi] = char;
        pmap[pi] = '<span class="apg-ctrl-char">LF</span><br>';
        break;
      case 13:
        ii = i+1;
        if(ii < chars.length && chars[ii] === 10){
          pchars[pi] = 13;
          pchars[pi+1] = 10;
          pmap[pi] = '<span class="apg-ctrl-char">CR</span>';
          pmap[pi+1] = '<span class="apg-ctrl-char">LF</span><br>';
          ii += 1;
          pi += 1;
        }else{
          pchars[pi] = char;
          pmap[pi] = '<span class="apg-ctrl-char">CR</span><br>';
        }
        break;
      default:
        ii = i + 1;
        pchars[pi] = char;
        pmap[pi] = String.fromCharCode(char);
        break;
      }
      i = ii;
      pi += 1;
      if(i >= chars.length){
        break;
      }
    }
    return chars;
  }
  function toHtml(arrayOfStrings){
    var html = '<span class="apg-mono">';
    arrayOfStrings.forEach(function(str){
      html += str;
    });
    return html + '</span>';
  }
  
  /* public functions */
  this.invalidChars = false;
  this.invalidEscapes = false;
  this.pchars = [];
  this.displayInput = function(){
    if(this.invalidChars){
      var html = '<span class="apg-error"><h4>Input has invalid characters.</h4></span>';
      return html + toHtml(strings);
    }
    if(this.invalidEscapes){
      var html = '<span class="apg-error"><h4>Input has invalid escaped characters.</h4></span>';
      return html + toHtml(strings);
    }
    return toHtml(pmap);
  }
  this.displayPhrases = function(phrases){
    var i = 0;
    var html = '';
    for(ii = 0; ii < phrases.length; ii += 1){
      var phrase = phrases[ii];
      if(phrase.beg >= i){
        while(i < phrase.beg){
          html += pmap[i];
          i += 1;
        }
        if(phrase.beg === phrase.end){
          html += '<span class="apg-empty-phrase">&#120576;</span>';
        }else{
          html += '<span class="apg-phrase">';
          while(i < phrase.end){
            html += pmap[i];
            i += 1;
          }
          html += "</span>";
        }
      }
    }
    while(i < pmap.length){
      html += pmap[i];
      i += 1;
    }
    return html;
  }
  
  /* constructor */
  strings = findInvalidChars(input);
  if(strings.length > 0){
    /* handle invalid character errors */
    this.invalidChars = true;
    return;
  }
  if(mode && mode === "escaped"){
    /* escaped character mode */
    var str = markupEscapes(input);
    strings = findInvalidEscapes(str, input);
    if(strings.length > 0){
      /* handle invalid escapes errors */
      this.invalidEscapes = true;
      return;
    }
    translateEscapes(str, this.pchars, pmap);
  }else{
    /* ASCII only mode */
    translateCtrl(input, this.pchars, pmap);
  }
}
var apgParser = function() {
  var TAB_PHRASES = 3;
  var TAB_STATE = 4;
  var DISPLAY_FIRST = 1;
  var DISPLAY_PREV  = 2;
  var DISPLAY_ALL   = 3;
  var DISPLAY_NEXT  = 4;
  var DISPLAY_LAST  = 5;
  var apglib = require("apg-lib");
  var currentTab = 0;
  var parser = null;
  var rules = [];
  var selectedRule;
  var input = null;
  var grammar = null;
  var result = null;
  var trace = null;
  var startRule = 0;

  /* private functions */
  function iframeWrite(pageInfo, body){
    var doc = pageInfo.element.contentWindow.document;
    doc.open();
    doc.write('<html><head>');
    doc.write('<title>');
    doc.write(pageInfo.title);
    doc.write('</title>');
    doc.write('<style>');
    doc.write(apglib.utils.css());
    doc.write('</style></head><body>');
    doc.write(body);
    doc.write('</body></html>');
    doc.close();
  }
  function ruleDropDown(obj){
    function alpha(lhs, rhs){
      if(lhs.lower < rhs.lower){
        return -1;
      }
      if(lhs.lower > rhs.lower){
        return 1;
      }
      return 0;
    }
    rules.length = 0;
    var list = document.getElementById("ast-phrases");
    if(!obj){
      list.innerHTML = "";
      return;
    }
    for(var key in obj){
      var phrases = obj[key];
      var rule = {};
      rule.name = key;
      rule.lower = key.toLowerCase();
      rule.listName = key +'(' + phrases.length +')';
      rule.selectedPhrase = 0;
      rule.phrases = [];
      for(var i = 0; i < phrases.length; i += 1){
        var phrase = {}
        phrase.beg = phrases[i].index;
        phrase.end = phrases[i].index + phrases[i].length;
        rule.phrases.push(phrase);
      }
      rules.push(rule);
    }
    rules.sort(alpha);
    
    var html = '';
    html += '<option selected>' + rules[0].listName + '</option>';
    selectedRule = 0;
    for(var i = 1; i < rules.length; i += 1){
      html += '<option>' + rules[i].listName + '</option>';
    }
    list.innerHTML = html;
  }

  // Initialization:
  // - src is the the generated grammar text file, null if none
  // - obj is the constructed grammar object, null if none
  // - msg is the error message, displayed only of src & obj are null
  /* public functions */
  this.init = function(src, obj, msg) {
    PAGE_INFO[PARSER_AREA].element.value = '<h4>No parser available.</h4>';
    PAGE_INFO[STATE_PAGE].element.innerHTML = '<h4>No parser state available.</h4>';
    PAGE_INFO[STATS_PAGE].element.innerHTML = '<h4>No parser statistics available.</h4>';
    iframeWrite(PAGE_INFO[TRACE_FRAME], '<h4>No parser trace available.</h4>');
    if(src && obj){
      grammar = obj;
      PAGE_INFO[PARSER_AREA].element.value = src;
      return;
    }
    if(msg && typeof(msg) === "string"){
      PAGE_INFO[PARSER_AREA].element.value = msg;
      grammar = null;
      return;
    }
  }
  this.parseInput = function(){
    /* temp config */
    var inputMode = "ascii";
    var traceOn = true;
    var traceMode = "ascii";
    
    rules.length = 0;
    input = null;
    try{
      /* validate the grammar */
      if(grammar === null){
        throw new Error("Parser has not been initialized.")
      }
      if(grammar.grammarObject !== "grammarObject"){
        throw new Error("Parser object not recognized.")
      }

      /* validate the input */
      input = new apgInput(PAGE_INFO[INPUT_AREA].element.value, inputMode);
      if(input.invalidChars || input.invalidEscapes){
        iframeWrite(PAGE_INFO[PHRASES_FRAME], input.displayInput());
        this.openTab(TAB_PHRASES);
        return;
      }

      /* set up the parser */
      parser = new apglib.parser();
      parser.stats = new apglib.stats();
      parser.ast = new apglib.ast();

      /* configure trace, if any */
      if(traceOn){
        parser.trace = new apglib.trace();
      }
      
      /* configure AST for all rule/UDT names */
      grammar.rules.forEach(function(rule){
        parser.ast.callbacks[rule.name] = true;
      });
      grammar.udts.forEach(function(udt){
        parser.ast.callbacks[udt.name] = true;
      });
      
      /* get the start rule */
      startRule = 0;
      result = parser.parse(grammar, startRule, input.pchars);
      PAGE_INFO[STATE_PAGE].element.innerHTML = apglib.utils.parserResultToHtml(result, "Parser State");
      PAGE_INFO[STATS_PAGE].element.innerHTML = parser.stats.toHtml("hits", "Parser Statistics");
      if(traceOn){
        iframeWrite(PAGE_INFO[TRACE_FRAME], parser.trace.toHtml(traceMode));
      }
      if(result.success){
        /* populate phrase names */
        ruleDropDown(parser.ast.phrases());
        this.displayPhrase(1);
        this.openTab(TAB_PHRASES);
      }else{
        ruleDropDown();
        iframeWrite(PAGE_INFO[PHRASES_FRAME], input.displayInput());
        this.openTab(TAB_STATE);
      }
    }catch(e){
      var msg = '<span class="apg-error"><h4>Parser error: exception</h4>' + e.message;
      if(input !== null){
        msg += "<br><br>";
        msg += input.displayInput();
      }
      iframeWrite(PAGE_INFO[PHRASES_FRAME], msg);
      this.openTab(TAB_PHRASES);
    }
  }
  this.phraseChange = function(event){
    if(input === null || rules.length === 0){
      return;
    }
    var options = document.getElementById("ast-phrases").options;
    for(var i = 0; i < options.length; i +=1){
      if(options[i].selected){
        selectedRule = i;
        rules[selectedRule].selectedPhrase = 0;;
        break;
      }
    }
    this.displayPhrase(DISPLAY_FIRST);
  }
  this.displayPhrase = function(type){
    if(input === null || rules.length === 0){
      return;
    }
    var rule = rules[selectedRule];
    var phrases = [];
    switch(type){
    case DISPLAY_FIRST:
      rule.selectedPhrase = 0;
      phrases[0] = rule.phrases[rule.selectedPhrase];
      break;
    case DISPLAY_PREV:
      if(rule.selectedPhrase > 0){
        rule.selectedPhrase -= 1;
      }
      phrases[0] = rule.phrases[rule.selectedPhrase];
      break;
    case DISPLAY_NEXT:
      if(rule.phrases.length === 0){
        rule.selectedPhrase = 0;
      }else if(rule.selectedPhrase < rule.phrases.length - 1){
        rule.selectedPhrase += 1;
      }
      phrases[0] = rule.phrases[rule.selectedPhrase];
      break;
    case DISPLAY_LAST:
      rule.selectedPhrase = rule.phrases.length > 0 ? rule.phrases.length - 1 : 0;
      phrases[0] = rule.phrases[rule.selectedPhrase];
      break;
    default:
    case DISPLAY_ALL:
      rule.selectedPhrase = 0;
      phrases = rule.phrases.slice();
      break;
    }
    iframeWrite(PAGE_INFO[PHRASES_FRAME], input.displayPhrases(phrases));
  }
  this.displayInput = function(){
    var obj = new apgInput(PAGE_INFO[INPUT_AREA].element.value);
    iframeWrite(PAGE_INFO[PHRASES_FRAME], obj.displayInput());
    this.openTab(TAB_PHRASES);
  }
  this.openTab = function(tabnumber) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("parser-tabcontent");
    tablinks = document.getElementsByClassName("parser-tablinks");

    // hide all content
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].className = tabcontent[i].className.replace(" show", "");
      tabcontent[i].className = tabcontent[i].className.replace(" hide", "");
      tabcontent[i].className += " hide";
    }

    // deactivate all menu links
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // activate menu item (changes its color)
    var tab = tablinks[tabnumber];
    if (tab) {
      tab.className += " active";
    }

    // show the activated content
    var content = tabcontent[tabnumber];
    if (content) {
      content.className = content.className.replace(" hide", "");
      content.className += " show";
    }
    currentTab = tabnumber;
    return false;
  }
}
var apgAttrs = function() {
  var DOWN = 1;
  var UP = 2;
  var CHECKED_ID = "attr-errors-top";
  var COL_NAMES = [ {
    DOWN : "index&darr;",
    UP : "index&uarr;",
    NONE : "index&nbsp;"
  }, {
    DOWN : "rule&darr;",
    UP : "rule&uarr;",
    NONE : "rule&nbsp;"
  }, {
    DOWN : "type&darr;",
    UP : "type&uarr;",
    NONE : "type&nbsp;"
  }, {
    DOWN : "left&darr;",
    UP : "left&uarr;",
    NONE : "left&nbsp;"
  }, {
    DOWN : "nested&darr;",
    UP : "nested&uarr;",
    NONE : "nested&nbsp;"
  }, {
    DOWN : "right&darr;",
    UP : "right&uarr;",
    NONE : "right&nbsp;"
  }, {
    DOWN : "cyclic&darr;",
    UP : "cyclic&uarr;",
    NONE : "cyclic&nbsp;"
  }, {
    DOWN : "finite&darr;",
    UP : "finite&uarr;",
    NONE : "finite&nbsp;"
  }, {
    DOWN : "empty&darr;",
    UP : "empty&uarr;",
    NONE : "empty&nbsp;"
  }, {
    DOWN : "not empty&darr;",
    UP : "not empty&uarr;",
    NONE : "not empty&nbsp;"
  } ];
  var sortState = {};
  var colNames = [];
  var noDataMsg = "<h4>Attributes not initialized.</h4>";

  // 'self' for accessing 'this' reference in anonymous functions.
  // self.data is the attribute data, if any.
  // self.msg is a message to display on the attributes page if there is no data.
  var self = this;
  self.data = null;
  self.msg = noDataMsg;

  // private sorting functions
  function sortIndex(sortDir, errors, others) {
    function up(lhs, rhs) {
      return rhs.index - lhs.index;
    }
    function down(lhs, rhs) {
      return lhs.index - rhs.index;
    }
    if (sortDir === DOWN) {
      errors.sort(down);
      others.sort(down);
    } else {
      errors.sort(up);
      others.sort(up);
    }
  }
  function sortRules(sortDir, errors, others) {
    function up(lhs, rhs) {
      if (lhs.lower > rhs.lower) {
        return -1;
      }
      if (lhs.lower < rhs.lower) {
        return 1;
      }
      return 0;
    }
    function down(lhs, rhs) {
      if (lhs.lower < rhs.lower) {
        return -1;
      }
      if (lhs.lower > rhs.lower) {
        return 1;
      }
      return 0;
    }
    if (sortDir === DOWN) {
      errors.sort(down);
      others.sort(down);
    } else {
      errors.sort(up);
      others.sort(up);
    }
  }
  function sortTypes(sortDir, errors, others) {
    function up(lhs, rhs) {
      return rhs.type - lhs.type;
    }
    function down(lhs, rhs) {
      return lhs.type - rhs.type;
    }
    if (sortDir === DOWN) {
      errors.sort(down);
      others.sort(down);
    } else {
      errors.sort(up);
      others.sort(up);
    }
  }
  function sortAttrs(sortDir, errors, others, col) {
    function up(lhs, rhs) {
      if ((lhs[col] === true) && (rhs[col] === false)) {
        return -1;
      }
      if ((lhs[col] === false) && (rhs[col] === true)) {
        return 1;
      }
      return 0;
    }
    function down(lhs, rhs) {
      if ((lhs[col] === true) && (rhs[col] === false)) {
        return 1;
      }
      if ((lhs[col] === false) && (rhs[col] === true)) {
        return -1;
      }
      return 0;
    }
    if (sortDir === DOWN) {
      errors.sort(down);
      others.sort(down);
    } else {
      errors.sort(up);
      others.sort(up);
    }
  }

  // Generates and displays the attribute table.
  var tableGen = function(errors, others) {
    function yes(val) {
      return val ? "yes" : "no";
    }
    function ruleGen(row) {
      var html = "";
      var left, cyclic, finite;
      var left = row.left ? '<span class="error">' + yes(row.left) + '</span>' : yes(row.left);
      var cyclic = row.cyclic ? '<span class="error">' + yes(row.cyclic) + '</span>' : yes(row.cyclic);
      var finite = row.finite ? yes(row.finite) : '<span class="error">' + yes(row.finite) + '</span>';
      html += '<tr>';
      html += '<td>' + row.index + '</td>';
      html += '<td>' + row.name + '</td>';
      html += '<td>' + row.typename + '</td>';
      html += '<td>' + left + '</td>';
      html += '<td>' + yes(row.nested) + '</td>';
      html += '<td>' + yes(row.right) + '</td>';
      html += '<td>' + cyclic + '</td>';
      html += '<td>' + finite + '</td>';
      html += '<td>' + yes(row.empty) + '</td>';
      html += '<td>' + yes(row.notempty) + '</td>';
      html += '</tr>';
      return html;
    }
    var html = "";
    if (sortState.hasErrors) {
      var checked = sortState.topErrors ? "checked" : "";
      html += '<input type="checkbox" class="align-middle" id="' + CHECKED_ID + '" ' + checked
          + '> keep rules with attribute errors at top';
    }
    html += '<table class="attr-table">';
    html += '<tr>';
    html += '<th><a href="#" onclick="apgweb.attrs.sort(0)">' + colNames[0] + '</a></th>';
    html += '<th><a href="#" onclick="apgweb.attrs.sort(1)">' + colNames[1] + '</a></th>';
    html += '<th><a href="#" onclick="apgweb.attrs.sort(2)">' + colNames[2] + '</a></th>';
    html += '<th><a href="#" onclick="apgweb.attrs.sort(3)">' + colNames[3] + '</a></th>';
    html += '<th><a href="#" onclick="apgweb.attrs.sort(4)">' + colNames[4] + '</a></th>';
    html += '<th><a href="#" onclick="apgweb.attrs.sort(5)">' + colNames[5] + '</a></th>';
    html += '<th><a href="#" onclick="apgweb.attrs.sort(6)">' + colNames[6] + '</a></th>';
    html += '<th><a href="#" onclick="apgweb.attrs.sort(7)">' + colNames[7] + '</a></th>';
    html += '<th><a href="#" onclick="apgweb.attrs.sort(8)">' + colNames[8] + '</a></th>';
    html += '<th><a href="#" onclick="apgweb.attrs.sort(9)">' + colNames[9] + '</a></th>';
    html += '</tr>';
    errors.forEach(function(row) {
      html += ruleGen(row);
    });
    others.forEach(function(row) {
      html += ruleGen(row);
    });
    html += "</table>";
    return html;
  }

  // Initializes the attributes table state data for a descending sort on the index column.
  function initSort(col) {
    if (self.data === null) {
      return;
    }
    for (var i = 0; i < COL_NAMES.length; i += 1) {
      colNames[i] = COL_NAMES[i].NONE;
    }
    // initialize to default sort state
    sortState.hasErrors = false;
    for (var i = 0; i < self.data.length; i += 1) {
      if (self.data[i].error) {
        sortState.hasErrors = true;
        break;
      }
    }
    sortState.topErrors = true;
    sortState.col = 0;
    sortState.dir = UP;
    colNames[sortState.col] = COL_NAMES[sortState.col].UP;
  }

  // Called by the parser generator to initialize the attributes table, if any.
  // Displays either the table or an error message on the attributes page.
  this.init = function(data, msg) {
    self.data = data;
    if (msg && typeof (msg) === "string") {
      self.msg = msg
    } else if(data === null){
      self.msg = noDataMsg;
    }else{
      self.msg = "";
    }
    initSort(0);
    self.sort(0);
  }

  // Event handler for the attribute table column header sorting anchors.
  this.sort = function(col) {
    if (self.data === null) {
      PAGE_INFO[ATTRS_PAGE].element.innerHTML = self.msg;
      return false;
    }
    var errorRules = [];
    var otherRules = [];
    for (var i = 0; i < COL_NAMES.length; i += 1) {
      colNames[i] = COL_NAMES[i].NONE;
    }
    var el = document.getElementById(CHECKED_ID);
    if (el !== null) {
      sortState.topErrors = el.checked;
    }
    if (col === sortState.col) {
      sortState.dir = sortState.dir === DOWN ? UP : DOWN;
    } else {
      sortState.col = col;
      sortState.dir = DOWN;
    }
    colNames[col] = sortState.dir === DOWN ? COL_NAMES[col].DOWN : COL_NAMES[col].UP;
    for (var i = 0; i < self.data.length; i += 1) {
      if (sortState.topErrors && self.data[i].error) {
        errorRules.push(self.data[i]);
      } else {
        otherRules.push(self.data[i]);
      }
    }
    switch (sortState.col) {
    case 0:
      sortIndex(sortState.dir, errorRules, otherRules);
      break;
    case 1:
      sortRules(sortState.dir, errorRules, otherRules);
      break;
    case 2:
      sortTypes(sortState.dir, errorRules, otherRules);
      break;
    case 3:
      sortAttrs(sortState.dir, errorRules, otherRules, "left");
      break;
    case 4:
      sortAttrs(sortState.dir, errorRules, otherRules, "nested");
      break;
    case 5:
      sortAttrs(sortState.dir, errorRules, otherRules, "right");
      break;
    case 6:
      sortAttrs(sortState.dir, errorRules, otherRules, "cyclic");
      break;
    case 7:
      sortAttrs(sortState.dir, errorRules, otherRules, "finite");
      break;
    case 8:
      sortAttrs(sortState.dir, errorRules, otherRules, "empty");
      break;
    case 9:
      sortAttrs(sortState.dir, errorRules, otherRules, "notempty");
      break;
    }
    PAGE_INFO[ATTRS_PAGE].element.innerHTML = tableGen(errorRules, otherRules);
    return false;
  }

  // initialize the attributes page message
  this.init(null);
}
var apgRules = function() {
  var INDEX_DOWN = "index\u2193";
  var INDEX_UP = "index\u2191";
  var INDEX_NONE = "index&nbsp";
  var RULES_DOWN = "rule\u2193";
  var RULES_UP = "rule\u2191";
  var RULES_NONE = "rule&nbsp;";
  var ROW_SHOW = "show";
  var ROW_HIDE = "hide";

  // 'self' for accessing 'this' reference in anonymous functions.
  // self.data is the attribute data, if any.
  // self.msg is a message to display on the attributes page if there is no data.
  var self = this;
  self.data = null;
  self.msg = "";
  self.dir = {
    index : INDEX_DOWN,
    rules : RULES_NONE
  }

  this.showAll = function(show) {
    setRowShow(show);
    return tableGen();
  }
  this.dependentsShow = function(event, index) {
    var rule = self.data.rows[index];
    rule.show = (event.currentTarget.innerHTML === ROW_SHOW)
    return tableGen();
  }
  this.sortIndex = function(event) {
    self.dir.rules = RULES_NONE;
    if (event.currentTarget.innerHTML === INDEX_DOWN) {
      // sort up
      self.data.rows.sort(function(lhs, rhs) {
        return rhs.index - lhs.index;
      });
      self.index.dir = INDEX_UP;
    } else {
      // sort down
      self.data.rows.sort(function(lhs, rhs) {
        return lhs.index - rhs.index;
      });
      self.dir.index = INDEX_DOWN;
    }
    return tableGen();
  }
  this.sortName = function(event) {
    self.dir.index = INDEX_NONE;
    if (event.currentTarget.innerHTML === RULES_DOWN) {
      // sort up
      self.data.rows.sort(function(lhs, rhs) {
        if (lhs.lower > rhs.lower) {
          return -1;
        }
        if (lhs.lower < rhs.lower) {
          return 1;
        }
        return 0;
      });
      self.dir.rules = RULES_UP;
    } else {
      // sort down
      self.data.rows.sort(function(lhs, rhs) {
        if (lhs.lower < rhs.lower) {
          return -1;
        }
        if (lhs.lower > rhs.lower) {
          return 1;
        }
        return 0;
      });
      self.dir.rules = RULES_DOWN;
    }
    return tableGen();
  }
  this.init = function(data, msg) {
    // constructor: initial sort of table descending on rule indexes; show all rule dependencies
    self.data = data;
    if (msg && typeof (msg) === "string") {
      self.msg = msg;
    } else {
      self.msg = "";
    }
    if (self.data !== null) {
      self.data.rows.sort(function(lhs, rhs) {
        return lhs.index - rhs.index;
      });
      self.dir.index = INDEX_DOWN;
      self.dir.rules = RULES_NONE;
      setRowShow(true);
    }
    tableGen();
  }

  // Generate the rules table HTML.
  var tableGen = function() {
    if (self.data === null) {
      PAGE_INFO[RULES_PAGE].element.innerHTML = self.msg;
      return false;
    }
    var html = "";
    html += '<table class="attr-table">';
    html += '<tr><th><a href="#" onclick="apgweb.rules.sortIndex(event)">' + self.dir.index + '</a></th>';
    html += '<th><a href="#" onclick="apgweb.rules.sortName(event)">' + self.dir.rules + '</a></th>';
    html += '<th>refers to</th></tr>';
    for (var i = 0; i < self.data.rows.length; i += 1) {
      var rule = self.data.rows[i];
      if (rule.dependents.length > 0) {
        var link = rule.show ? ROW_HIDE : ROW_SHOW;
        html += '<tr><td>' + rule.index + '</td><td>' + rule.name + '</td>';
        html += '<td><a href="#" onclick="apgweb.rules.dependentsShow(event,' + i + ')">' + link + '</a></td></tr>';
        if (rule.show) {
          for (var j = 0; j < rule.dependents.length; j += 1) {
            var obj = rule.dependents[j];
            html += '<tr><td></td><td>' + obj.index + '</td><td>' + obj.name + '</td></tr>';
          }
        }
      } else {
        html += '<tr><td>' + rule.index + '</td><td>' + rule.name + '</td><td></td></tr>';
      }
    }
    html += '</table>';
    PAGE_INFO[RULES_PAGE].element.innerHTML = html;
    return false;
  }
  function setRowShow(show) {
    if (self.data !== null) {
      self.data.rows.forEach(function(rule) {
        if (rule.dependents.length > 0) {
          for (var i = 0; i < rule.dependents.length; i += 1) {
            rule.show = show;
          }
        }
      });
    }
  }

  self.init(null, "<h4>Rules not initialized.</h4>");
}

var apgWeb = function(rules, attrs, parser) {
  var attributes = require("./attributes.js");
  var inputAnalysis = require("./input-analysis-parser.js");
  var sabnfParser = require("./abnf-for-sabnf-parser.js");
  // Page event handlers will always access these objects through the single
  // window object 'apgweb'.
  this.rules = rules;
  this.attrs = attrs;
  this.parser = parser;

  // public functions
  this.openTab = function(tabnumber) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    tablinks = document.getElementsByClassName("tablinks");

    // hide all content
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].className = tabcontent[i].className.replace(" show", "");
      tabcontent[i].className = tabcontent[i].className.replace(" hide", "");
      tabcontent[i].className += " hide";
    }

    // deactivate all menu links
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // activate menu item (changes its color)
    var tab = tablinks[tabnumber];
    if (tab) {
      tab.className += " active";
    }

    // show the activated content
    var content = tabcontent[tabnumber];
    if (content) {
      content.className = content.className.replace(" hide", "");
      content.className += " show";
    }
    return false;
  }
  this.select = function(name) {
    var el = PAGE_INFO[name].element;
    if (el && PAGE_INFO[name].type === TYPE_TEXTAREA) {
      el.select();
      try{
        document.execCommand('copy');
        el.blur()
      }catch(e){
        alert("please press Ctrl/Cmd+C to copy");
      }
    }
  }
  this.fullScreen = function(name) {
    var options = "";
    options += "width=" + screen.availWidth + ",height=" + screen.availHeight + "";
    options += ",top=0";
    options += ",left=0";
    options += ",location=no";
    options += ",menubar=no";
    options += ",scrollbars=yes";
    options += ",status=no";
    options += ",titlebar=no";
    options += ",toolbar=no";
    options += ",resizable=yes";
    var button = '<button style="color:black;background:#B3C1FF;" type="button" onclick="window.close()">Close</button>';
    var html = '';
    var el = PAGE_INFO[name].element;
    if (el) {
      html += '<html><head>';
      switch(PAGE_INFO[name].type){
      case TYPE_TEXTAREA:
        html += '<title>';
        html += PAGE_INFO[name].title;
        html += '</title></head><body>';
        html += button
        html += "<pre>";
        html += el.value;
        html += "</pre>";
        html += button
        break;
      case TYPE_PAGE:
        html += '<title>';
        html += PAGE_INFO[name].title;
        html += '</title></head><body>';
        html += button
        html += el.innerHTML;
        html += button
        break;
      case TYPE_FRAME:
        html += PAGE_INFO[name].element.contentWindow.document.head.innerHTML;
        html += '</head><body>';
        html += button;
        html += '<br>';
        html += PAGE_INFO[name].element.contentWindow.document.body.innerHTML;
        html += '<br>';
        html += button;
        break;
      }
      html += '</body></html>'
      window.open("", "", options).document.write(html);
    }
    return false;
  }
  this.generate = function() {
    var analyzer, sabnf, result, attrsObj;
    var strict = document.getElementById("strict").checked;
    var sabnfGrammar = PAGE_INFO[GRAMMAR_AREA].element.value;
    var grammarHtml = "";
    var rulesErrorMsg = "<h4>Rules not generated due to grammar errors.</h4>";
    var attrsErrorMsg = "<h4>Attributes not generated due to grammar errors.</h4>";
    var parserErrorMsg = "Parser not generated due to grammar errors."
    var attrErrors = false;
    var validGrammar = false;
    while (true) {
      // validate the input SABNF grammar
      if (!sabnfGrammar || sabnfGrammar === "") {
        grammarHtml = '<h4 class="error">Input SABNF grammar is empty.</h4>';
        break;
      }
      analyzer = new inputAnalysis();
      analyzer.getString(sabnfGrammar);
      result = analyzer.analyze(false);
      grammarHtml = analyzer.toHtml();
      if (result.hasErrors) {
        grammarHtml += analyzer.errorsToHtml(result.errors, "SABNF grammar has invalid characters");
        break;
      }

      // validate the SABNF grammar syntax
      sabnf = new sabnfParser();
      result = sabnf.syntax(analyzer, strict, false);
      if (result.hasErrors) {
        grammarHtml += analyzer.errorsToHtml(result.errors, "SABNF grammar has syntax errors");
        break;
      }

      // validate the SABNF grammar semantics
      result = sabnf.semantic();
      if (result.hasErrors) {
        grammarHtml += analyzer.errorsToHtml(result.errors, "SABNF grammar has semantic errors");
        break;
      }

      // validate the SABNF grammar attributes
      attrsObj = new attributes();
      var errors = attrsObj.getAttributes(result.rules, result.rulesLineMap);
      if (errors.length > 0) {
        grammarHtml += analyzer.errorsToHtml(errors, "SABNF grammar has attribute errors");
        attrErrors = true;
        break;
      }

      // success: have a valid grammar
      validGrammar = true;
      break;
    }

    // display the results
    PAGE_INFO[GRAMMAR_PAGE].element.innerHTML = grammarHtml;
    // Initialize the parser object.
    if (validGrammar) {
      var src = sabnf.generateSource(result.rules, result.udts, "var generatedGrammar");
      var obj = sabnf.generateObject(result.rules, result.udts);
      this.parser.init(src, obj);
    } else {
      this.parser.init(null, null, parserErrorMsg);
    }
    // Initialize the rules and attributes objects.
    if (attrsObj) {
      this.rules.init(attrsObj.rulesWithReferencesData());
      this.attrs.init(attrsObj.ruleAttrsData());
    } else {
      this.rules.init(null, rulesErrorMsg);
      this.attrs.init(null, attrsErrorMsg);
    }
    // Open the proper tab to display the appropriate results.
    // - the grammar tab if the grammar is invalid
    // - the attributes tab if there are attribute errors
    // - the parser tab if the grammar is valid
    // - always initialize the parser page to the tab (even if the parser page is not displayed)
    this.parser.openTab(0)
    if (attrErrors) {
      this.openTab(3)
    } else if (!validGrammar) {
      this.openTab(1)
    } else {
      this.openTab(4)
    }
  }
  this.onPageLoad = function() {
    this.parser.init(null, null, "Parser not initialized.", null);
    this.parser.openTab(0);
    this.openTab(0);
    PAGE_INFO[GRAMMAR_PAGE].element.innerHTML = "<h4>Grammar not parsered.</h4>"
  };
};

window.onPageLoad = function() {
  PAGE_INFO[GRAMMAR_AREA] = {
    id : GRAMMAR_AREA,
    type: TYPE_TEXTAREA,
    title : 'input SABNF grammar',
    element : document.getElementById(GRAMMAR_AREA)
  };
  PAGE_INFO[PARSER_AREA] = {
    id : PARSER_AREA,
    type: TYPE_TEXTAREA,
    title : 'Generated Parser',
    element : document.getElementById(PARSER_AREA)
  };
  PAGE_INFO[INPUT_AREA] = {
    id : INPUT_AREA,
    type: TYPE_TEXTAREA,
    title : 'Input String',
    element : document.getElementById(INPUT_AREA)
  };
  PAGE_INFO[PHRASES_FRAME] = {
    id : PHRASES_FRAME,
    type: TYPE_FRAME,
    title : 'Annotated Phrases',
    element : document.getElementById(PHRASES_FRAME)
  };
  PAGE_INFO[GRAMMAR_PAGE] = {
    id : GRAMMAR_PAGE,
    type: TYPE_PAGE,
    title : '',
    element : document.getElementById(GRAMMAR_PAGE)
  };
  PAGE_INFO[RULES_PAGE] = {
    id : RULES_PAGE,
    type: TYPE_PAGE,
    title : '',
    element : document.getElementById(RULES_PAGE)
  };
  PAGE_INFO[ATTRS_PAGE] = {
    id : ATTRS_PAGE,
    type: TYPE_PAGE,
    title : '',
    element : document.getElementById(ATTRS_PAGE)
  };
  PAGE_INFO[STATE_PAGE] = {
      id : STATE_PAGE,
      type: TYPE_PAGE,
      title : '',
      element : document.getElementById(STATE_PAGE)
    };
  PAGE_INFO[STATS_PAGE] = {
      id : STATS_PAGE,
      type: TYPE_PAGE,
      title : '',
      element : document.getElementById(STATS_PAGE)
    };
  PAGE_INFO[TRACE_FRAME] = {
      id : TRACE_FRAME,
      type: TYPE_FRAME,
      title : 'Parser Trace',
      element : document.getElementById(TRACE_FRAME)
    };
  var height = (Math.floor((window.innerHeight - 400) * .9)) + "px";
  var width = (Math.floor((window.innerWidth - 400) * .9)) + "px";
  PAGE_INFO[GRAMMAR_AREA].element.style.height = height
  PAGE_INFO[GRAMMAR_AREA].element.style.width = width
  PAGE_INFO[PARSER_AREA].element.style.height = height
  PAGE_INFO[PARSER_AREA].element.style.width = width
  PAGE_INFO[INPUT_AREA].element.style.height = height
  PAGE_INFO[INPUT_AREA].element.style.width = width
  PAGE_INFO[PHRASES_FRAME].element.style.height = height
  PAGE_INFO[PHRASES_FRAME].element.style.width = width
  PAGE_INFO[TRACE_FRAME].element.style.height = height
  PAGE_INFO[TRACE_FRAME].element.style.width = width
  window.apgweb = new apgWeb(new apgRules, new apgAttrs, new apgParser);
  window.apgweb.onPageLoad();
}
