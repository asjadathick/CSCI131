/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


// Identifiers of display areas in HTML page
var src = 0;                // Text area for code
// var outputsymtab = 0;       // Text area showing assembly output
var outputcode = 0;         // Text area showing generated code
var dumplisting = 0;
//var assemblyphase = 0;      // Span indicating assembly phase
//var line = 0;               // Span showing line being processed
//var processing = 0;         // Span showing what line thought to be
//
//
//var phase = 0; // Phase of processing (1 or 2)
// Control variable - set to true if processing should be aborted
//   loops should check this and exit prematurely if set.
// Gets set if find something in assembly source code that cannot recognise
var stop = 0;

// Current line number of input being processed
//   It is global, because sometimes processing a line might
//   require consuming the following line(s) as well.
var linenum = 0;
// Array with the individual lines from source input area.
var lines = 0;
// Number of lines in input
var inputlines = 0;

// Current address - gets set by origin directives
// gets updated as process instruction lines and directives like .even
// set to -1 (invalid) if have not yet encountered an origin directive
var currentaddress = 0;

// currentline - string with line being processed, gets truncated from front
// as recognize elements
var currentline = 0;
// symbol - input element that have next extracted from line
var symbol = 0;

// errormessage - if problem found during parsing, loops should terminate
// and this should have details of error
//var errormessage = 0;

// memory array containing location value and line-info
var nmemory = 0;
var wordcount = 0;
var codeline = 0;  // Used when building up a line for code listing
var srcline = 0; // Also used when building line for code listing
var instructionpat = 0; // Used when building up instruction (from op-code and addressing)
var startaddress = 0;

function octval(str) {
    // str should be a string of [0-7] values
    // (don't require leading 0; interpreting all numerics as octal)
    // possible for string to have -ve sign
    var negative = false;
    if ('-' === str.charAt(0)) {
        negative = true;
        str = str.substr(1, str.length - 1);
    }
    // redundant check - should have been pattern matched earlier
    // but just in case
    var pat = new RegExp("^[0-7]+$");
    if (!pat.test(str))
        throw "Invalid octal constant on line " + linenum;
    var val = parseInt(str, 8);
    // Numeric values should not exceed 32767; could be entered with - sign
    // But there are exceptions like the device registers in the simulated
    // machine
    // Negative values?
    // Assuming that number representation is two's complement
    if (negative) {
        val = -val;
        val = val & 0177777;
    }

    return val;
}

function initializeInput() {
    // At start of assembly pass
    // Reset array containing lines with input code
    // and related variables
    var text = src.value;
    lines = text.split("\n");
    inputlines = lines.length;
    linenum = 0;
}

function tidy(str) {
    // Taking string from input and tidying it
    // This is just to make subsequent checks for characters simpler

    // Then replace any Tab characters by single space, also backslash r and backslash n
    var len = str.length;
    var i = 0;
    var tidy = "";
    for (i = 0; i < len; i++) {
        if (str.charAt(i) === '\t')
            tidy = tidy + " ";
        else
        if (str.charAt(i) === '\n')
            tidy = tidy + " ";
        else
        if (str.charAt(i) === '\r')
            tidy = tidy + " ";
        else
            tidy = tidy + str.charAt(i);
    }
    // And make sure that there is a trailing space on line
    if (tidy.charAt(len - 1) !== ' ')
        tidy = tidy + " ";
    // Remove leading spaces, compress sequence of spaces to single space
    var tidier = "";
    var lastch = "";
    // Don't compress space characters in doubly quoted strings
    var inquotes = false;
    for (i = 0; i < tidy.length; i++) {
        var ch = tidy.charAt(i);
        if(ch === '"') {
            inquotes = !inquotes;
        }
        if ((ch === " ") && (tidier === ""))
            continue; // skipping leading spaces
        else
        if ((ch === " ") && (lastch === " ") && !inquotes)
            continue; // sequence of spaces
        lastch = ch;
        tidier = tidier + ch;
    }
    // More tidying
    //    Declarations like val=3  val1 =4 val2 = 5
    //    easier if they all looked the same; remove spaces around = signs
    tidier = tidier.replace(/ *= */g, "=");
    // Similarly, remove any spaces around commas in comma separated lists
    tidier = tidier.replace(/ ,/g, ",");
    tidier = tidier.replace(/, /g, ",");
    // Colon only allowed as end of label; insist it is followe by a space
    if (/:[^ ]/.test(tidier))
        tidier = tidier.replace(/:/, ": ");
    // If line was blank, then set tidy to single space character
    if (tidier.length > 0)
        tidy = tidier;
    else
        tidy = " ";
    return tidy;
}

function getNextLine() {
    if (linenum === inputlines) {
        throw "Unexpected end of source text";
    }
    var linechars = lines[linenum];

    srcline = linechars;
    currentline = tidy(linechars);
    linenum++;
}

function badAddress() {
    if ((currentaddress < 0) || ((currentaddress % 2) === 1)) {
        throw "Missing origin directive, or odd address value, noted when at line " + linenum;
    }
}
function updateCurrentAddress(howmuch) {
    if (currentaddress < 0) {
        throw "No origin set for program";
    }
    else {
        currentaddress += howmuch;
        // Now I am imposing a restriction that only have word addresses
        // This would not have been conventional as byte addressing allowed
        // but the only time that would have been useful would be if had
        // two odd length byte sequences one after another.  Instructions
        // do have to go at word boundaries.
        if ((currentaddress % 2) === 1) {
            throw "No odd byte addresses please";
        }
    }
}

function matchDirective(str) {
    // Directives have form .letters
    var pat = new RegExp("^\\.[a-z]*$");
    return(pat.test(str));
}

function matchComment(str) {
    return (str.charAt(0) === ';');
}

function matchLabel(str) {
    var pat = new RegExp("^[a-z][a-z0-9_]*:$");
    return (pat.test(str));
}

function matchOctal(str) {
    var pat = new RegExp("^-?[0-7]+$");
    return (pat.test(str));
}

