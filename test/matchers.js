/* global module: false */
module.exports.toHaveSent = function(expected) {
    const actual = this.actual.bytesWritten,
         notText = this.isNot ? " not": "";

    this.message = function() {
            return "Expected " + actual + notText + " to equal " + expected;
        };
    return actual.toString() === expected.toString();
};
