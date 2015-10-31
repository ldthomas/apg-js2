"use strict";

module.exports = function(){

    // SUMMARY
    //      rules = 18
    //       udts = 0
    //    opcodes = 73
    //        ALT = 9
    //        CAT = 7
    //        RNM = 23
    //        UDT = 0
    //        REP = 10
    //        AND = 2
    //        NOT = 0
    //        TLS = 3
    //        TBS = 11
    //        TRG = 8
    // characters = [9 - 126]

    // CALLBACK LIST PROTOTYPE (true, false or function reference)
    this.callbacks = [];
    this.callbacks['any-no-dquote'] = false;
    this.callbacks['any-no-space'] = false;
    this.callbacks['any-no-squote'] = false;
    this.callbacks['any-safe'] = false;
    this.callbacks['any-token'] = false;
    this.callbacks['comment'] = false;
    this.callbacks['dquote'] = false;
    this.callbacks['dtoken'] = false;
    this.callbacks['dvalue'] = false;
    this.callbacks['file'] = false;
    this.callbacks['line-end'] = false;
    this.callbacks['owsp'] = false;
    this.callbacks['sp'] = false;
    this.callbacks['squote'] = false;
    this.callbacks['stoken'] = false;
    this.callbacks['svalue'] = false;
    this.callbacks['token'] = false;
    this.callbacks['wsp'] = false;

    // OBJECT IDENTIFIER (for internal parser use)
    this.grammarObject = 'grammarObject';

    // RULES
    this.rules = [];
    this.rules[0] = {name: 'file', lower: 'file', index: 0};
    this.rules[1] = {name: 'any-token', lower: 'any-token', index: 1};
    this.rules[2] = {name: 'token', lower: 'token', index: 2};
    this.rules[3] = {name: 'stoken', lower: 'stoken', index: 3};
    this.rules[4] = {name: 'dtoken', lower: 'dtoken', index: 4};
    this.rules[5] = {name: 'svalue', lower: 'svalue', index: 5};
    this.rules[6] = {name: 'dvalue', lower: 'dvalue', index: 6};
    this.rules[7] = {name: 'squote', lower: 'squote', index: 7};
    this.rules[8] = {name: 'dquote', lower: 'dquote', index: 8};
    this.rules[9] = {name: 'any-safe', lower: 'any-safe', index: 9};
    this.rules[10] = {name: 'any-no-space', lower: 'any-no-space', index: 10};
    this.rules[11] = {name: 'any-no-squote', lower: 'any-no-squote', index: 11};
    this.rules[12] = {name: 'any-no-dquote', lower: 'any-no-dquote', index: 12};
    this.rules[13] = {name: 'line-end', lower: 'line-end', index: 13};
    this.rules[14] = {name: 'comment', lower: 'comment', index: 14};
    this.rules[15] = {name: 'sp', lower: 'sp', index: 15};
    this.rules[16] = {name: 'wsp', lower: 'wsp', index: 16};
    this.rules[17] = {name: 'owsp', lower: 'owsp', index: 17};

    // UDTS
    this.udts = [];

    // OPCODES
    // file
    this.rules[0].opcodes = [];
    this.rules[0].opcodes[0] = {type: 2, children: [1,2,9]};// CAT
    this.rules[0].opcodes[1] = {type: 4, index: 17};// RNM(owsp)
    this.rules[0].opcodes[2] = {type: 3, min: 0, max: 1};// REP
    this.rules[0].opcodes[3] = {type: 2, children: [4,5]};// CAT
    this.rules[0].opcodes[4] = {type: 4, index: 1};// RNM(any-token)
    this.rules[0].opcodes[5] = {type: 3, min: 0, max: Infinity};// REP
    this.rules[0].opcodes[6] = {type: 2, children: [7,8]};// CAT
    this.rules[0].opcodes[7] = {type: 4, index: 16};// RNM(wsp)
    this.rules[0].opcodes[8] = {type: 4, index: 1};// RNM(any-token)
    this.rules[0].opcodes[9] = {type: 4, index: 17};// RNM(owsp)

    // any-token
    this.rules[1].opcodes = [];
    this.rules[1].opcodes[0] = {type: 3, min: 1, max: Infinity};// REP
    this.rules[1].opcodes[1] = {type: 1, children: [2,3,4]};// ALT
    this.rules[1].opcodes[2] = {type: 4, index: 4};// RNM(dtoken)
    this.rules[1].opcodes[3] = {type: 4, index: 3};// RNM(stoken)
    this.rules[1].opcodes[4] = {type: 4, index: 2};// RNM(token)

    // token
    this.rules[2].opcodes = [];
    this.rules[2].opcodes[0] = {type: 3, min: 1, max: Infinity};// REP
    this.rules[2].opcodes[1] = {type: 4, index: 9};// RNM(any-safe)

    // stoken
    this.rules[3].opcodes = [];
    this.rules[3].opcodes[0] = {type: 2, children: [1,2,3]};// CAT
    this.rules[3].opcodes[1] = {type: 4, index: 7};// RNM(squote)
    this.rules[3].opcodes[2] = {type: 4, index: 5};// RNM(svalue)
    this.rules[3].opcodes[3] = {type: 1, children: [4,5,7]};// ALT
    this.rules[3].opcodes[4] = {type: 4, index: 7};// RNM(squote)
    this.rules[3].opcodes[5] = {type: 6};// AND
    this.rules[3].opcodes[6] = {type: 4, index: 13};// RNM(line-end)
    this.rules[3].opcodes[7] = {type: 9, string: []};// TLS

    // dtoken
    this.rules[4].opcodes = [];
    this.rules[4].opcodes[0] = {type: 2, children: [1,2,3]};// CAT
    this.rules[4].opcodes[1] = {type: 4, index: 8};// RNM(dquote)
    this.rules[4].opcodes[2] = {type: 4, index: 6};// RNM(dvalue)
    this.rules[4].opcodes[3] = {type: 1, children: [4,5,7]};// ALT
    this.rules[4].opcodes[4] = {type: 4, index: 8};// RNM(dquote)
    this.rules[4].opcodes[5] = {type: 6};// AND
    this.rules[4].opcodes[6] = {type: 4, index: 13};// RNM(line-end)
    this.rules[4].opcodes[7] = {type: 9, string: []};// TLS

    // svalue
    this.rules[5].opcodes = [];
    this.rules[5].opcodes[0] = {type: 3, min: 0, max: Infinity};// REP
    this.rules[5].opcodes[1] = {type: 4, index: 11};// RNM(any-no-squote)

    // dvalue
    this.rules[6].opcodes = [];
    this.rules[6].opcodes[0] = {type: 3, min: 0, max: Infinity};// REP
    this.rules[6].opcodes[1] = {type: 4, index: 12};// RNM(any-no-dquote)

    // squote
    this.rules[7].opcodes = [];
    this.rules[7].opcodes[0] = {type: 10, string: [39]};// TBS

    // dquote
    this.rules[8].opcodes = [];
    this.rules[8].opcodes[0] = {type: 10, string: [34]};// TBS

    // any-safe
    this.rules[9].opcodes = [];
    this.rules[9].opcodes[0] = {type: 1, children: [1,2,3]};// ALT
    this.rules[9].opcodes[1] = {type: 10, string: [33]};// TBS
    this.rules[9].opcodes[2] = {type: 8, min: 35, max: 38};// TRG
    this.rules[9].opcodes[3] = {type: 8, min: 40, max: 126};// TRG

    // any-no-space
    this.rules[10].opcodes = [];
    this.rules[10].opcodes[0] = {type: 8, min: 33, max: 126};// TRG

    // any-no-squote
    this.rules[11].opcodes = [];
    this.rules[11].opcodes[0] = {type: 1, children: [1,2,3]};// ALT
    this.rules[11].opcodes[1] = {type: 8, min: 32, max: 38};// TRG
    this.rules[11].opcodes[2] = {type: 8, min: 40, max: 126};// TRG
    this.rules[11].opcodes[3] = {type: 10, string: [9]};// TBS

    // any-no-dquote
    this.rules[12].opcodes = [];
    this.rules[12].opcodes[0] = {type: 1, children: [1,2,3]};// ALT
    this.rules[12].opcodes[1] = {type: 8, min: 32, max: 33};// TRG
    this.rules[12].opcodes[2] = {type: 8, min: 35, max: 126};// TRG
    this.rules[12].opcodes[3] = {type: 10, string: [9]};// TBS

    // line-end
    this.rules[13].opcodes = [];
    this.rules[13].opcodes[0] = {type: 1, children: [1,2,3]};// ALT
    this.rules[13].opcodes[1] = {type: 10, string: [13,10]};// TBS
    this.rules[13].opcodes[2] = {type: 10, string: [10]};// TBS
    this.rules[13].opcodes[3] = {type: 10, string: [13]};// TBS

    // comment
    this.rules[14].opcodes = [];
    this.rules[14].opcodes[0] = {type: 2, children: [1,2]};// CAT
    this.rules[14].opcodes[1] = {type: 9, string: [35]};// TLS
    this.rules[14].opcodes[2] = {type: 3, min: 0, max: Infinity};// REP
    this.rules[14].opcodes[3] = {type: 1, children: [4,5]};// ALT
    this.rules[14].opcodes[4] = {type: 8, min: 32, max: 126};// TRG
    this.rules[14].opcodes[5] = {type: 10, string: [9]};// TBS

    // sp
    this.rules[15].opcodes = [];
    this.rules[15].opcodes[0] = {type: 1, children: [1,2,3]};// ALT
    this.rules[15].opcodes[1] = {type: 10, string: [32]};// TBS
    this.rules[15].opcodes[2] = {type: 10, string: [9]};// TBS
    this.rules[15].opcodes[3] = {type: 2, children: [4,6]};// CAT
    this.rules[15].opcodes[4] = {type: 3, min: 0, max: 1};// REP
    this.rules[15].opcodes[5] = {type: 4, index: 14};// RNM(comment)
    this.rules[15].opcodes[6] = {type: 4, index: 13};// RNM(line-end)

    // wsp
    this.rules[16].opcodes = [];
    this.rules[16].opcodes[0] = {type: 3, min: 1, max: Infinity};// REP
    this.rules[16].opcodes[1] = {type: 4, index: 15};// RNM(sp)

    // owsp
    this.rules[17].opcodes = [];
    this.rules[17].opcodes[0] = {type: 3, min: 0, max: Infinity};// REP
    this.rules[17].opcodes[1] = {type: 4, index: 15};// RNM(sp)
}