function matchInstruction(str) {
    var pat = new RegExp("^[a-z]+$");
    if (!pat.test(str))
        return false;
    var ndx = findSymbol(str);
    if (ndx < 0)
        return false;
    var symbol = getSymbol(ndx);
    return (symbol.type === "instruction");
}

function matchName(str) {
    var pat = new RegExp("^[a-z][a-z_0-9]*$");
    if (!pat.test(str))
        return false;
    // Name either in symbol table already as type label
    // or not yet present
    var ndx = findSymbol(str);
    if (ndx < 0)
        return true; // maybe it is some kind of forward reference
    var symbol = getSymbol(ndx);
    // name of a label - or possibly a constant
    return (symbol.type === "label") || (symbol.type==="constant");
}

function matchConstantDeclaration(str) {
    var pat = new RegExp("^[a-z][a-z_0-9]*=-?[0-7]+$");
    return pat.test(str);

}

function matchString(str) {
    var pat = new RegExp("^\"[A-Za-z0-9 ,\\.\\?\\-\\+\\*\\^\\|~<>;:=!'&/()]+\"$");
    return pat.test(str);
}

function grabLexeme() {
    // Consume characters in currentline until get space or comma
    // Remove this part from currentline
    // Problem - special case of doubly quoted string, these can contain
    // spaces or commas
    var i = 0;
    var lexstr = "";
    var ch = 0;
    var len = currentline.length;
    if (currentline.charAt(0) === '"') {
        // handling doubly quoted string - no escaped quotes allowed
        lexstr = '"';
        i++;
        for (; ; ) {
            ch = currentline.charAt(i);
            lexstr = lexstr + ch;
            if (ch === '"')
                break;
            i++;
	    if(i>=len) {
		throw "Confused by input on line " + linenum + "; possibly unpaired quotes";
		}
        }
        // Strip off the double quotes

       // var length = lexstr.length;

       // lexstr = lexstr.substring(1, length - 1);
       // Changed that - keep them so can distringuish strings from names

    }
    else {
        for (; ; ) {
            ch = currentline.charAt(i);
            if ((ch === ' ') || (ch === ',') )
                break;
            lexstr = lexstr + ch;
            i++;
		 if(i>=len) {
		break;
		}
        }
        // Force to lower case
        lexstr = lexstr.toLowerCase();
    }
    // trim currentline removing characters consumed
    currentline = currentline.substr(i + 1);
    return lexstr;
}

function getNextElement() {
    // Maybe there is nothing left on the input line
    if (currentline === "")
        return null;
    var lexstr = grabLexeme();
    //alert(lexstr);
    var obj = new Object();
    if (matchComment(lexstr)) {
        obj.type = "comment";
    }
    else
    if (matchDirective(lexstr)) {
        obj.value = lexstr;
        obj.type = "directive";
    }
    else
    if (matchLabel(lexstr)) {
        obj.type = "label";
        obj.value = lexstr.substr(0, lexstr.length - 1);
    }
    else
    if (matchInstruction(lexstr)) {
        obj.value = lexstr;
        obj.type = "instruction";
    }
    else
    if (matchName(lexstr)) {
        obj.value = lexstr;
        obj.type = "name";
    }
    else
    if (matchOctal(lexstr)) {
        obj.value = lexstr;
        obj.type = "number";
    }
    else
    if (matchConstantDeclaration(lexstr)) {
        obj.value = lexstr;
        obj.type = "constant";
    }
    else
    if (matchString(lexstr)) {
        obj.value = lexstr;
        obj.type = "string";
    }
    else {
        throw "Don't know what this is :" + lexstr + " on line " + linenum;
    }
    //alert(obj.type);
    return obj;
}

function p1_process_constant(anobj) {
    // Pass 1 only, dealing with definition of a constant e.g. n=70
    // Try adding constant to symbol table
    // Check that rest of input line is either empty or a comment
    var str = anobj.value;
    var parts = str.split("=");
    var name = parts[0];
    var val = octval(parts[1]);
    // Better not already have something defined with this name
    var ndx = findSymbol(name);
    if (ndx >= 0) {
        throw "Illegal declaration of constant " + name;
    }
    var nextelement = getNextElement();
    if (!emptyOrComment(nextelement)) {
        // Somethine else on this line
        throw "Confused by input on line " + linenum;
    }
    obj = new Object();
    obj.type = "constant";
    obj.name = name;
    obj.value = val;
    addSymbol(obj);
}



function emptyOrComment(elem) {
    return ((elem === null) || (elem.type === "comment"));
}

function p1_process_origin() {
    // Must get a number as next element.
    var next = getNextElement();
    if ((next === null) || (next.type !== "number")) {
        throw  "Confused by value for origin directive in line " + linenum;
    }
    var val = octval(next.value);
    if ((val % 2) === 1) {
        throw "Odd value in origin directive not permitted";
    }
    currentaddress = val;
}

function p1_process_string() {
    // String directive must be followed by a string 
    // (which might get recognized as 'name' as that has priority
    var next = getNextElement();
    if ((next === null) || (next.type !== "string")) {
        throw "Confused by string directive without string in line " + linenum;
    }

    badAddress(); // Throws exception if something bad about address

    var str = next.value;
    var length = str.length;
    // Strip of the quotes here
    // var length = lexstr.length;

    str = str.substring(1, length - 1);
    length = length-2;
    if ((length % 2) === 1)
        length++;
    else
        length += 2;
    updateCurrentAddress(length);
// Ignore anything else on this line

}

function p1_process_blkw() {
    if (badAddress())
        return; // meaningless if no origin set
    // Next input must be a number, leave that number of zero words
    var next = getNextElement();
    if ((next === null) || (next.type !== "number")) {
        throw "Invalid blkw directive";
    }
    var str = next.value;
    var num = octval(str);  // number of words
    // Increment currentaddres by twice
    updateCurrentAddress(2 * num);
}

function p1_process_comma_values() {
    if (badAddress())
        return;
    currentaddress += 2;
    var next = getNextElement();
    if ((next === null) || (next.type === "comment"))
        return;
    if (!((next.type === "number") || (next.type === "name"))) {
        throw "Invalid data in .word style initialization block; " + next.value;
    }
    p1_process_comma_values();
}

