##JavaScript APG

**Version:**  2.0

**Description:**  

**APG** is an acronym for "ABNF Parser Generator". Version 2.0 is a complete re-write of version 1.0 (<a href="https://github.com/ldthomas/apg-js">apg-js</a>)with the following objectives in mind:
<ol>
<li>Updating its features to the full <a href="https://github.com/ldthomas/apg-6.3">apg-6.3</a> and <a href="https://github.com/ldthomas/apg-java">apg-java</a> complement.</li>
<li>Creating a local version of the parser generator as well as the parsing library (version 1.0 was library only).</li>
<li>Developing it in the node.js framework.</li>
</ol>

Its features include:

<ul>
<li>generates language parsers and translators from a superset of the Augmented Backus-Naur Form (ABNF <a href="https://tools.ietf.org/html/rfc5234">RFC5234</a>) grammar syntax</li>
<li>accepts valid ABNF grammars</li>
<li>use of callback functions keeps the parser's action code separate from the grammar</li>
<li>accepts <code>AND</code> & <code>NOT</code> syntactic predicate operators for conditional parsing based on specified, look-ahead phrases</li>
<li>accepts User-Defined Terminals (UDTs) which provide user-written, non-Context-Free phrase recognition operators</li>
<li>user-written callback functions provide complete monitoring and flow control of the parser</li>
<li>optional generation of an Abstract Syntax Tree (AST)</li>
<li>translation of the AST with user-written callback functions</li>
<li>XML formatting of the AST</li>
<li>extensive tracing facilities</li>
<li>statistics gathering for a full picture of parse tree node coverage</li>
<li>extensive attribute generation for an overview of the grammar's characteristics</li>
<li>runs as a node.js, desktop cli function</li>
</ul>

**Installation:**  
*Requires node.js and npm*

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

`JavaScript APG 2.0, Copyright (C) 2105 Lowell D. Thomas, all rights reserved`

Note: If there is a name conflict (for example, Automated Password Generator) there are a couple of options for
resolving the conflict.
<ol>
<li>Make sure that the npm prefix (<code>npm prefix -g</code>) is left-most in the $PATH variable and clear the cache with
<br><code>hash -r</code></li>
<li>If the npm prefix is, say, <code>/my/npm/prefix</code>, create an alias<br>
<code>alias apg='/my/npm/prefix/bin/apg'</code></li>
<li>You probably know other ways to do it better to your suiting.</li>
</ol>

apg is meant to be installed globally and used as a command line application.
However, if you want a local copy you can use it as follows.
```
mkdir mylocal
cd mylocal
npm install apg
cd node_modules/apg
```
To run the locally installed copy:<br>
`node main.js args`<br>

To generate a local copy of the documentation:<br>
`npm install -g docco` (if not already installed)<br>
`./docco-gen`<br>
Click on `./docs/index.html` to get started.

**Examples:**  
See <a href="https://github.com/ldthomas/apg-js2-examples">apg-js2-examples</a> for examples of running JavaScript APG 2.0 and the parsers it generates.
  
**Documentation:**  
The documentation is in the code in [`docco`](https://jashkenas.github.io/docco/) format.
To generate the documentation, from the package directory:
```
npm install -g docco
./docco-gen
```
View `docs/index.html` in any web browser to get started.
Or view it on the [APG website](http://coasttocoastresearch.com/docjs2/apg/index.html)

**Copyright:**  
  *Copyright &copy; 2015 Lowell D. Thomas, all rights reserved*  

**License:**  
Unlike all previous releases of **APG**, JavaSript APG, Version 2.0 is released with the more permissive BSD-3-Clause license.
      
