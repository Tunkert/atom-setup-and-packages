Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/** @babel */

var _atom = require('atom');

var _nodePtyPrebuiltMultiarch = require('node-pty-prebuilt-multiarch');

var _xterm = require('xterm');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function getLinkedEditor(filePath) {
  editors = atom.workspace.getTextEditors();
  for (var i in editors) {
    if (editors[i].buffer.getPath() == filePath) {
      return editors[i];
    }
  }
  return false;
}

//
// Terminal Session
//
// Maintains all of the essential state for a Terminal Tab.
//

var TerminalSession = (function () {
  function TerminalSession() {
    var filePath = arguments.length <= 0 || arguments[0] === undefined ? "" : arguments[0];
    var config = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, TerminalSession);

    this.isOpen = true;
    this.test = 0;
    this.filePath = filePath;
    this.config = config;
    this.disposables = new _atom.CompositeDisposable();
    this.emitter = new _atom.Emitter();
    this.pty = this.openPseudoterminal();
    this.xterm = new _xterm.Terminal();

    this.handleEvents();
  }

  _createClass(TerminalSession, [{
    key: 'handleEvents',
    value: function handleEvents() {
      var _this = this;

      // Process Terminal Input Events
      this.xterm.onData(function (data) {
        return _this.pty.write(data);
      });

      // Process Terminal Output Events
      this.pty.onData(function (data) {
        if (_this.xterm.element) {
          return _this.xterm.write(data);
        }
      });

      // Process Terminal Exit Events
      this.pty.onExit(this.destroy.bind(this));
    }
  }, {
    key: 'openPseudoterminal',
    value: function openPseudoterminal() {
      var shellArguments = this.shellArguments.split(/\s+/g).filter(function (arg) {
        return arg;
      });

      return (0, _nodePtyPrebuiltMultiarch.spawn)(this.shellPath, shellArguments, {
        name: 'xterm-color',
        env: this.sanitizedEnvironment,
        cwd: this.workingDirectory
      });
    }

    //
    // Clears the contents of the terminal buffer. This is a simple proxy to the
    // `clear()` function on the Xterm instance.
    //
  }, {
    key: 'clear',
    value: function clear() {
      this.xterm.clear();
    }

    //
    // Copies the current selection to the Atom clipboard.
    //
  }, {
    key: 'copySelection',
    value: function copySelection() {
      var selectedText = this.xterm.getSelection();
      atom.clipboard.write(selectedText);
    }

    //
    // Pastes the contents of the Atom clipboard to the terminal (via the
    // pseudoterminal).
    //
  }, {
    key: 'pasteFromClipboard',
    value: function pasteFromClipboard() {
      var text = atom.clipboard.read();
      this.pty.write(text);
    }

    //
    // Insert the text param to the terminal (via the
    // pseudoterminal).
    //
  }, {
    key: 'insertCustomText',
    value: function insertCustomText(customText) {
      var _this2 = this;

      text = customText;
      newLine = "\n";
      slash = "/";
      if (process.platform === 'win32') {
        newLine = "\r" + newLine;
        slash = "\\";
      }
      if (!atom.config.get('iv-terminal.customTexts.runInsertedText')) {
        newLine = "";
      }

      if (this.filePath != "") {
        dirName = _path2['default'].dirname(this.filePath ? this.filePath : '.');
        baseName = _path2['default'].basename(this.filePath ? this.filePath : '.');
        text = customText.replace(/\$P/, dirName + slash + baseName).replace(/\$F/, baseName).replace(/\$D/, dirName).replace(/\$\$/, '$');

        if (atom.config.get('iv-terminal.customTexts.saveOnInsert')) {
          if (linkedEditor = getLinkedEditor(this.filePath)) {
            if (linkedEditor.isModified()) {
              this.editorSubscription = linkedEditor.onDidSave(function (event) {
                _this2.editorSubscription.dispose();
                _this2.pty.write(text + newLine);
              });
              linkedEditor.save();
              return;
            }
          } else {
            infoString = "File couldn't be saved because the editor linked to the terminal \
                        doesn't appear to be opened.";
            atom.notifications.addInfo(infoString);
          }
        }
      }

      this.pty.write(text + newLine);
    }
  }, {
    key: 'serialize',
    value: function serialize() {
      return {
        deserializer: 'TerminalSession',
        config: {
          sanitizeEnvironment: this.sanitizedEnvironmentKeys,
          shellArgs: this.shellArguments,
          shellPath: this.shellPath,
          workingDirectory: this.workingDirectory
        },
        filePath: this.filePath
      };
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      if (this.test < 1) {
        this.test = 1;
        this.isOpen = false;

        // Kill the Pseudoterminal (pty) Process
        if (this.pty) this.pty.kill();

        // Destroy the Terminal Instance
        if (this.xterm) this.xterm.dispose();

        // Notify any observers that this session is being destroyed.
        this.emitter.emit('did-destroy', this);

        // Clean up any disposables we're responsible for.
        this.emitter.dispose();
        this.disposables.dispose();
      }
    }
  }, {
    key: 'onDidDestroy',
    value: function onDidDestroy(callback) {
      return this.emitter.on('did-destroy', callback);
    }

    //
    // Select a working directory for a new terminal.
    // Uses the project folder of the currently active file, if any,
    // otherwise falls back to the first project's folder, if any,
    // or the user's home directory.
    //
  }, {
    key: '_getWorkingDirectory',
    value: function _getWorkingDirectory() {
      if (this._workingDirectory) return this._workingDirectory;

      termDirectory = atom.config.get('iv-terminal.terminalDirectory');
      if (termDirectory != 'home') {

        if (this.filePath != "") {
          if (termDirectory == 'current-file') {
            return _path2['default'].dirname(this.filePath);
          } else if (termDirectory == 'project-folder') {
            return atom.project.relativizePath(this.filePath)[0];
          }
        }

        var projectPaths = atom.project.getPaths();
        if (projectPaths.length > 0) {
          return _path2['default'].resolve(projectPaths[0]);
        }
      }

      return _path2['default'].resolve(process.env.HOME);
    }
  }, {
    key: 'getDefaultLocation',
    value: function getDefaultLocation() {
      return atom.config.get('iv-terminal.defaultLocation');
    }
  }, {
    key: 'getIconName',
    value: function getIconName() {
      return 'terminal';
    }
  }, {
    key: 'getTitle',
    value: function getTitle() {
      if (this.filePath != "") {
        var fileName = _path2['default'].basename(this.filePath);
        return 'Terminal - ' + fileName;
      }
      return 'Terminal';
    }
  }, {
    key: 'sanitizedEnvironment',
    get: function get() {
      var sanitizedEnvironment = Object.assign({}, process.env);
      var variablesToDelete = this.sanitizedEnvironmentKeys;

      if (variablesToDelete) {
        variablesToDelete.forEach(function (variable) {
          delete sanitizedEnvironment[variable];
        });
      }

      return sanitizedEnvironment;
    }
  }, {
    key: 'shellPath',
    get: function get() {
      if (this._shellPath) return this._shellPath;
      return this._shellPath = this.config.shellPath || atom.config.get('iv-terminal.shellSettings.shellPath') || process.env.SHELL || process.env.COMSPEC;
    }
  }, {
    key: 'shellArguments',
    get: function get() {
      if (this._shellArguments) return this._shellArguments;
      return this._shellArguments = this.config.shellArgs || atom.config.get('iv-terminal.shellSettings.shellArgs') || '';
    }
  }, {
    key: 'sanitizedEnvironmentKeys',
    get: function get() {
      if (this._sanitizedEnvironmentKeys) return this._sanitizedEnvironmentKeys;
      return this._sanitizedEnvironmentKeys = this.config.sanitizeEnvironment || atom.config.get('iv-terminal.shellSettings.sanitizeEnvironment');
    }
  }, {
    key: 'workingDirectory',
    get: function get() {
      if (this._workingDirectory) return this._workingDirectory;
      return this._workingDirectory = this.config.workingDirectory || this._getWorkingDirectory();
    }
  }]);

  return TerminalSession;
})();

