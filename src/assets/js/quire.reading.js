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

  /* The reading steps this release registers, finest first — which is the
     order a size control reads in, and the order a picker should render.

     Mark the container it fills with data-quire-reading and leave it empty.
     Same convention as the mode picker: a template whose rows are built at
     runtime holds no step ids at all, which is indistinguishable from a
     template that forgot them, so "npm run consumers" reads the marker to tell
     the two apart. */
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

  /* Resolve a stored or requested id against this release, falling back to the
     step that claims :root. A step that was retired still sits in somebody's
     localStorage, and passing it through would set an attribute no selector
     matches — rendering the default while the picker shows nothing chosen. */
  QUIRE_READING.resolve = function (id) {
    return QUIRE_READING.ids.indexOf(id) !== -1 ? id : QUIRE_READING.default;
  };

  /* Apply a step to an element (the document element unless told otherwise).
     The default step CLEARS the attribute rather than writing it, so the
     document matches what :root already says.

     Call this before first paint. A reading size that arrives after the page
     has drawn is a visible reflow of every line of text — far more noticeable
     than the colour equivalent, which is why the mode registry gets away with
     being less insistent about it. */
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
