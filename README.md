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

### Wappler component syntax

```html
<dmx-lucide-icon id="my_icon" icon="menu"></dmx-lucide-icon>
```

This is the recommended syntax when you want Wappler App Connect properties, dynamic bindings, and automatic updates.

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

### Native Lucide syntax

You can also use Lucide's native `data-lucide` markup:

```html
<i data-lucide="menu"></i>
```

With options:

```html
<i
  data-lucide="arrow-right"
  width="32"
  height="32"
  stroke-width="2"
  stroke="#0d6efd"
  aria-label="Next"
  role="img"
></i>
```

This syntax is useful for static HTML or when migrating existing Lucide markup. The extension runtime automatically scans and renders `[data-lucide]` elements.

## Choosing a syntax

* Use `<dmx-lucide-icon>` for Wappler/App Connect dynamic data and component properties.
* Use `<i data-lucide="..."></i>` for simple static icons or compatibility with Lucide documentation/examples.
* Both syntaxes can be used on the same page.

## Notes

* Icon names must be Lucide kebab-case names.
* Lucide is loaded from the pinned CDN URL:
  `https://unpkg.com/lucide@1.8.0/dist/umd/lucide.min.js`
* Runtime script is copied by Wappler to:
  `js/dmx-lucide-icon.js`