function p1_process_word() {

    // Must get at least one number or name following .word
    var next = getNextElement();
    if ((next === null) || (!((next.type === "number") || (next.type === "name")))) {
        throw "Invalid word directive";
    }
    p1_process_comma_values();
}

function p1_process_directive(anobj) {
    var name = anobj.value;
    if (name === ".end")
        stop = true;
    else
    if (name === ".origin")
        p1_process_origin();
    else
    if (name === ".string")
        p1_process_string();
    else
    if (name === ".word")
        p1_process_word();
    else
    if (name === ".blkw")
        p1_process_blkw();
    else {
        throw "Unrecognized directive " + name;
    }
}

function p1_process_label(anobj) {
    // Trying to define a label - better have current location defined
    badAddress();
    // Add the label to the symbol table
    var name = anobj.value;
    // Better not exist already
    var ndx = findSymbol(name);
    if (ndx >= 0) {
        throw "Redefining label " + name;
    }
    var obj = new Object();
    obj.type = "label";
    obj.name = name;
    obj.value = currentaddress;
    addSymbol(obj);
    // Now process rest of line -
    // meaningful things are some directives, instructions, nothing
    // how about recursive call
    processElements1();
}

function p1_process_addrreg_instruction(addrpart) {
    // Should have a full address part, comma, register
    // (Things like MUL
    var parts = addrpart.split(",");
    var registerpat = /^(r[0-7]|sp|pc)$/;
    if (!registerpat.test(parts[1])) {
        throw "Invalid address data in line " + linenum;
    }
    // The other part, well that should be a simple 1-addr type
    p1_process_1addr_instruction(parts[0]);
}

function p1_process_regaddr_instruction(addrpart) {
    // Should have a simple register - r0 - r7, then comma, then full
    // address part
    // (Things like JSR and XOR
    var parts = addrpart.split(",");
    var registerpat = /^(r[0-7]|sp|pc)$/;
    if (!registerpat.test(parts[0])) {
        throw "Invalid address data in line " + linenum;
    }
    // The other part, well that should be a simple 1-addr type
    p1_process_1addr_instruction(parts[1]);

}

function p1_process_1addr_instruction(addrpart) {
    // Match all the possible syntaxes for instructions - including the
    // special versions where (r7) is implicit!
    var simpleregisterpat = /^@?(r[0-7]|sp|pc)$/;
    if (simpleregisterpat.test(addrpart))
        return; // No extra address words needed
    // Alternative format for register indirect
    var altformatpat = /^\((r[0-7]|sp|pc)\)$/;
    if(altformatpat.test(addrpart))
        return;
    var autoincrementpat = /^@?\((r[0-7]|sp|pc)\)\+$/;
    if (autoincrementpat.test(addrpart))
        return; // Same
    var autodecrementpat = /^@?-\((r[0-7]|sp|pc)\)$/;
    if (autodecrementpat.test(addrpart))
        return;
    var directregister1 = /^@?-?[0-7]+\((r[0-7]|sp|pc)\)$/;
    if (directregister1.test(addrpart)) {
        // the constant value will be stored in next word
        updateCurrentAddress(2);
        return;
    }
    var directregister2 = /^@?[a-z][a-z0-9_]*\((r[0-7]|sp|pc)\)$/;
    if (directregister2.test(addrpart)) {
        // the constant value will be stored in next word
        updateCurrentAddress(2);
        return;
    }
    // The following are variants of directregister1 and directregister2
    // that implicitly use (r7); actually combine several different modes
    var r7pat1a = /^@?#?[0-7]+$/;
    if (r7pat1a.test(addrpart)) {
        updateCurrentAddress(2);
        return;
    }
    var r7pat1b = /^@?#?[a-z][a-z0-9_]*$/;
    if (r7pat1b.test(addrpart)) {
        updateCurrentAddress(2);
        return;
    }
    throw "Unable to process address part " + addrpart + " at line " + linenum;
}

function p1_process_2addr_instruction(addrpart) {
    // Should have two address parts, separated by comma
    var parts = addrpart.split(",");
    // Process each individually
    p1_process_1addr_instruction(parts[0]);
    p1_process_1addr_instruction(parts[1]);
}

function grabAddressPart() {
    // Consume characters in currentline until get space
    // Can have letters, octal digits, left and right parens, plus and minus
    // signs, @ signs, and # signs (probably others as well though I cannot
    // think of them
    var i = 0;
    var lexstr = "";
    var ch = 0;

    for (; ; ) {
        ch = currentline.charAt(i);
        if (ch === ' ')
            break;
        lexstr = lexstr + ch;
        i++;
    }

    // trim currentline removing characters consumed
    currentline = currentline.substr(i + 1);
    return lexstr;
}

function p1_handle_special(elem) {
    /*
     * Need to deal with  call address (which is synonym for jsr r7, address)
     * rts reg (return from subroutine)
     * return (which is a synonym for rts r7)
     * rti (return from interrupt)
     * iot
     * mark  - return from subroutine, skip some words, supposedly helps stack clean up
     * bpt
     * 
     * Symbol table didn't include 'trap' or 'emt' or rtt or ...
     * 
     * rti - not certain why this "special" its a 0-address instruction (I think)
     * 
     */
    var name = elem.value;
    var ndx = findSymbol(name);
    var instruction = getSymbol(ndx);
    var handled = false;
    var addrpart;
    // calling function has already updated currentaddress to allow
    // for instruction
    switch (instruction.name) {
        case "rti":
        case "rtt":
            handled = true;
            break;
        case "call":

            addrpart = grabAddressPart();
            p1_process_1addr_instruction(addrpart);
            handled = true;
            break;
        case "return":

            handled = true;
            break;
        case "rts":

            addrpart = grabAddressPart();
            var registerpat = /^(r[0-7]|sp|pc)$/;
            if (!registerpat.test(addrpart)) {
                throw "Invalid address data in line " + linenum;
            }
            handled = true;
            break;
        case "mark":
            // Nothing special on pass 1
            // (could check that there is an octal value)
            handled = true;
            break;
        case "jsr":
        case "jms":
            // Format seems the same as "register address"
            addrpart = grabAddressPart();
            p1_process_regaddr_instruction(addrpart);
            handled = true;
            break;
        case "iot":
        case "bpt":
            // Seem to be just an instruction word - so 'handled'
            handled = true;
            break;
        case "trap":
        case "emt":
            // Require 8 bits of data in instruction word 
            // try checking for octal value
            addrpart = grabAddressPart();

            if (!matchOctal(addrpart)) {
                throw "Invalid trap arg in line " + linenum;
            }
            handled = true;
            break;
    }
    return handled;
}

