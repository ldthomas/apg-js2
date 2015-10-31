"use strict";

module.exports = function(){

    // SUMMARY
    //      rules = 32
    //       udts = 0
    //    opcodes = 134
    //        ALT = 17
    //        CAT = 18
    //        RNM = 42
    //        UDT = 0
    //        REP = 8
    //        AND = 0
    //        NOT = 0
    //        TLS = 6
    //        TBS = 34
    //        TRG = 9
    // characters = [10 - 126]

    // CALLBACK LIST PROTOTYPE (true, false or function reference)
    this.callbacks = [];
    this.callbacks['c-lang'] = false;
    this.callbacks['c-long'] = false;
    this.callbacks['c-short'] = false;
    this.callbacks['cdvalue'] = false;
    this.callbacks['compressed'] = false;
    this.callbacks['cpp-lang'] = false;
    this.callbacks['cpp-long'] = false;
    this.callbacks['cpp-short'] = false;
    this.callbacks['crlf'] = false;
    this.callbacks['file'] = false;
    this.callbacks['flag-param'] = false;
    this.callbacks['help'] = false;
    this.callbacks['html'] = false;
    this.callbacks['html-long'] = false;
    this.callbacks['html-short'] = false;
    this.callbacks['in'] = false;
    this.callbacks['in-long'] = false;
    this.callbacks['in-short'] = false;
    this.callbacks['invalue'] = false;
    this.callbacks['java-lang'] = false;
    this.callbacks['java-long'] = false;
    this.callbacks['java-short'] = false;
    this.callbacks['js-lang'] = false;
    this.callbacks['js-long'] = false;
    this.callbacks['js-short'] = false;
    this.callbacks['linefeed'] = false;
    this.callbacks['other'] = false;
    this.callbacks['param'] = false;
    this.callbacks['strict'] = false;
    this.callbacks['value'] = false;
    this.callbacks['value-param'] = false;
    this.callbacks['version'] = false;

    // OBJECT IDENTIFIER (for internal parser use)
    this.grammarObject = 'grammarObject';

    // RULES
    this.rules = [];
    this.rules[0] = {name: 'file', lower: 'file', index: 0};
    this.rules[1] = {name: 'param', lower: 'param', index: 1};
    this.rules[2] = {name: 'other', lower: 'other', index: 2};
    this.rules[3] = {name: 'flag-param', lower: 'flag-param', index: 3};
    this.rules[4] = {name: 'value-param', lower: 'value-param', index: 4};
    this.rules[5] = {name: 'help', lower: 'help', index: 5};
    this.rules[6] = {name: 'version', lower: 'version', index: 6};
    this.rules[7] = {name: 'strict', lower: 'strict', index: 7};
    this.rules[8] = {name: 'crlf', lower: 'crlf', index: 8};
    this.rules[9] = {name: 'linefeed', lower: 'linefeed', index: 9};
    this.rules[10] = {name: 'compressed', lower: 'compressed', index: 10};
    this.rules[11] = {name: 'in', lower: 'in', index: 11};
    this.rules[12] = {name: 'in-long', lower: 'in-long', index: 12};
    this.rules[13] = {name: 'in-short', lower: 'in-short', index: 13};
    this.rules[14] = {name: 'html', lower: 'html', index: 14};
    this.rules[15] = {name: 'html-long', lower: 'html-long', index: 15};
    this.rules[16] = {name: 'html-short', lower: 'html-short', index: 16};
    this.rules[17] = {name: 'c-lang', lower: 'c-lang', index: 17};
    this.rules[18] = {name: 'c-long', lower: 'c-long', index: 18};
    this.rules[19] = {name: 'c-short', lower: 'c-short', index: 19};
    this.rules[20] = {name: 'cpp-lang', lower: 'cpp-lang', index: 20};
    this.rules[21] = {name: 'cpp-long', lower: 'cpp-long', index: 21};
    this.rules[22] = {name: 'cpp-short', lower: 'cpp-short', index: 22};
    this.rules[23] = {name: 'js-lang', lower: 'js-lang', index: 23};
    this.rules[24] = {name: 'js-long', lower: 'js-long', index: 24};
    this.rules[25] = {name: 'js-short', lower: 'js-short', index: 25};
    this.rules[26] = {name: 'java-lang', lower: 'java-lang', index: 26};
    this.rules[27] = {name: 'java-long', lower: 'java-long', index: 27};
    this.rules[28] = {name: 'java-short', lower: 'java-short', index: 28};
    this.rules[29] = {name: 'cdvalue', lower: 'cdvalue', index: 29};
    this.rules[30] = {name: 'invalue', lower: 'invalue', index: 30};
    this.rules[31] = {name: 'value', lower: 'value', index: 31};

    // UDTS
    this.udts = [];

    // OPCODES
    // file
    this.rules[0].opcodes = [];
    this.rules[0].opcodes[0] = {type: 3, min: 0, max: Infinity};// REP
    this.rules[0].opcodes[1] = {type: 4, index: 1};// RNM(param)

    // param
    this.rules[1].opcodes = [];
    this.rules[1].opcodes[0] = {type: 2, children: [1,5]};// CAT
    this.rules[1].opcodes[1] = {type: 1, children: [2,3,4]};// ALT
    this.rules[1].opcodes[2] = {type: 4, index: 4};// RNM(value-param)
    this.rules[1].opcodes[3] = {type: 4, index: 3};// RNM(flag-param)
    this.rules[1].opcodes[4] = {type: 4, index: 2};// RNM(other)
    this.rules[1].opcodes[5] = {type: 10, string: [10]};// TBS

    // other
    this.rules[2].opcodes = [];
    this.rules[2].opcodes[0] = {type: 3, min: 1, max: Infinity};// REP
    this.rules[2].opcodes[1] = {type: 8, min: 32, max: 126};// TRG

    // flag-param
    this.rules[3].opcodes = [];
    this.rules[3].opcodes[0] = {type: 1, children: [1,2,3,4,5,6]};// ALT
    this.rules[3].opcodes[1] = {type: 4, index: 10};// RNM(compressed)
    this.rules[3].opcodes[2] = {type: 4, index: 5};// RNM(help)
    this.rules[3].opcodes[3] = {type: 4, index: 6};// RNM(version)
    this.rules[3].opcodes[4] = {type: 4, index: 7};// RNM(strict)
    this.rules[3].opcodes[5] = {type: 4, index: 8};// RNM(crlf)
    this.rules[3].opcodes[6] = {type: 4, index: 9};// RNM(linefeed)

    // value-param
    this.rules[4].opcodes = [];
    this.rules[4].opcodes[0] = {type: 1, children: [1,2,3,4,5,6]};// ALT
    this.rules[4].opcodes[1] = {type: 4, index: 11};// RNM(in)
    this.rules[4].opcodes[2] = {type: 4, index: 14};// RNM(html)
    this.rules[4].opcodes[3] = {type: 4, index: 20};// RNM(cpp-lang)
    this.rules[4].opcodes[4] = {type: 4, index: 17};// RNM(c-lang)
    this.rules[4].opcodes[5] = {type: 4, index: 23};// RNM(js-lang)
    this.rules[4].opcodes[6] = {type: 4, index: 26};// RNM(java-lang)

    // help
    this.rules[5].opcodes = [];
    this.rules[5].opcodes[0] = {type: 1, children: [1,2,3]};// ALT
    this.rules[5].opcodes[1] = {type: 10, string: [45,104]};// TBS
    this.rules[5].opcodes[2] = {type: 10, string: [45,45,104,101,108,112]};// TBS
    this.rules[5].opcodes[3] = {type: 10, string: [63]};// TBS

    // version
    this.rules[6].opcodes = [];
    this.rules[6].opcodes[0] = {type: 1, children: [1,2]};// ALT
    this.rules[6].opcodes[1] = {type: 10, string: [45,118]};// TBS
    this.rules[6].opcodes[2] = {type: 10, string: [45,45,118,101,114,115,105,111,110]};// TBS

    // strict
    this.rules[7].opcodes = [];
    this.rules[7].opcodes[0] = {type: 1, children: [1,2]};// ALT
    this.rules[7].opcodes[1] = {type: 10, string: [45,115]};// TBS
    this.rules[7].opcodes[2] = {type: 10, string: [45,45,115,116,114,105,99,116]};// TBS

    // crlf
    this.rules[8].opcodes = [];
    this.rules[8].opcodes[0] = {type: 1, children: [1,2]};// ALT
    this.rules[8].opcodes[1] = {type: 10, string: [45,114]};// TBS
    this.rules[8].opcodes[2] = {type: 10, string: [45,45,67,82,76,70]};// TBS

    // linefeed
    this.rules[9].opcodes = [];
    this.rules[9].opcodes[0] = {type: 1, children: [1,2]};// ALT
    this.rules[9].opcodes[1] = {type: 10, string: [45,108]};// TBS
    this.rules[9].opcodes[2] = {type: 10, string: [45,45,76,70]};// TBS

    // compressed
    this.rules[10].opcodes = [];
    this.rules[10].opcodes[0] = {type: 2, children: [1,2]};// CAT
    this.rules[10].opcodes[1] = {type: 10, string: [45]};// TBS
    this.rules[10].opcodes[2] = {type: 3, min: 1, max: Infinity};// REP
    this.rules[10].opcodes[3] = {type: 1, children: [4,5]};// ALT
    this.rules[10].opcodes[4] = {type: 8, min: 97, max: 122};// TRG
    this.rules[10].opcodes[5] = {type: 8, min: 65, max: 90};// TRG

    // in
    this.rules[11].opcodes = [];
    this.rules[11].opcodes[0] = {type: 1, children: [1,2]};// ALT
    this.rules[11].opcodes[1] = {type: 4, index: 13};// RNM(in-short)
    this.rules[11].opcodes[2] = {type: 4, index: 12};// RNM(in-long)

    // in-long
    this.rules[12].opcodes = [];
    this.rules[12].opcodes[0] = {type: 2, children: [1,2]};// CAT
    this.rules[12].opcodes[1] = {type: 10, string: [45,45,105,110,61]};// TBS
    this.rules[12].opcodes[2] = {type: 4, index: 29};// RNM(cdvalue)

    // in-short
    this.rules[13].opcodes = [];
    this.rules[13].opcodes[0] = {type: 2, children: [1,2,3,4]};// CAT
    this.rules[13].opcodes[1] = {type: 10, string: [45]};// TBS
    this.rules[13].opcodes[2] = {type: 9, string: [105,110]};// TLS
    this.rules[13].opcodes[3] = {type: 10, string: [10]};// TBS
    this.rules[13].opcodes[4] = {type: 4, index: 29};// RNM(cdvalue)

    // html
    this.rules[14].opcodes = [];
    this.rules[14].opcodes[0] = {type: 1, children: [1,2]};// ALT
    this.rules[14].opcodes[1] = {type: 4, index: 16};// RNM(html-short)
    this.rules[14].opcodes[2] = {type: 4, index: 15};// RNM(html-long)

    // html-long
    this.rules[15].opcodes = [];
    this.rules[15].opcodes[0] = {type: 2, children: [1,2]};// CAT
    this.rules[15].opcodes[1] = {type: 10, string: [45,45,72,84,77,76,61]};// TBS
    this.rules[15].opcodes[2] = {type: 4, index: 31};// RNM(value)

    // html-short
    this.rules[16].opcodes = [];
    this.rules[16].opcodes[0] = {type: 2, children: [1,2,3,4]};// CAT
    this.rules[16].opcodes[1] = {type: 10, string: [45]};// TBS
    this.rules[16].opcodes[2] = {type: 9, string: [104,116,109,108]};// TLS
    this.rules[16].opcodes[3] = {type: 10, string: [10]};// TBS
    this.rules[16].opcodes[4] = {type: 4, index: 31};// RNM(value)

    // c-lang
    this.rules[17].opcodes = [];
    this.rules[17].opcodes[0] = {type: 1, children: [1,2]};// ALT
    this.rules[17].opcodes[1] = {type: 4, index: 19};// RNM(c-short)
    this.rules[17].opcodes[2] = {type: 4, index: 18};// RNM(c-long)

    // c-long
    this.rules[18].opcodes = [];
    this.rules[18].opcodes[0] = {type: 2, children: [1,2]};// CAT
    this.rules[18].opcodes[1] = {type: 10, string: [45,45,67,61]};// TBS
    this.rules[18].opcodes[2] = {type: 4, index: 31};// RNM(value)

    // c-short
    this.rules[19].opcodes = [];
    this.rules[19].opcodes[0] = {type: 2, children: [1,2,3,4]};// CAT
    this.rules[19].opcodes[1] = {type: 10, string: [45]};// TBS
    this.rules[19].opcodes[2] = {type: 9, string: [99]};// TLS
    this.rules[19].opcodes[3] = {type: 10, string: [10]};// TBS
    this.rules[19].opcodes[4] = {type: 4, index: 31};// RNM(value)

    // cpp-lang
    this.rules[20].opcodes = [];
    this.rules[20].opcodes[0] = {type: 1, children: [1,2]};// ALT
    this.rules[20].opcodes[1] = {type: 4, index: 22};// RNM(cpp-short)
    this.rules[20].opcodes[2] = {type: 4, index: 21};// RNM(cpp-long)

    // cpp-long
    this.rules[21].opcodes = [];
    this.rules[21].opcodes[0] = {type: 2, children: [1,2]};// CAT
    this.rules[21].opcodes[1] = {type: 10, string: [45,45,67,112,112,61]};// TBS
    this.rules[21].opcodes[2] = {type: 4, index: 31};// RNM(value)

    // cpp-short
    this.rules[22].opcodes = [];
    this.rules[22].opcodes[0] = {type: 2, children: [1,2,3,4]};// CAT
    this.rules[22].opcodes[1] = {type: 10, string: [45]};// TBS
    this.rules[22].opcodes[2] = {type: 9, string: [99,112,112]};// TLS
    this.rules[22].opcodes[3] = {type: 10, string: [10]};// TBS
    this.rules[22].opcodes[4] = {type: 4, index: 31};// RNM(value)

    // js-lang
    this.rules[23].opcodes = [];
    this.rules[23].opcodes[0] = {type: 1, children: [1,2]};// ALT
    this.rules[23].opcodes[1] = {type: 4, index: 25};// RNM(js-short)
    this.rules[23].opcodes[2] = {type: 4, index: 24};// RNM(js-long)

    // js-long
    this.rules[24].opcodes = [];
    this.rules[24].opcodes[0] = {type: 2, children: [1,2]};// CAT
    this.rules[24].opcodes[1] = {type: 10, string: [45,45,74,97,118,97,83,99,114,105,112,116,61]};// TBS
    this.rules[24].opcodes[2] = {type: 4, index: 31};// RNM(value)

    // js-short
    this.rules[25].opcodes = [];
    this.rules[25].opcodes[0] = {type: 2, children: [1,2,3,4]};// CAT
    this.rules[25].opcodes[1] = {type: 10, string: [45]};// TBS
    this.rules[25].opcodes[2] = {type: 9, string: [106,115]};// TLS
    this.rules[25].opcodes[3] = {type: 10, string: [10]};// TBS
    this.rules[25].opcodes[4] = {type: 4, index: 31};// RNM(value)

    // java-lang
    this.rules[26].opcodes = [];
    this.rules[26].opcodes[0] = {type: 1, children: [1,2]};// ALT
    this.rules[26].opcodes[1] = {type: 4, index: 28};// RNM(java-short)
    this.rules[26].opcodes[2] = {type: 4, index: 27};// RNM(java-long)

    // java-long
    this.rules[27].opcodes = [];
    this.rules[27].opcodes[0] = {type: 2, children: [1,2]};// CAT
    this.rules[27].opcodes[1] = {type: 10, string: [45,45,74,97,118,97,61]};// TBS
    this.rules[27].opcodes[2] = {type: 4, index: 31};// RNM(value)

    // java-short
    this.rules[28].opcodes = [];
    this.rules[28].opcodes[0] = {type: 2, children: [1,2,3,4]};// CAT
    this.rules[28].opcodes[1] = {type: 10, string: [45]};// TBS
    this.rules[28].opcodes[2] = {type: 9, string: [106,97,118,97]};// TLS
    this.rules[28].opcodes[3] = {type: 10, string: [10]};// TBS
    this.rules[28].opcodes[4] = {type: 4, index: 31};// RNM(value)

    // cdvalue
    this.rules[29].opcodes = [];
    this.rules[29].opcodes[0] = {type: 2, children: [1,2]};// CAT
    this.rules[29].opcodes[1] = {type: 4, index: 30};// RNM(invalue)
    this.rules[29].opcodes[2] = {type: 3, min: 0, max: Infinity};// REP
    this.rules[29].opcodes[3] = {type: 2, children: [4,6,7,9]};// CAT
    this.rules[29].opcodes[4] = {type: 3, min: 0, max: Infinity};// REP
    this.rules[29].opcodes[5] = {type: 10, string: [32]};// TBS
    this.rules[29].opcodes[6] = {type: 10, string: [44]};// TBS
    this.rules[29].opcodes[7] = {type: 3, min: 0, max: Infinity};// REP
    this.rules[29].opcodes[8] = {type: 10, string: [32]};// TBS
    this.rules[29].opcodes[9] = {type: 4, index: 30};// RNM(invalue)

    // invalue
    this.rules[30].opcodes = [];
    this.rules[30].opcodes[0] = {type: 2, children: [1,4]};// CAT
    this.rules[30].opcodes[1] = {type: 1, children: [2,3]};// ALT
    this.rules[30].opcodes[2] = {type: 8, min: 33, max: 43};// TRG
    this.rules[30].opcodes[3] = {type: 8, min: 45, max: 126};// TRG
    this.rules[30].opcodes[4] = {type: 3, min: 0, max: Infinity};// REP
    this.rules[30].opcodes[5] = {type: 1, children: [6,7]};// ALT
    this.rules[30].opcodes[6] = {type: 8, min: 33, max: 43};// TRG
    this.rules[30].opcodes[7] = {type: 8, min: 45, max: 126};// TRG

    // value
    this.rules[31].opcodes = [];
    this.rules[31].opcodes[0] = {type: 2, children: [1,2]};// CAT
    this.rules[31].opcodes[1] = {type: 8, min: 32, max: 126};// TRG
    this.rules[31].opcodes[2] = {type: 3, min: 0, max: Infinity};// REP
    this.rules[31].opcodes[3] = {type: 8, min: 32, max: 126};// TRG
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
// ; Grammar for a command line of arguments.
// ; 
// ; Arguments will consist of main() arguments plus arguments extracted from any
// ; files appearing as @filename main() arguments.
// ; The list of arguments represented in this grammar will be tokens of printing
// ; characters separated by a special separator character (LF in this case).
// ; All quoted strings from the original command line or @filename command file
// ; will have been processed to remove the leading and trailing quotes.
// ; All tabs will have been converted to spaces.
// ;
// 
// ; This grammar describes a string of parameters.
// ; Flag parameters are single token parameters (e.g. --verbose)
// ; Value parameters can be single token (--in=<file>) or double token parameters (-in <file>)
// ; The string may be empty (no parameters).
// ;
// file       = *param
// param      = (value-param / flag-param / other) %d10
// other      = 1*%d32-126
// 
// flag-param = compressed
//            / help
//            / version
//            / strict
//            / crlf
//            / linefeed
// 
// value-param  = in
//              / html
//              / cpp-lang
//              / c-lang
//              / js-lang
//              / java-lang
// 
// ; flag parameters
// help            = (%d45.104 / %d45.45.104.101.108.112 / %d63 )
// 				;('-h'    / '--help' / '?')                        
// version         = (%d45.118 / %d45.45.118.101.114.115.105.111.110 )
// 				;('-v'    / '--version')
// strict          = (%d45.115 / %d45.45.115.116.114.105.99.116 )
// 				;('-s'   / '--strict')
// crlf            = (%d45.114 / %d45.45.67.82.76.70 )
// 				;('-r'   / '--CRLF')
// linefeed        = (%d45.108 / %d45.45.76.70 )
// 				;('-l'   / '--LF')
// compressed      = %d45 1*(%d97-122/%d65-90)
// 
// ; value parameters
// in			= in-short / in-long
// in-long		= (%d45.45.105.110.61 cdvalue)							;('--in=' comma-delimited values)
// in-short	= (%d45 "in" %d10 cdvalue)								;('-in '  comma-delimited values)
// html 		= html-short / html-long
// html-long	= (%d45.45.72.84.77.76.61  value)						;('--HTML=' 		value)
// html-short	= (%d45 "html" %d10  value)								;('-html ' 		   	value)
// c-lang 		= c-short / c-long
// c-long 		= (%d45.45.67.61 value)									;('--C=' 			value)
// c-short		= (%d45 "c" %d10 value)									;('-c ' 			value)
// cpp-lang 	= cpp-short / cpp-long
// cpp-long 	= (%d45.45.67.112.112.61 value)							;('--Cpp=' 			value)
// cpp-short 	= (%d45 "cpp" %d10 value)								;('-cpp ' 			value)
// js-lang 	= js-short / js-long
// js-long 	= (%d45.45.74.97.118.97.83.99.114.105.112.116.61 value)	;('--JavaScript='	value)
// js-short 	= (%d45 "js" %d10 value)									;('-js ' 	   		value)
// java-lang 	= java-short / java-long
// java-long 	= (%d45.45.74.97.118.97.61 value)						;('--Java=' 		value)
// java-short 	= (%d45 "java" %d10 value)								;('-java ' 		   	value)
// 
// ; core
// cdvalue = invalue *(*%d32 %d44 *%d32 invalue) 
// invalue = (%d33-43/%d45-126) *(%d33-43/%d45-126)
// value = %d32-126 *%d32-126
