Object.defineProperty(exports, '__esModule', {
  value: true
});
/** @babel */

exports['default'] = {

  defaultLocation: {
    title: 'Default Location',
    description: 'Where to open new terminals. They will open in the bottom pane, by default.',
    type: 'string',
    'default': 'bottom',
    'enum': [{ value: 'bottom', description: 'Bottom' }, { value: 'center', description: 'Center' }, { value: 'left', description: 'Left' }, { value: 'right', description: 'Right' }]
  },

  fontFamily: {
    title: 'Font Family',
    description: 'The name of the font family used for terminal text. By default, this matches the editor font family.',
    type: 'string',
    'default': ''
  },

  matchTheme: {
    title: 'Match Theme',
    description: 'When enabled, the look of the terminal will match the currently configured Atom theme.',
    type: 'boolean',
    'default': true
  },

  shellSettings: {
    type: 'object',
    properties: {

      sanitizeEnvironment: {
        title: 'Sanitized Environment Variables',
        description: 'Specify variables to remove from the environment in the terminal session. For example, the default behavior is to unset `NODE_ENV`, since Atom sets this to "production" on launch and may not be what you want when developing a Node application.',
        type: 'array',
        'default': ['NODE_ENV']
      },

      shellPath: {
        title: 'Shell Path',
        description: 'Path to your shell application. Uses the $SHELL environment variable by default on *NIX and %COMSPEC% on Windows.',
        type: 'string',
        'default': (function () {
          if (process.platform === 'win32') {
            return process.env.COMSPEC || 'cmd.exe';
          } else {
            return process.env.SHELL || '/bin/bash';
          }
        })()
      },

      shellArgs: {
        title: 'Shell Arguments',
        description: 'Arguments to send to the shell application on launch. Sends "--login" by default on *NIX and nothing on Windows.',
        type: 'string',
        'default': (function () {
          if (process.platform !== 'win32' && process.env.SHELL === '/bin/bash') {
            return '--login';
          } else {
            return '';
          }
        })()
      }

    }
  },

  terminalDirectory: {
    title: 'Terminal Directory',
    description: 'What directory to open new terminals in. If you choose "Current File Folder" or "Project Folder" and the script fails to retrieve information about the linked file, it will fall back to the first project\'s folder (the topmost project-folder in tree-view). If there is no project-folder open it will instead fall back to the user\'s home directory',
    type: 'string',
    order: 1,
    'default': 'current-file',
    'enum': [{ value: 'current-file', description: 'Current File Folder' }, { value: 'project-folder', description: 'Project Folder' }, { value: 'home', description: 'Home' }]
  },

  customTexts: {
    type: 'object',
    description: '$F is replaced by file name, $D is replaced by file directory, $$ is replaced by $ and $P is replaced by absolute path to file (directory followed by filename). Use $P if you want to be able to always get the correct file, regardless of what directory you are currently located at inside the terminal.',
    order: 2,
    properties: {
      focusOnInsert: {
        title: 'Focus On Insert',
        description: 'When enabled, the terminal will be focused when using the insert command.',
        type: 'boolean',
        order: 1,
        'default': true
      },
      runInsertedText: {
        title: 'Run Inserted Text',
        description: 'Run text inserted via \'iv-terminal:insert-custom-text\' as a command. **This will append an end-of-line character to input.**',
        type: 'boolean',
        order: 2,
        'default': true
      },
      saveOnInsert: {
        title: 'Save On Insert',
        description: 'When enabled, the active file will be saved when using the insert command.',
        type: 'boolean',
        order: 3,
        'default': true
      },
      customText1: {
        title: 'Custom text 1',
        description: 'Text to paste when calling iv-terminal:insert-custom-text-1',
        type: 'string',
        'default': ''
      },
      customText2: {
        title: 'Custom text 2',
        description: 'Text to paste when calling iv-terminal:insert-custom-text-2',
        type: 'string',
        'default': ''
      },
      customText3: {
        title: 'Custom text 3',
        description: 'Text to paste when calling iv-terminal:insert-custom-text-3',
        type: 'string',
        'default': ''
      },
      customText4: {
        title: 'Custom text 4',
        description: 'Text to paste when calling iv-terminal:insert-custom-text-4',
        type: 'string',
        'default': ''
      },
      customText5: {
        title: 'Custom text 5',
        description: 'Text to paste when calling iv-terminal:insert-custom-text-5',
        type: 'string',
        'default': ''
      },
      customText6: {
        title: 'Custom text 6',
        description: 'Text to paste when calling iv-terminal:insert-custom-text-6',
        type: 'string',
        'default': ''
      }
    }
  }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3R1bmtlcnQvLmF0b20vcGFja2FnZXMvaXYtdGVybWluYWwvbGliL2NvbmZpZy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztxQkFFZTs7QUFFYixpQkFBZSxFQUFFO0FBQ2YsU0FBSyxFQUFFLGtCQUFrQjtBQUN6QixlQUFXLEVBQUUsNkVBQTZFO0FBQzFGLFFBQUksRUFBRSxRQUFRO0FBQ2QsZUFBUyxRQUFRO0FBQ2pCLFlBQU0sQ0FDSixFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRSxFQUMxQyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRSxFQUMxQyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLE1BQU0sRUFBRSxFQUN0QyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsV0FBVyxFQUFFLE9BQU8sRUFBRSxDQUN6QztHQUNGOztBQUVELFlBQVUsRUFBRTtBQUNWLFNBQUssRUFBRSxhQUFhO0FBQ3BCLGVBQVcsRUFBRSxzR0FBc0c7QUFDbkgsUUFBSSxFQUFFLFFBQVE7QUFDZCxlQUFTLEVBQUU7R0FDWjs7QUFFRCxZQUFVLEVBQUU7QUFDVixTQUFLLEVBQUUsYUFBYTtBQUNwQixlQUFXLEVBQUUsd0ZBQXdGO0FBQ3JHLFFBQUksRUFBRSxTQUFTO0FBQ2YsZUFBUyxJQUFJO0dBQ2Q7O0FBRUQsZUFBYSxFQUFFO0FBQ2IsUUFBSSxFQUFFLFFBQVE7QUFDZCxjQUFVLEVBQUU7O0FBRVYseUJBQW1CLEVBQUU7QUFDbkIsYUFBSyxFQUFFLGlDQUFpQztBQUN4QyxtQkFBVyxFQUFFLHFQQUFxUDtBQUNsUSxZQUFJLEVBQUUsT0FBTztBQUNiLG1CQUFTLENBQUUsVUFBVSxDQUFFO09BQ3hCOztBQUVELGVBQVMsRUFBRTtBQUNULGFBQUssRUFBRSxZQUFZO0FBQ25CLG1CQUFXLEVBQUUsbUhBQW1IO0FBQ2hJLFlBQUksRUFBRSxRQUFRO0FBQ2QsbUJBQVMs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QUFDMUUsWUFBSSxFQUFFLFFBQVE7QUFDZCxtQkFBUyxFQUFFO09BQ1o7S0FDRjtHQUNGO0NBQ0YiLCJmaWxlIjoiL2hvbWUvdHVua2VydC8uYXRvbS9wYWNrYWdlcy9pdi10ZXJtaW5hbC9saWIvY29uZmlnLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqIEBiYWJlbCAqL1xuXG5leHBvcnQgZGVmYXVsdCB7XG5cbiAgZGVmYXVsdExvY2F0aW9uOiB7XG4gICAgdGl0bGU6ICdEZWZhdWx0IExvY2F0aW9uJyxcbiAgICBkZXNjcmlwdGlvbjogJ1doZXJlIHRvIG9wZW4gbmV3IHRlcm1pbmFscy4gVGhleSB3aWxsIG9wZW4gaW4gdGhlIGJvdHRvbSBwYW5lLCBieSBkZWZhdWx0LicsXG4gICAgdHlwZTogJ3N0cmluZycsXG4gICAgZGVmYXVsdDogJ2JvdHRvbScsXG4gICAgZW51bTogW1xuICAgICAgeyB2YWx1ZTogJ2JvdHRvbScsIGRlc2NyaXB0aW9uOiAnQm90dG9tJyB9LFxuICAgICAgeyB2YWx1ZTogJ2NlbnRlcicsIGRlc2NyaXB0aW9uOiAnQ2VudGVyJyB9LFxuICAgICAgeyB2YWx1ZTogJ2xlZnQnLCBkZXNjcmlwdGlvbjogJ0xlZnQnIH0sXG4gICAgICB7IHZhbHVlOiAncmlnaHQnLCBkZXNjcmlwdGlvbjogJ1JpZ2h0JyB9XG4gICAgXVxuICB9LFxuXG4gIGZvbnRGYW1pbHk6IHtcbiAgICB0aXRsZTogJ0ZvbnQgRmFtaWx5JyxcbiAgICBkZXNjcmlwdGlvbjogJ1RoZSBuYW1lIG9mIHRoZSBmb250IGZhbWlseSB1c2VkIGZvciB0ZXJtaW5hbCB0ZXh0LiBCeSBkZWZhdWx0LCB0aGlzIG1hdGNoZXMgdGhlIGVkaXRvciBmb250IGZhbWlseS4nLFxuICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgIGRlZmF1bHQ6ICcnXG4gIH0sXG5cbiAgbWF0Y2hUaGVtZToge1xuICAgIHRpdGxlOiAnTWF0Y2ggVGhlbWUnLFxuICAgIGRlc2NyaXB0aW9uOiAnV2hlbiBlbmFibGVkLCB0aGUgbG9vayBvZiB0aGUgdGVybWluYWwgd2lsbCBtYXRjaCB0aGUgY3VycmVudGx5IGNvbmZpZ3VyZWQgQXRvbSB0aGVtZS4nLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBkZWZhdWx0OiB0cnVlXG4gIH0sXG5cbiAgc2hlbGxTZXR0aW5nczoge1xuICAgIHR5cGU6ICdvYmplY3QnLFxuICAgIHByb3BlcnRpZXM6IHtcblxuICAgICAgc2FuaXRpemVFbnZpcm9ubWVudDoge1xuICAgICAgICB0aXRsZTogJ1Nhbml0aXplZCBFbnZpcm9ubWVudCBWYXJpYWJsZXMnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1NwZWNpZnkgdmFyaWFibGVzIHRvIHJlbW92ZSBmcm9tIHRoZSBlbnZpcm9ubWVudCBpbiB0aGUgdGVybWluYWwgc2Vzc2lvbi4gRm9yIGV4YW1wbGUsIHRoZSBkZWZhdWx0IGJlaGF2aW9yIGlzIHRvIHVuc2V0IGBOT0RFX0VOVmAsIHNpbmNlIEF0b20gc2V0cyB0aGlzIHRvIFwicHJvZHVjdGlvblwiIG9uIGxhdW5jaCBhbmQgbWF5IG5vdCBiZSB3aGF0IHlvdSB3YW50IHdoZW4gZGV2ZWxvcGluZyBhIE5vZGUgYXBwbGljYXRpb24uJyxcbiAgICAgICAgdHlwZTogJ2FycmF5JyxcbiAgICAgICAgZGVmYXVsdDogWyAnTk9ERV9FTlYnIF1cbiAgICAgIH0sXG5cbiAgICAgIHNoZWxsUGF0aDoge1xuICAgICAgICB0aXRsZTogJ1NoZWxsIFBhdGgnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1BhdGggdG8geW91ciBzaGVsbCBhcHBsaWNhdGlvbi4gVXNlcyB0aGUgJFNIRUxMIGVudmlyb25tZW50IHZhcmlhYmxlIGJ5IGRlZmF1bHQgb24gKk5JWCBhbmQgJUNPTVNQRUMlIG9uIFdpbmRvd3MuJyxcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIGRlZmF1bHQ6ICgoKSA9PiB7XG4gICAgICAgICAgaWYgKHByb2Nlc3MucGxhdGZvcm0gPT09ICd3aW4zMicpIHtcbiAgICAgICAgICAgIHJldHVybiBwcm9jZXNzLmVudi5DT01TUEVDIHx8ICdjbWQuZXhlJztcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHByb2Nlc3MuZW52LlNIRUxMIHx8ICcvYmluL2Jhc2gnO1xuICAgICAgICAgIH1cbiAgICAgICAgfSkoKVxuICAgICAgfSxcblxuICAgICAgc2hlbGxBcmdzOiB7XG4gICAgICAgIHRpdGxlOiAnU2hlbGwgQXJndW1lbnRzJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdBcmd1bWVudHMgdG8gc2VuZCB0byB0aGUgc2hlbGwgYXBwbGljYXRpb24gb24gbGF1bmNoLiBTZW5kcyBcIi0tbG9naW5cIiBieSBkZWZhdWx0IG9uICpOSVggYW5kIG5vdGhpbmcgb24gV2luZG93cy4nLFxuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgZGVmYXVsdDogKCgpID0+IHtcbiAgICAgICAgICBpZiAocHJvY2Vzcy5wbGF0Zm9ybSAhPT0gJ3dpbjMyJyAmJiBwcm9jZXNzLmVudi5TSEVMTCA9PT0gJy9iaW4vYmFzaCcpIHtcbiAgICAgICAgICAgIHJldHVybiAnLS1sb2dpbic7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiAnJztcbiAgICAgICAgICB9XG4gICAgICAgIH0pKClcbiAgICAgIH1cblxuICAgIH1cbiAgfSxcblxuICB0ZXJtaW5hbERpcmVjdG9yeToge1xuICAgIHRpdGxlOiAnVGVybWluYWwgRGlyZWN0b3J5JyxcbiAgICBkZXNjcmlwdGlvbjogJ1doYXQgZGlyZWN0b3J5IHRvIG9wZW4gbmV3IHRlcm1pbmFscyBpbi4gSWYgeW91IGNob29zZSBcIkN1cnJlbnQgRmlsZSBGb2xkZXJcIiBvciBcIlByb2plY3QgRm9sZGVyXCIgYW5kIHRoZSBzY3JpcHQgZmFpbHMgdG8gcmV0cmlldmUgaW5mb3JtYXRpb24gYWJvdXQgdGhlIGxpbmtlZCBmaWxlLCBpdCB3aWxsIGZhbGwgYmFjayB0byB0aGUgZmlyc3QgcHJvamVjdFxcJ3MgZm9sZGVyICh0aGUgdG9wbW9zdCBwcm9qZWN0LWZvbGRlciBpbiB0cmVlLXZpZXcpLiBJZiB0aGVyZSBpcyBubyBwcm9qZWN0LWZvbGRlciBvcGVuIGl0IHdpbGwgaW5zdGVhZCBmYWxsIGJhY2sgdG8gdGhlIHVzZXJcXCdzIGhvbWUgZGlyZWN0b3J5JyxcbiAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICBvcmRlcjogMSxcbiAgICBkZWZhdWx0OiAnY3VycmVudC1maWxlJyxcbiAgICBlbnVtOiBbXG4gICAgICB7IHZhbHVlOiAnY3VycmVudC1maWxlJywgZGVzY3JpcHRpb246ICdDdXJyZW50IEZpbGUgRm9sZGVyJyB9LFxuICAgICAgeyB2YWx1ZTogJ3Byb2plY3QtZm9sZGVyJywgZGVzY3JpcHRpb246ICdQcm9qZWN0IEZvbGRlcicgfSxcbiAgICAgIHsgdmFsdWU6ICdob21lJywgZGVzY3JpcHRpb246ICdIb21lJyB9XG4gICAgXVxuICB9LFxuXG4gIGN1c3RvbVRleHRzOiB7XG4gICAgdHlwZTogJ29iamVjdCcsXG4gICAgZGVzY3JpcHRpb246ICckRiBpcyByZXBsYWNlZCBieSBmaWxlIG5hbWUsICREIGlzIHJlcGxhY2VkIGJ5IGZpbGUgZGlyZWN0b3J5LCAkJCBpcyByZXBsYWNlZCBieSAkIGFuZCAkUCBpcyByZXBsYWNlZCBieSBhYnNvbHV0ZSBwYXRoIHRvIGZpbGUgKGRpcmVjdG9yeSBmb2xsb3dlZCBieSBmaWxlbmFtZSkuIFVzZSAkUCBpZiB5b3Ugd2FudCB0byBiZSBhYmxlIHRvIGFsd2F5cyBnZXQgdGhlIGNvcnJlY3QgZmlsZSwgcmVnYXJkbGVzcyBvZiB3aGF0IGRpcmVjdG9yeSB5b3UgYXJlIGN1cnJlbnRseSBsb2NhdGVkIGF0IGluc2lkZSB0aGUgdGVybWluYWwuJyxcbiAgICBvcmRlcjogMixcbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICBmb2N1c09uSW5zZXJ0OiB7XG4gICAgICAgIHRpdGxlOiAnRm9jdXMgT24gSW5zZXJ0JyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdXaGVuIGVuYWJsZWQsIHRoZSB0ZXJtaW5hbCB3aWxsIGJlIGZvY3VzZWQgd2hlbiB1c2luZyB0aGUgaW5zZXJ0IGNvbW1hbmQuJyxcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICBvcmRlcjogMSxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgfSxcbiAgICAgIHJ1bkluc2VydGVkVGV4dDoge1xuICAgICAgICB0aXRsZTogJ1J1biBJbnNlcnRlZCBUZXh0JyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdSdW4gdGV4dCBpbnNlcnRlZCB2aWEgXFwnaXYtdGVybWluYWw6aW5zZXJ0LWN1c3RvbS10ZXh0XFwnIGFzIGEgY29tbWFuZC4gKipUaGlzIHdpbGwgYXBwZW5kIGFuIGVuZC1vZi1saW5lIGNoYXJhY3RlciB0byBpbnB1dC4qKicsXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgb3JkZXI6IDIsXG4gICAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgIH0sXG4gICAgICBzYXZlT25JbnNlcnQ6IHtcbiAgICAgICAgdGl0bGU6ICdTYXZlIE9uIEluc2VydCcsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnV2hlbiBlbmFibGVkLCB0aGUgYWN0aXZlIGZpbGUgd2lsbCBiZSBzYXZlZCB3aGVuIHVzaW5nIHRoZSBpbnNlcnQgY29tbWFuZC4nLFxuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgIG9yZGVyOiAzLFxuICAgICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICB9LFxuICAgICAgY3VzdG9tVGV4dDE6IHtcbiAgICAgICAgdGl0bGU6ICdDdXN0b20gdGV4dCAxJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdUZXh0IHRvIHBhc3RlIHdoZW4gY2FsbGluZyBpdi10ZXJtaW5hbDppbnNlcnQtY3VzdG9tLXRleHQtMScsXG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBkZWZhdWx0OiAnJ1xuICAgICAgfSxcbiAgICAgIGN1c3RvbVRleHQyOiB7XG4gICAgICAgIHRpdGxlOiAnQ3VzdG9tIHRleHQgMicsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnVGV4dCB0byBwYXN0ZSB3aGVuIGNhbGxpbmcgaXYtdGVybWluYWw6aW5zZXJ0LWN1c3RvbS10ZXh0LTInLFxuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgZGVmYXVsdDogJydcbiAgICAgIH0sXG4gICAgICBjdXN0b21UZXh0Mzoge1xuICAgICAgICB0aXRsZTogJ0N1c3RvbSB0ZXh0IDMnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1RleHQgdG8gcGFzdGUgd2hlbiBjYWxsaW5nIGl2LXRlcm1pbmFsOmluc2VydC1jdXN0b20tdGV4dC0zJyxcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIGRlZmF1bHQ6ICcnXG4gICAgICB9LFxuICAgICAgY3VzdG9tVGV4dDQ6IHtcbiAgICAgICAgdGl0bGU6ICdDdXN0b20gdGV4dCA0JyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdUZXh0IHRvIHBhc3RlIHdoZW4gY2FsbGluZyBpdi10ZXJtaW5hbDppbnNlcnQtY3VzdG9tLXRleHQtNCcsXG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBkZWZhdWx0OiAnJ1xuICAgICAgfSxcbiAgICAgIGN1c3RvbVRleHQ1OiB7XG4gICAgICAgIHRpdGxlOiAnQ3VzdG9tIHRleHQgNScsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnVGV4dCB0byBwYXN0ZSB3aGVuIGNhbGxpbmcgaXYtdGVybWluYWw6aW5zZXJ0LWN1c3RvbS10ZXh0LTUnLFxuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgZGVmYXVsdDogJydcbiAgICAgIH0sXG4gICAgICBjdXN0b21UZXh0Njoge1xuICAgICAgICB0aXRsZTogJ0N1c3RvbSB0ZXh0IDYnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1RleHQgdG8gcGFzdGUgd2hlbiBjYWxsaW5nIGl2LXRlcm1pbmFsOmluc2VydC1jdXN0b20tdGV4dC02JyxcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIGRlZmF1bHQ6ICcnXG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuIl19