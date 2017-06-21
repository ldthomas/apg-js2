**apg** Release Notes
==================
**v3.2.0**<br>
There are no feature or usage changes from v3.0.1.

The major change is that the GUI generator **apg.html** has been updated and improved with a major new feature, a graphical display of the parse tree. 
Consequently, it has been moved into its own [repository](https://github.com/ldthomas/apg-html).

**apg** v3.2.0 remains split into two repositories. **apg** and [**apg-api**](https://github.com/ldthomas/apg-js2-api). All of the functionality has been moved into an API. **apg** is now nothing more than an I/O shell that reads the SABNF grammar,
generates a grammar object with the API, and writes the grammar object constructor function.
This accomplishes two goals. a) it provides much more flexible access to the underlying generation operations and b) it removes all I/O from the API. The node.js "fs" module is incompatible with some development frameworks.
