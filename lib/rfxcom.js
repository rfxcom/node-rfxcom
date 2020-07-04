'use strict';
const SerialPort = require("serialport"),
    rfxcom = require("./index"),
    EventEmitter = require("events"),
    queue = require("queue"),
    defines  = require("./defines"),
    util = require("util"),
    dateFormat = require("date-format"),
    Transform = require("stream").Transform;


class RFXParser extends Transform {
    // This is a buffering parser which accumulates message bytes until it receives the number of bytes specified by the
    // first byte of the message + 1. It relies on a flushed buffer, to ensure it starts with the length byte of the
    // first message. The 'data' message emitted contains all the message bytes. Messages may be split across multiple
    // buffers, or a single buffer may contain multiple messages. If a length byte is outside the valid range (less than 4)
    // it is assumed synchronisation has been lost and all received data is discarded. The parser attempts to resynchronise
    // at the start of the next buffer.
    constructor(rfxtrx) {
        super({readableObjectMode: true});
        this.data = [];
        this.requiredBytes = 0;
        this.rfxtrx = rfxtrx;
    }
    // noinspection JSUnusedGlobalSymbols
    _transform(buffer, encoding, callback) {
        if (this.rfxtrx.receiving) {
            this.data.push.apply(this.data, buffer);
            while (this.data.length >= this.requiredBytes) {
                if (this.requiredBytes > 0) { // There is a message in the buffer - push it
                    this.push(this.data.slice(0, this.requiredBytes));
                    this.data = this.data.slice(this.requiredBytes);
                }
                if (this.data.length > 0 && this.data[0] >= 4) { // data[0] is the length byte of the next message
                    this.requiredBytes = this.data[0] + 1;
                } else { // lost synch - flush & try again
                    this.requiredBytes = 0;
                    this.data = [];
                    break;
                }
            }
        }
        callback();
    }
}

class RfxCom extends EventEmitter {
        constructor(device, options) {
        super();
        const self = this;

        // Store the device to use
        this.device = device;
        this.options = options || {};
        // Allow for faking out the SerialPort
        if (typeof this.options.port !== "undefined") {
            this.serialport = options.port;
        }
        this.firmwareVersion = 0;
        // Device-specific parmeters for packet hndlers
        this.deviceParameters = this.options.deviceParameters || {};

        // Packet handlers
        this.handlers = {
            0x01: "statusMessageHandler",
            0x02: "transmitCommandResponseHandler",
            0x10: "lighting1Handler",
            0x11: "lighting2Handler",
            0x13: "lighting4Handler",
            0x14: "lighting5Handler",
            0x15: "lighting6Handler",
            0x16: "chimeHandler",
            0x17: "fanHandler",
            0x19: "blinds1Handler",
            0x1c: "edisioHandler",
            0x1e: "funkbusHandler",
            0x1f: "hunterfanHandler",
            0x20: "security1Handler",
            0x28: "camera1Handler",
            0x30: "remoteHandler",
            0x40: "thermostat1Handler",
            0x42: "thermostat3Handler",
            0x4e: "bbqHandler",
            0x4f: "temprainHandler",
            0x50: "tempHandler",
            0x51: "humidityHandler",
            0x52: "temphumidityHandler",
            0x54: "temphumbaroHandler",
            0x55: "rainHandler",
            0x56: "windHandler",
            0x57: "uvHandler",
            0x58: "dateTimeHandler",
            0x59: "elec1Handler",
            0x5a: "elec23Handler",
            0x5b: "elec4Handler",
            0x5c: "elec5Handler",
            0x5d: "weightHandler",
            0x60: "cartelectronicHandler",
            0x70: "rfxsensorHandler",
            0x71: "rfxmeterHandler",
            0x76: "weatherHandler",
            0x77: "solarHandler"
        };
        // Human-readable names for packets & devices
        this.deviceNames = rfxcom.deviceNames;
        this.packetNames = rfxcom.packetNames;

        // This is how long a caller must wait between initialisation attempts
        // It is long enough for the 'ready' event to have been emitted if the
        // previous call to initialise() succeeded
        this.initialiseWaitTime = 6000;

        // Running counter for command message sequence numbers.
        this._seqnbr = 0;

        // The transmit message queue
        // The transmission timeout is set to 12s to allow time for 40 Rfy remotes to be reported in response
        // to an Rfy.listRemotes() call. I measured this at 10.1s on a fast system, with no other packets present
        this.TxQ = queue({concurrency: self.options.concurrency || 3,
            timeout: self.options.timeout || 12000});
        this.TxQ.on("timeout", function (next, transmission) {
            if (transmission.sender._timeoutHandler.call(transmission.sender, transmission.buffer, transmission.seqnbr) === false) {
                self.debugLog("Error   : Command message " + RfxCom.dumpHex([transmission.seqnbr]) +
                    ", timed out waiting for response");
                self.emit("response", "Timed out waiting for response", transmission.seqnbr, rfxcom.responseCode.TIMEOUT);
            }
            next();
        });
        // Holds the command acknowledgement callbacks for the transmit queue
        this.acknowledge = new Array(256);
        for (let idx = 0; idx < this.acknowledge.length; idx++) {
            this.acknowledge[idx] = null;
        }

        // Create the parser and listen for data events from it (the parser will be applied to the serialport once the
        // port has been created)
        this.parser = new RFXParser(this);
        this.parser.on("data", function(data) {
            const
                length = data[0] + 1,
                packetType = data[1],
                handler = self.handlers[packetType];
            self.debugLog("Received: " + RfxCom.dumpHex(data));
            // Always emit a "data" event, even if we don't have a handler for the packet type
            self.emit("receive", data);

            // Avoid calling a handler with the wrong length packet, and catch any Error a handler may throw
            if (data.length !== length) {
                self.debugLog("Wrong packet length: " + data.length + " bytes, should be " + length)
            } else {
                if (typeof handler !== "undefined") {
                    try {
                        self[handler](data.slice(2), packetType);
                    } catch (e) {
                        if (e instanceof Error) {
                            self.debugLog("Packet type " + RfxCom.dumpHex([packetType]) +
                                " handler threw exception " + e.name + ": " + e.message);
                        }
                    }
                } else {
                    self.debugLog("Unhandled packet type = " + RfxCom.dumpHex([packetType]));
                }
            }
        });

        // Send the initial handshake sequence once the serialport is open & handle errors
        this.on("ready", function () {
                self.resetRFX(function (err) {
                        if (err) {
                            self.close();
                            self.emit("disconnect", err);
                        } else {
                            setTimeout(function () {
                                // TODO - test that flush() now works correctly on Windows
                                if (process.platform === "win32") {
                                    self.receiving = true;
                                    self.getRFXStatus(function (err) {
                                        if (err) {
                                            self.close();
                                            self.emit("disconnect", err);
                                        }
                                    });
                                } else {
                                    self.flush(function (err) {
                                        if (err) {
                                            self.close();
                                            self.emit("disconnect", err);
                                        } else {
                                            self.receiving = true;
                                            self.getRFXStatus(function (err) {
                                                if (err) {
                                                    self.close();
                                                    self.emit("disconnect", err);
                                                }
                                            });
                                        }
                                    });
                                }
                                }, 500);
                        }
                    });
            });

        // Initial state
        this.portEventHandlersInstalled = false;
        this.connected = false;
        this.initialising = false;
        this.receiving = false;
        this.startReceiverRequired = true;
        this.transmitters = {};
        this.readyCallback = null;
        this.receiverTypeCode = 0x00;
        this.transmitterPower = +10; // dBm;
    };

    debugLog(message) {
        if (this.options.debug) {
            console.log(dateFormat("yyyy-MM-dd hh:mm:ss.SSS", new Date(Date.now())) + " [rfxcom] on " + this.device + " - " + message);
        }
    };

    /*
     * These methods allow an arbitrary name/value pair {parameter, value} to be set for a particular device
     * "subtype/Id" and a specified packet type.
     *
     * This allows event handlers to access device-specified configuration data, e.g. for RAIN8 (Davis) gauges, which can
     * have Metric or US Customary buckets {cartridgeVolume: 0.2} or {cartridgeVolume: 0.01}
     *
     * The setter uses names, but the getter uses numbers, as these are more easily accessed by the packet data handlers.
     */
    setDeviceParameter(packetName, subtypeName, id, parameter, value) {
        let key = subtypeName + "/0x" + Number(id).toString(16).toUpperCase();
        this.deviceParameters[rfxcom.packetNames[packetName]] = {};
        this.deviceParameters[rfxcom.packetNames[packetName]][key] = {};
        this.deviceParameters[rfxcom.packetNames[packetName]][key][parameter] = value;
    }

