var exec = require('child_process').exec;
var Deferred = require('promised-io/promise').Deferred;

var Drush = {};

/**
 * Initializes the drush object by determining the path to the drush
 * executable.
 *
 * @return Promise.
 */
Drush.init = function () {
  var def = new Deferred();
  exec('which drush', function (err, stdout, sterr) {
    if (err) {
      return def.reject(err);
    }

    Drush.command = stdout.replace(/\s+/g, '');
    def.resolve();
  });

  return def.promise;
};

/**
 * Fetches the Drush version on the host machine.
 *
 * @return Promise.
 */
Drush.version = function () {
  var def = new Deferred();
  this.exec('--version')
    .then(
      function (res) {
        var version = res.match(/(\d+\.\d+.*)/);
        def.resolve(version[1]);
      },
      function (err) {
        def.reject(err);
      }
    );

  return def.promise;
};

/**
 * Execute a drush command.
 *
 * @param {string} command
 *   The drush command to execute.
 * @param {object} options
 *   A hash of options to add to the command, can contain:
 *     - alias: the drush alias, e.g. "@self" to execute the command with.
 *     - simulate: boolean, simulates all relevant actions.
 *     - uri: the URI of the drupal site to use.
 *
 * @return Promise
 */
Drush.exec = function (command, options) {
  options = options || {};
  var def = new Deferred();
  var cmd = Drush.command;
  var prop = '';

  if (options.alias) {
    cmd += ' ' + options.alias;
  }

  if (options.simulate) {
    cmd += ' -s';
  }

  if (options.uri) {
    cmd += ' -l ' + options.uri;
  }

  cmd += ' ' + command + ' -y';

  exec(cmd, function (err, stdout, stderr) {
    if (err) {
      return def.reject(err);
    }

    def.resolve(stdout);
  });

  return def.promise;
};

module.exports = Drush;

