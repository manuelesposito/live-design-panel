/*
 * SPACE (Manuel, 2026-09-25, lab/the-space-of-a-page.html: "build it").
 *
 * One dial, five steps: Extra compact, Compact, Standard, Spacious, Extra
 * spacious. Standard is the theme's
 * own page and nothing is touched there. presets.js writes the step on the
 * root as `data-space`; this file does the rest, on Architrave and on any
 * other theme alike, because what it needs is read off the page itself.
 *
 * NOT EVERY GAP BY THE SAME AMOUNT. The first try scaled every gap alike and
 * a spacious page fell apart (Manuel: "some elements should stay close
 * together, while others get more air"). Space is what says which things
 * belong together, so each gap moves by what it separates:
 *
 *   BETWEEN SECTIONS   the full step, ×0.5 ×0.7 ×1.4 ×1.8: the bands a page is
 *                      stacked from, its header and footer.
 *   BETWEEN ITEMS      less, ×0.75 ×0.85 ×1.2 ×1.4: cards in a grid,
 *                      columns, the rows of a list.
 *   A HEADING          above like an item, below like a group, so it always
 *                      stays with its own text.
 *   INSIDE A GROUP     least, ×0.75 ×0.85 ×1.15 ×1.3: a heading and its text, a
 *                      badge and its words, the padding in a card or a
 *                      button. A button never gets shorter than 40px.
 *
 * The inside always moves least and the sections most, so the order of the
 * gaps never changes and a group can never come apart.
 *
 * WHOLE STEPS ON THE SCALE, A STYLE'S OWN TABLE (Manuel, 2026-10-05,
 * lab/the-space-of-the-six.html: "redo the sheet with the job tables", then
 * "go"). The amounts above were multipliers, and a style that set its own
 * rhythm on top of a step stacked two of them: "Spacious" came out tighter
 * than Standard, and sizes such as 27 or 41 fell between the theme's steps.
 * Now a gap moves by WHOLE STEPS along one scale (SCALE, the theme's
 * --space-* steps and on up), so every size it gets is one the theme has. A
 * style says its own size for four jobs (spaceInside 32, spaceItems 80,
 * spaceSections 64, spaceTitle 96 at rest: Architrave's own), and each gap of
 * a job moves by as many steps as its job moved. The Space dial moves all
 * four by one more step each (Compact one down, Extra spacious two up). Two
 * rules hold it together: ON A PHONE the three big jobs move half as many
 * steps, rounded up (the same character with less air; Focus's 256 between
 * two posts was too much on a phone), inside a group as on a desktop; and
 * NEVER PAST THE NEXT JOB: a gap inside a group that grows stops at the
 * style's room between sections, a bigger gap that shrinks stops at its room
 * inside a group. With no table and the dial at Standard nothing is touched.
 *
 * SORTED BY WHAT THE GAP DOES (the same day): three of Architrave's gaps were
 * taken for space inside a group. The gap between two posts is the padding
 * of the one box each post's item holds (an item's only child: its padding is
 * the gap between items); a gap of 64 or more counts as one between sections
 * (the end of an article: categories, the author box); and the padding above
 * the box that holds the page's title is the title's own room.
 *
 * NEVER TOUCHED: the reading text of an article (its paragraphs keep their
 * own rhythm; the designed sections inside a page do move), menus, the
 * panel and its button, the admin bar, and on Architrave the rail, since
 * only the paper is read.
 *
 * HOW. Every value is READ from the page as it stands at Standard (the old
 * inline values given back first, all reads before any write, so one
 * element's new margin never feeds another's measurement), then written back
 * inline, scaled. Read again whenever something that moves the page changes:
 * the step, the look, the faces, the sizes, the window.
 *
 * SPACE FOLLOWS THE TEXT (Manuel, 2026-09-25, the second pass: "when a reader
 * makes text bigger, the space should grow with it, or big text looks
 * crammed"). Measured first: on Twenty Twenty-Five, Neve and Ollie a heading
 * went from 47 to 71px at Huge while the gap under it stayed 30, and the
 * article's paragraphs kept their gaps too. Architrave's own article already
 * grows its gaps with the text (quire.reading.css), so this is for other
 * themes, where the reader's size is `--panel-step-body` (panel-page.css).
 * The same grouping holds: inside a group the gaps grow as much as the text,
 * between items three quarters of that, between sections half. In the
 * article, which the Space step never touches, the gaps between its blocks
 * grow with the text too, and only there. Not halved on a phone: big text
 * needs its room on a small screen as well.
 *
 * A HEADING BELONGS TO WHAT FOLLOWS IT (Manuel, 2026-09-25: "I want … the
 * floating headings"). A heading with no more room above it than below
 * floats between two parts and belongs to neither. Once the page is written,
 * every heading is measured, and one whose room above is less than 1.2 times
 * its room below is given 1.5 times: the room below stays the theme's. Also
 * in the article, where it is most often seen. Not in a card or a column,
 * whose title sits close on purpose, not under a small label (a kicker, a
 * date), and never at Standard, which stays the theme's own page.
 *
 * SOFT MOTION (the same evening: "I want that soft motion"). When the reader
 * moves the Space step, the page as it was dissolves into the page as it is,
 * half a second, while the panel stands still (`soft()`, called by presets.js
 * setLevel through `window.ArchitraveSpace`). Hundreds of gaps sliding at
 * their own pace looked restless on a long page, so the page crossfades
 * rather than slides. The first try dipped the page to 30 % and let it come
 * back: that first pale frame read as a flicker (Manuel: "still flickers a
 * little bit"), and a crossfade never has one. The text size takes its gaps in
 * the same frame as its text, without motion: its change is made in the
 * design system, where nothing can wrap it. Nothing moves for a reader who
 * asked for reduced motion, in a browser without the crossfade, or on a load
 * or a resize.
 */
