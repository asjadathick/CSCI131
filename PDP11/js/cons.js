var TKS, TPS, keybuf = 0;

function setTPSFlag() {
    var timedelay = 1;
    if(executionmode==="step")
        timedelay = 10000;
    if(executionmode==="stepstep")
        timedelay = 1000;
    setTimeout("TPS |= 0x80;", timedelay);
}

function setTPSInterrupt() {
   var timedelay = 1;
    if(executionmode==="step")
        timedelay = 10000;
    if(executionmode==="stepstep")
        timedelay = 500;
    setTimeout("TPS |= 0x80; interrupt(INTTTYOUT, 4);", timedelay);
}

function
clearterminal()
{
	var consoleoutput = document.getElementById("terminal");
	consoleoutput.value = "";
	TKS = 0;
	TPS = 1<<7;
}

function
writeterminal(msg)
{
	var ta = document.getElementById("terminal");
	//ta.firstChild.appendData(msg);

        ta.value = ta.value + msg;
	//ta.scrollTop = ta.scrollHeight;
}

function
addchar(c)
{
	TKS |= 0x80;
	keybuf = c;
	if(TKS & (1<<6)) interrupt(INTTTYIN, 400);
}

function
specialchar(c)
{
	switch(c) {
	case 42: keybuf = 4; break;
	case 19: keybuf = 034; break;
	case 46: keybuf = 127; break;
	default: return;
	}
	TKS |= 0x80;
	if(TKS & (1<<6)) interrupt(INTTTYIN, 400);
}

function
getchar()
{
	if(TKS & 0x80) {
		TKS &= 0xff7e;
		return keybuf;
	}
	return 0;
}

function
consread16(a)
{
    // Console
    // 777566 kl11 tty out dbr
    // 777564 kl11 tty out csr
    // 777562 kl11 tty in dbr
    // 777560 kl11 tty in csr
    // dbr register - data buffer
    // csr register - control and status
    
	switch(a) {
	case 0777560: return TKS;
	case 0777562: return getchar();
	case 0777564: return TPS;
	case 0777566: return 0;
	}
	panic("read from invalid address " + ostr(a,6));
}

function
conswrite16(a,v)
{
	switch(a) {
	case 0777560:
		if(v & (1<<6))
			TKS |= 1<<6;
		else
			TKS &= ~(1<<6);
		break;
	case 0777564:
		if(v & (1<<6))
			TPS |= 1<<6;
		else
			TPS &= ~(1<<6);
		break;
	case 0777566:
		v &= 0xFF;
		if(!(TPS & 0x80)) break;
		switch(v) {
		case 13: 
                    // nabg edit
                    // don't know why he suppresses newlines, his Unix works ok
                    writeterminal("\n");
                    break;
		default:
                        var char = v & 0x7F;
                        writeterminal(String.fromCharCode(char));
		}
		TPS &= 0xff7f;
		if(TPS & (1<<6))
			setTPSInterrupt();
		else
			setTPSFlag();
		break;
	default:
		panic("write to invalid address " + ostr(a,6));
	}
}
