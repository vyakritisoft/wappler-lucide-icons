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

function createNode(tagName) {
  return {
    tagName,
    attributes: {},
    children: [],
    innerHTMLValue: '',
    setAttribute(name, value) {
      this.attributes[name] = String(value);
    },
    getAttribute(name) {
      return this.attributes[name];
    },
    appendChild(child) {
      this.children.push(child);
      return child;
    },
    set innerHTML(value) {
      this.innerHTMLValue = String(value);
      this.children = [];
    },
    get innerHTML() {
      return this.innerHTMLValue;
    }
  };
}

const rootFile = path.join(__dirname, 'app_connect', 'components.hjson');

assert(fs.existsSync(rootFile), 'Wappler requires app_connect/components.hjson');
assert(!fs.existsSync(path.join(__dirname, 'app_connect', 'components')), 'avoid nested app_connect/components directory because Wappler expects a single components.hjson file');

const metadata = parseHjsonLike(rootFile);
assert(Array.isArray(metadata.components), 'components must be an array');
assert(metadata.components.length === 1, 'expected exactly one component');

const component = metadata.components[0];
assert(component.type === 'dmx-lucide-icon', 'component type must be dmx-lucide-icon');
assert(component.framework === 'app_connect', 'framework should match Wappler App Connect docs');
assert(component.selector.includes('dmx-lucide-icon'), 'selector must include dmx-lucide-icon');
assert(component.template.includes('<dmx-lucide-icon'), 'template must insert dmx-lucide-icon');
assert(Array.isArray(component.copyFiles) && component.copyFiles.length === 1, 'copyFiles must include runtime script');
assert(Array.isArray(component.linkFiles) && component.linkFiles.length === 2, 'linkFiles must include lucide CDN and runtime script');
assert(fs.existsSync(path.join(__dirname, component.copyFiles[0].src)), `copyFiles src missing: ${component.copyFiles[0].src}`);
assert(component.linkFiles[0].src === component.jsOrder[0], 'Lucide CDN link order mismatch');
assert(component.linkFiles[1].src === component.jsOrder[1], 'runtime script link order mismatch');

const variables = component.properties.flatMap((group) => group.variables || []);
const variableByAttribute = Object.fromEntries(variables.map((variable) => [variable.attribute, variable]));
assert(variableByAttribute.id && variableByAttribute.id.type === 'text', 'id field missing');
assert(variableByAttribute.icon && variableByAttribute.icon.type === 'text', 'icon field should be text for compatibility');
assert(variableByAttribute.color && variableByAttribute.color.type === 'text', 'color field should be text for compatibility');
assert(variableByAttribute.size && variableByAttribute.size.type === 'number', 'size field should be numeric');
assert(variableByAttribute['stroke-width'] && variableByAttribute['stroke-width'].type === 'number', 'stroke width field should be numeric');
assert(!variables.some((variable) => variable.type === 'droplist'), 'dropdown controls were intentionally removed');

const runtimeSource = fs.readFileSync(path.join(__dirname, 'includes', 'dmx-lucide-icon.js'), 'utf8');
const context = {
  window: {},
  document: {
    createElement: createNode
  },
  setTimeout,
  clearTimeout,
  console
};
context.window.console = console;
context.window.lucide = {
  createIcons(options) {
    context.createIconsCall = options;
  }
};
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

const instance = {
  props: {
    icon: 'settings',
    size: 32,
    color: '#0d6efd',
    strokeWidth: 2,
    absoluteStrokeWidth: false,
    label: 'Settings'
  },
  $node: createNode('dmx-lucide-icon')
};
Object.assign(instance, context.registered.definition);
instance.render();
assert(instance.$node.children.length === 1, 'render should append one icon placeholder');
const placeholder = instance.$node.children[0];
assert(placeholder.getAttribute('data-lucide') === 'settings', 'render should set selected icon name');
assert(placeholder.getAttribute('width') === '32', 'render should set width');
assert(placeholder.getAttribute('height') === '32', 'render should set height');
assert(placeholder.getAttribute('stroke') === '#0d6efd', 'render should set stroke color');
assert(placeholder.getAttribute('aria-label') === 'Settings', 'render should preserve accessible label');
assert(context.createIconsCall.root === instance.$node, 'lucide.createIcons should be scoped to component root');
assert(context.createIconsCall.nameAttr === 'data-lucide', 'lucide.createIcons should use data-lucide');

instance.props.icon = '';
instance.performUpdate();
assert(instance.$node.children.length === 0, 'empty icon should clear rendered content');

console.log('All extension metadata and runtime checks passed.');