    getDeviceParameter(packetType, subtype, id, parameter, defaultValue) {
        let value = defaultValue;
        let packetTypeParameters = this.deviceParameters[packetType];
        if (packetTypeParameters) {
            let deviceParameters = packetTypeParameters[rfxcom[this.packetNames[packetType]][subtype] + "/" + id];
            if (deviceParameters) {
                value = deviceParameters[parameter];
            }
        }
        return value;
    }

    nextMessageSequenceNumber() {
    // Fetches a "command message sequence number" for identifying requests sent to the device.
        if (this._seqnbr > 255) {
            this._seqnbr = 0;
        }
        return this._seqnbr++;
    };

    // The 'proper' way to start up the RFXtrx. If supplied, the callback will be called after the device is ready and
    // the handshake sequence has completed - no corresponding event is emitted, so this is the only way to take action
    // on this condition
    initialise(callback) {
        if (this.initialising === false) {
            this.initialising = true;
            this.readyCallback = callback || null;
            this.open();
        }
    };

    // Attempt to establish communication with the RFXtrx
    open() {
        const self = this;
        // If we weren't supplied a serialport in the constructor, create one
        if (typeof self.serialport === "undefined") {
            // Delay opening the serialport until after the event handlers are installed
            self.serialport = new SerialPort(self.device, {
                baudRate: 38400,
                lock: false,
                autoOpen: false
            });
            self.serialport.pipe(self.parser);
        }

        // Important: only ever install the handlers once, no matter how many times open() is called!
        if (self.portEventHandlersInstalled === false) {
            self.serialport.on("open", self.openHandler.bind(self));
            self.serialport.on("error", self.errorHandler.bind(self));
            self.serialport.on("close", self.closeHandler.bind(self));
            self.portEventHandlersInstalled = true;
        }

        // Now everything is set up, open the serialport - the "open" event handler starts the handshake
        if (typeof self.serialport.open === "function") {
            self.serialport.open();
        }
    };

    // Called to clear all state when the RFXtrx is disconnected, or we want to force a disconnection
    close() {
        // Cancel all messages in the queue
        this.TxQ.end();
        this.debugLog("Cleared command message queue");
        for (let idx = 0; idx < this.acknowledge.length; idx++) {
            this.acknowledge[idx] = null;
        }
        this._seqnbr = 0;
        // Close the serialport if necessary - should only happen if this function is called from user code
        if (this.serialport && this.serialport.isOpen) {
            this.serialport.close(null, null);
        }
        this.connected = false;
        this.initialising = false;
        this.receiving = false;
    };

    // If the RFXTRX has just been connected, we must wait for at least 5s before any
    // attempt to communicate with it, or it will enter the flash bootloader.
    // We can't know how long it has been connected, so we must always wait!
    openHandler() {
        const self = this;
        this.connected = true;
        this.emit("connecting");
        setTimeout(function () {
            self.emit("ready")
            }, this.initialiseWaitTime - 500);
    };

    disconnectHandler(err) {
        // Call close() to clear the transmit queue and reset our state, then emit the
        // appropriate event
        const wasConnected = this.connected;
        this.close();
        if (wasConnected) {
            this.emit("disconnect", err.message);
        } else {
            this.emit("connectfailed", err.message);
        }
    };

    errorHandler(err) {
        this.debugLog(err.message);
        // If the port open fails, handle as a disconnect
        if (err.message.startsWith("Error: No such file or directory, cannot open")) {
            this.disconnectHandler(err);
        }
    };
    closeHandler(err) {
        // Handle a disconnect when one occurs
        if (err && err.disconnected === true) {
            this.debugLog("RFXtrx433 disconnected from " + this.device);
            this.disconnectHandler(err);
        }
    };

    /*
     *
     * Calls flush on the underlying SerialPort.
     *
     */
    flush(callback) {
        if (typeof this.serialport.flush === "function") {
            this.serialport.flush(callback);
        }
    };

    queueMessage(sender, buffer, seqnbr, callback) {
        // External function for queueing messages for later transmission
        const self = this;

        if (self.connected) {
            self.debugLog("Queued  : " + RfxCom.dumpHex(buffer));
            self.TxQ.push(function () {
                    let transmission = function (cb) {
                        self.acknowledge[seqnbr] = cb;
                        self.transmit(buffer, seqnbr, callback);
                    };
                    transmission.buffer = buffer;
                    transmission.seqnbr = seqnbr;
                    transmission.sender = sender;
                    return transmission;
                }()
            );
            if (self.initialising === false) {
                self.TxQ.start();
            }
        }
    };

    _sendMessage(type, subtype, cmd, extra, callback) {
        // Internal function for sending messages to the device, bypassing the transmit queue
        const
            seqnbr = this.nextMessageSequenceNumber(),
            byteCount = extra.length + 4;
        let buffer = [byteCount, type, subtype, seqnbr, cmd];
        buffer = buffer.concat(extra);
        this.transmit(buffer, seqnbr, callback);
        return seqnbr;
    };

    /*
     * Send bytes to the serialport - called either directly from _sendMessage or from the transmit queue job
     * Log the transmitted bytes to console if debug enabled
     */
    transmit(buffer, seqnbr, callback) {
        const self = this;
        if (self.serialport && typeof self.serialport.write === "function") {
            if (self.serialport.isOpen) {
                self.serialport.write(buffer, function (err, response) {
                    self.debugLog("Sent    : " + RfxCom.dumpHex(buffer));
                    if (callback && typeof callback === "function") {
                        return callback(err, response, seqnbr);
                    }
                });
            } else {
                self.debugLog("Serial port was closed unexpectedly");
                self.debugLog("Dropped : " + RfxCom.dumpHex(buffer));
            }
        }
    };

    /*
     *
     * Writes the resetRFX sequence to the RFxtrx433.
     *
     */
    resetRFX(callback) {
        return this._sendMessage(0, 0, 0, [0, 0, 0, 0, 0, 0, 0, 0, 0], callback);
    };

    /*
     * Sends the get status bytes to the interface.
     */
    getRFXStatus(callback) {
        return this._sendMessage(0, 0, 2, [0, 0, 0, 0, 0, 0, 0, 0, 0], callback);
    };

    /*
     * Sends the start receiver bytes to the interface.
     */
    startRFXReceiver(callback) {
        return this._sendMessage(0, 0, 7, [0, 0, 0, 0, 0, 0, 0, 0, 0], callback);
    };

    /*
     * Enables reception of different protocols - now just a compatibilty shim around configureRFX()
     */
    enableRFXProtocols(protocols, callback) {
        this.configureRFX(0, 0, protocols, callback);
    };

