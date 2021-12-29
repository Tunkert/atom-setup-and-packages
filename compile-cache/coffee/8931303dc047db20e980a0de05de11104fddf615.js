(function() {
  var $, PythonAutopep8, process,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  $ = require('jquery');

  process = require('child_process');

  module.exports = PythonAutopep8 = (function() {
    function PythonAutopep8() {
      this.updateStatusbarText = bind(this.updateStatusbarText, this);
      this.removeStatusbarItem = bind(this.removeStatusbarItem, this);
    }

    PythonAutopep8.prototype.checkForPythonContext = function() {
      var editor;
      editor = atom.workspace.getActiveTextEditor();
      if (editor == null) {
        return false;
      }
      return editor.getGrammar().name === 'Python';
    };

    PythonAutopep8.prototype.removeStatusbarItem = function() {
      var ref;
      if ((ref = this.statusBarTile) != null) {
        ref.destroy();
      }
      return this.statusBarTile = null;
    };

    PythonAutopep8.prototype.updateStatusbarText = function(message, isError) {
      var statusBar, statusBarElement;
      if (!this.statusBarTile) {
        statusBar = document.querySelector("status-bar");
        if (statusBar == null) {
          return;
        }
        this.statusBarTile = statusBar.addLeftTile({
          item: $('<div id="status-bar-python-autopep8" class="inline-block"> <span style="font-weight: bold">Autopep8: </span> <span id="python-autopep8-status-message"></span> </div>'),
          priority: 100
        });
      }
      statusBarElement = this.statusBarTile.getItem().find('#python-autopep8-status-message');
      if (isError === true) {
        statusBarElement.addClass("text-error");
      } else {
        statusBarElement.removeClass("text-error");
      }
      return statusBarElement.text(message);
    };

    PythonAutopep8.prototype.getFilePath = function() {
      var editor;
      editor = atom.workspace.getActiveTextEditor();
      return editor.getPath();
    };

    PythonAutopep8.prototype.format = function() {
      var cmd, maxLineLength, params, returnCode;
      if (!this.checkForPythonContext()) {
        return;
      }
      cmd = atom.config.get("python-autopep8.autopep8Path");
      maxLineLength = atom.config.get("python-autopep8.maxLineLength");
      params = ["--max-line-length", maxLineLength, "-i", this.getFilePath()];
      returnCode = process.spawnSync(cmd, params).status;
      if (returnCode !== 0) {
        return this.updateStatusbarText("x", true);
      } else {
        this.updateStatusbarText("√", false);
        return this.reload;
      }
    };

    return PythonAutopep8;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvdHVua2VydC8uYXRvbS9wYWNrYWdlcy9weXRob24tYXV0b3BlcDgvbGliL3B5dGhvbi1hdXRvcGVwOC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDBCQUFBO0lBQUE7O0VBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSOztFQUNKLE9BQUEsR0FBVSxPQUFBLENBQVEsZUFBUjs7RUFFVixNQUFNLENBQUMsT0FBUCxHQUNNOzs7Ozs7NkJBRUoscUJBQUEsR0FBdUIsU0FBQTtBQUNyQixVQUFBO01BQUEsTUFBQSxHQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQTtNQUNULElBQU8sY0FBUDtBQUNFLGVBQU8sTUFEVDs7QUFFQSxhQUFPLE1BQU0sQ0FBQyxVQUFQLENBQUEsQ0FBbUIsQ0FBQyxJQUFwQixLQUE0QjtJQUpkOzs2QkFNdkIsbUJBQUEsR0FBcUIsU0FBQTtBQUNuQixVQUFBOztXQUFjLENBQUUsT0FBaEIsQ0FBQTs7YUFDQSxJQUFDLENBQUEsYUFBRCxHQUFpQjtJQUZFOzs2QkFJckIsbUJBQUEsR0FBcUIsU0FBQyxPQUFELEVBQVUsT0FBVjtBQUNuQixVQUFBO01BQUEsSUFBRyxDQUFJLElBQUMsQ0FBQSxhQUFSO1FBQ0UsU0FBQSxHQUFZLFFBQVEsQ0FBQyxhQUFULENBQXVCLFlBQXZCO1FBQ1osSUFBYyxpQkFBZDtBQUFBLGlCQUFBOztRQUNBLElBQUMsQ0FBQSxhQUFELEdBQWlCLFNBQ2YsQ0FBQyxXQURjLENBRWI7VUFBQSxJQUFBLEVBQU0sQ0FBQSxDQUFFLHVLQUFGLENBQU47VUFHa0IsUUFBQSxFQUFVLEdBSDVCO1NBRmEsRUFIbkI7O01BVUEsZ0JBQUEsR0FBbUIsSUFBQyxDQUFBLGFBQWEsQ0FBQyxPQUFmLENBQUEsQ0FDakIsQ0FBQyxJQURnQixDQUNYLGlDQURXO01BR25CLElBQUcsT0FBQSxLQUFXLElBQWQ7UUFDRSxnQkFBZ0IsQ0FBQyxRQUFqQixDQUEwQixZQUExQixFQURGO09BQUEsTUFBQTtRQUdFLGdCQUFnQixDQUFDLFdBQWpCLENBQTZCLFlBQTdCLEVBSEY7O2FBS0EsZ0JBQWdCLENBQUMsSUFBakIsQ0FBc0IsT0FBdEI7SUFuQm1COzs2QkFxQnJCLFdBQUEsR0FBYSxTQUFBO0FBQ1gsVUFBQTtNQUFBLE1BQUEsR0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFmLENBQUE7QUFDVCxhQUFPLE1BQU0sQ0FBQyxPQUFQLENBQUE7SUFGSTs7NkJBSWIsTUFBQSxHQUFRLFNBQUE7QUFDTixVQUFBO01BQUEsSUFBRyxDQUFJLElBQUMsQ0FBQSxxQkFBRCxDQUFBLENBQVA7QUFDRSxlQURGOztNQUdBLEdBQUEsR0FBTSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsOEJBQWhCO01BQ04sYUFBQSxHQUFnQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsK0JBQWhCO01BQ2hCLE1BQUEsR0FBUyxDQUFDLG1CQUFELEVBQXNCLGFBQXRCLEVBQXFDLElBQXJDLEVBQTJDLElBQUMsQ0FBQSxXQUFELENBQUEsQ0FBM0M7TUFFVCxVQUFBLEdBQWEsT0FBTyxDQUFDLFNBQVIsQ0FBa0IsR0FBbEIsRUFBdUIsTUFBdkIsQ0FBOEIsQ0FBQztNQUM1QyxJQUFHLFVBQUEsS0FBYyxDQUFqQjtlQUNFLElBQUMsQ0FBQSxtQkFBRCxDQUFxQixHQUFyQixFQUEwQixJQUExQixFQURGO09BQUEsTUFBQTtRQUdFLElBQUMsQ0FBQSxtQkFBRCxDQUFxQixHQUFyQixFQUEwQixLQUExQjtlQUNBLElBQUMsQ0FBQSxPQUpIOztJQVRNOzs7OztBQXpDViIsInNvdXJjZXNDb250ZW50IjpbIiQgPSByZXF1aXJlICdqcXVlcnknXG5wcm9jZXNzID0gcmVxdWlyZSAnY2hpbGRfcHJvY2VzcydcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgUHl0aG9uQXV0b3BlcDhcblxuICBjaGVja0ZvclB5dGhvbkNvbnRleHQ6IC0+XG4gICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgaWYgbm90IGVkaXRvcj9cbiAgICAgIHJldHVybiBmYWxzZVxuICAgIHJldHVybiBlZGl0b3IuZ2V0R3JhbW1hcigpLm5hbWUgPT0gJ1B5dGhvbidcblxuICByZW1vdmVTdGF0dXNiYXJJdGVtOiA9PlxuICAgIEBzdGF0dXNCYXJUaWxlPy5kZXN0cm95KClcbiAgICBAc3RhdHVzQmFyVGlsZSA9IG51bGxcblxuICB1cGRhdGVTdGF0dXNiYXJUZXh0OiAobWVzc2FnZSwgaXNFcnJvcikgPT5cbiAgICBpZiBub3QgQHN0YXR1c0JhclRpbGVcbiAgICAgIHN0YXR1c0JhciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJzdGF0dXMtYmFyXCIpXG4gICAgICByZXR1cm4gdW5sZXNzIHN0YXR1c0Jhcj9cbiAgICAgIEBzdGF0dXNCYXJUaWxlID0gc3RhdHVzQmFyXG4gICAgICAgIC5hZGRMZWZ0VGlsZShcbiAgICAgICAgICBpdGVtOiAkKCc8ZGl2IGlkPVwic3RhdHVzLWJhci1weXRob24tYXV0b3BlcDhcIiBjbGFzcz1cImlubGluZS1ibG9ja1wiPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBzdHlsZT1cImZvbnQtd2VpZ2h0OiBib2xkXCI+QXV0b3BlcDg6IDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gaWQ9XCJweXRob24tYXV0b3BlcDgtc3RhdHVzLW1lc3NhZ2VcIj48L3NwYW4+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj4nKSwgcHJpb3JpdHk6IDEwMClcblxuICAgIHN0YXR1c0JhckVsZW1lbnQgPSBAc3RhdHVzQmFyVGlsZS5nZXRJdGVtKClcbiAgICAgIC5maW5kKCcjcHl0aG9uLWF1dG9wZXA4LXN0YXR1cy1tZXNzYWdlJylcblxuICAgIGlmIGlzRXJyb3IgPT0gdHJ1ZVxuICAgICAgc3RhdHVzQmFyRWxlbWVudC5hZGRDbGFzcyhcInRleHQtZXJyb3JcIilcbiAgICBlbHNlXG4gICAgICBzdGF0dXNCYXJFbGVtZW50LnJlbW92ZUNsYXNzKFwidGV4dC1lcnJvclwiKVxuXG4gICAgc3RhdHVzQmFyRWxlbWVudC50ZXh0KG1lc3NhZ2UpXG5cbiAgZ2V0RmlsZVBhdGg6IC0+XG4gICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgcmV0dXJuIGVkaXRvci5nZXRQYXRoKClcblxuICBmb3JtYXQ6IC0+XG4gICAgaWYgbm90IEBjaGVja0ZvclB5dGhvbkNvbnRleHQoKVxuICAgICAgcmV0dXJuXG5cbiAgICBjbWQgPSBhdG9tLmNvbmZpZy5nZXQgXCJweXRob24tYXV0b3BlcDguYXV0b3BlcDhQYXRoXCJcbiAgICBtYXhMaW5lTGVuZ3RoID0gYXRvbS5jb25maWcuZ2V0IFwicHl0aG9uLWF1dG9wZXA4Lm1heExpbmVMZW5ndGhcIlxuICAgIHBhcmFtcyA9IFtcIi0tbWF4LWxpbmUtbGVuZ3RoXCIsIG1heExpbmVMZW5ndGgsIFwiLWlcIiwgQGdldEZpbGVQYXRoKCldXG5cbiAgICByZXR1cm5Db2RlID0gcHJvY2Vzcy5zcGF3blN5bmMoY21kLCBwYXJhbXMpLnN0YXR1c1xuICAgIGlmIHJldHVybkNvZGUgIT0gMFxuICAgICAgQHVwZGF0ZVN0YXR1c2JhclRleHQoXCJ4XCIsIHRydWUpXG4gICAgZWxzZVxuICAgICAgQHVwZGF0ZVN0YXR1c2JhclRleHQoXCLiiJpcIiwgZmFsc2UpXG4gICAgICBAcmVsb2FkXG4iXX0=
