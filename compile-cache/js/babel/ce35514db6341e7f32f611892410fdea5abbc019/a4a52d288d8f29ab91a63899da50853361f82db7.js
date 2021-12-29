Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/** @babel */
/** @jsx etch.dom */

var _atom = require('atom');

var _xtermAddonFit = require('xterm-addon-fit');

var _etch = require('etch');

var _etch2 = _interopRequireDefault(_etch);

var _themeMatcher = require('./theme-matcher');

var _themeMatcher2 = _interopRequireDefault(_themeMatcher);

var TERMINAL_PADDING = 5;

var TerminalView = (function () {
  function TerminalView(session) {
    _classCallCheck(this, TerminalView);

    this.disposables = new _atom.CompositeDisposable();
    this.session = session;

    // Load the Fit Addon
    this.fitAddon = new _xtermAddonFit.FitAddon();
    this.session.xterm.loadAddon(this.fitAddon);
    this.disposables.add(this.fitAddon);

    //
    // Observe the Session to know when it is destroyed so that we can
    // clean up our state (i.e. remove event observers).
    //
    this.session.onDidDestroy(this.destroy.bind(this));

    // TODO: Documentation says this should be set for Atom... Research!
    _etch2['default'].setScheduler(atom.views);
    _etch2['default'].initialize(this);

    this.observeResizeEvents();
  }

  _createClass(TerminalView, [{
    key: 'render',
    value: function render() {
      // TODO: Convert to <div class="terminal-view">
      return _etch2['default'].dom('terminal-view', { attributes: { tabindex: -1 }, on: { focus: this.didFocus } });
    }
  }, {
    key: 'update',
    value: function update() {
      return _etch2['default'].update(this);
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.resizeObserver.disconnect();
      this.disposables.dispose();
      _etch2['default'].destroy(this);
    }

    //
    // Attach the Xterm instance from the session to this view's element, then
    // focus and resize it to fit its viewport.
    //
  }, {
    key: 'openTerminal',
    value: function openTerminal() {
      this.session.xterm.open(this.element);
      this.session.xterm.focus();

      this.observeAndApplyThemeStyles();
      this.observeAndApplyTypeSettings();
    }

    //
    // Observe for resize events so that we can instruct the Xterm instance
    // to recalculate rows and columns to fit into its viewport when it
    // changes.
    //
  }, {
    key: 'observeResizeEvents',
    value: function observeResizeEvents() {
      this.resizeObserver = new ResizeObserver(this.didResize.bind(this));
      this.resizeObserver.observe(this.element);
    }
  }, {
    key: 'resizeTerminalToFitContainer',
    value: function resizeTerminalToFitContainer() {
      if (!this.session && !this.session.pty && !this.session.xterm) {
        return;
      }

      // Set padding and resize the terminal to fit its container (as best as possible)
      this.session.xterm.element.style.padding = TERMINAL_PADDING + 'px';
      try {
        this.fitAddon.fit();
      } catch (error) {} // TODO: Yuck

      // Check the new size and add additional padding to the top of the
      // terminal so that it fills all available space.
      // TODO: Extract this into a new calculatePadding() or something...
      var elementStyles = getComputedStyle(this.element);
      var xtermElementStyles = getComputedStyle(this.session.xterm.element);
      var elementHeight = parseInt(elementStyles.height, 10);
      var xtermHeight = parseInt(xtermElementStyles.height, 10);
      var newHeight = elementHeight - xtermHeight + TERMINAL_PADDING;

      if (!isNaN(newHeight)) {
        this.fitAddon.fit();
        this.session.xterm.element.style.paddingBottom = newHeight + 'px';
      }

      // Update Pseudoterminal Process w/New Dimensions
      this.session.pty.resize(this.session.xterm.cols, this.session.xterm.rows);
    }

    //
    // Resizes the terminal instance to fit its parent container. Once the new
    // dimensions are established, the calculated columns and rows are passed to
    // the pseudoterminal (pty) to remain consistent.
    //
  }, {
    key: 'didResize',
    value: function didResize() {
      if (!this.session.xterm.element) {
        this.openTerminal();
      }

      this.resizeTerminalToFitContainer();
    }

    //
    // Transfer focus to the Xterm instance when the element is focused. When
    // switching between tabs, Atom will send a focus event to the element,
    // which makes it easy for us to delegate focus to the Xterm instance, whose
    // element we are managing in our view.
    //
  }, {
    key: 'didFocus',
    value: function didFocus() /* event */{
      this.session.xterm.focus();
    }

    //
    // Observe for changes to the matchTheme configuration directive and apply
    // the styles when the value changes. This will also apply them when called
    // for the first time.
    //
  }, {
    key: 'observeAndApplyThemeStyles',
    value: function observeAndApplyThemeStyles() {
      if (this.isObservingThemeSettings) return;
      this.disposables.add(atom.config.onDidChange('iv-terminal.matchTheme', this.applyThemeStyles.bind(this)));
      this.disposables.add(atom.themes.onDidChangeActiveThemes(this.applyThemeStyles.bind(this)));
      this.isObservingThemeSettings = true;
      this.applyThemeStyles();
    }

    //
    // Observe for changes to the Editor configuration for Atom and apply
    // the type settings when the values we are interested in change. This
    // will also apply them when called for the first time.
    //
  }, {
    key: 'observeAndApplyTypeSettings',
    value: function observeAndApplyTypeSettings() {
      if (this.isObservingTypeSettings) return;
      this.disposables.add(atom.config.onDidChange('iv-terminal.fontFamily', this.applyTypeSettings.bind(this)));
      this.disposables.add(atom.config.onDidChange('editor.fontFamily', this.applyTypeSettings.bind(this)));
      this.disposables.add(atom.config.onDidChange('editor.fontSize', this.applyTypeSettings.bind(this)));
      this.disposables.add(atom.config.onDidChange('editor.lineHeight', this.applyTypeSettings.bind(this)));
      this.isObservingTypeSettings = true;
      this.applyTypeSettings();
    }

    //
    // Attempts to match the Xterm instance with the current Atom theme colors.
    //
    // TODO: This should take advantage of update()
    // TODO: This doesn't undo the font settings when the theme is disabled...
    //
  }, {
    key: 'applyThemeStyles',
    value: function applyThemeStyles() {

      // Bail out if the user has not requested to match the theme styles
      if (!atom.config.get('iv-terminal.matchTheme')) {
        this.session.xterm.setOption('theme', {});
        return;
      }

      // Parse the Atom theme styles and configure the Xterm to match.
      var themeStyles = _themeMatcher2['default'].parseThemeStyles();
      this.session.xterm.setOption('theme', themeStyles);
    }

    //
    // Attempts to match the Atom type settings (font family, size and line height) with
    // Xterm.
    //
  }, {
    key: 'applyTypeSettings',
    value: function applyTypeSettings() {

      //
      // Set the font family in Xterm to match Atom.
      //
      var fontFamily = atom.config.get('iv-terminal.fontFamily') || atom.config.get('editor.fontFamily') || 'Menlo, Consolas, "DejaVu Sans Mono", monospace'; // Atom default (as of 1.25.0)
      this.session.xterm.setOption('fontFamily', fontFamily);

      //
      // Set the font size in Xterm to match Atom.
      //
      var fontSize = atom.config.get('editor.fontSize');
      this.session.xterm.setOption('fontSize', fontSize);

      //
      // Set the line height in Xterm to match Atom.
      //
      // TODO: This is disabled, because the line height as specified in
      //       Atom is not the same as what Xterm is using to render its
      //       lines (i.e. 1.5 in Atom is more like 2x in Xterm). Need to
      //       figure out the correct conversion or fix the bug, if there
      //       is one.
      //
      // const lineHeight = atom.config.get('editor.lineHeight');
      // this.session.xterm.setOption('lineHeight', lineHeight);

      //
      // Changing the font size and/or line height requires that we
      // recalcuate the size of the Xterm instance.
      //
      // TODO: Call the renamed method (i.e. resizeTerminalToFitContainer())
      //
      this.didResize();
    }
  }]);

  return TerminalView;
})();

