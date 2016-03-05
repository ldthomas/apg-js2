//Execute apg from a local installation. e.g.<br>
//```
//mkdir mylocal
//cd mylocal
//npm install apg
//cd node_modules/apg
//node main.js args
//```
//
//Not used by the global installation.
/*
 * COPYRIGHT: Copyright (c) 2016 Lowell D. Thomas, all rights reserved
 *   LICENSE: BSD-3-Clause
 *    AUTHOR: Lowell D. Thomas
 *     EMAIL: lowell@coasttocoastresearch.com
 *   WEBSITE: http://coasttocoastresearch.com/
 */
(function() {
  "use strict";
  /* remove the first two arguments node.js arguments */
  require("./src/apg.js")(process.argv.slice(2));
})();
