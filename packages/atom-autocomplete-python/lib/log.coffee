module.exports =
  prefix: 'atom-autocomplete-python:'
  debug: (msg...) ->
    if atom.config.get('atom-autocomplete-python.outputDebug')
      return console.debug @prefix, msg...

  warning: (msg...) ->
    return console.warn @prefix, msg...
