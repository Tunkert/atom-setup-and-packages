Object.defineProperty(exports, '__esModule', {
  value: true
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies

var _atom = require('atom');

'use babel';

var fs = undefined;
var path = undefined;
var helpers = undefined;
var semver = undefined;

function loadDeps() {
  if (!semver) {
    semver = require('semver');
  }
  if (!fs) {
    fs = require('fs-plus');
  }
  if (!helpers) {
    helpers = require('atom-linter');
  }
  if (!path) {
    path = require('path');
  }
}

// Local variables
var parseRegex = /(\d+):(\d+):\s(([A-Z])\d{2,3})\s+(.*)/g;
var execPathVersions = new Map();

var applySubstitutions = function applySubstitutions(givenExecPath, projDir) {
  var execPath = givenExecPath;
  var projectName = path.basename(projDir);
  execPath = execPath.replace(/\$PROJECT_NAME/ig, projectName);
  execPath = execPath.replace(/\$PROJECT/ig, projDir);
  var paths = execPath.split(';');
  for (var i = 0; i < paths.length; i += 1) {
    if (fs.existsSync(paths[i])) {
      return paths[i];
    }
  }
  return execPath;
};

var getVersionString = _asyncToGenerator(function* (versionPath) {
  if (!Object.hasOwnProperty.call(getVersionString, 'cache')) {
    getVersionString.cache = new Map();
  }
  if (!getVersionString.cache.has(versionPath)) {
    getVersionString.cache.set(versionPath, (yield helpers.exec(versionPath, ['--version'])));
  }
  return getVersionString.cache.get(versionPath);
});

var generateInvalidPointTrace = _asyncToGenerator(function* (execPath, match, filePath, textEditor, point) {
  var flake8Version = yield getVersionString(execPath);
  var issueURL = 'https://github.com/AtomLinter/linter-flake8/issues/new';
  var title = encodeURIComponent('Flake8 rule \'' + match[3] + '\' reported an invalid point');
  var body = encodeURIComponent(['Flake8 reported an invalid point for the rule `' + match[3] + '`, ' + ('with the messge `' + match[5] + '`.'), '', '', '<!-- If at all possible, please include code that shows this issue! -->', '', '', 'Debug information:', 'Atom version: ' + atom.getVersion(), 'Flake8 version: `' + flake8Version + '`'].join('\n'));
  var newIssueURL = issueURL + '?title=' + title + '&body=' + body;
  return {
    severity: 'error',
    description: ['ERROR: Flake8 provided an invalid point! See below the details. ', '<a href="' + newIssueURL + '">Report this</a>', '', '', 'Original message: ' + match[3] + ' — ' + match[5], '', '', 'Requested point: ' + point[0] + ':' + point[1]].join('\n'),
    location: {
      file: filePath,
      position: helpers.generateRange(textEditor, 0)
    },
    excerpt: 'Flake8 error: invalid point'
  };
});

var determineExecVersion = _asyncToGenerator(function* (execPath) {
  var versionString = yield helpers.exec(execPath, ['--version'], { ignoreExitCode: true });
  var versionPattern = /^[^\s]+/g;
  var match = versionString.match(versionPattern);
  if (match !== null) {
    execPathVersions.set(execPath, match[0]);
  }
});

var getFlake8Version = _asyncToGenerator(function* (execPath) {
  if (!execPathVersions.has(execPath)) {
    yield determineExecVersion(execPath);
  }
  return execPathVersions.get(execPath);
});

exports['default'] = {
  activate: function activate() {
    var _this = this;

    this.idleCallbacks = new Set();

    var packageDepsID = undefined;
    var linterFlake8Deps = function linterFlake8Deps() {
      _this.idleCallbacks['delete'](packageDepsID);

      // Request checking / installation of package dependencies
      if (!atom.inSpecMode()) {
        require('atom-package-deps').install('linter-flake8');
      }

      // FIXME: Remove after a few versions
      if (typeof atom.config.get('linter-flake8.disableTimeout') !== 'undefined') {
        atom.config.unset('linter-flake8.disableTimeout');
      }
      loadDeps();
    };
    packageDepsID = window.requestIdleCallback(linterFlake8Deps);
    this.idleCallbacks.add(packageDepsID);

    this.subscriptions = new _atom.CompositeDisposable();
    this.subscriptions.add(atom.config.observe('linter-flake8.projectConfigFile', function (value) {
      _this.projectConfigFile = value;
    }), atom.config.observe('linter-flake8.maxLineLength', function (value) {
      _this.maxLineLength = value;
    }), atom.config.observe('linter-flake8.ignoreErrorCodes', function (value) {
      _this.ignoreErrorCodes = value;
    }), atom.config.observe('linter-flake8.maxComplexity', function (value) {
      _this.maxComplexity = value;
    }), atom.config.observe('linter-flake8.selectErrors', function (value) {
      _this.selectErrors = value;
    }), atom.config.observe('linter-flake8.hangClosing', function (value) {
      _this.hangClosing = value;
    }), atom.config.observe('linter-flake8.executablePath', function (value) {
      _this.executablePath = value;
    }), atom.config.observe('linter-flake8.pycodestyleErrorsToWarnings', function (value) {
      _this.pycodestyleErrorsToWarnings = value;
    }), atom.config.observe('linter-flake8.flakeErrors', function (value) {
      _this.flakeErrors = value;
    }), atom.config.observe('linter-flake8.builtins', function (value) {
      _this.builtins = value;
    }));
  },

  deactivate: function deactivate() {
    this.idleCallbacks.forEach(function (callbackID) {
      return window.cancelIdleCallback(callbackID);
    });
    this.idleCallbacks.clear();
    this.subscriptions.dispose();
  },

  provideLinter: function provideLinter() {
    var _this2 = this;

    return {
      name: 'Flake8',
      grammarScopes: ['source.python', 'source.python.django'],
      scope: 'file',
      lintsOnChange: true,
      lint: _asyncToGenerator(function* (textEditor) {
        if (!atom.workspace.isTextEditor(textEditor)) {
          // Invalid TextEditor
          return null;
        }

        var filePath = textEditor.getPath();
        if (!filePath) {
          // Invalid path
          return null;
        }
        var fileText = textEditor.getText();

        // Load dependencies if they aren't already
        loadDeps();

        var parameters = ['--format=default'];

        var projectPath = atom.project.relativizePath(filePath)[0];
        var baseDir = projectPath !== null ? projectPath : path.dirname(filePath);
        var configFilePath = yield helpers.findCachedAsync(baseDir, _this2.projectConfigFile);
        var execPath = fs.normalize(applySubstitutions(_this2.executablePath, baseDir));

        // get the version of Flake8
        var version = yield getFlake8Version(execPath);

        // stdin-display-name available since 3.0.0
        if (semver.valid(version) && semver.gte(version, '3.0.0')) {
          parameters.push('--stdin-display-name', filePath);
        }

        if (_this2.projectConfigFile && baseDir !== null && configFilePath !== null) {
          parameters.push('--config', configFilePath);
        } else {
          if (_this2.maxLineLength) {
            parameters.push('--max-line-length', _this2.maxLineLength);
          }
          if (_this2.ignoreErrorCodes.length) {
            parameters.push('--ignore', _this2.ignoreErrorCodes.join(','));
          }
          if (_this2.maxComplexity !== 79) {
            parameters.push('--max-complexity', _this2.maxComplexity);
          }
          if (_this2.hangClosing) {
            parameters.push('--hang-closing');
          }
          if (_this2.selectErrors.length) {
            parameters.push('--select', _this2.selectErrors.join(','));
          }
          if (_this2.builtins.length) {
            parameters.push('--builtins', _this2.builtins.join(','));
          }
        }

        parameters.push('-');

        var forceTimeout = 1000 * 60 * 5; // (ms * s * m) = Five minutes
        var options = {
          stdin: fileText,
          cwd: baseDir,
          ignoreExitCode: true,
          timeout: forceTimeout,
          uniqueKey: 'linter-flake8:' + filePath
        };

        var result = undefined;
        try {
          result = yield helpers.exec(execPath, parameters, options);
        } catch (e) {
          var pyTrace = e.message.split('\n');
          var pyMostRecent = pyTrace[pyTrace.length - 1];
          atom.notifications.addError('Flake8 crashed!', {
            detail: 'linter-flake8:: Flake8 threw an error related to:\n' + (pyMostRecent + '\n') + "Please check Atom's Console for more details"
          });
          // eslint-disable-next-line no-console
          console.error('linter-flake8:: Flake8 returned an error', e.message);
          // Tell Linter to not update any current messages it may have
          return null;
        }

        if (result === null) {
          // Process was killed by a future invocation
          return null;
        }

        if (textEditor.getText() !== fileText) {
          // Editor contents have changed, tell Linter not to update
          return null;
        }

        var messages = [];

        var match = parseRegex.exec(result);
        while (match !== null) {
          // Note that these positions are being converted to 0-indexed
          var line = Number.parseInt(match[1], 10) - 1 || 0;
          var col = Number.parseInt(match[2], 10) - 1 || undefined;

          var isErr = match[4] === 'E' && !_this2.pycodestyleErrorsToWarnings || match[4] === 'F' && _this2.flakeErrors;

          try {
            messages.push({
              severity: isErr ? 'error' : 'warning',
              excerpt: match[3] + ' — ' + match[5],
              location: {
                file: filePath,
                position: helpers.generateRange(textEditor, line, col)
              }
            });
          } catch (error) {
            // generateRange encountered an invalid point
            var point = [line + 1, col + 1];
            var m = generateInvalidPointTrace(execPath, match, filePath, textEditor, point);
            messages.push(m);
          }

          match = parseRegex.exec(result);
        }
        // Ensure that any invalid point messages have finished resolving
        return Promise.all(messages);
      })
    };
  }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3R1bmtlcnQvLmF0b20vcGFja2FnZXMvbGludGVyLWZsYWtlOC9saWIvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztvQkFHb0MsTUFBTTs7QUFIMUMsV0FBVyxDQUFDOztBQUtaLElBQUksRUFBRSxZQUFBLENBQUM7QUFDUCxJQUFJLElBQUksWUFBQSxDQUFDO0FBQ1QsSUFBSSxPQUFPLFlBQUEsQ0FBQztBQUNaLElBQUksTUFBTSxZQUFBLENBQUM7O0FBRVgsU0FBUyxRQUFRLEdBQUc7QUFDbEIsTUFBSSxDQUFDLE1BQU0sRUFBRTtBQUNYLFVBQU0sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7R0FDNUI7QUFDRCxNQUFJLENBQUMsRUFBRSxFQUFFO0FBQ1AsTUFBRSxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztHQUN6QjtBQUNELE1BQUksQ0FBQyxPQUFPLEVBQUU7QUFDWixXQUFPLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0dBQ2xDO0FBQ0QsTUFBSSxDQUFDLElBQUksRUFBRTtBQUNULFFBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7R0FDeEI7Q0FDRjs7O0FBR0QsSUFBTSxVQUFVLEdBQUcsd0NBQXdDLENBQUM7QUFDNUQsSUFBTSxnQkFBZ0IsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDOztBQUVuQyxJQUFNLGtCQUFrQixHQUFHLFNBQXJCLGtCQUFrQixDQUFJLGFBQWEsRUFBRSxPQUFPLEVBQUs7QUFDckQsTUFBSSxRQUFRLEdBQUcsYUFBYSxDQUFDO0FBQzdCLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDM0MsVUFBUSxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsa0JBQWtCLEVBQUUsV0FBVyxDQUFDLENBQUM7QUFDN0QsVUFBUSxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUFFLE9BQU8sQ0FBQyxD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RixvQkFBUSxDQUFDLElBQUksQ0FBQztBQUNaLHNCQUFRLEVBQUUsS0FBSyxHQUFHLE9BQU8sR0FBRyxTQUFTO0FBQ3JDLHFCQUFPLEVBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxXQUFNLEtBQUssQ0FBQyxDQUFDLENBQUMsQUFBRTtBQUNwQyxzQkFBUSxFQUFFO0FBQ1Isb0JBQUksRUFBRSxRQUFRO0FBQ2Qsd0JBQVEsRUFBRSxPQUFPLENBQUMsYUFBYSxDQUFDLFVBQVUsRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDO2VBQ3ZEO2FBQ0YsQ0FBQyxDQUFDO1dBQ0osQ0FBQyxPQUFPLEtBQUssRUFBRTs7QUFFZCxnQkFBTSxLQUFLLEdBQUcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNsQyxnQkFBTSxDQUFDLEdBQUcseUJBQXlCLENBQUMsUUFBUSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQ2xGLG9CQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1dBQ2xCOztBQUVELGVBQUssR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQ2pDOztBQUVELGVBQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztPQUM5QixDQUFBO0tBQ0YsQ0FBQztHQUNIO0NBQ0YiLCJmaWxlIjoiL2hvbWUvdHVua2VydC8uYXRvbS9wYWNrYWdlcy9saW50ZXItZmxha2U4L2xpYi9tYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBpbXBvcnQvZXh0ZW5zaW9ucywgaW1wb3J0L25vLWV4dHJhbmVvdXMtZGVwZW5kZW5jaWVzXG5pbXBvcnQgeyBDb21wb3NpdGVEaXNwb3NhYmxlIH0gZnJvbSAnYXRvbSc7XG5cbmxldCBmcztcbmxldCBwYXRoO1xubGV0IGhlbHBlcnM7XG5sZXQgc2VtdmVyO1xuXG5mdW5jdGlvbiBsb2FkRGVwcygpIHtcbiAgaWYgKCFzZW12ZXIpIHtcbiAgICBzZW12ZXIgPSByZXF1aXJlKCdzZW12ZXInKTtcbiAgfVxuICBpZiAoIWZzKSB7XG4gICAgZnMgPSByZXF1aXJlKCdmcy1wbHVzJyk7XG4gIH1cbiAgaWYgKCFoZWxwZXJzKSB7XG4gICAgaGVscGVycyA9IHJlcXVpcmUoJ2F0b20tbGludGVyJyk7XG4gIH1cbiAgaWYgKCFwYXRoKSB7XG4gICAgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbiAgfVxufVxuXG4vLyBMb2NhbCB2YXJpYWJsZXNcbmNvbnN0IHBhcnNlUmVnZXggPSAvKFxcZCspOihcXGQrKTpcXHMoKFtBLVpdKVxcZHsyLDN9KVxccysoLiopL2c7XG5jb25zdCBleGVjUGF0aFZlcnNpb25zID0gbmV3IE1hcCgpO1xuXG5jb25zdCBhcHBseVN1YnN0aXR1dGlvbnMgPSAoZ2l2ZW5FeGVjUGF0aCwgcHJvakRpcikgPT4ge1xuICBsZXQgZXhlY1BhdGggPSBnaXZlbkV4ZWNQYXRoO1xuICBjb25zdCBwcm9qZWN0TmFtZSA9IHBhdGguYmFzZW5hbWUocHJvakRpcik7XG4gIGV4ZWNQYXRoID0gZXhlY1BhdGgucmVwbGFjZSgvXFwkUFJPSkVDVF9OQU1FL2lnLCBwcm9qZWN0TmFtZSk7XG4gIGV4ZWNQYXRoID0gZXhlY1BhdGgucmVwbGFjZSgvXFwkUFJPSkVDVC9pZywgcHJvakRpcik7XG4gIGNvbnN0IHBhdGhzID0gZXhlY1BhdGguc3BsaXQoJzsnKTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBwYXRocy5sZW5ndGg7IGkgKz0gMSkge1xuICAgIGlmIChmcy5leGlzdHNTeW5jKHBhdGhzW2ldKSkge1xuICAgICAgcmV0dXJuIHBhdGhzW2ldO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZXhlY1BhdGg7XG59O1xuXG5jb25zdCBnZXRWZXJzaW9uU3RyaW5nID0gYXN5bmMgKHZlcnNpb25QYXRoKSA9PiB7XG4gIGlmICghT2JqZWN0Lmhhc093blByb3BlcnR5LmNhbGwoZ2V0VmVyc2lvblN0cmluZywgJ2NhY2hlJykpIHtcbiAgICBnZXRWZXJzaW9uU3RyaW5nLmNhY2hlID0gbmV3IE1hcCgpO1xuICB9XG4gIGlmICghZ2V0VmVyc2lvblN0cmluZy5jYWNoZS5oYXModmVyc2lvblBhdGgpKSB7XG4gICAgZ2V0VmVyc2lvblN0cmluZy5jYWNoZS5zZXQoXG4gICAgICB2ZXJzaW9uUGF0aCxcbiAgICAgIGF3YWl0IGhlbHBlcnMuZXhlYyh2ZXJzaW9uUGF0aCwgWyctLXZlcnNpb24nXSksXG4gICAgKTtcbiAgfVxuICByZXR1cm4gZ2V0VmVyc2lvblN0cmluZy5jYWNoZS5nZXQodmVyc2lvblBhdGgpO1xufTtcblxuY29uc3QgZ2VuZXJhdGVJbnZhbGlkUG9pbnRUcmFjZSA9IGFzeW5jIChleGVjUGF0aCwgbWF0Y2gsIGZpbGVQYXRoLCB0ZXh0RWRpdG9yLCBwb2ludCkgPT4ge1xuICBjb25zdCBmbGFrZThWZXJzaW9uID0gYXdhaXQgZ2V0VmVyc2lvblN0cmluZyhleGVjUGF0aCk7XG4gIGNvbnN0IGlzc3VlVVJMID0gJ2h0dHBzOi8vZ2l0aHViLmNvbS9BdG9tTGludGVyL2xpbnRlci1mbGFrZTgvaXNzdWVzL25ldyc7XG4gIGNvbnN0IHRpdGxlID0gZW5jb2RlVVJJQ29tcG9uZW50KGBGbGFrZTggcnVsZSAnJHttYXRjaFszXX0nIHJlcG9ydGVkIGFuIGludmFsaWQgcG9pbnRgKTtcbiAgY29uc3QgYm9keSA9IGVuY29kZVVSSUNvbXBvbmVudChbXG4gICAgYEZsYWtlOCByZXBvcnRlZCBhbiBpbnZhbGlkIHBvaW50IGZvciB0aGUgcnVsZSBcXGAke21hdGNoWzNdfVxcYCwgYCArXG4gICAgYHdpdGggdGhlIG1lc3NnZSBcXGAke21hdGNoWzVdfVxcYC5gLFxuICAgICcnLCAnJyxcbiAgICAnPCEtLSBJZiBhdCBhbGwgcG9zc2libGUsIHBsZWFzZSBpbmNsdWRlIGNvZGUgdGhhdCBzaG93cyB0aGlzIGlzc3VlISAtLT4nLFxuICAgICcnLCAnJyxcbiAgICAnRGVidWcgaW5mb3JtYXRpb246JyxcbiAgICBgQXRvbSB2ZXJzaW9uOiAke2F0b20uZ2V0VmVyc2lvbigpfWAsXG4gICAgYEZsYWtlOCB2ZXJzaW9uOiBcXGAke2ZsYWtlOFZlcnNpb259XFxgYCxcbiAgXS5qb2luKCdcXG4nKSk7XG4gIGNvbnN0IG5ld0lzc3VlVVJMID0gYCR7aXNzdWVVUkx9P3RpdGxlPSR7dGl0bGV9JmJvZHk9JHtib2R5fWA7XG4gIHJldHVybiB7XG4gICAgc2V2ZXJpdHk6ICdlcnJvcicsXG4gICAgZGVzY3JpcHRpb246IFtcbiAgICAgICdFUlJPUjogRmxha2U4IHByb3ZpZGVkIGFuIGludmFsaWQgcG9pbnQhIFNlZSBiZWxvdyB0aGUgZGV0YWlscy4gJyxcbiAgICAgIGA8YSBocmVmPVwiJHtuZXdJc3N1ZVVSTH1cIj5SZXBvcnQgdGhpczwvYT5gLCAnJywgJycsXG4gICAgICBgT3JpZ2luYWwgbWVzc2FnZTogJHttYXRjaFszXX0g4oCUICR7bWF0Y2hbNV19YCwgJycsICcnLFxuICAgICAgYFJlcXVlc3RlZCBwb2ludDogJHtwb2ludFswXX06JHtwb2ludFsxXX1gLFxuICAgIF0uam9pbignXFxuJyksXG4gICAgbG9jYXRpb246IHtcbiAgICAgIGZpbGU6IGZpbGVQYXRoLFxuICAgICAgcG9zaXRpb246IGhlbHBlcnMuZ2VuZXJhdGVSYW5nZSh0ZXh0RWRpdG9yLCAwKSxcbiAgICB9LFxuICAgIGV4Y2VycHQ6ICdGbGFrZTggZXJyb3I6IGludmFsaWQgcG9pbnQnLFxuICB9O1xufTtcblxuY29uc3QgZGV0ZXJtaW5lRXhlY1ZlcnNpb24gPSBhc3luYyAoZXhlY1BhdGgpID0+IHtcbiAgY29uc3QgdmVyc2lvblN0cmluZyA9IGF3YWl0IGhlbHBlcnMuZXhlYyhleGVjUGF0aCwgWyctLXZlcnNpb24nXSwgeyBpZ25vcmVFeGl0Q29kZTogdHJ1ZSB9KTtcbiAgY29uc3QgdmVyc2lvblBhdHRlcm4gPSAvXlteXFxzXSsvZztcbiAgY29uc3QgbWF0Y2ggPSB2ZXJzaW9uU3RyaW5nLm1hdGNoKHZlcnNpb25QYXR0ZXJuKTtcbiAgaWYgKG1hdGNoICE9PSBudWxsKSB7XG4gICAgZXhlY1BhdGhWZXJzaW9ucy5zZXQoZXhlY1BhdGgsIG1hdGNoWzBdKTtcbiAgfVxufTtcblxuY29uc3QgZ2V0Rmxha2U4VmVyc2lvbiA9IGFzeW5jIChleGVjUGF0aCkgPT4ge1xuICBpZiAoIWV4ZWNQYXRoVmVyc2lvbnMuaGFzKGV4ZWNQYXRoKSkge1xuICAgIGF3YWl0IGRldGVybWluZUV4ZWNWZXJzaW9uKGV4ZWNQYXRoKTtcbiAgfVxuICByZXR1cm4gZXhlY1BhdGhWZXJzaW9ucy5nZXQoZXhlY1BhdGgpO1xufTtcblxuZXhwb3J0IGRlZmF1bHQge1xuICBhY3RpdmF0ZSgpIHtcbiAgICB0aGlzLmlkbGVDYWxsYmFja3MgPSBuZXcgU2V0KCk7XG5cbiAgICBsZXQgcGFja2FnZURlcHNJRDtcbiAgICBjb25zdCBsaW50ZXJGbGFrZThEZXBzID0gKCkgPT4ge1xuICAgICAgdGhpcy5pZGxlQ2FsbGJhY2tzLmRlbGV0ZShwYWNrYWdlRGVwc0lEKTtcblxuICAgICAgLy8gUmVxdWVzdCBjaGVja2luZyAvIGluc3RhbGxhdGlvbiBvZiBwYWNrYWdlIGRlcGVuZGVuY2llc1xuICAgICAgaWYgKCFhdG9tLmluU3BlY01vZGUoKSkge1xuICAgICAgICByZXF1aXJlKCdhdG9tLXBhY2thZ2UtZGVwcycpLmluc3RhbGwoJ2xpbnRlci1mbGFrZTgnKTtcbiAgICAgIH1cblxuICAgICAgLy8gRklYTUU6IFJlbW92ZSBhZnRlciBhIGZldyB2ZXJzaW9uc1xuICAgICAgaWYgKHR5cGVvZiBhdG9tLmNvbmZpZy5nZXQoJ2xpbnRlci1mbGFrZTguZGlzYWJsZVRpbWVvdXQnKSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgYXRvbS5jb25maWcudW5zZXQoJ2xpbnRlci1mbGFrZTguZGlzYWJsZVRpbWVvdXQnKTtcbiAgICAgIH1cbiAgICAgIGxvYWREZXBzKCk7XG4gICAgfTtcbiAgICBwYWNrYWdlRGVwc0lEID0gd2luZG93LnJlcXVlc3RJZGxlQ2FsbGJhY2sobGludGVyRmxha2U4RGVwcyk7XG4gICAgdGhpcy5pZGxlQ2FsbGJhY2tzLmFkZChwYWNrYWdlRGVwc0lEKTtcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci1mbGFrZTgucHJvamVjdENvbmZpZ0ZpbGUnLCAodmFsdWUpID0+IHtcbiAgICAgICAgdGhpcy5wcm9qZWN0Q29uZmlnRmlsZSA9IHZhbHVlO1xuICAgICAgfSksXG4gICAgICBhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXItZmxha2U4Lm1heExpbmVMZW5ndGgnLCAodmFsdWUpID0+IHtcbiAgICAgICAgdGhpcy5tYXhMaW5lTGVuZ3RoID0gdmFsdWU7XG4gICAgICB9KSxcbiAgICAgIGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci1mbGFrZTguaWdub3JlRXJyb3JDb2RlcycsICh2YWx1ZSkgPT4ge1xuICAgICAgICB0aGlzLmlnbm9yZUVycm9yQ29kZXMgPSB2YWx1ZTtcbiAgICAgIH0pLFxuICAgICAgYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLWZsYWtlOC5tYXhDb21wbGV4aXR5JywgKHZhbHVlKSA9PiB7XG4gICAgICAgIHRoaXMubWF4Q29tcGxleGl0eSA9IHZhbHVlO1xuICAgICAgfSksXG4gICAgICBhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXItZmxha2U4LnNlbGVjdEVycm9ycycsICh2YWx1ZSkgPT4ge1xuICAgICAgICB0aGlzLnNlbGVjdEVycm9ycyA9IHZhbHVlO1xuICAgICAgfSksXG4gICAgICBhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXItZmxha2U4LmhhbmdDbG9zaW5nJywgKHZhbHVlKSA9PiB7XG4gICAgICAgIHRoaXMuaGFuZ0Nsb3NpbmcgPSB2YWx1ZTtcbiAgICAgIH0pLFxuICAgICAgYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLWZsYWtlOC5leGVjdXRhYmxlUGF0aCcsICh2YWx1ZSkgPT4ge1xuICAgICAgICB0aGlzLmV4ZWN1dGFibGVQYXRoID0gdmFsdWU7XG4gICAgICB9KSxcbiAgICAgIGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci1mbGFrZTgucHljb2Rlc3R5bGVFcnJvcnNUb1dhcm5pbmdzJywgKHZhbHVlKSA9PiB7XG4gICAgICAgIHRoaXMucHljb2Rlc3R5bGVFcnJvcnNUb1dhcm5pbmdzID0gdmFsdWU7XG4gICAgICB9KSxcbiAgICAgIGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci1mbGFrZTguZmxha2VFcnJvcnMnLCAodmFsdWUpID0+IHtcbiAgICAgICAgdGhpcy5mbGFrZUVycm9ycyA9IHZhbHVlO1xuICAgICAgfSksXG4gICAgICBhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXItZmxha2U4LmJ1aWx0aW5zJywgKHZhbHVlKSA9PiB7XG4gICAgICAgIHRoaXMuYnVpbHRpbnMgPSB2YWx1ZTtcbiAgICAgIH0pLFxuICAgICk7XG4gIH0sXG5cbiAgZGVhY3RpdmF0ZSgpIHtcbiAgICB0aGlzLmlkbGVDYWxsYmFja3MuZm9yRWFjaChjYWxsYmFja0lEID0+IHdpbmRvdy5jYW5jZWxJZGxlQ2FsbGJhY2soY2FsbGJhY2tJRCkpO1xuICAgIHRoaXMuaWRsZUNhbGxiYWNrcy5jbGVhcigpO1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gIH0sXG5cbiAgcHJvdmlkZUxpbnRlcigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbmFtZTogJ0ZsYWtlOCcsXG4gICAgICBncmFtbWFyU2NvcGVzOiBbJ3NvdXJjZS5weXRob24nLCAnc291cmNlLnB5dGhvbi5kamFuZ28nXSxcbiAgICAgIHNjb3BlOiAnZmlsZScsXG4gICAgICBsaW50c09uQ2hhbmdlOiB0cnVlLFxuICAgICAgbGludDogYXN5bmMgKHRleHRFZGl0b3IpID0+IHtcbiAgICAgICAgaWYgKCFhdG9tLndvcmtzcGFjZS5pc1RleHRFZGl0b3IodGV4dEVkaXRvcikpIHtcbiAgICAgICAgICAvLyBJbnZhbGlkIFRleHRFZGl0b3JcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGZpbGVQYXRoID0gdGV4dEVkaXRvci5nZXRQYXRoKCk7XG4gICAgICAgIGlmICghZmlsZVBhdGgpIHtcbiAgICAgICAgICAvLyBJbnZhbGlkIHBhdGhcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBmaWxlVGV4dCA9IHRleHRFZGl0b3IuZ2V0VGV4dCgpO1xuXG4gICAgICAgIC8vIExvYWQgZGVwZW5kZW5jaWVzIGlmIHRoZXkgYXJlbid0IGFscmVhZHlcbiAgICAgICAgbG9hZERlcHMoKTtcblxuICAgICAgICBjb25zdCBwYXJhbWV0ZXJzID0gWyctLWZvcm1hdD1kZWZhdWx0J107XG5cbiAgICAgICAgY29uc3QgcHJvamVjdFBhdGggPSBhdG9tLnByb2plY3QucmVsYXRpdml6ZVBhdGgoZmlsZVBhdGgpWzBdO1xuICAgICAgICBjb25zdCBiYXNlRGlyID0gcHJvamVjdFBhdGggIT09IG51bGwgPyBwcm9qZWN0UGF0aCA6IHBhdGguZGlybmFtZShmaWxlUGF0aCk7XG4gICAgICAgIGNvbnN0IGNvbmZpZ0ZpbGVQYXRoID0gYXdhaXQgaGVscGVycy5maW5kQ2FjaGVkQXN5bmMoYmFzZURpciwgdGhpcy5wcm9qZWN0Q29uZmlnRmlsZSk7XG4gICAgICAgIGNvbnN0IGV4ZWNQYXRoID0gZnMubm9ybWFsaXplKGFwcGx5U3Vic3RpdHV0aW9ucyh0aGlzLmV4ZWN1dGFibGVQYXRoLCBiYXNlRGlyKSk7XG5cbiAgICAgICAgLy8gZ2V0IHRoZSB2ZXJzaW9uIG9mIEZsYWtlOFxuICAgICAgICBjb25zdCB2ZXJzaW9uID0gYXdhaXQgZ2V0Rmxha2U4VmVyc2lvbihleGVjUGF0aCk7XG5cbiAgICAgICAgLy8gc3RkaW4tZGlzcGxheS1uYW1lIGF2YWlsYWJsZSBzaW5jZSAzLjAuMFxuICAgICAgICBpZiAoc2VtdmVyLnZhbGlkKHZlcnNpb24pICYmIHNlbXZlci5ndGUodmVyc2lvbiwgJzMuMC4wJykpIHtcbiAgICAgICAgICBwYXJhbWV0ZXJzLnB1c2goJy0tc3RkaW4tZGlzcGxheS1uYW1lJywgZmlsZVBhdGgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMucHJvamVjdENvbmZpZ0ZpbGUgJiYgYmFzZURpciAhPT0gbnVsbCAmJiBjb25maWdGaWxlUGF0aCAhPT0gbnVsbCkge1xuICAgICAgICAgIHBhcmFtZXRlcnMucHVzaCgnLS1jb25maWcnLCBjb25maWdGaWxlUGF0aCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKHRoaXMubWF4TGluZUxlbmd0aCkge1xuICAgICAgICAgICAgcGFyYW1ldGVycy5wdXNoKCctLW1heC1saW5lLWxlbmd0aCcsIHRoaXMubWF4TGluZUxlbmd0aCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICh0aGlzLmlnbm9yZUVycm9yQ29kZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICBwYXJhbWV0ZXJzLnB1c2goJy0taWdub3JlJywgdGhpcy5pZ25vcmVFcnJvckNvZGVzLmpvaW4oJywnKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICh0aGlzLm1heENvbXBsZXhpdHkgIT09IDc5KSB7XG4gICAgICAgICAgICBwYXJhbWV0ZXJzLnB1c2goJy0tbWF4LWNvbXBsZXhpdHknLCB0aGlzLm1heENvbXBsZXhpdHkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAodGhpcy5oYW5nQ2xvc2luZykge1xuICAgICAgICAgICAgcGFyYW1ldGVycy5wdXNoKCctLWhhbmctY2xvc2luZycpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAodGhpcy5zZWxlY3RFcnJvcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICBwYXJhbWV0ZXJzLnB1c2goJy0tc2VsZWN0JywgdGhpcy5zZWxlY3RFcnJvcnMuam9pbignLCcpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHRoaXMuYnVpbHRpbnMubGVuZ3RoKSB7XG4gICAgICAgICAgICBwYXJhbWV0ZXJzLnB1c2goJy0tYnVpbHRpbnMnLCB0aGlzLmJ1aWx0aW5zLmpvaW4oJywnKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcGFyYW1ldGVycy5wdXNoKCctJyk7XG5cbiAgICAgICAgY29uc3QgZm9yY2VUaW1lb3V0ID0gMTAwMCAqIDYwICogNTsgLy8gKG1zICogcyAqIG0pID0gRml2ZSBtaW51dGVzXG4gICAgICAgIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgICAgICAgc3RkaW46IGZpbGVUZXh0LFxuICAgICAgICAgIGN3ZDogYmFzZURpcixcbiAgICAgICAgICBpZ25vcmVFeGl0Q29kZTogdHJ1ZSxcbiAgICAgICAgICB0aW1lb3V0OiBmb3JjZVRpbWVvdXQsXG4gICAgICAgICAgdW5pcXVlS2V5OiBgbGludGVyLWZsYWtlODoke2ZpbGVQYXRofWAsXG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IHJlc3VsdDtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICByZXN1bHQgPSBhd2FpdCBoZWxwZXJzLmV4ZWMoZXhlY1BhdGgsIHBhcmFtZXRlcnMsIG9wdGlvbnMpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgY29uc3QgcHlUcmFjZSA9IGUubWVzc2FnZS5zcGxpdCgnXFxuJyk7XG4gICAgICAgICAgY29uc3QgcHlNb3N0UmVjZW50ID0gcHlUcmFjZVtweVRyYWNlLmxlbmd0aCAtIDFdO1xuICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcignRmxha2U4IGNyYXNoZWQhJywge1xuICAgICAgICAgICAgZGV0YWlsOiAnbGludGVyLWZsYWtlODo6IEZsYWtlOCB0aHJldyBhbiBlcnJvciByZWxhdGVkIHRvOlxcbicgK1xuICAgICAgICAgICAgICBgJHtweU1vc3RSZWNlbnR9XFxuYCArXG4gICAgICAgICAgICAgIFwiUGxlYXNlIGNoZWNrIEF0b20ncyBDb25zb2xlIGZvciBtb3JlIGRldGFpbHNcIixcbiAgICAgICAgICB9KTtcbiAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ2xpbnRlci1mbGFrZTg6OiBGbGFrZTggcmV0dXJuZWQgYW4gZXJyb3InLCBlLm1lc3NhZ2UpO1xuICAgICAgICAgIC8vIFRlbGwgTGludGVyIHRvIG5vdCB1cGRhdGUgYW55IGN1cnJlbnQgbWVzc2FnZXMgaXQgbWF5IGhhdmVcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChyZXN1bHQgPT09IG51bGwpIHtcbiAgICAgICAgICAvLyBQcm9jZXNzIHdhcyBraWxsZWQgYnkgYSBmdXR1cmUgaW52b2NhdGlvblxuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRleHRFZGl0b3IuZ2V0VGV4dCgpICE9PSBmaWxlVGV4dCkge1xuICAgICAgICAgIC8vIEVkaXRvciBjb250ZW50cyBoYXZlIGNoYW5nZWQsIHRlbGwgTGludGVyIG5vdCB0byB1cGRhdGVcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG1lc3NhZ2VzID0gW107XG5cbiAgICAgICAgbGV0IG1hdGNoID0gcGFyc2VSZWdleC5leGVjKHJlc3VsdCk7XG4gICAgICAgIHdoaWxlIChtYXRjaCAhPT0gbnVsbCkge1xuICAgICAgICAgIC8vIE5vdGUgdGhhdCB0aGVzZSBwb3NpdGlvbnMgYXJlIGJlaW5nIGNvbnZlcnRlZCB0byAwLWluZGV4ZWRcbiAgICAgICAgICBjb25zdCBsaW5lID0gTnVtYmVyLnBhcnNlSW50KG1hdGNoWzFdLCAxMCkgLSAxIHx8IDA7XG4gICAgICAgICAgY29uc3QgY29sID0gTnVtYmVyLnBhcnNlSW50KG1hdGNoWzJdLCAxMCkgLSAxIHx8IHVuZGVmaW5lZDtcblxuICAgICAgICAgIGNvbnN0IGlzRXJyID0gKG1hdGNoWzRdID09PSAnRScgJiYgIXRoaXMucHljb2Rlc3R5bGVFcnJvcnNUb1dhcm5pbmdzKVxuICAgICAgICAgICAgfHwgKG1hdGNoWzRdID09PSAnRicgJiYgdGhpcy5mbGFrZUVycm9ycyk7XG5cbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgbWVzc2FnZXMucHVzaCh7XG4gICAgICAgICAgICAgIHNldmVyaXR5OiBpc0VyciA/ICdlcnJvcicgOiAnd2FybmluZycsXG4gICAgICAgICAgICAgIGV4Y2VycHQ6IGAke21hdGNoWzNdfSDigJQgJHttYXRjaFs1XX1gLFxuICAgICAgICAgICAgICBsb2NhdGlvbjoge1xuICAgICAgICAgICAgICAgIGZpbGU6IGZpbGVQYXRoLFxuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBoZWxwZXJzLmdlbmVyYXRlUmFuZ2UodGV4dEVkaXRvciwgbGluZSwgY29sKSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAvLyBnZW5lcmF0ZVJhbmdlIGVuY291bnRlcmVkIGFuIGludmFsaWQgcG9pbnRcbiAgICAgICAgICAgIGNvbnN0IHBvaW50ID0gW2xpbmUgKyAxLCBjb2wgKyAxXTtcbiAgICAgICAgICAgIGNvbnN0IG0gPSBnZW5lcmF0ZUludmFsaWRQb2ludFRyYWNlKGV4ZWNQYXRoLCBtYXRjaCwgZmlsZVBhdGgsIHRleHRFZGl0b3IsIHBvaW50KTtcbiAgICAgICAgICAgIG1lc3NhZ2VzLnB1c2gobSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbWF0Y2ggPSBwYXJzZVJlZ2V4LmV4ZWMocmVzdWx0KTtcbiAgICAgICAgfVxuICAgICAgICAvLyBFbnN1cmUgdGhhdCBhbnkgaW52YWxpZCBwb2ludCBtZXNzYWdlcyBoYXZlIGZpbmlzaGVkIHJlc29sdmluZ1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwobWVzc2FnZXMpO1xuICAgICAgfSxcbiAgICB9O1xuICB9LFxufTtcbiJdfQ==