function p1_process_instruction(elem) {
    badAddress();
    var name = elem.value;
    var ndx = findSymbol(name);
    var instruction = getSymbol(ndx);
    var addrtype = instruction.addrtype;

    // Instructions are two or more bytes - it is the "more" that is hard work
    updateCurrentAddress(2);
    if ((addrtype === "0addr") || (addrtype === "offset")) {
        // Easy - it is simply a two byte instruction, dealt with
        // Not checking the address part in this pass.
        return;
    }
    if (addrtype === "special") {
        var handled = p1_handle_special(elem);
        // There are a few instructions that are not yet sorted out because
        // they have special formats
        if (handled)
            return;
        throw "Oops - have not yet worked out this addressing mode";
    }
    if (addrtype === "sob") {
        // here treat as a simple two byte instruction, no processing
        // in pass 2 will need to check register and offset
        return;
    }
    var addrpart = grabAddressPart();
    if (addrpart === "") {
        throw "Missing address part of instruction on line " + linenum;
    }

    // And a safety check, input line should now be empty or a comment
    var elem2 = getNextElement();
    if (!emptyOrComment(elem2)) {
        throw "Extraneous data after instruction on line " + linenum;
    }

    if (addrtype === "regaddr")
        p1_process_regaddr_instruction(addrpart);
    else
    if (addrtype === "addrreg")
        p1_process_addrreg_instruction(addrpart);
    else
    if (addrtype === "1addr")
        p1_process_1addr_instruction(addrpart);
    else
    if (addrtype === "2addr")
        p1_process_2addr_instruction(addrpart);
    else {
        throw "Forgot to deal with address type " + addrtype;
    }
}

function processElements1() {
    // Used in pass1 of assembly when simply constructing symbol table
    // Loop through all the elements in a line

    // have to contend with things like labels, directives, instructions,
    // comments, constant declarations.
    // Could get label directive data, data, data
    // or label (blank or comment)
    // or label instruction ...
    //
    var element = getNextElement();
    if (element === null)
        return;
    // Main task is keeping track of location, the problem being that some
    // instructions take one word, some take two, and it is possible to need
    // three words - so really have to look at instruction address modes.
    // One other issue - a name or number (or comma separated list of these)
    //  Would this be illegal? - decided to treat as same as .word directive
    if (element.type === "comment") {
        // Do not need to do anything with a comment
        return;
    }
    else
    if (element.type === "constant") {
        p1_process_constant(element);
    }
    else
    if (element.type === "directive") {
        p1_process_directive(element);
    }
    else
    if (element.type === "label") {
        p1_process_label(element);
    }
    else
    if (element.type === "number") {
        // Dubious - treat as if part of .word directive
        p1_process_comma_values();
    }
    else
    if (element.type === "name") {
        // Similar
        p1_process_comma_values();
    }
    else
    if (element.type === "instruction") {
        p1_process_instruction(element);
    }
}

function pass1() {
    stop = false;
    phase = 1;
    initializeInput();

    //assemblyphase.innerHTML = "1";
    //line.innerHTML ="";
    //processing.innerHTML = "";
    getNextLine();
    while (!stop) {
        processElements1();
        getNextLine();
    }
}

// Symboltable display 
function padword(word, size) {
    var pword = word;
    var len = pword.length;
    while (len < size) {
        pword = pword + " ";
        len++;
    }
    return pword;
}

function octstrprint(val) {
    // For listings, all values are printed as 6 digits
//    var valstr = val.toString(8);
//    while (valstr.length < 6)
//        valstr = "0" + valstr;
    // That wasn't ok for -ve numbers as the Javascript to string
    // printed a - sign and then magnitude
var valstr;
    var chars = new Array( "0","1","2","3","4","5","6","7" );
    var ndx;
    var mask = 0100000;
    if(val & mask) valstr="1"; else valstr="0";
    mask = 070000;
    var i = 0;
    var shift = 12;
    for(;i<5;i++) {
        ndx = val & mask;
        ndx = ndx >> shift;
        valstr = valstr + chars[ndx];
        mask = mask >> 3;
        shift = shift-3;
    }
    
    return valstr;
}



function showSymbols() {
    var mytable = document.getElementById('symtab');
    for (var i = mytable.rows.length - 1; i > 0; i--) {
        mytable.deleteRow(i);
    }

    var ndx = 0;
    for (ndx in symbolTable) {
        var symb = symbolTable[ndx];
        if ((symb.type === "instruction") || (symb.type === "register"))
            continue;
        var str1 = padword(symb.name, 12);
        if (typeof symb.value === "undefined") {
    alert("something is undefined");
}
        var str2 = octstrprint(symb.value);
        var row = mytable.insertRow(-1);
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        cell1.innerHTML = str1;
        cell2.innerHTML = str2;
    }
}

//  Pass 2 specific functions here

function addMemoryWord(val) {
    // wanted to check the range of values, but fails when get
    // references to device registers (18 bit)
   // if(val>65535)
    //    throw "Value out of range on line " + linenum;
    var obj = new Object();
    obj.address = currentaddress;
    obj.value = val;
    obj.linelocation = outputcode.value.length;
    nmemory[wordcount] = obj;
    wordcount++;
}

function addAndDisplayWordVal(val) {
    addMemoryWord(val);
    var outstr = octstrprint(currentaddress) + "  " + octstrprint(val) + "\n";
    outputcode.value += outstr;
    currentaddress += 2;
}

