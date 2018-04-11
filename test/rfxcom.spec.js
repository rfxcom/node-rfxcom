/* global require: false, describe: false, module */
const rfxcom = require('../lib'),
    FakeSerialPort = require('./helper'),
    matchers = require('./matchers'),
    protocols = rfxcom.protocols;

describe("RfxCom", function() {
    beforeEach(function() {
        this.addMatchers({
            toHaveSent: matchers.toHaveSent
        });
    });

    describe("RfxCom class", function() {
        describe("data event handler", function() {
            it("should emit a receive event when it receives a message", function(done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("receive", function() {
                    done();
                });
                device.open();
                fakeSerialPort.emit("data", [0x01]);
            });
            it("should emit a status event when it receives message type 0x01", function(done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("status", function() {
                    done();
                });
                device.open();
                fakeSerialPort.emit("data", [0x0D, 0x01, 0x00, 0x01, 0x02, 0x53, 0x30, 0x00, 0x02, 0x21, 0x01, 0x00, 0x00, 0x00]);
            });
            it("should emit a response event when it receives message type 0x02", function(done) {
                const fakeSerialPort = new FakeSerialPort(),
                        device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("response", function () {
                    done();
                });
                device.open();
                fakeSerialPort.emit("data", [0x04, 0x02, 0x01, 0x00, 0x00]);
            });
            it("should emit a lighting1 event when it receives message type 0x10", function(done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("lighting1", function (evt, packetType) {
                    expect(packetType).toBe(0x10);
                    expect(this.deviceNames[packetType][evt.subtype]).toEqual(["X10 lighting"]);
                    done();
                });
                device.open();
                fakeSerialPort.emit("data", [0x07, 0x10, 0x00, 0x00, 0x41, 0x03, 0x00, 0x0F]);
            });
            it("should emit a lighting2 event when it receives message type 0x11", function(done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("lighting2", function (evt, packetType) {
                    expect(packetType).toBe(0x11);
                    expect(this.deviceNames[packetType][evt.subtype]).toEqual(["HomeEasy EU"]);
                    done();
                });
                device.open();
                fakeSerialPort.emit("data", [0x0B, 0x11, 0x01, 0x00, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x0F, 0x0F]);
            });
            it("should emit a lighting4 event when it receives message type 0x13", function (done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("lighting4", function (evt, packetType) {
                    expect(packetType).toBe(0x13);
                    expect(this.deviceNames[packetType][evt.subtype]).toEqual(["PT2262"]);
                    done();
                });
                device.open();
                fakeSerialPort.emit("data", [0x09, 0x13, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x12, 0x00]);
            });
            it("should emit a lighting5 event when it receives message type 0x14", function(done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("lighting5", function (evt, packetType) {
                    expect(packetType).toBe(0x14);
                    expect(this.deviceNames[packetType][evt.subtype]).toEqual(["LightwaveRF", "Siemens"]);
                    done();
                });
                device.open();
                fakeSerialPort.emit("data", [0x0A, 0x14, 0x00, 0x01, 0xF0, 0x9A, 0xC7, 0x02, 0x00, 0x00, 0x80]);
            });
            it("should emit a lighting6 event when it receives message type 0x15", function (done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("lighting6", function (evt, packetType) {
                    expect(packetType).toBe(0x15);
                    expect(this.deviceNames[packetType][evt.subtype]).toEqual(["Blyss"]);
                    done();
                });
                device.open();
                fakeSerialPort.emit("data", [0x0b, 0x15, 0x00, 0x00, 0xF0, 0x9A, 0x42, 0x00, 0x03, 0x00, 0x00, 0x00]);
            });
            it("should emit a chime event when it receives message type 0x16", function (done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("chime1", function (evt, packetType) {
                    expect(packetType).toBe(0x16);
                    expect(this.deviceNames[packetType][evt.subtype]).toEqual(["Byron SX"]);
                    done();
                });
                device.open();
                fakeSerialPort.emit("data", [0x07, 0x16, 0x00, 0x00, 0x00, 0xff, 0x0d, 0x30]);
            });
            it("should emit a blinds1 event when it receives message type 0x19", function (done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("blinds1", function (evt, packetType) {
                    expect(packetType).toBe(0x19);
                    expect(this.deviceNames[packetType][evt.subtype]).toEqual(["Raex YR1326"]);
                    done();
                });
                device.open();
                fakeSerialPort.emit("data", [0x09, 0x19, 0x04, 0x06, 0x00, 0xA2, 0x1B, 0x01, 0x02, 0x80]);
            });
            it("should emit a security1 event when it receives message type 0x20", function(done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("security1", function (evt, packetType) {
                    expect(packetType).toBe(0x20);
                    expect(this.deviceNames[packetType][evt.subtype]).toEqual(["X10 security motion sensor"]);
                    done();
                });
                device.open();
                fakeSerialPort.emit("data", [0x08, 0x20, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
            });
            it("should emit a camera1 event when it receives message type 0x28", function(done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("camera1", function (evt, packetType) {
                    expect(packetType).toBe(0x28);
                    expect(this.deviceNames[packetType][evt.subtype]).toEqual(["X10 Ninja Camera"]);
                    done();
                });
                device.open();
                fakeSerialPort.emit("data", [0x06, 0x28, 0x00, 0x00, 0x42, 0x03, 0x90]);
            });
            it("should emit a remote event when it receives message type 0x30", function(done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("remote", function (evt, packetType) {
                    expect(packetType).toBe(0x30);
                    expect(this.deviceNames[packetType][evt.subtype]).toEqual(["ATI Remote Wonder"]);
                    done();
                });
                device.open();
                fakeSerialPort.emit("data", [0x06, 0x30, 0x00, 0x04, 0x0F, 0x0D, 0x82]);
            });
            it("should emit a thermostat1 event when it receives message type 0x40", function(done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("thermostat1", function (evt, packetType) {
                    expect(packetType).toBe(0x40);
                    expect(this.deviceNames[packetType][evt.subtype]).toEqual(["Digimax", "TLX7506"]);
                    done();
                });
                device.open();
                fakeSerialPort.emit("data", [0x09, 0x40, 0x00, 0x1B, 0x6B, 0x18, 0x16, 0x15, 0x02, 0x70]);
            });
            it("should emit a thermostat3 event when it receives message type 0x42", function(done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("thermostat3", function (evt, packetType) {
                    expect(packetType).toBe(0x42);
                    expect(this.deviceNames[packetType][evt.subtype]).toEqual(["Mertik G6R-H4TB", "Mertik G6R-H4T", "Mertik G6R-H4T21-Z22"]);
                    done();
                });
                device.open();
                fakeSerialPort.emit("data", [0x08, 0x42, 0x01, 0x01, 0x01, 0x9F, 0xAB, 0x02, 0x81]);
            });
            it("should emit a bbq event when it receives message type 0x4e", function(done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("bbq1", function (evt, packetType) {
                    expect(packetType).toBe(0x4e);
                    expect(this.deviceNames[packetType][evt.subtype]).toEqual(["Maverick ET-732"]);
                    done();
                });
                device.open();
                fakeSerialPort.emit("data", [0x0A, 0x4E, 0x01, 0x00, 0x00, 0x00, 0x00, 0x19, 0x00, 0x17, 0x89]);
            });
            it("should emit a temprain event when it receives message type 0x4f, with device type 1", function(done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("temperaturerain1", function (evt, packetType) {
                    expect(packetType).toBe(0x4f);
                    expect(this.deviceNames[packetType][evt.subtype]).toEqual(["Alecto WS1200"]);
                    done();
                });
                device.open();
                fakeSerialPort.emit("data", [0x0a, 0x4f, 0x01, 0x00, 0x12, 0x34, 0x01, 0x17, 0x00, 0x42, 0x55]);
            });
            it("should emit a temp event when it receives message type 0x50, with device type 1", function(done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("temperature1", function (evt, packetType) {
                    expect(packetType).toBe(0x50);
                    expect(this.deviceNames[packetType][evt.subtype]).toEqual(["THR128", "THR138", "THC138"]);
                    done();
                });
                device.open();
                fakeSerialPort.emit("data", [0x08, 0x50, 0x01, 0x01, 0xFA, 0xAF, 0x80, 0x14, 0x42]);
            });
            it("should emit a temp event when it receives message type 0x50, with device type 2", function(done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("temperature1", function (evt, packetType) {
                    expect(packetType).toBe(0x50);
                    expect(this.deviceNames[packetType][evt.subtype]).toEqual(["THC238", "THC268", "THN132", "THWR288", "THRN122", "THN122", "AW129", "AW131", "THN129"]);
                    done();
                });
                device.open();
                fakeSerialPort.emit("data", [0x08, 0x50, 0x02, 0x01, 0xFA, 0xAF, 0x80, 0x14, 0x42]);
            });
            it("should emit a humidity event when it receives message type 0x51", function(done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("humidity1", function (evt, packetType) {
                    expect(packetType).toBe(0x51);
                    expect(this.deviceNames[packetType][evt.subtype]).toEqual(["La Crosse TX3"]);
                    done();
                });
                device.open();
                fakeSerialPort.emit("data", [0x08, 0x51, 0x01, 0x02, 0x77, 0x00, 0x36, 0x01, 0x89]);
            });
            it("should emit a temphumidity event when it receives message type 0x52, with device type 1", function(done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("temperaturehumidity1", function (evt, packetType) {
                    expect(packetType).toBe(0x52);
                    expect(this.deviceNames[packetType][evt.subtype]).toEqual(["THGN122", "THGN123", "THGN132", "THGR122", "THGR228", "THGR238", "THGR268"]);
                    done();
                });
                device.open();
                fakeSerialPort.emit("data", [0x0A, 0x52, 0x01, 0x04, 0xAF, 0x01, 0x00, 0x90, 0x36, 0x02, 0x59]);
            });
            it("should emit a temphumbaro event when it receives message type 0x54", function(done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("temphumbaro1", function (evt, packetType) {
                    expect(packetType).toBe(0x54);
                    expect(this.deviceNames[packetType][evt.subtype]).toEqual(["BTHR918N", "BTHR968"]);
                    done();
                });
                device.open();
                fakeSerialPort.emit("data", [0x0D, 0x54, 0x02, 0x0E, 0xE9, 0x00, 0x00, 0xC9, 0x27, 0x02, 0x03, 0xE7, 0x04, 0x39]);
            });
            it("should emit a rain event when it receives message type 0x55, with device type 2", function(done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("rain1", function (evt, packetType) {
                    expect(packetType).toBe(0x55);
                    expect(this.deviceNames[packetType][evt.subtype]).toEqual(["PCR800"]);
                    done();
                });
                device.open();
                fakeSerialPort.emit("data", [0x0B, 0x55, 0x02, 0x17, 0xB6, 0x00, 0x00, 0x00, 0x00, 0x4D, 0x3C, 0x69]);
            });
            it("should emit a wind event when it receives message type 0x56, with device type 1", function(done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("wind1", function (evt, packetType) {
                    expect(packetType).toBe(0x56);
                    expect(this.deviceNames[packetType][evt.subtype]).toEqual(["WTGR800"]);
                    done();
                });
                device.open();
                fakeSerialPort.emit("data", [0x10, 0x56, 0x01, 0x12, 0x2F, 0x00, 0x00, 0x87, 0x00, 0x00, 0x00, 0x14, 0x00, 0x49, 0x00, 0x00, 0x79]);
            });
            it("should emit a uv event when it receives message type 0x57, with device type 1", function(done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("uv1", function (evt, packetType) {
                    expect(packetType).toBe(0x57);
                    expect(this.deviceNames[packetType][evt.subtype]).toEqual(["UVN128", "UV138"]);
                    done();
                });
                device.open();
                fakeSerialPort.emit("data", [0x09, 0x57, 0x01, 0x00, 0x12, 0x34, 0x38, 0x01, 0x11, 0x79]);
            });
            it("should emit a datetime event when it receives message type 0x58, with device type 1", function(done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("datetime", function (evt, packetType) {
                    expect(packetType).toBe(0x58);
                    expect(this.deviceNames[packetType][evt.subtype]).toEqual(["RTGR328N", "RTGR383"]);
                    done();
                });
                device.open();
                fakeSerialPort.emit("data", [0x0D, 0x58, 0x01, 0x00, 0x12, 0x34, 0x11, 0x08, 0x11, 0x05, 0x14, 0x1B, 0x11, 0x79]);
            });
            it("should emit an elec1 event when it receives message type 0x59", function (done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("elec1", function (evt, packetType) {
                    expect(this.deviceNames[packetType][evt.subtype]).toEqual(["CM113", "Electrisave", "Cent-a-meter"]);
                    expect(packetType).toBe(0x59);
                    done();
                });
                device.open();
                fakeSerialPort.emit("data", [0x0D, 0x59, 0x01, 0x0F, 0x86, 0x00, 0x04, 0x00, 0x1D, 0x00, 0x00, 0x00, 0x00, 0x49]);
            });
            it("should emit an elec23 event when it receives message type 0x5a, with device type 1", function (done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("elec23", function (evt, packetType) {
                    expect(packetType).toBe(0x5a);
                    expect(this.deviceNames[packetType][evt.subtype]).toEqual(["CM119", "M160"]);
                    done();
                });
                device.open();
                fakeSerialPort.emit("data", [0x11, 0x5a, 0x01, 0x00, 0x00, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
            });
            it("should emit an elec4 event when it receives message type 0x5b", function (done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("elec4", function (evt, packetType) {
                    expect(packetType).toBe(0x5b);
                    expect(this.deviceNames[packetType][evt.subtype]).toEqual(["CM180i"]);
                    done();
                });
                device.open();
                fakeSerialPort.emit("data", [0x13, 0x5B, 0x01, 0x06, 0xB8, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00,
                    0x00, 0x00, 0x00, 0x00, 0x6F, 0x14, 0x88, 0x89]);
            });
            it("should emit an elec5 event when it receives message type 0x5c", function (done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("elec5", function (evt, packetType) {
                    expect(packetType).toBe(0x5c);
                    expect(this.deviceNames[packetType][evt.subtype]).toEqual(["Revolt"]);
                    done();
                });
                device.open();
                fakeSerialPort.emit("data", [0x0F, 0x5C, 0x01, 0x03, 0x00, 0x2D, 0xE4, 0x00, 0x00, 0x00, 0x00, 0x00,
                                             0x03, 0x00, 0x32, 0x80]);
            });
            it("should emit a weight event when it receives message type 0x5D", function(done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("weight1", function (evt, packetType) {
                    expect(packetType).toBe(0x5d);
                    expect(this.deviceNames[packetType][evt.subtype]).toEqual(["BWR102", "BWR102"]);
                    done();
                });
                device.open();
                fakeSerialPort.emit("data", [0x08, 0x5D, 0x01, 0xF5, 0x00, 0x07, 0x03, 0x40, 0x40]);
            });
            it("should emit a cartelectronic event when it receives message type 0x60", function(done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("cartelectronic", function (evt, packetType) {
                    expect(packetType).toBe(0x60);
                    expect(this.deviceNames[packetType][evt.subtype]).toEqual(["TIC"]);
                    done();
                });
                device.open();
                fakeSerialPort.emit("data", [0x15, 0x60, 0x01, 0x00, 0x12, 0x34, 0x56, 0x78, 0x9a,
                0x01, 0x12, 0x34, 0x56, 0x78, 0x12, 0x34, 0x56, 0x78, 0x07, 0x5a, 0x012, 0x79]);
            });
            it("should emit an rfxsensor event when it receives message type 0x70", function(done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("rfxsensor", function (evt, packetType) {
                    expect(packetType).toBe(0x70);
                    expect(this.deviceNames[packetType][evt.subtype]).toEqual(["RFXSensor temperature"]);
                    done();
                });
                device.open();
                fakeSerialPort.emit("data", [0x07, 0x70, 0x00, 0xE9, 0x28, 0x02, 0xE1, 0x70]);
            });
            it("should emit an rfxmeter event when it receives message type 0x71", function(done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("rfxmeter", function (evt, packetType) {
                    expect(packetType).toBe(0x71);
                    expect(this.deviceNames[packetType][evt.subtype]).toEqual(["RFXMeter data"]);
                    done();
                });
                device.open();
                fakeSerialPort.emit("data", [0x0A, 0x71, 0x00, 0x37, 0x08, 0xF8, 0x00, 0x8A, 0x64, 0x67, 0x70]);
            });
        });

        describe(".initialise function", function () {
            it("should emit a 'connectfailed' event if the serial port device file does not exist", function (done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/dev/tty-i-dont-exist", {
                        port: fakeSerialPort
                    });
                device.on("connectfailed", function () {
                    done();
                });
                device.open();
                fakeSerialPort.emit("error", "connectfailed\n");
            });
            describe("message sequence", function () {
                let device = {};
                beforeEach(function () {
                    const fakeSerialPort = new FakeSerialPort();
                        device = new rfxcom.RfxCom("/dev/ttyUSB0", {
                            port: fakeSerialPort
                        });
                        jasmine.Clock.useMock(); // There is a 500ms Timeout in the initialisation code, we must mock it
                    });
                it("should prepare the device for use.", function (done) {
                    const
                        resetSpy = spyOn(device, "resetRFX").andCallThrough(),
                        flushSpy = spyOn(device, "flush").andCallThrough(),
                        getStatusSpy = spyOn(device, "getRFXStatus").andCallFake(function () {
                            device.statusMessageHandler([0x00, 0x01, 0x02, 0x53, 0x5E, 0x08, 0x02, 0x25, 0x00, 0x01, 0x01, 0x1C])
                        }),
                        openSpy = spyOn(device, "open").andCallFake(function () {
                            device.connected = true;
                            device.emit("ready");
                        });

                    device.initialise(() => { done() });
                    jasmine.Clock.tick(501);
                    expect(resetSpy).toHaveBeenCalled();
                    expect(flushSpy).toHaveBeenCalledWith(jasmine.any(Function));
                    expect(getStatusSpy).toHaveBeenCalledWith(jasmine.any(Function));
                    expect(openSpy).toHaveBeenCalled();
                });
                it("should prepare the device for use (current firmware).", function (done) {
                    const
                        resetSpy = spyOn(device, "resetRFX").andCallThrough(),
                        flushSpy = spyOn(device, "flush").andCallThrough(),
                        startRxSpy = spyOn(device, "startRFXReceiver").andCallFake(function () {
                            device.statusMessageHandler([0x07, 0x02, 0x07, 0x43, 0x6F, 0x70, 0x79, 0x72, 0x69, 0x67, 0x68, 0x74, 0x20, 0x52, 0x46, 0x58, 0x43, 0x4F, 0x4D])
                        }),
                        getStatusSpy = spyOn(device, "getRFXStatus").andCallFake(function () {
                            device.statusMessageHandler([0x00, 0x01, 0x02, 0x53, 0x5E, 0x08, 0x02, 0x25, 0x00, 0x01, 0x01, 0x1C, 0x03, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00])
                        }),
                        openSpy = spyOn(device, "open").andCallFake(function () {
                            device.connected = true;
                            device.emit("ready");
                        });

                    device.initialise(() => { done() });
                    jasmine.Clock.tick(501);
                    expect(resetSpy).toHaveBeenCalled();
                    expect(flushSpy).toHaveBeenCalledWith(jasmine.any(Function));
                    expect(getStatusSpy).toHaveBeenCalledWith(jasmine.any(Function));
                    expect(startRxSpy).toHaveBeenCalledWith(jasmine.any(Function));
                    expect(openSpy).toHaveBeenCalled();
                });
            });
        });

        describe(".bytesToUint48", function() {
            it("should convert a sequence of 6 bytes to a longint", function() {
                expect(rfxcom.RfxCom.bytesToUint48([0xF1, 0x27, 0xba, 0x67, 0x28, 0x97])).toBe(265152933341335);
            });
        });
        describe(".bytesToUint32", function() {
            it("should convert a sequence of 4 bytes to a longint", function() {
                expect(rfxcom.RfxCom.bytesToUint32([0xFF, 0x76, 0x21, 0x72])).toBe(4285931890);
            });
        });
        describe(".dumpHex", function() {
            it("should convert a sequence of bytes to a string of hex numbers with a prefix if one is supplied", function() {
                expect(rfxcom.RfxCom.dumpHex([0x00, 0x00, 0x01, 0x72], "0x").toString()).toBe("0x00,0x00,0x01,0x72");
            });
            it("should convert a sequence of bytes to a string of hex numbers with no prefix if none supplied", function() {
                expect(rfxcom.RfxCom.dumpHex([0x00, 0x00, 0x01, 0x72]).toString()).toBe("00,00,01,72");
            });
        });
        describe(".stringToBytes", function() {
            it("should convert a sequence of characters to an array of bytes", function() {
                expect(rfxcom.RfxCom.stringToBytes("203052").bytes.toString()).toBe([32, 48, 82].toString());
            });
            it("should convert a sequence of characters to hex value", function () {
                expect(rfxcom.RfxCom.stringToBytes("203052").value).toBe(0x203052);
            });
            it("should ignore leading 0x on a string", function() {
                expect(rfxcom.RfxCom.stringToBytes("0x203052").bytes.toString()).toBe([32, 48, 82].toString());
            });
        });
        describe(".flush", function() {
            it("should flush the underlying serialport", function(done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/dev/ttyUSB0", {
                        port: fakeSerialPort
                    });
                device.flush(function() {
                    expect(fakeSerialPort.flushed).toBeTruthy();
                    done();
                });
            });
        });
        describe(".resetRFX", function() {
            it("should send the correct bytes to the serialport", function(done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/dev/ttyUSB0", {
                        port: fakeSerialPort
                    });
                device.resetRFX(function() {
                    done();
                });
                expect(fakeSerialPort).toHaveSent([13, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
            });
        });
        describe(".getRFXStatus", function() {
            it("should send the correct bytes to the serialport", function(done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/dev/ttyUSB0", {
                        port: fakeSerialPort
                    });
                device.getRFXStatus(function() {
                    done();
                });
                expect(fakeSerialPort).toHaveSent([13, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
            });
        });
        describe(".enableRFXProtocols", function() {
            it("should send the correct bytes to the serialport", function(done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/dev/ttyUSB0", {
                        port: fakeSerialPort
                    });
                device.connected = true;
                device.enableRFXProtocols([protocols.LACROSSE, protocols.OREGON, protocols.AC, protocols.ARC, protocols.X10], function() {
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0D, 0x00, 0x00, 0x00, 0x03, 0x53, 0x00, 0x00, 0x08, 0x27, 0x0, 0x0, 0x0, 0x0]);
                device.acknowledge.forEach(acknowledge => {if (typeof acknowledge === "function") {acknowledge()}});
            });

            it("should send the correct bytes to the serialport for a single protocol", function(done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/dev/ttyUSB0", {
                        port: fakeSerialPort
                    });
                device.connected = true;
                device.enableRFXProtocols(protocols.LIGHTWAVERF, function() {
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0D, 0x00, 0x00, 0x00, 0x03, 0x53, 0x00, 0x00, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00]);
                device.acknowledge.forEach(acknowledge => {if (typeof acknowledge === "function") {acknowledge()}});
            });
        });
        describe(".saveRFXProtocols", function() {
            it("should send the correct bytes to the serialport", function(done) {
                const fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/dev/ttyUSB0", {
                        port: fakeSerialPort
                    });
                device.saveRFXProtocols(function() {
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0D, 0x00, 0x00, 0x00, 0x06, 0x00, 0x00, 0x00, 0x00, 0x00, 0x0, 0x00, 0x00, 0x00]);
                device.acknowledge.forEach(acknowledge => {if (typeof acknowledge === "function") {acknowledge()}});
            });
        });

        describe(".statusMessageHandler", function() {
            let device = {};
            beforeEach(function() {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should emit a status message when called", function(done) {
                device.on("status", function(evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.seqnbr).toBe(0x01);
                    expect(evt.cmnd).toBe(0x2);
                    expect(evt.receiverType).toBe("433.92MHz transceiver");
                    expect(evt.firmwareVersion).toBe(0x30);
                    expect(evt.firmwareType).toBe("Type 1");
                    expect(evt.enabledProtocols).toEqual(["RSL", "BYRONSX"]);
                    done();
                });
                device.statusMessageHandler([0, 1, 0x2, 0x53, 0x30, 0x30, 0, 0, 0, 0, 0, 0]);
            });
            it("should emit a status message when called", function(done) {
                device.on("status", function(evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.seqnbr).toBe(0x01);
                    expect(evt.cmnd).toBe(0x2);
                    expect(evt.receiverType).toBe("433.92MHz transceiver");
                    expect(evt.firmwareVersion).toBe(161);
                    expect(evt.firmwareType).toBe("Type 1");
                    expect(evt.enabledProtocols).toEqual(["RSL", "BYRONSX"]);
                    done();
                });
                device.statusMessageHandler([0, 1, 0x2, 0x53, 161, 0x30, 0, 0, 0, 0, 0, 0]);
            });
            it("should emit a status message when called", function(done) {
                device.on("status", function(evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.seqnbr).toBe(0x01);
                    expect(evt.cmnd).toBe(0x2);
                    expect(evt.receiverType).toBe("433.92MHz transceiver");
                    expect(evt.firmwareVersion).toBe(162);
                    expect(evt.firmwareType).toBe("Type 2");
                    expect(evt.enabledProtocols).toEqual(["RSL", "BYRONSX"]);
                    done();
                });
                device.statusMessageHandler([0, 1, 0x2, 0x53, 162, 0x30, 0, 0, 0, 0, 0, 0]);
            });
            it("should emit a status message when called", function(done) {
                device.on("status", function(evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.seqnbr).toBe(0x01);
                    expect(evt.cmnd).toBe(0x2);
                    expect(evt.receiverType).toBe("433.92MHz transceiver");
                    expect(evt.firmwareVersion).toBe(224);
                    expect(evt.firmwareType).toBe("Type 2");
                    expect(evt.enabledProtocols).toEqual(["RSL", "BYRONSX"]);
                    done();
                });
                device.statusMessageHandler([0, 1, 0x2, 0x53, 224, 0x30, 0, 0, 0, 0, 0, 0]);
            });
            it("should emit a status message when called", function(done) {
                device.on("status", function(evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.seqnbr).toBe(0x01);
                    expect(evt.cmnd).toBe(0x2);
                    expect(evt.receiverType).toBe("433.92MHz transceiver");
                    expect(evt.firmwareVersion).toBe(225);
                    expect(evt.firmwareType).toBe("Ext");
                    expect(evt.enabledProtocols).toEqual(["RSL", "BYRONSX"]);
                    done();
                });
                device.statusMessageHandler([0, 1, 0x2, 0x53, 225, 0x30, 0, 0, 0, 0, 0, 0]);
            });
            it("should emit a status message when called with a long status packet", function(done) {
                device.on("status", function(evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.seqnbr).toBe(0x01);
                    expect(evt.cmnd).toBe(0x2);
                    expect(evt.receiverType).toBe("433.92MHz transceiver");
                    expect(evt.firmwareVersion).toBe(1001);
                    expect(evt.firmwareType).toBe("Type 1");
                    expect(evt.enabledProtocols).toEqual(["RSL", "BYRONSX"]);
                    done();
                });
                device.statusMessageHandler([0, 1, 0x2, 0x53, 1, 0x30, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0]);
            });
            it("should emit a status message when called with a long status packet", function(done) {
                device.on("status", function(evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.seqnbr).toBe(0x01);
                    expect(evt.cmnd).toBe(0x2);
                    expect(evt.receiverType).toBe("433.92MHz transceiver");
                    expect(evt.firmwareVersion).toBe(1001);
                    expect(evt.firmwareType).toBe("Type 2");
                    expect(evt.enabledProtocols).toEqual(["RSL", "BYRONSX"]);
                    done();
                });
                device.statusMessageHandler([0, 1, 0x2, 0x53, 1, 0x30, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0]);
            });
            it("should emit a status message when called with a long status packet", function(done) {
                device.on("status", function(evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.seqnbr).toBe(0x01);
                    expect(evt.cmnd).toBe(0x2);
                    expect(evt.receiverType).toBe("433.92MHz transceiver");
                    expect(evt.firmwareVersion).toBe(1001);
                    expect(evt.firmwareType).toBe("Ext");
                    expect(evt.enabledProtocols).toEqual(["RSL", "BYRONSX"]);
                    done();
                });
                device.statusMessageHandler([0, 1, 0x2, 0x53, 1, 0x30, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0]);
            });
            it("should emit a status message when called with a long status packet", function(done) {
                device.on("status", function(evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.seqnbr).toBe(0x01);
                    expect(evt.cmnd).toBe(0x2);
                    expect(evt.receiverType).toBe("433.92MHz transceiver");
                    expect(evt.firmwareVersion).toBe(1001);
                    expect(evt.firmwareType).toBe("Ext 2");
                    expect(evt.enabledProtocols).toEqual(["RSL", "BYRONSX"]);
                    done();
                });
                device.statusMessageHandler([0, 1, 0x2, 0x53, 1, 0x30, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0]);
            });
        });

        describe(".transmitCommandResponseHandler", function() {
            it("should emit an response message when called", function(done) {
                const device = new rfxcom.RfxCom("/dev/ttyUSB0");
                device.on("response", function(message, seqnbr) {
                    expect(message).toBe("ACK - transmit OK");
                    expect(seqnbr).toBe(3);
                    done();
                });
                device.transmitCommandResponseHandler([0x00, 0x03, 0x00]);
            });
        });

        describe(".lighting1Handler", function() {
            let device = {};
            beforeEach(function() {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should emit a lighting1 message when called", function(done) {
                device.on("lighting1", function(evt) {
                    expect(evt.subtype).toBe(1);
                    expect(evt.seqnbr).toBe(1);
                    expect(evt.houseCode).toBe("D");
                    expect(evt.unitCode).toBe(2);
                    expect(evt.command).toBe("On");
                    expect(evt.commandNumber).toBe(1);
                    expect(evt.rssi).toBe(7);
                    expect(evt.id).toBe("0x4402");
                    done();
                });
                device.lighting1Handler([0x01, 0x01, 0x44, 0x02, 0x01, 0x70], 0x10);
            });
            it("should report an unknown command", function (done) {
                device.on("lighting1", function (evt) {
                    expect(evt.command).toBe("Unknown");
                    expect(evt.commandNumber).toBe(255);
                    done();
                });
                device.lighting1Handler([0x01, 0x01, 0x44, 0x02, 0xff, 0x70]);
            });
            it("should calculate the id correctly", function(done) {
                device.on("lighting1", function(evt) {
                    expect(evt.id).toBe("0x4305");
                    expect(evt.houseCode).toBe("C");
                    expect(evt.unitCode).toBe(5);
                    done();
                });
                device.lighting1Handler([0x01, 0x01, 0x43, 0x05, 0x01, 0x70]);
            });
            it("should calculate the rssi correctly", function(done) {
                device.on("lighting1", function(evt) {
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.lighting1Handler([0x01, 0x01, 0x43, 0x05, 0x01, 0x80]);
            });
            describe("device type identification", function() {
                it("should identify X10 devices", function(done) {
                    device.on("lighting1", function(evt) {
                        expect(evt.subtype).toBe(0);
                        done();
                    });
                    device.lighting1Handler([0x00, 0x01, 0x43, 0x05, 0x01, 0x80]);
                });
                it("should identify Waveman devices", function(done) {
                    device.on("lighting1", function(evt) {
                        expect(evt.subtype).toBe(3);
                        done();
                    });
                    device.lighting1Handler([0x03, 0x01, 0x43, 0x05, 0x01, 0x80]);
                });
            });
        });

        describe(".lighting2Handler", function() {
            let device = {};
            beforeEach(function() {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should emit a lighting2 message when called", function(done) {
                device.on("lighting2", function(evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.seqnbr).toBe(1);
                    expect(evt.id).toBe("0x039AC7A1");
                    expect(evt.unitCode).toBe(1);
                    expect(evt.command).toBe("Off");
                    expect(evt.commandNumber).toBe(0);
                    expect(evt.level).toBe(0x0F);
                    expect(evt.rssi).toBe(0x0F);
                    done();
                });
                device.lighting2Handler([0x00, 0x01, 0xC3, 0x9A, 0xC7, 0xA1, 0x01, 0x00, 0x0F, 0xF0]);
            });
            it("should report an unknown command", function (done) {
                device.on("lighting2", function (evt) {
                    expect(evt.command).toBe("Unknown");
                    expect(evt.commandNumber).toBe(255);
                    done();
                });
                device.lighting2Handler([0x00, 0x01, 0xC3, 0x9A, 0xC7, 0xA1, 0x01, 0xFF, 0x0F, 0xF0]);
            });
            it("should calculate the id correctly", function(done) {
                device.on("lighting2", function(evt) {
                    expect(evt.id).toBe("0x029AC7A1");
                    done();
                });
                device.lighting2Handler([0x00, 0x01, 0xCE, 0x9A, 0xC7, 0xA1, 0x01, 0x00, 0x0F, 0x0F]);
            });
            it("should calculate the rssi correctly", function(done) {
                device.on("lighting2", function(evt) {
                    expect(evt.rssi).toBe(7);
                    done();
                });
                device.lighting2Handler([0x00, 0x01, 0xC3, 0x9A, 0xC7, 0xA1, 0x01, 0x00, 0x07, 0x7F]);
            });
            describe("device type identification", function() {
                it("should identify HomeEasy EU devices", function(done) {
                    device.on("lighting2", function(evt) {
                        expect(evt.subtype).toBe(1);
                        done();
                    });
                    device.lighting2Handler([0x01, 0x01, 0xC3, 0x9A, 0xC7, 0xA1, 0x01, 0x00, 0x0F, 0x0F]);
                });
                it("should identify ANSLUT devices", function(done) {
                    device.on("lighting2", function(evt) {
                        expect(evt.subtype).toBe(2);
                        done();
                    });
                    device.lighting2Handler([0x02, 0x01, 0xC3, 0x9A, 0xC7, 0xA1, 0x01, 0x00, 0x0F, 0x0F]);
                });
            });
        });

        describe(".lighting4Handler", function() {
            let device = {};
            beforeEach(function () {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should emit a lighting4 message when called", function (done) {
                device.on("lighting4", function (evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.seqnbr).toBe(0);
                    expect(evt.data).toBe("0x010203");
                    expect(evt.pulseWidth).toBe(350);
                    expect(evt.command).toBe("Data");
                    expect(evt.commandNumber).toBe(0);
                    expect(evt.rssi).toBe(0x05);
                    done();
                });
                device.lighting4Handler([0x00, 0x00, 0x01, 0x02, 0x03, 0x01, 0x5E, 0x50]);
            });
        });

        describe(".lighting5Handler", function() {
            let device = {};
            beforeEach(function() {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should emit a lighting5 message when called", function(done) {
                device.on("lighting5", function(evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.id).toBe("0xF09AC7");
                    expect(evt.unitCode).toBe(1);
                    expect(evt.command).toBe("Off");
                    expect(evt.commandNumber).toBe(0);
                    expect(evt.seqnbr).toBe(1);
                    done();
                });
                device.lighting5Handler([0x00, 0x01, 0xF0, 0x9A, 0xC7, 0x01, 0x00, 0x00, 0x80]);
            });
            it("should report an unknown command", function (done) {
                device.on("lighting5", function (evt) {
                    expect(evt.command).toBe("Unknown");
                    expect(evt.commandNumber).toBe(255);
                    done();
                });
                device.lighting5Handler([0x00, 0x01, 0xF0, 0x9A, 0xC7, 0x01, 0xFF, 0x00, 0x80]);
            });
            it("should identify the subtype correctly", function(done) {
                device.on("lighting5", function(evt) {
                    expect(evt.subtype).toBe(1);
                    done();
                });
                device.lighting5Handler([0x01, 0x01, 0xF0, 0x9A, 0xC7, 0x01, 0x00, 0x00, 0x80]);
            });

            it("should identify the command correctly", function(done) {
                device.on("lighting5", function(evt) {
                    expect(evt.command).toBe("On");
                    expect(evt.commandNumber).toBe(1);
                    done();
                });
                device.lighting5Handler([0x01, 0x01, 0xF0, 0x9A, 0xC7, 0x01, 0x01, 0x00, 0x80]);
            });
            it("should calculate the rssi correctly", function(done) {
                device.on("lighting5", function(evt) {
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.lighting5Handler([0x01, 0x01, 0xF0, 0x9A, 0xC7, 0x01, 0x01, 0x00, 0x80]);
            });
        });

        describe(".lighting6Handler", function() {
            let device = {};
            beforeEach(function() {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should emit a lighting6 message when called", function(done) {
                device.on("lighting6", function(evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.id).toBe("0xF09A");
                    expect(evt.groupCode).toBe("K");
                    expect(evt.unitCode).toBe(4);
                    expect(evt.command).toBe("On");
                    expect(evt.commandNumber).toBe(0);
                    expect(evt.seqnbr).toBe(1);
                    done();
                });
                device.lighting6Handler([0x00, 0x01, 0xF0, 0x9A, 0x4B, 0x04, 0x00, 0x00, 0x00, 0x80]);
            });
            it("should identify the command correctly", function(done) {
                device.on("lighting6", function(evt) {
                    expect(evt.command).toBe("Off");
                    expect(evt.commandNumber).toBe(1);
                    done();
                });
                device.lighting6Handler([0x00, 0x01, 0xF0, 0x9A, 0x4B, 0x04, 0x01, 0x00, 0x00, 0x80]);
            });
            it("should report an unknown command", function (done) {
                device.on("lighting6", function (evt) {
                    expect(evt.command).toBe("Unknown");
                    expect(evt.commandNumber).toBe(255);
                    done();
                });
                device.lighting6Handler([0x00, 0x01, 0xF0, 0x9A, 0x4B, 0x04, 0xFF, 0x00, 0x00, 0x80]);
            });
            it("should calculate the rssi correctly", function(done) {
                device.on("lighting6", function(evt) {
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.lighting6Handler([0x00, 0x01, 0xF0, 0x9A, 0x4B, 0x04, 0x00, 0x00, 0x00, 0x80]);
            });
        });

        describe(".chimeHandler", function () {
            let device = {};
            beforeEach(function() {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should emit a chime1 message when called", function(done) {
                device.on("chime1", function(evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.id).toBe("0x9A");
                    expect(evt.command).toBe("Big Ben");
                    expect(evt.commandNumber).toBe(3);
                    expect(evt.seqnbr).toBe(1);
                    expect(evt.rssi).toBe(1);
                    done();
                });
                device.chimeHandler([0x00, 0x01, 0x00, 0x9A, 0x03, 0x10]);
            });
            it("should handle long ID devices", function(done) {
                device.on("chime1", function(evt) {
                    expect(evt.subtype).toBe(2);
                    expect(evt.id).toBe("0x03FFFF");
                    expect(evt.command).toBeUndefined();
                    expect(evt.commandNumber).toBeUndefined();
                    expect(evt.seqnbr).toBe(2);
                    expect(evt.rssi).toBe(2);
                    done();
                });
                device.chimeHandler([0x02, 0x02, 0x03, 0xFF, 0xFF, 0x20]);
            });
            it("should handle long ID devices", function(done) {
                device.on("chime1", function(evt) {
                    expect(evt.subtype).toBe(4);
                    expect(evt.id).toBe("0xFFFFFF");
                    expect(evt.command).toBeUndefined();
                    expect(evt.commandNumber).toBeUndefined();
                    expect(evt.seqnbr).toBe(4);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.chimeHandler([0x04, 0x04, 0xFF, 0xFF, 0xFF, 0x80]);
            });
            it("should handle BYRON_MP001 devices", function(done) {
                device.on("chime1", function(evt) {
                    expect(evt.subtype).toBe(1);
                    expect(evt.id).toBe("101000");
                    expect(evt.command).toBeUndefined();
                    expect(evt.commandNumber).toBeUndefined();
                    expect(evt.seqnbr).toBe(5);
                    expect(evt.rssi).toBe(4);
                    done();
                });
                device.chimeHandler([0x01, 0x05, 0x11, 0x5F, 0x54, 0x40]);
            });

        });

        describe(".blinds1Handler", function () {
            let device = {};
            beforeEach(function () {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should handle BLINDS_T0 devices open event", function(done) {
                device.on("blinds1", function(evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.id).toBe("0x1234");
                    expect(evt.unitCode).toBe(5);
                    expect(evt.command).toBe("Open");
                    expect(evt.commandNumber).toBe(0);
                    expect(evt.seqnbr).toBe(5);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.blinds1Handler([0x00, 0x05, 0x00, 0x12, 0x34, 0x05, 0x00, 0x80]);
            });
            it("should handle BLINDS_T0 devices close event", function(done) {
                device.on("blinds1", function(evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.id).toBe("0x1234");
                    expect(evt.unitCode).toBe(5);
                    expect(evt.command).toBe("Close");
                    expect(evt.commandNumber).toBe(1);
                    expect(evt.seqnbr).toBe(5);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.blinds1Handler([0x00, 0x05, 0x00, 0x12, 0x34, 0x05, 0x01, 0x80]);
            });
            it("should handle BLINDS_T0 devices stop event", function(done) {
                device.on("blinds1", function(evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.id).toBe("0x1234");
                    expect(evt.unitCode).toBe(5);
                    expect(evt.command).toBe("Stop");
                    expect(evt.commandNumber).toBe(2);
                    expect(evt.seqnbr).toBe(5);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.blinds1Handler([0x00, 0x05, 0x00, 0x12, 0x34, 0x05, 0x02, 0x80]);
            });
            it("should handle BLINDS_T0 devices confirm event", function(done) {
                device.on("blinds1", function(evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.id).toBe("0x1234");
                    expect(evt.unitCode).toBe(5);
                    expect(evt.command).toBe("Confirm");
                    expect(evt.commandNumber).toBe(3);
                    expect(evt.seqnbr).toBe(5);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.blinds1Handler([0x00, 0x05, 0x00, 0x12, 0x34, 0x05, 0x03, 0x80]);
            });
            it("should handle BLINDS_T0 devices set limit event", function(done) {
                device.on("blinds1", function(evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.id).toBe("0x1234");
                    expect(evt.unitCode).toBe(5);
                    expect(evt.command).toBe("Set limit");
                    expect(evt.commandNumber).toBe(4);
                    expect(evt.seqnbr).toBe(5);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.blinds1Handler([0x00, 0x05, 0x00, 0x12, 0x34, 0x05, 0x04, 0x80]);
            });
            it("should handle BLINDS_T0 devices unknown command event", function(done) {
                device.on("blinds1", function(evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.id).toBe("0x1234");
                    expect(evt.unitCode).toBe(5);
                    expect(evt.command).toBe("Unknown");
                    expect(evt.commandNumber).toBe(255);
                    expect(evt.seqnbr).toBe(5);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.blinds1Handler([0x00, 0x05, 0x00, 0x12, 0x34, 0x05, 0xff, 0x80]);
            });
            it("should handle BLINDS_T1 devices", function(done) {
                device.on("blinds1", function(evt) {
                    expect(evt.subtype).toBe(1);
                    expect(evt.id).toBe("0x1234");
                    expect(evt.unitCode).toBe(5);
                    expect(evt.command).toBe("Open");
                    expect(evt.commandNumber).toBe(0);
                    expect(evt.seqnbr).toBe(5);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.blinds1Handler([0x01, 0x05, 0x00, 0x12, 0x34, 0x05, 0x00, 0x80]);
            });
            it("should handle BLINDS_T2 devices", function(done) {
                device.on("blinds1", function(evt) {
                    expect(evt.subtype).toBe(2);
                    expect(evt.id).toBe("0x001234");
                    expect(evt.unitCode).toBe(1);
                    expect(evt.command).toBe("Open");
                    expect(evt.commandNumber).toBe(0);
                    expect(evt.seqnbr).toBe(5);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.blinds1Handler([0x02, 0x05, 0x00, 0x12, 0x34, 0x05, 0x00, 0x80]);
            });
            it("should handle BLINDS_T3 devices", function(done) {
                device.on("blinds1", function(evt) {
                    expect(evt.subtype).toBe(3);
                    expect(evt.id).toBe("0x001234");
                    expect(evt.unitCode).toBe(5);
                    expect(evt.command).toBe("Open");
                    expect(evt.commandNumber).toBe(0);
                    expect(evt.seqnbr).toBe(5);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.blinds1Handler([0x03, 0x05, 0x00, 0x12, 0x34, 0x04, 0x00, 0x80]);
            });
            it("should handle BLINDS_T3 devices group code", function(done) {
                device.on("blinds1", function(evt) {
                    expect(evt.subtype).toBe(3);
                    expect(evt.id).toBe("0x001234");
                    expect(evt.unitCode).toBe(0);
                    expect(evt.command).toBe("Open");
                    expect(evt.commandNumber).toBe(0);
                    expect(evt.seqnbr).toBe(5);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.blinds1Handler([0x03, 0x05, 0x00, 0x12, 0x34, 0x0f, 0x00, 0x80]);
            });
            it("should handle BLINDS_T4 devices", function(done) {
                device.on("blinds1", function(evt) {
                    expect(evt.subtype).toBe(4);
                    expect(evt.id).toBe("0x001234");
                    expect(evt.unitCode).toBe(1);
                    expect(evt.command).toBe("Open");
                    expect(evt.commandNumber).toBe(0);
                    expect(evt.seqnbr).toBe(5);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.blinds1Handler([0x04, 0x05, 0x00, 0x12, 0x34, 0x00, 0x00, 0x80]);
            });
            it("should handle BLINDS_T4 devices delete limits event", function(done) {
                device.on("blinds1", function(evt) {
                    expect(evt.subtype).toBe(4);
                    expect(evt.id).toBe("0x001234");
                    expect(evt.unitCode).toBe(1);
                    expect(evt.command).toBe("Delete limits");
                    expect(evt.commandNumber).toBe(6);
                    expect(evt.seqnbr).toBe(5);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.blinds1Handler([0x04, 0x05, 0x00, 0x12, 0x34, 0x00, 0x06, 0x80]);
            });
            it("should handle BLINDS_T4 devices reverse event", function(done) {
                device.on("blinds1", function(evt) {
                    expect(evt.subtype).toBe(4);
                    expect(evt.id).toBe("0x001234");
                    expect(evt.unitCode).toBe(1);
                    expect(evt.command).toBe("Reverse");
                    expect(evt.commandNumber).toBe(7);
                    expect(evt.seqnbr).toBe(5);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.blinds1Handler([0x04, 0x05, 0x00, 0x12, 0x34, 0x00, 0x07, 0x80]);
            });
            it("should handle BLINDS_T4 devices set lower limit event", function(done) {
                device.on("blinds1", function(evt) {
                    expect(evt.subtype).toBe(4);
                    expect(evt.id).toBe("0x001234");
                    expect(evt.unitCode).toBe(1);
                    expect(evt.command).toBe("Set lower limit");
                    expect(evt.commandNumber).toBe(5);
                    expect(evt.seqnbr).toBe(5);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.blinds1Handler([0x04, 0x05, 0x00, 0x12, 0x34, 0x00, 0x05, 0x80]);
            });
            it("should handle BLINDS_T10 devices reverse event", function(done) {
                device.on("blinds1", function(evt) {
                    expect(evt.subtype).toBe(10);
                    expect(evt.id).toBe("0x001234");
                    expect(evt.unitCode).toBe(1);
                    expect(evt.command).toBe("Reverse");
                    expect(evt.commandNumber).toBe(6);
                    expect(evt.seqnbr).toBe(5);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.blinds1Handler([0x0a, 0x05, 0x00, 0x12, 0x34, 0x00, 0x06, 0x80]);
            });
            it("should handle BLINDS_T11 devices", function(done) {
                device.on("blinds1", function(evt) {
                    expect(evt.subtype).toBe(11);
                    expect(evt.id).toBe("0x001234");
                    expect(evt.unitCode).toBe(1);
                    expect(evt.command).toBe("Open");
                    expect(evt.commandNumber).toBe(0);
                    expect(evt.seqnbr).toBe(5);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.blinds1Handler([0x0b, 0x05, 0x00, 0x12, 0x34, 0x00, 0x00, 0x80]);
            });
        });

        describe(".security1Handler", function () {
            let device = {};
            beforeEach(function() {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should extract the id of the device", function(done) {
                device.on("security1", function(evt) {
                    expect(evt.id).toBe("0xFFAA00");
                    done();
                });
                device.security1Handler([0x00, 0x00, 0xFF, 0xAA, 0x00, 0x02, 0x89]);
            });

            it("should correctly identify the NORMAL device state", function(done) {
                device.on("security1", function(evt) {
                    expect(evt.deviceStatus).toBe(rfxcom.security.NORMAL);
                    done();
                });
                device.security1Handler([0x00, 0x00, 0xFF, 0xAA, 0x00, 0x00, 0x89]);
            });
            it("should correctly identify the NORMAL_DELAYED device state", function(done) {
                device.on("security1", function(evt) {
                    expect(evt.deviceStatus).toBe(rfxcom.security.NORMAL_DELAYED);
                    done();
                });
                device.security1Handler([0x00, 0x00, 0xFF, 0xAA, 0x00, 0x01, 0x89]);
            });

            it("should correctly identify the ALARM device state", function(done) {
                device.on("security1", function(evt) {
                    expect(evt.deviceStatus).toBe(rfxcom.security.ALARM);
                    done();
                });
                device.security1Handler([0x00, 0x00, 0xFF, 0xAA, 0x00, 0x02, 0x89]);
            });
            it("should correctly identify the ALARM_DELAYED device state", function(done) {
                device.on("security1", function(evt) {
                    expect(evt.deviceStatus).toBe(rfxcom.security.ALARM_DELAYED);
                    done();
                });
                device.security1Handler([0x00, 0x00, 0xFF, 0xAA, 0x00, 0x03, 0x89]);
            });
            it("should correctly identify the MOTION device state", function(done) {
                device.on("security1", function(evt) {
                    expect(evt.deviceStatus).toBe(rfxcom.security.MOTION);
                    done();
                });
                device.security1Handler([0x00, 0x00, 0xFF, 0xAA, 0x00, 0x04, 0x89]);
            });
            it("should correctly identify the NO_MOTION device state", function(done) {
                device.on("security1", function(evt) {
                    expect(evt.deviceStatus).toBe(rfxcom.security.NO_MOTION);
                    done();
                });
                device.security1Handler([0x00, 0x00, 0xFF, 0xAA, 0x00, 0x05, 0x89]);
            });

            it("should identify the X10 security motion sensor correctly", function(done) {
                device.on("security1", function(evt) {
                    expect(evt.subtype).toBe(rfxcom.security.X10_MOTION_SENSOR);
                    done();
                });
                device.security1Handler([0x01, 0x00, 0xFF, 0xAA, 0x00, 0x04, 0x89]);
            });
            it("should identify the X10 security window sensor correctly", function(done) {
                device.on("security1", function(evt) {
                    expect(evt.subtype).toBe(rfxcom.security.X10_DOOR_WINDOW_SENSOR);
                    done();
                });
                device.security1Handler([0x00, 0x00, 0xFF, 0xAA, 0x00, 0x04, 0x89]);
            });
            it("should correctly identify the tamper notification from a device", function(done) {
                device.on("security1", function(evt) {
                    expect(evt.deviceStatus)
                        .toBe(rfxcom.security.MOTION);
                    expect(evt.tampered)
                        .toBeTruthy();
                    done();
                });
                device.security1Handler([0x01, 0x00, 0xFF, 0xAA, 0x00, 0x84, 0x89]);
            });
            it("should report not tampered if the device isn't tampered with", function(done) {
                device.on("security1", function(evt) {
                    expect(evt.tampered).not.toBeTruthy();
                    done();
                });
                device.security1Handler([0x01, 0x00, 0xFF, 0xAA, 0x00, 0x04, 0x89]);
            });
            it("should correctly identify the battery status", function(done) {
                device.on("security1", function(evt) {
                    expect(evt.batteryLevel).toBe(9);
                    done();
                });
                device.security1Handler([0x01, 0x00, 0xFF, 0xAA, 0x00, 0x04, 0x89]);
            });
            it("should correctly identify the signal strength", function(done) {
                device.on("security1", function(evt) {
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.security1Handler([0x01, 0x00, 0xFF, 0xAA, 0x00, 0x04, 0x89]);
            });
        });

        describe(".camera1Handler", function () {
            let device = {};
            beforeEach(function() {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should extract the event data", function(done) {
                device.on("camera1", function(evt) {
                    expect(evt.houseCode).toBe("A");
                    expect(evt.subtype).toBe(0);
                    expect(evt.seqnbr).toBe(0);
                    expect(evt.commandNumber).toBe(1);
                    expect(evt.command).toBe("Right");
                    done();
                });
                device.camera1Handler([0x00, 0x00, 0x41, 0x01, 0x80]);
            });
            it("should handle the highest command number and house code", function (done) {
                device.on("camera1", function(evt) {
                    expect(evt.houseCode).toBe("P");
                    expect(evt.commandNumber).toBe(15);
                    expect(evt.command).toBe("Program Sweep");
                    done();
                });
                device.camera1Handler([0x00, 0x00, 0x50, 0x0f, 0x80]);
            });

        });

        describe(".remoteHandler", function () {
            let device = {};
            beforeEach(function() {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should handle a command packet", function (done) {
                device.on("remote", function (evt) {
                    expect(evt.id).toBe("0x0F");
                    expect(evt.subtype).toBe(0);
                    expect(evt.seqnbr).toBe(4);
                    expect(evt.commandNumber).toBe(12);
                    expect(evt.command).toBe("CHAN-");
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.remoteHandler([0x00, 0x04, 0x0F, 0x0C, 0x82]);
            });
        });

        describe(".dateTimeHandler", function () {
            let device = {};
            beforeEach(function() {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should handle a command packet", function (done) {
                device.on("datetime", function (evt) {
                    expect(evt.id).toBe("0x1234");
                    expect(evt.subtype).toBe(1);
                    expect(evt.seqnbr).toBe(0);
                    expect(evt.year).toBe(17);
                    expect(evt.month).toBe(8);
                    expect(evt.day).toBe(17);
                    expect(evt.hour).toBe(20);
                    expect(evt.minute).toBe(27);
                    expect(evt.second).toBe(17);
                    expect(evt.weekDay).toBe(5);
                    expect(evt.timestamp).toEqual(new Date(17,8,17,20,27,17));
                    expect(evt.rssi).toBe(7);
                    expect(evt.batteryLevel).toBe(9);
                    done();
                });
                device.dateTimeHandler([0x01, 0x00, 0x12, 0x34, 0x11, 0x08, 0x11, 0x05, 0x14, 0x1B, 0x11, 0x79]);
            });
        });

        describe(".thermostat1Handler", function () {
            let device = {};
            beforeEach(function() {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should handle a status update packet", function (done) {
                device.on("thermostat1", function (evt) {
                    expect(evt.id).toBe("0x6B18");
                    expect(evt.subtype).toBe(0);
                    expect(evt.seqnbr).toBe(27);
                    expect(evt.temperature).toBe(22);
                    expect(evt.setpoint).toBe(21);
                    expect(evt.mode).toBe("Heating");
                    expect(evt.status).toBe("No Demand");
                    expect(evt.rssi).toBe(7);
                    done();
                });
                device.thermostat1Handler([0x00, 0x1B, 0x6B, 0x18, 0x16, 0x15, 0x02, 0x70]);
            });
        });

        describe(".thermostat3Handler", function () {
            let device = {};
            beforeEach(function() {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should handle a status update packet", function (done) {
                device.on("thermostat3", function (evt) {
                    expect(evt.id).toBe("0x019FAB");
                    expect(evt.subtype).toBe(1);
                    expect(evt.seqnbr).toBe(1);
                    expect(evt.command).toBe("Up");
                    expect(evt.commandNumber).toBe(2);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.thermostat3Handler([0x01, 0x01, 0x01, 0x9F, 0xAB, 0x02, 0x81]);
            });
        });

        describe(".bbqHandler", function () {
            let device = {};
            beforeEach(function() {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should extract the id of the device", function(done) {
                device.on("bbq1", function(evt) {
                    expect(evt.id).toBe("0x0000");
                    expect(evt.subtype).toBe(1);
                    expect(evt.seqnbr).toBe(0);
                    done();
                });
                device.bbqHandler([0x01, 0x00, 0x00, 0x00, 0x00, 0x19, 0x00, 0x17, 0x89]);
            });
            it("should report the sensor temperatures", function (done) {
                device.on("bbq1", function(evt) {
                    expect(evt.temperature[0]).toBe(25);
                    expect(evt.temperature[1]).toBe(23);
                    done();
                });
                device.bbqHandler([0x01, 0x00, 0x00, 0x00, 0x00, 0x19, 0x00, 0x17, 0x89]);
            });
            it("should correctly identify the battery status", function(done) {
                device.on("bbq1", function(evt) {
                    expect(evt.batteryLevel).toBe(9);
                    done();
                });
                device.bbqHandler([0x01, 0x00, 0x00, 0x00, 0x00, 0x19, 0x00, 0x17, 0x89]);
            });
            it("should correctly identify the signal strength", function(done) {
                device.on("bbq1", function(evt) {
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.bbqHandler([0x01, 0x00, 0x00, 0x00, 0x00, 0x19, 0x00, 0x17, 0x89]);
            });

        });

        describe(".temprainHandler", function() {
            let device = {};
            beforeEach(function () {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should extract the id of the device", function(done) {
                device.on("temperaturerain1", function(evt) {
                    expect(evt.id).toBe("0xDEAD");
                    expect(evt.subtype).toBe(1);
                    done();
                });
                device.temprainHandler([0x01, 0x01, 0xde, 0xad, 0x01, 0x4A, 0x02, 0xee, 0x42]);
            });
            it("should extract the rainfall value", function(done) {
                device.on("temperaturerain1", function(evt) {
                    expect(evt.rainfall).toBe(75.0);
                    done();
                });
                device.temprainHandler([0x01, 0x01, 0xde, 0xad, 0x01, 0x4A, 0x02, 0xee, 0x42]);
            });
            it("should extract the temperature value", function(done) {
                device.on("temperaturerain1", function(evt) {
                    expect(evt.temperature).toBe(33.3);
                    done();
                });
                device.temprainHandler([0x01, 0x01, 0xde, 0xad, 0x01, 0x4D, 0x02, 0xee, 0x42]);
            });
            it("should extract a negative temperature value", function(done) {
                device.on("temperaturerain1", function(evt) {
                    expect(evt.temperature).toBe(-10.0);
                    done();
                });
                device.temprainHandler([0x01, 0x01, 0xde, 0xad, 0x80, 0x64, 0x02, 0xee, 0x42]);
            });
            it("should extract the battery strength correctly", function(done) {
                device.on("temperaturerain1", function(evt) {
                    expect(evt.batteryLevel).toBe(9);
                    done();
                });
                device.temprainHandler([0x01, 0x01, 0xde, 0xad, 0x80, 0x64, 0x02, 0xee, 0x09]);
            });
            it("should extract the signal strength correctly", function(done) {
                device.on("temperaturerain1", function(evt) {
                    expect(evt.rssi).toBe(6);
                    done();
                });
                device.temprainHandler([0x01, 0x01, 0xde, 0xad, 0x80, 0x64, 0x02, 0xee, 0x60]);
            });
        });

        describe(".tempHandler", function() {
            let device = {};
            beforeEach(function() {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should extract the id of the device", function(done) {
                device.on("temperature1", function(evt) {
                    expect(evt.id).toBe("0xFAAF");
                    expect(evt.subtype).toBe(3);
                    done();
                });
                device.tempHandler([0x03, 0x01, 0xFA, 0xAF, 0x00, 0x14, 0x42]);
            });
            it("should extract the temperature of the device", function(done) {
                device.on("temperature1", function(evt) {
                    expect(evt.temperature).toBe(2.0);
                    expect(evt.subtype).toBe(1);
                    done();
                });
                device.tempHandler([0x01, 0x01, 0xFA, 0xAF, 0x00, 0x14, 0x9f]);
            });
            it("should extract the temperature respecting the sign", function(done) {
                device.on("temperature1", function(evt) {
                    expect(evt.temperature).toBe(-2.0);
                    done();
                });
                device.tempHandler([0x01, 0x01, 0xFA, 0xAF, 0x80, 0x14, 0x9f]);
            });
            it("should extract the battery strength correctly", function(done) {
                device.on("temperature1", function(evt) {
                    expect(evt.batteryLevel).toBe(9);
                    expect(evt.subtype).toBe(2);
                    done();
                });
                device.tempHandler([0x02, 0x01, 0xFA, 0xAF, 0x80, 0x14, 0x69]);
            });
            it("should extract the signal strength correctly", function(done) {
                device.on("temperature1", function(evt) {
                    expect(evt.rssi).toBe(6);
                    done();
                });
                device.tempHandler([0x02, 0x01, 0xFA, 0xAF, 0x80, 0x14, 0x69]);
            });
        });

        describe(".humidityHandler", function() {
            let device = {};
            beforeEach(function() {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should extract the id of the device", function(done) {
                device.on("humidity1", function(evt) {
                    expect(evt.id).toBe("0x7700");
                    expect(evt.subtype).toBe(1);
                    done();
                });
                device.humidityHandler([0x01, 0x02, 0x77, 0x00, 0x36, 0x01, 0x89]);
            });
            it("should extract the humidity value", function(done) {
                device.on("humidity1", function(evt) {
                    expect(evt.humidity).toBe(54);
                    done();
                });
                device.humidityHandler([0x01, 0x02, 0x77, 0x00, 0x36, 0x01, 0x89]);
            });
            it("should extract the humidity status", function(done) {
                device.on("humidity1", function(evt) {
                    expect(evt.humidityStatus).toBe(1);
                    done();
                });
                device.humidityHandler([0x01, 0x02, 0x77, 0x00, 0x36, 0x01, 0x89]);
            });
            it("should extract the battery status", function(done) {
                device.on("humidity1", function(evt) {
                    expect(evt.batteryLevel).toBe(9);
                    done();
                });
                device.humidityHandler([0x01, 0x02, 0x77, 0x00, 0x36, 0x01, 0x89]);
            });
            it("should extract the rssi", function(done) {
                device.on("humidity1", function(evt) {
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.humidityHandler([0x01, 0x02, 0x77, 0x00, 0x36, 0x01, 0x89]);
            });
        });

        describe(".temphumidityHandler", function() {
            let device = {};
            beforeEach(function() {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should extract the id of the device", function(done) {
                device.on("temperaturehumidity1", function(evt) {
                    expect(evt.id).toBe("0xAF01");
                    expect(evt.subtype).toBe(3);
                    done();
                });
                device.temphumidityHandler([0x03, 0x04, 0xAF, 0x01, 0x00, 0x90, 0x36, 0x02, 0x59]);
            });
            it("should extract the temperature of the device", function(done) {
                device.on("temperaturehumidity1", function(evt) {
                    expect(evt.temperature).toBe(14.4);
                    done();
                });
                device.temphumidityHandler([0x03, 0x04, 0xAF, 0x01, 0x00, 0x90, 0x36, 0x02, 0x59]);
            });
            it("should extract the temperature respecting the sign", function(done) {
                device.on("temperaturehumidity1", function(evt) {
                    expect(evt.temperature).toBe(-14.4);
                    done();
                });
                device.temphumidityHandler([0x03, 0x04, 0xAF, 0x01, 0x80, 0x90, 0x36, 0x02, 0x59]);
            });
            it("should extract the humidity figure", function(done) {
                device.on("temperaturehumidity1", function(evt) {
                    expect(evt.humidity).toBe(54);
                    done();
                });
                device.temphumidityHandler([0x03, 0x04, 0xAF, 0x01, 0x00, 0x90, 0x36, 0x02, 0x59]);
            });
            it("should extract the humidity status", function(done) {
                device.on("temperaturehumidity1", function(evt) {
                    expect(evt.humidityStatus).toBe(rfxcom.humidity.DRY);
                    done();
                });
                device.temphumidityHandler([0x03, 0x04, 0xAF, 0x01, 0x00, 0x90, 0x36, 0x02, 0x59]);
            });
            it("should extract the battery strength correctly", function(done) {
                device.on("temperaturehumidity1", function(evt) {
                    expect(evt.batteryLevel).toBe(9);
                    done();
                });
                device.temphumidityHandler([0x03, 0x04, 0xAF, 0x01, 0x00, 0x90, 0x36, 0x02, 0x89]);
            });
            it("should extract the signal strength correctly", function(done) {
                device.on("temperaturehumidity1", function(evt) {
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.temphumidityHandler([0x03, 0x04, 0xAF, 0x01, 0x00, 0x90, 0x36, 0x02, 0x89]);
            });
        });

        describe(".temphumbaroHandler", function() {
            let device = {};
            beforeEach(function() {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should extract the id of the device", function(done) {
                device.on("temphumbaro1", function(evt) {
                    expect(evt.id).toBe("0xE900");
                    expect(evt.subtype).toBe(2);
                    done();
                });
                device.temphumbaroHandler([0x02, 0x0E, 0xE9, 0x00, 0x00, 0xC9, 0x27, 0x02, 0x03, 0xE7, 0x04, 0x39]);
            });
            it("should extract the seqnbr of the message", function(done) {
                device.on("temphumbaro1", function(evt) {
                    expect(evt.seqnbr).toBe(14);
                    done();
                });
                device.temphumbaroHandler([0x02, 0x0E, 0xE9, 0x00, 0x00, 0xC9, 0x27, 0x02, 0x03, 0xE7, 0x04, 0x39]);
            });
            it("should extract the temperature of the device", function(done) {
                device.on("temphumbaro1", function(evt) {
                    expect(evt.temperature).toBe(20.1);
                    done();
                });
                device.temphumbaroHandler([0x02, 0x0E, 0xE9, 0x00, 0x00, 0xC9, 0x27, 0x02, 0x03, 0xE7, 0x04, 0x39]);
            });
            it("should extract the temperature respecting the sign", function(done) {
                device.on("temphumbaro1", function(evt) {
                    expect(evt.temperature).toBe(-20.1);
                    done();
                });
                device.temphumbaroHandler([0x02, 0x0E, 0xE9, 0x00, 0x80, 0xC9, 0x27, 0x02, 0x03, 0xE7, 0x04, 0x39]);
            });
            it("should extract the humidity figure", function(done) {
                device.on("temphumbaro1", function(evt) {
                    expect(evt.humidity).toBe(39);
                    done();
                });
                device.temphumbaroHandler([0x01, 0x0E, 0xE9, 0x00, 0x00, 0xC9, 0x27, 0x02, 0x03, 0xE7, 0x04, 0x39]);
            });
            it("should extract the humidity status", function(done) {
                device.on("temphumbaro1", function(evt) {
                    expect(evt.humidityStatus).toBe(rfxcom.humidity.DRY);
                    expect(evt.subtype).toBe(1);
                    done();
                });
                device.temphumbaroHandler([0x01, 0x0E, 0xE9, 0x00, 0x00, 0xC9, 0x27, 0x02, 0x03, 0xE7, 0x04, 0x39]);
            });
            it("should extract the weather forecast", function(done) {
                device.on("temphumbaro1", function(evt) {
                    expect(evt.forecast).toBe(rfxcom.forecast.RAIN);
                    done();
                });
                device.temphumbaroHandler([0x01, 0x0E, 0xE9, 0x00, 0x00, 0xC9, 0x27, 0x02, 0x03, 0xE7, 0x04, 0x39]);
            });
            it("should extract the battery strength correctly", function(done) {
                device.on("temphumbaro1", function(evt) {
                    expect(evt.batteryLevel).toBe(9);
                    done();
                });
                device.temphumbaroHandler([0x02, 0x0E, 0xE9, 0x00, 0x00, 0xC9, 0x27, 0x02, 0x03, 0xE7, 0x04, 0x39]);
            });
            it("should extract the signal strength correctly", function(done) {
                device.on("temphumbaro1", function(evt) {
                    expect(evt.rssi).toBe(3);
                    done();
                });
                device.temphumbaroHandler([0x02, 0x0E, 0xE9, 0x00, 0x00, 0xC9, 0x27, 0x02, 0x03, 0xE7, 0x04, 0x39]);
            });
        });

        describe(".rainHandler", function() {
            let device = {};
            beforeEach(function () {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should extract the id of the device", function(done) {
                device.on("rain1", function(evt) {
                    expect(evt.id).toBe("0xB600");
                    expect(evt.subtype).toBe(2);
                    done();
                });
                device.rainHandler([0x02, 0x17, 0xb6, 0x00, 0x00, 0x00, 0x00, 0x4d, 0x3c, 0x69]);
            });
            it("should extract the total rainfall", function(done) {
                device.on("rain1", function(evt) {
                    expect(evt.rainfall).toBe(1977.2);
                    done();
                });
                device.rainHandler([0x02, 0x17, 0xb6, 0x00, 0x00, 0x00, 0x00, 0x4d, 0x3c, 0x69]);
            });
            it("should not emit a rainfall increment", function(done) {
                device.on("rain1", function(evt) {
                    expect(evt.hasOwnProperty("rainfallIncrement")).toBe(false);
                    done();
                });
                device.rainHandler([0x02, 0x17, 0xb6, 0x00, 0x00, 0x00, 0x00, 0x4d, 0x3c, 0x69]);
            });
            it("should extract the rainfall rate", function(done) {
                device.on("rain1", function(evt) {
                    expect(evt.rainfallRate).toBe(0.0);
                    done();
                });
                device.rainHandler([0x02, 0x17, 0xb6, 0x00, 0x00, 0x00, 0x00, 0x4d, 0x3c, 0x69]);
            });
            it("should extract the battery level", function(done) {
                device.on("rain1", function(evt) {
                    expect(evt.batteryLevel).toBe(9);
                    done();
                });
                device.rainHandler([0x02, 0x17, 0xb6, 0x00, 0x00, 0x00, 0x00, 0x4d, 0x3c, 0x69]);
            });
            it("should extract the signal level", function(done) {
                device.on("rain1", function(evt) {
                    expect(evt.rssi).toBe(6);
                    done();
                });
                device.rainHandler([0x02, 0x17, 0xb6, 0x00, 0x00, 0x00, 0x00, 0x4d, 0x3c, 0x69]);
            });
            it("should extract the rainfall increment", function(done) {
                device.on("rain1", function(evt) {
                    expect(evt.rainfallIncrement).toBe(3.458);
                    expect(evt.subtype).toBe(6);
                    done();
                });
                device.rainHandler([0x06, 0x17, 0xb6, 0x00, 0x00, 0x00, 0x00, 0x4d, 0x0d, 0x69]);
            });
            it("should not emit a total rainfall", function(done) {
                device.on("rain1", function(evt) {
                    expect(evt.hasOwnProperty("rainfall")).toBe(false);
                    done();
                });
                device.rainHandler([0x06, 0x17, 0xb6, 0x00, 0x00, 0x00, 0x00, 0x4d, 0x0d, 0x69]);
            });
            it("should extract the rainfall rate", function(done) {
                device.on("rain1", function(evt) {
                    expect(evt.rainfallRate).toBe(289.0);
                    expect(evt.subtype).toBe(1);
                    done();
                });
                device.rainHandler([0x01, 0x17, 0xb6, 0x00, 0x01, 0x21, 0x00, 0x4d, 0x3c, 0x69]);
            });
            it("should extract the rainfall rate", function(done) {
                device.on("rain1", function(evt) {
                    expect(evt.rainfallRate).toBe(2.89);
                    done();
                });
                device.rainHandler([0x02, 0x17, 0xb6, 0x00, 0x01, 0x21, 0x00, 0x4d, 0x3c, 0x69]);
            });
            it("should extract the battery level correctly", function(done) {
                device.on("rain1", function(evt) {
                    expect(evt.batteryLevel).toBe(9);
                    done();
                });
                device.rainHandler([0x02, 0x17, 0xb6, 0x00, 0x01, 0x21, 0x00, 0x4d, 0x3c, 0x69]);
            });
            it("should extract the signal strength correctly", function(done) {
                device.on("rain1", function(evt) {
                    expect(evt.rssi).toBe(6);
                    done();
                });
                device.rainHandler([0x02, 0x17, 0xb6, 0x00, 0x01, 0x21, 0x00, 0x4d, 0x3c, 0x69]);
            });
        });

        describe(".windHandler", function() {
            let device = {};
            beforeEach(function () {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should extract the id of the device", function (done) {
                device.on("wind1", function (evt) {
                    expect(evt.id).toBe("0x2F00");
                    expect(evt.subtype).toBe(1);
                    done();
                });
                device.windHandler([0x01, 0x12, 0x2f, 0x00, 0x00, 0x87, 0x00, 0x00, 0x00, 0x14,
                    0x00, 0x49, 0x00, 0x00, 0x79]);
            });
            it("should extract the wind direction", function (done) {
                device.on("wind1", function (evt) {
                    expect(evt.direction).toBe(135);
                    done();
                });
                device.windHandler([0x01, 0x12, 0x2f, 0x00, 0x00, 0x87, 0x00, 0x00, 0x00, 0x14,
                    0x00, 0x49, 0x00, 0x00, 0x79]);
            });
            it("should extract the average wind speed", function (done) {
                device.on("wind1", function (evt) {
                    expect(evt.averageSpeed).toBe(0.0);
                    done();
                });
                device.windHandler([0x01, 0x12, 0x2f, 0x00, 0x00, 0x87, 0x00, 0x00, 0x00, 0x14,
                    0x00, 0x49, 0x00, 0x00, 0x79]);
            });
            it("should extract the gust speed", function (done) {
                device.on("wind1", function (evt) {
                    expect(evt.gustSpeed).toBe(2.0);
                    done();
                });
                device.windHandler([0x01, 0x12, 0x2f, 0x00, 0x00, 0x87, 0x00, 0x00, 0x00, 0x14,
                    0x00, 0x49, 0x00, 0x00, 0x79]);
            });
            it("should not provide temperature or windchill with a subtype 1 sensor", function (done) {
                device.on("wind1", function (evt) {
                    expect(evt.hasOwnProperty("temperature")).toBe(false);
                    expect(evt.hasOwnProperty("chillfactor")).toBe(false);
                    done();
                });
                device.windHandler([0x01, 0x12, 0x2f, 0x00, 0x00, 0x87, 0x00, 0x00, 0x00, 0x14,
                    0x00, 0x49, 0x00, 0x00, 0x79]);
            });
            it("should extract the windchill", function (done) {
                device.on("wind1", function (evt) {
                    expect(evt.chillfactor).toBe(1.0);
                    expect(evt.subtype).toBe(4);
                    done();
                });
                device.windHandler([0x04, 0x12, 0x2f, 0x00, 0x00, 0x87, 0x00, 0x00, 0x00, 0x14,
                    0x00, 0x49, 0x00, 0x0a, 0x79]);
            });
            it("should extract a negative windchill correctly", function (done) {
                device.on("wind1", function (evt) {
                    expect(evt.chillfactor).toBe(-31.4);
                    done();
                });
                device.windHandler([0x04, 0x12, 0x2f, 0x00, 0x00, 0x87, 0x00, 0x00, 0x00, 0x14,
                    0x00, 0x49, 0x81, 0x3a, 0x79]);
            });
            it("should extract the temperature", function (done) {
                device.on("wind1", function (evt) {
                    expect(evt.temperature).toBe(7.3);
                    done();
                });
                device.windHandler([0x04, 0x12, 0x2f, 0x00, 0x00, 0x87, 0x00, 0x00, 0x00, 0x14,
                    0x00, 0x49, 0x00, 0x0a, 0x79]);
            });
            it("should extract a negative temperature correctly", function (done) {
                device.on("wind1", function (evt) {
                    expect(evt.temperature).toBe(-7.3);
                    done();
                });
                device.windHandler([0x04, 0x12, 0x2f, 0x00, 0x00, 0x87, 0x00, 0x00, 0x00, 0x14,
                    0x80, 0x49, 0x81, 0x3a, 0x79]);
            });
            it("should extract the wind speed from a subtype 5 sensor", function (done) {
                device.on("wind1", function (evt) {
                    expect(evt.gustSpeed).toBe(2.0);
                    expect(evt.hasOwnProperty("averageSpeed")).toBe(false);
                    expect(evt.subtype).toBe(5);
                    done();
                });
                device.windHandler([0x05, 0x12, 0x2f, 0x00, 0x00, 0x87, 0x00, 0x00, 0x00, 0x14,
                    0x00, 0x49, 0x00, 0x00, 0x79]);
            });
            it("should extract the battery level correctly", function(done) {
                device.on("wind1", function(evt) {
                    expect(evt.batteryLevel).toBe(9);
                    done();
                });
                device.windHandler([0x01, 0x12, 0x2f, 0x00, 0x00, 0x87, 0x00, 0x00, 0x00, 0x14,
                    0x00, 0x49, 0x00, 0x00, 0x79]);
            });
            it("should extract the signal strength correctly", function(done) {
                device.on("wind1", function(evt) {
                    expect(evt.rssi).toBe(7);
                    done();
                });
                device.windHandler([0x01, 0x12, 0x2f, 0x00, 0x00, 0x87, 0x00, 0x00, 0x00, 0x14,
                    0x00, 0x49, 0x00, 0x00, 0x79]);
            });
        });

        describe(".uvHandler", function() {
            let device = {};
            beforeEach(function () {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should extract the id of the device", function (done) {
                device.on("uv1", function (evt) {
                    expect(evt.id).toBe("0xF1D0");
                    expect(evt.subtype).toBe(1);
                    done();
                });
                device.uvHandler([0x01, 0x13, 0xf1, 0xd0, 0x0a, 0x00, 0xc8, 0x79]);
            });
            it("should extract the uv index", function (done) {
                device.on("uv1", function (evt) {
                    expect(evt.uv).toBe(1.0);
                    done();
                });
                device.uvHandler([0x01, 0x13, 0xf1, 0xd0, 0x0a, 0x00, 0xc8, 0x79]);
            });
            it("should extract the temperature", function (done) {
                device.on("uv1", function (evt) {
                    expect(evt.temperature).toBe(20.0);
                    done();
                });
                device.uvHandler([0x01, 0x13, 0xf1, 0xd0, 0x0a, 0x00, 0xc8, 0x79]);
            });
            it("should extract a negative temperature", function (done) {
                device.on("uv1", function (evt) {
                    expect(evt.temperature).toBe(-5.0);
                    done();
                });
                device.uvHandler([0x01, 0x13, 0xf1, 0xd0, 0x0a, 0x80, 0x32, 0x79]);
            });
            it("should extract the battery level correctly", function(done) {
                device.on("uv1", function(evt) {
                    expect(evt.batteryLevel).toBe(9);
                    done();
                });
                device.uvHandler([0x01, 0x13, 0xf1, 0xd0, 0x0a, 0x80, 0x32, 0x79]);
            });
            it("should extract the signal strength correctly", function(done) {
                device.on("uv1", function(evt) {
                    expect(evt.rssi).toBe(7);
                    done();
                });
                device.uvHandler([0x01, 0x13, 0xf1, 0xd0, 0x0a, 0x80, 0x32, 0x79]);
            });
        });

        describe(".elec1Handler", function () {
            it("should emit an elec1 message when called with subtype CM113", function (done) {
                const device = new rfxcom.RfxCom("/dev/ttyUSB0");
                device.on("elec1", function (evt) {
                    expect(evt.subtype).toBe(1);
                    expect(evt.id).toBe("0x8600");
                    expect(evt.count).toBe(4);
                    expect(evt.current[0]).toBeCloseTo(2.9, 11);
                    expect(evt.current[1]).toBeCloseTo(0.0, 11);
                    expect(evt.current[2]).toBeCloseTo(0.0, 11);
                    expect(evt.rssi).toBe(4);
                    expect(evt.batteryLevel).toBe(9);
                    done();
                });
                device.elec1Handler([0x01, 0x0F, 0x86, 0x00, 0x04, 0x00, 0x1D, 0x00, 0x00, 0x00, 0x00, 0x49]);
            })
        });

        describe(".elec23Handler", function () {
            it("should emit an elec23 message when called with subtype CM119_160", function (done) {
                const device = new rfxcom.RfxCom("/dev/ttyUSB0");
                device.on("elec23", function (evt) {
                    expect(evt.subtype).toBe(1);
                    expect(evt.id).toBe("0x1A73");
                    expect(evt.count).toBe(0);
                    expect(evt.power).toBe(1014);
                    expect(evt.energy).toBeCloseTo(60.7110602416, 10);
                    expect(evt.rssi).toBe(8);
                    expect(evt.batteryLevel).toBe(9);
                    done();
                });
                device.elec23Handler([0x01, 0x07, 0x1A, 0x73, 0x00, 0x00, 0x00, 0x03, 0xF6, 0x00, 0x00, 0x00, 0x00, 0x35, 0x0B, 0x89]);
            });
            it("should emit an elec23 message when called with subtype CM180", function (done) {
                const device = new rfxcom.RfxCom("/dev/ttyUSB0");
                device.on("elec23", function (evt) {
                    expect(evt.subtype).toBe(2);
                    expect(evt.id).toBe("0xA412");
                    expect(evt.power).toBe(370);
                    expect(evt.energy).toBeCloseTo(30226.3151306, 6);
                    expect(evt.rssi).toBe(7);
                    expect(evt.batteryLevel).toBe(9);
                    done();
                });
                device.elec23Handler([0x02, 0x00, 0xA4, 0x12, 0x00, 0x00, 0x00, 0x01, 0x72, 0x00, 0x00, 0x00, 0x67, 0x28, 0x97, 0x79]);
            });
            it("should not include an energy reading when called with subtype CM180 and count != 0", function (done) {
                const device = new rfxcom.RfxCom("/dev/ttyUSB0");
                device.on("elec23", function (evt) {
                    expect(evt.subtype).toBe(2);
                    expect(evt.id).toBe("0xA412");
                    expect(evt.power).toBe(370);
                    expect(evt.energy).toBeUndefined();
                    expect(evt.rssi).toBe(7);
                    expect(evt.batteryLevel).toBe(9);
                    done();
                });
                device.elec23Handler([0x02, 0x01, 0xA4, 0x12, 0x01, 0x00, 0x00, 0x01, 0x72, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x79]);
            });

        });

        describe(".elec4Handler", function () {
            it("should emit an elec4 message when called with subtype CM180I", function (done) {
                const device = new rfxcom.RfxCom("/dev/ttyUSB0");
                device.on("elec4", function (evt) {
                    expect(evt.subtype).toBe(1);
                    expect(evt.id).toBe("0xB800");
                    expect(evt.seqnbr).toBe(6);
                    expect(evt.count).toBe(0);
                    expect(evt.current[0]).toBeCloseTo(2.2, 11);
                    expect(evt.current[1]).toBeCloseTo(0.0, 11);
                    expect(evt.current[2]).toBeCloseTo(0.0, 11);
                    expect(evt.energy).toBeCloseTo(32547.4233902, 7);
                    expect(evt.rssi).toBe(8);
                    expect(evt.batteryLevel).toBe(9);
                    done();
                });
                device.elec4Handler([0x01, 0x06, 0xB8, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x6F, 0x14, 0x88, 0x89]);
            });
            it("should not include an energy reading when called with subtype CM180I and count != 0", function (done) {
                const device = new rfxcom.RfxCom("/dev/ttyUSB0");
                device.on("elec4", function (evt) {
                    expect(evt.subtype).toBe(1);
                    expect(evt.id).toBe("0xB800");
                    expect(evt.seqnbr).toBe(79);
                    expect(evt.count).toBe(2);
                    expect(evt.current[0]).toBeCloseTo(2.9, 11);
                    expect(evt.current[1]).toBeCloseTo(0.0, 11);
                    expect(evt.current[2]).toBeCloseTo(0.0, 11);
                    expect(evt.energy).toBeUndefined();
                    expect(evt.rssi).toBe(7);
                    expect(evt.batteryLevel).toBe(9);
                    done();
                });
                device.elec4Handler([0x01, 0x4F, 0xB8, 0x00, 0x02, 0x00, 0x1D, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x79]);
            });
        });

        describe(".elec5Handler", function () {
            it("should emit an elec message when called with subtype REVOLT", function (done) {
                const device = new rfxcom.RfxCom("/dev/ttyUSB0");
                device.on("elec5", function (evt) {
                    expect(evt.subtype).toBe(1);
                    expect(evt.id).toBe("0x002D");
                    expect(evt.seqnbr).toBe(3);
                    expect(evt.voltage).toBe(228.0);
                    expect(evt.current).toBe(0.0);
                    expect(evt.power).toBe(0.0);
                    expect(evt.energy).toBe(30);
                    expect(evt.powerFactor).toBe(0);
                    expect(evt.frequency).toBe(50);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.elec5Handler([0x01, 0x03, 0x00, 0x2D, 0xE4, 0x00, 0x00, 0x00, 0x00, 0x00, 0x03, 0x00, 0x32, 0x80]);
            });
            it("should emit an elec message when called with subtype REVOLT", function (done) {
                const device = new rfxcom.RfxCom("/dev/ttyUSB0");
                device.on("elec5", function (evt) {
                    expect(evt.subtype).toBe(1);
                    expect(evt.id).toBe("0x002D");
                    expect(evt.seqnbr).toBe(4);
                    expect(evt.voltage).toBe(228.0);
                    expect(evt.current).toBe(0.02);
                    expect(evt.power).toBe(4.7);
                    expect(evt.energy).toBe(30);
                    expect(evt.powerFactor).toBe(1);
                    expect(evt.frequency).toBe(50);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.elec5Handler([0x01, 0x04, 0x00, 0x2D, 0xE4, 0x00, 0x02, 0x00, 0x2F, 0x00, 0x03, 0x64, 0x32, 0x80]);
            });
            it("should emit an elec message when called with subtype REVOLT", function (done) {
                const device = new rfxcom.RfxCom("/dev/ttyUSB0");
                device.on("elec5", function (evt) {
                    expect(evt.subtype).toBe(1);
                    expect(evt.id).toBe("0x002D");
                    expect(evt.seqnbr).toBe(5);
                    expect(evt.voltage).toBe(227.0);
                    expect(evt.current).toBe(0.2);
                    expect(evt.power).toBe(44.5);
                    expect(evt.energy).toBe(30);
                    expect(evt.powerFactor).toBe(1);
                    expect(evt.frequency).toBe(50);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.elec5Handler([0x01, 0x05, 0x00, 0x2D, 0xE3, 0x00, 0x14, 0x01, 0xBD, 0x00, 0x03, 0x64, 0x32, 0x80]);
            });
            it("should emit an elec message when called with subtype REVOLT", function (done) {
                const device = new rfxcom.RfxCom("/dev/ttyUSB0");
                device.on("elec5", function (evt) {
                    expect(evt.subtype).toBe(1);
                    expect(evt.id).toBe("0x002D");
                    expect(evt.seqnbr).toBe(6);
                    expect(evt.voltage).toBe(227.0);
                    expect(evt.current).toBe(0.05);
                    expect(evt.power).toBe(8.7);
                    expect(evt.energy).toBe(30);
                    expect(evt.powerFactor).toBe(0.77);
                    expect(evt.frequency).toBe(50);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.elec5Handler([0x01, 0x06, 0x00, 0x2D, 0xE3, 0x00, 0x05, 0x00, 0x57, 0x00, 0x03, 0x4D, 0x32, 0x80]);
            });
        });

        describe("cartelectronicHandler", function () {
            let device = {};
            beforeEach(function() {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should emit a cartelectronic message when called with a CARTELECTRONIC_TIC subtype", function(done) {
                device.on("cartelectronic", function(evt) {
                    expect(evt.subtype).toBe(rfxcom.cartelectronic.CARTELECTRONIC_TIC);
                    expect(evt.seqnbr).toBe(0);
                    expect(evt.id).toBe("0x123456789A");
                    expect(evt.contractType).toBe(1);
                    expect(evt.counter).toEqual([0x12345678, 0x12345678]);
                    expect(evt.PAPP).toBe(1882.0);
                    expect(evt.validPAPP).toBe(true);
                    expect(evt.PEJP).toBe("Blue");
                    expect(evt.validTIC).toBe(true);
                    expect(evt.rssi).toBe(7);
                    expect(evt.batteryLevel).toBe(9);
                    done();
                });
                device.cartelectronicHandler([0x01, 0x00, 0x12, 0x34, 0x56, 0x78, 0x9a,
                    0x01, 0x12, 0x34, 0x56, 0x78, 0x12, 0x34, 0x56, 0x78, 0x07, 0x5a, 0x12, 0x79]);
            });
            it("should emit a cartelectronic message when called with a CARTELECTRONIC_ENCODER subtype", function(done) {
                device.on("cartelectronic", function(evt) {
                    expect(evt.subtype).toBe(rfxcom.cartelectronic.CARTELECTRONIC_ENCODER);
                    expect(evt.seqnbr).toBe(0);
                    expect(evt.id).toBe("0x12345678");
                    expect(evt.counter).toEqual([0x12345678, 0x12345678]);
                    expect(evt.rssi).toBe(7);
                    expect(evt.batteryLevel).toBe(9);
                    done();
                });
                device.cartelectronicHandler([0x02, 0x00, 0x12, 0x34, 0x56, 0x78,
                    0x12, 0x34, 0x56, 0x78, 0x12, 0x34, 0x56, 0x78, 0x12, 0x79]);
            });

        });
        describe(".rfxsensorHandler", function() {
            let device = {};
            beforeEach(function() {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should emit a rfxsensor message when called with sensor subtype 0 data", function(done) {
                device.on("rfxsensor", function(evt) {
                    expect(evt.subtype).toBe(rfxcom.rfxsensor.TEMP);
                    expect(evt.seqnbr).toBe(233);
                    expect(evt.id).toBe("0x28");
                    expect(evt.message).toBe(7.37);
                    expect(evt.rssi).toBe(7);
                    done();
                });
                device.rfxsensorHandler([0x00, 0xE9, 0x28, 0x02, 0xE1, 0x70]);
            });
            it("should interpret the signbit in subtype 0 data", function(done) {
                device.on("rfxsensor", function(evt) {
                    expect(evt.subtype).toBe(rfxcom.rfxsensor.TEMP);
                    expect(evt.seqnbr).toBe(2);
                    expect(evt.id).toBe("0x08");
                    expect(evt.message).toBe(-1.5);
                    expect(evt.rssi).toBe(5);
                    done();
                });
                device.rfxsensorHandler([0x00, 0x02, 0x08, 0x80, 0x96, 0x50]);
            });
            it("should emit a rfxsensor message when called with sensor subtype 2 data", function(done) {
                device.on("rfxsensor", function(evt) {
                    expect(evt.subtype).toBe(rfxcom.rfxsensor.VOLTAGE);
                    expect(evt.seqnbr).toBe(234);
                    expect(evt.id).toBe("0x28");
                    expect(evt.message).toBe(472);
                    expect(evt.rssi).toBe(7);
                    done();
                });
                device.rfxsensorHandler([0x02, 0xEA, 0x28, 0x01, 0xD8, 0x70]);
            });
            it("should emit a rfxsensor message when called with sensor subtype 1 data", function(done) {
                device.on("rfxsensor", function(evt) {
                    expect(evt.subtype).toBe(rfxcom.rfxsensor.AD);
                    expect(evt.seqnbr).toBe(235);
                    expect(evt.id).toBe("0x28");
                    expect(evt.message).toBe(385);
                    expect(evt.rssi).toBe(7);
                    done();
                });
                device.rfxsensorHandler([0x01, 0xEB, 0x28, 0x01, 0x81, 0x70]);
            });
        });

        describe(".rfxmeterHandler", function() {
            let device = {};
            beforeEach(function() {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should emit a rfxmeter message when called", function(done) {
                device.on("rfxmeter", function(evt) {
                    expect(evt.subtype).toBe(0x00);
                    expect(evt.seqnbr).toBe(55);
                    expect(evt.counter).toBe(9069671);
                    done();
                });
                device.rfxmeterHandler([0x00, 0x37, 0x08, 0xF8, 0x00, 0x8A, 0x64, 0x67, 0x70]);
            });
        });

        describe(".weightHandler", function() {
            let device = {};
            beforeEach(function() {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should emit a weight message when called", function(done) {
                device.on("weight1", function(evt) {
                    expect(evt.subtype).toBe(0x01);
                    expect(evt.seqnbr).toBe(0xF5);
                    expect(evt.weight).toBe(83.2);
                    expect(evt.id).toBe("0x0007");
                    expect(evt.batteryLevel).toBe(3);
                    expect(evt.rssi).toBe(9);
                    done();
                });
                device.weightHandler([0x01, 0xF5, 0x00, 0x07, 0x03, 0x40, 0x39]);
            });
        });

    });
});