(function () {
	var root = document.documentElement;
	var SKIP = '.reading-panel, .architrave-panel-opener, #wpadminbar, .wp-block-navigation, nav, .quire-menu, [class*="rail"], svg, script, style, template, br, img, video, iframe, canvas, picture, input, textarea, select';
	var READ = '.wp-block-post-content, .entry-content';
	var LAYOUT = '.alignfull, .alignwide, .wp-block-columns, .wp-block-cover, .wp-block-media-text, .wp-block-query, .is-layout-flex, .is-layout-grid, .has-background, [data-ldp-layout]';
	var PROPS = {
		paddingTop: 'padding-top', paddingBottom: 'padding-bottom', paddingLeft: 'padding-left', paddingRight: 'padding-right',
		marginTop: 'margin-top', marginBottom: 'margin-bottom', rowGap: 'row-gap', columnGap: 'column-gap', minHeight: 'min-height',
		groove: '--groove' 
	};
	var held = []; 
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
	function giveBack() {
		for (var i = held.length - 1; i >= 0; i--) {
			var h = held[i];
			if (h[2]) h[0].style.setProperty(h[1], h[2], h[3]); else h[0].style.removeProperty(h[1]);
		}
		held = [];
	}
	var SCALE = [2, 4, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128, 160, 192, 256];
	var DIAL = { xcompact: -2, compact: -1, spacious: 1, xspacious: 2 };
	var JOBS = { G: ['data-space-inside', 32], I: ['data-space-items', 80], S: ['data-space-sections', 64], A: ['data-space-title', 96] };
	function at(v) { var b = 0; for (var i = 1; i < SCALE.length; i++) if (Math.abs(SCALE[i] - v) < Math.abs(SCALE[b] - v)) b = i; return b; }
	function stepBy(v, n) {
		if (v < 3 || !n) return v;
		var top = SCALE[SCALE.length - 1], w = v > top ? v * Math.pow(top / SCALE[SCALE.length - 2], n) : SCALE[Math.max(0, Math.min(SCALE.length - 1, at(v) + n))];
		return n > 0 ? Math.max(v, w) : Math.min(v, w);
	}
	function half(n) { return n > 0 ? Math.ceil(n / 2) : -Math.ceil(-n / 2); }
	function planOf(vw) {
		var d = DIAL[root.getAttribute('data-space')] || 0, n = {}, size = {}, any = false;
		Object.keys(JOBS).forEach(function (k) {
			var own = parseFloat(root.getAttribute(JOBS[k][0])) || JOBS[k][1], i = Math.max(0, Math.min(SCALE.length - 1, at(own) + d));
			n[k] = i - at(JOBS[k][1]);
			if (vw <= 720 && k !== 'G') n[k] = half(n[k]);
			size[k] = SCALE[i];
			if (n[k]) any = true;
		});
		return any ? { n: n, size: size } : null;
	}
	function textOf() { return parseFloat(window.getComputedStyle(root).getPropertyValue('--panel-step-body')) || 1; }
	function px(v) { return parseFloat(v) || 0; }
	function tall(e, n) { return e && e.getBoundingClientRect().height >= n; }
	function heading(e) { return !!e && /^H[1-6]$/.test(e.tagName); }
	function reading(e) {
		var box = e.closest(READ);
		if (!box || e === box) return false;
		for (var a = e; a && a !== box; a = a.parentElement) if (a.matches(LAYOUT)) return false;
		return true;
	}
	function run() {
		still(function () {
			runNow();
			document.dispatchEvent(new Event('architrave-space-written')); 
		});
	}
	function runNow() {
		document.dispatchEvent(new Event('architrave-space-reading')); 
		giveBack();
		var T = textOf(), P = planOf(root.clientWidth);
		if (!P && Math.abs(T - 1) < 0.01) return;
		var paper = document.querySelector('.content-column') || document.body; 
		var W = paper.getBoundingClientRect().width || root.clientWidth;
		var TF = { S: 1 + (T - 1) * 0.5, I: 1 + (T - 1) * 0.75, G: T, A: 1 + (T - 1) * 0.5, T: T };
		var titleBox = null, h1 = Array.prototype.find.call(paper.querySelectorAll('h1'), function (h) { var b = h.getBoundingClientRect(); return b.width > 2 && b.height > 2 && !h.closest(SKIP); });
		for (var tb = h1 && h1.parentElement; tb && tb !== root; tb = tb.parentElement) if (px(window.getComputedStyle(tb).paddingTop) >= 32) { titleBox = tb; break; }
		var jobs = [], done = new Map();
		function job(e, n, v, k) {
			var own = done.get(e);
			if (!own) done.set(e, own = {});
			if (own[n]) return;
			own[n] = true;
			if (k === 'G' && v >= 64) k = 'S';
			if (k && k !== 'T' && n === 'paddingTop' && e === titleBox) k = 'A';
			var w = v;
			if (k && k !== 'T' && P && n !== 'minHeight') {
				w = stepBy(v, P.n[k]);
				if (k === 'G' && w > v) w = Math.max(v, Math.min(w, P.size.S));
				if (k !== 'G' && w < v && v > P.size.G) w = Math.max(w, P.size.G);
			}
			if (k) w *= TF[k];
			jobs.push([e, n, Math.round(w * 10) / 10]);
		}
		var all = paper.querySelectorAll('*'), list = [], text = [];
		for (var i = 0; i < all.length; i++) {
			var e = all[i], inText;
			try { if (e.closest(SKIP)) continue; inText = reading(e); } catch (x) { continue; }
			if (inText && T === 1) continue;
			var g = window.getComputedStyle(e);
			if (g.display === 'inline' || g.display === 'none' || g.display === 'contents' || g.position === 'fixed') continue;
			var r = e.getBoundingClientRect();
			if (!r.width || !r.height) continue;
			(inText ? text : list).push([e, g, r]);
		}
		text.forEach(function (x) {
			var e = x[0], g = x[1];
			if (e.previousElementSibling && px(g.marginTop) >= 4) job(e, 'marginTop', px(g.marginTop), 'T');
			if (e.nextElementSibling && px(g.marginBottom) >= 4) job(e, 'marginBottom', px(g.marginBottom), 'T');
		});
		var itemOf = new Set();
		list.forEach(function (x) {
			var e = x[0], g = x[1], kids;
			if (/flex|grid/.test(g.display)) {
				kids = Array.prototype.filter.call(e.children, function (k) { return k.getBoundingClientRect().height; });
				var tops = kids.map(function (k) { return Math.round(k.getBoundingClientRect().top); });
				var sideBySide = tops.some(function (t, n) { return n > 0 && Math.abs(t - tops[0]) < 2; });
				if (kids.length >= 2 && sideBySide && kids.every(function (k) { return tall(k, 60) && !heading(k); })) {
					['rowGap', 'columnGap'].forEach(function (n) { if (px(g[n]) >= 8) job(e, n, px(g[n]), 'I'); });
					kids.forEach(function (k) { itemOf.add(k); });
				}
			}
			if (/^(UL|OL)$/.test(e.tagName) || e.classList.contains('wp-block-post-template')) {
				kids = Array.prototype.filter.call(e.children, function (k) { return k.getBoundingClientRect().height; });
				if (kids.length >= 3 && kids.every(function (k) { return tall(k, 28); })) kids.forEach(function (k) {
					itemOf.add(k);
					var kg = window.getComputedStyle(k);
					['paddingTop', 'paddingBottom'].forEach(function (n) { if (px(kg[n]) >= 2) job(k, n, px(kg[n]), 'I'); });
					if (px(kg.minHeight) >= 24) job(k, 'minHeight', px(kg.minHeight), 'I');
					if (k.previousElementSibling && px(kg.marginTop) >= 2) job(k, 'marginTop', px(kg.marginTop), 'I');
					var one = k.children.length === 1 ? k.firstElementChild : null, og = one && window.getComputedStyle(one);
					if (og && og.backgroundColor === 'rgba(0, 0, 0, 0)' && og.display !== 'inline' && !one.closest(SKIP) && !frame(og, one.getBoundingClientRect())) ['paddingTop', 'paddingBottom'].forEach(function (n) { if (px(og[n]) >= 16) job(one, n, px(og[n]), 'I'); });
				});
			}
		});
		function inItem(e) { for (var a = e; a && a !== paper; a = a.parentElement) if (itemOf.has(a)) return true; return false; }
		list.forEach(function (x) {
			var e = x[0], g = x[1], r = x[2], prev = e.previousElementSibling, next = e.nextElementSibling;
			var wide = r.width >= W * 0.9 - 40 && r.height >= 120;
			var band = !inItem(e) && (wide || e.matches('header, footer, .wp-block-template-part'));
			if (band && !frame(g, r)) ['paddingTop', 'paddingBottom'].forEach(function (n) { if (px(g[n]) >= 16) job(e, n, px(g[n]), 'S'); });
			var big = !inItem(e) && r.height >= 160 && e.parentElement && r.width >= e.parentElement.getBoundingClientRect().width * 0.9;
			if ((wide || big) && prev && !heading(prev) && tall(prev, 60) && px(g.marginTop) >= 16) { job(e, 'marginTop', px(g.marginTop), 'S'); job(prev, 'marginBottom', px(window.getComputedStyle(prev).marginBottom), 'S'); }
			if ((wide || big) && next && !heading(e) && tall(next, 60) && px(g.marginBottom) >= 16) { job(e, 'marginBottom', px(g.marginBottom), 'S'); job(next, 'marginTop', px(window.getComputedStyle(next).marginTop), 'S'); }
			if (heading(e) && prev && tall(prev, 60) && e.parentElement.getBoundingClientRect().width >= W * 0.55 && px(g.marginTop) >= 8) job(e, 'marginTop', px(g.marginTop), 'I');
		});
		
		function frame(g, r) { return r.height - px(g.paddingTop) - px(g.paddingBottom) - px(g.borderTopWidth) - px(g.borderBottomWidth) < 1; }
		list.forEach(function (x) {
			var e = x[0], g = x[1], r = x[2];
			var band = r.width >= W * 0.9 - 40, ratio = frame(g, r);
			if (g.getPropertyValue('--groove').trim()) {
				var gv = px(g.paddingTop);
				if (gv >= 2) job(e, 'groove', gv, 'G');
				return;
			}
			['paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight', 'marginTop', 'marginBottom', 'rowGap', 'columnGap'].forEach(function (n) {
				if (band && /padding(Left|Right)/.test(n)) return;
				if (ratio && /padding(Top|Bottom)/.test(n)) return;
				if (n === 'marginTop' && !e.previousElementSibling) return;
				if (n === 'marginBottom' && !e.nextElementSibling) return;
				var v = px(g[n]);
				if (v >= 4) job(e, n, v, 'G');
			});
			if (P && P.n.G < 0 && e.matches('.wp-block-button__link, .wp-element-button, button, input[type="submit"]')) job(e, 'minHeight', Math.min(40, r.height)); 
		});
		for (var j = 0; j < jobs.length; j++) put(jobs[j][0], PROPS[jobs[j][1]], jobs[j][2]);
		mend(paper, inItem);
	}
	function put(el, name, v) {
		held.push([el, name, el.style.getPropertyValue(name), el.style.getPropertyPriority(name)]);
		el.style.setProperty(name, (Math.round(v * 10) / 10) + 'px', 'important');
	}
	
	function mend(paper, inItem) {
		var hs = Array.prototype.filter.call(paper.querySelectorAll('h1, h2, h3, h4, h5, h6'), function (h) {
			try { return !h.closest(SKIP) && !inItem(h); } catch (x) { return false; }
		});
		var todo = [];
		hs.forEach(function (h) {
			var prev = h.previousElementSibling, next = h.nextElementSibling;
			if (!prev || !next || heading(prev) || heading(next)) return;
			var r = h.getBoundingClientRect(), a = prev.getBoundingClientRect(), b = next.getBoundingClientRect();
			if (!r.height || a.height < 40 || !b.height) return;
			var above = r.top - a.bottom, below = b.top - r.bottom;
			if (below < 4 || above >= below * 1.2) return;
			todo.push([h, above, below * 1.5, px(window.getComputedStyle(h).marginTop)]);
		});
		todo.forEach(function (t) { put(t[0], 'margin-top', t[3] + (t[2] - t[1])); });
		var short = todo.filter(function (t) {
			var prev = t[0].previousElementSibling;
			return t[0].getBoundingClientRect().top - prev.getBoundingClientRect().bottom < t[2] - 1;
		});
		short.forEach(function (t) { put(t[0], 'margin-top', t[2]); });
	}
	var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
	var crossing = false;
	function soft(change) {
		if ((reduced && reduced.matches) || document.hidden || !document.startViewTransition) { change(); return; }
		if (!document.getElementById('ldp-space-motion')) {
			var st = document.createElement('style');
			st.id = 'ldp-space-motion';
			st.textContent = 'html[data-ldp-crossing]::view-transition-old(root),html[data-ldp-crossing]::view-transition-new(root){animation-duration:.5s;animation-timing-function:ease}' +
				'html[data-ldp-crossing] .reading-panel{view-transition-name:ldp-panel}' +
				'html[data-ldp-crossing]::view-transition-group(ldp-panel),html[data-ldp-crossing]::view-transition-new(ldp-panel){animation:none}' +
				'html[data-ldp-crossing]::view-transition-old(ldp-panel){display:none}';
			document.head.appendChild(st);
		}
		root.setAttribute('data-ldp-crossing', '');
		crossing = true;
		var t = document.startViewTransition(function () { change(); run(); });
		t.finished.then(done, done);
		[t.ready, t.updateCallbackDone].forEach(function (p) { if (p && p.catch) p.catch(function () {}); }); 
		function done() { if (t === last) { crossing = false; root.removeAttribute('data-ldp-crossing'); } }
		last = t;
	}
	var last = null;
	window.ArchitraveSpace = { soft: soft };
	var soon = null;
	function later() { clearTimeout(soon); soon = setTimeout(run, 200); }
	function wake() { if (root.hasAttribute('data-space') || root.hasAttribute('data-space-inside') || root.hasAttribute('data-space-items') || root.hasAttribute('data-space-sections') || root.hasAttribute('data-space-title') || held.length || Math.abs(textOf() - 1) >= 0.01) later(); }
	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wake); else wake();
	window.addEventListener('load', wake);
	window.addEventListener('resize', wake);
	if (document.fonts && document.fonts.ready) document.fonts.ready.then(wake);
	document.addEventListener('architrave-guest-badges', wake);
	var frame = 0;
	function now() {
		clearTimeout(soon); cancelAnimationFrame(frame);
		if (crossing) return; 
		frame = requestAnimationFrame(run);
	}
	new MutationObserver(function (list) {
		var reader = list.some(function (m) { return /^data-space/.test(m.attributeName) || m.attributeName === 'data-reading'; });
		if (reader && (root.hasAttribute('data-space') || root.hasAttribute('data-space-inside') || root.hasAttribute('data-space-items') || root.hasAttribute('data-space-sections') || root.hasAttribute('data-space-title') || held.length || Math.abs(textOf() - 1) >= 0.01)) now(); else wake();
	}).observe(root, { attributes: true, attributeFilter: ['data-space', 'data-space-inside', 'data-space-items', 'data-space-sections', 'data-space-title', 'data-chosen', 'data-look', 'data-face', 'data-ui-face', 'data-reading', 'data-leading', 'data-measure', 'data-rounded', 'data-corners', 'data-categories', 'data-widepicture'] });
}());
