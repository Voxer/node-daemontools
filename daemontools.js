/**
 * Control daemontools (svc, svstat) with Node
 *
 * (c) Voxer, Inc.
 *
 * Author: Dave Eddy <dave@daveeddy.com>
 * Date: July 26, 2014
 * License: MIT
 */

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

      // what state the service wants to be in
      switch (String.fromCharCode(buf[17])) {
        case 'u': data.want = 'up'; break;
        case 'd': data.want = 'down'; break;
      }

      // calculate uptime by getting the started time in TAI64 format
      data.changed = new Date((buf.readInt32BE(4) - 10) * 1000);
      data.elapsed = Math.floor((Date.now() - data.changed.getTime()) / 1000);

      // remove the pid if the process is down
      if (!data.up) {
        delete data.pid;
      }
    } catch(e) {
      cb(e);
      return;
    }
    cb(null, data);
  });
}


/**
 * send commands to a processes ./supervise/control file
 *
 * example: svc('/service/nginx', 'du', function(err) {})
 *
 * file: service file
 * data: a string to send to the control file
 * cb: a callback that takes 1 argument: any possible error
 */
module.exports.svc = svc;
function svc(file, data, cb) {
  return fs.appendFile(path.join(file, 'supervise/control'), data, cb);
}

// svc convenience functions
module.exports.up    = function up(file, cb)    { return svc(file, 'u', cb); };
module.exports.down  = function down(file, cb)  { return svc(file, 'd', cb); };
module.exports.once  = function once(file, cb)  { return svc(file, 'o', cb); };
module.exports.term  = function term(file, cb)  { return svc(file, 't', cb); };
module.exports.kill  = function kill(file, cb)  { return svc(file, 'k', cb); };
module.exports.exit  = function exit(file, cb)  { return svc(file, 'x', cb); };
module.exports.pause = function pause(file, cb) { return svc(file, 'p', cb); };
module.exports.cont  = function cont(file, cb)  { return svc(file, 'c', cb); };
module.exports.hup   = function hup(file, cb)   { return svc(file, 'h', cb); };
module.exports.int   = function int(file, cb)   { return svc(file, 'i', cb); };
module.exports.alarm = function alarm(file, cb) { return svc(file, 'a', cb); };

// aliases
module.exports.start   = module.exports.up;
module.exports.stop    = module.exports.down;
module.exports.restart = module.exports.term;
