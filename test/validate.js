const fs = require('fs');
const path = require('path');
const vm = require('vm');
const Hjson = require('hjson');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function createNode(tagName) {
  return {
    tagName,
    attributes: {},
    children: [],
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
      this.children = [];
      this._innerHTML = String(value);
    },
    get innerHTML() {
      return this._innerHTML || '';
    }
  };
}

const root = path.join(__dirname, '..');
const metadataPath = path.join(root, 'app_connect', 'components.hjson');
const runtimePath = path.join(root, 'includes', 'dmx-lucide-icon.js');

assert(fs.existsSync(metadataPath), 'missing app_connect/components.hjson');
assert(!fs.existsSync(path.join(root, 'app_connect', 'components')), 'unexpected nested app_connect/components directory');
assert(fs.existsSync(runtimePath), 'missing includes/dmx-lucide-icon.js');

const metadata = Hjson.parse(fs.readFileSync(metadataPath, 'utf8'));
assert(Array.isArray(metadata.components), 'components must be an array');
assert(metadata.components.length === 1, 'expected one component');

const component = metadata.components[0];
assert(component.type === 'dmx-lucide-icon', 'invalid component type');
assert(component.selector === 'dmx-lucide-icon, [is=dmx-lucide-icon]', 'invalid selector');
assert(component.groupTitle === 'Lucide', 'invalid group title');
assert(component.template === '<dmx-lucide-icon id="@@id@@" icon="menu"></dmx-lucide-icon>', 'invalid template');
assert(component.copyFiles[0].src === 'includes/dmx-lucide-icon.js', 'invalid copyFiles src');
assert(component.copyFiles[0].dst === 'js/dmx-lucide-icon.js', 'invalid copyFiles dst');
assert(component.linkFiles[0].src.includes('lucide@1.8.0'), 'Lucide CDN is not pinned');
assert(component.linkFiles[1].src === 'js/dmx-lucide-icon.js', 'runtime link missing');

const variables = component.properties.flatMap((group) => group.variables || []);
assert(!variables.some((variable) => variable.type === 'droplist' || variable.type === 'select'), 'dropdown/select controls are not allowed');
const byAttribute = Object.fromEntries(variables.map((variable) => [variable.attribute, variable]));
assert(byAttribute.icon.type === 'text', 'icon must be manual text input');
assert(byAttribute.color.type === 'text', 'color must be manual text input');
assert(byAttribute.size.type === 'number', 'size must be number input');
assert(byAttribute['stroke-width'].type === 'number', 'stroke width must be number input');

const context = {
  window: {},
  document: { createElement: createNode },
  setTimeout,
  clearTimeout,
  console
};
context.window.console = console;
context.window.lucide = {
  createIcons(options) {
    context.createIconsOptions = options;
  }
};
context.window.dmx = {
  Component(name, definition) {
    context.componentName = name;
    context.componentDefinition = definition;
  }
};
vm.createContext(context);
vm.runInContext(fs.readFileSync(runtimePath, 'utf8'), context);

assert(context.componentName === 'lucide-icon', 'runtime component registration failed');
assert(context.componentDefinition.attributes.icon.default === 'menu', 'invalid default icon');

const instance = {
  props: {
    icon: 'arrow-right',
    size: 32,
    color: '#0d6efd',
    strokeWidth: 2,
    label: 'Next'
  },
  $node: createNode('dmx-lucide-icon')
};
Object.assign(instance, context.componentDefinition);
instance.render();

assert(instance.$node.children.length === 1, 'render should create one placeholder');
const placeholder = instance.$node.children[0];
assert(placeholder.getAttribute('data-lucide') === 'arrow-right', 'icon name not rendered');
assert(placeholder.getAttribute('width') === '32', 'width not rendered');
assert(placeholder.getAttribute('height') === '32', 'height not rendered');
assert(placeholder.getAttribute('stroke') === '#0d6efd', 'color not rendered');
assert(placeholder.getAttribute('aria-label') === 'Next', 'label not rendered');
assert(context.createIconsOptions.root === instance.$node, 'Lucide render should be scoped to component root');

console.log('Validation passed: clean manual Lucide Wappler extension is ready.');
