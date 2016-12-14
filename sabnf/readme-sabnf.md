#Directory Information

The ABNF grammar files in this directory define the four (4) **APG** parsers that are used by **APG** to do its work. While this may appear to be a catch-22 conflict, it actually works quite smoothly.

**APG** is an ABNF Parser Generator. It works by parsing an ABNF input grammar and producing an JavaScript object that, working with the **APG** library, [apg-lib](https://github.com/ldthomas/apg-js2-lib), can parse strings that match those defined by the input grammar. While its function is to generate parsers, it is, itself, a parser. This parser could be of any sort, but it is, in fact, itself, an **APG** parser requiring its own ABNF grammar definition. 

Within **APG** there are actually four (4) **APG** parsers, each with its own ABNF grammar.

* abnf-for-sabnf-grammar.bnf - This is the ABNF grammar definition of the Superset ABNF ([SABNF](https://github.com/ldthomas/apg-js2/blob/master/SABNF.md)) that defines **APG**.
* arg-string-grammar.bnf - The command line processor parses the input arguments to build a configuration file. This is the grammar that defines the format of the expected command line arguments.
* file-content-grammar.bnf - A command line argument may specify a file containing further arguments. This is the grammar that defines the format of the expected content of such a file.
* input-analysis-grammar.bnf - The first step that **APG** takes is to analyze the input grammar to validate that it does not have non-ASCII characters, that all lines have proper line endings and to map the lines and line endings to their character indexes. This analysis is done with an **APG** parser defined by this ABNF grammar.


> Written with [StackEdit](https://stackedit.io/).