(function () {
  'use strict';

  if (!window.dmx || !dmx.Component) {
    return;
  }

  function toNumber(value, fallback) {
    var number = Number(value);
    return Number.isFinite(number) && number > 0 ? number : fallback;
  }

  function toBoolean(value) {
    return value === true || value === 'true' || value === '' || value === 1 || value === '1';
  }

  function cleanIconName(value) {
    return String(value || '').trim();
  }

  function warn(message, error) {
    if (window.console && typeof window.console.warn === 'function') {
      if (error) {
        window.console.warn(message, error);
      } else {
        window.console.warn(message);
      }
    }
  }

  dmx.Component('lucide-icon', {
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
      absoluteStrokeWidth: {
        type: Boolean,
        default: false
      },
      label: {
        type: String,
        default: ''
      }
    },

    render: function () {
      this._retryTimer = null;
      this._retryCount = 0;
      this._hasWarnedMissingLucide = false;
      this._renderIcon();
    },

    performUpdate: function () {
      this._renderIcon();
    },

    destroy: function () {
      this._clearRetryTimer();
    },

    dispose: function () {
      this._clearRetryTimer();
    },

    _renderIcon: function () {
      this._clearRetryTimer();
      this._retryCount = 0;

      var icon = cleanIconName(this.props.icon);

      if (!icon) {
        this.$node.innerHTML = '';
        return;
      }

      var size = toNumber(this.props.size, 24);
      var strokeWidth = toNumber(this.props.strokeWidth, 2);
      if (toBoolean(this.props.absoluteStrokeWidth)) {
        strokeWidth = Number((strokeWidth * 24 / size).toFixed(4));
      }

      var color = this.props.color || 'currentColor';
      var label = String(this.props.label || '').trim();
      var span = document.createElement('span');

      span.setAttribute('data-lucide', icon);
      span.setAttribute('width', String(size));
      span.setAttribute('height', String(size));
      span.setAttribute('stroke-width', String(strokeWidth));
      span.setAttribute('stroke', color);

      if (label) {
        span.setAttribute('aria-label', label);
        span.setAttribute('role', 'img');
      } else {
        span.setAttribute('aria-hidden', 'true');
      }

      this.$node.innerHTML = '';
      this.$node.appendChild(span);
      this._createIcons();
    },

    _createIcons: function () {
      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        try {
          window.lucide.createIcons({
            root: this.$node,
            icons: window.lucide,
            nameAttr: 'data-lucide'
          });
        } catch (error) {
          warn('[dmx-lucide-icon] Unable to render icon:', error);
        }
        return;
      }

      if (this._retryCount >= 100) {
        if (!this._hasWarnedMissingLucide) {
          warn('[dmx-lucide-icon] Lucide did not load after 5 seconds; icon rendering stopped.');
          this._hasWarnedMissingLucide = true;
        }
        return;
      }

      this._retryCount += 1;
      this._retryTimer = setTimeout(function () {
        this._retryTimer = null;
        this._createIcons();
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
