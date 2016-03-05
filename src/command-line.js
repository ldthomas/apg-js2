// This module processes the command line arguments into a completed configuration
// and returns a `config` object.
// It takes the  `node` command line arguments less the first two. e.g. `process.argv.slice(2)`
// and can be a free mix of three types:
//  - flags
//  - values
//  - file names
//
// Flags are simply true/false values.
// Initially false, they are set to true if found one or more times in the argument list.
// They have short and long forms, e.g. `-h`, `--help`. Short forms may be compressed,
// e.g. `-sCL` would be the same as `-s -C -L`.
//
// Values are key/value pairs. They also have short and long forms,<br> e.g. `-js name`, `--JavaScript=name`.
// If a key appears more than once, only the last value will be retained, except for `--in`
// (see [config.js](config.html)).
//
// File name arguments, `@filename`, identify a file with all or some of the arguments.
// Files of arguments offer several advantages:
//    - long and complex arguments can be passed to the application easily and repeatedly
//    - arguments may appear on separate lines
//    - arguments can be documented with comments and spaced with blank lines
//
// The complete syntax of an argument file is:
// - arguments are tokens of printing characters (9, 32-126)
// - arguments are separated by spaces, tabs, comments or line ends
// - blank lines and comment lines allowed
// - comments begin with `#` and run to the end of the line
// - a line end can be a **CRLF** pair, a single **LF** or a single **CR**
// - tokens with spaces or tabs must be quoted ("ab c" or 'ab c')
// - quoted strings may have leading unquoted characters (abc"xyz")
// - quoted strings end with a matching quote or a line end ("abc def**LF**)
module.exports = function(commandlineArgs) {
  "use strict";
  var thisFileName = "command-line.js: ";
  var asp = new (require("./arg-string-parser.js"))();
  var fcp = new (require("./file-content-parser.js"))();
  var args, argString = "";
  var config;
  /* Generate a structured list of arguments with one argument per line */
  commandlineArgs.forEach(function(arg) {
    if (arg.charCodeAt(0) === 64) {
      /* If a file of arguments has been indicated, parse it here. */
      argString += fcp.parse(arg);
    } else {
      argString += arg + "\n";
    }
  });
  var tokens = argString.split("\n");
  var rx = new RegExp("\t");
  var errors = [];
  tokens.forEach(function(token) {
    if (rx.test(token)) {
      errors.push("tabs not allowed in command line arguments: '" + token + "';")
    }
  });
  if (errors.length > 0) {
    var msg = "command line errors:";
    errors.forEach(function(error) {
      msg += "\n" + error;
    });
    throw new Error(msg);
  }
  /* Parse the structured list of arguments to extract the configuration values. */
  config = asp.parse(argString);
  /* if the output file name is empty, use the first input file name, stripped of any extension */
  var replace = (config.vInput.length > 0) ? config.vInput[0].replace(/\.[^.$]+$/, '') : "";
  if (config.vJSLang === "") {
    config.vJSLang = replace;
  }
  if (config.vCLang === "") {
    config.vCLang = replace;
  }
  if (config.vCppLang === "") {
    config.vCppLang = replace;
  }
  if (config.vJavaLang === "") {
    config.vJavaLang = replace;
  }
  return config;
}