function p2_process_blkw() {

    var next = getNextElement();
    var str = next.value;
    var num = octval(str);  // number of words
    var i = 0;
    for (; i < num; i++) {
        addAndDisplayWordVal(0);
    }
    displaycode();
}

function p2_process_comma_values(elem) {
    if (elem.type === "number") {
        var str = elem.value;
        var num = octval(str);
        addAndDisplayWordVal(num);
    }
    else
    if (elem.type === "name") {
        // It better be defined!
        var ndx = findSymbol(elem.value);
        if (ndx < 0) {
            throw "Undefined symbol " + elem.value;
        }
        var symb = getSymbol(ndx);
        // label or possibly a constant 
        if (!((symb.type === "label")|| (symb.type==="constant"))){
            throw "Invalid symbol " + elem.value;
        }
        addAndDisplayWordVal(symb.value);
    }
    else {
        throw "Invalid element in comma list";
    }

    var next = getNextElement();
    if ((next === null) || (next.type === "comment"))
        return;

    p2_process_comma_values(next);
}

function p2_process_word() {
    // Must get at least one number or name following .word
    var next = getNextElement();
    p2_process_comma_values(next);
}

function p2_process_string() {
    // String directive must be followed by a string
    var next = getNextElement();

    var str = next.value;
    // Strip off the quotes
    
    var length = str.length;
    
    str = str.substring(1, length - 1);
    length = length-2;
    var i = 0;
    var byteA = 0;
    var byteB = 0;
    var val = 0;
    // even byte is rightmost; odd byte is leftmost
    if ((length % 2) === 1) {
        // Odd length string, needs one null byte in with last character
        for (; i < length - 1; i += 2) {
            byteA = str.charCodeAt(i);

            byteB = str.charCodeAt(i + 1);

            byteB = byteB << 8;

            val = byteA | byteB;
            addAndDisplayWordVal(val);
        }
        byteA = str.charCodeAt(length - 1);

        byteB = 0;
        val = byteA | byteB;
        addAndDisplayWordVal(val);
    }
    else {
        // Even length string, needs two null bytes
        for (; i < length; i += 2) {
            byteA = str.charCodeAt(i);

            byteB = str.charCodeAt(i + 1);

            byteB = byteB << 8;

            val = byteA | byteB;
            addAndDisplayWordVal(val);
        }

        addAndDisplayWordVal(0);
    }


}

function p2_process_directive(anobj) {
    var name = anobj.value;
    displaycode();
    if (name === ".end") {
        stop = true;
        var next = getNextElement();
        if ((next === null) || (next.type !== "name")) {
            throw "No start address supplied";
        }
        else {
            var ndx = findSymbol(next.value);
            if (ndx < 0) {
                throw "Start address not recognized";
            }
            else {
                var symb = getSymbol(ndx);
                if (symb.type === "label") {
                    startaddress = symb.value;
                }
                else
                    throw "Invalid start address";
            }
        }
    }
    else
    if (name === ".origin") {
        var nexte = getNextElement();
        var val = octval(nexte.value);
        currentaddress = val;
    }
    else
    if (name === ".string")
        p2_process_string();
    else
    if (name === ".word")
        p2_process_word();
    else
    if (name === ".blkw")
        p2_process_blkw();

}

function emit_0addr(symb) {
    var str = octstrprint(currentaddress) + "  " + octstrprint(symb.value);
    codeline = str;

    addMemoryWord(symb.value);
    displaycode();
}

function p2_process_offset(instruction) {

    //  line must have a name on it - label to which we branch
    var elem = getNextElement();
    if ((elem === null) || (elem.type !== "name")) {
        throw "Invalid target in branch instruction on line " + linenum;
    }
    // name must be a defined label
    var ndx = findSymbol(elem.value);
    if (ndx < 0) {
        throw "Unknown label in branch instruction on line " + linenum;

    }
    var symb = getSymbol(ndx);
    if (symb.type !== "label") {
        throw "Invalid target in branch instruction on line " + linenum;
    }
    // So have a target to branch to.
    var loc = symb.value;
    var distance = loc - (currentaddress + 2); // For now assume PC would have been updated
    if (Math.abs(distance >= 512)) {
        throw "Invalid jump (too long) in branch on line " + linenum;
    }
    distance = distance >> 1;
    distance = distance & 0377;
    var opcode = instruction.value;
    var wordval = opcode | distance;
    var str = octstrprint(currentaddress) + "  " + octstrprint(wordval);
    codeline = str;

    addMemoryWord(wordval);
    displaycode();
}

function getreg(str) {
    var val;
    switch (str) {
        case 'r0':
            val = 0;
            break;
        case 'r1':
            val = 1;
            break;
        case 'r2':
            val = 2;
            break;
        case 'r3':
            val = 3;
            break;
        case 'r4':
            val = 4;
            break;
        case 'r5':
            val = 5;
            break;
        case 'r6':
            val = 6;
            break;
        case 'sp':
            val = 6;
            break;
        case 'r7':
            val = 7;
            break;
        case 'pc':
            val = 7;
        default:
            alert("Bad register ");
    }
    return val;
}



function regmodecode(data) {
    var val = data.mode;
    val = val << 3;
    val = val | data.reg;
    return val;
}

function maybeaddaddressword(addrobj) {
    // Check whether extra word of addressing data needed in instruction
    // (immediate operand, index value, absolute address etc)
    var xtra = addrobj.value;
    if (xtra !== null) {
        var deduct = currentaddress + 2;
        if (addrobj.relocate)
            xtra -= deduct;
        addAndDisplayWordVal(xtra);
    }
}

function dealwithoneaddrinstructionword(addrobj) {
    // Compose instruction word by combining bit pattern for instruction
    // and single mode/register data

    // Used by the few reg-address instructions (JSR, and the EIS group MUL, DIV etc)
    // after the register has been added to the instructionpat - these instructions
    // all have 7-bit opcode, 3 bit for register, and 6bit address mode
    var addrmode = regmodecode(addrobj);
    instructionpat = instructionpat | addrmode;

    var str = octstrprint(currentaddress) + "  " + octstrprint(instructionpat);
    codeline = str;
    addMemoryWord(instructionpat);
    displaycode();
    updateCurrentAddress(2);
}

