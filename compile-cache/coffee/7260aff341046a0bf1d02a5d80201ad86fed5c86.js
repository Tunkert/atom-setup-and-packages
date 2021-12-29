(function() {
  var slice = [].slice;

  module.exports = {
    prefix: 'atom-autocomplete-python:',
    debug: function() {
      var msg;
      msg = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      if (atom.config.get('atom-autocomplete-python.outputDebug')) {
        return console.debug.apply(console, [this.prefix].concat(slice.call(msg)));
      }
    },
    warning: function() {
      var msg;
      msg = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return console.warn.apply(console, [this.prefix].concat(slice.call(msg)));
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvdHVua2VydC8uYXRvbS9wYWNrYWdlcy9hdG9tLWF1dG9jb21wbGV0ZS1weXRob24vbGliL2xvZy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxNQUFBLEVBQVEsMkJBQVI7SUFDQSxLQUFBLEVBQU8sU0FBQTtBQUNMLFVBQUE7TUFETTtNQUNOLElBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHNDQUFoQixDQUFIO0FBQ0UsZUFBTyxPQUFPLENBQUMsS0FBUixnQkFBYyxDQUFBLElBQUMsQ0FBQSxNQUFRLFNBQUEsV0FBQSxHQUFBLENBQUEsQ0FBdkIsRUFEVDs7SUFESyxDQURQO0lBS0EsT0FBQSxFQUFTLFNBQUE7QUFDUCxVQUFBO01BRFE7QUFDUixhQUFPLE9BQU8sQ0FBQyxJQUFSLGdCQUFhLENBQUEsSUFBQyxDQUFBLE1BQVEsU0FBQSxXQUFBLEdBQUEsQ0FBQSxDQUF0QjtJQURBLENBTFQ7O0FBREYiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9XG4gIHByZWZpeDogJ2F0b20tYXV0b2NvbXBsZXRlLXB5dGhvbjonXG4gIGRlYnVnOiAobXNnLi4uKSAtPlxuICAgIGlmIGF0b20uY29uZmlnLmdldCgnYXRvbS1hdXRvY29tcGxldGUtcHl0aG9uLm91dHB1dERlYnVnJylcbiAgICAgIHJldHVybiBjb25zb2xlLmRlYnVnIEBwcmVmaXgsIG1zZy4uLlxuXG4gIHdhcm5pbmc6IChtc2cuLi4pIC0+XG4gICAgcmV0dXJuIGNvbnNvbGUud2FybiBAcHJlZml4LCBtc2cuLi5cbiJdfQ==
