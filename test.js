var rfxcom = require('./index');

var device = new rfxcom.RfxCom('/dev/tty.usbserial-08WCLAS3', { debug: true });

device.on('ready', function() {
  var protocols = [];

  console.log('ready');
/*
  for (p in rfxcom.protocols) if (rfxcom.protocols.hasOwnProperty(p)) protocols.push(rfxcom.protocols[p]);
    device.enable(protocols, function (response, cmdId) {
      console.log('enabled: response=' + response + ' cmdId=' + cmdId);
    });
*/
}).on('response',  function(type, seqno) {
  console.log('response: type=' + type + ' seqno=' + seqno);
}).on('status',  function(evt) {
  console.log('status: '    + JSON.stringify(evt));
}).on('elec2',  function(evt) {
  console.log('elec2: '     + JSON.stringify(evt));
}).on('security1',  function(evt) {
  console.log('security1: ' + JSON.stringify(evt));
}).on('temp1',  function(evt) {
  console.log('temp1: '      + JSON.stringify(evt));
}).on('temp2',  function(evt) {
  console.log('temp2: '      + JSON.stringify(evt));
}).on('temp3',  function(evt) {
  console.log('temp3: '      + JSON.stringify(evt));
}).on('temp4',  function(evt) {
  console.log('temp4: '      + JSON.stringify(evt));
}).on('temp5',  function(evt) {
  console.log('temp5: '      + JSON.stringify(evt));
}).on('th1',  function(evt) {
  console.log('th1: '       + JSON.stringify(evt));
}).on('th2',  function(evt) {
  console.log('th2: '       + JSON.stringify(evt));
}).on('th3',  function(evt) {
  console.log('th3: '       + JSON.stringify(evt));
}).on('th4',  function(evt) {
  console.log('th4: '       + JSON.stringify(evt));
}).on('th5',  function(evt) {
  console.log('th5: '       + JSON.stringify(evt));
}).on('lighting1',  function(evt) {
  console.log('lighting1: ' + JSON.stringify(evt));
}).on('lighting2',  function(evt) {
  console.log('lighting2: ' + JSON.stringify(evt));
}).on('lighting5',  function(evt) {
  console.log('lighting5: ' + JSON.stringify(evt));
}).on('data',  function(data) {
  console.log('data: ' + data.toString('hex'));
}).initialise(function(evt) {
  console.log('initialise');
});

setInterval(function() { }, 10 * 1000);