exports['default'] = TerminalSession;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3R1bmtlcnQvLmF0b20vcGFja2FnZXMvaXYtdGVybWluYWwvbGliL3Rlcm1pbmFsLXNlc3Npb24uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O29CQUU2QyxNQUFNOzt3Q0FDakIsNkJBQTZCOztxQkFDN0IsT0FBTzs7b0JBQ3hCLE1BQU07Ozs7QUFFdkIsU0FBUyxlQUFlLENBQUMsUUFBUSxFQUFFO0FBQ2pDLFNBQU8sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLGNBQWMsRUFBRSxDQUFDO0FBQzFDLE9BQUssSUFBSSxDQUFDLElBQUksT0FBTyxFQUFFO0FBQ3JCLFFBQUksT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsSUFBSSxRQUFRLEVBQUU7QUFDM0MsYUFBTyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDbkI7R0FDRjtBQUNELFNBQU8sS0FBSyxDQUFDO0NBQ2Q7Ozs7Ozs7O0lBT29CLGVBQWU7QUFFdkIsV0FGUSxlQUFlLEdBRU07UUFBNUIsUUFBUSx5REFBRyxFQUFFO1FBQUUsTUFBTSx5REFBRyxFQUFFOzswQkFGbkIsZUFBZTs7QUFHaEMsUUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7QUFDbkIsUUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUM7QUFDZCxRQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztBQUN6QixRQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztBQUNyQixRQUFJLENBQUMsV0FBVyxHQUFHLCtCQUF5QixDQUFDO0FBQzdDLFFBQUksQ0FBQyxPQUFPLEdBQUcsbUJBQWEsQ0FBQztBQUM3QixRQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO0FBQ3JDLFFBQUksQ0FBQyxLQUFLLEdBQUcscUJBQVcsQ0FBQzs7QUFFekIsUUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO0dBQ3JCOztlQWJrQixlQUFlOztX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U0FFaUIsZUFBRztBQUNuQixVQUFJLElBQUksQ0FBQyxlQUFlLEVBQUUsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDO0FBQ3RELGFBQU8sSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsSUFDOUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMscUNBQXFDLENBQUMsSUFDdEQsRUFBRSxDQUFDO0tBQ1Q7OztTQUUyQixlQUFHO0FBQzdCLFVBQUksSUFBSSxDQUFDLHlCQUF5QixFQUFFLE9BQU8sSUFBSSxDQUFDLHlCQUF5QixDQUFDO0FBQzFFLGFBQU8sSUFBSSxDQUFDLHlCQUF5QixHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsbUJBQW1CLElBQ2xFLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLCtDQUErQyxDQUFDLENBQUM7S0FDdkU7OztTQUVtQixlQUFHO0FBQ3JCLFVBQUksSUFBSSxDQUFDLGlCQUFpQixFQUFFLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFDO0FBQzFELGFBQU8sSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLElBQ3ZELElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO0tBQ2xDOzs7U0F6TmtCLGVBQWU7OztxQkFBZixlQUFlIiwiZmlsZSI6Ii9ob21lL3R1bmtlcnQvLmF0b20vcGFja2FnZXMvaXYtdGVybWluYWwvbGliL3Rlcm1pbmFsLXNlc3Npb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiogQGJhYmVsICovXG5cbmltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUsIEVtaXR0ZXIgfSBmcm9tICdhdG9tJztcbmltcG9ydCB7IHNwYXduIGFzIHNwYXduUHR5IH0gZnJvbSAnbm9kZS1wdHktcHJlYnVpbHQtbXVsdGlhcmNoJztcbmltcG9ydCB7IFRlcm1pbmFsIGFzIFh0ZXJtIH0gZnJvbSAneHRlcm0nO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5cbmZ1bmN0aW9uIGdldExpbmtlZEVkaXRvcihmaWxlUGF0aCkge1xuICBlZGl0b3JzID0gYXRvbS53b3Jrc3BhY2UuZ2V0VGV4dEVkaXRvcnMoKTtcbiAgZm9yICh2YXIgaSBpbiBlZGl0b3JzKSB7XG4gICAgaWYgKGVkaXRvcnNbaV0uYnVmZmVyLmdldFBhdGgoKSA9PSBmaWxlUGF0aCkge1xuICAgICAgcmV0dXJuIGVkaXRvcnNbaV07XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuLy9cbi8vIFRlcm1pbmFsIFNlc3Npb25cbi8vXG4vLyBNYWludGFpbnMgYWxsIG9mIHRoZSBlc3NlbnRpYWwgc3RhdGUgZm9yIGEgVGVybWluYWwgVGFiLlxuLy9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRlcm1pbmFsU2Vzc2lvbiB7XG5cbiAgY29uc3RydWN0b3IoZmlsZVBhdGggPSBcIlwiLCBjb25maWcgPSB7fSkge1xuICAgIHRoaXMuaXNPcGVuID0gdHJ1ZTtcbiAgICB0aGlzLnRlc3QgPSAwO1xuICAgIHRoaXMuZmlsZVBhdGggPSBmaWxlUGF0aDtcbiAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcbiAgICB0aGlzLmRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLmVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgIHRoaXMucHR5ID0gdGhpcy5vcGVuUHNldWRvdGVybWluYWwoKTtcbiAgICB0aGlzLnh0ZXJtID0gbmV3IFh0ZXJtKCk7XG5cbiAgICB0aGlzLmhhbmRsZUV2ZW50cygpO1xuICB9XG5cbiAgaGFuZGxlRXZlbnRzKCkge1xuXG4gICAgLy8gUHJvY2VzcyBUZXJtaW5hbCBJbnB1dCBFdmVudHNcbiAgICB0aGlzLnh0ZXJtLm9uRGF0YShkYXRhID0+IHRoaXMucHR5LndyaXRlKGRhdGEpKTtcblxuICAgIC8vIFByb2Nlc3MgVGVybWluYWwgT3V0cHV0IEV2ZW50c1xuICAgIHRoaXMucHR5Lm9uRGF0YSgoZGF0YSkgPT4ge1xuICAgICAgaWYgKHRoaXMueHRlcm0uZWxlbWVudCkge1xuICAgICAgICByZXR1cm4gdGhpcy54dGVybS53cml0ZShkYXRhKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIFByb2Nlc3MgVGVybWluYWwgRXhpdCBFdmVudHNcbiAgICB0aGlzLnB0eS5vbkV4aXQodGhpcy5kZXN0cm95LmJpbmQodGhpcykpO1xuXG4gIH1cblxuICBvcGVuUHNldWRvdGVybWluYWwoKSB7XG4gICAgY29uc3Qgc2hlbGxBcmd1bWVudHMgPSB0aGlzLnNoZWxsQXJndW1lbnRzLnNwbGl0KC9cXHMrL2cpLmZpbHRlcihhcmcgPT4gYXJnKTtcblxuICAgIHJldHVybiBzcGF3blB0eSh0aGlzLnNoZWxsUGF0aCwgc2hlbGxBcmd1bWVudHMsIHtcbiAgICAgIG5hbWU6ICd4dGVybS1jb2xvcicsXG4gICAgICBlbnY6IHRoaXMuc2FuaXRpemVkRW52aXJvbm1lbnQsXG4gICAgICBjd2Q6IHRoaXMud29ya2luZ0RpcmVjdG9yeVxuICAgIH0pO1xuICB9XG5cbiAgLy9cbiAgLy8gQ2xlYXJzIHRoZSBjb250ZW50cyBvZiB0aGUgdGVybWluYWwgYnVmZmVyLiBUaGlzIGlzIGEgc2ltcGxlIHByb3h5IHRvIHRoZVxuICAvLyBgY2xlYXIoKWAgZnVuY3Rpb24gb24gdGhlIFh0ZXJtIGluc3RhbmNlLlxuICAvL1xuICBjbGVhcigpIHtcbiAgICB0aGlzLnh0ZXJtLmNsZWFyKCk7XG4gIH1cblxuICAvL1xuICAvLyBDb3BpZXMgdGhlIGN1cnJlbnQgc2VsZWN0aW9uIHRvIHRoZSBBdG9tIGNsaXBib2FyZC5cbiAgLy9cbiAgY29weVNlbGVjdGlvbigpIHtcbiAgICBjb25zdCBzZWxlY3RlZFRleHQgPSB0aGlzLnh0ZXJtLmdldFNlbGVjdGlvbigpO1xuICAgIGF0b20uY2xpcGJvYXJkLndyaXRlKHNlbGVjdGVkVGV4dCk7XG4gIH1cblxuICAvL1xuICAvLyBQYXN0ZXMgdGhlIGNvbnRlbnRzIG9mIHRoZSBBdG9tIGNsaXBib2FyZCB0byB0aGUgdGVybWluYWwgKHZpYSB0aGVcbiAgLy8gcHNldWRvdGVybWluYWwpLlxuICAvL1xuICBwYXN0ZUZyb21DbGlwYm9hcmQoKSB7XG4gICAgY29uc3QgdGV4dCA9IGF0b20uY2xpcGJvYXJkLnJlYWQoKTtcbiAgICB0aGlzLnB0eS53cml0ZSh0ZXh0KTtcbiAgfVxuXG4gIC8vXG4gIC8vIEluc2VydCB0aGUgdGV4dCBwYXJhbSB0byB0aGUgdGVybWluYWwgKHZpYSB0aGVcbiAgLy8gcHNldWRvdGVybWluYWwpLlxuICAvL1xuICBpbnNlcnRDdXN0b21UZXh0KGN1c3RvbVRleHQpIHtcbiAgICB0ZXh0ID0gY3VzdG9tVGV4dDtcbiAgICBuZXdMaW5lID0gXCJcXG5cIjtcbiAgICBzbGFzaCA9IFwiL1wiO1xuICAgIGlmIChwcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInKSB7XG4gICAgICBuZXdMaW5lID0gXCJcXHJcIiArIG5ld0xpbmU7XG4gICAgICBzbGFzaCA9IFwiXFxcXFwiO1xuICAgIH1cbiAgICBpZiAoIWF0b20uY29uZmlnLmdldCgnaXYtdGVybWluYWwuY3VzdG9tVGV4dHMucnVuSW5zZXJ0ZWRUZXh0JykpIHtcbiAgICAgIG5ld0xpbmUgPSBcIlwiO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmZpbGVQYXRoICE9IFwiXCIpIHtcbiAgICAgIGRpck5hbWUgPSBwYXRoLmRpcm5hbWUodGhpcy5maWxlUGF0aCA/IHRoaXMuZmlsZVBhdGggOiAnLicpO1xuICAgICAgYmFzZU5hbWUgPSBwYXRoLmJhc2VuYW1lKHRoaXMuZmlsZVBhdGggPyB0aGlzLmZpbGVQYXRoIDogJy4nKTtcbiAgICAgIHRleHQgPSBjdXN0b21UZXh0XG4gICAgICAgIC5yZXBsYWNlKC9cXCRQLywgZGlyTmFtZStzbGFzaCtiYXNlTmFtZSlcbiAgICAgICAgLnJlcGxhY2UoL1xcJEYvLCBiYXNlTmFtZSlcbiAgICAgICAgLnJlcGxhY2UoL1xcJEQvLCBkaXJOYW1lKVxuICAgICAgICAucmVwbGFjZSgvXFwkXFwkLywgJyQnKTtcblxuICAgICAgaWYgKGF0b20uY29uZmlnLmdldCgnaXYtdGVybWluYWwuY3VzdG9tVGV4dHMuc2F2ZU9uSW5zZXJ0JykpIHtcbiAgICAgICAgaWYgKGxpbmtlZEVkaXRvciA9IGdldExpbmtlZEVkaXRvcih0aGlzLmZpbGVQYXRoKSkge1xuICAgICAgICAgIGlmIChsaW5rZWRFZGl0b3IuaXNNb2RpZmllZCgpKSB7XG4gICAgICAgICAgICB0aGlzLmVkaXRvclN1YnNjcmlwdGlvbiA9IGxpbmtlZEVkaXRvci5vbkRpZFNhdmUoKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgIHRoaXMuZWRpdG9yU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICAgICAgICAgICAgdGhpcy5wdHkud3JpdGUodGV4dCtuZXdMaW5lKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgbGlua2VkRWRpdG9yLnNhdmUoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaW5mb1N0cmluZyA9IFwiRmlsZSBjb3VsZG4ndCBiZSBzYXZlZCBiZWNhdXNlIHRoZSBlZGl0b3IgbGlua2VkIHRvIHRoZSB0ZXJtaW5hbCBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgZG9lc24ndCBhcHBlYXIgdG8gYmUgb3BlbmVkLlwiO1xuICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvKGluZm9TdHJpbmcpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5wdHkud3JpdGUodGV4dCtuZXdMaW5lKTtcbiAgfVxuXG4gIHNlcmlhbGl6ZSgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZGVzZXJpYWxpemVyOiAnVGVybWluYWxTZXNzaW9uJyxcbiAgICAgIGNvbmZpZzoge1xuICAgICAgICBzYW5pdGl6ZUVudmlyb25tZW50OiB0aGlzLnNhbml0aXplZEVudmlyb25tZW50S2V5cyxcbiAgICAgICAgc2hlbGxBcmdzOiB0aGlzLnNoZWxsQXJndW1lbnRzLFxuICAgICAgICBzaGVsbFBhdGg6IHRoaXMuc2hlbGxQYXRoLFxuICAgICAgICB3b3JraW5nRGlyZWN0b3J5OiB0aGlzLndvcmtpbmdEaXJlY3RvcnlcbiAgICAgIH0sXG4gICAgICBmaWxlUGF0aDogdGhpcy5maWxlUGF0aFxuICAgIH07XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIGlmICh0aGlzLnRlc3QgPCAxKSB7XG4gICAgICB0aGlzLnRlc3QgPSAxO1xuICAgICAgdGhpcy5pc09wZW4gPSBmYWxzZTtcblxuICAgICAgLy8gS2lsbCB0aGUgUHNldWRvdGVybWluYWwgKHB0eSkgUHJvY2Vzc1xuICAgICAgaWYgKHRoaXMucHR5KSB0aGlzLnB0eS5raWxsKCk7XG5cbiAgICAgIC8vIERlc3Ryb3kgdGhlIFRlcm1pbmFsIEluc3RhbmNlXG4gICAgICBpZiAodGhpcy54dGVybSkgdGhpcy54dGVybS5kaXNwb3NlKCk7XG5cbiAgICAgIC8vIE5vdGlmeSBhbnkgb2JzZXJ2ZXJzIHRoYXQgdGhpcyBzZXNzaW9uIGlzIGJlaW5nIGRlc3Ryb3llZC5cbiAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtZGVzdHJveScsIHRoaXMpO1xuXG4gICAgICAvLyBDbGVhbiB1cCBhbnkgZGlzcG9zYWJsZXMgd2UncmUgcmVzcG9uc2libGUgZm9yLlxuICAgICAgdGhpcy5lbWl0dGVyLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuZGlzcG9zYWJsZXMuZGlzcG9zZSgpO1xuICAgIH1cbiAgfVxuXG4gIG9uRGlkRGVzdHJveShjYWxsYmFjaykge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2RpZC1kZXN0cm95JywgY2FsbGJhY2spO1xuICB9XG5cbiAgLy9cbiAgLy8gU2VsZWN0IGEgd29ya2luZyBkaXJlY3RvcnkgZm9yIGEgbmV3IHRlcm1pbmFsLlxuICAvLyBVc2VzIHRoZSBwcm9qZWN0IGZvbGRlciBvZiB0aGUgY3VycmVudGx5IGFjdGl2ZSBmaWxlLCBpZiBhbnksXG4gIC8vIG90aGVyd2lzZSBmYWxscyBiYWNrIHRvIHRoZSBmaXJzdCBwcm9qZWN0J3MgZm9sZGVyLCBpZiBhbnksXG4gIC8vIG9yIHRoZSB1c2VyJ3MgaG9tZSBkaXJlY3RvcnkuXG4gIC8vXG4gIF9nZXRXb3JraW5nRGlyZWN0b3J5KCkge1xuICAgIGlmICh0aGlzLl93b3JraW5nRGlyZWN0b3J5KSByZXR1cm4gdGhpcy5fd29ya2luZ0RpcmVjdG9yeTtcblxuICAgIHRlcm1EaXJlY3RvcnkgPSBhdG9tLmNvbmZpZy5nZXQoJ2l2LXRlcm1pbmFsLnRlcm1pbmFsRGlyZWN0b3J5Jyk7XG4gICAgaWYgKHRlcm1EaXJlY3RvcnkgIT0gJ2hvbWUnKSB7XG5cbiAgICAgIGlmICh0aGlzLmZpbGVQYXRoICE9IFwiXCIpIHtcbiAgICAgICAgaWYgKHRlcm1EaXJlY3RvcnkgPT0gJ2N1cnJlbnQtZmlsZScpIHtcbiAgICAgICAgICByZXR1cm4gcGF0aC5kaXJuYW1lKHRoaXMuZmlsZVBhdGgpO1xuICAgICAgICB9IGVsc2UgaWYgKHRlcm1EaXJlY3RvcnkgPT0gJ3Byb2plY3QtZm9sZGVyJykge1xuICAgICAgICAgIHJldHVybiBhdG9tLnByb2plY3QucmVsYXRpdml6ZVBhdGgodGhpcy5maWxlUGF0aClbMF07XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY29uc3QgcHJvamVjdFBhdGhzID0gYXRvbS5wcm9qZWN0LmdldFBhdGhzKCk7XG4gICAgICBpZiAocHJvamVjdFBhdGhzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgcmV0dXJuIHBhdGgucmVzb2x2ZShwcm9qZWN0UGF0aHNbMF0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBwYXRoLnJlc29sdmUocHJvY2Vzcy5lbnYuSE9NRSk7XG4gIH1cblxuICBnZXQgc2FuaXRpemVkRW52aXJvbm1lbnQoKSB7XG4gICAgY29uc3Qgc2FuaXRpemVkRW52aXJvbm1lbnQgPSBPYmplY3QuYXNzaWduKHt9LCBwcm9jZXNzLmVudik7XG4gICAgY29uc3QgdmFyaWFibGVzVG9EZWxldGUgPSB0aGlzLnNhbml0aXplZEVudmlyb25tZW50S2V5cztcblxuICAgIGlmICh2YXJpYWJsZXNUb0RlbGV0ZSkge1xuICAgICAgdmFyaWFibGVzVG9EZWxldGUuZm9yRWFjaCgodmFyaWFibGUpID0+IHtcbiAgICAgICAgZGVsZXRlIHNhbml0aXplZEVudmlyb25tZW50W3ZhcmlhYmxlXTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBzYW5pdGl6ZWRFbnZpcm9ubWVudDtcbiAgfVxuXG4gIGdldCBzaGVsbFBhdGgoKSB7XG4gICAgaWYgKHRoaXMuX3NoZWxsUGF0aCkgcmV0dXJuIHRoaXMuX3NoZWxsUGF0aDtcbiAgICByZXR1cm4gdGhpcy5fc2hlbGxQYXRoID0gdGhpcy5jb25maWcuc2hlbGxQYXRoXG4gICAgICB8fCBhdG9tLmNvbmZpZy5nZXQoJ2l2LXRlcm1pbmFsLnNoZWxsU2V0dGluZ3Muc2hlbGxQYXRoJylcbiAgICAgIHx8IHByb2Nlc3MuZW52LlNIRUxMXG4gICAgICB8fCBwcm9jZXNzLmVudi5DT01TUEVDO1xuICB9XG5cbiAgZ2V0IHNoZWxsQXJndW1lbnRzKCkge1xuICAgIGlmICh0aGlzLl9zaGVsbEFyZ3VtZW50cykgcmV0dXJuIHRoaXMuX3NoZWxsQXJndW1lbnRzO1xuICAgIHJldHVybiB0aGlzLl9zaGVsbEFyZ3VtZW50cyA9IHRoaXMuY29uZmlnLnNoZWxsQXJnc1xuICAgICAgfHwgYXRvbS5jb25maWcuZ2V0KCdpdi10ZXJtaW5hbC5zaGVsbFNldHRpbmdzLnNoZWxsQXJncycpXG4gICAgICB8fCAnJztcbiAgfVxuXG4gIGdldCBzYW5pdGl6ZWRFbnZpcm9ubWVudEtleXMoKSB7XG4gICAgaWYgKHRoaXMuX3Nhbml0aXplZEVudmlyb25tZW50S2V5cykgcmV0dXJuIHRoaXMuX3Nhbml0aXplZEVudmlyb25tZW50S2V5cztcbiAgICByZXR1cm4gdGhpcy5fc2FuaXRpemVkRW52aXJvbm1lbnRLZXlzID0gdGhpcy5jb25maWcuc2FuaXRpemVFbnZpcm9ubWVudFxuICAgICAgfHwgYXRvbS5jb25maWcuZ2V0KCdpdi10ZXJtaW5hbC5zaGVsbFNldHRpbmdzLnNhbml0aXplRW52aXJvbm1lbnQnKTtcbiAgfVxuXG4gIGdldCB3b3JraW5nRGlyZWN0b3J5KCkge1xuICAgIGlmICh0aGlzLl93b3JraW5nRGlyZWN0b3J5KSByZXR1cm4gdGhpcy5fd29ya2luZ0RpcmVjdG9yeTtcbiAgICByZXR1cm4gdGhpcy5fd29ya2luZ0RpcmVjdG9yeSA9IHRoaXMuY29uZmlnLndvcmtpbmdEaXJlY3RvcnlcbiAgICAgIHx8IHRoaXMuX2dldFdvcmtpbmdEaXJlY3RvcnkoKTtcbiAgfVxuXG4gIGdldERlZmF1bHRMb2NhdGlvbigpIHtcbiAgICByZXR1cm4gYXRvbS5jb25maWcuZ2V0KCdpdi10ZXJtaW5hbC5kZWZhdWx0TG9jYXRpb24nKTtcbiAgfVxuXG4gIGdldEljb25OYW1lKCkge1xuICAgIHJldHVybiAndGVybWluYWwnO1xuICB9XG5cbiAgZ2V0VGl0bGUoKSB7XG4gICAgaWYgKHRoaXMuZmlsZVBhdGggIT0gXCJcIikge1xuICAgICAgbGV0IGZpbGVOYW1lID0gcGF0aC5iYXNlbmFtZSh0aGlzLmZpbGVQYXRoKTtcbiAgICAgIHJldHVybiAnVGVybWluYWwgLSAnICsgZmlsZU5hbWU7XG4gICAgfVxuICAgIHJldHVybiAnVGVybWluYWwnO1xuICB9XG5cbn1cbiJdfQ==