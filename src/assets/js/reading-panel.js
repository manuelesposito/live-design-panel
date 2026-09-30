/**
 * Architrave — the reading panel.
 *
 * One Aa button, and under it everything a reader can set: the style, the
 * size, the side, and behind Anpassen the font, the line spacing and Book's
 * two switches. Apple Books' "Themes & Settings" anatomy, decided on
 * lab/the-reading-panel.html (2026-09-09, Manuel: "do it the Apple way").
 *
 * IT PRESSES THE ROWS THAT ALREADY EXIST. Every dial has its own script,
 * storage, attribute and marks (reading-scale.js, reading-face.js,
 * reading-leading.js, color-mode.js, presets.js), and their rows stand in the
 * More menu's flyouts whether the flyouts are shown or not. This panel is a
 * second face on the same controls: a press here clicks the row a reader
 * would have clicked there, and what the panel SHOWS is read back from
 * <html>, never from its own memory. So nothing is stored twice and nothing
 * can disagree.
 *
 * DESKTOP: a column on the right, a paper beside the article's, open while
 * you read (Manuel, 2026-09-13; lab/the-settings-on-a-paper.html). PHONE: a
 * sheet from the foot over a scrim. The same markup, two placements.
 */
(function () {
	var root = document.documentElement;
	var Modes = window.QuireModes, Reading = window.QuireReading, Icons = window.QuireIcons, Styles = window.ArchitraveStyles;
	var WORDS = window.architraveWords || {};
	/* WHAT CANNOT REACH A STRANGER'S PAGE (0.9.0). Where the panel is a guest the
	   plugin hands it a list of dials with nothing to name on a plain block theme:
	   a role's size needs a size of its own to multiply and only the article's
	   paragraphs inherit one, the members are Architrave's own parts, and
	   Interface titles is the rail's titled sections, which a plain theme has none
	   of. A row that cannot work is GREYED WITH A DEAD CONTROL AND NO LINE UNDER
	   IT (Manuel, 2026-09-17: "when something is not available just toggle off …
	   but no description line please"), the way Italic greys on a face without
	   one. On Architrave the list is undefined and every row is live. */
	var LIMITS = window.architravePanelGuestLimits || [];
	/* AND WHAT CANNOT REACH IT WHILE THE THEME'S OWN LOOK IS ON. A second list,
	   for the switches that spend the colour room: Glow, Soft, Fills and Lines
	   paint with the room's ink and paper, and on the theme's own look no room
	   is painted, so on Twenty Twenty-Five Glow put the dark room's halo on a
	   white page and Soft set the reading text in the dark room's grey
	   (measured 2026-09-22). They wake the moment a look is chosen. */
	var HOST_LIMITS = window.architravePanelGuestHostLimits || [];
	/* AND WHAT IS NOT THERE AT ALL IS NOT SHOWN AT ALL (Manuel, 2026-09-22: "if
	   there is never an interface title on the 2025, why should we have that
	   grayed-out text?"). Greying says "not now"; this list says "not here", and
	   its rows are left out. The panel already left the members row out for
	   exactly this reason, so this is the one rule written down. */
	var GONE = window.architravePanelGuestGone || [];
	function gone(what) { return GONE.indexOf(what) !== -1; }
	function dead(what) {
		if (LIMITS.indexOf(what) !== -1) return true;
		return HOST_LIMITS.indexOf(what) !== -1 && !!(Styles && Styles.current && Styles.current() === 'host');
	}
	function t(word) { return WORDS[word] || word; }
	function icon(name, attrs) { return Icons && Icons.markup ? Icons.markup(name, attrs || '') : ''; }
	if (!Styles || !Reading) return;

	var FACES = window.ArchitraveFaces || [];
	/* Mirrored, as Apple names a ladder (the audit, 2026-09-13): Sehr eng, Enger, Eng, Normal, Weit, Weiter, Sehr weit. */
	/* Thirteen steps each way, the id the number (presets.js TRACK, WORDS). */
	var SPACING_STEPS = ['m25', 'm22', 'm20', 'm17', 'm15', 'm12', 'm10', 'm7', 'm5', 'm2', 'default', 'p2', 'p5', 'p7', 'p10', 'p12', 'p15', 'p17', 'p20', 'p22', 'p25']; /* twenty-one since 2026-09-18 (Manuel: "a little bit more values") */
	function spacingWord(id) { if (id === 'default') return '0%'; var n = id.slice(1); n = ({ '1': '1.25', '2': '2.5', '7': '7.5', '12': '12.5', '17': '17.5', '22': '22.5' })[n] || n; return (id.charAt(0) === 'm' ? '-' : '+') + n + '%'; }
	/* Letter spacing has a half step either side of normal (presets.js TRACK, 2026-09-26); word spacing does not. */
	var TRACKING = SPACING_STEPS.slice(0, 10).concat(['m1', 'default', 'p1'], SPACING_STEPS.slice(11)).map(function (id) { return { id: id, label: spacingWord(id) }; });
	var WORDSPACE = SPACING_STEPS.map(function (id) { return { id: id, label: spacingWord(id) }; });
	/* ZEILENABSTAND READS ITS NUMBER (Manuel, 2026-09-16: "it's actually a
	   little bit confusing that we don't have a number at Zeilenabstand, while
	   the others have one"). The reading text's nine steps ARE line-heights,
	   so they say so; a role's step is a share of its own line-height, so its
	   number is measured on the page and scaled, the way the sizes are. */
	var LEADING = [{ id: 'solid', label: '0.9' }, { id: 'packed', label: '1.0' }, { id: 'close', label: '1.1' }, { id: 'densest', label: '1.2' }, { id: 'dense', label: '1.3' }, { id: 'tight', label: '1.45' }, { id: 'snug', label: '1.5' }, { id: 'default', label: '1.6' }, { id: 'relaxed', label: '1.7' }, { id: 'airy', label: '1.8' }, { id: 'wider', label: '1.9' }, { id: 'wide', label: '2.0' }, { id: 'open', label: '2.2' }, { id: 'loose', label: '2.4' }, { id: 'loosest', label: '2.6' }]; /* fifteen since 2026-09-18 */
	var LEAD_SHARE = { solid: 0.56, packed: 0.62, close: 0.69, densest: 0.75, dense: 0.85, tight: 0.92, snug: 0.96, 'default': 1, relaxed: 1.06, airy: 1.1, wider: 1.15, wide: 1.25, open: 1.37, loose: 1.5, loosest: 1.62 };
	function roleLeadList(role, now) {
		var el = ROLE_PROBE[role] ? document.querySelector(ROLE_PROBE[role]) : null, ratio = 0;
		if (el) {
			var cs = getComputedStyle(el), px = parseFloat(cs.fontSize), lh = parseFloat(cs.lineHeight);
			if (px > 0 && lh > 0) ratio = lh / px;
		}
		var base = ratio && LEAD_SHARE[now] ? ratio / LEAD_SHARE[now] : 0;
		return LEADING.map(function (s) { return { id: s.id, label: base ? (base * LEAD_SHARE[s.id]).toFixed(2) : s.label }; });
	}
	/* Google Fonts' names for the nine weights (Manuel, 2026-09-13). 'Light'
	   would collide with the side's word in the word list, so it goes
	   through its own key. */
	var WEIGHT_LABEL = { thin: 'Thin', extralight: 'Extra Light', light: 'Weight Light', regular: 'Regular', medium: 'Medium', semibold: 'Semi Bold', bold: 'Bold', extrabold: 'Extra Bold', black: 'Black' };
	var WEIGHT_NUMBER = { thin: 100, extralight: 200, light: 300, regular: 400, medium: 500, semibold: 600, bold: 700, extrabold: 800, black: 900 };
	function weightWord(w) { return t(WEIGHT_LABEL[w] || w); }
	/* Words, not percentages (the audit, 2026-09-13: Books shows readers words). */
	/* SPACE'S THREE WORDS (2026-09-25, lab/the-space-of-a-page.html): Apple's own for a denser and a looser layout. */
	var SPACE_WORD = { xcompact: 'Extra compact', compact: 'Compact', standard: 'Standard', spacious: 'Spacious', xspacious: 'Extra spacious' };
	/* A slider whose stops are words, not numbers (the dot grid's size, 2026-09-25) */
	var LEVEL_WORD = { space: SPACE_WORD, dotsize: { '16': 'Fine', '24': 'Medium', '32': 'Wide' } };
	var SIZE_WORD = { '50': 'Tiny', '65': 'Very small', '80': 'Small', '90': 'Slightly smaller', '100': 'Normal', '110': 'Slightly larger', '120': 'Large', '135': 'Very large', '150': 'Huge' };
	/* THE LIVE DESIGN BUTTON'S WORDS (2026-09-23): each setting's values, in the order its menu lists them. */
	var BUTTON_WORD = {
		place: { auto: 'Automatic', 'top-left': 'Top left', 'top-right': 'Top right', left: 'Left side', right: 'Right side', 'bottom-left': 'Bottom left', 'bottom-center': 'Bottom centre', 'bottom-right': 'Bottom right' },
		size: { small: 'Small', medium: 'Medium', large: 'Large' },
		color: { panel: 'Panel', site: 'Site colour' }, /* one colour of the site's, not two that came out the same (Manuel, 2026-09-23: Accent was the panel's blue, and the site's accent and buttons are one colour on Architrave) */
		who: { everyone: 'Everyone', me: 'Only me' },
		show: { icon: 'Icon', both: 'Icon and name', hover: 'Name on hover' }, /* what it shows, its own setting since 2026-09-24 (it followed the size) */
		corners: { site: 'Like the site', round: 'Round' }
	};
	var BUTTON_ORDER = { size: ['small', 'medium', 'large'], show: ['icon', 'both', 'hover'], color: ['panel', 'site'], corners: ['site', 'round'] };
	/* Whether a tile has anything for its right-click menu (the menu itself is render's publishItems). */
	/* A NEW ORDER FOR WHAT EVERYONE SEES; when its first place changes, the panel
	   says so for five seconds with a way back. */
	/* A REFUSED WRITE SPEAKS (Manuel, 2026-09-26, after a tile "always jumps back
	   into hidden" and nothing said why: "yes, go"). publishFailed labelled only
	   the Save button on the Customise page, so a refusal from a tile's menu had no
	   voice. The site's own words now stand in the foot notice for five seconds,
	   where "X is now the site default" already speaks, without Undo. */
	/* THE OWNER'S WINDOW (2026-09-27, window.php): saved through its route. Turned on,
	   the new window's sheet and two scripts are loaded there and then from the
	   addresses the answer carries, so the next press of the door opens it; at the
	   default none of them is on the page. */
	function windowChoice(v) {
		var W = window.liveDesignWindow;
		return fetch(W.url, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': W.nonce }, body: JSON.stringify({ window: v }) })
			.then(function (r) { if (!r.ok) throw new Error(t('Could not change the window')); return r.json(); })
			.then(function (a) {
				W.window = W.now = a.window === 'new' ? 'new' : 'current';
				var boot = a.boot;
				if (W.now !== 'new' || !boot || window.LiveDesignWindow || document.querySelector('script[data-live-design-window]')) return;
				window.LiveDesignWindowBoot = { words: boot.words, sections: boot.sections, settings: boot.settings, roles: boot.roles };
				var css = document.createElement('link'); css.rel = 'stylesheet'; css.href = boot.css; document.head.appendChild(css);
				(boot.js || []).forEach(function (src) { var js = document.createElement('script'); js.src = src; js.async = false; js.setAttribute('data-live-design-window', ''); document.body.appendChild(js); });
			});
	}
	function refused(e) {
		publishFailed = true;
		var word = e && e.message && !/^\d+$/.test(e.message) && e.message !== 'cannot publish' ? e.message : t('Could not publish');
		notice = { text: word.replace(/&/g, '&amp;').replace(/</g, '&lt;') };
		clearTimeout(newOrder.timer);
		newOrder.timer = setTimeout(function () { notice = null; if (panel && !panel.hidden) render(); }, 5000);
		render();
	}
	function newOrder(order) {
		var was = Styles.visibleOrder(), wasFirst = was[0];
		Styles.setVisible(order).then(function () {
			publishFailed = false;
			var now = Styles.visibleOrder();
			if (now[0] !== wasFirst) {
				var st = Styles.list.filter(function (x) { return x.id === now[0]; })[0];
				notice = { text: t('{name} is now the site default').replace('{name}', st ? t(st.label) : ''), undo: was };
				clearTimeout(newOrder.timer);
				newOrder.timer = setTimeout(function () { notice = null; if (panel && !panel.hidden) render(); }, 5000);
			}
			render();
		}, refused);
		render(); /* the grid has moved already */
	}
	function madeDefault(id) { newOrder([id].concat(Styles.visibleOrder().filter(function (x) { return x !== id; }))); }
	function publishItemsFor(id) {
		if (!(Styles.canPublish && Styles.canPublish())) return false;
		var st = Styles.list.filter(function (x) { return x.id === id; })[0]; if (!st) return false;
		var def = Styles.readerFirst ? Styles.readerFirst() : '';
		return true; /* every tile has one: Make site default, or the tick that says it is (2026-09-24, guests too) */
	}
	var BUTTON_SPOTS = ['top-left', 'top-right', 'left', 'right', 'bottom-left', 'bottom-center', 'bottom-right'];
	function sizeWord(id) { return id === 'text' ? t('Same as text') : t(SIZE_WORD[id] || id); }
	/* THE SIZE IN PIXELS (Manuel, 2026-09-16: "an indicator that shows on
	   fontsize the pixel value so we could dial all fontsizes to the same
	   pixelvalue if we want to"). Words say bigger and smaller; they cannot
	   say that the headings and the reading text now meet. So each role's
	   step reads the size it actually paints, measured on the page where the
	   role shows, not computed from tokens that the room and the ladder both
	   move. Nothing to measure (a page without quotes): the words return. */
	var ROLE_PROBE = {
		head: '.single-post-article .wp-block-post-content > :is(h1, h2, h3), .single-post-article .wp-block-post-title, .post-card .wp-block-post-title',
		read: '.single-post-article .wp-block-post-content > p, .post-card :is(.wp-block-post-excerpt, .entry-content) > p',
		quote: '.single-post-article .wp-block-post-content blockquote > p, blockquote.wp-block-quote > p',
		kicker: '.single-post-article .article-kicker, .post-card .post-kicker',
		small: '.single-post-article .article-meta, .post-card .post-meta, .related-row-date',
		ui: ':is(.sidebar-column, .mobile-panel) .wp-block-navigation-item__content',
		title: ':is(.sidebar-column, .mobile-panel) .quire-nav-section-head'
	};
	function rolePx(role) {
		var el = ROLE_PROBE[role] ? document.querySelector(ROLE_PROBE[role]) : null;
		if (!el) return 0;
		var px = parseFloat(getComputedStyle(el).fontSize);
		return px > 0 ? px : 0;
	}
	function pxWord(px) { return Math.round(px) + ' px'; }
	/* A SLIDER CAN BE DRAGGED (Manuel, 2026-09-13: "not click and click").
	   Every change rebuilt the panel, which replaced the slider under the
	   pointer and ended the drag at the first stop. While a pointer holds a
	   slider the panel is not rebuilt: the page changes at once, the word
	   after the title and the fill follow in place, and the rebuild waits
	   for the release. */
	var dragging = false, pendingRender = false;
	/* THE FONT IS A POP-UP ROW (Manuel, 2026-09-13: "compress that list,
	   having just the chosen one, and on click it opens up a menu on top"):
	   Apple's pop-up button. One row shows the chosen face; a press opens a
	   menu over the row with every face, the chosen one under the pointer,
	   a check beside it. On the phone the menu is a sheet from the foot.
	   Open or shut is the panel's own state, not the page's. */
	var popup = null; /* 'face' | 'weight' | 'scope': which pop-up row is open, if any */
	var saving = false, pasting = false, copied = false, confirmDelete = false;
	var tileMenu = null; /* the right-click menu on a tile: { id, x, y } in the panel's own box (2026-09-23) */
	var FOLD_KEY = 'ldp-mine-folded'; /* not architrave-…: pressing Original forgets those */
	/* BOTH GROUPS FOLD (Manuel, 2026-09-24: "make the top one also collapsible. So why not?"): each keeps its own state in this browser. */
	function foldKey(g) { return g === 'seen' ? 'ldp-seen-folded' : FOLD_KEY; }
	function folded(g) { try { return localStorage.getItem(foldKey(g)) === '1'; } catch (e) { return false; } }
	function mineFolded() { return folded('mine'); }
	var notice = null; /* { text, undo } at the panel's foot for a few seconds after the default changes */
	var moreOpen = false, asking = null, saveForReaders = false, faceQuery = ''; /* faceQuery: the Font page's search (2026-09-23) */
	/* The Font page's search: rows hide in place, a section title goes with its last row. */
	function filterFaces(q) {
		if (!panel) return;
		q = String(q || '').trim().toLowerCase();
		var any = false;
		panel.querySelectorAll('[data-panel-role-face]').forEach(function (b) {
			var hit = !q || b.textContent.toLowerCase().indexOf(q) !== -1;
			b.parentNode.hidden = !hit; if (hit) any = true;
		});
		panel.querySelectorAll('.reading-sheet-body ul.reading-group').forEach(function (ul) {
			var vis = !!ul.querySelector('li:not([hidden])'); ul.hidden = !vis;
			var title = ul.previousElementSibling;
			if (title && title.classList.contains('reading-group-title')) title.hidden = !vis;
		});
		var none = panel.querySelector('.reading-face-none'); if (none) none.hidden = any;
	} /* Customise's More menu, the question a red item asks, the save's Show to readers (2026-09-23) */
	var publishing = false, confirmUnpublish = false, publishFailed = false;
	var linkCopied = false; /* a style is a link (2026-09-18) */ /* the site's styles (2026-09-18): the publish name box, the two-step unpublish, a refused write */ /* the Farbe page's name box; Anpassen's two-step delete (Manuel, 2026-09-14) */
	var inputMode = 'pointer'; /* 'pointer' | 'keyboard': what the sheet last heard; the focus ring is the keyboard's alone (Manuel, 2026-09-13) */
	var UPDOWN = icon('chevrons-up-down', 'class="reading-row-check"'); /* the pop-up button's mark, from the registry (DS-375) */
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
	/* A PRESS ON ANY STEPPER SHOWS ITS DOTS (2026-09-13; until then the
	   first level's alone): the panel wears is-stepping for two seconds
	   after the last press, and every stepper's dots read it. */
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
			palette: String(mode).split('-')[0],
			reading: root.getAttribute(Reading.attribute) || 'default',
			face: root.getAttribute('data-face') || 'newsreader',
			leading: root.getAttribute('data-leading') || 'default',
			justify: root.getAttribute('data-justify') === 'on',
			hyphens: root.getAttribute('data-hyphens') === 'on',
			dropcap: root.getAttribute('data-dropcap') === 'on',
			capLines: root.getAttribute('data-dropcap-lines') || '3',
			rounded: root.getAttribute('data-rounded') !== 'off',
			lines: root.getAttribute('data-lines') === 'on',
			hairlines: root.getAttribute('data-hairlines') === 'on',
			darkground: root.getAttribute('data-darkground') === 'on',
			scope: root.getAttribute('data-scope') || 'article',
			pictures: root.getAttribute('data-pictures') || 'plain',
			fills: root.getAttribute('data-fills') !== 'off',
			picturehover: root.getAttribute('data-picturehover') === 'on',
			picturedim: root.getAttribute('data-picturedim') === 'on',
			picturefade: root.getAttribute('data-picturefade') === 'on',
			pictureframe: root.getAttribute('data-pictureframe') !== 'off',
			soft: root.getAttribute('data-soft') === 'on',
			scanlines: root.getAttribute('data-scanlines') === 'on',
			glow: root.getAttribute('data-glow') === 'on',
			grain: root.getAttribute('data-grain') === 'on',
			vignette: root.getAttribute('data-vignette') === 'on',
			dots: root.getAttribute('data-dots') === 'on',
			marker: root.getAttribute('data-marker') === 'on',
			button: root.getAttribute('data-button') || 'accent',
			tagsfollow: root.getAttribute('data-tagsfollow') === 'on',
			widepicture: root.getAttribute('data-widepicture') === 'on',
			widehead: root.getAttribute('data-widehead') === 'on',
			accent: root.getAttribute('data-accent') !== 'off',
			tint: root.getAttribute('data-tint') || 'purple',
			sans: root.getAttribute('data-sans') || 'inter',
			focus: root.hasAttribute('data-focus-on')
		};
	}

	var panel, scrim, level = 1, role = 'head', member = 'masthead', colourKey = 'paper', trigger = null, dotsTimer = null; /* member: the member page's row, level 11 (2026-09-18) */
	/* THE PAIRS (Manuel, 2026-09-12: "the dark and light goes always in
	   pairs … all tiles could change the pair but that would be an
	   Anpassung"): the four sheets a style can be moved onto, each a light
	   and a dark side. The terminal palette is named by what you see. */
	/* The names come from color-mode.js (one list for the rail's menu and
	   this sheet, 2026-09-12); Persona is not offered ("that's old, kick it
	   out"). "Warm paper, not just paper" (Manuel, 2026-09-12). */
	var PAIR_LABELS = window.ArchitravePairLabels || { neutral: 'Violet light', paper: 'Sun clay', terminal: 'Radar night', grey: 'Ash blue', arcade: 'Night fire' };
	var PAIRS = ['neutral', 'paper', 'terminal', 'grey', 'arcade'].map(function (id) { return { id: id, label: PAIR_LABELS[id] || id }; });
	var PICTURE_WORD = { plain: 'As they are', bw: 'Black & white', sepia: 'Sepia', duo: 'Tinted', accent: 'Duotone', halftone: 'Halftone', dither: 'Pixels', grain: 'Grain', hidden: 'Hidden' };
	var PICTURE_NOTE = {
		plain: 'The pictures as they were published.',
		bw: 'The pictures without colour, as the newspaper prints them.',
		sepia: 'The pictures in the brown of an old photograph.',
		duo: 'The pictures in the pair’s own paper and ink.',
		accent: 'The pictures in the pair’s paper and its accent colour.',
		halftone: 'The pictures in printed dots, as a newspaper screens them.',
		dither: 'The pictures in two colours and coarse pixels, like an early computer screen.',
		grain: 'The pictures in colour, under a fine film grain.',
		hidden: 'No pictures. A line stands in for each one and shows it when pressed.'
	};
	/* The well was a button that opened a colour pop-up (2026-09-14); the
	   pop-ups are levels since 2026-09-16, and the wells left in the rows are
	   plain swatches, so nothing needs the helper any more. */
	/* Papier and Tinte were pop-up rows until 2026-09-16, when the editor
	   became a level; the rows are plain navigation now (nav()). */
	/* HEX AND HSL, for the three sliders. */
	function hexToHsl(hex) {
		var c = hex.replace('#', ''), r = parseInt(c.substr(0, 2), 16) / 255, g = parseInt(c.substr(2, 2), 16) / 255, bl = parseInt(c.substr(4, 2), 16) / 255;
		var max = Math.max(r, g, bl), min = Math.min(r, g, bl), l = (max + min) / 2, h = 0, sat = 0, d = max - min;
		if (d) { sat = d / (1 - Math.abs(2 * l - 1)); if (max === r) h = ((g - bl) / d) % 6; else if (max === g) h = (bl - r) / d + 2; else h = (r - g) / d + 4; h = Math.round(h * 60); if (h < 0) h += 360; }
		return { h: h, s: Math.round(sat * 100), l: Math.round(l * 100) };
	}
	function hslToHex(h, sat, l) {
		sat /= 100; l /= 100;
		var c = (1 - Math.abs(2 * l - 1)) * sat, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2, r = 0, g = 0, bl = 0;
		if (h < 60) { r = c; g = x; } else if (h < 120) { r = x; g = c; } else if (h < 180) { g = c; bl = x; } else if (h < 240) { g = x; bl = c; } else if (h < 300) { r = x; bl = c; } else { r = c; bl = x; }
		return '#' + [r, g, bl].map(function (v) { return ('0' + Math.round((v + m) * 255).toString(16)).slice(-2); }).join('');
	}
	function hslTracks(h, sat, l) {
		return {
			h: 'linear-gradient(to right, hsl(0 100% 50%), hsl(60 100% 50%), hsl(120 100% 50%), hsl(180 100% 50%), hsl(240 100% 50%), hsl(300 100% 50%), hsl(360 100% 50%))',
			s: 'linear-gradient(to right, hsl(' + h + ' 0% ' + l + '%), hsl(' + h + ' 100% ' + l + '%))',
			l: 'linear-gradient(to right, hsl(' + h + ' ' + sat + '% 0%), hsl(' + h + ' ' + sat + '% 50%), hsl(' + h + ' ' + sat + '% 100%))'
		};
	}
	/* THE COLOUR POP-UP, APPLE'S POPOVER (Manuel, 2026-09-14, System Settings'
	   accent popover beside ours): the swatch and the hex in one small row,
	   three sliders whose tracks show what each would give, Farbton,
	   Sättigung, Helligkeit. No system colour panel: it could not be closed
	   from here. ONE OF OUR MENUS (Manuel, 2026-09-15: it "doesn't look like
	   it belongs to our menu style"; "Farbe des Paars" necessary? "I don't
	   even know what that means"): the tracks name themselves, so the words
	   beside them went, and the two big buttons with them. The pipette is
	   a small square at the end of the hex row (DS-378); the pair's colour
	   comes back from a dot, or from the style's reset. */
	/* A COLOURLESS COLOUR OPENS WITH ITS SATURATION FULL (Manuel, 2026-09-16:
	   "the second slider is all the way to the right, otherwise we don't see
	   any colour on the third slider"). Black, white and every grey have no
	   saturation to read back, so the pop-up opened with the middle slider at
	   nothing and the third one grey from end to end: three sliders and no
	   colour anywhere to take. The reading is a starting point, not the
	   colour: the swatch and the hex still say black until a slider moves. */
	function sliderHsl(hex) {
		var hsl = hexToHsl(hex);
		if (!hsl.s) hsl.s = 100;
		return hsl;
	}
	/* THE EDITOR IS A LEVEL, NOT A POP-UP (Manuel, 2026-09-16: "we don't do any
	   pop-ups. Instead we go to another deeper level where we have enough space
	   so we wouldn't face that thing, and the window would smooth out to the
	   accordingly sized"). A pop-up must be placed, and everything that went
	   wrong here in one afternoon was placement: measured against a field of
	   four rows, measured while the panel was still gliding, cut off by the
	   panel's corners, sliding under the admin bar, moving the panel underneath
	   it. A level is placed by nothing. It has the panel's whole width, a back
	   arrow, and the panel glides to its height, which is the resize he
	   describes. It is also the split iOS Settings keeps: a page for a long
	   list or a place you work in, a pop-up button for a short list of names.
	   The short ones stay pop-ups — the faces, the weights, Gilt für. */
	function colourEditor(key, side, hex, label, middle) {
		var hsl = sliderHsl(hex), tr = hslTracks(hsl.h, hsl.s, hsl.l);
		/* THE THREE SLIDERS SAY WHAT THEY ARE (Manuel, 2026-09-16: "maybe we
		   have to put a little text before that slider, whatever it is,
		   saturation or hue, just to give it a little bit of context. Is there
		   even a value?"). The tracks were left to name themselves, which works
		   for the rainbow and for nothing else: two grey-to-colour bars in a
		   row tell a reader nothing about which is which. Each takes the
		   panel's own slider heading, the word at the left and the number at
		   the right, exactly as Größe and Zeilenabstand carry theirs, and the
		   number follows the knob. Degrees for the hue, per cent for the other
		   two, as Books shows 1.55 and 0% under its own words. */
		function sliderValue(k, v) { return k === 'h' ? v + '°' : v + ' %'; }
		/* THE WORD ABOVE, THE NUMBER BESIDE (Manuel, 2026-09-16, reversing the
		   row of an hour before: "that description shouldn't sit in front
		   because they always have a different length. They should sit on top,
		   above the slider, like it was before. The value could sit on the
		   right side but left-aligned, so they always have the same distance to
		   the slider"). Farbton, Sättigung and Helligkeit are three lengths,
		   and set in front of the track they pushed each track to a different
		   start. Above it they cost a line and cost nothing else. The number
		   keeps the right-hand column, left-aligned in it, so every number
		   begins at the same place and the gap to the track never changes. */
		function slider(k, word, max, val) {
			return '<p class="reading-group-title reading-colour-title">' + t(word) + '</p>' +
				'<label class="reading-colour-slider"><input type="range" class="reading-hsl" min="0" max="' + max + '" step="1" value="' + val + '" data-panel-hsl="' + k + '" aria-label="' + t(word) + '" style="--track:' + tr[k] + '"></label>' +
				'<span class="reading-group-value reading-colour-num" data-panel-hsl-value="' + k + '">' + sliderValue(k, val) + '</span>';
		}
		return colourBodyHtml(key, side, hex, hsl, tr, slider, label, middle);
	}
	/* The editor's own markup, which was a pop-up's inside and is a level's now. */
	function colourBodyHtml(key, side, hex, hsl, tr, slider, label, middle) {
		return '<div class="reading-colour-page" data-panel-colour-menu="' + key + '" data-panel-colour-side="' + side + '">' +
			'<div class="reading-colour-row"><span class="reading-well is-big" style="--well:' + hex + '" aria-hidden="true"></span>' +
				'<input type="text" class="quire-input reading-name-field reading-hex-field" value="' + hex.toUpperCase() + '" data-panel-hex="' + key + '" data-panel-colour-side="' + side + '" spellcheck="false" autocomplete="off" aria-label="Hex" inputmode="text" maxlength="7">' +
				(window.EyeDropper ? '<button type="button" class="reading-back reading-eyedrop" data-panel-eyedrop="' + key + '" data-panel-colour-side="' + side + '" aria-label="' + t('Eyedropper') + '" title="' + t('Eyedropper') + '">' + icon('pipette') + '</button>' : '') +
			'</div>' +
			(middle || '') +
			'<div class="reading-colour-sliders">' +
				slider('h', 'Hue', 360, hsl.h) + slider('s', 'Saturation', 100, hsl.s) + slider('l', 'Lightness', 100, hsl.l) +
			'</div>' +
		'</div>';
	}
	/* One place that writes a colour from the pop-up and paints what shows it. */
	function poured(key, side, hv) {
		if (Styles.setColour && (key === 'paper' || key === 'ink')) {
			var other = key === 'paper' ? 'ink' : 'paper', have = Styles.colours ? Styles.colours()[side] : {};
			/* The pair is written whole: a paper set on a side whose ink is still
			   the room's would leave the ladder half this style's and half the
			   room's, so the ink standing on the page is written with it. It was
			   read off the other row's well, which lives a level behind now. */
			var otherHex = other === 'ink' ? cssHex('--text-primary') : cssHex('--surface-base');
			if (!have[other] && /^#[0-9a-f]{6}$/i.test(otherHex || '')) Styles.setColour(side, other, otherHex);
		}
		if (Styles.setColour) Styles.setColour(side, key, hv);
		if (key === 'accent' && Styles.setAccent && Styles.accent && !Styles.accent()) Styles.setAccent(true); /* an own accent poured is the accent on (2026-09-15) */
		/* The dragged colour lands in the editor's own well at once; the list it
		   was reached from is rebuilt on the way back (the row of dots that used
		   to need marking by hand went with the pop-up, 2026-09-17). */
		panel.querySelectorAll('.reading-colour-page .reading-well').forEach(function (w) { w.style.setProperty('--well', hv); });
	}
	/* The Farbe page's two pictures: the style's pair on a named side, and its own colours over it. */
	function shotClass(s, side) {
		var pal = (Styles.wanted ? Styles.wanted(s.id).palette : null) || s.palette || 'neutral';
		return 'theme-' + (Modes && Modes.resolve ? Modes.resolve(pal, side) : pal + '-' + side);
	}
	function shotColours(s, side) {
		var c = Styles.colours ? Styles.colours(s.id)[side] : null;
		if (!c || !c.paper || !c.ink) return '';
		var dark = lumOf(c.paper) < lumOf(c.ink);
		/* The preview of the theme's own look is in the theme's own font too (see tileColours). */
		return ' style="' + (s.hostFace ? 'font-family:' + faceAttr(s.hostFace) + ';' : '') + '--surface-base:' + c.paper + ';--text-primary:' + c.ink + ';--surface-raised:' + (dark ? 'color-mix(in oklab, ' + c.paper + ', ' + c.ink + ' 8%)' : c.paper) + ';--border-strong:color-mix(in oklab, ' + c.paper + ', ' + c.ink + ' 29%)"';
	}
	/* THE THEME'S FACE, AS AN ATTRIBUTE CAN CARRY IT (2026-09-24, Manuel: the Original
	   tile showed Classic's colours). A measured font-family names its faces in
	   double quotes ("Inter", sans-serif, as Ollie's does), and written as it was
	   into style="…" the first quote ended the attribute: the tile lost its paper,
	   its ink and its face, and stood in the palette's own grey, which is
	   Classic's. The quotes go in as the entity, which the attribute gives back. */
	function faceAttr(f) { return String(f).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }
	/* What a tile shows of a style's own colours: its paper and its ink on the page's side. */
	/* A luminance that reads the measured rgb() strings too; lumOf answers a flat
	   0.5 for anything that is not six hex digits, and every host-measured colour
	   is an rgb() string. */
	function anyLum(c0) {
		var m = String(c0 || '').match(/rgba?\(([\d.\s,]+)/);
		if (!m) return lumOf(c0);
		var v = m[1].split(',').map(Number);
		return v.length >= 3 ? (0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]) / 255 : 0.5;
	}
	/* noFace leaves the font out for the corner square and the ••• button. It
	   was a regex strip on the way in, and a measured face with quotes broke it:
	   faceAttr writes the quotes as &quot;, whose own semicolon ended the strip
	   halfway, and the leftover unmatched quote swallowed the whole style
	   attribute — the corner square lost its colours AND its healed accent
	   (Manuel, 2026-09-25: "There it is again. The circle is missing"). */
	function tileColours(s, side, noFace) {
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
		/* The name under the Aa takes the tile's own second ink too (Manuel, 2026-09-14: "the text is getting white underneath"). */
		/* THE THEME'S OWN LOOK IS DRAWN IN THE THEME'S OWN FONT (Manuel, 2026-09-22:
		   "it also doesn't have this serif font by default"): presets.js measured
		   the host's body face on arrival and keeps it on the record. */
		return ' style="' + (s.hostFace && !noFace ? 'font-family:' + faceAttr(s.hostFace) + ';' : '') + '--surface-base:' + c.paper + ';--text-primary:' + c.ink + ';--text-secondary:color-mix(in oklab, ' + c.ink + ', ' + c.paper + ' 40%);--border-default:color-mix(in oklab, ' + c.paper + ', ' + c.ink + ' 16%)' + (acc ? ';--accent:' + acc : '') + '"';
	}
	/* A token's colour as hex, read off the page, for a well that has no colour of its own yet. */
	var hexCanvas = null;
	function cssHex(token) {
		try {
			var v = getComputedStyle(root).getPropertyValue(token).trim(); if (!v) return '';
			if (!hexCanvas) hexCanvas = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
			hexCanvas.fillStyle = '#000'; hexCanvas.fillStyle = v; hexCanvas.clearRect(0, 0, 1, 1); hexCanvas.fillRect(0, 0, 1, 1);
			var d = hexCanvas.getImageData(0, 0, 1, 1).data;
			return '#' + [d[0], d[1], d[2]].map(function (x) { return ('0' + x.toString(16)).slice(-2); }).join('');
		} catch (e) { return ''; }
	}
	/* What a settled colour changes besides its wells: the contrast chips and the save button. */
	function settleColour() {
		if (!panel || panel.hidden) return;
		var cur = Styles.current ? Styles.current() : null; /* the style's id; render() keeps its own local */
		var c = Styles.colours ? Styles.colours(cur) : null, side = panel.querySelector('[data-panel-colour-menu]');
		side = side ? side.getAttribute('data-panel-colour-side') : null;
		var v = (c && side && c[side]) || {};
		var paperNow = v.paper || cssHex('--surface-base'), inkNow = v.ink || cssHex('--text-primary');
		/* The ink's readability is read on the editor's own page, under its
		   sliders; the row that says it stands a level behind and is rebuilt
		   on the way back. */
		var inkLine = panel.querySelector('.reading-colour-ratio');
		if (inkLine) inkLine.innerHTML = t('Contrast on the paper') + ': ' + ratioChip(inkNow, paperNow);
		var save = panel.querySelector('[data-panel-save]');
		if (save) save.disabled = !(Styles.adjusted(cur) || (Styles.isOwn && Styles.isOwn(cur)));
	}
	function ratioChip(a, b) {
		/* In words (Manuel, 2026-09-14: "I'm not familiar with that number"): the
		   ratio stays in the tooltip; the chip says what it means for reading. */
		if (!a || !b || !Styles.contrast) return '';
		var q = Styles.contrast(a, b), low = q < 4.5;
		var word = q >= 7 ? t('Very readable') : low ? t('Hard to read') : t('Readable');
		return '<span class="reading-ratio' + (low ? ' is-low' : '') + '" title="' + t('Contrast on the paper') + ': ' + q.toFixed(1).replace('.', ',') + ':1">' + (low ? '! ' : '✓ ') + word + '</span>';
	}
	/* THE PRESET AS A LITTLE PAGE (Manuel, 2026-09-16: "a preset is not only a
	   paper. It's the paper, the ink, and the accent. Actually three colours
	   should be shown there … and by switching light and dark, all three should
	   actually switch to their other side"). The diagonal disc showed one
	   colour of three and showed both sides of it at once, on a page that is
	   already standing on one side. This is the same picture the Hell and
	   Dunkel fields above it are: a paper with a line of its ink and a shorter
	   line of its accent, in the values of the side being shown. */
	var PIC_LINES = '<i class="reading-pic-line is-ink"></i><i class="reading-pic-line is-text"></i><i class="reading-pic-line is-accent"></i>';
	function pagePic(c) {
		return '<span class="reading-swatch is-page" aria-hidden="true" style="--swatch:' + c.paper + ';--swatch-ink:' + c.ink + ';--swatch-accent:' + c.accent + '">' + PIC_LINES + '</span>';
	}
	function lumOf(hex) {
		var c = String(hex || '').replace('#', '');
		if (c.length !== 6) return 0.5;
		var v = [0, 2, 4].map(function (i) { var x = parseInt(c.substr(i, 2), 16) / 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); });
		return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
	}
	/* A MODE'S THREE, from the registry: the paper is its swatch and the accent
	   is the tint it was drawn with, which the registry carries as swatchInk.
	   The text ink is the one value the registry does not publish, so the
	   picture draws it the way every room does — the paper carried almost all
	   the way to its opposite. */
	function modeTriple(id, side) {
		var m = ((Modes && Modes.modes) || []).filter(function (x) { return x.palette === id && x.side === side; })[0] || {};
		var paper = m.swatch || (side === 'dark' ? '#222222' : '#eeeeee');
		var ink = 'color-mix(in oklab, ' + paper + ', ' + (lumOf(paper) > 0.45 ? '#000000' : '#ffffff') + ' 86%)';
		return { paper: paper, ink: ink, accent: m.swatchInk || ink };
	}
	/* The colours as the page is wearing them now, for the row a level above. */
	function nowTriple(side) {
		var c = (Styles.colours ? Styles.colours()[side] : {}) || {};
		var paper = c.paper || cssHex('--surface-base') || '#ffffff';
		var ink = c.ink || cssHex('--text-primary') || '#000000';
		return { paper: paper, ink: ink, accent: c.accent || cssHex('--accent') || ink };
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

	var renderedLevel = null;
	var pageResetPaths = null, markSide = 'dark'; /* the paths Reset this page forgets, set by the page that shows it */
	/* WHAT YOU CHANGED, AND A WAY BACK FOR ONE PAGE (Manuel, 2026-09-24: "we do 4
	   first"). A small dot after the name of every row that differs from the style
	   as it was saved, on each door that leads to one, and at the foot of a page
	   holding any, Reset this page. Read off the rows after they are written, so no
	   row's own string has to know; again as a slider's knob passes a stop, since
	   the page is rebuilt only when the drag ends. */
	function markChanged(side) {
		markSide = side = side || markSide;
		pageResetPaths = null;
		panel.querySelectorAll('.reading-changed, [data-panel-page-reset]').forEach(function (x) { x.remove(); });
		if (!Styles.changes || [2, 3, 4, 8, 14, 15, 16, 17].indexOf(level) === -1) return;
		var ch = Styles.changes();
		function has(path) { var o = ch, p = path.split('.'); for (var i = 0; i < p.length; i++) { if (!o || typeof o !== 'object' || o[p[i]] === undefined) return false; o = o[p[i]]; } return true; }
		var COLOUR = ['palette', 'colours', 'tint', 'preset', 'unlinked', 'soft', 'softlevel', 'quietlevel', 'smallsoft', 'links', 'marker', 'markercolour', 'darkground', 'button'], READ = ['face', 'reading', 'leading', 'justify', 'dropcap', 'capLines', 'scope', 'alternates'];
		var TYPE = ['roles', 'sans'].concat(READ);
		/* THE FOUR PAGES (2026-09-26): each names its keys; Effects takes the rest. */
		var LAYOUT = ['space', 'measure', 'picturefade', 'fadeedges', 'categories', 'widehead', 'widepicture', 'fullpicture'], SHAPE = ['rounded', 'corners', 'buttonshape', 'tagsfollow', 'buttonstyle', 'buttonmedium', 'buttonquiet', 'tags', 'chosenitem', 'lines', 'line', 'linewidth', 'linestyle', 'hairlines', 'cards', 'quotes', 'notes', 'fields', 'fills', 'fill'], PICTURES = ['pictures', 'picturehover', 'picturedim', 'pictureframe', 'framewidth', 'framepattern'];
		var EFFECTS = Object.keys(ch).filter(function (k) { return [COLOUR, TYPE, LAYOUT, SHAPE, PICTURES].every(function (l) { return l.indexOf(k) === -1; }); });
		var PAGES = { 4: COLOUR, 8: TYPE, 14: LAYOUT, 15: SHAPE, 16: PICTURES, 17: EFFECTS };
		function roleKeys(r) { return ['roles.' + r].concat(r === 'read' ? READ : r === 'ui' ? ['sans'] : []); }
		var DIAL = { 'data-panel-size-range': 'size', 'data-panel-weight-range': 'weight', 'data-panel-role-leading-range': 'leading', 'data-panel-tracking-range': 'tracking', 'data-panel-words-range': 'words', 'data-panel-role-italic': 'italic', 'data-panel-role-caps': 'caps' };
		function pathsOf(el) {
			var a = el.getAttribute('data-panel-option') || el.getAttribute('data-panel-level-range');
			if (a) return [a];
			if ((a = el.getAttribute('data-panel-popup')) && (a === 'align' || a === 'colour') && level === 3) return ['roles.' + role + '.' + a];
			if (a === 'member-align') return ['roles.' + role + '.members.' + member + '.align'];
			if (a) return a.indexOf('button-') === 0 ? [] : [a === 'caplines' ? 'capLines' : a];
			if ((a = el.getAttribute('data-panel-colour-key'))) return ['colours.' + side + '.' + a];
			if ((a = el.getAttribute('data-panel-role')) && level === 8) return roleKeys(a);
			var lv = el.getAttribute('data-panel-level');
			if (level === 2) return PAGES[lv] || [];
			if (level !== 3) return [];
			var r = 'roles.' + role + '.';
			if (lv === '10') return [role === 'read' ? 'face' : role === 'ui' ? 'sans' : r + 'face'];
			if ((a = el.getAttribute('data-panel-member'))) return [r + 'members.' + a];
			for (var k in DIAL) if (el.hasAttribute(k)) return [r + DIAL[k]];
			if (el.hasAttribute('data-panel-leading-range')) return ['leading'];
			if (el.hasAttribute('data-panel-reading-range')) return ['reading'];
			return [];
		}
		panel.querySelectorAll('.reading-sheet-body [data-panel-option], .reading-sheet-body [data-panel-level-range], .reading-sheet-body [data-panel-popup], .reading-sheet-body [data-panel-colour-key], .reading-sheet-body [data-panel-role], .reading-sheet-body [data-panel-level], .reading-sheet-body [data-panel-member], .reading-sheet-body .reading-range, .reading-sheet-body [data-panel-role-italic], .reading-sheet-body [data-panel-role-caps]').forEach(function (el) {
			if (el.closest('.quire-menu, .reading-search-results') || !pathsOf(el).some(has)) return;
			var row = el.closest('.reading-row, .reading-nav') || el;
			if (row.querySelector('.reading-changed')) return;
			var dot = document.createElement('span');
			dot.className = 'reading-changed'; dot.setAttribute('role', 'img'); dot.setAttribute('aria-label', t('Changed'));
			var title = row.querySelector('.reading-slider-title'), name = title || row.querySelector('.reading-row-label');
			if (!name) return;
			name.insertBefore(dot, title ? title.querySelector('.reading-member-mark') : null);
		});
		var page = level === 3 ? roleKeys(role) : PAGES[level] || [];
		var body = panel.querySelector('.reading-sheet-body');
		if (!page.some(has) || !body) return;
		pageResetPaths = page;
		body.insertAdjacentHTML('beforeend', '<button type="button" class="quire-button reading-page-reset" data-panel-page-reset>' + t('Reset this page') + '</button>');
	}
	/* SEARCH THE SETTINGS (Manuel, 2026-09-24, "then 1"; Mac System Settings' field
	   over its list). Customise opens with a field; typing puts, in place of the
	   doors, every setting whose name holds the words, each with the way to it in
	   grey (Type › Headings). A press opens that page and the row glows once. The
	   index is read off the pages as they are written, so a new row is found
	   without being listed here; a role's own page stands for all eight roles. */
	var searchQuery = '', searchPages = [], searchRoles = [], findLabel = null;
	function fold(x) { return String(x || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
	function firstText(el) { var f = el.firstChild; return (f && f.nodeType === 3 ? f.nodeValue : el.textContent).trim(); }
	function escText(x) { return String(x).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
	var ROLE_DIALS = ['Font', 'Size', 'Weight', 'Line spacing', 'Character spacing', 'Word spacing', 'Italic', 'Capitals'], READ_DIALS = ['Justified text', 'Drop cap'];
	function searchIndex() {
		var out = [], seen = {};
		function add(label, crumb, lv, attrs) {
			var k = label + '|' + crumb.join('|');
			if (!label || seen[k]) return;
			seen[k] = 1; out.push({ label: label, crumb: crumb, level: lv, attrs: attrs || '' });
		}
		searchPages.forEach(function (pg) {
			add(pg.name, [], pg.level);
			var tpl = document.createElement('template'); tpl.innerHTML = pg.html;
			tpl.content.querySelectorAll('.reading-sheet-body .reading-row-label, .reading-sheet-body .reading-slider-title, .reading-sheet-body .reading-preset-name, .reading-sheet-body .reading-group-title').forEach(function (el) {
				if (!el.closest('.quire-menu')) add(firstText(el), [pg.name], pg.level);
			});
		});
		searchRoles.forEach(function (ro) {
			ROLE_DIALS.concat(ro.id === 'read' ? READ_DIALS : [], ro.id === 'head' || ro.id === 'kicker' ? ['Alignment', 'Colour'] : []).forEach(function (d) { add(t(d), [t('Type'), ro.label], 3, 'data-panel-role="' + ro.id + '"'); });
			/* A ROLE'S MEMBERS (2026-09-26): Captions, Masthead, Card titles… are rows on
			   the role's page and each opens its own; the search found none of them. */
			(ro.members || []).forEach(function (m) { add(m.label, [t('Type'), ro.label], 11, 'data-panel-role="' + ro.id + '" data-panel-member="' + m.id + '"'); });
		});
		return out;
	}
	function runSearch() {
		var body = panel && panel.querySelector('.reading-sheet-body'), box = panel && panel.querySelector('.reading-search-results');
		if (!body || !box) return;
		var q = fold(searchQuery).trim();
		body.classList.toggle('is-searching', !!q);
		if (!q) { box.innerHTML = ''; return; }
		/* By the starts of words, as Settings finds them: "ital" is Italic and not Capitals. */
		var words = function (x) { return fold(x).split(/[^\p{L}\p{N}]+/u).filter(Boolean); }, want = words(q);
		var fits = function (have) { return want.every(function (w) { return have.some(function (h) { return h.indexOf(w) === 0; }); }); };
		var rank = function (e) { return fold(e.label).indexOf(q) === 0 ? 0 : 1; };
		var hits = searchIndex().filter(function (e) { return fits(words(e.label)); }); /* the name alone: "line" finding every dial of Category line buried Lines */
		hits = hits.map(function (e, i) { return { e: e, r: rank(e), i: i }; }).sort(function (a, b) { return a.r - b.r || a.i - b.i; }).map(function (x) { return x.e; });
		box.innerHTML = hits.length
			? '<div class="reading-list">' + hits.slice(0, 40).map(function (e) {
				return '<button type="button" class="quire-button reading-nav reading-search-hit" data-panel-level="' + e.level + '" ' + e.attrs + ' data-panel-find="' + escText(e.label) + '">' +
					'<span class="reading-row-label">' + escText(e.label) + (e.crumb.length ? '<span class="reading-search-where">' + escText(e.crumb.join(' › ')) + '</span>' : '') + '</span>' + icon('chevron-right', 'class="reading-row-check"') +
				'</button>';
			}).join('') + '</div>'
			: '<p class="reading-footnote">' + t('No results') + '</p>';
	}
	function spotlight(label) {
		var hit = null;
		panel.querySelectorAll('.reading-sheet-body .reading-row-label, .reading-sheet-body .reading-slider-title, .reading-sheet-body .reading-preset-name, .reading-sheet-body .reading-group-title').forEach(function (el) { if (!hit && !el.closest('.quire-menu') && firstText(el) === label) hit = el; });
		if (!hit) return false;
		var row = hit.closest('.reading-preset-tile, .reading-row, .reading-nav') || hit;
		row.scrollIntoView({ block: 'nearest' });
		row.classList.remove('is-found'); void row.offsetWidth; row.classList.add('is-found');
		setTimeout(function () { row.classList.remove('is-found'); }, 1800);
		var f = row.matches('button, input') ? row : row.querySelector('button, input');
		if (f) f.focus({ preventScroll: true });
		return true;
	}
	var hostTypeOff = null; /* the theme's own face and weight per role, read once (hostType) */
	function render() {
		if (!panel || panel.hidden) return; /* a hidden panel is not rebuilt (the audit, 2026-09-13) */
		if (dragging) { pendingRender = true; return; }
		var n = now();
		var current = Styles.list.filter(function (s) { return s.id === n.style; })[0] || Styles.list[0];
		var ids = Reading.ids, at = ids.indexOf(n.reading);
		var shown = Styles.shown();
		var faceNow = FACES.filter(function (f) { return f.id === n.face; })[0] || {};
		var faceName = faceNow.label || n.face, faceFamily = faceNow.family || 'inherit';
		var SANS = Styles.sans || [], sansNow = SANS.filter(function (f) { return f.id === n.sans; })[0] || {};
		var sansName = sansNow.label || n.sans;
		var pairName = t((PAIRS.filter(function (p) { return p.id === n.palette; })[0] ||
			((Modes && Modes.palettes) || []).filter(function (p) { return p.id === n.palette; })[0] || { label: n.palette }).label);
		/* A pair the page reads but the list does not offer (Arcade's Persona) is listed while it is worn. */
		var pairs = PAIRS.some(function (p) { return p.id === n.palette; }) ? PAIRS : PAIRS.concat([{ id: n.palette, label: pairName }]);
		/* TWENTY IN THE LIST (Manuel, 2026-09-16: "more colour presets that
		   people can choose from … in the beginning: 20"). The system's five
		   modes first, then the theme's own fifteen, which are not modes but
		   six colours each and carry their own two papers on their disc. */
		var presets = Styles.presets ? Styles.presets() : [];
		var presetNow = Styles.preset ? Styles.preset() : '';
		var presetOn = presets.filter(function (p) { return p.id === presetNow; })[0];
		/* Preset or own: the two sides of the colour page's switch (2026-09-16). */
		var custom = Styles.custom ? Styles.custom() : false;

		/* THE SHEET (Manuel, 2026-09-11, Books' Customise Theme beside ours:
		   "a modal in the middle, where we can have a little bit more space
		   for the settings"): Anpassen opens centred. NO SAMPLE PARAGRAPH
		   (Manuel, the same day: "we see it live in the background") and no
		   tiles ("the tile should not have a place on that modal"): the head,
		   then the groups as before. */
		var isReader = !!(Styles.reader && Styles.reader());
		/* ONE GRID, THE DEFAULT FIRST (Manuel, 2026-09-23: "the tiles on top and the
		   tiles below … it's already getting quite crowded … to make it the
		   standard I would drag and drop it to the first"). For the owner every
		   tile stands in one grid, the site default first (Styles.shown). A tile
		   readers do not see wears a closed eye; a small ••• on a tile under the
		   pointer, or on the chosen one on a phone, opens the tile's menu, the
		   same one a right-click opens. Dragging a tile onto the first place
		   makes it the site default. */
		var owner = !isReader && Styles.canPublish && Styles.canPublish();
		function tileGrid(list, label, group) { return '<div class="reading-tiles" role="radiogroup" aria-label="' + label + '"' + (group ? ' data-tile-group="' + group + '"' : '') + '>' +
				list.map(function (s) {
					/* THE PICTURE ON THE PANEL'S OWN GROUND, NO CARD (Manuel, 2026-09-25/26,
					   lab/the-first-window.html card 7, "go with the recommendation"): the grey
					   card under every tile made the card-less Original row the odd one out.
					   The tile is the style's picture — the Aa in its typeface, its accent as
					   a line — with the name under it in the panel's face, and the chosen and
					   hovered RING WRAPS THE PICTURE, NOT THE NAME (his words: "around the
					   card not around the text"). NO OTHER-SIDE SQUARE (2026-09-25, the same
					   sheet: "more noise than information"): the grid flips whole with the
					   Light/Dark/System row above, which is the honest preview. */
					/* THE DEFAULT WEARS THE ROW'S OWN PILL, ON THE PICTURE (Manuel, 2026-09-25:
					   the word under the name was "a little bit invisible"). Same vocabulary
					   as the Original row's Default; it steps aside while the ••• shows. */
					var isDef = owner && !s.host && s.id === (Styles.siteDefault ? Styles.siteDefault() : '');
					var tileHtml = '<button type="button" class="reading-tile" role="radio" data-panel-style="' + s.id + '" aria-checked="' + (s.id === n.style) + '">' +
						'<span class="reading-tile-swatch ' + tileClass(s) + '" data-face-sample="' + s.face + '"' + tileColours(s, n.resolvedSide) + '>' +
						'<span class="reading-tile-aa">Aa</span><span class="reading-tile-accent"></span>' +
						(isDef ? '<span class="reading-tile-flag">' + t('Default') + '</span>' : '') +
						'</span>' +
						(Styles.adjusted(s.id) ? '<span class="reading-tile-adjusted" aria-label="' + t('adjusted') + '">•</span>' : '') +
						'<span class="reading-tile-name">' + t(s.label) + '</span>' +
						'</button>'; /* THE MINIATURE WAS TRIED AND TAKEN BACK (1.3.301 for two hours; Manuel: "I don't like how it looks and I don't like that it gets sharp corners. The menu doesn't have sharp corners"): a thumbnail, the headline's Aa, two bars, the tile's edge drawn as the style draws a box. The tile is the Aa on the style's colours again, every tile with the panel's own round corner. */
					if (!owner || !publishItemsFor(s.id)) return tileHtml;
					return '<div class="reading-tile-cell' + (tileMenu && tileMenu.id === s.id ? ' is-menu-open' : '') + '">' + tileHtml + /* its menu open: it stays lit, as Apple keeps an item whose menu is up (Manuel, 2026-09-24: the ring went and came back as the menu drew the grid anew) */
						'<button type="button" class="reading-tile-more ' + tileClass(s) + '" data-panel-tile-more="' + s.id + '"' + tileColours(s, n.resolvedSide, true) + ' aria-haspopup="menu" aria-label="' + t('Style options') + ': ' + t(s.label) + '" tabindex="-1">' + icon('more') + '</button></div>';
				}).join('') +
			'</div>'; }
		/* TWO GROUPS THAT SAY WHAT THEY MEAN (Manuel, 2026-09-23, "yes"): what everyone
		   sees, in the order they see it, the first the default; and the rest, only
		   for you. Every tile can be dragged, within the first group to reorder it,
		   between the two to show or hide a style. This is For readers' list, on
		   the tiles themselves; the page is gone. */
		var tiles;
		/* THE ORIGINAL STANDS OUTSIDE THE LIST (Manuel, 2026-09-25: "those two
		   things shouldn't share the same spot. The original is something like
		   outside"). It is not a style, it is the theme untouched — the way back —
		   so it gets its own row above the groups, as Apple Books keeps the
		   publisher's default apart from the themes. It cannot be dragged (no
		   group) and carries no default badge; the default is a style, marked on
		   its own tile below. */
		var hostTile = shown.filter(function (s) { return s.host; })[0];
		/* AS ONE WIDE ROW, PAINTED AS ITSELF (Manuel, 2026-09-25, lab/the-first-window.html,
		   "build A into the plugin"; before it the tile stood alone in a band of three,
		   "quite a waste of space next to the original"). The row is the style edge to
		   edge, as every tile is — Apple paints appearance choices as themselves (Books'
		   themes, the Appearance thumbnails) — with the Aa over its accent line, the name
		   on the paint, and Default on the row when no published style holds the site,
		   since Original is what no default is. The different SHAPE is what now says
		   "the theme's own, not one of the list". */
		var hostBand = '';
		if (hostTile) {
			var hostDef = owner && !(Styles.siteDefault && Styles.siteDefault());
			var hostHtml = '<button type="button" class="reading-tile reading-tile-row" role="radio" data-panel-style="' + hostTile.id + '" aria-checked="' + (hostTile.id === n.style) + '">' +
				'<span class="reading-tile-swatch ' + tileClass(hostTile) + '" data-face-sample="' + hostTile.face + '"' + tileColours(hostTile, n.resolvedSide) + '>' +
				'<span class="reading-tile-aa">Aa</span><span class="reading-tile-accent"></span>' +
				'<span class="reading-tile-name">' + t(hostTile.label) + '</span>' +
				(hostDef ? '<span class="reading-tile-flag">' + t('Default') + '</span>' : '') +
				'</span></button>';
			if (owner && publishItemsFor(hostTile.id)) hostHtml = '<div class="reading-tile-cell' + (tileMenu && tileMenu.id === hostTile.id ? ' is-menu-open' : '') + '">' + hostHtml +
				'<button type="button" class="reading-tile-more ' + tileClass(hostTile) + '" data-panel-tile-more="' + hostTile.id + '"' + tileColours(hostTile, n.resolvedSide, true) + ' aria-haspopup="menu" aria-label="' + t('Style options') + ': ' + t(hostTile.label) + '" tabindex="-1">' + icon('more') + '</button></div>';
			hostBand = '<div class="reading-tiles reading-tiles-original" role="radiogroup" aria-label="' + t('Original') + '">' + hostHtml + '</div>';
		}
		if (owner) {
			var seenIds = Styles.visibleOrder(), seenList = shown.filter(function (s) { return !s.host && seenIds.indexOf(s.id) !== -1; }), mineList = shown.filter(function (s) { return !s.host && seenIds.indexOf(s.id) === -1; });
			/* NO NOTE UNDER THE LIST (Manuel, 2026-09-24: "that line is a little annoying,
			   because it makes it look complicated"). What the first place means is said
			   when it matters: the notice after a drag onto it, Site default in the
			   tile's menu, the footnote on its Customise page. */
			/* SHORT WORDS, AS APPLE'S SIDEBARS HAVE (Manuel, 2026-09-24, "yes"): On your site and Hidden,
			   where Shown to everyone and Only visible to you said who, not what. */
			tiles = hostBand +
				/* VISIBLE TO READERS (Manuel, 2026-09-25: "right now it just says on your
				   site … visible for anyone or to everybody, or I don't know what the
				   best word is"): the panel already says who in its own words — For
				   readers, Show to readers — so the group joins that vocabulary. */
				'<button type="button" class="reading-group-title reading-tiles-title reading-group-fold" data-panel-mine-fold="seen" aria-expanded="' + !folded('seen') + '">' + t('Visible to readers') + icon('chevron-right', 'class="reading-group-chevron"') + '</button>' +
				(seenList.length ? tileGrid(seenList, t('Visible to readers'), 'seen') : '<div class="reading-tiles reading-tiles-empty" data-tile-group="seen"><p class="reading-footnote">' + t('Drag styles here to show them.') + '</p></div>').replace('data-tile-group="seen"', 'data-tile-group="seen"' + (folded('seen') ? ' data-folded' : '')) +
				/* THE LOWER GROUP FOLDS (Manuel, 2026-09-24: "the whole section could be
				   collapsible so we could make that whole space a little bit cleaner"), as a
				   section of Finder's or Mail's sidebar does: its title is the press, a chevron
				   says which way. Folded, it opens again while a tile is carried, so it stays
				   a place to drop (style.css). Kept in this browser; a convenience, not a setting. */
				/* EMPTY, IT ONLY EXISTS DURING A DRAG (Manuel, 2026-09-25, lab/the-first-window.html:
				   the always-on dashed zone was "the biggest single waste on the screen"). With
				   nothing hidden, the title and the drop zone stay in the markup — the drag code
				   measures every [data-tile-group] the moment a tile lifts — but CSS shows them
				   only under .is-tile-dragging, exactly when they are useful. The title is a
				   plain word then, not a fold: a section you cannot see at rest has nothing
				   worth folding, and folded it could not catch the drop. */
				(mineList.length
					? '<button type="button" class="reading-group-title reading-tiles-title reading-group-fold" data-panel-mine-fold aria-expanded="' + !mineFolded() + '">' + t('Hidden') + icon('chevron-right', 'class="reading-group-chevron"') + '</button>' +
						tileGrid(mineList, t('Hidden'), 'mine').replace('data-tile-group="mine"', 'data-tile-group="mine"' + (mineFolded() ? ' data-folded' : ''))
					: '<p class="reading-group-title reading-tiles-title reading-hidden-ondrag">' + t('Hidden') + '</p>' +
						'<div class="reading-tiles reading-tiles-empty reading-hidden-ondrag" data-tile-group="mine"><p class="reading-footnote">' + t('Drag styles here to hide them.') + '</p></div>');
		} else tiles = tileGrid(shown, t('Style'));
		var level1 =
			'<p class="reading-panel-title">' + t('Live Design') + '</p>' + /* LIVE DESIGN, THE BUTTON'S OWN NAME (Manuel, 2026-09-24: "here it could say Live Design"): the button becomes the panel, so the panel keeps its name. Before: DESIGN ON EVERY THEME (2026-09-23, the audit: guests read "Settings", which only Architrave's word list turned into Design) */
			/* A TITLE OVER EACH, THE CONTROL THE WHOLE WIDTH (Manuel, 2026-09-13,
			   on the lab sheet's shape after one morning of labelled rows:
			   "worse than before"): Textgröße over the stepper, the two A's at
			   the ends and the dots between them, always shown; then
			   Erscheinungsbild over a three-way switch, Hell, Dunkel, System,
			   where the half-circle button opened a menu; then Stil over the
			   tiles. */
			/* NO TITLES ON THE FIRST LEVEL (Manuel, 2026-09-13: "so that it looks
			   like Apple Books"): the controls say what they are; the words
			   stay for the screen reader. */
			/* The dots hang under the stepper again and show on a press (Manuel,
			   2026-09-13: "they were nice when they were appearing underneath"). */
			'<div class="reading-stepper reading-tall" role="group" aria-label="' + t('Reading size') + '">' +
				/* aria-disabled, not disabled: the button stays focusable at the end and no-ops, as Apple's steppers do (the audit). */
				'<button type="button" data-panel-size="down" aria-label="' + t('Smaller') + '"' + (at <= 0 ? ' aria-disabled="true"' : '') + '>A</button>' +
				'<button type="button" class="big" data-panel-size="up" aria-label="' + t('Larger') + '"' + (at >= ids.length - 1 ? ' aria-disabled="true"' : '') + '>A</button>' +
				'<div class="reading-dots" aria-hidden="true">' + ids.map(function (id, i) { return '<i' + (i <= at ? ' class="is-on"' : '') + '></i>'; }).join('') + '</div>' +
			'</div>' +
			/* Taller than the other switches, with Books' three glyphs beside
			   the words (Manuel, 2026-09-13: "a bigger switcher … the same
			   icons as we had before"). */
			/* THE THEME'S OWN LOOK HAS BOTH SIDES (Manuel, 2026-09-24, on Ollie: "we
			   create a dark mode for themes that don't have a dark mode and therefore
			   it should be clickable right away"). From 2026-09-22 the row greyed
			   under Original, because pressing Dark there handed the reader
			   Architrave's dark room, and the only way to a dark page was the detour
			   over another tile. Now the plugin writes the theme's own other side
			   from its palette (panel.php, THE THEME'S OWN OTHER SIDE), so the row is
			   live on every tile. */
			'<div class="reading-segment quire-segmented reading-tall" role="radiogroup" aria-label="' + t('Appearance') + '">' +
				SIDES.map(function (s) { return '<button type="button" role="radio"' + (s.id === n.side ? ' class="is-active"' : '') + ' aria-checked="' + (s.id === n.side) + '" data-panel-side="' + s.id + '">' + icon(s.icon) + '<span>' + t(s.label) + '</span></button>'; }).join('') + /* is-active: the one word every segmented rule reads (Manuel, 2026-09-14: the chosen segment hovered) */
			'</div>' +
			tiles +
			/* The focus mode left the panel for the paper's stack (Manuel, 2026-09-14):
			   a square above the settings, which hides every square, the door and
			   the corner, and folds the rail and the comments. presets.js owns it. */
			/* A READER STOPS HERE (Manuel, 2026-09-23: "no, small only"): size,
			   sides and the three styles the owner handed them, like a browser's
			   reader view. Customise is the owner's. */
			/* A READER'S COPY STYLE, when the owner allows it (2026-09-23): the style's link, which Paste style… takes on the reader's own site. */
			(isReader && Styles.readersCopy && Styles.readersCopy() ? '<button type="button" class="quire-button reading-customise" data-panel-copy-link>' + icon('copy') + '<span>' + t(linkCopied ? 'Copied' : 'Copy style') + '</span></button>' : '') +
			(isReader ? '' : '<button type="button" class="quire-button reading-customise" data-panel-level="2">' + icon('settings') + '<span>' + t('Customise') + '</span></button>') /* the gear, Lucide's (DS-376); the sliders went to the stack's square (Manuel, 2026-09-14) */;

		/* Every level has a head: a back arrow where there is somewhere to go
		   back to, the title, and a close on the right (Manuel, 2026-09-09:
		   on the phone the sheet left only a sliver above it to tap). */
		/* THE SHEET CLOSES, IT DOES NOT GO BACK (2026-09-11, the Apple review:
		   a centred modal on the Mac has an X): its head carries the close
		   at the left, as Books' sheet does; the popover's head keeps the
		   close at the right for the phone. */
		/* A slider row: the title with the step's word, the track, a tick per stop. */
		function slider(label, list, currentId, attr, suffix, after, off) {
			var i = Math.max(0, list.map(function (l) { return l.id; }).indexOf(currentId));
			/* THE TITLE STANDS INSIDE THE FIELD (Manuel, 2026-09-17: "maybe having
			   the slider title also on that grey bg", with Books' own Customize
			   pane beside it, where the label sits in the card over its track).
			   It stood above since 2026-09-13, when the sliders' own layout was
			   the odd one out; every slider carries a title now, all eight of
			   them on a role's page, and eight titles floating on the panel's
			   ground between eight grey fields is a ladder of stripes. In the
			   field it is one block a slider, and the page reads as a stack.

			   THE DOTS ARE GONE (the same ask: "to make the sliders a little
			   slicker we could get rid of the dots underneath"). They drew the
			   stops under the track — useful when a slider had five, noise when
			   it has nineteen, and they were the only thing under the track
			   holding the field open. The number beside the title already says
			   where the knob is, and it says it in the unit the reader asked
			   for. */
			return '<div class="reading-list"><div class="reading-row reading-slider-row' + (off ? ' is-disabled' : '') + '">' +
				'<p class="reading-slider-title">' + label + (suffix || '') + '<span class="reading-group-value">' + t(list[i].label) + '</span>' + (after || '') + '</p>' +
				'<div class="reading-slider">' +
					/* step="any": the knob glides under the finger and the fill with it; the
					   page changes when the nearest stop changes; the knob snaps to the stop
					   on release, and the arrow keys move a stop at a time (Manuel,
					   2026-09-13: the stepping knob "comes across so stiff"). */
					'<input type="range" class="reading-range" min="0" max="' + (list.length - 1) + '" step="1" value="' + i + '" data-stop="' + i + '" ' + attr + ' aria-label="' + label + '" aria-valuemin="0" aria-valuemax="' + (list.length - 1) + '" aria-valuenow="' + i + '" aria-valuetext="' + t(list[i].label) + '"' + (off ? ' disabled aria-disabled="true"' : '') + ' style="--fill:' + Math.round(100 * i / (list.length - 1)) + '%">' +
				'</div>' +
			'</div></div>';
		}
		/* A row that opens a level: the name, the value in grey, the chevron. */
		function nav(level, label, value, attrs) {
			return '<button type="button" class="quire-button reading-nav" data-panel-level="' + level + '"' + (attrs ? ' ' + attrs : '') + '>' +
				'<span class="reading-row-label">' + label + '</span><span class="reading-row-value">' + value + '</span>' + icon('chevron-right', 'class="reading-row-check"') +
			'</button>';
		}
		/* THE TITLE SAYS WHAT YOU ARE DOING TO WHAT (Manuel, 2026-09-24: "maybe it should say
		   Instrument anpassen"): the style's name and the verb, as Apple titles an editor
		   (Edit Contact). Only the name gives way to a long one; the verb stays whole. */
		function customiseTitle(name) {
			var parts = t('Customise {name}').split('{name}'), esc = function (x) { return String(x).replace(/&/g, '&amp;').replace(/</g, '&lt;'); };
			return '<span class="reading-title-part">' + esc(parts[0] || '') + '</span><span class="reading-title-name">' + esc(name) + '</span><span class="reading-title-part">' + esc(parts[1] || '') + '</span>';
		}
		function head(title, back, reopen, tools) {
			var close = '<button type="button" class="reading-back" data-panel-close aria-label="' + t('Close') + '">' + icon('close') + '</button>';
			/* A HEAD WITH TOOLS (Customise, 2026-09-23, lab/the-panel-laid-out.html):
			   Undo and More stand on the right the way Apple's editing apps put them
			   in the toolbar; the sides are 1fr each so the title stays centred
			   however many squares a side holds. */
			if (tools) return '<div class="reading-panel-head has-tools">' +
				(back ? '<button type="button" class="reading-back" data-panel-level="' + back + '"' + (reopen ? ' data-panel-reopen="' + reopen + '"' : '') + ' aria-label="' + t('Back') + '">' + icon('chevron-left') + '</button>' : '<span></span>') +
				'<p class="reading-panel-title" id="reading-panel-title" tabindex="-1">' + title + '</p>' +
				'<span class="reading-head-tools">' + tools + (isPhone() ? close : '') + '</span>' +
			'</div>';
			/* NO X ON THE SHEET (Manuel, 2026-09-12: "we don't need that X …
			   Apple is also not doing that. We would click in the empty
			   space"): a level shows the chevron back to the one before it,
			   Anpassen to the tiles; a click outside or Escape closes. The
			   close stays on the first level for the phone's sheet. */
			return '<div class="reading-panel-head">' +
				(back ? '<button type="button" class="reading-back" data-panel-level="' + back + '"' + (reopen ? ' data-panel-reopen="' + reopen + '"' : '') + ' aria-label="' + t('Back') + '">' + icon('chevron-left') + '</button>' : '<span></span>') +
				'<p class="reading-panel-title" id="reading-panel-title" tabindex="-1">' + title + '</p>' +
				(isPhone() ? close : '<span></span>') + /* the phone's sheet keeps its close on every level, as an iOS sheet keeps Done (the audit); the popover has none (Manuel, 2026-09-14: "take that X out … it should close by clicking in the empty space") */
			'</div>';
		}
		level1 = '<div class="reading-sheet-top">' + head(t('Live Design')) + '</div><div class="reading-sheet-body">' + level1.replace('<p class="reading-panel-title">' + t('Live Design') + '</p>', '') + '</div>';

		/* THE FONT IS A ROW THAT OPENS ITS OWN LEVEL, as in Books (Manuel,
		   2026-09-09: "what happens if we get more fonts and the list is
		   getting too long"). Anpassen stays four things tall whatever the
		   list grows to. */
		/* THE ROLES OF TYPE (Manuel, 2026-09-13; lab/the-roles-of-type.html).
		   Anpassen is Gilt für, Farbe, Form, and then Schrift: five rows, one
		   per role, each naming its face and weight and opening its own page
		   (level 3, `role`). Every role's page has the same dials; Lesetext
		   carries the line spacing and the paragraph's switches as well. The
		   font page of 2026-09-12 with its two lists is these pages now. */
		var ROLE_META = [
			{ id: 'head', label: 'Headings', where: 'Applies to the title and the headings in the article.' },
			{ id: 'read', label: 'Reading text', where: 'Applies to the paragraphs of the article.' },
			{ id: 'quote', label: 'Quotes', where: 'The quotes.' }, /* the source line is Nebentext's since 2026-09-15 (Manuel: "I want the Quelle as a sans-serif") */
			{ id: 'kicker', label: 'Category line', where: 'The category under the title, on the cards and in the article.' },
			{ id: 'small', label: 'Small text', where: 'Dates, categories, captions and tags.' },
			{ id: 'comment', label: 'Comments', where: 'The names, the words and the form under the article.' }, /* the eighth role, 2026-09-17: one comment used to be set by two */
			{ id: 'ui', label: 'Interface', where: 'The sidebar, the menus, the buttons and the cards.' },
			{ id: 'title', label: 'Interface titles', where: 'The section and group titles.' }
		];
		/* `group` IS CARRIED THROUGH (2026-09-17). This map was written before the
		   font page had sections and copied four fields; the fifth would have
		   been dropped silently, every face would have landed in none of the four
		   groups, and the page would have printed four empty titles and one
		   ungrouped list — which is what the fallback below is there to catch. */
		var ALLFACES = FACES.map(function (f) { return { id: f.id, label: f.label, family: f.family, group: f.group, listed: f.listed !== false }; });
		SANS.forEach(function (f) {
			if (ALLFACES.some(function (x) { return x.id === f.id; })) { ALLFACES.filter(function (x) { return x.id === f.id; })[0].listed = true; return; }
			ALLFACES.push({ id: f.id, label: f.label, family: 'inherit', group: f.group, listed: true });
		});
		/* A FOLLOWER NAMES ITS ANCHOR (2026-09-22, THE TWO VOICES in presets.js):
		   on its list the entry reads "Same as reading text"; on the row's
		   summary, where the words have to share a line with the weight, the
		   anchor's own name, "Reading text · Bold". 'inherit' is 'read' by an
		   older name. */
		var FOLLOW = { read: 'Same as reading text', ui: 'Same as interface', inherit: 'Same as reading text' };
		var FOLLOW_SHORT = { read: 'Reading text', ui: 'Interface', inherit: 'Reading text' };
		function faceLabel(id) { if (FOLLOW[id]) return t(FOLLOW[id]); var f = ALLFACES.filter(function (x) { return x.id === id; })[0]; return f ? f.label : id; }
		function faceShort(id) { return FOLLOW_SHORT[id] ? t(FOLLOW_SHORT[id]) : faceLabel(id); }
		/* THE THEME'S OWN TYPE, NAMED (2026-09-23, Twenty Twenty-Four under
		   Original: the Type page said Newsreader and Inter over a page set in
		   Cardo and Inter). On a guest with no look on, a role the reader has not
		   touched wears whatever the theme gave it, and the panel's own resting
		   values are Architrave's, not the page's. So the page is asked: the
		   role's first element is read with the role table on and off, in one go
		   with no frame between, and where the two agree the panel is not setting
		   that property and the page's own answer is the true one. A role with
		   nothing on this page keeps the panel's words. */
		var HOST_EL = {
			head: '.wp-block-post-title, .wp-block-heading',
			read: '.wp-block-post-content p, .entry-content p, .wp-block-post-excerpt',
			quote: '.wp-block-quote, .wp-block-pullquote',
			kicker: '.wp-block-post-terms',
			small: '.wp-block-post-date, .wp-block-post-author-name, figcaption, .wp-element-caption',
			comment: '.wp-block-comment-content, .wp-block-comment-author-name',
			ui: '.wp-block-navigation-item__content, .wp-block-site-title'
		};
		function familyName(stack) {
			var first = String(stack || '').split(',')[0].replace(/["']/g, '').replace(/\s+Variable$/i, '').trim();
			return /^(serif|sans-serif|monospace|system-ui|-apple-system|ui-sans-serif|ui-serif|ui-monospace|inherit)$/i.test(first) ? '' : first;
		}
		function weightKey(n) {
			var best = 'regular', gap = Infinity;
			Object.keys(WEIGHT_NUMBER).forEach(function (k) { var d = Math.abs(WEIGHT_NUMBER[k] - n); if (d < gap) { gap = d; best = k; } });
			return best;
		}
		function hostType(id) {
			if (!window.architravePanelGuest || root.hasAttribute('data-chosen') || !HOST_EL[id]) return null;
			/* Every sheet the plugin brings, not only the role table: the reading
			   face reaches the article through panel.css as well (measured: with the
			   role table alone lifted, a chosen Vollkorn still read as the theme's). */
			/* THE SHEET, NOT ITS ELEMENT: `link.disabled` unloads a stylesheet and
			   `disabled = false` loads it again later, so the next read met the page
			   with the plugin still missing (measured: the second role read Cardo
			   with every sheet back on). `CSSStyleSheet.disabled` is instant. */
			/* READ ONCE A PAGE, EVERY ROLE AT ONCE (0.11.47, Manuel on Ollie: switches
			   "barely clickable or super slow"). This ran for each role on every
			   render, and a render builds every level's rows, so one press turned the
			   plugin's sheets off and on again about twenty times, and each time the
			   browser restyled the whole page: 60 of the 70 ms a press cost, measured.
			   The theme's own face does not change while the page is open, so its
			   values are read once, for all roles, with the sheets off once. */
			if (!hostTypeOff) {
				hostTypeOff = {};
				var sheets = Array.prototype.slice.call(document.querySelectorAll('link[id^="architrave-panel"], style[id^="architrave-panel"]'))
					.map(function (n) { return n.sheet; }).filter(Boolean);
				/* The addresses in the order written, not the page's order: the menu
				   speaks for the interface before the site title does, a comment's words
				   before its author's name. */
				var els = {};
				Object.keys(HOST_EL).forEach(function (k) { var e = null; HOST_EL[k].split(',').some(function (sel) { e = document.querySelector(sel.trim()); return !!e; }); if (e) els[k] = e; });
				if (sheets.length) {
					sheets.forEach(function (x) { x.disabled = true; });
					Object.keys(els).forEach(function (k) { var off = window.getComputedStyle(els[k]); hostTypeOff[k] = { el: els[k], face: off.fontFamily, weight: off.fontWeight }; });
					sheets.forEach(function (x) { x.disabled = false; });
				}
			}
			var known = hostTypeOff[id];
			if (!known || !known.el.isConnected) return null;
			var on = window.getComputedStyle(known.el), face = on.fontFamily, weight = on.fontWeight, hostFace = known.face, hostWeight = known.weight;
			return {
				face: face === hostFace ? familyName(hostFace) : '',
				weight: weight === hostWeight ? weightKey(parseFloat(hostWeight) || 400) : ''
			};
		}
		function roleSummary(id) {
			var v = Styles.role(id), h = hostType(id);
			return (h && h.face ? h.face : faceShort(v.face)) + ' · ' + weightWord(h && h.weight ? h.weight : v.weight);
		}
		/* WHICH FACES THE PAGE IS SET IN, for the Typografie row (Manuel,
		   2026-09-16: "we are now showing two fonts, which is okay in most
		   cases, but I just tried it and made a third font in it. It didn't show
		   up on that row. What happens if there would be a third font and how
		   should we handle that?"). Two is the ordinary answer, the article's
		   face and the interface's, and it was written that way. A style can
		   carry more, because every role may take its own, so the row says the
		   faces actually in use, in the order the roles stand, and counts the
		   rest rather than growing: Newsreader · Inter · +1. A row that names
		   everything becomes a paragraph. */
		function facesInUse() {
			var seen = [];
			ROLE_META.forEach(function (ro2) {
				/* A follower with nothing of its own on this page (no quote in this
				   post) is its anchor's face, so it is counted as the anchor's. */
				var v2 = Styles.role(ro2.id), anchor = v2.face === 'ui' ? 'ui' : (v2.face === 'read' || v2.face === 'inherit' ? 'read' : '');
				var h2 = hostType(ro2.id) || (anchor ? hostType(anchor) : null);
				var l = h2 && h2.face ? h2.face : faceLabel(Styles.faceOf(Styles.role(ro2.id).face)); /* the face actually in use, so a follower counts as its anchor's face and not as a third */
				if (l && seen.indexOf(l) === -1) seen.push(l);
			});
			if (!seen.length) return '';
			if (seen.length <= 2) return seen.join(' · ');
			return seen.slice(0, 2).join(' · ') + ' · +' + (seen.length - 2);
		}
		/* THE TWO PICTURE SWITCHES (2026-09-19; lab sheet the-picture-effects)
		   stand under the row they belong to, the three of the page above it. */
		/* COLOUR ON HOVER SHOWS ONLY WITH A LOOK (Manuel, 2026-09-19, the switch on beside Bildeffekte Standard: "I don't know what I'm actually looking for"): with the pictures as they are, or hidden, there is no look to lift and the switch did nothing anyone could see. */
		/* A STRENGTH STANDS UNDER ITS SWITCH (Manuel, 2026-09-19, the pop-up that stood in a field of its own at the foot: "If a scan line is there, the strength of the scanning lines should be close. Why is it sitting so weirdly?"): the role pages' slider without its own field, as a row of the switches' field, only while its switch is on. */
		function levelRow(key, label, unit) {
			if (!Styles.levels || !Styles.levels[key]) return '';
			return slider(label, Styles.levels[key].map(function (id) { return { id: id, label: LEVEL_WORD[key] ? t(LEVEL_WORD[key][id] || id) : id + unit }; }), Styles.level(key), 'data-panel-level-range="' + key + '"').replace(/^<div class="reading-list">/, '').replace(/<\/div>$/, '');
		}
		var FADE_WORD = { bottom: 'Bottom', sides: 'Sides and bottom', all: 'All sides' }, FADE_ORDER = ['bottom', 'sides', 'all'];
		var FRAME_WORD = { plain: 'Plain', dots: 'Dots', checker: 'Checkerboard' };
		var pictureRows =
			(n.pictures === 'plain' || n.pictures === 'hidden' ? '' : '<div class="reading-row"><span class="reading-row-label">' + t('Colour on hover') + '</span><button type="button" class="reading-toggle" role="switch" aria-checked="' + n.picturehover + '" data-panel-option="picturehover" aria-label="' + t('Colour on hover') + '"></button></div>') +
			'<div class="reading-row"><span class="reading-row-label">' + t('Dim in the dark') + '</span><button type="button" class="reading-toggle" role="switch" aria-checked="' + n.picturedim + '" data-panel-option="picturedim" aria-label="' + t('Dim in the dark') + '"></button></div>' +
			/* THE FRAME REACHES OTHER THEMES TOO (Manuel, 2026-09-25, Catalogue's
			   checkerboard on Twenty Twenty-Five: "build both"): the pictures in a
			   post and a post's own picture (panel-page.css, THE FRAME ON ANOTHER
			   THEME). The wide picture and the fade stay Architrave's own; a guest
			   theme lays out its pictures itself. */
			(n.pictures === 'hidden' ? '' : '<div class="reading-row"><span class="reading-row-label">' + t('Frame around pictures') + '</span><button type="button" class="reading-toggle" role="switch" aria-checked="' + n.pictureframe + '" data-panel-option="pictureframe" aria-label="' + t('Frame around pictures') + '"></button></div>' +
			/* ITS WIDTH AND ITS PATTERN, under the switch while it is on (Manuel, 2026-09-25). */
			(n.pictureframe ? levelRow('framewidth', t('Frame width'), ' px') + (Styles.framePattern ? popupButton('framepattern', t('Frame pattern'), t(FRAME_WORD[Styles.framePattern()] || 'Plain')) : '') : '')) +
			''; /* the wide top picture and the fade went to Layout (2026-09-26) */
		/* EACH ITS OWN FIELD (Manuel, 2026-09-19, the seven rows in one grey block: "we should make them all individual sections unless they really belong together"). What belongs together: a switch and its strength; the pictures' look and its two switches. */
		var CORNER_WORD = { small: 'Small', medium: 'Medium', large: 'Large', xlarge: 'Very large' }, CORNER_ORDER = ['small', 'medium', 'large', 'xlarge']; /* pill left the steps 2026-09-26: it is the Pill buttons switch below, so it rides any size */
		var LINE_WORD = { solid: 'Solid', dashed: 'Dashed', dotted: 'Dotted' };
		var fieldOf = function (rows) { return '<div class="reading-list">' + rows + '</div>'; };
		/* THREE GROUPS WITH A NAME EACH (the review of 2026-09-19, "what would Apple do"): nine fields in one unbroken column is a list to read, not a page to scan. System Settings names its groups; the corners, lines and fills shape every box, the three effects lie over the whole screen, the pictures are their own. */
		/* LEUCHTEN IS GREYED BY DAY (the same review): it shows on the dark side only, and a switch that does nothing where the reader stands is the fault Farbe beim Überfahren had. Greyed and not hidden, so it can be found. */
		var night = n.resolvedSide === 'dark';
		/* ONE BOX PER GROUP (Manuel, 2026-09-23, the layout pass: "go with your
		   recommendation"; lab/the-panel-laid-out.html, window 10). The corners,
		   lines and fills stood in three boxes and the four screen effects in four,
		   while Pictures was already one; Apple's Settings keeps a named group in
		   one box and lets a switch's own dial appear under it inside that box.
		   So each group is one field now, and a pop-up row anywhere in it opens
		   its menu over its own row (the placement reads the row, not the field). */
		function switchRow(key, label, off) { return '<div class="reading-row' + (off ? ' is-disabled' : '') + '"><span class="reading-row-label">' + label + '</span><button type="button" class="reading-toggle" role="switch" aria-checked="' + n[key] + '" data-panel-option="' + key + '"' + (off ? ' disabled' : '') + ' aria-label="' + label + '"></button></div>'; }
		/* THE SHAPE ROUND'S FOUR PICKS, one pop-up row each, their words here. */
		var PICK_WORD = { titlefinish: { flat: 'Flat', shine: 'Shine', accent: 'Accent colour' }, headitalics: { same: 'Same font', serif: 'Serif', classic: 'Classic serif', vollkorn: 'Vollkorn', fraunces: 'Fraunces' }, headarrival: { none: 'None', fade: 'Fade', blur: 'Blur to sharp' }, cardlight: { off: 'Off', edge: 'Top edge', glow: 'Edge and glow' }, buttonfinish: { flat: 'Flat', glass: 'Glass', glow: 'Glow' }, toppattern: { none: 'None', dots: 'Dots', grid: 'Grid', cross: 'Crosses', diagonal: 'Diagonal' }, guides: { off: 'Off', solid: 'Solid', dashed: 'Dashed' }, greytint: { '0': '0 %', '5': '5 %', '10': '10 %', '15': '15 %' }, pageglow: { off: 'Off', soft: 'Soft', strong: 'Strong' },
			monitorframe: { off: 'Off', thin: 'Thin', medium: 'Medium', thick: 'Thick' }, fringe: { off: 'Off', faint: 'Faint', soft: 'Soft', strong: 'Strong', slip: 'Print slip' }, crisp: { off: 'Off', headings: 'Headings', all: 'All text' }, scanstyle: { lines: 'Lines', grille: 'Grille', both: 'Both' }, shimmer: { off: 'Off', soft: 'Soft', roll: 'Roll' }, warp: { off: 'Off', slight: 'Slight', bulged: 'Bulged', strong: 'Strong' }, switchon: { off: 'Off', on: 'On' }, bloom: { off: 'Off', soft: 'Soft', strong: 'Strong' }, ghosting: { off: 'Off', on: 'On' }, jitter: { off: 'Off', rare: 'Rare', often: 'Often' }, graincrawl: { still: 'Still', moving: 'Moving' }, typedtitle: { off: 'Off', on: 'On' }, bootscreen: { off: 'Off', on: 'On' }, roomglass: { off: 'Off', on: 'On' }, phosphor: { off: 'Off', blue: 'Blue', green: 'Green', amber: 'Amber', white: 'White', black: 'Black' }, static: { off: 'Off', on: 'On' }, dropout: { off: 'Off', on: 'On' }, headrule: { off: 'Off', on: 'On' }, ink: { sharp: 'Sharp', spread: 'Spread' }, tooth: { off: 'Off', on: 'On' }, edges: { ink: 'Ink', yellowed: 'Yellowed' }, columns: { '1': 'One column', '2': 'Two per section', '3': 'Three per section' }, paragraphs: { spaced: 'Spaced', indented: 'Indented' }, rainbow: { off: 'Off', rule: 'Rule', mark: 'Mark', both: 'Both' }, movinglight: { off: 'Off', on: 'On' }, categories: { below: 'Below title', above: 'Above title', hidden: 'Hidden' }, links: { both: 'Coloured and underlined', coloured: 'Coloured', underlined: 'Underlined' }, buttonshape: { cards: 'Like the cards', square: 'Square', rounded: 'Rounded', pill: 'Pill' }, buttonstyle: { filled: 'Filled', tinted: 'Tinted', gray: 'Gray', outlined: 'Outlined', shadow: 'Outlined with shadow', text: 'Text only' }, buttonmedium: { filled: 'Filled', tinted: 'Tinted', gray: 'Gray', outlined: 'Outlined', shadow: 'Outlined with shadow', text: 'Text only' }, buttonquiet: { filled: 'Filled', tinted: 'Tinted', gray: 'Gray', outlined: 'Outlined', shadow: 'Outlined with shadow', text: 'Text only' }, tags: { text: 'Text only', filled: 'Filled', tinted: 'Tinted', gray: 'Gray', outlined: 'Outlined' }, chosenitem: { gray: 'Gray', filled: 'Filled', outlined: 'Outlined', bold: 'Bold' }, fullpicture: { off: 'Wide', on: 'Full' }, quotes: { line: 'Line at the side', plain: 'Plain', box: 'Box' }, notes: { flat: 'Flat', box: 'Outlined', raised: 'Raised' }, fields: { flat: 'Flat', box: 'Outlined', raised: 'Raised' }, linewidth: { '1': '1 px', '2': '2 px', '3': '3 px', '5': '5 px' }, cards: { box: 'Outlined', top: 'Line above', flat: 'Flat', raised: 'Raised' } };
		function pickWord(key, v) { if (window.architravePanelGuest && ({ tags: 'text', chosenitem: 'gray', quotes: 'line', notes: 'flat', fields: 'flat' })[key] === v) return t('As the theme'); var w = PICK_WORD[key][v]; return /(px| %)$/.test(w) ? w : t(w); }
		function pickRow(key, label) { return Styles.pick ? popupButton(key, label, pickWord(key, Styles.pick(key))) : ''; }
		var LEVEL_ORDER = ['filled', 'tinted', 'gray', 'outlined', 'shadow', 'text']; /* the button levels' looks, loud to quiet */
		function pickMenu(key, label) { return Styles.picks ? popupMenu(key, label, (/^button(style|medium|quiet)$/.test(key) ? LEVEL_ORDER : Styles.picks[key].list).filter(function (id) { return !(key === 'categories' && id === 'above' && window.architravePanelGuest && Styles.pick(key) !== 'above'); }).map(function (id) { return { on: Styles.pick(key) === id, attr: 'data-panel-pick-shape="' + key + ':' + id + '"', label: pickWord(key, id) }; })) : ''; }
		var cornerItems = Styles.cornerSteps ? Styles.cornerSteps.slice().sort(function (a, b) { return CORNER_ORDER.indexOf(a) - CORNER_ORDER.indexOf(b); }).map(function (id) { return { on: Styles.corners() === id, attr: 'data-panel-pick-corners="' + id + '"', label: t(CORNER_WORD[id]) }; }) : [];
		var lineItems = Styles.lineStyles ? Styles.lineStyles.map(function (id) { return { on: Styles.lineStyle() === id, attr: 'data-panel-pick-linestyle="' + id + '"', label: t(LINE_WORD[id]) }; }) : [];
		/* FOUR PAGES, NOT ONE (Manuel, 2026-09-26, the settings overview: "quite a
		   lot … maybe we need more individual windows and to get more structure
		   into it"; his pick, the split). More design options had grown to 37
		   rows behind one door, and its last group, Details, took whatever came
		   last. What stood there is now four pages of its own, each about one
		   thing, as System Settings keeps Appearance apart from Displays: LAYOUT
		   (the page's air, the article's head), CORNERS AND LINES (Manuel's pick 2026-09-26; the plan said Shape, but that key already says Design in the panel, and Form was turned down 2026-09-13 as an input form; Apple names a page by its two biggest things, Sound & Haptics),
		   PICTURES and EFFECTS. The colour decisions that had strayed (the
		   highlighter, the ink button, the dark ground, the softer text) went home
		   to Colour. Every key and attribute is unchanged: a saved style reads
		   exactly as before, only the row's page moved. */
		/* SPACE (Manuel, 2026-09-25, lab/the-space-of-a-page.html: "build it"):
		   one dial for the page's air, first, because it shapes everything the
		   rest dresses. space.js does the work. */
		var fadeMenu = n.picturefade && Styles.fadeEdges && !window.architravePanelGuest ? popupMenu('fadeedges', t('Edges'), FADE_ORDER.map(function (id) { return { on: Styles.fadeEdges() === id, attr: 'data-panel-pick-fadeedges="' + id + '"', label: t(FADE_WORD[id]) }; })) : '';
		var layoutBody =
			'<p class="reading-group-title">' + t('Page') + '</p>' +
			'<div class="reading-font-field"><div class="reading-list">' +
				(Styles.levels && Styles.levels.space ? levelRow('space', t('Space'), '') : '') +
				/* FADE THE EDGES (2026-09-23) and WHICH EDGES under it while it is on:
				   the top picture sinks into the paper. Architrave's own; a guest
				   theme lays out its pictures itself. */
				(n.pictures === 'hidden' || window.architravePanelGuest ? '' : switchRow('picturefade', t('Fade the edges')) +
					(n.picturefade && Styles.fadeEdges ? popupButton('fadeedges', t('Edges'), t(FADE_WORD[Styles.fadeEdges()] || 'Sides and bottom')) : '')) +
			'</div>' + fadeMenu + '</div>' +
			'<p class="reading-group-title">' + t('Article') + '</p>' +
			'<div class="reading-font-field">' + fieldOf(
				/* LINE LENGTH (2026-09-25): letters a line. */
				levelRow('measure', t('Line length'), ' ' + t('letters')) +
				/* CATEGORIES (2026-09-27, the text marks): below the title, above it or hidden. It replaced the switch Categories above title. */
				pickRow('categories', t('Categories')) +
				/* BREITER TITEL (2026-09-26, Specimen) and THE WIDE TOP PICTURE (2026-09-25): Architrave's article head only. */
				(window.architravePanelGuest ? '' : switchRow('widehead', t('Wide title')) + (n.pictures === 'hidden' ? '' : switchRow('widepicture', t('Wide top picture')) + (n.widepicture ? pickRow('fullpicture', t('Picture width')) : '')))) + (!window.architravePanelGuest && n.widepicture ? pickMenu('fullpicture', t('Picture width')) : '') + pickMenu('categories', t('Categories')) + '</div>';
		/* SHAPE: one box, as the group was (Manuel, 2026-09-23: one box per group);
		   the page's name says what it holds, so the box carries no title. */
		var shapeBody =
			'<div class="reading-font-field"><div class="reading-list">' +
				switchRow('rounded', t('Rounded corners')) +
				/* ECKENGRÖSSE (2026-09-20): only while Rounded corners is on. */
				(n.rounded && Styles.cornerSteps ? popupButton('corners', t('Corner size'), t(CORNER_WORD[Styles.corners()] || 'Medium')) : '') +
				/* PILL BUTTONS (Manuel, 2026-09-26, "pill buttons with large cards"): the old pill corner step as a switch, so the cards keep their size while every button and hover pill becomes a stadium. Only with Rounded corners, as the size is. */
				/* THE SHAPE ROUND (2026-09-26, lab/the-shape-round.html): the buttons' own shape (it replaced the switch Pill buttons), the tags after them or not, and the buttons' style. */
				(n.rounded ? pickRow('buttonshape', t('Button shape')) + switchRow('tagsfollow', t('Tags follow the buttons')) : '') +
				/* THE BUTTON LEVELS (2026-09-27): the main, the other and the quiet buttons, each with its look; Quiet is Architrave's alone. */
				pickRow('buttonstyle', t('Main buttons')) + pickRow('buttonmedium', t('Other buttons')) + (window.architravePanelGuest ? '' : pickRow('buttonquiet', t('Quiet buttons'))) + pickRow('tags', t('Tags')) + pickRow('chosenitem', t('Chosen item')) +
				switchRow('lines', t('Lines')) +
				(n.lines ? levelRow('line', t('Line strength'), ' %') : '') +
				/* LINIENART (2026-09-19): under the strength, only while Lines is on. */
				(n.lines ? pickRow('linewidth', t('Line width')) : '') +
				(n.lines && Styles.lineStyles ? popupButton('linestyle', t('Line style'), t(LINE_WORD[Styles.lineStyle()] || 'Solid')) : '') +
				/* FEINE LINIEN (2026-09-26, Instrument's half-pixel lines): under the style, only while Lines is on. */
				(n.lines && (!Styles.pick || Styles.pick('linewidth') === '1') ? switchRow('hairlines', t('Fine lines')) : '') + /* fine lines only at 1 px (2026-09-26) */
				(window.architravePanelGuest ? '' : pickRow('cards', t('Cards'))) + pickRow('quotes', t('Quotes')) + pickRow('notes', t('Notes')) + pickRow('fields', t('Fields')) +
				switchRow('fills', t('Fills')) +
				(n.fills ? levelRow('fill', t('Fill strength'), ' %') : '') +
			'</div>' +
			(n.rounded ? popupMenu('corners', t('Corner size'), cornerItems) : '') +
			(n.lines ? popupMenu('linestyle', t('Line style'), lineItems) : '') +
			pickMenu('buttonshape', t('Button shape')) + pickMenu('buttonstyle', t('Main buttons')) + pickMenu('buttonmedium', t('Other buttons')) + (window.architravePanelGuest ? '' : pickMenu('buttonquiet', t('Quiet buttons'))) + pickMenu('tags', t('Tags')) + pickMenu('chosenitem', t('Chosen item')) + pickMenu('linewidth', t('Line width')) + pickMenu('cards', t('Cards')) + pickMenu('quotes', t('Quotes')) + pickMenu('notes', t('Notes')) + pickMenu('fields', t('Fields')) +
			'</div>';
		/* EFFECTS: the five that lie over the whole screen, each unfolding its strength. */
		var FRAME_ROW = false; /* THE MONITOR FRAME'S ROW IS PARKED (Manuel, 2026-09-30, 0.15.3): the bezel covers what a framed theme pins to the window; the pick and its rules stay, true brings the row back */
		var effectsBody =
			fieldOf(
				switchRow('scanlines', t('Scan lines')) + (n.scanlines ? levelRow('scan', t('Scan line strength'), '') : '') +
				switchRow('glow', t('Glow'), !night) + (n.glow && night ? levelRow('glowlevel', t('Glow strength'), '') : '') +
				switchRow('grain', t('Background grain')) + (n.grain ? levelRow('grainlevel', t('Grain strength'), '') : '') +
				switchRow('dots', t('Dotted background')) + (n.dots && Styles.levels.dotsize ? levelRow('dotsize', t('Grid size'), '') + levelRow('dotlevel', t('Dot strength'), ' %') : '') +
				switchRow('vignette', t('Vignette')) + (n.vignette ? levelRow('vignettelevel', t('Vignette strength'), '') + levelRow('vignettereach', t('Vignette size'), '') : '')) +
			/* THE EXTRAS (2026-09-29, lab/the-instrument-extras.html): ten looks taken from four dark product sites, one pop-up each; nothing is written at the rest. */
			'<div class="reading-font-field"><div class="reading-list">' +
				pickRow('titlefinish', t('Title finish')) + pickRow('headitalics', t('Italics in headings')) + pickRow('headarrival', t('Headings arrive')) + (window.architravePanelGuest ? '' : pickRow('cardlight', t('Card light'))) + pickRow('buttonfinish', t('Button finish')) + (window.architravePanelGuest ? '' : pickRow('toppattern', t('Pattern at the top'))) + (window.architravePanelGuest ? '' : pickRow('guides', t('Guides'))) + (window.architravePanelGuest ? '' : pickRow('greytint', t('Tint the greys'))) + (window.architravePanelGuest ? '' : pickRow('pageglow', t('Aurora'))) + (window.architravePanelGuest ? '' : pickRow('movinglight', t('Moving light'))) + /* THE SCREEN AND THE PRINT (2026-09-30, Tube and Brochure) */ (window.architravePanelGuest || !FRAME_ROW ? '' : pickRow('monitorframe', t('Monitor frame'))) + pickRow('fringe', t('Colour fringe')) + pickRow('crisp', t('Crisp edges')) + pickRow('scanstyle', t('Scan style')) + pickRow('shimmer', t('Shimmer')) + (window.architravePanelGuest ? '' : pickRow('warp', t('Warp'))) + pickRow('switchon', t('Switch-on')) + pickRow('static', t('Static')) + pickRow('bloom', t('Bloom')) + (window.architravePanelGuest ? '' : pickRow('ghosting', t('Ghosting'))) + pickRow('jitter', t('Jitter')) + pickRow('graincrawl', t('Grain motion')) + pickRow('typedtitle', t('Typed title')) + pickRow('bootscreen', t('Boot screen')) + pickRow('roomglass', t('Room in the glass')) + pickRow('phosphor', t('Phosphor')) + pickRow('dropout', t('Drop-out title')) + pickRow('headrule', t('Title rule')) + pickRow('ink', t('Ink')) + pickRow('tooth', t('Paper tooth')) + pickRow('edges', t('Edges')) + (window.architravePanelGuest ? '' : pickRow('columns', t('Columns'))) + pickRow('paragraphs', t('Paragraphs')) + (window.architravePanelGuest ? '' : pickRow('rainbow', t('Rainbow'))) +
			'</div>' + pickMenu('titlefinish', t('Title finish')) + pickMenu('headitalics', t('Italics in headings')) + pickMenu('headarrival', t('Headings arrive')) + (window.architravePanelGuest ? '' : pickMenu('cardlight', t('Card light'))) + pickMenu('buttonfinish', t('Button finish')) + (window.architravePanelGuest ? '' : pickMenu('toppattern', t('Pattern at the top'))) + (window.architravePanelGuest ? '' : pickMenu('guides', t('Guides'))) + (window.architravePanelGuest ? '' : pickMenu('greytint', t('Tint the greys'))) + (window.architravePanelGuest ? '' : pickMenu('pageglow', t('Aurora'))) + (window.architravePanelGuest ? '' : pickMenu('movinglight', t('Moving light'))) + (window.architravePanelGuest || !FRAME_ROW ? '' : pickMenu('monitorframe', t('Monitor frame'))) + pickMenu('fringe', t('Colour fringe')) + pickMenu('crisp', t('Crisp edges')) + pickMenu('scanstyle', t('Scan style')) + pickMenu('shimmer', t('Shimmer')) + (window.architravePanelGuest ? '' : pickMenu('warp', t('Warp'))) + pickMenu('switchon', t('Switch-on')) + pickMenu('static', t('Static')) + pickMenu('bloom', t('Bloom')) + (window.architravePanelGuest ? '' : pickMenu('ghosting', t('Ghosting'))) + pickMenu('jitter', t('Jitter')) + pickMenu('graincrawl', t('Grain motion')) + pickMenu('typedtitle', t('Typed title')) + pickMenu('bootscreen', t('Boot screen')) + pickMenu('roomglass', t('Room in the glass')) + pickMenu('phosphor', t('Phosphor')) + pickMenu('dropout', t('Drop-out title')) + pickMenu('headrule', t('Title rule')) + pickMenu('ink', t('Ink')) + pickMenu('tooth', t('Paper tooth')) + pickMenu('edges', t('Edges')) + (window.architravePanelGuest ? '' : pickMenu('columns', t('Columns'))) + pickMenu('paragraphs', t('Paragraphs')) + (window.architravePanelGuest ? '' : pickMenu('rainbow', t('Rainbow'))) +
			'</div>';
		/* BILDER (Manuel, 2026-09-14; lab sheet the-picture-looks): three looks,
		   a pop-up row like Schriftart. Sepia and Gedämpft were drawn and
		   dropped: "really just tiny variations". ONE FIELD WITH THE SWITCHES
		   (Manuel, 2026-09-15: "it looks like it wants to be attached to that
		   menu"): the switches stand in the pop-up row's own field. */
		var picturesBody = popupRow('pictures', t('Picture effects'), t(PICTURE_WORD[n.pictures] || 'As they are'),
				Styles.pictures.map(function (id) { return { on: n.pictures === id, attr: 'data-panel-pick-pictures="' + id + '"', label: t(PICTURE_WORD[id]) }; }),
				t(PICTURE_NOTE[n.pictures] || PICTURE_NOTE.plain),
				'', pictureRows);
		if (n.pictureframe && Styles.framePattern && n.pictures !== 'hidden') picturesBody = picturesBody.replace(/<\/div>$/, popupMenu('framepattern', t('Frame pattern'), Styles.framePatterns.map(function (id) { return { on: Styles.framePattern() === id, attr: 'data-panel-pick-framepattern="' + id + '"', label: t(FRAME_WORD[id]) }; })) + '</div>');
		/* COLOUR'S LAST TWO GROUPS (2026-09-26): what colours the text and what
		   colours the ground and the buttons, under the presets. Softer reading
		   text came from the Reading text page (there since 2026-09-23): it is
		   the ink stepping toward the paper, a colour decision. The highlighter
		   came from Details with its five pens; the dark ground from Corners,
		   lines and fills; the ink button from Details. */
		var MARKER_WORD = { yellow: 'Yellow', green: 'Green', pink: 'Pink', blue: 'Blue', orange: 'Orange', text: 'Like the reading text', muted: 'Like the date', own: 'Own colour' };
		function markerHex() { var c = Styles.colours ? (Styles.colours(current.id)[n.resolvedSide] || {}) : {}; return (Styles.markerColour && Styles.markerColour() === 'own' && c.marker) || cssHex('--marker') || '#fff347'; }
		function buttonOwnHex() { var c = Styles.colours ? (Styles.colours(current.id)[n.resolvedSide] || {}) : {}; return c.button || ''; }
		function buttonHex() { return n.button === 'ink' ? (cssHex('--text-primary') || '#000000') : n.button === 'own' ? (buttonOwnHex() || cssHex('--accent') || '#000000') : (cssHex('--accent') || '#000000'); }
		function buttonWord() { return t(n.button === 'ink' ? 'Ink' : n.button === 'own' ? 'Own colour' : 'Accent'); }
		var colourMore =
			'<p class="reading-group-title">' + t('Text') + '</p>' +
			'<div class="reading-font-field"><div class="reading-list">' +
				switchRow('soft', t('Softer reading text')) +
				(n.soft ? levelRow('softlevel', t('Softness'), ' %') : '') +
				/* SMALL TEXT AND LINKS (2026-09-27, the text marks): the small text's step back with soft on or off, and how links are marked; both follow Softer reading text until set by hand. */
				levelRow('smallsoft', t('Small text'), ' %') + pickRow('links', t('Links')) +
				switchRow('marker', t('Highlighter')) +
				(n.marker && Styles.markerColour ? popupButton('markercolour', t('Highlighter colour'), t(MARKER_WORD[Styles.markerColour()] || 'Yellow') + '<span class="reading-well" style="--well:' + (/^(text|muted)$/.test(Styles.markerColour()) ? 'var(--marker)' : markerHex()) + '" aria-hidden="true"></span>') : '') + /* the reading text's and the date's pens are the page's own rungs, read where they live */
			'</div>' + pickMenu('links', t('Links')) +
			(n.marker && Styles.markerColour ? popupMenu('markercolour', t('Highlighter colour'), Styles.markerColours.map(function (id) { return { on: Styles.markerColour() === id, attr: 'data-panel-pick-markercolour="' + id + '"', label: t(id === 'own' ? 'Own colour…' : MARKER_WORD[id]) }; })) : '') +
			'</div>' +
			'<p class="reading-group-title">' + t('Ground and buttons') + '</p>' +
			'<div class="reading-font-field"><div class="reading-list">' +
				/* DUNKLER GRUND (2026-09-26, Specimen's black ground around a light page): by day only, so greyed by night. */
				switchRow('darkground', t('Dark ground'), night) +
				/* THE BUTTON'S COLOUR (2026-09-26, lab/the-link-colour.html, B): a pick
				   of Accent, Ink or an own colour, the word with its well, as Paper
				   and Ink show theirs. Own colour… opens the editor on the fourth
				   well. It replaced the switch Main button in ink. */
				popupButton('button', t('Button colour'), buttonWord() + '<span class="reading-well" style="--well:' + buttonHex() + '" aria-hidden="true"></span>') +
			'</div>' +
			popupMenu('button', t('Button colour'), [
				{ on: n.button === 'accent', attr: 'data-panel-pick-button="accent"', label: t('Accent') },
				{ on: n.button === 'ink', attr: 'data-panel-pick-button="ink"', label: t('Ink') },
				{ on: n.button === 'own', attr: 'data-panel-pick-button="own"', label: t('Own colour…') }]) +
			'</div>';
		/* THE MORE MENU of Customise (2026-09-23): copy and paste together, then
		   what applies to this tile only, then the destructive ones in red. A red
		   item opens a small question in the menu's place (`asking`). */
		/* UNDO SAYS WHAT IT TAKES BACK (Manuel, 2026-09-23, the layout pass; Apple's
		   HIG: "Undo Typing", "Undo Bold"): the arrow's tooltip and its name for a
		   screen reader read "Undo Lines", "Undo Headings", "Undo Colour". */
		function undoName() {
			var w = Styles.undoWhat ? Styles.undoWhat() : '';
			var ROLE = w.indexOf('role:') === 0 ? ROLE_META.filter(function (r) { return r.id === w.slice(5); })[0] : null;
			var WHAT = { 'effect:title': 'Title finish', 'effect:serif': 'Italics in headings', 'effect:arrival': 'Headings arrive', 'effect:cardlight': 'Card light', 'effect:moving': 'Moving light', 'effect:button': 'Button finish', 'effect:pattern': 'Pattern at the top', 'effect:guides': 'Guides', 'effect:tint': 'Tint the greys', 'effect:aurora': 'Aurora', titlefinish: 'Title finish', headitalics: 'Italics in headings', headarrival: 'Headings arrive', cardlight: 'Card light', buttonfinish: 'Button finish', toppattern: 'Pattern at the top', guides: 'Guides', greytint: 'Tint the greys', pageglow: 'Aurora', movinglight: 'Moving light', monitorframe: 'Monitor frame', fringe: 'Colour fringe', crisp: 'Crisp edges', scanstyle: 'Scan style', shimmer: 'Shimmer', warp: 'Warp', switchon: 'Switch-on', static: 'Static', bloom: 'Bloom', ghosting: 'Ghosting', jitter: 'Jitter', graincrawl: 'Grain motion', typedtitle: 'Typed title', bootscreen: 'Boot screen', roomglass: 'Room in the glass', phosphor: 'Phosphor', dropout: 'Drop-out title', headrule: 'Title rule', ink: 'Ink', tooth: 'Paper tooth', edges: 'Edges', columns: 'Columns', paragraphs: 'Paragraphs', rainbow: 'Rainbow', 'effect:monitor': 'Monitor frame', 'effect:warp': 'Warp', lines: 'Lines', line: 'Lines', linestyle: 'Line style', hairlines: 'Fine lines', darkground: 'Dark ground', fills: 'Fills', fill: 'Fills', rounded: 'Rounded corners', corners: 'Corner size', buttonshape: 'Button shape', tagsfollow: 'Tags follow the buttons', buttonstyle: 'Main buttons', buttonmedium: 'Other buttons', buttonquiet: 'Quiet buttons', tags: 'Tags', chosenitem: 'Chosen item', fullpicture: 'Picture width', quotes: 'Quotes', notes: 'Notes', fields: 'Fields', linewidth: 'Line width', cards: 'Cards',
				scanlines: 'Scan lines', scan: 'Scan lines', glow: 'Glow', glowlevel: 'Glow', grain: 'Background grain', grainlevel: 'Background grain',
				vignette: 'Vignette', vignettelevel: 'Vignette', vignettereach: 'Vignette', soft: 'Softer reading text', softlevel: 'Softer reading text', quietlevel: 'Softer reading text', smallsoft: 'Small text', links: 'Links', categories: 'Categories',
				justify: 'Justified text', dropcap: 'Drop cap', capLines: 'Drop cap height', pictures: 'Picture effects', picturedim: 'Dim in the dark',
				pictureframe: 'Frame around pictures', picturefade: 'Fade the edges', fadeedges: 'Fade the edges', dots: 'Dotted background', dotsize: 'Dotted background', dotlevel: 'Dotted background', marker: 'Highlighter', markercolour: 'Highlighter', button: 'Button colour', pillbuttons: 'Pill buttons', widepicture: 'Wide top picture', widehead: 'Wide title', measure: 'Line length', space: 'Space', framewidth: 'Frame width', framepattern: 'Frame pattern', palette: 'Colour', tint: 'Colour', preset: 'Colour', colours: 'Colour', accent: 'Colour',
				face: 'Font', sans: 'Font', reading: 'Size', leading: 'Line spacing', reset: 'Reset everything' };
			var word = ROLE ? t(ROLE.label) : WHAT[w] ? t(WHAT[w]) : '';
			return word ? t('Undo {what}').replace('{what}', word) : t('Undo');
		}
		/* WHAT AN OWNER CAN DO WITH A STYLE'S PLACE ON THE SITE (Manuel, 2026-09-23:
		   "I want to make this my new base style"), in the ••• menu and on a
		   tile's right-click alike: one of your own is shown to readers or made
		   the site default in one step; a published one is made the default;
		   Standard is the default again when another one is. */
		function publishItems(id, full, noSeen) {
			if (!(Styles.canPublish && Styles.canPublish())) return '';
			var st = Styles.list.filter(function (x) { return x.id === id; })[0]; if (!st) return '';
			var def = Styles.readerFirst ? Styles.readerFirst() : '';
			function it(attr, label, red) { return '<li role="none"><button type="button" class="quire-menu-item' + (red ? ' is-destructive' : '') + '" role="menuitem" ' + attr + '><span class="quire-menu-label">' + label + '</span></button></li>'; }
			var out = '';
			/* CUSTOMISE AND DUPLICATE, FIRST IN A TILE'S OWN MENU (Manuel, 2026-09-24: "would it make
			   sense if we click on the circle and then in that menu it would say … anpassen … it also
			   could say duplicate"), as Apple's item menus lead with Edit and Duplicate. */
			/* THE ORIGINAL IS NOT CUSTOMISABLE (Manuel, 2026-09-25: "the original
			   shouldn't be customizable"). It is the theme untouched, the way back;
			   editing it would take that away. Duplicate is the door, as editing a
			   face from Apple's Face Gallery makes a copy and leaves the gallery
			   alone. */
			if (full) out += (st.host ? '' : it('data-panel-tile-customise="' + id + '"', t('Customise'))) + it('data-panel-tile-duplicate="' + id + '"', t('Duplicate')) +
				/* RESET, WHERE THE CHANGES ARE (Manuel, 2026-09-24: "when I click on the circle, it also could
				   have that reset functionality there"), as Photos puts Revert to Original in an edited
				   picture's own menu: only on a style that has changes, and only its own changes. */
				(Styles.adjusted(id) ? it('data-panel-tile-reset="' + id + '"', t('Reset')) : '') +
				'<li role="separator" class="quire-menu-separator"></li>';
			/* FOR EVERYONE FIRST, THEN THE DEFAULT (2026-09-24): one tick says whether
			   visitors see it; off, a published style comes back as one of your own. */
			if (!noSeen && !st.host && id !== def) { var seenFirst = Styles.seenByReaders(id); out += '<li role="none"><button type="button" class="quire-menu-item' + (seenFirst ? ' is-selected' : '') + '" role="menuitemcheckbox" aria-checked="' + seenFirst + '" data-panel-seen="' + id + ':' + (seenFirst ? '0' : '1') + '"><span class="quire-menu-label">' + t('Show on site') + '</span>' + (seenFirst ? icon('check', 'class="quire-menu-check"') : '') + '</button></li>'; }
			/* The default's own menu says so, as a Mac menu shows the item that is on, ticked and greyed. */
			if (id === def) out += '<li role="none"><button type="button" class="quire-menu-item is-selected" role="menuitemcheckbox" aria-checked="true" disabled><span class="quire-menu-label">' + t('Site default') + '</span>' + icon('check', 'class="quire-menu-check"') + '</button></li>';
			if (id !== def) out += it('data-panel-make-default="' + id + '"', t('Make site default'));
			/* SHOWN TO EVERYONE, A TICK AND NOT A MARK ON THE TILE (Manuel, 2026-09-23:
			   the closed eyes stood on nearly every tile; "instead of Leser:innen we
			   could say für alle zeigen"). The item says the state as a Mac menu does. */
			if (full && (st.own || st.site)) out += it('data-panel-tile-rename="' + id + '"', t('Rename…'));
			if (full && (st.own || st.site)) out += (out ? '<li role="separator" class="quire-menu-separator"></li>' : '') + it('data-panel-tile-delete="' + id + '"', t('Delete'), true);
			return out;
		}
		function moreMenu() {
			/* NAMING A STYLE IS A SMALL DIALOG (Manuel, 2026-09-23, "go ahead with all
			   five"): it opened inside the page and pushed everything down; Apple
			   asks for a name in a small window over the page. */
			if (saving) return '<div class="quire-menu reading-more-menu reading-ask reading-save-card" role="dialog" aria-label="' + t('Name this style') + '">' +
				'<p class="reading-ask-title">' + t('Name this style') + '</p>' +
				'<input type="text" class="quire-input reading-name-field" data-panel-name maxlength="40" placeholder="' + t('Style name') + '" aria-label="' + t('Style name') + '">' +
				(Styles.canPublish && Styles.canPublish() ? '<div class="reading-list"><div class="reading-row"><span class="reading-row-label">' + t('Show to readers') + '</span><button type="button" class="reading-toggle" role="switch" aria-checked="' + saveForReaders + '" data-panel-save-readers aria-label="' + t('Show to readers') + '"></button></div></div>' : '') +
				'<div class="reading-name-actions"><button type="button" class="quire-button" data-panel-save-cancel>' + t('Cancel') + '</button><button type="button" class="quire-button primary" data-panel-save-go>' + t('Save') + '</button></div>' +
			'</div>';
			/* PASTING IS A SMALL CARD TOO (Manuel, 2026-09-23: "we clean that up, it's
			   also a little bit confusing"): the field opened inside the page, under a
			   greyed Save, and pushed the page down. It is the name card's twin now,
			   over the page; ⌘V in the field takes the style at once. */
			if (pasting) return '<div class="quire-menu reading-more-menu reading-ask reading-save-card" role="dialog" aria-label="' + t('Paste style') + '">' +
				'<p class="reading-ask-title">' + t('Paste style') + '</p>' +
				'<textarea class="quire-input reading-name-field reading-paste-field" data-panel-paste-text rows="3" spellcheck="false" placeholder="' + t('Paste a style or a link…') + '" aria-label="' + t('Paste style') + '"></textarea>' +
				'<div class="reading-name-actions"><button type="button" class="quire-button" data-panel-paste-cancel>' + t('Cancel') + '</button><button type="button" class="quire-button primary" data-panel-paste-go>' + t('Paste') + '</button></div>' +
			'</div>';
			if (asking) {
				var q = { reset: 'Reset everything?', 'delete': 'Delete this style?', unpublish: 'Unpublish this style?' }[asking];
				var go = { reset: 'Reset', 'delete': 'Delete', unpublish: 'Unpublish' }[asking];
				return '<div class="quire-menu reading-more-menu reading-ask" role="alertdialog" aria-label="' + t(q) + '">' +
					'<p class="reading-ask-title">' + t(q) + '</p>' +
					'<div class="reading-name-actions"><button type="button" class="quire-button" data-panel-ask-cancel>' + t('Cancel') + '</button><button type="button" class="quire-button is-destructive" data-panel-ask-go="' + asking + '">' + t(go) + '</button></div>' +
				'</div>';
			}
			if (!moreOpen) return '';
			function item(attr, label, o) { o = o || {}; return '<li role="none"><button type="button" class="quire-menu-item' + (o.red ? ' is-destructive' : '') + '" role="menuitem" ' + attr + (o.off ? ' disabled' : '') + '><span class="quire-menu-label">' + label + '</span></button></li>'; }
			var sep = '<li role="separator" class="quire-menu-separator"></li>';
			var own = Styles.isOwn && Styles.isOwn(current.id), site = Styles.canPublish && Styles.canPublish() && Styles.isSite(current.id), adj = Styles.adjusted(current.id);
			var tile = (own && adj ? item('data-panel-update', t('Update style')) : '') +
				publishItems(current.id, false, true) + /* Shown to everyone is a switch on the page itself now */
				(site && adj ? item('data-panel-site-update', t('Apply changes for everyone')) : '');
			var resettable = adj || n.side !== 'dark' /* the default side is dark since 2026-09-19 */ || !n.accent || n.focus;
			return '<ul class="quire-menu reading-more-menu" role="menu" aria-label="' + t('More') + '">' +
				/* A MENU CLOSES ON A PICK (2026-09-23, as a Mac menu does): the label
				   never changes inside it; the copy is confirmed by a tick on the
				   ••• button for a moment. */
				/* ONE COPY (2026-09-23): Copy style and Copy link were two ways to the same
				   thing, since the link carries the whole style and Paste takes either. */
				item('data-panel-copy-link', t('Copy style')) +
				item('data-panel-paste', t('Paste style…')) +

				(tile ? sep + tile : '') + sep +
				(own ? item('data-panel-ask="delete"', t('Delete style'), { red: 1 }) : '') +
				/* NO UNPUBLISH OF ITS OWN (2026-09-24): Shown to everyone, off, takes a style off the site and keeps it as yours. */
				item('data-panel-ask="reset"', t('Reset everything'), { red: 1, off: !resettable }) +
			'</ul>';
		}
		var level2 =
			/* One word, whichever style is on (Manuel, 2026-09-13: it need not say Standard). */
			/* THE PAGE IS NAMED AFTER THE STYLE IT ADJUSTS (Manuel, 2026-09-24: "when I am
			   on that Anpassen page I don't really know what I am adjusting"), as an
			   album's settings carry the album's name. */
			'<div class="reading-sheet-top">' + head(customiseTitle(t(current.label)), 1, 0, '<button type="button" class="reading-back" data-panel-undo aria-label="' + undoName() + '" title="' + undoName() + '"' + (Styles.canUndo && Styles.canUndo() ? '' : ' disabled') + '>' + icon('undo') + '</button><button type="button" class="reading-back" data-panel-more aria-haspopup="menu" aria-expanded="' + !!moreOpen + '" aria-label="' + t(copied ? 'Copied' : linkCopied ? 'Link copied' : 'More') + '">' + icon(copied || linkCopied ? 'check' : 'more') + '</button>') + moreMenu() + '</div>' +
			'<div class="reading-sheet-body">' +
			/* THE SEARCH (2026-09-24, see searchIndex), ON THE PAGE AND FILLED LIKE ITS ROWS
			   (Manuel, the same day, a glass in the head beside the field on elmastudio.de:
			   "it was better before"): the rows' own grey, no line, one more row of the page
			   and not a well that pulls the eye. */
			'<div class="reading-search"><input type="search" class="reading-search-field" data-panel-search placeholder="' + t('Search settings') + '" aria-label="' + t('Search settings') + '" value="' + escText(searchQuery) + '" autocomplete="off" spellcheck="false"></div>' +
			'<div class="reading-search-results"></div>' +
			/* Label left, value right, chevron, no title over a single row (the audit, System Settings' row). */
			/* The colours themselves before their names (Manuel, 2026-09-14, "show the colours instead of writing the text"; System Settings shows the swatch AND the word). */
			/* THE ROW SAYS THE PRESET, THE DOT SAYS THE ACCENT (Manuel, 2026-09-16:
			   a preset is paper, ink and accent together). The tint's name stood
			   here beside the pair's until the accent stopped being a dial of its
			   own; it would have named the tint while a preset's accent was on
			   the page. */
			/* TWO DOORS, THEN THE SWITCHES (Manuel, 2026-09-16: "can we wrap all
			   those typography settings also in one row? When we click on that
			   row it opens up a deeper-level window where we have all those
			   typography settings. In that hierarchy it should be: the Farbe
			   row, the Typografie row, and then those Gestaltung settings").
			   Seven role rows made this page a list of somebody else's work;
			   they are a page of their own now, behind one row that says which
			   face the article is set in, and the page opens with the two things
			   a style is made of before the switches that shape it. */
			/* A ROW IS A ROW, NOT A LIST OF TWO (Manuel, 2026-09-16: "maybe Farbe
			   and Typografie as different rows, not on the same background …
			   will make them individual rows. And we could do the same for
			   Gestaltung"). Each of the three stands in a field of its own, so
			   the page is three doors rather than one list with a hairline in
			   it, and the switches that used to lie open under Gestaltung are
			   behind the third. */
			'<div class="reading-list">' + nav(4, t('Colour'), (presetOn ? t(presetOn.label) : custom ? t('Custom') : pairName) + pagePic(nowTriple(n.resolvedSide))) + '</div>' +
			'<div class="reading-list">' + nav(8, t('Type'), facesInUse()) + '</div>' +
			/* FOUR DOORS IN ONE BOX (2026-09-26): the one door More design options
			   became Layout, Shape, Pictures and Effects. They keep its box; Colour
			   and Type keep theirs (Manuel, 2026-09-16: "individual rows"). */
			'<div class="reading-list">' + nav(14, t('Layout'), '') + nav(15, t('Corners and lines'), '') + nav(16, t('Pictures'), '') + nav(17, t('Effects'), '') + '</div>' +
			/* FOR READERS (2026-09-23): which two styles readers get beside the
			   site's own; the owner's alone. A fourth door with the other three
			   (Manuel, the same day, of the row glued under Save as style: "gap
			   missing"): rows that open a page stand together, the buttons below. */
			/* FOR READERS WENT ONTO THE TILES (2026-09-23): the first window's two groups. */
			/* THE LIVE DESIGN BUTTON (Manuel, 2026-09-23, lab/the-button-page.html): where the door sits and how it looks; the owner's alone. */
			/* SHOWN TO EVERYONE, A SWITCH ON THE STYLE'S OWN PAGE (Manuel, 2026-09-24: "would
			   that be a good place for a toggle switch"). A menu ticks, a page switches;
			   the state is the style's, so it stands with the style's rows. The site
			   default is always seen: its switch stays on and says why. */
			(function () {
				if (!(Styles.canPublish && Styles.canPublish()) || current.host) return '';
				var isDef = Styles.readerFirst && Styles.readerFirst() === current.id, seenOn = isDef || (Styles.seenByReaders && Styles.seenByReaders(current.id));
				return '<div class="reading-list"><div class="reading-row"><span class="reading-row-label">' + t('Show on site') + '</span><button type="button" class="reading-toggle" role="switch" aria-checked="' + !!seenOn + '" data-panel-seen-switch="' + current.id + '" aria-label="' + t('Show on site') + '"' + (isDef ? ' disabled aria-disabled="true"' : '') + '></button></div></div>' +
					(isDef ? '<p class="reading-footnote">' + t('The site default is always on your site.') + '</p>' : '');
			}()) +
			/* ONE BUTTON, AND THE REST BEHIND "…" (Manuel, 2026-09-23, "yes, go ahead";
			   lab/the-panel-laid-out.html, checked against Apple's HIG and a second
			   reviewer). The page is for going somewhere: four doors and the one
			   thing an owner does most, Save as style. Saving and publishing are ONE
			   step now: the name, and a switch that shows it to readers (off). Undo
			   is a glyph in the head (DS-381); copy, paste, the updates and the
			   destructive three live in the More menu, the destructive ones in red,
			   each asking once in a small card instead of the old press-twice. */
			/* ONE BLUE BUTTON AT A TIME (2026-09-23: "we have now 3 blue buttons
			   looking at us"). As on a Mac, only the task that is open has a default
			   button: while the name card or the paste field is open, the save that
			   opens a card steps back to a plain button. */
			('<button type="button" class="quire-button' + (saving || pasting ? '' : ' primary') + ' reading-main" data-panel-save' + (Styles.adjusted(current.id) || (Styles.isOwn && Styles.isOwn(current.id)) ? '' : ' disabled') + '>' + t(publishFailed ? 'Could not publish' : (Styles.isOwn && Styles.isOwn(current.id) ? 'Save as new style…' : 'Save as style…')) + '</button>') +
			/* THE SITE'S OWN SETTINGS UNDER THEIR OWN TITLE, after the style's (2026-09-24). */
			(Styles.canPublish && Styles.canPublish() && Styles.button && Styles.button() ? '<div class="reading-list reading-site-list">' + nav(13, t('Button and Sharing'), '') + '</div>' : '') +

			'</div>';

		/* THE SCROLL SURVIVES A RE-RENDER (Manuel, 2026-09-11: "I click a
		   toggle and it jumps immediately back up"): the sheet's body is
		   rebuilt on every change, and a new scroller starts at the top.
		   Its position is read before and written back after. */
		var scroller = panel.querySelector('.reading-sheet-body');
		/* Within one level only: a new level starts at its top (the audit, 2026-09-13). */
		var scrolled = (scroller && renderedLevel === level) ? scroller.scrollTop : 0;
		var turned = renderedLevel !== null && renderedLevel !== level;
		/* WHICH WAY THE PAGE TURNS (2026-09-14, Apple's inspector): deeper is
		   forward, the new page arriving from the right; back arrives from
		   the left. The stylesheet reads it (reading-turn-forward, -back). */
		var turnWay = turned ? (level > renderedLevel ? 'forward' : 'back') : null;
		var heightWas = !isPhone() && !panel.hidden ? panel.offsetHeight : 0; /* every change of height glides, not only a turn (2026-09-15: the panel stays centred and grows both ways) */
		renderedLevel = level;
		/* LEVEL 3, A ROLE'S PAGE: where it shows, then its face, its weight,
		   its size (not Lesetext's: the reader's stepper is that), its
		   character spacing, its capitals (not Lesetext's). Lesetext adds
		   the line spacing and the paragraph's two switches. */
		var ro = ROLE_META.filter(function (x) { return x.id === role; })[0] || ROLE_META[0];
		var rv = Styles.role(ro.id);
		var hv = hostType(ro.id); /* the theme's own face and weight where the panel sets neither (above, THE THEME'S OWN TYPE) */
		/* One list for every role (Manuel, 2026-09-13). */
		var faces = ALLFACES.filter(function (f) { return f.listed || f.id === rv.face; });
		/* "WIE FLIESSTEXT" LEFT THE LIST ON 2026-09-17 (one entry on a list of
		   faces that is not a face, on three rows and not the others) AND IS BACK
		   ON 2026-09-22 WITH ITS TWIN, on every follower's list and none of the
		   anchors' (Manuel: "what disturbed me was that it's incoherent … let's
		   think it through coherently"). Two rows above the four sections:
		   Same as reading text, Same as interface. The same two on all six, so a
		   row that follows says so and a row that does not names its face. */
		var follower = ro.id !== 'read' && ro.id !== 'ui';
		/* A POP-UP ROW (the audit, 2026-09-13; System Settings' pop-up button):
		   a label, the chosen value, the up-down chevrons; a press opens the
		   menu over the row. The field clips to its corners, so the menu is
		   the field's sibling inside an unclipped wrapper. */
		/* A pop-up row's button and its menu, apart, so one field can hold more
		   than one pop-up row (More design options, 2026-09-23). */
		function popupButton(kind, label, valueHtml) {
			return '<button type="button" class="quire-button reading-nav reading-font-row" data-panel-popup="' + kind + '" aria-haspopup="menu" aria-expanded="' + (popup === kind) + '">' +
				'<span class="reading-row-label">' + label + '</span><span class="reading-row-value">' + valueHtml + '</span>' + UPDOWN +
			'</button>';
		}
		function popupMenu(kind, label, items) {
			if (popup !== kind) return '';
			return '<ul class="quire-menu reading-font-menu" role="menu" aria-label="' + label + '">' +
				items.map(function (it) {
					return '<li role="none"><button type="button" class="quire-menu-item' + (it.on ? ' is-selected' : '') + '" role="menuitemradio" aria-checked="' + it.on + '" ' + it.attr + '>' +
						'<span class="quire-menu-label"' + (it.family ? ' style="font-family:' + famAttr(it.family) + '"' : '') + '>' + it.label + '</span>' + icon('check', 'class="quire-menu-check"') + '</button></li>';
				}).join('') +
			'</ul>';
		}
		function popupRow(kind, label, valueHtml, items, note, rowsAbove, rowsBelow) {
			var open = popup === kind;
			return '<div class="reading-font-field">' +
				'<div class="reading-list">' + (rowsAbove || '') +
				popupButton(kind, label, valueHtml) +
				/* NO DESCRIPTIONS (Manuel, 2026-09-15: "for the minimalism we should
				   take out all these little descriptions in that panel. We can add
				   it later where it's really needed"). The note a row was handed is
				   kept by its caller and not printed. */
				(rowsBelow || '') +
				'</div>' +
				(open ?
				'<ul class="quire-menu reading-font-menu" role="menu" aria-label="' + label + '">' +
					items.map(function (it) {
						return '<li role="none"><button type="button" class="quire-menu-item' + (it.on ? ' is-selected' : '') + '" role="menuitemradio" aria-checked="' + it.on + '" ' + it.attr + '>' +
							'<span class="quire-menu-label"' + (it.family ? ' style="font-family:' + famAttr(it.family) + '"' : '') + '>' + it.label + '</span>' + icon('check', 'class="quire-menu-check"') + '</button></li>';
					}).join('') +
				'</ul>' : '') +
			'</div>';
		}
		/* A FAMILY IS FULL OF DOUBLE QUOTES and an attribute written with them ends
		   at the first one: `style="font-family:"Inter Variable", Inter…"` closed
		   after `font-family:` and the rest of the stack was parsed as attributes
		   (`inter="" variable",=""`, visible in the DOM). So every row that was
		   meant to show a name in its own face showed it in the panel's, which is
		   the one thing the list is for, and it looked like twelve names in Inter
		   because that is what it was. Found 2026-09-17 reading the rendered rows
		   rather than the source. */
		function famAttr(family) { return String(family).replace(/"/g, '&quot;'); }
		var faceNowFamily = ((faces.filter(function (f) { return f.id === rv.face; })[0] || {}).family || 'inherit');
		/* SCHRIFTART IS A LEVEL (Manuel, 2026-09-17, with a screenshot of the menu
		   standing off the panel's top and bottom edges: "own window").

		   The split of 2026-09-16 was: a page for a long list, a pop-up for a
		   short one, and the faces were counted as short. They are eleven now and
		   the panel is a fixed-height popover, so the menu was taller than the
		   thing it belongs to and spilled past both its corners. The rule holds;
		   this list simply stopped being short. `data-popup-spill` was the patch
		   for a menu that does not fit, and a list that never fits wants a page.

		   The weights stay a pop-up: nine at most, and the most a face offers is
		   nine, so it is bounded where this one grows with every face shipped. */
		/* THE NAME, NOT A SAMPLE (Manuel, 2026-09-18: "the Newsreader font is still
		   there … it should be Inter … that looks disturbing"): the row's value
		   says the face's name in the panel's own face, as the font list does. */
		var fontRow = '<div class="reading-list">' + nav(10, t('Font'), hv && hv.face ? hv.face : faceLabel(rv.face)) + '</div>';
		/* The weight is a pop-up: its stops change with the face, and a slider
		   whose scale moves under the reader is not a slider (the audit). Words
		   only; Books shows readers no numbers. */
		/* KURSIV BELONGS TO THE FACE (Manuel, 2026-09-16: it "should sit underneath
		   Schriftstärke not in the middle somewhere"). It stood in a field of its
		   own between the sliders, where it read as a paragraph setting; it is
		   the face's third row now, under Schriftart and Schriftstärke, with
		   Großbuchstaben under it where the role has one. Where the face has no
		   italic the row is disabled and says so (the audit: disable, do not
		   remove). */
		/* THE SWITCH SAYS IT, NOT A SENTENCE UNDER IT (Manuel, 2026-09-17: "when
		   something is not available just toggle off … but no description line
		   please, it's not necessary"). A greyed row with a dead switch is the
		   whole message; the line under it repeated it in words and made one row
		   twice as tall as its neighbours. */
		var hasIt = Styles.hasItalic(rv.face);
		var italicRow = '<div class="reading-row' + (hasIt ? '' : ' is-disabled') + '"><span class="reading-row-label">' + t('Italic') + '</span><button type="button" class="reading-toggle" role="switch" aria-checked="' + (hasIt && rv.italic) + '"' + (hasIt ? '' : ' aria-disabled="true" disabled') + ' data-panel-role-italic aria-label="' + t('Italic') + '"></button></div>';
		/* GROSSBUCHSTABEN ON EVERY ROW TOO (the same ask): it stood on seven of
		   the eight and Fließtext was the exception, for no reason the page
		   gives. Every row carries the same six settings now. */
		var capsRow = '<div class="reading-row"><span class="reading-row-label">' + t('Capitals') + '</span><button type="button" class="reading-toggle" role="switch" aria-checked="' + rv.caps + '" data-panel-role-caps aria-label="' + t('Capitals') + '"></button></div>';
		/* AND THE WEIGHT ROW DISABLES ITSELF ON A FACE WITH NO WEIGHT AXIS
		   (Workbench, 2026-09-17), the way Kursiv does on a face with no italic:
		   the row greys out and its menu never opens. A pop-up that opens onto an
		   empty list is worse than a row that says it cannot. */
		var weights = Styles.weightsFor(rv.face);
		var weightNow = hv && hv.weight ? hv.weight : rv.weight;
		/* THE WEIGHT IS A SLIDER (Manuel, 2026-09-18, the member page's pop-up:
		   "that's weird, why not slider?"): the face's weights in a row, the
		   knob where the chosen one stands, like every other dial on the page;
		   the pop-up of 2026-09-13 is gone from the roles and the members
		   alike. Italic and Capitals keep their field under it. */
		var weightRow = (weights.length
			? slider(t('Weight'), weights.map(function (w) { return { id: w, label: weightWord(w) + ' ' + WEIGHT_NUMBER[w] }; }), weightNow, 'data-panel-weight-range')
			: '<div class="reading-list"><div class="reading-row is-disabled"><span class="reading-row-label">' + t('Weight') + '</span><span class="reading-row-value">' + weightWord(weightNow) + '</span></div></div>');
		/* ALIGNMENT (2026-09-25), on the roles that carry it (Überschriften, Kategorien): a pop-up row in the switches' field, its menu over its own row. */
		var ALIGN_WORD = { 'default': 'Left', center: 'Centre', right: 'Right' }, ALIGN_ORDER = ['default', 'center', 'right'];
		/* THE COLOUR (2026-09-26, lab/the-heading-colour-2.html, A): on the same two roles, under Alignment, the word with its well; Own colour… opens the editor on the role's well. */
		function roleColourHex() { var c = Styles.colours ? (Styles.colours(current.id)[n.resolvedSide] || {}) : {}; return rv.colour === 'accent' ? (cssHex('--accent') || '#000000') : rv.colour === 'own' ? (c[ro.id] || cssHex('--accent') || '#000000') : (cssHex('--text-primary') || '#000000'); }
		var colourRow = rv.colour === undefined ? '' : popupButton('colour', t('Colour'), t(rv.colour === 'accent' ? 'Accent' : rv.colour === 'own' ? 'Own colour' : 'Ink') + '<span class="reading-well" style="--well:' + roleColourHex() + '" aria-hidden="true"></span>');
		var colourMenu = rv.colour === undefined ? '' : popupMenu('colour', t('Colour'), [
			{ on: rv.colour === 'ink', attr: 'data-panel-pick-colour="ink"', label: t('Ink') },
			{ on: rv.colour === 'accent', attr: 'data-panel-pick-colour="accent"', label: t('Accent') },
			{ on: rv.colour === 'own', attr: 'data-panel-pick-colour="own"', label: t('Own colour…') }]);
		var switchRows = rv.align === undefined ? '<div class="reading-list">' + italicRow + capsRow + '</div>'
			: '<div class="reading-font-field"><div class="reading-list">' + italicRow + capsRow + popupButton('align', t('Alignment'), t(ALIGN_WORD[rv.align] || 'Left')) + colourRow + '</div>' +
				popupMenu('align', t('Alignment'), ALIGN_ORDER.map(function (id) { return { on: rv.align === id, attr: 'data-panel-pick-align="' + id + '"', label: t(ALIGN_WORD[id]) }; })) + colourMenu + '</div>'; /* their own field, placed after the four spacings since 2026-09-19 (level3, below) */
		/* FLIESSTEXT'S SIZE IS ITS OWN LADDER (Manuel, 2026-09-15: "maybe I
		   want different proportions. It should be in its own ladder"). Until
		   today the row was the first level's stepper in slider form, and a
		   step there moved the title and every heading with the text. Now it
		   is the role's own nine stops, applied to the paragraphs alone
		   (style.css, --read-size); the stepper on the first page keeps moving
		   the whole ladder, and Überschriften keeps its own size on top. */
		/* ÜBERSCHRIFTEN IN TEXTGRÖSSE IS GONE (Manuel, 2026-09-16: "this setting
		   is weird take it out"). It was the one stop that lived outside the
		   slider, and the slider's stops were counted against a list that still
		   carried it, so on Überschriften every step landed one off. The size in
		   pixels says what that switch was for: dial the headings to the
		   reading text's number. */
		/* WIE FLIESSTEXT IS A STOP, NOT A SWITCH (Manuel, 2026-09-16, Codex's
		   "Same as UI font" in its font menu): the heading's size follows the
		   reading text from the first stop of its own slider, counted in the
		   same list the presses read, so no step lands one off. */
		/* THE STOPS ARE THE SIZES (2026-09-16): each one a rung of the system's
		   own scale, so the slider says the number it sets and two roles can be
		   dialled to the same one. */
		/* IN WORDS ON THE THEME'S OWN LOOK (Manuel, 2026-09-22: "64 px means
		   nothing on a theme whose title is 48"). There every stop is a ratio of
		   what the host already had, so the stop says how far from it: −12 %,
		   Default, +12 %. Under a look the numbers are Architrave's own again
		   and the stop says the pixel it sets, as on Architrave. */
		var ratioStops = !!window.architravePanelGuest && Styles.current && Styles.current() === 'host';
		var restSize = ratioStops && Styles.restSize ? +Styles.restSize(ro.id) : 0;
		var sizeBlock = slider(t('Size'), Styles.sizesFor(ro.id).map(function (id) {
			var pct = restSize ? Math.round((+id / restSize - 1) * 100) : 0;
			return { id: id, label: ratioStops ? (pct === 0 ? t('Default') : (pct > 0 ? '+' : '−') + Math.abs(pct) + ' %') : id + ' px' };
		}), rv.size, 'data-panel-size-range', '', '', dead('size:' + ro.id));
		/* THE FOUR PAGES BEHIND CUSTOMISE (2026-09-26, see layoutBody): each a
		   page of its own with the way back to Customise. */
		function pageOf(title, body) { return '<div class="reading-sheet-top">' + head(title, 2) + '</div><div class="reading-sheet-body">' + body + '</div>'; }
		var level14 = pageOf(t('Layout'), layoutBody), level15 = pageOf(t('Corners and lines'), shapeBody), level16 = pageOf(t('Pictures'), picturesBody), level17 = pageOf(t('Effects'), effectsBody);

		/* THE TYPE'S OWN PAGE (Manuel, 2026-09-16): the roles, each with the
		   face and the weight it is set in, each opening its own page as before.
		   The rows are exactly the ones that stood under Typografie on the page
		   before; only the door is new. */
		/* TWO GROUPS, ARTIKEL AND WEBSITE (Manuel, 2026-09-17). Eight rows in one
		   field is a list, not a page. Apple's grouped list puts one field round
		   the things that are alike and a title over it, and these rows are two
		   kinds: what you read, and the furniture you press. A row standing alone
		   in its own field is how Apple marks a row that is UNLIKE its
		   neighbours, so eight single-row fields would have said the opposite of
		   what is true here.
		   The clash the titles had to avoid: the role named Oberfläche under a
		   group also named Oberfläche. The group is Website, which is what the
		   rail, the menus and the cards belong to; the row keeps the word that
		   names what it sets. */
		var ROLE_GROUP = [
			{ title: 'Article', ids: ['head', 'kicker', 'read', 'quote', 'small', 'comment'] }, /* the page from the top down: title, category line, paragraphs, quotes, then the dates and captions, then the conversation under it */
			{ title: 'Site', ids: ['ui', 'title'] }
		];
		/* A ROLE NAMED IN NO GROUP WOULD VANISH FROM THE PANEL, silently, and a
		   dial nobody can reach looks exactly like a dial nobody wanted. The
		   list above is written by hand because the order is a design decision;
		   the leftovers fall into the last group rather than off the page. */
		(function () {
			var named = ROLE_GROUP.reduce(function (a, g) { return a.concat(g.ids); }, []);
			ROLE_META.forEach(function (ro2) { if (named.indexOf(ro2.id) === -1) ROLE_GROUP[ROLE_GROUP.length - 1].ids.push(ro2.id); });
		}());
		function roleRow(ro2) {
			/* One line a row (Manuel, 2026-09-13: the subtitled rows were "too cramped"); where the role shows is the note under its font row. */
			var off = dead('role:' + ro2.id);
			return '<button type="button" class="quire-button reading-nav' + (off ? ' is-disabled' : '') + '" data-panel-level="3" data-panel-role="' + ro2.id + '"' + (off ? ' disabled aria-disabled="true"' : '') + '>' +
				'<span class="reading-row-label">' + t(ro2.label) + '</span><span class="reading-row-value">' + roleSummary(ro2.id) + '</span>' + icon('chevron-right', 'class="reading-row-check"') +
			'</button>';
		}
		/* ONE LIST, EQUAL ROWS (Manuel, 2026-09-22: "no article or interface, just
		   individual rows like equal rows"). The two titles, Article and Site, said
		   less than they cost: on a theme that is not Architrave the second group
		   held one live row and one greyed, and on Architrave the eight rows read
		   as well without a heading over them. ROLE_GROUP still says the order. */
		var level8 =
			'<div class="reading-sheet-top">' + head(t('Type'), 2) + '</div>' +
			'<div class="reading-sheet-body">' +
				/* TWO NAMED BOXES (Manuel, 2026-09-23, the layout pass): the article's
				   six roles, then the site's two, as Settings names its groups. */
				ROLE_GROUP.map(function (g) {
					var rows = g.ids.filter(function (id) { return !gone('role:' + id); }).map(function (id) { return roleRow(ROLE_META.filter(function (x) { return x.id === id; })[0]); }).join('');
					return rows ? '<p class="reading-group-title">' + t(g.title) + '</p><div class="reading-list">' + rows + '</div>' : '';
				}).join('') +
			'</div>';

		/* The faces on their own page, in the panel's own list grammar — the
		   check leads the row as it does on Farbpaare, and each name is set in
		   the face it names, which the menu did and a list should not lose. Back
		   goes to the role that asked. */
		/* FOUR SECTIONS ON THE FONT PAGE (Manuel, 2026-09-17: "I want to have
		   sections on that, or little section titles"). Twelve names in one field
		   is a list to read through; under four titles it is a list to choose
		   from, because the title says what kind of thing is under it before you
		   read a single name.

		   The order is the order a page is built in: the sans you set the
		   interface in, the serif you read in, the mono, and then the pixel
		   faces. A section with nothing in it prints nothing, so a face leaving
		   the list cannot leave an empty title behind. */
		var FACE_GROUPS = [
			{ id: 'sans', title: 'Sans-serif' },
			{ id: 'serif', title: 'Serif' },
			{ id: 'mono', title: 'Monospace' },
			{ id: 'pixel', title: 'Pixel' },
			{ id: 'display', title: 'Display' } /* the fifth (2026-09-23), with the font library: faces for big headings only */
		];
		function faceRow(f) {
			/* Under the theme's own face the tick stands on that face if the list has it, and nowhere if not. */
			var on = hv && hv.face ? f.label.toLowerCase() === hv.face.toLowerCase() : f.id === (rv.face === 'inherit' ? 'read' : rv.face);
			return '<li role="none"><button type="button" class="reading-row reading-row-led" role="radio" aria-checked="' + on + '" data-panel-role-face="' + f.id + '">' +
				(on ? icon('check', 'class="reading-row-check reading-row-lead"') : '<span class="reading-row-check reading-row-lead is-blank" aria-hidden="true"></span>') +
				/* A PLAIN LIST, IN INTER (Manuel, 2026-09-18: "I don't want to see a preview of that font in that tiny font size … just a plain list, all in Inter, with the font name"). The row wore its own face since 1.3.205. */
				'<span class="reading-row-label">' + f.label + '</span></button></li>';
		}
		var grouped = FACE_GROUPS.map(function (g) {
			var mine = faces.filter(function (f) { return f.group === g.id; });
			if (!mine.length) return '';
			return '<p class="reading-group-title">' + t(g.title) + '</p>' +
				'<ul class="reading-group" role="radiogroup" aria-label="' + t(g.title) + '">' + mine.map(faceRow).join('') + '</ul>';
		}).join('');
		/* Anything the four titles do not claim still has to be reachable — a
		   face with no group, or one kept for a style and not listed. */
		var ungrouped = faces.filter(function (f) { return FACE_GROUPS.every(function (g) { return g.id !== f.group; }); });
		var anchorRows = follower ? '<ul class="reading-group" role="radiogroup" aria-label="' + t('Font') + '">' +
			[{ id: 'read', label: t('Same as reading text') }, { id: 'ui', label: t('Same as interface') }].map(faceRow).join('') + '</ul>' : '';
		var level10 =
			/* A SEARCH FIELD OVER A LONG LIST (Manuel, 2026-09-23, the layout pass:
			   the font library brought the list to about a hundred faces; Apple puts
			   a search field at the top of a list that long). It filters the rows in
			   place, a title goes with its last row, and it stays in the head while
			   the list scrolls. */
			'<div class="reading-sheet-top">' + head(t('Font'), 3) +
				'<div class="reading-face-search"><input type="search" class="quire-input reading-name-field" data-panel-face-search placeholder="' + t('Search fonts') + '" aria-label="' + t('Search fonts') + '" value="' + String(faceQuery).replace(/"/g, '&quot;') + '" autocomplete="off" spellcheck="false"></div>' +
			'</div>' +
			'<div class="reading-sheet-body">' +
			'<p class="reading-footnote reading-face-none" hidden>' + t('No results') + '</p>' +
			anchorRows +
			grouped +
			(ungrouped.length ? '<ul class="reading-group" role="radiogroup" aria-label="' + t('Font') + '">' + ungrouped.map(faceRow).join('') + '</ul>' : '') +
			/* REMOVE UNUSED FONTS (fonts on demand, 2026-09-23): the owner's, and
			   only once a library face has been fetched. The work is the
			   plugin's font-fetch.js, which answers the press. */
			(window.ArchitraveFontFetch && window.ArchitraveFontFetch.fetched() ? '<ul class="reading-group reading-face-prune"><li><button type="button" class="reading-row" data-panel-font-prune><span class="reading-row-label">' + t('Remove unused fonts') + '</span></button></li></ul>' +
				'<p class="reading-footnote">' + t('A removed font downloads again when you pick it.') + '</p>' : '') +
			'</div>';

		/* THE MEMBERS OF A ROLE (Manuel, 2026-09-18; lab/the-members-of-a-role.html;
		   presets.js THE MEMBERS OF A ROLE). Under Oberfläche's dials, a field
		   named Mitglieder: one row per size the role sets, the name, where it
		   stands, the number it reads at, and a mark. Bound, the mark is the
		   chain and the number follows the lead; released, the mark is the open
		   chain and the row carries its own size. One gesture per row (Manuel:
		   "is it on purpose that I can click on the icon and I can click on the
		   row?"): the row opens the member's page, the mark binds and releases.
		   The lead's row says so and opens nothing; its number is the dial above. */
		var MEMBER_META = {
			'ui.masthead': { label: 'Masthead', where: 'Top of the left sidebar' },
			'ui.cards': { label: 'Card titles', where: 'Left sidebar, under articles, search, ruler' },
			'ui.linkcard': { label: 'Large card titles', where: 'Link cards and theme cards' },
			'ui.newsletter': { label: 'Newsletter card', where: 'Its title and text in the left sidebar' },
			'ui.fields': { label: 'Fields', where: 'The search field in the left sidebar' },
			'ui.menus': { label: 'Menus and buttons', where: 'Navigation, fields, switches' },
			'ui.labels': { label: 'Labels', where: 'Tooltips, badges, key hints' },
			'ui.credit': { label: 'Credit', where: 'Foot of the right comments sidebar' },
			'head.title': { label: 'Article title', where: 'The title of the article, on the page and the cards' },
			'head.sub': { label: 'Subheadings', where: window.architravePanelGuest ? 'Every heading but the article\'s title' : 'The headings inside the article' },
			'small.date': { label: 'Date line', where: 'The date of the article' },
			'small.author': { label: 'Author', where: 'Name and bio under the article' },
			'small.terms': { label: 'Categories and tags', where: 'The lines at the end of the article' },
			'small.captions': { label: 'Captions', where: 'Under pictures, and the source of a quote' },
			'small.carddates': { label: 'Card dates', where: 'Sidebar rows, related rows, cards' },
			'small.release': { label: 'Release notes', where: 'Version line and banner on a release post' },
			'comment.title': { label: 'Comment title', where: 'Over the comments and the form' },
			'comment.name': { label: 'Name', where: 'Who wrote the comment' },
			'comment.text': { label: 'Comment text', where: 'The words of the comment' },
			'comment.small': { label: 'Comment lines', where: 'Dates and reply links' },
			'comment.form': { label: 'Form', where: 'Labels, notes and the buttons under the comments' },
			'read.text': { label: 'Paragraphs', where: 'The paragraphs and lists of the article' },
			'read.excerpts': { label: 'Excerpts', where: 'The text on the front page\'s cards' },
			'read.boxes': { label: 'Boxes', where: 'Notes and buttons in a box inside the article' },
			'title.sections': { label: 'Section titles', where: 'The small titles in the left sidebar' },
			'title.years': { label: 'Year titles', where: 'The years in the archive' },
			'title.release': { label: 'Release titles', where: 'Over the demo and download buttons' }
		};
		function memberMeta(roleId, id) { return MEMBER_META[roleId + '.' + id] || { label: id, where: '' }; }
		var MEMBER_DIALS = Styles.memberDialsFor ? Styles.memberDialsFor(ro.id) : Styles.memberDials || ['size', 'weight', 'caps', 'tracking']; /* Überschriften's members have a fifth, the alignment (2026-09-25) */
		var OWN_WORD = { size: 'Own size', weight: 'Own weight', caps: 'Own capitals', tracking: 'Own character spacing', align: 'Own alignment' };
		var M_ALIGN_WORD = { 'default': 'Left', center: 'Centre', right: 'Right' };
		function dialLabel(d) { return d === 'size' ? t('Size') : d === 'weight' ? t('Weight') : d === 'caps' ? t('Capitals') : d === 'align' ? t('Alignment') : t('Character spacing'); }
		function dialValue(m, d) {
			if (d === 'size') return m.size + ' px';
			if (d === 'weight') return weightWord(m.weight) + ' ' + (WEIGHT_NUMBER[m.weight] || '');
			if (d === 'caps') return t(m.caps ? 'On' : 'Off');
			if (d === 'align') return t(M_ALIGN_WORD[m.align] || 'Left');
			return t(((TRACKING.filter(function (x) { return x.id === m.tracking; })[0]) || {}).label || '');
		}
		function memberMark(attr, own) { return '<button type="button" class="reading-member-mark" ' + attr + ' aria-pressed="' + own + '" aria-label="' + t(own ? 'Bind' : 'Release') + '">' + icon(own ? 'unlink' : 'link') + '</button>'; }
		function memberRows(roleId) {
			var list = Styles.members ? Styles.members(roleId) : [];
			/* A MEMBER IS AN ADDRESS, AND SOME ADDRESSES EXIST EVERYWHERE (2026-09-22,
			   Manuel: "on Architrave every size has its own switch, but here we have
			   two different sizes which have the same switch"). A member used to be
			   dropped wholesale on a guest, because a member was taken to name an
			   Architrave part. Most do; several name nothing but a core block, which
			   WordPress prints on every block theme there is. Those stay, the rest
			   are not shown, and the plugin decides which is which by whether it has
			   an address for them (architrave_panel_guest_members). */
			list = list.filter(function (m) { return !gone('member:' + roleId + ':' + m.id); });
			if (list.length < 2) return ''; /* a lead with nobody following it is not a group */
			return '<p class="reading-group-title">' + t('Members') + '</p>' +
				/* NO LINE UNDER THE TITLE (2026-09-23, the layout pass): the sizes in each row say it. */
				'<div class="reading-list reading-members">' +
				list.map(function (m) {
					var meta = memberMeta(roleId, m.id);
					var label = '<span class="reading-row-label">' + t(meta.label) + (m.lead ? ' <span class="reading-member-lead">' + t('Lead size') + '</span>' : '') + '<span class="reading-member-where">' + t(meta.where) + '</span></span>' +
						'<span class="reading-row-value">' + m.size + ' px</span>';
					return '<div class="reading-row reading-member' + (m.bound ? '' : ' is-free') + (m.lead ? ' is-lead' : '') + '">' +
						(m.lead ? '<span class="reading-member-open">' + label + '</span>' :
							/* THE ROW OPENS ITS PAGE AND DOES NOTHING ELSE (2026-09-23, the layout
							   pass): the chain beside it did a second thing on the same row; the
							   member's page says with a switch whether it has its own size. */
							'<button type="button" class="reading-member-open" data-panel-level="11" data-panel-member="' + m.id + '">' + label + icon('chevron-right', 'class="reading-row-check"') + '</button>') +
					'</div>';
				}).join('') +
				'</div>';
		}
		/* A MEMBER'S OWN PAGE (level 11): a switch, Eigene Größe, and under it
		   the size slider once the member is released. Bound, the page says
		   the member follows Oberfläche and shows the number it reads at. */
		var mm = (Styles.members ? Styles.members(ro.id) : []).filter(function (x) { return x.id === member; })[0];
		var mmeta = memberMeta(ro.id, member);
		var level11 =
			'<div class="reading-sheet-top">' + head(t(mmeta.label), 3) + '</div>' +
			'<div class="reading-sheet-body">' +
			(mm ? MEMBER_DIALS.map(function (d) {
				var own = mm.own && mm.own[d] !== undefined;
				/* A SWITCH, NOT A CHAIN (Manuel, 2026-09-23, the layout pass): "Own size"
				   on, the dial is the member's and its control opens under the switch;
				   off, the member follows the role and the row shows what it reads at. */
				var ownRow = '<div class="reading-row reading-member-dial"><span class="reading-row-label">' + t(OWN_WORD[d]) + '</span>' + (own ? '' : '<span class="reading-row-value">' + dialValue(mm, d) + '</span>') + '<button type="button" class="reading-toggle" role="switch" aria-checked="' + own + '" data-panel-member-dial="' + d + '" aria-label="' + t(OWN_WORD[d]) + '"></button></div>';
				var mark = '';
				if (!own) return '<div class="reading-list">' + ownRow + '</div>';
				if (d === 'caps') return '<div class="reading-list">' + ownRow + '<div class="reading-row reading-member-dial"><span class="reading-row-label">' + t('Capitals') + '</span><button type="button" class="reading-toggle" role="switch" aria-checked="' + mm.caps + '" data-panel-member-caps aria-label="' + t('Capitals') + '"></button></div></div>';
				if (d === 'align') return '<div class="reading-font-field"><div class="reading-list">' + ownRow + popupButton('member-align', t('Alignment'), t(M_ALIGN_WORD[mm.align] || 'Left')) + '</div>' +
					popupMenu('member-align', t('Alignment'), ['default', 'center', 'right'].map(function (id) { return { on: mm.align === id, attr: 'data-panel-pick-member-align="' + id + '"', label: t(M_ALIGN_WORD[id]) }; })) + '</div>';
				var ctl = d === 'size' ? slider(t('Size'), Styles.memberSizes(ro.id).map(function (id) { return { id: id, label: id + ' px' }; }), mm.size, 'data-panel-member-size-range', '', mark)
					: d === 'weight' ? slider(t('Weight'), Styles.weightsFor(rv.face).map(function (w) { return { id: w, label: weightWord(w) + ' ' + WEIGHT_NUMBER[w] }; }), mm.weight, 'data-panel-member-weight-range', '', mark)
					: slider(t('Character spacing'), TRACKING, mm.tracking, 'data-panel-member-tracking-range', '', mark);
				return joined('<div class="reading-list">' + ownRow + '</div>', ctl);
			}).join('') + '<p class="reading-footnote">' + t(mmeta.where) + '</p>' : '') +
			'</div>';
		/* FOR READERS, THE PAGE, IS GONE (2026-09-23 it went onto the tiles; the page's string left 2026-09-26). */
		/* THE LIVE DESIGN BUTTON'S PAGE (Manuel, 2026-09-23, lab/the-button-page.html).
		   SLIMMED THE SAME EVENING (Manuel: "so many options … we don't want an
		   overkill with this button"): nine settings became five. Place is a
		   switch, Automatic, and when it is off a little map of the window with a
		   dot in each of the seven places, the one chosen filled; a phone takes
		   the bottom of the same side, so it has no row of its own. Look is Match
		   my site and the Aurora; with Match off, Size and Colour. What the button
		   shows follows its size (small the icon, large the icon and the word)
		   and its corner is the site's, so neither needs a row.
		   AND MATCH MY SITE WENT TOO (Manuel, 2026-09-23, a large button standing
		   beside the small focus button: "could there be a solution?"). A button
		   that Automatic sets among the site's own always wears theirs; Size and
		   Colour are for a button in a place picked on the map. Automatic is the
		   reset: switched back on, the rest goes away. Four settings. */
		var bt = Styles.button ? Styles.button() : null, level13 = '';
		if (bt) {
			var bPick = function (key, label) {
				return popupButton('button-' + key, t(label), t(BUTTON_WORD[key][bt[key]] || ''));
			};
			var bMenu = function (key, label) {
				return popupMenu('button-' + key, t(label), BUTTON_ORDER[key].map(function (id) { return { on: bt[key] === id, attr: 'data-panel-pick-button="' + key + ':' + id + '"', label: t(BUTTON_WORD[key][id]) }; }));
			};
			var bSwitch = function (key, label, on) {
				return '<div class="reading-row"><span class="reading-row-label">' + t(label) + '</span><button type="button" class="reading-toggle" role="switch" aria-checked="' + !!on + '" data-panel-button-switch="' + key + '" aria-label="' + t(label) + '"></button></div>';
			};
			var auto = bt.place === 'auto';
			/* THE NAME, AS APPLE'S SETTINGS ASK FOR ONE (Manuel, 2026-09-24: "do it the Apple
			   way"): the label at the start, the name at the end of the same row in the
			   value's grey, no box of its own; the row lights while it is being typed in.
			   Empty is the square with its icon; the field says so, not a name that looks typed
			   (Manuel, 2026-09-24: "Live Design looks like a word already written in it"). */
			var nameRow = function () { return '<div class="reading-row reading-name-row"><span class="reading-row-label">' + t('Name') + '</span><input type="text" class="quire-input reading-name-field reading-button-name" data-panel-button-label maxlength="30" value="' + String(bt.label || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;') + '" placeholder="' + t('Optional: icon only without a name') + '" aria-label="' + t('Name') + '"></div>'; };
			var inMenu = auto && !!document.querySelector('.architrave-panel-opener[data-docked="menu"][data-match="true"]');
			/* THE SQUARE KEEPS THE LIGHT (2026-09-24): only a word in the menu goes without it. */
			var wordInMenu = inMenu && (!!String(bt.label || '').trim() || bt.icon === false || !!document.querySelector('.architrave-panel-opener[data-docked="menu"][data-folded]'));
			var map = auto ? '' :
				'<div class="reading-row reading-slider-row reading-spot-row">' +
					'<p class="reading-slider-title">' + t('Where') + '<span class="reading-group-value">' + t(BUTTON_WORD.place[bt.place] || '') + '</span></p>' +
					'<div class="reading-spot-map" role="radiogroup" aria-label="' + t('Where') + '">' +
						BUTTON_SPOTS.map(function (id) { var on = bt.place === id; return '<button type="button" class="reading-spot" role="radio" data-spot="' + id + '" aria-checked="' + on + '" aria-label="' + t(BUTTON_WORD.place[id]) + '" title="' + t(BUTTON_WORD.place[id]) + '" data-panel-pick-button="place:' + id + '"></button>'; }).join('') +
					'</div>' +
				'</div>';
			level13 =
				/* FOR VISITORS (2026-09-24): the button and the one sharing switch, the two
				   things the owner sets for everyone who comes, on one page. */
				'<div class="reading-sheet-top">' + head(t('Button and Sharing'), 2) + '</div>' +
				'<div class="reading-sheet-body">' +
				'<p class="reading-group-title">' + t('Live Design button') + '</p>' +
				'<div class="reading-font-field"><div class="reading-list">' + bSwitch('auto', 'Automatic', auto) + map +
					(auto ? '' : bPick('size', 'Button size') + bPick('show', 'Show') + (bt.show !== 'icon' ? nameRow() : '') + bPick('corners', 'Corners') + bPick('color', 'Colour')) +
					(inMenu && wordInMenu ? '<div class="reading-row is-disabled"><span class="reading-row-label">' + t('Aurora') + '</span><button type="button" class="reading-toggle" role="switch" aria-checked="false" disabled aria-disabled="true" aria-label="' + t('Aurora') + '"></button></div>' : bSwitch('aurora', 'Aurora', bt.aurora)) + '</div>' +
					(inMenu ? '<p class="reading-footnote">' + t(wordInMenu ? 'With a name the button is a word in the menu, without the light. Empty, it is a square with its icon.' : 'Beside the menu the button is a square with its icon. A name turns it into a word, without the light.') + '</p>' : '') +
					/* ITS NAME AND ITS ICON, IN A MENU (Manuel, 2026-09-24: "it would be nice if the
					   … text where it says Live Design (and whether there's an icon or not) could be
					   choosable"). Only there: floating, the icon is the button. Empty is Live Design. */
					(inMenu ? '</div><div class="reading-list">' + bSwitch('icon', 'Icon', bt.icon !== false) +
						nameRow() : '') +
					(auto ? '' : bMenu('size', 'Button size') + bMenu('show', 'Show') + bMenu('corners', 'Corners') + bMenu('color', 'Colour')) + '</div>' +
				'<p class="reading-group-title">' + t('Who sees the button') + '</p>' +
				'<div class="reading-segment quire-segmented" role="radiogroup" aria-label="' + t('Who sees the button') + '">' +
					['everyone', 'me'].map(function (id) { var on = bt.who === id; return '<button type="button" role="radio"' + (on ? ' class="is-active"' : '') + ' aria-checked="' + on + '" data-panel-pick-button="who:' + id + '">' + t(BUTTON_WORD.who[id]) + '</button>'; }).join('') +
				'</div>' +
				(Styles.setReadersCopy ? '<p class="reading-group-title">' + t('Sharing') + '</p>' +
					'<div class="reading-list"><div class="reading-row"><span class="reading-row-label">' + t('Everyone can copy styles') + '</span><button type="button" class="reading-toggle" role="switch" aria-checked="' + Styles.readersCopy() + '" data-panel-readers-copy aria-label="' + t('Everyone can copy styles') + '"></button></div></div>' : '') +
				'</div>';
		}
		/* Several one-row fields as one field: each part's own box is taken off and one is put round all of them. */
		function joined() { return '<div class="reading-list">' + Array.prototype.map.call(arguments, function (h) { return h.replace(/^<div class="reading-list">/, '').replace(/<\/div>$/, ''); }).join('') + '</div>'; }
		var level3 =
			'<div class="reading-sheet-top">' + head(t(ro.label), 8) + '</div>' +
			'<div class="reading-sheet-body">' +
			/* A pop-up row names itself; no title over it (System Settings). */
			/* THE ORDER A TYPE PANEL HAS (Manuel, 2026-09-19, Figma's Typography beside ours; "what would Apple do … ok do it"): the face, then the SIZE, which is the dial reached for most and stood third under the weight and two switches; then the weight, the line, the letter, the word; the two switches after the dials they qualify; the members last. */
			fontRow +
			/* TWO BOXES FOR FIVE SLIDERS (Manuel, 2026-09-23, the layout pass; Apple's
			   Settings keeps related controls in one box with a hairline between):
			   the size and the weight, then the three spacings. Each slider stood
			   in a box of its own and Interface's page measured 1154 px. */
			joined(sizeBlock, weightRow) +
			joined((ro.id === 'read' ? slider(t('Line spacing'), LEADING, n.leading, 'data-panel-leading-range') : slider(t('Line spacing'), roleLeadList(ro.id, rv.leading), rv.leading, 'data-panel-role-leading-range')),
			/* THE FOUR SPACINGS, ON EVERY ROW (Manuel, 2026-09-17: "all typo
			   elements should have Schriftgröße, Zeilenabstand, Laufweite und
			   Wortabstand"). Laufweite stood on every role already; Wortabstand
			   was Fließtext's alone and is every role's now. The order is the
			   same on all eight rows, largest unit first: the size, the line, the
			   letter, the word.
			   Laufweite once stood inside Fließtext's Absatz group, because it
			   followed the paragraph's Gilt für while the other dials reached the
			   index regardless (Manuel, 2026-09-15: "Laufweite is not working on
			   both but Zeilenabstand is … there's no real order"). Gilt für is
			   gone since the same day, so there is nothing left for it to obey and
			   it stands with its own kind. */
			slider(t('Character spacing'), TRACKING, rv.tracking, 'data-panel-tracking-range'),
			slider(t('Word spacing'), WORDSPACE, rv.words || 'default', 'data-panel-words-range')) +
			switchRows +
			(ro.id === 'read' ?
				/* EACH FIELD UNDER ITS OWN TITLE (Manuel, 2026-09-15: in one field "it
				   looks that Höhe der Initiale is also for Blocksatz. And secondly
				   there is no title?"). Absatz holds Blocksatz; Initiale holds its
				   switch and its height, the row named Höhe under the title. */
				/* ONE PARAGRAPH BOX (Manuel, 2026-09-23, the layout pass): Justified,
				   Drop cap and its height, which stood in two boxes under two titles,
				   and Softer reading text, which stood on the Colour page though it is
				   about the text. A dial under its switch appears only while it is on. */
				'<p class="reading-group-title">' + t('Paragraph') + '</p>' +
				'<div class="reading-font-field"><div class="reading-list">' +
					'<div class="reading-row"><span class="reading-row-label">' + t('Justified text') + '</span><button type="button" class="reading-toggle" role="switch" aria-checked="' + n.justify + '" data-panel-option="justify" aria-label="' + t('Justified text') + '"></button></div>' +
					'<div class="reading-row"><span class="reading-row-label">' + t('Drop cap') + '</span><button type="button" class="reading-toggle" role="switch" aria-checked="' + n.dropcap + '" data-panel-option="dropcap" aria-label="' + t('Drop cap') + '"></button></div>' +
					(n.dropcap ? popupButton('caplines', t('Drop cap height'), t('{n} lines').replace('{n}', n.capLines)) : '') +
					/* Softer reading text went to Colour and Line length to Layout (2026-09-26). */
				'</div>' +
				(n.dropcap ? popupMenu('caplines', t('Drop cap height'), (Styles.capLines || []).map(function (id) { return { on: n.capLines === id, attr: 'data-panel-pick-caplines="' + id + '"', label: t('{n} lines').replace('{n}', id) }; })) : '') +
				'</div>'
			: '') +
			/* MEMBERS LAST (2026-09-23, the layout pass): the role's own dials first, then who follows them. */
			memberRows(ro.id) +
			'</div>';
		/* The side's three colours as they stand: the reader's wells, or the pair's own. */
		var colAll = Styles.colours ? Styles.colours(current.id) : { light: {}, dark: {}, derived: { light: [], dark: [] } };
		var colNow = colAll[n.resolvedSide] || {};
		var other = n.resolvedSide === 'dark' ? 'light' : 'dark', colDerived = (colAll.derived && colAll.derived[other]) || [], colFollows = (colAll.derived && colAll.derived[n.resolvedSide]) || [];
		var paperNow = colNow.paper || cssHex('--surface-base') || (Styles.paperOf ? Styles.paperOf(n.resolvedSide) : '#ffffff');
		var inkNow = colNow.ink || cssHex('--text-primary') || (n.resolvedSide === 'dark' ? '#ffffff' : '#000000');
		var ownAccent = colNow.accent || '';
		var groundNow = colNow.ground || cssHex('--surface-canvas') || paperNow, liftNow = colNow.lift || cssHex('--surface-subtle') || paperNow;
		var sidesLinked = Styles.linked ? Styles.linked() : true;
		/* THE ACCENT IN A WORD, for its row: the colour of its own if one is
		   set, else the dot chosen, else the ink, which is the first dot and
		   not a "none" (Manuel, 2026-09-15). */
		/* WHICH ROW OF WHICH LIST IS ON, for the three rows under Eigene and for
		   the list each of them opens. A row shows the colour's name when the
		   colour came off that list and its hex when it was mixed on the wheel;
		   a style wearing a preset shows the preset's hex, because the lists and
		   the presets are not connected (Manuel, 2026-09-16). */
		function listId(key) { return Styles.listColour ? Styles.listColour(key) : ''; }
		function listNamed(key, hex) {
			var id = listId(key), list = Styles.swatchList ? Styles.swatchList(key) : [];
			var hit = id ? list.filter(function (x) { return x.id === id; })[0] : null;
			return hit ? t(hit.label) : '<span class="reading-hex">' + (hex || '').toUpperCase() + '</span>';
		}
		/* THE PRESETS' GRID, on the Colour page itself since 2026-09-23 (the layout pass: the Preset row opened a page of its own with the same word twice), and on the Presets page for whoever still lands there. */
		function presetGrid() {
			/* NO PAIRS ON A COPY OF THE ORIGINAL (2026-09-25, Manuel on the first
			   five presets: "if I click the first few presets, actually nothing
			   happens"). A pair is a room, and a room belongs to a look; a bare
			   tile keeps the theme's own page and paints no room, so the five
			   pairs could never land there — pressed, they did nothing. The
			   colour sets below work everywhere: they are plain paper, ink and
			   accent. What can never act is not shown. */
			var noPairs = current && (current.host || current.bare);
			return '<div class="reading-preset-grid" role="radiogroup" aria-label="' + t('Presets') + '">' +
				(noPairs ? '' : pairs.map(function (p) {
					var on = !presetOn && p.id === n.palette;
					return '<button type="button" class="reading-preset-tile" role="radio" aria-checked="' + on + '" data-panel-pair="' + p.id + '">' + pagePic(modeTriple(p.id, n.resolvedSide)) + '<span class="reading-preset-name">' + t(p.label) + '</span></button>';
				}).join('')) +
				presets.map(function (p) {
					var on = presetNow === p.id;
					return '<button type="button" class="reading-preset-tile" role="radio" aria-checked="' + on + '" data-panel-preset="' + p.id + '">' + pagePic(p[n.resolvedSide]) + '<span class="reading-preset-name">' + t(p.label) + '</span></button>';
				}).join('') +
			'</div>';
		}
		var level4 =
			'<div class="reading-sheet-top">' + head(t('Colour'), 2) + '</div>' +
			'<div class="reading-sheet-body">' +
			/* THE SIDE IS BACK ON THIS PAGE (Manuel, 2026-09-16: "bring back the
			   hell dunkel switcher on that page"), reversing its removal of
			   2026-09-15: the colours you set are the shown side's, so the
			   switch that changes sides stands with them, the same tall
			   segment the first level carries. */
			/* THE THREE SIDES AS PICTURES (Manuel, 2026-09-16, from Codex's
			   Appearance pane, where System, Light and Dark are little pictures
			   of the interface and not words with glyphs): a paper with its rail
			   and three lines, painted in each side's own ground and ink; System
			   is the two halves of one page. The first level keeps its tall
			   segment, the switch you reach while reading. */
			/* NO TITLE OVER THE PICTURES (Manuel, 2026-09-16: "we don't need that
			   title at all … there's quite a lot of empty space above that and we
			   should reduce that so that it's coherent with the other pages"). Two
			   pictures with their names under them say what they are; the word
			   above only bought the page an indent the other pages do not have.
			   The group is still named for a screen reader by the field's own
			   aria-label, which carries the same word. */
			/* TWO SIDES HERE, THREE ON THE FIRST PAGE (Manuel, 2026-09-16: "on the
			   Farbe setting we only need light and dark"): the colours on this
			   page belong to one side, and System is not a side to paint, it is
			   how the page picks one. The name stands under the picture, outside
			   the pressable box, as Codex sets it. */
			'<div class="reading-modes" data-linked="' + sidesLinked + '" role="radiogroup" aria-label="' + t('Appearance') + '">' +
				SIDES.filter(function (s) { return s.id !== 'auto'; }).map(function (s, i) {
					var on = s.id === n.resolvedSide;
					return '<div class="reading-mode-item"' + (on ? ' data-on="true"' : '') + '>' +
						'<button type="button" class="reading-tile reading-mode-tile" role="radio" aria-checked="' + on + '" data-panel-side="' + s.id + '" aria-label="' + t(s.label) + '">' +
							/* THE PICTURE IS THE STYLE YOU ARE IN (Manuel, 2026-09-18: "those little
							   example images could be actually representing the actual style we are
							   working in … live rendering the style"). Each side's picture wears the
							   style's pair on that side, and its own colours over it where it has
							   them, as the style tiles do; until today both wore Neutral. */
							'<span class="reading-mode-shot ' + shotClass(current, s.id) + '" data-shot="' + s.id + '" aria-hidden="true"' + shotColours(current, s.id) + '>' +
								/* ONE PICTURE OF A PAGE, here and on every preset (Manuel, 2026-09-23: "that
								   little sample image should be the same as the light and dark … what is this
								   frame underneath?"): a line of ink, a shorter line of text, a short line of
								   the accent. The card that stood under the lines is gone. */
								PIC_LINES +
							'</span>' +
						'</button>' +
					'</div>' +
					/* THE CHAIN BETWEEN THEM (Manuel, 2026-09-16): linked, the side
					   you are not looking at follows the one you set; broken, each
					   side keeps what it has. */
					/* THE NECK KEEPS ITS PLACE, EMPTY (2026-09-23, the layout pass): the chain
					   that stood in it is a switch under the pictures now; the waist still
					   draws whether the two sides are one. */
					(i === 0 ? '<span class="reading-mode-link" aria-hidden="true"></span>' : '');
				}).join('') +
			'</div>' +
			/* THE NAMES STAND UNDER THE FIELD (Manuel, 2026-09-16: "take the text
			   out of the field so it could be sitting underneath, then we have
			   even padding on those edges with that grey background"). Inside it
			   the word ate the field's lower inset and the ground was 12 above
			   the picture and 12 plus a word below it. Out of it, the ground
			   holds the picture alone with the same air on all four sides, and
			   the two words sit beneath in the same columns. The row repeats
			   what the pictures already say to a screen reader, so it is hidden
			   from one; the buttons carry the names. */
			'<div class="reading-mode-names" aria-hidden="true">' +
				SIDES.filter(function (s) { return s.id !== 'auto'; }).map(function (s, i) {
					return (i === 1 ? '<span class="reading-mode-gap"></span>' : '') +
						'<span class="reading-mode-name"' + (s.id === n.resolvedSide ? ' data-on="true"' : '') + '>' + t(s.label) + '</span>';
				}).join('') +
			'</div>' +
			/* SAME COLOURS FOR LIGHT AND DARK (Manuel, 2026-09-23, "go ahead with all
			   five"): the chain's job in words, as Settings says it with a switch. */
			'<div class="reading-list reading-link-row"><div class="reading-row"><span class="reading-row-label">' + t('Same colours for light and dark') + '</span><button type="button" class="reading-toggle" role="switch" aria-checked="' + sidesLinked + '" data-panel-link aria-label="' + t('Same colours for light and dark') + '"></button></div></div>' +
			/* FOUR ROWS, ONE GROUP (Manuel, 2026-09-16: "would it make more
			   sense if we have two general top-level sections … the background,
			   which could be a button: when I click on it, it pops up and gives
			   me all the presets. Underneath that … a second one, which is
			   called customizable"). The row grammar is his; the split is not,
			   and it could not be: Neutral, Warmes Papier, Schwarzweiß, Grau
			   and Arcade are PAIRS, each setting the paper AND the ink on both
			   sides, which is why one disc shows two. Split into a list of
			   backgrounds and a list of inks, the same five names would stand
			   in both, twenty-five combinations would exist and the readability
			   the pairs guarantee would be gone. What was wrong was the naming:
			   the group was called Hintergrund while it also set the ink, and
			   then Papier under it said the same word again.
			   So the page is four rows in one group, each with its value on the
			   right and its choices in a pop-up, as every other page of this
			   panel already works and as System Settings sets a pane: the pair
			   first, under it the two colours of this side, and the accent
			   last. The lists that lay open are gone; nothing else changed
			   hands. */
			/* FOUR ROWS, FOUR PAGES (Manuel, 2026-09-16, 2026-09-17): the twenty
			   pairs, the two colours and the twenty accents each open a page of
			   their own; the rows say what is chosen and carry the chevron. */
			/* TWO GROUPS, TWO KINDS OF ACTION (Manuel, 2026-09-17: "would it make
			   sense to give both sections a title? The top one could say
			   Voreinstellungen … the second section could be Eigene, and then
			   Papier, Tinte and Akzent. That accent would be actually that
			   tunable thing"). It would, and it makes the page say what it does:
			   above, the three things a reader picks off a list; below, the same
			   three set by hand. The first row finally names what a preset is —
			   Papier und Tinte — which the word Voreinstellungen alone never
			   did. The door marked Eigene left the accent's list with this: that
			   list is twenty colours and nothing else now, and every "set it
			   yourself" stands in one group. */
			/* ONE ROW, AND IT IS THE PRESET (Manuel, 2026-09-16: "take that accent
			   out because it has to be part of the preset. We also take that
			   section title out … and we change where it says Papier und Tinte
			   to the word Voreinstellung"). With the accent back inside a preset
			   there is nothing beside it to group, so the title goes with the
			   row: one row on its own needs no heading, the way the Anpassen
			   page carries Farbe. The accent set by hand stays below, under
			   Eigene, with the paper and the ink. */
			/* ONE CHOICE, TWO WAYS TO MAKE IT (Manuel, 2026-09-16: "when we select
			   a preset it should be shown on that page and therefore we haven't
			   selected a custom solution. It's either/or … I think it is
			   important to make clear either the one or the other"). Two groups
			   under each other said "both", and the page had no way to say which
			   of them the site was actually wearing. A segmented switch says it
			   in the panel's own words, and only the side that is on stands under
			   it: a preset, or the three colours set by hand. */
			'<div class="reading-segment quire-segmented reading-colour-switch" role="radiogroup" aria-label="' + t('Colour') + '">' +
				'<button type="button" role="radio"' + (custom ? '' : ' class="is-active"') + ' aria-checked="' + (!custom) + '" data-panel-custom="off">' + t('Preset') + '</button>' +
				'<button type="button" role="radio"' + (custom ? ' class="is-active"' : '') + ' aria-checked="' + custom + '" data-panel-custom="on">' + t('Custom') + '</button>' +
			'</div>' +
			(custom ? '' : '<div class="reading-colour-presets">' + presetGrid() + '</div>') +
			(!custom ? '' :
			'<div class="reading-list reading-colour-rows">' +
				nav(6, t('Paper'), listNamed('paper', paperNow) + '<span class="reading-well" style="--well:' + paperNow + '" aria-hidden="true"></span>', 'data-panel-colour-key="paper"') +
				nav(6, t('Ink'), ratioChip(inkNow, paperNow) + listNamed('ink', inkNow) + '<span class="reading-well" style="--well:' + inkNow + '" aria-hidden="true"></span>', 'data-panel-colour-key="ink"') +
				nav(6, t('Accent'), (ownAccent ? listNamed('accent', ownAccent) : '') +
					'<span class="reading-well" style="--well:' + (ownAccent || (n.resolvedSide === 'dark' ? '#ffffff' : '#000000')) + '" aria-hidden="true"></span>', 'data-panel-colour-key="accent"') +
				/* THE GROUND AND THE CARD (2026-09-26, round one): the page around the
				   paper, and what stands on the paper (menus, buttons, filled boxes,
				   the hover). At rest each is mixed from the paper, and the well
				   shows that mix; the editor starts from it. */
				nav(6, t('Ground'), (colNow.ground ? listNamed('ground', colNow.ground) : '') + '<span class="reading-well" style="--well:' + groundNow + '" aria-hidden="true"></span>', 'data-panel-colour-key="ground"') +
				nav(6, t('Card'), (colNow.lift ? listNamed('lift', colNow.lift) : '') + '<span class="reading-well" style="--well:' + liftNow + '" aria-hidden="true"></span>', 'data-panel-colour-key="lift"') +
			'</div>') +
			/* WEICHERER LESETEXT (2026-09-21, lab/the-heading-colour.html): no fourth colour; the reading text steps toward the paper and the headings keep the ink. */
			/* Softer reading text moved to the Reading text page (2026-09-23), and back here (2026-09-26, see colourMore). */
			colourMore +
			'</div>';

		/* THE PAIRS' OWN PAGE IS GONE (the grid stands on the Colour page since 2026-09-23; the page's string left 2026-09-26). */

		/* THE ACCENT'S OWN PAGE IS GONE (Manuel, 2026-09-16: "the customisation
		   could also be like a list for ink and for paper, so there wouldn't be any
		   asymmetry … a list for paper, a list for ink, a list for accent.
		   Underneath all three we have the colour wheel"). Its twenty colours moved
		   into the editor below, where the paper's twenty and the ink's twenty
		   stand too, and the switch that turned the accent off went out with it,
		   to come back when the rest is settled. */

		/* THE COLOUR EDITOR'S PAGE: the hex, the pipette and the three sliders,
		   with the room a pop-up never had. Which colour it edits is held in
		   `colourKey`, set by the row that opened it. */
		var colourHex = colourKey === 'ink' ? inkNow : colourKey === 'accent' ? (ownAccent || (n.resolvedSide === 'dark' ? '#ffffff' : '#000000')) : colourKey === 'button' || colourKey === 'head' || colourKey === 'kicker' ? (colNow[colourKey] || cssHex('--accent') || '#000000') : colourKey === 'ground' ? groundNow : colourKey === 'lift' ? liftNow : colourKey === 'marker' ? (colNow.marker || cssHex('--marker') || '#fff347') : paperNow;
		var colourName = colourKey === 'ink' ? t('Custom ink') : colourKey === 'accent' ? t('Custom accent') : colourKey === 'button' ? t('Button colour') : colourKey === 'head' ? t('Heading colour') : colourKey === 'kicker' ? t('Category line colour') : colourKey === 'ground' ? t('Ground') : colourKey === 'lift' ? t('Card') : colourKey === 'marker' ? t('Highlighter colour') : t('Custom paper');
		var colourBack = colourKey === 'head' || colourKey === 'kicker' ? 3 : 4; /* a role's well goes back to the role's page (2026-09-26) */
		/* THE COLOURS OFFERED ARE THE PAGE'S SIDE'S (2026-09-24, the audit: under a
		   guest's Original the stored side is dark while the theme's page is light,
		   and Red came out a dark red on a white page). */
		var listSide = (n.style === 'host' && Styles.hostSide && Styles.hostSide()) || n.resolvedSide;
		var level6 =
			/* BACK IS WHERE YOU CAME FROM (Manuel, 2026-09-17: "if I go back on the
			   left with the chevron, I will go back to the window below because
			   the popover is closed. Is that a cool behaviour? For me that's a
			   little bit inconsistent"). The accent's editor is reached through
			   the dots, and a trail that forgets one of its steps is not a trail:
			   the way back opens the dots again, exactly as they were left. The
			   two colours are reached from the page itself and go back to it. */
			'<div class="reading-sheet-top">' + head(colourName, colourBack) /* every editor is reached from the colour page's Eigene group now (2026-09-17), or from a role's page (2026-09-26) */ + '</div>' +
			'<div class="reading-sheet-body">' +
			/* THE FIELD, THE COLOURS, THE WHEEL (Manuel, 2026-09-16: "make on top
			   that row with the input where I can put the hex in. Then a hairline.
			   Then those colour swatches, not 5×5, instead 10×10. Then another
			   hairline. Then the slider area"). The twenty stood first and the
			   field under them; the field is what you arrive at the page for, so
			   it goes on top, the twenty are two rows of ten between two lines,
			   and the wheel is last. */
				colourEditor(colourKey, n.resolvedSide, colourHex, colourName,
					'<div class="reading-colour-grid" role="radiogroup" aria-label="' + colourName + '">' +
						(Styles.swatchList ? Styles.swatchList(colourKey) : []).map(function (x) {
							var on = listId(colourKey) === x.id, name = t(x.label);
							return '<button type="button" class="reading-colour-chip" role="radio" aria-checked="' + on + '"' +
								' data-panel-list-key="' + colourKey + '" data-panel-list-colour="' + x.id + '"' +
								' title="' + name + '" aria-label="' + name + '"' +
								' style="--dot:' + (listSide === 'dark' ? x.dark : x.light) + '"></button>';
						}).join('') +
					'</div>') +
				(colourKey === 'ink' ? '<p class="reading-footnote reading-colour-ratio">' + t('Contrast on the paper') + ': ' + ratioChip(inkNow, paperNow) + '</p>' : '') +
			'</div>';

		/* FOCUS SURVIVES THE REBUILD (2026-09-12, the audit): every press
		   rebuilds the panel, which destroyed the control just pressed and
		   dropped a keyboard reader to the page. The pressed control is
		   named by its data-panel-* attribute and focused again after. */
		var active = document.activeElement, key = null;
		if (active && panel.contains(active)) {
			for (var ai = 0; ai < active.attributes.length; ai++) {
				var at = active.attributes[ai];
				if (at.name.indexOf('data-panel-') === 0) { key = '[' + at.name + (at.value ? '="' + at.value + '"' : '') + ']'; break; }
			}
		}
		var tileMenuHtml = '';
		if (tileMenu && level === 1) {
			var at0 = 'style="inset-inline-start:' + tileMenu.x + 'px;inset-block-start:' + tileMenu.y + 'px"';
			var tSt = Styles.list.filter(function (x) { return x.id === tileMenu.id; })[0];
			if (tileMenu.renaming && tSt) tileMenuHtml = '<div class="quire-menu reading-tile-menu reading-ask reading-save-card" role="dialog" aria-label="' + t('Rename…') + '" ' + at0 + '>' +
				'<p class="reading-ask-title">' + t('Rename…').replace('…', '') + '</p>' +
				'<input type="text" class="quire-input reading-name-field" data-panel-tile-name maxlength="40" value="' + String(t(tSt.label)).replace(/"/g, '&quot;') + '" aria-label="' + t('Style name') + '">' +
				'<div class="reading-name-actions"><button type="button" class="quire-button" data-panel-tile-cancel>' + t('Cancel') + '</button><button type="button" class="quire-button primary" data-panel-tile-rename-go="' + tileMenu.id + '">' + t('Save') + '</button></div></div>';
			else if (tileMenu.asking && tSt) tileMenuHtml = '<div class="quire-menu reading-tile-menu reading-ask" role="alertdialog" ' + at0 + '>' +
				'<p class="reading-ask-title">' + t('Delete “{name}”?').replace('{name}', t(tSt.label)) + '</p>' +
				'<div class="reading-name-actions"><button type="button" class="quire-button" data-panel-tile-cancel>' + t('Cancel') + '</button><button type="button" class="quire-button is-destructive" data-panel-tile-delete-go="' + tileMenu.id + '">' + t('Delete') + '</button></div></div>';
			else {
				var tItems = publishItems(tileMenu.id, true);
				if (tItems) tileMenuHtml = '<ul class="quire-menu reading-tile-menu" role="menu" aria-label="' + t('Style options') + '" ' + at0 + '>' + tItems + '</ul>';
				else tileMenu = null;
			}
		}
		level1 += tileMenuHtml;
		/* A SHORT WORD AFTER THE DEFAULT CHANGES, WITH THE WAY BACK (2026-09-23): it
		   changes what every visitor opens in, so for a few seconds the panel says
		   so at its foot and offers Undo, as Mail does after a message is moved. */
		if (notice && level === 1) level1 += '<div class="reading-notice" role="status"><span>' + notice.text + '</span>' + (notice.undo !== undefined ? '<button type="button" class="reading-notice-undo" data-panel-notice-undo>' + t('Undo') + '</button>' : '') + '</div>';
		if (level === 2) {
			searchPages = [{ level: 4, name: t('Colour'), html: level4 }, { level: 8, name: t('Type'), html: level8 }, { level: 14, name: t('Layout'), html: level14 }, { level: 15, name: t('Corners and lines'), html: level15 }, { level: 16, name: t('Pictures'), html: level16 }, { level: 17, name: t('Effects'), html: level17 }].concat(level13 ? [{ level: 13, name: t('Button and Sharing'), html: level13 }] : []);
			searchRoles = ROLE_META.filter(function (x) { return !gone('role:' + x.id); }).map(function (x) { return { id: x.id, label: t(x.label), members: (Styles.members ? Styles.members(x.id) : []).filter(function (m) { return !m.lead && !gone('member:' + x.id + ':' + m.id); }).map(function (m) { return { id: m.id, label: t(memberMeta(x.id, m.id).label) }; }) }; });
		}
		var typing = document.activeElement && document.activeElement.hasAttribute && document.activeElement.hasAttribute('data-panel-search') ? [document.activeElement.selectionStart, document.activeElement.selectionEnd] : null; /* a render while the search is typed in keeps the caret */
		panel.innerHTML = level === 1 ? level1 : level === 3 ? level3 : level === 4 ? level4 : level === 6 ? level6 : level === 8 ? level8 : level === 10 ? level10 : level === 11 ? level11 : level === 13 && level13 ? level13 : level === 14 ? level14 : level === 15 ? level15 : level === 16 ? level16 : level === 17 ? level17 : level2;
		/* THE SWITCHES THAT CANNOT WORK HERE grey after the fact, in one place,
		   rather than in the twelve strings that print them: the same greyed
		   row with a dead control the size rows get (see dead() above). On
		   Architrave both lists are empty and this touches nothing. */
		panel.querySelectorAll('[data-panel-option]').forEach(function (b) {
			if (!dead('option:' + b.getAttribute('data-panel-option'))) return;
			b.disabled = true; b.setAttribute('aria-disabled', 'true');
			var row = b.closest('.reading-row'); if (row) row.classList.add('is-disabled');
		});
		markChanged(n.resolvedSide); /* the changed dots, see markChanged */
		if (level === 2) {
			runSearch();
			var sf = typing && panel.querySelector('[data-panel-search]');
			if (sf) { sf.focus({ preventScroll: true }); sf.setSelectionRange(typing[0], typing[1]); }
		}
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
		/* BUT THE ACCENT IS THE PAGE'S (Manuel, 2026-09-17, a turquoise accent
		   chosen and a violet switch: "what's that violet colour? Where's that
		   coming from?"). It is Neutral's own accent: the panel wears that room
		   so its grounds and inks never move under a reader, and the room brings
		   an accent with it. One look was never meant to include the accent —
		   the accent is the one colour the reader is choosing, and a control
		   painted in it has to show the choice. The page's accent, its contrast
		   ink and its muted tone are read off the root, which already resolves
		   the tint, an own colour, and the accent being off, and stamped on the
		   panel. */
		/* THE PANEL IS NOT PAINTED BY THE STYLE (Manuel, 2026-09-16, with Books'
		   Customize Theme beside it: "can we give the whole settings menu those
		   colours for light and for dark mode? It shouldn't change at all, not
		   the switches, sliders, or buttons, because it's a settings menu.
		   Sitting on top of it, it has to fit all the styles").

		   It was wearing the room: a Radarnacht turned it black with a green
		   switch, and a reader tuning colours had the tool change colour under
		   their hands. It keeps its own two dresses now, a light one and a dark
		   one, and takes only the side from the page. The page's accent was
		   stamped here on 2026-09-17 for the same reason it is not any more:
		   then the panel was the room's and the accent had to follow it; now
		   nothing in the panel follows anything. */
		panel.setAttribute('data-panel-side', n.resolvedSide === 'dark' ? 'dark' : 'light');
		/* AND THE DOOR STANDS IN IT TOO (Manuel, 2026-09-22, of the joined card:
		   "so no gap, so somehow it's wrong"). The panel restates its whole
		   surface palette under this attribute, so without it the door was a
		   lighter grey than the panel it had just been joined to. */
		document.querySelectorAll('.architrave-panel-opener').forEach(function (o) {
			o.setAttribute('data-panel-side', n.resolvedSide === 'dark' ? 'dark' : 'light');
		});
		['--accent', '--accent-contrast', '--accent-muted'].forEach(function (token) { panel.style.removeProperty(token); });
		if (active && panel.contains(active) && !key && active.classList.contains('reading-panel-title')) key = '.reading-panel-title';
		if (key) {
			var again = panel.querySelector(key);
			/* A control that just went disabled cannot take focus back (Größer at
			   the top step, the reset once nothing is adjusted): its sibling or
			   the title takes it (the audit, 2026-09-13). */
			if (again && again.disabled) again = (again.parentElement && again.parentElement.querySelector('button:not([disabled])')) || panel.querySelector('.reading-panel-title');
			if (again) again.focus({ preventScroll: true });
		}
		panel.setAttribute('data-level', level);
		rememberPlace();
		if (level !== 10) faceQuery = ''; else if (faceQuery) filterFaces(faceQuery);
		/* THE ••• MENU STAYS INSIDE THE PANEL (Manuel, 2026-09-24: its last items, Unpublish
		   and Reset, stood below the panel's foot and could not be seen). A menu longer
		   than the room below it scrolls, as a long Mac menu does. */
		var mmEl = panel.querySelector('.reading-more-menu');
		panel.style.minHeight = '';
		if (mmEl) {
			var mmR = mmEl.getBoundingClientRect(), pnR0 = panel.getBoundingClientRect();
			if (mmR.bottom > pnR0.bottom - 8) {
				/* first the panel grows to hold the whole menu, where the window has the room */
				panel.style.minHeight = Math.ceil(pnR0.height + (mmR.bottom - pnR0.bottom) + 12) + 'px';
				mmR = mmEl.getBoundingClientRect(); pnR0 = panel.getBoundingClientRect();
				var room = Math.floor(pnR0.bottom - mmR.top - 8);
				if (mmR.bottom > pnR0.bottom - 8 && room > 120) { mmEl.style.maxHeight = room + 'px'; mmEl.style.overflowY = 'auto'; }
			}
		}
		/* A TILE'S MENU STAYS INSIDE THE PANEL: near the foot it opens upward. */
		var tmEl = panel.querySelector('.reading-tile-menu');
		if (tmEl) {
			var tmR = tmEl.getBoundingClientRect(), pnR = panel.getBoundingClientRect();
			if (tmR.bottom > pnR.bottom - 8) tmEl.style.insetBlockStart = Math.max(8, Math.round(tmR.top - pnR.top - (tmR.bottom - pnR.bottom + 8))) + 'px';
			/* and across (Manuel, 2026-09-24, the delete question cut off at the panel's right edge): a card wider than its menu, on a tile at the right, moves in */
			/* measured by its layout box, not its drawn one: it arrives scaled, and a scaled box is narrower than the card */
			var tmO = tmEl.offsetParent ? tmEl.offsetParent.getBoundingClientRect().left : 0, tmL = tmO + tmEl.offsetLeft, tmRt = tmL + tmEl.offsetWidth;
			if (tmRt > pnR.right - 8) tmEl.style.insetInlineStart = Math.round(tmEl.offsetLeft - (tmRt - (pnR.right - 8))) + 'px';
			else if (tmL < pnR.left + 8) tmEl.style.insetInlineStart = Math.round(tmEl.offsetLeft + (pnR.left + 8 - tmL)) + 'px';
		}
		var renameNow = panel.querySelector('[data-panel-tile-name]');
		if (renameNow && !panel.__renameFocused) { renameNow.focus({ preventScroll: true }); renameNow.select(); panel.__renameFocused = true; } else if (!renameNow) panel.__renameFocused = false;
		var pasteNow = panel.querySelector('[data-panel-paste-text]');
		if (pasteNow && !panel.__pasteFocused) { pasteNow.focus({ preventScroll: true }); panel.__pasteFocused = true; } else if (!pasteNow) panel.__pasteFocused = false;
		var nameNow = panel.querySelector('[data-panel-name]');
		if (nameNow) { if (panel.__nameTyped) nameNow.value = panel.__nameTyped; if (!panel.__nameFocused) { nameNow.focus({ preventScroll: true }); panel.__nameFocused = true; } } else { panel.__nameTyped = ''; panel.__nameFocused = false; }
		panel.setAttribute('data-input', inputMode);
		/* A level change cross-fades its body, as System Settings turns a pane (the audit); reduced motion makes it instant. */
		if (turned) { panel.setAttribute('data-turn', turnWay); panel.classList.remove('is-turning'); void panel.offsetWidth; panel.classList.add('is-turning'); }
		/* AND ONLY THEN (Manuel, 2026-09-15: pressing accent after accent, "tick,
		   tick, tick … it makes me totally nervous"). The mark stayed on the
		   panel after the turn, and every press re-renders the body, a new
		   element, which played the slide again. Apple slides a pane in when
		   you go somewhere; a value changing in place moves the control alone.
		   A render that is not a turn takes the mark off first. */
		else panel.classList.remove('is-turning');
		/* THE HEIGHT GLIDES (2026-09-14, Apple's popovers resize in place): the
		   new level's height is measured, the old one put back, and the panel
		   let go to the new on the reveal beat; anchored at its foot, the top
		   edge glides instead of snapping. Then it is auto again. */
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
		/* The chosen face stands over the row, Apple's way, and the menu stays
		   inside the column; the phone's sheet is placed by the stylesheet. */
		var menu = panel.querySelector('.reading-font-menu');
		/* The colour pop-up's placement went with the pop-up (2026-09-16): the
		   editor is a level and a level is placed by nothing. What is left here
		   places the menus that remain — the faces, the weights, Gilt für — and
		   the long ones among them. */
		panel.removeAttribute('data-popup-spill');
		if (menu && !isPhone()) {
			var on = menu.querySelector('[aria-checked="true"]'), body = panel.querySelector('.reading-sheet-body');
			/* A LONG MENU IS NOT THE PANEL'S TENANT (Manuel, 2026-09-16, on the
			   twenty pairs: "it's weirdly cut off … that popping-up window is
			   bigger than the window underneath so it just overlays that on top
			   and on the bottom. There are no restrictions on the size of that
			   pop-up window coming from the main window"). He is right, and it
			   is how a menu behaves everywhere else: macOS opens a twenty-item
			   pop-up over the window's own edges. The panel clips its children
			   for its corners, which was never a statement about menus, so a
			   menu taller than the body lifts that clipping for as long as it is
			   open and is measured against the WINDOW instead. Only where the
			   body is not scrolled: a scrolled body cannot stop clipping without
			   losing its place, and there the menu keeps to the panel and
			   scrolls inside itself, as it always did. */
			/* Whether the LEVEL scrolls, which is the question, and not whether
			   the body overflows with the menu in it: an absolutely placed menu
			   taller than the panel counts towards its scroll height and would
			   answer its own question with no. */
			var hid = menu.style.display; menu.style.display = 'none';
			var levelFits = body.scrollHeight <= body.clientHeight + 1;
			menu.style.display = hid;
			var spill = menu.scrollHeight > body.clientHeight - 16 && levelFits;
			if (spill) panel.setAttribute('data-popup-spill', '');
			/* The pop-up row may stand under other rows in its field (Gestaltung). */
			var row = menu.parentNode.querySelector('[data-panel-popup][aria-expanded="true"]');
			var rowTop = row ? row.getBoundingClientRect().top - menu.parentNode.getBoundingClientRect().top : 0;
			var shift = (on ? on.offsetTop : 0) - rowTop;
			menu.style.top = (-shift) + 'px';
			var mr = menu.getBoundingClientRect(), br = body.getBoundingClientRect(), pad = 8;
			if (spill) {
				/* THE WINDOW'S TOP IS NOT ALWAYS ZERO (Manuel, 2026-09-16: "if I
				   click the lowest in that long list, it goes all the way up and
				   hides underneath that WordPress bar"). A menu placed with its
				   chosen row over the row that opened it travels one row's height
				   per item, and the twentieth carries the other nineteen off the
				   screen. The bounds are the window less whatever stands fixed at
				   its head, which on this site is the admin bar. */
				var barEl = document.getElementById('wpadminbar');
				var barBottom = barEl ? barEl.getBoundingClientRect().bottom : 0;
				/* AND IT STOPS AT THE DOOR (Manuel, 2026-09-22, a photograph of
				   the live site with the twenty pairs standing over everything:
				   "a situation like that shouldn't be possible"). A menu allowed
				   the whole window covers the button that opened the panel, so
				   the list floats with its top cut off by the toolbar, its foot
				   over the door, and nothing on screen says what it belongs to.
				   The window's foot, for a menu, is the top of the door. */
				var doorEl = document.querySelector('.architrave-panel-opener');
				var doorTop = doorEl && doorEl.offsetParent !== null ? doorEl.getBoundingClientRect().top : window.innerHeight;
				br = { top: Math.max(0, barBottom), bottom: Math.min(window.innerHeight, doorTop) };
				pad = 16;
			}
			if (mr.top < br.top + pad) menu.style.top = (-shift + (br.top + pad - mr.top)) + 'px';
			else if (mr.bottom > br.bottom - pad) menu.style.top = (-shift - (mr.bottom - (br.bottom - pad))) + 'px';
			var first = menu.querySelector('[aria-checked="true"]') || menu.querySelector('button'); if (first) first.focus({ preventScroll: true });
		}
		// The scrim is the phone's alone: the column stands beside the article.
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
	   picture 8: "build 7 with snappy spring"). The Live Design button does not stay
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

	/* THE PANEL REOPENS WHERE IT WAS LEFT (Manuel, 2026-09-23, the layout pass; Mac
	   System Settings returns to the last pane): the page, and the role, member or
	   colour it showed, are kept for the tab's life. A reader's panel has one page. */
	var PLACE_KEY = 'architrave-panel-place';
	function rememberPlace() { try { sessionStorage.setItem(PLACE_KEY, JSON.stringify({ level: level, role: role, member: member, colourKey: colourKey })); } catch (e) { /* private window */ } }
	function lastPlace() { try { return JSON.parse(sessionStorage.getItem(PLACE_KEY) || 'null'); } catch (e) { return null; } }
	function open(btn) {
		trigger = btn;
		panel.toggleAttribute('data-door-aurora', !!(btn && btn.getAttribute && btn.getAttribute('data-aurora') === 'true')); /* the grabber takes the Aurora's colours only where the button wears it */
		level = 1;
		var was = !(Styles.reader && Styles.reader()) && lastPlace();
		if (was && (was.level === 12 || was.level === 5)) was.level = 1; /* For readers (2026-09-23) and Presets are gone */
		if (was && was.level === 9) was.level = 2; /* More design options became four pages (2026-09-26) */
		if (was && typeof was.level === 'number' && was.level > 1) { level = was.level; role = was.role || role; member = was.member || member; colourKey = was.colourKey || colourKey; }
		if (wanted) { level = wanted; wanted = 0; } /* asked for by openAt: the new window's "Open in the Current Window" (2026-09-27) */
		/* ONE COLUMN AT A TIME (Manuel, 2026-09-13, late: the two side by side
		   were tried for an hour and reversed): the comments leave the right
		   slot when the settings take it; comments-side.js returns the favour. */
		/* INDEPENDENT OF THE COMMENTS (Manuel, 2026-09-14, reversing 2026-09-13:
		   "we made the wrong decision"): a floating panel covers nothing that
		   has to give way, so the comments column stays where it is. */
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
		/* AND THEN THE MARK GOES (2026-09-23: a pick in the ••• menu blinked the
		   whole panel out and back, three times for one copy). Left on, the
		   ease-in played again on redraws; measured, the panel's opacity was 0
		   at each one. Once it has played it is taken off. */
		panel.addEventListener('animationend', function done(e) {
			if (e.target !== panel) return;
			panel.classList.remove('is-opening'); panel.removeEventListener('animationend', done);
		}); /* the ease-in, once per opening (a rule on :not([hidden]) re-ran on rebuilds and flickered the stepper) */
		render();
		/* AND IT UNROLLS OUT OF ITS OWN HEAD (Manuel, 2026-09-22, of the
		   reference's chevron: "can you make the panel a similar reveal
		   animation", then "the five things do it"). See rollOpen below. */
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
			/* THE PANEL DOES NOT MOVE FOR A MENU (Manuel, 2026-09-16: "when
			   clicking on presets, the menu in the background jumps on top. It
			   should stay in place, and the menu on top should pop up"). The
			   panel is centred on the paper by the height of the level it shows,
			   and an open menu counted towards it: twenty rows made the level
			   look three times its height, so the panel slid up to centre a
			   height that was the menu's. A menu is over the panel, not in it,
			   so it is taken out of the measurement. */
			var openMenu = panel.querySelector('.reading-font-menu'), menuWas;
			if (openMenu) { menuWas = openMenu.style.display; openMenu.style.display = 'none'; }
			var h = Math.min(room, panel.__heightTo || (panel.offsetHeight + (body ? body.scrollHeight - body.clientHeight : 0)));
			if (openMenu) openMenu.style.display = menuWas;
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
		rememberPlace();
		popup = false;
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
	/* OPEN ON A GIVEN PAGE (2026-09-27, the switch): the new window sends a section it
	   has not built yet here, "Open in the Current Window". The door the panel stands
	   on is the one a press would use. */
	var wanted = 0;
	function openAt(lvl, btn) {
		if (!panel) return false;
		var door = btn || Array.prototype.filter.call(document.querySelectorAll('[data-reading-panel-open]'), function (b) { return b.getClientRects().length && getComputedStyle(b).visibility !== 'hidden'; })[0] || document.querySelector('.architrave-panel-opener');
		if (!door) return false;
		wanted = +lvl || 0;
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
				/* THE NEW WINDOW, WHERE THE OWNER CHOSE IT (2026-09-27, window.php): it takes the
				   press; it is only on the page when chosen, so at the default this is dead. */
				if (panel.hidden && window.LiveDesignWindow && window.LiveDesignWindow.takes && window.LiveDesignWindow.takes(opener)) return;
				if (panel.hidden || morph.shutting() || trigger !== opener) open(opener); else close();
				return;
			} /* a press while it flows home opens it again */
			if (panel.hidden) return;
			/* A CLICK THE SCRIPTS MAKE IS NOT A TAP OUTSIDE (Manuel, 2026-09-11:
			   the reset left "a weird blocked situation with a darkened
			   background"): a reset presses the dials by script, each press a
			   click from outside the panel, which closed it while the
			   re-render kept the scrim. Only a real pointer closes. */
			/* A TAP OUTSIDE CLOSES THE PHONE'S SHEET ONLY: the column stays open
			   while you read, like the comments, and closes from its head,
			   the Aa, or Escape. */
			/* A PRESS OUTSIDE CLOSES, on both placements (Manuel, 2026-09-14): the
			   popover has no X; a press in the page, on the rail or on the comments
			   closes it, as a menu closes. An open pop-up inside it takes the first
			   press for itself. The Aa is handled above. */
			if (!panel.contains(e.target)) { if (popup && e.isTrusted) { popup = false; render(); return; } if (e.isTrusted) close(); return; }
			/* THE POP-UP SHUTS ON ANY PRESS OUTSIDE IT (Manuel, 2026-09-13: a
			   press in the panel's empty space left it open): the press is
			   spent on closing, as a menu's is. */
			/* ONE PRESS, NOT TWO (Manuel, 2026-09-16: with the wheel's pop-up open,
			   a press on another accent "first closes the color settings menu and
			   then I have to do a second click"). Empty space still spends the
			   press on closing, as a menu's ground does; a press on a control
			   closes the pop-up AND does what the control says. */
			if (popup && !e.target.closest('.reading-font-menu, [data-panel-popup]')) {
				popup = null;
				if (!e.target.closest('button')) { render(); return; }
			}

			/* THE MORE MENU SHUTS THE SAME WAY, and so does the question a red item asked. */
			if ((moreOpen || asking) && !e.target.closest('.reading-more-menu, [data-panel-more]')) {
				moreOpen = false; asking = null;
				if (!e.target.closest('button')) { render(); return; }
			}
			/* And the tile's own menu. */
			if (tileMenu && !e.target.closest('.reading-tile-menu, [data-panel-tile-more]')) {
				tileMenu = null;
				if (!e.target.closest('button')) { render(); return; }
			}

			var b = e.target.closest('button');
			/* A switch row answers a press on its label too (the audit, macOS toggles). */
			if (!b) { var rowEl = e.target.closest('div.reading-row'); var tg = rowEl && rowEl.querySelector('.reading-toggle'); if (tg && !tg.disabled) { tg.click(); } return; }
			if (b.getAttribute('aria-disabled') === 'true') return;
			if (b.hasAttribute('data-panel-close')) { close(); return; }
			var n = now();
			/* The pop-up: the row opens and shuts it, a face closes it, a press
			   anywhere else in the panel closes it. */
			if (b.hasAttribute('data-panel-popup')) {
				var kind = b.getAttribute('data-panel-popup'); popup = popup === kind ? null : kind;
				/* OPENING THE WHEEL CHOOSES IT (Manuel, 2026-09-15: "when I click the
				   colour wheel it should immediately get the circle and the label";
				   macOS's Custom colour is chosen the moment its picker opens). It
				   starts from white by night and black by day, never from the dot
				   just chosen (Manuel, 2026-09-15: "orange and then another orange,
				   which looks weird"). */
				if (popup === 'colour:accent' && b.classList.contains('is-dot')) {
					var sideNow = b.getAttribute('data-panel-colour-side'), haveOwn = Styles.colours ? (Styles.colours()[sideNow] || {}).accent : null;
					if (!haveOwn) poured('accent', sideNow, sideNow === 'dark' ? '#ffffff' : '#000000');
				}
				render(); return;
			}
			if (b.hasAttribute('data-panel-size')) {
				var i = Reading.ids.indexOf(n.reading) + (b.getAttribute('data-panel-size') === 'up' ? 1 : -1);
				if (Reading.ids[i]) press('[data-quire-reading] [data-reading-step="' + Reading.ids[i] + '"]');
				stepped();
			} else if (b.hasAttribute('data-panel-side-toggle')) {
				var m = panel.querySelector('[data-panel-side-menu]');
				m.hidden = !m.hidden; b.setAttribute('aria-expanded', String(!m.hidden));
				return;
			} else if (b.hasAttribute('data-panel-side')) {
				press(PALETTE + '[data-side="' + b.getAttribute('data-panel-side') + '"]');
			} else if (b.hasAttribute('data-panel-style')) {
				press('[data-architrave-presets] [data-preset="' + b.getAttribute('data-panel-style') + '"]');
			} else if (b.hasAttribute('data-panel-level')) {
				popup = false;
				/* CUSTOMISE ON THE ORIGINAL MAKES A COPY AND OPENS THAT (Manuel,
				   2026-09-25: "the original shouldn't be customizable"), as editing
				   a face from Apple's Face Gallery puts a copy in My Faces and
				   edits the copy. The Original stays the theme untouched; the copy
				   is the person's own, named after it, and is what the sheet opens
				   on. */
				if (b.classList.contains('reading-customise') && (Styles.list.filter(function (x) { return x.id === now().style; })[0] || {}).host) {
					var cpId = Styles.duplicate ? Styles.duplicate(now().style) : null;
					if (cpId) press('[data-architrave-presets] [data-preset="' + cpId + '"]');
				}
				level = +b.getAttribute('data-panel-level');
				if (b.hasAttribute('data-panel-reopen')) popup = b.getAttribute('data-panel-reopen');
				if (b.hasAttribute('data-panel-role')) role = b.getAttribute('data-panel-role');
				if (b.hasAttribute('data-panel-member')) member = b.getAttribute('data-panel-member');
				if (b.hasAttribute('data-panel-colour-key')) {
					colourKey = b.getAttribute('data-panel-colour-key');
					/* OPENING THE WHEEL CHOOSES IT (Manuel, 2026-09-15): an accent
					   with no colour of its own starts from white by night and
					   black by day, never from the dot just chosen. */
					if (colourKey === 'accent' && Styles.colours && !(Styles.colours()[n.resolvedSide] || {}).accent) {
						poured('accent', n.resolvedSide, n.resolvedSide === 'dark' ? '#ffffff' : '#000000');
					}
					/* The ground and the card start from the mix standing on the page (2026-09-26). */
					if ((colourKey === 'ground' || colourKey === 'lift') && Styles.colours && !(Styles.colours()[n.resolvedSide] || {})[colourKey]) {
						var gl = cssHex(colourKey === 'ground' ? '--surface-canvas' : '--surface-subtle'); if (gl) poured(colourKey, n.resolvedSide, gl);
					}
				}
				/* A level change rebuilds at once and lands on the new level's
				   title, so it is announced and Tab continues from it (the audit,
				   2026-09-13: the old order focused the old head and lost it). */
				findLabel = b.getAttribute('data-panel-find');
				render();
				if (findLabel && spotlight(findLabel)) { findLabel = null; return; }
				findLabel = null;
				var h = panel.querySelector('.reading-panel-title'); if (h) h.focus({ preventScroll: true });
				return;
			} else if (b.hasAttribute('data-panel-scope')) {
				Styles.setScope(b.getAttribute('data-panel-scope'));
			} else if (b.hasAttribute('data-panel-role-face')) {
				popup = null;
				Styles.setRole(role, 'face', b.getAttribute('data-panel-role-face'));
				/* AND THE PAGE STAYS OPEN (Manuel, 2026-09-17: "I want to try fonts
				   out … make sure that when I choose a font it's not automatically
				   going back to the level above"). It closed on the choice for a
				   version, which was the pop-up's behaviour carried onto a page
				   without asking whether it still made sense. A pop-up shuts because
				   it covers what you are choosing for; a page does not cover the
				   article at all, so shutting it only means twelve presses to
				   compare twelve faces. The check moves, the article behind redraws,
				   and the reader leaves by the back arrow when they are done. */
			} else if (b.hasAttribute('data-panel-pick-member-weight')) {
				popup = null;
				Styles.setMember(role, member, 'weight', b.getAttribute('data-panel-pick-member-weight'));
			} else if (b.hasAttribute('data-panel-pick-weight')) {
				popup = null;
				Styles.setRole(role, 'weight', b.getAttribute('data-panel-pick-weight'));
			} else if (b.hasAttribute('data-panel-pick-caplines')) {
				popup = null;
				if (Styles.setCapLines) Styles.setCapLines(b.getAttribute('data-panel-pick-caplines'));
			} else if (b.hasAttribute('data-panel-pick-corners')) {
				popup = null;
				if (Styles.setCorners) Styles.setCorners(b.getAttribute('data-panel-pick-corners'));
			} else if (b.hasAttribute('data-panel-pick-align')) {
				popup = null;
				Styles.setRole(role, 'align', b.getAttribute('data-panel-pick-align'));
			} else if (b.hasAttribute('data-panel-pick-member-align')) {
				popup = null;
				if (Styles.setMember) Styles.setMember(role, member, 'align', b.getAttribute('data-panel-pick-member-align'));
			} else if (b.hasAttribute('data-panel-pick-framepattern')) {
				popup = null;
				if (Styles.setFramePattern) Styles.setFramePattern(b.getAttribute('data-panel-pick-framepattern'));
			} else if (b.hasAttribute('data-panel-pick-shape')) {
				popup = null;
				var ps = b.getAttribute('data-panel-pick-shape').split(':');
				if (Styles.setPick) Styles.setPick(ps[0], ps[1]);
			} else if (b.hasAttribute('data-panel-pick-colour')) {
				popup = null;
				var rc = b.getAttribute('data-panel-pick-colour');
				Styles.setRole(role, 'colour', rc);
				if (rc === 'own') {
					colourKey = role;
					if (Styles.colours && !(Styles.colours()[n.resolvedSide] || {})[role]) poured(role, n.resolvedSide, cssHex('--accent') || (n.resolvedSide === 'dark' ? '#ffffff' : '#000000'));
					level = 6; render();
					var h7 = panel.querySelector('.reading-panel-title'); if (h7) h7.focus({ preventScroll: true });
					return;
				}
			} else if (b.hasAttribute('data-panel-pick-button')) {
				popup = null;
				var bv = b.getAttribute('data-panel-pick-button');
				if (Styles.setButtonColour) Styles.setButtonColour(bv);
				/* OWN COLOUR… OPENS THE WHEEL (as the accent's does): the well starts
				   from the accent standing on the page, never empty. */
				if (bv === 'own') {
					colourKey = 'button';
					if (Styles.colours && !(Styles.colours()[n.resolvedSide] || {}).button) poured('button', n.resolvedSide, cssHex('--accent') || (n.resolvedSide === 'dark' ? '#ffffff' : '#000000'));
					level = 6; render();
					var h6 = panel.querySelector('.reading-panel-title'); if (h6) h6.focus({ preventScroll: true });
					return;
				}
			} else if (b.hasAttribute('data-panel-pick-markercolour')) {
				popup = null;
				var mv = b.getAttribute('data-panel-pick-markercolour');
				if (Styles.setMarkerColour) Styles.setMarkerColour(mv);
				/* OWN COLOUR… OPENS THE WHEEL on the pen's well, starting from the pen on the page (2026-09-26). */
				if (mv === 'own') {
					colourKey = 'marker';
					if (Styles.colours && !(Styles.colours()[n.resolvedSide] || {}).marker) poured('marker', n.resolvedSide, cssHex('--marker') || '#fff347');
					level = 6; render();
					var h8 = panel.querySelector('.reading-panel-title'); if (h8) h8.focus({ preventScroll: true });
					return;
				}
			} else if (b.hasAttribute('data-panel-pick-fadeedges')) {
				popup = null;
				if (Styles.setFadeEdges) Styles.setFadeEdges(b.getAttribute('data-panel-pick-fadeedges'));
			} else if (b.hasAttribute('data-panel-pick-linestyle')) {
				popup = null;
				if (Styles.setLineStyle) Styles.setLineStyle(b.getAttribute('data-panel-pick-linestyle'));
			} else if (b.hasAttribute('data-panel-pick-pictures')) {
				popup = null;
				Styles.setPictures(b.getAttribute('data-panel-pick-pictures'));
			} else if (b.hasAttribute('data-panel-pick-scope')) {
				popup = null;
				Styles.setScope(b.getAttribute('data-panel-pick-scope'));
			} else if (b.hasAttribute('data-panel-link')) {
				if (Styles.setLinked) Styles.setLinked(b.getAttribute('aria-checked') !== 'true' && b.getAttribute('aria-pressed') !== 'true', n.resolvedSide); /* a switch since 2026-09-23, aria-checked */
			} else if (b.hasAttribute('data-panel-role-weight')) {
				Styles.setRole(role, 'weight', b.getAttribute('data-panel-role-weight'));
			} else if (b.hasAttribute('data-panel-role-size')) {
				var ss = Styles.sizesFor(role), si = ss.indexOf(Styles.role(role).size) + (b.getAttribute('data-panel-role-size') === 'up' ? 1 : -1);
				if (ss[si]) Styles.setRole(role, 'size', ss[si]);
				stepped(); /* the roles' steppers show their dots too (Manuel, 2026-09-13) */
			} else if (b.hasAttribute('data-panel-role-italic')) {
				Styles.setRole(role, 'italic', !Styles.role(role).italic);
			} else if (b.hasAttribute('data-panel-role-caps')) {
				Styles.setRole(role, 'caps', !Styles.role(role).caps);
			} else if (b.hasAttribute('data-panel-member-bind')) {
				/* The list's mark: released at the size it reads at now, so nothing
				   moves on the press; bound again, every dial follows the lead. */
				var mid = b.getAttribute('data-panel-member-bind');
				var mnow = (Styles.members(role) || []).filter(function (x) { return x.id === mid; })[0];
				if (mnow) { if (mnow.bound) Styles.setMember(role, mid, 'size', mnow.size); else Styles.setMember(role, mid, null); }
			} else if (b.hasAttribute('data-panel-member-dial')) {
				var md = b.getAttribute('data-panel-member-dial');
				var mcur = (Styles.members(role) || []).filter(function (x) { return x.id === member; })[0];
				if (mcur) Styles.setMember(role, member, md, mcur.own[md] !== undefined ? null : mcur[md]);
			} else if (b.hasAttribute('data-panel-member-caps')) {
				var mc = (Styles.members(role) || []).filter(function (x) { return x.id === member; })[0];
				if (mc) Styles.setMember(role, member, 'caps', !mc.caps);
			} else if (b.hasAttribute('data-panel-sans')) {
				Styles.setSans(b.getAttribute('data-panel-sans'));
			} else if (b.hasAttribute('data-panel-custom')) {
				/* Crossing to Eigene takes the colours on the page with it, so the
				   three rows open on what the reader was already looking at. */
				var goOwn = b.getAttribute('data-panel-custom') === 'on';
				if (Styles.setCustom) Styles.setCustom(goOwn, goOwn ? { paper: cssHex('--surface-base'), ink: cssHex('--text-primary'), accent: cssHex('--accent') } : null);
			} else if (b.hasAttribute('data-panel-list-colour')) {
				/* A colour off one of the three lists; the page stays open, a
				   reader trying colours is trying several.

				   THE PAIR IS WRITTEN WHOLE, as the wheel writes it (`poured`,
				   2026-09-16): a paper on its own paints nothing, because the
				   ladder is mixed from a paper AND an ink and a side that has
				   only one of them is left to the room. So the colour standing
				   on the page for the other half is written with it, on the side
				   being shown; the other side follows from the two of them. */
				var lk = b.getAttribute('data-panel-list-key');
				if ((lk === 'paper' || lk === 'ink') && Styles.setColour && Styles.colours) {
					var ok = lk === 'paper' ? 'ink' : 'paper', got = Styles.colours(), dv = got.derived || { light: [], dark: [] };
					var held = ['light', 'dark'].some(function (sd) { return got[sd] && got[sd][ok] && (dv[sd] || []).indexOf(ok) === -1; });
					var okHex = ok === 'ink' ? cssHex('--text-primary') : cssHex('--surface-base');
					if (!held && /^#[0-9a-f]{6}$/i.test(okHex || '')) Styles.setColour(n.resolvedSide, ok, okHex);
				}
				if (Styles.setListColour) Styles.setListColour(lk, b.getAttribute('data-panel-list-colour'));
			} else if (b.hasAttribute('data-panel-preset')) {
				popup = null;
				if (Styles.setPreset) Styles.setPreset(b.getAttribute('data-panel-preset'));
			} else if (b.hasAttribute('data-panel-pair')) {
				popup = null;
				var pairId = b.getAttribute('data-panel-pair');
				/* A mode is the pair's own colours again, so the preset's six go. */
				if (Styles.setPreset && Styles.preset && Styles.preset()) Styles.setPreset('');
				press(PALETTE + '[data-palette="' + pairId + '"]');
				/* AND ITS ACCENT COMES WITH IT (Manuel, 2026-09-16): a preset sets
				   three things, so the five modes bring the tint they were drawn
				   with, and a colour set by hand gives way to it. */
				var pairTint = Styles.pairTint ? Styles.pairTint(pairId) : '';
				if (pairTint && Styles.setTint) Styles.setTint(pairTint);
			} else if (b.hasAttribute('data-panel-face')) {
				press('[data-architrave-face] [data-face-choice="' + b.getAttribute('data-panel-face') + '"]');
			} else if (b.hasAttribute('data-panel-leading')) {
				press('[data-architrave-leading] [data-leading-step="' + b.getAttribute('data-panel-leading') + '"]');
			} else if (b.hasAttribute('data-panel-option')) {
				var k = b.getAttribute('data-panel-option');
				Styles.setOption(k, !n[k]);
			} else if (b.hasAttribute('data-panel-more')) {
				moreOpen = !moreOpen; asking = null;
			} else if (b.hasAttribute('data-panel-ask')) {
				asking = b.getAttribute('data-panel-ask'); moreOpen = false;
			} else if (b.hasAttribute('data-panel-ask-cancel')) {
				asking = null;
			} else if (b.hasAttribute('data-panel-ask-go')) {
				var asked = b.getAttribute('data-panel-ask-go'); asking = null;
				if (asked === 'reset') Styles.reset(n.style);
				else if (asked === 'delete') { if (Styles.remove) Styles.remove(n.style); level = 1; }
				else if (asked === 'unpublish') Styles.unpublish(n.style).then(function () { publishFailed = false; level = 1; render(); }, refused);
			} else if (b.hasAttribute('data-panel-pick-button') || b.hasAttribute('data-panel-button-switch')) {
				popup = null;
				var bset = b.hasAttribute('data-panel-button-switch') ? [b.getAttribute('data-panel-button-switch')] : b.getAttribute('data-panel-pick-button').split(':');
				var bval = bset.length > 1 ? bset[1] : b.getAttribute('aria-checked') !== 'true'; /* a switch carries aria-checked */
				/* Automatic off puts the button back on the last place picked on the map. */
				if (bset[0] === 'auto') { bval = bval ? 'auto' : ((Styles.button() || {}).fixed || 'bottom-center'); bset = ['place']; }
				if (Styles.setButton) Styles.setButton(bset[0], bval).then(function () { publishFailed = false; render(); }, refused);
			} else if (b.hasAttribute('data-panel-window-switch')) {
				windowChoice(b.getAttribute('aria-checked') !== 'true' ? 'new' : 'current').then(function () { render(); }, refused);
			} else if (b.hasAttribute('data-panel-readers-copy')) {
				moreOpen = false;
				Styles.setReadersCopy(!Styles.readersCopy()).then(function () { publishFailed = false; render(); }, refused);
			} else if (b.hasAttribute('data-panel-save-readers')) {
				saveForReaders = !saveForReaders;
			} else if (b.hasAttribute('data-panel-undo')) {
				if (Styles.undo) Styles.undo();
			} else if (b.hasAttribute('data-panel-mine-fold')) {
				var fg = b.getAttribute('data-panel-mine-fold') === 'seen' ? 'seen' : 'mine';
				try { if (folded(fg)) localStorage.removeItem(foldKey(fg)); else localStorage.setItem(foldKey(fg), '1'); } catch (x) { /* private mode: it stays open */ }
			} else if (b.hasAttribute('data-panel-page-reset')) {
				if (pageResetPaths && Styles.resetPaths) Styles.resetPaths(pageResetPaths);
			} else if (b.hasAttribute('data-panel-tile-reset')) {
				tileMenu = null;
				if (Styles.resetChanges) Styles.resetChanges(b.getAttribute('data-panel-tile-reset'));
			} else if (b.hasAttribute('data-panel-reset')) {
				Styles.reset(n.style);
			} else if (b.hasAttribute('data-panel-update')) {
				moreOpen = false;
				if (Styles.update) Styles.update();
			} else if (b.hasAttribute('data-panel-save')) {
				saving = true; pasting = false; /* one task at a time: the name card closes the paste field */
			} else if (b.hasAttribute('data-panel-copy')) {
				moreOpen = false;
				var shareText = Styles.exportStyle ? Styles.exportStyle() : '';
				if (shareText && navigator.clipboard) navigator.clipboard.writeText(shareText).then(function () {
					copied = true; linkCopied = false; render();
					clearTimeout(panel.__copiedTimer);
					panel.__copiedTimer = setTimeout(function () { copied = false; render(); }, 1200);
				}).catch(function () { /* the clipboard was refused; the button says nothing */ });
			} else if (b.hasAttribute('data-panel-copy-link')) {
				moreOpen = false;
				var link = Styles.shareLink ? Styles.shareLink(true) : ''; /* the whole style in the link, so it lands on any site (2026-09-23) */
				if (link && navigator.clipboard) navigator.clipboard.writeText(link).then(function () {
					linkCopied = true; copied = false; render();
					clearTimeout(panel.__linkCopiedTimer);
					panel.__linkCopiedTimer = setTimeout(function () { linkCopied = false; render(); }, 1200);
				}).catch(function () { /* the clipboard was refused; the button says nothing */ });
			} else if (b.hasAttribute('data-panel-paste')) {
				pasting = !pasting; moreOpen = false; if (pasting) saving = false; /* and the paste field closes the name card */
			} else if (b.hasAttribute('data-panel-paste-cancel')) {
				pasting = false;
			} else if (b.hasAttribute('data-panel-paste-go')) {
				var pasteField = panel.querySelector('[data-panel-paste-text]');
				var pasted = pasteField ? pasteField.value.trim() : '';
				/* A link is read as one (2026-09-18): from this site at once, from another after a fetch. */
				if (/^https?:\/\//i.test(pasted) && Styles.importLink) {
					Styles.importLink(pasted).then(function (id) {
						if (id) { pasting = false; level = 1; render(); }
						else { var f = panel.querySelector('[data-panel-paste-text]'); if (f) { f.setAttribute('aria-invalid', 'true'); f.focus(); } }
					});
					return;
				}
				var landed = pasteField && Styles.importStyle ? Styles.importStyle(pasted) : null;
				if (landed) { pasting = false; level = 1; }
				else if (pasteField) { pasteField.setAttribute('aria-invalid', 'true'); pasteField.focus(); return; }
			} else if (b.hasAttribute('data-panel-save-cancel')) {
				saving = false; saveForReaders = false;
			} else if (b.hasAttribute('data-panel-save-go')) {
				var nameField = panel.querySelector('[data-panel-name]');
				/* SHOW TO READERS is the old Publish for everyone, now a switch in the one save. */
				if (saveForReaders && Styles.canPublish && Styles.canPublish()) {
					saveForReaders = false; saving = false;
					Styles.publish(nameField ? nameField.value : '').then(function () { publishFailed = false; level = 1; render(); }, refused);
				} else {
					if (Styles.saveAs) Styles.saveAs(nameField ? nameField.value : '');
					saving = false; saveForReaders = false; level = 1;
				}
			} else if (b.hasAttribute('data-panel-eyedrop')) {
				var keyE = b.getAttribute('data-panel-eyedrop'), sideE = b.getAttribute('data-panel-colour-side');
				try { new window.EyeDropper().open().then(function (res) { if (res && res.sRGBHex) { poured(keyE, sideE, res.sRGBHex.toLowerCase()); render(); } }).catch(function () { /* the pick was abandoned */ }); } catch (e) { /* no eyedropper after all */ }
				return; /* no rebuild under the pick: the pop-up stays for the result */
			} else if (b.hasAttribute('data-panel-publish')) {
				publishing = !publishing; publishFailed = false;
			} else if (b.hasAttribute('data-panel-publish-cancel')) {
				publishing = false;
			} else if (b.hasAttribute('data-panel-publish-go')) {
				var publishName = panel.querySelector('[data-panel-publish-name]');
				publishing = false;
				Styles.publish(publishName ? publishName.value : '').then(function () { publishFailed = false; level = 1; render(); }, refused);
			} else if (b.hasAttribute('data-panel-site-update')) {
				moreOpen = false;
				Styles.updateSite().then(function () { publishFailed = false; render(); }, refused);
			} else if (b.hasAttribute('data-panel-reader-add') || b.hasAttribute('data-panel-reader-remove')) {
				var addId = b.getAttribute('data-panel-reader-add'), dropId = b.getAttribute('data-panel-reader-remove'), had = Styles.readers();
				var next = dropId ? had.filter(function (x) { return x !== dropId; }) : (had.indexOf(addId) === -1 ? had.concat([addId]) : had);
				Styles.setReaders(next).then(function () { publishFailed = false; render(); }, refused);
			} else if (b.hasAttribute('data-panel-tile-more')) {
				var cellR = b.getBoundingClientRect(), panR = panel.getBoundingClientRect(), tmId0 = b.getAttribute('data-panel-tile-more');
				tileMenu = tileMenu && tileMenu.id === tmId0 ? null : { id: tmId0, x: Math.round(Math.max(8, Math.min(cellR.left - panR.left, panR.width - 248))), y: Math.round(Math.min(cellR.bottom - panR.top + 4, panR.height - 112)) };
			} else if (b.hasAttribute('data-panel-make-default')) {
				moreOpen = false; tileMenu = null;
				madeDefault(b.getAttribute('data-panel-make-default'));
			} else if (b.hasAttribute('data-panel-notice-undo')) {
				var back = notice ? notice.undo : undefined; notice = null;
				if (back) Styles.setVisible(back).then(function () { publishFailed = false; render(); }, refused);
			} else if (b.hasAttribute('data-panel-tile-customise')) {
				var cuId = b.getAttribute('data-panel-tile-customise'); tileMenu = null;
				if (cuId !== now().style) press('[data-architrave-presets] [data-preset="' + cuId + '"]'); /* the style is put on, then its page opens */
				level = 2; popup = false;
			} else if (b.hasAttribute('data-panel-tile-duplicate')) {
				tileMenu = null;
				var dupOf = b.getAttribute('data-panel-tile-duplicate');
				var mineNow = Array.prototype.map.call(panel.querySelectorAll('[data-tile-group="mine"] .reading-tile'), function (x) { return x.getAttribute('data-panel-style'); });
				var dupId = Styles.duplicate ? Styles.duplicate(dupOf) : null;
				/* the copy stands beside its original, as a Finder copy does; first below when the original is above */
				if (dupId && Styles.setHiddenOrder) { var at1 = mineNow.indexOf(dupOf); mineNow = mineNow.filter(function (x) { return x !== dupId; }); mineNow.splice(at1 === -1 ? 0 : at1 + 1, 0, dupId); Styles.setHiddenOrder(mineNow); }
			} else if (b.hasAttribute('data-panel-tile-rename')) {
				tileMenu = { id: b.getAttribute('data-panel-tile-rename'), x: tileMenu ? tileMenu.x : 8, y: tileMenu ? tileMenu.y : 8, renaming: true };
			} else if (b.hasAttribute('data-panel-tile-rename-go')) {
				var rnId = b.getAttribute('data-panel-tile-rename-go'), rnField = panel.querySelector('[data-panel-tile-name]'), rnName = rnField ? rnField.value.trim() : '';
				tileMenu = null;
				if (rnName && Styles.rename) Styles.rename(rnId, rnName).then(function () { publishFailed = false; render(); }, refused);
			} else if (b.hasAttribute('data-panel-seen-switch')) {
				var swId = b.getAttribute('data-panel-seen-switch'), swOn = b.getAttribute('aria-checked') !== 'true';
				if (!swOn && Styles.isSite(swId)) Styles.setSeen(swId, false).then(function () { publishFailed = false; render(); }, refused);
				else { var swOrder = Styles.visibleOrder().filter(function (x) { return x !== swId; }); if (swOn) swOrder.push(swId); if (swOrder.length) newOrder(swOrder); }
			} else if (b.hasAttribute('data-panel-seen')) {
				moreOpen = false; tileMenu = null;
				var seenSet = b.getAttribute('data-panel-seen').split(':'), seenOrder = Styles.visibleOrder().filter(function (x) { return x !== seenSet[0]; });
				if (seenSet[1] === '0' && Styles.isSite(seenSet[0])) Styles.setSeen(seenSet[0], false).then(function () { publishFailed = false; render(); }, refused);
				else { if (seenSet[1] === '1') seenOrder.push(seenSet[0]); if (seenOrder.length) newOrder(seenOrder); }
			} else if (b.hasAttribute('data-panel-tile-delete')) {
				tileMenu = { id: b.getAttribute('data-panel-tile-delete'), x: tileMenu ? tileMenu.x : 8, y: tileMenu ? tileMenu.y : 8, asking: true };
			} else if (b.hasAttribute('data-panel-tile-cancel')) {
				tileMenu = null;
			} else if (b.hasAttribute('data-panel-tile-delete-go')) {
				var gone = b.getAttribute('data-panel-tile-delete-go'); tileMenu = null;
				if (Styles.isOwn(gone)) { if (Styles.remove) Styles.remove(gone); }
				else if (Styles.isSite(gone)) Styles.unpublish(gone).then(function () { publishFailed = false; render(); }, refused);
			} else if (b.hasAttribute('data-panel-site-default')) {
				moreOpen = false;
				Styles.setSiteDefault(n.style).then(function () { publishFailed = false; render(); }, refused);
			} else if (b.hasAttribute('data-panel-unpublish')) {
				if (confirmUnpublish) { confirmUnpublish = false; Styles.unpublish(n.style).then(function () { publishFailed = false; level = 1; render(); }, refused); }
				else confirmUnpublish = true;
			} else if (b.hasAttribute('data-panel-delete')) {
				if (confirmDelete) { if (Styles.remove) Styles.remove(n.style); confirmDelete = false; level = 1; }
				else confirmDelete = true;
			}
			if (!b.hasAttribute('data-panel-delete')) confirmDelete = false;
			if (!b.hasAttribute('data-panel-unpublish')) confirmUnpublish = false;
			if (!b.hasAttribute('data-panel-save') && !b.hasAttribute('data-panel-name')) { if (b.hasAttribute('data-panel-level') || b.hasAttribute('data-panel-side')) { saving = false; publishing = false; saveForReaders = false; moreOpen = false; asking = null; } }
			// The tweaks live in the styles script's storage, not on <html>:
			// re-read after the press has landed.
			setTimeout(function () { render(); }, 0);
		});
		/* The slider presses the step its knob lands on; the page's observer
		   re-renders the panel and the word after the title with it. */
		/* A RIGHT-CLICK ON A TILE (Manuel, 2026-09-23): the same short menu the •••
		   menu has for that style, where the tile is, as Finder does on a file. The
		   keyboard's menu key and Shift+F10 raise the same event on a focused tile. */
		document.addEventListener('contextmenu', function (e) {
			var tile = e.target && e.target.closest && e.target.closest('.reading-panel .reading-tile');
			if (touchHold || (tile && e.pointerType === 'touch')) { e.preventDefault(); return; } /* a long press on a phone lifts the tile (touchstart), it opens no second menu */
			if (tileMenu && !tile) { tileMenu = null; render(); } /* a right-click anywhere else puts the tile's menu away first */
			if (!tile || !panel || panel.hidden || level !== 1) return;
			var id = tile.getAttribute('data-panel-style');
			if (!publishItemsFor(id)) return;
			e.preventDefault();
			var pr = panel.getBoundingClientRect(), tr = tile.getBoundingClientRect();
			var x = e.clientX || tr.left + tr.width / 2, y = e.clientY || tr.top + tr.height / 2;
			tileMenu = { id: id, x: Math.round(Math.max(8, Math.min(x - pr.left, pr.width - 248))), y: Math.round(Math.min(y - pr.top, pr.height - 112)) };
			render();
			var first = panel.querySelector('.reading-tile-menu .quire-menu-item'); if (first) first.focus({ preventScroll: true });
		});
		/* EVERY TILE CAN BE DRAGGED (Manuel, 2026-09-23: "should the complete order be
		   drag-and-drop possible? … it's not obvious that I can only drag to the
		   first spot"). Within Shown to everyone it changes the order readers see,
		   the first place the default; into Only for you it hides a style, and out
		   of it shows one. A bar marks where the tile will land. The owner's alone,
		   with a mouse or a pen; on a phone the tile's menu does the same. */
		var tileDrag = null;
		/* THE DRAG, AS THE HOME SCREEN DOES IT (Manuel, 2026-09-24: "can we optimize
		   the whole drag and drop behaviour"). The tile leaves its place and follows
		   the hand; a dashed gap stands where it will land, and the tiles around
		   slide to make room for it, each move eased from where it stood (the
		   gap is moved, and every tile's shift is played back from its old place).
		   Let go, and the tile lands in the gap; the order is read off the grid. */
		function idOfCell(el) { var t = el && (el.matches('.reading-tile') ? el : el.querySelector('.reading-tile')); return t ? t.getAttribute('data-panel-style') : null; }
		function slide(change) {
			var cells = Array.prototype.slice.call(panel.querySelectorAll('[data-tile-group] > :not(.is-carried)')), was = new Map();
			cells.forEach(function (el) { was.set(el, el.getBoundingClientRect()); });
			change();
			var quiet = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
			if (quiet) return;
			cells.forEach(function (el) {
				var a = was.get(el), b = el.getBoundingClientRect(); if (!a || !el.isConnected) return;
				var dx = a.left - b.left, dy = a.top - b.top; if (!dx && !dy) return;
				el.style.transition = 'none'; el.style.translate = dx + 'px ' + dy + 'px';
				requestAnimationFrame(function () { el.style.transition = 'translate var(--motion-duration-reveal) var(--motion-easing-standard)'; el.style.translate = ''; });
			});
		}
		document.addEventListener('pointerdown', function (e) {
			var tile = e.target && e.target.closest && e.target.closest('.reading-panel [data-tile-group] .reading-tile');
			if (!tile || e.button !== 0 || e.pointerType === 'touch' || level !== 1 || !(Styles.canPublish && Styles.canPublish()) || (Styles.reader && Styles.reader())) return;
			var st = Styles.list.filter(function (x) { return x.id === tile.getAttribute('data-panel-style'); })[0];
			if (!st) return;
			tileDrag = { tile: tile, id: st.id, x: e.clientX, y: e.clientY, on: false };
		});
		document.addEventListener('pointermove', function (e) { if (tileDrag && e.pointerType !== 'touch') dragMove(e.clientX, e.clientY); });
		function placeCarried(d) {
			var wantX = d.cx + d.ox, wantY = d.cy + d.oy;
			d.cell.style.left = (wantX - d.fx) + 'px'; d.cell.style.top = (wantY - d.fy) + 'px';
			var got = d.cell.getBoundingClientRect(); /* the lift's scale grows the box about its middle */
			var offX = got.left + (got.width - d.cell.offsetWidth) / 2 - wantX, offY = got.top + (got.height - d.cell.offsetHeight) / 2 - wantY;
			if (Math.abs(offX) > 0.5 || Math.abs(offY) > 0.5) { d.fx += offX; d.fy += offY; d.cell.style.left = (wantX - d.fx) + 'px'; d.cell.style.top = (wantY - d.fy) + 'px'; }
		}
		function dragMove(cx, cy) {
			var d = tileDrag;
			if (!d.on) {
				if (Math.abs(cx - d.x) < 6 && Math.abs(cy - d.y) < 6) return;
				d.on = true;
				var cell = d.tile.closest('.reading-tile-cell') || d.tile, r = cell.getBoundingClientRect();
				var ghost = document.createElement('div'); ghost.className = 'reading-tile-ghost'; ghost.style.blockSize = r.height + 'px';
				cell.parentNode.insertBefore(ghost, cell);
				d.cell = cell; d.ghost = ghost; d.ox = r.left - d.x; d.oy = r.top - d.y;
				cell.classList.add('is-carried');
				cell.style.inlineSize = r.width + 'px'; cell.style.blockSize = r.height + 'px';
				/* a panel that was moved carries a translate, which makes it the box a fixed child is placed in: measured once, and taken off */
				cell.style.left = r.left + 'px'; cell.style.top = r.top + 'px';
				var r0 = cell.getBoundingClientRect(); d.fx = r0.left + (r0.width - cell.offsetWidth) / 2 - r.left; d.fy = r0.top + (r0.height - cell.offsetHeight) / 2 - r.top;
				panel.classList.add('is-tile-dragging');
				/* THE ROOM IS MADE ONCE, AS THE TILE LIFTS: a group that is full to its last
				   row opens one more for the tile to land in, and no group shrinks while it
				   is carried. The panel stands on its foot and grows upwards, so a row added
				   later slid every tile under the hand. */
				/* THE PANEL HOLDS STILL WHILE A TILE IS CARRIED (Manuel, 2026-09-24: "it
				   opens up that new space ... and then it gets a little bit wild"). A panel
				   centred on the paper glides to its new middle when it grows, and every
				   tile glided with it under the hand. It is pinned for the drag by the
				   edge on the hand's side, so a row made above grows upwards and a row
				   made below grows downwards, and the tiles under the hand stay put. */
				var home = ghost.parentNode, above = false, pr = panel.getBoundingClientRect();
				Array.prototype.forEach.call(panel.querySelectorAll('[data-tile-group]'), function (grp) {
					var h = grp.getBoundingClientRect().height, cs = getComputedStyle(grp), cols = cs.gridTemplateColumns.split(' ').length;
					var n = Array.prototype.filter.call(grp.children, function (el) { return !el.matches('.reading-footnote'); }).length;
					if (grp !== home && n && cols > 1 && n % cols === 0) { h += r.height + (parseFloat(cs.rowGap) || 0); if (grp.compareDocumentPosition(home) & Node.DOCUMENT_POSITION_FOLLOWING) above = true; }
					grp.style.minBlockSize = h + 'px';
				});
				panel.style.transition = 'none';
				if (above) { panel.style.insetBlockStart = 'auto'; panel.style.insetBlockEnd = (window.innerHeight - pr.bottom) + 'px'; }
				else { panel.style.insetBlockEnd = 'auto'; panel.style.insetBlockStart = pr.top + 'px'; }
				var pr2 = panel.getBoundingClientRect(); /* a moved panel's translate, taken off */
				if (above) panel.style.insetBlockEnd = (window.innerHeight - pr.bottom + (pr2.bottom - pr.bottom)) + 'px';
				else panel.style.insetBlockStart = (pr.top - (pr2.top - pr.top)) + 'px';
			}
			/* UNDER THE HAND, ALWAYS (Manuel, 2026-09-24: "it's on a distance to the mouse
			   cursor"). The panel it rides in can move while the tiles slide (it grows
			   from its foot), and a moved panel is the box a fixed child is placed in,
			   so the tile is placed, read back, and put right on every move. */
			d.cx = cx; d.cy = cy;
			placeCarried(d);
			if (!d.frame) { var loop = function () { if (tileDrag !== d || !d.on) { d.frame = 0; return; } placeCarried(d); d.frame = requestAnimationFrame(loop); }; d.frame = requestAnimationFrame(loop); } /* and on every frame, since the panel can still be easing after the hand has stopped */
			/* CALM, AS LAUNCHPAD DOES IT (Manuel, 2026-09-24: "still a little bit hectic
			   ... almost like a calm behavior"). The gap moves to the place under the
			   hand, never to a side of a tile, so it holds still once it is there; and
			   it moves only when the hand has rested on a place for a moment, so the
			   tiles it passes over on the way stay where they are. */
			var want = placeUnder(d, cx, cy);
			if (!want) { clearTimeout(d.wait); d.want = null; return; }
			if (d.want && d.want.group === want.group && d.want.ref === want.ref) return;
			d.want = want; clearTimeout(d.wait);
			d.wait = setTimeout(function () {
				if (tileDrag !== d || d.want !== want) return;
				slide(function () { want.group.insertBefore(d.ghost, want.ref); }); placeCarried(d);
			}, 120);
		}
		/* Where the gap goes for a hand at (cx, cy): the tile's own place when the hand
		   is on a tile, the end of the group when it is on the group's empty room.
		   Tiles are read where they stand, not where they are sliding through. */
		function placeUnder(d, cx, cy) {
			var groups = panel.querySelectorAll('[data-tile-group]');
			for (var g = 0; g < groups.length; g++) {
				var group = groups[g], gr = group.getBoundingClientRect();
				if (cx < gr.left || cx > gr.right || cy < gr.top || cy > gr.bottom) continue;
				var kids = Array.prototype.filter.call(group.children, function (el) { return el !== d.cell && !el.matches('.reading-footnote'); });
				for (var i = 0; i < kids.length; i++) {
					var el = kids[i], r = el.getBoundingClientRect(), tr = (getComputedStyle(el).translate || '').split(' ');
					var dx = parseFloat(tr[0]) || 0, dy = parseFloat(tr[1]) || 0;
					if (cx < r.left - dx || cx > r.right - dx || cy < r.top - dy || cy > r.bottom - dy) continue;
					if (el === d.ghost) return { group: group, ref: d.ghost.nextSibling };
					var at = kids.indexOf(d.ghost);
					return { group: group, ref: at !== -1 && at < i ? el.nextSibling : el };
				}
				var last = kids[kids.length - 1];
				if (last === d.ghost) return { group: group, ref: d.ghost.nextSibling };
				if (last) { var lr = last.getBoundingClientRect(); if (cy < lr.top) return null; } /* between tiles: stay */
				return { group: group, ref: null };
			}
			return null;
		}
		/* ON A PHONE, A LONG PRESS LIFTS THE TILE (2026-09-24), as on the iPhone's Home
		   Screen: hold still for half a second, then drag it where it should go; let
		   go without moving and the tile's menu opens. A finger that moves before the
		   half second is scrolling, and scrolls. */
		var touchHold = null;
		function ownerHere() { return level === 1 && Styles.canPublish && Styles.canPublish() && !(Styles.reader && Styles.reader()); }
		document.addEventListener('touchstart', function (e) {
			var tile = e.target && e.target.closest && e.target.closest('.reading-panel [data-tile-group] .reading-tile');
			if (!tile || e.touches.length !== 1 || !ownerHere()) return;
			var st = Styles.list.filter(function (x) { return x.id === tile.getAttribute('data-panel-style'); })[0];
			if (!st) return;
			var t0 = e.touches[0];
			touchHold = { tile: tile, id: st.id, host: !!st.host, x: t0.clientX, y: t0.clientY, armed: false };
			touchHold.timer = setTimeout(function () { if (!touchHold) return; touchHold.armed = true; tile.classList.add('is-lifted'); if (navigator.vibrate) navigator.vibrate(10); }, 450);
		}, { passive: true });
		document.addEventListener('touchmove', function (e) {
			if (!touchHold) return;
			var t1 = e.touches[0];
			if (!touchHold.armed) { if (Math.abs(t1.clientX - touchHold.x) > 8 || Math.abs(t1.clientY - touchHold.y) > 8) { clearTimeout(touchHold.timer); touchHold = null; } return; }
			e.preventDefault(); /* the page does not scroll under a lifted tile */
			if (!tileDrag) tileDrag = { tile: touchHold.tile, id: touchHold.id, x: touchHold.x, y: touchHold.y, on: false, drop: null };
			dragMove(t1.clientX, t1.clientY);
		}, { passive: false });
		document.addEventListener('touchend', function (e) {
			if (!touchHold) return;
			var h = touchHold; touchHold = null; clearTimeout(h.timer); h.tile.classList.remove('is-lifted');
			if (!h.armed) return;
			e.preventDefault(); /* no click after a long press */
			if (tileDrag && tileDrag.on) { tileDrop(); return; }
			tileDrag = null;
			var pr = panel.getBoundingClientRect(), tr = h.tile.getBoundingClientRect();
			tileMenu = { id: h.id, x: Math.round(Math.max(8, Math.min(tr.left - pr.left, pr.width - 248))), y: Math.round(Math.min(tr.bottom - pr.top + 4, pr.height - 112)) };
			render();
		}, { passive: false });
		document.addEventListener('touchcancel', function () { if (touchHold) { clearTimeout(touchHold.timer); touchHold.tile.classList.remove('is-lifted'); touchHold = null; } if (tileDrag) tileDrop(); });
		function tileDrop(e) {
			if (!tileDrag) return;
			var d = tileDrag; tileDrag = null;
			if (!d.on) return;
			/* A PRESS THAT HARDLY TRAVELLED IS STILL A PRESS (Manuel, 2026-09-25: "by
			   clicking on my trackpad it didn't work. I couldn't change to any tile").
			   A firm click on a trackpad moves the pointer a few pixels while it is
			   down, enough to lift the tile, and a lifted tile's click was swallowed.
			   Let go within a finger's width of where it was pressed, the click goes
			   through and chooses the tile; if the browser sends none (the tile moved
			   under the pointer), it is pressed here. */
			var near = e && typeof e.clientX === 'number' && Math.abs(e.clientX - d.x) < 12 && Math.abs(e.clientY - d.y) < 12;
			/* The browser's own click after a lift lands on whatever was under the
			   pointer once the tile had moved, the row around it as often as not; it
			   never chooses. A near press is then made on the tile itself. */
			var stop = function (ev) { ev.stopPropagation(); ev.preventDefault(); document.removeEventListener('click', stop, true); };
			document.addEventListener('click', stop, true);
			setTimeout(function () { document.removeEventListener('click', stop, true); if (near && d.tile.isConnected) d.tile.click(); }, 0); /* no click came (the pointer left the tile): the next one is the reader's */
			var landed = d.ghost.parentNode && d.ghost.parentNode.closest('[data-tile-group]');
			var group = landed ? landed.getAttribute('data-tile-group') : null;
			var was = Styles.visibleOrder(), order;
			var listed = landed ? Array.prototype.map.call(landed.children, function (el) { return el === d.ghost ? d.id : (el === d.cell ? null : idOfCell(el)); }).filter(Boolean) : [];
			if (group === 'seen') order = listed;
			else { order = was.filter(function (x) { return x !== d.id; }); if (group === 'mine') Styles.setHiddenOrder(listed); } /* the order below is yours, and kept */
			/* ORIGINAL IS ALWAYS SEEN, FIRST OR SECOND (2026-09-24): first, it is the
			   default; anywhere else in the upper group, or dropped below, it stands
			   right behind the style that is. */
			var host = (Styles.list.filter(function (y) { return y.host; })[0] || {}).id;
			/* The Original is not in the grid any more (2026-09-25, its own row above),
			   but the stored order still carries it: first while no style is the
			   default — a reorder of the list must not make one — else right behind
			   the default. */
			if (host) { var hasDef = !!(Styles.siteDefault && Styles.siteDefault()); order = order.filter(function (x) { return x !== host; }); order.splice(hasDef && order.length ? 1 : 0, 0, host); }
			if (d.frame) cancelAnimationFrame(d.frame);
			clearTimeout(d.wait);
			var finish = function () {
				d.ghost.remove(); d.cell.classList.remove('is-carried', 'is-landing'); ['left', 'top', 'inlineSize', 'blockSize', 'transition', 'scale'].forEach(function (k) { d.cell.style[k] = ''; });
				Array.prototype.forEach.call(panel.querySelectorAll('[data-tile-group]'), function (grp) { grp.style.minBlockSize = ''; });
				panel.classList.remove('is-tile-dragging');
				panel.style.transition = ''; panel.style.insetBlockStart = ''; panel.style.insetBlockEnd = ''; /* let go: the panel settles to its place */
				if (!order.length || order.join() === was.join()) { render(); return; } /* someone has to be first; nothing moved */
				newOrder(order);
			};
			/* LET GO, AND THE TILE GLIDES INTO ITS GAP, rather than blinking there. */
			if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { finish(); return; }
			var gr = d.ghost.getBoundingClientRect(), done = false;
			var land = function () { if (done) return; done = true; finish(); };
			d.cell.classList.add('is-landing');
			d.cell.style.transition = 'left var(--motion-duration-reveal) var(--motion-easing-standard), top var(--motion-duration-reveal) var(--motion-easing-standard), scale var(--motion-duration-reveal) var(--motion-easing-standard)';
			d.cell.style.left = (gr.left - d.fx) + 'px'; d.cell.style.top = (gr.top - d.fy) + 'px'; d.cell.style.scale = '1';
			d.cell.addEventListener('transitionend', function (ev) { if (ev.target === d.cell && ev.propertyName === 'top') land(); });
			setTimeout(land, 300);
		}
		document.addEventListener('pointerup', tileDrop);
		document.addEventListener('pointercancel', tileDrop);
		/* ⌘V IN THE PASTE CARD TAKES THE STYLE AT ONCE; the Paste button is there for a hand that typed it. */
		document.addEventListener('paste', function (e) {
			var fld = e.target;
			if (!fld || !fld.hasAttribute || !fld.hasAttribute('data-panel-paste-text')) return;
			setTimeout(function () { var go = panel && panel.querySelector('[data-panel-paste-go]'); if (go && fld.value.trim()) go.click(); }, 0);
		});
		/* The button's name is sent when the field is left or Return is pressed, not per letter. */
		document.addEventListener('change', function (e) {
			var r = e.target;
			if (!r || !r.hasAttribute || !r.hasAttribute('data-panel-button-label') || !Styles.setButton) return;
			var wasNamed = !!String((Styles.button() || {}).label || '').trim(), named = !!r.value.trim();
			Styles.setButton('label', r.value.trim().slice(0, 30)).then(function () { publishFailed = false; if (wasNamed !== named) render(); /* the Aurora row follows square or word */ }, refused);
		});
		document.addEventListener('input', function (e) {
			var r = e.target;
			if (r && r.hasAttribute && r.hasAttribute('data-panel-face-search')) { faceQuery = r.value; filterFaces(faceQuery); return; }
			if (r && r.hasAttribute && r.hasAttribute('data-panel-search')) { searchQuery = r.value; runSearch(); return; }
			if (r && r.hasAttribute && r.hasAttribute('data-panel-name') && panel) { panel.__nameTyped = r.value; return; }
			if (r && r.hasAttribute && r.hasAttribute('data-panel-hex')) {
				var hv = r.value.trim(); if (hv && hv[0] !== '#') hv = '#' + hv;
				if (!/^#[0-9a-f]{6}$/i.test(hv)) return;
				poured(r.getAttribute('data-panel-hex'), r.getAttribute('data-panel-colour-side'), hv.toLowerCase());
				var hs = sliderHsl(hv), trs = hslTracks(hs.h, hs.s, hs.l);
				panel.querySelectorAll('[data-panel-hsl]').forEach(function (sl) { var k = sl.getAttribute('data-panel-hsl'); sl.value = hs[k]; sl.style.setProperty('--track', trs[k]); });
				panel.querySelectorAll('[data-panel-hsl-value]').forEach(function (el) { var k = el.getAttribute('data-panel-hsl-value'); el.textContent = k === 'h' ? hs[k] + '°' : hs[k] + ' %'; });
				return;
			}
			if (r && r.hasAttribute && r.hasAttribute('data-panel-hsl')) {
				var menuEl = r.closest('.reading-colour-page'), v = {};
				menuEl.querySelectorAll('[data-panel-hsl]').forEach(function (sl) { v[sl.getAttribute('data-panel-hsl')] = +sl.value; });
				var hv2 = hslToHex(v.h, v.s, v.l), trs2 = hslTracks(v.h, v.s, v.l);
				menuEl.querySelectorAll('[data-panel-hsl]').forEach(function (sl) { sl.style.setProperty('--track', trs2[sl.getAttribute('data-panel-hsl')]); });
				menuEl.querySelectorAll('[data-panel-hsl-value]').forEach(function (el) { var k = el.getAttribute('data-panel-hsl-value'); el.textContent = k === 'h' ? v[k] + '°' : v[k] + ' %'; });
				var hf2 = menuEl.querySelector('[data-panel-hex]'); if (hf2) hf2.value = hv2.toUpperCase();
				poured(menuEl.getAttribute('data-panel-colour-menu'), menuEl.getAttribute('data-panel-colour-side'), hv2);
				return;
			}
			if (!r || !r.hasAttribute || !r.classList.contains('reading-range')) return;
			/* The fill glides with the knob; the page moves at the nearest stop. */
			r.style.setProperty('--fill', Math.round(100 * r.value / r.max) + '%');
			var stop = Math.round(+r.value);
			if (String(stop) === r.getAttribute('data-stop')) return;
			r.setAttribute('data-stop', String(stop));
			r.setAttribute('aria-valuenow', String(stop));
			if (r.hasAttribute('data-panel-leading-range')) { var l = LEADING[stop]; if (l) press('[data-architrave-leading] [data-leading-step="' + l.id + '"]'); }
			else if (r.hasAttribute('data-panel-tracking-range')) { var k = TRACKING[stop]; if (k) Styles.setRole(role, 'tracking', k.id); }
			else if (r.hasAttribute('data-panel-words-range')) { var wd = WORDSPACE[stop]; if (wd) Styles.setRole(role, 'words', wd.id); }
			else if (r.hasAttribute('data-panel-size-range')) { var ss = Styles.sizesFor(role); if (ss[stop]) Styles.setRole(role, 'size', ss[stop]); }
			else if (r.hasAttribute('data-panel-member-size-range')) { var ms = Styles.memberSizes(role); if (ms[stop]) Styles.setMember(role, member, 'size', ms[stop]); }
			else if (r.hasAttribute('data-panel-member-weight-range')) { var mw = Styles.weightsFor(Styles.role(role).face); if (mw[stop]) Styles.setMember(role, member, 'weight', mw[stop]); }
			else if (r.hasAttribute('data-panel-member-tracking-range')) { var mt = TRACKING[stop]; if (mt) Styles.setMember(role, member, 'tracking', mt.id); }
			else if (r.hasAttribute('data-panel-reading-range')) { var rs = Reading.ids[stop]; if (rs) press('[data-quire-reading] [data-reading-step="' + rs + '"]'); }
			else if (r.hasAttribute('data-panel-role-leading-range')) { var ld = LEADING[stop]; if (ld) Styles.setRole(role, 'leading', ld.id); }
			else if (r.hasAttribute('data-panel-level-range')) { var lk = r.getAttribute('data-panel-level-range'), lv = (Styles.levels[lk] || [])[stop]; if (lv) Styles.setLevel(lk, lv); }
			else if (r.hasAttribute('data-panel-weight-range')) { var ws = Styles.weightsFor(Styles.role(role).face); if (ws[stop]) Styles.setRole(role, 'weight', ws[stop]); }
			else return;
			/* The word follows the stop at once, rebuild or not. */
			var word = LEVEL_WORD[r.getAttribute('data-panel-level-range')] ? t(LEVEL_WORD[r.getAttribute('data-panel-level-range')][(Styles.levels[r.getAttribute('data-panel-level-range')] || [])[stop]] || '') : r.hasAttribute('data-panel-level-range') ? ((Styles.levels[r.getAttribute('data-panel-level-range')] || [])[stop] || '') + (/^(line|fill|dotlevel)$/.test(r.getAttribute('data-panel-level-range')) ? ' %' : '') :
				r.hasAttribute('data-panel-leading-range') ? t((LEADING[stop] || {}).label) :
				r.hasAttribute('data-panel-role-leading-range') ? ((roleLeadList(role, Styles.role(role).leading)[stop] || {}).label || '') :
				r.hasAttribute('data-panel-tracking-range') ? t((TRACKING[stop] || {}).label) :
				r.hasAttribute('data-panel-words-range') ? t((WORDSPACE[stop] || {}).label) :
				r.hasAttribute('data-panel-size-range') ? (function (id) { return id ? id + ' px' : ''; })(Styles.sizesFor(role)[stop]) :
				r.hasAttribute('data-panel-member-size-range') ? (function (id) { return id ? id + ' px' : ''; })(Styles.memberSizes(role)[stop]) :
				r.hasAttribute('data-panel-member-weight-range') ? (function (w) { return w ? weightWord(w) + ' ' + WEIGHT_NUMBER[w] : ''; })(Styles.weightsFor(Styles.role(role).face)[stop]) :
				r.hasAttribute('data-panel-member-tracking-range') ? t((TRACKING[stop] || {}).label) :
				r.hasAttribute('data-panel-reading-range') ? t(((Reading.steps || [])[stop] || {}).label) :
				(function (w) { return w ? weightWord(w) + ' ' + WEIGHT_NUMBER[w] : ''; })(Styles.weightsFor(Styles.role(role).face)[stop]);
			r.setAttribute('aria-valuetext', word);
			markChanged();
			/* THE MEMBERS' NUMBERS FOLLOW THE KNOB TOO (Manuel, 2026-09-18, the size at
			   40 and every bound member still saying 13: "it's just the numbers that
			   are not reacting"): the page is rebuilt when the drag ends, so the
			   rows are written here as the stop changes, in the members' order. */
			if (r.hasAttribute('data-panel-size-range') && Styles.members) {
				var ms2 = Styles.members(role);
				panel.querySelectorAll('.reading-member').forEach(function (row, mi) { var mv = row.querySelector('.reading-row-value'); if (mv && ms2[mi]) mv.textContent = ms2[mi].size + ' px'; });
			}
			/* THE NUMBER THAT MOVES WITH THE KNOB lives in the slider's own row
			   since the title went inside the field (2026-09-17). It was found
			   through the field's previousElementSibling while the title stood
			   outside — which would now find whatever happens to sit above the
			   field, and quietly write a size into a heading. */
			var row = r.closest('.reading-slider-row'), value = row && row.querySelector('.reading-group-value');
			if (value) value.textContent = word;
			if (!dragging) setTimeout(function () { render(); }, 0);
		});
		document.addEventListener('pointerdown', function (e) {
			if (e.target && e.target.classList && e.target.classList.contains('reading-range')) dragging = true;
		});
		/* Which the sheet last heard. A press says pointer; Tab, the arrows,
		   Enter, Space and Escape say keyboard, and the ring returns with them. */
		document.addEventListener('pointerdown', function () { inputMode = 'pointer'; if (panel) panel.setAttribute('data-input', 'pointer'); }, true);
		document.addEventListener('keydown', function (e) {
			if (e.key === 'Tab' || e.key === 'Enter' || e.key === ' ' || e.key === 'Escape' || e.key.indexOf('Arrow') === 0) { inputMode = 'keyboard'; if (panel) panel.setAttribute('data-input', 'keyboard'); }
			if (e.key === 'Enter' && e.target && e.target.hasAttribute && e.target.hasAttribute('data-panel-hex')) { e.preventDefault(); e.target.blur(); }
			/* In the settings' search, Return opens the first result and Escape empties the field before it closes anything (2026-09-24). */
			if (e.target && e.target.hasAttribute && e.target.hasAttribute('data-panel-search')) {
				if (e.key === 'Enter') { e.preventDefault(); var first = panel && panel.querySelector('.reading-search-hit'); if (first) first.click(); }
				else if (e.key === 'Escape' && e.target.value) { e.preventDefault(); e.stopPropagation(); e.target.value = ''; searchQuery = ''; runSearch(); }
			}
			/* Return in the name field saves (2026-09-14). */
			if (e.key === 'Enter' && e.target && e.target.hasAttribute && e.target.hasAttribute('data-panel-tile-name')) { e.preventDefault(); var goR = panel && panel.querySelector('[data-panel-tile-rename-go]'); if (goR) goR.click(); }
			if (e.key === 'Enter' && e.target && e.target.hasAttribute && e.target.hasAttribute('data-panel-name')) { e.preventDefault(); var go = panel && panel.querySelector('[data-panel-save-go]'); if (go) go.click(); }
			if (e.key === 'Enter' && e.target && e.target.hasAttribute && e.target.hasAttribute('data-panel-publish-name')) { e.preventDefault(); var goP = panel && panel.querySelector('[data-panel-publish-go]'); if (goP) goP.click(); }
		}, true);
		function released() {
			if (!dragging) return;
			dragging = false;
			if (pendingRender) { pendingRender = false; render(); }
		}
		/* On release the knob settles on its stop. */
		document.addEventListener('change', function (e) {
			var r = e.target;
			/* A COLOUR SETTLES IN PLACE (Manuel, 2026-09-15: the picker "always
			   reloads. It goes away for a millisecond and then comes back"). The
			   release re-rendered the whole level, pop-up included, so the pop-up
			   was rebuilt under the pointer. The wells and hex fields are
			   already painted on input; on release only what else the colour
			   touches is refreshed, the contrast chips and the save button, each
			   in its own place. A slider never rebuilds its panel. */
			if (r && r.hasAttribute && (r.hasAttribute('data-panel-hsl') || r.hasAttribute('data-panel-hex'))) { setTimeout(settleColour, 0); return; }
			if (!r || !r.classList || !r.classList.contains('reading-range')) return;
			var stop = Math.round(+r.value); r.value = stop; r.style.setProperty('--fill', Math.round(100 * stop / r.max) + '%');
		});
		/* The keys move a stop at a time, whatever the step. */
		document.addEventListener('keydown', function (e) {
			var r = e.target;
			if (!r || !r.classList || !r.classList.contains('reading-range')) return;
			var stop = Math.round(+r.value), max = +r.max, next = stop;
			if (e.key === 'ArrowRight' || e.key === 'ArrowUp') next = Math.min(max, stop + 1);
			else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next = Math.max(0, stop - 1);
			else if (e.key === 'Home') next = 0;
			else if (e.key === 'End') next = max;
			else return;
			e.preventDefault();
			r.value = next; r.dispatchEvent(new Event('input', { bubbles: true }));
		});
		document.addEventListener('pointerup', released);
		document.addEventListener('pointercancel', released);
		window.addEventListener('blur', released); /* released while the window had lost focus (the audit) */
		document.addEventListener('lostpointercapture', released, true);
		/* DRAGGING A READER'S STYLE (2026-09-23): the handle lifts its row, the rows it
		   passes step aside, and the drop writes the new order (setReaders answers at
		   once). A press on the handle never removes the style: its click is eaten. */
		var drag = null, dragAte = false;
		function readerOrderMove(id, to) {
			var list = Styles.readers(), from = list.indexOf(id);
			if (from < 0) return;
			to = Math.max(0, Math.min(list.length - 1, to));
			if (to === from) return;
			list.splice(to, 0, list.splice(from, 1)[0]);
			Styles.setReaders(list).then(function () { render(); }, refused);
			render();
		}
		document.addEventListener('pointerdown', function (e) {
			var h = e.target.closest && e.target.closest('.reading-panel .reading-drag');
			if (!h) return;
			e.preventDefault();
			var row = h.closest('button'), rows = Array.prototype.slice.call(row.parentNode.querySelectorAll('button[data-panel-reader-remove]'));
			drag = { id: h.getAttribute('data-reader-drag'), row: row, rows: rows, from: rows.indexOf(row), y0: e.clientY, step: row.getBoundingClientRect().height, to: rows.indexOf(row) };
			row.classList.add('is-dragging');
			try { h.setPointerCapture(e.pointerId); } catch (err) { /* old browser */ }
		});
		document.addEventListener('pointermove', function (e) {
			if (!drag) return;
			var dy = e.clientY - drag.y0;
			drag.row.style.translate = '0 ' + dy + 'px';
			drag.to = Math.max(0, Math.min(drag.rows.length - 1, drag.from + Math.round(dy / drag.step)));
			drag.rows.forEach(function (r, i) {
				if (r === drag.row) return;
				var shift = (drag.from < drag.to && i > drag.from && i <= drag.to) ? -1 : (drag.from > drag.to && i < drag.from && i >= drag.to) ? 1 : 0;
				r.style.translate = shift ? '0 ' + (shift * drag.step) + 'px' : '';
			});
		});
		function dragEnd() {
			if (!drag) return;
			var d = drag; drag = null; dragAte = true;
			d.rows.forEach(function (r) { r.style.translate = ''; r.classList.remove('is-dragging'); });
			var order = Styles.readers(), moved = order.indexOf(d.id);
			if (d.to !== d.from && moved !== -1) readerOrderMove(d.id, d.to);
			setTimeout(function () { dragAte = false; }, 0);
		}
		document.addEventListener('pointerup', dragEnd);
		document.addEventListener('pointercancel', dragEnd);
		document.addEventListener('click', function (e) {
			if (dragAte || (e.target.closest && e.target.closest('.reading-panel .reading-drag'))) { e.stopPropagation(); e.preventDefault(); dragAte = false; }
		}, true);
		document.addEventListener('keydown', function (e) {
			if (!e.altKey || (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') || !panel || panel.hidden) return;
			var row = e.target && e.target.closest && e.target.closest('.reading-panel button[data-panel-reader-remove]');
			if (!row) return;
			e.preventDefault();
			var id = row.getAttribute('data-panel-reader-remove'), at = Styles.readers().indexOf(id);
			readerOrderMove(id, at + (e.key === 'ArrowUp' ? -1 : 1));
			setTimeout(function () { var again = panel.querySelector('button[data-panel-reader-remove="' + id + '"]'); if (again) again.focus(); }, 60);
		});
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
			if (e.key === 'Escape' && panel && !panel.hidden && !document.querySelector('.rail-more-trigger[aria-expanded="true"], .rail-more-sub:not([hidden])')) { e.preventDefault(); if (tileMenu) { var tmId = tileMenu.id; tileMenu = null; render(); var tb = panel.querySelector('[data-panel-style="' + tmId + '"]'); if (tb) tb.focus({ preventScroll: true }); } else if (moreOpen || asking || saving || pasting) { moreOpen = false; asking = null; saving = false; pasting = false; saveForReaders = false; render(); var mb = panel.querySelector('[data-panel-more]'); if (mb) mb.focus({ preventScroll: true }); } else if (popup) { var kindWas = popup; popup = null; render(); var row = panel.querySelector('[data-panel-popup="' + kindWas + '"]'); if (row) row.focus({ preventScroll: true }); } else close(); }
			/* TAB STAYS INSIDE THE OPEN PANEL (2026-09-12, the audit): a
			   dialog over a scrim keeps the keyboard, wrapping at its ends. */
			/* The pop-up's list answers the arrow keys, Home and End, as a menu does. */
			if (popup && panel && !panel.hidden && ['ArrowDown', 'ArrowUp', 'Home', 'End'].indexOf(e.key) !== -1) {
				var items = Array.prototype.slice.call(panel.querySelectorAll('.reading-font-menu .quire-menu-item'));
				if (items.length) {
					var at = items.indexOf(document.activeElement), to = at;
					if (e.key === 'ArrowDown') to = at < 0 ? 0 : (at + 1) % items.length;
					else if (e.key === 'ArrowUp') to = at < 0 ? items.length - 1 : (at - 1 + items.length) % items.length;
					else if (e.key === 'Home') to = 0; else to = items.length - 1;
					e.preventDefault(); items[to].focus({ preventScroll: true }); return;
				}
			}
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