// INPUT GRAMMAR FILE(s)
//
// ;*******************************************************************************
// ;  APG - an ABNF Parser Generator
// ;  JavaScript APG Version 2.0.0
// ;  Copyright (C) 2015 Lowell D. Thomas, all rights reserved
// ;
// ;  author:  Lowell D. Thomas
// ;  email:   lowell@coasttocoastresearch.com
// ;*******************************************************************************
// ;
// ; Syntax of a file of Generator arguments.
// ;
// ; 1. arguments are tokens of printing characters (9, 32-126)
// ; 2. arguments are separated by spaces, tabs or line ends
// ; 3. a line end can be a CRLF pair, a single LF or a single CR
// ; 2. tokens with spaces or tabs must be quoted ("ab c" or 'ab c')
// ; 3. quoted strings may have leading unquoted characters (abc"xyz")
// ; 4. quoted strings end with a matching quote or a line end ("abc defLF)
// ;
// ; Quoted strings are identified so that quotes can be removed
// ; in the same way the main() program does with its arguments.
// ;
// file 		= owsp [any-token *(wsp any-token)] owsp
// any-token 	= 1*(dtoken / stoken / token)
// token 		= 1*any-safe 
// stoken 		= squote svalue (squote / &line-end / "")
// dtoken 		= dquote dvalue (dquote / &line-end / "")
// svalue      = *any-no-squote
// dvalue      = *any-no-dquote
// squote 		= %d39
// dquote 		= %d34
// 
// any-safe 		= %d33 / %d35-38 / %d40-126 ; any printing character except space, single or double quote
// any-no-space 	= %d33-126 					; any printing character except space
// any-no-squote 	= %d32-38 / %d40-126 / %d9		; any printing character except single quote
// any-no-dquote 	= %d32-33 / %d35-126 / %d9 		; any printing character except double quote
// 
// ; core
// line-end 	= %d13.10 / %d10 / %d13
// comment     = "#" *(%d32-126/%d9)
// sp 			= %d32 / %d9 / [comment] line-end
// wsp 		= 1*sp
// owsp 		= *sp
