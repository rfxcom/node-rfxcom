const SerialPort = require("serialport"),
    rfxcom = require("./index"),
    EventEmitter = require("events"),
    queue = require("queue");

class RfxCom extends EventEmitter {
    constructor(device, options) {
        super();
        const self = this;

        self.options = options || {};
        self.handlers = {
            0x01: "statusMessageHandler",
            0x02: "transmitCommandResponseHandler",
            0x10: "lighting1Handler",
            0x11: "lighting2Handler",
            0x13: "lighting4Handler",
            0x14: "lighting5Handler",
            0x15: "lighting6Handler",
            0x16: "chimeHandler",
            0x19: "blinds1Handler",
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
            0x71: "rfxmeterHandler"
        };

        // Running counter for command message sequence numbers.
        self._seqnbr = 0;

        // The transmit message queue
        self.TxQ = queue({concurrency: self.options.concurrency || 3,
            timeout: self.options.timeout || 10000});
        self.TxQ.on("timeout", function (next, transmission) {
            if (transmission.sender._timeoutHandler.call(transmission.sender, transmission.buffer, transmission.seqnbr) === false) {
                self.debugLog("Error   : Command message " + RfxCom.dumpHex([transmission.seqnbr]) +
                    ", timed out waiting for response");
                self.emit("response", "Timed out waiting for response", transmission.seqnbr, rfxcom.responseCode.TIMEOUT);
            }
            next();
        });
        // Holds the command acknowledgement callbacks for the transmit queue
        self.acknowledge = new Array(256);
        for (let idx = 0; idx < self.acknowledge.length; idx++) {
            self.acknowledge[idx] = null;
        }

        // Allow for faking out the SerialPort
        if (typeof self.options.port !== "undefined") {
            self.serialport = options.port;
        }

        // Store the device to use
        self.device = device;

        // This is a buffering parser which accumulates message bytes until it receives the number of bytes specified by the
        // first byte of the message + 1. It relies on a flushed buffer, to ensure it starts with the length byte of the
        // first message. The 'data' message emitted contains all the message bytes. Messages may be split across multiple
        // buffers, or a single buffer may contain multiple messages. If a length byte is outside the valid range (4..36)
        // it is assumed synchronisation has been lost and all received data is discarded. The parser attempts to resynchronise
        // at the start of the next buffer.
        self.rfxtrxParser = function() {
            let data = [],
                requiredBytes = 0;
            return function(emitter, buffer) {
                if (self.receiving) {
                    data.push.apply(data, buffer);
                    while (data.length >= requiredBytes) {
                        if (requiredBytes > 0) {
                            emitter.emit("data", data.slice(0, requiredBytes));
                            data = data.slice(requiredBytes);
                        }
                        if (data.length > 0 && data[0] >= 4 && data[0] <= 36) {
                            requiredBytes = data[0] + 1;
                        } else {
                            requiredBytes = 0;
                            data = [];
                            break;
                        }
                    }
                }
            };
        };

        self.readyCallback = null;
        self.on("ready", function () {
                self.resetRFX(function (err) {
                        if (err) {
                            self.close();
                            self.emit("disconnect", err);
                        } else {
                            setTimeout(function () {
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
                                }, 500);
                        }
                    });
            });

        // This is how long a caller must wait between initialisation attempts
        // It is long enough for the 'ready' event to have been emitted if the
        // previous call to initialise() succeeded
        self.initialiseWaitTime = 6000;
        // Initial state
        self.connected = false;
        self.initialising = false;
        self.receiving = false;
        self.startReceiverRequired = true;
        self.transmitters = {};
    };

    debugLog(message) {
        if (this.options.debug) {
            console.log("[rfxcom] on " + this.device + " - " + message);
        }
    };

    nextMessageSequenceNumber() {
    // Fetches a "command message sequence number" for identifying requests sent to
    // the device.
        if (this._seqnbr > 255) {
            this._seqnbr = 0;
        }
        return this._seqnbr++;
    };