function octalconstantlabel(str) {
    /*
     * 
     * string should be
     *    (signed) octal number
     *    name of a defined constant
     *    a label
     */
    var symbpat = /^[a-z][a-z0-9]*$/;
    if (str.match(symbpat)) {
        // It must be a known constant or label
        var ndx = findSymbol(str);
        if (ndx < 0)
            throw "Unrecognized symbol used as index on line " + linenum;
        var lookup = getSymbol(ndx);
        var bad = !(lookup.type === "constant" || lookup.type === "label");
        if (bad)
            throw "Invalid index in address part on line " + linenum;
        return lookup.value;
    }
    else {
        // Has to be an octal number, possibly signed
        return octval(str);
    }
}

function registerType(ndx) {
    // Does symbol at ndx correspond to any of known register addressing types
    var symb = getSymbol(ndx);
    var type = symb.addrstyle;
    // All the register types in symbol table have an addrstyle defined
    // Nothing else in the symbol table has that property
    return type !== undefined;
}

function p2_interpret_address_element(addrpart) {
    /*
     * 
     * Formats of addresses
     *    r1 - mode 0, register  has data
     *    @r1  - mode 1, register  is pointer to data
     *    (r1) - alternative mode 1 
     *    (r1)+ - post-increment pointer (mode 2)
     *    @(r1)+ - r1 is a pointer to a pointer to the data, move on to next pointer!
     *        (working through a table of pointers to data) - mode (3)
     *    -(r1) - pre-decrement pointer (mode 4) (update pointer, use it)
     *    @-(r1) - the indirect version (mode 5)
     *    
     *    X(r1) - indexed addressing, mode 6, value of x held in word gets added
     *    to register to get address,
     *    of course can get extra indirect
     *    X? 'can contain integer constants and symbolic addresses combined with binary operators'
     *    
     *    and then assembly language has provision for implicitly using register 7 (pc)
     *    for immediate data, and relative addressing (syntactic variants on mode 2,3 and 6,7)
     *    
     *    Symbol table has some entries that may simplify decoding!
     *    It's got
     *    r1, @r1, (r1)+, @(r1)+, -(r1),
     */
    var ndx = findSymbol(addrpart);
    // Match if a register, instruction(!), or defined constant or label
    // No match if indexed, literal, absolute, relative, or deferred relative
    if( (ndx >= 0)  && registerType(ndx)) {
        // It is a simple register address style, get info as predefined in symbol 
        // table
        var result = new Object();
        var regsymb = getSymbol(ndx);
        result.reg = regsymb.reg;
        result.mode = regsymb.mode;
        result.type = "standard-register";
        result.value = null; // No data for an extra word
        result.relocate = false;
        return result;
    }
    // Next try for indexed and deferred index (which may apply to special
    // pc based formats as well)
    var indirect = 0;
    if ('@' === addrpart.charAt(0)) {
        indirect = 1;
        addrpart = addrpart.substr(1, addrpart.length - 1);
    }

    // Handling of index mode is more limited than that most assemblers supported
    // They could handle expressions with +/- operators etc
    // Only allowing octal|-octal|constant|label as index
    // Looking for index(reg)
    var indexpat = /^([0-7]+|-[0-7]+|[a-z][a-z0-9_]*)\((r0|r1|r2|r3|r4|r5|r6|r7|sp|pc)\)$/;
    var match = addrpart.match(indexpat);
    if (match !== null) {
        var result = new Object();
        result.type = "indexed";
        var ndxpart = match[1];
        var regpart = match[2];
        result.reg = getreg(regpart);
        if (indirect === 0)
            result.mode = 6;
        else {
            result.mode = 7;
            result.type = "deferred index";
        }

        result.value = octalconstantlabel(ndxpart);
        result.relocate = false;
        return result;
    }
    // Remaining addressing modes should be the implied r7 versions of mode 2 and 
    // mode 6 (also 3 and 7); here have different assembly language syntax

    // r7 implied, mode 2 and mode 3
    // mode 2 (auto increment) pc holds address of data (word following instruction)
    // get the data, increment the register (stepping over the data word to get
    // to next instruction); mode 3 involves the extra indirect - the data in 
    // following word is address of actual argument
    // With r7 these are refererred to as immediate and absolute
    // (data immediately after instruction, absolute address)
    // Syntax is #xxx or @#xxx
    // The @ sign (if any) has been consumed - and set as local variable "indirect"
    // So check for the #
    if ('#' === addrpart.charAt(0)) {
        // So, literal or absolute, remove the # character
        addrpart = addrpart.substr(1, addrpart.length - 1);
        var result = new Object();
        result.type = "literal";
        result.reg = 7;
        if (indirect === 0)
            result.mode = 2;
        else {
            result.mode = 3;
            result.type = "absolute";
        }
        result.value = octalconstantlabel(addrpart);
        result.relocate = false;
        return result;
    }

    // Relative and deferred relative addressing
    // "opr A"
    // This is a form of "indexed" addressing where the pc (r7) is used as
    // "base" register for index
    // A should be limited to a known label or possibly a constant
    // address will get relocated
    // 
    var result = new Object();
    result.type = "relative";
            result.reg = 7;
    if (indirect === 0)
        result.mode = 6;
    else {
        result.mode = 7;
        result.type = "deferred relative";
    }
    var r7ndx = findSymbol(addrpart);
    if (r7ndx < 0)
        throw "Cannot interpret possible relative addressing used on line " + linenum;
    var r7symb = getSymbol(r7ndx);
    var bad = !(r7symb.type === "constant" || r7symb.type === "label");
    if (bad)
        throw "Invalid symbol used in relative addressing on line " + linenum;
    result.value = r7symb.value;
    result.relocate = true;
    return result;

}



