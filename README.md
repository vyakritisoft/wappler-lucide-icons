# Wappler Lucide Icons

A clean Wappler App Connect extension for rendering [Lucide](https://lucide.dev/) icons.

This rebuild intentionally uses **manual text input** for icon names. There are no select/dropdown icon pickers.

## Files

```text
app_connect/components.hjson      Wappler UI/component definition
includes/dmx-lucide-icon.js       App Connect runtime component
package.json                      Extension package metadata
test/validate.js                  Validation test
```

## Install in Wappler

1. Place this folder inside your Wappler project, for example:
   ```text
   src/wappler-lucide-icons
   ```
2. In Wappler, open **Project Settings → Extensions**.
3. Add this extension folder/package.
4. Restart Wappler if needed.
5. In the App Connect component picker, look for:
   ```text
   Lucide → Lucide Icon
   ```

## Usage

```html
<dmx-lucide-icon id="my_icon" icon="menu"></dmx-lucide-icon>
```

Examples of icon names:

```text
menu
settings
arrow-right
circle-help
shopping-cart
```

With options:

```html
<dmx-lucide-icon
  id="next_icon"
  icon="arrow-right"
  size="32"
  color="#0d6efd"
  stroke-width="2"
  label="Next"
></dmx-lucide-icon>
```

## Validation

```sh
npm install
npm test
npm pack --dry-run
```

## Notes

- Icon names must be Lucide kebab-case names.
- Lucide is loaded from the pinned CDN URL:
  `https://unpkg.com/lucide@1.8.0/dist/umd/lucide.min.js`
- Runtime script is copied by Wappler to:
  `js/dmx-lucide-icon.js`
