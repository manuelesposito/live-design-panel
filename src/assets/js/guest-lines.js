/*
 * THE LINES ON A STRANGER'S PAGE (Manuel, 2026-09-22, twice: first at the boxes
 * round the tags, "those lines don't seem to be affected by that line setting,
 * like making it less intense or stronger or dashed", and then at the rules
 * between the More posts rows, "those lines are also not adjustable over our
 * line setting").
 *
 * They could not be. The Lines dial is a generated list of the parts ARCHITRAVE
 * draws a line on, written by tools/line-style.py out of the theme's own rules;
 * a stranger's theme draws its lines on its own parts, and no list written here
 * could ever name them. Twenty Twenty-Five's rows are a `wp-block-group` with a
 * hashed container class in it, which is not a name at all.
 *
 * SO THE LIST IS NOT WRITTEN, IT IS READ. Once, on the page as it stands, every
 * element that actually carries a visible border is marked, and the dial speaks
 * to the mark. What the theme draws a line on is what the dial reaches: not more,
 * and never less.
 *
 * READ ONCE AND KEPT. The dial's own rules turn those borders transparent when
 * Lines is off, so a second reading would find no border and unmark the very
 * thing it had just marked. Elements are only ever added to the list.
 *
 * NOT THE FIELDS. A comment box with no line and no fill cannot be typed in, and
 * panel.css already carries Architrave's answer to that, on `.comment-form`,
 * which is core WordPress and reaches a guest as it stands.
 *
 * NOTHING HAPPENS UNTIL A LOOK IS ON. The marks are harmless on their own; the
 * stylesheet that reads them is gated on `data-chosen`, so a theme nobody has
 * restyled keeps every line exactly as its author drew it.
 */
