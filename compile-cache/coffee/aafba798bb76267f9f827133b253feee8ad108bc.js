(function() {
  var PythonAutopep8;

  PythonAutopep8 = require('./python-autopep8');

  module.exports = {
    config: {
      autopep8Path: {
        type: 'string',
        "default": 'autopep8'
      },
      formatOnSave: {
        type: 'boolean',
        "default": false
      },
      maxLineLength: {
        type: 'integer',
        "default": 100
      }
    },
    activate: function() {
      var pi;
      pi = new PythonAutopep8();
      atom.commands.add('atom-workspace', 'pane:active-item-changed', function() {
        return pi.removeStatusbarItem();
      });
      atom.commands.add('atom-workspace', 'python-autopep8:format', function() {
        return pi.format();
      });
      return atom.config.observe('python-autopep8.formatOnSave', function(value) {
        return atom.workspace.observeTextEditors(function(editor) {
          var ref;
          if (value === true) {
            return editor._autopep8Format = editor.onDidSave(function() {
              return pi.format();
            });
          } else {
            return (ref = editor._autopep8Format) != null ? ref.dispose() : void 0;
          }
        });
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvdHVua2VydC8uYXRvbS9wYWNrYWdlcy9weXRob24tYXV0b3BlcDgvbGliL2luZGV4LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsY0FBQSxHQUFpQixPQUFBLENBQVEsbUJBQVI7O0VBRWpCLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxNQUFBLEVBQ0U7TUFBQSxZQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sUUFBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsVUFEVDtPQURGO01BR0EsWUFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBRFQ7T0FKRjtNQU1BLGFBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxHQURUO09BUEY7S0FERjtJQVdBLFFBQUEsRUFBVSxTQUFBO0FBQ1IsVUFBQTtNQUFBLEVBQUEsR0FBSyxJQUFJLGNBQUosQ0FBQTtNQUVMLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixnQkFBbEIsRUFBb0MsMEJBQXBDLEVBQWdFLFNBQUE7ZUFDOUQsRUFBRSxDQUFDLG1CQUFILENBQUE7TUFEOEQsQ0FBaEU7TUFHQSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsZ0JBQWxCLEVBQW9DLHdCQUFwQyxFQUE4RCxTQUFBO2VBQzVELEVBQUUsQ0FBQyxNQUFILENBQUE7TUFENEQsQ0FBOUQ7YUFHQSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQVosQ0FBb0IsOEJBQXBCLEVBQW9ELFNBQUMsS0FBRDtlQUNsRCxJQUFJLENBQUMsU0FBUyxDQUFDLGtCQUFmLENBQWtDLFNBQUMsTUFBRDtBQUNoQyxjQUFBO1VBQUEsSUFBRyxLQUFBLEtBQVMsSUFBWjttQkFDRSxNQUFNLENBQUMsZUFBUCxHQUF5QixNQUFNLENBQUMsU0FBUCxDQUFpQixTQUFBO3FCQUFHLEVBQUUsQ0FBQyxNQUFILENBQUE7WUFBSCxDQUFqQixFQUQzQjtXQUFBLE1BQUE7K0RBR3dCLENBQUUsT0FBeEIsQ0FBQSxXQUhGOztRQURnQyxDQUFsQztNQURrRCxDQUFwRDtJQVRRLENBWFY7O0FBSEYiLCJzb3VyY2VzQ29udGVudCI6WyJQeXRob25BdXRvcGVwOCA9IHJlcXVpcmUgJy4vcHl0aG9uLWF1dG9wZXA4J1xuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIGNvbmZpZzpcbiAgICBhdXRvcGVwOFBhdGg6XG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogJ2F1dG9wZXA4J1xuICAgIGZvcm1hdE9uU2F2ZTpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICBtYXhMaW5lTGVuZ3RoOlxuICAgICAgdHlwZTogJ2ludGVnZXInXG4gICAgICBkZWZhdWx0OiAxMDBcblxuICBhY3RpdmF0ZTogLT5cbiAgICBwaSA9IG5ldyBQeXRob25BdXRvcGVwOCgpXG5cbiAgICBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCAncGFuZTphY3RpdmUtaXRlbS1jaGFuZ2VkJywgLT5cbiAgICAgIHBpLnJlbW92ZVN0YXR1c2Jhckl0ZW0oKVxuXG4gICAgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJywgJ3B5dGhvbi1hdXRvcGVwODpmb3JtYXQnLCAtPlxuICAgICAgcGkuZm9ybWF0KClcblxuICAgIGF0b20uY29uZmlnLm9ic2VydmUgJ3B5dGhvbi1hdXRvcGVwOC5mb3JtYXRPblNhdmUnLCAodmFsdWUpIC0+XG4gICAgICBhdG9tLndvcmtzcGFjZS5vYnNlcnZlVGV4dEVkaXRvcnMgKGVkaXRvcikgLT5cbiAgICAgICAgaWYgdmFsdWUgPT0gdHJ1ZVxuICAgICAgICAgIGVkaXRvci5fYXV0b3BlcDhGb3JtYXQgPSBlZGl0b3Iub25EaWRTYXZlIC0+IHBpLmZvcm1hdCgpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBlZGl0b3IuX2F1dG9wZXA4Rm9ybWF0Py5kaXNwb3NlKClcbiJdfQ==