function p2_process_addrreg_instruction(addrpart) {
    // ASH, ASHC, DIV, MUL
    // Assembly language
    // MUL #10,r1 (source-address would be literal)
    // MUL NUM,r2 (Source-address would be relative)
    //    also note that may be generating a 16-bit or a 32-bit product!
    //    if destination register is even (e.g. r2) then get a 32bit number in r2,r3
    //    if destination register is odd (e.g. r1) then get only the low order 16 bits
    //    of product put in r1
    // DIV @r3,r0
    //    register has to be even; here 32 bit number in r0/r1 to be divided by 16 bit
    //    number pointed to by r3 - quotient in r0, remainder in r1
    //
    // ASH,ASHC - these do arithmetic shifts, the ashc works on register pair (32 bit)
    // 

    var parts = addrpart.split(",");
    // Second part of address must be a register r0, r1, r2, ...
    var regid = findSymbol(parts[1]);
    if (regid < 0) {
        throw "Invalid instruction format on line " + linenum;
    }
    var symb = getSymbol(regid);
    if (symb.addrstyle !== "register") {
        throw "Invalid instruction format on line " + linenum;
    }
    var regnum = symb.reg;
    if (instructionpat === parseInt('0x7200')) {
        if ((regnum % 2) === 1)
            throw "Div instuctions need even register";
    }
    regnum = regnum << 6;
    instructionpat = instructionpat | regnum;
    var addrobj = p2_interpret_address_element(parts[0]);
    dealwithoneaddrinstructionword(addrobj);
    maybeaddaddressword(addrobj);

}

function p2_process_regaddr_instruction(addrpart) {
    // Should have a simple register - r0 - r7, then comma, then full
    //  JSR and XOR seem to be only instructions with this pattern

    // This is really the same function as above just with the roles
    // for the two parts of the address interchanged.
    var parts = addrpart.split(",");
    // First part of address must be a register r0, r1, r2, ...
    var regid = findSymbol(parts[0]);
    if (regid < 0) {
        throw "Invalid instruction format on line " + linenum;
    }
    var symb = getSymbol(regid);
    if (symb.addrstyle !== "register") {
        throw "Invalid instruction format on line " + linenum;
    }
    var regnum = symb.reg;
    regnum = regnum << 6;
    instructionpat = instructionpat | regnum;
    var addrobj = p2_interpret_address_element(parts[1]);
    dealwithoneaddrinstructionword(addrobj);
    maybeaddaddressword(addrobj);
}

function p2_process_1addr_instruction(addrpart) {
    // Examples - inc, dec, com, clr
    // They have 10 bits of instruction pat and 6 bits for address mode(&register)
    // and if mode is indexed, deferred indexed, literal, absolute etc may
    // have a following word with data
    var addrobj = p2_interpret_address_element(addrpart);
    dealwithoneaddrinstructionword(addrobj);
    maybeaddaddressword(addrobj);
}

function p2_process_2addr_instruction(addrpart) {
    // Should have two address parts, separated by comma
    var parts = addrpart.split(",");
    // Process each individually
    var obj1 = p2_interpret_address_element(parts[0]);

    var obj2 = p2_interpret_address_element(parts[1]);
    var addrmode1 = regmodecode(obj1);

    instructionpat = instructionpat | (addrmode1 << 6);
    dealwithoneaddrinstructionword(obj2);
    maybeaddaddressword(obj1);
    maybeaddaddressword(obj2);
}

function p2_handle_sob(elem) {
    // Another special format instruction
    // sob reg,destination
    // destination must be a lower address instruction - this is a branch back
    // destination gets converted into an offset
    // the offset should be a six bit unsigned number, its the number of words
    // (i.e. it gets doubled as byte addressing) to be subtracted from the pc
    var name = elem.value;
    var ndx = findSymbol(name);
    var instruction = getSymbol(ndx);
    instructionpat = instruction.value;
    // Address part should be register,symbol -
    // processing of symbol much like a branch instruction - but only 6 bits
    // not 8-bits

    // address part should be a label - at some lower address, and within range!
    addrpart = grabAddressPart();
    var parts = addrpart.split(",");

    var reg = getreg(parts[0]);
    var ndx = findSymbol(parts[1]);
    if (ndx < 0) {
        throw "Unknown label in address part on line " + linenum;
    }
    var symb = getSymbol(ndx);
    if (symb.type !== "label") {
        throw "Invalid format in sob instruction on line " + linenum;
    }
    var delta = (currentaddress + 2 - symb.value) / 2;
    if (!((delta > 0) && (delta < 64))) {
        throw "Invalid branch in sob instruction on line " + linenum;
    }
    instructionpat = instructionpat | (reg << 6);
    instructionpat = instructionpat | delta;
    var str = octstrprint(currentaddress) + "  " + octstrprint(instructionpat);
    codeline = str;

    addMemoryWord(instructionpat);
    displaycode();
    updateCurrentAddress(2);


}

function p2_handle_mark(elem) {
    // Unlikely ever to get used!
    // Mark instructions e.g. Mark 2 typically defined as constants
    // and pushed onto stack when handling function call
    //
    // Anyway, it's another special format instruction, a bit like sob
    // instruction opcode then 6-bits for an octal constant
    var name = elem.value;
    var ndx = findSymbol(name);
    var instruction = getSymbol(ndx);
    instructionpat = instruction.value;
    // Address part should be octal constant

    addrpart = grabAddressPart();
    if (!matchOctal(addrpart))
        throw "Invalid data in 'Mark' instruction on line " + linenum;

    var val = octval(addrpart);
    var opcode = instructionpat | val;
    var str = octstrprint(currentaddress) + "  " + octstrprint(opcode);
    codeline = str;

    addMemoryWord(opcode);
    displaycode();
}

