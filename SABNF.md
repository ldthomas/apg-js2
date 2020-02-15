# Superset Augmented Backus-Naur Form (SABNF)

Augmented Backus-Naur Form (ABNF) is a grammar syntax used to describe many, if not most, Internet technical specifications.
It is so commonly used that the [IETF](https://www.ietf.org/) has standardized it with
[RFC 5234](https://tools.ietf.org/html/rfc5234)
and recently updated it with [RFC 7405](https://tools.ietf.org/html/rfc7405).
**APG** was originally developed to generate parsers directly from ABNF syntax.
It has since grown to include additional features and the syntax for those features generate additional syntax elements creating a "superset" of ABNF or SABNF.
The RFC documents are concise and easy to follow and should be read as a prerequisite to the
additional superset features described here. However, a brief synopsis of ABNF will be given here as a basis
for the superset features description. If there is any descrepancy between what is said here and in the RFCs,
the RFCs naturally prevail.

## ABNF

ABNF is a syntax to describe phrases, a phrase being any string of integer character codes.
Because the character codes so often represent the [ASCII](http://www.asciitable.com/) character set there are special
ABNF features to accommodate an easy description of ASCII strings. However, the meaning and range of the
character code integers are entirely up to the user.
The complete ABNF syntax description of a phrase
is called a grammar and the terms "grammar" and "ABNF syntax" will be used synonymously here.

**Rules:**  
Phrases are described with named rules. A rule name is alphanumeric with hyphens allowed after the first character.
A rule definition   has the form:
```
name = elements CRLF
```
where the equal sign, `=`, separates the name from the phrase definition.
Elements are made up of terminals, operators and other rule names, as described below.
Each rule must end with a carriage return, line feed combination, CRLF.
Each line must begin in the first column (see restrictions below).
A rule definition may be continued with continuation lines, each of which begins with a space or tab.

**Terminals:**  
Rules resolve into a string of terminal character codes. These can be represented explicitly with terminal characters.
```
%d32     - represents the decimal integer character code 32
%x20     - represents the hexidecimal integer character code 20 or decimal 32
%b100000 - represents the binary integer character code 100000 or decimal 32 
```
Strings of character codes are represented with a dotted format.
```
%d13.10     - represents the line ending character string CRLF.
%x0D.0A     - represents the line ending character string CRLF. 
%b1101.1010 - represents the line ending character string CRLF. 
```
A range of character codes can be represented with a hyphenated notation.
```
%d48-57         - represents any single character code in the decimal range 48 through 57
                  that is, any ASCII digit 0, 1, 2, 3 ,4, 5, 6, 7, 8 or 9
%x30-39         - represents any single character code in the hexidecimal range 30 through 39
                  (also any ASCII digit)
%b110000-111001 - represents any single character code in the binary range 110000 through 111001
                  (also any ASCII digit)
```
Because of their frequency of use, there is also a notation for literal strings of printing, 7-bit ASCII characters.
```
"ab"   - represents the case-insensitive string "ab" and would match 
         %d97.98, %d65.98, %d97.66 or %d65.66 ("ab", "Ab", "aB" or "AB")
%i"ab" - defined in RFC 7405, is a case-insensitive literal string (identical to "ab")
%s"ab" - defined in RFC 7405, is a case-sensitive literal string (identical to %d97.98)  
```
*Note1: The empty literal string, `""`, defines an empty string phrase and in this implementation it is the only allowed definition.*  
*Note2: Tab characters are not allowed in quoted, literal strings.*

**Operators:**  
*concatenation:*  
A space between elements in a rule definition represents a concatenation of the two elements.
For example, consider the two rules,
```
AB1 = "a" "b" CRLF
AB2 = "ab" CRLF
```
The space between the two elements `"a"` and `"b"` acts as a concatenation operator.
The effect in this case is that rule `AB1` defines the same phrase as rule `AB2`.  

*alternation:*  
The forward slash, `/`, is the alternation operator. The rule
```
AB = "a" / "b" CRLF
```
would match either the phrase `a` or the phrase `b`.
  
*repetitions:*  
An element modifier of the general form `n*m (0 <= n <= m)` can be used to indicate a repetition of the element
a minimum of `n` times and a maximum of `m` times. For example, the grammar
```
number = 2*3digit CRLF
digit  = %d48-57  CRLF
```
would define a phrase that could be any number with 2 or 3 ASCII digits.
There are a number of shorthand variations of the repetition operator.
```
*  = 0*infinity (zero or more repetitions)
1* = 1*infinity (one or more repetitions)
*1 = 0*1 (zero or one repetitions, optional)
2  = 2*2 (exactly two repetitions)
```
<i>Note: <code>0*0</code> is not allowed and a syntax error will be generated. The only way to explicitly
define an empty string is with the literal string operator, <code>""</code>.</i>

**Groups:**  
Elements may be grouped with enclosing parentheses. Grouped elements are then treated as a single element
within the full context of the defining rule. Consider,
```
phrase1 = elem (foo / bar) blat CRLF
phrase2 = elem foo / bar blat CRLF
phrase3 = (elem foo) / (bar blat) CRLF
```
`phrase1` matches `elem foo blat` or `elem bar blat`, whereas `phrase2` matches `elem foo` or `bar blat`.
A word of caution here. Concatenation has presidence over (tighter binding than) alternation so that `phrase2`
is the same as `phrase3` and not `phrase1`.
It can be confusing. Use parentheses liberally to keep the grammar meaning clear. 

**Optional Groups:**  
Elements grouped with square brackets, `[]`, are optional groups. Consider,
```
phrase1 = [elem foo] bar blat CRLF
phrase2 = 0*1(elem foo) bar blat CRLF
```
Both phrases are identical and will match either `elem foo bar blat` or `bar blat`.

**Comments:**  
Comments begin with a semicolon, `;`, and continue to the end of the current line.
For example, in the following rule definition, everything from the semicolon to CRLF is considered white space.
```
phrase = "abc"; any comment can go here   CRLF
```
In this implementation empty lines and comment-only lines are accepted as white space,
but any line beginning with one or more space/tab characters and having text not beginning
with a semicolon will be rejected as an ABNF syntax error.
Consider the lines,
```
1:CRLF
2:    CRLF
3:;comment CRLF
4:     ; comment CRLF
5:   comment CRLF
```
Lines `1:` through `4:` are valid blank lines. Line `5:` would be regarded as a syntax error.  

**Bringing it all together now:**  
Here is an example of a complete ABNF grammar representing the general definition of a floating point number.
```
float    = [sign] decimal [exponent]
sign     = "+" / "-"
decimal  = integer [dot [fraction]]
           / dot fraction
integer  = 1*%d48-57
dot      = "."
fraction = 1*%d48-57 
exponent = "e" [esign] exp
esign    = "+" / "-"
exp      = 1*%d48-57
```

## SABNF Restrictions

Before getting into the additional features of the superset, there are a couple of minor
restrictions/changes to the strict ABNF that need to be mentioned.  

**Indentations:**  
RFC 5234 specifies that a rule may begin in any column, so long as all rules begin in the same column.
SABNF requires each rule to begin in column 0 (the first column of the line.)

**Line Endings:**  
RFC 5234 specifies that a line ending must be the carriage return/line feed pair, CRLF.
SABNF relaxes that and accepts CRLF, LF or CR as a valid line ending.

**Prose Values:**  
RFC 5234 defines a `prose-val` operator, `<any text>`. This, as they point out, is a last resort
to describe the phrase in the ordinary prose of a spoken language.
The SABNF parser will recognize this as valid ABNF, but obviously cannot generate parser code from it.

## SABNF Features

**User-Defined Terminals:**  
In addition to the ABNF terminals above, **APG** allows for User-Defined Terminals (UDT).
These allow the user to write any phrase he or she chooses as a code snippet. The syntax is,
```
phrase1 = u_non-empty CRLF
phrase2 = e_possibly-empty CRLF 
```
UDTs begin with `u_` or `e_`. The underscore is not used in the ABNF syntax, so the parser can easily
distinguish between UDT names and rule names. The difference between the two forms is that a UDT that
begins with `u_` may not return an empty phrase. If it does the parser will throw an exception.
Only if the UDT name begins with `e_` is an empty phrase return accepted. The difference has to do with
the [rule attributes](https://github.com/ldthomas/apg-js2-api/blob/master/src/attributes.js) and will not be discussed here further.

Note that even though UDTs are terminal phrases, they are also named phrases and share some of the named-phrase
qualities with rules. Also, UDTs were introduced to **APG** prior to publication of RFC 7405, otherwise
some kind of `%u` or `%e` type of notation might have been used for better consistency.

**Look Ahead:**  
The look ahead operators are modifiers like repetitions. They are left of and adjacent to the phrase
that they modify.
```
phrase1 = &"+" number CRLF
phrase2 = !"+" number CRLF
number  = ("+" / "-") 1*%d48-75 CRLF
```
`phrase1` uses the positive look ahead operator. If `number` begins with a `"+"` then `&"+"` returns the
empty phrase and parsing continues. Otherwise, `&"+"` return failure and `phrase1` fails to find a match.
`phrase2` uses the negative look ahead operator. It works just as described above except that it succeeds if
`"+"` is *not* found and fails if it is.

As far as I can tell, the positive look ahead operator was first introduced by Parr and Quong and the negative
form added by Bryon Ford with Parsing Grammar Expressions (PEG). In those contexts the term "syntactic predicate" was used. A good discussion of this with the original references can be found in this 
[Wikipedia article.](https://en.wikipedia.org/wiki/Syntactic_predicate)

**Look Behind:**  
The look behind operators are   modifiers very similar to the look ahead operators, the difference, as the name implies, is that they operate on phrases behind the current string index instead of ahead of it.
```
phrase1 = any-text &&line-end text CRLF
phrase2 = any-text !!line-end text CRLF
text = *%d32-126 CRLF
any-text = *(%d10 / %d13 / %d32-126) CRLF
line-end = %d13.10 / %d10 / %d13 CRLF
```
`phrase1` will succeed only if `text` is preceded by a `line-end`.
`phrase2` will succeed only if `text` is *not* preceded by a `line-end`.

There is one big caveat to using look behind. When parsing the phrase modified by the look behind operator,
`line-end` in the cases above, the **APG** parser actually parses right-to-left.
The parser works in this direction for all of the primary operators but may not work for all
rules or UDTs. If needed, special rules can be written to work in look behind mode and an example of
that is given in the [examples](https://github.com/ldthomas/apg-js2-examples/tree/master/look-behind).
Also, there is a flag available to the author of UDTs and they
could also be written to work in look behind mode. However, as a general practice, it is safest
to assume that rules and UDTs do not work right-to-left and avoid the use of them altogether in look behind phrases.

**Back References:**  
Back references are strings to be matched just like literal strings. The difference being that literal
strings are predefined in the grammar syntax and back reference strings are defined with a previous
rule name or UDT match.
```
phrase1 = A \A CRLF
phrase2 = A \%iA CRLF
phrase3 = A \%sA CRLF
phrase4 = u_myudt \u_myudt
A       = "abc" / "xyz" CRLF
```
The back reference, `\A` will attempt a case-insensitive match to whatever phrase was matched by A.
(The notation works equally for rule names and UDT names.)
Therefore, `phrase1` would match `abcabc` or `abcABC`, etc., but not `abcxyz`. The `%i` and `%s` notation
is used to indicate case-insensitive and case-sensitive matches, just as specified in RFC 7405
for literal strings. Therefore, `phrase3` would match `xYzxYz` but not `xYzxyz`.

Besides case sensitivity, there are two other forms of back references - "universal" mode and
"parent frame" mode. The difference between them comes down to *where* in the grammar the rule being
back referenced was matched. This is most easily explained with an example.
```
root = "a" one "a"       CRLF
one  =  X  two \%uX \%pX CRLF
two  =  X  "2"           CRLF
X    = "x" / "y"         CRLF
```
Note that rule `X` is matched twice, once in rule `one` and once in rule `two`.
In universal mode, `\%uX` refers to the last match to `X` anywhere (universally) in the grammar.
In parent frame mode, `\%pX` refers to the last match in its parent rule call frame. For example,
in the above example, the following phrases would match.
```
axy2yxa
ayy2yya
ayx2xya
```
But the following phrases would not.
```
axy2yya
ayy2xya
ayx2xxa
```
Practically speaking, when a back referenced rule is matched the phrase is stored in two places.
Once in a single, universal object and again in the parent rule call stack frame.
`\%uX` will always refer to the last phrase saved in the universal object.
`\%pX` will always refer to the last phrase saved in the parent rule call stack frame.

Case insensitive and universal mode are the defaults unless otherwise specified.
The complete set of back references with modifiers is:
```
\A     = \%iA   = \%uA = \%i%uA = \%u%iA
\%sA   = \%s%uA = \%u%sA
\%pA   = \%i%pA = \%p%iA
\%s%pA = \%p%sA
```
It is well known that recursion can be used to match pairs of opening and closing HTML tags,
but by using parent frame mode back references, it is also possible to match the tag names.
An example of this is in the [examples](https://github.com/ldthomas/apg-js2-examples/tree/master/back-reference).

**Anchors:**  
Primarily to aid the new pattern matching engine
[`apg-exp`](https://github.com/ldthomas/apg-js2-exp), SABNF includes two specific anchors, the beginning
and ending of a string.
```
phrase1 = %^ text     CRLF
phrase2 = text %$     CRLF
phrase3 = %^ "abc" %$ CRLF
text    = *%d32-126   CRLF 
```
Anchors match a location, not a phrase. `%^` returns an empty string match if the input string character index
is zero and fails otherwise. Likewise, `%$` returns an empty string match if the input string character index
equals the string length and fails otherwise. The leading `%` is taken from the RFC 7405 syntax for modifying
literal strings, and the `^` and `$` characters have been chosen to be similar to their familiar `regex` counterparts.

In the examples above, `phrase1` will match `text` only if it starts at the beginning of the string.
`phrase2` will match `text` only if it ends at the end of a string. `phrase3` will match `abc`
only if it is the entire string. This may seem self evident in this context, but the latest version
of **APG** allows parsing of sub-strings of the full input string. This is a critical feature
in the `apg-exp` pattern matching application. When parsing sub-strings it may not always be known
programmatically whether a phrase is at the beginning or end of a string.

**Case-Sensitive Strings:**  
SABNF allows case-sensitive strings to be defined with single quotes.
```
phrase1 = 'abc'      CRLF
phrase2 = %s"abc"    CRLF
phrase3 = %d97.98.99 CRLF
```
All three of the above phrases defined the identical, case-sensitive string `abc`. The single-quote
notation for this was introduced in SABNF prior to publication of RFC 7405, or prior to my knowledge of it in any case.
The SABNF single-quote notation is kept for backward compatibility.

## ABNF for SABNF

RFC 5234 defines the ABNF syntax for the ABNF syntax. While this may seem paradoxical, it makes sense when you realize that a parser generator is a parser whose semantic phase generates a parser. In this case, both the parser of the generator and the parser it generates are defined with an ABNF syntax. Confusing? Here is what the ABNF (no superset features required) for SABNF looks like. It is more elaborate than that given in RFC 5234 partially because of the extra features but mostly because many "error" rules have been added so that the parser can catch input errors and report them rather than just fail to parse correctly. The latest version can always be found [here](https://github.com/ldthomas/apg-js2/blob/master/resources/abnf-for-sabnf-grammar.bnf).
```
File            = *(BlankLine / Rule / RuleError)
BlankLine       = *(%d32/%d9) [comment] LineEnd
Rule            = RuleLookup owsp Alternation ((owsp LineEnd)
                / (LineEndError LineEnd))
RuleLookup      = RuleNameTest owsp DefinedAsTest
RuleNameTest    = RuleName/RuleNameError
RuleName        = alphanum
RuleNameError   = 1*(%d33-60/%d62-126)
DefinedAsTest   = DefinedAs / DefinedAsError
DefinedAsError  = 1*2%d33-126
DefinedAs       = IncAlt / Defined
Defined         = %d61
IncAlt          = %d61.47
RuleError       = 1*(%d32-126 / %d9  / LineContinue) LineEnd
LineEndError    = 1*(%d32-126 / %d9  / LineContinue)
Alternation     = Concatenation *(owsp AltOp Concatenation)
Concatenation   = Repetition *(CatOp Repetition)
Repetition      = [Modifier] (Group / Option / BasicElement / BasicElementErr)
Modifier        = (Predicate [RepOp])
                / RepOp
Predicate       = BkaOp
                / BknOp
                / AndOp
                / NotOp
BasicElement    = UdtOp
                / RnmOp
                / TrgOp
                / TbsOp
                / TlsOp
                / ClsOp
                / BkrOp
                / AbgOp
                / AenOp
                / ProsVal
BasicElementErr = 1*(%d33-40/%d42-46/%d48-92/%d94-126)
Group           = GroupOpen  Alternation (GroupClose / GroupError)
GroupError      = 1*(%d33-40/%d42-46/%d48-92/%d94-126) ; same as BasicElementErr
GroupOpen       = %d40 owsp
GroupClose      = owsp %d41
Option          = OptionOpen Alternation (OptionClose / OptionError)
OptionError     = 1*(%d33-40/%d42-46/%d48-92/%d94-126) ; same as BasicElementErr
OptionOpen      = %d91 owsp
OptionClose     = owsp %d93
RnmOp           = alphanum
BkrOp           = %d92 [bkrModifier] bkr-name
bkrModifier     = (cs [um / pm]) / (ci [um / pm]) / (um [cs /ci]) / (pm [cs / ci])
cs              = '%s'
ci              = '%i'
um              = '%u'
pm              = '%p'
bkr-name        = uname / ename / rname
rname           = alphanum
uname           = %d117.95 alphanum
ename           = %d101.95 alphanum
UdtOp           = udt-empty
                / udt-non-empty
udt-non-empty   = %d117.95 alphanum
udt-empty       = %d101.95 alphanum
RepOp           = (rep-min StarOp rep-max)
                / (rep-min StarOp)
                / (StarOp rep-max)
                / StarOp
                / rep-min-max
AltOp           = %d47 owsp
CatOp           = wsp
StarOp          = %d42
AndOp           = %d38
NotOp           = %d33
BkaOp           = %d38.38
BknOp           = %d33.33
AbgOp           = %d37.94
AenOp           = %d37.36
TrgOp           = %d37 ((Dec dmin %d45 dmax) / (Hex xmin %d45 xmax) / (Bin bmin %d45 bmax))
TbsOp           = %d37 ((Dec dString *(%d46 dString)) / (Hex xString *(%d46 xString)) / (Bin bString *(%d46 bString)))
TlsOp           = TlsCase TlsOpen TlsString TlsClose
TlsCase         = ["%i" / "%s"]
TlsOpen         = %d34
TlsClose        = %d34
TlsString       = *(%d32-33/%d35-126/StringTab)
StringTab       = %d9
ClsOp           = ClsOpen ClsString ClsClose
ClsOpen         = %d39
ClsClose        = %d39
ClsString       = *(%d32-38/%d40-126/StringTab)
ProsVal         = ProsValOpen ProsValString ProsValClose
ProsValOpen     = %d60
ProsValString   = *(%d32-61/%d63-126/StringTab)
ProsValClose    = %d62
rep-min         = rep-num
rep-min-max     = rep-num
rep-max         = rep-num
rep-num         = 1*(%d48-57)
dString         = dnum
xString         = xnum
bString         = bnum
Dec             = (%d68/%d100)
Hex             = (%d88/%d120)
Bin             = (%d66/%d98)
dmin            = dnum
dmax            = dnum
bmin            = bnum
bmax            = bnum
xmin            = xnum
xmax            = xnum
dnum            = 1*(%d48-57)
bnum            = 1*%d48-49
xnum            = 1*(%d48-57 / %d65-70 / %d97-102)
;
; Basics
alphanum        = (%d97-122/%d65-90) *(%d97-122/%d65-90/%d48-57/%d45)
owsp            = *space
wsp             = 1*space
space           = %d32
                / %d9
                / comment
                / LineContinue
comment         = %d59 *(%d32-126 / %d9)
LineEnd         = %d13.10
                / %d10
                / %d13
LineContinue    = (%d13.10 / %d10 / %d13) (%d32 / %d9)
```
