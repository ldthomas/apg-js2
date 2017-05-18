window.apgweb = (function() {
  // This function generates the object with all of the event handlers for the web interface events.
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
  var MODAL_DIALOG = 'modal';
  var MODAL_TOP = 'modal-top';
  var MODAL_CONTENT = 'modal-content';
  var MODAL_INFO = {
      elements: [MODAL_DIALOG, MODAL_TOP, MODAL_CONTENT]
  }
  var TYPE_TEXTAREA = 1;
  var TYPE_PAGE = 2;
  var TYPE_FRAME = 3;
  var PAGE_INFO = [];
  var INPUT_MODE = {
    name : 'input-mode',
    elements : []
  };
  var TRACE = {};
  TRACE.ON = {
    name : 'traceon',
    elements : []
  };
  TRACE.DISPLAY = {
    name : 'trace-display',
    elements : []
  };
  TRACE.RECORDS = {
    name : 'trace-records',
    elements : []
  };
  TRACE.OPERATORS_ON = {
    name : 'operatorson',
    elements : []
  };
  TRACE.OPERATORS = {
    name : 'operators',
    elements : []
  };
  TRACE.RULES_ON = {
    name : 'ruleson',
    elements : []
  };
  TRACE.RULES_TABLE = {
      name: 'rules-table',
      element: null
  };
  TRACE.RULES = {
    name : 'rules',
    elements : []
  };
  TRACE.TRACE_CONFIG = {
      name: 'trace-config',
      element: null
  }

  // `apgInput` is the constructor for the object which processes the input to a generated parser.
  // It takes the input string from the parser input area, performs validation
  // checks and, if no errors, produces an array of characters for the parser to parse.
  //````
  // input: the input string
  // mode: if "escaped", input is decoded from escaped format
  //       otherwise, input is treated as pure ASCII.
  //````
  var apgInput = function(input, mode) {
    var apglib = require("apg-lib");
    var strings = [];
    var pmap = [];

    /* private functions */
    function ctrlChars(str) {
      exp = /(\r\n)|(\n)|(\r)|(\t)/g;
      var out = "";
      var beg = 0;
      exp.lastIndex = 0;
      while ((rx = exp.exec(str)) !== null) {
        if (beg < rx.index) {
          out += str.slice(beg, rx.index);
        }
        if (rx[1]) {
          out += '<span class="apg-ctrl-char">CRLF</span><br>';
        } else if (rx[2]) {
          out += '<span class="apg-ctrl-char">LF</span><br>';
        } else if (rx[3]) {
          out += '<span class="apg-ctrl-char">CR</span><br>';
        } else if (rx[4]) {
          out += '<span class="apg-ctrl-char">TAB</span>';
        }
        beg = rx.index + rx[0].length;
      }
      if (beg < str.length) {
        out += str.slice(beg);
      }
      return out;
    }
    function findInvalidChars(str) {
      function validRange(beg, end, chars, display) {
        display.push(ctrlChars(str.slice(beg, end)));
      }
      function invalidRange(beg, end, chars, display) {
        var str = '<span class="apg-error">\\x' + chars[beg].toString(16);
        for (var i = beg + 1; i < end; i += 1) {
          str += '\\x' + chars[i].toString(16);
        }
        str += '</span>';
        display.push(str);
      }
      var exp = /[ -~\t\r\n]+/g;
      var rx = exp.exec(str);
      if (rx === null) {
        /* entire string is invalid characters */
        var chars = apglib.utils.stringToChars(str);
        var display = [];
        invalidRange(0, str.length, chars, display);
        return false;
      }
      if (rx[0].length === str.length) {
        /* entire string is valid */
        return [];
      }
      var chars = apglib.utils.stringToChars(str);
      var display = [];
      var beg = 0;
      while (rx !== null) {
        if (beg < rx.index) {
          invalidRange(beg, rx.index, chars, display);
        }
        validRange(rx.index, rx.index + rx[0].length, chars, display);
        beg = exp.lastIndex;
        if (exp.lastIndex === 0) {
          break;
        }
        rx = exp.exec(str);
      }
      if (beg < str.length) {
        invalidRange(beg, str.length, chars, display);
      }
      return display;
    }
    function findInvalidEscapes(escapedStr, originalStr) {
      function validRange(beg, end, chars, display) {
        display.push(ctrlChars(originalStr.slice(beg, end)));
      }
      function invalidRange(beg, end, chars, display) {
        display.push('<span class="apg-error">`</span>');
      }
      var display = [];
      var exp = /`/g;
      var rx = exp.exec(escapedStr);
      if (rx === null) {
        /* no invalid escapes */
        return [];
      }
      var chars = apglib.utils.stringToChars(escapedStr);
      var display = [];
      var beg = 0;
      while (rx !== null) {
        if (beg < rx.index) {
          validRange(beg, rx.index, chars, display);
        }
        invalidRange(rx.index, rx.index + rx[0].length, chars, display);
        beg = exp.lastIndex;
        if (exp.lastIndex === 0) {
          break;
        }
        rx = exp.exec(escapedStr);
      }
      if (beg < escapedStr.length) {
        validRange(beg, escapedStr.length, chars, display);
      }
      return display;
    }
    function markupEscapes(str) {
      var expd = /``/g
      var expx = /`x[0-9a-fA-F]{2}/g;
      var expu = /`u[0-9a-fA-F]{4}/g;
      var expuu = /`u\{[0-9a-fA-F]{5,8}\}/g;
      var ret = str.replace(expd, '\x01\x01');
      ret = ret.replace(expx, function(match) {
        return match.replace('`x', '\x02\x02');
      });
      ret = ret.replace(expu, function(match) {
        return match.replace('`u', '\x03\x03');
      });
      ret = ret.replace(expuu, function(match) {
        return match.replace('`u', '\x04' + String.fromCharCode(match.length - 4));
      });
      return ret;
    }
    function translateEscapes(str, pchars, pmap) {
      var tmp, ii;
      var chars = apglib.utils.stringToChars(str);
      var pi = 0;
      var i = 0;
      pchars.length = 0;
      pmap.length = 0;
      while (true) {
        var char = chars[i];
        switch (char) {
        case 1:
          ii = i + 2;
          pchars[pi] = 96;
          pmap[pi] = '`';
          chars[i] = 96;
          chars[i + 1] = 96;
          break;
        case 2:
          ii = i + 4;
          tmp = str.slice(i + 2, ii);
          pchars[pi] = parseInt(tmp, 16);
          pmap[pi] = '`x' + tmp;
          chars[i] = 96;
          chars[i + 1] = 120;
          break;
        case 3:
          ii = i + 6;
          tmp = str.slice(i + 2, ii);
          pchars[pi] = parseInt(tmp, 16);
          pmap[pi] = '`u' + tmp;
          chars[i] = 96;
          chars[i + 1] = 88;
          break;
        case 4:
          ii = i + chars[i+1] + 4;
          tmp = str.slice(i + 3, i + 3 + chars[i+1]);
          pchars[pi] = parseInt(tmp, 16);
          pmap[pi] = '`u{' + tmp + "}";
          chars[i] = 96;
          chars[i + 1] = 88;
          break;
        case 9:
          ii = i + 1;
          pchars[pi] = char;
          pmap[pi] = '<span class="apg-ctrl-char">TAB</span>';
          break;
        case 10:
          ii = i + 1;
          pchars[pi] = char;
          pmap[pi] = '<span class="apg-ctrl-char">LF</span><br>';
          break;
        case 13:
          ii = i + 1;
          if (ii < chars.length && chars[ii] === 10) {
            pchars[pi] = 13;
            pchars[pi + 1] = 10;
            pmap[pi] = '<span class="apg-ctrl-char">CR</span>';
            pmap[pi + 1] = '<span class="apg-ctrl-char">LF</span><br>';
            ii += 1;
            pi += 1;
          } else {
            pchars[pi] = char;
            pmap[pi] = '<span class="apg-ctrl-char">CR</span><br>';
          }
          break;
        case 32:
          ii = i + 1;
          pchars[pi] = char;
          pmap[pi] = '&nbsp;';
          break;
        case 38:
          ii = i + 1;
          pchars[pi] = char;
          pmap[pi] = '&amp;';
          break;
        case 60:
          ii = i + 1;
          pchars[pi] = char;
          pmap[pi] = '&lt;';
          break;
        default:
          ii = i + 1;
          pchars[pi] = char;
          pmap[pi] = String.fromCharCode(char);
          break;
        }
        i = ii;
        pi += 1;
        if (i >= chars.length) {
          break;
        }
      }
      return chars;
    }
    function translateCtrl(str, pchars, pmap) {
      var tmp, ii;
      var chars = apglib.utils.stringToChars(str);
      var pi = 0;
      var i = 0;
      pchars.length = 0;
      pmap.length = 0;
      while (true) {
        var char = chars[i];
        switch (char) {
        case 9:
          ii = i + 1;
          pchars[pi] = char;
          pmap[pi] = '<span class="apg-ctrl-char">TAB</span>';
          break;
        case 10:
          ii = i + 1;
          pchars[pi] = char;
          pmap[pi] = '<span class="apg-ctrl-char">LF</span><br>';
          break;
        case 13:
          ii = i + 1;
          if (ii < chars.length && chars[ii] === 10) {
            pchars[pi] = 13;
            pchars[pi + 1] = 10;
            pmap[pi] = '<span class="apg-ctrl-char">CR</span>';
            pmap[pi + 1] = '<span class="apg-ctrl-char">LF</span><br>';
            ii += 1;
            pi += 1;
          } else {
            pchars[pi] = char;
            pmap[pi] = '<span class="apg-ctrl-char">CR</span><br>';
          }
          break;
        case 32:
          ii = i + 1;
          pchars[pi] = char;
          pmap[pi] = '&nbsp;';
          break;
        case 38:
          ii = i + 1;
          pchars[pi] = char;
          pmap[pi] = '&amp;';
          break;
        case 60:
          ii = i + 1;
          pchars[pi] = char;
          pmap[pi] = '&lt;';
          break;
        default:
          ii = i + 1;
          pchars[pi] = char;
          pmap[pi] = String.fromCharCode(char);
          break;
        }
        i = ii;
        pi += 1;
        if (i >= chars.length) {
          break;
        }
      }
      return chars;
    }
    function toHtml(arrayOfStrings) {
      var html = '<span class="apg-mono">';
      arrayOfStrings.forEach(function(str) {
        html += str;
      });
      return html + '</span>';
    }
    function isEscaped(input){
      var expd = /``/;
      var expx = /`x/;
      var expu = /`u/;
      if(expd.exec(input)){
        return true;
      }
      if(expx.exec(input)){
        return true;
      }
      if(expu.exec(input)){
        return true;
      }
      return false;
    }

    /* public functions */
    this.invalidChars = false;
    this.invalidEscapes = false;
    this.pchars = [];
    this.displayInput = function() {
      if (this.invalidChars) {
        var html = '<span class="apg-error"><h4>Input has invalid characters.</h4></span>';
        return html + toHtml(strings);
      }
      if (this.invalidEscapes) {
        var html = '<span class="apg-error"><h4>Input has invalid escaped characters.</h4></span>';
        return html + toHtml(strings);
      }
      return toHtml(pmap);
    }
    this.displayPhrases = function(phrases) {
      var i = 0;
      var html = '';
      for (ii = 0; ii < phrases.length; ii += 1) {
        var phrase = phrases[ii];
        if (phrase.beg >= i) {
          while (i < phrase.beg) {
            html += pmap[i];
            i += 1;
          }
          if (phrase.beg === phrase.end) {
            html += '<span class="apg-empty-phrase">&#120576;</span>';
          } else {
            html += '<span class="apg-phrase">';
            while (i < phrase.end) {
              html += pmap[i];
              i += 1;
            }
            html += "</span>";
          }
        }
      }
      while (i < pmap.length) {
        html += pmap[i];
        i += 1;
      }
      return html;
    }

    /* constructor */
    strings = findInvalidChars(input);
    if (strings.length > 0) {
      /* handle invalid character errors */
      this.invalidChars = true;
      return;
    }
    if (mode === "escaped") {
      /* escaped character mode */
      var str = markupEscapes(input);
      strings = findInvalidEscapes(str, input);
      if (strings.length > 0) {
        /* handle invalid escapes errors */
        this.invalidEscapes = true;
        return;
      }
      translateEscapes(str, this.pchars, pmap);
    } else {
      /* ASCII only mode */
      translateCtrl(input, this.pchars, pmap);
    }
  }
  // Constructor function for the generated parser.
  var apgParser = function() {
    var TAB_PHRASES = 3;
    var TAB_STATE = 4;
    var DISPLAY_FIRST = 1;
    var DISPLAY_PREV = 2;
    var DISPLAY_ALL = 3;
    var DISPLAY_NEXT = 4;
    var DISPLAY_LAST = 5;
    var apglib = require("apg-lib");
    var converter = require("apg-conv-api").converter;
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
    function iframeWrite(pageInfo, body) {
      var win = pageInfo.element.contentWindow
      var doc = win.document;
      var lineHeight = 14;
      var fontSize = 12;
      var css = 'body{';
      css += 'color: black;';
      css += 'background-color: white;';
      css += 'font-family: monospace;';
      css += 'font-size: '+fontSize+'px;';
      css += 'line-height: '+lineHeight+'px;';
      css += 'margin: 3px;';
      css += 'width: 100%;}\n';
      css += apglib.emitcss();
      css += 'p{margin: 0;}';
      doc.open();
      doc.write('<html><head>');
      doc.write('<title>');
      doc.write(pageInfo.title);
      doc.write('</title>');
      doc.write('<style>');
      doc.write(css);
      doc.write('</style></head><body>');
      doc.write(body);
      doc.write('</body></html>');
      doc.close();
      
      var elPhrase = doc.getElementsByClassName('apg-phrase')[0];
      if(elPhrase){
        var elBody = doc.getElementsByTagName('body')[0];
        var winHeight = win.innerHeight;
        var winWidth = win.innerWidth;
        var top = elBody.scrollTop;
        var left = elBody.scrollLeft;
        var viewHeight = winHeight - (3 * lineHeight);
        viewHeight = viewHeight > 0 ? viewHeight : winHeight;
        var viewWidth = winWidth - (3 * fontSize);
        viewWidth = viewWidth > 0 ? viewWidth : winWidth;
        var bot = top + viewHeight;
        var right = left + viewWidth;
        if(elPhrase.offsetTop > bot || elPhrase.offsetTop < top){
          elBody.scrollTop = elPhrase.offsetTop;
        }
        if(elPhrase.offsetLeft > right || elPhrase.offsetLeft < left){
          elBody.scrollLeft = elPhrase.offsetLeft;
        }
      }
    }
    function ruleDropDown(obj) {
      function alpha(lhs, rhs) {
        if (lhs.lower < rhs.lower) {
          return -1;
        }
        if (lhs.lower > rhs.lower) {
          return 1;
        }
        return 0;
      }
      rules.length = 0;
      var list = document.getElementById("ast-phrases");
      if (!obj) {
        list.innerHTML = "";
        return;
      }
      for ( var key in obj) {
        var phrases = obj[key];
        var rule = {};
        rule.name = key;
        rule.lower = key.toLowerCase();
        rule.listName = key + '(' + phrases.length + ')';
        rule.selectedPhrase = 0;
        rule.phrases = [];
        for (var i = 0; i < phrases.length; i += 1) {
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
      for (var i = 1; i < rules.length; i += 1) {
        html += '<option>' + rules[i].listName + '</option>';
      }
      list.innerHTML = html;
    }
    function initRules(rules, udts) {
      var html = '';

      return html;
    }

    function checkedValue(elements) {
      for (var i = 0; i < elements.length; i += 1) {
        if (elements[i].checked) {
          return elements[i].value;
        }
      }
      return null;
    }

    // Initializes the generated parser.
    //````
    // src: is the the generated grammar text file, null if none
    // obj: is the constructed grammar object, null if none
    // msg: is the error message, displayed only of src & obj are null
    //````
    this.init = function(src, obj, msg) {
      PAGE_INFO[PARSER_AREA].element.value = '<h4>No parser available.</h4>';
      PAGE_INFO[STATE_PAGE].element.innerHTML = '<h4>No parser state available.</h4>';
      PAGE_INFO[STATS_PAGE].element.innerHTML = '<h4>No parser statistics available.</h4>';
      iframeWrite(PAGE_INFO[TRACE_FRAME], '<h4>No parser trace available.</h4>');
      
      /* show/hide the trace config */
      var traceOnOff = checkedValue(TRACE.ON.elements);
      TRACE.TRACE_CONFIG.element.className = TRACE.TRACE_CONFIG.element.className.replace(" show", "");
      TRACE.TRACE_CONFIG.element.className = TRACE.TRACE_CONFIG.element.className.replace(" hide", "");
      TRACE.TRACE_CONFIG.element.className += (traceOnOff === "on") ? " show": " hide";
      
      if (src && obj) {
        grammar = obj;
        PAGE_INFO[PARSER_AREA].element.value = src;
        
        function rulerows(rules, checked){
          var cols = 5;
          var rows = rules.length;
          var remainder = rows % cols;
          var groups = (rows - remainder) /cols;
          var i = 0;
          var html = '';
          for(var j = 0; j < groups; j += 1){
            html += "<tr>";
            for(var k = 0; k < cols; k += 1){
              html += '<td><label><input type="checkbox" name="rules" value="'+rules[i].name+'" '+checked+'> '+rules[i].name+'</label></td>';
              i += 1;
            }
            html += "</tr>";
          }
          if(remainder > 0){
            html += "<tr>";
            for(var k = 0; k < remainder; k += 1){
              html += '<td><label><input type="checkbox" name="rules" value="'+rules[i].name+'" '+checked+'> '+rules[i].name+'</label></td>';
              i += 1;
            }
            html += "</tr>";
          }
          return html;
        }
        function alpha(lhs, rhs){
          if(lhs.lower < rhs.lower){
            return -1;
          }
          if(lhs.lower > rhs.lower){
            return 1;
          }
          return 0;
        }

        /* initialize the config rules/UDT items */
        var checked = checkedValue(TRACE.RULES_ON.elements);
        checked = (checked === "on") ? "checked" : "";
        var list = grammar.rules.slice();
        list.sort(alpha);
        var html = rulerows(list, checked);
        list = grammar.udts.slice();
        list.sort(alpha);
        html += rulerows(list, checked); 
        TRACE.RULES_TABLE.element.innerHTML = html;
        return;
      }
      if (msg && typeof (msg) === "string") {
        PAGE_INFO[PARSER_AREA].element.value = msg;
        grammar = null;
        return;
      }
    }
    this.setOperators = function(button){
      var checked = (button.value === "on") ? true : false;
      TRACE.OPERATORS.elements.forEach(function(element) {
        element.checked = checked;
      });
    }
    this.setRules= function(button){
      var checked = (button.value === "on") ? true : false;
      var elements = document.getElementsByName('rules');
      elements.forEach(function(element) {
        element.checked = checked;
      });
    }
    this.traceOnOff = function(button){
      TRACE.TRACE_CONFIG.element.className = TRACE.TRACE_CONFIG.element.className.replace(" show", "");
      TRACE.TRACE_CONFIG.element.className = TRACE.TRACE_CONFIG.element.className.replace(" hide", "");
      TRACE.TRACE_CONFIG.element.className += (button.value === "on") ? " show": " hide";
    }

    this.openModal = function(){
      MODAL_INFO.elements[MODAL_DIALOG].style.display = "block";
      MODAL_INFO.elements[MODAL_TOP].innerHTML = "Looks like your data is base 64.<br>Which data format does it represent?";
      var sel = "";
      sel += '<a href="javascript:void(0)" onclick="apgweb.parser.closeModal(\'uint7\')">&#128903;</a> UINT7 (ASCII)<br>';
      sel += '<a href="javascript:void(0)" onclick="apgweb.parser.closeModal(\'uint8\')">&#128903;</a> UINT8 (BINARY)<br>';
      sel += '<a href="javascript:void(0)" onclick="apgweb.parser.closeModal(\'uint16be\')">&#128903;</a> UINT16BE<br>';
      sel += '<a href="javascript:void(0)" onclick="apgweb.parser.closeModal(\'uint16le\')">&#128903;</a> UINT16LE<br>';
      sel += '<a href="javascript:void(0)" onclick="apgweb.parser.closeModal(\'uint32be\')">&#128903;</a> UINT32BE<br>';
      sel += '<a href="javascript:void(0)" onclick="apgweb.parser.closeModal(\'uint32le\')">&#128903;</a> UINT32LE<br>';
      sel += '<a href="javascript:void(0)" onclick="apgweb.parser.closeModal(\'utf8\')">&#128903;</a> UTF-8<br>';
      sel += '<a href="javascript:void(0)" onclick="apgweb.parser.closeModal(\'utf16\')">&#128903;</a> UTF-16<br>';
      sel += '<a href="javascript:void(0)" onclick="apgweb.parser.closeModal(\'utf16be\')">&#128903;</a> UTF-16BE<br>';
      sel += '<a href="javascript:void(0)" onclick="apgweb.parser.closeModal(\'utf16le\')">&#128903;</a> UTF-16LE<br>';
      sel += '<a href="javascript:void(0)" onclick="apgweb.parser.closeModal(\'utf32\')">&#128903;</a> UTF-32<br>';
      sel += '<a href="javascript:void(0)" onclick="apgweb.parser.closeModal(\'utf32be\')">&#128903;</a> UTF-32BE<br>';
      sel += '<a href="javascript:void(0)" onclick="apgweb.parser.closeModal(\'utf32le\')">&#128903;</a> UTF-32LE<br>';
      sel += '<a href="javascript:void(0)" onclick="apgweb.parser.closeModal(\'none\')">&#128903;</a> none - just parse it as is<br>';
      sel += '<a href="javascript:void(0)" onclick="apgweb.parser.closeModal(\'cancel\')">&#128903; cancel</a>';
      MODAL_INFO.elements[MODAL_CONTENT].innerHTML = sel;
    }
    this.closeModal = function(format){
      MODAL_INFO.elements[MODAL_DIALOG].style.display = "none";
      if(!format || format === "cancel"){
        return;
      }
      if(format === "none"){
        this.parseInput('ascii');
        return;
      }
      try{
        var type = "base64:" + format;
        var dst = converter.convert(type, PAGE_INFO[INPUT_AREA].element.value, "ESCAPED");
        PAGE_INFO[INPUT_AREA].element.value = dst.toString("ascii");
        this.parseInput('escaped');
      }catch(e){
        var msg = '<p class="apg-error">Unable to perform requested base 64 conversion.</p>';
        msg += '<p>' + e.message + '</p>';
        iframeWrite(PAGE_INFO[PHRASES_FRAME], msg);
        this.openTab(TAB_PHRASES);
      }
    }

    this.parseInput = function(mode) {
      function getConfig(){
        var config = {};
        config.inputMode = checkedValue(INPUT_MODE.elements);
        config.trace = (checkedValue(TRACE.ON.elements) === "on");
        config.rules = {};
        if(config.trace){
          config.traceMode = checkedValue(TRACE.DISPLAY.elements);
          config.traceRecords = {
            max : parseInt(document.getElementById("trace-max-records").value, 10),
            last : parseInt(document.getElementById("trace-last-record").value, 10),
          }
          if(isNaN(config.traceRecords.max) || config.traceRecords.max <= 0){
            throw new Error("apgParser: configuration error: max trace records must be integer > 0");
          }
          if(isNaN(config.traceRecords.last)){
            throw new Error("apgParser: configuration error: last trace record must be integer >= -1");
          }
          if(config.traceRecords.last < 0 ){
            config.traceRecords.last = -1;
          }
          config.operatorsOnOff = checkedValue(TRACE.OPERATORS_ON.elements);
          config.operators = {};
          TRACE.OPERATORS.elements.forEach(function(element) {
            config.operators[element.value] = element.checked;
          });

          config.rulesOnOff = checkedValue(TRACE.RULES_ON.elements);
          var elements = document.getElementsByName('rules');
          elements.forEach(function(element){
            config.rules[element.value] = element.checked;
          });
        }
        return config;
      }
      function isBase64(str){
        function isChar(char){
          if (char >= 65 && char <= 90) {
            return true;
          }
          if (char >= 97 && char <= 122) {
            return true;
          }
          if (char >= 48 && char <= 57) {
            return true;
          }
          if (char === 43) {
            return true;
          }
          if (char === 47) {
            return true;
          }
          return false;
        }
        var TAIL = 61;
        if(str.length >= 4){
          for(var i = 0; i < str.length - 2; i += 1){
            if(!isChar(str.charCodeAt(i))){
              return false;
            }
          }
          var ct1 = str.charCodeAt(str.length-2);
          var ct2 = str.charCodeAt(str.length-1);
          if(isChar(ct1)){
            if(isChar(ct2)){
              return true;
            }
            if(ct2 === TAIL){
              return true;
            }
          }
          if(ct1 === TAIL && ct2 === TAIL){
            return true;
          }
        }
        return false;
      }
      function isEscaped(str){
        for(var i = 0; i < str.length - 1; i += 1){
          var ii = i + 1;
          if(str.charCodeAt(i) === 96){
            if(str.charCodeAt(i) === 96){
              return true;
            }
            if(str.charCodeAt(i) === 120){
              return true;
            }
            if(str.charCodeAt(i) === 117){
              return true;
            }
          }
        }
        return false;
      }
      rules.length = 0;
      input = null;
      try {
        /* validate the grammar */
        if (grammar === null) {
          throw new Error("apgParser: Parser has not been initialized.")
        }
        if (grammar.grammarObject !== "grammarObject") {
          throw new Error("apgParser: Parser object not recognized.")
        }
        if (grammar.udts.length > 0) {
          throw new Error("apgParser: Grammar has User Defined Terminals. Unable to parse input.")
        }

        /* read fixed config item values */
        var config = getConfig();

        /* validate the input */
        var useMode = "auto";
        if(!mode || mode === "init"){
          useMode = config.inputMode;
        }else if(mode === "cancel"){
          return;
        }else{
          useMode = mode;
        }
        if(useMode === "auto"){
          if(isBase64(PAGE_INFO[INPUT_AREA].element.value)){
            this.openModal();
            return;
          }
          if(isEscaped(PAGE_INFO[INPUT_AREA].element.value)){
            useMode = "escaped";
          }
        }
        input = new apgInput(PAGE_INFO[INPUT_AREA].element.value, useMode);
        if (input.invalidChars || input.invalidEscapes) {
          iframeWrite(PAGE_INFO[PHRASES_FRAME], input.displayInput());
          this.openTab(TAB_PHRASES);
          return;
        }

        /* set up the parser */
        parser = new apglib.parser();
        
        /* add statistics gathering */
        parser.stats = new apglib.stats();
        
        /* AST for display of matched phrases */
        parser.ast = new apglib.ast();

        /* configure trace, if any */
        if (config.trace) {
          parser.trace = new apglib.trace();
          for(var key in config.operators){
            parser.trace.filter.operators[key] = config.operators[key];
          }
          for(var key in config.rules){
            parser.trace.filter.rules[key] = config.rules[key];
          }
          parser.trace.setMaxRecords(config.traceRecords.max, config.traceRecords.last);
          for(var key in config.rules){
            parser.ast.callbacks[key] = config.rules[key];
          }
        }else{
          grammar.rules.forEach(function(rule){
            parser.ast.callbacks[rule.name] = true;
          });
        }

        /* configure AST for all rule/UDT names */
        startRule = 0;
        result = parser.parse(grammar, startRule, input.pchars);
        PAGE_INFO[STATE_PAGE].element.innerHTML = apglib.utils.parserResultToHtml(result, "Parser State");
        PAGE_INFO[STATS_PAGE].element.innerHTML = parser.stats.toHtml("hits", "Parser Statistics");
        if (config.trace) {
          iframeWrite(PAGE_INFO[TRACE_FRAME], parser.trace.toHtml(config.traceMode));
        }
        if (result.success) {
          /* populate phrase names */
          ruleDropDown(parser.ast.phrases());
          this.displayPhrase(null, 1);
          this.openTab(TAB_PHRASES);
        } else {
          ruleDropDown();
          iframeWrite(PAGE_INFO[PHRASES_FRAME], input.displayInput());
          this.openTab(TAB_STATE);
        }
      } catch (e) {
        var msg = '<span class="apg-error"><h4>Parser Exception:</h4>' + e.message;
        if (input !== null) {
          msg += "<br><br>";
          msg += input.displayInput();
        }
        iframeWrite(PAGE_INFO[PHRASES_FRAME], msg);
        this.openTab(TAB_PHRASES);
      }
    }
    this.phraseChange = function(event) {
      if (input === null || rules.length === 0) {
        return;
      }
      var options = document.getElementById("ast-phrases").options;
      for (var i = 0; i < options.length; i += 1) {
        if (options[i].selected) {
          selectedRule = i;
          rules[selectedRule].selectedPhrase = 0;
          break;
        }
      }
      this.displayPhrase(null, DISPLAY_FIRST);
    }
    this.displayPhrase = function(event, type) {
      if(event){
        event.currentTarget.blur();
      }
      if (input === null || rules.length === 0) {
        return;
      }
      var rule = rules[selectedRule];
      var phrases = [];
      switch (type) {
      case DISPLAY_FIRST:
        rule.selectedPhrase = 0;
        phrases[0] = rule.phrases[rule.selectedPhrase];
        break;
      case DISPLAY_PREV:
        if (rule.selectedPhrase > 0) {
          rule.selectedPhrase -= 1;
        }
        phrases[0] = rule.phrases[rule.selectedPhrase];
        break;
      case DISPLAY_NEXT:
        if (rule.phrases.length === 0) {
          rule.selectedPhrase = 0;
        } else if (rule.selectedPhrase < rule.phrases.length - 1) {
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
    this.openTab = function(tabnumber) {
      var i, tabcontent, tablinks;
      tabcontent = document.getElementsByClassName("parser-tabcontent");
      tablinks = document.getElementsByClassName("parser-tablinks");

      /* hide all content */
      for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].className = tabcontent[i].className.replace(" show", "");
        tabcontent[i].className = tabcontent[i].className.replace(" hide", "");
        tabcontent[i].className += " hide";
      }

      /* deactivate all menu links */
      for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
      }

      /* activate menu item (changes its color) */
      var tab = tablinks[tabnumber];
      if (tab) {
        tab.className += " active";
      }

      /* show the activated content */
      var content = tabcontent[tabnumber];
      if (content) {
        content.className = content.className.replace(" hide", "");
        content.className += " show";
      }
      currentTab = tabnumber;
      return false;
    }
  }
  // Constructor for the attributes object. Handles display and sorting of the rule attributes.
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
    var style = require('apg-lib').style;
    var sortState = {};
    var colNames = [];
    var noDataMsg = "<h4>Attributes not initialized.</h4>";

    var self = this;
    self.rulesData = null;
    self.udtsData = null;
    self.msg = noDataMsg;

    function sortIndex(sortDir, errors, others, udts) {
      function up(lhs, rhs) {
        return rhs.index - lhs.index;
      }
      function down(lhs, rhs) {
        return lhs.index - rhs.index;
      }
      if (sortDir === DOWN) {
        errors.sort(down);
        others.sort(down);
        udts.sort(down);
      } else {
        errors.sort(up);
        others.sort(up);
        udts.sort(up);
      }
    }
    function sortRules(sortDir, errors, others, udts) {
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
        udts.sort(down);
      } else {
        errors.sort(up);
        others.sort(up);
        udts.sort(up);
      }
    }
    function sortTypes(sortDir, errors, others, udts) {
      function up(lhs, rhs) {
        return rhs.type - lhs.type;
      }
      function down(lhs, rhs) {
        return lhs.type - rhs.type;
      }
      if (sortDir === DOWN) {
        errors.sort(down);
        others.sort(down);
        udts.sort(down);
      } else {
        errors.sort(up);
        others.sort(up);
        udts.sort(up);
      }
    }
    function sortAttrs(sortDir, errors, others, udts, col) {
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
        udts.sort(down);
      } else {
        errors.sort(up);
        others.sort(up);
        udts.sort(up);
      }
    }

    /* Generates and displays the attribute table. */
    var tableGen = function(errors, others) {
      function yes(val) {
        return val ? "yes" : "no";
      }
      function ruleGen(row) {
        var html = "";
        var left, cyclic, finite;
        var left = row.left ? '<span class="apg-error">' + yes(row.left) + '</span>' : yes(row.left);
        var cyclic = row.cyclic ? '<span class="apg-error">' + yes(row.cyclic) + '</span>' : yes(row.cyclic);
        var finite = row.finite ? yes(row.finite) : '<span class="apg-error">' + yes(row.finite) + '</span>';
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
        html += '<input type="checkbox" class="align-middle" id="' + CHECKED_ID + '" ' + checked + '> keep rules with attribute errors at top';
      }
      html += '<table class="' + style.CLASS_ATTRIBUTES + '">';
      html += ' <caption>Attributes</caption>'
      html += '<tr>';
      html += '<th><a class="' + style.CLASS_RULESLINK + '" href="javascript:void(0)" onclick="apgweb.attrs.sort(0)">' + colNames[0] + '</a></th>';
      html += '<th><a class="' + style.CLASS_RULESLINK + '" href="javascript:void(0)" onclick="apgweb.attrs.sort(1)">' + colNames[1] + '</a></th>';
      html += '<th><a class="' + style.CLASS_RULESLINK + '" href="javascript:void(0)" onclick="apgweb.attrs.sort(2)">' + colNames[2] + '</a></th>';
      html += '<th><a class="' + style.CLASS_RULESLINK + '" href="javascript:void(0)" onclick="apgweb.attrs.sort(3)">' + colNames[3] + '</a></th>';
      html += '<th><a class="' + style.CLASS_RULESLINK + '" href="javascript:void(0)" onclick="apgweb.attrs.sort(4)">' + colNames[4] + '</a></th>';
      html += '<th><a class="' + style.CLASS_RULESLINK + '" href="javascript:void(0)" onclick="apgweb.attrs.sort(5)">' + colNames[5] + '</a></th>';
      html += '<th><a class="' + style.CLASS_RULESLINK + '" href="javascript:void(0)" onclick="apgweb.attrs.sort(6)">' + colNames[6] + '</a></th>';
      html += '<th><a class="' + style.CLASS_RULESLINK + '" href="javascript:void(0)" onclick="apgweb.attrs.sort(7)">' + colNames[7] + '</a></th>';
      html += '<th><a class="' + style.CLASS_RULESLINK + '" href="javascript:void(0)" onclick="apgweb.attrs.sort(8)">' + colNames[8] + '</a></th>';
      html += '<th><a class="' + style.CLASS_RULESLINK + '" href="javascript:void(0)" onclick="apgweb.attrs.sort(9)">' + colNames[9] + '</a></th>';
      html += '</tr>';
      errors.forEach(function(row) {
        html += ruleGen(row);
      });
      others.forEach(function(row) {
        html += ruleGen(row);
      });
      self.udtsData.forEach(function(row) {
        html += ruleGen(row);
      });
      html += "</table>";
      return html;
    }

    /* Initializes the attributes table state data for a descending sort on the index column. */
    function initSort(col) {
      if (self.rulesData === null) {
        return;
      }
      for (var i = 0; i < COL_NAMES.length; i += 1) {
        colNames[i] = COL_NAMES[i].NONE;
      }
      /* initialize to default sort state */
      sortState.hasErrors = false;
      for (var i = 0; i < self.rulesData.length; i += 1) {
        if (self.rulesData[i].error) {
          sortState.hasErrors = true;
          break;
        }
      }
      sortState.topErrors = true;
      sortState.col = 0;
      sortState.dir = UP;
      colNames[sortState.col] = COL_NAMES[sortState.col].UP;
    }

    /* Called by the parser generator to initialize the attributes table, if any. */
    /* Displays either the table or an error message on the attributes page. */
    this.init = function(rules, udts, msg) {
      self.rulesData = rules;
      self.udtsData = udts;
      if (msg && typeof (msg) === "string") {
        self.msg = msg
      } else if (self.rulesData === null) {
        self.msg = noDataMsg;
      } else {
        self.msg = "";
      }
      initSort(0);
      self.sort(0);
    }

    /* Event handler for the attribute table column header sorting anchors. */
    this.sort = function(col) {
      if (self.rulesData === null) {
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
      for (var i = 0; i < self.rulesData.length; i += 1) {
        if (sortState.topErrors && self.rulesData[i].error) {
          errorRules.push(self.rulesData[i]);
        } else {
          otherRules.push(self.rulesData[i]);
        }
      }
      switch (sortState.col) {
      case 0:
        sortIndex(sortState.dir, errorRules, otherRules, self.udtsData);
        break;
      case 1:
        sortRules(sortState.dir, errorRules, otherRules, self.udtsData);
        break;
      case 2:
        sortTypes(sortState.dir, errorRules, otherRules, self.udtsData);
        break;
      case 3:
        sortAttrs(sortState.dir, errorRules, otherRules, self.udtsData, "left");
        break;
      case 4:
        sortAttrs(sortState.dir, errorRules, otherRules, self.udtsData, "nested");
        break;
      case 5:
        sortAttrs(sortState.dir, errorRules, otherRules, self.udtsData, "right");
        break;
      case 6:
        sortAttrs(sortState.dir, errorRules, otherRules, self.udtsData, "cyclic");
        break;
      case 7:
        sortAttrs(sortState.dir, errorRules, otherRules, self.udtsData, "finite");
        break;
      case 8:
        sortAttrs(sortState.dir, errorRules, otherRules, self.udtsData, "empty");
        break;
      case 9:
        sortAttrs(sortState.dir, errorRules, otherRules, self.udtsData, "notempty");
        break;
      }
      PAGE_INFO[ATTRS_PAGE].element.innerHTML = tableGen(errorRules, otherRules, self.udtsData);
      return false;
    }

    /* initialize the attributes page message */
    this.init(null, null);
  }
  // Constuctor for the display and sorting of the rules/UDT information.
  var apgRules = function() {
    var INDEX_DOWN = "index\u2193";
    var INDEX_UP = "index\u2191";
    var INDEX_NONE = "index&nbsp";
    var RULES_DOWN = "rule\u2193";
    var RULES_UP = "rule\u2191";
    var RULES_NONE = "rule&nbsp;";
    var ROW_SHOW = "show";
    var ROW_HIDE = "hide";
    var style = require('apg-lib').style;

    var self = this;
    self.rulesData = null;
    self.udtsData = null;
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
      var rule = self.rulesData.rows[index];
      rule.show = (event.currentTarget.innerHTML === ROW_SHOW)
      return tableGen();
    }
    this.sortIndex = function(event) {
      self.dir.rules = RULES_NONE;
      function up(lhs, rhs) {
        return rhs.index - lhs.index;
      }
      function down(lhs, rhs) {
        return lhs.index - rhs.index;
      }
      if (event.currentTarget.innerHTML === INDEX_DOWN) {
        /* sort up */
        self.rulesData.rows.sort(up);
        self.udtsData.sort(up);
        self.dir.index = INDEX_UP;
      } else {
        /* sort down */
        self.rulesData.rows.sort(down);
        self.udtsData.sort(down);
        self.dir.index = INDEX_DOWN;
      }
      return tableGen();
    }
    this.sortName = function(event) {
      self.dir.index = INDEX_NONE;
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
      if (event.currentTarget.innerHTML === RULES_DOWN) {
        /* sort up */
        self.rulesData.rows.sort(up);
        self.udtsData.sort(up);
        self.dir.rules = RULES_UP;
      } else {
        /* sort down */
        self.rulesData.rows.sort(down);
        self.udtsData.sort(down);
        self.dir.rules = RULES_DOWN;
      }
      return tableGen();
    }
    this.init = function(rules, udts, msg) {
      self.rulesData = rules;
      self.udtsData = udts;
      self.msg = (msg && typeof (msg) === "string") ? msg : "";
      if (self.rulesData !== null) {
        self.dir.index = INDEX_DOWN;
        self.dir.rules = RULES_NONE;
        setRowShow(true);
      }
      tableGen();
    }

    /* Generate the rules table HTML. */
    var tableGen = function() {
      if (self.rulesData === null) {
        PAGE_INFO[RULES_PAGE].element.innerHTML = self.msg;
        return false;
      }
      var html = "";
      html += '<table class="' + style.CLASS_RULES + '">';
      html += ' <caption>Rules</caption>'
      html += '<tr><th><a class="' + style.CLASS_RULESLINK + '" href="javascript:void(0)" onclick="apgweb.rules.sortIndex(event)">' + self.dir.index
          + '</a></th>';
      html += '<th><a class="' + style.CLASS_RULESLINK + '" href="javascript:void(0)" onclick="apgweb.rules.sortName(event)">' + self.dir.rules + '</a></th>';
      html += '<th>refers to</th></tr>';
      for (var i = 0; i < self.rulesData.rows.length; i += 1) {
        var rule = self.rulesData.rows[i];
        if (rule.dependents.length > 0) {
          var link = rule.show ? ROW_HIDE : ROW_SHOW;
          html += '<tr><td>' + rule.index + '</td><td>' + rule.name + '</td>';
          html += '<td><a class="' + style.CLASS_RULESLINK + '" href="javascript:void(0)" onclick="apgweb.rules.dependentsShow(event,' + i + ')">' + link
              + '</a></td></tr>';
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
      for (var i = 0; i < self.udtsData.length; i += 1) {
        html += '<tr><td>' + self.udtsData[i].index + '</td><td>' + self.udtsData[i].name + '</td><td></td></tr>';
      }
      
      html += '</table>';
      PAGE_INFO[RULES_PAGE].element.innerHTML = html;
      return false;
    }
    function setRowShow(show) {
      if (self.rulesData !== null) {
        self.rulesData.rows.forEach(function(rule) {
          if (rule.dependents.length > 0) {
            for (var i = 0; i < rule.dependents.length; i += 1) {
              rule.show = show;
            }
          }
        });
      }
    }

    self.init(null, null, "<h4>Rules not initialized.</h4>");
  }
// Constructor for the generator function. Handles the main logic for parser generation.  
  var apgWeb = function() {
    var api = require("apg-api");

    /* handle the main menu tabs */
    this.openTab = function(tabnumber) {
      var i, tabcontent, tablinks;
      tabcontent = document.getElementsByClassName("tabcontent");
      tablinks = document.getElementsByClassName("tablinks");

      /* hide all content */
      for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].className = tabcontent[i].className.replace(" show", "");
        tabcontent[i].className = tabcontent[i].className.replace(" hide", "");
        tabcontent[i].className += " hide";
      }

      /* deactivate all menu links */
      for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
      }

      /* activate menu item (changes its color) */
      var tab = tablinks[tabnumber];
      if (tab) {
        tab.className += " active";
      }

      /* show the activated content */
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
        try {
          document.execCommand('copy');
          el.blur()
        } catch (e) {
          alert("please press Ctrl/Cmd+C to copy");
        }
      }
    }
    this.fullScreen = function(event, name) {
      event.currentTarget.blur();
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
      var css = require('apg-lib').emitcss();
      var button = '<button style="color:black;background:#B3C1FF;" type="button" onclick="window.close()">Close</button>';
      var html = '';
      var el = PAGE_INFO[name].element;
      if (el) {
        html += '<html><head>';
        switch (PAGE_INFO[name].type) {
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
          html += '<style>' + css + '</style>';
          html += '</head><body>';
          html += button
          html += el.innerHTML;
          html += '<br>';
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
      var attrsObj;
      var strict = false;
      var sabnfGrammar = PAGE_INFO[GRAMMAR_AREA].element.value;
      var grammarHtml = "";
      var rulesErrorMsg = "<h4>Rules not generated due to grammar errors.</h4>";
      var attrsErrorMsg = "<h4>Attributes not generated due to grammar errors.</h4>";
      var parserErrorMsg = "Parser not generated due to grammar errors."
      var attrErrors = false;
      var validGrammar = false;
      while (true) {
        /* validate the input SABNF grammar */
        if (!sabnfGrammar || sabnfGrammar === "") {
          grammarHtml = '<h4 class="error">Input SABNF grammar is empty.</h4>';
          break;
        }
        
        api = new api(sabnfGrammar);
        api.scan();
        grammarHtml = api.linesToHtml();
        if(api.errors.length){
          grammarHtml += api.errorsToHtml("SABNF grammar has invalid characters");
          break;
        }

        /* validate the SABNF grammar syntax */
        api.parse();
        if(api.errors.length){
          grammarHtml += api.errorsToHtml("SABNF grammar has syntax errors");
          break;
        }

        /* validate the SABNF grammar semantics */
        api.translate();
        if(api.errors.length){
          grammarHtml += api.errorsToHtml("SABNF grammar has semantic errors");
          break;
        }

        /* validate the SABNF grammar attributes */
        attrsObj = api.getAttributesObject();
        api.attributes();
        if(api.errors.length){
          grammarHtml += api.errorsToHtml("SABNF grammar has attribute errors");
          attrErrors = true;
          break;
        }

        /* success: have a valid grammar */
        validGrammar = true;
        break;
      }

      /* display the results */
      PAGE_INFO[GRAMMAR_PAGE].element.innerHTML = grammarHtml;
      /* Initialize the parser object. */
      if (validGrammar) {
        var src = api.toSource("generatedGrammar");
        var obj = api.toObject();
        this.parser.init(src, obj);
      } else {
        this.parser.init(null, null, parserErrorMsg);
      }
      /* Initialize the rules and attributes objects. */
      /* Having attrsObj implies having result.udt */
      if (attrsObj) {
        this.rules.init(attrsObj.rulesWithReferencesData(), api.udts);
        this.attrs.init(attrsObj.ruleAttrsData(), attrsObj.udtAttrsData());
      } else {
        this.rules.init(null, null, rulesErrorMsg);
        this.attrs.init(null, null, attrsErrorMsg);
      }
      /* Open the proper tab to display the appropriate results. */
      /* - the grammar tab if the grammar is invalid */
      /* - the attributes tab if there are attribute errors */
      /* - the parser tab if the grammar is valid */
      /* - always initialize the parser page to the Parser tab (even if the parser page is not displayed) */
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
      PAGE_INFO[GRAMMAR_AREA] = {
        id : GRAMMAR_AREA,
        type : TYPE_TEXTAREA,
        title : 'input SABNF grammar',
        element : document.getElementById(GRAMMAR_AREA)
      };
      PAGE_INFO[PARSER_AREA] = {
        id : PARSER_AREA,
        type : TYPE_TEXTAREA,
        title : 'Generated Parser',
        element : document.getElementById(PARSER_AREA)
      };
      PAGE_INFO[INPUT_AREA] = {
        id : INPUT_AREA,
        type : TYPE_TEXTAREA,
        title : 'Input String',
        element : document.getElementById(INPUT_AREA)
      };
      PAGE_INFO[PHRASES_FRAME] = {
        id : PHRASES_FRAME,
        type : TYPE_FRAME,
        title : 'Annotated Phrases',
        element : document.getElementById(PHRASES_FRAME)
      };
      PAGE_INFO[GRAMMAR_PAGE] = {
        id : GRAMMAR_PAGE,
        type : TYPE_PAGE,
        title : '',
        element : document.getElementById(GRAMMAR_PAGE)
      };
      PAGE_INFO[RULES_PAGE] = {
        id : RULES_PAGE,
        type : TYPE_PAGE,
        title : '',
        element : document.getElementById(RULES_PAGE)
      };
      PAGE_INFO[ATTRS_PAGE] = {
        id : ATTRS_PAGE,
        type : TYPE_PAGE,
        title : '',
        element : document.getElementById(ATTRS_PAGE)
      };
      PAGE_INFO[STATE_PAGE] = {
        id : STATE_PAGE,
        type : TYPE_PAGE,
        title : '',
        element : document.getElementById(STATE_PAGE)
      };
      PAGE_INFO[STATS_PAGE] = {
        id : STATS_PAGE,
        type : TYPE_PAGE,
        title : '',
        element : document.getElementById(STATS_PAGE)
      };
      PAGE_INFO[TRACE_FRAME] = {
        id : TRACE_FRAME,
        type : TYPE_FRAME,
        title : 'Parser Trace',
        element : document.getElementById(TRACE_FRAME)
      };
      MODAL_INFO.elements[MODAL_DIALOG] = document.getElementById(MODAL_DIALOG);
      MODAL_INFO.elements[MODAL_TOP] = document.getElementById(MODAL_TOP);
      MODAL_INFO.elements[MODAL_CONTENT] = document.getElementById(MODAL_CONTENT  );

      INPUT_MODE.elements = document.getElementsByName(INPUT_MODE.name);
      TRACE.ON.elements = document.getElementsByName(TRACE.ON.name);
      TRACE.DISPLAY.elements = document.getElementsByName(TRACE.DISPLAY.name);
      TRACE.RECORDS.elements = document.getElementsByName(TRACE.RECORDS.name);
      TRACE.OPERATORS_ON.elements = document.getElementsByName(TRACE.OPERATORS_ON.name);
      TRACE.OPERATORS.elements = document.getElementsByName(TRACE.OPERATORS.name);
      TRACE.RULES_ON.elements = document.getElementsByName(TRACE.RULES_ON.name);
      TRACE.RULES_TABLE.element = document.getElementById(TRACE.RULES_TABLE.name);
      TRACE.TRACE_CONFIG.element = document.getElementById(TRACE.TRACE_CONFIG .name);

      var height = (Math.floor((window.innerHeight - 400) * .9)) + "px";
      PAGE_INFO[GRAMMAR_AREA].element.style.height = height
      PAGE_INFO[PARSER_AREA].element.style.height = height
      PAGE_INFO[INPUT_AREA].element.style.height = height
      PAGE_INFO[PHRASES_FRAME].element.style.height = height
      PAGE_INFO[TRACE_FRAME].element.style.height = height

      this.rules = new apgRules;
      this.attrs = new apgAttrs;
      this.parser = new apgParser;
      this.parser.init(null, null, "Parser not initialized.", null);
      this.parser.openTab(0);
      this.openTab(0);
      PAGE_INFO[GRAMMAR_PAGE].element.innerHTML = "<h4>Grammar not parsered.</h4>"
    };
  };
  return new apgWeb();
})();
