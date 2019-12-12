#!/usr/bin/env node
'use strict';

// Lists all RFXCOM devices found by serialport

const
    rfxcom = require('../');

console.log("Scanning for RFXCOM devices...");
let devices = [],
    headerPrinted = false;
rfxcom.RfxCom.list(function (err, ports) {
    if (err) {
        console.log("Scan failed - " + err.message);
    } else if (ports.length === 0) {
        console.log("  None found")
    } else {
        ports.forEach(port => {
            let device = {};
            device.rfxtrx = new rfxcom.RfxCom(port.path);
            device.message = "  " + port.path + (port.pnpId !== undefined ? " (" + port.pnpId + ")" : "");
            device.rfxtrx.on("status", evt => {
                if (headerPrinted === false) {
                    console.log("Devices found at:");
                    headerPrinted = true;
                }
                console.log(device.message + "\n    " + evt.receiverType + " hardware version " + evt.hardwareVersion +
                    ", firmware version " + evt.firmwareVersion + " " + evt.firmwareType);
                console.log("    Enabled protocols:  " + (evt.enabledProtocols).sort());
                let disabledProtocols = [];
                for (let key in rfxcom.protocols) {
                    if (rfxcom.protocols.hasOwnProperty(key)) {
                        if (evt.enabledProtocols.indexOf(key) < 0) {
                            disabledProtocols.push(key);
                        }
                    }
                }
                console.log("    Disabled protocols: " + disabledProtocols.sort());

            });
            device.rfxtrx.on("connectfailed", () => {
                console.log(device.message + "\n    Unable to open serial port, RFXCOM device may be in use!")
            });
            device.rfxtrx.initialise(() => {device.rfxtrx.close()});
            devices.push(device);
        });
    }
});

