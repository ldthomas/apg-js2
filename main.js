//Execute apg from a local installation. e.g.<br>
//```
//mkdir mylocal
//cd mylocal
//npm install apg
//cd node_modules/apg
//node main.js args
//```
//
//Not used by the global installation (recommended).
(function(){
	"use strict";
	/* remove the first two arguments node.js arguments */
	require("./src/apg.js")(process.argv.slice(2));
})();
