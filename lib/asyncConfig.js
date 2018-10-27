/*jshint -W104 */
'use strict';
const
    Transmitter = require('./transmitter'),
    RfxCom = require('./rfxcom');

/*
 * This is a class for controlling FunkBus devices.
 */
class AsyncConfig extends Transmitter {
    constructor(rfxcom, subtype, options) {
        super(rfxcom, subtype, options);
        this.packetType = "asyncconfig";
        this.packetNumber = 0x61;
    }
}
