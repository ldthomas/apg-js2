[<span style="font-size: 150%;font-weight:bold;">&#8962;</span> home](http://coasttocoastresearch.com/)

**Annotated Table of Contents**<br>
*JavaScript APG*

0. The GitHub & npm README page.
> [README.md](./README.html)

1. The main or driver program. Controls the flow and error reporting, calling other modules to do the work.
> [apg.js](./apg.html)<br>
> [main.js](./main.html)

2. Read the command line arguments and convert them into a configuration object.
> [command-line.js](./command-line.html)<br>

3. Read and verify the input grammar. Validates the character set and line ends.
Creates a catalog (array of objects) of the grammar file lines.
> [input-analysis-parser.js](./input-analysis-parser.html) 

4. Parse the input grammar. The syntax phase will check the grammar for syntax errors.
The semantic phase will generate rule and opcode arrays.
Generates the grammar object
>[abnf-for-sabnf-parser.js](abnf-for-sabnf-parser.html)<br>
>[syntax-callbacks.js](./syntax-callbacks.html)<br>
>[semantic-callbacks.js](semantic-callbacks.html)

5. Determine the grammar's attributes.
>[attributes.js](./attributes.html)<br>
>[attribute-types.js](./attribute-types.html)<br>
>[attributes-non-recursive.js](./attributes-non-recursive.html)<br>
>[attributes-recursive.js](./attributes-recursive.html)

6. Powers the **apg.html** web-page generator.
>[apgweb.js](./apgweb.html)<br>

5. Exports the internal workings of **apg**. Returned by `require("apg")`.
Used by [apg-exp](https://github.com/ldthomas/apg-js2-exp).
>[exports.js](./exports.html)<br>
