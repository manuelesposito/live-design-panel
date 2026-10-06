/**
 * Architrave — the reading panel, the READER'S small panel.
 *
 * One Aa button, and under it what a reader can set: the text size, Light,
 * Dark or System, the styles the owner offers them, and, where the owner
 * allows it, Copy style. Apple Books' "Themes & Settings" anatomy, decided on
 * lab/the-reading-panel.html (2026-09-09, Manuel: "do it the Apple way").
 *
 * ONE PAGE ONLY (2026-10-03). This was the owner's whole design panel, with
 * Customise and a dozen pages under it. Since 2026-09-28 the owner always gets
 * the new window (plugin/window.php, plugin/assets/js/panel-window.js), so what
 * stood behind the first page could no longer be reached and was cut; it lives
 * in git history (before 0.24.x). What is left is the first page, which is what
 * a reader always had (Manuel, 2026-09-23: "no, small only"). The new window
 * also has a readers' page and takes the door's press where it is mounted; this
 * panel is what answers the press where it is not.
 *
 * IT PRESSES THE ROWS THAT ALREADY EXIST. Every dial has its own script,
 * storage, attribute and marks (reading-scale.js, color-mode.js, presets.js),
 * and their rows stand in the More menu's flyouts whether the flyouts are
 * shown or not. This panel is a second face on the same controls: a press
 * here clicks the row a reader would have clicked there, and what the panel
 * SHOWS is read back from <html>, never from its own memory. So nothing is
 * stored twice and nothing can disagree.
 *
 * DESKTOP: a popover beside its door. PHONE: a sheet from the foot over a
 * scrim. The same markup, two placements.
 */
