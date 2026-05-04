(function () {
  'use strict';

  function numberOrDefault(value, fallback) {
    var number = Number(value);
    return Number.isFinite(number) && number > 0 ? number : fallback;
  }

  function normalizeIconName(value) {
    return String(value || '').trim();
  }

  function warn(message, error) {
    if (!window.console || typeof window.console.warn !== 'function') {
      return;
    }

    if (error) {
      window.console.warn(message, error);
    } else {
      window.console.warn(message);
    }
  }

  function createLucideIcons(root) {
    if (!window.lucide || typeof window.lucide.createIcons !== 'function') {
      return false;
    }

    try {
      window.lucide.createIcons({
        root: root || document,
        nameAttr: 'data-lucide'
      });
      return true;
    } catch (error) {
      warn('[dmx-lucide-icon] Unable to render Lucide icons.', error);
      return true;
    }
  }

  function installAutoRenderer() {
    var retryCount = 0;
    var retryTimer = null;
    var renderTimer = null;
    var observer = null;

    function scheduleRender() {
      if (renderTimer) {
        return;
      }

      renderTimer = setTimeout(function () {
        renderTimer = null;
        renderDocumentIcons();
      }, 0);
    }

    function renderDocumentIcons() {
      if (createLucideIcons(document)) {
        return;
      }

      if (retryCount >= 100) {
        warn('[dmx-lucide-icon] Lucide library was not loaded after 5 seconds.');
        return;
      }

      retryCount += 1;
      retryTimer = setTimeout(function () {
        retryTimer = null;
        renderDocumentIcons();
      }, 50);
    }

    function startObserver() {
      if (!window.MutationObserver || observer || !document.documentElement) {
        return;
      }

      observer = new MutationObserver(function (mutations) {
        for (var i = 0; i < mutations.length; i += 1) {
          if (mutations[i].type === 'childList' || mutations[i].attributeName === 'data-lucide') {
            scheduleRender();
            return;
          }
        }
      });

      observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['data-lucide']
      });
    }

    if (document.readyState === 'loading' && typeof document.addEventListener === 'function') {
      document.addEventListener('DOMContentLoaded', renderDocumentIcons);
    } else {
      renderDocumentIcons();
    }

    if (typeof window.addEventListener === 'function') {
      window.addEventListener('load', renderDocumentIcons);
    }

    startObserver();
  }

  installAutoRenderer();

  if (!window.dmx || !window.dmx.Component) {
    return;
  }

  window.dmx.Component('lucide-icon', {
    attributes: {
      icon: {
        type: String,
        default: 'menu'
      },
      size: {
        type: Number,
        default: 24
      },
      color: {
        type: String,
        default: 'currentColor'
      },
      strokeWidth: {
        type: Number,
        default: 2
      },
      label: {
        type: String,
        default: ''
      }
    },

    render: function () {
      this._retryTimer = null;
      this._retryCount = 0;
      this._renderIcon();
    },

    performUpdate: function () {
      this._renderIcon();
    },

    destroy: function () {
      this._clearRetryTimer();
    },

    _renderIcon: function () {
      this._clearRetryTimer();

      var icon = normalizeIconName(this.props.icon);
      if (!icon) {
        this.$node.innerHTML = '';
        return;
      }

      var size = numberOrDefault(this.props.size, 24);
      var strokeWidth = numberOrDefault(this.props.strokeWidth, 2);
      var color = this.props.color || 'currentColor';
      var label = String(this.props.label || '').trim();
      var placeholder = document.createElement('span');

      placeholder.setAttribute('data-lucide', icon);
      placeholder.setAttribute('width', String(size));
      placeholder.setAttribute('height', String(size));
      placeholder.setAttribute('stroke-width', String(strokeWidth));
      placeholder.setAttribute('stroke', color);

      if (label) {
        placeholder.setAttribute('role', 'img');
        placeholder.setAttribute('aria-label', label);
      } else {
        placeholder.setAttribute('aria-hidden', 'true');
      }

      this.$node.innerHTML = '';
      this.$node.appendChild(placeholder);
      this._createIcon();
    },

    _createIcon: function () {
      if (createLucideIcons(this.$node)) {
        return;
      }

      if (this._retryCount >= 100) {
        warn('[dmx-lucide-icon] Lucide library was not loaded after 5 seconds.');
        return;
      }

      this._retryCount += 1;
      this._retryTimer = setTimeout(function () {
        this._retryTimer = null;
        this._createIcon();
      }.bind(this), 50);
    },

    _clearRetryTimer: function () {
      if (this._retryTimer) {
        clearTimeout(this._retryTimer);
        this._retryTimer = null;
      }
    }
  });
}());
