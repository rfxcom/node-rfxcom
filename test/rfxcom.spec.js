/* global require: false, describe: false, module */
var rfxcom = require('../lib'),
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
            it("should emit a response message when it receives message type 0x02", function(done) {
                var fakeSerialPort = new FakeSerialPort(),
                        device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("response", function () {
                    done();
                });
                device.open();
                fakeSerialPort.emit("data", [0x04, 0x02, 0x01, 0x00, 0x00]);
            });
            it("should emit a status message when it receives message type 0x01", function(done) {
                var fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("status", function() {
                    done();
                });
                device.open();
                fakeSerialPort.emit("data", [0x0D, 0x01, 0x00, 0x01, 0x02, 0x53, 0x30, 0x00, 0x02, 0x21, 0x01, 0x00, 0x00, 0x00]);
            });
            it("should emit a lighting4 message when it receives message type 0x13", function (done) {
                var fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("lighting4", function () {
                    done();
                });
                device.open();
                fakeSerialPort.emit("data", [0x09, 0x13, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x12, 0x00]);
            });
            it("should emit a lighting5 message when it receives message type 0x14", function(done) {
                var fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("lighting5", function() {
                    done();
                });
                device.open();
                fakeSerialPort.emit("data", [0x0A, 0x14, 0x00, 0x01, 0xF0, 0x9A, 0xC7, 0x02, 0x00, 0x00, 0x80]);
            });
            it("should emit a lighting6 message when it receives message type 0x15", function (done) {
                var fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("lighting6", function () {
                    done();
                });
                device.open();
                fakeSerialPort.emit("data", [0x0b, 0x15, 0x00, 0x00, 0xF0, 0x9A, 0x42, 0x00, 0x03, 0x00, 0x00, 0x00]);
            });
            it("should emit an elec2 message when it receives message type 0x5a", function (done) {
                var fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("elec2", function() {
                    done();
                });
                device.open();
                fakeSerialPort.emit("data", [0x11, 0x5a, 0x01, 0x00, 0x00, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
            });
            it("should emit a security1 message when it receives message type 0x20", function(done) {
                var fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("security1", function() {
                    done();
                });
                device.open();
                fakeSerialPort.emit("data", [0x08, 0x20, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
            });
            it("should emit a temp1 message when it receives message type 0x50, with device type 1", function(done) {
                var fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("temp1", function() {
                    done();
                });
                device.open();
                fakeSerialPort.emit("data", [0x08, 0x50, 0x01, 0x01, 0xFA, 0xAF, 0x80, 0x14, 0x42]);
            });
            it("should emit a temp2 message when it receives message type 0x50, with device type 2", function(done) {
                var fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("temp2", function() {
                    done();
                });
                device.open();
                fakeSerialPort.emit("data", [0x08, 0x50, 0x02, 0x01, 0xFA, 0xAF, 0x80, 0x14, 0x42]);
            });
            it("should emit a th1 message when it receives message type 0x52, with device type 1", function(done) {
                var fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("th1", function() {
                    done();
                });
                device.open();
                fakeSerialPort.emit("data", [0x0A, 0x52, 0x01, 0x04, 0xAF, 0x01, 0x00, 0x90, 0x36, 0x02, 0x59]);
            });
            it("should emit a lighting2 message when it receives message type 0x11", function(done) {
                var fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("lighting2", function() {
                    done();
                });
                device.open();
                fakeSerialPort.emit("data", [0x0B, 0x11, 0x01, 0x00, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x0F, 0x0F]);
            });
            it("should emit an rfxmeter message when it receives message type 0x71", function(done) {
                var fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("rfxmeter", function() {
                    done();
                });
                device.open();
                fakeSerialPort.emit("data", [0x0A, 0x71, 0x00, 0x37, 0x08, 0xF8, 0x00, 0x8A, 0x64, 0x67, 0x70]);
            });
            it("should emit a thb2 message when it receives message type 0x54", function(done) {
                var fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("thb2", function() {
                    done();
                });
                device.open();
                fakeSerialPort.emit("data", [0x0D, 0x54, 0x02, 0x0E, 0xE9, 0x00, 0x00, 0xC9, 0x27, 0x02, 0x03, 0xE7, 0x04, 0x39]);
            });
            it("should emit a weight1 message when it receives message type 0x5D", function(done) {
                var fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("weight1", function() {
                    done();
                });
                device.open();
                fakeSerialPort.emit("data", [0x08, 0x5D, 0x01, 0xF5, 0x00, 0x07, 0x03, 0x40, 0x40]);
            });
            it("should emit an rfxsensor message when it receives message type 0x70", function(done) {
                var fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("rfxsensor", function() {
                    done();
                });
                device.open();
                fakeSerialPort.emit("data", [0x07, 0x70, 0x00, 0xE9, 0x28, 0x02, 0xE1, 0x70]);
            });
            it("should emit a receive message when it receives a message", function(done) {
                var fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/", {
                        port: fakeSerialPort
                    });
                device.on("receive", function() {
                    done();
                });
                device.open();
                fakeSerialPort.emit("data", [0x01]);
            });
        });

        describe(".initialise function", function () {
            it("should emit a 'connectfailed' event if the serial port device file does not exist", function (done) {
                var fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/dev/tty-i-dont-exist", {
                        port: fakeSerialPort
                    });
                device.on("connectfailed", function () {
                    done();
                });
                device.open();
                fakeSerialPort.emit("error", "connectfailed\n");
            });
            it("should prepare the device for use.", function(done) {
                var fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/dev/ttyUSB0", {
                        port: fakeSerialPort
                    }),
                    resetSpy = spyOn(device, "reset").andCallThrough(),
                    delaySpy = spyOn(device, "delay"),
                    flushSpy = spyOn(device, "flush").andCallThrough(),
                    startRxSpy = spyOn(device, "startRx").andCallThrough(),
                    getStatusSpy = spyOn(device, "getStatus").andCallFake(function () {
                        device.statusHandler([0x00,0x01,0x02,0x53,0x5E,0x08,0x02,0x25,0x00,0x01,0x01,0x1C])
                    }),
                    openSpy = spyOn(device, "open").andCallFake(function() {
                        device.emit("ready");
                    });

                var handler = function() {
                    done();
                };
                device.initialise(handler);
                expect(resetSpy).toHaveBeenCalled();
                expect(delaySpy).toHaveBeenCalledWith(500);
                expect(flushSpy).toHaveBeenCalledWith(jasmine.any(Function));
                expect(getStatusSpy).toHaveBeenCalledWith(jasmine.any(Function));
                expect(startRxSpy).toHaveBeenCalledWith(jasmine.any(Function));
                expect(openSpy).toHaveBeenCalled();
            });
        });

        describe(".bytesToUint48", function() {
            it("should convert a sequence of 6 bytes to a longint", function() {
                var device = new rfxcom.RfxCom("/dev/ttyUSB0");
                expect(device.bytesToUint48([0xF1, 0x27, 0xba, 0x67, 0x28, 0x97])).toBe(265152933341335);
            });
        });

        describe(".bytesToUint32", function() {
            it("should convert a sequence of 4 bytes to a longint", function() {
                var device = new rfxcom.RfxCom("/dev/ttyUSB0");
                expect(device.bytesToUint32([0xFF, 0x76, 0x21, 0x72])).toBe(4285931890);
            });
        });

        describe(".dumpHex", function() {
            it("should convert a sequence of bytes to a string of hex numbers with a prefix if one is supplied", function() {
                var device = new rfxcom.RfxCom("/dev/ttyUSB0");
                expect(device.dumpHex([0x00, 0x00, 0x01, 0x72], "0x").toString()).toBe("0x00,0x00,0x01,0x72");
            });
            it("should convert a sequence of bytes to a string of hex numbers with no prefix if none supplied", function() {
                var device = new rfxcom.RfxCom("/dev/ttyUSB0");
                expect(device.dumpHex([0x00, 0x00, 0x01, 0x72]).toString()).toBe("00,00,01,72");
            });
        });

        describe(".stringToBytes", function() {
            it("should convert a sequence of characters to an array of bytes", function() {
                var device = new rfxcom.RfxCom("/dev/ttyUSB0");
                expect(device.stringToBytes("203052").bytes.toString()).toBe([32, 48, 82].toString());
            });
            it("should convert a sequence of characters to hex value", function () {
                var device = new rfxcom.RfxCom("/dev/ttyUSB0");
                expect(device.stringToBytes("203052").value).toBe(0x203052);
            });
            it("should ignore leading 0x on a string", function() {
                var device = new rfxcom.RfxCom("/dev/ttyUSB0");
                expect(device.stringToBytes("0x203052").bytes.toString()).toBe([32, 48, 82].toString());
            });
        });

        describe(".messageHandler", function() {
            it("should emit an response message when called", function(done) {
                var device = new rfxcom.RfxCom("/dev/ttyUSB0");
                device.on("response", function(message, seqnbr) {
                    expect(message).toBe("ACK - transmit OK");
                    expect(seqnbr).toBe(3);
                    done();
                });
                device.messageHandler([0x00, 0x03, 0x00]);
            });
        });

        describe(".flush", function() {
            it("should flush the underlying serialport", function(done) {
                var fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/dev/ttyUSB0", {
                        port: fakeSerialPort
                    });
                device.flush(function() {
                    expect(fakeSerialPort.flushed).toBeTruthy();
                    done();
                });
            });
        });

        describe(".reset", function() {
            it("should send the correct bytes to the serialport", function(done) {
                var fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/dev/ttyUSB0", {
                        port: fakeSerialPort
                    });
                device.reset(function() {
                    done();
                });
                expect(fakeSerialPort).toHaveSent([13, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
            });
        });

        describe(".getStatus", function() {
            it("should send the correct bytes to the serialport", function(done) {
                var fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/dev/ttyUSB0", {
                        port: fakeSerialPort
                    });
                device.getStatus(function() {
                    done();
                });
                expect(fakeSerialPort).toHaveSent([13, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
            });
        });

        describe(".enable", function() {
            it("should send the correct bytes to the serialport", function(done) {
                var fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/dev/ttyUSB0", {
                        port: fakeSerialPort
                    });
                device.enable([protocols.LACROSSE, protocols.OREGON, protocols.AC, protocols.ARC, protocols.X10], function() {
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0D, 0x00, 0x00, 0x00, 0x03, 0x53, 0x00, 0x00, 0x08, 0x27, 0x0, 0x0, 0x0, 0x0]);
            });

            it("should send the correct bytes to the serialport for a single protocol", function(done) {
                var fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/dev/ttyUSB0", {
                        port: fakeSerialPort
                    });
                device.enable(protocols.LIGHTWAVERF, function() {
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0D, 0x00, 0x00, 0x00, 0x03, 0x53, 0x00, 0x00, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00]);
            });
        });

        describe(".save", function() {
            it("should send the correct bytes to the serialport", function(done) {
                var fakeSerialPort = new FakeSerialPort(),
                    device = new rfxcom.RfxCom("/dev/ttyUSB0", {
                        port: fakeSerialPort
                    });
                device.save(function() {
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0D, 0x00, 0x00, 0x00, 0x06, 0x00, 0x00, 0x00, 0x00, 0x00, 0x0, 0x00, 0x00, 0x00]);
            });
        });

        describe(".elec1Handler", function () {
            it("should emit an elec1 message when called with subtype CM113", function (done) {
                var device = new rfxcom.RfxCom("/dev/ttyUSB0");
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
                var device = new rfxcom.RfxCom("/dev/ttyUSB0");
                device.on("elec2", function (evt) {
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
                var device = new rfxcom.RfxCom("/dev/ttyUSB0");
                device.on("elec3", function (evt) {
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
                var device = new rfxcom.RfxCom("/dev/ttyUSB0");
                device.on("elec3", function (evt) {
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
                var device = new rfxcom.RfxCom("/dev/ttyUSB0");
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
                var device = new rfxcom.RfxCom("/dev/ttyUSB0");
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
                var device = new rfxcom.RfxCom("/dev/ttyUSB0");
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
                var device = new rfxcom.RfxCom("/dev/ttyUSB0");
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
                var device = new rfxcom.RfxCom("/dev/ttyUSB0");
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
                var device = new rfxcom.RfxCom("/dev/ttyUSB0");
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

        describe(".lighting5Handler", function() {
            var device;
            beforeEach(function() {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should emit a lighting5 message when called", function(done) {
                device.on("lighting5", function(evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.id).toBe("0xF09AC7");
                    expect(evt.unitcode).toBe(1);
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

        describe(".lighting1Handler", function() {
            var device;
            beforeEach(function() {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should emit a lighting1 message when called", function(done) {
                device.on("lighting1", function(evt) {
                    expect(evt.subtype).toBe(1);
                    expect(evt.seqnbr).toBe(1);
                    expect(evt.housecode).toBe("D");
                    expect(evt.unitcode).toBe(2);
                    expect(evt.command).toBe("On");
                    expect(evt.commandNumber).toBe(1);
                    expect(evt.rssi).toBe(7);
                    expect(evt.id).toBe("0x4402");
                    done();
                });
                device.lighting1Handler([0x01, 0x01, 0x44, 0x02, 0x01, 0x70]);
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
                    expect(evt.housecode).toBe("C");
                    expect(evt.unitcode).toBe(5);
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
            var device;
            beforeEach(function() {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should emit a lighting2 message when called", function(done) {
                device.on("lighting2", function(evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.seqnbr).toBe(1);
                    expect(evt.id).toBe("0x039AC7A1");
                    expect(evt.unitcode).toBe(1);
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
            var device;
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

        describe(".lighting6Handler", function() {
            var device;
            beforeEach(function() {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should emit a lighting6 message when called", function(done) {
                device.on("lighting6", function(evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.id).toBe("0xF09A");
                    expect(evt.groupcode).toBe("K");
                    expect(evt.unitcode).toBe(4);
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

        describe(".chime1Handler", function () {
            var device;
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
                device.chime1Handler([0x00, 0x01, 0x00, 0x9A, 0x03, 0x10]);
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
                device.chime1Handler([0x02, 0x02, 0x03, 0xFF, 0xFF, 0x20]);
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
                device.chime1Handler([0x04, 0x04, 0xFF, 0xFF, 0xFF, 0x80]);
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
                device.chime1Handler([0x01, 0x05, 0x11, 0x5F, 0x54, 0x40]);
            });

        });

        describe(".blinds1Handler", function () {
            var device;
            beforeEach(function () {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should handle BLINDS_T0 devices open event", function(done) {
                device.on("blinds1", function(evt) {
                    expect(evt.subtype).toBe(0);
                    expect(evt.id).toBe("0x1234");
                    expect(evt.unitcode).toBe(5);
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
                    expect(evt.unitcode).toBe(5);
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
                    expect(evt.unitcode).toBe(5);
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
                    expect(evt.unitcode).toBe(5);
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
                    expect(evt.unitcode).toBe(5);
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
                    expect(evt.unitcode).toBe(5);
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
                    expect(evt.unitcode).toBe(5);
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
                    expect(evt.unitcode).toBe(1);
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
                    expect(evt.unitcode).toBe(5);
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
                    expect(evt.unitcode).toBe(0);
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
                    expect(evt.unitcode).toBe(1);
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
                    expect(evt.unitcode).toBe(1);
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
                    expect(evt.unitcode).toBe(1);
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
                    expect(evt.unitcode).toBe(1);
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
                    expect(evt.unitcode).toBe(1);
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
                    expect(evt.unitcode).toBe(1);
                    expect(evt.command).toBe("Open");
                    expect(evt.commandNumber).toBe(0);
                    expect(evt.seqnbr).toBe(5);
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.blinds1Handler([0x0b, 0x05, 0x00, 0x12, 0x34, 0x00, 0x00, 0x80]);
            });
        });

        describe(".security1Handler", function() {
            var device;
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

        describe(".statusHandler", function() {
            var device;
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
                device.statusHandler([0, 1, 0x2, 0x53, 0x30, 0x30, 0, 0, 0, 0, 0, 0]);
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
                device.statusHandler([0, 1, 0x2, 0x53, 161, 0x30, 0, 0, 0, 0, 0, 0]);
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
                device.statusHandler([0, 1, 0x2, 0x53, 162, 0x30, 0, 0, 0, 0, 0, 0]);
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
                device.statusHandler([0, 1, 0x2, 0x53, 224, 0x30, 0, 0, 0, 0, 0, 0]);
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
                device.statusHandler([0, 1, 0x2, 0x53, 225, 0x30, 0, 0, 0, 0, 0, 0]);
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
                device.statusHandler([0, 1, 0x2, 0x53, 1, 0x30, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0]);
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
                device.statusHandler([0, 1, 0x2, 0x53, 1, 0x30, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0]);
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
                device.statusHandler([0, 1, 0x2, 0x53, 1, 0x30, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0]);
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
                device.statusHandler([0, 1, 0x2, 0x53, 1, 0x30, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0]);
            });
        });

        describe(".temprain1handler", function() {
            var device;
            beforeEach(function () {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should extract the id of the device", function(done) {
                device.on("temprain1", function(evt) {
                    expect(evt.id).toBe("0xDEAD");
                    expect(evt.subtype).toBe(1);
                    done();
                });
                device.temprain1handler([0x01, 0x01, 0xde, 0xad, 0x01, 0x4A, 0x02, 0xee, 0x42]);
            });
            it("should extract the rainfall value", function(done) {
                device.on("temprain1", function(evt) {
                    expect(evt.rainfall).toBe(75.0);
                    done();
                });
                device.temprain1handler([0x01, 0x01, 0xde, 0xad, 0x01, 0x4A, 0x02, 0xee, 0x42]);
            });
            it("should extract the temperature value", function(done) {
                device.on("temprain1", function(evt) {
                    expect(evt.temperature).toBe(33.3);
                    done();
                });
                device.temprain1handler([0x01, 0x01, 0xde, 0xad, 0x01, 0x4D, 0x02, 0xee, 0x42]);
            });
            it("should extract a negative temperature value", function(done) {
                device.on("temprain1", function(evt) {
                    expect(evt.temperature).toBe(-10.0);
                    done();
                });
                device.temprain1handler([0x01, 0x01, 0xde, 0xad, 0x80, 0x64, 0x02, 0xee, 0x42]);
            });
            it("should extract the battery strength correctly", function(done) {
                device.on("temprain1", function(evt) {
                    expect(evt.batteryLevel).toBe(9);
                    done();
                });
                device.temprain1handler([0x01, 0x01, 0xde, 0xad, 0x80, 0x64, 0x02, 0xee, 0x09]);
            });
            it("should extract the signal strength correctly", function(done) {
                device.on("temprain1", function(evt) {
                    expect(evt.rssi).toBe(6);
                    done();
                });
                device.temprain1handler([0x01, 0x01, 0xde, 0xad, 0x80, 0x64, 0x02, 0xee, 0x60]);
            });
        });

        describe(".temp19Handler", function() {
            var device;
            beforeEach(function() {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should extract the id of the device", function(done) {
                device.on("temp3", function(evt) {
                    expect(evt.id).toBe("0xFAAF");
                    expect(evt.subtype).toBe(3);
                    done();
                });
                device.temp19Handler([0x03, 0x01, 0xFA, 0xAF, 0x00, 0x14, 0x42]);
            });
            it("should extract the temperature of the device", function(done) {
                device.on("temp1", function(evt) {
                    expect(evt.temperature).toBe(2.0);
                    expect(evt.subtype).toBe(1);
                    done();
                });
                device.temp19Handler([0x01, 0x01, 0xFA, 0xAF, 0x00, 0x14, 0x9f]);
            });
            it("should extract the temperature respecting the sign", function(done) {
                device.on("temp1", function(evt) {
                    expect(evt.temperature).toBe(-2.0);
                    done();
                });
                device.temp19Handler([0x01, 0x01, 0xFA, 0xAF, 0x80, 0x14, 0x9f]);
            });
            it("should extract the battery strength correctly", function(done) {
                device.on("temp2", function(evt) {
                    expect(evt.batteryLevel).toBe(9);
                    expect(evt.subtype).toBe(2);
                    done();
                });
                device.temp19Handler([0x02, 0x01, 0xFA, 0xAF, 0x80, 0x14, 0x69]);
            });
            it("should extract the signal strength correctly", function(done) {
                device.on("temp2", function(evt) {
                    expect(evt.rssi).toBe(6);
                    done();
                });
                device.temp19Handler([0x02, 0x01, 0xFA, 0xAF, 0x80, 0x14, 0x69]);
            });
        });

        describe(".humidity1Handler", function() {
            var device;
            beforeEach(function() {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should extract the id of the device", function(done) {
                device.on("humidity1", function(evt) {
                    expect(evt.id).toBe("0x7700");
                    expect(evt.subtype).toBe(1);
                    done();
                });
                device.humidity1Handler([0x01, 0x02, 0x77, 0x00, 0x36, 0x01, 0x89]);
            });
            it("should extract the humidity value", function(done) {
                device.on("humidity1", function(evt) {
                    expect(evt.humidity).toBe(54);
                    done();
                });
                device.humidity1Handler([0x01, 0x02, 0x77, 0x00, 0x36, 0x01, 0x89]);
            });
            it("should extract the humidity status", function(done) {
                device.on("humidity1", function(evt) {
                    expect(evt.humidityStatus).toBe(1);
                    done();
                });
                device.humidity1Handler([0x01, 0x02, 0x77, 0x00, 0x36, 0x01, 0x89]);
            });
            it("should extract the battery status", function(done) {
                device.on("humidity1", function(evt) {
                    expect(evt.batteryLevel).toBe(9);
                    done();
                });
                device.humidity1Handler([0x01, 0x02, 0x77, 0x00, 0x36, 0x01, 0x89]);
            });
            it("should extract the rssi", function(done) {
                device.on("humidity1", function(evt) {
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.humidity1Handler([0x01, 0x02, 0x77, 0x00, 0x36, 0x01, 0x89]);
            });
        });

        describe(".temphumidity19Handler", function() {
            var device;
            beforeEach(function() {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should extract the id of the device", function(done) {
                device.on("th3", function(evt) {
                    expect(evt.id).toBe("0xAF01");
                    expect(evt.subtype).toBe(3);
                    done();
                });
                device.temphumidity19Handler([0x03, 0x04, 0xAF, 0x01, 0x00, 0x90, 0x36, 0x02, 0x59]);
            });
            it("should extract the temperature of the device", function(done) {
                device.on("th3", function(evt) {
                    expect(evt.temperature).toBe(14.4);
                    done();
                });
                device.temphumidity19Handler([0x03, 0x04, 0xAF, 0x01, 0x00, 0x90, 0x36, 0x02, 0x59]);
            });
            it("should extract the temperature respecting the sign", function(done) {
                device.on("th3", function(evt) {
                    expect(evt.temperature).toBe(-14.4);
                    done();
                });
                device.temphumidity19Handler([0x03, 0x04, 0xAF, 0x01, 0x80, 0x90, 0x36, 0x02, 0x59]);
            });
            it("should extract the humidity figure", function(done) {
                device.on("th3", function(evt) {
                    expect(evt.humidity).toBe(54);
                    done();
                });
                device.temphumidity19Handler([0x03, 0x04, 0xAF, 0x01, 0x00, 0x90, 0x36, 0x02, 0x59]);
            });
            it("should extract the humidity status", function(done) {
                device.on("th3", function(evt) {
                    expect(evt.humidityStatus).toBe(rfxcom.humidity.DRY);
                    done();
                });
                device.temphumidity19Handler([0x03, 0x04, 0xAF, 0x01, 0x00, 0x90, 0x36, 0x02, 0x59]);
            });
            it("should extract the battery strength correctly", function(done) {
                device.on("th3", function(evt) {
                    expect(evt.batteryLevel).toBe(9);
                    done();
                });
                device.temphumidity19Handler([0x03, 0x04, 0xAF, 0x01, 0x00, 0x90, 0x36, 0x02, 0x89]);
            });
            it("should extract the signal strength correctly", function(done) {
                device.on("th3", function(evt) {
                    expect(evt.rssi).toBe(8);
                    done();
                });
                device.temphumidity19Handler([0x03, 0x04, 0xAF, 0x01, 0x00, 0x90, 0x36, 0x02, 0x89]);
            });
        });
        describe(".temphumbaro12Handler", function() {
            var device;
            beforeEach(function() {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should extract the id of the device", function(done) {
                device.on("thb2", function(evt) {
                    expect(evt.id).toBe("0xE900");
                    expect(evt.subtype).toBe(2);
                    done();
                });
                device.temphumbaro12Handler([0x02, 0x0E, 0xE9, 0x00, 0x00, 0xC9, 0x27, 0x02, 0x03, 0xE7, 0x04, 0x39]);
            });
            it("should extract the seqnbr of the message", function(done) {
                device.on("thb2", function(evt) {
                    expect(evt.seqnbr).toBe(14);
                    done();
                });
                device.temphumbaro12Handler([0x02, 0x0E, 0xE9, 0x00, 0x00, 0xC9, 0x27, 0x02, 0x03, 0xE7, 0x04, 0x39]);
            });
            it("should extract the temperature of the device", function(done) {
                device.on("thb2", function(evt) {
                    expect(evt.temperature).toBe(20.1);
                    done();
                });
                device.temphumbaro12Handler([0x02, 0x0E, 0xE9, 0x00, 0x00, 0xC9, 0x27, 0x02, 0x03, 0xE7, 0x04, 0x39]);
            });
            it("should extract the temperature respecting the sign", function(done) {
                device.on("thb2", function(evt) {
                    expect(evt.temperature).toBe(-20.1);
                    done();
                });
                device.temphumbaro12Handler([0x02, 0x0E, 0xE9, 0x00, 0x80, 0xC9, 0x27, 0x02, 0x03, 0xE7, 0x04, 0x39]);
            });
            it("should extract the humidity figure", function(done) {
                device.on("thb1", function(evt) {
                    expect(evt.humidity).toBe(39);
                    done();
                });
                device.temphumbaro12Handler([0x01, 0x0E, 0xE9, 0x00, 0x00, 0xC9, 0x27, 0x02, 0x03, 0xE7, 0x04, 0x39]);
            });
            it("should extract the humidity status", function(done) {
                device.on("thb1", function(evt) {
                    expect(evt.humidityStatus).toBe(rfxcom.humidity.DRY);
                    expect(evt.subtype).toBe(1);
                    done();
                });
                device.temphumbaro12Handler([0x01, 0x0E, 0xE9, 0x00, 0x00, 0xC9, 0x27, 0x02, 0x03, 0xE7, 0x04, 0x39]);
            });
            it("should extract the weather forecast", function(done) {
                device.on("thb1", function(evt) {
                    expect(evt.forecast).toBe(rfxcom.forecast.RAIN);
                    done();
                });
                device.temphumbaro12Handler([0x01, 0x0E, 0xE9, 0x00, 0x00, 0xC9, 0x27, 0x02, 0x03, 0xE7, 0x04, 0x39]);
            });
            it("should extract the battery strength correctly", function(done) {
                device.on("thb2", function(evt) {
                    expect(evt.batteryLevel).toBe(9);
                    done();
                });
                device.temphumbaro12Handler([0x02, 0x0E, 0xE9, 0x00, 0x00, 0xC9, 0x27, 0x02, 0x03, 0xE7, 0x04, 0x39]);
            });
            it("should extract the signal strength correctly", function(done) {
                device.on("thb2", function(evt) {
                    expect(evt.rssi).toBe(3);
                    done();
                });
                device.temphumbaro12Handler([0x02, 0x0E, 0xE9, 0x00, 0x00, 0xC9, 0x27, 0x02, 0x03, 0xE7, 0x04, 0x39]);
            });
        });

        describe(".rain16Handler", function() {
            var device;
            beforeEach(function () {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should extract the id of the device", function(done) {
                device.on("rain2", function(evt) {
                    expect(evt.id).toBe("0xB600");
                    expect(evt.subtype).toBe(2);
                    done();
                });
                device.rain16Handler([0x02, 0x17, 0xb6, 0x00, 0x00, 0x00, 0x00, 0x4d, 0x3c, 0x69]);
            });
            it("should extract the total rainfall", function(done) {
                device.on("rain2", function(evt) {
                    expect(evt.rainfall).toBe(1977.2);
                    done();
                });
                device.rain16Handler([0x02, 0x17, 0xb6, 0x00, 0x00, 0x00, 0x00, 0x4d, 0x3c, 0x69]);
            });
            it("should not emit a rainfall increment", function(done) {
                device.on("rain2", function(evt) {
                    expect(evt.hasOwnProperty("rainfallIncrement")).toBe(false);
                    done();
                });
                device.rain16Handler([0x02, 0x17, 0xb6, 0x00, 0x00, 0x00, 0x00, 0x4d, 0x3c, 0x69]);
            });
            it("should extract the rainfall rate", function(done) {
                device.on("rain2", function(evt) {
                    expect(evt.rainfallRate).toBe(0.0);
                    done();
                });
                device.rain16Handler([0x02, 0x17, 0xb6, 0x00, 0x00, 0x00, 0x00, 0x4d, 0x3c, 0x69]);
            });
            it("should extract the battery level", function(done) {
                device.on("rain2", function(evt) {
                    expect(evt.batteryLevel).toBe(9);
                    done();
                });
                device.rain16Handler([0x02, 0x17, 0xb6, 0x00, 0x00, 0x00, 0x00, 0x4d, 0x3c, 0x69]);
            });
            it("should extract the signal level", function(done) {
                device.on("rain2", function(evt) {
                    expect(evt.rssi).toBe(6);
                    done();
                });
                device.rain16Handler([0x02, 0x17, 0xb6, 0x00, 0x00, 0x00, 0x00, 0x4d, 0x3c, 0x69]);
            });
            it("should extract the rainfall increment", function(done) {
                device.on("rain6", function(evt) {
                    expect(evt.rainfallIncrement).toBe(3.458);
                    expect(evt.subtype).toBe(6);
                    done();
                });
                device.rain16Handler([0x06, 0x17, 0xb6, 0x00, 0x00, 0x00, 0x00, 0x4d, 0x0d, 0x69]);
            });
            it("should not emit a total rainfall", function(done) {
                device.on("rain6", function(evt) {
                    expect(evt.hasOwnProperty("rainfall")).toBe(false);
                    done();
                });
                device.rain16Handler([0x06, 0x17, 0xb6, 0x00, 0x00, 0x00, 0x00, 0x4d, 0x0d, 0x69]);
            });
            it("should extract the rainfall rate", function(done) {
                device.on("rain1", function(evt) {
                    expect(evt.rainfallRate).toBe(289.0);
                    expect(evt.subtype).toBe(1);
                    done();
                });
                device.rain16Handler([0x01, 0x17, 0xb6, 0x00, 0x01, 0x21, 0x00, 0x4d, 0x3c, 0x69]);
            });
            it("should extract the rainfall rate", function(done) {
                device.on("rain2", function(evt) {
                    expect(evt.rainfallRate).toBe(2.89);
                    done();
                });
                device.rain16Handler([0x02, 0x17, 0xb6, 0x00, 0x01, 0x21, 0x00, 0x4d, 0x3c, 0x69]);
            });
            it("should extract the battery level correctly", function(done) {
                device.on("rain2", function(evt) {
                    expect(evt.batteryLevel).toBe(9);
                    done();
                });
                device.rain16Handler([0x02, 0x17, 0xb6, 0x00, 0x01, 0x21, 0x00, 0x4d, 0x3c, 0x69]);
            });
            it("should extract the signal strength correctly", function(done) {
                device.on("rain2", function(evt) {
                    expect(evt.rssi).toBe(6);
                    done();
                });
                device.rain16Handler([0x02, 0x17, 0xb6, 0x00, 0x01, 0x21, 0x00, 0x4d, 0x3c, 0x69]);
            });
        });

        describe(".wind16Handler", function() {
            var device;
            beforeEach(function () {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should extract the id of the device", function (done) {
                device.on("wind1", function (evt) {
                    expect(evt.id).toBe("0x2F00");
                    expect(evt.subtype).toBe(1);
                    done();
                });
                device.wind16Handler([0x01, 0x12, 0x2f, 0x00, 0x00, 0x87, 0x00, 0x00, 0x00, 0x14,
                    0x00, 0x49, 0x00, 0x00, 0x79]);
            });
            it("should extract the wind direction", function (done) {
                device.on("wind1", function (evt) {
                    expect(evt.direction).toBe(135);
                    done();
                });
                device.wind16Handler([0x01, 0x12, 0x2f, 0x00, 0x00, 0x87, 0x00, 0x00, 0x00, 0x14,
                    0x00, 0x49, 0x00, 0x00, 0x79]);
            });
            it("should extract the average wind speed", function (done) {
                device.on("wind1", function (evt) {
                    expect(evt.averageSpeed).toBe(0.0);
                    done();
                });
                device.wind16Handler([0x01, 0x12, 0x2f, 0x00, 0x00, 0x87, 0x00, 0x00, 0x00, 0x14,
                    0x00, 0x49, 0x00, 0x00, 0x79]);
            });
            it("should extract the gust speed", function (done) {
                device.on("wind1", function (evt) {
                    expect(evt.gustSpeed).toBe(2.0);
                    done();
                });
                device.wind16Handler([0x01, 0x12, 0x2f, 0x00, 0x00, 0x87, 0x00, 0x00, 0x00, 0x14,
                    0x00, 0x49, 0x00, 0x00, 0x79]);
            });
            it("should not provide temperature or windchill with a subtype 1 sensor", function (done) {
                device.on("wind1", function (evt) {
                    expect(evt.hasOwnProperty("temperature")).toBe(false);
                    expect(evt.hasOwnProperty("chillfactor")).toBe(false);
                    done();
                });
                device.wind16Handler([0x01, 0x12, 0x2f, 0x00, 0x00, 0x87, 0x00, 0x00, 0x00, 0x14,
                    0x00, 0x49, 0x00, 0x00, 0x79]);
            });
            it("should extract the windchill", function (done) {
                device.on("wind4", function (evt) {
                    expect(evt.chillfactor).toBe(1.0);
                    expect(evt.subtype).toBe(4);
                    done();
                });
                device.wind16Handler([0x04, 0x12, 0x2f, 0x00, 0x00, 0x87, 0x00, 0x00, 0x00, 0x14,
                    0x00, 0x49, 0x00, 0x0a, 0x79]);
            });
            it("should extract a negative windchill correctly", function (done) {
                device.on("wind4", function (evt) {
                    expect(evt.chillfactor).toBe(-31.4);
                    done();
                });
                device.wind16Handler([0x04, 0x12, 0x2f, 0x00, 0x00, 0x87, 0x00, 0x00, 0x00, 0x14,
                    0x00, 0x49, 0x81, 0x3a, 0x79]);
            });
            it("should extract the temperature", function (done) {
                device.on("wind4", function (evt) {
                    expect(evt.temperature).toBe(7.3);
                    done();
                });
                device.wind16Handler([0x04, 0x12, 0x2f, 0x00, 0x00, 0x87, 0x00, 0x00, 0x00, 0x14,
                    0x00, 0x49, 0x00, 0x0a, 0x79]);
            });
            it("should extract a negative temperature correctly", function (done) {
                device.on("wind4", function (evt) {
                    expect(evt.temperature).toBe(-7.3);
                    done();
                });
                device.wind16Handler([0x04, 0x12, 0x2f, 0x00, 0x00, 0x87, 0x00, 0x00, 0x00, 0x14,
                    0x80, 0x49, 0x81, 0x3a, 0x79]);
            });
            it("should extract the wind speed from a subtype 5 sensor", function (done) {
                device.on("wind5", function (evt) {
                    expect(evt.gustSpeed).toBe(2.0);
                    expect(evt.hasOwnProperty("averageSpeed")).toBe(false);
                    expect(evt.subtype).toBe(5);
                    done();
                });
                device.wind16Handler([0x05, 0x12, 0x2f, 0x00, 0x00, 0x87, 0x00, 0x00, 0x00, 0x14,
                    0x00, 0x49, 0x00, 0x00, 0x79]);
            });
            it("should extract the battery level correctly", function(done) {
                device.on("wind1", function(evt) {
                    expect(evt.batteryLevel).toBe(9);
                    done();
                });
                device.wind16Handler([0x01, 0x12, 0x2f, 0x00, 0x00, 0x87, 0x00, 0x00, 0x00, 0x14,
                    0x00, 0x49, 0x00, 0x00, 0x79]);
            });
            it("should extract the signal strength correctly", function(done) {
                device.on("wind1", function(evt) {
                    expect(evt.rssi).toBe(7);
                    done();
                });
                device.wind16Handler([0x01, 0x12, 0x2f, 0x00, 0x00, 0x87, 0x00, 0x00, 0x00, 0x14,
                    0x00, 0x49, 0x00, 0x00, 0x79]);
            });
        });

        describe(".uv13Handler", function() {
            var device;
            beforeEach(function () {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should extract the id of the device", function (done) {
                device.on("uv1", function (evt) {
                    expect(evt.id).toBe("0xF1D0");
                    expect(evt.subtype).toBe(1);
                    done();
                });
                device.uv13Handler([0x01, 0x13, 0xf1, 0xd0, 0x0a, 0x00, 0xc8, 0x79]);
            });
            it("should extract the uv index", function (done) {
                device.on("uv1", function (evt) {
                    expect(evt.uv).toBe(1.0);
                    done();
                });
                device.uv13Handler([0x01, 0x13, 0xf1, 0xd0, 0x0a, 0x00, 0xc8, 0x79]);
            });
            it("should extract the temperature", function (done) {
                device.on("uv1", function (evt) {
                    expect(evt.temperature).toBe(20.0);
                    done();
                });
                device.uv13Handler([0x01, 0x13, 0xf1, 0xd0, 0x0a, 0x00, 0xc8, 0x79]);
            });
            it("should extract a negative temperature", function (done) {
                device.on("uv1", function (evt) {
                    expect(evt.temperature).toBe(-5.0);
                    done();
                });
                device.uv13Handler([0x01, 0x13, 0xf1, 0xd0, 0x0a, 0x80, 0x32, 0x79]);
            });
            it("should extract the battery level correctly", function(done) {
                device.on("uv1", function(evt) {
                    expect(evt.batteryLevel).toBe(9);
                    done();
                });
                device.uv13Handler([0x01, 0x13, 0xf1, 0xd0, 0x0a, 0x80, 0x32, 0x79]);
            });
            it("should extract the signal strength correctly", function(done) {
                device.on("uv1", function(evt) {
                    expect(evt.rssi).toBe(7);
                    done();
                });
                device.uv13Handler([0x01, 0x13, 0xf1, 0xd0, 0x0a, 0x80, 0x32, 0x79]);
            });
        });

        describe(".rfxmeterHandler", function() {
            var device;
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
            var device;
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
        describe(".rfxsensorHandler", function() {
            var device;
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
    });
});
