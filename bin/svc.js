#!/usr/bin/env node
/**
 * js version of `svc`
 *
 * call this like: svc.js u /service/nginx
 *
 * 1st arg: letters to put in the `control` file
 * 2nd arg: service file
 */

var daemontools = require('../');

var data = process.argv[2];
var file = process.argv[3];

daemontools.svc(file, data, function(err) {
  if (err)
    console.error('%s: %s', file, err.message);
  else
    console.log('%s: sent message "%s"', file, data);
});
