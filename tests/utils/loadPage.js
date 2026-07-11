const fs = require('fs');
const path = require('path');

const INDEX_HTML_PATH = path.resolve(__dirname, '../../index.html');

function getIndexHtmlSource() {
  return fs.readFileSync(INDEX_HTML_PATH, 'utf8');
}

/**
 * Loads the real index.html body markup into the current jsdom document
 * and executes js/main.js fresh against it, so tests exercise the actual
 * production markup rather than a hand-rolled fixture.
 */
function loadPageAndScript() {
  const html = getIndexHtmlSource();
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (!bodyMatch) {
    throw new Error('Could not locate <body> content in index.html');
  }
  document.body.innerHTML = bodyMatch[1];
  document.body.style.overflow = '';

  jest.resetModules();
  require('../../js/main.js');
}

module.exports = { loadPageAndScript, getIndexHtmlSource, INDEX_HTML_PATH };
