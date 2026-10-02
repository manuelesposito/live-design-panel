/* Quire Design System — quire.modes.js
 * GENERATED FILE — do not edit.
 *
 * version 0.75.3
 * build   5b91f942a4c5
 *
 * Source:  design-system/tokens/quire.tokens.json
 * Wiring:  design-system/tokens/manifest.json
 * Rebuild: node design-system/tokens/build.mjs
 *
 * This file is copied into consuming projects. The two values above are
 * how a copy identifies itself once it is no longer beside its source:
 * "version" is the release, "build" is a hash of everything below this
 * comment. Run "npm run consumers" in the design system to see where
 * every copy stands.
 */
(function (root) {
  "use strict";
  
  var QUIRE_MODES = {
    "attribute": "data-theme",
    "default": "neutral-light",
    "palettes": [
      {
        "id": "neutral",
        "label": "Neutral",
        "sides": {
          "light": "neutral-light",
          "dark": "neutral-dark"
        }
      },
      {
        "id": "godfather",
        "label": "Godfather",
        "sides": {
          "light": "godfather-light",
          "dark": "godfather-dark"
        }
      },
      {
        "id": "fargo",
        "label": "Fargo",
        "sides": {
          "light": "fargo-light",
          "dark": "fargo-dark"
        }
      },
      {
        "id": "matrix",
        "label": "Matrix",
        "sides": {
          "light": "matrix-light",
          "dark": "matrix-dark"
        }
      },
      {
        "id": "dune",
        "label": "Dune",
        "sides": {
          "light": "dune-light",
          "dark": "dune-dark"
        }
      },
      {
        "id": "persona",
        "label": "Persona",
        "sides": {
          "light": "persona-light",
          "dark": "persona-dark"
        }
      },
      {
        "id": "paper",
        "label": "Paper",
        "sides": {
          "light": "paper-light",
          "dark": "paper-dark"
        }
      },
      {
        "id": "terminal",
        "label": "Terminal",
        "sides": {
          "light": "terminal-light",
          "dark": "terminal-dark"
        }
      },
      {
        "id": "grey",
        "label": "Grey",
        "sides": {
          "light": "grey-light",
          "dark": "grey-dark"
        }
      },
      {
        "id": "news",
        "label": "Newsprint",
        "sides": {
          "light": "news-light",
          "dark": "news-dark"
        }
      },
      {
        "id": "arcade",
        "label": "Arcade",
        "sides": {
          "light": "arcade-light",
          "dark": "arcade-dark"
        }
      }
    ],
    "sides": [
      "light",
      "auto",
      "dark"
    ],
    "legacy": {
      "day": "neutral-light",
      "night": "neutral-dark",
      "oat": "godfather-light",
      "bark": "godfather-dark",
      "moss": "matrix-dark",
      "clay": "dune-light",
      "camel": "dune-light",
      "concrete": "fargo-light"
    },
    "modes": [
      {
        "id": "neutral-light",
        "label": "Neutral",
        "palette": "neutral",
        "side": "light",
        "scheme": "light",
        "className": "theme-neutral-light",
        "swatch": "#dedbd5",
        "swatchInk": "#7444b4",
        "swatchEdge": "#d7d7d7"
      },
      {
        "id": "neutral-dark",
        "label": "Neutral",
        "palette": "neutral",
        "side": "dark",
        "scheme": "dark",
        "className": "theme-neutral-dark",
        "swatch": "#2b2b2b",
        "swatchInk": "#a76ef8",
        "swatchEdge": "#494949"
      },
      {
        "id": "godfather-light",
        "label": "Godfather",
        "palette": "godfather",
        "side": "light",
        "scheme": "light",
        "className": "theme-godfather-light",
        "swatch": "#efe4d6",
        "swatchInk": "#905400",
        "swatchEdge": "#e2d5c2"
      },
      {
        "id": "godfather-dark",
        "label": "Godfather",
        "palette": "godfather",
        "side": "dark",
        "scheme": "dark",
        "className": "theme-godfather-dark",
        "swatch": "#2e2a25",
        "swatchInk": "#f6ac5e",
        "swatchEdge": "#4d4841"
      },
      {
        "id": "fargo-light",
        "label": "Fargo",
        "palette": "fargo",
        "side": "light",
        "scheme": "light",
        "className": "theme-fargo-light",
        "swatch": "#dfe7ef",
        "swatchInk": "#116d96",
        "swatchEdge": "#ced8e2"
      },
      {
        "id": "fargo-dark",
        "label": "Fargo",
        "palette": "fargo",
        "side": "dark",
        "scheme": "dark",
        "className": "theme-fargo-dark",
        "swatch": "#282b2e",
        "swatchInk": "#8cc6e9",
        "swatchEdge": "#454a4d"
      },
      {
        "id": "matrix-light",
        "label": "Matrix",
        "palette": "matrix",
        "side": "light",
        "scheme": "light",
        "className": "theme-matrix-light",
        "swatch": "#daecdd",
        "swatchInk": "#237902",
        "swatchEdge": "#c8decb"
      },
      {
        "id": "matrix-dark",
        "label": "Matrix",
        "palette": "matrix",
        "side": "dark",
        "scheme": "dark",
        "className": "theme-matrix-dark",
        "swatch": "#262d27",
        "swatchInk": "#85d673",
        "swatchEdge": "#434c44"
      },
      {
        "id": "dune-light",
        "label": "Dune",
        "palette": "dune",
        "side": "light",
        "scheme": "light",
        "className": "theme-dune-light",
        "swatch": "#f4e1df",
        "swatchInk": "#ae2e46",
        "swatchEdge": "#e9d0ce"
      },
      {
        "id": "dune-dark",
        "label": "Dune",
        "palette": "dune",
        "side": "dark",
        "scheme": "dark",
        "className": "theme-dune-dark",
        "swatch": "#302928",
        "swatchInk": "#ff9ea6",
        "swatchEdge": "#504645"
      },
      {
        "id": "persona-light",
        "label": "Persona",
        "palette": "persona",
        "side": "light",
        "scheme": "light",
        "className": "theme-persona-light",
        "swatch": "#fefefe",
        "swatchInk": "#0333cc",
        "swatchEdge": "#e1e1e1"
      },
      {
        "id": "persona-dark",
        "label": "Persona",
        "palette": "persona",
        "side": "dark",
        "scheme": "dark",
        "className": "theme-persona-dark",
        "swatch": "#090909",
        "swatchInk": "#94b7fe",
        "swatchEdge": "#2b2b2b"
      },
      {
        "id": "paper-light",
        "label": "Paper",
        "palette": "paper",
        "side": "light",
        "scheme": "light",
        "className": "theme-paper-light",
        "swatch": "#e4cfb2",
        "swatchInk": "#8b5727",
        "swatchEdge": "#ddc9ac"
      },
      {
        "id": "paper-dark",
        "label": "Paper",
        "palette": "paper",
        "side": "dark",
        "scheme": "dark",
        "className": "theme-paper-dark",
        "swatch": "#433b2f",
        "swatchInk": "#e0b490",
        "swatchEdge": "#655a4a"
      },
      {
        "id": "terminal-light",
        "label": "Terminal",
        "palette": "terminal",
        "side": "light",
        "scheme": "light",
        "className": "theme-terminal-light",
        "swatch": "#ddffdc",
        "swatchInk": "#007e27",
        "swatchEdge": "#bce0bb"
      },
      {
        "id": "terminal-dark",
        "label": "Terminal",
        "palette": "terminal",
        "side": "dark",
        "scheme": "dark",
        "className": "theme-terminal-dark",
        "swatch": "#001902",
        "swatchInk": "#99ffa3",
        "swatchEdge": "#043409"
      },
      {
        "id": "grey-light",
        "label": "Grey",
        "palette": "grey",
        "side": "light",
        "scheme": "light",
        "className": "theme-grey-light",
        "swatch": "#ffffff",
        "swatchInk": "#3b4ad4",
        "swatchEdge": "#c9c9cf"
      },
      {
        "id": "grey-dark",
        "label": "Grey",
        "palette": "grey",
        "side": "dark",
        "scheme": "dark",
        "className": "theme-grey-dark",
        "swatch": "#4a4a4d",
        "swatchInk": "#a9b7ff",
        "swatchEdge": "#616166"
      },
      {
        "id": "news-light",
        "label": "Newsprint",
        "palette": "news",
        "side": "light",
        "scheme": "light",
        "className": "theme-news-light",
        "swatch": "#f2efe8",
        "swatchInk": "#326891",
        "swatchEdge": "#c9c5bc"
      },
      {
        "id": "news-dark",
        "label": "Newsprint",
        "palette": "news",
        "side": "dark",
        "scheme": "dark",
        "className": "theme-news-dark",
        "swatch": "#1e1c19",
        "swatchInk": "#8fb3d9",
        "swatchEdge": "#312e2a"
      },
      {
        "id": "arcade-light",
        "label": "Arcade",
        "palette": "arcade",
        "side": "light",
        "scheme": "light",
        "className": "theme-arcade-light",
        "swatch": "#eef1ff",
        "swatchInk": "#c24400",
        "swatchEdge": "#c5cae1"
      },
      {
        "id": "arcade-dark",
        "label": "Arcade",
        "palette": "arcade",
        "side": "dark",
        "scheme": "dark",
        "className": "theme-arcade-dark",
        "swatch": "#10113a",
        "swatchInk": "#ff9a2e",
        "swatchEdge": "#2b3057"
      }
    ]
  };
  QUIRE_MODES.ids = QUIRE_MODES.modes.map(function (m) { return m.id; });
  function byId(id) {
    for (var i = 0; i < QUIRE_MODES.modes.length; i++) {
      if (QUIRE_MODES.modes[i].id === id) return QUIRE_MODES.modes[i];
    }
    return null;
  }
  function paletteById(id) {
    for (var i = 0; i < QUIRE_MODES.palettes.length; i++) {
      if (QUIRE_MODES.palettes[i].id === id) return QUIRE_MODES.palettes[i];
    }
    return null;
  }
  
  QUIRE_MODES.prefersDark = function () {
    return (
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    );
  };
  
  QUIRE_MODES.resolve = function (id, side) {
    var wanted = QUIRE_MODES.legacy[id] || id;
    var mode = byId(wanted);
    var palette = paletteById(wanted) || (mode && paletteById(mode.palette));
    if (!palette) return QUIRE_MODES.default;
    var want = side || (mode ? mode.side : "auto");
    if (want === "auto") want = QUIRE_MODES.prefersDark() ? "dark" : "light";
    return palette.sides[want] || palette.sides.light || QUIRE_MODES.default;
  };
  
  QUIRE_MODES.apply = function (id, el, side) {
    var target = el || document.documentElement;
    var resolved = QUIRE_MODES.resolve(id, side);
    if (resolved === QUIRE_MODES.default) target.removeAttribute(QUIRE_MODES.attribute);
    else target.setAttribute(QUIRE_MODES.attribute, resolved);
    return resolved;
  };
  
  QUIRE_MODES.follow = function (palette, side, el) {
    var applied = QUIRE_MODES.apply(palette, el, side);
    if (side !== "auto" || typeof window === "undefined" || !window.matchMedia) {
      return function () {};
    }
    var query = window.matchMedia("(prefers-color-scheme: dark)");
    var onChange = function () { QUIRE_MODES.apply(palette, el, "auto"); };
    if (query.addEventListener) query.addEventListener("change", onChange);
    else query.addListener(onChange);
    void applied;
    return function () {
      if (query.removeEventListener) query.removeEventListener("change", onChange);
      else query.removeListener(onChange);
    };
  };
  root.QuireModes = QUIRE_MODES;
  if (typeof module !== "undefined" && module.exports) module.exports = QUIRE_MODES;
})(typeof globalThis !== "undefined" ? globalThis : this);
