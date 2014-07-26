/**
 * Control daemontools (svc, svstat) with Node
 *
 * (c) Voxer, Inc.
 *
 * Author: Dave Eddy <dave@daveeddy.com>
 * Date: July 26, 2014
 * License: MIT
 */

var execFile = require('child_process').execFile;
var fs = require('fs');
var path = require('path');

/**
 * a function that mimics `svstat` by reading a daemons
 * status file and extracting meaningful data
 *
 * example: svstat('/service/nginx', function(err, stats) {})
 *
 * file: service file
 * cb: callback function
 */
module.exports.svstat = svstat;
module.exports.status = svstat;
function svstat(file, cb) {
  var data = {
    name: path.basename(file),
    path: file
  };

  // TODO stat ./supervise/ok and ./down

  // read the status file like `svstat` would
  fs.readFile(path.join(file, 'supervise/status'), function(err, buf) {
    if (err) {
      cb(err);
      return;
    }

    try {
      data.pid = buf.readUInt32LE(12);
      data.up = !!data.pid;
      data.paused = !!buf[16];

      switch (String.fromCharCode(buf[17])) {
        case 'u': data.want = 'up'; break;
        case 'd': data.want = 'down'; break;
      }

      if (data.up) {
        // calculate uptime by getting the started time in TAI64 format
        data.started = new Date((buf.readInt32BE(4) - 10) * 1000);
        data.uptime = Math.floor((Date.now() - data.started.getTime()) / 1000);
      }
    } catch(e) {
      cb(e);
      return;
    }
    cb(null, data);
  });
}


/**
 * wrapper around `svc`
 *
 * example: svc('/service/nginx', ['d', 'x'], function(err, code) {})
 *
 * file: service file
 * args: an array of arguments to pass to `svc`
 * cb: a callback that takes 2 arguments: a possible error and the exit code of `svc`
 */
module.exports.svc = svc;
function svc(file, args, cb) {
  args.push(file);
  var child = execFile('svc', args, function(err, stdout, stderr) {
    var code = err && err.code || 0;
    if (err)
      return cb(err, code);
    else if (stderr)
      return cb(new Error('stderr generated: ' + stderr, code));
    else
      return cb(null, code);
  });
  return child;
}

// svc convenience functions
module.exports.up    = function up(file, cb)    { return svc(file, ['-u'], cb); };
module.exports.down  = function down(file, cb)  { return svc(file, ['-d'], cb); };
module.exports.once  = function once(file, cb)  { return svc(file, ['-o'], cb); };
module.exports.term  = function term(file, cb)  { return svc(file, ['-t'], cb); };
module.exports.kill  = function kill(file, cb)  { return svc(file, ['-k'], cb); };
module.exports.exit  = function exit(file, cb)  { return svc(file, ['-x'], cb); };
module.exports.pause = function pause(file, cb) { return svc(file, ['-p'], cb); };
module.exports.cont  = function cont(file, cb)  { return svc(file, ['-c'], cb); };
module.exports.hup   = function hup(file, cb)   { return svc(file, ['-h'], cb); };
module.exports.int   = function int(file, cb)   { return svc(file, ['-i'], cb); };
module.exports.alarm = function alarm(file, cb) { return svc(file, ['-a'], cb); };

// aliases
module.exports.start   = module.exports.up;
module.exports.stop    = module.exports.down;
module.exports.restart = module.exports.term;
