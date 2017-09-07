#!/usr/bin/env node
'use strict';

// Command to set & optionally save the enabled receive protocols in an RFXCOM device

const
    rfxcom = require("../"),
    usage = ("usage: npm run set-protocols -- --list device_port\n" +
             "       npm run set-protocols -- --save device_port\n" +
             "       npm run set-protocols -- [--enable protocol_list] [--disable protocol_list] [--save] device_port"),
    STATE = {
            INITIALISING: 0,
            INITIALISED: 1,
            SENDING_ENABLE: 2,
            WAIT_FOR_ENABLE_RESPONSE: 3,
            SENDING_RESTART: 4,
            WAIT_FOR_RESTART_RESPONSE: 5,
            SENDING_SAVE: 6,
        WAIT_FOR_SAVE_RESPONSE: 7
    };


let
    currentState = STATE.INITIALISING,
    saveProtocols = false,
    readingEnabledProtocols = false,
    protocolsToEnable = [],
    enabledProtocols = [],
    readingDisabledProtocols = false,
    protocolsToDisable = [],
    disabledProtocols = [],
    listProtocols = false,
    device = "";

const args = process.argv.slice(2);
if (args.length < 2) {
    console.log("set-protocols: Missing parameters\n" + usage);
    process.exit(0);
} else if (args.length === 2) {
    device = args[1];
    if  (args[0] === "--list" || args[0] === "-l") {
        listProtocols = true;
    } else if (args[0] === "--save" || args[0] === "-s") {
        saveProtocols = true;
    } else {
        console.log("set-protocols: Invalid use of switch '" + args[0] + "'\n" + usage);
        process.exit(0);
    }
} else {
    let lastArgProcessed = -1;
    for (let i = 0; i < args.length; i++) {
        if (args[i] === "--save" || args[i] === "-s") {
            saveProtocols = true;
            readingEnabledProtocols = false;
            readingDisabledProtocols = false;
            lastArgProcessed = i;
        } else if (args[i] === "--enable" || args[i] === "-e") {
            readingEnabledProtocols = true;
            readingDisabledProtocols = false;
            lastArgProcessed = i;
        } else if (args[i] === "--disable" || args[i] === "-d") {
            readingEnabledProtocols = false;
            readingDisabledProtocols = true;
            lastArgProcessed = i;
        } else if (args[i] === "--list" || args[i] === "-l") {
            console.log("set-protocols: Invalid use of '" + args[i] + "' switch\n" + usage);
            process.exit(0);
        } else if (readingEnabledProtocols) {
            protocolsToEnable = protocolsToEnable.concat(args[i].split(",").filter(str => {return str !== ""}));
            readingEnabledProtocols = false;
            lastArgProcessed = i;
        } else if (readingDisabledProtocols) {
            protocolsToDisable = protocolsToDisable.concat(args[i].split(",").filter(str => {return str !== ""}));
            readingDisabledProtocols = false;
            lastArgProcessed = i;
        }
    }
    if (lastArgProcessed === args.length - 1) {
        console.log("set-protocols: Missing device port\n" + usage);
        process.exit(0);
    } else {
        device = args[args.length-1];
    }
}
// Check these protocols actually exist
const unrecognisedProtocols = protocolsToDisable.filter((entry) => {return !rfxcom.protocols.hasOwnProperty(entry)}).
                              concat(protocolsToEnable.filter((entry) => {return !rfxcom.protocols.hasOwnProperty(entry)}));
if (unrecognisedProtocols.length === 1) {
    console.log("set-protocols: Unrecognised protocol " + unrecognisedProtocols[0]);
    process.exit(0);
} else if (unrecognisedProtocols.length > 1){
    console.log("set-protocols: Unrecognised protocols " + unrecognisedProtocols.sort());
    process.exit(0);
}

// Create the RFXCOM object and install its event handlers
console.log("Trying to open RFXCOM device on " + device + "...");
const rfxtrx = new rfxcom.RfxCom(device);

rfxtrx.on("connecting", () => {console.log("Serial port open, initialising RFXCOM device...")});

