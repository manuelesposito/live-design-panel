/*
 * TEXT THAT CAN STILL BE READ (2026-09-24, ten themes).
 *
 * A look turns the theme's palette with it: every colour the theme gave a name
 * to is placed on the look's paper (panel.php, THE THEME'S OWN OTHER SIDE and
 * the palette placement). A colour the author typed by hand has no name, and
 * nothing can place it. Variations writes its site title in #041d55 and its
 * menu in #03081e, straight into the blocks; on Book's dark paper, or on the
 * dark side the panel makes for Original, both stood at 1.1 : 1, which is not
 * text any more.
 *
 * So once the page wears colours that are not the theme's own, each piece of
 * text is read against the ground it actually stands on, and a piece that falls
 * below 3 : 1 takes the page's own text colour, or its paper where the paper
 * reads better on that ground. Nothing else is touched: a colour that still
 * reads keeps its hue, and on the theme's own look, on its own side, nothing
 * runs at all, so a theme's pale caption stays the author's choice.
 *
 * The theme's own inline colour is kept and given back when the page returns.
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
	var SKIP = '.reading-panel, .reading-panel *, .reading-panel-scrim, .architrave-panel-opener, .architrave-panel-opener *, .live-design-menu-item, #wpadminbar, #wpadminbar *, script, style, noscript, template, svg *';
	var marked = [];

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
		if (/color\(srgb/.test(c)) { v = [v[0] * 255, v[1] * 255, v[2] * 255, v.length > 3 ? v[3] : 1]; }
		return [v[0], v[1], v[2], v.length > 3 ? v[3] : 1];
	}
	function over(top, bottom) { var a = top[3]; return [top[0] * a + bottom[0] * (1 - a), top[1] * a + bottom[1] * (1 - a), top[2] * a + bottom[2] * (1 - a), 1]; }
	function lum(c) { var f = function (x) { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); }
	function ratio(a, b) { var x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
	/* The ground a piece stands on, or null over a picture, where no colour can be judged. */
	/* A COVER's picture is an <img> or <video> under its text, not a background, and
	   its tint is a layer beside the text, not behind it in the tree. While the
	   picture shows, no colour can be judged. When a look hides pictures (Book
	   does), the text stands on the cover's tint over the page, and is judged there:
	   Variations' hero title, written dark for a pale photograph, stood on Book's
	   dark paper. */
	function shows(m) { if (!m) return false; var r = m.getBoundingClientRect(), cs = window.getComputedStyle(m); return r.width > 0 && r.height > 0 && cs.display !== 'none' && cs.visibility !== 'hidden' && +cs.opacity > 0.05; }
	/* A GRADIENT IS A TEXTURE, NOT A PHOTOGRAPH (Manuel, 2026-09-25, TT5 Clean under
	   Catalogue, dark: "why?" — white words on the theme's yellow band). Catalogue
	   draws its dot grid as a radial-gradient on the body, ground() answered null
	   for the page's own paper, and THE WHOLE PASS RETURNED: no band turned, no
	   colour fixed, anywhere, on every look that draws the dots. Only a url()
	   image is a picture no colour can be judged on — the same line pictureOf
	   draws below. A gradient rides the solid colour underneath, which is what
	   the ground is. */
	function picture(bi) { return !!bi && bi !== 'none' && /url\(/.test(bi); }
	function ground(el) {
		var cover = el.closest('.wp-block-cover');
		/* A BUTTON IN A COVER STANDS ON ITS OWN GROUND (2026-09-24, Neve FSE under
		   Instrument, dark: "Learn More" was judged against the section behind it
		   and given the paper, dark on its dark button). Whatever lies between the
		   text and the cover is read first; the cover only matters when nothing
		   there is solid. */
		if (cover && cover !== el) {
			var near = [];
			for (var n = el; n && n !== cover; n = n.parentElement) {
				var nc = window.getComputedStyle(n);
				if (picture(nc.backgroundImage)) return null;
				var nb = rgba(nc.backgroundColor);
				if (nb && nb[3] > 0) { near.push(nb); if (nb[3] >= 1) break; }
			}
			if (near.length && near[near.length - 1][3] >= 1) {
				var solid = [255, 255, 255, 1];
				for (var j = near.length - 1; j >= 0; j--) solid = over(near[j], solid);
				return solid;
			}
		}
		if (cover && cover !== el) {
			if (shows(cover.querySelector(':scope > img, :scope > video, :scope > picture, :scope > .wp-block-cover__image-background, :scope > .wp-block-cover__video-background')) || window.getComputedStyle(cover).backgroundImage !== 'none') return null;
			var under = ground(cover);
			var tint = cover.querySelector(':scope > .wp-block-cover__background');
			if (!under || !tint) return under;
			var t = rgba(window.getComputedStyle(tint).backgroundColor);
			if (t) { t[3] *= +window.getComputedStyle(tint).opacity; under = over(t, under); }
			return under;
		}
		var stack = [];
		for (var e = el; e; e = e.parentElement) {
			var cs = window.getComputedStyle(e);
			if (picture(cs.backgroundImage)) return null;
			var c = rgba(cs.backgroundColor);
			if (c && c[3] > 0) { stack.push(c); if (c[3] >= 1) break; }
		}
		var g = [255, 255, 255, 1];
		for (var i = stack.length - 1; i >= 0; i--) g = over(stack[i], g);
		return g;
	}
	function wearsOwn() {
		if (root.hasAttribute('data-chosen') || root.hasAttribute('data-colours')) return false;
		var own = window.architravePanelHostSide;
		var side = /-dark$/.test(root.getAttribute('data-theme') || '') ? 'dark' : 'light';
		return !own || side === own;
	}
	var held = [], turned = [];
	/* A SECTION ON THE OTHER SIDE IS A SMALL PAGE OF THAT SIDE (Manuel, 2026-09-25,
	   Neve FSE under Catalogue at night: its footer is a light band, and the search
	   field and button in it were drawn for the dark page, a dark box on light
	   paper). A wide section whose ground stands on the other side from the page
	   is given the other side's colours, the way the panel draws a patch of
	   another room for its previews: the look's own values for the other side
	   are written on it, so its fields, buttons, links and dropdowns take the
	   values that belong on that ground, the look's accent included. */
	var TOKENS = ['--surface-base', '--surface-canvas', '--surface-raised', '--surface-floating', '--surface-hover', '--surface-selected', '--surface-pressed', '--text-primary', '--text-secondary', '--text-muted', '--border-control', '--border-default', '--line', '--accent', '--accent-contrast', '--accent-writing', '--reading-link-ink', '--focus'];
	function otherSide() {
		/* The look's own values for the other side, read with the side switched
		   for the reading and switched back before anything is painted. */
		var was = root.getAttribute('data-theme'), room = was || 'neutral-light';
		var other = /-dark$/.test(room) ? room.replace(/-dark$/, '-light') : room.replace(/-light$/, '') + '-dark';
		root.setAttribute('data-theme', other);
		var cs = window.getComputedStyle(root), out = {};
		TOKENS.forEach(function (t) { var v = cs.getPropertyValue(t).trim(); if (v) out[t] = v; });
		if (was === null) root.removeAttribute('data-theme'); else root.setAttribute('data-theme', was);
		return out;
	}
	function turnBands(paper) {
		var pageLum = lum(paper), vw = window.innerWidth, values = null;
		var list = document.querySelectorAll('.wp-site-blocks > *, .wp-site-blocks > * > *, main > *, main > * > *');
		for (var i = 0; i < list.length; i++) {
			var el = list[i];
			if (el.matches(SKIP) || el.closest('.wp-block-cover') || (el.parentElement && el.parentElement.closest('[data-ldp-turned]'))) continue;
			var r = el.getBoundingClientRect();
			if (r.width < vw * 0.6 || r.height < 60) continue;
			var c = rgba(window.getComputedStyle(el).backgroundColor);
			if (!c || c[3] < 0.9 || Math.abs(lum(c) - pageLum) < 0.4) continue;
			values = values || otherSide();
			var was = {};
			Object.keys(values).forEach(function (t) { was[t] = el.style.getPropertyValue(t); el.style.setProperty(t, values[t]); });
			el.setAttribute('data-ldp-turned', '');
			turned.push([el, was]);
		}
	}
	function giveBack() {
		turned.forEach(function (t) { t[0].removeAttribute('data-ldp-turned'); Object.keys(t[1]).forEach(function (k) { if (t[1][k]) t[0].style.setProperty(k, t[1][k]); else t[0].style.removeProperty(k); }); });
		turned = [];
		held.forEach(function (h) {
			h[0].removeAttribute('data-ldp-ink');
			Object.keys(h[1]).forEach(function (prop) { if (h[1][prop][0]) h[0].style.setProperty(prop, h[1][prop][0], h[1][prop][1]); else h[0].style.removeProperty(prop); });
		});
		held = [];
		marked.forEach(function (m) {
			m[0].removeAttribute('data-ldp-ink');
			if (m[1]) m[0].style.setProperty('color', m[1], m[2]); else m[0].style.removeProperty('color');
		});
		marked = [];
		inked.forEach(function (i) {
			if (i[1]) i[0].style.setProperty('--ldp-photo-ink', i[1]); else i[0].style.removeProperty('--ldp-photo-ink');
			if (i[2]) i[0].style.setProperty('--ldp-photo-ink-on', i[2]); else i[0].style.removeProperty('--ldp-photo-ink-on');
		});
		inked = [];
	}
	var inked = [];
	function lightInk(c) { return (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255 > 0.55; }
	/* A piece of text: an element with words of its own, or a link or button drawn as an icon. */
	function speaks(el) {
		for (var n = el.firstChild; n; n = n.nextSibling) if (n.nodeType === 3 && /\S/.test(n.nodeValue)) return true;
		return /^(A|BUTTON)$/.test(el.tagName) && !!el.querySelector('svg');
	}
	/* TEXT ON A PICTURE KEEPS THE THEME'S OWN COLOUR (2026-09-24, Neve FSE under
	   Classic, dark: its hero title stands on a pale photograph as a background,
	   followed the page's ink to light grey, and vanished). A colour on a picture
	   cannot be judged here, but the theme chose one that works on it. So on the
	   theme's own look, before any look is painted, every piece of text standing
	   on a picture has its colour read and kept; while the page wears other
	   colours and the picture still shows, that colour is given back. */
	var onPicture = [];
	var BUTTON = '.wp-block-button__link, .wp-element-button';
	function pictureOf(el) {
		for (var e = el; e && e !== document.body; e = e.parentElement) {
			if (e.classList.contains('wp-block-cover')) return e;
			var bi = window.getComputedStyle(e).backgroundImage;
			if (bi && bi !== 'none' && !/gradient/.test(bi)) return e;
		}
		return null;
	}
	function pictureShows(p) {
		if (p.classList.contains('wp-block-cover') && window.getComputedStyle(p).backgroundImage === 'none') return shows(p.querySelector(':scope > img, :scope > video, :scope > picture, :scope > .wp-block-cover__image-background, :scope > .wp-block-cover__video-background'));
		var bi = window.getComputedStyle(p).backgroundImage;
		return !!bi && bi !== 'none';
	}
	function readPictures() { still(readPicturesNow); }
	function readPicturesNow() {
		if (!document.body) return;
		var lifted = {};
		['data-chosen', 'data-colours', 'data-theme'].forEach(function (a) { if (root.hasAttribute(a)) { lifted[a] = root.getAttribute(a); root.removeAttribute(a); } });
		var own = window.architravePanelHostSide;
		if (own === 'dark') root.setAttribute('data-theme', 'neutral-dark'); /* a dark theme's own side is named on the root */
		var all = document.body.querySelectorAll('*');
		for (var i = 0; i < all.length; i++) {
			var el = all[i];
			if (el.matches(SKIP) || !speaks(el)) continue;
			if (el.matches(BUTTON)) continue; /* a button's word follows the button the look paints (Manuel, 2026-09-25: the theme's blue coming back a second later was wrong) */
			var p = pictureOf(el);
			if (p) onPicture.push([el, p, window.getComputedStyle(el).color]);
		}
		root.removeAttribute('data-theme');
		Object.keys(lifted).forEach(function (a) { root.setAttribute(a, lifted[a]); });
	}
	function run() { still(runNow); }
	function runNow() {
		giveBack();
		if (wearsOwn() || !document.body) return;
		onPicture.forEach(function (k) {
			if (!pictureShows(k[1])) return;
			/* A WORD ON ITS OWN GROUND FOLLOWS THAT GROUND, not the picture behind it
			   (2026-09-24, Neve FSE under Blueprint, dark: "Contact us" kept the
			   theme's black on the dark button the look had filled it with). Only
			   what stands on the picture itself, a heading or an outlined button,
			   keeps the theme's colour. */
			for (var n = k[0]; n && n !== k[1]; n = n.parentElement) { var nb = rgba(window.getComputedStyle(n).backgroundColor); if (nb && nb[3] > 0.5) return; }
			/* THE WORDS ON A PICTURE GO THROUGH THE SAME TABLE AS THE BANDS (Manuel,
			   2026-09-25, option C: "before we also used the yellow but now not
			   anymore"). The theme's yellow was a pastel band further down the page
			   and the words on the photograph at once; the band turned into the
			   look's tint and the words kept the yellow, so one page told two
			   colour stories. Now the words take the look's translation of their
			   colour too, as long as it stands on the same side as the theme's
			   (light words stay light on a dark photograph, dark stay dark): the
			   theme chose that side for the photograph, and a translation that
			   crosses it would not read there. Only then is the theme's colour
			   kept, as before. */
			var now = rgba(window.getComputedStyle(k[0]).color), was = rgba(k[2]);
			var keep = !(now && was && lightInk(now) === lightInk(was));
			if (keep) {
				marked.push([k[0], k[0].style.getPropertyValue('color'), k[0].style.getPropertyPriority('color')]);
				k[0].setAttribute('data-ldp-ink', '');
				k[0].style.setProperty('color', k[2], 'important');
			}
			/* And the button on that picture is filled with the colour its words
			   now wear (guest-buttons.js, THE PHOTOGRAPH'S OWN INK). */
			var ink = keep ? was : now;
			if (ink && !k[1].style.getPropertyValue('--ldp-photo-ink')) {
				inked.push([k[1], k[1].style.getPropertyValue('--ldp-photo-ink'), k[1].style.getPropertyValue('--ldp-photo-ink-on')]);
				k[1].style.setProperty('--ldp-photo-ink', 'rgb(' + Math.round(ink[0]) + ', ' + Math.round(ink[1]) + ', ' + Math.round(ink[2]) + ')');
				k[1].style.setProperty('--ldp-photo-ink-on', lightInk(ink) ? '#111' : '#fff');
			}
		});
		/* AN ICON ON A COLOURED DISC IS WRITTEN LIKE A BUTTON'S WORD (2026-09-25,
		   Manuel on Neve FSE under Instrument: "the yellow buttons have dark text
		   so the yellow circles should have a dark icon"). A drawing (an SVG
		   picture) standing on a small fill of its own, a disc or a badge, takes the
		   colour a button's word takes on that fill: dark on a light fill, light on
		   a dark one. A drawing on the page itself is left as it is. */
		var icons = document.body.querySelectorAll('img[src$=".svg"], img[src*=".svg?"]');
		for (var q = 0; q < icons.length; q++) {
			var ic = icons[q];
			if (ic.matches(SKIP)) continue;
			var ir = ic.getBoundingClientRect();
			if (!ir.width || ir.width > 160) continue;
			for (var d = ic.parentElement, hops = 0; d && d !== document.body && hops < 4; d = d.parentElement, hops++) {
				var db = rgba(window.getComputedStyle(d).backgroundColor);
				if (!db || db[3] < 0.5) continue;
				if (d.getBoundingClientRect().width > ir.width * 3) break; /* the fill is a section, not the icon's own disc */
				var light = lum(db) > 0.4;
				held.push([ic, { filter: [ic.style.getPropertyValue('filter'), ic.style.getPropertyPriority('filter')] }]);
				ic.setAttribute('data-ldp-ink', '');
				ic.style.setProperty('filter', light ? 'brightness(0)' : 'brightness(0) invert(1)', 'important');
				break;
			}
		}
		var bodyCs = window.getComputedStyle(document.body);
		var ink = rgba(bodyCs.color), paper = ground(document.body);
		if (!ink || !paper) return;
		turnBands(paper);
		var all = document.body.querySelectorAll('*');
		for (var i = 0; i < all.length; i++) {
			var el = all[i];
			if (el.matches(SKIP) || el.hasAttribute('data-ldp-ink') || !speaks(el)) continue;
			var r = el.getBoundingClientRect();
			if (!r.width || !r.height) continue;
			var cs = window.getComputedStyle(el);
			if (cs.visibility === 'hidden' || +cs.opacity === 0) continue;
			var g = ground(el), fg = rgba(cs.color);
			if (!g || !fg) continue;
			if (ratio(over(fg, g), g) >= 3) continue;
			var to = ratio(ink, g) >= ratio(paper, g) ? bodyCs.color : 'rgb(' + paper.slice(0, 3).map(Math.round).join(',') + ')';
			marked.push([el, el.style.getPropertyValue('color'), el.style.getPropertyPriority('color')]);
			el.setAttribute('data-ldp-ink', '');
			el.style.setProperty('color', to, 'important');
		}
	}
	/* After the look has settled: a look fades its colours in, and a reading taken
	   mid-fade judges a colour the page is only passing through. */
	var timer = 0;
	/* AS SOON AS THE COLOURS HAVE LANDED (Manuel, 2026-09-25: the fixes came half
	   a second late, so the wrong colour showed first). Not sooner: judged while a
	   look's colours are still fading, text passing through a grey was taken for
	   unreadable and marked, then unmarked a moment later (measured on Bluehost:
	   thirteen pieces for a quarter of a second). So on the next frame the fades
	   still running are awaited, and the pass runs the moment the last one ends;
	   with nothing fading, it runs at once. */
	var frame = 0, wave = 0;
	function landed() {
		if (!document.getAnimations) return Promise.resolve();
		var fading = document.getAnimations().filter(function (a) { return a.playState === 'running' && /color|background|border/.test(a.transitionProperty || ''); });
		return Promise.all(fading.map(function (a) { return a.finished.catch(function () {}); }));
	}
	function soon() {
		cancelAnimationFrame(frame); clearTimeout(timer);
		var mine = ++wave;
		frame = requestAnimationFrame(function () { landed().then(function () { if (mine === wave) run(); }); });
		timer = setTimeout(function () { if (mine === wave) run(); }, 700); /* a fade that never reports */
	}
	/* Only a change that stays wakes this file: the side it switches for a reading,
	   and switches back at once, is not one. */
	function sig() { return ['data-theme', 'data-chosen', 'data-colours', 'data-style', 'style'].map(function (a) { return root.getAttribute(a); }).join('|'); }
	var seen = '';
	new MutationObserver(function () {
		var now = sig();
		if (now === seen) return;
		seen = now;
		giveBack(); /* the last look's fixes go at once; the new look's come when its colours have landed */
		soon();
	}).observe(root, { attributes: true, attributeFilter: ['data-theme', 'data-chosen', 'data-colours', 'data-style', 'style'] });
	function start() { readPictures(); seen = sig(); soon(); }
	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
}());
