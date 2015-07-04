
var sass = require('node-sass');

module.exports = function(loads, opts) {
  return new Promise(function(resolve, reject) {
    sass.render({
      data: loads.source
      // [, options..]
    }, function(err, result) {
      console.log("COMPILED", result);
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}
