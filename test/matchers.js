/* global module: false */
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