(function () {
	var root = document.documentElement;
	var Modes = window.QuireModes, Reading = window.QuireReading, Icons = window.QuireIcons, Styles = window.ArchitraveStyles;
	var WORDS = window.architraveWords || {};
	function t(word) { return WORDS[word] || word; }
	function icon(name, attrs) { return Icons && Icons.markup ? Icons.markup(name, attrs || '') : ''; }
	if (!Styles || !Reading) return;

	var linkCopied = false; /* a style is a link (2026-09-18) */
	var inputMode = 'pointer'; /* 'pointer' | 'keyboard': what the sheet last heard; the focus ring is the keyboard's alone (Manuel, 2026-09-13) */
	// Light, Dark, System, in that order (Manuel, 2026-09-09), the check at the
	// end of the row as in every menu of the site.
	// The glyphs are Apple Books' (QDS 0.70.0, DS-364): a sun over the horizon,
	// a moon with a star, a half-filled circle for the automatic side.
	var SIDES = [{ id: 'light', label: 'Light', icon: 'haze' }, { id: 'dark', label: 'Dark', icon: 'moon-star' }, { id: 'auto', label: 'System', icon: 'contrast' }];
	var PALETTE = '[data-quire-modes="palette"] ';

	/* A PRESS IS NOT A CLICK OUTSIDE. `row.click()` fires a real click event on
	   the More menu's hidden row, which bubbles to the document and reaches
	   the listener below, whose first rule is "a click outside the panel
	   closes it". So every press closed the panel it came from (found live,
	   2026-09-09: the tiles worked once and nothing after them did). The flag
	   marks the synthetic click as ours. */
	var pressing = false;
	/* A PRESS ON THE STEPPER SHOWS ITS DOTS (2026-09-13): the panel wears
	   is-stepping for two seconds after the last press. */
	function stepped() {
		panel.classList.add('is-stepping');
		if (dotsTimer) clearTimeout(dotsTimer);
		dotsTimer = setTimeout(function () { panel.classList.remove('is-stepping'); }, 2000);
	}
	function press(selector) {
		var row = document.querySelector(selector);
		if (!row) return;
		pressing = true;
		try { row.click(); } finally { pressing = false; }
	}

	// What the page says, dial by dial.
	function now() {
		var sideBtn = document.querySelector(PALETTE + '[data-side][aria-pressed="true"]');
		var mode = root.getAttribute('data-theme') || (Modes ? Modes.default : 'neutral-light');
		return {
			/* TWO TILES WEAR NO ATTRIBUTE (0.9.0). Standard is the absence of
			   `data-style`, and so is the theme's own look on a guest, so the
			   attribute alone can no longer say which tile is on. Styles knows,
			   and on Architrave it says exactly what the attribute said. */
			style: (Styles.current ? Styles.current() : null) || root.getAttribute('data-style') || 'standard',
			side: sideBtn ? sideBtn.getAttribute('data-side') : 'auto',
			resolvedSide: String(mode).split('-')[1] || 'light',
			reading: root.getAttribute(Reading.attribute) || 'default'
		};
	}

	/* level: the reader's panel has one page; the phone's sheet still asks which (sheet.open, sheet.drawn). */
	var panel, scrim, level = 1, trigger = null, dotsTimer = null;

	/* THE THEME'S FACE, AS AN ATTRIBUTE CAN CARRY IT (2026-09-24, Manuel: the Original
	   tile showed Classic's colours). A measured font-family names its faces in
	   double quotes ("Inter", sans-serif, as Ollie's does), and written as it was
	   into style="…" the first quote ended the attribute: the tile lost its paper,
	   its ink and its face, and stood in the palette's own grey, which is
	   Classic's. The quotes go in as the entity, which the attribute gives back. */
	function faceAttr(f) { return String(f).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }
	function lumOf(hex) {
		var c = String(hex || '').replace('#', '');
		if (c.length !== 6) return 0.5;
		var v = [0, 2, 4].map(function (i) { var x = parseInt(c.substr(i, 2), 16) / 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); });
		return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
	}
	/* A luminance that reads the measured rgb() strings too; lumOf answers a flat
	   0.5 for anything that is not six hex digits, and every host-measured colour
	   is an rgb() string. */
	function anyLum(c0) {
		var m = String(c0 || '').match(/rgba?\(([\d.\s,]+)/);
		if (!m) return lumOf(c0);
		var v = m[1].split(',').map(Number);
		return v.length >= 3 ? (0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]) / 255 : 0.5;
	}
	/* What a tile shows of a style's own colours: its paper and its ink on the page's side. */
	function tileColours(s, side) {
		var c = Styles.colours ? Styles.colours(s.id)[side] : null;
		if (!c || !c.paper || !c.ink) return '';
		/* AN ACCENT THAT CANNOT SHOW ON ITS OWN PAPER IS THE INK (Manuel,
		   2026-09-25, the Original copy tile: "There it is again. The circle is
		   missing"). A bare tile freezes the host colours at the moment it was
		   saved, and copies saved while the accent probe still measured a
		   button's white word carry paper-as-accent for good. Healed where the
		   tile is drawn, so every old record shows its line and its dot. */
		var acc = c.accent;
		if (acc && Math.abs(anyLum(acc) - anyLum(c.paper)) < 0.08) acc = c.ink;
		if (!acc && (s.host || s.bare)) acc = c.ink; /* a look without its own accent keeps its room's; the theme untouched has no room */
		/* THE THEME'S OWN LOOK IS DRAWN IN THE THEME'S OWN FONT (Manuel, 2026-09-22:
		   "it also doesn't have this serif font by default"): presets.js measured
		   the host's body face on arrival and keeps it on the record. */
		return ' style="' + (s.hostFace ? 'font-family:' + faceAttr(s.hostFace) + ';' : '') + '--surface-base:' + c.paper + ';--text-primary:' + c.ink + ';--text-secondary:color-mix(in oklab, ' + c.ink + ', ' + c.paper + ' 40%);--border-default:color-mix(in oklab, ' + c.paper + ', ' + c.ink + ' 16%)' + (acc ? ';--accent:' + acc : '') + '"';
	}

	/* A TILE SHOWS ITS STYLE ON THE PAGE'S SIDE (Manuel, 2026-09-12: "when we
	   change from light to dark, the tiles should also change to their
	   appropriate colour"; until then each tile kept its style's own side).
	   The side is what the Hell/Dunkel/System switch resolved to, read off
	   the root's applied mode, so a flip of the switch repaints every tile:
	   Terminal white by day and black by night, like the page it stands
	   for. Render runs on every data-theme change (the observer below). */
	function tileClass(s) {
		var applied = root.getAttribute('data-theme') || (Modes ? Modes.default : 'neutral-light');
		var m = ((Modes && Modes.modes) || []).filter(function (x) { return x.id === applied; })[0];
		var side = (m && m.side) || 'light';
		var pal = (Styles.wanted ? Styles.wanted(s.id).palette : null) || s.palette; /* the reader's own pair for the style, not the recipe's alone (the audit, 2026-09-13) */
		var mode = Modes && Modes.resolve ? Modes.resolve(pal, side) : pal + '-' + side;
		return 'theme-' + mode;
	}

	/* The head: the title, and on the phone's sheet a close at the right, as an
	   iOS sheet keeps Done (the audit); the popover has none (Manuel,
	   2026-09-14: "take that X out … it should close by clicking in the empty
	   space"). */
	function head(title) {
		var close = '<button type="button" class="reading-back" data-panel-close aria-label="' + t('Close') + '">' + icon('close') + '</button>';
		return '<div class="reading-panel-head">' +
			'<span></span>' +
			'<p class="reading-panel-title" id="reading-panel-title" tabindex="-1">' + title + '</p>' +
			(isPhone() ? close : '<span></span>') +
		'</div>';
	}

	function render() {
		if (!panel || panel.hidden) return; /* a hidden panel is not rebuilt (the audit, 2026-09-13) */
		var n = now();
		var ids = Reading.ids, at = ids.indexOf(n.reading);
		var shown = Styles.shown();
		var isReader = !!(Styles.reader && Styles.reader());
		/* The picture on the panel's own ground, no card (2026-09-25/26,
		   lab/the-first-window.html card 7): the style's picture — the Aa in its
		   typeface, its accent as a line — with the name under it, and the ring
		   wraps the picture, not the name. The grid flips whole with the
		   Light/Dark/System row above, which is the honest preview. */
		var tiles = '<div class="reading-tiles" role="radiogroup" aria-label="' + t('Style') + '">' +
				shown.map(function (s) {
					return '<button type="button" class="reading-tile" role="radio" data-panel-style="' + s.id + '" aria-checked="' + (s.id === n.style) + '">' +
						'<span class="reading-tile-swatch ' + tileClass(s) + '" data-face-sample="' + s.face + '"' + tileColours(s, n.resolvedSide) + '>' +
						'<span class="reading-tile-aa">Aa</span><span class="reading-tile-accent"></span>' +
						'</span>' +
						(Styles.adjusted(s.id) ? '<span class="reading-tile-adjusted" aria-label="' + t('adjusted') + '">•</span>' : '') +
						'<span class="reading-tile-name">' + (s.site || s.own ? s.label : t(s.label)) + '</span>' +
						'</button>';
				}).join('') +
			'</div>';
		/* NO TITLES ON THE FIRST LEVEL (Manuel, 2026-09-13: "so that it looks
		   like Apple Books"): the controls say what they are; the words stay
		   for the screen reader. The title is the button's own name, Live
		   Design (Manuel, 2026-09-24). */
		var html = '<div class="reading-sheet-top">' + head(t('Vibetiles')) + '</div><div class="reading-sheet-body">' +
			/* The dots hang under the stepper and show on a press (Manuel,
			   2026-09-13: "they were nice when they were appearing underneath"). */
			'<div class="reading-stepper reading-tall" role="group" aria-label="' + t('Reading size') + '">' +
				/* aria-disabled, not disabled: the button stays focusable at the end and no-ops, as Apple's steppers do (the audit). */
				'<button type="button" data-panel-size="down" aria-label="' + t('Smaller') + '"' + (at <= 0 ? ' aria-disabled="true"' : '') + '>A</button>' +
				'<button type="button" class="big" data-panel-size="up" aria-label="' + t('Larger') + '"' + (at >= ids.length - 1 ? ' aria-disabled="true"' : '') + '>A</button>' +
				'<div class="reading-dots" aria-hidden="true">' + ids.map(function (id, i) { return '<i' + (i <= at ? ' class="is-on"' : '') + '></i>'; }).join('') + '</div>' +
			'</div>' +
			/* Taller than the other switches, with Books' three glyphs beside the
			   words (Manuel, 2026-09-13). Live on every tile: the plugin writes the
			   theme's own other side from its palette (panel.php, THE THEME'S OWN
			   OTHER SIDE). is-active: the one word every segmented rule reads. */
			'<div class="reading-segment quire-segmented reading-tall" role="radiogroup" aria-label="' + t('Appearance') + '">' +
				SIDES.map(function (s) { return '<button type="button" role="radio"' + (s.id === n.side ? ' class="is-active"' : '') + ' aria-checked="' + (s.id === n.side) + '" data-panel-side="' + s.id + '">' + icon(s.icon) + '<span>' + (s.site || s.own ? s.label : t(s.label)) + '</span></button>'; }).join('') +
			'</div>' +
			tiles +
			/* A READER'S COPY STYLE, when the owner allows it (2026-09-23): the style's link, which Paste style… takes on the reader's own site. */
			(isReader && Styles.readersCopy && Styles.readersCopy() ? '<button type="button" class="quire-button reading-customise" data-panel-copy-link>' + icon('copy') + '<span>' + t(linkCopied ? 'Copied' : 'Copy style') + '</span></button>' : '') +
			'</div>';

		/* THE SCROLL SURVIVES A RE-RENDER (Manuel, 2026-09-11: "I click a
		   toggle and it jumps immediately back up"): the body is rebuilt on
		   every change, and a new scroller starts at the top. */
		var scroller = panel.querySelector('.reading-sheet-body');
		var scrolled = scroller ? scroller.scrollTop : 0;
		var heightWas = !isPhone() && !panel.hidden ? panel.offsetHeight : 0; /* every change of height glides (2026-09-15) */

		/* FOCUS SURVIVES THE REBUILD (2026-09-12, the audit): every press
		   rebuilds the panel, which destroyed the control just pressed and
		   dropped a keyboard reader to the page. The pressed control is
		   named by its data-panel-* attribute and focused again after. */
		var active = document.activeElement, key = null;
		if (active && panel.contains(active)) {
			for (var ai = 0; ai < active.attributes.length; ai++) {
				var att = active.attributes[ai];
				if (att.name.indexOf('data-panel-') === 0) { key = '[' + att.name + (att.value ? '="' + att.value + '"' : '') + ']'; break; }
			}
		}
		panel.innerHTML = html;
		/* ONE LOOK (Manuel, 2026-09-14): the panel is Neutral's room on the page's
		   side, whatever pair the page wears; the tiles inside keep their own. */
		panel.classList.toggle('theme-neutral-dark', n.resolvedSide === 'dark');
		panel.classList.toggle('theme-neutral-light', n.resolvedSide !== 'dark');
		/* AND THE DOOR WEARS IT TOO (Manuel, 2026-09-22): it is part of the
		   panel, so it stands in the panel's room and not in the look's. */
		document.querySelectorAll('.architrave-panel-opener').forEach(function (o) {
			o.classList.toggle('theme-neutral-dark', n.resolvedSide === 'dark');
			o.classList.toggle('theme-neutral-light', n.resolvedSide !== 'dark');
		});
		/* THE PANEL IS NOT PAINTED BY THE STYLE (Manuel, 2026-09-16: "it
		   shouldn't change at all, not the switches, sliders, or buttons,
		   because it's a settings menu"): it keeps its own two dresses and
		   takes only the side from the page. */
		panel.setAttribute('data-panel-side', n.resolvedSide === 'dark' ? 'dark' : 'light');
		/* AND THE DOOR STANDS IN IT TOO (Manuel, 2026-09-22): the panel restates
		   its whole surface palette under this attribute. */
		document.querySelectorAll('.architrave-panel-opener').forEach(function (o) {
			o.setAttribute('data-panel-side', n.resolvedSide === 'dark' ? 'dark' : 'light');
		});
		['--accent', '--accent-contrast', '--accent-muted'].forEach(function (token) { panel.style.removeProperty(token); });
		if (active && panel.contains(active) && !key && active.classList.contains('reading-panel-title')) key = '.reading-panel-title';
		if (key) {
			var again = panel.querySelector(key);
			/* A control that just went disabled cannot take focus back: its
			   sibling or the title takes it (the audit, 2026-09-13). */
			if (again && again.disabled) again = (again.parentElement && again.parentElement.querySelector('button:not([disabled])')) || panel.querySelector('.reading-panel-title');
			if (again) again.focus({ preventScroll: true });
		}
		panel.setAttribute('data-level', level);
		panel.setAttribute('data-input', inputMode);
		/* THE HEIGHT GLIDES (2026-09-14, Apple's popovers resize in place): the
		   new height is measured, the old one put back, and the panel let go to
		   the new on the reveal beat. Then it is auto again. */
		if (heightWas) {
			panel.style.height = '';
			var heightNow = panel.offsetHeight;
			if (heightNow && heightNow !== heightWas) {
				panel.style.height = heightWas + 'px';
				void panel.offsetHeight;
				panel.classList.add('is-resizing');
				panel.style.height = heightNow + 'px';
				panel.__heightTo = heightNow;
				clearTimeout(panel.__resizeTimer);
				panel.__resizeTimer = setTimeout(function () {
					panel.style.height = ''; panel.classList.remove('is-resizing'); panel.__heightTo = 0; anchor();
				}, 220);
			}
		}
		scroller = panel.querySelector('.reading-sheet-body');
		if (scroller && scrolled) scroller.scrollTop = scrolled;
		// The scrim is the phone's alone.
		if (scrim && !panel.hidden) scrim.hidden = !isPhone();
		anchor(); /* the height changes with the page shown, so the place is measured again */
		sheet.drawn();
	}

	/* THE PHONE'S SHEET HAS TWO HEIGHTS (Manuel, 2026-09-24: "ok go ahead, build both";
	   Apple Maps' card). The first page opens to half the screen, so the article above
	   shows each style, side and size as it is pressed; the top of the sheet is taken
	   hold of, pulled up for the whole height, down for half, further down to close,
	   and a flick decides as a slow drag would. Customise and the pages under it open
	   whole, as long lists want. While half, the page is not dimmed and can be read
	   and scrolled under it. */
	var sheet = (function () {
		var drag = null, moving = 0;
		function fullH() {
			var top = panel.querySelector('.reading-sheet-top'), body = panel.querySelector('.reading-sheet-body'), cs = getComputedStyle(panel);
			var natural = (top ? top.offsetHeight : 0) + (body ? body.scrollHeight : 0) + parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
			var max = parseFloat(cs.maxHeight);
			return Math.round(isFinite(max) ? Math.min(natural, max) : natural);
		}
		/* HALF, BUT NEVER LESS THAN THE FIRST ROW OF STYLES (Manuel, 2026-09-25, on a
		   short phone: the sheet's head took most of the half and the first tiles
		   were cut, a press on their hidden half did nothing). On a tall phone half is
		   plenty and stays half; on a short one the half position grows until the
		   first row of tiles stands whole above the foot, at most four fifths of the
		   screen. */
		function halfH() {
			var h = window.innerHeight * 0.5, tile = panel.querySelector('.reading-sheet-body .reading-tile'), body = panel.querySelector('.reading-sheet-body');
			if (tile && body) {
				var need = tile.getBoundingClientRect().bottom - panel.getBoundingClientRect().top + body.scrollTop + parseFloat(getComputedStyle(panel).paddingBottom || 0) + 16;
				h = Math.max(h, Math.min(need, window.innerHeight * 0.8));
			}
			return Math.round(h);
		}
		function roomy() { return fullH() > halfH() + 40; } /* a page shorter than that has no half */
		function mark(state) {
			panel.setAttribute('data-sheet', state);
			if (scrim) scrim.toggleAttribute('data-clear', state === 'half');
		}
		function clear() {
			if (!panel) return;
			panel.removeAttribute('data-sheet'); panel.removeAttribute('data-sheet-drag'); panel.classList.remove('is-sheet-moving'); panel.style.height = '';
			if (scrim) scrim.removeAttribute('data-clear');
		}
		function glide(h, then) {
			clearTimeout(moving);
			panel.style.height = panel.offsetHeight + 'px'; void panel.offsetHeight;
			panel.classList.add('is-sheet-moving');
			panel.style.height = h + 'px';
			moving = setTimeout(function () { panel.classList.remove('is-sheet-moving'); if (then) then(); }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 440);
		}
		function to(state) {
			if (state === 'half' && !roomy()) state = 'full';
			mark(state);
			glide(state === 'half' ? halfH() : fullH(), function () { if (panel.getAttribute('data-sheet') === 'full') panel.style.height = ''; });
		}
		return {
			/* as it opens: half on the first page, whole elsewhere */
			open: function () {
				if (!isPhone()) { clear(); return; }
				clearTimeout(moving); panel.classList.remove('is-sheet-moving');
				mark('full'); panel.style.height = '';
				if (level === 1 && roomy()) { mark('half'); panel.style.height = halfH() + 'px'; }
			},
			/* after a page is drawn: a page deeper than the first takes the whole height */
			drawn: function () {
				if (!panel || panel.hidden || drag) return;
				if (!isPhone()) { if (panel.hasAttribute('data-sheet')) clear(); return; }
				if (!panel.hasAttribute('data-sheet')) { this.open(); return; }
				if (level !== 1 && panel.getAttribute('data-sheet') === 'half') to('full');
			},
			clear: clear,
			down: function (e) {
				if (!isPhone() || panel.hidden || !panel.hasAttribute('data-sheet') || e.button !== 0) return;
				var body = panel.querySelector('.reading-sheet-body'); /* the whole top, the grabber's air included, down to where the page's rows begin */
				if (!body || e.clientY >= body.getBoundingClientRect().top || (e.target.closest && e.target.closest('button, a, input, [role="menu"]'))) return;
				clearTimeout(moving); panel.classList.remove('is-sheet-moving');
				drag = { y: e.clientY, h: panel.offsetHeight, full: fullH(), ly: e.clientY, lt: e.timeStamp, v: 0 };
				panel.style.height = drag.h + 'px'; panel.setAttribute('data-sheet-drag', '');
				try { panel.setPointerCapture(e.pointerId); } catch (x) { /* followed while over the sheet */ }
				e.preventDefault();
			},
			move: function (e) {
				if (!drag) return;
				var h = drag.h - (e.clientY - drag.y);
				if (h > drag.full) h = drag.full + (h - drag.full) * 0.2; /* past the top it gives a little, as a sheet does */
				panel.style.height = Math.max(0, Math.round(h)) + 'px';
				var dt = e.timeStamp - drag.lt; if (dt > 0) { drag.v = (e.clientY - drag.ly) / dt; drag.ly = e.clientY; drag.lt = e.timeStamp; }
			},
			up: function () {
				if (!drag) return;
				var d = drag; drag = null; panel.removeAttribute('data-sheet-drag');
				var h = panel.offsetHeight, half = halfH(), canHalf = d.full > half + 40, target;
				if (d.v > 0.6) target = canHalf && h > half + 24 ? 'half' : 'close';
				else if (d.v < -0.6) target = 'full';
				else {
					var low = canHalf ? half : d.full;
					if (h < low * 0.5) target = 'close';
					else if (!canHalf) target = 'full';
					else target = Math.abs(h - half) < Math.abs(h - d.full) ? 'half' : 'full';
				}
				if (target === 'close') { glide(0, function () { close(); clear(); }); return; }
				to(target);
			}
		};
	})();
	function isPhone() { return !window.matchMedia('(min-width: 1010px)').matches; }

	/* ======================================================================
	   THE ROLL (2026-09-22, Manuel: "the five things do it")

	   The panel unrolls out of its own head when it opens and rolls back into
	   it when it shuts. The curves, the two durations and the shadow's bloom
	   are in style.css, THE ROLL; what is here is the arithmetic, and the one
	   decision that cannot be written in CSS: A ROLL CAN BE CAUGHT IN THE
	   MIDDLE. Press the door again while the panel is on its way up and it
	   turns round from exactly where it is, because a transition started from
	   a stated height interpolates from the height showing NOW. The old
	   opening could not: it played to the end and then closed, which is a clip
	   being played rather than an object being moved.

	   THE SHUT HEIGHT IS NOT MEASURED FROM THE BODY. The obvious sum, the
	   panel's height less the body's, is only true while nothing is clipping
	   the body — which is exactly what the roll does. The head and the panel's
	   own inset are read instead, and they are the same number whatever the
	   roll is doing.
	   ====================================================================== */
	var rollTimer = null;

	function shutHeight() {
		/* THE SHEET'S TOP, NOT THE HEAD INSIDE IT (measured: the head is 23 and
		   the top that carries it, with the grabber's room above and the rule
		   below, is 55; rolling to 23 clipped the head's own title). The
		   panel's padding is 0 here because its children carry it, which the
		   sum below still allows for on a placement that does not. */
		var head = panel.querySelector('.reading-sheet-top') || panel.querySelector('.reading-panel-head');
		var box = window.getComputedStyle(panel);
		var pad = (parseFloat(box.paddingTop) || 0) + (parseFloat(box.paddingBottom) || 0);
		return Math.round((head ? head.offsetHeight : 0) + pad);
	}
	/* The height it would stand at if it were let go, WITHOUT letting it go on
	   screen: the stated height is taken off, the answer read, and the height
	   that was showing put back in the same frame. */
	function openHeight() {
		var showing = panel.style.height || window.getComputedStyle(panel).height;
		panel.style.height = '';
		var full = panel.offsetHeight;
		panel.style.height = showing;
		void panel.offsetHeight;
		return full;
	}
	function rollOpen() {
		if (!panel || isPhone()) return;
		clearTimeout(rollTimer);
		panel.classList.remove('is-rolling-shut');
		/* A fresh opening starts at the head; one that interrupts a shutting
		   roll starts wherever that roll had got to. */
		if (!panel.style.height) {
			panel.style.height = shutHeight() + 'px';
			panel.style.boxShadow = 'var(--elevation-raised)';
			void panel.offsetHeight;
		}
		var full = openHeight();
		if (!full) return;
		panel.classList.add('is-rolling');
		panel.style.height = full + 'px';
		panel.__heightTo = full;
		panel.style.removeProperty('box-shadow'); /* back to the floating shadow, over the same beat */
		rollTimer = setTimeout(function () {
			/* THE HEIGHT IS HANDED BACK. A panel left at a stated height cannot
			   answer a level that needs more room. */
			panel.style.height = ''; panel.classList.remove('is-rolling'); panel.__heightTo = 0; anchor();
		}, 300);
	}
	/* Rolls shut and calls back when the panel is out of sight. On the phone,
	   and wherever there is nothing to roll, the callback is immediate. */
	function rollShut(done) {
		if (!panel || isPhone() || !panel.style.height && !panel.offsetHeight) { done(); return; }
		clearTimeout(rollTimer);
		panel.style.height = window.getComputedStyle(panel).height;
		void panel.offsetHeight;
		panel.classList.add('is-rolling', 'is-rolling-shut');
		panel.style.height = shutHeight() + 'px';
		panel.style.boxShadow = 'var(--elevation-raised)';
		panel.__heightTo = 0;
		rollTimer = setTimeout(function () {
			panel.classList.remove('is-rolling', 'is-rolling-shut');
			panel.style.height = '';
			panel.style.removeProperty('box-shadow');
			done();
		}, 130);
	}

	/* THE BUTTON BECOMES THE PANEL (Manuel, 2026-09-24, lab/the-button-becomes-the-panel.html,
	   picture 8: "build 7 with snappy spring"). The Vibetiles button does not stay
	   under an open panel: a drop rises out of it, the two join like water (a blur
	   and a hard edge on the pair, as Apple's glass shapes merge when they come
	   close), and the drop becomes the panel with a light overshoot that settles.
	   Closing, the panel flows back into the button. The Aurora goes onto the
	   panel's lower edge, stays a moment and fades; the button's own light fades
	   back in when it returns. On the phone's sheet, with Reduce motion, and for
	   every other door, the panel unrolls as before. */
	var morph = (function () {
		var layer = null, glow = null, live = false, shutting = false, timers = [], seen = null;
		function door() { return trigger && trigger.classList && trigger.classList.contains('architrave-panel-opener') ? trigger : null; }
		/* A DOOR IN THE PAGE STAYS IN THE PAGE (Manuel, 2026-09-24, the button in Ollie's menu:
		   "now it's a hole in the menu … it looks like a bug"). A button floating over the
		   page may become the panel; one docked in a menu or a slot is part of the site's
		   own row, and leaving would leave a gap in it. The panel unrolls beside it. */
		function can() { return !!door() && !door().hasAttribute('data-docked') && !isPhone() && !!Element.prototype.animate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
		function spring(zeta, n) {
			var w = 2 * Math.PI * 1.1, wd = w * Math.sqrt(1 - zeta * zeta), pts = [];
			for (var i = 0; i <= n; i++) { var t = i / n * 1.25; pts.push((1 - Math.exp(-zeta * w * t) * (Math.cos(wd * t) + zeta * w / wd * Math.sin(wd * t))).toFixed(4)); }
			pts[pts.length - 1] = '1'; return 'linear(' + pts.join(', ') + ')';
		}
		var SNAPPY = spring(0.72, 60), EASE = 'cubic-bezier(.45,0,.25,1)';
		function make(colour, z) {
			if (!document.getElementById('architrave-goo')) {
				var holder = document.createElement('div');
				holder.innerHTML = '<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs><filter id="architrave-goo" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur in="SourceAlpha" stdDeviation="11" result="b"/><feColorMatrix in="b" mode="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 30 -12" result="m"/><feFlood flood-color="#2c2c2e"/><feComposite in2="m" operator="in"/></filter></defs></svg>';
				document.body.appendChild(holder.firstChild);
			}
			document.querySelector('#architrave-goo feFlood').setAttribute('flood-color', colour);
			if (!layer) { layer = document.createElement('div'); layer.className = 'architrave-panel-goo'; layer.setAttribute('aria-hidden', 'true'); layer.innerHTML = '<i></i><i></i>'; document.body.appendChild(layer); }
			stopAll([layer]); layer.style.zIndex = z; layer.hidden = false; /* a crossing cut short by a close leaves no fade on it */
			return layer.children;
		}
		/* THE LAYER IS ONLY AS BIG AS THE TWO SHAPES (measured 2026-09-24: over the
		   whole window the blur was drawn anew for every pixel of it, and a frame
		   took about 100 ms); everything inside is placed from its corner. */
		/* AND AT HALF ITS SIZE, drawn at a half and shown at twice (measured: a quarter of
		   the pixels to blur; the edge the filter cuts is soft enough to be scaled). */
		var at = { x: 0, y: 0 }, K = 0.5;
		function fit(b, p) {
			var pad = 80, l = Math.min(b.left, p.left) - pad, t = Math.min(b.top, p.top) - pad - 100, r = Math.max(b.right, p.right) + pad, btm = Math.max(b.bottom, p.bottom) + pad + 100;
			at.x = l; at.y = t;
			Object.assign(layer.style, { left: l + 'px', top: t + 'px', width: (r - l) * K + 'px', height: (btm - t) * K + 'px', transform: 'scale(' + 1 / K + ')' });
		}
		function px(v) { return v * K + 'px'; }
		/* AND A LITTLE SMALLER THAN WHAT IT STANDS FOR (measured 2026-09-24: the blur cut back
		   to a hard edge came out about 4 px wider on every side, so the panel's edge jumped
		   in when it took over, "darker or bigger and then back to normal"). */
		var G = 4.4;
		function box(r) { return { left: px(r.left - at.x + G), top: px(r.top - at.y + G), width: px(r.width - 2 * G), height: px(r.height - 2 * G) }; }
		/* the drop's three places: in the button, risen towards the panel, and the panel */
		function frames(b, p, radius) {
			var d0 = b.height * 0.9, d1 = 170, rise = 92, cx = b.left + b.width / 2 - at.x, cy = b.top + b.height / 2 - at.y, dx = cx, dy = cy;
			b = { left: b.left - at.x, right: b.right - at.x, top: b.top - at.y, bottom: b.bottom - at.y };
			p = { left: p.left - at.x, right: p.right - at.x, top: p.top - at.y, bottom: p.bottom - at.y, width: p.width, height: p.height };
			if (p.bottom <= b.top + 1) dy = b.top - rise; else if (p.top >= b.bottom - 1) dy = b.bottom + rise; else if (p.right <= b.left + 1) dx = b.left - rise; else dx = b.right + rise;
			dx = Math.max(p.left + d1 / 2, Math.min(p.right - d1 / 2, dx)); /* the drop rises under the panel, not beside it */
			return {
				seed: { left: px(cx - d0 / 2), top: px(cy - d0 / 2), width: px(d0), height: px(d0), borderRadius: '50%' },
				drop: { left: px(dx - d1 / 2), top: px(dy - d1 / 2), width: px(d1), height: px(d1), borderRadius: '50%' },
				panel: { left: px(p.left + G), top: px(p.top + G), width: px(p.width - 2 * G), height: px(p.height - 2 * G), borderRadius: px(parseFloat(radius) || 0) }
			};
		}
		/* THE DROP STARTS IN THE BUTTON'S COLOUR (Manuel, 2026-09-24: "when accent colour is
		   on the button, example yellow … the panel should for the first quick moment also
		   be in accent and then transition to the grey"). The fill is mixed along the
		   drop's own clock: the button's face at first, the panel's ground by the time the
		   two have merged; and the other way home. */
		function tint(anim, from, to, a, b) {
			var flood = document.querySelector('#architrave-goo feFlood');
			var step = function () {
				var t = anim.effect ? anim.effect.getComputedTiming().progress : null;
				if (t === null || anim.playState === 'finished' || anim.playState === 'idle') { flood.style.floodColor = to; return; }
				var k = Math.max(0, Math.min(1, (t - a) / (b - a)));
				flood.style.floodColor = 'color-mix(in oklab, ' + to + ' ' + Math.round(k * 100) + '%, ' + from + ')';
				requestAnimationFrame(step);
			};
			flood.style.floodColor = from; step();
		}
		function faceOf(d) { var f = getComputedStyle(d).getPropertyValue('--opener-face').trim(); return f || getComputedStyle(panel).backgroundColor; }
		/* UNDER THE BUTTON AND UNDER THE PANEL (Manuel, 2026-09-24: "a little hiccup"):
		   the layer stood one under the panel, which is over the button, so for the first
		   frames it covered the button with a blank shape before the button faded. */
		function under(d, cs) { var zd = parseInt(getComputedStyle(d).zIndex, 10), zp = parseInt(cs.zIndex, 10); return String(Math.min(isNaN(zd) ? 42 : zd, isNaN(zp) ? 50 : zp) - 1); }
		function free(d) { var w = d && d.querySelector('.opener-word'); if (w) { w.style.gridTemplateColumns = ''; void w.offsetWidth; w.style.transition = ''; } }
		function clear() { timers.forEach(clearTimeout); timers = []; }
		function stopAll(els) { els.forEach(function (el) { if (el) el.getAnimations().forEach(function (a) { if (!(window.CSSAnimation && a instanceof CSSAnimation)) a.cancel(); }); }); } /* never the page's own CSS animations, which would not come back */
		/* THE LIGHT ON THE PANEL: the band in its lower edge (a class) and the light
		   under it (a box of its own, since the panel clips what hangs outside). */
		/* The light is the Aurora's, and a button in a menu has none (panel.php, IN A MENU IT IS A MENU ITEM). */
		function lit(d) { return d.getAttribute('data-aurora') === 'true' && !(d.getAttribute('data-docked') === 'menu' && d.getAttribute('data-match') === 'true' && !(d.getAttribute('data-icon') === 'true' && d.getAttribute('data-named') === 'false' && !d.hasAttribute('data-folded'))); } /* the square beside the menu is a button, and keeps it */
		function lightOn(d) {
			if (!lit(d)) return;
			panel.classList.add('has-door-light');
			if (!glow) { glow = document.createElement('div'); glow.className = 'architrave-panel-glow'; glow.setAttribute('aria-hidden', 'true'); document.body.appendChild(glow); }
			glow.hidden = false; glow.style.zIndex = under(d, getComputedStyle(panel));
			var follow = function () { if (!glow || glow.hidden || panel.hidden) return; var r = panel.getBoundingClientRect(); glow.style.left = (r.left + 12) + 'px'; glow.style.width = Math.max(0, r.width - 24) + 'px'; glow.style.top = (r.bottom - 2) + 'px'; requestAnimationFrame(follow); };
			follow();
			/* it comes on softly, not in one frame, and so does the band in the edge */
			glow.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 320, easing: 'ease-out' });
			panel.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 320, easing: 'ease-out', pseudoElement: '::after' });
			timers.push(setTimeout(function () {
				if (panel.hidden) return;
				var fade = [{ opacity: 1 }, { opacity: 0 }], o = { duration: 900, easing: 'ease-in-out', fill: 'forwards' };
				var gone = glow.animate(fade, o); panel.animate(fade, Object.assign({ pseudoElement: '::after' }, o));
				/* OUT MEANS OUT (Manuel, 2026-09-24: "the glow should stop … it doesn't stop at all"):
				   the light under the panel was only faded, and a carry of the panel cancelled the fade,
				   so it came back and stayed. Once out it is put away, and the panel remembers it is out. */
				gone.finished.then(function () { if (!panel.hasAttribute('data-dragging')) { glow.hidden = true; stopAll([glow]); } panel.setAttribute('data-light-out', ''); }, function () {});
			}, 1500));
		}
		function lightNow() { return panel.classList.contains('has-door-light') ? (panel.hasAttribute('data-light-out') ? 0 : Number(getComputedStyle(panel, '::after').opacity)) : 1; }
		/* only the fades this script started: a CSS animation cancelled never comes back
		   (2026-09-24: the grabber's travelling colours stood still, cancelled here) */
		function mine(a) { return a.effect && a.effect.pseudoElement && !(window.CSSAnimation && a instanceof CSSAnimation) && !(window.CSSTransition && a instanceof CSSTransition); }
		function lightOff() { panel.classList.remove('has-door-light'); panel.removeAttribute('data-light-out'); panel.getAnimations({ subtree: true }).forEach(function (a) { if (mine(a)) a.cancel(); }); if (glow) { glow.hidden = true; stopAll([glow]); } }
		/* the button comes home as dark as the panel's light was, and its light fades in */
		function relight(d, from) {
			if (from >= 0.99 || !lit(d)) return;
			d.style.setProperty('--lit', String(from));
			var a = d.animate([{ '--lit': from }, { '--lit': 1 }], { duration: 650, easing: 'ease-in-out', fill: 'forwards' });
			d.animate([{ opacity: 0 }, { opacity: 0.6 }], { duration: 800, easing: 'cubic-bezier(.2,0,0,1)', pseudoElement: '::before' });
			a.finished.then(function () { d.style.removeProperty('--lit'); a.cancel(); }, function () { d.style.removeProperty('--lit'); });
		}
		function open() {
			var d = door(); clear(); lightOff();
			stopAll([d, panel]); if (layer) { stopAll(Array.prototype.slice.call(layer.children)); layer.hidden = true; }
			live = true; seen = d;
			/* the button keeps its word as it was: open() marks it expanded, which slid the
			   word out while the button was fading, and it grew for a moment */
			var word = d.querySelector('.opener-word'); if (word) { word.style.transition = 'none'; word.style.gridTemplateColumns = getComputedStyle(word).gridTemplateColumns === '0px' ? '0fr' : '1fr'; }
			panel.classList.remove('is-opening');
			panel.style.opacity = '0';
			requestAnimationFrame(function () {
				if (!live || panel.hidden) return;
				var b = d.getBoundingClientRect(), p = panel.getBoundingClientRect(), cs = getComputedStyle(panel);
				var kids = make(cs.backgroundColor, under(d, cs)); fit(b, p);
				var f = frames(b, p, cs.borderTopLeftRadius);
				Object.assign(kids[0].style, box(b), { borderRadius: px(parseFloat(getComputedStyle(d).borderTopLeftRadius) || 0) });
				var ms = 340;
				var m = kids[1].animate([Object.assign({ easing: EASE }, f.seed), Object.assign({ offset: 0.3, easing: SNAPPY }, f.drop), f.panel], { duration: ms, easing: 'linear', fill: 'forwards' });
				tint(m, faceOf(d), cs.backgroundColor, 0.12, 0.55);
				kids[0].animate([{ opacity: 1 }, { opacity: 1, offset: 0.75 }, { opacity: 0 }], { duration: ms, fill: 'forwards' });
				d.animate([{ opacity: 1 }, { opacity: 1, offset: 0.15 }, { opacity: 0, offset: 0.45 }, { opacity: 0 }], { duration: ms, fill: 'forwards' });
				m.finished.then(function () {
					if (!live || panel.hidden) return;
					d.style.visibility = 'hidden'; d.setAttribute('data-in-panel', ''); stopAll([d]);
					/* ONE SHADOW AT A TIME (Manuel, 2026-09-24: "it goes dark for a second and then
					   it goes away"): the drop's shadow and the panel's lay on top of each other
					   while the panel came in, and the drop's was cut off after. The panel comes
					   in without its own over the drop, which carries the same one, and takes it
					   back in the frame the drop goes. */
					panel.style.opacity = ''; panel.style.boxShadow = 'none';
					/* AND THE TWO SHADOWS CROSS OVER (Manuel, 2026-09-24: "the shadow snaps back to
					   normal"): switched in one frame, two shadows that are never quite the same
					   shape made a step. The panel's own eases in while the drop fades away. */
					var handed = function () {
						if (!live) return;
						panel.style.transition = 'box-shadow 220ms ease-out'; panel.style.boxShadow = '';
						var fade = layer ? layer.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, delay: 60, easing: 'ease-in', fill: 'forwards' }) : null; /* the drop's goes as the panel's has mostly come, so the two never leave a lighter moment between them */
						timers.push(setTimeout(function () { if (layer) { layer.hidden = true; stopAll(Array.prototype.slice.call(layer.children)); if (fade) fade.cancel(); } panel.style.transition = ''; }, 300));
					};
					panel.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150, easing: 'ease-out' }).finished.then(handed, handed);
					lightOn(d);
				}, function () {});
			});
		}
		/* called as the close begins, so the door can take the focus back */
		function unhide() { var d = seen; if (d) { d.style.visibility = ''; d.style.opacity = '0'; d.removeAttribute('data-in-panel'); } }
		function close(done) {
			var d = seen; clear(); shutting = true;
			if (!d || !live || !layer) { live = false; shutting = false; if (d) { d.style.visibility = ''; d.style.opacity = ''; d.removeAttribute('data-in-panel'); free(d); } lightOff(); done(); return; }
			var from = lightNow();
			if (from < 0.99 && lit(d)) d.style.setProperty('--lit', String(from));
			/* IT COMES HOME AS IT RESTS (Manuel, 2026-09-24: "it goes to the big button where it
			   says Live Design and then it snaps"): the word was held as it was at the press,
			   out under the pointer, and let go once home. It takes its resting state now,
			   before the drop is aimed at it: the word out only where the size shows it. */
			var w = d.querySelector('.opener-word');
			if (w) { w.style.transition = 'none'; w.style.gridTemplateColumns = ''; var rest = d.matches(':hover') ? '' : getComputedStyle(w).gridTemplateColumns; w.style.gridTemplateColumns = rest === '0px' ? '0fr' : rest ? '1fr' : ''; }
			var b = d.getBoundingClientRect(), p = panel.getBoundingClientRect(), cs = getComputedStyle(panel);
			var kids = make(cs.backgroundColor, under(d, cs)); fit(b, p);
			var f = frames(b, p, cs.borderTopLeftRadius);
			Object.assign(kids[0].style, box(b), { borderRadius: px(parseFloat(getComputedStyle(d).borderTopLeftRadius) || 0) });
			Object.assign(kids[1].style, f.panel);
			stopAll([panel]); lightOff(); panel.style.transition = 'none'; panel.style.boxShadow = 'none'; /* the drop under it carries the shadow home */
			panel.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 90, fill: 'forwards' }).finished.then(function () {
				done(); stopAll([panel]); panel.style.opacity = ''; panel.style.boxShadow = ''; panel.style.transition = '';
				var ms = 240;
				var m = kids[1].animate([f.panel, Object.assign({ offset: 0.6 }, f.drop), f.seed], { duration: ms, easing: EASE, fill: 'forwards' });
				tint(m, cs.backgroundColor, faceOf(d), 0.45, 0.9);
				kids[0].animate([{ opacity: 0 }, { opacity: 1, offset: 0.4 }, { opacity: 1 }], { duration: ms, fill: 'forwards' });
				d.style.opacity = '';
				d.animate([{ opacity: 0 }, { opacity: 0, offset: 0.6 }, { opacity: 1 }], { duration: ms });
				m.finished.then(function () {
					layer.hidden = true; stopAll(Array.prototype.slice.call(layer.children)); live = false; shutting = false; free(d);
					relight(d, from);
				}, function () {});
			}, function () {});
		}
		/* a press during a closing flow reopens from wherever it had got to: the layer is simply dropped */
		function drop() { clear(); panel.style.transition = ''; panel.style.boxShadow = ''; if (layer) { stopAll(Array.prototype.slice.call(layer.children)); layer.hidden = true; } if (seen) { stopAll([seen]); seen.style.visibility = ''; seen.style.opacity = ''; seen.removeAttribute('data-in-panel'); free(seen); } live = false; shutting = false; }
		/* AND THE LIGHT UNDER IT WHILE IT IS CARRIED (Manuel, 2026-09-24: "we have now got that
		   Aurora line but not the glow. While we're dragging why not?"): the same glow the panel
		   wears as it rises out of the button, following the panel, faded in and out. Wherever
		   the edge's band shows (data-door-aurora), a button in a menu included. */
		function carried(on) {
			if (on && !panel.hasAttribute('data-door-aurora')) return;
			if (on) {
				if (!glow) { glow = document.createElement('div'); glow.className = 'architrave-panel-glow'; glow.setAttribute('aria-hidden', 'true'); document.body.appendChild(glow); }
				stopAll([glow]); glow.hidden = false;
				var zp = parseInt(getComputedStyle(panel).zIndex, 10); glow.style.zIndex = String((isNaN(zp) ? 50 : zp) - 1);
				var follow = function () { if (!glow || glow.hidden || panel.hidden) return; var r = panel.getBoundingClientRect(); glow.style.left = (r.left + 12) + 'px'; glow.style.width = Math.max(0, r.width - 24) + 'px'; glow.style.top = (r.bottom - 2) + 'px'; requestAnimationFrame(follow); };
				follow();
				glow.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 240, easing: 'ease-out' });
			} else if (glow && !glow.hidden && (!panel.classList.contains('has-door-light') || panel.hasAttribute('data-light-out'))) {
				var g = glow, a = g.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 320, easing: 'ease-in', fill: 'forwards' });
				a.finished.then(function () { if (!panel.hasAttribute('data-dragging')) { g.hidden = true; a.cancel(); } }, function () {});
			}
		}
		/* A DOOR THAT DOCKS WHILE IT IS THE PANEL (Manuel, 2026-09-25: Automatic
		   switched on from the open panel, "while the panel is open the button's
		   spot in the menu is empty … after I close it, it locks in"). The door
		   had become the panel and was out of sight; docked, it belongs to the
		   site's row, so it comes back into it at once, lit as open, and the
		   panel moves to hang from it. */
		function settle() {
			var d = seen;
			if (!live || !d || !d.hasAttribute('data-docked')) return;
			clear(); stopAll([d]);
			d.style.visibility = ''; d.style.opacity = ''; d.removeAttribute('data-in-panel'); free(d);
			lightOff();
			if (layer) { stopAll(Array.prototype.slice.call(layer.children)); layer.hidden = true; }
			panel.style.opacity = ''; panel.style.boxShadow = ''; panel.style.transition = '';
			live = false; seen = null;
			if (!panel.hidden) anchor();
		}
		function watch() { var d = document.querySelector('.architrave-panel-opener'); if (d) new MutationObserver(settle).observe(d, { attributes: true, attributeFilter: ['data-docked'] }); }
		if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watch); else watch();
		return { can: can, open: open, close: close, unhide: unhide, drop: drop, carried: carried, live: function () { return live; }, shutting: function () { return shutting; } };
	}());

	function open(btn) {
		trigger = btn;
		panel.toggleAttribute('data-door-aurora', !!(btn && btn.getAttribute && btn.getAttribute('data-aurora') === 'true')); /* the grabber takes the Aurora's colours only where the button wears it */
		level = 1;
		anchor();
		/* A dialog on both placements (1.1.975 tried role=region for the column and a plugin's
		   stylesheet answered `[role="region"] { position: relative }`, which took the column out
		   of its place, measured live 2026-09-13); modal on the phone alone. */
		panel.setAttribute('role', 'dialog');
		panel.setAttribute('aria-modal', isPhone() ? 'true' : 'false');
		/* CLEAR BEFORE IT IS SHOWN (Manuel, 2026-09-24: "for 4 ms the panel is already open
		   and it goes away"): made clear after it was shown, the panel was sometimes drawn
		   once at full strength first, and its own ease on opacity then faded it out
		   while the drop rose. */
		morph.drop();
		var flows = morph.can();
		if (flows) { panel.style.transition = 'none'; panel.style.opacity = '0'; }
		panel.hidden = false;
		panel.classList.remove('is-opening'); void panel.offsetWidth; panel.classList.add('is-opening');
		/* AND THEN THE MARK GOES (2026-09-23): left on, the ease-in played again on
		   redraws. Once it has played it is taken off. */
		panel.addEventListener('animationend', function done(e) {
			if (e.target !== panel) return;
			panel.classList.remove('is-opening'); panel.removeEventListener('animationend', done);
		}); /* the ease-in, once per opening (a rule on :not([hidden]) re-ran on rebuilds and flickered the stepper) */
		render();
		/* AND IT UNROLLS OUT OF ITS OWN HEAD (Manuel, 2026-09-22). See rollOpen above. */
		if (flows) morph.open(); else rollOpen();
		sheet.open();
		scrim.hidden = !isPhone(); /* the sheet's scrim, on the phone alone */
		document.querySelectorAll('[data-reading-panel-open]').forEach(function (b) { b.setAttribute('aria-expanded', b === btn ? 'true' : 'false'); });
		var first = panel.querySelector('button:not([disabled])');
		if (first) first.focus({ preventScroll: true });
	}
	/* THE POPOVER'S PLACE: under the Aa that opened it, its right edge on the
	   Aa's right edge; kept on resize and scroll, since the Aa may move with
	   the paper. */
	function anchor() {
		if (!panel || isPhone() || !trigger) return;
		var r = trigger.getBoundingClientRect();
		var stack = trigger.closest('.paper-stack');
		if (stack && stack.classList.contains('paper-corner-foot')) {
			/* THE DESIGN SQUARE IN THE FOOT'S ROW (2026-09-19, first in the
			   bottom-left corner, the same day beside the eye at the bottom
			   right): the panel stands above it, right edges together, and may
			   grow up to the paper's head, where the body scrolls. */
			/* PINNED BY ITS FOOT (measured: placed by its top and an estimated
			   height the gap came out 16, then 0): the bottom edge stands 8
			   over the square, the gap the language menu beside it keeps, and
			   every level grows upwards from there. */
			/* A COLUMN IN THE CORNER (2026-09-19, late): the panel stands to the
			   left of the column, 8 off it, its foot on the column's foot, and
			   grows upwards to the paper's head. */
			/* THE HEAD IT STOPS AT IS ONE THAT IS SHOWN (Manuel, 2026-09-19, Fließtext's page grown under WordPress's toolbar: "we should avoid the panel growing so much that it goes into the WordPress admin bar"). The first of the two squares in the markup was asked, and with the rail open that one is hidden: a hidden box measures 0, so the panel was allowed the whole window and its head left the screen. The shown square is asked, then the paper, and never above the toolbar. */
			var corner = Array.prototype.filter.call(document.querySelectorAll('.rail-collapse-corner, .rail-expand'), function (c) { var b = c.getBoundingClientRect(); return b.width > 0 && b.height > 0; })[0];
			var paper = document.querySelector('.frame-paper'), bar = document.getElementById('wpadminbar');
			var headTop = Math.max(16, corner ? corner.getBoundingClientRect().top : 0, paper ? paper.getBoundingClientRect().top + 8 : 0, bar ? bar.getBoundingClientRect().bottom + 8 : 0);
			var sb = stack.getBoundingClientRect();
			panel.classList.add('is-above');
			panel.style.setProperty('--panel-anchor-bottom', Math.round(window.innerHeight - sb.bottom) + 'px');
			panel.style.setProperty('--panel-anchor-max', Math.round(sb.bottom - headTop) + 'px');
			panel.style.setProperty('--panel-anchor-right', Math.round(window.innerWidth - r.left + 8) + 'px');
			panel.style.transformOrigin = 'right bottom';
			return;
		}
		if (stack && stack.getBoundingClientRect().width > stack.getBoundingClientRect().height) {
			/* THE STACK IS A ROW ALONG THE PAPER'S TOP (2026-09-19): the panel
			   hangs under its square, its right edge on the square's, and may
			   grow down to the paper's foot. */
			var sr = stack.getBoundingClientRect(), topR = Math.round(sr.bottom + 8);
			panel.classList.remove('is-above');
			panel.style.setProperty('--panel-anchor-max', Math.round(window.innerHeight - topR - 16) + 'px');
			panel.style.setProperty('--panel-anchor-top', topR + 'px');
			panel.style.setProperty('--panel-anchor-right', Math.round(window.innerWidth - r.right) + 'px');
			panel.style.transformOrigin = 'right top';
			return;
		}
		if (stack) {
			/* BESIDE ITS SQUARE, UP AS FAR AS IT MUST (Manuel, 2026-09-15: "it
			   should be opened on the left side of the button, not on top of
			   it"). The one rule every menu off the column follows
			   (paper-stack.js): to the left of the square, top on the
			   square's top, slid up until it fits between the paper's head
			   and foot, and grown out of the square wherever it stands. */
			/* THE WHOLE PANEL'S HEIGHT (Manuel, 2026-09-15: "the panel is too
			   short. We have a lot of space at the top"): the body scrolls
			   inside a panel the screen had already cut, so its own offset
			   height always fitted; the body's full scroll height is measured. */
			var body = panel.querySelector('.reading-sheet-body');
			/* CENTRED ON THE PAPER (Manuel, 2026-09-15: "the first time the
			   window is in the middle … I click on one of those Hintergrund and
			   then it jumps down"; asked where it should be anchored, he chose
			   the centre). The top edge followed the square and slid up only
			   when the panel no longer fitted, so the same panel sat in two
			   places and changed between them on a rebuild. Now its middle is
			   the paper's middle, where the settings square stands; it grows up
			   and down alike, gliding with its height, and stops at the paper's
			   head and foot, where the body scrolls. The height it is going to
			   is the height measured. */
			var s = stack.getBoundingClientRect(), room = Math.round(s.bottom - s.top);
			panel.style.setProperty('--panel-anchor-max', room + 'px');
			var h = Math.min(room, panel.__heightTo || (panel.offsetHeight + (body ? body.scrollHeight - body.clientHeight : 0)));
			var top = Math.max(s.top, (s.top + s.bottom) / 2 - h / 2);
			panel.classList.remove('is-above');
			panel.style.setProperty('--panel-anchor-top', Math.round(top) + 'px');
			panel.style.setProperty('--panel-anchor-right', Math.round(window.innerWidth - r.left + 8) + 'px');
			panel.style.transformOrigin = 'right ' + Math.round(r.top + r.height / 2 - top) + 'px';
			return;
		}
		if (trigger.classList.contains('architrave-panel-opener')) {
			/* THE PILL (Manuel, 2026-09-22: the plugin's one door, "hovering in the
			   center of the screen at the bottom"): the panel stands over it,
			   centred on it, and grows upwards; the pill can be dragged, so the
			   centre is wherever it stands, kept 8 off the window's sides. */
			var w = panel.offsetWidth || 360, cx = r.left + r.width / 2;
			/* THE PANEL OPENS ON THE SIDE THE DOOR'S PLACE CALLS FOR, AND FLIPS ONLY
			   WHEN IT DOES NOT FIT THERE (Manuel, 2026-09-23: the door set to the
			   bottom, dragged just over the middle, "weirdly jumps from top to
			   bottom just by crossing the middle line"). A door at the top or in the
			   site's menu hangs the panel under it; every other door holds it
			   above. Which side is decided by room, as a macOS popover does: the
			   preferred side while the panel fits there, the other when it does not
			   and the other has more. */
			var lid0 = document.getElementById('wpadminbar'), sky0 = Math.max(16, lid0 ? lid0.getBoundingClientRect().bottom + 8 : 0);
			var rows0 = panel.querySelector('.reading-sheet-body');
			var need0 = Math.min(380, panel.offsetHeight + (rows0 ? rows0.scrollHeight - rows0.clientHeight : 0) || 380);
			var roomUp = r.top - 8 - sky0, roomDown = window.innerHeight - r.bottom - 8 - 16;
			var wantsDown = trigger.getAttribute('data-docked') === 'menu' || /^top-/.test(trigger.getAttribute('data-place') || '');
			var down = wantsDown ? (roomDown >= need0 || roomDown >= roomUp) : !(roomUp >= need0 || roomUp >= roomDown);
			/* A DOOR IN THE MENU HANGS THE PANEL THE WAY A DROPDOWN HANGS (Manuel,
			   2026-09-25, "yes" to the button staying lit while the panel is open):
			   from the lit pill's own edge, the right one in the right half of the
			   row and the left one in the left, a quarter rem under its foot, as
			   panel-page.css hangs the site's own dropdowns (A DROPDOWN HANGS FROM
			   THE PILL). Any other door centres the panel on itself. */
			var inRow = trigger.getAttribute('data-docked') === 'menu', dcs = getComputedStyle(trigger);
			var out = inRow ? (parseFloat(dcs.getPropertyValue('--ldp-outset')) || 0.4 * parseFloat(dcs.fontSize) || 0) : 0;
			var rightAt = !inRow ? window.innerWidth - cx - w / 2 : cx > window.innerWidth / 2 ? window.innerWidth - r.right - out : window.innerWidth - (r.left - out) - w;
			if (down) {
				var hang = Math.round(inRow ? r.bottom + out + 4 : r.bottom + 8);
				panel.classList.remove('is-above');
				panel.style.setProperty('--panel-anchor-top', hang + 'px');
				panel.style.setProperty('--panel-anchor-max', Math.max(120, window.innerHeight - hang - 16) + 'px');
				panel.style.setProperty('--panel-anchor-right', Math.max(8, Math.min(window.innerWidth - w - 8, Math.round(rightAt))) + 'px');
				panel.style.transformOrigin = inRow ? (cx > window.innerWidth / 2 ? 'right top' : 'left top') : 'center top';
				return;
			}
			panel.classList.add('is-above');
			/* AND IT STANDS OVER THE DOOR, NOT ON IT (Manuel, 2026-09-22: "maybe
			   it shouldn't be one … it should be, in the beginning, that it was a
			   button underneath"). The two were joined for a day, the panel laid a
			   pixel into the door's head with the shared corners squared. Two boxes
			   cannot animate as one card, so the panel keeps the 8 every other
			   trigger gives it and the door stays a pill. */
			panel.style.setProperty('--panel-anchor-bottom', Math.round(window.innerHeight - r.top + 8) + 'px');
			/* AND IT STOPS UNDER THE TOOLBAR (Manuel, 2026-09-22, the panel over the
			   door with its first rows cut off by the window's head: "that should
			   not be possible, the panel has to shrink"). Every other trigger
			   writes a ceiling; this one wrote none, and on a framed page
			   `body.has-frame .reading-panel.is-above` reads that missing ceiling
			   as `none`, so the screen's own cap never applied and the panel grew
			   off the top. The room is what is left between the door's head and
			   the toolbar's foot, and the rows scroll inside it. */
			var lid = document.getElementById('wpadminbar');
			var sky = Math.max(16, lid ? lid.getBoundingClientRect().bottom + 8 : 0);
			panel.style.setProperty('--panel-anchor-max', Math.max(120, Math.round(r.top - 8 - sky)) + 'px');
			panel.style.setProperty('--panel-anchor-right', Math.max(8, Math.min(window.innerWidth - w - 8, Math.round(window.innerWidth - cx - w / 2))) + 'px');
			panel.style.transformOrigin = 'center bottom';
			return;
		}
		panel.style.transformOrigin = '';
		/* Under a trigger in the upper half, above one in the lower (the rail's Aa, without the frame). */
		var above = r.top > window.innerHeight / 2;
		panel.classList.toggle('is-above', above);
		panel.style.setProperty('--panel-anchor-top', Math.round(r.bottom + 8) + 'px');
		panel.style.setProperty('--panel-anchor-bottom', Math.round(window.innerHeight - r.top + 8) + 'px'); /* measured with real frames: the 8 that seemed to be added was the opening animation's first frame, held by a hidden tab */
		panel.style.setProperty('--panel-anchor-right', Math.max(8, Math.round(window.innerWidth - r.right)) + 'px');
	}
	window.addEventListener('resize', function () { if (panel && !panel.hidden) anchor(); });
	window.addEventListener('architrave-panel-anchor', function () { if (panel && !panel.hidden) anchor(); }); /* the pill was dragged (panel-opener.js) */
	window.addEventListener('scroll', function () { if (panel && !panel.hidden) anchor(); }, { passive: true });
	function close() {
		if (!panel || panel.hidden || morph.shutting()) return;
		scrim.hidden = true;
		/* The door is told at once, not when the roll lands: a second press
		   during the roll must read as "open it again", which is what makes the
		   gesture reversible. Focus goes back the same moment, so nothing is
		   left standing inside a panel on its way out. */
		document.querySelectorAll('[data-reading-panel-open]').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
		var flowing = morph.live();
		if (flowing) morph.unhide(); /* the button is back in the page, still clear, to take the focus */
		if (trigger) trigger.focus({ preventScroll: true });
		if (flowing) morph.close(function () { panel.hidden = true; });
		else rollShut(function () { panel.hidden = true; sheet.clear(); });
	}
	/* OPEN FROM ELSEWHERE (2026-09-27): the new window asked for a page of this one by
	   number. There is one page now, so any number opens it. The door the panel
	   stands on is the one a press would use. */
	function openAt(lvl, btn) {
		if (!panel) return false;
		var door = btn || Array.prototype.filter.call(document.querySelectorAll('[data-reading-panel-open]'), function (b) { return b.getClientRects().length && getComputedStyle(b).visibility !== 'hidden'; })[0] || document.querySelector('.architrave-panel-opener');
		if (!door) return false;
		open(door);
		return true;
	}
	window.ArchitraveReadingPanel = { close: close, openAt: openAt };
	window.addEventListener('architrave-button-settings', function (e) { var st = e.detail && e.detail.settings; if (panel && st && trigger && trigger.classList.contains('architrave-panel-opener')) panel.toggleAttribute('data-door-aurora', String(st.aurora) === 'true'); });

	document.addEventListener('DOMContentLoaded', function () {
		if (!document.querySelector('[data-reading-panel-open]')) return;
		panel = document.createElement('div');
		panel.className = 'reading-panel quire-surface';
		panel.setAttribute('role', 'dialog');
		panel.setAttribute('aria-labelledby', 'reading-panel-title'); /* the level's title names it (the audit, 2026-09-13) */
		panel.hidden = true;
		/* THE PANEL CAN BE MOVED (Manuel, 2026-09-19: "is it possible to give that menu a little dragger?"). It stands over the page it is changing, and what the reader is judging is often under it. The head is the handle, with a small grabber drawn on it (style.css); a drag moves the panel by the CSS `translate` property, which the placement code never touches, so every level opens where the reader left it. Kept inside the window; a double press on the head sends it home; above the breakpoint only, since the phone's sheet is fixed to the foot. Pointer events on the panel itself, because the head is rewritten with every level. */
		(function () {
			var drag = null, at = { x: 0, y: 0 };
			/* A WINDOW'S HEIGHT (Manuel, 2026-09-24: "like an Apple window would behave"). The
			   panel's free edge, the foot when it hangs down, the top when it stands up, is
			   taken hold of and pulled, and the height it is given is kept in this browser as
			   the most it will be; a page shorter than that is as tall as it is. Never shorter
			   than MIN_H. And carried down against the window's foot it gets shorter, its top
			   under the hand and its body scrolling, instead of stopping (Manuel: "I would
			   expect that it squeezes"); carried back up it grows again, to its kept height. */
			var HKEY = 'ldp-panel-height', MIN_H = 240, resize = null;
			var kept = (function () { try { return +localStorage.getItem(HKEY) || 0; } catch (e) { return 0; } })();
			function cap(h) { if (h) panel.style.setProperty('--panel-user-max', Math.round(h) + 'px'); else panel.style.removeProperty('--panel-user-max'); }
			cap(kept);
			function above() { return panel.classList.contains('is-above'); }
			function zone(e) {
				if (!window.matchMedia('(min-width: 1010px)').matches || panel.hidden) return null;
				var b = panel.getBoundingClientRect();
				if (e.clientX < b.left || e.clientX > b.right) return null;
				if (above()) return e.clientY >= b.top && e.clientY <= b.top + 6 ? 'top' : null;
				return e.clientY <= b.bottom && e.clientY >= b.bottom - 8 ? 'bottom' : null;
			}
			function roofY() { var bar = document.getElementById('wpadminbar'); return 8 + (bar ? Math.max(0, bar.getBoundingClientRect().bottom) : 0); }
			/* THE WHOLE TOP OF THE PANEL IS THE HANDLE (Manuel, 2026-09-19: "you can only grab it underneath the grabber … the whole top area should be grabbable"). The grabber bar is drawn in the panel's top padding, above the head, and only the head answered: the bar itself was the one place that did not. The handle is everything from the panel's top edge to the head's foot, across its whole width, except the head's own buttons. The same test lights the grabber (data-grab), so what shows the hover is exactly what takes the drag. */
			function inHandle(e) {
				if (!window.matchMedia('(min-width: 1010px)').matches) return false;
				var head = panel.querySelector('.reading-panel-head'); if (!head) return false;
				if (e.target.closest && e.target.closest('button, a, input, [role="menu"]')) return false;
				if (zone(e)) return false; /* the edge above the head is a window's edge, for its height */
				return e.clientY <= head.getBoundingClientRect().bottom;
			}
			panel.addEventListener('pointermove', function (e) { var z = resize ? resize.z : zone(e); if (z) panel.setAttribute('data-resize-zone', z); else panel.removeAttribute('data-resize-zone'); });
			panel.addEventListener('pointerleave', function () { if (!resize) panel.removeAttribute('data-resize-zone'); });
			panel.addEventListener('pointerdown', function (e) {
				var z = zone(e); if (!z || e.button !== 0 || drag) return;
				resize = { z: z, y: e.clientY, h: panel.offsetHeight };
				panel.setAttribute('data-resizing', '');
				try { panel.setPointerCapture(e.pointerId); } catch (x) { /* followed while over the panel */ }
				e.preventDefault(); e.stopImmediatePropagation();
			});
			panel.addEventListener('pointermove', function (e) {
				if (!resize) return;
				var h = resize.h + (resize.z === 'top' ? resize.y - e.clientY : e.clientY - resize.y);
				resize.want = Math.max(MIN_H, Math.round(h)); cap(resize.want);
			});
			var resized = function () {
				if (!resize) return;
				if (resize.want) { kept = resize.want; try { localStorage.setItem(HKEY, String(kept)); } catch (x) { /* private mode: kept for this page */ } }
				resize = null; panel.removeAttribute('data-resizing');
			};
			panel.addEventListener('pointerup', resized);
			panel.addEventListener('pointercancel', resized);
			panel.addEventListener('pointermove', function (e) { var on = !!drag || inHandle(e); if (on !== panel.hasAttribute('data-grab')) { if (on) panel.setAttribute('data-grab', ''); else panel.removeAttribute('data-grab'); } });
			panel.addEventListener('pointerleave', function () { if (!drag) panel.removeAttribute('data-grab'); });
			/* WHERE THE DRAG LANDS. On a theme's own door the panel carries
			   itself, by its `translate`. On the plugin's pill the pill is the
			   thing that moves and the panel is placed on it (anchor), so the
			   same gesture is handed to the pill and the panel never leaves it
			   (Manuel, 2026-09-22; panel-opener.js, THE PANEL IS CARRIED BY THE
			   SAME HAND). */
			/* A DOCKED DOOR STAYS IN ITS ROW AND THE PANEL COMES AWAY FROM IT (Manuel,
			   2026-09-23: "it could be dragged out, like the panel, away from the
			   button"; macOS lets a popover be pulled off its button the same way):
			   the head then drags the panel alone, as it does on any other door. */
			function pill() { return trigger && trigger.classList && trigger.classList.contains('architrave-panel-opener') && !trigger.hasAttribute('data-docked') && window.ArchitravePanelOpener ? window.ArchitravePanelOpener : null; }
			function put() {
				var o = pill();
				if (o) { panel.style.translate = ''; return; }
				panel.style.translate = (at.x || at.y) ? at.x + 'px ' + at.y + 'px' : '';
			}
			panel.addEventListener('pointerdown', function (e) {
				if (!inHandle(e) || e.button !== 0) return;
				var box = panel.getBoundingClientRect(), o = pill();
				if (o) { var p0 = o.at(); at.x = p0.x; at.y = p0.y; }
				drag = { x: e.clientX, y: e.clientY, ox: at.x, oy: at.y, left: box.left - at.x, top: box.top - at.y, w: box.width, h: box.height, pill: !!o };
				/* the height it may take while carried: its kept height, or the page's own */
				var was = panel.style.getPropertyValue('--panel-user-max'); cap(kept); drag.full = panel.offsetHeight; if (was) panel.style.setProperty('--panel-user-max', was); else cap(0);
				drag.startTop = box.top; drag.base = above() ? box.bottom - at.y : box.top - at.y;
				panel.setAttribute('data-dragging', ''); morph.carried(true);
				try { panel.setPointerCapture(e.pointerId); } catch (x) { /* not capturable: the drag still follows while the pointer is over the panel */ }
				e.preventDefault();
			});
			panel.addEventListener('pointermove', function (e) {
				if (!drag) return;
				var nx = drag.ox + e.clientX - drag.x, ny = drag.oy + e.clientY - drag.y, edge = 8;
				/* HELD BY ITS HEAD, IT STOPS AT THE WINDOW'S TOP (Manuel, 2026-09-24: carried up
				   against the top, "my mouse cursor is going further up … the long window is
				   getting shorter from the bottom … it feels awkward"). The button went on
				   rising under a panel that could not, so the panel was squeezed from its
				   foot while the hand left its head. A Mac window stops at the menu bar at
				   its own size and the pointer goes on alone; so does this one, and it
				   follows again when the hand comes back down to where it held it. */
				if (drag.pill && above()) ny = Math.max(ny, drag.oy + Math.min(0, roofY() - drag.startTop));
				if (drag.pill) { at.x = nx; at.y = ny; pill().moveBy(nx, ny); return; } /* the pill keeps itself inside the window, and the panel follows it */
				nx = Math.max(edge - drag.left, Math.min(window.innerWidth - edge - drag.w - drag.left, nx));
				/* THE TOP FOLLOWS THE HAND, THE HEIGHT FITS WHAT IS LEFT BELOW IT (see A WINDOW'S HEIGHT):
				   not under WordPress's toolbar, where the handle could not be reached again, and
				   never shorter than MIN_H. */
				var foot = window.innerHeight - edge, top = Math.max(roofY(), Math.min(foot - Math.min(MIN_H, drag.full), drag.startTop + e.clientY - drag.y));
				var h = Math.max(Math.min(MIN_H, drag.full), Math.min(drag.full, foot - top));
				cap(h < drag.full ? h : kept);
				ny = above() ? top + h - drag.base : top - drag.base;
				at.x = Math.round(nx); at.y = Math.round(ny); put();
			});
			/* A MOVED PANEL THAT GROWS STAYS IN REACH (Manuel, the same evening: dragged up, then Typografie and Überschriften, "the panel grows so much that the top of it is underneath the WordPress admin and I cannot move it anymore"). The panel is pinned by its foot and grows upwards, so a taller level pushed the head out of the window. Whenever its size changes while it is moved, it is slid back until the head is under the toolbar and the foot inside the window; the head wins where both cannot be had, since the head is the handle. */
			function keepInReach() {
				if (drag || panel.hidden || pill() || !(at.x || at.y)) return; /* on the pill, the pill is what is kept in reach */
				var box = panel.getBoundingClientRect(), edge = 8, bar = document.getElementById('wpadminbar'), roof = edge + (bar ? Math.max(0, bar.getBoundingClientRect().bottom) : 0), y = at.y;
				if (box.bottom > window.innerHeight - edge) y -= box.bottom - (window.innerHeight - edge);
				if (box.top + (y - at.y) < roof) y += roof - (box.top + (y - at.y));
				var x = at.x; if (box.left < edge) x += edge - box.left; else if (box.right > window.innerWidth - edge) x -= box.right - (window.innerWidth - edge);
				if (y !== at.y || x !== at.x) { at.y = Math.round(y); at.x = Math.round(x); put(); }
			}
			if (window.ResizeObserver) new ResizeObserver(keepInReach).observe(panel);
			/* A NEW PLACE FOR THE BUTTON TAKES THE PANEL HOME WITH IT (Manuel, 2026-09-24:
			   the panel moved up while the button sat in the site's corner, then
			   Automatic switched off, and the panel grew off the top of the window).
			   The move belonged to the old place: the button went to the window's
			   corner, the panel stood over it still shifted up, and grew from there.
			   Whenever the button's place changes, the panel's own move is forgotten
			   and it stands where its button puts it, as it does when it opens. */
			window.addEventListener('architrave-button-settings', function (e) {
				if (drag || !e.detail || e.detail.picked !== 'place') return; /* a new size or colour leaves the panel where it is */
				at.x = 0; at.y = 0; put();
				requestAnimationFrame(function () { anchor(); keepInReach(); });
			});
			var end = function () { if (!drag) return; var was = drag.pill; drag = null; panel.removeAttribute('data-dragging'); morph.carried(false); if (was && pill()) pill().done(); };
			panel.addEventListener('pointerup', end);
			panel.addEventListener('pointercancel', end);
			panel.addEventListener('dblclick', function (e) { if (!inHandle(e)) return; kept = 0; cap(0); try { localStorage.removeItem(HKEY); } catch (x) { /* private mode */ } at.x = 0; at.y = 0; if (pill()) pill().rest(); else put(); });
			window.addEventListener('resize', function () { if (pill()) return; if (at.x || at.y) { at.x = 0; at.y = 0; put(); } });
		})();
		scrim = document.createElement('div');
		scrim.className = 'reading-panel-scrim';
		scrim.hidden = true;
		document.body.appendChild(scrim);
		panel.addEventListener('pointerdown', sheet.down);
		panel.addEventListener('pointermove', sheet.move);
		panel.addEventListener('pointerup', sheet.up);
		panel.addEventListener('pointercancel', sheet.up);
		document.body.appendChild(panel);
		/* THE PANEL ITSELF NEVER SCROLLS, ITS BODY DOES (Manuel, 2026-09-24: the head
		   with its title and back button had gone off the top). A box with its
		   overflow hidden can still be scrolled by the browser, when a control
		   near its foot takes the focus; the head then left with the rows. */
		panel.addEventListener('scroll', function () {
			if (getComputedStyle(panel).overflowY !== 'hidden') return; /* a sheet that scrolls as a whole (a phone) is left alone */
			if (panel.scrollTop) panel.scrollTop = 0;
			if (panel.scrollLeft) panel.scrollLeft = 0;
		});
		/* THE DOOR IS DRESSED BEFORE IT IS EVER PRESSED (measured 2026-09-22: a
		   pill on a page nobody had opened the panel on stood a grey lighter
		   than the panel it belongs to, because the side is stamped while the
		   panel is drawn and the panel is drawn when it is opened). The reader
		   sees the door first, so it takes its room first. */
		(function () {
			var n = now(), side = n.resolvedSide === 'dark' ? 'dark' : 'light';
			document.querySelectorAll('.architrave-panel-opener').forEach(function (o) {
				o.setAttribute('data-panel-side', side);
				o.classList.toggle('theme-neutral-dark', side === 'dark');
				o.classList.toggle('theme-neutral-light', side !== 'dark');
			});
		}());

		new MutationObserver(function () { render(); }).observe(root, {
			attributes: true,
			attributeFilter: ['data-tint', 'data-sans', 'data-theme', 'data-style', Reading.attribute, 'data-face', 'data-leading', 'data-justify', 'data-hyphens', 'data-dropcap', 'data-dropcap-lines', 'data-rounded', 'data-lines', 'data-hairlines', 'data-darkground', 'data-widehead', 'data-scope', 'data-fills', 'data-accent', 'data-focus-mode', 'data-pictures', 'data-picturehover', 'data-picturedim', 'data-picturefade', 'data-pictureframe', 'data-soft', 'data-scanlines', 'data-glow', 'data-grain', 'data-vignette', 'data-line-style', 'data-dots', 'data-marker', 'data-marker-colour', 'data-button', 'data-tagsfollow', 'data-button-shape', 'data-button-style', 'data-line-width', 'data-cards', 'data-head-align', 'data-kicker-align', 'data-head-colour', 'data-kicker-colour', 'data-head-m-sub-align', 'data-widepicture', 'data-categories', 'data-links', 'data-small-soft', 'data-frame-pattern', 'data-measure', 'data-frame-width']
		});
		window.addEventListener('resize', function () {
			// Across the breakpoint the open panel changes shape: column or sheet.
			if (panel && !panel.hidden) { anchor(); render(); }
		});

		document.addEventListener('click', function (e) {
			if (pressing) return;
			var opener = e.target.closest('[data-reading-panel-open]');
			if (opener) {
				e.preventDefault();
				/* THE NEW WINDOW, WHERE IT IS MOUNTED (2026-09-27, window.php): it takes the press. */
				if (panel.hidden && window.LiveDesignWindow && window.LiveDesignWindow.takes && window.LiveDesignWindow.takes(opener)) return;
				if (panel.hidden || morph.shutting() || trigger !== opener) open(opener); else close();
				return;
			} /* a press while it flows home opens it again */
			if (panel.hidden) return;
			/* A PRESS OUTSIDE CLOSES, on both placements (Manuel, 2026-09-14): the
			   popover has no X; a press in the page, on the rail or on the comments
			   closes it, as a menu closes. Only a real pointer closes: a click the
			   scripts make is not a tap outside (Manuel, 2026-09-11). */
			if (!panel.contains(e.target)) { if (e.isTrusted) close(); return; }
			var b = e.target.closest('button');
			if (!b) return;
			if (b.getAttribute('aria-disabled') === 'true') return;
			if (b.hasAttribute('data-panel-close')) { close(); return; }
			var n = now();
			if (b.hasAttribute('data-panel-size')) {
				var i = Reading.ids.indexOf(n.reading) + (b.getAttribute('data-panel-size') === 'up' ? 1 : -1);
				if (Reading.ids[i]) press('[data-quire-reading] [data-reading-step="' + Reading.ids[i] + '"]');
				stepped();
			} else if (b.hasAttribute('data-panel-side')) {
				press(PALETTE + '[data-side="' + b.getAttribute('data-panel-side') + '"]');
			} else if (b.hasAttribute('data-panel-style')) {
				press('[data-architrave-presets] [data-preset="' + b.getAttribute('data-panel-style') + '"]');
			} else if (b.hasAttribute('data-panel-copy-link')) {
				var link = Styles.shareLink ? Styles.shareLink(true) : ''; /* the whole style in the link, so it lands on any site (2026-09-23) */
				if (link && navigator.clipboard) navigator.clipboard.writeText(link).then(function () {
					linkCopied = true; render();
					clearTimeout(panel.__linkCopiedTimer);
					panel.__linkCopiedTimer = setTimeout(function () { linkCopied = false; render(); }, 1200);
				}).catch(function () { /* the clipboard was refused; the button says nothing */ });
			}
			// What the press changed is read back once it has landed.
			setTimeout(function () { render(); }, 0);
		});
		/* A LONG PRESS ON A TILE OPENS NO MENU on a phone (2026-09-24). */
		document.addEventListener('contextmenu', function (e) {
			var tile = e.target && e.target.closest && e.target.closest('.reading-panel .reading-tile');
			if (tile && e.pointerType === 'touch') e.preventDefault();
		});
		/* Which the sheet last heard. A press says pointer; Tab, the arrows,
		   Enter, Space and Escape say keyboard, and the ring returns with them. */
		document.addEventListener('pointerdown', function () { inputMode = 'pointer'; if (panel) panel.setAttribute('data-input', 'pointer'); }, true);
		document.addEventListener('keydown', function (e) {
			if (e.key === 'Tab' || e.key === 'Enter' || e.key === ' ' || e.key === 'Escape' || e.key.indexOf('Arrow') === 0) { inputMode = 'keyboard'; if (panel) panel.setAttribute('data-input', 'keyboard'); }
		}, true);
		/* ⌥D OPENS AND CLOSES THE PANEL (Manuel, 2026-09-23, the layout pass). Not ⌘,:
		   in Safari and Chrome that is the browser's own Settings, and Apple's HIG
		   says not to take over a standard shortcut. D for Design, beside ⌥C for
		   Contents; e.code, because ⌥D types "∂" on a Mac. Not while typing. */
		document.addEventListener('keydown', function (e) {
			if (!e.altKey || e.metaKey || e.ctrlKey || e.shiftKey || e.code !== 'KeyD') return;
			if (e.target && e.target.closest && e.target.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"]')) return;
			e.preventDefault();
			if (panel && !panel.hidden) { close(); return; }
			var door = Array.prototype.filter.call(document.querySelectorAll('[data-reading-panel-open]'), function (b) { return b.getClientRects().length && getComputedStyle(b).visibility !== 'hidden'; })[0];
			/* A DOOR FOLDED INTO A CLOSED MENU STILL OPENS (2026-09-24, Extendable and
			   Raft on a phone: the crowded header put the door in the menu, folded away
			   behind the menu's own button, and ⌥D found no door to press). The panel
			   then opens the way it would from that door. */
			if (!door) door = document.querySelector('.architrave-panel-opener[data-folded]');
			if (door) door.click();
		});
		/* ARROW KEYS IN A GROUP OF RADIOS (2026-09-23, the layout pass, keyboard and
		   VoiceOver): the style tiles, the colour presets, Light/Dark/System and
		   the segmented switches are radio groups, and a radio group moves with
		   the arrows: left and right one step, up and down one row of a grid. The
		   press re-renders the panel, so the new choice takes the focus after it. */
		document.addEventListener('keydown', function (e) {
			if (!panel || panel.hidden || ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].indexOf(e.key) === -1) return;
			var me = e.target && e.target.closest && e.target.closest('.reading-panel [role="radio"]');
			var group = me && me.closest('[role="radiogroup"]');
			if (!group) return;
			var radios = Array.prototype.slice.call(group.querySelectorAll('[role="radio"]')).filter(function (x) { return !x.disabled && x.getClientRects().length; });
			var at = radios.indexOf(me); if (at < 0) return;
			var cols = 1;
			if (radios.length > 1) { var top0 = radios[0].getBoundingClientRect().top; cols = radios.filter(function (x) { return Math.abs(x.getBoundingClientRect().top - top0) < 2; }).length || 1; }
			var step = e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowRight' ? 1 : (cols > 1 ? (e.key === 'ArrowUp' ? -cols : cols) : (e.key === 'ArrowUp' ? -1 : 1));
			var to = radios[Math.max(0, Math.min(radios.length - 1, at + step))];
			if (!to || to === me) return;
			e.preventDefault();
			var key = Array.prototype.filter.call(to.attributes, function (x) { return /^data-panel-/.test(x.name); }).map(function (x) { return '[' + x.name + '="' + x.value.replace(/"/g, '\\"') + '"]'; }).join('');
			to.click();
			setTimeout(function () { var again = key && panel.querySelector(key); if (again) again.focus({ preventScroll: false }); }, 60);
		});
		document.addEventListener('keydown', function (e) {
			/* ⌘Z / Ctrl+Z while the panel is open, and not while a field is being typed in, where it is the field's own. */
			if ((e.metaKey || e.ctrlKey) && !e.shiftKey && (e.key === 'z' || e.key === 'Z') && panel && !panel.hidden && !(e.target && e.target.closest && e.target.closest('input, textarea')) && Styles.canUndo && Styles.canUndo()) { e.preventDefault(); Styles.undo(); return; }
			if (e.key === 'Escape' && panel && !panel.hidden && !document.querySelector('.rail-more-trigger[aria-expanded="true"], .rail-more-sub:not([hidden])')) { e.preventDefault(); close(); }
			/* TAB STAYS INSIDE THE OPEN PANEL (2026-09-12, the audit): a
			   dialog over a scrim keeps the keyboard, wrapping at its ends. */
			if (e.key === 'Tab' && panel && !panel.hidden && isPhone()) {
				var f = Array.prototype.filter.call(panel.querySelectorAll('button:not([disabled]), [href], input, [tabindex]:not([tabindex="-1"])'), function (el) { return el.offsetParent !== null; });
				if (!f.length) return;
				var first = f[0], last = f[f.length - 1], cur = document.activeElement;
				if (e.shiftKey && (cur === first || !panel.contains(cur))) { e.preventDefault(); last.focus(); }
				else if (!e.shiftKey && (cur === last || !panel.contains(cur))) { e.preventDefault(); first.focus(); }
			}
		});
	});
})();
