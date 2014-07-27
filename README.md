node-daemontools
================

Control daemontools (`svc`, `svstat`) with Node

Installation
------------

    npm install daemontools

Example
-------

``` js
var daemontools = require('daemontools');

// check nginx status
daemontools.svstat('/service/nginx', function(err, stats) {
  if (err)
    throw err; // permission denied, service not found, etc.

  console.dir(stats);
});

// restart apache
daemontools.restart('/service/apache', function(err) {
  if (err)
    throw err; // permission denied, service not found, etc.

  // => service restarted
});
```

This example will show the current status of the `nginx` daemon, as well as
restart the `apache` service.

Usage
-----

### `daemontools.svstat(file, cb)`

A function that mimics `svstat(1)` by reading a daemons `status` file and extracting meaningful data.

- `file` - a service file
- `cb` - a function in the form of `function(err, stats)`

example:

``` js
daemontools.svstat('/service/nginx', function(err, stats) {
  console.dir(stats);
})
```

output

``` json
{
  "name": "nginx",
  "path": "/service/nginx",
  "pid": 3985,
  "up": true,
  "paused": false,
  "want": "up",
  "started": "2014-07-26T06:09:42.000Z",
  "uptime": 5
}
```

### `daemontools.svc(file, data, cb)`

mimics `svc(1)` by writing to a daemons `control` file

- `file` - a service file
- `data` - a string to pass to the `control` file, like `d` for down, `u` for up, etc.
- `cb` - a function in the form of `function(err)` (passed to `fs.writeFile`)

example:

``` js
daemontools.svc('/service/nginx', 'dx', function(err) {
  // => nginx is now disabled and exited
})
```

### convenience functions

The following functions have been defined to call `daemontools.svc` with predefined
arguments for convenience.

All functions take a file as the first argument and a callback as the second.  The names
were modeled after the arguments supported by the `svc(1)` program - http://cr.yp.to/daemontools/svc.html.

- `daemontools.up(file, cb)`
- `daemontools.down(file, cb)`
- `daemontools.once(file, cb)`
- `daemontools.term(file, cb)`
- `daemontools.kill(file, cb)`
- `daemontools.exit(file, cb)`
- `daemontools.pause(file, cb)`
- `daemontools.cont(file, cb)`
- `daemontools.hup(file, cb)`
- `daemontools.int(file, cb)`
- `daemontools.alarm(file, cb)`

And the following aliases have been defined

- `daemontools.start(file, cb)` - same as `up`
- `daemontools.stop(file, cb)` - same as `down`
- `daemontools.restart(file, cb)` - same as `term`

License
-------

LICENSE - "MIT License"
Copyright (c) 2013-2014 Voxer LLC. All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
