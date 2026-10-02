const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const target = path.join(__dirname, 'index.html');
const html = fs.readFileSync(target, 'utf8');
const body = html.match(/function setFiltersCollapsed\(collapsed\)\{([\s\S]*?)\n\}/)[0];
const dialog = { open: false, showModal() { this.open = true; }, close() { this.open = false; } };
const attributes = {};
const context = {
  filterDialog: dialog,
  document: { body: { classList: { toggle() {} } } },
  btnToggleFilters: { setAttribute(k, v) { attributes[k] = String(v); } },
  localStorage: { setItem() {} }, FILTER_UI_KEY: 'test',
  requestAnimationFrame() {}, store: { lastData: null }
};
vm.createContext(context);
vm.runInContext(body, context);
context.setFiltersCollapsed(false);
assert.equal(dialog.open, true, 'Filter button must open the native modal');
assert.equal(attributes['aria-expanded'], 'true');
context.setFiltersCollapsed(false);
context.setFiltersCollapsed(true);
assert.equal(dialog.open, false, 'Close action must dismiss the filter modal');
assert.equal(attributes['aria-expanded'], 'false');
for (const script of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) new vm.Script(script[1]);
console.log('PASS: filter open/close/repeated open, expanded state, JavaScript syntax');