const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const target = path.join(__dirname, 'index.html');
const html = fs.readFileSync(target, 'utf8');
const body = html.match(/function setFiltersCollapsed\(collapsed\)\{([\s\S]*?)\n\}/)[0];
const panel = { hidden: true };
const attributes = {};
const context = {
  filterPanel: panel,
  btnToggleFilters: { setAttribute(k, v) { attributes[k] = String(v); }, focus() {} }
};
vm.createContext(context);
vm.runInContext(body, context);
context.setFiltersCollapsed(false);
assert.equal(panel.hidden, false, 'Advanced search must reveal the inline filters');
assert.equal(attributes['aria-expanded'], 'true');
context.setFiltersCollapsed(false);
context.setFiltersCollapsed(true);
assert.equal(panel.hidden, true, 'Close action must collapse the inline filters');
assert.equal(attributes['aria-expanded'], 'false');
const select = {dataset:{key:'items'}, innerHTML:''};
context.document = {querySelectorAll:()=>[select]};
context.store = {options:{items:['A&B','<상품>']}, availableOptions:{items:['<상품>']}, filters:{items:['A&B','<상품>']}};
for (const name of ['escapeHtml','sortedValues','renderQuickFilters']) {
  vm.runInContext(html.match(new RegExp('function '+name+'\\([^]*?\\n\\}'))[0], context);
}
context.renderQuickFilters();
assert.match(select.innerHTML, /2개 선택/);
assert.match(select.innerHTML, /&lt;상품&gt;/);
assert.ok(!select.innerHTML.includes('<상품>'), 'Filter labels must be escaped');
context.store.filters.items = [];
context.renderQuickFilters();
assert.ok(!select.innerHTML.includes('2개 선택'), 'Reset clears multi-selection summary');
assert.match(select.innerHTML, /value="A&amp;B"\s+disabled/);
for (const script of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) new vm.Script(script[1]);
console.log('PASS: advanced search open/close, quick filter multi-selection/reset/disabled options/escaping, JavaScript syntax');