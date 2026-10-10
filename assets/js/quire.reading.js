/* Quire Design System — quire.reading.js
 * GENERATED FILE — do not edit.
 *
 * version 0.75.17
 * build   00561d714844
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
  
  var QUIRE_READING = {
    "attribute": "data-reading",
    "default": "comfortable",
    "steps": [
      {
        "id": "tiny",
        "label": "Tiny"
      },
      {
        "id": "small",
        "label": "Small"
      },
      {
        "id": "compact",
        "label": "Compact"
      },
      {
        "id": "default",
        "label": "Default"
      },
      {
        "id": "comfortable",
        "label": "Comfortable"
      },
      {
        "id": "large",
        "label": "Large"
      },
      {
        "id": "huge",
        "label": "Huge"
      }
    ]
  };
  QUIRE_READING.ids = QUIRE_READING.steps.map(function (s) { return s.id; });
  
  QUIRE_READING.resolve = function (id) {
    return QUIRE_READING.ids.indexOf(id) !== -1 ? id : QUIRE_READING.default;
  };
  
  QUIRE_READING.apply = function (id, el) {
    var target = el || document.documentElement;
    var resolved = QUIRE_READING.resolve(id);
    if (resolved === QUIRE_READING.default) target.removeAttribute(QUIRE_READING.attribute);
    else target.setAttribute(QUIRE_READING.attribute, resolved);
    return resolved;
  };
  root.QuireReading = QUIRE_READING;
  if (typeof module !== "undefined" && module.exports) module.exports = QUIRE_READING;
})(typeof globalThis !== "undefined" ? globalThis : this);
