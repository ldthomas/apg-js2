"use strict";

module.exports = function(){

    // SUMMARY
    //      rules = 10
    //       udts = 0
    //    opcodes = 31
    //        ALT = 5
    //        CAT = 2
    //        RNM = 11
    //        UDT = 0
    //        REP = 4
    //        AND = 0
    //        NOT = 0
    //        TLS = 0
    //        TBS = 4
    //        TRG = 5
    // characters = [0 - 255]

    // CALLBACK LIST PROTOTYPE (true, false or function reference)
    this.callbacks = [];
    this.callbacks['cr'] = false;
    this.callbacks['crlf'] = false;
    this.callbacks['end'] = false;
    this.callbacks['file'] = false;
    this.callbacks['invalid'] = false;
    this.callbacks['last-line'] = false;
    this.callbacks['lf'] = false;
    this.callbacks['line'] = false;
    this.callbacks['line-text'] = false;
    this.callbacks['valid'] = false;

    // OBJECT IDENTIFIER (for internal parser use)
    this.grammarObject = 'grammarObject';

    // RULES
    this.rules = [];
    this.rules[0] = {name: 'file', lower: 'file', index: 0};
    this.rules[1] = {name: 'line', lower: 'line', index: 1};
    this.rules[2] = {name: 'line-text', lower: 'line-text', index: 2};
    this.rules[3] = {name: 'last-line', lower: 'last-line', index: 3};
    this.rules[4] = {name: 'valid', lower: 'valid', index: 4};
    this.rules[5] = {name: 'invalid', lower: 'invalid', index: 5};
    this.rules[6] = {name: 'end', lower: 'end', index: 6};
    this.rules[7] = {name: 'CRLF', lower: 'crlf', index: 7};
    this.rules[8] = {name: 'LF', lower: 'lf', index: 8};
    this.rules[9] = {name: 'CR', lower: 'cr', index: 9};

    // UDTS
    this.udts = [];

    // OPCODES
    // file
    this.rules[0].opcodes = [];
    this.rules[0].opcodes[0] = {type: 2, children: [1,3]};// CAT
    this.rules[0].opcodes[1] = {type: 3, min: 0, max: Infinity};// REP
    this.rules[0].opcodes[2] = {type: 4, index: 1};// RNM(line)
    this.rules[0].opcodes[3] = {type: 3, min: 0, max: 1};// REP
    this.rules[0].opcodes[4] = {type: 4, index: 3};// RNM(last-line)

    // line
    this.rules[1].opcodes = [];
    this.rules[1].opcodes[0] = {type: 2, children: [1,2]};// CAT
    this.rules[1].opcodes[1] = {type: 4, index: 2};// RNM(line-text)
    this.rules[1].opcodes[2] = {type: 4, index: 6};// RNM(end)

    // line-text
    this.rules[2].opcodes = [];
    this.rules[2].opcodes[0] = {type: 3, min: 0, max: Infinity};// REP
    this.rules[2].opcodes[1] = {type: 1, children: [2,3]};// ALT
    this.rules[2].opcodes[2] = {type: 4, index: 4};// RNM(valid)
    this.rules[2].opcodes[3] = {type: 4, index: 5};// RNM(invalid)

    // last-line
    this.rules[3].opcodes = [];
    this.rules[3].opcodes[0] = {type: 3, min: 1, max: Infinity};// REP
    this.rules[3].opcodes[1] = {type: 1, children: [2,3]};// ALT
    this.rules[3].opcodes[2] = {type: 4, index: 4};// RNM(valid)
    this.rules[3].opcodes[3] = {type: 4, index: 5};// RNM(invalid)

    // valid
    this.rules[4].opcodes = [];
    this.rules[4].opcodes[0] = {type: 1, children: [1,2]};// ALT
    this.rules[4].opcodes[1] = {type: 8, min: 32, max: 126};// TRG
    this.rules[4].opcodes[2] = {type: 10, string: [9]};// TBS

    // invalid
    this.rules[5].opcodes = [];
    this.rules[5].opcodes[0] = {type: 1, children: [1,2,3,4]};// ALT
    this.rules[5].opcodes[1] = {type: 8, min: 0, max: 8};// TRG
    this.rules[5].opcodes[2] = {type: 8, min: 11, max: 12};// TRG
    this.rules[5].opcodes[3] = {type: 8, min: 14, max: 31};// TRG
    this.rules[5].opcodes[4] = {type: 8, min: 127, max: 255};// TRG

    // end
    this.rules[6].opcodes = [];
    this.rules[6].opcodes[0] = {type: 1, children: [1,2,3]};// ALT
    this.rules[6].opcodes[1] = {type: 4, index: 7};// RNM(CRLF)
    this.rules[6].opcodes[2] = {type: 4, index: 8};// RNM(LF)
    this.rules[6].opcodes[3] = {type: 4, index: 9};// RNM(CR)

    // CRLF
    this.rules[7].opcodes = [];
    this.rules[7].opcodes[0] = {type: 10, string: [13,10]};// TBS

    // LF
    this.rules[8].opcodes = [];
    this.rules[8].opcodes[0] = {type: 10, string: [10]};// TBS

    // CR
    this.rules[9].opcodes = [];
    this.rules[9].opcodes[0] = {type: 10, string: [13]};// TBS
}

// INPUT GRAMMAR FILE(s)
//
// file = *line [last-line]
// line = line-text end
// line-text = *(valid/invalid)
// last-line = 1*(valid/invalid)
// valid = %d32-126 / %d9
// invalid = %d0-8 / %d11-12 /%d14-31 / %d127-255
// end = CRLF / LF / CR
// CRLF = %d13.10
// LF = %d10
// CR = %d13
