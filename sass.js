if (typeof window !== 'undefined') {
  var Sass = require('sass.js/dist/sass');

  // tell Sass.js where it can find the worker,
  // url is relative to document.URL - i.e. outside of whatever
  // Require or Browserify et al do for you
  // Sass.setWorkerUrl('/jspm_packages/npm/sass.js@0.9.2/dist/sass.worker.js');

  var sass = new Sass();

  var head = document.getElementsByTagName('head')[0];

  // get all injected style tags in the page
  var styles = document.getElementsByTagName('style');
  var styleIds = [];
  for (var i = 0; i < styles.length; i++) {
    if (styles[i].hasAttribute("data-href")) {
      styleIds.push(styles[i].getAttribute("data-href"));
    }
  }

  var loadStyle = function(url) {
    return new Promise(function(resolve, reject) {
      var request = new XMLHttpRequest();
      request.open('GET', url, true);

      request.onload = function() {
        if (request.status >= 200 && request.status < 400) {
          var data = request.responseText;

          sass.compile(data, function(result) {
            // inject it into the head as a style tag
            var style = document.createElement('style');
            style.textContent = result.text;
            style.setAttribute('type', 'text/css');
            style.setAttribute('data-type', 'text/scss');
            style.setAttribute('data-href', url);
            head.appendChild(style);
            resolve('');
          });

        } else {
          reject();
        }
      };

      request.onerror = function(e) {
        reject(e);
      };

      request.send();
    });
  };


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
