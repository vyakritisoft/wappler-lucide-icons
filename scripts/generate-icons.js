#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const Hjson = require('hjson');

const rootDir = path.resolve(__dirname, '..');
const componentsFile = path.join(rootDir, 'app_connect', 'components', 'lucide.hjson');
const defaultOutputFile = path.join(rootDir, 'generated', 'lucide-icons.json');

function iconExportFile() {
  const lucidePackage = require.resolve('lucide/package.json');
  return path.join(path.dirname(lucidePackage), 'dist', 'esm', 'iconsAndAliases.js');
}

function toKebabCase(value) {
  return String(value)
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .replace(/_/g, '-')
    .toLowerCase();
}

function toTitle(value) {
  const uppercaseWords = {
    a: 'A',
    ai: 'AI',
    api: 'API',
    az: 'AZ',
    cctv: 'CCTV',
    cpu: 'CPU',
    dna: 'DNA',
    hdmi: 'HDMI',
    id: 'ID',
    nfc: 'NFC',
    qr: 'QR',
    rss: 'RSS',
    tv: 'TV',
    usb: 'USB',
    vr: 'VR',
    wifi: 'WiFi',
    x: 'X',
    za: 'ZA'
  };

  return value
    .split('-')
    .map(function (word) {
      return uppercaseWords[word] || word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

function generateIconValues() {
  const source = fs.readFileSync(iconExportFile(), 'utf8');
  const iconNames = new Set();
  const exportPattern = /export\s+\{\s*([^}]+)\s*\}\s+from\s+'\.\/icons\/([^']+)\.js';/g;
  let match;

  while ((match = exportPattern.exec(source))) {
    iconNames.add(match[2]);

    const exports = match[1].match(/default as ([A-Za-z0-9_]+)/g) || [];
    exports.forEach(function (exportName) {
      iconNames.add(toKebabCase(exportName.replace('default as ', '')));
    });
  }

  return Array.from(iconNames)
    .sort()
    .map(function (iconName) {
      return {
        title: toTitle(iconName),
        value: iconName
      };
    });
}

function findVariable(config, name) {
  const components = config.components || [];

  for (const component of components) {
    const properties = component.properties || [];

    for (const group of properties) {
      const variables = group.variables || [];
      const variable = variables.find(function (item) {
        return item.name === name;
      });

      if (variable) {
        return variable;
      }
    }
  }

  return null;
}

function readComponentIconValues(filePath) {
  const config = Hjson.parse(fs.readFileSync(filePath, 'utf8'));
  const iconVariable = findVariable(config, 'iconName');

  if (!iconVariable) {
    throw new Error('Unable to find the iconName variable in app_connect/components/lucide.hjson');
  }

  return iconVariable.values || [];
}

function writeIconReference(filePath) {
  const iconValues = generateIconValues();

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(iconValues, null, 2) + '\n');

  return iconValues;
}

if (require.main === module) {
  const outputFile = process.argv[2] ? path.resolve(process.argv[2]) : defaultOutputFile;
  const iconValues = writeIconReference(outputFile);
  console.log('Generated ' + iconValues.length + ' Lucide icon reference values at ' + outputFile + '.');
  console.log('Note: app_connect/components.hjson intentionally keeps a compact Wappler-safe curated dropdown.');
}

module.exports = {
  componentsFile,
  defaultOutputFile,
  generateIconValues,
  readComponentIconValues,
  toKebabCase,
  toTitle,
  writeIconReference
};
