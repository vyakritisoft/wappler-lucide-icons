(function () {
  'use strict';

  if (!window.dmx || !window.dmx.Component) {
    return;
  }

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
      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        try {
          window.lucide.createIcons({
            root: this.$node,
            nameAttr: 'data-lucide'
          });
        } catch (error) {
          warn('[dmx-lucide-icon] Unable to render Lucide icon.', error);
        }
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