    /*
     * Set receiver frequency & transmitter power (where these are configurable) and the set of
     * enabled protocols to receive. Frequency units are MHz, power units dBm
     */
    configureRFX(rxFrequency, txPower, protocols, callback) {
        const
            seqnbr = this.nextMessageSequenceNumber(),
            header = [0x0D, 0x00, 0x00, seqnbr, 0x03];
        let msg = [this.receiverTypeCode, 0x1c, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
        rxFrequency = Number(rxFrequency);
        // noinspection FallThroughInSwitchStatementJS
        switch (this.receiverTypeCode) {
            case 0x50:
            case 0x51:
                // RFXtrx315
                if (rxFrequency === 310) {
                    msg[0] = 0x50;
                } else if (rxFrequency === 315) {
                    msg[0] = 0x51;
                }
                break;

            case 0x53:
            case 0x54:
            case 0x5f:
                // RFXtrx433, RFXtrx433E, RFXtrx433Pro
                if (rxFrequency === 433.92) {
                    msg[0] = 0x53;
                } else if (rxFrequency === 433.42) {
                    msg[0] = 0x54;
                } else if (rxFrequency === 434.50) {
                    msg[0] = 0x5F;
                }
                break;

            case 0x5C:
            case 0x5D:
                // RFXtrxIOT
                if (rxFrequency === 433 || rxFrequency === 434) {
                    msg[0] = 0x5C;
                } else if (rxFrequency === 868) {
                    msg[0] = 0x5D;
                }
            case 0x55:
            case 0x56:
            case 0x57:
            case 0x58:
            case 0x59:
            case 0x5A:
            case 0x5B:
                // RFXtrx868
                if (txPower >= -18 && txPower <= +13) {
                    this.transmitterPower = Math.round(txPower);
                    msg[1] = this.transmitterPower + 0x12;
                }
                break;
        }
        this.receiverTypeCode = msg[0];
        if (Array.isArray(protocols) === false) {
            protocols = [protocols];
        }

        protocols.forEach(function(protocol) {
            if (typeof msg[protocol.msg] === "undefined") {
                msg[protocol.msg - 1] = protocol.bit;
            } else {
                msg[protocol.msg - 1] |= protocol.bit;
            }
        });
        return this.queueMessage(this, header.concat(msg), seqnbr, callback);
    };

    /*
     * Save the enabled protocols of the receiver/transceiver in non-volatile memory
     *
     * Important: Do not send the saveRFXProtocols command very often because there is a
     * maximum of 10,000 write cycles to non-volatile memory!
     */
    saveRFXProtocols(callback) {
        const msg = [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
        return this._sendMessage(0, 0, 0x06, msg, callback);
    };

//------------------------------------------
//          INTERFACE CONTROL MESSAGE HANDLERS
//------------------------------------------

    /*
     *
     * Called by the data event handler when an Interface Response Message arrives
     * from the device.
     *
     */
    statusMessageHandler(data) {
        const
            self = this,
            receiverTypes = {
                0x50: "310MHz",
                0x51: "315MHz",
                0x52: "433.92MHz receiver only",
                0x53: "433.92MHz transceiver",
                0x54: "433.42MHz transceiver",
                0x55: "868.00MHz",
                0x56: "868.00MHz FSK",
                0x57: "868.30MHz",
                0x58: "868.30MHz FSK",
                0x59: "868.35MHz",
                0x5A: "868.35MHz FSK",
                0x5B: "868.95MHz",
                0x5C: "433.92MHz RFXtrxIOT",
                0x5D: "868.00MHz RFXtrxIOT",
                0x5F: "434.50MHz transceiver"
            },
            firmwareTypes = {0x00: "Type 1 RO", 0x01: "Type 1", 0x02: "Type 2", 0x03: "Ext", 0x04: "Ext 2", 
                             0x05: "Pro 1", 0x06: "Pro 2", 0x10: "ProXL1"},
            subtype = data[0],
            seqnbr = data[1],
            cmnd = data[2];
        let transmitterPower = 10, msg, hardwareVersion, firmwareVersion, firmwareType, protocols, copyrightText;

        if (subtype === 0xFF) {         // Message not understood!
            if (self.acknowledge[seqnbr] !== undefined && typeof self.acknowledge[seqnbr] === "function") {
                self.acknowledge[seqnbr]();
                self.acknowledge[seqnbr] = null;
            }
            // Handle early firmware versions that don't understand command 0x07 - "start receiver"
            if (self.initialising) {
                    self.initialising = false;
                    self.TxQ.start();
                    self.debugLog("Started command message queue");
            } else {
                self.debugLog("Response: Command message " + RfxCom.dumpHex([seqnbr]) +
                    ", command unknown or not supported by this device");
                self.emit("response", "Command unknown or not supported by this device",
                                                    seqnbr, rfxcom.responseCode.UNKNOWN_COMMAND);
            }
        } else if (subtype === 0x07) {  // Start receiver response (should return copyright message)
            if (self.acknowledge[seqnbr] !== undefined && typeof self.acknowledge[seqnbr] === "function") {
                self.acknowledge[seqnbr]();
                self.acknowledge[seqnbr] = null;
            }
            copyrightText = String.fromCharCode.apply(String, data.slice(3, 19));
            self.emit("receiverstarted", copyrightText);
            if (copyrightText === "Copyright RFXCOM") {
                self.debugLog(copyrightText);
                if (self.initialising) {
                    self.initialising = false;
                    self.TxQ.start();
                    self.debugLog("Started command message queue");
                    if (typeof self.readyCallback === "function") {
                        self.readyCallback();
                    }
                }
            } else {
                throw new Error("[rfxcom] on " + self.device + " - Invalid response '" + copyrightText +"'");
            }
        } else if (subtype === 0x04 || subtype === 0x03) {  // Handle RFY/ASA list remotes status response
            const params = {
                remoteNumber: data[3],
                remoteType: subtype === 0x03 ? "RFY" : "ASA",
                deviceId: "0x" + RfxCom.dumpHex(data.slice(4, 7)).join("") + "/" + data[7],
                idBytes: [data[4], data[5], data[6]],
                unitCode: data[7],
                randomCode: data[8],
                rollingCode: 256*data[9] + data[10]
            };
            self.rfyRemotesList.push(params);
        } else if (subtype === 0x01) {  // Unknown RFY remote
            if (self.acknowledge[seqnbr] !== undefined && typeof self.acknowledge[seqnbr] === "function") {
                self.acknowledge[seqnbr]();
                self.acknowledge[seqnbr] = null;
            }
            self.debugLog("Response: Command message " + RfxCom.dumpHex([seqnbr]) + ", unknown RFY remote ID");
            self.emit("response", "Unknown RFY remote ID", seqnbr, rfxcom.responseCode.UNKNOWN_REMOTE_ID);
        } else if (subtype === 0x00) {  // Mode command response
            if (self.acknowledge[seqnbr] !== undefined && typeof self.acknowledge[seqnbr] === "function") {
                self.acknowledge[seqnbr]();
                self.acknowledge[seqnbr] = null;
            }
            // Firmware version decoding supplied by Bert Weijenberg
            if (data.length > 12) {
                self.startReceiverRequired = true; // New firmware versions require the command
                msg = data.slice(2, 19);
                firmwareVersion = msg[2] + 1000;
                firmwareType = msg[10];
                transmitterPower = msg[9] - 18;
            } else {
                self.startReceiverRequired = false; // Old firmware versions dont support the command
                msg = data.slice(2, 12);
                firmwareVersion = msg[2];
                if (msg[1] === 0x52 && firmwareVersion < 162) {
                    firmwareType = 0;
                } else if (msg[1] === 0x53 && firmwareVersion < 162) {
                    firmwareType = 1;
                    if (firmwareVersion >= 89) {
                        transmitterPower = msg[9] - 18;
                    }
                } else if (msg[1] === 0x53 && firmwareVersion >= 162 && firmwareVersion < 225) {
                    firmwareType = 2;
                    if (firmwareVersion >= 189) {
                        transmitterPower = msg[9] - 18;
                    }
                } else {
                    firmwareType = 3;
                    if (firmwareVersion >= 243) {
                        transmitterPower = msg[9] - 18;
                    }
                }
            }
            self.firmwareVersion = firmwareVersion;
            self.receiverTypeCode = msg[1];
            if (transmitterPower > 13.0) {
                transmitterPower = 10.0;
            }
            self.transmitterPower = self.receiverTypeCode === 0x52 ? -99 : transmitterPower;
            hardwareVersion = msg[7] + "." + msg[8];
            // Check which protocols are enabled
            protocols = [];
            for (let key in rfxcom.protocols) {
                if (rfxcom.protocols.hasOwnProperty(key)) {
                    const value = rfxcom.protocols[key];
                    // noinspection JSBitwiseOperatorUsage
                    if (msg[value.msg] & value.bit) {
                        protocols.push(key);
                    }
                }
            }
            // Now we are ready to go
            const evt = {
                subtype:          subtype,
                seqnbr:           seqnbr,
                cmnd:             cmnd,
                receiverType:     receiverTypes[self.receiverTypeCode] || "Unknown device",
                hardwareVersion:  hardwareVersion,
                firmwareVersion:  firmwareVersion,
                firmwareType:     firmwareTypes[firmwareType] || "Unknown firmware",
                enabledProtocols: protocols
            };
            if (firmwareType !== 0) {
                evt.transmitterPower = transmitterPower;
            }
            if (firmwareType >= 5) { // PRO firmware only
                // TODO - noise level calibration to give dBm?
                evt.noiseLevel = msg[11];
            }
            self.emit("status", evt);
        // Send the start receiver command if required by this firmware version
            if (self.startReceiverRequired) {
                self.startRFXReceiver(function (err) {
                    if (err) {
                        self.close();
                        self.emit("disconnect", err);
                    }
                });
            } else if (self.initialising) {
                self.initialising = false;
                self.TxQ.start();
                self.debugLog("Started command message queue");
                    if (typeof self.readyCallback === "function") {
                        self.readyCallback();
                    }
                }
            }
        };

    transmitCommandResponseHandler(data) {
        const
            seqnbr = data[1],
            responses = {
                0: "ACK - transmit OK",
                1: "ACK - transmit delayed",
                2: "NAK - transmitter did not lock onto frequency",
                3: "NAK - AC address not allowed"
            },
            message = data[2];
        if (this.acknowledge[seqnbr] !== undefined && typeof this.acknowledge[seqnbr] === "function") {
            this.acknowledge[seqnbr]();
            this.acknowledge[seqnbr] = null;
        }
        this.debugLog("Response: Command message " + RfxCom.dumpHex([seqnbr]) + ", " + responses[message]);
        this.emit("response", responses[message], seqnbr, message);
    };

//------------------------------------------
//          DATA PACKET HANDLERS
//------------------------------------------

/*
 *
 * Called by the data event handler when data arrives from a Lighting1
 * light control device (packet type 0x10).
 *
 */
    lighting1Handler(data, packetType) {
        const
            commands = {
                0: "Off",
                1: "On",
                2: "Dim",
                3: "Bright",
                5: "All Off",
                6: "All On",
                7: "Chime"
            },
            evt = {
                id: "0x" + RfxCom.dumpHex(data.slice(2, 4), false).join(""), // Redundant?
                subtype: data[0],
                seqnbr: data[1],
                houseCode: String.fromCharCode(data[2]).toUpperCase(),
                unitCode: data[3],
                commandNumber: data[4],
                command: commands[data[4]] || "Unknown",
                rssi: (data[5] >> 4) & 0xf
            };

        this.emit("lighting1", evt, packetType);
    };

/*
 *
 * Called by the data event handler when data arrives from a HomeEasy
 * light control device (packet type 0x11).
 *
 */
    lighting2Handler(data, packetType) {
        let idBytes = data.slice(2, 6);
        idBytes[0] &= ~0xfc; // "id1 : 2"
        const
            commands = {
                0: "Off",
                1: "On",
                2: "Set Level",
                3: "Group Off",
                4: "Group On",
                5: "Set Group Level"
            },
            evt = {
                subtype: data[0],
                seqnbr: data[1],
                id: "0x" + RfxCom.dumpHex(idBytes, false).join(""),
                unitCode: data[6],
                commandNumber: data[7],
                command: commands[data[7]] || "Unknown",
                level: data[8],
                rssi: (data[9] >> 4) & 0xf
            };

        this.emit("lighting2", evt, packetType);
    };

/*
 *
 * Called by the data event handler when data arrives from a device using the PT2262 chip (paket type 0x13)
 * This always has a commandNumber of 0, corresponding to the sole supported command 'Data'
 * The actual data encoded by the chip is returned as a hex string in 'data'
 *
 */
    lighting4Handler(data, packetType) {
        const
            evt = {
                subtype: data[0],
                seqnbr: data[1],
                data: "0x" + RfxCom.dumpHex(data.slice(2, 5), false).join(""),
                commandNumber: 0,
                command: "Data",
                pulseWidth: (256*data[5] + data[6]),
                rssi: (data[7] >> 4) & 0xf
            };
        this.emit("lighting4", evt, packetType);
    };

/*
 *
 * Called by the data event handler when data arrives from a LightwaveRF/Siemens
 * light control device (packet type 0x14).
 *
 */
    lighting5Handler(data, packetType) {
        const
            commands = {
                0: "Off",
                1: "On",
                2: "Group Off",
                3: "Mood1",
                4: "Mood2",
                5: "Mood3",
                6: "Mood4",
                7: "Mood5",
                10: "Unlock Socket",
                11: "Lock Socket",
                12: "All Lock",
                13: "Close",
                14: "Stop",
                15: "Open",
                16: "Set Level"
            },
            livolloCommands = {
                0: "Group Off",
                1: "Toggle 1",
                2: "Toggle 2/Bright",
                3: "Toggle 3/Dim",
                4: "Toggle 4",
                5: "Toggle 5",
                6: "Toggle 6",
                7: "Toggle 7",
                8: "Bright 7",
                9: "Dim 7",
                10: "Toggle 8",
                11: "Toggle 9",
                12: "Bright 9",
                13: "Dim 9",
                14: "Toggle 10",
                15: "Scene 1",
                16: "Scene 2",
                17: "Scene 3",
                18: "Scene 4",
                19: "OK/Set"
            };
        let evt = {
                subtype: data[0],
                id: "0x" + RfxCom.dumpHex(data.slice(2, 5), false).join(""),
                unitCode: data[5],
                commandNumber: data[6],
                command: commands[data[6]] || "Unknown",
                seqnbr: data[1],
                level: data[7],
                rssi: (data[8] >> 4) & 0xf
            };
        if (evt.subtype === rfxcom.lighting5.LEGRAND && evt.commandNumber === 0) {
            evt.command = "toggleOnOff";
        } else if (evt.subtype === rfxcom.lighting5.LIVOLO || evt.subtype === rfxcom.lighting5.LIVOLO_APPLIANCE) {
            evt.command = livolloCommands[evt.commandNumber];
        }
        this.emit("lighting5", evt, packetType);
    };

/*
 *
 * Called by the data event handler when data arrives from a Blyss
 * light control device (packet type 0x15)
 *
 */
    lighting6Handler(data, packetType) {
        const
            commands = {
                0: "On",
                1: "Off",
                2: "Group On",
                3: "Group Off"
            },
            evt = {
                subtype: data[0],
                seqnbr: data[1],
                id: "0x" + RfxCom.dumpHex(data.slice(2, 4), false).join(""),
                groupCode: String.fromCharCode(data[4]).toUpperCase(),
                unitCode: data[5],
                commandNumber: data[6],
                command: commands[data[6]] || "Unknown",
                rssi: (data[9] >> 4) & 0xf
            };
        this.emit("lighting6", evt, packetType);
    };

/*
 *
 * Called by the data event handler when data arrives from various doorbell pushbuttons
 * (packet type 0x16)
 *
 */
    chimeHandler(data, packetType) {
        const
            commands = {
                1: "Tubular 3 notes",
                13: "Tubular 3 notes",
                3: "Big Ben",
                14: "Big Ben",
                5: "Tubular 2 notes",
                6: "Tubular 2 notes",
                9: "Solo",
                2: "Solo"
            };
        let evt = {
            subtype: data[0],
            seqnbr: data[1],
            rssi: (data[5] >> 4) & 0xf
        };
        if (evt.subtype === 0) {
            evt.id = "0x" + RfxCom.dumpHex(data.slice(3, 4), false).join("");
            evt.commandNumber = data[4];
            evt.command = commands[data[4]] || "";
        } else if (evt.subtype === 1) {
            // noinspection JSBitwiseOperatorUsage
            evt.id = (data[2] & 0x40 ? "0" : "1") + (data[2] & 0x10 ? "0" : "1") +
                (data[2] & 0x04 ? "0" : "1") + (data[2] & 0x01 ? "0" : "1") +
                (data[3] & 0x40 ? "0" : "1") + (data[3] & 0x10 ? "0" : "1");
        } else if (evt.subtype === 3) {
            evt.id = "0x" + RfxCom.dumpHex([(data[4] & 0x80) >> 7, data[2], data[3]], false).join("");
            evt.commandNumber = data[4] & 0x7f;
            evt.command = "";
        } else {
            evt.id = "0x" + RfxCom.dumpHex(data.slice(2, 5), false).join("");
        }
        this.emit("chime1", evt, packetType);
    };

/*
 *
 * Called by the data event handler when data arrives from fan remote controls
 * (packet type 0x17)
 *
 */
    fanHandler(data, packetType) {
        let evt = {
            subtype: data[0],
            seqnbr: data[1],
            rssi: (data[6] >> 4) & 0xf,
            commandNumber: data[5]
        };
        switch (evt.subtype){
            case 0:
                evt.id = "0x" + RfxCom.dumpHex(data.slice(3, 5), false).join("");
                evt.command = [undefined, "Timer", "-", "Learn", "+", "Confirm", "Light"][evt.commandNumber];
                break;

            case 1:
                evt.id = "0x" + RfxCom.dumpHex(data.slice(2, 5), false).join("");
                evt.command = [undefined, "1", "2", "3", "Timer", "Not at Home", "Learn", "Erase all remotes"][evt.commandNumber];
                break;

            case 2:
            case 4:
            case 6:
                evt.id = "0x" + RfxCom.dumpHex(data.slice(4, 5), false).join("");
                evt.command = [undefined, "Hi", "Med", "Low", "Off", "Light"][evt.commandNumber];
                break;

            case 3:
                evt.id = ((data[2] & 0x80) >> 7).toString(2) + "/" +
                    RfxCom.zeroPad(((data[2] & 0x60) >> 5), 2, 2)+ "/" +
                         RfxCom.zeroPad((data[3]*8 + ((data[4] & 0xe0) >> 5)), 10, 2) + "/0x" +
                         (data[4] && 0x1f).toString(16);
                evt.command = [undefined, "T1", "T2", "T3", "T4"][evt.commandNumber];
                break;

            case 5:
                evt.id = "0x" + RfxCom.dumpHex(data.slice(4, 5), false).join("");
                evt.command = [undefined, "Power", "+", "-", "Light", "Reverse", "Natural flow", "Pair"][evt.commandNumber];
                break;

            case 7:
                evt.id = "0x" + RfxCom.dumpHex(data.slice(3, 5), false).join("");
                evt.command = [undefined, "Power", "Light", "1", "2", "3", "4", "5", "F/R", "1H", "4H", "8H"][evt.commandNumber];
                break;

            case 8:
                evt.id = "0x" + RfxCom.dumpHex(data.slice(4, 5), false).join("");
                evt.command = [undefined, "Power Off", "Speed 1", "Speed 2", "Speed 3", "Speed 4", "Timer 1", "Timer 2",
                                "Timer 3", "Timer 4", "Light On", "Light Off"][evt.commandNumber];
                break;

            case 9:
                evt.id = "0x" + RfxCom.dumpHex(data.slice(4, 5), false).join("");
                evt.command = [undefined, "Off", "1", "2", "3", "4", "5", "6", "Light", "Reverse"][evt.commandNumber];
                break;

            case 10:
                evt.id = "0x" + RfxCom.dumpHex(data.slice(2, 5), false).join("");
                evt.command = [undefined, "Low", "Medium", "High", "Timer 1", "Timer 2", "Timer 3", "Standby",
                                "Full", "Join", "Leave"][evt.commandNumber];
                break;

            case 11:
                evt.id = "0x" + RfxCom.dumpHex(data.slice(4, 5), false).join("");
                evt.command = [undefined, "Power", "+", "-", "Light", "Learn", "Reset Filter"][evt.commandNumber];
                break;

        }
        this.emit("fan", evt, packetType);
    };

/*
 *
 * Called by the data event handler when data arrives from blinds1 remote controllers
 * (packet type 0x19)
 *
 */
    blinds1Handler(data, packetType) {
        const
            commands = {
                0:  "Open",
                1:  "Close",
                2:  "Stop",
                3:  "Confirm",
                4:  "Set limit",
                5:  "Set lower limit",
                6:  "Reverse",
                7:  "Delete limits",
                8:  "Left",
                9:  "Right"
            };
        let evt = {
                subtype: data[0],
                seqnbr:  data[1],
                batteryLevel: data[7] & 0x0f,
                rssi:    (data[7] >> 4) & 0xf,
                commandNumber: data[6],
                command: commands[data[6]] || "Unknown"
            };
        if (evt.subtype === 0x00 || evt.subtype === 0x01 || evt.subtype === 0x0c ||
            evt.subtype === 0x0d || evt.subtype === 0x0f || evt.subtype === 0x10) {
            evt.id = "0x" + RfxCom.dumpHex(data.slice(3, 5), false).join("");
        } else if (evt.subtype === 0x06 || evt.subtype === 0x07) {
            evt.id = "0x" + RfxCom.dumpHex(data.slice(2, 5).concat(data[5] & 0xf0), false).join("").slice(0, -1);
        } else if (evt.subtype === 0x09) {
            evt.id = "0x" + RfxCom.dumpHex(data.slice(3, 5).concat(data[5] & 0xf0), false).join("").slice(0, -1);
        } else {
            evt.id = "0x" + RfxCom.dumpHex(data.slice(2, 5), false).join("");
        }
        if (evt.subtype === 0x04) {
            if (evt.commandNumber === 7) {
                evt.command = commands[6];
            } else if (evt.commandNumber === 6) {
                evt.command = commands[7];
            }
        }
        if (evt.subtype === 0x02 || evt.subtype === 0x04 || evt.subtype === 0x05 ||
            evt.subtype === 0x0a || evt.subtype === 0x0b || evt.subtype === 0x12) {
            evt.unitCode = 1;
        } else {
            evt.unitCode = data[5];
            if (evt.subtype === 0x06 || evt.subtype === 0x07 || evt.subtype === 0x09) {
                evt.unitCode = evt.unitCode & 0x0f;
            }
            if (evt.subtype === 0x03 || evt.subtype === 0x0e) {
                if (evt.unitCode === 16) {
                    evt.unitCode = 0;
                } else {
                    evt.unitCode = evt.unitCode + 1;
                }
            } else if (evt.subtype === 0x08) {
                evt.unitCode = evt.unitCode + 1;
            } else if (evt.subtype === 0x0c || evt.subtype === 0x0f) {
                if (evt.unitCode === 15) {
                    evt.unitCode = 0;
                } else {
                    evt.unitCode = evt.unitCode + 1;
                }
            }
        }
        this.emit("blinds1", evt, packetType);
    };

/*
 *
 *
 * Called by the data event handler when data arrives from Edisio devices
 * (packet type 0x1c)
 *
 */

    edisioHandler(data, packetType) {
        const
            commands = {
                0: "Off",
                1: "On",
                2: "Toggle",
                3: "Set level",
                4: "Bright",
                5: "Dim",
                6: "Toggle dim",
                7: "Stop dim",
                8: "RGB",
                9: "Learn",
                10: "Shutter Open",
                11: "Shutter Stop",
                12: "Shutter Close",
                13: "Contact Normal",
                14: "Contact Alert"
            },
            evt = {
                subtype: data[0],
                seqnbr: data[1],
                id: "0x" + RfxCom.dumpHex(data.slice(2, 6), false).join(""),
                unitCode: data[6],
                commandNumber: data[7],
                command: commands[data[7]] || "Unknown",
                level: data[8],
                colour: {R: data[9], G: data[10], B: data[11]},
                maxRepeat: data[12],
                repeatCount: data[13],
                batteryVoltage: data[14]/10,
                rssi: data[15] & 0xf
            };
        if (data.length > 16) {
            evt.extraBytes = data.slice(16);
        }
        this.emit("edisio", evt, packetType);
    };


/*
 *
 * Called by the data event handler when data arrives from FunkBus remote controllers
 * (packet type 0x1e)
 *
 */
    funkbusHandler(data, packetType) {
        const
            commands = {
                0: "Down",
                1: "Up",
                2: "All Off",
                3: "All On",
                4: "Scene",
                5: "Master Down",
                6: "Master Up"
            },
            evt = {
                subtype: data[0],
                seqnbr: data[1],
                id: "0x" + RfxCom.dumpHex(data.slice(2, 4), false).join(""),
                groupCode: String.fromCharCode(data[4]).toUpperCase(),
                commandNumber: data[6],
                command: commands[data[6]] || "Unknown",
                commandTime: data[7],
                deviceTypeNumber: data[8] & 0xf,
                rssi: (data[9] >> 4) & 0xf
            };
        if (evt.subtype === 0 && evt.commandNumber === 4) {
            evt.sceneNumber = data[5];
        } else {
            evt.channelNumber = data[5];
        }
        this.emit("funkbus", evt, packetType);
    };

/*
*
* Called by the data event handler when data arrives from Hunter Fan remote controllers
* (packet type 0x1f)
*
*/
    hunterfanHandler(data, packetType) {
        const
            commands = {
                1: "Off",
                2: "Light",
                3: "Speed 1",
                4: "Speed 2",
                5: "Speed 3",
                6: "Program"
            },
            evt = {
                subtype: data[0],
                seqnbr: data[1],
                id: "0x" + RfxCom.dumpHex(data.slice(2, 8), false).join(""),
                commandNumber: data[8],
                command: commands[data[8]] || "Unknown",
                rssi: (data[9] >> 4) & 0xf
            };
        this.emit("hunterfan", evt, packetType);
    };

/*
 *
 * Called by the data event handler when data arrives from various security
 * devices (packet type 0x20).
 *
 */
    security1Handler(data, packetType) {
        const
            subtype = data[0],
            seqnbr = data[1],
            deviceStatus = data[5] & ~0x80,
            evt = {
                subtype: subtype,
                seqnbr: seqnbr,
                deviceStatus: deviceStatus,
                batteryLevel: data[6] & 0x0f,
                rssi: (data[6] >> 4) & 0xf,
                tampered: data[5] & 0x80
            };
        switch (subtype) {
            case 0x00:
            case 0x01:
            case 0x02:
                evt.id = "0x" + RfxCom.dumpHex([data[2], data[4]], false).join("");
                break;

            case 0x03:
            case 0x09:
                evt.id = "0x" + RfxCom.dumpHex(data.slice(2, 4), false).join("");
                break;

            default:
                evt.id = "0x" + RfxCom.dumpHex(data.slice(2, 5), false).join("");
                break;
        }
        this.emit("security1", evt, packetType);
    };

    /*
     *
     * Called by the data event handler when data arrives from various security
     * cameras (packet type 0x28).
     *
     */
    camera1Handler(data, packetType) {
        const
            commands = [
                    "Left",
                    "Right",
                    "Up",
                    "Down",
                    "Position 1",
                    "Program Position 1",
                    "Position 2",
                    "Program Position 2",
                    "Position 3",
                    "Program Position 3",
                    "Position 4",
                    "Program Position 4",
                    "Center",
                    "Program Center Position",
                    "Sweep",
                    "Program Sweep"
                ],
            subtype = data[0],
            seqnbr = data[1],
            evt = {
                    subtype: subtype,
                    seqnbr: seqnbr,
                    houseCode: String.fromCharCode(data[2]).toUpperCase(),
                    commandNumber: data[3],
                    command: commands[data[3]] || "Unknown",
                    rssi: (data[5] >> 4) & 0xf
                };
        this.emit("camera1", evt, packetType);
    };

/*
 *
 * Called by the data event handler when data arrives from a universal remote controller (packet type 0x30).
 *
 */
    remoteHandler(data, packetType) {
        const
            subtype = data[0],
            seqnbr = data[1],
            id = "0x" + RfxCom.dumpHex(data.slice(2, 3), false).join(""),
            evt = {
                subtype: subtype,
                seqnbr: seqnbr,
                id: id,
                commandNumber: data[3],
                command: rfxcom.commands[subtype][data[3]] || "undefined",
                rssi: (data[4] >> 4) & 0xf
            };
        if (evt.subtype === 4) {
            const commandType = ["PC", "AUX1", "AUX2", "AUX3", "AUX4"];
            evt.commandType = commandType[(data[4] >> 1) & 0x7];
        }
        this.emit("remote", evt, packetType);
    };

/*
 *
 * Called by the data event handler when data arrives from a Digimax thermostat (packet type 0x40).
 *
 */
    thermostat1Handler(data, packetType) {
        const
            subtype = data[0],
            seqnbr = data[1],
            evt = {
                subtype: subtype,
                seqnbr: seqnbr,
                id: "0x" + RfxCom.dumpHex(data.slice(2, 4), false).join(""),
                temperature: data[4],
                setpoint: (subtype === 1) ? NaN : data[5],
                modeNumber: (data[6] >> 7 ) & 1,
                mode: defines.THERMOSTAT1_MODE[(data[6] >> 7 ) & 1],
                statusNumber: data[6] & 3,
                status: defines.THERMOSTAT1_STATUS[data[6] & 3],
                rssi: (data[7] >> 4) & 0xf
            };
        this.emit("thermostat1", evt, packetType);
    };

/*
 *
 * Called by the data event handler when data arrives from a Mertik/Maxitrol
 * thermostat remote controller (packet type 0x42).
 *
 */
    thermostat3Handler(data, packetType) {
        const
            commands = ["Off", "On", "Up", "Down", "Run Up", "Run Down", "Stop"],
            subtype = data[0],
            seqnbr = data[1],
            evt = {
                subtype: subtype,
                seqnbr: seqnbr,
                id: "0x" + RfxCom.dumpHex(data.slice(2, 5), false).join(""),
                command: commands[data[5]],
                commandNumber: data[5],
                rssi: (data[6] >> 4) & 0xf
            };
        if (evt.subtype === 1 && evt.commandNumber > 3) {
            evt.command = ["2nd Off", "2nd On"][evt.commandNumber - 4];
        }
        this.emit("thermostat3", evt, packetType);
    };

/*
 *
 * Called by the data event handler when data arrives from BBQ temperature
 * sensing devices (packet type 0x4e).
 *
 */
    bbqHandler(data, packetType) {
        const
            evt = {
                subtype: data[0],
                id: "0x" + RfxCom.dumpHex(data.slice(2, 4), false).join(""),
                seqnbr: data[1],
                temperature: [data[4]*256 + data[5], data[6]*256 + data[7]],
                batteryLevel: data[8] & 0x0f,
                rssi: (data[8] >> 4) & 0xf
            };
        this.emit("bbq1", evt, packetType);
    };

/*
 *
 * Called by the data event handler when data arrives from temperature
 * and rain sensing devices (packet type 0x4f).
 *
 */
    temprainHandler(data, packetType) {
        const
            signbit = data[4] & 0x80,
            temperature = ((data[4] & 0x7f) * 256 + data[5]) / 10 * (signbit ? -1 : 1),
            evt = {
                subtype: data[0],
                id: "0x" + RfxCom.dumpHex(data.slice(2, 4), false).join(""),
                seqnbr: data[1],
                temperature: temperature,
                rainfall: (data[6] * 256 + data[7]) / 10,
                batteryLevel: data[8] & 0x0f,
                rssi: (data[8] >> 4) & 0xf
            };
        this.emit("temperaturerain1", evt, packetType);
    };

/*
 *
 * Called by the data event handler when data arrives from temperature
 * sensing devices (packet type 0x50).
 *
 */
    tempHandler(data, packetType) {
        const
            signbit = data[4] & 0x80,
            temperature = ((data[4] & 0x7f) * 256 + data[5]) / 10 * (signbit ? -1 : 1),
            evt = {
                subtype: data[0],
                id: "0x" + RfxCom.dumpHex(data.slice(2, 4), false).join(""),
                seqnbr: data[1],
                temperature: temperature,
                batteryLevel: data[6] & 0x0f,
                rssi: (data[6] >> 4) & 0xf
            };
        this.emit("temperature1", evt, packetType);
    };

/*
 *
 * Called by the data event handler when data arrives from humidity sensing
 * devices (packet type 0x51).
 *
 */
    humidityHandler(data, packetType) {
        const
            evt = {
                subtype: data[0],
                id: "0x" + RfxCom.dumpHex(data.slice(2, 4), false).join(""),
                seqnbr: data[1],
                humidity: data[4],
                humidityStatus: data[5],
                batteryLevel: data[6] & 0x0f,
                rssi: (data[6] >> 4) & 0xf
            };
        this.emit("humidity1", evt, packetType);
    };

/*
 *
 * Called by the data event handler when data arrives from temperature & humidty sensing
 * devices (packet type 0x52).
 *
 */
    temphumidityHandler(data, packetType) {
        const
            signbit = data[4] & 0x80,
            temperature = ((data[4] & 0x7f) * 256 + data[5]) / 10 * (signbit ? -1 : 1),
            evt = {
                subtype: data[0],
                id: "0x" + RfxCom.dumpHex(data.slice(2, 4), false).join(""),
                seqnbr: data[1],
                temperature: temperature,
                humidity: data[6],
                humidityStatus: data[7],
                batteryLevel: data[8] & 0x0f,
                rssi: (data[8] >> 4) & 0xf
            };
        this.emit("temperaturehumidity1", evt, packetType);
    };

/*
 *
 * Called by the data event handler when data arrives from temperature, humidity and
 * barometric pressure sensing devices (packet type 0x54)
 *
 */
    temphumbaroHandler(data, packetType) {
        const
            signbit = data[4] & 0x80,
            temperature = ((data[4] & 0x7f)*256 + data[5])/10 * (signbit ? -1 : 1),
            evt = {
                subtype: data[0],
                id: "0x" + RfxCom.dumpHex(data.slice(2, 4), false).join(""),
                seqnbr: data[1],
                temperature: temperature,
                humidity: data[6],
                humidityStatus: data[7],
                barometer: ((data[8] & 0x7f)*256 + data[9]),
                forecast: data[10],
                batteryLevel: data[11] & 0x0f,
                rssi: (data[11] >> 4) & 0xf
            };
        this.emit("temphumbaro1", evt, packetType);
    };

/*
 *
 * Called by the data event handler when data arrives from rainfall sensing
 * devices (packet type 0x55).
 *
 */
    rainHandler(data, packetType) {
        let evt = {
            subtype: data[0],
            id: "0x" + RfxCom.dumpHex(data.slice(2, 4), false).join(""),
            seqnbr: data[1],
            batteryLevel: data[9] & 0x0f,
            rssi: (data[9] >> 4) & 0xf
        };
        if (data[0] === 6) {  //RAIN6
            evt.rainfallIncrement = (data[8] & 0x0f)*0.266;
        } else if (data[0] === 8) { //RAIN8
            let flipVolume = this.getDeviceParameter(packetType, evt.subtype, evt.id, "cartridgeVolume", 0.2);
            evt.rainfallIncrement = data[8]*flipVolume;
        } else if (data[0] === 9) { //RAIN9
            evt.rainfallIncrement = ((data[7])*256 + data[8])*0.3;
        } else {
            evt.rainfall = ((data[6]*256 + data[7])*256 + data[8])/10;
        }
        if (data[0] === 1) {
            evt.rainfallRate = data[4]*256 + data[5];
        } else if (data[0] === 2) {
            evt.rainfallRate = (data[4]*256 + data[5])/100;
        }
        this.emit("rain1", evt, packetType);
    };

/*
 *
 * Called by the data event handler when data arrives from wind speed & direction
 * sensors (packet type 0x56).
 *
 */
    windHandler(data, packetType) {
        let temperature, signbit, chillFactor, evt;
        evt = {
            subtype:      data[0],
            id:           "0x" + RfxCom.dumpHex(data.slice(2, 4), false).join(""),
            seqnbr:       data[1],
            gustSpeed:    (data[8]*256 + data[9])/10,
            batteryLevel: data[14] & 0x0f,
            rssi:         (data[14] >> 4) & 0xf
        };
        if (data[0] !== 8) {
            evt.direction = data[4]*256 + data[5];
        }
        if (data[0] !== 5) {
            evt.averageSpeed = (data[6]*256 + data[7])/10;
        }
        if (data[0] === 4 || data[0] === 8) {
            temperature = ((data[10] & 0x7f)*256 + data[11])/10;
            signbit = data[10] & 0x80;
            evt.temperature = temperature*(signbit ? -1 : 1);
            chillFactor = ((data[12] & 0x7f)*256 + data[13])/10;
            signbit = data[12] & 0x80;
            if (data[0] === 4) {
                evt.chillfactor = chillFactor*(signbit ? -1 : 1);
            }
        }
        this.emit("wind1", evt, packetType);
    };

    /*
     *
     * Called by the data event handler when data arrives from ultraviolet radiation
     * sensors (packet type 0x57).
     *
     */
    uvHandler(data, packetType) {
        const
            signbit = data[5] & 0x80,
            temperature = ((data[5] & 0x7f)*256 + data[6])/10 * (signbit ? -1 : 1),
            evt = {
                subtype: data[0],
                id: "0x" + RfxCom.dumpHex(data.slice(2, 4), false).join(""),
                seqnbr: data[1],
                temperature: temperature,
                uv: data[4]/10,
                batteryLevel: data[7] & 0x0f,
                rssi: (data[7] >> 4) & 0xf
            };
        this.emit("uv1", evt, packetType);
    };

    /*
 *
 * Called by the data event handler when data arrives from date & time transmitters (packet type 0x58).
 *
 */
    dateTimeHandler(data, packetType) {
        const
            evt = {
                subtype: data[0],
                id: "0x" + RfxCom.dumpHex(data.slice(2, 4), false).join(""),
                seqnbr: data[1],
                year: data[4],
                month: data[5],
                day: data[6],
                hour: data[8],
                minute: data[9],
                second: data[10],
                weekDay: data[7],
                batteryLevel: data[11] & 0x0f,
                rssi: (data[11] >> 4) & 0xf
            };
        evt.timestamp = new Date(evt.year, evt.month, evt.day, evt.hour, evt.minute, evt.second);
        this.emit("datetime", evt, packetType);
    };

    /*
         *
         * Called by the data event handler when data arrives from an OWL CM113 power measurement
         * device (packet type 0x59).
         *
         */
    elec1Handler(data, packetType) {
        const
            evt = {
                subtype: data[0],
                seqnbr: data[1],
                id: "0x" + RfxCom.dumpHex(data.slice(2, 4), false).join(""),
                count: data[4],
                current: [(data[5]*256 + data[6])/10, (data[7]*256 + data[8])/10, (data[9]*256 + data[10])/10],
                batteryLevel: data[11] & 0x0f,
                rssi: (data[11] >> 4) & 0xf
            };
        this.emit("elec1", evt, packetType);
    };

/*
 *
 * Called by the data event handler when data arrives from an OWL CM119, CM160 or CM180 power measurement
 * device (packet type 0x5a).
 *
 */
    elec23Handler(data, packetType) {
        let evt = {
            subtype: data[0],
            seqnbr: data[1],
            id: "0x" + RfxCom.dumpHex(data.slice(2, 4), false).join(""),
            count: data[4],
            power: RfxCom.bytesToUint32(data.slice(5, 9)),            // units watts
            batteryLevel: data[15] & 0x0f,
            rssi: (data[15] >> 4) & 0xf
        };
        if (evt.subtype === 0x01 || (evt.subtype === 0x02 && evt.count === 0)) {
            evt.energy = RfxCom.bytesToUint48(data.slice(9, 15))/223.666;  // units watt-hours
        }
        this.emit("elec23", evt, packetType);
    };

/*
 *
 * Called by the data event handler when data arrives from an OWL CM180i power measurement
 * device (packet type 0x5b).
 *
 */
    elec4Handler(data, packetType) {
        let evt = {
            subtype: data[0],
            seqnbr: data[1],
            id: "0x" + RfxCom.dumpHex(data.slice(2, 4), false).join(""),
            count: data[4],
            current: [(data[5]*256 + data[6])/10, (data[7]*256 + data[8])/10, (data[9]*256 + data[10])/10],
            batteryLevel: data[17] & 0x0f,
            rssi: (data[17] >> 4) & 0xf
        };
        if (evt.count === 0) {
            evt.energy = RfxCom.bytesToUint48(data.slice(11, 17))/223.666;  // units watt-hours
        }
        this.emit("elec4", evt, packetType);
    };

/*
 *
 * Called by the data event handler when data arrives from a REVOLT power measurement
 * device (packet type 0x5c).
 *
 */
    elec5Handler(data, packetType) {
        const
            evt = {
                subtype: data[0],
                seqnbr: data[1],
                id: "0x" + RfxCom.dumpHex(data.slice(2, 4), false).join(""),
                voltage: data[4],
                current: (data[5]*256 + data[6])/100,
                power:  (data[7]*256 + data[8])/10,
                energy:  (data[9]*256 + data[10])*10,  // units watt-hours
                powerFactor: data[11]/100,
                frequency: data[12],
                rssi: (data[13] >> 4) & 0xf
            };
        this.emit("elec5", evt, packetType);
    };

/*
 *
 * Called by the data event handler when data arrives from digital
 * scales (packet type 0x5d).
 *
 */
    weightHandler(data, packetType) {
        const
            id = "0x" + RfxCom.dumpHex(data.slice(2, 4), false).join(""),
            evt = {
                    subtype: data[0],
                    id: id,
                    seqnbr: data[1],
                    weight: (data[4] *256 + data[5]) / 10,
                    batteryLevel: data[6] & 0xf,
                    rssi: (data[6] >> 4) & 0x0f
                };
        this.emit("weight1", evt, packetType);
    };

/*
 *
 * Called by the data event handler when data arrives from Cartelectronic smart-meter
 * interface transmitters (packet type 0x60).
 *
 */
    cartelectronicHandler(data, packetType) {
        const
            contractName = ["non défini", "Base", "Double tarif", "EJP", "Tempo"],
            periodName = ["non défini", "Toutes heures", "Heures creuses", "Heures pleines", "Heures normales",
                          "Heures pointes mobiles", "Heures creuses bleues", "Heures creuses blanches",
                          "Heures creuses rouges", "Heures pleines bleues", "Heures pleines blanches",
                          "Heures pleines rouges"],
            tariffColour = ["pas de prévis", "Bleu", "Blanc", "Rouge"],
            subtype = data[0],
            seqnbr = data[1],
            evt = {
                subtype: subtype,
                seqnbr:  seqnbr
            };
        if (subtype === 0x01) {
            let contractType = (data[7] & 0xf0) >> 4;
            let periodType = data[7] & 0x0f;
            evt.id ="0x" + RfxCom.dumpHex(data.slice(2, 7), false).join("");
            evt.identifiantCompteur =
                RfxCom.zeroPad(((((data[2]*256 + data[3])*256 + data[4])*256) + data[5])*256 +data[6], 12);
            evt.typeContrat = contractName[contractType] || "non défini";
            evt.périodeTarifaireEnCours = periodName[periodType] || "non défini";
            evt.compteur = [{valeur: RfxCom.bytesToUint32(data.slice(8, 12)), unité: "Wh"},
                            {valeur: RfxCom.bytesToUint32(data.slice(12, 16)), unité: "Wh"}];
            switch (contractType) {
                case 1: // Base
                    evt.compteur[0].période = "Toutes heures";
                    evt.compteur[1].période = "non utilisé";
                    break;

                case 2: // Double tariff
                    evt.compteur[0].période = "Heures creuses";
                    evt.compteur[1].période = "Heures pleines";
                    break;

                case 3: // EJP
                    evt.compteur[0].période = "Période mobile";
                    evt.compteur[1].période = "Heures normales";
                    evt.avertissemntJourEJP = Boolean((data[18] & 0x18) === 0x18);
                    break;

                case 4: // Tempo
                    let colour = ["bleues", "blanches", "rouges"][(periodType - 6) % 3];
                    evt.compteur[0].période = "Heures creuses " + colour;
                    evt.compteur[1].période = "Heures pleines " + colour;
                    evt.avertissementCouleurDemain = tariffColour[(data[18] >> 3) & 3];
                    break;

                default:
                    evt.compteur[0].période = "non défini";
                    evt.compteur[1].période = "non défini";
            }
            evt.puissanceApparenteValide = Boolean((data[18] >> 1) & 1);
            evt.puissanceApparente = evt.puissanceApparenteValide ? data[16]*256 + data[17] : NaN;
            evt.teleInfoPrésente = !Boolean((data[18] >> 2) & 1);
            evt.batteryLevel = data[19] & 0x0f;
            evt.rssi = (data[19] >> 4) & 0xf;
        } else if (subtype === 0x02) {
            evt.id = "0x" + RfxCom.dumpHex(data.slice(2, 6), false).join("");
            evt.compteur = [{valeur: RfxCom.bytesToUint32(data.slice(6, 10)), unité: "impulsions"},
                            {valeur: RfxCom.bytesToUint32(data.slice(10, 14)), unité: "impulsions"}];
            evt.batteryLevel = data[15] & 0x0f;
            evt.rssi = (data[15] >> 4) & 0xf;
        } else if (subtype === 0x03) { // CARTELECTRONIC_LINKY
            evt.id = "0x" + RfxCom.dumpHex(data.slice(2, 6), false).join("");
            let id = (((data[2]*256 + data[3])*256 + data[4])*256) + data[5];
            evt.identifiantCompteur =
                RfxCom.zeroPad((id >> 28) & 0x0f, 2) + // Constructor code
                RfxCom.zeroPad((id >> 23) & 0x1f, 2) +// Year of manufacture
                RfxCom.zeroPad([61, 62, 64, 67, 70, 75, 0, 0][(id >> 20) & 0x07], 2) + // Meter type code
                RfxCom.zeroPad(id & 0xfffff, 6);  // Serial number
            // noinspection JSBitwiseOperatorUsage
            evt.compteur = [{valeur: RfxCom.bytesToUint32(data.slice(6, 10)), unité: "Wh",
                             contenu: "Consommation"},
                            {valeur: RfxCom.bytesToUint32(data.slice(10, 14)), unité: "Wh",
                             contenu: (data[18] & 0x02) ? "Production" : "non utilisé"}];
            evt.tensionMoyenne = 200 + data[15];
            evt.puissanceApparenteValide = true;
            evt.puissanceApparente = 256*data[16] + data[17];
            evt.teleInfoPrésente = Boolean(data[18] & 0x04);
            evt.indexTariffaireEnCours = data[14] & 0x0f;
            evt.avertissementCouleurAujourdHui = tariffColour[(data[18] & 0x18) >> 3];
            evt.avertissementCouleurDemain = tariffColour[(data[18] & 0x60) >> 5];
            evt.batteryLevel = data[19] & 0x0f;
            evt.rssi = (data[19] >> 4) & 0xf;
        } else {
            evt.unknownSubtype = true;
        }
        this.emit("cartelectronic", evt, packetType);
    };

/*
 * Called by the data event handler when data arrives from rfxsensor
 * devices (packet type 0x70).
 *
 */
    rfxsensorHandler(data, packetType) {
        const
            subtype = data[0],
            seqnbr = data[1],
            id = "0x" + RfxCom.dumpHex([data[2]], false).join(""),
            evt = {
                subtype: subtype,
                id: id,
                seqnbr: seqnbr,
                rssi: (data[5] >> 4) & 0xf
            };
        switch(evt.subtype) {
            case rfxcom.rfxsensor.TEMP:
                const signbit = data[3] & 0x80;
                evt.message = (((data[3] & 0x7f) * 256 + data[4]) / 100) * (signbit ? -1 : 1);
                break;
            case rfxcom.rfxsensor.VOLTAGE:
            case rfxcom.rfxsensor.AD:
                evt.message = data[3] * 256 + data[4];
                break
        }
        this.emit("rfxsensor", evt, packetType);
    };

/*
 *
 * Called by the data event handler when data arrives from rfxmeter
 * devices (packet type 0x71).
 *
 */
    rfxmeterHandler(data, packetType) {
        const
            id = "0x" + RfxCom.dumpHex(data.slice(2, 4), false).join(""),
            counter = RfxCom.dumpHex(data.slice(4, 8), false).join(""),
            evt = {
                subtype: data[0],
                id: id,
                seqnbr: data[1],
                rssi: (data[8] >> 4) & 0xf,
                counter: parseInt(counter, 16)
            };
        this.emit("rfxmeter", evt, packetType);
    };

/*
 *
 * Called by the data event handler when data arrives from weather stations (packet type 0x76).
 *
 */
    weatherHandler(data, packetType) {
        let evt = {
            subtype: data[0],
            seqnbr: data[1],
            id: "0x" + RfxCom.dumpHex(data.slice(2, 4), false).join(""),
            batteryLevel: data[29] & 0x0f,
            rssi: (data[29] >> 4) & 0x0f
        };
        let temperature = ((data[10] & 0x7f)*256 + data[11])/10,
            signbit = data[10] & 0x80;
        evt.temperature = temperature*(signbit ? -1 : 1);
        evt.averageSpeed = (data[6]*256 + data[7])/10;
        evt.gustSpeed = (data[8]*256 + data[9])/10;
        if (evt.subtype === 1) {
            evt.rainfallIncrement = (((data[18])*256 + data[19])*256 + data[20])*0.3;
        } else if (evt.subtype === 2) {
            evt.rainfallIncrement = (((data[18])*256 + data[19])*256 + data[20])*0.254;
            evt.direction = data[4]*256 + data[5];
            evt.averageSpeed = (data[6]*256 + data[7])/10;
            evt.humidity = data[14];
            evt.humidityStatus = data[15];
            evt.uv = data[21]/10;
            evt.insolation = data[22]*256 + data[23];
        }
        this.emit("weather", evt, packetType);
    };

/*
 *
 * Called by the data event handler when data arrives from solar sensors (packet type 0x77).
 *
 */
    solarHandler(data, packetType) {
        let evt = {
            subtype: data[0],
            seqnbr: data[1],
            id: "0x" + RfxCom.dumpHex(data.slice(2, 4), false).join(""),
            insolation: (data[4]*256 + data[5])/100,
            batteryLevel: data[8] & 0x0f,
            rssi: (data[8] >> 4) & 0x0f
        };
        this.emit("solar", evt, packetType);
    };

// Static methods

    static dumpHex(buffer, prefix) {
        prefix = prefix || "";

        function dec2hex(value) {
            const hexDigits = "0123456789ABCDEF";
            return prefix + (hexDigits[value >> 4] + hexDigits[value & 15]);
        }
        return buffer.map(dec2hex);
    };

/*
 *
 * Converts an array of 4 bytes to a 32bit integer.
 *
 */
    static bytesToUint32(bytes) {
        return (bytes[3] + 256*(bytes[2] + 256*(bytes[1] + 256*bytes[0])));
    };

/*
 *
 * Converts an array of 6 bytes to a 48bit integer.
 *
 */
    static bytesToUint48(bytes) {
        return (bytes[5] + 256*(bytes[4] + 256*(bytes[3] + 256*(bytes[2] + 256*(bytes[1] + 256*bytes[0])))));
    };

/*
 *
 * Converts a hexadecimal string to an array of bytes and the equivalent value.
 * The returned array is always byteCount long, padded with leading zeros if required
 *
 * e.g. stringToBytes("202020", 4) == {bytes: [0, 32, 32, 32], value: 2105376}
 *
 */
    static stringToBytes(str, byteCount) {
        if (byteCount > 6) {
            throw new Error("byteCount value outside representable range (6)");
        }
        let value = Number.parseInt(str, 16),
            residual = value,
            result = [];
        while (residual > 0) {
            result.push(residual % 256);
            residual = Math.floor(residual / 256);
        }
        if (byteCount !== undefined) {
            while (result.length < byteCount) {
                result.push(0);
            }
        }
        return { bytes: result.reverse(), value: value };
    };

/*
 * Prints value (>= 0) to a string of at least width characters, zero-padded.
 */
    static zeroPad(value, fieldWidth, base) {
        if (base === undefined){
            base = 10;
        }
        let result = value.toString(base);
        const stringLength = result.length;
        if (stringLength < fieldWidth) {
            for (let i = 0; i < fieldWidth - stringLength; i++) {
                result = "0" + result;
            }
        }
        return result;
    };

    /*
     * List the RFXCOM devices found by the SerialPort pckage. Arguments to the callback are (err, portlist), identical
     * to the Serialport.list() method: err is an Error object (or null) and portlist is a possibly empty Array of Strings
     *
     */

    static list(callback) {
        if (callback && typeof callback === "function") {
            SerialPort.list().then((ports) => {
                const rfxcomPorts = ports.filter(port => {return /RFXCOM/i.test(port.manufacturer)});
                callback(null, rfxcomPorts);
            }).catch((err) => {
                callback(err, []);
            });
        }
    };

}

module.exports = RfxCom;
