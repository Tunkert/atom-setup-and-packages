Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/** @babel */

// TODO: Atom has a wonderful Color class (https://atom.io/docs/api/v1.23.3/Color), but I can't figure out how to import it directly... It's not exported: https://github.com/atom/atom/blob/ff6dc42fcd7d533cf4f50b2874e09cce24c77c28/exports/atom.js

var _rgbHex = require('rgb-hex');

var _rgbHex2 = _interopRequireDefault(_rgbHex);

// TODO: Selection is rendered in the canvas, and therefore isn't a straight
//       "background color". It renders above text and needs alpha in order
//       to see the text. Therefore, we can't simply take the selection
//       color from Atom and set it here, because it will mask the actual
//       text without alpha. If we make the selection color semi-transparent,
//       the color won't match the original selection color from Atom.

var COLOR_KEYS = ['foreground', 'background', 'cursor', 'cursorAccent', /* 'selection', */'black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white', 'brightBlack', 'brightRed', 'brightGreen', 'brightYellow', 'brightBlue', 'brightMagenta', 'brightCyan', 'brightWhite'];

var ThemeMatcher = (function () {
  function ThemeMatcher() {
    _classCallCheck(this, ThemeMatcher);
  }

  _createClass(ThemeMatcher, [{
    key: 'writeElements',
    value: function writeElements() {
      var _this = this;

      this.colorElements = document.createElement('div');
      this.colorElements.classList.add('terminal-view-color-elements');

      COLOR_KEYS.forEach(function (colorKey) {
        var colorElement = document.createElement('span');
        colorElement.dataset.colorKey = colorKey;
        _this.colorElements.appendChild(colorElement);
      });

      document.body.appendChild(this.colorElements);
    }
  }, {
    key: 'readStyles',
    value: function readStyles() {
      var colors = {};

      Array.from(this.colorElements.children).forEach(function (colorElement) {
        var colorKey = colorElement.dataset.colorKey;
        var computedStyle = getComputedStyle(colorElement);
        colors[colorKey] = '#' + (0, _rgbHex2['default'])(computedStyle.color);
      });

      return colors;
    }
  }, {
    key: 'cleanup',
    value: function cleanup() {
      this.colorElements.remove();
    }
  }], [{
    key: 'parseThemeStyles',
    value: function parseThemeStyles() {
      var themeMatcher = new this();
      themeMatcher.writeElements();
      var themeColors = themeMatcher.readStyles();
      themeMatcher.cleanup();
      return themeColors;
    }
  }]);

  return ThemeMatcher;
})();