    initialise(callback) {
        if (this.initialising === false) {
            this.initialising = true;
            this.readyCallback = callback || null;
            this.open();
        }
    };

    open() {
        const self = this;
        // If we weren't supplied a serialport in the constructor, create one
        if (typeof self.serialport === "undefined") {
            // Delay opening the serialport until after the event handlers are installed
            self.serialport = new SerialPort(self.device, {
                baudrate: 38400,
                parser: self.rfxtrxParser(),
                autoOpen: false
            });
        }
        // If the RFXTRX has just been connected, we must wait for at least 5s before any
        // attempt to communicate with it, or it will enter the flash bootloader.
        // We can't know how long it has been connected, so we must always wait!
        self.serialport.on("open", function () {
            self.connected = true;
            self.emit("connecting");
            setTimeout(function () { self.emit("ready") }, self.initialiseWaitTime - 500);
        });

        // Add serialport data event listener
        self.serialport.on("data", function(data) {
                const
                    length = data[0] + 1,
                    packetType = data[1],
                    handler = self.handlers[packetType];
                self.debugLog("Received: " + RfxCom.dumpHex(data));
                self.emit("receive", data);

                // Avoid calling a handler with the wrong length packet
                if (data.length !== length) {
                    self.debugLog("Wrong packet length: " + data.length + " bytes, should be " + length)
                } else {
                    if (typeof handler !== "undefined") {
                        try {
                            self[handler](data.slice(2));
                        } catch (e) {
                            if (e instanceof Error) {
                                self.debugLog("Packet type " + RfxCom.dumpHex([packetType]) + " handler threw exception " + e.name + ": " + e.message);
                            }
                        }
                    } else {
                        self.debugLog("Unhandled packet type = " + RfxCom.dumpHex([packetType]));
                    }
                }
            });

        const disconnectHandler = function(msg) {
            // Either the serial port has gone away so the device no longer exists (ENXIO), or it went
            // away while the event handlers were being installed (Cannot open). In either case
            // destroy the existing serialport and emit our disconnect event so a host application can
            // attempt to reconnect (when the RFXtrx433 is plugged in again)
            self.debugLog(msg);
            const wasConnected = self.connected;
            self.close();
            if (wasConnected) {
                self.emit("disconnect", msg);
            } else {
                self.emit("connectfailed", msg);
            }
        };

        self.serialport.on("error", disconnectHandler);
        // On some platforms (Mac OS X 10.9), we get an error event when the port is disconnected

        self.serialport.on("disconnect", disconnectHandler);
        // On other plaftforms (Debian) we get a serialport disconnect event

        self.serialport.on("end", function() {
            self.debugLog("Received 'end'");
            self.emit("end");
        });

        self.serialport.on("drain", function() {
            self.debugLog("Received 'drain'");
        });

        // Now everything is set up, open the serialport
        if (typeof self.serialport.open === "function") {
            self.serialport.open();
        }
    };

