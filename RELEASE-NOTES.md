## **apg** Release Notes
**v3.1.0**<br>
There are no feature or usage changes from v3.0.0.
However, there has been a major restructuring of the underlying code.
**apg** has been split into two repositories. **apg** and [**apg-api**](https://github.com/ldthomas/apg-js2-api).
All of the functionality has been moved into an API.
**apg** is now nothing more than an I/O shell that reads the SABNF grammar,
generates a grammar object with the API, and writes the grammar object constructor function.
This accomplishes two goals. a) it provides much more flexible access to the underlying generation operations
and b) it removes all I/O from the API. The node.js "fs" module is incompatible with some development frameworks.

**v3.0.0**
* The **apg** command line has been greatly simplified.
* Command line **apg** has only console output. It no longer generates any HTML.
* A GUI generator, **apg.html**, has been added.
* **apg.html** is a self-contained, stand-alone, web-page interface to **apg**.
* It does not load any external CSS, JavaScript or other resources.
* It provides detailed information about the grammar and generated parser.
* It allows testing of the generated parser.
* It is a visual aid to writing [SABNF](https://github.com/ldthomas/apg-js2/blob/master/SABNF.md) grammars
and the input strings or sentences that they are designed to accept.
* Documentation for using **apg.html** is built in. Just click the 'Help' tab.

<i>NOTE: **apg.html** was developed in Chrome 56 and tested in Firefox 51. It does not work in Internet Explorer.</i> 
