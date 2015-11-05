# SystemJS Sass plugin

A [Sass](http://sass-lang.com/) loader plugin for
[SystemJS](https://github.com/systemjs/systemjs), based on
[sass.js](https://github.com/medialize/sass.js).

This plugin allows importing Sass files from SystemJS and have them
dynamically compiled to CSS and loaded into the page from within the
browser.  Alternatively, the sass/scss files can also be converted to CSS
statically by creating bundles with
[JSPM](https://github.com/jspm/jspm-cli).

**Warning:** this plugin is in alpha version, has no error reporting
mechanism yet and has some blocking bugs (see Issues).


## Installation

```
$ jspm install sass=github:theefer/plugin-sass
```

## Usage

Add a dependency to a `.sass` file or a `.scss` file from within your
JavaScript files, followed by a `!` to trigger the use of this plugin:

``` js
// ES6
import 'styles.sass!';
import 'styles.scss!sass'; // For scss syntax

// or AMD
define(['styles.sass!'], function(){ ... });
define(['styles.scss!sass'], function(){ ... }); // For scss syntax

// or CommonJS
require('styles.sass!');
require('styles.scss!sass'); // For scss syntax
```

The corresponding compiled CSS should be injected into the `<head>` of
the document.
