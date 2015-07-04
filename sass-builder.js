// TODO: or use more efficient node-sass (issues with installing it via jspm)
var Sass = require('sass.js/dist/sass.sync');

// FIXME: avoid copying this boilerplate from the plugin-css...
function escape(source) {
	return source
		.replace(/(["\\])/g, '\\$1')
		.replace(/[\f]/g, "\\f")
		.replace(/[\b]/g, "\\b")
		.replace(/[\n]/g, "\\n")
		.replace(/[\t]/g, "\\t")
		.replace(/[\r]/g, "\\r")
		.replace(/[\u2028]/g, "\\u2028")
		.replace(/[\u2029]/g, "\\u2029");
}

var cssInject = "(function(c){var d=document,a='appendChild',i='styleSheet',s=d.createElement('style');s.type='text/css';d.getElementsByTagName('head')[0][a](s);s[i]?s[i].cssText=c:s[a](d.createTextNode(c));})";

function compileSass(source) {
  return new Promise(function(resolve, reject) {
    Sass.compile(source, function(result) {
      // FIXME: source maps etc?
      resolve(result.text);
    });
    // FIXME: reject if errors?
  });

}

module.exports = function(loads, opts) {
  var stubDefines = loads.map(function(load) {
    return "System\.register('" + load.name + "', [], false, function() {});";
  }).join('\n');

  return Promise.all(loads.map(function(load) {
    return compileSass(load.source);
  })).then(function(compiledCss) {
    var cssOutput = compiledCss.join('\n');
    return [stubDefines, cssInject, '("' + escape(cssOutput) + '");'].join('\n');
  });
};
