module.exports.toHaveSent = function(expected) {
  var actual = this.actual.bytesWritten,
      notText = this.isNot ? " not": "";

  this.message = function() {
    return "Expected " + actual + notText + " to equal " + expected;
  }
  return actual.toString() === expected.toString();
}