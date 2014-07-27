#!/usr/bin/env node
/**
 * js version of `svstat`
 */

var daemontools = require('../');

var argv = process.argv.slice(2);
var i = 0;

function next() {
  if (i === argv.length)
    return;
  var file = argv[i++];
  daemontools.svstat(file, function(err, stats) {
    if (err)
      console.error('%s: %s', file, err.message);
    else
      console.log(JSON.stringify(stats, null, 2));
    next();
  });
}
next();