exports['default'] = ThemeMatcher;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3R1bmtlcnQvLmF0b20vcGFja2FnZXMvaXYtdGVybWluYWwvbGliL3RoZW1lLW1hdGNoZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7c0JBR21CLFNBQVM7Ozs7Ozs7Ozs7O0FBUzVCLElBQU0sVUFBVSxHQUFHLENBQ2pCLFlBQVksRUFBRSxZQUFZLEVBQUUsUUFBUSxFQUFFLGNBQWMsb0JBQXFCLE9BQU8sRUFDaEYsS0FBSyxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLGFBQWEsRUFDM0UsV0FBVyxFQUFFLGFBQWEsRUFBRSxjQUFjLEVBQUUsWUFBWSxFQUFFLGVBQWUsRUFDekUsWUFBWSxFQUFFLGFBQWEsQ0FDNUIsQ0FBQzs7SUFFbUIsWUFBWTtXQUFaLFlBQVk7MEJBQVosWUFBWTs7O2VBQVosWUFBWTs7V0FFbEIseUJBQUc7OztBQUNkLFVBQUksQ0FBQyxhQUFhLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNuRCxVQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsOEJBQThCLENBQUMsQ0FBQzs7QUFFakUsZ0JBQVUsQ0FBQyxPQUFPLENBQUMsVUFBQyxRQUFRLEVBQUs7QUFDL0IsWUFBTSxZQUFZLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNwRCxvQkFBWSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO0FBQ3pDLGNBQUssYUFBYSxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQztPQUM5QyxDQUFDLENBQUM7O0FBRUgsY0FBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0tBQy9DOzs7V0FFUyxzQkFBRztBQUNYLFVBQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQzs7QUFFbEIsV0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFDLFlBQVksRUFBSztBQUNoRSxZQUFNLFFBQVEsR0FBRyxZQUFZLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQztBQUMvQyxZQUFNLGFBQWEsR0FBRyxnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUNyRCxjQUFNLENBQUMsUUFBUSxDQUFDLFNBQU8seUJBQU8sYUFBYSxDQUFDLEtBQUssQ0FBQyxBQUFFLENBQUM7T0FDdEQsQ0FBQyxDQUFDOztBQUVILGFBQU8sTUFBTSxDQUFDO0tBQ2Y7OztXQUVNLG1CQUFHO0FBQ1IsVUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUUsQ0FBQztLQUM3Qjs7O1dBRXNCLDRCQUFHO0FBQ3hCLFVBQU0sWUFBWSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7QUFDaEMsa0JBQVksQ0FBQyxhQUFhLEVBQUUsQ0FBQztBQUM3QixVQUFNLFdBQVcsR0FBRyxZQUFZLENBQUMsVUFBVSxFQUFFLENBQUM7QUFDOUMsa0JBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUN2QixhQUFPLFdBQVcsQ0FBQztLQUNwQjs7O1NBckNrQixZQUFZOzs7cUJBQVosWUFBWSIsImZpbGUiOiIvaG9tZS90dW5rZXJ0Ly5hdG9tL3BhY2thZ2VzL2l2LXRlcm1pbmFsL2xpYi90aGVtZS1tYXRjaGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqIEBiYWJlbCAqL1xuXG4vLyBUT0RPOiBBdG9tIGhhcyBhIHdvbmRlcmZ1bCBDb2xvciBjbGFzcyAoaHR0cHM6Ly9hdG9tLmlvL2RvY3MvYXBpL3YxLjIzLjMvQ29sb3IpLCBidXQgSSBjYW4ndCBmaWd1cmUgb3V0IGhvdyB0byBpbXBvcnQgaXQgZGlyZWN0bHkuLi4gSXQncyBub3QgZXhwb3J0ZWQ6IGh0dHBzOi8vZ2l0aHViLmNvbS9hdG9tL2F0b20vYmxvYi9mZjZkYzQyZmNkN2Q1MzNjZjRmNTBiMjg3NGUwOWNjZTI0Yzc3YzI4L2V4cG9ydHMvYXRvbS5qc1xuaW1wb3J0IHJnYkhleCBmcm9tICdyZ2ItaGV4JztcblxuLy8gVE9ETzogU2VsZWN0aW9uIGlzIHJlbmRlcmVkIGluIHRoZSBjYW52YXMsIGFuZCB0aGVyZWZvcmUgaXNuJ3QgYSBzdHJhaWdodFxuLy8gICAgICAgXCJiYWNrZ3JvdW5kIGNvbG9yXCIuIEl0IHJlbmRlcnMgYWJvdmUgdGV4dCBhbmQgbmVlZHMgYWxwaGEgaW4gb3JkZXJcbi8vICAgICAgIHRvIHNlZSB0aGUgdGV4dC4gVGhlcmVmb3JlLCB3ZSBjYW4ndCBzaW1wbHkgdGFrZSB0aGUgc2VsZWN0aW9uXG4vLyAgICAgICBjb2xvciBmcm9tIEF0b20gYW5kIHNldCBpdCBoZXJlLCBiZWNhdXNlIGl0IHdpbGwgbWFzayB0aGUgYWN0dWFsXG4vLyAgICAgICB0ZXh0IHdpdGhvdXQgYWxwaGEuIElmIHdlIG1ha2UgdGhlIHNlbGVjdGlvbiBjb2xvciBzZW1pLXRyYW5zcGFyZW50LFxuLy8gICAgICAgdGhlIGNvbG9yIHdvbid0IG1hdGNoIHRoZSBvcmlnaW5hbCBzZWxlY3Rpb24gY29sb3IgZnJvbSBBdG9tLlxuXG5jb25zdCBDT0xPUl9LRVlTID0gW1xuICAnZm9yZWdyb3VuZCcsICdiYWNrZ3JvdW5kJywgJ2N1cnNvcicsICdjdXJzb3JBY2NlbnQnLCAvKiAnc2VsZWN0aW9uJywgKi8gJ2JsYWNrJyxcbiAgJ3JlZCcsICdncmVlbicsICd5ZWxsb3cnLCAnYmx1ZScsICdtYWdlbnRhJywgJ2N5YW4nLCAnd2hpdGUnLCAnYnJpZ2h0QmxhY2snLFxuICAnYnJpZ2h0UmVkJywgJ2JyaWdodEdyZWVuJywgJ2JyaWdodFllbGxvdycsICdicmlnaHRCbHVlJywgJ2JyaWdodE1hZ2VudGEnLFxuICAnYnJpZ2h0Q3lhbicsICdicmlnaHRXaGl0ZSdcbl07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRoZW1lTWF0Y2hlciB7XG5cbiAgd3JpdGVFbGVtZW50cygpIHtcbiAgICB0aGlzLmNvbG9yRWxlbWVudHMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICB0aGlzLmNvbG9yRWxlbWVudHMuY2xhc3NMaXN0LmFkZCgndGVybWluYWwtdmlldy1jb2xvci1lbGVtZW50cycpO1xuXG4gICAgQ09MT1JfS0VZUy5mb3JFYWNoKChjb2xvcktleSkgPT4ge1xuICAgICAgY29uc3QgY29sb3JFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgICAgY29sb3JFbGVtZW50LmRhdGFzZXQuY29sb3JLZXkgPSBjb2xvcktleTtcbiAgICAgIHRoaXMuY29sb3JFbGVtZW50cy5hcHBlbmRDaGlsZChjb2xvckVsZW1lbnQpO1xuICAgIH0pO1xuXG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLmNvbG9yRWxlbWVudHMpO1xuICB9XG5cbiAgcmVhZFN0eWxlcygpIHtcbiAgICBjb25zdCBjb2xvcnMgPSB7fTtcblxuICAgIEFycmF5LmZyb20odGhpcy5jb2xvckVsZW1lbnRzLmNoaWxkcmVuKS5mb3JFYWNoKChjb2xvckVsZW1lbnQpID0+IHtcbiAgICAgIGNvbnN0IGNvbG9yS2V5ID0gY29sb3JFbGVtZW50LmRhdGFzZXQuY29sb3JLZXk7XG4gICAgICBjb25zdCBjb21wdXRlZFN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZShjb2xvckVsZW1lbnQpO1xuICAgICAgY29sb3JzW2NvbG9yS2V5XSA9IGAjJHtyZ2JIZXgoY29tcHV0ZWRTdHlsZS5jb2xvcil9YDtcbiAgICB9KTtcblxuICAgIHJldHVybiBjb2xvcnM7XG4gIH1cblxuICBjbGVhbnVwKCkge1xuICAgIHRoaXMuY29sb3JFbGVtZW50cy5yZW1vdmUoKTtcbiAgfVxuXG4gIHN0YXRpYyBwYXJzZVRoZW1lU3R5bGVzKCkge1xuICAgIGNvbnN0IHRoZW1lTWF0Y2hlciA9IG5ldyB0aGlzKCk7XG4gICAgdGhlbWVNYXRjaGVyLndyaXRlRWxlbWVudHMoKTtcbiAgICBjb25zdCB0aGVtZUNvbG9ycyA9IHRoZW1lTWF0Y2hlci5yZWFkU3R5bGVzKCk7XG4gICAgdGhlbWVNYXRjaGVyLmNsZWFudXAoKTtcbiAgICByZXR1cm4gdGhlbWVDb2xvcnM7XG4gIH1cblxufVxuIl19