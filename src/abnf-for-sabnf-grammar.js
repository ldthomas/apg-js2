module.exports = function(){
"use strict";

    // SUMMARY
    //      rules = 78
    //       udts = 0
    //    opcodes = 307
    //        ALT = 35
    //        CAT = 40
    //        RNM = 120
    //        UDT = 0
    //        REP = 27
    //        AND = 0
    //        NOT = 0
    //        TLS = 0
    //        TBS = 50
    //        TRG = 35
    // characters = [9 - 126]

    // CALLBACK LIST PROTOTYPE (true, false or function reference)
    this.callbacks = [];
    this.callbacks['alphanum'] = false;
    this.callbacks['alternation'] = false;
    this.callbacks['altop'] = false;
    this.callbacks['andop'] = false;
    this.callbacks['basicelement'] = false;
    this.callbacks['basicelementerror'] = false;
    this.callbacks['bin'] = false;
    this.callbacks['blankline'] = false;
    this.callbacks['bmax'] = false;
    this.callbacks['bmin'] = false;
    this.callbacks['bnum'] = false;
    this.callbacks['bstring'] = false;
    this.callbacks['catop'] = false;
    this.callbacks['clsclose'] = false;
    this.callbacks['clsop'] = false;
    this.callbacks['clsopen'] = false;
    this.callbacks['clsstring'] = false;
    this.callbacks['comment'] = false;
    this.callbacks['concatenation'] = false;
    this.callbacks['dec'] = false;
    this.callbacks['defined'] = false;
    this.callbacks['definedas'] = false;
    this.callbacks['definedaserror'] = false;
    this.callbacks['definedastest'] = false;
    this.callbacks['dmax'] = false;
    this.callbacks['dmin'] = false;
    this.callbacks['dnum'] = false;
    this.callbacks['dstring'] = false;
    this.callbacks['file'] = false;
    this.callbacks['group'] = false;
    this.callbacks['groupclose'] = false;
    this.callbacks['grouperror'] = false;
    this.callbacks['groupopen'] = false;
    this.callbacks['hex'] = false;
    this.callbacks['incalt'] = false;
    this.callbacks['linecontinue'] = false;
    this.callbacks['lineend'] = false;
    this.callbacks['lineenderror'] = false;
    this.callbacks['notop'] = false;
    this.callbacks['option'] = false;
    this.callbacks['optionclose'] = false;
    this.callbacks['optionerror'] = false;
    this.callbacks['optionopen'] = false;
    this.callbacks['owsp'] = false;
    this.callbacks['prosval'] = false;
    this.callbacks['prosvalclose'] = false;
    this.callbacks['prosvalopen'] = false;
    this.callbacks['prosvalstring'] = false;
    this.callbacks['rep-max'] = false;
    this.callbacks['rep-min'] = false;
    this.callbacks['rep-min-max'] = false;
    this.callbacks['rep-num'] = false;
    this.callbacks['repetition'] = false;
    this.callbacks['repop'] = false;
    this.callbacks['rnmop'] = false;
    this.callbacks['rule'] = false;
    this.callbacks['ruleerror'] = false;
    this.callbacks['rulelookup'] = false;
    this.callbacks['rulename'] = false;
    this.callbacks['rulenameerror'] = false;
    this.callbacks['rulenametest'] = false;
    this.callbacks['space'] = false;
    this.callbacks['starop'] = false;
    this.callbacks['stringtab'] = false;
    this.callbacks['tbsop'] = false;
    this.callbacks['tlsclose'] = false;
    this.callbacks['tlsop'] = false;
    this.callbacks['tlsopen'] = false;
    this.callbacks['tlsstring'] = false;
    this.callbacks['trgop'] = false;
    this.callbacks['udt-empty'] = false;
    this.callbacks['udt-non-empty'] = false;
    this.callbacks['udtop'] = false;
    this.callbacks['wsp'] = false;
    this.callbacks['xmax'] = false;
    this.callbacks['xmin'] = false;
    this.callbacks['xnum'] = false;
    this.callbacks['xstring'] = false;

    // OBJECT IDENTIFIER (for internal parser use)
    this.grammarObject = 'grammarObject';

    // RULES
    this.rules = [];
    this.rules[0] = {name: 'File', lower: 'file', index: 0};
    this.rules[1] = {name: 'BlankLine', lower: 'blankline', index: 1};
    this.rules[2] = {name: 'Rule', lower: 'rule', index: 2};
    this.rules[3] = {name: 'RuleLookup', lower: 'rulelookup', index: 3};
    this.rules[4] = {name: 'RuleNameTest', lower: 'rulenametest', index: 4};
    this.rules[5] = {name: 'RuleName', lower: 'rulename', index: 5};
    this.rules[6] = {name: 'RuleNameError', lower: 'rulenameerror', index: 6};
    this.rules[7] = {name: 'DefinedAsTest', lower: 'definedastest', index: 7};
    this.rules[8] = {name: 'DefinedAsError', lower: 'definedaserror', index: 8};
    this.rules[9] = {name: 'DefinedAs', lower: 'definedas', index: 9};
    this.rules[10] = {name: 'Defined', lower: 'defined', index: 10};
    this.rules[11] = {name: 'IncAlt', lower: 'incalt', index: 11};
    this.rules[12] = {name: 'RuleError', lower: 'ruleerror', index: 12};
    this.rules[13] = {name: 'LineEndError', lower: 'lineenderror', index: 13};
    this.rules[14] = {name: 'Alternation', lower: 'alternation', index: 14};
    this.rules[15] = {name: 'Concatenation', lower: 'concatenation', index: 15};
    this.rules[16] = {name: 'Repetition', lower: 'repetition', index: 16};
    this.rules[17] = {name: 'BasicElement', lower: 'basicelement', index: 17};
    this.rules[18] = {name: 'BasicElementError', lower: 'basicelementerror', index: 18};
    this.rules[19] = {name: 'Group', lower: 'group', index: 19};
    this.rules[20] = {name: 'GroupError', lower: 'grouperror', index: 20};
    this.rules[21] = {name: 'GroupOpen', lower: 'groupopen', index: 21};
    this.rules[22] = {name: 'GroupClose', lower: 'groupclose', index: 22};
    this.rules[23] = {name: 'Option', lower: 'option', index: 23};
    this.rules[24] = {name: 'OptionError', lower: 'optionerror', index: 24};
    this.rules[25] = {name: 'OptionOpen', lower: 'optionopen', index: 25};
    this.rules[26] = {name: 'OptionClose', lower: 'optionclose', index: 26};
    this.rules[27] = {name: 'RnmOp', lower: 'rnmop', index: 27};
    this.rules[28] = {name: 'UdtOp', lower: 'udtop', index: 28};
    this.rules[29] = {name: 'udt-non-empty', lower: 'udt-non-empty', index: 29};
    this.rules[30] = {name: 'udt-empty', lower: 'udt-empty', index: 30};
    this.rules[31] = {name: 'RepOp', lower: 'repop', index: 31};
    this.rules[32] = {name: 'AltOp', lower: 'altop', index: 32};
    this.rules[33] = {name: 'CatOp', lower: 'catop', index: 33};
    this.rules[34] = {name: 'StarOp', lower: 'starop', index: 34};
    this.rules[35] = {name: 'AndOp', lower: 'andop', index: 35};
    this.rules[36] = {name: 'NotOp', lower: 'notop', index: 36};
    this.rules[37] = {name: 'TrgOp', lower: 'trgop', index: 37};
    this.rules[38] = {name: 'TbsOp', lower: 'tbsop', index: 38};
    this.rules[39] = {name: 'TlsOp', lower: 'tlsop', index: 39};
    this.rules[40] = {name: 'TlsOpen', lower: 'tlsopen', index: 40};
    this.rules[41] = {name: 'TlsClose', lower: 'tlsclose', index: 41};
    this.rules[42] = {name: 'TlsString', lower: 'tlsstring', index: 42};
    this.rules[43] = {name: 'StringTab', lower: 'stringtab', index: 43};
    this.rules[44] = {name: 'ClsOp', lower: 'clsop', index: 44};
    this.rules[45] = {name: 'ClsOpen', lower: 'clsopen', index: 45};
    this.rules[46] = {name: 'ClsClose', lower: 'clsclose', index: 46};
    this.rules[47] = {name: 'ClsString', lower: 'clsstring', index: 47};
    this.rules[48] = {name: 'ProsVal', lower: 'prosval', index: 48};
    this.rules[49] = {name: 'ProsValOpen', lower: 'prosvalopen', index: 49};
    this.rules[50] = {name: 'ProsValString', lower: 'prosvalstring', index: 50};
    this.rules[51] = {name: 'ProsValClose', lower: 'prosvalclose', index: 51};
    this.rules[52] = {name: 'rep-min', lower: 'rep-min', index: 52};
    this.rules[53] = {name: 'rep-min-max', lower: 'rep-min-max', index: 53};
    this.rules[54] = {name: 'rep-max', lower: 'rep-max', index: 54};
    this.rules[55] = {name: 'rep-num', lower: 'rep-num', index: 55};
    this.rules[56] = {name: 'dString', lower: 'dstring', index: 56};
    this.rules[57] = {name: 'xString', lower: 'xstring', index: 57};
    this.rules[58] = {name: 'bString', lower: 'bstring', index: 58};
    this.rules[59] = {name: 'Dec', lower: 'dec', index: 59};
    this.rules[60] = {name: 'Hex', lower: 'hex', index: 60};
    this.rules[61] = {name: 'Bin', lower: 'bin', index: 61};
    this.rules[62] = {name: 'dmin', lower: 'dmin', index: 62};
    this.rules[63] = {name: 'dmax', lower: 'dmax', index: 63};
    this.rules[64] = {name: 'bmin', lower: 'bmin', index: 64};
    this.rules[65] = {name: 'bmax', lower: 'bmax', index: 65};
    this.rules[66] = {name: 'xmin', lower: 'xmin', index: 66};
    this.rules[67] = {name: 'xmax', lower: 'xmax', index: 67};
    this.rules[68] = {name: 'dnum', lower: 'dnum', index: 68};
    this.rules[69] = {name: 'bnum', lower: 'bnum', index: 69};
    this.rules[70] = {name: 'xnum', lower: 'xnum', index: 70};
    this.rules[71] = {name: 'alphanum', lower: 'alphanum', index: 71};
    this.rules[72] = {name: 'owsp', lower: 'owsp', index: 72};
    this.rules[73] = {name: 'wsp', lower: 'wsp', index: 73};
    this.rules[74] = {name: 'space', lower: 'space', index: 74};
    this.rules[75] = {name: 'comment', lower: 'comment', index: 75};
    this.rules[76] = {name: 'LineEnd', lower: 'lineend', index: 76};
    this.rules[77] = {name: 'LineContinue', lower: 'linecontinue', index: 77};

    // UDTS
    this.udts = [];

    // OPCODES
    // File
    this.rules[0].opcodes = [];
    this.rules[0].opcodes[0] = {type: 3, min: 0, max: Infinity};// REP
    this.rules[0].opcodes[1] = {type: 1, children: [2,3,4]};// ALT
    this.rules[0].opcodes[2] = {type: 4, index: 1};// RNM(BlankLine)
    this.rules[0].opcodes[3] = {type: 4, index: 2};// RNM(Rule)
    this.rules[0].opcodes[4] = {type: 4, index: 12};// RNM(RuleError)

    // BlankLine
    this.rules[1].opcodes = [];
    this.rules[1].opcodes[0] = {type: 2, children: [1,5,7]};// CAT
    this.rules[1].opcodes[1] = {type: 3, min: 0, max: Infinity};// REP
    this.rules[1].opcodes[2] = {type: 1, children: [3,4]};// ALT
    this.rules[1].opcodes[3] = {type: 10, string: [32]};// TBS
    this.rules[1].opcodes[4] = {type: 10, string: [9]};// TBS
    this.rules[1].opcodes[5] = {type: 3, min: 0, max: 1};// REP
    this.rules[1].opcodes[6] = {type: 4, index: 75};// RNM(comment)
    this.rules[1].opcodes[7] = {type: 4, index: 76};// RNM(LineEnd)

    // Rule
    this.rules[2].opcodes = [];
    this.rules[2].opcodes[0] = {type: 2, children: [1,2,3,4]};// CAT
    this.rules[2].opcodes[1] = {type: 4, index: 3};// RNM(RuleLookup)
    this.rules[2].opcodes[2] = {type: 4, index: 72};// RNM(owsp)
    this.rules[2].opcodes[3] = {type: 4, index: 14};// RNM(Alternation)
    this.rules[2].opcodes[4] = {type: 1, children: [5,8]};// ALT
    this.rules[2].opcodes[5] = {type: 2, children: [6,7]};// CAT
    this.rules[2].opcodes[6] = {type: 4, index: 72};// RNM(owsp)
    this.rules[2].opcodes[7] = {type: 4, index: 76};// RNM(LineEnd)
    this.rules[2].opcodes[8] = {type: 2, children: [9,10]};// CAT
    this.rules[2].opcodes[9] = {type: 4, index: 13};// RNM(LineEndError)
    this.rules[2].opcodes[10] = {type: 4, index: 76};// RNM(LineEnd)

    // RuleLookup
    this.rules[3].opcodes = [];
    this.rules[3].opcodes[0] = {type: 2, children: [1,2,3]};// CAT
    this.rules[3].opcodes[1] = {type: 4, index: 4};// RNM(RuleNameTest)
    this.rules[3].opcodes[2] = {type: 4, index: 72};// RNM(owsp)
    this.rules[3].opcodes[3] = {type: 4, index: 7};// RNM(DefinedAsTest)

    // RuleNameTest
    this.rules[4].opcodes = [];
    this.rules[4].opcodes[0] = {type: 1, children: [1,2]};// ALT
    this.rules[4].opcodes[1] = {type: 4, index: 5};// RNM(RuleName)
    this.rules[4].opcodes[2] = {type: 4, index: 6};// RNM(RuleNameError)

    // RuleName
    this.rules[5].opcodes = [];
    this.rules[5].opcodes[0] = {type: 4, index: 71};// RNM(alphanum)

    // RuleNameError
    this.rules[6].opcodes = [];
    this.rules[6].opcodes[0] = {type: 3, min: 1, max: Infinity};// REP
    this.rules[6].opcodes[1] = {type: 1, children: [2,3]};// ALT
    this.rules[6].opcodes[2] = {type: 8, min: 33, max: 60};// TRG
    this.rules[6].opcodes[3] = {type: 8, min: 62, max: 126};// TRG

    // DefinedAsTest
    this.rules[7].opcodes = [];
    this.rules[7].opcodes[0] = {type: 1, children: [1,2]};// ALT
    this.rules[7].opcodes[1] = {type: 4, index: 9};// RNM(DefinedAs)
    this.rules[7].opcodes[2] = {type: 4, index: 8};// RNM(DefinedAsError)

    // DefinedAsError
    this.rules[8].opcodes = [];
    this.rules[8].opcodes[0] = {type: 3, min: 1, max: 2};// REP
    this.rules[8].opcodes[1] = {type: 8, min: 33, max: 126};// TRG

    // DefinedAs
    this.rules[9].opcodes = [];
    this.rules[9].opcodes[0] = {type: 1, children: [1,2]};// ALT
    this.rules[9].opcodes[1] = {type: 4, index: 11};// RNM(IncAlt)
    this.rules[9].opcodes[2] = {type: 4, index: 10};// RNM(Defined)

    // Defined
    this.rules[10].opcodes = [];
    this.rules[10].opcodes[0] = {type: 10, string: [61]};// TBS

    // IncAlt
    this.rules[11].opcodes = [];
    this.rules[11].opcodes[0] = {type: 10, string: [61,47]};// TBS

    // RuleError
    this.rules[12].opcodes = [];
    this.rules[12].opcodes[0] = {type: 2, children: [1,6]};// CAT
    this.rules[12].opcodes[1] = {type: 3, min: 1, max: Infinity};// REP
    this.rules[12].opcodes[2] = {type: 1, children: [3,4,5]};// ALT
    this.rules[12].opcodes[3] = {type: 8, min: 32, max: 126};// TRG
    this.rules[12].opcodes[4] = {type: 10, string: [9]};// TBS
    this.rules[12].opcodes[5] = {type: 4, index: 77};// RNM(LineContinue)
    this.rules[12].opcodes[6] = {type: 4, index: 76};// RNM(LineEnd)

    // LineEndError
    this.rules[13].opcodes = [];
    this.rules[13].opcodes[0] = {type: 3, min: 1, max: Infinity};// REP
    this.rules[13].opcodes[1] = {type: 1, children: [2,3,4]};// ALT
    this.rules[13].opcodes[2] = {type: 8, min: 32, max: 126};// TRG
    this.rules[13].opcodes[3] = {type: 10, string: [9]};// TBS
    this.rules[13].opcodes[4] = {type: 4, index: 77};// RNM(LineContinue)

    // Alternation
    this.rules[14].opcodes = [];
    this.rules[14].opcodes[0] = {type: 2, children: [1,2]};// CAT
    this.rules[14].opcodes[1] = {type: 4, index: 15};// RNM(Concatenation)
    this.rules[14].opcodes[2] = {type: 3, min: 0, max: Infinity};// REP
    this.rules[14].opcodes[3] = {type: 2, children: [4,5,6]};// CAT
    this.rules[14].opcodes[4] = {type: 4, index: 72};// RNM(owsp)
    this.rules[14].opcodes[5] = {type: 4, index: 32};// RNM(AltOp)
    this.rules[14].opcodes[6] = {type: 4, index: 15};// RNM(Concatenation)

    // Concatenation
    this.rules[15].opcodes = [];
    this.rules[15].opcodes[0] = {type: 2, children: [1,2]};// CAT
    this.rules[15].opcodes[1] = {type: 4, index: 16};// RNM(Repetition)
    this.rules[15].opcodes[2] = {type: 3, min: 0, max: Infinity};// REP
    this.rules[15].opcodes[3] = {type: 2, children: [4,5]};// CAT
    this.rules[15].opcodes[4] = {type: 4, index: 33};// RNM(CatOp)
    this.rules[15].opcodes[5] = {type: 4, index: 16};// RNM(Repetition)

    // Repetition
    this.rules[16].opcodes = [];
    this.rules[16].opcodes[0] = {type: 2, children: [1,6]};// CAT
    this.rules[16].opcodes[1] = {type: 3, min: 0, max: 1};// REP
    this.rules[16].opcodes[2] = {type: 1, children: [3,4,5]};// ALT
    this.rules[16].opcodes[3] = {type: 4, index: 35};// RNM(AndOp)
    this.rules[16].opcodes[4] = {type: 4, index: 36};// RNM(NotOp)
    this.rules[16].opcodes[5] = {type: 4, index: 31};// RNM(RepOp)
    this.rules[16].opcodes[6] = {type: 1, children: [7,8,9,10]};// ALT
    this.rules[16].opcodes[7] = {type: 4, index: 19};// RNM(Group)
    this.rules[16].opcodes[8] = {type: 4, index: 23};// RNM(Option)
    this.rules[16].opcodes[9] = {type: 4, index: 17};// RNM(BasicElement)
    this.rules[16].opcodes[10] = {type: 4, index: 18};// RNM(BasicElementError)

    // BasicElement
    this.rules[17].opcodes = [];
    this.rules[17].opcodes[0] = {type: 1, children: [1,2,3,4,5,6,7]};// ALT
    this.rules[17].opcodes[1] = {type: 4, index: 28};// RNM(UdtOp)
    this.rules[17].opcodes[2] = {type: 4, index: 27};// RNM(RnmOp)
    this.rules[17].opcodes[3] = {type: 4, index: 37};// RNM(TrgOp)
    this.rules[17].opcodes[4] = {type: 4, index: 38};// RNM(TbsOp)
    this.rules[17].opcodes[5] = {type: 4, index: 39};// RNM(TlsOp)
    this.rules[17].opcodes[6] = {type: 4, index: 44};// RNM(ClsOp)
    this.rules[17].opcodes[7] = {type: 4, index: 48};// RNM(ProsVal)

    // BasicElementError
    this.rules[18].opcodes = [];
    this.rules[18].opcodes[0] = {type: 3, min: 1, max: Infinity};// REP
    this.rules[18].opcodes[1] = {type: 1, children: [2,3,4,5]};// ALT
    this.rules[18].opcodes[2] = {type: 8, min: 33, max: 40};// TRG
    this.rules[18].opcodes[3] = {type: 8, min: 42, max: 46};// TRG
    this.rules[18].opcodes[4] = {type: 8, min: 48, max: 92};// TRG
    this.rules[18].opcodes[5] = {type: 8, min: 94, max: 126};// TRG

    // Group
    this.rules[19].opcodes = [];
    this.rules[19].opcodes[0] = {type: 2, children: [1,2,3]};// CAT
    this.rules[19].opcodes[1] = {type: 4, index: 21};// RNM(GroupOpen)
    this.rules[19].opcodes[2] = {type: 4, index: 14};// RNM(Alternation)
    this.rules[19].opcodes[3] = {type: 1, children: [4,5]};// ALT
    this.rules[19].opcodes[4] = {type: 4, index: 22};// RNM(GroupClose)
    this.rules[19].opcodes[5] = {type: 4, index: 20};// RNM(GroupError)

    // GroupError
    this.rules[20].opcodes = [];
    this.rules[20].opcodes[0] = {type: 3, min: 1, max: Infinity};// REP
    this.rules[20].opcodes[1] = {type: 1, children: [2,3,4,5]};// ALT
    this.rules[20].opcodes[2] = {type: 8, min: 33, max: 40};// TRG
    this.rules[20].opcodes[3] = {type: 8, min: 42, max: 46};// TRG
    this.rules[20].opcodes[4] = {type: 8, min: 48, max: 92};// TRG
    this.rules[20].opcodes[5] = {type: 8, min: 94, max: 126};// TRG

    // GroupOpen
    this.rules[21].opcodes = [];
    this.rules[21].opcodes[0] = {type: 2, children: [1,2]};// CAT
    this.rules[21].opcodes[1] = {type: 10, string: [40]};// TBS
    this.rules[21].opcodes[2] = {type: 4, index: 72};// RNM(owsp)

    // GroupClose
    this.rules[22].opcodes = [];
    this.rules[22].opcodes[0] = {type: 2, children: [1,2]};// CAT
    this.rules[22].opcodes[1] = {type: 4, index: 72};// RNM(owsp)
    this.rules[22].opcodes[2] = {type: 10, string: [41]};// TBS

    // Option
    this.rules[23].opcodes = [];
    this.rules[23].opcodes[0] = {type: 2, children: [1,2,3]};// CAT
    this.rules[23].opcodes[1] = {type: 4, index: 25};// RNM(OptionOpen)
    this.rules[23].opcodes[2] = {type: 4, index: 14};// RNM(Alternation)
    this.rules[23].opcodes[3] = {type: 1, children: [4,5]};// ALT
    this.rules[23].opcodes[4] = {type: 4, index: 26};// RNM(OptionClose)
    this.rules[23].opcodes[5] = {type: 4, index: 24};// RNM(OptionError)

    // OptionError
    this.rules[24].opcodes = [];
    this.rules[24].opcodes[0] = {type: 3, min: 1, max: Infinity};// REP
    this.rules[24].opcodes[1] = {type: 1, children: [2,3,4,5]};// ALT
    this.rules[24].opcodes[2] = {type: 8, min: 33, max: 40};// TRG
    this.rules[24].opcodes[3] = {type: 8, min: 42, max: 46};// TRG
    this.rules[24].opcodes[4] = {type: 8, min: 48, max: 92};// TRG
    this.rules[24].opcodes[5] = {type: 8, min: 94, max: 126};// TRG

    // OptionOpen
    this.rules[25].opcodes = [];
    this.rules[25].opcodes[0] = {type: 2, children: [1,2]};// CAT
    this.rules[25].opcodes[1] = {type: 10, string: [91]};// TBS
    this.rules[25].opcodes[2] = {type: 4, index: 72};// RNM(owsp)

    // OptionClose
    this.rules[26].opcodes = [];
    this.rules[26].opcodes[0] = {type: 2, children: [1,2]};// CAT
    this.rules[26].opcodes[1] = {type: 4, index: 72};// RNM(owsp)
    this.rules[26].opcodes[2] = {type: 10, string: [93]};// TBS

    // RnmOp
    this.rules[27].opcodes = [];
    this.rules[27].opcodes[0] = {type: 4, index: 71};// RNM(alphanum)

    // UdtOp
    this.rules[28].opcodes = [];
    this.rules[28].opcodes[0] = {type: 1, children: [1,2]};// ALT
    this.rules[28].opcodes[1] = {type: 4, index: 30};// RNM(udt-empty)
    this.rules[28].opcodes[2] = {type: 4, index: 29};// RNM(udt-non-empty)

    // udt-non-empty
    this.rules[29].opcodes = [];
    this.rules[29].opcodes[0] = {type: 2, children: [1,2]};// CAT
    this.rules[29].opcodes[1] = {type: 10, string: [117,95]};// TBS
    this.rules[29].opcodes[2] = {type: 4, index: 71};// RNM(alphanum)

    // udt-empty
    this.rules[30].opcodes = [];
    this.rules[30].opcodes[0] = {type: 2, children: [1,2]};// CAT
    this.rules[30].opcodes[1] = {type: 10, string: [101,95]};// TBS
    this.rules[30].opcodes[2] = {type: 4, index: 71};// RNM(alphanum)

    // RepOp
    this.rules[31].opcodes = [];
    this.rules[31].opcodes[0] = {type: 1, children: [1,5,8,11,12]};// ALT
    this.rules[31].opcodes[1] = {type: 2, children: [2,3,4]};// CAT
    this.rules[31].opcodes[2] = {type: 4, index: 52};// RNM(rep-min)
    this.rules[31].opcodes[3] = {type: 4, index: 34};// RNM(StarOp)
    this.rules[31].opcodes[4] = {type: 4, index: 54};// RNM(rep-max)
    this.rules[31].opcodes[5] = {type: 2, children: [6,7]};// CAT
    this.rules[31].opcodes[6] = {type: 4, index: 52};// RNM(rep-min)
    this.rules[31].opcodes[7] = {type: 4, index: 34};// RNM(StarOp)
    this.rules[31].opcodes[8] = {type: 2, children: [9,10]};// CAT
    this.rules[31].opcodes[9] = {type: 4, index: 34};// RNM(StarOp)
    this.rules[31].opcodes[10] = {type: 4, index: 54};// RNM(rep-max)
    this.rules[31].opcodes[11] = {type: 4, index: 34};// RNM(StarOp)
    this.rules[31].opcodes[12] = {type: 4, index: 53};// RNM(rep-min-max)

    // AltOp
    this.rules[32].opcodes = [];
    this.rules[32].opcodes[0] = {type: 2, children: [1,2]};// CAT
    this.rules[32].opcodes[1] = {type: 10, string: [47]};// TBS
    this.rules[32].opcodes[2] = {type: 4, index: 72};// RNM(owsp)

    // CatOp
    this.rules[33].opcodes = [];
    this.rules[33].opcodes[0] = {type: 4, index: 73};// RNM(wsp)

    // StarOp
    this.rules[34].opcodes = [];
    this.rules[34].opcodes[0] = {type: 10, string: [42]};// TBS

    // AndOp
    this.rules[35].opcodes = [];
    this.rules[35].opcodes[0] = {type: 10, string: [38]};// TBS

    // NotOp
    this.rules[36].opcodes = [];
    this.rules[36].opcodes[0] = {type: 10, string: [33]};// TBS

    // TrgOp
    this.rules[37].opcodes = [];
    this.rules[37].opcodes[0] = {type: 2, children: [1,2]};// CAT
    this.rules[37].opcodes[1] = {type: 10, string: [37]};// TBS
    this.rules[37].opcodes[2] = {type: 1, children: [3,8,13]};// ALT
    this.rules[37].opcodes[3] = {type: 2, children: [4,5,6,7]};// CAT
    this.rules[37].opcodes[4] = {type: 4, index: 59};// RNM(Dec)
    this.rules[37].opcodes[5] = {type: 4, index: 62};// RNM(dmin)
    this.rules[37].opcodes[6] = {type: 10, string: [45]};// TBS
    this.rules[37].opcodes[7] = {type: 4, index: 63};// RNM(dmax)
    this.rules[37].opcodes[8] = {type: 2, children: [9,10,11,12]};// CAT
    this.rules[37].opcodes[9] = {type: 4, index: 60};// RNM(Hex)
    this.rules[37].opcodes[10] = {type: 4, index: 66};// RNM(xmin)
    this.rules[37].opcodes[11] = {type: 10, string: [45]};// TBS
    this.rules[37].opcodes[12] = {type: 4, index: 67};// RNM(xmax)
    this.rules[37].opcodes[13] = {type: 2, children: [14,15,16,17]};// CAT
    this.rules[37].opcodes[14] = {type: 4, index: 61};// RNM(Bin)
    this.rules[37].opcodes[15] = {type: 4, index: 64};// RNM(bmin)
    this.rules[37].opcodes[16] = {type: 10, string: [45]};// TBS
    this.rules[37].opcodes[17] = {type: 4, index: 65};// RNM(bmax)

    // TbsOp
    this.rules[38].opcodes = [];
    this.rules[38].opcodes[0] = {type: 2, children: [1,2]};// CAT
    this.rules[38].opcodes[1] = {type: 10, string: [37]};// TBS
    this.rules[38].opcodes[2] = {type: 1, children: [3,10,17]};// ALT
    this.rules[38].opcodes[3] = {type: 2, children: [4,5,6]};// CAT
    this.rules[38].opcodes[4] = {type: 4, index: 59};// RNM(Dec)
    this.rules[38].opcodes[5] = {type: 4, index: 56};// RNM(dString)
    this.rules[38].opcodes[6] = {type: 3, min: 0, max: Infinity};// REP
    this.rules[38].opcodes[7] = {type: 2, children: [8,9]};// CAT
    this.rules[38].opcodes[8] = {type: 10, string: [46]};// TBS
    this.rules[38].opcodes[9] = {type: 4, index: 56};// RNM(dString)
    this.rules[38].opcodes[10] = {type: 2, children: [11,12,13]};// CAT
    this.rules[38].opcodes[11] = {type: 4, index: 60};// RNM(Hex)
    this.rules[38].opcodes[12] = {type: 4, index: 57};// RNM(xString)
    this.rules[38].opcodes[13] = {type: 3, min: 0, max: Infinity};// REP
    this.rules[38].opcodes[14] = {type: 2, children: [15,16]};// CAT
    this.rules[38].opcodes[15] = {type: 10, string: [46]};// TBS
    this.rules[38].opcodes[16] = {type: 4, index: 57};// RNM(xString)
    this.rules[38].opcodes[17] = {type: 2, children: [18,19,20]};// CAT
    this.rules[38].opcodes[18] = {type: 4, index: 61};// RNM(Bin)
    this.rules[38].opcodes[19] = {type: 4, index: 58};// RNM(bString)
    this.rules[38].opcodes[20] = {type: 3, min: 0, max: Infinity};// REP
    this.rules[38].opcodes[21] = {type: 2, children: [22,23]};// CAT
    this.rules[38].opcodes[22] = {type: 10, string: [46]};// TBS
    this.rules[38].opcodes[23] = {type: 4, index: 58};// RNM(bString)

    // TlsOp
    this.rules[39].opcodes = [];
    this.rules[39].opcodes[0] = {type: 2, children: [1,2,3]};// CAT
    this.rules[39].opcodes[1] = {type: 4, index: 40};// RNM(TlsOpen)
    this.rules[39].opcodes[2] = {type: 4, index: 42};// RNM(TlsString)
    this.rules[39].opcodes[3] = {type: 4, index: 41};// RNM(TlsClose)

    // TlsOpen
    this.rules[40].opcodes = [];
    this.rules[40].opcodes[0] = {type: 10, string: [34]};// TBS

    // TlsClose
    this.rules[41].opcodes = [];
    this.rules[41].opcodes[0] = {type: 10, string: [34]};// TBS

    // TlsString
    this.rules[42].opcodes = [];
    this.rules[42].opcodes[0] = {type: 3, min: 0, max: Infinity};// REP
    this.rules[42].opcodes[1] = {type: 1, children: [2,3,4]};// ALT
    this.rules[42].opcodes[2] = {type: 8, min: 32, max: 33};// TRG
    this.rules[42].opcodes[3] = {type: 8, min: 35, max: 126};// TRG
    this.rules[42].opcodes[4] = {type: 4, index: 43};// RNM(StringTab)

    // StringTab
    this.rules[43].opcodes = [];
    this.rules[43].opcodes[0] = {type: 10, string: [9]};// TBS

    // ClsOp
    this.rules[44].opcodes = [];
    this.rules[44].opcodes[0] = {type: 2, children: [1,2,3]};// CAT
    this.rules[44].opcodes[1] = {type: 4, index: 45};// RNM(ClsOpen)
    this.rules[44].opcodes[2] = {type: 4, index: 47};// RNM(ClsString)
    this.rules[44].opcodes[3] = {type: 4, index: 46};// RNM(ClsClose)

    // ClsOpen
    this.rules[45].opcodes = [];
    this.rules[45].opcodes[0] = {type: 10, string: [39]};// TBS

    // ClsClose
    this.rules[46].opcodes = [];
    this.rules[46].opcodes[0] = {type: 10, string: [39]};// TBS

    // ClsString
    this.rules[47].opcodes = [];
    this.rules[47].opcodes[0] = {type: 3, min: 0, max: Infinity};// REP
    this.rules[47].opcodes[1] = {type: 1, children: [2,3,4]};// ALT
    this.rules[47].opcodes[2] = {type: 8, min: 32, max: 38};// TRG
    this.rules[47].opcodes[3] = {type: 8, min: 40, max: 126};// TRG
    this.rules[47].opcodes[4] = {type: 4, index: 43};// RNM(StringTab)

    // ProsVal
    this.rules[48].opcodes = [];
    this.rules[48].opcodes[0] = {type: 2, children: [1,2,3]};// CAT
    this.rules[48].opcodes[1] = {type: 4, index: 49};// RNM(ProsValOpen)
    this.rules[48].opcodes[2] = {type: 4, index: 50};// RNM(ProsValString)
    this.rules[48].opcodes[3] = {type: 4, index: 51};// RNM(ProsValClose)

    // ProsValOpen
    this.rules[49].opcodes = [];
    this.rules[49].opcodes[0] = {type: 10, string: [60]};// TBS

    // ProsValString
    this.rules[50].opcodes = [];
    this.rules[50].opcodes[0] = {type: 3, min: 0, max: Infinity};// REP
    this.rules[50].opcodes[1] = {type: 1, children: [2,3,4]};// ALT
    this.rules[50].opcodes[2] = {type: 8, min: 32, max: 61};// TRG
    this.rules[50].opcodes[3] = {type: 8, min: 63, max: 126};// TRG
    this.rules[50].opcodes[4] = {type: 4, index: 43};// RNM(StringTab)

    // ProsValClose
    this.rules[51].opcodes = [];
    this.rules[51].opcodes[0] = {type: 10, string: [62]};// TBS

    // rep-min
    this.rules[52].opcodes = [];
    this.rules[52].opcodes[0] = {type: 4, index: 55};// RNM(rep-num)

    // rep-min-max
    this.rules[53].opcodes = [];
    this.rules[53].opcodes[0] = {type: 4, index: 55};// RNM(rep-num)

    // rep-max
    this.rules[54].opcodes = [];
    this.rules[54].opcodes[0] = {type: 4, index: 55};// RNM(rep-num)

    // rep-num
    this.rules[55].opcodes = [];
    this.rules[55].opcodes[0] = {type: 3, min: 1, max: Infinity};// REP
    this.rules[55].opcodes[1] = {type: 8, min: 48, max: 57};// TRG

    // dString
    this.rules[56].opcodes = [];
    this.rules[56].opcodes[0] = {type: 4, index: 68};// RNM(dnum)

    // xString
    this.rules[57].opcodes = [];
    this.rules[57].opcodes[0] = {type: 4, index: 70};// RNM(xnum)

    // bString
    this.rules[58].opcodes = [];
    this.rules[58].opcodes[0] = {type: 4, index: 69};// RNM(bnum)

    // Dec
    this.rules[59].opcodes = [];
    this.rules[59].opcodes[0] = {type: 1, children: [1,2]};// ALT
    this.rules[59].opcodes[1] = {type: 10, string: [68]};// TBS
    this.rules[59].opcodes[2] = {type: 10, string: [100]};// TBS

    // Hex
    this.rules[60].opcodes = [];
    this.rules[60].opcodes[0] = {type: 1, children: [1,2]};// ALT
    this.rules[60].opcodes[1] = {type: 10, string: [88]};// TBS
    this.rules[60].opcodes[2] = {type: 10, string: [120]};// TBS

    // Bin
    this.rules[61].opcodes = [];
    this.rules[61].opcodes[0] = {type: 1, children: [1,2]};// ALT
    this.rules[61].opcodes[1] = {type: 10, string: [66]};// TBS
    this.rules[61].opcodes[2] = {type: 10, string: [98]};// TBS

    // dmin
    this.rules[62].opcodes = [];
    this.rules[62].opcodes[0] = {type: 4, index: 68};// RNM(dnum)

    // dmax
    this.rules[63].opcodes = [];
    this.rules[63].opcodes[0] = {type: 4, index: 68};// RNM(dnum)

    // bmin
    this.rules[64].opcodes = [];
    this.rules[64].opcodes[0] = {type: 4, index: 69};// RNM(bnum)

    // bmax
    this.rules[65].opcodes = [];
    this.rules[65].opcodes[0] = {type: 4, index: 69};// RNM(bnum)

    // xmin
    this.rules[66].opcodes = [];
    this.rules[66].opcodes[0] = {type: 4, index: 70};// RNM(xnum)

    // xmax
    this.rules[67].opcodes = [];
    this.rules[67].opcodes[0] = {type: 4, index: 70};// RNM(xnum)

    // dnum
    this.rules[68].opcodes = [];
    this.rules[68].opcodes[0] = {type: 3, min: 1, max: Infinity};// REP
    this.rules[68].opcodes[1] = {type: 8, min: 48, max: 57};// TRG

    // bnum
    this.rules[69].opcodes = [];
    this.rules[69].opcodes[0] = {type: 3, min: 1, max: Infinity};// REP
    this.rules[69].opcodes[1] = {type: 8, min: 48, max: 49};// TRG

    // xnum
    this.rules[70].opcodes = [];
    this.rules[70].opcodes[0] = {type: 3, min: 1, max: Infinity};// REP
    this.rules[70].opcodes[1] = {type: 1, children: [2,3,4]};// ALT
    this.rules[70].opcodes[2] = {type: 8, min: 48, max: 57};// TRG
    this.rules[70].opcodes[3] = {type: 8, min: 65, max: 70};// TRG
    this.rules[70].opcodes[4] = {type: 8, min: 97, max: 102};// TRG

    // alphanum
    this.rules[71].opcodes = [];
    this.rules[71].opcodes[0] = {type: 2, children: [1,4]};// CAT
    this.rules[71].opcodes[1] = {type: 1, children: [2,3]};// ALT
    this.rules[71].opcodes[2] = {type: 8, min: 97, max: 122};// TRG
    this.rules[71].opcodes[3] = {type: 8, min: 65, max: 90};// TRG
    this.rules[71].opcodes[4] = {type: 3, min: 0, max: Infinity};// REP
    this.rules[71].opcodes[5] = {type: 1, children: [6,7,8,9]};// ALT
    this.rules[71].opcodes[6] = {type: 8, min: 97, max: 122};// TRG
    this.rules[71].opcodes[7] = {type: 8, min: 65, max: 90};// TRG
    this.rules[71].opcodes[8] = {type: 8, min: 48, max: 57};// TRG
    this.rules[71].opcodes[9] = {type: 10, string: [45]};// TBS

    // owsp
    this.rules[72].opcodes = [];
    this.rules[72].opcodes[0] = {type: 3, min: 0, max: Infinity};// REP
    this.rules[72].opcodes[1] = {type: 4, index: 74};// RNM(space)

    // wsp
    this.rules[73].opcodes = [];
    this.rules[73].opcodes[0] = {type: 3, min: 1, max: Infinity};// REP
    this.rules[73].opcodes[1] = {type: 4, index: 74};// RNM(space)

    // space
    this.rules[74].opcodes = [];
    this.rules[74].opcodes[0] = {type: 1, children: [1,2,3,4]};// ALT
    this.rules[74].opcodes[1] = {type: 10, string: [32]};// TBS
    this.rules[74].opcodes[2] = {type: 10, string: [9]};// TBS
    this.rules[74].opcodes[3] = {type: 4, index: 75};// RNM(comment)
    this.rules[74].opcodes[4] = {type: 4, index: 77};// RNM(LineContinue)

    // comment
    this.rules[75].opcodes = [];
    this.rules[75].opcodes[0] = {type: 2, children: [1,2]};// CAT
    this.rules[75].opcodes[1] = {type: 10, string: [59]};// TBS
    this.rules[75].opcodes[2] = {type: 3, min: 0, max: Infinity};// REP
    this.rules[75].opcodes[3] = {type: 1, children: [4,5]};// ALT
    this.rules[75].opcodes[4] = {type: 8, min: 32, max: 126};// TRG
    this.rules[75].opcodes[5] = {type: 10, string: [9]};// TBS

    // LineEnd
    this.rules[76].opcodes = [];
    this.rules[76].opcodes[0] = {type: 1, children: [1,2,3]};// ALT
    this.rules[76].opcodes[1] = {type: 10, string: [13,10]};// TBS
    this.rules[76].opcodes[2] = {type: 10, string: [10]};// TBS
    this.rules[76].opcodes[3] = {type: 10, string: [13]};// TBS

    // LineContinue
    this.rules[77].opcodes = [];
    this.rules[77].opcodes[0] = {type: 2, children: [1,5]};// CAT
    this.rules[77].opcodes[1] = {type: 1, children: [2,3,4]};// ALT
    this.rules[77].opcodes[2] = {type: 10, string: [13,10]};// TBS
    this.rules[77].opcodes[3] = {type: 10, string: [10]};// TBS
    this.rules[77].opcodes[4] = {type: 10, string: [13]};// TBS
    this.rules[77].opcodes[5] = {type: 1, children: [6,7]};// ALT
    this.rules[77].opcodes[6] = {type: 10, string: [32]};// TBS
    this.rules[77].opcodes[7] = {type: 10, string: [9]};// TBS
}

