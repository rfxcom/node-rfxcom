/*jshint -W104 */
'use strict';
const defines = require('./defines'),
    Transmitter = require('./transmitter'),
    RfxCom = require('./rfxcom');

/*
 * This is a class for sending data to the Async port (RFXtrx433XL only)
 */
class AsyncData extends Transmitter {
    constructor (rfxcom, subtype, options) {
        super (rfxcom, subtype, options);
        this.packetType = "asyncdata";
        this.packetNumber = 0x62;
    }

}

module.exports = AsyncData;
