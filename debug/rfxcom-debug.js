
const rfxcom = require('rfxcom');
//const index = require('./index');

var rfxtrx, blinds, rfy, homeConfort, fan, remote, t4, rad;
//rfxtrx = new rfxcom.RfxCom("/dev/tty.usbserial-A1XF9SIM", {debug: true});  // Old hardware
rfxtrx = new rfxcom.RfxCom("/dev/tty.usbserial-A1R1A6A", {debug: true}); // E hardware
rad = new rfxcom.Radiator1(rfxtrx, rfxcom.radiator1.SMARTWARES);
// remote = new rfxcom.Remote(rfxtrx, rfxcom.remote.ATI_REMOTE_WONDER);
// t4 = new rfxcom.Thermostat4(rfxtrx, rfxcom.thermostat4.MCZ_PELLET_STOVE_3_FAN);
    //blinds = new rfxcom.Blinds1(rfxtrx, rfxcom.blinds1.BLINDS_T10);
//fan = new rfxcom.Fan(rfxtrx, rfxcom.fan.SEAV_TXS4)
    //rfy = new rfxcom.Rfy(rfxtrx, rfxcom.rfy.RFY);
    //homeConfort = new rfxcom.HomeConfort(rfxtrx, rfxcom.homeConfort.TEL_010);
// rfxtrx.on("list", function (evt) {
//     console.log(evt);
// })
//  rfxtrx.on("security1", function (evt) {
//      console.log(evt);
//  });

rfxtrx.initialise(function () {
    console.log("Device initialised");
    rad.setNightMode('0x1234567/8');
    rad.setDayMode('0x1234567/8');
    rad.setTemperature('0x1234567/8', 22.1);
    rad.setTemperature('0x1234567/8', 22.6);
    rad.setTemperature('0x1234567/8', 0);
    rad.setTemperature('0x1234567/8', 30);
/*
    rfxtrx.enableRFXProtocols([{bit: 0x08, msg: 3} /!*LIGHTING4*!/,
        {bit: 0x20, msg: 5} /!*OREGON*!/,
        {bit: 0x04, msg: 5} /!*AC*!/,
        {bit: 0x02, msg: 5} /!*ARC*!/,
        {bit: 0x01, msg: 5} /!*X10*!/,
        {bit: 0x40, msg: 5} /!*ATI*!/
    ]);
*/
//    rfy.listRemotes();
//    rfy.eraseAll();
//    rfy.program("0x01abcd/3")
 //   rfy.listRemotes();
    //homeConfort.switchOn('0x1234/A/2')
   // fan.buttonPress("0/10/0010110101/0x5", "T1")
   //  let params = {fanSpeed:[2], flamePower:1, mode:"auto"};
   //  params.fanSpeed[2] = 4;
   //  t4.sendMessage('0x1234', params);
   //  t4.sendMessage('0x1234', {fanSpeed:2, flamePower:3, mode:"auto"});
   //  t4.sendMessage('0x1234', {flamePower:3, mode:3});
   //  t4.sendMessage('0x1234', {fanSpeed:[2, 1, 4], flamePower:2, mode:"Manual"});
   //  t4.sendMessage('0x1234', {beep: false, flamePower:3, mode:"off"});
    //remote.buttonPress('0x0f', 'Vol+')
});