// INPUT GRAMMAR FILE(s)
//
// 
// ;
// ; ABNF for JavaScript APG 2.0.0 SABNF
// ; RFC 5234 with some restrictions and additions.
// ;
// ;   1. Rules must begin at first character of each line.
// ;      Indentations on first rule and rules thereafter are not allowed.
// ;   2. Relaxed line endings. CRLF, LF or CR are accepted as valid line ending.
// ;   3. Prose values, <prose value>, are accepted as valid grammar syntax.
// ;      However, a working parser cannot and will not be generated from them.
// ;
// ; Super set (SABNF) additions:
// ;   1. Syntactic predicate operators, & and !, are accepted as element prefixes.
// ;      e.g. &%d13 or &rule or !(A / B)
// ;   2. User-Defined Terminals (UDT) of the form, u_name and e_name are accepted.
// ;      'name' is alpha followed by alpha/num/hyphen just like a rule name.
// ;      u_name may be used as an element but no rule definition is given.
// ;      e.g. rule = A / u_myUdt
// ;           A = "a"
// ;      would be a valid grammar.
// ;   3. Case-sensitive, single-quoted strings are accepted.
// ;      e.g. 'abc' would be equivalent to %d97.98.99
// ;
// File          = *(BlankLine / Rule / RuleError)
// BlankLine     = *(%d32/%d9) [comment] LineEnd
// Rule          = RuleLookup owsp Alternation ((owsp LineEnd) / (LineEndError LineEnd))
// RuleLookup    = RuleNameTest owsp DefinedAsTest
// RuleNameTest  = RuleName/RuleNameError
// RuleName      = alphanum
// RuleNameError = 1*(%d33-60/%d62-126) ; all chars up to next space, "defined as" (=) or line end
// DefinedAsTest = DefinedAs / DefinedAsError
// DefinedAsError = 1*2%d33-126 ; the next 2 or 2 chars, not space or line end
// DefinedAs     = IncAlt / Defined
// Defined       = %d61
// IncAlt        = %d61.47
// RuleError     = 1*(%d32-126 / %d9  / LineContinue) LineEnd
// LineEndError  = 1*(%d32-126 / %d9  / LineContinue)
// Alternation   = Concatenation *(owsp AltOp Concatenation)
// Concatenation = Repetition *(CatOp Repetition)
// Repetition    = [AndOp / NotOp / RepOp] (Group / Option / BasicElement / BasicElementError)
// BasicElement  = UdtOp   /
//                 RnmOp   /
//                 TrgOp   /
//                 TbsOp   /
//                 TlsOp   /
//                 ClsOp   /
//                 ProsVal
// BasicElementError = 1*(%d33-40/%d42-46/%d48-92/%d94-126)
// 					; all chars up to next space(%d32, CatOp), ')'(%d41, group close), '/'(%d47, AltOp), ']'(%d93, option close) or line end
// Group         = GroupOpen  Alternation (GroupClose / GroupError)
// GroupError    = 1*(%d33-40/%d42-46/%d48-92/%d94-126) ; same as BasicElementError
// GroupOpen     = %d40 owsp
// GroupClose    = owsp %d41
// Option        = OptionOpen Alternation (OptionClose / OptionError)
// OptionError   = 1*(%d33-40/%d42-46/%d48-92/%d94-126) ; same as BasicElementError
// OptionOpen    = %d91 owsp
// OptionClose   = owsp %d93
// RnmOp         = alphanum
// UdtOp         = udt-empty / udt-non-empty
// udt-non-empty = %d117.95 alphanum
// udt-empty     = %d101.95 alphanum
// RepOp         = (rep-min StarOp rep-max) /
//                 (rep-min StarOp)         /
//                 (StarOp rep-max)         /
//                  StarOp                  /
//                  rep-min-max
// AltOp         = %d47 owsp
// CatOp         = wsp
// StarOp        = %d42
// AndOp         = %d38
// NotOp         = %d33
// TrgOp         = %d37 ((Dec dmin %d45 dmax) / (Hex xmin %d45 xmax) / (Bin bmin %d45 bmax))
// TbsOp         = %d37 ((Dec dString *(%d46 dString)) / (Hex xString *(%d46 xString)) / (Bin bString *(%d46 bString)))
// TlsOp         = TlsOpen TlsString TlsClose
// TlsOpen       = %d34
// TlsClose      = %d34
// TlsString     = *(%d32-33/%d35-126/StringTab)
// StringTab     = %d9
// ClsOp         = ClsOpen ClsString ClsClose
// ClsOpen       = %d39
// ClsClose      = %d39
// ClsString     = *(%d32-38/%d40-126/StringTab)
// ProsVal       = ProsValOpen ProsValString ProsValClose
// ProsValOpen   = %d60
// ProsValString = *(%d32-61/%d63-126/StringTab)
// ProsValClose  = %d62
// 
// rep-min       = rep-num
// rep-min-max   = rep-num
// rep-max       = rep-num
// rep-num       = 1*(%d48-57)
// dString       = dnum
// xString       = xnum
// bString       = bnum
// Dec           = (%d68/%d100)
// Hex           = (%d88/%d120)
// Bin           = (%d66/%d98)
// dmin          = dnum
// dmax          = dnum
// bmin          = bnum
// bmax          = bnum
// xmin          = xnum
// xmax          = xnum
// dnum          = 1*(%d48-57)
// bnum          = 1*%d48-49
// xnum          = 1*(%d48-57 / %d65-70 / %d97-102)
// 
// ; Basics
// alphanum      = (%d97-122/%d65-90) *(%d97-122/%d65-90/%d48-57/%d45)
// owsp          = *space
// wsp           = 1*space
// space         = %d32 / %d9 / comment /  LineContinue
// comment       = %d59 *(%d32-126 / %d9)
// LineEnd       = %d13.10 / %d10 / %d13
// LineContinue  = (%d13.10 / %d10 / %d13) (%d32 / %d9)