rfxtrx.on("connectfailed", () => {
    console.log(device.message + "\n    Unable to open serial port, RFXCOM device may be in use!");
    process.exit(0);
});

rfxtrx.on("receiverstarted", () => {
    switch (currentState) {
        case STATE.INITIALISED:
            if (protocolsToEnable.length > 0 || protocolsToDisable.length > 0) {
                protocolsToEnable.sort();
                protocolsToDisable.sort();
                process.nextTick(sendEnable);
                currentState = STATE.SENDING_ENABLE;
            } else if (listProtocols) {
                console.log("Enabled protocols:  " + enabledProtocols);
                console.log("Disabled protocols: " + disabledProtocols);
                process.nextTick(() => {rfxtrx.close()});
            } else if (saveProtocols) {
                process.nextTick(sendSave);
                currentState = STATE.SENDING_SAVE;
            }
            break;

        case STATE.WAIT_FOR_RESTART_RESPONSE:
            if (saveProtocols) {
                process.nextTick(sendSave);
                currentState = STATE.SENDING_SAVE;
            } else {
                process.nextTick(() => {rfxtrx.close()});
            }
            break;

        default:
            break;
    }
});

rfxtrx.on("status", evt => {
    switch (currentState) {
        case STATE.INITIALISING:
            console.log(evt.receiverType + " hardware version " + evt.hardwareVersion +
                ", firmware version " + evt.firmwareVersion + " " + evt.firmwareType);
            enabledProtocols = evt.enabledProtocols.sort();
            for (let key in rfxcom.protocols) {
                if (rfxcom.protocols.hasOwnProperty(key)) {
                    if (enabledProtocols.indexOf(key) < 0) {
                        disabledProtocols.push(key);
                    }
                }
            }
            disabledProtocols.sort();
            if (listProtocols === false) {
                console.log("Currently enabled: " + enabledProtocols);
            }
            currentState = STATE.INITIALISED;
            break;

        case STATE.WAIT_FOR_ENABLE_RESPONSE:
            // note we must wait for the start receiver command response as well, before its OK to close
            currentState = STATE.WAIT_FOR_RESTART_RESPONSE;
            break;

        case STATE.WAIT_FOR_SAVE_RESPONSE:
            console.log("Saved to non-volatile memory");
            process.nextTick(() => {rfxtrx.close()});
            break;

        default:
            break;
    }
});

const sendEnable = function () {
    // Remove duplicate entries from each list of protocols
    protocolsToEnable = protocolsToEnable.filter((entry, index, entries) => {return index === 0 || entry !== entries[index-1]});
    protocolsToDisable = protocolsToDisable.filter((entry, index, entries) => {return index === 0 || entry !== entries[index-1]});
    // Remove entries which appear in both lists
    const validEnables = protocolsToEnable.map((entry) => {return protocolsToDisable.indexOf(entry) < 0});
    const validDisables = protocolsToDisable.map((entry) => {return protocolsToEnable.indexOf(entry) < 0});
    protocolsToEnable = protocolsToEnable.filter((entry, index) => {return validEnables[index]});
    protocolsToDisable = protocolsToDisable.filter((entry, index) => {return validDisables[index]});
    // Remove those entries in the enabledProtocols list which appear in the protocolsToDisable list...
    protocolsToEnable = enabledProtocols.filter((entry) => {return protocolsToDisable.indexOf(entry) < 0}).
    // ...concatenate the protocolsToEnable list...
                        concat(protocolsToEnable).
    // ...sort and remove duplicates
                        sort().
                        filter((entry, index, entries) => {return index === 0 || entry !== entries[index-1]});
    console.log("        Change to: " + protocolsToEnable);


    // Send the command
    rfxtrx.enableRFXProtocols(protocolsToEnable.map(entry => rfxcom.protocols[entry]));
    currentState = STATE.WAIT_FOR_ENABLE_RESPONSE;
};

const sendSave = function () {
    rfxtrx.saveRFXProtocols();
    currentState = STATE.WAIT_FOR_SAVE_RESPONSE;
};

// Start the rfxtrx device to kick everything off
rfxtrx.initialise();
