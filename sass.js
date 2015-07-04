if (typeof window !== 'undefined') {
console.log("HAS WINDOW")
  // load Sass.js
  var Sass = require('sass.js/dist/sass');

  // tell Sass.js where it can find the worker,
  // url is relative to document.URL - i.e. outside of whatever
  // Require or Browserify et al do for you
  Sass.setWorkerUrl('/jspm_packages/npm/sass.js@0.9.2/dist/sass.worker.js');

  // initialize a Sass instance
  var sass = new Sass();

  var head = document.getElementsByTagName('head')[0];

  // get all injected style tags in the page
  var styles = document.getElementsByTagName('style');
  var styleIds = [];
  for (var i = 0; i < styles.length; i++) {
    if(!styles[i].hasAttribute("data-href")) continue;
    styleIds.push(styles[i].getAttribute("data-href"));
  }

  var loadStyle = function(url) {
    return new Promise(function(resolve, reject) {
      var request = new XMLHttpRequest();
      request.open('GET', url, true);

      request.onload = function() {
        if (request.status >= 200 && request.status < 400) {
console.log("GOT", request.responseText);
          // Success!
          var data = request.responseText;

          //render it using less
          sass.compile(data, function(result) {
            console.log("COMPILED", result);

            //inject it into the head as a style tag
            var style = document.createElement('style');
            style.textContent = result.text;
            style.setAttribute('type','text/css');
            //store original type in the data-type attribute
            style.setAttribute('data-type','text/less');
            //store the url in the data-href attribute
            style.setAttribute('data-href', url);
            head.appendChild(style);
            resolve('');
          });

        } else {
          // We reached our target server, but it returned an error
          reject()
        }
      };

      request.onerror = function(e) {
        reject(e)
      };

      request.send();
    });
  }


  function fetch(load) {
    console.log("FETCH", load);
    // don't reload styles loaded in the head
    for (var i = 0; i < styleIds.length; i++)
      if (load.address == styleIds[i])
        return '';
    return loadStyle(load.address);
  }

  exports.fetch = fetch
  // return {
  //   fetch: fetch
  // };

} else {
console.log("NOT WINDOW");
  // setting format = 'defined' means we're managing our own output
  function translate(load) {
console.log("TRANSLATE", arguments);
    load.metadata.format = 'defined';
  }
  function bundle(loads, opts) {
console.log("BUNDLE", arguments);
//   // // load Sass.js
//   // var Sass = require('sass.js');
//   var Sass = require('sass.js/dist/sass.sync');
// //   var sass = new Sass();
// // console.log("SASS", sass);

//     return new Promise(function(resolve, reject) {
//       Sass.compile(loads.source, function(result) {
//         console.log("COMPILED", result);
//         resolve(result.text);
//       });
//     });
    var loader = this;
    return loader.import('./sass-builder').then(function(builder) {
      console.log("OK");
      console.log(builder);
    });
    // return System.import('./sass-plugin-builder').then(function(builder) {
    //   console.log("OK");
    //   console.log(builder);
    // });

    // return loader.import('./less-builder', { name: module.id }).then(function(builder) {
    //   return builder.call(loader, loads, opts);
    // });



  // // tell Sass.js where it can find the worker,
  // // url is relative to document.URL - i.e. outside of whatever
  // // Require or Browserify et al do for you
  // Sass.setWorkerUrl('/jspm_packages/npm/sass.js@0.9.2/dist/sass.worker.js');

  // // initialize a Sass instance
  // var sass = new Sass();


//     var loader = this;
//     if (loader.buildCSS === false)
//       return '';
// var module = {} // FIXME: HACK HACK
    // return loader.import('./less-builderxx', { name: module.id }).then(function(builder) {
    //   return builder.call(loader, loads, opts);
    // });
  }

  exports.translate = translate
  exports.bundle = bundle
  // return {
  //   translate: translate,
  //   bundle: bundle
  // }
}



// var less = require('less.js');

// if (typeof window !== 'undefined') {

//   var head = document.getElementsByTagName('head')[0];

//   // get all injected style tags in the page
//   var styles = document.getElementsByTagName('style');
//   var styleIds = [];
//   for (var i = 0; i < styles.length; i++) {
//     if(!styles[i].hasAttribute("data-href")) continue;
//     styleIds.push(styles[i].getAttribute("data-href"));
//   }

//   var loadStyle = function(url) {
//     return new Promise(function(resolve, reject) {
//       var request = new XMLHttpRequest();
//       request.open('GET', url, true);

//       request.onload = function() {
//         if (request.status >= 200 && request.status < 400) {
//           // Success!
//           var data = request.responseText;

//           //render it using less
//           less.render(data, {
//             filename: url,
//             rootpath: url.replace(/[^\/]*$/,'')
//           }).then(function(data){
//             //inject it into the head as a style tag
//             var style = document.createElement('style');
//             style.textContent = data.css;
//             style.setAttribute('type','text/css');
//             //store original type in the data-type attribute
//             style.setAttribute('data-type','text/less');
//             //store the url in the data-href attribute
//             style.setAttribute('data-href',url);
//             head.appendChild(style);
//             resolve('');
//           });

//         } else {
//           // We reached our target server, but it returned an error
//           reject()
//         }
//       };

//       request.onerror = function(e) {
//         reject(e)
//       };

//       request.send();
//     });
//   }

//   exports.fetch = function(load) {
//     // don't reload styles loaded in the head
//     for (var i = 0; i < styleIds.length; i++)
//       if (load.address == styleIds[i])
//         return '';
//     return loadStyle(load.address);
//   }
// }
// else {
//   // setting format = 'defined' means we're managing our own output
//   exports.translate = function(load) {
//     load.metadata.format = 'defined';
//   }
//   exports.bundle = function(loads, opts) {
//     var loader = this;
//     if (loader.buildCSS === false)
//       return '';
//     return loader.import('./less-builder', { name: module.id }).then(function(builder) {
//       return builder.call(loader, loads, opts);
//     });
//   }
// }
