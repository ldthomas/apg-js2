# JavaScript APG

> _**Deprecated** Use the updated version [**apg-js**](https://github.com/ldthomas/apg-js) instead._

_See [release notes](https://github.com/ldthomas/apg-js2/blob/master/RELEASE-NOTES.md)_

### Description

**APG** is an acronym for "ABNF Parser Generator". Originally written to generate parsers directly from ABNF syntax ([RFC 5234](https://tools.ietf.org/html/rfc5234)) it has since grown to include a number of additional features requiring additional syntax terms. The resulting syntax is a superset of ABNF or [SABNF](https://github.com/ldthomas/apg-js2/blob/master/SABNF.md). Some features have been primarily developed to support the new [**apg-exp**](https://github.com/ldthomas/apg-js2-exp) pattern-matching application. A general description of how **APG** works can be found on the [APG website](https://sabnf.com/).

### **apg-exp** features

<ul>
<li>
Sub-string parsing - the option to parse only a sub-string of the entire input string. 
</li>
<li>
Positive and negative look around - the ability to look ahead <i>or behind</i> in the string to make parsing decisions based on what is or isn't found.
</li>
<li>
Back referencing - phrase matching based on phrases previously matched to other rules or UDTs.
</li>
<li>
Beginning and ending of string anchors - parsing decisions based on whether or not the sub-string includes the beginning and/or the ending of the full input string. 
</li>
<li>
Statistics and limits on the node tree depth and hit count. Recursive-descent parsers can have exponential parsing times for some grammars. Limits can be set to prevent run-away parsing. 
</li>
</ul>
  
#### Other features:  
<ul>
<li>User-Defined Terminals (UDTs). These are user-written code snippets for matching phrases that are difficult or impossible to define with the SABNF syntax. They make for an effectively Turing complete parser.</li>
<li>The use of callback functions to keep the parser's action code separate from the grammar.
User-written callback functions provide complete monitoring and flow control of the parser.</li>
<li>
Generation of Abstract Syntax Trees (ASTs) with optional XML formatting.
</li>
<li>
Translation of the AST with user-written callback functions.
</li>
<li>Extensive tracing facility with updated output formatting for easier interpretation.</li>
<li>Statistics gathering for a full picture of parse tree node coverage.</li>
<li>Extensive attribute generation for an overview of the grammar's characteristics.</li>
<li><b>APG</b> and its parsers run as <a = href="https://nodejs.org/en/">node.js</a>, desktop cli functions.</li>
<li>
Parsers can easily be used in web page applications with tools such as <a href="http://browserify.org/">browserify</a>.
</li>
</ul>

More complete explanations of these features can be found in the
[SABNF](https://github.com/ldthomas/apg-js2/blob/master/SABNF.md) documentation, in the code file documentation and the [examples](https://github.com/ldthomas/apg-js2-examples).

#### Installation

For command line usage:

```
git clone https://github.com/ldthomas/apg-js2.git apg
cd apg
npm install -g ./
apg -v
```

or just

```
npm install -g apg
apg -v
```

You should see something like:

`JavaScript APG, version 3.0.0, Copyright (C) 2017 Lowell D. Thomas, all rights reserved`

Note: If there is a name conflict on your system
(for example, Automated Password Generator) there are a couple of options for
resolving the conflict.

<ol>
<li>Make sure that the npm prefix (<code>npm prefix -g</code>) is left-most in the $PATH variable and clear the cache with
<br><code>hash -r</code></li>
<li>If the npm prefix is, say, <code>/my/npm/prefix</code>, create an alias<br>
<code>alias apg='/my/npm/prefix/bin/apg'</code></li>
</ol>

For the GUI version:

```
git clone https://github.com/ldthomas/apg-js2.git apg
cd apg
(double click the apg.html file)
```

#### Examples

See <a href="https://github.com/ldthomas/apg-js2-examples">apg-js2-examples</a> for examples of running JavaScript APG and the parsers it generates.

#### Documentation

The documentation is in the code in [`docco`](https://jashkenas.github.io/docco/) format.
To generate the documentation, from the package directory:

```
npm install -g docco
./docco-gen
```

View `docs/index.html` in any web browser to get started.
Or view it on the [APG website](https://sabnf.com/)

##### Copyright

_Copyright &copy; 2017 Lowell D. Thomas, all rights reserved_

##### License

Released with the BSD-3-Clause license.
