# Wappler Lucide Icons

A clean Wappler App Connect extension for rendering [Lucide](https://lucide.dev/) icons.

This rebuild intentionally uses **manual text input** for icon names. There are no select/dropdown icon pickers.

## Install in Wappler

1. In Wappler, open **Project Settings → Extensions**.
2. Search for `@vyakriti/wappler-lucide-icons` and add this extension package.
3. Run `Project Updater` or restart Wappler if needed.
4. In the App Connect component picker, look for:

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

## Notes

* Icon names must be Lucide kebab-case names.
* Lucide is loaded from the pinned CDN URL:
  `https://unpkg.com/lucide@1.8.0/dist/umd/lucide.min.js`
* Runtime script is copied by Wappler to:
  `js/dmx-lucide-icon.js`
