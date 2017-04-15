// This module processes the command line arguments into a completed configuration
// and returns a `config` object.
// It takes the  `node` command line arguments less the first two. e.g. `process.argv.slice(2)`
// and can be a free mix of keys and key/value pairs.
// ````
// -h, --help                 : print this help screen
// -v, --version              : display version information
// -s, --strict               : only ABNF grammar (RFC 5234 & 7405) allowed, no Superset features
// -i <path>[,<path>[,...]]   : input file(s)*
// --in=<path>[,<path>[,...]] : input file(s)*
// -o <path>                  : output filename**
// --out=<path>               : output filename**
//
// Options are case insensitive.
// *  Multiple input files allowed.
//    Multiple file names must be comma separated with no spaces.
//    File names from multiple input options are concatenated.
//    Content of all resulting input files is concatenated.
// ** Output file name is optional.
//    If no output file name is given, it is generated from the first input file name.
//    Input file name is stripped of extension, if any, and the extention ".js" is added.
// ````
module.exports = function(args){
  "use strict";
  var helpScreen = function(args){
    var help = "Usage: apg options\n";
    var options = "";
    args.forEach(function(arg){options += arg + " "});
    help += "options: "+ options + "\n";
    help += "-h, --help                 : print this help screen\n";
    help += "-v, --version              : display version information\n";
    help += "-s, --strict               : only ABNF grammar (RFC 5234 & 7405) allowed, no Superset features\n";
    help += "-i <path>[,<path>[,...]]   : input file(s)*\n";
    help += "--in=<path>[,<path>[,...]] : input file(s)*\n";
    help += "-o <path>                  : output filename**\n";
    help += "--out=<path>               : output filename**\n";
    help += "\n";
    help += "Options are case insensitive.\n";
    help += "*  Multiple input files allowed.\n";
    help += "   Multiple file names must be comma separated with no spaces.\n";
    help += "   File names from multiple input options are concatenated.\n";
    help += "   Content of all resulting input files is concatenated.\n";
    help += "** Output file name is optional.\n";
    help += "   If no output file name is given, it is generated from the first input file name.\n";
    help += '   Input file name is stripped of extension, if any, and the extention ".js" is added.\n';
    return help;
  }
  var version = function(){
    var v = "";
    v  = "JavaScript APG, version 3.0.0, Copyright (C) 2017 Lowell D. Thomas, all rights reserved\n";
    v += "    http://coasttocoastresearch.com/\n";
    v += "    https://github.com/ldthomas/apg-js2\n";
    v += "    https://www.npmjs.com/package/apg\n";
    return v;
  }
  var fs = require("fs");
  var path = require("path");
  var converter = require("apg-conv-api").converter;
  var STRICTL = "--strict";
  var STRICTS = "-s";
  var HELPL = "--help";
  var HELPS = "-h";
  var VERSIONL = "--version";
  var VERSIONS = "-v";
  var INL = "--in";
  var INS = "-i";
  var OUTL = "--out";
  var OUTS = "-o";
  var inFilenames = [];
  var config = {
      help: "",
      version: "",
      error: "",
      strict: false,
      src: null,
      outFilename: "",
      outfd: process.stdout.fd
  }
  var key, value;
  var i = 0;
  try{
    while( i < args.length){
      var kv = args[i].split("=");
      if(kv.length === 2){
        key = kv[0].toLowerCase();
        value = kv[1];
      }else if(kv.length === 1){
        key = kv[0].toLowerCase();
        value = (i + 1 < args.length) ? args[i+1] : "";
      }else{
        throw new Error("command line error: ill-formed option: "+args[i]);
      }
      switch(key){
      case HELPL:
      case HELPS:
        config.help = helpScreen(args);
        return config
        break;
      case VERSIONL:
      case VERSIONS:
        config.version = version();;
        return config;
        break;
      case STRICTL:
      case STRICTS:
        config.strict = true;
        i += 1;
        break;
      case INL:
      case INS:
        if(!value){
          throw new Error("command line error: input file name has no value: "+args[i]);
        }
        inFilenames = inFilenames.concat(value.split(","));
        i += (key === INL) ? 1 : 2;
        break;
      case OUTL:
      case OUTS:
        if(!value){
          throw new Error("command line error: output file name has no value: "+args[i]);
        }
        config.outFilename = value;
        i += (key === OUTL) ? 1 : 2;
        break;
      default:
        throw new Error("command line error: unrecognized arg: "+args[i]);
        break;
      }
    }
    
    /* get the SABNF input */
    if(inFilenames.length === 0){
      throw new Error("command line error: no input file(s)");
    }
    
    var buf = Buffer.alloc(0);
    inFilenames.forEach(function(name){
      buf = Buffer.concat([buf, fs.readFileSync(name)]);
    });
    config.src = converter.decode("BINARY", buf);
    
    /* validate & open the output file */
    if(!config.outFilename){
      var info = path.parse(inFilenames[0]);
      if(info.ext === "js"){
        /* dumb input file name, but just in case */
        config.outFilename = inFilenames[0] + ".js";
      }else{
        if(info.dir){
          config.outFilename = info.dir + "/" + info.name + ".js";
        }else{
          config.outFilename = info.name + ".js";
        }
      }
    }
    config.outfd = fs.openSync(config.outFilename, "w");
  }catch(e){
    config.error = "CONFIG EXCEPTION: "+ e.message;
    config.help = helpScreen(args);
  }
  return config;
}
