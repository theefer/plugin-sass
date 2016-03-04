if (typeof window !== 'undefined') {
  var Sass = require('sass.js/dist/sass');
  var sass = new Sass();

  // Turn on source maps
  sass.options({
    // Embed included contents in maps
    sourceMapContents: true,
    // Embed sourceMappingUrl as data uri
    sourceMapEmbed: true,
    // Disable sourceMappingUrl in css output
    sourceMapOmitUrl: false
  });

  // Resolve @imports
  sass.importer(function(request, done) {
    // TODO: relative to importing sass file
    //       see https://github.com/medialize/sass.js#using-the-sassjs-api
    var url = request.current;
    fetchText(url).then(function(text) {
      done({path: url, content: text});
    }, function(error) {
      done({path: url, error: error.message});
    });
  });


  var head = document.getElementsByTagName('head')[0];

  // get all injected style tags in the page
  var styles = document.getElementsByTagName('style');
  var styleIds = [];
  for (var i = 0; i < styles.length; i++) {
    if (styles[i].hasAttribute("data-href")) {
      styleIds.push(styles[i].getAttribute("data-href"));
    }
  }

  function fetch(load) {
    // don't reload styles loaded in the head
    for (var i = 0; i < styleIds.length; i++) {
      if (load.address === styleIds[i]) {
        return '';
      }
    }
    return loadStyle(load.address);
  }

  exports.fetch = fetch;

} else {
  // setting format = 'defined' means we're managing our own output
  function translate(load) {
    load.metadata.format = 'defined';
  }

  // dynamically load external sass-builder to avoid bundling
  // dependencies from being loaded with the plugin when in the
  // browser
  function bundle(loads, opts) {
    var loader = this;
    return loader.import('./sass-builder', { name: module.id }).then(function(builder) {
      return builder(loads, opts);
    });
  }

  exports.translate = translate;
  exports.bundle = bundle;
}



function fetchText(url) {
  return new Promise(function(resolve, reject) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);

    request.onload = function() {
      if (request.status >= 200 && request.status < 400) {
        resolve(request.responseText);
      } else {
        reject(new Error('Request error for "' +url+ '" with status ' + request.status));
      }
    };

    request.onerror = function(e) {
      reject(e);
    };

    request.send();
  });
}


function base64(text) {
  return window.btoa(text);
}

// inject style into the head as a style tag
// Note: use link and data-URI to allow source maps to work, unlike <style>
function injectStyle(css, url) {
  var base64css = base64(css);
  var link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href= 'data:text/css;charset=utf-8;base64,' + base64css;
  head.appendChild(link);
}

/*
// inject style into the head as a style tag
function injectStyle(css, url) {
  var style = document.createElement('style');
  style.textContent = css;
  style.setAttribute('type', 'text/css');
  style.setAttribute('data-type', 'text/scss');
  style.setAttribute('data-href', url);
  head.appendChild(style);
}
*/

function loadStyle(url) {
  return fetchText(url).then(function(data) {
    return new Promise(function(resolve, reject) {
      sass.compile(data, {
        inputPath: url,
        indentedSyntax: url.split('.').slice(-1)[0] == 'sass'
      }, function(result) {
        var successful = result.status === 0;
        if (successful) {
          injectStyle(result.text, url);
          resolve('');
        } else {
          reject(result.formatted);
        }
      });
    });
  });
};
