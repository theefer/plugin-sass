// TODO: or use more efficient node-sass (issues with installing it via jspm)
var Sass = require('sass.js/dist/sass.sync');

// TODO: allow building as external file

// Turn on source maps
// FIXME: embedded vs as external file?
Sass.options({
    // Embed included contents in maps
    sourceMapContents: true,
    // Embed sourceMappingUrl as data uri
    sourceMapEmbed: true,
    // Disable sourceMappingUrl in css output
    sourceMapOmitUrl: false
});

// Resolve @imports
var fs = require('fs');
Sass.importer(function(request, done) {
    var url = request.current;
    fs.readFile(url, {encoding: 'UTF-8'}, function(err, text) {
        if (err) {
            done({path: url, error: err.message});
        } else {
            done({path: url, content: text});
        }
    });
});

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

// FIXME: use link rel=stylesheet to make sourcemaps work?
var cssInject = "(function(c){var d=document,a='appendChild',i='styleSheet',s=d.createElement('style');s.type='text/css';d.getElementsByTagName('head')[0][a](s);s[i]?s[i].cssText=c:s[a](d.createTextNode(c));})";

function compileSass(source, url) {
  return new Promise(function(resolve, reject) {
    Sass.compile(source, {
      inputPath: url.replace('file://', ''),
      indentedSyntax: url.split('.').slice(-1)[0] == 'sass'
    }, function(result) {
      var successful = result.status === 0;
      if (successful) {
        resolve(result.text);
      } else {
        reject(result.formatted);
      }
    });
  });

}

module.exports = function(loads, opts) {
  var stubDefines = loads.map(function(load) {
    return "System\.register('" + load.name + "', [], false, function() {});";
  }).join('\n');

  return Promise.all(loads.map(function(load) {
    return compileSass(load.source, load.address);
  })).then(function(compiledCss) {
    var cssOutput = compiledCss.join('\n');
    return [stubDefines, cssInject, '("' + escape(cssOutput) + '");'].join('\n');
  });
};
