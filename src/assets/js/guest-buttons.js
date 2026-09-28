/*
 * THE TWO KINDS OF BUTTON ON A STRANGER'S PAGE (2026-09-24, Manuel on Neve FSE:
 * "in the original there are two different buttons … one button, two buttons,
 * which are the same button style" under Classic).
 *
 * A look dressed every button a guest theme prints the same way: the gray
 * secondary. Neve's filled "Learn More" and its outlined "Contact us" came out
 * as one button twice, and the page lost which one was the way forward.
 *
 * Architrave has two ranks (the button ranks, 2026-09-09): the main button is
 * filled with the accent, the secondary one is gray. A stranger's theme says
 * which of its buttons is which by how it draws them, so the rank is READ, the
 * way guest-lines.js reads the lines a theme draws: on the theme's own look,
 * a button filled with a colour of its own is a main button, one that is
 * outlined or plain is a secondary. Core's "Outline" style is always a
 * secondary. The mark is `data-ldp-button`; panel-page.css paints it, under a
 * look only, so the theme's own page never changes.
 */
(function () {
	if (!window.architravePanelGuest) return;
	var root = document.documentElement;
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
	var SEL = '.wp-block-button__link, .wp-element-button, .wp-block-search__button, input[type="submit"], button[type="submit"]';
	var SKIP = '.reading-panel, .reading-panel *, .architrave-panel-opener, .architrave-panel-opener *, #wpadminbar, #wpadminbar *';

	/* ANY COLOUR, AS RED, GREEN AND BLUE (2026-09-25: a look's pastels are written
	   in oklch, and read as three plain numbers "oklch(0.82 0.05 104)" was a
	   near-black, so a pale yellow band was judged dark and its words turned
	   light on it). What is not rgb() or srgb is painted on a one-pixel canvas
	   and read back. */
	var dot = null;
	function painted(c) {
		try {
			dot = dot || document.createElement('canvas').getContext('2d', { willReadFrequently: true });
			dot.clearRect(0, 0, 1, 1); dot.fillStyle = 'rgba(0, 0, 0, 0)'; dot.fillStyle = c; dot.fillRect(0, 0, 1, 1);
			var d = dot.getImageData(0, 0, 1, 1).data;
			return [d[0], d[1], d[2], d[3] / 255];
		} catch (e) { return null; }
	}
	function rgba(c) {
		if (c && !/^(rgba?\(|color\(srgb)/.test(String(c).trim()) && !/^(transparent|none)$/.test(String(c).trim())) return painted(c);
		var v = String(c).match(/[\d.]+/g);
		if (!v || v.length < 3) return null;
		v = v.map(Number);
		if (/color\(srgb/.test(c)) v = [v[0] * 255, v[1] * 255, v[2] * 255, v.length > 3 ? v[3] : 1];
		return [v[0], v[1], v[2], v.length > 3 ? v[3] : 1];
	}
	function behind(el) {
		for (var e = el.parentElement; e; e = e.parentElement) {
			var c = rgba(window.getComputedStyle(e).backgroundColor);
			if (c && c[3] > 0.5) return c;
		}
		return [255, 255, 255, 1];
	}
	function differs(a, b) { return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]) > 30; }

	function toneOfImage(img, at) {
		try {
			if (!img || !img.complete || !img.naturalWidth) return null;
			var r = img.getBoundingClientRect(), c = document.createElement('canvas');
			c.width = 24; c.height = 24;
			var x = Math.max(0, (at.left - r.left) / r.width), y = Math.max(0, (at.top - r.top) / r.height), w = Math.min(1, at.width / r.width), h = Math.min(1, at.height / r.height);
			c.getContext('2d').drawImage(img, x * img.naturalWidth, y * img.naturalHeight, Math.max(1, w * img.naturalWidth), Math.max(1, h * img.naturalHeight), 0, 0, 24, 24);
			var d = c.getContext('2d').getImageData(0, 0, 24, 24).data, sum = 0;
			for (var i = 0; i < d.length; i += 4) sum += 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
			return sum / (d.length / 4) > 150 ? 'light' : 'dark';
		} catch (e) { return null; } /* a photograph from another site cannot be read */
	}
	function toneBehind(el) {
		for (var e = el.parentElement; e && e !== document.body; e = e.parentElement) {
			if (e.classList.contains('wp-block-cover')) {
				if (e.classList.contains('is-light')) return 'light';
				var img = e.querySelector(':scope > img, :scope > .wp-block-cover__image-background');
				return toneOfImage(img, el.getBoundingClientRect()) || 'dark'; /* WordPress calls a cover it did not mark light dark */
			}
			var bi = window.getComputedStyle(e).backgroundImage, m = bi && bi.match(/url\(["']?([^"')]+)/);
			if (m && !/gradient/.test(bi)) {
				var probe = new Image(); probe.src = m[1];
				return toneOfImage(probe, el.getBoundingClientRect());
			}
		}
		return null;
	}
	function read() { still(readNow); }
	function readNow() {
		/* On the theme's own look: the attributes that turn a look on are lifted
		   for the reading and put back before anything is painted. */
		var held = {};
		['data-chosen', 'data-colours'].forEach(function (a) { if (root.hasAttribute(a)) { held[a] = root.getAttribute(a); root.removeAttribute(a); } });
		var list = document.querySelectorAll(SEL);
		for (var i = 0; i < list.length; i++) {
			var el = list[i];
			if (el.matches(SKIP) || el.hasAttribute('data-ldp-button')) continue;
			var kind = 'secondary';
			if (!el.closest('.is-style-outline')) {
				var bg = rgba(window.getComputedStyle(el).backgroundColor);
				if (bg && bg[3] > 0.5 && differs(bg, behind(el))) kind = 'main';
			}
			el.setAttribute('data-ldp-button', kind);
			/* A BUTTON ON A PHOTOGRAPH IS JUDGED AGAINST THE PHOTOGRAPH (Manuel,
			   2026-09-25, Neve's hero under Blueprint, Poster, Catalogue and Matrix:
			   a fill the colour of the photograph, or two buttons alike). Whether
			   the photograph behind the button is light or dark is read once, here:
			   WordPress marks a cover it judged light with `is-light`; any other
			   photograph is sampled where the button stands. panel-page.css then
			   dresses the button for that tone under every look, at once. */
			var tone = toneBehind(el);
			if (tone) el.setAttribute('data-ldp-photo', tone);
			/* THE PHOTOGRAPH'S OWN INK (Manuel, 2026-09-25, Twenty Twenty-Five's
			   "Coming soon" under Catalogue: "so what's going on here?"). The words
			   on a cover the theme coloured stayed the theme's yellow while its
			   button came in the look's paper with the accent for a word: two
			   colour stories on one photograph. So a button on a cover the theme
			   gave a text colour is marked here, and filled with whatever colour
			   the words on that cover wear under the look, which guest-ink.js
			   decides and writes on the cover, look by look; its word black or
			   white, whichever reads. panel-page.css spends both. */
			var cover = el.closest('.wp-block-cover');
			var inked = cover && (cover.classList.contains('has-text-color') || (el.parentElement && el.parentElement.closest('.wp-block-cover .has-text-color')));
			if (inked) el.setAttribute('data-ldp-photo-ink', ''); /* its colour is written on the cover by guest-ink.js, look by look */
		}
		Object.keys(held).forEach(function (a) { root.setAttribute(a, held[a]); });
	}
	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', read); else read();
	/* A photograph still loading could not be sampled: once everything is in, the
	   buttons on pictures that are still unread are read again. */
	window.addEventListener('load', function () {
		Array.prototype.forEach.call(document.querySelectorAll('[data-ldp-button]:not([data-ldp-photo])'), function (el) { var t = toneBehind(el); if (t) el.setAttribute('data-ldp-photo', t); });
	});

	/* THE PILL'S ROOM (Manuel, 2026-09-25, Twenty Twenty-Five's dropdown under
	   Catalogue: "it's not lining up with the hover, which looks weird"). Under
	   a look a menu item's hover is a pill drawn 0.4em past its word, so that
	   nothing on the page moves (panel-page.css, THE PILL IS A SHAPE). Two things
	   did not know it: the dropdown, which hung from the word and stood 7px
	   inside the pill's edge and under its foot; and the item's neighbours, which
	   a pill that wide can reach into where a theme sets its items close (a
	   footer's column of links, page numbers). So each row of pressable items is
	   measured here: the pill reaches 0.4em, or half the room to the nearest
	   neighbour when that is less, and the number is written on the row as
	   `--ldp-outset`, in pixels, for the pill and for the dropdown hanging from
	   it (panel-page.css, A DROPDOWN HANGS FROM THE PILL). */
	var ROWS = '.wp-block-navigation__container, .wp-block-query-pagination, .wp-block-query-pagination-numbers, .wp-block-comments-pagination, .wp-block-comments-pagination-numbers';
	function room() {
		Array.prototype.forEach.call(document.querySelectorAll(ROWS), function (row) {
			if (row.closest('.reading-panel, #wpadminbar, .wp-block-navigation__responsive-container.is-menu-open')) return;
			var kids = Array.prototype.filter.call(row.children, function (k) { var r = k.getBoundingClientRect(); return r.width && r.height; });
			if (!kids.length) return;
			var word = kids[0].querySelector('.wp-block-navigation-item__content') || kids[0];
			var want = 0.4 * (parseFloat(window.getComputedStyle(word).fontSize) || 16), gap = Infinity;
			for (var i = 1; i < kids.length; i++) {
				var a = kids[i - 1].getBoundingClientRect(), b = kids[i].getBoundingClientRect();
				var sameLine = b.top < a.bottom && a.top < b.bottom;
				gap = Math.min(gap, sameLine ? Math.abs(b.left - a.right) : Math.abs(b.top - a.bottom));
			}
			var out = Math.max(0, Math.min(want, gap / 2));
			row.style.setProperty('--ldp-outset', (Math.round(out * 10) / 10) + 'px');
		});
	}
	var roomSoon = null;
	function roomLater() { clearTimeout(roomSoon); roomSoon = setTimeout(room, 120); }
	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', roomLater); else roomLater();
	window.addEventListener('load', roomLater);
	window.addEventListener('resize', roomLater);
	if (document.fonts && document.fonts.ready) document.fonts.ready.then(roomLater);
	/* A look brings its own faces and sizes, so the room is measured again. */
	new MutationObserver(roomLater).observe(root, { attributes: true, attributeFilter: ['data-chosen', 'data-look', 'data-face', 'data-ui-face', 'data-reading'] });
}());
