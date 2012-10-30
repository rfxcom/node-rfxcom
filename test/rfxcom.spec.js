var rfxcom = require('../lib'),
    FakeSerialPort = require('./helper');
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
            device = new rfxcom.RfxCom("/dev/ttyUSB0", {
              port: fakeSerialPort
            });
        device.on("response", function(evt) {
          done();
        });
        device.open();
        fakeSerialPort.emit("data", [0x04, 0x02, 0x01, 0x00, 0x00]);
      });
      it("should emit a status message when it receives message type 0x01", function(done) {
         var fakeSerialPort = new FakeSerialPort(),
             device = new rfxcom.RfxCom("/dev/ttyUSB0", {
               port: fakeSerialPort
             });
         device.on("status", function(evt) {
           done();
         });
         device.open();
         fakeSerialPort.emit("data", [0x0D, 0x01, 0x00, 0x01, 0x02, 0x53, 0x30, 0x00, 0x02, 0x21, 0x01, 0x00, 0x00, 0x00]);
      });
            it("should emit a lighting5 message when it receives message type 0x14", function(done) {
                var fakeSerialPort = new FakeSerialPort(),
                device = new rfxcom.RfxCom("/dev/ttyUSB0", {
                    port: fakeSerialPort
                });
                device.on("lighting5", function(evt) {
                    done();
                });
                device.open();
                fakeSerialPort.emit("data", [0x0A, 0x14, 0x00, 0x01, 0xF0, 0x9A, 0xC7, 0x02, 0x00, 0x00, 0x80]);
            });
            it("should emit an elec2 message when it receives message type 0x5a", function(done) {
                var fakeSerialPort = new FakeSerialPort(),
                device = new rfxcom.RfxCom("/dev/ttyUSB0", {
                    port: fakeSerialPort
                });
                device.on("elec2", function(evt) {
                    done();
                });
                device.open();
                fakeSerialPort.emit("data", [0x11, 0x5a, 0x01, 0x00, 0x00, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
            });
            it("should emit a security1 message when it receives message type 0x20", function(done) {
                var fakeSerialPort = new FakeSerialPort(),
                device = new rfxcom.RfxCom("/dev/ttyUSB0", {
                    port: fakeSerialPort
                });
                device.on("security1", function(evt) {
                    done();
                });
                device.open();
                fakeSerialPort.emit("data", [0x08, 0x20, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00]);
            });
            it("should emit a temp1 message when it receives message type 0x50, with device type 1", function(done) {
                var fakeSerialPort = new FakeSerialPort(),
                device = new rfxcom.RfxCom("/dev/ttyUSB0", {
                    port: fakeSerialPort
                });
                device.on("temp1", function(evt) {
                    done();
                });
                device.open();
                fakeSerialPort.emit("data", [0x08, 0x50, 0x01, 0x01, 0xFA, 0xAF, 0x80, 0x14, 0x42]);
            });
            it("should emit a temp2 message when it receives message type 0x50, with device type 2", function(done) {
                var fakeSerialPort = new FakeSerialPort(),
                device = new rfxcom.RfxCom("/dev/ttyUSB0", {
                    port: fakeSerialPort
                });
                device.on("temp2", function(evt) {
                    done();
                });
                device.open();
                fakeSerialPort.emit("data", [0x08, 0x50, 0x02, 0x01, 0xFA, 0xAF, 0x80, 0x14, 0x42]);
            });
            it("should emit a th1 message when it receives message type 0x52, with device type 1", function(done) {
                var fakeSerialPort = new FakeSerialPort(),
                device = new rfxcom.RfxCom("/dev/ttyUSB0", {
                    port: fakeSerialPort
                });
                device.on("th1", function(evt) {
                    done();
                });
                device.open();
                fakeSerialPort.emit("data", [0x0A, 0x52, 0x01, 0x04, 0xAF, 0x01, 0x00, 0x90, 0x36, 0x02, 0x59]);
            });
            it("should emit a lighting2 message when it receives message type 0x11", function(done) {
                var fakeSerialPort = new FakeSerialPort(),
                device = new rfxcom.RfxCom("/dev/ttyUSB0", {
                    port: fakeSerialPort
                });
                device.on("lighting2", function(evt) {
                    done();
                });
                device.open();
                fakeSerialPort.emit("data", [0x0B, 0x11, 0x01, 0x00, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0xF, 0xF, 0x0F]);
            });
        });

        describe(".initialise should prepare the device for use", function() {
            it("should prepare the device for use.", function(done) {
                var fakeSerialPort = new FakeSerialPort(),
                device = new rfxcom.RfxCom("/dev/ttyUSB0", {
                    port: fakeSerialPort
                }),
                resetSpy = spyOn(device, "reset").andCallThrough(),
                delaySpy = spyOn(device, "delay"),
                flushSpy = spyOn(device, "flush"),
                getStatusSpy = spyOn(device, "getStatus").andCallThrough(),
                openSpy = spyOn(device, "open").andCallFake(function() {
                    device.emit("ready");
                });

                var handler = function() {
                    done();
                };
                device.initialise(handler);
                expect(resetSpy).toHaveBeenCalled();
                expect(delaySpy).toHaveBeenCalledWith(500);
                expect(flushSpy).toHaveBeenCalled();
                expect(getStatusSpy).toHaveBeenCalledWith(handler);
                expect(openSpy).toHaveBeenCalled();
            });
        });

        describe(".bytesToUint48", function() {
            it("should convert a sequence of 6 bytes to a longint", function() {
                var device = new rfxcom.RfxCom("/dev/ttyUSB0");
                expect(device.bytesToUint48([0x00, 0x00, 0x00, 0x67, 0x28, 0x97])).toBe(6760488);
            });
        });

        describe(".bytesToUint32", function() {
            it("should convert a sequence of 4 bytes to a longint", function() {
                var device = new rfxcom.RfxCom("/dev/ttyUSB0");
                expect(device.bytesToUint32([0x00, 0x00, 0x01, 0x72])).toBe(370);
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
                expect(device.stringToBytes("203052").toString()).toBe([32, 48, 82].toString());
            });
            it("should ignore leading 0x on a string", function() {
                var device = new rfxcom.RfxCom("/dev/ttyUSB0");
                expect(device.stringToBytes("0x203052").toString()).toBe([32, 48, 82].toString());
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
        });

            describe(".elec2Handler", function() {
            it("should emit an elec2 message when called", function(done) {
                var device = new rfxcom.RfxCom("/dev/ttyUSB0");
                device.on("elec2", function(evt) {
                    expect(evt.subtype).toBe("CM119/160");
                    expect(evt.id).toBe("0xA412");
                    expect(evt.currentWatts).toBe(370);
                    expect(evt.totalWatts).toBe(30225.82);
                    done();
                });
                device.elec2Handler([0x01, 0x00, 0xA4, 0x12, 0x02, 0x00, 0x00, 0x01, 0x72, 0x00, 0x00, 0x00, 0x67, 0x28, 0x97, 0x79]);
            });
        });

        describe(".lighting5Handler", function() {
            var device;
            beforeEach(function() {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should emit a lighting5 message when called", function(done) {
                device.on("lighting5", function(evt) {
                    expect(evt.subtype).toBe("LightwaveRF, Siemens");
                    expect(evt.id).toBe("0xF09AC7");
                    expect(evt.unitcode).toBe(1);
                    expect(evt.command).toBe("Off");
                    done();
                });
                device.lighting5Handler([0x00, 0x01, 0xF0, 0x9A, 0xC7, 0x01, 0x00, 0x00, 0x80]);
            });

            it("should identify the subtype correctly", function(done) {
                device.on("lighting5", function(evt) {
                    expect(evt.subtype).toBe("EMW100 GAO/Everflourish");
                    done();
                });
                device.lighting5Handler([0x01, 0x01, 0xF0, 0x9A, 0xC7, 0x01, 0x00, 0x00, 0x80])
                });

            it("should identify the command correctly", function(done) {
                device.on("lighting5", function(evt) {
                    expect(evt.command).toBe("On");
                    done();
                });
                device.lighting5Handler([0x01, 0x01, 0xF0, 0x9A, 0xC7, 0x01, 0x01, 0x00, 0x80])
                });
        });

        describe(".lighting1Handler", function() {
            var device;
            beforeEach(function() {
                device = new rfxcom.RfxCom("/dev/ttyUSB0");
            });
            it("should emit a lighting1 message when called", function(done) {
                device.on("lighting1", function(evt) {
                    expect(evt.subtype).toBe("ARC");
                    expect(evt.seqnbr).toBe(1);
                    expect(evt.housecode).toBe("D");
                    expect(evt.unitcode).toBe(2);
                    expect(evt.command).toBe("On");
                    expect(evt.rssi).toBe(7);
                    expect(evt.id).toBe("0x4402");
                    done();
                });
                device.lighting1Handler([0x01, 0x01, 0x44, 0x02, 0x01, 0x70]);
            });
            it("should calculate the id correctly", function(done) {
                device.on("lighting1", function(evt) {
                    expect(evt.id).toBe("0x4305");
                    expect(evt.housecode).toBe("C");
                    expect(evt.unitcode).toBe(5);
                    done()
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
                        expect(evt.subtype).toBe("X10");
                        done();
                    });
                    device.lighting1Handler([0x00, 0x01, 0x43, 0x05, 0x01, 0x80]);
                });
                it("should identify Waveman devices", function(done) {
                    device.on("lighting1", function(evt) {
                        expect(evt.subtype).toBe("Waveman");
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
                    expect(evt.subtype).toBe("AC");
                    expect(evt.seqnbr).toBe(1);
                    expect(evt.id).toBe("0x039AC7A1");
                    expect(evt.unitcode).toBe(1);
                    expect(evt.command).toBe("Off");
                    expect(evt.level).toBe(0x0F);
                    expect(evt.rssi).toBe(0x0F);
                    done();
                });
                device.lighting2Handler([0x00, 0x01, 0xC3, 0x9A, 0xC7, 0xA1, 0x01, 0x00, 0x0F, 0x0F]);
            });
            it("should calculate the id correctly", function(done) {
                device.on("lighting2", function(evt) {
                    expect(evt.id).toBe("0x029AC7A1");
                    done()
                    });
                device.lighting2Handler([0x00, 0x01, 0xCE, 0x9A, 0xC7, 0xA1, 0x01, 0x00, 0x0F, 0x0F]);
            });
            it("should calculate the rssi correctly", function(done) {
                device.on("lighting2", function(evt) {
                    expect(evt.rssi).toBe(7);
                    done();
                });
                device.lighting2Handler([0x00, 0x01, 0xC3, 0x9A, 0xC7, 0xA1, 0x01, 0x00, 0x07, 0xF7]);
            });
            describe("device type identification", function() {
                it("should identify HomeEasy EU devices", function(done) {
                    device.on("lighting2", function(evt) {
                        expect(evt.subtype).toBe("HomeEasy EU");
                        done();
                    });
                    device.lighting2Handler([0x01, 0x01, 0xC3, 0x9A, 0xC7, 0xA1, 0x01, 0x00, 0x0F, 0x0F]);
                });
                it("should identify ANSLUT devices", function(done) {
                    device.on("lighting2", function(evt) {
                        expect(evt.subtype).toBe("ANSLUT");
                        done();
                    });
                    device.lighting2Handler([0x02, 0x01, 0xC3, 0x9A, 0xC7, 0xA1, 0x01, 0x00, 0x0F, 0x0F]);
                });
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
                })
                    device.security1Handler([0x00, 0x00, 0xFF, 0xAA, 0x00, 0x02, 0x89]);
            });

            it("should correctly identify the NORMAL device state", function(done) {
                device.on("security1", function(evt) {
                    expect(evt.deviceStatus).toBe(rfxcom.security.NORMAL);
                    done();
                })
                    device.security1Handler([0x00, 0x00, 0xFF, 0xAA, 0x00, 0x00, 0x89]);
            });
            it("should correctly identify the NORMAL_DELAYED device state", function(done) {
                device.on("security1", function(evt) {
                    expect(evt.deviceStatus).toBe(rfxcom.security.NORMAL_DELAYED);
                    done();
                })
                    device.security1Handler([0x00, 0x00, 0xFF, 0xAA, 0x00, 0x01, 0x89]);
            });

            it("should correctly identify the ALARM device state", function(done) {
                device.on("security1", function(evt) {
                    expect(evt.deviceStatus).toBe(rfxcom.security.ALARM);
                    done();
                })
                    device.security1Handler([0x00, 0x00, 0xFF, 0xAA, 0x00, 0x02, 0x89]);
            });
            it("should correctly identify the ALARM_DELAYED device state", function(done) {
                device.on("security1", function(evt) {
                    expect(evt.deviceStatus).toBe(rfxcom.security.ALARM_DELAYED);
                    done();
                })
                    device.security1Handler([0x00, 0x00, 0xFF, 0xAA, 0x00, 0x03, 0x89]);
            });

            it("should correctly identify the MOTION device state", function(done) {
                device.on("security1", function(evt) {
                    expect(evt.deviceStatus).toBe(rfxcom.security.MOTION);
                    done();
                })
                    device.security1Handler([0x00, 0x00, 0xFF, 0xAA, 0x00, 0x04, 0x89]);
            });
            it("should correctly identify the NO_MOTION device state", function(done) {
                device.on("security1", function(evt) {
                    expect(evt.deviceStatus).toBe(rfxcom.security.NO_MOTION);
                    done();
                })
                    device.security1Handler([0x00, 0x00, 0xFF, 0xAA, 0x00, 0x05, 0x89]);
            });

            it("should identify the X10 security motion sensor correctly", function(done) {
                device.on("security1", function(evt) {
                    expect(evt.subtype).toBe(rfxcom.security.X10_MOTION_SENSOR);
                    done();
                })
                    device.security1Handler([0x01, 0x00, 0xFF, 0xAA, 0x00, 0x04, 0x89]);
            });
            it("should identify the X10 security window sensor correctly", function(done) {
                device.on("security1", function(evt) {
                    expect(evt.subtype).toBe(rfxcom.security.X10_DOOR_WINDOW_SENSOR);
                    done();
                })
                    device.security1Handler([0x00, 0x00, 0xFF, 0xAA, 0x00, 0x04, 0x89]);
            });
            it("should correctly identify the tamper notification from a device", function (done) {
                device.on("security1", function (evt) {
                    expect(evt.deviceStatus)
                        .toBe(rfxcom.security.MOTION);
                    expect(evt.tampered)
                        .toBeTruthy();
                    done();
                })
                    device.security1Handler([0x01, 0x00, 0xFF, 0xAA, 0x00, 0x84, 0x89]);
            });
            it("should report not tampered if the device isn't tampered with", function(done) {
                device.on("security1", function(evt) {
                    expect(evt.tampered).not.toBeTruthy();
                    done();
                })
                    device.security1Handler([0x01, 0x00, 0xFF, 0xAA, 0x00, 0x04, 0x89]);
            });
            it("should correctly identify the battery status", function(done) {
                device.on("security1", function(evt) {
                    expect(evt.batteryLevel).toBe(9);
                    done();
                })
                    device.security1Handler([0x01, 0x00, 0xFF, 0xAA, 0x00, 0x04, 0x94]);
            });
            it("should correctly identify the signal strength", function(done) {
                device.on("security1", function(evt) {
                    expect(evt.rssi).toBe(4);
                    done();
                })
                    device.security1Handler([0x01, 0x00, 0xFF, 0xAA, 0x00, 0x04, 0x94]);
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
                    expect(evt.cmnd).toBe(0x20);
                    expect(evt.receiverType).toBe("433.92MHz transceiver");
                    expect(evt.firmwareVersion).toBe(0x30);
                    done();
                })
                    device.statusHandler([0, 1, 0x20, 0x53, 0x30, 0x30, 0, 0, 0, 0, 0, 0, 0])
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
                    done();
                });
                device.temp19Handler([0x03, 0x01, 0xFA, 0xAF, 0x00, 0x14, 0x42]);
            });
            it("should extract the temperature of the device", function(done) {
                device.on("temp1", function(evt) {
                    expect(evt.temperature).toBe(2.0);
                    done();
                });
                device.temp19Handler([0x01, 0x01, 0xFA, 0xAF, 0x00, 0x14, 0x9f]);
            });
            it("should extract the temperature respecting the sign", function(done) {
                device.on("temp1", function(evt) {
                    expect(evt.temperature).toBe( - 2.0);
                    done();
                });
                device.temp19Handler([0x01, 0x01, 0xFA, 0xAF, 0x80, 0x14, 0x9f]);
            });
            it("should extract the battery strength correctly", function(done) {
                device.on("temp2", function(evt) {
                    expect(evt.batteryLevel).toBe(9);
                    done();
                });
                device.temp19Handler([0x02, 0x01, 0xFA, 0xAF, 0x80, 0x14, 0x9f]);
            });
            it("should extract the signal strength correctly", function(done) {
                device.on("temp2", function(evt) {
                    expect(evt.rssi).toBe(0xf);
                    done();
                });
                device.temp19Handler([0x02, 0x01, 0xFA, 0xAF, 0x80, 0x14, 0x9f]);
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
                    expect(evt.temperature).toBe( - 14.4);
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
                    expect(evt.humidityStatus).toBe(rfxcom.humidity.NORMAL);
                    done();
                });
                device.temphumidity19Handler([0x03, 0x04, 0xAF, 0x01, 0x00, 0x90, 0x36, 0x02, 0x59]);
            });
        });
    });
});
