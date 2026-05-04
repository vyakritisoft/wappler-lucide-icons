# Wappler Lucide Icons

Wappler App Connect extension for rendering [Lucide](https://lucide.dev/) icons from a pinned CDN build.

## Files

- `app_connect/components.hjson` registers the visual Wappler component and links required scripts.
- `includes/dmx-lucide-icon.js` is copied by Wappler to `js/dmx-lucide-icon.js`.
- Lucide is loaded from `https://unpkg.com/lucide@1.8.0/dist/umd/lucide.min.js`.
- `scripts/generate-icons.js` generates an optional full Lucide icon reference from the pinned `lucide@1.8.0` package.
- `test/run-tests.js` validates the component metadata and browser runtime behavior.

## Installation

1. Copy this `wappler-lucide-icons` folder into your Wappler project, for example under `src/wappler-lucide-icons`.
2. In Wappler, open Project Settings, then Extensions.
3. Add or refresh the extension so Wappler detects this package.
4. Insert the `Lucide Icon` App Connect component from the component picker.

## Development

Install the exact validation dependencies:

```sh
npm install
```

Generate a full Lucide icon reference after changing the pinned Lucide version:

```sh
npm run generate:icons
```

Run the validation suite:

```sh
npm test
```

## Usage

```html
<dmx-lucide-icon id="icon1" icon="menu"></dmx-lucide-icon>
```

With styling properties:

```html
<dmx-lucide-icon
  id="settings_icon"
  icon="settings"
  size="32"
  color="currentColor"
  stroke-width="2"
></dmx-lucide-icon>
```

The Wappler properties panel uses text inputs for the Lucide icon name and color. This keeps the extension compatible with Wappler's App Connect extension loader. Enter any Lucide kebab-case icon name, for example `menu`, `x`, `settings`, `arrow-right`, or `circle-help`. The color field accepts any CSS color such as `currentColor`, `#ff00aa`, `rgb(10, 20, 30)`, or `var(--bs-primary)`.

With App Connect bindings:

```html
<dmx-lucide-icon
  dmx-bind:icon="selected_icon"
  dmx-bind:color="theme_color"
  dmx-bind:size="icon_size"
></dmx-lucide-icon>
```

Add `label` when the icon conveys meaning. Leave it empty for decorative icons.

```html
<dmx-lucide-icon icon="save" label="Save"></dmx-lucide-icon>
```

## Notes

- Icon names use Lucide's kebab-case names, such as `menu`, `x`, `settings`, and `arrow-right`.
- The component re-runs `lucide.createIcons({ root: this.$node })` after App Connect updates so dynamic icon names can change at runtime without scanning the whole document.
- If the CDN script does not load, the component retries for 5 seconds, logs one warning, and then stops retrying.
- To change the Lucide version, update the CDN URL in `app_connect/components.hjson`.