exports['default'] = TerminalView;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3R1bmtlcnQvLmF0b20vcGFja2FnZXMvaXYtdGVybWluYWwvbGliL3Rlcm1pbmFsLXZpZXcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztvQkFHb0MsTUFBTTs7NkJBQ2pCLGlCQUFpQjs7b0JBQ3pCLE1BQU07Ozs7NEJBQ0UsaUJBQWlCOzs7O0FBRTFDLElBQU0sZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDOztJQUVOLFlBQVk7QUFFcEIsV0FGUSxZQUFZLENBRW5CLE9BQU8sRUFBRTswQkFGRixZQUFZOztBQUc3QixRQUFJLENBQUMsV0FBVyxHQUFHLCtCQUF5QixDQUFDO0FBQzdDLFFBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDOzs7QUFHdkIsUUFBSSxDQUFDLFFBQVEsR0FBRyw2QkFBYyxDQUFDO0FBQy9CLFFBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDNUMsUUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDOzs7Ozs7QUFNcEMsUUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzs7O0FBR25ELHNCQUFLLFlBQVksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDOUIsc0JBQUssVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDOztBQUV0QixRQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztHQUM1Qjs7ZUF0QmtCLFlBQVk7O1dBd0J6QixrQkFBRzs7QUFFUCxhQUNFLHlDQUFlLFVBQVUsRUFBRSxFQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBQyxBQUFDLEVBQUMsRUFBRSxFQUFFLEVBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUMsQUFBQyxHQUFHLENBQ3pFO0tBQ0g7OztXQUVLLGtCQUFHO0FBQ1AsYUFBTyxrQkFBSyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDMUI7OztXQUVNLG1CQUFHO0FBQ1IsVUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLEVBQUUsQ0FBQztBQUNqQyxVQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQzNCLHdCQUFLLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUNwQjs7Ozs7Ozs7V0FNVyx3QkFBRztBQUNiLFVBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDdEMsVUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7O0FBRTNCLFVBQUksQ0FBQywwQkFBMEIsRUFBRSxDQUFDO0FBQ2xDLFVBQUksQ0FBQywyQkFBMkIsRUFBRSxDQUFDO0tBQ3BDOzs7Ozs7Ozs7V0FPa0IsK0JBQUc7QUFDcEIsVUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLGNBQWMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ3BFLFVBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztLQUMzQzs7O1dBRTJCLHdDQUFHO0FBQzdCLFVBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRTtBQUM3RCxlQUFPO09BQ1I7OztBQUdELFVBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFNLGdCQUFnQixPQUFJLENBQUM7QUFDbkUsVUFBSTtBQUFFLFlBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUE7T0FBQyxDQUFDLE9BQU0sS0FBSyxFQUFFLEVBQUc7Ozs7O0FBSzNDLFVBQU0sYUFBYSxHQUFHLGdCQUFnQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNyRCxVQUFNLGtCQUFrQixHQUFHLGdCQUFnQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3hFLFVBQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ3pELFVBQU0sV0FBVyxHQUFHLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDNUQsVUFBTSxTQUFTLEdBQUcsYUFBYSxHQUFHLFdBQVcsR0FBRyxnQkFBZ0IsQ0FBQzs7QUFFakUsVUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsRUFBRTtBQUNyQixZQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQ3BCLFlBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsYUFBYSxHQUFNLFNBQVMsT0FBSSxDQUFDO09BQ25FOzs7QUFHRCxVQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQzNFOzs7Ozs7Ozs7V0FPUSxxQkFBRztBQUNWLFVBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUU7QUFDL0IsWUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO09BQ3JCOztBQUVELFVBQUksQ0FBQyw0QkFBNEIsRUFBRSxDQUFDO0tBQ3JDOzs7Ozs7Ozs7O1dBUU8sK0JBQWM7QUFDcEIsVUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7S0FDNUI7Ozs7Ozs7OztXQU95QixzQ0FBRztBQUMzQixVQUFJLElBQUksQ0FBQyx3QkFBd0IsRUFBRSxPQUFPO0FBQzFDLFVBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLHdCQUF3QixFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzFHLFVBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsdUJBQXVCLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDNUYsVUFBSSxDQUFDLHdCQUF3QixHQUFHLElBQUksQ0FBQztBQUNyQyxVQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztLQUN6Qjs7Ozs7Ozs7O1dBTzBCLHVDQUFHO0FBQzVCLFVBQUksSUFBSSxDQUFDLHVCQUF1QixFQUFFLE9BQU87QUFDekMsVUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsd0JBQXdCLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDM0csVUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsbUJBQW1CLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdEcsVUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDcEcsVUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsbUJBQW1CLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdEcsVUFBSSxDQUFDLHVCQUF1QixHQUFHLElBQUksQ0FBQztBQUNwQyxVQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztLQUMxQjs7Ozs7Ozs7OztXQVFlLDRCQUFHOzs7QUFHakIsVUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLHdCQUF3QixDQUFDLEVBQUU7QUFDOUMsWUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztBQUMxQyxlQUFPO09BQ1I7OztBQUdELFVBQU0sV0FBVyxHQUFHLDBCQUFhLGdCQUFnQixFQUFFLENBQUM7QUFDcEQsVUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxXQUFXLENBQUMsQ0FBQztLQUVwRDs7Ozs7Ozs7V0FNZ0IsNkJBQUc7Ozs7O0FBS2xCLFVBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLHdCQUF3QixDQUFDLElBQ3ZELElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLG1CQUFtQixDQUFDLElBQ3BDLGdEQUFnRCxDQUFDO0FBQ3RELFVBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7Ozs7O0FBS3ZELFVBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFDcEQsVUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFvQm5ELFVBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztLQUVsQjs7O1NBek1rQixZQUFZOzs7cUJBQVosWUFBWSIsImZpbGUiOiIvaG9tZS90dW5rZXJ0Ly5hdG9tL3BhY2thZ2VzL2l2LXRlcm1pbmFsL2xpYi90ZXJtaW5hbC12aWV3LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqIEBiYWJlbCAqL1xuLyoqIEBqc3ggZXRjaC5kb20gKi9cblxuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSB9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHsgRml0QWRkb24gfSBmcm9tICd4dGVybS1hZGRvbi1maXQnO1xuaW1wb3J0IGV0Y2ggZnJvbSAnZXRjaCc7XG5pbXBvcnQgVGhlbWVNYXRjaGVyIGZyb20gJy4vdGhlbWUtbWF0Y2hlcic7XG5cbmNvbnN0IFRFUk1JTkFMX1BBRERJTkcgPSA1O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUZXJtaW5hbFZpZXcge1xuXG4gIGNvbnN0cnVjdG9yKHNlc3Npb24pIHtcbiAgICB0aGlzLmRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLnNlc3Npb24gPSBzZXNzaW9uO1xuXG4gICAgLy8gTG9hZCB0aGUgRml0IEFkZG9uXG4gICAgdGhpcy5maXRBZGRvbiA9IG5ldyBGaXRBZGRvbigpO1xuICAgIHRoaXMuc2Vzc2lvbi54dGVybS5sb2FkQWRkb24odGhpcy5maXRBZGRvbik7XG4gICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQodGhpcy5maXRBZGRvbik7XG5cbiAgICAvL1xuICAgIC8vIE9ic2VydmUgdGhlIFNlc3Npb24gdG8ga25vdyB3aGVuIGl0IGlzIGRlc3Ryb3llZCBzbyB0aGF0IHdlIGNhblxuICAgIC8vIGNsZWFuIHVwIG91ciBzdGF0ZSAoaS5lLiByZW1vdmUgZXZlbnQgb2JzZXJ2ZXJzKS5cbiAgICAvL1xuICAgIHRoaXMuc2Vzc2lvbi5vbkRpZERlc3Ryb3kodGhpcy5kZXN0cm95LmJpbmQodGhpcykpO1xuXG4gICAgLy8gVE9ETzogRG9jdW1lbnRhdGlvbiBzYXlzIHRoaXMgc2hvdWxkIGJlIHNldCBmb3IgQXRvbS4uLiBSZXNlYXJjaCFcbiAgICBldGNoLnNldFNjaGVkdWxlcihhdG9tLnZpZXdzKTtcbiAgICBldGNoLmluaXRpYWxpemUodGhpcyk7XG5cbiAgICB0aGlzLm9ic2VydmVSZXNpemVFdmVudHMoKTtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICAvLyBUT0RPOiBDb252ZXJ0IHRvIDxkaXYgY2xhc3M9XCJ0ZXJtaW5hbC12aWV3XCI+XG4gICAgcmV0dXJuIChcbiAgICAgIDx0ZXJtaW5hbC12aWV3IGF0dHJpYnV0ZXM9e3t0YWJpbmRleDogLTF9fSBvbj17e2ZvY3VzOiB0aGlzLmRpZEZvY3VzfX0gLz5cbiAgICApO1xuICB9XG5cbiAgdXBkYXRlKCkge1xuICAgIHJldHVybiBldGNoLnVwZGF0ZSh0aGlzKTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5yZXNpemVPYnNlcnZlci5kaXNjb25uZWN0KCk7XG4gICAgdGhpcy5kaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gICAgZXRjaC5kZXN0cm95KHRoaXMpO1xuICB9XG5cbiAgLy9cbiAgLy8gQXR0YWNoIHRoZSBYdGVybSBpbnN0YW5jZSBmcm9tIHRoZSBzZXNzaW9uIHRvIHRoaXMgdmlldydzIGVsZW1lbnQsIHRoZW5cbiAgLy8gZm9jdXMgYW5kIHJlc2l6ZSBpdCB0byBmaXQgaXRzIHZpZXdwb3J0LlxuICAvL1xuICBvcGVuVGVybWluYWwoKSB7XG4gICAgdGhpcy5zZXNzaW9uLnh0ZXJtLm9wZW4odGhpcy5lbGVtZW50KTtcbiAgICB0aGlzLnNlc3Npb24ueHRlcm0uZm9jdXMoKTtcblxuICAgIHRoaXMub2JzZXJ2ZUFuZEFwcGx5VGhlbWVTdHlsZXMoKTtcbiAgICB0aGlzLm9ic2VydmVBbmRBcHBseVR5cGVTZXR0aW5ncygpO1xuICB9XG5cbiAgLy9cbiAgLy8gT2JzZXJ2ZSBmb3IgcmVzaXplIGV2ZW50cyBzbyB0aGF0IHdlIGNhbiBpbnN0cnVjdCB0aGUgWHRlcm0gaW5zdGFuY2VcbiAgLy8gdG8gcmVjYWxjdWxhdGUgcm93cyBhbmQgY29sdW1ucyB0byBmaXQgaW50byBpdHMgdmlld3BvcnQgd2hlbiBpdFxuICAvLyBjaGFuZ2VzLlxuICAvL1xuICBvYnNlcnZlUmVzaXplRXZlbnRzKCkge1xuICAgIHRoaXMucmVzaXplT2JzZXJ2ZXIgPSBuZXcgUmVzaXplT2JzZXJ2ZXIodGhpcy5kaWRSZXNpemUuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5yZXNpemVPYnNlcnZlci5vYnNlcnZlKHRoaXMuZWxlbWVudCk7XG4gIH1cblxuICByZXNpemVUZXJtaW5hbFRvRml0Q29udGFpbmVyKCkge1xuICAgIGlmICghdGhpcy5zZXNzaW9uICYmICF0aGlzLnNlc3Npb24ucHR5ICYmICF0aGlzLnNlc3Npb24ueHRlcm0pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBTZXQgcGFkZGluZyBhbmQgcmVzaXplIHRoZSB0ZXJtaW5hbCB0byBmaXQgaXRzIGNvbnRhaW5lciAoYXMgYmVzdCBhcyBwb3NzaWJsZSlcbiAgICB0aGlzLnNlc3Npb24ueHRlcm0uZWxlbWVudC5zdHlsZS5wYWRkaW5nID0gYCR7VEVSTUlOQUxfUEFERElOR31weGA7XG4gICAgdHJ5IHsgdGhpcy5maXRBZGRvbi5maXQoKX0gY2F0Y2goZXJyb3IpIHsgfSAvLyBUT0RPOiBZdWNrXG5cbiAgICAvLyBDaGVjayB0aGUgbmV3IHNpemUgYW5kIGFkZCBhZGRpdGlvbmFsIHBhZGRpbmcgdG8gdGhlIHRvcCBvZiB0aGVcbiAgICAvLyB0ZXJtaW5hbCBzbyB0aGF0IGl0IGZpbGxzIGFsbCBhdmFpbGFibGUgc3BhY2UuXG4gICAgLy8gVE9ETzogRXh0cmFjdCB0aGlzIGludG8gYSBuZXcgY2FsY3VsYXRlUGFkZGluZygpIG9yIHNvbWV0aGluZy4uLlxuICAgIGNvbnN0IGVsZW1lbnRTdHlsZXMgPSBnZXRDb21wdXRlZFN0eWxlKHRoaXMuZWxlbWVudCk7XG4gICAgY29uc3QgeHRlcm1FbGVtZW50U3R5bGVzID0gZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzLnNlc3Npb24ueHRlcm0uZWxlbWVudCk7XG4gICAgY29uc3QgZWxlbWVudEhlaWdodCA9IHBhcnNlSW50KGVsZW1lbnRTdHlsZXMuaGVpZ2h0LCAxMCk7XG4gICAgY29uc3QgeHRlcm1IZWlnaHQgPSBwYXJzZUludCh4dGVybUVsZW1lbnRTdHlsZXMuaGVpZ2h0LCAxMCk7XG4gICAgY29uc3QgbmV3SGVpZ2h0ID0gZWxlbWVudEhlaWdodCAtIHh0ZXJtSGVpZ2h0ICsgVEVSTUlOQUxfUEFERElORztcblxuICAgIGlmICghaXNOYU4obmV3SGVpZ2h0KSkge1xuICAgICAgdGhpcy5maXRBZGRvbi5maXQoKTtcbiAgICAgIHRoaXMuc2Vzc2lvbi54dGVybS5lbGVtZW50LnN0eWxlLnBhZGRpbmdCb3R0b20gPSBgJHtuZXdIZWlnaHR9cHhgO1xuICAgIH1cblxuICAgIC8vIFVwZGF0ZSBQc2V1ZG90ZXJtaW5hbCBQcm9jZXNzIHcvTmV3IERpbWVuc2lvbnNcbiAgICB0aGlzLnNlc3Npb24ucHR5LnJlc2l6ZSh0aGlzLnNlc3Npb24ueHRlcm0uY29scywgdGhpcy5zZXNzaW9uLnh0ZXJtLnJvd3MpO1xuICB9XG5cbiAgLy9cbiAgLy8gUmVzaXplcyB0aGUgdGVybWluYWwgaW5zdGFuY2UgdG8gZml0IGl0cyBwYXJlbnQgY29udGFpbmVyLiBPbmNlIHRoZSBuZXdcbiAgLy8gZGltZW5zaW9ucyBhcmUgZXN0YWJsaXNoZWQsIHRoZSBjYWxjdWxhdGVkIGNvbHVtbnMgYW5kIHJvd3MgYXJlIHBhc3NlZCB0b1xuICAvLyB0aGUgcHNldWRvdGVybWluYWwgKHB0eSkgdG8gcmVtYWluIGNvbnNpc3RlbnQuXG4gIC8vXG4gIGRpZFJlc2l6ZSgpIHtcbiAgICBpZiAoIXRoaXMuc2Vzc2lvbi54dGVybS5lbGVtZW50KSB7XG4gICAgICB0aGlzLm9wZW5UZXJtaW5hbCgpO1xuICAgIH1cblxuICAgIHRoaXMucmVzaXplVGVybWluYWxUb0ZpdENvbnRhaW5lcigpO1xuICB9XG5cbiAgLy9cbiAgLy8gVHJhbnNmZXIgZm9jdXMgdG8gdGhlIFh0ZXJtIGluc3RhbmNlIHdoZW4gdGhlIGVsZW1lbnQgaXMgZm9jdXNlZC4gV2hlblxuICAvLyBzd2l0Y2hpbmcgYmV0d2VlbiB0YWJzLCBBdG9tIHdpbGwgc2VuZCBhIGZvY3VzIGV2ZW50IHRvIHRoZSBlbGVtZW50LFxuICAvLyB3aGljaCBtYWtlcyBpdCBlYXN5IGZvciB1cyB0byBkZWxlZ2F0ZSBmb2N1cyB0byB0aGUgWHRlcm0gaW5zdGFuY2UsIHdob3NlXG4gIC8vIGVsZW1lbnQgd2UgYXJlIG1hbmFnaW5nIGluIG91ciB2aWV3LlxuICAvL1xuICBkaWRGb2N1cygvKiBldmVudCAqLykge1xuICAgIHRoaXMuc2Vzc2lvbi54dGVybS5mb2N1cygpO1xuICB9XG5cbiAgLy9cbiAgLy8gT2JzZXJ2ZSBmb3IgY2hhbmdlcyB0byB0aGUgbWF0Y2hUaGVtZSBjb25maWd1cmF0aW9uIGRpcmVjdGl2ZSBhbmQgYXBwbHlcbiAgLy8gdGhlIHN0eWxlcyB3aGVuIHRoZSB2YWx1ZSBjaGFuZ2VzLiBUaGlzIHdpbGwgYWxzbyBhcHBseSB0aGVtIHdoZW4gY2FsbGVkXG4gIC8vIGZvciB0aGUgZmlyc3QgdGltZS5cbiAgLy9cbiAgb2JzZXJ2ZUFuZEFwcGx5VGhlbWVTdHlsZXMoKSB7XG4gICAgaWYgKHRoaXMuaXNPYnNlcnZpbmdUaGVtZVNldHRpbmdzKSByZXR1cm47XG4gICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQoYXRvbS5jb25maWcub25EaWRDaGFuZ2UoJ2l2LXRlcm1pbmFsLm1hdGNoVGhlbWUnLCB0aGlzLmFwcGx5VGhlbWVTdHlsZXMuYmluZCh0aGlzKSkpO1xuICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKGF0b20udGhlbWVzLm9uRGlkQ2hhbmdlQWN0aXZlVGhlbWVzKHRoaXMuYXBwbHlUaGVtZVN0eWxlcy5iaW5kKHRoaXMpKSk7XG4gICAgdGhpcy5pc09ic2VydmluZ1RoZW1lU2V0dGluZ3MgPSB0cnVlO1xuICAgIHRoaXMuYXBwbHlUaGVtZVN0eWxlcygpO1xuICB9XG5cbiAgLy9cbiAgLy8gT2JzZXJ2ZSBmb3IgY2hhbmdlcyB0byB0aGUgRWRpdG9yIGNvbmZpZ3VyYXRpb24gZm9yIEF0b20gYW5kIGFwcGx5XG4gIC8vIHRoZSB0eXBlIHNldHRpbmdzIHdoZW4gdGhlIHZhbHVlcyB3ZSBhcmUgaW50ZXJlc3RlZCBpbiBjaGFuZ2UuIFRoaXNcbiAgLy8gd2lsbCBhbHNvIGFwcGx5IHRoZW0gd2hlbiBjYWxsZWQgZm9yIHRoZSBmaXJzdCB0aW1lLlxuICAvL1xuICBvYnNlcnZlQW5kQXBwbHlUeXBlU2V0dGluZ3MoKSB7XG4gICAgaWYgKHRoaXMuaXNPYnNlcnZpbmdUeXBlU2V0dGluZ3MpIHJldHVybjtcbiAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZChhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSgnaXYtdGVybWluYWwuZm9udEZhbWlseScsIHRoaXMuYXBwbHlUeXBlU2V0dGluZ3MuYmluZCh0aGlzKSkpO1xuICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlKCdlZGl0b3IuZm9udEZhbWlseScsIHRoaXMuYXBwbHlUeXBlU2V0dGluZ3MuYmluZCh0aGlzKSkpO1xuICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlKCdlZGl0b3IuZm9udFNpemUnLCB0aGlzLmFwcGx5VHlwZVNldHRpbmdzLmJpbmQodGhpcykpKTtcbiAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZChhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSgnZWRpdG9yLmxpbmVIZWlnaHQnLCB0aGlzLmFwcGx5VHlwZVNldHRpbmdzLmJpbmQodGhpcykpKTtcbiAgICB0aGlzLmlzT2JzZXJ2aW5nVHlwZVNldHRpbmdzID0gdHJ1ZTtcbiAgICB0aGlzLmFwcGx5VHlwZVNldHRpbmdzKCk7XG4gIH1cblxuICAvL1xuICAvLyBBdHRlbXB0cyB0byBtYXRjaCB0aGUgWHRlcm0gaW5zdGFuY2Ugd2l0aCB0aGUgY3VycmVudCBBdG9tIHRoZW1lIGNvbG9ycy5cbiAgLy9cbiAgLy8gVE9ETzogVGhpcyBzaG91bGQgdGFrZSBhZHZhbnRhZ2Ugb2YgdXBkYXRlKClcbiAgLy8gVE9ETzogVGhpcyBkb2Vzbid0IHVuZG8gdGhlIGZvbnQgc2V0dGluZ3Mgd2hlbiB0aGUgdGhlbWUgaXMgZGlzYWJsZWQuLi5cbiAgLy9cbiAgYXBwbHlUaGVtZVN0eWxlcygpIHtcblxuICAgIC8vIEJhaWwgb3V0IGlmIHRoZSB1c2VyIGhhcyBub3QgcmVxdWVzdGVkIHRvIG1hdGNoIHRoZSB0aGVtZSBzdHlsZXNcbiAgICBpZiAoIWF0b20uY29uZmlnLmdldCgnaXYtdGVybWluYWwubWF0Y2hUaGVtZScpKSB7XG4gICAgICB0aGlzLnNlc3Npb24ueHRlcm0uc2V0T3B0aW9uKCd0aGVtZScsIHt9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBQYXJzZSB0aGUgQXRvbSB0aGVtZSBzdHlsZXMgYW5kIGNvbmZpZ3VyZSB0aGUgWHRlcm0gdG8gbWF0Y2guXG4gICAgY29uc3QgdGhlbWVTdHlsZXMgPSBUaGVtZU1hdGNoZXIucGFyc2VUaGVtZVN0eWxlcygpO1xuICAgIHRoaXMuc2Vzc2lvbi54dGVybS5zZXRPcHRpb24oJ3RoZW1lJywgdGhlbWVTdHlsZXMpO1xuXG4gIH1cblxuICAvL1xuICAvLyBBdHRlbXB0cyB0byBtYXRjaCB0aGUgQXRvbSB0eXBlIHNldHRpbmdzIChmb250IGZhbWlseSwgc2l6ZSBhbmQgbGluZSBoZWlnaHQpIHdpdGhcbiAgLy8gWHRlcm0uXG4gIC8vXG4gIGFwcGx5VHlwZVNldHRpbmdzKCkge1xuXG4gICAgLy9cbiAgICAvLyBTZXQgdGhlIGZvbnQgZmFtaWx5IGluIFh0ZXJtIHRvIG1hdGNoIEF0b20uXG4gICAgLy9cbiAgICBjb25zdCBmb250RmFtaWx5ID0gYXRvbS5jb25maWcuZ2V0KCdpdi10ZXJtaW5hbC5mb250RmFtaWx5JylcbiAgICAgIHx8IGF0b20uY29uZmlnLmdldCgnZWRpdG9yLmZvbnRGYW1pbHknKVxuICAgICAgfHwgJ01lbmxvLCBDb25zb2xhcywgXCJEZWphVnUgU2FucyBNb25vXCIsIG1vbm9zcGFjZSc7IC8vIEF0b20gZGVmYXVsdCAoYXMgb2YgMS4yNS4wKVxuICAgIHRoaXMuc2Vzc2lvbi54dGVybS5zZXRPcHRpb24oJ2ZvbnRGYW1pbHknLCBmb250RmFtaWx5KTtcblxuICAgIC8vXG4gICAgLy8gU2V0IHRoZSBmb250IHNpemUgaW4gWHRlcm0gdG8gbWF0Y2ggQXRvbS5cbiAgICAvL1xuICAgIGNvbnN0IGZvbnRTaXplID0gYXRvbS5jb25maWcuZ2V0KCdlZGl0b3IuZm9udFNpemUnKTtcbiAgICB0aGlzLnNlc3Npb24ueHRlcm0uc2V0T3B0aW9uKCdmb250U2l6ZScsIGZvbnRTaXplKTtcblxuICAgIC8vXG4gICAgLy8gU2V0IHRoZSBsaW5lIGhlaWdodCBpbiBYdGVybSB0byBtYXRjaCBBdG9tLlxuICAgIC8vXG4gICAgLy8gVE9ETzogVGhpcyBpcyBkaXNhYmxlZCwgYmVjYXVzZSB0aGUgbGluZSBoZWlnaHQgYXMgc3BlY2lmaWVkIGluXG4gICAgLy8gICAgICAgQXRvbSBpcyBub3QgdGhlIHNhbWUgYXMgd2hhdCBYdGVybSBpcyB1c2luZyB0byByZW5kZXIgaXRzXG4gICAgLy8gICAgICAgbGluZXMgKGkuZS4gMS41IGluIEF0b20gaXMgbW9yZSBsaWtlIDJ4IGluIFh0ZXJtKS4gTmVlZCB0b1xuICAgIC8vICAgICAgIGZpZ3VyZSBvdXQgdGhlIGNvcnJlY3QgY29udmVyc2lvbiBvciBmaXggdGhlIGJ1ZywgaWYgdGhlcmVcbiAgICAvLyAgICAgICBpcyBvbmUuXG4gICAgLy9cbiAgICAvLyBjb25zdCBsaW5lSGVpZ2h0ID0gYXRvbS5jb25maWcuZ2V0KCdlZGl0b3IubGluZUhlaWdodCcpO1xuICAgIC8vIHRoaXMuc2Vzc2lvbi54dGVybS5zZXRPcHRpb24oJ2xpbmVIZWlnaHQnLCBsaW5lSGVpZ2h0KTtcblxuICAgIC8vXG4gICAgLy8gQ2hhbmdpbmcgdGhlIGZvbnQgc2l6ZSBhbmQvb3IgbGluZSBoZWlnaHQgcmVxdWlyZXMgdGhhdCB3ZVxuICAgIC8vIHJlY2FsY3VhdGUgdGhlIHNpemUgb2YgdGhlIFh0ZXJtIGluc3RhbmNlLlxuICAgIC8vXG4gICAgLy8gVE9ETzogQ2FsbCB0aGUgcmVuYW1lZCBtZXRob2QgKGkuZS4gcmVzaXplVGVybWluYWxUb0ZpdENvbnRhaW5lcigpKVxuICAgIC8vXG4gICAgdGhpcy5kaWRSZXNpemUoKTtcblxuICB9XG5cbn1cbiJdfQ==