    close() {
        // Cancel all messages in the queue
        this.TxQ.end();
        this.debugLog("Cleared command message queue");
        if (this.serialport && this.serialport.fd && typeof this.serialport.close === "function") {
            this.serialport.close();
        }
        this.serialport = undefined;
        this.connected = false;
        this.initialising = false;
        this.receiving = false;
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
            self.serialport.write(buffer, function (err, response) {
                self.debugLog("Sent    : " + RfxCom.dumpHex(buffer));
                if (callback && typeof callback === "function") {
                    return callback(err, response, seqnbr);
                }
            });
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
     * Enables reception of different protocols.
     */
    enableRFXProtocols(protocols, callback) {
        const self = this;
        let msg = [0x53, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];

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

        const
            seqnbr = this.nextMessageSequenceNumber(),
            buffer = [0x0D, 0x00, 0x00, seqnbr, 0x03].concat(msg);
        return self.queueMessage(self, buffer, seqnbr, callback);
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
                0x55: "868.00MHz",
                0x56: "868.00MHz FSK",
                0x57: "868.30MHz",
                0x58: "868.30MHz FSK",
                0x59: "868.35MHz",
                0x5A: "868.35MHz FSK",
                0x5B: "868.95MHz"
            },
            firmwareTypes = ["Type 1 RO", "Type 1", "Type 2", "Ext", "Ext 2"],
            subtype = data[0],
            seqnbr = data[1],
            cmnd = data[2];
        let transmitterPower = 10, msg, receiverType, hardwareVersion, firmwareVersion, firmwareType, protocols, copyrightText;

        if (subtype === 0xFF) {         // Message not understood!
            if (self.acknowledge[seqnbr] !== undefined && typeof self.acknowledge[seqnbr] === "function") {
                self.acknowledge[seqnbr]();
                self.acknowledge[seqnbr] = null;
            }
            // Handle early firmware versions that don't understand command 0x07 - "start receiver"
            // TODO - should be unnecessary now
            if (self.initialising) {
                self.initialising = false;
                self.TxQ.start();
                self.debugLog("Started command message queue");
            } else {
                self.debugLog("Response: Command message " + RfxCom.dumpHex([seqnbr]) +
                    ", command unknown or not supported by this device");
                self.emit("response", "Command unknown or not supported by this device", seqnbr, rfxcom.responseCode.UNKNOWN_COMMAND);
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
                unitCode: data[7]
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
            receiverType = receiverTypes[msg[1]];
            hardwareVersion = msg[7] + "." + msg[8];
            // Check which protocols are enabled
            protocols = [];
            for (let key in rfxcom.protocols) {
                if (rfxcom.protocols.hasOwnProperty(key)) {
                    const value = rfxcom.protocols[key];
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
                receiverType:     receiverType,
                hardwareVersion:  hardwareVersion,
                firmwareVersion:  firmwareVersion,
                firmwareType:     firmwareTypes[firmwareType],
                enabledProtocols: protocols
            };
            if (firmwareType !== 0) {
                evt.transmitterPower = transmitterPower;
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
    lighting1Handler(data) {
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

        this.emit("lighting1", evt);
    };

/*
 *
 * Called by the data event handler when data arrives from a HomeEasy
 * light control device (packet type 0x11).
 *
 */
    lighting2Handler(data) {
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

        this.emit("lighting2", evt);
    };

/*
 *
 * Called by the data event handler when data arrives from a device using the PT2262 chip (paket type 0x13)
 * This always has a commandNumber of 0, corresponding to the sole supported command 'Data'
 * The actual data encoded by the chip is returned as a hex string in 'data'
 *
 */
    lighting4Handler(data) {
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
        this.emit("lighting4", evt);
    };

/*
 *
 * Called by the data event handler when data arrives from a LightwaveRF/Siemens
 * light control device (packet type 0x14).
 *
 */
    lighting5Handler(data) {
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
        }
        this.emit("lighting5", evt);
    };

/*
 *
 * Called by the data event handler when data arrives from a Blyss
 * light control device (packet type 0x15)
 *
 */
    lighting6Handler(data) {
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
        this.emit("lighting6", evt);
    };

/*
 *
 * Called by the data event handler when data arrives from various doorbell pushbuttons
 * (packet type 0x16)
 *
 */
    chimeHandler(data) {
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
            evt.command = commands[data[4]];
        } else if (evt.subtype === 1) {
            evt.id = (data[2] & 0x40 ? "0" : "1") + (data[2] & 0x10 ? "0" : "1") +
                (data[2] & 0x04 ? "0" : "1") + (data[2] & 0x01 ? "0" : "1") +
                (data[3] & 0x40 ? "0" : "1") + (data[3] & 0x10 ? "0" : "1");
        } else {
            evt.id = "0x" + RfxCom.dumpHex(data.slice(2, 5), false).join("");
        }
        this.emit("chime1", evt);
    };

/*
 *
 * Called by the data event handler when data arrives from blinds1 remote controllers
 * (packet type 0x19)
 *
 */
    blinds1Handler(data) {
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
                rssi:    (data[7] >> 4) & 0xf,
                commandNumber: data[6],
                command: commands[data[6]] || "Unknown"
            },
            startpos = 2;
        if (evt.subtype === 0x04) {
            if (evt.commandNumber === 7) {
                evt.command = commands[6];
            } else if (evt.commandNumber === 6) {
                evt.command = commands[7];
            }
        }
        if (evt.subtype === 0x00 || evt.subtype === 0x01) {
            startpos = 3;
            evt.unitCode = data[5];
        } else if (evt.subtype === 0x03) {
            if (data[5] === 15) {
                evt.unitCode = 0;
            } else {
                evt.unitCode = data[5] + 1;
            }
        } else {
            evt.unitCode = 1;
        }
        evt.id = "0x" + RfxCom.dumpHex(data.slice(startpos, 5), false).join("");
        this.emit("blinds1", evt);
    };

/*
 *
 * Called by the data event handler when data arrives from various security
 * devices (packet type 0x20).
 *
 */
    security1Handler(data) {
        const
            subtype = data[0],
            seqnbr = data[1],
            id = "0x" + RfxCom.dumpHex(data.slice(2, 5), false).join(""),
            deviceStatus = data[5] & ~0x80,
            batterySignalLevel = data[6],
            evt = {
                subtype: subtype,
                seqnbr: seqnbr,
                id: id,
                deviceStatus: deviceStatus,
                batteryLevel: batterySignalLevel & 0x0f,
                rssi: (batterySignalLevel >> 4) & 0xf,
                tampered: data[5] & 0x80
            };
        this.emit("security1", evt);
    };

    /*
     *
     * Called by the data event handler when data arrives from various security
     * cameras (packet type 0x28).
     *
     */
    camera1Handler(data) {
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
        this.emit("camera1", evt);
    };

/*
 *
 * Called by the data event handler when data arrives from a universal remote controller (packet type 0x30).
 *
 */
    remoteHandler(data) {
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
        this.emit("remote", evt);
    };

/*
 *
 * Called by the data event handler when data arrives from a Digimax thermostat (packet type 0x40).
 *
 */
    thermostat1Handler(data) {
        const
            mode = ["Heating", "Cooling"],
            status = ["N/A", "Demand", "No Demand", "Initializing"],
            subtype = data[0],
            seqnbr = data[1],
            evt = {
                subtype: subtype,
                seqnbr: seqnbr,
                id: "0x" + RfxCom.dumpHex(data.slice(2, 4), false).join(""),
                temperature: data[4],
                setpoint: (subtype === 1) ? NaN : data[5],
                mode: mode[(data[6] >> 7 ) & 1],
                status: status[data[6] & 3],
                rssi: (data[7] >> 4) & 0xf
            };
        this.emit("thermostat1", evt);
    };

/*
 *
 * Called by the data event handler when data arrives from a Mertik/Maxitrol
 * thermostat remote controller (packet type 0x42).
 *
 */
    thermostat3Handler(data) {
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
        this.emit("thermostat3", evt);
    };

/*
 *
 * Called by the data event handler when data arrives from BBQ temperature
 * sensing devices (packet type 0x4e).
 *
 */
    bbqHandler(data) {
        const
            evt = {
                subtype: data[0],
                id: "0x" + RfxCom.dumpHex(data.slice(2, 4), false).join(""),
                seqnbr: data[1],
                temperature: [data[4]*256 + data[5], data[6]*256 + data[7]],
                batteryLevel: data[8] & 0x0f,
                rssi: (data[8] >> 4) & 0xf
            };
        this.emit("bbq1", evt);
    };

/*
 *
 * Called by the data event handler when data arrives from temperature
 * and rain sensing devices (packet type 0x4f).
 *
 */
    temprainHandler(data) {
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
        this.emit("temperaturerain1", evt);
    };

/*
 *
 * Called by the data event handler when data arrives from temperature
 * sensing devices (packet type 0x50).
 *
 */
    tempHandler(data) {
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
        this.emit("temperature1", evt);
    };

/*
 *
 * Called by the data event handler when data arrives from humidity sensing
 * devices (packet type 0x51).
 *
 */
    humidityHandler(data) {
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
        this.emit("humidity1", evt);
    };

/*
 *
 * Called by the data event handler when data arrives from temperature & humidty sensing
 * devices (packet type 0x52).
 *
 */
    temphumidityHandler(data) {
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
        this.emit("temperaturehumidity1", evt);
    };

/*
 *
 * Called by the data event handler when data arrives from temperature, humidity and
 * barometric pressure sensing devices (packet type 0x54)
 *
 */
    temphumbaroHandler(data) {
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
        this.emit("temphumbaro1", evt);
    };

    /*
     *
     * Called by the data event handler when data arrives from rainfall sensing
     * devices (packet type 0x55).
     *
     */
    rainHandler(data) {
        let evt = {
            subtype: data[0],
            id: "0x" + RfxCom.dumpHex(data.slice(2, 4), false).join(""),
            seqnbr: data[1],
            batteryLevel: data[9] & 0x0f,
            rssi: (data[9] >> 4) & 0xf
        };
        if (data[0] === 6) {
            evt.rainfallIncrement = (data[8] & 0x0f)*0.266;
        } else {
            evt.rainfall = ((data[6]*256 + data[7])*256 + data[8])/10;
        }
        if (data[0] === 1) {
            evt.rainfallRate = data[4]*256 + data[5];
        } else if (data[0] === 2) {
            evt.rainfallRate = (data[4]*256 + data[5])/100;
        }
        this.emit("rain1", evt);
    };

/*
 *
 * Called by the data event handler when data arrives from wind speed & direction
 * sensors (packet type 0x56).
 *
 */
    windHandler(data) {
        let temperature, signbit, chillFactor, evt;
        evt = {
            subtype:      data[0],
            id:           "0x" + RfxCom.dumpHex(data.slice(2, 4), false).join(""),
            seqnbr:       data[1],
            direction:    data[4]*256 + data[5],
            gustSpeed:    (data[8]*256 + data[9])/10,
            batteryLevel: data[14] & 0x0f,
            rssi:         (data[14] >> 4) & 0xf
        };
        if (data[0] !== 5) {
            evt.averageSpeed = (data[6]*256 + data[7])/10;
        }
        if (data[0] === 4) {
            temperature = ((data[10] & 0x7f)*256 + data[11])/10;
            signbit = data[10] & 0x80;
            evt.temperature = temperature*(signbit ? -1 : 1);
            chillFactor = ((data[12] & 0x7f)*256 + data[13])/10;
            signbit = data[12] & 0x80;
            evt.chillfactor = chillFactor*(signbit ? -1 : 1);
        }
        this.emit("wind1", evt);
    };

    /*
     *
     * Called by the data event handler when data arrives from ultraviolet radiation
     * sensors (packet type 0x57).
     *
     */
    uvHandler(data) {
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
        this.emit("uv1", evt);
    };

    /*
 *
 * Called by the data event handler when data arrives from date & time transmitters (packet type 0x58).
 *
 */
    dateTimeHandler(data) {
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
        this.emit("datetime", evt);
    };

    /*
         *
         * Called by the data event handler when data arrives from an OWL CM113 power measurement
         * device (packet type 0x59).
         *
         */
    elec1Handler(data) {
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
        this.emit("elec1", evt);
    };

/*
 *
 * Called by the data event handler when data arrives from an OWL CM119, CM160 or CM180 power measurement
 * device (packet type 0x5a).
 *
 */
    elec23Handler(data) {
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
        this.emit("elec23", evt);
    };

/*
 *
 * Called by the data event handler when data arrives from an OWL CM180i power measurement
 * device (packet type 0x5b).
 *
 */
    elec4Handler(data) {
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
        this.emit("elec4", evt);
    };

/*
 *
 * Called by the data event handler when data arrives from a REVOLT power measurement
 * device (packet type 0x5c).
 *
 */
    elec5Handler(data) {
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
        this.emit("elec5", evt);
    };

/*
 *
 * Called by the data event handler when data arrives from digital
 * scales (packet type 0x5d).
 *
 */
    weightHandler(data) {
        const
            id = "0x" + RfxCom.dumpHex(data.slice(2, 4), false).join(""),
            batterySignalLevel = data[6],
            evt = {
                    subtype: data[0],
                    id: id,
                    seqnbr: data[1],
                    weight: (data[4] *256 + data[5]) / 10,
                    rssi: batterySignalLevel & 0x0f,
                    batteryLevel: (batterySignalLevel >> 4) & 0xf
                };
        this.emit("weight1", evt);
    };

/*
 *
 * Called by the data event handler when data arrives from Cartelectronic smart-meter
 * interface transmitters (packet type 0x60).
 *
 */
    cartelectronicHandler(data) {
        const
            subtype = data[0],
            seqnbr = data[1],
            evt = {
                subtype: subtype,
                seqnbr:  seqnbr
            };
        if (subtype === 0x01) {
            evt.id ="0x" + RfxCom.dumpHex(data.slice(2, 7), false).join("");
            evt.contractType = data[7];
            evt.counter = [RfxCom.bytesToUint32(data.slice(8, 12)), RfxCom.bytesToUint32(data.slice(12, 16))];
            evt.PAPP = data[16]*256 + data[17];
            evt.validPAPP = Boolean((data[18] >> 1) & 1);
            evt.validTIC = !Boolean((data[18] >> 2) & 1);
            evt.PEJP = ["No change", "White", "Blue", "Red"][(data[18] >> 3) & 3];
            evt.batteryLevel = data[19] & 0x0f;
            evt.rssi = (data[19] >> 4) & 0xf;
        } else if (subtype === 0x02) {
            evt.id ="0x" + RfxCom.dumpHex(data.slice(2, 6), false).join("");
            evt.counter = [RfxCom.bytesToUint32(data.slice(6, 10)), RfxCom.bytesToUint32(data.slice(10, 14))];
            evt.batteryLevel = data[15] & 0x0f;
            evt.rssi = (data[15] >> 4) & 0xf;
        } else {
            evt.unknownSubtype = true;
        }
        this.emit("cartelectronic", evt);
    };

/*
 * Called by the data event handler when data arrives from rfxsensor
 * devices (packet type 0x70).
 *
 */
    rfxsensorHandler(data) {
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
        this.emit("rfxsensor", evt);
    };

/*
 *
 * Called by the data event handler when data arrives from rfxmeter
 * devices (packet type 0x71).
 *
 */
    rfxmeterHandler(data) {
        const
            id = "0x" + RfxCom.dumpHex(data.slice(2, 4), false).join(""),
            counter = RfxCom.dumpHex(data.slice(4, 8), false).join(""),
            evt = {
                subtype: data[0],
                id: id,
                seqnbr: data[1],
                counter: parseInt(counter, 16)
            };
        this.emit("rfxmeter", evt);
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
        let value = parseInt(str, 16),
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
     * List the RFXCOM devices found by the SerialPort pckage. Arguments to the callback are (err, portlist), identical
     * to the Serialport.list() method: err is an Error object (or null) and portlist is a possibly empty Array of Strings
     *
     */

    static list(callback) {
        if (callback && typeof callback === "function") {
            SerialPort.list(function (err, ports) {
                if (err) {
                    callback(err, []);
                } else {
                    const rfxcomPorts = ports.filter(port => {return /rfxcom/i.test(port.manufacturer)});
                    callback(null, rfxcomPorts);
                }
            })
        }
    };

}

module.exports = RfxCom;