(function () {
	if (!window.architravePanelGuest) return;
	var SIDES = ['Top', 'Right', 'Bottom', 'Left'];
	/* HELD STILL (0.11.149): read and written with transitions at no length;
	   guest-size.js says why. */
	var still = window.ldpStill || (window.ldpStill = (function () {
		var sheet = null, depth = 0;
		return function (fn) {
			if (!sheet) {
				var st = document.createElement('style');
				st.id = 'ldp-still';
				st.textContent = ':root, :root *, :root *::before, :root *::after { transition-duration: 0s !important; transition-delay: 0s !important; }';
				(document.head || document.documentElement).appendChild(st);
				sheet = st.sheet;
				sheet.disabled = true;
			}
			depth++;
			sheet.disabled = false;
			try { return fn(); } finally {
				if (--depth === 0) { void document.documentElement.offsetWidth; sheet.disabled = true; }
			}
		};
	}()));
	/* AND NOTHING OF THE PANEL'S OWN, wherever it stands. The plugin prints the
	   menus' source into the footer, outside the panel, and a separator marked
	   there carries the mark into the panel when it is cloned: which is the
	   dashed panel menu of this same afternoon, back by another door. Anything
	   wearing a `quire-` or `reading-` class belongs to the panel. */
	/* NOR A QUOTE'S BAR (Manuel, 2026-09-25, Neve FSE: "the line in front of
	   quotes … disappears"). It is what makes a quote a quote, not a line the page
	   is drawn with: Lines off took it away and Lines on faded it to a hairline. It
	   keeps the theme's own, in the colour the theme gave it. */
	var SKIP = 'input, textarea, select, [class*="quire-"], [class*="reading-"], .reading-panel, .reading-panel *, .architrave-panel-opener, .architrave-panel-opener *, #wpadminbar, #wpadminbar *, .wp-block-quote, .wp-block-pullquote, .wp-block-pullquote blockquote';

	function pass() {
		if (!document.body) return;
		var all = document.body.querySelectorAll('*'), marked = 0;
		for (var i = 0; i < all.length; i++) {
			var e = all[i];
			if (e.hasAttribute('data-panel-line')) continue;
			try { if (e.matches(SKIP)) continue; } catch (x) { continue; }
			var g = window.getComputedStyle(e), has = false;
			for (var s = 0; s < SIDES.length; s++) {
				var c = g['border' + SIDES[s] + 'Color'];
				if (parseFloat(g['border' + SIDES[s] + 'Width']) > 0 &&
					g['border' + SIDES[s] + 'Style'] !== 'none' &&
					c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent') { has = true; break; }
			}
			if (has) { e.setAttribute('data-panel-line', ''); marked++; }
		}
		return marked;
	}

	/* A BADGE IS A LABEL, NOT A HEADING WITH A LINE ROUND IT (Manuel, 2026-09-25,
	   Twenty Twenty-Five's "About Us" under Classic and Catalogue: "sometimes
	   there's that outline of that badge and other times not"). The theme drew a
	   small pill: 14px, a line all the way round, as wide as its words. Under a
	   look it was an h2 like any other, so it took the heading's face and rung,
	   36 and 50px, and the Lines dial took its outline in one look and left it in
	   the next: a big word in a box, or a big word pushed in by padding nobody
	   could see.
	   So a badge is READ, like the lines: text on one line, a line on all four
	   sides, narrower than the space it stands in. It is read on the theme's own
	   look, with the attributes that turn a look on lifted, because Lines off has
	   already made its outline invisible. panel-page.css dresses it as the
	   look's label (the category line's face, the gray chip of the secondary
	   button, the look's corner) and guest-size.js sorts it DESIGNED. */
	var NOT_BADGE = SKIP + ', .wp-block-button__link, .wp-element-button, .wp-block-search__button, button, img, svg, figure, hr, table, ul, ol, pre, .wp-block-group, .wp-block-columns, .wp-block-column, .wp-block-cover';
	function badges() { still(badgesNow); }
	function badgesNow() {
		if (!document.body) return;
		var held = {}, found = 0;
		['data-chosen', 'data-colours', 'data-lines'].forEach(function (a) { if (root.hasAttribute(a)) { held[a] = root.getAttribute(a); root.removeAttribute(a); } });
		var all = document.body.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, a, div, li');
		for (var i = 0; i < all.length; i++) {
			var e = all[i];
			if (e.hasAttribute('data-ldp-badge')) continue;
			try { if (e.matches(NOT_BADGE) || e.closest('.reading-panel, #wpadminbar')) continue; } catch (x) { continue; }
			var g = window.getComputedStyle(e), round = true;
			for (var s = 0; s < SIDES.length && round; s++) {
				var c = g['border' + SIDES[s] + 'Color'];
				round = parseFloat(g['border' + SIDES[s] + 'Width']) > 0 && g['border' + SIDES[s] + 'Style'] !== 'none' && c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent';
			}
			if (!round) continue;
			var words = (e.textContent || '').trim();
			if (!words || words.length > 40 || e.querySelector('img, svg, video, iframe, p, div, h1, h2, h3, h4, h5, h6, ul, ol')) continue;
			var box = e.getBoundingClientRect(), room = e.parentElement ? e.parentElement.getBoundingClientRect().width : 0;
			var line = parseFloat(g.lineHeight) || parseFloat(g.fontSize) * 1.5;
			var chrome = parseFloat(g.paddingTop) + parseFloat(g.paddingBottom) + parseFloat(g.borderTopWidth) + parseFloat(g.borderBottomWidth);
			if (!box.width || !room || box.width > room * 0.6 || box.height - chrome > line * 1.4) continue;
			e.setAttribute('data-ldp-badge', '');
			found++;
		}
		Object.keys(held).forEach(function (a) { root.setAttribute(a, held[a]); });
		/* guest-size.js may already have sized it as a heading: it is told. */
		if (found) document.dispatchEvent(new Event('architrave-guest-badges'));
	}
	var root = document.documentElement;

	/* WHAT A LINE IS FOR (Manuel, 2026-09-25, Twenty Twenty-Five under Classic:
	   "cards are not visible sometimes … sometimes we need the lines";
	   lab/the-lines-a-page-is-built-with.html, then "build it"). A theme can
	   draw its structure with lines, and a look with Lines off took the
	   structure away with them: the testimonials and the price cards came
	   apart into loose text, the rule under a heading and the seams between
	   rows were gone. A look may change how structure is drawn, never whether.
	   So each marked line is read once for what it does:
	     A BOX (a line all round something with room inside) becomes the look's
	     card under Lines off: its card colour, its corner, no line.
	     A RULE (a line along one side, a separator, a table's grid) stays under
	     Lines off, as the look's quiet line.
	     Anything else is decoration, and the Lines dial speaks to it as before.
	   A fresh review (the same evening) ran it on three themes and set the
	   guards: a button, a link, a picture or a field is never a box (Neve's
	   buttons have a line all round and turned white on white); nothing that
	   has its own colour is filled; only the outermost box, never a band as
	   wide as its room, never one without padding for the fill to sit in; a
	   table keeps its grid; the header's and footer's own lines across the
	   page are the frame, not the content, and stay off. panel-page.css,
	   WHAT A LINE IS FOR, spends the marks. */
	var NOT_BOX = 'a, button, .wp-block-button, .wp-block-button__link, .wp-element-button, input, select, textarea, img, svg, figure, picture, video, iframe, table, thead, tbody, tfoot, tr, th, td, nav, nav *, [data-ldp-badge]';
	var GRID = 'table, thead, tbody, tfoot, tr, th, td';
	var FRAME = 'header, footer, .wp-block-template-part';
	function clear(c) {
		var m = /rgba?\(([^)]+)\)/.exec(c || '');
		if (!m) return c === 'transparent';
		var v = m[1].split(',');
		return v.length === 4 && parseFloat(v[3]) < 0.05;
	}
	function kinds() {
		var W = root.clientWidth;
		Array.prototype.forEach.call(document.querySelectorAll('[data-panel-line]:not([data-ldp-line]), hr:not([data-ldp-line]), .wp-block-separator:not([data-ldp-line])'), function (e) {
			try { if (e.matches(SKIP)) return; } catch (x) { return; }
			var g = window.getComputedStyle(e), r = e.getBoundingClientRect();
			if (!r.width && !r.height) return;
			var sides = SIDES.filter(function (k) { return parseFloat(g['border' + k + 'Width']) > 0 && g['border' + k + 'Style'] !== 'none'; }).map(function (k) { return k[0]; }).join('');
			if (e.matches('hr, .wp-block-separator') || (sides && e.matches(GRID))) { e.setAttribute('data-ldp-line', 'rule'); return; }
			if (sides === 'TRBL') {
				if (e.matches(NOT_BOX) || e.closest('[data-ldp-line="box"]') || !clear(g.backgroundColor)) return;
				var room = e.parentElement ? e.parentElement.getBoundingClientRect().width : W;
				var pad = Math.min(parseFloat(g.paddingTop), parseFloat(g.paddingRight), parseFloat(g.paddingBottom), parseFloat(g.paddingLeft));
				if (r.width >= 120 && r.height >= 60 && r.width <= room * 0.95 && pad >= 8) e.setAttribute('data-ldp-line', 'box');
				return;
			}
			if (/^(T|B|TB|L|R)$/.test(sides) && Math.max(r.width, r.height) >= 200) {
				if (r.width >= W * 0.9 && (e.matches(FRAME) || e.closest(FRAME))) return;
				e.setAttribute('data-ldp-line', 'rule');
			}
		});
	}

	var timer = null;
	function soon() { if (timer) clearTimeout(timer); timer = setTimeout(function () { pass(); kinds(); }, 60); }
	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { badges(); soon(); }); else { badges(); soon(); }
	window.addEventListener('load', function () { badges(); soon(); });
}());
