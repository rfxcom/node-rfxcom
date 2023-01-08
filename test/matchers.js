/* global module: false */
/* module.exports.toHaveSent = function(expected) {
    const actual = this.actual.bytesWritten,
         notText = this.isNot ? " not": "";

    this.message = function() {
            return "Expected " + actual + notText + " to equal " + expected;
        };
    return actual.toString() === expected.toString();
};
 */
module.exports.toHaveSent = function(matchersUtil) {

    return {
        compare: function(actual, expected) {
            var passed = actual.bytesWritten.toString() === expected.toString();
            result = {pass: passed};
            if (passed) {
                notText = " not";
            } else {
                notText = "";
            }
            result.message = "Expected " + actual.bytesWritten + notText + " to equal " + expected
            
            return result
        }
    }
};
