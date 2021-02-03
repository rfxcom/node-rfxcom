/*jshint -W104 */
'use strict';
const defines = require('./defines'),
    Transmitter = require('./transmitter'),
    RfxCom = require('./rfxcom');

/*
 * This is a class for setting the Async port configuration (RFXtrx433XL only)
 */
class AsyncConfig extends Transmitter {
    constructor (rfxcom, subtype, options) {
        super (rfxcom, subtype, options);
        this.packetType = "asyncconfig";
        this.packetNumber = 0x61;
    }

}

module.exports = AsyncConfig;
