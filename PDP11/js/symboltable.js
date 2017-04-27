/*
 * Symbol table
 *
 * Have not yet decided on how best to represent a symbol
 *
 * It will have a name, some kind of type - user defined symbol (user),
 * instruction (may need subcategories), a value as an octal number
 * this is something to be ior into a final word so should be six digit
 * octal value;
 * probably need several more things
 *
 * Symbol tables are meant to be capable of being searched efficiently
 * but this will be tiny so just linear search through an unordered collection
 *
 * Symbols will be default Javascript objects with properties defined
 */

var symbolTable = 0; // The table
var numSymbols = 0; // Number of entries

function addSymbol(anobject) {
    symbolTable[numSymbols] = anobject;
    numSymbols++;
}

function findSymbol(aname) {
    // returns index if there is a symbol with given name
    var i = 0;
    while(i<numSymbols) {
        var obj = symbolTable[i];
        if(aname===obj.name)
            return i;
        i++;
    }
    return -1;
}

function getSymbol(ndx) {
    return symbolTable[ndx];
}

function initializeSymbolTable() {
    symbolTable = new Array();
    var obj = 0;
    numSymbols = 0;
// Recognizing register addressing in various modes
// name - matching string in assembly source, style - merely comment, mode and reg data
//    for assembling address part in instruction
// Mode 0
obj = new Object();
obj.type = "register"; obj.name="r0"; obj.addrstyle="register"; obj.mode="0"; obj.reg="0"; addSymbol(obj);
obj = new Object();
obj.type = "register"; obj.name="r1";  obj.addrstyle="register"; obj.mode="0"; obj.reg="1"; addSymbol(obj);
obj = new Object();
obj.type = "register"; obj.name="r2";  obj.addrstyle="register"; obj.mode="0"; obj.reg="2"; addSymbol(obj);
obj = new Object();
obj.type = "register"; obj.name="r3";  obj.addrstyle="register"; obj.mode="0"; obj.reg="3"; addSymbol(obj);
obj = new Object();
obj.type = "register"; obj.name="r4";  obj.addrstyle="register"; obj.mode="0"; obj.reg="4"; addSymbol(obj);
obj = new Object();
obj.type = "register"; obj.name="r5";  obj.addrstyle="register"; obj.mode="0"; obj.reg="5"; addSymbol(obj);
obj = new Object();
obj.type = "register"; obj.name="r6";  obj.addrstyle="register"; obj.mode="0"; obj.reg="6"; addSymbol(obj);
obj = new Object();
obj.type = "register"; obj.name="sp";  obj.addrstyle="register"; obj.mode="0"; obj.reg="6"; addSymbol(obj);
obj = new Object();
obj.type = "register"; obj.name="r7"; obj.addrstyle="register"; obj.mode="0"; obj.reg="7"; addSymbol(obj);
obj = new Object();
obj.type = "register"; obj.name="pc";  obj.addrstyle="register"; obj.mode="0"; obj.reg="7"; addSymbol(obj);

// Mode 1 (two variants in assembly language) - @ style preferred
// Register indirect mode 
obj = new Object();
obj.type = "register"; obj.name="@r0"; obj.addrstyle="indirect register"; obj.mode="1"; obj.reg="0"; addSymbol(obj);
obj = new Object();
obj.type = "register"; obj.name="@r1";  obj.addrstyle="indirect register"; obj.mode="1"; obj.reg="1"; addSymbol(obj);
obj = new Object();
obj.type = "register"; obj.name="@r2";  obj.addrstyle="indirect register"; obj.mode="1"; obj.reg="2"; addSymbol(obj);
obj = new Object();
obj.type = "register"; obj.name="@r3";  obj.addrstyle="indirect register"; obj.mode="1"; obj.reg="3"; addSymbol(obj);
obj = new Object();
obj.type = "register"; obj.name="@r4";  obj.addrstyle="indirect register"; obj.mode="1"; obj.reg="4"; addSymbol(obj);
obj = new Object();
obj.type = "register"; obj.name="@r5";  obj.addrstyle="indirect register"; obj.mode="1"; obj.reg="5"; addSymbol(obj);
obj = new Object();
obj.type = "register"; obj.name="@r6";  obj.addrstyle="indirect register"; obj.mode="1"; obj.reg="6"; addSymbol(obj);
obj = new Object();
obj.type = "register"; obj.name="@sp";  obj.addrstyle="indirect register"; obj.mode="1"; obj.reg="6"; addSymbol(obj);
obj = new Object();
obj.type = "register"; obj.name="@r7";  obj.addrstyle="indirect register"; obj.mode="1"; obj.reg="7"; addSymbol(obj);
obj = new Object();
obj.type = "register"; obj.name="@pc";  obj.addrstyle="indirect register"; obj.mode="1"; obj.reg="7"; addSymbol(obj);
// Register indirect mode - alternative syntax
obj = new Object();
obj.type = "register"; obj.name="(r0)"; obj.addrstyle="indirect register"; obj.mode="1"; obj.reg="0"; addSymbol(obj);
obj = new Object();
obj.type = "register"; obj.name="(r1)";  obj.addrstyle="indirect register"; obj.mode="1"; obj.reg="1"; addSymbol(obj);
obj = new Object();
obj.type = "register"; obj.name="(r2)";  obj.addrstyle="indirect register"; obj.mode="1"; obj.reg="2"; addSymbol(obj);
obj = new Object();
obj.type = "register"; obj.name="(r3)";  obj.addrstyle="indirect register"; obj.mode="1"; obj.reg="3"; addSymbol(obj);
obj = new Object();
obj.type = "register"; obj.name="(r4)";  obj.addrstyle="indirect register"; obj.mode="1"; obj.reg="4"; addSymbol(obj);
obj = new Object();
obj.type = "register"; obj.name="(r5)";  obj.addrstyle="indirect register";; obj.mode="1"; obj.reg="5"; addSymbol(obj);
obj = new Object();
obj.type = "register"; obj.name="(r6)";  obj.addrstyle="indirect register";; obj.mode="1"; obj.reg="6"; addSymbol(obj);
obj = new Object();
obj.type = "register"; obj.name="(sp)";  obj.addrstyle="indirect register"; obj.mode="1"; obj.reg="6"; addSymbol(obj);
obj = new Object();
obj.type = "register"; obj.name="(r7)";  obj.addrstyle="indirect register"; obj.mode="1"; obj.reg="7"; addSymbol(obj);
obj = new Object();
obj.type = "register"; obj.name="(pc)";  obj.addrstyle="indirect register"; obj.mode="1"; obj.reg="7"; addSymbol(obj);

// Mode 2
// Autoincrement register
obj = new Object();
obj.type = "register"; obj.name="(r0)+"; obj.addrstyle="postincrement"; obj.mode="2"; obj.reg="0"; addSymbol(obj);
obj = new Object();
obj.type = "register"; obj.name="(r1)+";  obj.addrstyle="postincrement"; obj.mode="2"; obj.reg="1"; addSymbol(obj);
obj = new Object();
obj.type = "register"; obj.name="(r2)+";  obj.addrstyle="postincrement"; obj.mode="2"; obj.reg="2"; addSymbol(obj);
obj = new Object();
obj.type = "register"; obj.name="(r3)+";  obj.addrstyle="postincrement"; obj.mode="2"; obj.reg="3"; addSymbol(obj);
obj = new Object();
obj.type = "register"; obj.name="(r4)+";  obj.addrstyle="postincrement"; obj.mode="2"; obj.reg="4"; addSymbol(obj);
obj = new Object();
obj.type = "register"; obj.name="(r5)+";  obj.addrstyle="postincrement"; obj.mode="2"; obj.reg="5"; addSymbol(obj);
obj = new Object();
obj.type = "register"; obj.name="(r6)+";  obj.addrstyle="postincrement"; obj.mode="2"; obj.reg="6"; addSymbol(obj);
obj = new Object();
obj.type = "register"; obj.name="(sp)+";  obj.addrstyle="postincrement"; obj.mode="2"; obj.reg="6"; addSymbol(obj);
obj = new Object();
obj.type = "register"; obj.name="(r7)+";  obj.addrstyle="postincrement"; obj.mode="2"; obj.reg="7"; addSymbol(obj);
obj = new Object();
obj.type = "register"; obj.name="(pc)+";  obj.addrstyle="postincrement"; obj.mode="2"; obj.reg="7"; addSymbol(obj);

// Mode 3
// Indirect Autoincrement register
obj = new Object();
obj.type = "register"; obj.name="@(r0)+"; obj.addrstyle="indirect and postincrement"; obj.mode="3"; obj.reg="0"; addSymbol(obj);
obj = new Object();
obj.type = "register"; obj.name="@(r1)+";  obj.addrstyle="indirect and postincrement"; obj.mode="3"; obj.reg="1"; addSymbol(obj);
obj = new Object();
obj.type = "register"; obj.name="@(r2)+";  obj.addrstyle="indirect and postincrement"; obj.mode="3"; obj.reg="2"; addSymbol(obj);
obj = new Object();
obj.type = "register"; obj.name="@(r3)+";  obj.addrstyle="indirect and postincrement"; obj.mode="3"; obj.reg="3"; addSymbol(obj);
obj = new Object();
obj.type = "register"; obj.name="@(r4)+";  obj.addrstyle="indirect and postincrement"; obj.mode="3"; obj.reg="4"; addSymbol(obj);
obj = new Object();
obj.type = "register"; obj.name="@(r5)+";  obj.addrstyle="indirect and postincrement"; obj.mode="3"; obj.reg="5"; addSymbol(obj);
obj = new Object();
obj.type = "register"; obj.name="@(r6)+";  obj.addrstyle="indirect and postincrement"; obj.mode="3"; obj.reg="6"; addSymbol(obj);
obj = new Object();
obj.type = "register"; obj.name="@(sp)+";  obj.addrstyle="indirect and postincrement"; obj.mode="3"; obj.reg="6"; addSymbol(obj);
obj = new Object();
obj.type = "register"; obj.name="@(r7)+";  obj.addrstyle="indirect and postincrement"; obj.mode="3"; obj.reg="7"; addSymbol(obj);
obj = new Object();
obj.type = "register"; obj.name="@(pc)+";  obj.addrstyle="indirect and postincrement"; obj.mode="3"; obj.reg="7"; addSymbol(obj);

// Mode 4
// Autodecrement register
obj = new Object();
obj.type = "register"; obj.name="-(r0)"; obj.addrstyle="predecrement"; obj.mode="4"; obj.reg="0"; addSymbol(obj);
obj = new Object();
obj.type = "register"; obj.name="-(r1)";  obj.addrstyle="predecrement"; obj.mode="4"; obj.reg="1"; addSymbol(obj);
obj = new Object();
obj.type = "register"; obj.name="-(r2)";  obj.addrstyle="predecrement"; obj.mode="4"; obj.reg="2"; addSymbol(obj);
obj = new Object();
obj.type = "register"; obj.name="-(r3)";  obj.addrstyle="predecrement"; obj.mode="4"; obj.reg="3"; addSymbol(obj);
obj = new Object();
obj.type = "register"; obj.name="-(r4)";  obj.addrstyle="predecrement"; obj.mode="4"; obj.reg="4"; addSymbol(obj);
obj = new Object();
obj.type = "register"; obj.name="-(r5)";  obj.addrstyle="predecrement"; obj.mode="4"; obj.reg="5"; addSymbol(obj);
obj = new Object();
obj.type = "register"; obj.name="-(r6)";  obj.addrstyle="predecrement"; obj.mode="4"; obj.reg="6"; addSymbol(obj);
obj = new Object();
obj.type = "register"; obj.name="-(sp)"; obj.addrstyle="predecrement"; obj.mode="4"; obj.reg="6"; addSymbol(obj);
obj = new Object();
obj.type = "register"; obj.name="-(r7)";  obj.addrstyle="predecrement"; obj.mode="4"; obj.reg="7"; addSymbol(obj);
obj = new Object();
obj.type = "register"; obj.name="-(pc)";  obj.addrstyle="predecrement"; obj.mode="4"; obj.reg="7"; addSymbol(obj);

// Mode 5
// Indirect Autoincrement register
obj = new Object();
obj.type = "register"; obj.name="@(r0)+"; obj.addrstyle="predecrement then indirect"; obj.mode="5"; obj.reg="0"; addSymbol(obj);
obj = new Object();
obj.type = "register"; obj.name="@(r1)+";  obj.addrstyle="predecrement then indirect"; obj.mode="5"; obj.reg="1"; addSymbol(obj);
obj = new Object();
obj.type = "register"; obj.name="@(r2)+";  obj.addrstyle="predecrement then indirect"; obj.mode="5"; obj.reg="2"; addSymbol(obj);
obj = new Object();
obj.type = "register"; obj.name="@(r3)+";  obj.addrstyle="predecrement then indirect";; obj.reg="3"; addSymbol(obj);
obj = new Object();
obj.type = "register"; obj.name="@(r4)+";  obj.addrstyle="predecrement then indirect"; obj.mode="5"; obj.reg="4"; addSymbol(obj);
obj = new Object();
obj.type = "register"; obj.name="@(r5)+";  obj.addrstyle="predecrement then indirect"; obj.mode="5"; obj.reg="5"; addSymbol(obj);
obj = new Object();
obj.type = "register"; obj.name="@(r6)+";  obj.addrstyle="predecrement then indirect"; obj.mode="5"; obj.reg="6"; addSymbol(obj);
obj = new Object();
obj.type = "register"; obj.name="@(sp)+";  obj.addrstyle="predecrement then indirect"; obj.mode="5"; obj.reg="6"; addSymbol(obj);
obj = new Object();
obj.type = "register"; obj.name="@(r7)+";  obj.addrstyle="predecrement then indirect"; obj.mode="5"; obj.reg="7"; addSymbol(obj);
obj = new Object();
obj.type = "register"; obj.name="@(pc)+";  obj.addrstyle="predecrement then indirect"; obj.mode="5"; obj.reg="7"; addSymbol(obj);

// 
// Modes 6 and 7 are indexed and indexed deferred
// Have not tried to handle the indexed variants this way; have to be dealt with specially in code
// The formats would be things like 2(sp) or M5(r3) (where M5 has been defined as a constant)
// along with the @ variants.  Index value supposed to be an expression evaluated at assemle time.

// Instructions
// name - matching assembly source
// value - bit pattern (I got these from some published table that gave them all in hex)
// numargs - how many args to check for when checking assembly source
// addrtype - how to construct adddresses - 1-address, 2-address (both use mode/register),
//     register address (register, then 2nd address standard mode register, 1st is just a register e.g.
//     used in subroutine call where register being designated as linkage register)
//    offset - the branch instructions take an 8 bit offset
//    special - all the funny format instructions (e.g. "call" where r7 is implicit as
//      subroutine linkage, or "sob" which has a 6 bit field for offset rather than 8)
obj = new Object();
obj.type="instruction";obj.name="adc";obj.value=parseInt('0xb40');obj.numargs=1;obj.addrtype="1addr";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="adcb";obj.value=parseInt('0x8b40');obj.numargs=1;obj.addrtype="1addr";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="add";obj.value=parseInt('0x6000');obj.numargs=2;obj.addrtype="2addr";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="ash";obj.value=parseInt('0x7400');obj.numargs=2;obj.addrtype="addrreg";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="ashc";obj.value=parseInt('0x7600');obj.numargs=2;obj.addrtype="addrreg";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="asl";obj.value=parseInt('0xcc0');obj.numargs=1;obj.addrtype="1addr";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="aslb";obj.value=parseInt('0x8cc0');obj.numargs=1;obj.addrtype="1addr";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="asr";obj.value=parseInt('0xc80');obj.numargs=1;obj.addrtype="1addr";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="asrb";obj.value=parseInt('0x8c80');obj.numargs=1;obj.addrtype="1addr";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="bcc";obj.value=parseInt('0x8600');obj.numargs=1;obj.addrtype="offset";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="bcs";obj.value=parseInt('0x8700');obj.numargs=1;obj.addrtype="offset"; addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="beq";obj.value=parseInt('0x0300');obj.numargs=1;obj.addrtype="offset";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="bge";obj.value=parseInt('0x0400');obj.numargs=1;obj.addrtype="offset";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="bgt";obj.value=parseInt('0x0600');obj.numargs=1;obj.addrtype="offset";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="bhi";obj.value=parseInt('0x8200');obj.numargs=1;obj.addrtype="offset";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="bhis";obj.value=parseInt('0x8600');obj.numargs=1;obj.addrtype="offset";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="bic";obj.value=parseInt('0x4000');obj.numargs=2;obj.addrtype="2addr";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="bicb";obj.value=parseInt('0xc000');obj.numargs=2;obj.addrtype="2addr";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="bis";obj.value=parseInt('0x5000');obj.numargs=2;obj.addrtype="2addr";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="bisb";obj.value=parseInt('0xd000');obj.numargs=2;obj.addrtype="2addr";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="bit";obj.value=parseInt('0x3000');obj.numargs=2;obj.addrtype="2addr";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="bitb";obj.value=parseInt('0xb000');obj.numargs=2;obj.addrtype="2addr";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="ble";obj.value=parseInt('0x0700');obj.numargs=1;obj.addrtype="offset"; addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="blo";obj.value=parseInt('0x8700');obj.numargs=1;obj.addrtype="offset"; addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="blos";obj.value=parseInt('0x8300');obj.numargs=1;obj.addrtype="offset"; addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="blt";obj.value=parseInt('0x0500');obj.numargs=1;obj.addrtype="offset";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="bmi";obj.value=parseInt('0x8100');obj.numargs=1;obj.addrtype="offset";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="bne";obj.value=parseInt('0x0200');obj.numargs=1;obj.addrtype="offset";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="bpl";obj.value=parseInt('0x8000');obj.numargs=1;obj.addrtype="offset";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="bpt";obj.value=parseInt('0x3');obj.numargs=1;obj.addrtype="special";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="br";obj.value=parseInt('0x0100');obj.numargs=1;obj.addrtype="offset";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="bvc";obj.value=parseInt('0x8400');obj.numargs=1;obj.addrtype="offset";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="bvs";obj.value=parseInt('0x8500');obj.numargs=1;obj.addrtype="offset";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="call";obj.value=parseInt('0x9c0');obj.numargs=1;obj.addrtype="special";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="ccc";obj.value=parseInt('0xaf');obj.numargs=0;obj.addrtype="0addr";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="clc";obj.value=parseInt('0xa1');obj.numargs=0;obj.addrtype="0addr";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="cln";obj.value=parseInt('0xa8');obj.numargs=0;obj.addrtype="0addr";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="clr";obj.value=parseInt('0xa00');obj.numargs=1;obj.addrtype="1addr";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="clrb";obj.value=parseInt('0x8a00');obj.numargs=1;obj.addrtype="1addr";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="clv";obj.value=parseInt('0xa2');obj.numargs=0;obj.addrtype="0addr";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="clz";obj.value=parseInt('0xa4');obj.numargs=0;obj.addrtype="0addr";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="cmp";obj.value=parseInt('0x2000');obj.numargs=2;obj.addrtype="2addr";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="cmpb";obj.value=parseInt('0xa000');obj.numargs=2;obj.addrtype="2addr";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="com";obj.value=parseInt('0xa40');obj.numargs=1;obj.addrtype="1addr";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="comb";obj.value=parseInt('0x8a40');obj.numargs=1;obj.addrtype="1addr";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="dec";obj.value=parseInt('0xac0');obj.numargs=1;obj.addrtype="1addr";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="decb";obj.value=parseInt('0x8ac0');obj.numargs=1;obj.addrtype="1addr";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="div";obj.value=parseInt('0x7200');obj.numargs=2;obj.addrtype="addrreg";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="halt";obj.value=parseInt('0x00');obj.numargs=0;obj.addrtype="0addr";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="inc";obj.value=parseInt('0xa80');obj.numargs=1;obj.addrtype="1addr";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="incb";obj.value=parseInt('0x8a80');obj.numargs=1;obj.addrtype="1addr";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="iot";obj.value=parseInt('0x4');obj.numargs=1;obj.addrtype="special";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="jmp";obj.value=parseInt('0x40');obj.numargs=1;obj.addrtype="1addr";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="jsr";obj.value=parseInt('0x800');obj.numargs=2;obj.addrtype="regaddr";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="jms";obj.value=parseInt('0x800');obj.numargs=2;obj.addrtype="regaddr";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="mark";obj.value=parseInt('0xd00');obj.numargs=1;obj.addrtype="special";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="mov";obj.value=parseInt('0x1000');obj.numargs=2;obj.addrtype="2addr";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="movb";obj.value=parseInt('0x9000');obj.numargs=2;obj.addrtype="2addr";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="mul";obj.value=parseInt('0x7000');obj.numargs=2;obj.addrtype="addrreg";addSymbol(obj);
obj = new Object();
// Error - incorrect value for neg opcode given in reference ?
obj.type="instruction";obj.name="neg";obj.value=parseInt('0xb00');obj.numargs= 1;obj.addrtype="1addr";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="negb";obj.value=parseInt('0x8b00');obj.numargs=1;obj.addrtype="1addr";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="nop";obj.value=parseInt('0xa0');obj.numargs=0;obj.addrtype="0addr";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="reset";obj.value=parseInt('0x05');obj.numargs=0;obj.addrtype="0addr";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="return";obj.value=parseInt('0x87');obj.numargs=1;obj.addrtype="special";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="rol";obj.value=parseInt('0xc40');obj.numargs=1;obj.addrtype="1addr";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="rolb";obj.value=parseInt('0x8c40');obj.numargs=1;obj.addrtype="1addr";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="ror";obj.value=parseInt('0xc00');obj.numargs=1;obj.addrtype="1addr";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="rorb";obj.value=parseInt('0x8c00');obj.numargs=1;obj.addrtype="1addr";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="rti";obj.value=parseInt('0x2');obj.numargs=1;obj.addrtype="special";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="rtt";obj.value=parseInt('0x6');obj.numargs=1;obj.addrtype="special";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="rts";obj.value=parseInt('0x80');obj.numargs=1;obj.addrtype="special";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="sbc";obj.value=parseInt('0xb80');obj.numargs=1;obj.addrtype="1addr";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="sbcb";obj.value=parseInt('0x8b80');obj.numargs=1;obj.addrtype="1addr";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="scc";obj.value=parseInt('0xbf');obj.numargs=0;obj.addrtype="0addr";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="sec";obj.value=parseInt('0xb1');obj.numargs=0;obj.addrtype="0addr";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="sen";obj.value=parseInt('0xb8');obj.numargs=0;obj.addrtype="0addr";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="sev";obj.value=parseInt('0xb2');obj.numargs=0;obj.addrtype="0addr";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="sez";obj.value=parseInt('0xb4');obj.numargs=0;obj.addrtype="0addr";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="sob";obj.value=parseInt('0x7e00');obj.numargs=2;obj.addrtype="sob";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="sub";obj.value=parseInt('0xe000');obj.numargs=2;obj.addrtype="2addr";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="swab";obj.value=parseInt('0xc0');obj.numargs= 1;obj.addrtype="1addr";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="sxt";obj.value=parseInt('0xdc0');obj.numargs= 1;obj.addrtype="1addr";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="tst";obj.value=parseInt('0xbc0');obj.numargs=1;obj.addrtype="1addr";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="tstb";obj.value=parseInt('0x8bc0');obj.numargs= 1;obj.addrtype="1addr";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="wait";obj.value=parseInt('0x01');obj.numargs=0;obj.addrtype="0addr";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="xor";obj.value=parseInt('0x7800');obj.numargs=2;obj.addrtype="regaddr";addSymbol(obj);
// Added these as not apparently there
obj = new Object();
obj.type="instruction";obj.name="emt";obj.value=parseInt('0x8800');obj.numargs=1;obj.addrtype="special";addSymbol(obj);
obj = new Object();
obj.type="instruction";obj.name="trap";obj.value=parseInt('0x8880');obj.numargs=1;obj.addrtype="special";addSymbol(obj);


// Constants will be added as:
// obj.type="constant", obj.name="...", ovj.value=xxx (interpreted octal number)

// Labels will be added as:
//obj.type = "label";obj.name = name;obj.value = currentaddress;
}