function p2_handle_special(elem) {
    /*
     * Need to deal with  call address (which is synonym for jsr r7, address)
     * rts reg (return from subroutine)
     * return (which is a synonym for rts r7)
     * rti (return from interrupt)
     * iot
     * mark  - return from subroutine, skip some words, supposedly helps stack clean up
     * bpt
     * 
     * Symbol table didn't include 'trap' or 'emt' or rtt or ...
     * 
     * rti - not certain why this "special" its a 0-address instruction (I think)
     * 
     */
    var name = elem.value;
    var ndx = findSymbol(name);
    var instruction = getSymbol(ndx);
    instructionpat = instruction.value;
    var handled = false;
    var addrpart;
    switch (instruction.name) {
        case "rti":
        case "rtt":
            emit_0addr(instruction);
            updateCurrentAddress(2);
            handled = true;
            break;
        case "call":
            addrpart = grabAddressPart();
            p2_process_1addr_instruction(addrpart);
            handled = true;
            break;
        case "return":
            emit_0addr(instruction);
            updateCurrentAddress(2);
            handled = true;
            break;
        case "rts":
            addrpart = grabAddressPart();
            var registerpat = /^r[0-7]|pc|sp$/;
            if (!registerpat.test(addrpart)) {
                throw "Invalid address data in line " + linenum;
            }
            ndx = findSymbol(addrpart);
            var symb = getSymbol(ndx);
            instructionpat = instructionpat | symb.reg;
            var str = octstrprint(currentaddress) + "  " + octstrprint(instructionpat);
            codeline = str;

            addMemoryWord(instructionpat);
            displaycode();
            updateCurrentAddress(2);
            handled = true;
            break;
        case "mark":
            p2_handle_mark(elem);
            handled = true;
            break;
        case "jsr":
        case "jms":
            // I think these work like register address instructions
            addrpart = grabAddressPart();
            p2_process_regaddr_instruction(addrpart);
            handled = true;

            break;
        case "iot":
        case "bpt":
            // Think that these are just 0 address instructions - not certain
            // why classified as special.
            // have to sort out argument
            emit_0addr(instruction);
            updateCurrentAddress(2);
            handled = true;
            break;
        case "trap":
        case "emt":
            addrpart = grabAddressPart();
            // Should be an octal constant
            if (matchOctal(addrpart)) {
                var value = octval(addrpart);
                instructionpat = instructionpat | value;
                var str = octstrprint(currentaddress) + "  " + octstrprint(instructionpat);
                codeline = str;

                addMemoryWord(instructionpat);
                displaycode();
                updateCurrentAddress(2);
                handled = true;
            }
            break;

    }
    return handled;
}

function p2_process_instruction(elem) {

    var name = elem.value;
    var ndx = findSymbol(name);
    var instruction = getSymbol(ndx);
    var addrtype = instruction.addrtype;


    if (addrtype === "0addr") {
        emit_0addr(instruction);
        updateCurrentAddress(2);
        return;
    }
    else
    if (addrtype === "offset") {
        p2_process_offset(instruction);
        updateCurrentAddress(2);
        return;
    }
    if (addrtype === "special") {
        var handled = p2_handle_special(elem);
        // There are a few instructions that are not yet sorted out because
        // they have special formats
        //errormessage = "Oops - have not yet worked out this addressing mode";
        //stop = true;
        if (handled)
            return;
        alert("Could not deal with line " + linenum);
        stop = true;
        return;
    }

    if (addrtype === "sob") {
        p2_handle_sob(elem);
        return;
    }

    var addrpart = grabAddressPart();
    instructionpat = instruction.value; // Save the instruction op-code
    if (addrtype === "regaddr")
        p2_process_regaddr_instruction(addrpart);
    else
    if (addrtype === "addrreg")
        p2_process_addrreg_instruction(addrpart);
    if (addrtype === "1addr")
        p2_process_1addr_instruction(addrpart);
    else
    if (addrtype === "2addr")
        p2_process_2addr_instruction(addrpart);

}
function processElements2() {
    // Used in pass2 of assembly when emitting code


    var element = getNextElement();
    if (element === null)
        return;

    if (element.type === "comment") {
        displaycode();
        // Do not need to do anything with a comment
        return;
    }
    else
    if (element.type === "constant") {
        displaycode();
        // Do not need to do anything in pass 2
        return;
    }
    else
    if (element.type === "directive") {
        p2_process_directive(element);
    }
    else
    if (element.type === "label") {
        // Do not need to do anything in pass 2
        // recursive call to handle rest of line
        processElements2();
    }
    else
    if (element.type === "number") {

        // Dubious - treat as if part of .word directive
        p2_process_comma_values(element);
        displaycode();
    }
    else
    if (element.type === "name") {

        // Similar
        p2_process_comma_values(element);
        displaycode();
    }
    else
    if (element.type === "instruction") {
        p2_process_instruction(element);
    }
}

function displaycode() {
    var listingline = codeline;
    var len = listingline.length;
    while (len < 20) {
        listingline = listingline + " ";
        len++;
    }
    listingline = listingline + srcline + "\n";
    outputcode.value += listingline;
}

function pass2() {
    stop = false;

    initializeInput();

    //assemblyphase.innerHTML = "2";

    //processing.innerHTML = "";
    getNextLine();
    nmemory = new Array();
    wordcount = 0;
    while (!stop) {
        codeline = "";

        instructionpat = 0;
        processElements2();
        getNextLine();
    }
}

function windowInitialize() {
    // Set variables that reference elements in HTML window
    src = document.getElementById("codewindow");
    //outputsymtab = document.getElementById("symboltable");
    outputcode = document.getElementById("gencode");
    //assemblyphase = document.getElementById("phase");
    //line = document.getElementById("line");
    //processing = document.getElementById("processing");
    // Initialize outputs in display fields
    // outputsymtab.value="";
    outputcode.value = "";
    dumplisting = document.getElementById("memdump");
}

function assemble() {
    initializeSymbolTable();    // Loads predefined symbols
    windowInitialize();         // Prepares display
    try {
        pass1();
    }
    catch (errormessage) {
       var errstr1 = errormessage;
       //console.trace();
       alert(errstr1);
        return;
    }

    showSymbols();
    try {
        pass2();
    }
    catch (errormessage) {
       var errstr2 = errormessage;
       alert(errstr2);
       //console.trace();
        return;
    }
//    reset2();
//    loader(nmemory);
//    initforsteprun(startaddress);
    alert("Assembled without errors; ready to run.");
    resetprogram();
}

function resetprogram() {
    reset2();
    loader(nmemory);
    initforsteprun(startaddress);
    dumplisting.innerHTML="";
}
