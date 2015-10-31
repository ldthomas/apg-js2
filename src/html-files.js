module.exports = function() {
	"use strict";
	var thisFileName = "html-files.js: ";
	var that = this;
	var fs = require("fs");
	var resources = require("./html-files-sources.js");

	var fsmsg = function(name, msg, e){
		var ret = name;
		ret += "\n    " +msg;
		ret += "\ncwd: "+ process.cwd();
		ret += "\n fs: ";
		ret += e.message;
		return ret;
	}
	var htmlPageItems = {
		console : {
			name : 'Console',
			pageName : 'index.html',
			fd : null,
			scripts: []
		},
		attributes : {
			name : 'Attributes',
			pageName : 'attributes.html',
			fd : null,
			scripts: ["https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js","attr-sort.js"]
		},
		configuration : {
			name : 'Configuration',
			pageName : 'configuration.html',
			fd : null,
			scripts: []
		},
		grammar : {
			name : 'Grammar',
			pageName : 'grammar.html',
			fd : null,
			scripts: []
		},
		grammarStats : {
			name : 'Grammar Statistics',
			pageName : 'grammar-statistics.html',
			fd : null,
			scripts: []
		},
		rules : {
			name : 'Rules',
			pageName : 'rules.html',
			fd : null,
			scripts: ["https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js","rule-sort.js"]
		},
		state : {
			name : 'State',
			pageName : 'state.html',
			fd : null,
			scripts: []
		},
	}

	var htmlResources = {
		attrSort : {
			filename : 'attr-sort.js',
			value : ''
		},
		ruleSort : {
			filename : 'rule-sort.js',
			value : ''
		},
		printCss : {
			filename : 'sinorca-print.css',
			value : ''
		},
		screenCss : {
			filename : 'sinorca-screen.css',
			value : ''
		}
	}

	var copyResource = function(dstName, src) {
		// put the css files in the output directory
		var functionName = thisFileName + "copyResource(): ";
		var fd;
		try {
			fd = fs.openSync(dstName, "r");
			// file exists - do nothing
			fs.closeSync(fd);
		} catch (e) {
			if (e.code === "ENOENT") {
				// copy it over
				try {
					fd = fs.openSync(dstName, "w");
				} catch (ex) {
					throw new Error(functionName+"can't open destination css file\n"+ex.message);
				}
				try {
					fs.writeSync(fd, src);
					fs.closeSync(fd);
				} catch (ex) {
					throw new Error(functionName+"can't copy resource css file do destination\n"+ex.message);
				}
			} else {
				throw new Error(functionName+"css file error\n"+e.message);
			}
		}
	}

//	var getResource = function(filename) {
//		var functionName = thisFileName + "getResource(): ";
//		var resource;
//		try {
//			resource = fs.readFileSync(filename, "utf-8");
//		} catch (e) {
//			throw new Error(functionName+"error with resource file '" + filename+"'\n"+e.message);
//		}
//		return resource;
//	}
	var getResources = function(config) {
		var htmlDir = config.vHTMLDir + config.getFileDivider();
		var dstName;
		// make sure the css files are in the HTML directory
		dstName = htmlDir + htmlResources.printCss.filename;
		copyResource(dstName, resources.printcss);
		dstName = htmlDir + htmlResources.screenCss.filename;
		copyResource(dstName, resources.screencss);
		dstName = htmlDir + htmlResources.attrSort.filename;
		copyResource(dstName, resources.attrsort);
		dstName = htmlDir + htmlResources.ruleSort.filename;
		copyResource(dstName, resources.rulesort);

	}
	var writeMenuItems = function(config, page, fd) {
		var line;
		fs.writeSync(fd, '<div><p class="sideBarTitle">Generator Output</p><ul>\n');
		if (page === htmlPageItems.console.pageName) {
			line = '<li><span class="thisPage">&rsaquo; '
					+ htmlPageItems.console.name + '</span></li>\n';
		} else {
			line = '<li><a href="' + htmlPageItems.console.pageName
					+ '">&rsaquo; ' + htmlPageItems.console.name
					+ '</a></li>\n';
		}
		fs.writeSync(fd, line);
		if (page === htmlPageItems.attributes.pageName) {
			line = '<li><span class="thisPage">&rsaquo; '
					+ htmlPageItems.attributes.name + '</span></li>\n';
		} else {
			line = '<li><a href="' + htmlPageItems.attributes.pageName
					+ '">&rsaquo; ' + htmlPageItems.attributes.name
					+ '</a></li>\n';
		}
		fs.writeSync(fd, line);
		if (page === htmlPageItems.configuration.pageName) {
			line = '<li><span class="thisPage">&rsaquo; '
					+ htmlPageItems.configuration.name + '</span></li>\n';
		} else {
			line = '<li><a href="' + htmlPageItems.configuration.pageName
					+ '">&rsaquo; ' + htmlPageItems.configuration.name
					+ '</a></li>\n';
		}
		fs.writeSync(fd, line);
		if (page === htmlPageItems.grammar.pageName) {
			line = '<li><span class="thisPage">&rsaquo; '
					+ htmlPageItems.grammar.name + '</span></li>\n';
		} else {
			line = '<li><a href="' + htmlPageItems.grammar.pageName
					+ '">&rsaquo; ' + htmlPageItems.grammar.name
					+ '</a></li>\n';
		}
		fs.writeSync(fd, line);
		if (page === htmlPageItems.grammarStats.pageName) {
			line = '<li><span class="thisPage">&rsaquo; '
					+ htmlPageItems.grammarStats.name + '</span></li>\n';
		} else {
			line = '<li><a href="' + htmlPageItems.grammarStats.pageName
					+ '">&rsaquo; ' + htmlPageItems.grammarStats.name
					+ '</a></li>\n';

		}
		fs.writeSync(fd, line);
		if (page === htmlPageItems.rules.pageName) {
			line = '<li><span class="thisPage">&rsaquo; '
					+ htmlPageItems.rules.name + '</span></li>\n';
		} else {
			line = '<li><a href="' + htmlPageItems.rules.pageName
					+ '">&rsaquo; ' + htmlPageItems.rules.name
					+ '</a></li>\n';
		}
		fs.writeSync(fd, line);
		if (page === htmlPageItems.state.pageName) {
			line = '<li><span class="thisPage">&rsaquo; '
					+ htmlPageItems.state.name + '</span></li>\n';
		} else {
			line = '<li><a href="' + htmlPageItems.state.pageName
					+ '">&rsaquo; ' + htmlPageItems.state.name
					+ '</a></li>\n';
		}
		fs.writeSync(fd, line);
		fs.writeSync(fd, '</ul></div>\n');
	}
	var header = function(pageItem){
		var html = "";
		html += '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">\n'; 
		html += '<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en-AU">\n'; 
		html += '<head>\n'; 
		html += '<title>' +pageItem.name+ '</title>\n'; 
		html += '<meta http-equiv="content-type"	content="application/xhtml+xml; charset=UTF-8" />\n'; 
		html += '<meta name="JavaScript APG 2.0" content="Lowell D. Thomas" />\n'; 
		html += '<link rel="stylesheet" type="text/css" href="sinorca-screen.css" media="screen" title="Sinorca (screen)" />\n'; 
		html += '<link rel="stylesheet" type="text/css" href="sinorca-print.css"	media="print" />\n';
		for(var i = 0; i < pageItem.scripts.length; i += 1){
			html += '<script src="' +pageItem.scripts[i]+ '"></script>\n'; 
		}
		html += '</head>\n'; 
		html += '<body>\n'; 
		html += '<div id="header">\n'; 
		html += '<div class="superHeader"></div>\n'; 
		html += '<div class="midHeader">\n'; 
		html += '<h1 class="headerTitle"> JavaScript <strong>APG</strong> 2.0.0</h1>\n'; 
		html += '</div>\n'; 
		html += '<div class="subHeader">&nbsp;</div>\n'; 
		html += '</div>\n'; 
		html += '<div id="side-bar">\n'; 
		return html;
	}
	var openPage = function(config, pageItem){
		var fd, filename, line, date;
		fd = fs.openSync(config.vHTMLDir + config.getFileDivider()
				+ pageItem.pageName, "w");
		fs.writeSync(fd, header(pageItem));
		writeMenuItems(config, pageItem.pageName, fd);
		fs.writeSync(fd, '</div>\n');
		date = new Date();
		line = '<div id="main-copy"><p></p><a class="topOfPage" href="#bottom" title="Go to the bottom of this page">';
		line += date.toString()
				+ '&nbsp;&nbsp;:&nbsp;&nbsp;<strong>&#8659;</strong>BOTTOM</a>';
		line += '<h1 id="top">' + pageItem.name + '</h1>\n';
		fs.writeSync(fd, line);
		pageItem.fd = fd;
	}
	var closePage = function(pageItem) {
		var functionName = thisFileName + "closePage(): ";
		var footer = '';
		footer += '\n<div id="footer">\n';
		footer += '<div class="left"> Copyright &copy; 2015 <a href="http://www.coasttocoastresearch.com">Lowell D. Thomas</a>, all rights reserved</div>\n';
		footer += '<br class="doNotDisplay doNotPrint" />\n';
		footer += '<div class="right">Design by <a href="http://www.oswd.org/user/designs/id/3013">haran</a></div>\n';
		footer += '</div></body></html>\n';
		if (pageItem.fd !== null) {
			var line = '<a class="topOfPage" href="#header" title="Go to the top of this page">&#8657;TOP</a>\n';
			line += '<h1 id="bottom">' + pageItem.name + '</h1></div>';
			try {
				fs.writeSync(pageItem.fd, line);
				fs.writeSync(pageItem.fd, footer);
				fs.closeSync(pageItem.fd);
			} catch (e) {
				throw new Error(functionName+e.message);
			}
			pageItem.fd = null;
		}
	}
	this.open = function(config) {
		var functionName = thisFileName + "open():";
		try {
			fs.mkdirSync(config.vHTMLDir);
		} catch (e) {
			if (e.code !== "EEXIST") {
				throw new Error(fsmsg(functionName, "can't create HTML directory", e));
			}
		}

		getResources(config);
		try {
			openPage(config, htmlPageItems.console);
			this.writePage("console", '<pre>\n');
			openPage(config, htmlPageItems.attributes);
			openPage(config, htmlPageItems.configuration);
			openPage(config, htmlPageItems.grammar);
			openPage(config, htmlPageItems.grammarStats);
			openPage(config, htmlPageItems.rules);
			openPage(config, htmlPageItems.state);
		} catch (e) {
			throw new Error(fsmsg(functionName, "error opening Generator HTML output pages", e));
		}
	}
	this.getConsolePage = function(){
		return htmlPageItems.console.fd;
	}
	this.close = function() {
		// close all open HTML pages
		this.writePage("console", '</pre>\n');
		closePage(htmlPageItems.console);
		closePage(htmlPageItems.attributes);
		closePage(htmlPageItems.configuration);
		closePage(htmlPageItems.grammar);
		closePage(htmlPageItems.grammarStats);
		closePage(htmlPageItems.rules);
		closePage(htmlPageItems.state);
	}
	this.writePage = function(pageName, text) {
		var functionName = thisFileName + "writePage(): ";
		var item = htmlPageItems[pageName];
		if (typeof (item) !== "object") {
			throw new Error(functionName+"page name '"+pageName+"': the page does not exist");
		} else if (item.fd === null) {
			throw new Error(functionName+"page name '"+pageName+"': the page file is not open");
		} else {
			try {
				fs.writeSync(item.fd, text);
			} catch (e) {
				throw new Error(functionName+e.message);
			}
		}
	}
}
