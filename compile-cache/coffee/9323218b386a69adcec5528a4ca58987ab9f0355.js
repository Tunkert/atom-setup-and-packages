(function() {
  var log, touchbar;

  log = require('./log');

  if (atom.config.get('atom-autocomplete-python.enableTouchBar')) {
    touchbar = require('./touchbar');
  }

  module.exports = {
    _showSignatureOverlay: function(event) {
      var cursor, disableForSelector, editor, getTooltip, i, len, marker, ref, scopeChain, scopeDescriptor, wordBufferRange;
      if (this.markers) {
        ref = this.markers;
        for (i = 0, len = ref.length; i < len; i++) {
          marker = ref[i];
          log.debug('destroying old marker', marker);
          marker.destroy();
        }
      } else {
        this.markers = [];
      }
      cursor = event.cursor;
      editor = event.cursor.editor;
      wordBufferRange = cursor.getCurrentWordBufferRange();
      scopeDescriptor = editor.scopeDescriptorForBufferPosition(event.newBufferPosition);
      scopeChain = scopeDescriptor.getScopeChain();
      disableForSelector = this.disableForSelector + ", .source.python .numeric, .source.python .integer, .source.python .decimal, .source.python .punctuation, .source.python .keyword, .source.python .storage, .source.python .variable.parameter, .source.python .entity.name";
      disableForSelector = this.Selector.create(disableForSelector);
      if (this.selectorsMatchScopeChain(disableForSelector, scopeChain)) {
        log.debug('do nothing for this selector');
        return;
      }
      marker = editor.markBufferRange(wordBufferRange, {
        invalidate: 'never'
      });
      this.markers.push(marker);
      getTooltip = (function(_this) {
        return function(editor, bufferPosition) {
          var payload;
          payload = {
            id: _this._generateRequestId('tooltip', editor, bufferPosition),
            lookup: 'tooltip',
            path: editor.getPath(),
            source: editor.getText(),
            line: bufferPosition.row,
            column: bufferPosition.column,
            config: _this._generateRequestConfig()
          };
          _this._sendRequest(_this._serialize(payload));
          return new Promise(function(resolve) {
            return _this.requests[payload.id] = resolve;
          });
        };
      })(this);
      return getTooltip(editor, event.newBufferPosition).then((function(_this) {
        return function(results) {
          var column, decoration, description, fileName, line, ref1, text, type, view;
          if (marker.isDestroyed()) {
            return;
          }
          if (results.length > 0) {
            ref1 = results[0], text = ref1.text, fileName = ref1.fileName, line = ref1.line, column = ref1.column, type = ref1.type, description = ref1.description;
            description = description.trim();
            if (!description) {
              return;
            }
            view = document.createElement('atom-autocomplete-python-suggestion');
            view.appendChild(document.createTextNode(description));
            decoration = editor.decorateMarker(marker, {
              type: 'overlay',
              item: view,
              position: 'head'
            });
            if (atom.config.get('atom-autocomplete-python.enableTouchBar')) {
              return touchbar.update(results[0]);
            }
          }
        };
      })(this));
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvdHVua2VydC8uYXRvbS9wYWNrYWdlcy9hdG9tLWF1dG9jb21wbGV0ZS1weXRob24vbGliL3Rvb2x0aXBzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxPQUFSOztFQUNOLElBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHlDQUFoQixDQUFIO0lBQ0UsUUFBQSxHQUFXLE9BQUEsQ0FBUSxZQUFSLEVBRGI7OztFQUdBLE1BQU0sQ0FBQyxPQUFQLEdBQ0E7SUFBQSxxQkFBQSxFQUF1QixTQUFDLEtBQUQ7QUFDckIsVUFBQTtNQUFBLElBQUcsSUFBQyxDQUFBLE9BQUo7QUFDRTtBQUFBLGFBQUEscUNBQUE7O1VBQ0UsR0FBRyxDQUFDLEtBQUosQ0FBVSx1QkFBVixFQUFtQyxNQUFuQztVQUNBLE1BQU0sQ0FBQyxPQUFQLENBQUE7QUFGRixTQURGO09BQUEsTUFBQTtRQUtFLElBQUMsQ0FBQSxPQUFELEdBQVcsR0FMYjs7TUFPQSxNQUFBLEdBQVMsS0FBSyxDQUFDO01BQ2YsTUFBQSxHQUFTLEtBQUssQ0FBQyxNQUFNLENBQUM7TUFDdEIsZUFBQSxHQUFrQixNQUFNLENBQUMseUJBQVAsQ0FBQTtNQUNsQixlQUFBLEdBQWtCLE1BQU0sQ0FBQyxnQ0FBUCxDQUNoQixLQUFLLENBQUMsaUJBRFU7TUFFbEIsVUFBQSxHQUFhLGVBQWUsQ0FBQyxhQUFoQixDQUFBO01BRWIsa0JBQUEsR0FBd0IsSUFBQyxDQUFBLGtCQUFGLEdBQXFCO01BQzVDLGtCQUFBLEdBQXFCLElBQUMsQ0FBQSxRQUFRLENBQUMsTUFBVixDQUFpQixrQkFBakI7TUFFckIsSUFBRyxJQUFDLENBQUEsd0JBQUQsQ0FBMEIsa0JBQTFCLEVBQThDLFVBQTlDLENBQUg7UUFDRSxHQUFHLENBQUMsS0FBSixDQUFVLDhCQUFWO0FBQ0EsZUFGRjs7TUFJQSxNQUFBLEdBQVMsTUFBTSxDQUFDLGVBQVAsQ0FBdUIsZUFBdkIsRUFBd0M7UUFBQyxVQUFBLEVBQVksT0FBYjtPQUF4QztNQUVULElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLE1BQWQ7TUFFQSxVQUFBLEdBQWEsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLE1BQUQsRUFBUyxjQUFUO0FBQ1gsY0FBQTtVQUFBLE9BQUEsR0FDRTtZQUFBLEVBQUEsRUFBSSxLQUFDLENBQUEsa0JBQUQsQ0FBb0IsU0FBcEIsRUFBK0IsTUFBL0IsRUFBdUMsY0FBdkMsQ0FBSjtZQUNBLE1BQUEsRUFBUSxTQURSO1lBRUEsSUFBQSxFQUFNLE1BQU0sQ0FBQyxPQUFQLENBQUEsQ0FGTjtZQUdBLE1BQUEsRUFBUSxNQUFNLENBQUMsT0FBUCxDQUFBLENBSFI7WUFJQSxJQUFBLEVBQU0sY0FBYyxDQUFDLEdBSnJCO1lBS0EsTUFBQSxFQUFRLGNBQWMsQ0FBQyxNQUx2QjtZQU1BLE1BQUEsRUFBUSxLQUFDLENBQUEsc0JBQUQsQ0FBQSxDQU5SOztVQU9GLEtBQUMsQ0FBQSxZQUFELENBQWMsS0FBQyxDQUFBLFVBQUQsQ0FBWSxPQUFaLENBQWQ7QUFDQSxpQkFBTyxJQUFJLE9BQUosQ0FBWSxTQUFDLE9BQUQ7bUJBQ2pCLEtBQUMsQ0FBQSxRQUFTLENBQUEsT0FBTyxDQUFDLEVBQVIsQ0FBVixHQUF3QjtVQURQLENBQVo7UUFWSTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUE7YUFhYixVQUFBLENBQVcsTUFBWCxFQUFtQixLQUFLLENBQUMsaUJBQXpCLENBQTJDLENBQUMsSUFBNUMsQ0FBaUQsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLE9BQUQ7QUFDL0MsY0FBQTtVQUFBLElBQUcsTUFBTSxDQUFDLFdBQVAsQ0FBQSxDQUFIO0FBQ0UsbUJBREY7O1VBRUEsSUFBRyxPQUFPLENBQUMsTUFBUixHQUFpQixDQUFwQjtZQUNFLE9BQW9ELE9BQVEsQ0FBQSxDQUFBLENBQTVELEVBQUMsZ0JBQUQsRUFBTyx3QkFBUCxFQUFpQixnQkFBakIsRUFBdUIsb0JBQXZCLEVBQStCLGdCQUEvQixFQUFxQztZQUVyQyxXQUFBLEdBQWMsV0FBVyxDQUFDLElBQVosQ0FBQTtZQUNkLElBQUcsQ0FBSSxXQUFQO0FBQ0UscUJBREY7O1lBRUEsSUFBQSxHQUFPLFFBQVEsQ0FBQyxhQUFULENBQXVCLHFDQUF2QjtZQUNQLElBQUksQ0FBQyxXQUFMLENBQWlCLFFBQVEsQ0FBQyxjQUFULENBQXdCLFdBQXhCLENBQWpCO1lBQ0EsVUFBQSxHQUFhLE1BQU0sQ0FBQyxjQUFQLENBQXNCLE1BQXRCLEVBQThCO2NBQ3pDLElBQUEsRUFBTSxTQURtQztjQUV6QyxJQUFBLEVBQU0sSUFGbUM7Y0FHekMsUUFBQSxFQUFVLE1BSCtCO2FBQTlCO1lBS2IsSUFBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IseUNBQWhCLENBQUg7cUJBQ0UsUUFBUSxDQUFDLE1BQVQsQ0FBZ0IsT0FBUSxDQUFBLENBQUEsQ0FBeEIsRUFERjthQWJGOztRQUgrQztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBakQ7SUF2Q3FCLENBQXZCOztBQUxBIiwic291cmNlc0NvbnRlbnQiOlsibG9nID0gcmVxdWlyZSAnLi9sb2cnXG5pZiBhdG9tLmNvbmZpZy5nZXQoJ2F0b20tYXV0b2NvbXBsZXRlLXB5dGhvbi5lbmFibGVUb3VjaEJhcicpXG4gIHRvdWNoYmFyID0gcmVxdWlyZSAnLi90b3VjaGJhcidcblxubW9kdWxlLmV4cG9ydHMgPVxuX3Nob3dTaWduYXR1cmVPdmVybGF5OiAoZXZlbnQpIC0+XG4gIGlmIEBtYXJrZXJzXG4gICAgZm9yIG1hcmtlciBpbiBAbWFya2Vyc1xuICAgICAgbG9nLmRlYnVnICdkZXN0cm95aW5nIG9sZCBtYXJrZXInLCBtYXJrZXJcbiAgICAgIG1hcmtlci5kZXN0cm95KClcbiAgZWxzZVxuICAgIEBtYXJrZXJzID0gW11cblxuICBjdXJzb3IgPSBldmVudC5jdXJzb3JcbiAgZWRpdG9yID0gZXZlbnQuY3Vyc29yLmVkaXRvclxuICB3b3JkQnVmZmVyUmFuZ2UgPSBjdXJzb3IuZ2V0Q3VycmVudFdvcmRCdWZmZXJSYW5nZSgpXG4gIHNjb3BlRGVzY3JpcHRvciA9IGVkaXRvci5zY29wZURlc2NyaXB0b3JGb3JCdWZmZXJQb3NpdGlvbihcbiAgICBldmVudC5uZXdCdWZmZXJQb3NpdGlvbilcbiAgc2NvcGVDaGFpbiA9IHNjb3BlRGVzY3JpcHRvci5nZXRTY29wZUNoYWluKClcblxuICBkaXNhYmxlRm9yU2VsZWN0b3IgPSBcIiN7QGRpc2FibGVGb3JTZWxlY3Rvcn0sIC5zb3VyY2UucHl0aG9uIC5udW1lcmljLCAuc291cmNlLnB5dGhvbiAuaW50ZWdlciwgLnNvdXJjZS5weXRob24gLmRlY2ltYWwsIC5zb3VyY2UucHl0aG9uIC5wdW5jdHVhdGlvbiwgLnNvdXJjZS5weXRob24gLmtleXdvcmQsIC5zb3VyY2UucHl0aG9uIC5zdG9yYWdlLCAuc291cmNlLnB5dGhvbiAudmFyaWFibGUucGFyYW1ldGVyLCAuc291cmNlLnB5dGhvbiAuZW50aXR5Lm5hbWVcIlxuICBkaXNhYmxlRm9yU2VsZWN0b3IgPSBAU2VsZWN0b3IuY3JlYXRlKGRpc2FibGVGb3JTZWxlY3RvcilcblxuICBpZiBAc2VsZWN0b3JzTWF0Y2hTY29wZUNoYWluKGRpc2FibGVGb3JTZWxlY3Rvciwgc2NvcGVDaGFpbilcbiAgICBsb2cuZGVidWcgJ2RvIG5vdGhpbmcgZm9yIHRoaXMgc2VsZWN0b3InXG4gICAgcmV0dXJuXG5cbiAgbWFya2VyID0gZWRpdG9yLm1hcmtCdWZmZXJSYW5nZSh3b3JkQnVmZmVyUmFuZ2UsIHtpbnZhbGlkYXRlOiAnbmV2ZXInfSlcblxuICBAbWFya2Vycy5wdXNoKG1hcmtlcilcblxuICBnZXRUb29sdGlwID0gKGVkaXRvciwgYnVmZmVyUG9zaXRpb24pID0+XG4gICAgcGF5bG9hZCA9XG4gICAgICBpZDogQF9nZW5lcmF0ZVJlcXVlc3RJZCgndG9vbHRpcCcsIGVkaXRvciwgYnVmZmVyUG9zaXRpb24pXG4gICAgICBsb29rdXA6ICd0b29sdGlwJ1xuICAgICAgcGF0aDogZWRpdG9yLmdldFBhdGgoKVxuICAgICAgc291cmNlOiBlZGl0b3IuZ2V0VGV4dCgpXG4gICAgICBsaW5lOiBidWZmZXJQb3NpdGlvbi5yb3dcbiAgICAgIGNvbHVtbjogYnVmZmVyUG9zaXRpb24uY29sdW1uXG4gICAgICBjb25maWc6IEBfZ2VuZXJhdGVSZXF1ZXN0Q29uZmlnKClcbiAgICBAX3NlbmRSZXF1ZXN0KEBfc2VyaWFsaXplKHBheWxvYWQpKVxuICAgIHJldHVybiBuZXcgUHJvbWlzZSAocmVzb2x2ZSkgPT5cbiAgICAgIEByZXF1ZXN0c1twYXlsb2FkLmlkXSA9IHJlc29sdmVcblxuICBnZXRUb29sdGlwKGVkaXRvciwgZXZlbnQubmV3QnVmZmVyUG9zaXRpb24pLnRoZW4gKHJlc3VsdHMpID0+XG4gICAgaWYgbWFya2VyLmlzRGVzdHJveWVkKClcbiAgICAgIHJldHVyblxuICAgIGlmIHJlc3VsdHMubGVuZ3RoID4gMFxuICAgICAge3RleHQsIGZpbGVOYW1lLCBsaW5lLCBjb2x1bW4sIHR5cGUsIGRlc2NyaXB0aW9ufSA9IHJlc3VsdHNbMF1cblxuICAgICAgZGVzY3JpcHRpb24gPSBkZXNjcmlwdGlvbi50cmltKClcbiAgICAgIGlmIG5vdCBkZXNjcmlwdGlvblxuICAgICAgICByZXR1cm5cbiAgICAgIHZpZXcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhdG9tLWF1dG9jb21wbGV0ZS1weXRob24tc3VnZ2VzdGlvbicpXG4gICAgICB2aWV3LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGRlc2NyaXB0aW9uKSlcbiAgICAgIGRlY29yYXRpb24gPSBlZGl0b3IuZGVjb3JhdGVNYXJrZXIobWFya2VyLCB7XG4gICAgICAgIHR5cGU6ICdvdmVybGF5JyxcbiAgICAgICAgaXRlbTogdmlldyxcbiAgICAgICAgcG9zaXRpb246ICdoZWFkJ1xuICAgICAgfSlcbiAgICAgIGlmIGF0b20uY29uZmlnLmdldCgnYXRvbS1hdXRvY29tcGxldGUtcHl0aG9uLmVuYWJsZVRvdWNoQmFyJylcbiAgICAgICAgdG91Y2hiYXIudXBkYXRlKHJlc3VsdHNbMF0pXG4iXX0=
