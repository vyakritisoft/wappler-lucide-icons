const fs = require('fs');
const path = require('path');
const vm = require('vm');

function parseHjsonLike(file) {
  const source = fs.readFileSync(file, 'utf8');
  return Function(`return (${source})`)();
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const rootFile = path.join(__dirname, 'app_connect', 'components.hjson');
const legacyFile = path.join(__dirname, 'app_connect', 'components', 'lucide.hjson');

assert(fs.existsSync(rootFile), 'Wappler requires app_connect/components.hjson');
assert(fs.existsSync(legacyFile), 'legacy app_connect/components/lucide.hjson should remain in sync');
assert(fs.readFileSync(rootFile, 'utf8') === fs.readFileSync(legacyFile, 'utf8'), 'root and legacy component metadata differ');

const metadata = parseHjsonLike(rootFile);
assert(Array.isArray(metadata.components), 'components must be an array');
assert(metadata.components.length === 1, 'expected exactly one component');

const component = metadata.components[0];
assert(component.type === 'dmx-lucide-icon', 'component type must be dmx-lucide-icon');
assert(component.selector.includes('dmx-lucide-icon'), 'selector must include dmx-lucide-icon');
assert(component.template.includes('<dmx-lucide-icon'), 'template must insert dmx-lucide-icon');
assert(Array.isArray(component.copyFiles) && component.copyFiles.length === 1, 'copyFiles must include runtime script');
assert(Array.isArray(component.linkFiles) && component.linkFiles.length === 2, 'linkFiles must include lucide CDN and runtime script');

const variables = component.properties.flatMap((group) => group.variables || []);
const variableByAttribute = Object.fromEntries(variables.map((variable) => [variable.attribute, variable]));
assert(variableByAttribute.id && variableByAttribute.id.type === 'text', 'id field missing');
assert(variableByAttribute.icon && variableByAttribute.icon.type === 'text', 'icon field should be text for compatibility');
assert(variableByAttribute.color && variableByAttribute.color.type === 'text', 'color field should be text for compatibility');
assert(!variables.some((variable) => variable.type === 'droplist'), 'dropdown controls were intentionally removed');

const runtimeSource = fs.readFileSync(path.join(__dirname, 'includes', 'dmx-lucide-icon.js'), 'utf8');
const context = {
  window: {},
  document: {},
  setTimeout,
  clearTimeout,
  console
};
context.window.console = console;
context.window.dmx = {
  Component(name, definition) {
    context.registered = { name, definition };
  }
};
context.dmx = context.window.dmx;
vm.createContext(context);
vm.runInContext(runtimeSource, context);
assert(context.registered.name === 'lucide-icon', 'runtime component registration changed unexpectedly');
assert(context.registered.definition.attributes.icon.default === 'menu', 'runtime default icon should be menu');

console.log('All extension metadata and runtime checks passed.');
