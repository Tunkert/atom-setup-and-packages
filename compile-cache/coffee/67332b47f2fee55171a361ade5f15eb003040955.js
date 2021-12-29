(function() {
  var CompositeDisposable, Emitter, Logger, Metrics, os, path, ref, ref1;

  os = require('os');

  path = require('path');

  ref = require('atom'), CompositeDisposable = ref.CompositeDisposable, Emitter = ref.Emitter;

  ref1 = [], Metrics = ref1[0], Logger = ref1[1];

  window.DEBUG = false;

  module.exports = {
    config: {
      showDescriptions: {
        type: 'boolean',
        "default": true,
        order: 1,
        title: 'Show Descriptions',
        description: 'Show doc strings from functions, classes, etc.'
      },
      useSnippets: {
        type: 'string',
        "default": 'none',
        order: 2,
        "enum": ['none', 'all', 'required'],
        title: 'Autocomplete Function Parameters',
        description: 'Automatically complete function arguments after typing\nleft parenthesis character. Use completion key to jump between\narguments. See `atom-autocomplete-python:complete-arguments` command if you\nwant to trigger argument completions manually. See README if it does not\nwork for you.'
      },
      pythonPaths: {
        type: 'string',
        "default": '',
        order: 3,
        title: 'Python Executable Paths',
        description: 'Optional semicolon separated list of paths to python\nexecutables (including executable names), where the first one will take\nhigher priority over the last one. By default atom-autocomplete-python will\nautomatically look for virtual environments inside of your project and\ntry to use them as well as try to find global python executable. If you\nuse this config, automatic lookup will have lowest priority.\nUse `$PROJECT` or `$PROJECT_NAME` substitution for project-specific\npaths to point on executables in virtual environments.\nFor example:\n`/Users/name/.virtualenvs/$PROJECT_NAME/bin/python;$PROJECT/venv/bin/python3;/usr/bin/python`.\nSuch config will fall back on `/usr/bin/python` for projects not presented\nwith same name in `.virtualenvs` and without `venv` folder inside of one\nof project folders.\nIf you are using python3 executable while coding for python2 you will get\npython2 completions for some built-ins.'
      },
      extraPaths: {
        type: 'string',
        "default": '',
        order: 4,
        title: 'Extra Paths For Packages',
        description: 'Semicolon separated list of modules to additionally\ninclude for autocomplete. You can use same substitutions as in\n`Python Executable Paths`.\nNote that it still should be valid python package.\nFor example:\n`$PROJECT/env/lib/python2.7/site-packages`\nor\n`/User/name/.virtualenvs/$PROJECT_NAME/lib/python2.7/site-packages`.\nYou don\'t need to specify extra paths for libraries installed with python\nexecutable you use.'
      },
      caseInsensitiveCompletion: {
        type: 'boolean',
        "default": true,
        order: 5,
        title: 'Case Insensitive Completion',
        description: 'The completion is by default case insensitive.'
      },
      triggerCompletionRegex: {
        type: 'string',
        "default": '([\.\ (]|[a-zA-Z_][a-zA-Z0-9_]*)',
        order: 6,
        title: 'Regex To Trigger Autocompletions',
        description: 'By default completions triggered after words, dots, spaces\nand left parenthesis. You will need to restart your editor after changing\nthis.'
      },
      fuzzyMatcher: {
        type: 'boolean',
        "default": true,
        order: 7,
        title: 'Use Fuzzy Matcher For Completions.',
        description: 'Typing `stdr` will match `stderr`.\nFirst character should always match. Uses additional caching thus\ncompletions should be faster. Note that this setting does not affect\nbuilt-in autocomplete-plus provider.'
      },
      outputProviderErrors: {
        type: 'boolean',
        "default": false,
        order: 8,
        title: 'Output Provider Errors',
        description: 'Select if you would like to see the provider errors when\nthey happen. By default they are hidden. Note that critical errors are\nalways shown.'
      },
      outputDebug: {
        type: 'boolean',
        "default": false,
        order: 9,
        title: 'Output Debug Logs',
        description: 'Select if you would like to see debug information in\ndeveloper tools logs. May slow down your editor.'
      },
      showTooltips: {
        type: 'boolean',
        "default": false,
        order: 10,
        title: 'Show Tooltips with information about the object under the cursor',
        description: 'EXPERIMENTAL FEATURE WHICH IS NOT FINISHED YET.\nFeedback and ideas are welcome on github.'
      },
      suggestionPriority: {
        type: 'integer',
        "default": 3,
        minimum: 0,
        maximum: 99,
        order: 11,
        title: 'Suggestion Priority',
        description: 'You can use this to set the priority for atom-autocomplete-python\nsuggestions. For example, you can use lower value to give higher priority\nfor snippets completions which has priority of 2.'
      },
      enableTouchBar: {
        type: 'boolean',
        "default": false,
        order: 12,
        title: 'Enable Touch Bar support',
        description: 'Proof of concept for now, requires tooltips to be enabled and Atom >=1.19.0.'
      }
    },
    installation: null,
    _handleGrammarChangeEvent: function(grammar) {
      var ref2;
      if ((ref2 = grammar.packageName) === 'language-python' || ref2 === 'MagicPython' || ref2 === 'atom-django') {
        this.provider.load();
        this.emitter.emit('did-load-provider');
        return this.disposables.dispose();
      }
    },
    load: function() {
      var disposable;
      this.disposables = new CompositeDisposable;
      disposable = atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          _this._handleGrammarChangeEvent(editor.getGrammar());
          disposable = editor.onDidChangeGrammar(function(grammar) {
            return _this._handleGrammarChangeEvent(grammar);
          });
          return _this.disposables.add(disposable);
        };
      })(this));
      return this.disposables.add(disposable);
    },
    activate: function(state) {
      var disposable;
      this.emitter = new Emitter;
      this.provider = require('./provider');
      if (typeof atom.packages.hasActivatedInitialPackages === 'function' && atom.packages.hasActivatedInitialPackages()) {
        return this.load();
      } else {
        return disposable = atom.packages.onDidActivateInitialPackages((function(_this) {
          return function() {
            _this.load();
            return disposable.dispose();
          };
        })(this));
      }
    },
    deactivate: function() {
      if (this.provider) {
        this.provider.dispose();
      }
      if (this.installation) {
        return this.installation.destroy();
      }
    },
    getProvider: function() {
      return this.provider;
    },
    getHyperclickProvider: function() {
      return require('./hyperclick-provider');
    },
    consumeSnippets: function(snippetsManager) {
      var disposable;
      return disposable = this.emitter.on('did-load-provider', (function(_this) {
        return function() {
          _this.provider.setSnippetsManager(snippetsManager);
          return disposable.dispose();
        };
      })(this));
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvdHVua2VydC8uYXRvbS9wYWNrYWdlcy9hdG9tLWF1dG9jb21wbGV0ZS1weXRob24vbGliL21haW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0VBQ0wsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLE1BQWlDLE9BQUEsQ0FBUSxNQUFSLENBQWpDLEVBQUMsNkNBQUQsRUFBc0I7O0VBRXRCLE9BQW9CLEVBQXBCLEVBQUMsaUJBQUQsRUFBVTs7RUFFVixNQUFNLENBQUMsS0FBUCxHQUFlOztFQUNmLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxNQUFBLEVBQ0U7TUFBQSxnQkFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBRFQ7UUFFQSxLQUFBLEVBQU8sQ0FGUDtRQUdBLEtBQUEsRUFBTyxtQkFIUDtRQUlBLFdBQUEsRUFBYSxnREFKYjtPQURGO01BTUEsV0FBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFFBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLE1BRFQ7UUFFQSxLQUFBLEVBQU8sQ0FGUDtRQUdBLENBQUEsSUFBQSxDQUFBLEVBQU0sQ0FBQyxNQUFELEVBQVMsS0FBVCxFQUFnQixVQUFoQixDQUhOO1FBSUEsS0FBQSxFQUFPLGtDQUpQO1FBS0EsV0FBQSxFQUFhLDhSQUxiO09BUEY7TUFpQkEsV0FBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFFBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEVBRFQ7UUFFQSxLQUFBLEVBQU8sQ0FGUDtRQUdBLEtBQUEsRUFBTyx5QkFIUDtRQUlBLFdBQUEsRUFBYSxxNkJBSmI7T0FsQkY7TUFxQ0EsVUFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFFBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEVB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QSxTQUFBO1VBQzVDLEtBQUMsQ0FBQSxRQUFRLENBQUMsa0JBQVYsQ0FBNkIsZUFBN0I7aUJBQ0EsVUFBVSxDQUFDLE9BQVgsQ0FBQTtRQUY0QztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBakM7SUFERSxDQTFKakI7O0FBUkYiLCJzb3VyY2VzQ29udGVudCI6WyJvcyA9IHJlcXVpcmUgJ29zJ1xucGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG57Q29tcG9zaXRlRGlzcG9zYWJsZSwgRW1pdHRlcn0gPSByZXF1aXJlICdhdG9tJ1xuXG5bTWV0cmljcywgTG9nZ2VyXSA9IFtdXG5cbndpbmRvdy5ERUJVRyA9IGZhbHNlXG5tb2R1bGUuZXhwb3J0cyA9XG4gIGNvbmZpZzpcbiAgICBzaG93RGVzY3JpcHRpb25zOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICBvcmRlcjogMVxuICAgICAgdGl0bGU6ICdTaG93IERlc2NyaXB0aW9ucydcbiAgICAgIGRlc2NyaXB0aW9uOiAnU2hvdyBkb2Mgc3RyaW5ncyBmcm9tIGZ1bmN0aW9ucywgY2xhc3NlcywgZXRjLidcbiAgICB1c2VTbmlwcGV0czpcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiAnbm9uZSdcbiAgICAgIG9yZGVyOiAyXG4gICAgICBlbnVtOiBbJ25vbmUnLCAnYWxsJywgJ3JlcXVpcmVkJ11cbiAgICAgIHRpdGxlOiAnQXV0b2NvbXBsZXRlIEZ1bmN0aW9uIFBhcmFtZXRlcnMnXG4gICAgICBkZXNjcmlwdGlvbjogJycnQXV0b21hdGljYWxseSBjb21wbGV0ZSBmdW5jdGlvbiBhcmd1bWVudHMgYWZ0ZXIgdHlwaW5nXG4gICAgICBsZWZ0IHBhcmVudGhlc2lzIGNoYXJhY3Rlci4gVXNlIGNvbXBsZXRpb24ga2V5IHRvIGp1bXAgYmV0d2VlblxuICAgICAgYXJndW1lbnRzLiBTZWUgYGF0b20tYXV0b2NvbXBsZXRlLXB5dGhvbjpjb21wbGV0ZS1hcmd1bWVudHNgIGNvbW1hbmQgaWYgeW91XG4gICAgICB3YW50IHRvIHRyaWdnZXIgYXJndW1lbnQgY29tcGxldGlvbnMgbWFudWFsbHkuIFNlZSBSRUFETUUgaWYgaXQgZG9lcyBub3RcbiAgICAgIHdvcmsgZm9yIHlvdS4nJydcbiAgICBweXRob25QYXRoczpcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiAnJ1xuICAgICAgb3JkZXI6IDNcbiAgICAgIHRpdGxlOiAnUHl0aG9uIEV4ZWN1dGFibGUgUGF0aHMnXG4gICAgICBkZXNjcmlwdGlvbjogJycnT3B0aW9uYWwgc2VtaWNvbG9uIHNlcGFyYXRlZCBsaXN0IG9mIHBhdGhzIHRvIHB5dGhvblxuICAgICAgZXhlY3V0YWJsZXMgKGluY2x1ZGluZyBleGVjdXRhYmxlIG5hbWVzKSwgd2hlcmUgdGhlIGZpcnN0IG9uZSB3aWxsIHRha2VcbiAgICAgIGhpZ2hlciBwcmlvcml0eSBvdmVyIHRoZSBsYXN0IG9uZS4gQnkgZGVmYXVsdCBhdG9tLWF1dG9jb21wbGV0ZS1weXRob24gd2lsbFxuICAgICAgYXV0b21hdGljYWxseSBsb29rIGZvciB2aXJ0dWFsIGVudmlyb25tZW50cyBpbnNpZGUgb2YgeW91ciBwcm9qZWN0IGFuZFxuICAgICAgdHJ5IHRvIHVzZSB0aGVtIGFzIHdlbGwgYXMgdHJ5IHRvIGZpbmQgZ2xvYmFsIHB5dGhvbiBleGVjdXRhYmxlLiBJZiB5b3VcbiAgICAgIHVzZSB0aGlzIGNvbmZpZywgYXV0b21hdGljIGxvb2t1cCB3aWxsIGhhdmUgbG93ZXN0IHByaW9yaXR5LlxuICAgICAgVXNlIGAkUFJPSkVDVGAgb3IgYCRQUk9KRUNUX05BTUVgIHN1YnN0aXR1dGlvbiBmb3IgcHJvamVjdC1zcGVjaWZpY1xuICAgICAgcGF0aHMgdG8gcG9pbnQgb24gZXhlY3V0YWJsZXMgaW4gdmlydHVhbCBlbnZpcm9ubWVudHMuXG4gICAgICBGb3IgZXhhbXBsZTpcbiAgICAgIGAvVXNlcnMvbmFtZS8udmlydHVhbGVudnMvJFBST0pFQ1RfTkFNRS9iaW4vcHl0aG9uOyRQUk9KRUNUL3ZlbnYvYmluL3B5dGhvbjM7L3Vzci9iaW4vcHl0aG9uYC5cbiAgICAgIFN1Y2ggY29uZmlnIHdpbGwgZmFsbCBiYWNrIG9uIGAvdXNyL2Jpbi9weXRob25gIGZvciBwcm9qZWN0cyBub3QgcHJlc2VudGVkXG4gICAgICB3aXRoIHNhbWUgbmFtZSBpbiBgLnZpcnR1YWxlbnZzYCBhbmQgd2l0aG91dCBgdmVudmAgZm9sZGVyIGluc2lkZSBvZiBvbmVcbiAgICAgIG9mIHByb2plY3QgZm9sZGVycy5cbiAgICAgIElmIHlvdSBhcmUgdXNpbmcgcHl0aG9uMyBleGVjdXRhYmxlIHdoaWxlIGNvZGluZyBmb3IgcHl0aG9uMiB5b3Ugd2lsbCBnZXRcbiAgICAgIHB5dGhvbjIgY29tcGxldGlvbnMgZm9yIHNvbWUgYnVpbHQtaW5zLicnJ1xuICAgIGV4dHJhUGF0aHM6XG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogJydcbiAgICAgIG9yZGVyOiA0XG4gICAgICB0aXRsZTogJ0V4dHJhIFBhdGhzIEZvciBQYWNrYWdlcydcbiAgICAgIGRlc2NyaXB0aW9uOiAnJydTZW1pY29sb24gc2VwYXJhdGVkIGxpc3Qgb2YgbW9kdWxlcyB0byBhZGRpdGlvbmFsbHlcbiAgICAgIGluY2x1ZGUgZm9yIGF1dG9jb21wbGV0ZS4gWW91IGNhbiB1c2Ugc2FtZSBzdWJzdGl0dXRpb25zIGFzIGluXG4gICAgICBgUHl0aG9uIEV4ZWN1dGFibGUgUGF0aHNgLlxuICAgICAgTm90ZSB0aGF0IGl0IHN0aWxsIHNob3VsZCBiZSB2YWxpZCBweXRob24gcGFja2FnZS5cbiAgICAgIEZvciBleGFtcGxlOlxuICAgICAgYCRQUk9KRUNUL2Vudi9saWIvcHl0aG9uMi43L3NpdGUtcGFja2FnZXNgXG4gICAgICBvclxuICAgICAgYC9Vc2VyL25hbWUvLnZpcnR1YWxlbnZzLyRQUk9KRUNUX05BTUUvbGliL3B5dGhvbjIuNy9zaXRlLXBhY2thZ2VzYC5cbiAgICAgIFlvdSBkb24ndCBuZWVkIHRvIHNwZWNpZnkgZXh0cmEgcGF0aHMgZm9yIGxpYnJhcmllcyBpbnN0YWxsZWQgd2l0aCBweXRob25cbiAgICAgIGV4ZWN1dGFibGUgeW91IHVzZS4nJydcbiAgICBjYXNlSW5zZW5zaXRpdmVDb21wbGV0aW9uOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICBvcmRlcjogNVxuICAgICAgdGl0bGU6ICdDYXNlIEluc2Vuc2l0aXZlIENvbXBsZXRpb24nXG4gICAgICBkZXNjcmlwdGlvbjogJ1RoZSBjb21wbGV0aW9uIGlzIGJ5IGRlZmF1bHQgY2FzZSBpbnNlbnNpdGl2ZS4nXG4gICAgdHJpZ2dlckNvbXBsZXRpb25SZWdleDpcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiAnKFtcXC5cXCAoXXxbYS16QS1aX11bYS16QS1aMC05X10qKSdcbiAgICAgIG9yZGVyOiA2XG4gICAgICB0aXRsZTogJ1JlZ2V4IFRvIFRyaWdnZXIgQXV0b2NvbXBsZXRpb25zJ1xuICAgICAgZGVzY3JpcHRpb246ICcnJ0J5IGRlZmF1bHQgY29tcGxldGlvbnMgdHJpZ2dlcmVkIGFmdGVyIHdvcmRzLCBkb3RzLCBzcGFjZXNcbiAgICAgIGFuZCBsZWZ0IHBhcmVudGhlc2lzLiBZb3Ugd2lsbCBuZWVkIHRvIHJlc3RhcnQgeW91ciBlZGl0b3IgYWZ0ZXIgY2hhbmdpbmdcbiAgICAgIHRoaXMuJycnXG4gICAgZnV6enlNYXRjaGVyOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICBvcmRlcjogN1xuICAgICAgdGl0bGU6ICdVc2UgRnV6enkgTWF0Y2hlciBGb3IgQ29tcGxldGlvbnMuJ1xuICAgICAgZGVzY3JpcHRpb246ICcnJ1R5cGluZyBgc3RkcmAgd2lsbCBtYXRjaCBgc3RkZXJyYC5cbiAgICAgIEZpcnN0IGNoYXJhY3RlciBzaG91bGQgYWx3YXlzIG1hdGNoLiBVc2VzIGFkZGl0aW9uYWwgY2FjaGluZyB0aHVzXG4gICAgICBjb21wbGV0aW9ucyBzaG91bGQgYmUgZmFzdGVyLiBOb3RlIHRoYXQgdGhpcyBzZXR0aW5nIGRvZXMgbm90IGFmZmVjdFxuICAgICAgYnVpbHQtaW4gYXV0b2NvbXBsZXRlLXBsdXMgcHJvdmlkZXIuJycnXG4gICAgb3V0cHV0UHJvdmlkZXJFcnJvcnM6XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICBvcmRlcjogOFxuICAgICAgdGl0bGU6ICdPdXRwdXQgUHJvdmlkZXIgRXJyb3JzJ1xuICAgICAgZGVzY3JpcHRpb246ICcnJ1NlbGVjdCBpZiB5b3Ugd291bGQgbGlrZSB0byBzZWUgdGhlIHByb3ZpZGVyIGVycm9ycyB3aGVuXG4gICAgICB0aGV5IGhhcHBlbi4gQnkgZGVmYXVsdCB0aGV5IGFyZSBoaWRkZW4uIE5vdGUgdGhhdCBjcml0aWNhbCBlcnJvcnMgYXJlXG4gICAgICBhbHdheXMgc2hvd24uJycnXG4gICAgb3V0cHV0RGVidWc6XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICBvcmRlcjogOVxuICAgICAgdGl0bGU6ICdPdXRwdXQgRGVidWcgTG9ncydcbiAgICAgIGRlc2NyaXB0aW9uOiAnJydTZWxlY3QgaWYgeW91IHdvdWxkIGxpa2UgdG8gc2VlIGRlYnVnIGluZm9ybWF0aW9uIGluXG4gICAgICBkZXZlbG9wZXIgdG9vbHMgbG9ncy4gTWF5IHNsb3cgZG93biB5b3VyIGVkaXRvci4nJydcbiAgICBzaG93VG9vbHRpcHM6XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICBvcmRlcjogMTBcbiAgICAgIHRpdGxlOiAnU2hvdyBUb29sdGlwcyB3aXRoIGluZm9ybWF0aW9uIGFib3V0IHRoZSBvYmplY3QgdW5kZXIgdGhlIGN1cnNvcidcbiAgICAgIGRlc2NyaXB0aW9uOiAnJydFWFBFUklNRU5UQUwgRkVBVFVSRSBXSElDSCBJUyBOT1QgRklOSVNIRUQgWUVULlxuICAgICAgRmVlZGJhY2sgYW5kIGlkZWFzIGFyZSB3ZWxjb21lIG9uIGdpdGh1Yi4nJydcbiAgICBzdWdnZXN0aW9uUHJpb3JpdHk6XG4gICAgICB0eXBlOiAnaW50ZWdlcidcbiAgICAgIGRlZmF1bHQ6IDNcbiAgICAgIG1pbmltdW06IDBcbiAgICAgIG1heGltdW06IDk5XG4gICAgICBvcmRlcjogMTFcbiAgICAgIHRpdGxlOiAnU3VnZ2VzdGlvbiBQcmlvcml0eSdcbiAgICAgIGRlc2NyaXB0aW9uOiAnJydZb3UgY2FuIHVzZSB0aGlzIHRvIHNldCB0aGUgcHJpb3JpdHkgZm9yIGF0b20tYXV0b2NvbXBsZXRlLXB5dGhvblxuICAgICAgc3VnZ2VzdGlvbnMuIEZvciBleGFtcGxlLCB5b3UgY2FuIHVzZSBsb3dlciB2YWx1ZSB0byBnaXZlIGhpZ2hlciBwcmlvcml0eVxuICAgICAgZm9yIHNuaXBwZXRzIGNvbXBsZXRpb25zIHdoaWNoIGhhcyBwcmlvcml0eSBvZiAyLicnJ1xuICAgIGVuYWJsZVRvdWNoQmFyOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgb3JkZXI6IDEyXG4gICAgICB0aXRsZTogJ0VuYWJsZSBUb3VjaCBCYXIgc3VwcG9ydCdcbiAgICAgIGRlc2NyaXB0aW9uOiAnJydQcm9vZiBvZiBjb25jZXB0IGZvciBub3csIHJlcXVpcmVzIHRvb2x0aXBzIHRvIGJlIGVuYWJsZWQgYW5kIEF0b20gPj0xLjE5LjAuJycnXG5cbiAgaW5zdGFsbGF0aW9uOiBudWxsXG5cbiAgX2hhbmRsZUdyYW1tYXJDaGFuZ2VFdmVudDogKGdyYW1tYXIpIC0+XG4gICAgIyB0aGlzIHNob3VsZCBiZSBzYW1lIHdpdGggYWN0aXZhdGlvbkhvb2tzIG5hbWVzXG4gICAgaWYgZ3JhbW1hci5wYWNrYWdlTmFtZSBpbiBbJ2xhbmd1YWdlLXB5dGhvbicsICdNYWdpY1B5dGhvbicsICdhdG9tLWRqYW5nbyddXG4gICAgICBAcHJvdmlkZXIubG9hZCgpXG4gICAgICBAZW1pdHRlci5lbWl0ICdkaWQtbG9hZC1wcm92aWRlcidcbiAgICAgIEBkaXNwb3NhYmxlcy5kaXNwb3NlKClcblxuICBsb2FkOiAtPlxuICAgIEBkaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgZGlzcG9zYWJsZSA9IGF0b20ud29ya3NwYWNlLm9ic2VydmVUZXh0RWRpdG9ycyAoZWRpdG9yKSA9PlxuICAgICAgQF9oYW5kbGVHcmFtbWFyQ2hhbmdlRXZlbnQoZWRpdG9yLmdldEdyYW1tYXIoKSlcbiAgICAgIGRpc3Bvc2FibGUgPSBlZGl0b3Iub25EaWRDaGFuZ2VHcmFtbWFyIChncmFtbWFyKSA9PlxuICAgICAgICBAX2hhbmRsZUdyYW1tYXJDaGFuZ2VFdmVudChncmFtbWFyKVxuICAgICAgQGRpc3Bvc2FibGVzLmFkZCBkaXNwb3NhYmxlXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBkaXNwb3NhYmxlXG5cbiAgYWN0aXZhdGU6IChzdGF0ZSkgLT5cbiAgICBAZW1pdHRlciA9IG5ldyBFbWl0dGVyXG4gICAgQHByb3ZpZGVyID0gcmVxdWlyZSgnLi9wcm92aWRlcicpXG4gICAgaWYgdHlwZW9mIGF0b20ucGFja2FnZXMuaGFzQWN0aXZhdGVkSW5pdGlhbFBhY2thZ2VzID09ICdmdW5jdGlvbicgYW5kXG4gICAgICAgIGF0b20ucGFja2FnZXMuaGFzQWN0aXZhdGVkSW5pdGlhbFBhY2thZ2VzKClcbiAgICAgIEBsb2FkKClcbiAgICBlbHNlXG4gICAgICBkaXNwb3NhYmxlID0gYXRvbS5wYWNrYWdlcy5vbkRpZEFjdGl2YXRlSW5pdGlhbFBhY2thZ2VzID0+XG4gICAgICAgIEBsb2FkKClcbiAgICAgICAgZGlzcG9zYWJsZS5kaXNwb3NlKClcblxuICBkZWFjdGl2YXRlOiAtPlxuICAgIEBwcm92aWRlci5kaXNwb3NlKCkgaWYgQHByb3ZpZGVyXG4gICAgQGluc3RhbGxhdGlvbi5kZXN0cm95KCkgaWYgQGluc3RhbGxhdGlvblxuXG4gIGdldFByb3ZpZGVyOiAtPlxuICAgIHJldHVybiBAcHJvdmlkZXJcblxuICBnZXRIeXBlcmNsaWNrUHJvdmlkZXI6IC0+XG4gICAgcmV0dXJuIHJlcXVpcmUoJy4vaHlwZXJjbGljay1wcm92aWRlcicpXG5cbiAgY29uc3VtZVNuaXBwZXRzOiAoc25pcHBldHNNYW5hZ2VyKSAtPlxuICAgIGRpc3Bvc2FibGUgPSBAZW1pdHRlci5vbiAnZGlkLWxvYWQtcHJvdmlkZXInLCA9PlxuICAgICAgQHByb3ZpZGVyLnNldFNuaXBwZXRzTWFuYWdlciBzbmlwcGV0c01hbmFnZXJcbiAgICAgIGRpc3Bvc2FibGUuZGlzcG9zZSgpXG4iXX0=
