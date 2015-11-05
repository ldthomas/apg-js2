**Annotated Table of Contents**

0. The GitHub & npm README page.
> [README.md](./README.html)

1. The main or driver program. Controls the flow and error reporting, calling other modules to do the work.
> [apg.js](./apg.html)<br>
> [main.js](./main.html)

2. Read the command line arguments and convert them into a configuration object.
> [arg-string-parser.js](./arg-string-parser.html)<br>
> [file-content-parser.js](./file-content-parser.html)<br>
> [config.js](./config.html)<br>
> [command-line.js](./command-line.html)<br>

3. Opens the output HTML files. Except for the immediate action arguments, `--help`, `--version`, `--CRLF` and `--LF`,
all generator output is written as HTML pages in the directory specified by the `--HTML` argument (default `./html`)
> [html-files-sources.js](./html-files-sources.html)<br>
> [html-files.js](./html-files.html)

4. Read and verify the input grammar. Validates the character set and line ends.
Creates a catalog (array of objects) of the grammar file lines.
Converts line ends if requested by the `--CRLF` or `--LF` arguments.
> [input-analysis-parser.js](./input-analysis-parser.html) 

5. Parse the input grammar. The syntax phase will check the grammar for syntax errors.
The semantic phase will generate rule and opcode arrays if no further errors are detected.
Generates the grammar object as a `node.js` module and writes it to the file designated by the `--JavaScript` argument.
See the `./html/grammar.html` output page for results.
>[syntaxcallbacks.js](./syntax-callbacks.html)<br>
>[semantic-callbacks.js](semantic-callbacks.html)<br>
>[abnf-for-sabnf-parser.js](abnf-for-sabnf-parser.html)

6. Determine the grammar's attributes.
>[attributes-recursive.js](./attributes-recursive.html)<br>
>[attributes-non-recursive.js](./attributes-non-recursive.html)<br>
>[attribute-types.js](./attribute-types.html)<br>
>[attributes.js](./attributes.html)
