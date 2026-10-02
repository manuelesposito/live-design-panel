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
	var LIMITS = window.architravePanelGuestLimits || [];
	var HOST_LIMITS = window.architravePanelGuestHostLimits || [];
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
	
	var SPACING_STEPS = ['m25', 'm22', 'm20', 'm17', 'm15', 'm12', 'm10', 'm7', 'm5', 'm2', 'default', 'p2', 'p5', 'p7', 'p10', 'p12', 'p15', 'p17', 'p20', 'p22', 'p25']; 
	function spacingWord(id) { if (id === 'default') return '0%'; var n = id.slice(1); n = ({ '1': '1.25', '2': '2.5', '7': '7.5', '12': '12.5', '17': '17.5', '22': '22.5' })[n] || n; return (id.charAt(0) === 'm' ? '-' : '+') + n + '%'; }
	var TRACKING = SPACING_STEPS.slice(0, 10).concat(['m1', 'default', 'p1'], SPACING_STEPS.slice(11)).map(function (id) { return { id: id, label: spacingWord(id) }; });
	var WORDSPACE = SPACING_STEPS.map(function (id) { return { id: id, label: spacingWord(id) }; });
	var LEADING = [{ id: 'solid', label: '0.9' }, { id: 'packed', label: '1.0' }, { id: 'close', label: '1.1' }, { id: 'densest', label: '1.2' }, { id: 'dense', label: '1.3' }, { id: 'tight', label: '1.45' }, { id: 'snug', label: '1.5' }, { id: 'default', label: '1.6' }, { id: 'relaxed', label: '1.7' }, { id: 'airy', label: '1.8' }, { id: 'wider', label: '1.9' }, { id: 'wide', label: '2.0' }, { id: 'open', label: '2.2' }, { id: 'loose', label: '2.4' }, { id: 'loosest', label: '2.6' }]; 
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
	var WEIGHT_LABEL = { thin: 'Thin', extralight: 'Extra Light', light: 'Weight Light', regular: 'Regular', medium: 'Medium', semibold: 'Semi Bold', bold: 'Bold', extrabold: 'Extra Bold', black: 'Black' };
	var WEIGHT_NUMBER = { thin: 100, extralight: 200, light: 300, regular: 400, medium: 500, semibold: 600, bold: 700, extrabold: 800, black: 900 };
	function weightWord(w) { return t(WEIGHT_LABEL[w] || w); }
	
	var SPACE_WORD = { xcompact: 'Extra compact', compact: 'Compact', standard: 'Standard', spacious: 'Spacious', xspacious: 'Extra spacious' };
	var LEVEL_WORD = { space: SPACE_WORD, dotsize: { '16': 'Fine', '24': 'Medium', '32': 'Wide' } };
	var SIZE_WORD = { '50': 'Tiny', '65': 'Very small', '80': 'Small', '90': 'Slightly smaller', '100': 'Normal', '110': 'Slightly larger', '120': 'Large', '135': 'Very large', '150': 'Huge' };
	var BUTTON_WORD = {
		place: { auto: 'Automatic', 'top-left': 'Top left', 'top-right': 'Top right', left: 'Left side', right: 'Right side', 'bottom-left': 'Bottom left', 'bottom-center': 'Bottom centre', 'bottom-right': 'Bottom right' },
		size: { small: 'Small', medium: 'Medium', large: 'Large' },
		color: { panel: 'Panel', site: 'Site colour' }, 
		who: { everyone: 'Everyone', me: 'Only me' },
		show: { icon: 'Icon', both: 'Icon and name', hover: 'Name on hover' }, 
		corners: { site: 'Rounded', round: 'Round' } 
	};
	var BUTTON_ORDER = { size: ['small', 'medium', 'large'], show: ['icon', 'both', 'hover'], color: ['panel', 'site'], corners: ['site', 'round'] };
	
	
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
		render(); 
	}
	function madeDefault(id) { newOrder([id].concat(Styles.visibleOrder().filter(function (x) { return x !== id; }))); }
	function publishItemsFor(id) {
		if (!(Styles.canPublish && Styles.canPublish())) return false;
		var st = Styles.list.filter(function (x) { return x.id === id; })[0]; if (!st) return false;
		var def = Styles.readerFirst ? Styles.readerFirst() : '';
		return true; 
	}
	var BUTTON_SPOTS = ['top-left', 'top-right', 'left', 'right', 'bottom-left', 'bottom-center', 'bottom-right'];
	function sizeWord(id) { return id === 'text' ? t('Same as text') : t(SIZE_WORD[id] || id); }
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
	var dragging = false, pendingRender = false;
	var popup = null; 
	var saving = false, pasting = false, copied = false, confirmDelete = false;
	var tileMenu = null; 
	var FOLD_KEY = 'ldp-mine-folded'; 
	function foldKey(g) { return g === 'seen' ? 'ldp-seen-folded' : FOLD_KEY; }
	function folded(g) { try { return localStorage.getItem(foldKey(g)) === '1'; } catch (e) { return false; } }
	function mineFolded() { return folded('mine'); }
	var notice = null; 
	var moreOpen = false, asking = null, saveForReaders = false, faceQuery = ''; 
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
	} 
	var publishing = false, confirmUnpublish = false, publishFailed = false;
	var linkCopied = false;   
	var inputMode = 'pointer'; 
	var UPDOWN = icon('chevrons-up-down', 'class="reading-row-check"'); 
	var SIDES = [{ id: 'light', label: 'Light', icon: 'haze' }, { id: 'dark', label: 'Dark', icon: 'moon-star' }, { id: 'auto', label: 'System', icon: 'contrast' }];
	var PALETTE = '[data-quire-modes="palette"] ';
	
	var pressing = false;
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
	function now() {
		var sideBtn = document.querySelector(PALETTE + '[data-side][aria-pressed="true"]');
		var mode = root.getAttribute('data-theme') || (Modes ? Modes.default : 'neutral-light');
		return {
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
	var panel, scrim, level = 1, role = 'head', member = 'masthead', colourKey = 'paper', trigger = null, dotsTimer = null; 
	
	var PAIR_LABELS = window.ArchitravePairLabels || { neutral: 'Violet light', paper: 'Sun clay', terminal: 'Radar night', grey: 'Ash blue', arcade: 'Night fire' };
	var PAIRS = ['neutral', 'paper', 'terminal', 'grey', 'arcade'].map(function (id) { return { id: id, label: PAIR_LABELS[id] || id }; });
	var PICTURE_WORD = { plain: 'As they are', bw: 'Black & white', sepia: 'Sepia', duo: 'Tinted', accent: 'Duotone', halftone: 'Halftone', dither: 'Pixels', grain: 'Grain', trace: 'Traced', hidden: 'Hidden' };
	var PICTURE_NOTE = {
		plain: 'The pictures as they were published.',
		bw: 'The pictures without colour, as the newspaper prints them.',
		sepia: 'The pictures in the brown of an old photograph.',
		duo: 'The pictures in the pair’s own paper and ink.',
		accent: 'The pictures in the pair’s paper and its accent colour.',
		halftone: 'The pictures in printed dots, as a newspaper screens them.',
		dither: 'The pictures in two colours and coarse pixels, like an early computer screen.',
		grain: 'The pictures in colour, under a fine film grain.',
		trace: 'Only the pictures’ edges, drawn as lines on the paper.',
		hidden: 'No pictures. A line stands in for each one and shows it when pressed.'
	};
	
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
	
	function sliderHsl(hex) {
		var hsl = hexToHsl(hex);
		if (!hsl.s) hsl.s = 100;
		return hsl;
	}
	function colourEditor(key, side, hex, label, middle) {
		var hsl = sliderHsl(hex), tr = hslTracks(hsl.h, hsl.s, hsl.l);
		function sliderValue(k, v) { return k === 'h' ? v + '°' : v + ' %'; }
		function slider(k, word, max, val) {
			return '<p class="reading-group-title reading-colour-title">' + t(word) + '</p>' +
				'<label class="reading-colour-slider"><input type="range" class="reading-hsl" min="0" max="' + max + '" step="1" value="' + val + '" data-panel-hsl="' + k + '" aria-label="' + t(word) + '" style="--track:' + tr[k] + '"></label>' +
				'<span class="reading-group-value reading-colour-num" data-panel-hsl-value="' + k + '">' + sliderValue(k, val) + '</span>';
		}
		return colourBodyHtml(key, side, hex, hsl, tr, slider, label, middle);
	}
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
	function poured(key, side, hv) {
		if (Styles.setColour && (key === 'paper' || key === 'ink')) {
			var other = key === 'paper' ? 'ink' : 'paper', have = Styles.colours ? Styles.colours()[side] : {};
			var otherHex = other === 'ink' ? cssHex('--text-primary') : cssHex('--surface-base');
			if (!have[other] && /^#[0-9a-f]{6}$/i.test(otherHex || '')) Styles.setColour(side, other, otherHex);
		}
		if (Styles.setColour) Styles.setColour(side, key, hv);
		if (key === 'accent' && Styles.setAccent && Styles.accent && !Styles.accent()) Styles.setAccent(true); 
		panel.querySelectorAll('.reading-colour-page .reading-well').forEach(function (w) { w.style.setProperty('--well', hv); });
	}
	function shotClass(s, side) {
		var pal = (Styles.wanted ? Styles.wanted(s.id).palette : null) || s.palette || 'neutral';
		return 'theme-' + (Modes && Modes.resolve ? Modes.resolve(pal, side) : pal + '-' + side);
	}
	function shotColours(s, side) {
		var c = Styles.colours ? Styles.colours(s.id)[side] : null;
		if (!c || !c.paper || !c.ink) return '';
		var dark = lumOf(c.paper) < lumOf(c.ink);
		return ' style="' + (s.hostFace ? 'font-family:' + faceAttr(s.hostFace) + ';' : '') + '--surface-base:' + c.paper + ';--text-primary:' + c.ink + ';--surface-raised:' + (dark ? 'color-mix(in oklab, ' + c.paper + ', ' + c.ink + ' 8%)' : c.paper) + ';--border-strong:color-mix(in oklab, ' + c.paper + ', ' + c.ink + ' 29%)"';
	}
	function faceAttr(f) { return String(f).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }
	
	function anyLum(c0) {
		var m = String(c0 || '').match(/rgba?\(([\d.\s,]+)/);
		if (!m) return lumOf(c0);
		var v = m[1].split(',').map(Number);
		return v.length >= 3 ? (0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]) / 255 : 0.5;
	}
	function tileColours(s, side, noFace) {
		var c = Styles.colours ? Styles.colours(s.id)[side] : null;
		if (!c || !c.paper || !c.ink) return '';
		var acc = c.accent;
		if (acc && Math.abs(anyLum(acc) - anyLum(c.paper)) < 0.08) acc = c.ink;
		if (!acc && (s.host || s.bare)) acc = c.ink; 
		
		return ' style="' + (s.hostFace && !noFace ? 'font-family:' + faceAttr(s.hostFace) + ';' : '') + '--surface-base:' + c.paper + ';--text-primary:' + c.ink + ';--text-secondary:color-mix(in oklab, ' + c.ink + ', ' + c.paper + ' 40%);--border-default:color-mix(in oklab, ' + c.paper + ', ' + c.ink + ' 16%)' + (acc ? ';--accent:' + acc : '') + '"';
	}
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
	function settleColour() {
		if (!panel || panel.hidden) return;
		var cur = Styles.current ? Styles.current() : null; 
		var c = Styles.colours ? Styles.colours(cur) : null, side = panel.querySelector('[data-panel-colour-menu]');
		side = side ? side.getAttribute('data-panel-colour-side') : null;
		var v = (c && side && c[side]) || {};
		var paperNow = v.paper || cssHex('--surface-base'), inkNow = v.ink || cssHex('--text-primary');
		var inkLine = panel.querySelector('.reading-colour-ratio');
		if (inkLine) inkLine.innerHTML = t('Contrast on the paper') + ': ' + ratioChip(inkNow, paperNow);
		var save = panel.querySelector('[data-panel-save]');
		if (save) save.disabled = !(Styles.adjusted(cur) || (Styles.isOwn && Styles.isOwn(cur)));
	}
	function ratioChip(a, b) {
		if (!a || !b || !Styles.contrast) return '';
		var q = Styles.contrast(a, b), low = q < 4.5;
		var word = q >= 7 ? t('Very readable') : low ? t('Hard to read') : t('Readable');
		return '<span class="reading-ratio' + (low ? ' is-low' : '') + '" title="' + t('Contrast on the paper') + ': ' + q.toFixed(1).replace('.', ',') + ':1">' + (low ? '! ' : '✓ ') + word + '</span>';
	}
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
	function modeTriple(id, side) {
		var m = ((Modes && Modes.modes) || []).filter(function (x) { return x.palette === id && x.side === side; })[0] || {};
		var paper = m.swatch || (side === 'dark' ? '#222222' : '#eeeeee');
		var ink = 'color-mix(in oklab, ' + paper + ', ' + (lumOf(paper) > 0.45 ? '#000000' : '#ffffff') + ' 86%)';
		return { paper: paper, ink: ink, accent: m.swatchInk || ink };
	}
	function nowTriple(side) {
		var c = (Styles.colours ? Styles.colours()[side] : {}) || {};
		var paper = c.paper || cssHex('--surface-base') || '#ffffff';
		var ink = c.ink || cssHex('--text-primary') || '#000000';
		return { paper: paper, ink: ink, accent: c.accent || cssHex('--accent') || ink };
	}
	
	function tileClass(s) {
		var applied = root.getAttribute('data-theme') || (Modes ? Modes.default : 'neutral-light');
		var m = ((Modes && Modes.modes) || []).filter(function (x) { return x.id === applied; })[0];
		var side = (m && m.side) || 'light';
		var pal = (Styles.wanted ? Styles.wanted(s.id).palette : null) || s.palette; 
		var mode = Modes && Modes.resolve ? Modes.resolve(pal, side) : pal + '-' + side;
		return 'theme-' + mode;
	}
	var renderedLevel = null;
	var pageResetPaths = null, markSide = 'dark'; 
	function markChanged(side) {
		markSide = side = side || markSide;
		pageResetPaths = null;
		panel.querySelectorAll('.reading-changed, [data-panel-page-reset]').forEach(function (x) { x.remove(); });
		if (!Styles.changes || [2, 3, 4, 8, 14, 15, 16, 17].indexOf(level) === -1) return;
		var ch = Styles.changes();
		function has(path) { var o = ch, p = path.split('.'); for (var i = 0; i < p.length; i++) { if (!o || typeof o !== 'object' || o[p[i]] === undefined) return false; o = o[p[i]]; } return true; }
		var COLOUR = ['palette', 'colours', 'tint', 'preset', 'unlinked', 'soft', 'softlevel', 'quietlevel', 'smallsoft', 'links', 'marker', 'markercolour', 'darkground', 'button'], READ = ['face', 'reading', 'leading', 'justify', 'dropcap', 'capLines', 'scope', 'alternates'];
		var TYPE = ['roles', 'sans'].concat(READ);
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
		var words = function (x) { return fold(x).split(/[^\p{L}\p{N}]+/u).filter(Boolean); }, want = words(q);
		var fits = function (have) { return want.every(function (w) { return have.some(function (h) { return h.indexOf(w) === 0; }); }); };
		var rank = function (e) { return fold(e.label).indexOf(q) === 0 ? 0 : 1; };
		var hits = searchIndex().filter(function (e) { return fits(words(e.label)); }); 
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
	var hostTypeOff = null; 
	function render() {
		if (!panel || panel.hidden) return; 
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
		var pairs = PAIRS.some(function (p) { return p.id === n.palette; }) ? PAIRS : PAIRS.concat([{ id: n.palette, label: pairName }]);
		var presets = Styles.presets ? Styles.presets() : [];
		var presetNow = Styles.preset ? Styles.preset() : '';
		var presetOn = presets.filter(function (p) { return p.id === presetNow; })[0];
		var custom = Styles.custom ? Styles.custom() : false;
		
		var isReader = !!(Styles.reader && Styles.reader());
		var owner = !isReader && Styles.canPublish && Styles.canPublish();
		function tileGrid(list, label, group) { return '<div class="reading-tiles" role="radiogroup" aria-label="' + label + '"' + (group ? ' data-tile-group="' + group + '"' : '') + '>' +
				list.map(function (s) {
					
					var isDef = owner && !s.host && s.id === (Styles.siteDefault ? Styles.siteDefault() : '');
					var tileHtml = '<button type="button" class="reading-tile" role="radio" data-panel-style="' + s.id + '" aria-checked="' + (s.id === n.style) + '">' +
						'<span class="reading-tile-swatch ' + tileClass(s) + '" data-face-sample="' + s.face + '"' + tileColours(s, n.resolvedSide) + '>' +
						'<span class="reading-tile-aa">Aa</span><span class="reading-tile-accent"></span>' +
						(isDef ? '<span class="reading-tile-flag">' + t('Default') + '</span>' : '') +
						'</span>' +
						(Styles.adjusted(s.id) ? '<span class="reading-tile-adjusted" aria-label="' + t('adjusted') + '">•</span>' : '') +
						'<span class="reading-tile-name">' + t(s.label) + '</span>' +
						'</button>'; 
					if (!owner || !publishItemsFor(s.id)) return tileHtml;
					return '<div class="reading-tile-cell' + (tileMenu && tileMenu.id === s.id ? ' is-menu-open' : '') + '">' + tileHtml + 
						'<button type="button" class="reading-tile-more ' + tileClass(s) + '" data-panel-tile-more="' + s.id + '"' + tileColours(s, n.resolvedSide, true) + ' aria-haspopup="menu" aria-label="' + t('Style options') + ': ' + t(s.label) + '" tabindex="-1">' + icon('more') + '</button></div>';
				}).join('') +
			'</div>'; }
		var tiles;
		var hostTile = shown.filter(function (s) { return s.host; })[0];
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
			
			tiles = hostBand +
				'<button type="button" class="reading-group-title reading-tiles-title reading-group-fold" data-panel-mine-fold="seen" aria-expanded="' + !folded('seen') + '">' + t('Visible to readers') + icon('chevron-right', 'class="reading-group-chevron"') + '</button>' +
				(seenList.length ? tileGrid(seenList, t('Visible to readers'), 'seen') : '<div class="reading-tiles reading-tiles-empty" data-tile-group="seen"><p class="reading-footnote">' + t('Drag styles here to show them.') + '</p></div>').replace('data-tile-group="seen"', 'data-tile-group="seen"' + (folded('seen') ? ' data-folded' : '')) +
				
				(mineList.length
					? '<button type="button" class="reading-group-title reading-tiles-title reading-group-fold" data-panel-mine-fold aria-expanded="' + !mineFolded() + '">' + t('Hidden') + icon('chevron-right', 'class="reading-group-chevron"') + '</button>' +
						tileGrid(mineList, t('Hidden'), 'mine').replace('data-tile-group="mine"', 'data-tile-group="mine"' + (mineFolded() ? ' data-folded' : ''))
					: '<p class="reading-group-title reading-tiles-title reading-hidden-ondrag">' + t('Hidden') + '</p>' +
						'<div class="reading-tiles reading-tiles-empty reading-hidden-ondrag" data-tile-group="mine"><p class="reading-footnote">' + t('Drag styles here to hide them.') + '</p></div>');
		} else tiles = tileGrid(shown, t('Style'));
		var level1 =
			'<p class="reading-panel-title">' + t('Live Design') + '</p>' + 
			
			'<div class="reading-stepper reading-tall" role="group" aria-label="' + t('Reading size') + '">' +
				'<button type="button" data-panel-size="down" aria-label="' + t('Smaller') + '"' + (at <= 0 ? ' aria-disabled="true"' : '') + '>A</button>' +
				'<button type="button" class="big" data-panel-size="up" aria-label="' + t('Larger') + '"' + (at >= ids.length - 1 ? ' aria-disabled="true"' : '') + '>A</button>' +
				'<div class="reading-dots" aria-hidden="true">' + ids.map(function (id, i) { return '<i' + (i <= at ? ' class="is-on"' : '') + '></i>'; }).join('') + '</div>' +
			'</div>' +
			
			'<div class="reading-segment quire-segmented reading-tall" role="radiogroup" aria-label="' + t('Appearance') + '">' +
				SIDES.map(function (s) { return '<button type="button" role="radio"' + (s.id === n.side ? ' class="is-active"' : '') + ' aria-checked="' + (s.id === n.side) + '" data-panel-side="' + s.id + '">' + icon(s.icon) + '<span>' + t(s.label) + '</span></button>'; }).join('') + 
			'</div>' +
			tiles +
			
			(isReader && Styles.readersCopy && Styles.readersCopy() ? '<button type="button" class="quire-button reading-customise" data-panel-copy-link>' + icon('copy') + '<span>' + t(linkCopied ? 'Copied' : 'Copy style') + '</span></button>' : '') +
			(isReader ? '' : '<button type="button" class="quire-button reading-customise" data-panel-level="2">' + icon('settings') + '<span>' + t('Customise') + '</span></button>') ;
		
		
		function slider(label, list, currentId, attr, suffix, after, off) {
			var i = list.map(function (l) { return l.id; }).indexOf(currentId), shown;
			if (i === -1 && +currentId && list.every(function (l) { return +l.id; })) {
				list.forEach(function (l, k) { if (i === -1 || Math.abs(l.id - currentId) < Math.abs(list[i].id - currentId)) i = k; });
				shown = t(list[i].label).replace(list[i].id, currentId); 
			}
			i = Math.max(0, i);
			return '<div class="reading-list"><div class="reading-row reading-slider-row' + (off ? ' is-disabled' : '') + '">' +
				'<p class="reading-slider-title">' + label + (suffix || '') + '<span class="reading-group-value">' + (shown || t(list[i].label)) + '</span>' + (after || '') + '</p>' +
				'<div class="reading-slider">' +
					'<input type="range" class="reading-range" min="0" max="' + (list.length - 1) + '" step="1" value="' + i + '" data-stop="' + i + '" ' + attr + ' aria-label="' + label + '" aria-valuemin="0" aria-valuemax="' + (list.length - 1) + '" aria-valuenow="' + i + '" aria-valuetext="' + (shown || t(list[i].label)) + '"' + (off ? ' disabled aria-disabled="true"' : '') + ' style="--fill:' + Math.round(100 * i / (list.length - 1)) + '%">' +
				'</div>' +
			'</div></div>';
		}
		function nav(level, label, value, attrs) {
			return '<button type="button" class="quire-button reading-nav" data-panel-level="' + level + '"' + (attrs ? ' ' + attrs : '') + '>' +
				'<span class="reading-row-label">' + label + '</span><span class="reading-row-value">' + value + '</span>' + icon('chevron-right', 'class="reading-row-check"') +
			'</button>';
		}
		function customiseTitle(name) {
			var parts = t('Customise {name}').split('{name}'), esc = function (x) { return String(x).replace(/&/g, '&amp;').replace(/</g, '&lt;'); };
			return '<span class="reading-title-part">' + esc(parts[0] || '') + '</span><span class="reading-title-name">' + esc(name) + '</span><span class="reading-title-part">' + esc(parts[1] || '') + '</span>';
		}
		function head(title, back, reopen, tools) {
			var close = '<button type="button" class="reading-back" data-panel-close aria-label="' + t('Close') + '">' + icon('close') + '</button>';
			if (tools) return '<div class="reading-panel-head has-tools">' +
				(back ? '<button type="button" class="reading-back" data-panel-level="' + back + '"' + (reopen ? ' data-panel-reopen="' + reopen + '"' : '') + ' aria-label="' + t('Back') + '">' + icon('chevron-left') + '</button>' : '<span></span>') +
				'<p class="reading-panel-title" id="reading-panel-title" tabindex="-1">' + title + '</p>' +
				'<span class="reading-head-tools">' + tools + (isPhone() ? close : '') + '</span>' +
			'</div>';
			return '<div class="reading-panel-head">' +
				(back ? '<button type="button" class="reading-back" data-panel-level="' + back + '"' + (reopen ? ' data-panel-reopen="' + reopen + '"' : '') + ' aria-label="' + t('Back') + '">' + icon('chevron-left') + '</button>' : '<span></span>') +
				'<p class="reading-panel-title" id="reading-panel-title" tabindex="-1">' + title + '</p>' +
				(isPhone() ? close : '<span></span>') + 
			'</div>';
		}
		level1 = '<div class="reading-sheet-top">' + head(t('Live Design')) + '</div><div class="reading-sheet-body">' + level1.replace('<p class="reading-panel-title">' + t('Live Design') + '</p>', '') + '</div>';
		
		var ROLE_META = [
			{ id: 'head', label: 'Headings', where: 'Applies to the title and the headings in the article.' },
			{ id: 'read', label: 'Reading text', where: 'Applies to the paragraphs of the article.' },
			{ id: 'quote', label: 'Quotes', where: 'The quotes.' }, 
			{ id: 'kicker', label: 'Category line', where: 'The category under the title, on the cards and in the article.' },
			{ id: 'small', label: 'Small text', where: 'Dates, categories, captions and tags.' },
			{ id: 'comment', label: 'Comments', where: 'The names, the words and the form under the article.' }, 
			{ id: 'ui', label: 'Interface', where: 'The sidebar, the menus, the buttons and the cards.' },
			{ id: 'title', label: 'Interface titles', where: 'The section and group titles.' }
		];
		var ALLFACES = FACES.map(function (f) { return { id: f.id, label: f.label, family: f.family, group: f.group, listed: f.listed !== false }; });
		SANS.forEach(function (f) {
			if (ALLFACES.some(function (x) { return x.id === f.id; })) { ALLFACES.filter(function (x) { return x.id === f.id; })[0].listed = true; return; }
			ALLFACES.push({ id: f.id, label: f.label, family: 'inherit', group: f.group, listed: true });
		});
		var FOLLOW = { read: 'Same as reading text', ui: 'Same as interface', inherit: 'Same as reading text' };
		var FOLLOW_SHORT = { read: 'Reading text', ui: 'Interface', inherit: 'Reading text' };
		function faceLabel(id) { if (FOLLOW[id]) return t(FOLLOW[id]); var f = ALLFACES.filter(function (x) { return x.id === id; })[0]; return f ? f.label : id; }
		function faceShort(id) { return FOLLOW_SHORT[id] ? t(FOLLOW_SHORT[id]) : faceLabel(id); }
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
			
			if (!hostTypeOff) {
				hostTypeOff = {};
				var sheets = Array.prototype.slice.call(document.querySelectorAll('link[id^="architrave-panel"], style[id^="architrave-panel"]'))
					.map(function (n) { return n.sheet; }).filter(Boolean);
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
		function facesInUse() {
			var seen = [];
			ROLE_META.forEach(function (ro2) {
				var v2 = Styles.role(ro2.id), anchor = v2.face === 'ui' ? 'ui' : (v2.face === 'read' || v2.face === 'inherit' ? 'read' : '');
				var h2 = hostType(ro2.id) || (anchor ? hostType(anchor) : null);
				var l = h2 && h2.face ? h2.face : faceLabel(Styles.faceOf(Styles.role(ro2.id).face)); 
				if (l && seen.indexOf(l) === -1) seen.push(l);
			});
			if (!seen.length) return '';
			if (seen.length <= 2) return seen.join(' · ');
			return seen.slice(0, 2).join(' · ') + ' · +' + (seen.length - 2);
		}
		
		function levelRow(key, label, unit) {
			if (!Styles.levels || !Styles.levels[key]) return '';
			return slider(label, Styles.levels[key].map(function (id) { return { id: id, label: LEVEL_WORD[key] ? t(LEVEL_WORD[key][id] || id) : id + unit }; }), Styles.level(key), 'data-panel-level-range="' + key + '"').replace(/^<div class="reading-list">/, '').replace(/<\/div>$/, '');
		}
		var FADE_WORD = { bottom: 'Bottom', sides: 'Sides and bottom', all: 'All sides' }, FADE_ORDER = ['bottom', 'sides', 'all'];
		var FRAME_WORD = { plain: 'Plain', dots: 'Dots', checker: 'Checkerboard' };
		var pictureRows =
			(n.pictures === 'plain' || n.pictures === 'hidden' ? '' : '<div class="reading-row"><span class="reading-row-label">' + t('Colour on hover') + '</span><button type="button" class="reading-toggle" role="switch" aria-checked="' + n.picturehover + '" data-panel-option="picturehover" aria-label="' + t('Colour on hover') + '"></button></div>') +
			'<div class="reading-row"><span class="reading-row-label">' + t('Dim in the dark') + '</span><button type="button" class="reading-toggle" role="switch" aria-checked="' + n.picturedim + '" data-panel-option="picturedim" aria-label="' + t('Dim in the dark') + '"></button></div>' +
			(n.pictures === 'hidden' ? '' : '<div class="reading-row"><span class="reading-row-label">' + t('Frame around pictures') + '</span><button type="button" class="reading-toggle" role="switch" aria-checked="' + n.pictureframe + '" data-panel-option="pictureframe" aria-label="' + t('Frame around pictures') + '"></button></div>' +
			(n.pictureframe ? levelRow('framewidth', t('Frame width'), ' px') + (Styles.framePattern ? popupButton('framepattern', t('Frame pattern'), t(FRAME_WORD[Styles.framePattern()] || 'Plain')) : '') : '')) +
			''; 
		var CORNER_WORD = { small: 'Small', medium: 'Medium', large: 'Large', xlarge: 'Very large' }, CORNER_ORDER = ['small', 'medium', 'large', 'xlarge']; 
		var LINE_WORD = { solid: 'Solid', dashed: 'Dashed', dotted: 'Dotted' };
		var fieldOf = function (rows) { return '<div class="reading-list">' + rows + '</div>'; };
		
		var night = n.resolvedSide === 'dark';
		function switchRow(key, label, off) { return '<div class="reading-row' + (off ? ' is-disabled' : '') + '"><span class="reading-row-label">' + label + '</span><button type="button" class="reading-toggle" role="switch" aria-checked="' + n[key] + '" data-panel-option="' + key + '"' + (off ? ' disabled' : '') + ' aria-label="' + label + '"></button></div>'; }
		var PICK_WORD = { titlefinish: { flat: 'Flat', shine: 'Shine', accent: 'Accent colour' }, headitalics: { same: 'Same font', serif: 'Serif', classic: 'Classic serif', vollkorn: 'Vollkorn', fraunces: 'Fraunces' }, headarrival: { none: 'None', fade: 'Fade', blur: 'Blur to sharp' }, cardlight: { off: 'Off', edge: 'Top edge', glow: 'Edge and glow' }, buttonfinish: { flat: 'Flat', glass: 'Glass', glow: 'Glow' }, toppattern: { none: 'None', dots: 'Dots', grid: 'Grid', cross: 'Crosses', diagonal: 'Diagonal' }, guides: { off: 'Off', solid: 'Solid', dashed: 'Dashed' }, greytint: { '0': '0 %', '5': '5 %', '10': '10 %', '15': '15 %' }, pageglow: { off: 'Off', soft: 'Soft', strong: 'Strong' },
			monitorframe: { off: 'Off', thin: 'Thin', medium: 'Medium', thick: 'Thick' }, fringe: { off: 'Off', faint: 'Faint', soft: 'Soft', strong: 'Strong', slip: 'Print slip', sliptitle: 'Slip, titles only' }, crisp: { off: 'Off', headings: 'Headings', all: 'All text' }, scanstyle: { lines: 'Lines', grille: 'Grille', both: 'Both' }, shimmer: { off: 'Off', soft: 'Soft', roll: 'Roll' }, warp: { off: 'Off', slight: 'Slight', bulged: 'Bulged', strong: 'Strong' }, switchon: { off: 'Off', on: 'On' }, bloom: { off: 'Off', soft: 'Soft', strong: 'Strong' }, ghosting: { off: 'Off', on: 'On' }, jitter: { off: 'Off', rare: 'Rare', often: 'Often' }, graincrawl: { still: 'Still', moving: 'Moving' }, typedtitle: { off: 'Off', on: 'On' }, bootscreen: { off: 'Off', on: 'Computer boot', card: 'Test card' }, roomglass: { off: 'Off', on: 'On' }, phosphor: { off: 'Off', blue: 'Blue', green: 'Green', amber: 'Amber', white: 'White', black: 'Black' }, static: { off: 'Off', on: 'On' }, dropout: { off: 'Off', on: 'On' }, headrule: { off: 'Off', on: 'On' }, ink: { sharp: 'Sharp', spread: 'Spread' }, tooth: { off: 'Off', on: 'On' }, edges: { ink: 'Ink', yellowed: 'Yellowed' }, columns: { '1': 'One column', '2': 'Two per section', '3': 'Three per section' }, paragraphs: { spaced: 'Spaced', indented: 'Indented' }, rainbow: { off: 'Off', rule: 'Rule', mark: 'Mark', both: 'Both', logo: 'On the logo' }, postband: { off: 'Off', rainbow: 'Rainbow', postband: 'Between posts', footband: 'Page foot', menuline: 'Menu', legalline: 'Legal line', stripes: 'Stripes', sheetgrid: 'Drawing grid', gridstrength: 'Grid strength', sheetborder: 'Sheet border', mottle: 'Print mottle', printedges: 'Print edges', pen: 'Pen weight', dimensions: 'Dimension lines', guidelines: 'Lettering guides', bubbles: 'Section marks', titleblock: 'Title block', scalerule: 'Scale rule', sitename: 'Site name', logo: 'Rainbow with logo' }, footband: { off: 'Off', on: 'Rainbow', plate: 'Dark plate' }, menuline: { plain: 'Plain', underlined: 'Underlined' }, legalline: { off: 'Off', on: 'On' }, stripes: { solid: 'Solid', gaps: 'With gaps' }, sheetgrid: { off: 'Off', squared: 'Squared', fine: 'Fine squares', dots: 'Dots' }, gridstrength: { medium: 'Medium', faint: 'Faint', strong: 'Strong' }, sheetborder: { off: 'Off', line: 'Line', zones: 'Line and zones' }, mottle: { off: 'Off', soft: 'Soft', strong: 'Strong' }, printedges: { off: 'Off', soft: 'Soft', strong: 'Strong' }, pen: { off: 'Off', medium: 'Medium', bold: 'Bold' }, dimensions: { off: 'Off', on: 'On' }, guidelines: { off: 'Off', on: 'On' }, bubbles: { off: 'Off', on: 'On' }, titleblock: { off: 'Off', on: 'On' }, scalerule: { off: 'Off', on: 'On' }, oldpaper: { off: 'Off', sun: 'Sun-faded', spots: 'Age spots', both: 'Both' }, printink: { neutral: 'Neutral', warm: 'Warm brown-black' }, titlemark: { off: 'Off', short: 'Short', wide: 'Wide' }, rainbowlinks: { off: 'Off', hover: 'On hover', always: 'Always' }, rainbowcap: { off: 'Off', on: 'On' }, coupon: { off: 'Off', on: 'On' }, fold: { off: 'Off', one: 'One fold', three: 'Three panels' }, sitename: { plain: 'Plain', caps: 'Bold italic capitals' }, movinglight: { off: 'Off', on: 'On' }, categories: { below: 'Below title', above: 'Above title', hidden: 'Hidden' }, links: { both: 'Coloured and underlined', coloured: 'Coloured', underlined: 'Underlined' }, buttonshape: { cards: 'Like the cards', square: 'Square', rounded: 'Rounded', pill: 'Pill' }, buttonstyle: { filled: 'Filled', tinted: 'Tinted', gray: 'Gray', outlined: 'Outlined', shadow: 'Outlined with shadow', text: 'Text only' }, buttonmedium: { filled: 'Filled', tinted: 'Tinted', gray: 'Gray', outlined: 'Outlined', shadow: 'Outlined with shadow', text: 'Text only' }, buttonquiet: { filled: 'Filled', tinted: 'Tinted', gray: 'Gray', outlined: 'Outlined', shadow: 'Outlined with shadow', text: 'Text only' }, tags: { text: 'Text only', filled: 'Filled', tinted: 'Tinted', gray: 'Gray', outlined: 'Outlined' }, chosenitem: { gray: 'Gray', filled: 'Filled', outlined: 'Outlined', bold: 'Bold' }, fullpicture: { off: 'Wide', on: 'Full' }, quotes: { line: 'Line at the side', plain: 'Plain', box: 'Box' }, notes: { flat: 'Flat', box: 'Outlined', raised: 'Raised' }, fields: { flat: 'Flat', box: 'Outlined', raised: 'Raised' }, linewidth: { '1': '1 px', '2': '2 px', '3': '3 px', '5': '5 px' }, cards: { box: 'Outlined', top: 'Line above', flat: 'Flat', raised: 'Raised', ticks: 'Corner marks' } };
		function pickWord(key, v) { if (window.architravePanelGuest && ({ tags: 'text', chosenitem: 'gray', quotes: 'line', notes: 'flat', fields: 'flat' })[key] === v) return t('As the theme'); var w = PICK_WORD[key][v]; return /(px| %)$/.test(w) ? w : t(w); }
		function pickRow(key, label) { return Styles.pick ? popupButton(key, label, pickWord(key, Styles.pick(key))) : ''; }
		var LEVEL_ORDER = ['filled', 'tinted', 'gray', 'outlined', 'shadow', 'text']; 
		function pickMenu(key, label) { return Styles.picks ? popupMenu(key, label, (/^button(style|medium|quiet)$/.test(key) ? LEVEL_ORDER : Styles.picks[key].list).filter(function (id) { return !(key === 'categories' && id === 'above' && window.architravePanelGuest && Styles.pick(key) !== 'above'); }).map(function (id) { return { on: Styles.pick(key) === id, attr: 'data-panel-pick-shape="' + key + ':' + id + '"', label: pickWord(key, id) }; })) : ''; }
		var cornerItems = Styles.cornerSteps ? Styles.cornerSteps.slice().sort(function (a, b) { return CORNER_ORDER.indexOf(a) - CORNER_ORDER.indexOf(b); }).map(function (id) { return { on: Styles.corners() === id, attr: 'data-panel-pick-corners="' + id + '"', label: t(CORNER_WORD[id]) }; }) : [];
		var lineItems = Styles.lineStyles ? Styles.lineStyles.map(function (id) { return { on: Styles.lineStyle() === id, attr: 'data-panel-pick-linestyle="' + id + '"', label: t(LINE_WORD[id]) }; }) : [];
		
		var fadeMenu = n.picturefade && Styles.fadeEdges && !window.architravePanelGuest ? popupMenu('fadeedges', t('Edges'), FADE_ORDER.map(function (id) { return { on: Styles.fadeEdges() === id, attr: 'data-panel-pick-fadeedges="' + id + '"', label: t(FADE_WORD[id]) }; })) : '';
		var layoutBody =
			'<p class="reading-group-title">' + t('Page') + '</p>' +
			'<div class="reading-font-field"><div class="reading-list">' +
				(Styles.levels && Styles.levels.space ? levelRow('space', t('Space'), '') : '') +
				(n.pictures === 'hidden' || window.architravePanelGuest ? '' : switchRow('picturefade', t('Fade the edges')) +
					(n.picturefade && Styles.fadeEdges ? popupButton('fadeedges', t('Edges'), t(FADE_WORD[Styles.fadeEdges()] || 'Sides and bottom')) : '')) +
			'</div>' + fadeMenu + '</div>' +
			'<p class="reading-group-title">' + t('Article') + '</p>' +
			'<div class="reading-font-field">' + fieldOf(
				levelRow('measure', t('Line length'), ' ' + t('letters')) +
				pickRow('categories', t('Categories')) +
				(window.architravePanelGuest ? '' : switchRow('widehead', t('Wide title')) + (n.pictures === 'hidden' ? '' : switchRow('widepicture', t('Wide top picture')) + (n.widepicture ? pickRow('fullpicture', t('Picture width')) : '')))) + (!window.architravePanelGuest && n.widepicture ? pickMenu('fullpicture', t('Picture width')) : '') + pickMenu('categories', t('Categories')) + '</div>';
		var shapeBody =
			'<div class="reading-font-field"><div class="reading-list">' +
				switchRow('rounded', t('Rounded corners')) +
				(n.rounded && Styles.cornerSteps ? popupButton('corners', t('Corner size'), t(CORNER_WORD[Styles.corners()] || 'Medium')) : '') +
				
				(n.rounded ? pickRow('buttonshape', t('Button shape')) + switchRow('tagsfollow', t('Tags follow the buttons')) : '') +
				pickRow('buttonstyle', t('Main buttons')) + pickRow('buttonmedium', t('Other buttons')) + (window.architravePanelGuest ? '' : pickRow('buttonquiet', t('Quiet buttons'))) + pickRow('tags', t('Tags')) + pickRow('chosenitem', t('Chosen item')) +
				switchRow('lines', t('Lines')) +
				(n.lines ? levelRow('line', t('Line strength'), ' %') : '') +
				(n.lines ? pickRow('linewidth', t('Line width')) : '') +
				(n.lines && Styles.lineStyles ? popupButton('linestyle', t('Line style'), t(LINE_WORD[Styles.lineStyle()] || 'Solid')) : '') +
				(n.lines && (!Styles.pick || Styles.pick('linewidth') === '1') ? switchRow('hairlines', t('Fine lines')) : '') + 
				(window.architravePanelGuest ? '' : pickRow('cards', t('Cards'))) + pickRow('quotes', t('Quotes')) + pickRow('notes', t('Notes')) + pickRow('fields', t('Fields')) +
				switchRow('fills', t('Fills')) +
				(n.fills ? levelRow('fill', t('Fill strength'), ' %') : '') +
			'</div>' +
			(n.rounded ? popupMenu('corners', t('Corner size'), cornerItems) : '') +
			(n.lines ? popupMenu('linestyle', t('Line style'), lineItems) : '') +
			pickMenu('buttonshape', t('Button shape')) + pickMenu('buttonstyle', t('Main buttons')) + pickMenu('buttonmedium', t('Other buttons')) + (window.architravePanelGuest ? '' : pickMenu('buttonquiet', t('Quiet buttons'))) + pickMenu('tags', t('Tags')) + pickMenu('chosenitem', t('Chosen item')) + pickMenu('linewidth', t('Line width')) + pickMenu('cards', t('Cards')) + pickMenu('quotes', t('Quotes')) + pickMenu('notes', t('Notes')) + pickMenu('fields', t('Fields')) +
			'</div>';
		var FRAME_ROW = false; 
		var effectsBody =
			fieldOf(
				switchRow('scanlines', t('Scan lines')) + (n.scanlines ? levelRow('scan', t('Scan line strength'), '') : '') +
				switchRow('glow', t('Glow'), !night) + (n.glow && night ? levelRow('glowlevel', t('Glow strength'), '') : '') +
				switchRow('grain', t('Background grain')) + (n.grain ? levelRow('grainlevel', t('Grain strength'), '') : '') +
				switchRow('dots', t('Dotted background')) + (n.dots && Styles.levels.dotsize ? levelRow('dotsize', t('Grid size'), '') + levelRow('dotlevel', t('Dot strength'), ' %') : '') +
				switchRow('vignette', t('Vignette')) + (n.vignette ? levelRow('vignettelevel', t('Vignette strength'), '') + levelRow('vignettereach', t('Vignette size'), '') : '')) +
			'<div class="reading-font-field"><div class="reading-list">' +
				pickRow('titlefinish', t('Title finish')) + pickRow('headitalics', t('Italics in headings')) + pickRow('headarrival', t('Headings arrive')) + (window.architravePanelGuest ? '' : pickRow('cardlight', t('Card light'))) + pickRow('buttonfinish', t('Button finish')) + (window.architravePanelGuest ? '' : pickRow('toppattern', t('Pattern at the top'))) + (window.architravePanelGuest ? '' : pickRow('guides', t('Guides'))) + (window.architravePanelGuest ? '' : pickRow('greytint', t('Tint the greys'))) + (window.architravePanelGuest ? '' : pickRow('pageglow', t('Aurora'))) + (window.architravePanelGuest ? '' : pickRow('movinglight', t('Moving light'))) +  (window.architravePanelGuest || !FRAME_ROW ? '' : pickRow('monitorframe', t('Monitor frame'))) + pickRow('fringe', t('Colour fringe')) + pickRow('crisp', t('Crisp edges')) + pickRow('scanstyle', t('Scan style')) + pickRow('shimmer', t('Shimmer')) + (window.architravePanelGuest ? '' : pickRow('warp', t('Warp'))) + pickRow('switchon', t('Switch-on')) + pickRow('static', t('Static')) + pickRow('bloom', t('Bloom')) + (window.architravePanelGuest ? '' : pickRow('ghosting', t('Ghosting'))) + pickRow('jitter', t('Jitter')) + pickRow('graincrawl', t('Grain motion')) + pickRow('typedtitle', t('Typed title')) + pickRow('bootscreen', t('Start screen')) + pickRow('phosphor', t('Phosphor')) + pickRow('dropout', t('Drop-out title')) + pickRow('headrule', t('Title rule')) + pickRow('ink', t('Ink')) + pickRow('tooth', t('Paper tooth')) + pickRow('edges', t('Edges')) + (window.architravePanelGuest ? '' : pickRow('columns', t('Columns'))) + pickRow('paragraphs', t('Paragraphs')) + (window.architravePanelGuest ? '' : pickRow('rainbow', t('Rainbow')) + pickRow('postband', t('Between posts')) + pickRow('footband', t('Page foot')) + pickRow('menuline', t('Menu')) + pickRow('legalline', t('Legal line')) + pickRow('stripes', t('Stripes')) + pickRow('sitename', t('Site name')) + pickRow('sheetgrid', t('Drawing grid')) + (Styles.pick && Styles.pick('sheetgrid') !== 'off' ? pickRow('gridstrength', t('Grid strength')) : '') + pickRow('sheetborder', t('Sheet border')) + pickRow('mottle', t('Print mottle')) + pickRow('printedges', t('Print edges')) + pickRow('pen', t('Pen weight')) + pickRow('dimensions', t('Dimension lines')) + pickRow('guidelines', t('Lettering guides')) + pickRow('bubbles', t('Section marks')) + pickRow('titleblock', t('Title block')) + pickRow('scalerule', t('Scale rule')) + pickRow('oldpaper', t('Old paper')) + pickRow('printink', t('Printing ink')) + pickRow('titlemark', t('Rainbow under the title')) + pickRow('rainbowlinks', t('Rainbow links')) + pickRow('rainbowcap', t('Rainbow capital')) + pickRow('coupon', t('Coupon line')) + pickRow('fold', t('Folded brochure'))) +
			'</div>' + pickMenu('titlefinish', t('Title finish')) + pickMenu('headitalics', t('Italics in headings')) + pickMenu('headarrival', t('Headings arrive')) + (window.architravePanelGuest ? '' : pickMenu('cardlight', t('Card light'))) + pickMenu('buttonfinish', t('Button finish')) + (window.architravePanelGuest ? '' : pickMenu('toppattern', t('Pattern at the top'))) + (window.architravePanelGuest ? '' : pickMenu('guides', t('Guides'))) + (window.architravePanelGuest ? '' : pickMenu('greytint', t('Tint the greys'))) + (window.architravePanelGuest ? '' : pickMenu('pageglow', t('Aurora'))) + (window.architravePanelGuest ? '' : pickMenu('movinglight', t('Moving light'))) + (window.architravePanelGuest || !FRAME_ROW ? '' : pickMenu('monitorframe', t('Monitor frame'))) + pickMenu('fringe', t('Colour fringe')) + pickMenu('crisp', t('Crisp edges')) + pickMenu('scanstyle', t('Scan style')) + pickMenu('shimmer', t('Shimmer')) + (window.architravePanelGuest ? '' : pickMenu('warp', t('Warp'))) + pickMenu('switchon', t('Switch-on')) + pickMenu('static', t('Static')) + pickMenu('bloom', t('Bloom')) + (window.architravePanelGuest ? '' : pickMenu('ghosting', t('Ghosting'))) + pickMenu('jitter', t('Jitter')) + pickMenu('graincrawl', t('Grain motion')) + pickMenu('typedtitle', t('Typed title')) + pickMenu('bootscreen', t('Start screen')) + pickMenu('phosphor', t('Phosphor')) + pickMenu('dropout', t('Drop-out title')) + pickMenu('headrule', t('Title rule')) + pickMenu('ink', t('Ink')) + pickMenu('tooth', t('Paper tooth')) + pickMenu('edges', t('Edges')) + (window.architravePanelGuest ? '' : pickMenu('columns', t('Columns'))) + pickMenu('paragraphs', t('Paragraphs')) + (window.architravePanelGuest ? '' : pickMenu('rainbow', t('Rainbow')) + pickMenu('postband', t('Between posts')) + pickMenu('footband', t('Page foot')) + pickMenu('menuline', t('Menu')) + pickMenu('legalline', t('Legal line')) + pickMenu('stripes', t('Stripes')) + pickMenu('sitename', t('Site name')) + pickMenu('sheetgrid', t('Drawing grid')) + (Styles.pick && Styles.pick('sheetgrid') !== 'off' ? pickMenu('gridstrength', t('Grid strength')) : '') + pickMenu('sheetborder', t('Sheet border')) + pickMenu('mottle', t('Print mottle')) + pickMenu('printedges', t('Print edges')) + pickMenu('pen', t('Pen weight')) + pickMenu('dimensions', t('Dimension lines')) + pickMenu('guidelines', t('Lettering guides')) + pickMenu('bubbles', t('Section marks')) + pickMenu('titleblock', t('Title block')) + pickMenu('scalerule', t('Scale rule')) + pickMenu('oldpaper', t('Old paper')) + pickMenu('printink', t('Printing ink')) + pickMenu('titlemark', t('Rainbow under the title')) + pickMenu('rainbowlinks', t('Rainbow links')) + pickMenu('rainbowcap', t('Rainbow capital')) + pickMenu('coupon', t('Coupon line')) + pickMenu('fold', t('Folded brochure'))) +
			'</div>';
		var picturesBody = popupRow('pictures', t('Picture effects'), t(PICTURE_WORD[n.pictures] || 'As they are'),
				Styles.pictures.map(function (id) { return { on: n.pictures === id, attr: 'data-panel-pick-pictures="' + id + '"', label: t(PICTURE_WORD[id]) }; }),
				t(PICTURE_NOTE[n.pictures] || PICTURE_NOTE.plain),
				'', pictureRows);
		if (n.pictureframe && Styles.framePattern && n.pictures !== 'hidden') picturesBody = picturesBody.replace(/<\/div>$/, popupMenu('framepattern', t('Frame pattern'), Styles.framePatterns.map(function (id) { return { on: Styles.framePattern() === id, attr: 'data-panel-pick-framepattern="' + id + '"', label: t(FRAME_WORD[id]) }; })) + '</div>');
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
				levelRow('smallsoft', t('Small text'), ' %') + pickRow('links', t('Links')) +
				switchRow('marker', t('Highlighter')) +
				(n.marker && Styles.markerColour ? popupButton('markercolour', t('Highlighter colour'), t(MARKER_WORD[Styles.markerColour()] || 'Yellow') + '<span class="reading-well" style="--well:' + (/^(text|muted)$/.test(Styles.markerColour()) ? 'var(--marker)' : markerHex()) + '" aria-hidden="true"></span>') : '') + 
			'</div>' + pickMenu('links', t('Links')) +
			(n.marker && Styles.markerColour ? popupMenu('markercolour', t('Highlighter colour'), Styles.markerColours.map(function (id) { return { on: Styles.markerColour() === id, attr: 'data-panel-pick-markercolour="' + id + '"', label: t(id === 'own' ? 'Own colour…' : MARKER_WORD[id]) }; })) : '') +
			'</div>' +
			'<p class="reading-group-title">' + t('Ground and buttons') + '</p>' +
			'<div class="reading-font-field"><div class="reading-list">' +
				switchRow('darkground', t('Dark ground'), night) +
				popupButton('button', t('Button colour'), buttonWord() + '<span class="reading-well" style="--well:' + buttonHex() + '" aria-hidden="true"></span>') +
			'</div>' +
			popupMenu('button', t('Button colour'), [
				{ on: n.button === 'accent', attr: 'data-panel-pick-button="accent"', label: t('Accent') },
				{ on: n.button === 'ink', attr: 'data-panel-pick-button="ink"', label: t('Ink') },
				{ on: n.button === 'own', attr: 'data-panel-pick-button="own"', label: t('Own colour…') }]) +
			'</div>';
		
		function undoName() {
			var w = Styles.undoWhat ? Styles.undoWhat() : '';
			var ROLE = w.indexOf('role:') === 0 ? ROLE_META.filter(function (r) { return r.id === w.slice(5); })[0] : null;
			var WHAT = { 'effect:title': 'Title finish', 'effect:serif': 'Italics in headings', 'effect:arrival': 'Headings arrive', 'effect:cardlight': 'Card light', 'effect:moving': 'Moving light', 'effect:button': 'Button finish', 'effect:pattern': 'Pattern at the top', 'effect:guides': 'Guides', 'effect:tint': 'Tint the greys', 'effect:aurora': 'Aurora', titlefinish: 'Title finish', headitalics: 'Italics in headings', headarrival: 'Headings arrive', cardlight: 'Card light', buttonfinish: 'Button finish', toppattern: 'Pattern at the top', guides: 'Guides', greytint: 'Tint the greys', pageglow: 'Aurora', movinglight: 'Moving light', monitorframe: 'Monitor frame', fringe: 'Colour fringe', crisp: 'Crisp edges', scanstyle: 'Scan style', shimmer: 'Shimmer', warp: 'Warp', switchon: 'Switch-on', static: 'Static', bloom: 'Bloom', ghosting: 'Ghosting', jitter: 'Jitter', graincrawl: 'Grain motion', typedtitle: 'Typed title', bootscreen: 'Start screen', roomglass: 'Room in the glass', phosphor: 'Phosphor', dropout: 'Drop-out title', headrule: 'Title rule', ink: 'Ink', tooth: 'Paper tooth', edges: 'Edges', columns: 'Columns', paragraphs: 'Paragraphs', rainbow: 'Rainbow', postband: 'Between posts', footband: 'Page foot', menuline: 'Menu', legalline: 'Legal line', stripes: 'Stripes', sheetgrid: 'Drawing grid', gridstrength: 'Grid strength', sheetborder: 'Sheet border', mottle: 'Print mottle', printedges: 'Print edges', pen: 'Pen weight', dimensions: 'Dimension lines', guidelines: 'Lettering guides', bubbles: 'Section marks', titleblock: 'Title block', scalerule: 'Scale rule', sitename: 'Site name', 'effect:monitor': 'Monitor frame', 'effect:warp': 'Warp', lines: 'Lines', line: 'Lines', linestyle: 'Line style', hairlines: 'Fine lines', darkground: 'Dark ground', fills: 'Fills', fill: 'Fills', rounded: 'Rounded corners', corners: 'Corner size', buttonshape: 'Button shape', tagsfollow: 'Tags follow the buttons', buttonstyle: 'Main buttons', buttonmedium: 'Other buttons', buttonquiet: 'Quiet buttons', tags: 'Tags', chosenitem: 'Chosen item', fullpicture: 'Picture width', quotes: 'Quotes', notes: 'Notes', fields: 'Fields', linewidth: 'Line width', cards: 'Cards',
				scanlines: 'Scan lines', scan: 'Scan lines', glow: 'Glow', glowlevel: 'Glow', grain: 'Background grain', grainlevel: 'Background grain',
				vignette: 'Vignette', vignettelevel: 'Vignette', vignettereach: 'Vignette', soft: 'Softer reading text', softlevel: 'Softer reading text', quietlevel: 'Softer reading text', smallsoft: 'Small text', links: 'Links', categories: 'Categories',
				justify: 'Justified text', dropcap: 'Drop cap', capLines: 'Drop cap height', pictures: 'Picture effects', picturedim: 'Dim in the dark',
				pictureframe: 'Frame around pictures', picturefade: 'Fade the edges', fadeedges: 'Fade the edges', dots: 'Dotted background', dotsize: 'Dotted background', dotlevel: 'Dotted background', marker: 'Highlighter', markercolour: 'Highlighter', button: 'Button colour', pillbuttons: 'Pill buttons', widepicture: 'Wide top picture', widehead: 'Wide title', measure: 'Line length', space: 'Space', framewidth: 'Frame width', framepattern: 'Frame pattern', palette: 'Colour', tint: 'Colour', preset: 'Colour', colours: 'Colour', accent: 'Colour',
				face: 'Font', sans: 'Font', reading: 'Size', leading: 'Line spacing', reset: 'Reset everything' };
			var word = ROLE ? t(ROLE.label) : WHAT[w] ? t(WHAT[w]) : '';
			return word ? t('Undo {what}').replace('{what}', word) : t('Undo');
		}
		function publishItems(id, full, noSeen) {
			if (!(Styles.canPublish && Styles.canPublish())) return '';
			var st = Styles.list.filter(function (x) { return x.id === id; })[0]; if (!st) return '';
			var def = Styles.readerFirst ? Styles.readerFirst() : '';
			function it(attr, label, red) { return '<li role="none"><button type="button" class="quire-menu-item' + (red ? ' is-destructive' : '') + '" role="menuitem" ' + attr + '><span class="quire-menu-label">' + label + '</span></button></li>'; }
			var out = '';
			
			if (full) out += (st.host ? '' : it('data-panel-tile-customise="' + id + '"', t('Customise'))) + it('data-panel-tile-duplicate="' + id + '"', t('Duplicate')) +
				(Styles.adjusted(id) ? it('data-panel-tile-reset="' + id + '"', t('Reset')) : '') +
				'<li role="separator" class="quire-menu-separator"></li>';
			if (!noSeen && !st.host && id !== def) { var seenFirst = Styles.seenByReaders(id); out += '<li role="none"><button type="button" class="quire-menu-item' + (seenFirst ? ' is-selected' : '') + '" role="menuitemcheckbox" aria-checked="' + seenFirst + '" data-panel-seen="' + id + ':' + (seenFirst ? '0' : '1') + '"><span class="quire-menu-label">' + t('Show on site') + '</span>' + (seenFirst ? icon('check', 'class="quire-menu-check"') : '') + '</button></li>'; }
			if (id === def) out += '<li role="none"><button type="button" class="quire-menu-item is-selected" role="menuitemcheckbox" aria-checked="true" disabled><span class="quire-menu-label">' + t('Site default') + '</span>' + icon('check', 'class="quire-menu-check"') + '</button></li>';
			if (id !== def) out += it('data-panel-make-default="' + id + '"', t('Make site default'));
			if (full && (st.own || st.site)) out += it('data-panel-tile-rename="' + id + '"', t('Rename…'));
			if (full && (st.own || st.site)) out += (out ? '<li role="separator" class="quire-menu-separator"></li>' : '') + it('data-panel-tile-delete="' + id + '"', t('Delete'), true);
			return out;
		}
		function moreMenu() {
			if (saving) return '<div class="quire-menu reading-more-menu reading-ask reading-save-card" role="dialog" aria-label="' + t('Name this style') + '">' +
				'<p class="reading-ask-title">' + t('Name this style') + '</p>' +
				'<input type="text" class="quire-input reading-name-field" data-panel-name maxlength="40" placeholder="' + t('Style name') + '" aria-label="' + t('Style name') + '">' +
				(Styles.canPublish && Styles.canPublish() ? '<div class="reading-list"><div class="reading-row"><span class="reading-row-label">' + t('Show to readers') + '</span><button type="button" class="reading-toggle" role="switch" aria-checked="' + saveForReaders + '" data-panel-save-readers aria-label="' + t('Show to readers') + '"></button></div></div>' : '') +
				'<div class="reading-name-actions"><button type="button" class="quire-button" data-panel-save-cancel>' + t('Cancel') + '</button><button type="button" class="quire-button primary" data-panel-save-go>' + t('Save') + '</button></div>' +
			'</div>';
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
				publishItems(current.id, false, true) + 
				(site && adj ? item('data-panel-site-update', t('Apply changes for everyone')) : '');
			var resettable = adj || n.side !== 'dark'  || !n.accent || n.focus;
			return '<ul class="quire-menu reading-more-menu" role="menu" aria-label="' + t('More') + '">' +
				
				item('data-panel-copy-link', t('Copy style')) +
				item('data-panel-paste', t('Paste style…')) +
				(tile ? sep + tile : '') + sep +
				(own ? item('data-panel-ask="delete"', t('Delete style'), { red: 1 }) : '') +
				item('data-panel-ask="reset"', t('Reset everything'), { red: 1, off: !resettable }) +
			'</ul>';
		}
		var level2 =
			
			'<div class="reading-sheet-top">' + head(customiseTitle(t(current.label)), 1, 0, '<button type="button" class="reading-back" data-panel-undo aria-label="' + undoName() + '" title="' + undoName() + '"' + (Styles.canUndo && Styles.canUndo() ? '' : ' disabled') + '>' + icon('undo') + '</button><button type="button" class="reading-back" data-panel-more aria-haspopup="menu" aria-expanded="' + !!moreOpen + '" aria-label="' + t(copied ? 'Copied' : linkCopied ? 'Link copied' : 'More') + '">' + icon(copied || linkCopied ? 'check' : 'more') + '</button>') + moreMenu() + '</div>' +
			'<div class="reading-sheet-body">' +
			'<div class="reading-search"><input type="search" class="reading-search-field" data-panel-search placeholder="' + t('Search settings') + '" aria-label="' + t('Search settings') + '" value="' + escText(searchQuery) + '" autocomplete="off" spellcheck="false"></div>' +
			'<div class="reading-search-results"></div>' +
			
			
			'<div class="reading-list">' + nav(4, t('Colour'), (presetOn ? t(presetOn.label) : custom ? t('Custom') : pairName) + pagePic(nowTriple(n.resolvedSide))) + '</div>' +
			'<div class="reading-list">' + nav(8, t('Type'), facesInUse()) + '</div>' +
			'<div class="reading-list">' + nav(14, t('Layout'), '') + nav(15, t('Corners and lines'), '') + nav(16, t('Pictures'), '') + nav(17, t('Effects'), '') + '</div>' +
			
			
			(function () {
				if (!(Styles.canPublish && Styles.canPublish()) || current.host) return '';
				var isDef = Styles.readerFirst && Styles.readerFirst() === current.id, seenOn = isDef || (Styles.seenByReaders && Styles.seenByReaders(current.id));
				return '<div class="reading-list"><div class="reading-row"><span class="reading-row-label">' + t('Show on site') + '</span><button type="button" class="reading-toggle" role="switch" aria-checked="' + !!seenOn + '" data-panel-seen-switch="' + current.id + '" aria-label="' + t('Show on site') + '"' + (isDef ? ' disabled aria-disabled="true"' : '') + '></button></div></div>' +
					(isDef ? '<p class="reading-footnote">' + t('The site default is always on your site.') + '</p>' : '');
			}()) +
			
			('<button type="button" class="quire-button' + (saving || pasting ? '' : ' primary') + ' reading-main" data-panel-save' + (Styles.adjusted(current.id) || (Styles.isOwn && Styles.isOwn(current.id)) ? '' : ' disabled') + '>' + t(publishFailed ? 'Could not publish' : (Styles.isOwn && Styles.isOwn(current.id) ? 'Save as new style…' : 'Save as style…')) + '</button>') +
			(Styles.canPublish && Styles.canPublish() && Styles.button && Styles.button() ? '<div class="reading-list reading-site-list">' + nav(13, t('Button and Sharing'), '') + '</div>' : '') +
			'</div>';
		
		var scroller = panel.querySelector('.reading-sheet-body');
		var scrolled = (scroller && renderedLevel === level) ? scroller.scrollTop : 0;
		var turned = renderedLevel !== null && renderedLevel !== level;
		var turnWay = turned ? (level > renderedLevel ? 'forward' : 'back') : null;
		var heightWas = !isPhone() && !panel.hidden ? panel.offsetHeight : 0; 
		renderedLevel = level;
		var ro = ROLE_META.filter(function (x) { return x.id === role; })[0] || ROLE_META[0];
		var rv = Styles.role(ro.id);
		var hv = hostType(ro.id); 
		var faces = ALLFACES.filter(function (f) { return f.listed || f.id === rv.face; });
		var follower = ro.id !== 'read' && ro.id !== 'ui';
		
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
		function famAttr(family) { return String(family).replace(/"/g, '&quot;'); }
		var faceNowFamily = ((faces.filter(function (f) { return f.id === rv.face; })[0] || {}).family || 'inherit');
		
		var fontRow = '<div class="reading-list">' + nav(10, t('Font'), hv && hv.face ? hv.face : faceLabel(rv.face)) + '</div>';
		
		var hasIt = Styles.hasItalic(rv.face);
		var italicRow = '<div class="reading-row' + (hasIt ? '' : ' is-disabled') + '"><span class="reading-row-label">' + t('Italic') + '</span><button type="button" class="reading-toggle" role="switch" aria-checked="' + (hasIt && rv.italic) + '"' + (hasIt ? '' : ' aria-disabled="true" disabled') + ' data-panel-role-italic aria-label="' + t('Italic') + '"></button></div>';
		var capsRow = '<div class="reading-row"><span class="reading-row-label">' + t('Capitals') + '</span><button type="button" class="reading-toggle" role="switch" aria-checked="' + rv.caps + '" data-panel-role-caps aria-label="' + t('Capitals') + '"></button></div>';
		var weights = Styles.weightsFor(rv.face);
		var weightNow = hv && hv.weight ? hv.weight : rv.weight;
		var weightRow = (weights.length
			? slider(t('Weight'), weights.map(function (w) { return { id: w, label: weightWord(w) + ' ' + WEIGHT_NUMBER[w] }; }), weightNow, 'data-panel-weight-range')
			: '<div class="reading-list"><div class="reading-row is-disabled"><span class="reading-row-label">' + t('Weight') + '</span><span class="reading-row-value">' + weightWord(weightNow) + '</span></div></div>');
		var ALIGN_WORD = { 'default': 'Left', center: 'Centre', right: 'Right' }, ALIGN_ORDER = ['default', 'center', 'right'];
		function roleColourHex() { var c = Styles.colours ? (Styles.colours(current.id)[n.resolvedSide] || {}) : {}; return rv.colour === 'accent' ? (cssHex('--accent') || '#000000') : rv.colour === 'own' ? (c[ro.id] || cssHex('--accent') || '#000000') : (cssHex('--text-primary') || '#000000'); }
		var colourRow = rv.colour === undefined ? '' : popupButton('colour', t('Colour'), t(rv.colour === 'accent' ? 'Accent' : rv.colour === 'own' ? 'Own colour' : 'Ink') + '<span class="reading-well" style="--well:' + roleColourHex() + '" aria-hidden="true"></span>');
		var colourMenu = rv.colour === undefined ? '' : popupMenu('colour', t('Colour'), [
			{ on: rv.colour === 'ink', attr: 'data-panel-pick-colour="ink"', label: t('Ink') },
			{ on: rv.colour === 'accent', attr: 'data-panel-pick-colour="accent"', label: t('Accent') },
			{ on: rv.colour === 'own', attr: 'data-panel-pick-colour="own"', label: t('Own colour…') }]);
		var switchRows = rv.align === undefined ? '<div class="reading-list">' + italicRow + capsRow + '</div>'
			: '<div class="reading-font-field"><div class="reading-list">' + italicRow + capsRow + popupButton('align', t('Alignment'), t(ALIGN_WORD[rv.align] || 'Left')) + colourRow + '</div>' +
				popupMenu('align', t('Alignment'), ALIGN_ORDER.map(function (id) { return { on: rv.align === id, attr: 'data-panel-pick-align="' + id + '"', label: t(ALIGN_WORD[id]) }; })) + colourMenu + '</div>'; 
		
		
		var ratioStops = !!window.architravePanelGuest && Styles.current && Styles.current() === 'host';
		var restSize = ratioStops && Styles.restSize ? +Styles.restSize(ro.id) : 0;
		var sizeBlock = slider(t('Size'), Styles.sizesFor(ro.id).map(function (id) {
			var pct = restSize ? Math.round((+id / restSize - 1) * 100) : 0;
			return { id: id, label: ratioStops ? (pct === 0 ? t('Default') : (pct > 0 ? '+' : '−') + Math.abs(pct) + ' %') : id + ' px' };
		}), rv.size, 'data-panel-size-range', '', '', dead('size:' + ro.id));
		function pageOf(title, body) { return '<div class="reading-sheet-top">' + head(title, 2) + '</div><div class="reading-sheet-body">' + body + '</div>'; }
		var level14 = pageOf(t('Layout'), layoutBody), level15 = pageOf(t('Corners and lines'), shapeBody), level16 = pageOf(t('Pictures'), picturesBody), level17 = pageOf(t('Effects'), effectsBody);
		
		var ROLE_GROUP = [
			{ title: 'Article', ids: ['head', 'kicker', 'read', 'quote', 'small', 'comment'] }, 
			{ title: 'Site', ids: ['ui', 'title'] }
		];
		(function () {
			var named = ROLE_GROUP.reduce(function (a, g) { return a.concat(g.ids); }, []);
			ROLE_META.forEach(function (ro2) { if (named.indexOf(ro2.id) === -1) ROLE_GROUP[ROLE_GROUP.length - 1].ids.push(ro2.id); });
		}());
		function roleRow(ro2) {
			var off = dead('role:' + ro2.id);
			return '<button type="button" class="quire-button reading-nav' + (off ? ' is-disabled' : '') + '" data-panel-level="3" data-panel-role="' + ro2.id + '"' + (off ? ' disabled aria-disabled="true"' : '') + '>' +
				'<span class="reading-row-label">' + t(ro2.label) + '</span><span class="reading-row-value">' + roleSummary(ro2.id) + '</span>' + icon('chevron-right', 'class="reading-row-check"') +
			'</button>';
		}
		var level8 =
			'<div class="reading-sheet-top">' + head(t('Type'), 2) + '</div>' +
			'<div class="reading-sheet-body">' +
				ROLE_GROUP.map(function (g) {
					var rows = g.ids.filter(function (id) { return !gone('role:' + id); }).map(function (id) { return roleRow(ROLE_META.filter(function (x) { return x.id === id; })[0]); }).join('');
					return rows ? '<p class="reading-group-title">' + t(g.title) + '</p><div class="reading-list">' + rows + '</div>' : '';
				}).join('') +
			'</div>';
		
		var FACE_GROUPS = [
			{ id: 'sans', title: 'Sans-serif' },
			{ id: 'serif', title: 'Serif' },
			{ id: 'mono', title: 'Monospace' },
			{ id: 'pixel', title: 'Pixel' },
			{ id: 'display', title: 'Display' } 
		];
		function faceRow(f) {
			var on = hv && hv.face ? f.label.toLowerCase() === hv.face.toLowerCase() : f.id === (rv.face === 'inherit' ? 'read' : rv.face);
			return '<li role="none"><button type="button" class="reading-row reading-row-led" role="radio" aria-checked="' + on + '" data-panel-role-face="' + f.id + '">' +
				(on ? icon('check', 'class="reading-row-check reading-row-lead"') : '<span class="reading-row-check reading-row-lead is-blank" aria-hidden="true"></span>') +
				'<span class="reading-row-label">' + f.label + '</span></button></li>';
		}
		var grouped = FACE_GROUPS.map(function (g) {
			var mine = faces.filter(function (f) { return f.group === g.id; });
			if (!mine.length) return '';
			return '<p class="reading-group-title">' + t(g.title) + '</p>' +
				'<ul class="reading-group" role="radiogroup" aria-label="' + t(g.title) + '">' + mine.map(faceRow).join('') + '</ul>';
		}).join('');
		var ungrouped = faces.filter(function (f) { return FACE_GROUPS.every(function (g) { return g.id !== f.group; }); });
		var anchorRows = follower ? '<ul class="reading-group" role="radiogroup" aria-label="' + t('Font') + '">' +
			[{ id: 'read', label: t('Same as reading text') }, { id: 'ui', label: t('Same as interface') }].map(faceRow).join('') + '</ul>' : '';
		var level10 =
			'<div class="reading-sheet-top">' + head(t('Font'), 3) +
				'<div class="reading-face-search"><input type="search" class="quire-input reading-name-field" data-panel-face-search placeholder="' + t('Search fonts') + '" aria-label="' + t('Search fonts') + '" value="' + String(faceQuery).replace(/"/g, '&quot;') + '" autocomplete="off" spellcheck="false"></div>' +
			'</div>' +
			'<div class="reading-sheet-body">' +
			'<p class="reading-footnote reading-face-none" hidden>' + t('No results') + '</p>' +
			anchorRows +
			grouped +
			(ungrouped.length ? '<ul class="reading-group" role="radiogroup" aria-label="' + t('Font') + '">' + ungrouped.map(faceRow).join('') + '</ul>' : '') +
			(window.ArchitraveFontFetch && window.ArchitraveFontFetch.fetched() ? '<ul class="reading-group reading-face-prune"><li><button type="button" class="reading-row" data-panel-font-prune><span class="reading-row-label">' + t('Remove unused fonts') + '</span></button></li></ul>' +
				'<p class="reading-footnote">' + t('A removed font downloads again when you pick it.') + '</p>' : '') +
			'</div>';
		
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
		var MEMBER_DIALS = Styles.memberDialsFor ? Styles.memberDialsFor(ro.id) : Styles.memberDials || ['size', 'weight', 'caps', 'tracking']; 
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
			list = list.filter(function (m) { return !gone('member:' + roleId + ':' + m.id); });
			if (list.length < 2) return ''; 
			return '<p class="reading-group-title">' + t('Members') + '</p>' +
				'<div class="reading-list reading-members">' +
				list.map(function (m) {
					var meta = memberMeta(roleId, m.id);
					var label = '<span class="reading-row-label">' + t(meta.label) + (m.lead ? ' <span class="reading-member-lead">' + t('Lead size') + '</span>' : '') + '<span class="reading-member-where">' + t(meta.where) + '</span></span>' +
						'<span class="reading-row-value">' + m.size + ' px</span>';
					return '<div class="reading-row reading-member' + (m.bound ? '' : ' is-free') + (m.lead ? ' is-lead' : '') + '">' +
						(m.lead ? '<span class="reading-member-open">' + label + '</span>' :
							'<button type="button" class="reading-member-open" data-panel-level="11" data-panel-member="' + m.id + '">' + label + icon('chevron-right', 'class="reading-row-check"') + '</button>') +
					'</div>';
				}).join('') +
				'</div>';
		}
		var mm = (Styles.members ? Styles.members(ro.id) : []).filter(function (x) { return x.id === member; })[0];
		var mmeta = memberMeta(ro.id, member);
		var level11 =
			'<div class="reading-sheet-top">' + head(t(mmeta.label), 3) + '</div>' +
			'<div class="reading-sheet-body">' +
			(mm ? MEMBER_DIALS.map(function (d) {
				var own = mm.own && mm.own[d] !== undefined;
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
			var nameRow = function () { return '<div class="reading-row reading-name-row"><span class="reading-row-label">' + t('Name') + '</span><input type="text" class="quire-input reading-name-field reading-button-name" data-panel-button-label maxlength="30" value="' + String(bt.label || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;') + '" placeholder="' + t('Optional: icon only without a name') + '" aria-label="' + t('Name') + '"></div>'; };
			var inMenu = auto && !!document.querySelector('.architrave-panel-opener[data-docked="menu"][data-match="true"]');
			var wordInMenu = inMenu && (!!String(bt.label || '').trim() || bt.icon === false || !!document.querySelector('.architrave-panel-opener[data-docked="menu"][data-folded]'));
			var map = auto ? '' :
				'<div class="reading-row reading-slider-row reading-spot-row">' +
					'<p class="reading-slider-title">' + t('Where') + '<span class="reading-group-value">' + t(BUTTON_WORD.place[bt.place] || '') + '</span></p>' +
					'<div class="reading-spot-map" role="radiogroup" aria-label="' + t('Where') + '">' +
						BUTTON_SPOTS.map(function (id) { var on = bt.place === id; return '<button type="button" class="reading-spot" role="radio" data-spot="' + id + '" aria-checked="' + on + '" aria-label="' + t(BUTTON_WORD.place[id]) + '" title="' + t(BUTTON_WORD.place[id]) + '" data-panel-pick-button="place:' + id + '"></button>'; }).join('') +
					'</div>' +
				'</div>';
			level13 =
				'<div class="reading-sheet-top">' + head(t('Button and Sharing'), 2) + '</div>' +
				'<div class="reading-sheet-body">' +
				'<p class="reading-group-title">' + t('Live Design button') + '</p>' +
				'<div class="reading-font-field"><div class="reading-list">' + bSwitch('auto', 'Automatic', auto) + map +
					(auto ? '' : bPick('size', 'Button size') + bPick('show', 'Show') + (bt.show !== 'icon' ? nameRow() : '') + bPick('corners', 'Corners') + bPick('color', 'Colour')) +
					(inMenu && wordInMenu ? '<div class="reading-row is-disabled"><span class="reading-row-label">' + t('Aurora') + '</span><button type="button" class="reading-toggle" role="switch" aria-checked="false" disabled aria-disabled="true" aria-label="' + t('Aurora') + '"></button></div>' : bSwitch('aurora', 'Aurora', bt.aurora)) + '</div>' +
					(inMenu ? '<p class="reading-footnote">' + t(wordInMenu ? 'With a name the button is a word in the menu, without the light. Empty, it is a square with its icon.' : 'Beside the menu the button is a square with its icon. A name turns it into a word, without the light.') + '</p>' : '') +
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
		function joined() { return '<div class="reading-list">' + Array.prototype.map.call(arguments, function (h) { return h.replace(/^<div class="reading-list">/, '').replace(/<\/div>$/, ''); }).join('') + '</div>'; }
		var level3 =
			'<div class="reading-sheet-top">' + head(t(ro.label), 8) + '</div>' +
			'<div class="reading-sheet-body">' +
			
			fontRow +
			joined(sizeBlock, weightRow) +
			joined((ro.id === 'read' ? slider(t('Line spacing'), LEADING, n.leading, 'data-panel-leading-range') : slider(t('Line spacing'), roleLeadList(ro.id, rv.leading), rv.leading, 'data-panel-role-leading-range')),
			slider(t('Character spacing'), TRACKING, rv.tracking, 'data-panel-tracking-range'),
			slider(t('Word spacing'), WORDSPACE, rv.words || 'default', 'data-panel-words-range')) +
			switchRows +
			(ro.id === 'read' ?
				
				'<p class="reading-group-title">' + t('Paragraph') + '</p>' +
				'<div class="reading-font-field"><div class="reading-list">' +
					'<div class="reading-row"><span class="reading-row-label">' + t('Justified text') + '</span><button type="button" class="reading-toggle" role="switch" aria-checked="' + n.justify + '" data-panel-option="justify" aria-label="' + t('Justified text') + '"></button></div>' +
					'<div class="reading-row"><span class="reading-row-label">' + t('Drop cap') + '</span><button type="button" class="reading-toggle" role="switch" aria-checked="' + n.dropcap + '" data-panel-option="dropcap" aria-label="' + t('Drop cap') + '"></button></div>' +
					(n.dropcap ? popupButton('caplines', t('Drop cap height'), t('{n} lines').replace('{n}', n.capLines)) : '') +
				'</div>' +
				(n.dropcap ? popupMenu('caplines', t('Drop cap height'), (Styles.capLines || []).map(function (id) { return { on: n.capLines === id, attr: 'data-panel-pick-caplines="' + id + '"', label: t('{n} lines').replace('{n}', id) }; })) : '') +
				'</div>'
			: '') +
			memberRows(ro.id) +
			'</div>';
		var colAll = Styles.colours ? Styles.colours(current.id) : { light: {}, dark: {}, derived: { light: [], dark: [] } };
		var colNow = colAll[n.resolvedSide] || {};
		var other = n.resolvedSide === 'dark' ? 'light' : 'dark', colDerived = (colAll.derived && colAll.derived[other]) || [], colFollows = (colAll.derived && colAll.derived[n.resolvedSide]) || [];
		var paperNow = colNow.paper || cssHex('--surface-base') || (Styles.paperOf ? Styles.paperOf(n.resolvedSide) : '#ffffff');
		var inkNow = colNow.ink || cssHex('--text-primary') || (n.resolvedSide === 'dark' ? '#ffffff' : '#000000');
		var ownAccent = colNow.accent || '';
		var groundNow = colNow.ground || cssHex('--surface-canvas') || paperNow, liftNow = colNow.lift || cssHex('--surface-subtle') || paperNow;
		var sidesLinked = Styles.linked ? Styles.linked() : true;
		
		function listId(key) { return Styles.listColour ? Styles.listColour(key) : ''; }
		function listNamed(key, hex) {
			var id = listId(key), list = Styles.swatchList ? Styles.swatchList(key) : [];
			var hit = id ? list.filter(function (x) { return x.id === id; })[0] : null;
			return hit ? t(hit.label) : '<span class="reading-hex">' + (hex || '').toUpperCase() + '</span>';
		}
		function presetGrid() {
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
			
			
			'<div class="reading-modes" data-linked="' + sidesLinked + '" role="radiogroup" aria-label="' + t('Appearance') + '">' +
				SIDES.filter(function (s) { return s.id !== 'auto'; }).map(function (s, i) {
					var on = s.id === n.resolvedSide;
					return '<div class="reading-mode-item"' + (on ? ' data-on="true"' : '') + '>' +
						'<button type="button" class="reading-tile reading-mode-tile" role="radio" aria-checked="' + on + '" data-panel-side="' + s.id + '" aria-label="' + t(s.label) + '">' +
							'<span class="reading-mode-shot ' + shotClass(current, s.id) + '" data-shot="' + s.id + '" aria-hidden="true"' + shotColours(current, s.id) + '>' +
								PIC_LINES +
							'</span>' +
						'</button>' +
					'</div>' +
					
					(i === 0 ? '<span class="reading-mode-link" aria-hidden="true"></span>' : '');
				}).join('') +
			'</div>' +
			'<div class="reading-mode-names" aria-hidden="true">' +
				SIDES.filter(function (s) { return s.id !== 'auto'; }).map(function (s, i) {
					return (i === 1 ? '<span class="reading-mode-gap"></span>' : '') +
						'<span class="reading-mode-name"' + (s.id === n.resolvedSide ? ' data-on="true"' : '') + '>' + t(s.label) + '</span>';
				}).join('') +
			'</div>' +
			'<div class="reading-list reading-link-row"><div class="reading-row"><span class="reading-row-label">' + t('Same colours for light and dark') + '</span><button type="button" class="reading-toggle" role="switch" aria-checked="' + sidesLinked + '" data-panel-link aria-label="' + t('Same colours for light and dark') + '"></button></div></div>' +
			
			
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
				nav(6, t('Ground'), (colNow.ground ? listNamed('ground', colNow.ground) : '') + '<span class="reading-well" style="--well:' + groundNow + '" aria-hidden="true"></span>', 'data-panel-colour-key="ground"') +
				nav(6, t('Card'), (colNow.lift ? listNamed('lift', colNow.lift) : '') + '<span class="reading-well" style="--well:' + liftNow + '" aria-hidden="true"></span>', 'data-panel-colour-key="lift"') +
			'</div>') +
			
			colourMore +
			'</div>';
		
		
		
		var colourHex = colourKey === 'ink' ? inkNow : colourKey === 'accent' ? (ownAccent || (n.resolvedSide === 'dark' ? '#ffffff' : '#000000')) : colourKey === 'button' || colourKey === 'head' || colourKey === 'kicker' ? (colNow[colourKey] || cssHex('--accent') || '#000000') : colourKey === 'ground' ? groundNow : colourKey === 'lift' ? liftNow : colourKey === 'marker' ? (colNow.marker || cssHex('--marker') || '#fff347') : paperNow;
		var colourName = colourKey === 'ink' ? t('Custom ink') : colourKey === 'accent' ? t('Custom accent') : colourKey === 'button' ? t('Button colour') : colourKey === 'head' ? t('Heading colour') : colourKey === 'kicker' ? t('Category line colour') : colourKey === 'ground' ? t('Ground') : colourKey === 'lift' ? t('Card') : colourKey === 'marker' ? t('Highlighter colour') : t('Custom paper');
		var colourBack = colourKey === 'head' || colourKey === 'kicker' ? 3 : 4; 
		var listSide = (n.style === 'host' && Styles.hostSide && Styles.hostSide()) || n.resolvedSide;
		var level6 =
			'<div class="reading-sheet-top">' + head(colourName, colourBack)  + '</div>' +
			'<div class="reading-sheet-body">' +
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
		if (notice && level === 1) level1 += '<div class="reading-notice" role="status"><span>' + notice.text + '</span>' + (notice.undo !== undefined ? '<button type="button" class="reading-notice-undo" data-panel-notice-undo>' + t('Undo') + '</button>' : '') + '</div>';
		if (level === 2) {
			searchPages = [{ level: 4, name: t('Colour'), html: level4 }, { level: 8, name: t('Type'), html: level8 }, { level: 14, name: t('Layout'), html: level14 }, { level: 15, name: t('Corners and lines'), html: level15 }, { level: 16, name: t('Pictures'), html: level16 }, { level: 17, name: t('Effects'), html: level17 }].concat(level13 ? [{ level: 13, name: t('Button and Sharing'), html: level13 }] : []);
			searchRoles = ROLE_META.filter(function (x) { return !gone('role:' + x.id); }).map(function (x) { return { id: x.id, label: t(x.label), members: (Styles.members ? Styles.members(x.id) : []).filter(function (m) { return !m.lead && !gone('member:' + x.id + ':' + m.id); }).map(function (m) { return { id: m.id, label: t(memberMeta(x.id, m.id).label) }; }) }; });
		}
		var typing = document.activeElement && document.activeElement.hasAttribute && document.activeElement.hasAttribute('data-panel-search') ? [document.activeElement.selectionStart, document.activeElement.selectionEnd] : null; 
		panel.innerHTML = level === 1 ? level1 : level === 3 ? level3 : level === 4 ? level4 : level === 6 ? level6 : level === 8 ? level8 : level === 10 ? level10 : level === 11 ? level11 : level === 13 && level13 ? level13 : level === 14 ? level14 : level === 15 ? level15 : level === 16 ? level16 : level === 17 ? level17 : level2;
		panel.querySelectorAll('[data-panel-option]').forEach(function (b) {
			if (!dead('option:' + b.getAttribute('data-panel-option'))) return;
			b.disabled = true; b.setAttribute('aria-disabled', 'true');
			var row = b.closest('.reading-row'); if (row) row.classList.add('is-disabled');
		});
		markChanged(n.resolvedSide); 
		if (level === 2) {
			runSearch();
			var sf = typing && panel.querySelector('[data-panel-search]');
			if (sf) { sf.focus({ preventScroll: true }); sf.setSelectionRange(typing[0], typing[1]); }
		}
		panel.classList.toggle('theme-neutral-dark', n.resolvedSide === 'dark');
		panel.classList.toggle('theme-neutral-light', n.resolvedSide !== 'dark');
		document.querySelectorAll('.architrave-panel-opener').forEach(function (o) {
			o.classList.toggle('theme-neutral-dark', n.resolvedSide === 'dark');
			o.classList.toggle('theme-neutral-light', n.resolvedSide !== 'dark');
		});
		
		panel.setAttribute('data-panel-side', n.resolvedSide === 'dark' ? 'dark' : 'light');
		document.querySelectorAll('.architrave-panel-opener').forEach(function (o) {
			o.setAttribute('data-panel-side', n.resolvedSide === 'dark' ? 'dark' : 'light');
		});
		['--accent', '--accent-contrast', '--accent-muted'].forEach(function (token) { panel.style.removeProperty(token); });
		if (active && panel.contains(active) && !key && active.classList.contains('reading-panel-title')) key = '.reading-panel-title';
		if (key) {
			var again = panel.querySelector(key);
			if (again && again.disabled) again = (again.parentElement && again.parentElement.querySelector('button:not([disabled])')) || panel.querySelector('.reading-panel-title');
			if (again) again.focus({ preventScroll: true });
		}
		panel.setAttribute('data-level', level);
		rememberPlace();
		if (level !== 10) faceQuery = ''; else if (faceQuery) filterFaces(faceQuery);
		var mmEl = panel.querySelector('.reading-more-menu');
		panel.style.minHeight = '';
		if (mmEl) {
			var mmR = mmEl.getBoundingClientRect(), pnR0 = panel.getBoundingClientRect();
			if (mmR.bottom > pnR0.bottom - 8) {
				panel.style.minHeight = Math.ceil(pnR0.height + (mmR.bottom - pnR0.bottom) + 12) + 'px';
				mmR = mmEl.getBoundingClientRect(); pnR0 = panel.getBoundingClientRect();
				var room = Math.floor(pnR0.bottom - mmR.top - 8);
				if (mmR.bottom > pnR0.bottom - 8 && room > 120) { mmEl.style.maxHeight = room + 'px'; mmEl.style.overflowY = 'auto'; }
			}
		}
		var tmEl = panel.querySelector('.reading-tile-menu');
		if (tmEl) {
			var tmR = tmEl.getBoundingClientRect(), pnR = panel.getBoundingClientRect();
			if (tmR.bottom > pnR.bottom - 8) tmEl.style.insetBlockStart = Math.max(8, Math.round(tmR.top - pnR.top - (tmR.bottom - pnR.bottom + 8))) + 'px';
			
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
		if (turned) { panel.setAttribute('data-turn', turnWay); panel.classList.remove('is-turning'); void panel.offsetWidth; panel.classList.add('is-turning'); }
		else panel.classList.remove('is-turning');
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
		var menu = panel.querySelector('.reading-font-menu');
		panel.removeAttribute('data-popup-spill');
		if (menu && !isPhone()) {
			var on = menu.querySelector('[aria-checked="true"]'), body = panel.querySelector('.reading-sheet-body');
			
			var hid = menu.style.display; menu.style.display = 'none';
			var levelFits = body.scrollHeight <= body.clientHeight + 1;
			menu.style.display = hid;
			var spill = menu.scrollHeight > body.clientHeight - 16 && levelFits;
			if (spill) panel.setAttribute('data-popup-spill', '');
			var row = menu.parentNode.querySelector('[data-panel-popup][aria-expanded="true"]');
			var rowTop = row ? row.getBoundingClientRect().top - menu.parentNode.getBoundingClientRect().top : 0;
			var shift = (on ? on.offsetTop : 0) - rowTop;
			menu.style.top = (-shift) + 'px';
			var mr = menu.getBoundingClientRect(), br = body.getBoundingClientRect(), pad = 8;
			if (spill) {
				var barEl = document.getElementById('wpadminbar');
				var barBottom = barEl ? barEl.getBoundingClientRect().bottom : 0;
				var doorEl = document.querySelector('.architrave-panel-opener');
				var doorTop = doorEl && doorEl.offsetParent !== null ? doorEl.getBoundingClientRect().top : window.innerHeight;
				br = { top: Math.max(0, barBottom), bottom: Math.min(window.innerHeight, doorTop) };
				pad = 16;
			}
			if (mr.top < br.top + pad) menu.style.top = (-shift + (br.top + pad - mr.top)) + 'px';
			else if (mr.bottom > br.bottom - pad) menu.style.top = (-shift - (mr.bottom - (br.bottom - pad))) + 'px';
			var first = menu.querySelector('[aria-checked="true"]') || menu.querySelector('button'); if (first) first.focus({ preventScroll: true });
		}
		if (scrim && !panel.hidden) scrim.hidden = !isPhone();
		anchor(); 
		sheet.drawn();
	}
	
	var sheet = (function () {
		var drag = null, moving = 0;
		function fullH() {
			var top = panel.querySelector('.reading-sheet-top'), body = panel.querySelector('.reading-sheet-body'), cs = getComputedStyle(panel);
			var natural = (top ? top.offsetHeight : 0) + (body ? body.scrollHeight : 0) + parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
			var max = parseFloat(cs.maxHeight);
			return Math.round(isFinite(max) ? Math.min(natural, max) : natural);
		}
		function halfH() {
			var h = window.innerHeight * 0.5, tile = panel.querySelector('.reading-sheet-body .reading-tile'), body = panel.querySelector('.reading-sheet-body');
			if (tile && body) {
				var need = tile.getBoundingClientRect().bottom - panel.getBoundingClientRect().top + body.scrollTop + parseFloat(getComputedStyle(panel).paddingBottom || 0) + 16;
				h = Math.max(h, Math.min(need, window.innerHeight * 0.8));
			}
			return Math.round(h);
		}
		function roomy() { return fullH() > halfH() + 40; } 
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
			open: function () {
				if (!isPhone()) { clear(); return; }
				clearTimeout(moving); panel.classList.remove('is-sheet-moving');
				mark('full'); panel.style.height = '';
				if (level === 1 && roomy()) { mark('half'); panel.style.height = halfH() + 'px'; }
			},
			drawn: function () {
				if (!panel || panel.hidden || drag) return;
				if (!isPhone()) { if (panel.hasAttribute('data-sheet')) clear(); return; }
				if (!panel.hasAttribute('data-sheet')) { this.open(); return; }
				if (level !== 1 && panel.getAttribute('data-sheet') === 'half') to('full');
			},
			clear: clear,
			down: function (e) {
				if (!isPhone() || panel.hidden || !panel.hasAttribute('data-sheet') || e.button !== 0) return;
				var body = panel.querySelector('.reading-sheet-body'); 
				if (!body || e.clientY >= body.getBoundingClientRect().top || (e.target.closest && e.target.closest('button, a, input, [role="menu"]'))) return;
				clearTimeout(moving); panel.classList.remove('is-sheet-moving');
				drag = { y: e.clientY, h: panel.offsetHeight, full: fullH(), ly: e.clientY, lt: e.timeStamp, v: 0 };
				panel.style.height = drag.h + 'px'; panel.setAttribute('data-sheet-drag', '');
				try { panel.setPointerCapture(e.pointerId); } catch (x) {  }
				e.preventDefault();
			},
			move: function (e) {
				if (!drag) return;
				var h = drag.h - (e.clientY - drag.y);
				if (h > drag.full) h = drag.full + (h - drag.full) * 0.2; 
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
	
	var rollTimer = null;
	function shutHeight() {
		var head = panel.querySelector('.reading-sheet-top') || panel.querySelector('.reading-panel-head');
		var box = window.getComputedStyle(panel);
		var pad = (parseFloat(box.paddingTop) || 0) + (parseFloat(box.paddingBottom) || 0);
		return Math.round((head ? head.offsetHeight : 0) + pad);
	}
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
		panel.style.removeProperty('box-shadow'); 
		rollTimer = setTimeout(function () {
			panel.style.height = ''; panel.classList.remove('is-rolling'); panel.__heightTo = 0; anchor();
		}, 300);
	}
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
	
	var morph = (function () {
		var layer = null, glow = null, live = false, shutting = false, timers = [], seen = null;
		function door() { return trigger && trigger.classList && trigger.classList.contains('architrave-panel-opener') ? trigger : null; }
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
			stopAll([layer]); layer.style.zIndex = z; layer.hidden = false; 
			return layer.children;
		}
		
		var at = { x: 0, y: 0 }, K = 0.5;
		function fit(b, p) {
			var pad = 80, l = Math.min(b.left, p.left) - pad, t = Math.min(b.top, p.top) - pad - 100, r = Math.max(b.right, p.right) + pad, btm = Math.max(b.bottom, p.bottom) + pad + 100;
			at.x = l; at.y = t;
			Object.assign(layer.style, { left: l + 'px', top: t + 'px', width: (r - l) * K + 'px', height: (btm - t) * K + 'px', transform: 'scale(' + 1 / K + ')' });
		}
		function px(v) { return v * K + 'px'; }
		var G = 4.4;
		function box(r) { return { left: px(r.left - at.x + G), top: px(r.top - at.y + G), width: px(r.width - 2 * G), height: px(r.height - 2 * G) }; }
		function frames(b, p, radius) {
			var d0 = b.height * 0.9, d1 = 170, rise = 92, cx = b.left + b.width / 2 - at.x, cy = b.top + b.height / 2 - at.y, dx = cx, dy = cy;
			b = { left: b.left - at.x, right: b.right - at.x, top: b.top - at.y, bottom: b.bottom - at.y };
			p = { left: p.left - at.x, right: p.right - at.x, top: p.top - at.y, bottom: p.bottom - at.y, width: p.width, height: p.height };
			if (p.bottom <= b.top + 1) dy = b.top - rise; else if (p.top >= b.bottom - 1) dy = b.bottom + rise; else if (p.right <= b.left + 1) dx = b.left - rise; else dx = b.right + rise;
			dx = Math.max(p.left + d1 / 2, Math.min(p.right - d1 / 2, dx)); 
			return {
				seed: { left: px(cx - d0 / 2), top: px(cy - d0 / 2), width: px(d0), height: px(d0), borderRadius: '50%' },
				drop: { left: px(dx - d1 / 2), top: px(dy - d1 / 2), width: px(d1), height: px(d1), borderRadius: '50%' },
				panel: { left: px(p.left + G), top: px(p.top + G), width: px(p.width - 2 * G), height: px(p.height - 2 * G), borderRadius: px(parseFloat(radius) || 0) }
			};
		}
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
		function under(d, cs) { var zd = parseInt(getComputedStyle(d).zIndex, 10), zp = parseInt(cs.zIndex, 10); return String(Math.min(isNaN(zd) ? 42 : zd, isNaN(zp) ? 50 : zp) - 1); }
		function free(d) { var w = d && d.querySelector('.opener-word'); if (w) { w.style.gridTemplateColumns = ''; void w.offsetWidth; w.style.transition = ''; } }
		function clear() { timers.forEach(clearTimeout); timers = []; }
		function stopAll(els) { els.forEach(function (el) { if (el) el.getAnimations().forEach(function (a) { if (!(window.CSSAnimation && a instanceof CSSAnimation)) a.cancel(); }); }); } 
		
		function lit(d) { return d.getAttribute('data-aurora') === 'true' && !(d.getAttribute('data-docked') === 'menu' && d.getAttribute('data-match') === 'true' && !(d.getAttribute('data-icon') === 'true' && d.getAttribute('data-named') === 'false' && !d.hasAttribute('data-folded'))); } 
		function lightOn(d) {
			if (!lit(d)) return;
			panel.classList.add('has-door-light');
			if (!glow) { glow = document.createElement('div'); glow.className = 'architrave-panel-glow'; glow.setAttribute('aria-hidden', 'true'); document.body.appendChild(glow); }
			glow.hidden = false; glow.style.zIndex = under(d, getComputedStyle(panel));
			var follow = function () { if (!glow || glow.hidden || panel.hidden) return; var r = panel.getBoundingClientRect(); glow.style.left = (r.left + 12) + 'px'; glow.style.width = Math.max(0, r.width - 24) + 'px'; glow.style.top = (r.bottom - 2) + 'px'; requestAnimationFrame(follow); };
			follow();
			glow.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 320, easing: 'ease-out' });
			panel.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 320, easing: 'ease-out', pseudoElement: '::after' });
			timers.push(setTimeout(function () {
				if (panel.hidden) return;
				var fade = [{ opacity: 1 }, { opacity: 0 }], o = { duration: 900, easing: 'ease-in-out', fill: 'forwards' };
				var gone = glow.animate(fade, o); panel.animate(fade, Object.assign({ pseudoElement: '::after' }, o));
				gone.finished.then(function () { if (!panel.hasAttribute('data-dragging')) { glow.hidden = true; stopAll([glow]); } panel.setAttribute('data-light-out', ''); }, function () {});
			}, 1500));
		}
		function lightNow() { return panel.classList.contains('has-door-light') ? (panel.hasAttribute('data-light-out') ? 0 : Number(getComputedStyle(panel, '::after').opacity)) : 1; }
		function mine(a) { return a.effect && a.effect.pseudoElement && !(window.CSSAnimation && a instanceof CSSAnimation) && !(window.CSSTransition && a instanceof CSSTransition); }
		function lightOff() { panel.classList.remove('has-door-light'); panel.removeAttribute('data-light-out'); panel.getAnimations({ subtree: true }).forEach(function (a) { if (mine(a)) a.cancel(); }); if (glow) { glow.hidden = true; stopAll([glow]); } }
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
					panel.style.opacity = ''; panel.style.boxShadow = 'none';
					var handed = function () {
						if (!live) return;
						panel.style.transition = 'box-shadow 220ms ease-out'; panel.style.boxShadow = '';
						var fade = layer ? layer.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, delay: 60, easing: 'ease-in', fill: 'forwards' }) : null; 
						timers.push(setTimeout(function () { if (layer) { layer.hidden = true; stopAll(Array.prototype.slice.call(layer.children)); if (fade) fade.cancel(); } panel.style.transition = ''; }, 300));
					};
					panel.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150, easing: 'ease-out' }).finished.then(handed, handed);
					lightOn(d);
				}, function () {});
			});
		}
		function unhide() { var d = seen; if (d) { d.style.visibility = ''; d.style.opacity = '0'; d.removeAttribute('data-in-panel'); } }
		function close(done) {
			var d = seen; clear(); shutting = true;
			if (!d || !live || !layer) { live = false; shutting = false; if (d) { d.style.visibility = ''; d.style.opacity = ''; d.removeAttribute('data-in-panel'); free(d); } lightOff(); done(); return; }
			var from = lightNow();
			if (from < 0.99 && lit(d)) d.style.setProperty('--lit', String(from));
			var w = d.querySelector('.opener-word');
			if (w) { w.style.transition = 'none'; w.style.gridTemplateColumns = ''; var rest = d.matches(':hover') ? '' : getComputedStyle(w).gridTemplateColumns; w.style.gridTemplateColumns = rest === '0px' ? '0fr' : rest ? '1fr' : ''; }
			var b = d.getBoundingClientRect(), p = panel.getBoundingClientRect(), cs = getComputedStyle(panel);
			var kids = make(cs.backgroundColor, under(d, cs)); fit(b, p);
			var f = frames(b, p, cs.borderTopLeftRadius);
			Object.assign(kids[0].style, box(b), { borderRadius: px(parseFloat(getComputedStyle(d).borderTopLeftRadius) || 0) });
			Object.assign(kids[1].style, f.panel);
			stopAll([panel]); lightOff(); panel.style.transition = 'none'; panel.style.boxShadow = 'none'; 
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
		function drop() { clear(); panel.style.transition = ''; panel.style.boxShadow = ''; if (layer) { stopAll(Array.prototype.slice.call(layer.children)); layer.hidden = true; } if (seen) { stopAll([seen]); seen.style.visibility = ''; seen.style.opacity = ''; seen.removeAttribute('data-in-panel'); free(seen); } live = false; shutting = false; }
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
	
	var PLACE_KEY = 'architrave-panel-place';
	function rememberPlace() { try { sessionStorage.setItem(PLACE_KEY, JSON.stringify({ level: level, role: role, member: member, colourKey: colourKey })); } catch (e) {  } }
	function lastPlace() { try { return JSON.parse(sessionStorage.getItem(PLACE_KEY) || 'null'); } catch (e) { return null; } }
	function open(btn) {
		trigger = btn;
		panel.toggleAttribute('data-door-aurora', !!(btn && btn.getAttribute && btn.getAttribute('data-aurora') === 'true')); 
		level = 1;
		var was = !(Styles.reader && Styles.reader()) && lastPlace();
		if (was && (was.level === 12 || was.level === 5)) was.level = 1; 
		if (was && was.level === 9) was.level = 2; 
		if (was && typeof was.level === 'number' && was.level > 1) { level = was.level; role = was.role || role; member = was.member || member; colourKey = was.colourKey || colourKey; }
		if (wanted) { level = wanted; wanted = 0; } 
		
		anchor();
		panel.setAttribute('role', 'dialog');
		panel.setAttribute('aria-modal', isPhone() ? 'true' : 'false');
		morph.drop();
		var flows = morph.can();
		if (flows) { panel.style.transition = 'none'; panel.style.opacity = '0'; }
		panel.hidden = false;
		panel.classList.remove('is-opening'); void panel.offsetWidth; panel.classList.add('is-opening');
		panel.addEventListener('animationend', function done(e) {
			if (e.target !== panel) return;
			panel.classList.remove('is-opening'); panel.removeEventListener('animationend', done);
		}); 
		render();
		if (flows) morph.open(); else rollOpen();
		sheet.open();
		scrim.hidden = !isPhone(); 
		document.querySelectorAll('[data-reading-panel-open]').forEach(function (b) { b.setAttribute('aria-expanded', b === btn ? 'true' : 'false'); });
		var first = panel.querySelector('button:not([disabled])');
		if (first) first.focus({ preventScroll: true });
	}
	function anchor() {
		if (!panel || isPhone() || !trigger) return;
		var r = trigger.getBoundingClientRect();
		var stack = trigger.closest('.paper-stack');
		if (stack && stack.classList.contains('paper-corner-foot')) {
			
			
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
			var sr = stack.getBoundingClientRect(), topR = Math.round(sr.bottom + 8);
			panel.classList.remove('is-above');
			panel.style.setProperty('--panel-anchor-max', Math.round(window.innerHeight - topR - 16) + 'px');
			panel.style.setProperty('--panel-anchor-top', topR + 'px');
			panel.style.setProperty('--panel-anchor-right', Math.round(window.innerWidth - r.right) + 'px');
			panel.style.transformOrigin = 'right top';
			return;
		}
		if (stack) {
			
			var body = panel.querySelector('.reading-sheet-body');
			var s = stack.getBoundingClientRect(), room = Math.round(s.bottom - s.top);
			panel.style.setProperty('--panel-anchor-max', room + 'px');
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
			var w = panel.offsetWidth || 360, cx = r.left + r.width / 2;
			var lid0 = document.getElementById('wpadminbar'), sky0 = Math.max(16, lid0 ? lid0.getBoundingClientRect().bottom + 8 : 0);
			var rows0 = panel.querySelector('.reading-sheet-body');
			var need0 = Math.min(380, panel.offsetHeight + (rows0 ? rows0.scrollHeight - rows0.clientHeight : 0) || 380);
			var roomUp = r.top - 8 - sky0, roomDown = window.innerHeight - r.bottom - 8 - 16;
			var wantsDown = trigger.getAttribute('data-docked') === 'menu' || /^top-/.test(trigger.getAttribute('data-place') || '');
			var down = wantsDown ? (roomDown >= need0 || roomDown >= roomUp) : !(roomUp >= need0 || roomUp >= roomDown);
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
			panel.style.setProperty('--panel-anchor-bottom', Math.round(window.innerHeight - r.top + 8) + 'px');
			var lid = document.getElementById('wpadminbar');
			var sky = Math.max(16, lid ? lid.getBoundingClientRect().bottom + 8 : 0);
			panel.style.setProperty('--panel-anchor-max', Math.max(120, Math.round(r.top - 8 - sky)) + 'px');
			panel.style.setProperty('--panel-anchor-right', Math.max(8, Math.min(window.innerWidth - w - 8, Math.round(window.innerWidth - cx - w / 2))) + 'px');
			panel.style.transformOrigin = 'center bottom';
			return;
		}
		panel.style.transformOrigin = '';
		var above = r.top > window.innerHeight / 2;
		panel.classList.toggle('is-above', above);
		panel.style.setProperty('--panel-anchor-top', Math.round(r.bottom + 8) + 'px');
		panel.style.setProperty('--panel-anchor-bottom', Math.round(window.innerHeight - r.top + 8) + 'px'); 
		panel.style.setProperty('--panel-anchor-right', Math.max(8, Math.round(window.innerWidth - r.right)) + 'px');
	}
	window.addEventListener('resize', function () { if (panel && !panel.hidden) anchor(); });
	window.addEventListener('architrave-panel-anchor', function () { if (panel && !panel.hidden) anchor(); }); 
	window.addEventListener('scroll', function () { if (panel && !panel.hidden) anchor(); }, { passive: true });
	function close() {
		if (!panel || panel.hidden || morph.shutting()) return;
		rememberPlace();
		popup = false;
		scrim.hidden = true;
		document.querySelectorAll('[data-reading-panel-open]').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
		var flowing = morph.live();
		if (flowing) morph.unhide(); 
		if (trigger) trigger.focus({ preventScroll: true });
		if (flowing) morph.close(function () { panel.hidden = true; });
		else rollShut(function () { panel.hidden = true; sheet.clear(); });
	}
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
		panel.setAttribute('aria-labelledby', 'reading-panel-title'); 
		panel.hidden = true;
		(function () {
			var drag = null, at = { x: 0, y: 0 };
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
			function inHandle(e) {
				if (!window.matchMedia('(min-width: 1010px)').matches) return false;
				var head = panel.querySelector('.reading-panel-head'); if (!head) return false;
				if (e.target.closest && e.target.closest('button, a, input, [role="menu"]')) return false;
				if (zone(e)) return false; 
				return e.clientY <= head.getBoundingClientRect().bottom;
			}
			panel.addEventListener('pointermove', function (e) { var z = resize ? resize.z : zone(e); if (z) panel.setAttribute('data-resize-zone', z); else panel.removeAttribute('data-resize-zone'); });
			panel.addEventListener('pointerleave', function () { if (!resize) panel.removeAttribute('data-resize-zone'); });
			panel.addEventListener('pointerdown', function (e) {
				var z = zone(e); if (!z || e.button !== 0 || drag) return;
				resize = { z: z, y: e.clientY, h: panel.offsetHeight };
				panel.setAttribute('data-resizing', '');
				try { panel.setPointerCapture(e.pointerId); } catch (x) {  }
				e.preventDefault(); e.stopImmediatePropagation();
			});
			panel.addEventListener('pointermove', function (e) {
				if (!resize) return;
				var h = resize.h + (resize.z === 'top' ? resize.y - e.clientY : e.clientY - resize.y);
				resize.want = Math.max(MIN_H, Math.round(h)); cap(resize.want);
			});
			var resized = function () {
				if (!resize) return;
				if (resize.want) { kept = resize.want; try { localStorage.setItem(HKEY, String(kept)); } catch (x) {  } }
				resize = null; panel.removeAttribute('data-resizing');
			};
			panel.addEventListener('pointerup', resized);
			panel.addEventListener('pointercancel', resized);
			panel.addEventListener('pointermove', function (e) { var on = !!drag || inHandle(e); if (on !== panel.hasAttribute('data-grab')) { if (on) panel.setAttribute('data-grab', ''); else panel.removeAttribute('data-grab'); } });
			panel.addEventListener('pointerleave', function () { if (!drag) panel.removeAttribute('data-grab'); });
			
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
				var was = panel.style.getPropertyValue('--panel-user-max'); cap(kept); drag.full = panel.offsetHeight; if (was) panel.style.setProperty('--panel-user-max', was); else cap(0);
				drag.startTop = box.top; drag.base = above() ? box.bottom - at.y : box.top - at.y;
				panel.setAttribute('data-dragging', ''); morph.carried(true);
				try { panel.setPointerCapture(e.pointerId); } catch (x) {  }
				e.preventDefault();
			});
			panel.addEventListener('pointermove', function (e) {
				if (!drag) return;
				var nx = drag.ox + e.clientX - drag.x, ny = drag.oy + e.clientY - drag.y, edge = 8;
				if (drag.pill && above()) ny = Math.max(ny, drag.oy + Math.min(0, roofY() - drag.startTop));
				if (drag.pill) { at.x = nx; at.y = ny; pill().moveBy(nx, ny); return; } 
				nx = Math.max(edge - drag.left, Math.min(window.innerWidth - edge - drag.w - drag.left, nx));
				var foot = window.innerHeight - edge, top = Math.max(roofY(), Math.min(foot - Math.min(MIN_H, drag.full), drag.startTop + e.clientY - drag.y));
				var h = Math.max(Math.min(MIN_H, drag.full), Math.min(drag.full, foot - top));
				cap(h < drag.full ? h : kept);
				ny = above() ? top + h - drag.base : top - drag.base;
				at.x = Math.round(nx); at.y = Math.round(ny); put();
			});
			function keepInReach() {
				if (drag || panel.hidden || pill() || !(at.x || at.y)) return; 
				var box = panel.getBoundingClientRect(), edge = 8, bar = document.getElementById('wpadminbar'), roof = edge + (bar ? Math.max(0, bar.getBoundingClientRect().bottom) : 0), y = at.y;
				if (box.bottom > window.innerHeight - edge) y -= box.bottom - (window.innerHeight - edge);
				if (box.top + (y - at.y) < roof) y += roof - (box.top + (y - at.y));
				var x = at.x; if (box.left < edge) x += edge - box.left; else if (box.right > window.innerWidth - edge) x -= box.right - (window.innerWidth - edge);
				if (y !== at.y || x !== at.x) { at.y = Math.round(y); at.x = Math.round(x); put(); }
			}
			if (window.ResizeObserver) new ResizeObserver(keepInReach).observe(panel);
			window.addEventListener('architrave-button-settings', function (e) {
				if (drag || !e.detail || e.detail.picked !== 'place') return; 
				at.x = 0; at.y = 0; put();
				requestAnimationFrame(function () { anchor(); keepInReach(); });
			});
			var end = function () { if (!drag) return; var was = drag.pill; drag = null; panel.removeAttribute('data-dragging'); morph.carried(false); if (was && pill()) pill().done(); };
			panel.addEventListener('pointerup', end);
			panel.addEventListener('pointercancel', end);
			panel.addEventListener('dblclick', function (e) { if (!inHandle(e)) return; kept = 0; cap(0); try { localStorage.removeItem(HKEY); } catch (x) {  } at.x = 0; at.y = 0; if (pill()) pill().rest(); else put(); });
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
		panel.addEventListener('scroll', function () {
			if (getComputedStyle(panel).overflowY !== 'hidden') return; 
			if (panel.scrollTop) panel.scrollTop = 0;
			if (panel.scrollLeft) panel.scrollLeft = 0;
		});
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
			if (panel && !panel.hidden) { anchor(); render(); }
		});
		document.addEventListener('click', function (e) {
			if (pressing) return;
			var opener = e.target.closest('[data-reading-panel-open]');
			if (opener) {
				e.preventDefault();
				if (panel.hidden && window.LiveDesignWindow && window.LiveDesignWindow.takes && window.LiveDesignWindow.takes(opener)) return;
				if (panel.hidden || morph.shutting() || trigger !== opener) open(opener); else close();
				return;
			} 
			if (panel.hidden) return;
			
			if (!panel.contains(e.target)) { if (popup && e.isTrusted) { popup = false; render(); return; } if (e.isTrusted) close(); return; }
			
			if (popup && !e.target.closest('.reading-font-menu, [data-panel-popup]')) {
				popup = null;
				if (!e.target.closest('button')) { render(); return; }
			}
			
			if ((moreOpen || asking) && !e.target.closest('.reading-more-menu, [data-panel-more]')) {
				moreOpen = false; asking = null;
				if (!e.target.closest('button')) { render(); return; }
			}
			if (tileMenu && !e.target.closest('.reading-tile-menu, [data-panel-tile-more]')) {
				tileMenu = null;
				if (!e.target.closest('button')) { render(); return; }
			}
			var b = e.target.closest('button');
			if (!b) { var rowEl = e.target.closest('div.reading-row'); var tg = rowEl && rowEl.querySelector('.reading-toggle'); if (tg && !tg.disabled) { tg.click(); } return; }
			if (b.getAttribute('aria-disabled') === 'true') return;
			if (b.hasAttribute('data-panel-close')) { close(); return; }
			var n = now();
			if (b.hasAttribute('data-panel-popup')) {
				var kind = b.getAttribute('data-panel-popup'); popup = popup === kind ? null : kind;
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
					if (colourKey === 'accent' && Styles.colours && !(Styles.colours()[n.resolvedSide] || {}).accent) {
						poured('accent', n.resolvedSide, n.resolvedSide === 'dark' ? '#ffffff' : '#000000');
					}
					if ((colourKey === 'ground' || colourKey === 'lift') && Styles.colours && !(Styles.colours()[n.resolvedSide] || {})[colourKey]) {
						var gl = cssHex(colourKey === 'ground' ? '--surface-canvas' : '--surface-subtle'); if (gl) poured(colourKey, n.resolvedSide, gl);
					}
				}
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
				if (Styles.setLinked) Styles.setLinked(b.getAttribute('aria-checked') !== 'true' && b.getAttribute('aria-pressed') !== 'true', n.resolvedSide); 
			} else if (b.hasAttribute('data-panel-role-weight')) {
				Styles.setRole(role, 'weight', b.getAttribute('data-panel-role-weight'));
			} else if (b.hasAttribute('data-panel-role-size')) {
				var ss = Styles.sizesFor(role), si = ss.indexOf(Styles.role(role).size) + (b.getAttribute('data-panel-role-size') === 'up' ? 1 : -1);
				if (ss[si]) Styles.setRole(role, 'size', ss[si]);
				stepped(); 
			} else if (b.hasAttribute('data-panel-role-italic')) {
				Styles.setRole(role, 'italic', !Styles.role(role).italic);
			} else if (b.hasAttribute('data-panel-role-caps')) {
				Styles.setRole(role, 'caps', !Styles.role(role).caps);
			} else if (b.hasAttribute('data-panel-member-bind')) {
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
				var goOwn = b.getAttribute('data-panel-custom') === 'on';
				if (Styles.setCustom) Styles.setCustom(goOwn, goOwn ? { paper: cssHex('--surface-base'), ink: cssHex('--text-primary'), accent: cssHex('--accent') } : null);
			} else if (b.hasAttribute('data-panel-list-colour')) {
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
				if (Styles.setPreset && Styles.preset && Styles.preset()) Styles.setPreset('');
				press(PALETTE + '[data-palette="' + pairId + '"]');
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
				var bval = bset.length > 1 ? bset[1] : b.getAttribute('aria-checked') !== 'true'; 
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
				try { if (folded(fg)) localStorage.removeItem(foldKey(fg)); else localStorage.setItem(foldKey(fg), '1'); } catch (x) {  }
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
				saving = true; pasting = false; 
			} else if (b.hasAttribute('data-panel-copy')) {
				moreOpen = false;
				var shareText = Styles.exportStyle ? Styles.exportStyle() : '';
				if (shareText && navigator.clipboard) navigator.clipboard.writeText(shareText).then(function () {
					copied = true; linkCopied = false; render();
					clearTimeout(panel.__copiedTimer);
					panel.__copiedTimer = setTimeout(function () { copied = false; render(); }, 1200);
				}).catch(function () {  });
			} else if (b.hasAttribute('data-panel-copy-link')) {
				moreOpen = false;
				var link = Styles.shareLink ? Styles.shareLink(true) : ''; 
				if (link && navigator.clipboard) navigator.clipboard.writeText(link).then(function () {
					linkCopied = true; copied = false; render();
					clearTimeout(panel.__linkCopiedTimer);
					panel.__linkCopiedTimer = setTimeout(function () { linkCopied = false; render(); }, 1200);
				}).catch(function () {  });
			} else if (b.hasAttribute('data-panel-paste')) {
				pasting = !pasting; moreOpen = false; if (pasting) saving = false; 
			} else if (b.hasAttribute('data-panel-paste-cancel')) {
				pasting = false;
			} else if (b.hasAttribute('data-panel-paste-go')) {
				var pasteField = panel.querySelector('[data-panel-paste-text]');
				var pasted = pasteField ? pasteField.value.trim() : '';
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
				if (saveForReaders && Styles.canPublish && Styles.canPublish()) {
					saveForReaders = false; saving = false;
					Styles.publish(nameField ? nameField.value : '').then(function () { publishFailed = false; level = 1; render(); }, refused);
				} else {
					if (Styles.saveAs) Styles.saveAs(nameField ? nameField.value : '');
					saving = false; saveForReaders = false; level = 1;
				}
			} else if (b.hasAttribute('data-panel-eyedrop')) {
				var keyE = b.getAttribute('data-panel-eyedrop'), sideE = b.getAttribute('data-panel-colour-side');
				try { new window.EyeDropper().open().then(function (res) { if (res && res.sRGBHex) { poured(keyE, sideE, res.sRGBHex.toLowerCase()); render(); } }).catch(function () {  }); } catch (e) {  }
				return; 
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
				if (cuId !== now().style) press('[data-architrave-presets] [data-preset="' + cuId + '"]'); 
				level = 2; popup = false;
			} else if (b.hasAttribute('data-panel-tile-duplicate')) {
				tileMenu = null;
				var dupOf = b.getAttribute('data-panel-tile-duplicate');
				var mineNow = Array.prototype.map.call(panel.querySelectorAll('[data-tile-group="mine"] .reading-tile'), function (x) { return x.getAttribute('data-panel-style'); });
				var dupId = Styles.duplicate ? Styles.duplicate(dupOf) : null;
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
			setTimeout(function () { render(); }, 0);
		});
		
		document.addEventListener('contextmenu', function (e) {
			var tile = e.target && e.target.closest && e.target.closest('.reading-panel .reading-tile');
			if (touchHold || (tile && e.pointerType === 'touch')) { e.preventDefault(); return; } 
			if (tileMenu && !tile) { tileMenu = null; render(); } 
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
		var tileDrag = null;
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
			var got = d.cell.getBoundingClientRect(); 
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
				cell.style.left = r.left + 'px'; cell.style.top = r.top + 'px';
				var r0 = cell.getBoundingClientRect(); d.fx = r0.left + (r0.width - cell.offsetWidth) / 2 - r.left; d.fy = r0.top + (r0.height - cell.offsetHeight) / 2 - r.top;
				panel.classList.add('is-tile-dragging');
				
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
				var pr2 = panel.getBoundingClientRect(); 
				if (above) panel.style.insetBlockEnd = (window.innerHeight - pr.bottom + (pr2.bottom - pr.bottom)) + 'px';
				else panel.style.insetBlockStart = (pr.top - (pr2.top - pr.top)) + 'px';
			}
			d.cx = cx; d.cy = cy;
			placeCarried(d);
			if (!d.frame) { var loop = function () { if (tileDrag !== d || !d.on) { d.frame = 0; return; } placeCarried(d); d.frame = requestAnimationFrame(loop); }; d.frame = requestAnimationFrame(loop); } 
			var want = placeUnder(d, cx, cy);
			if (!want) { clearTimeout(d.wait); d.want = null; return; }
			if (d.want && d.want.group === want.group && d.want.ref === want.ref) return;
			d.want = want; clearTimeout(d.wait);
			d.wait = setTimeout(function () {
				if (tileDrag !== d || d.want !== want) return;
				slide(function () { want.group.insertBefore(d.ghost, want.ref); }); placeCarried(d);
			}, 120);
		}
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
				if (last) { var lr = last.getBoundingClientRect(); if (cy < lr.top) return null; } 
				return { group: group, ref: null };
			}
			return null;
		}
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
			e.preventDefault(); 
			if (!tileDrag) tileDrag = { tile: touchHold.tile, id: touchHold.id, x: touchHold.x, y: touchHold.y, on: false, drop: null };
			dragMove(t1.clientX, t1.clientY);
		}, { passive: false });
		document.addEventListener('touchend', function (e) {
			if (!touchHold) return;
			var h = touchHold; touchHold = null; clearTimeout(h.timer); h.tile.classList.remove('is-lifted');
			if (!h.armed) return;
			e.preventDefault(); 
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
			var near = e && typeof e.clientX === 'number' && Math.abs(e.clientX - d.x) < 12 && Math.abs(e.clientY - d.y) < 12;
			var stop = function (ev) { ev.stopPropagation(); ev.preventDefault(); document.removeEventListener('click', stop, true); };
			document.addEventListener('click', stop, true);
			setTimeout(function () { document.removeEventListener('click', stop, true); if (near && d.tile.isConnected) d.tile.click(); }, 0); 
			var landed = d.ghost.parentNode && d.ghost.parentNode.closest('[data-tile-group]');
			var group = landed ? landed.getAttribute('data-tile-group') : null;
			var was = Styles.visibleOrder(), order;
			var listed = landed ? Array.prototype.map.call(landed.children, function (el) { return el === d.ghost ? d.id : (el === d.cell ? null : idOfCell(el)); }).filter(Boolean) : [];
			if (group === 'seen') order = listed;
			else { order = was.filter(function (x) { return x !== d.id; }); if (group === 'mine') Styles.setHiddenOrder(listed); } 
			var host = (Styles.list.filter(function (y) { return y.host; })[0] || {}).id;
			if (host) { var hasDef = !!(Styles.siteDefault && Styles.siteDefault()); order = order.filter(function (x) { return x !== host; }); order.splice(hasDef && order.length ? 1 : 0, 0, host); }
			if (d.frame) cancelAnimationFrame(d.frame);
			clearTimeout(d.wait);
			var finish = function () {
				d.ghost.remove(); d.cell.classList.remove('is-carried', 'is-landing'); ['left', 'top', 'inlineSize', 'blockSize', 'transition', 'scale'].forEach(function (k) { d.cell.style[k] = ''; });
				Array.prototype.forEach.call(panel.querySelectorAll('[data-tile-group]'), function (grp) { grp.style.minBlockSize = ''; });
				panel.classList.remove('is-tile-dragging');
				panel.style.transition = ''; panel.style.insetBlockStart = ''; panel.style.insetBlockEnd = ''; 
				if (!order.length || order.join() === was.join()) { render(); return; } 
				newOrder(order);
			};
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
		document.addEventListener('paste', function (e) {
			var fld = e.target;
			if (!fld || !fld.hasAttribute || !fld.hasAttribute('data-panel-paste-text')) return;
			setTimeout(function () { var go = panel && panel.querySelector('[data-panel-paste-go]'); if (go && fld.value.trim()) go.click(); }, 0);
		});
		document.addEventListener('change', function (e) {
			var r = e.target;
			if (!r || !r.hasAttribute || !r.hasAttribute('data-panel-button-label') || !Styles.setButton) return;
			var wasNamed = !!String((Styles.button() || {}).label || '').trim(), named = !!r.value.trim();
			Styles.setButton('label', r.value.trim().slice(0, 30)).then(function () { publishFailed = false; if (wasNamed !== named) render();  }, refused);
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
			if (r.hasAttribute('data-panel-size-range') && Styles.members) {
				var ms2 = Styles.members(role);
				panel.querySelectorAll('.reading-member').forEach(function (row, mi) { var mv = row.querySelector('.reading-row-value'); if (mv && ms2[mi]) mv.textContent = ms2[mi].size + ' px'; });
			}
			var row = r.closest('.reading-slider-row'), value = row && row.querySelector('.reading-group-value');
			if (value) value.textContent = word;
			if (!dragging) setTimeout(function () { render(); }, 0);
		});
		document.addEventListener('pointerdown', function (e) {
			if (e.target && e.target.classList && e.target.classList.contains('reading-range')) dragging = true;
		});
		document.addEventListener('pointerdown', function () { inputMode = 'pointer'; if (panel) panel.setAttribute('data-input', 'pointer'); }, true);
		document.addEventListener('keydown', function (e) {
			if (e.key === 'Tab' || e.key === 'Enter' || e.key === ' ' || e.key === 'Escape' || e.key.indexOf('Arrow') === 0) { inputMode = 'keyboard'; if (panel) panel.setAttribute('data-input', 'keyboard'); }
			if (e.key === 'Enter' && e.target && e.target.hasAttribute && e.target.hasAttribute('data-panel-hex')) { e.preventDefault(); e.target.blur(); }
			if (e.target && e.target.hasAttribute && e.target.hasAttribute('data-panel-search')) {
				if (e.key === 'Enter') { e.preventDefault(); var first = panel && panel.querySelector('.reading-search-hit'); if (first) first.click(); }
				else if (e.key === 'Escape' && e.target.value) { e.preventDefault(); e.stopPropagation(); e.target.value = ''; searchQuery = ''; runSearch(); }
			}
			if (e.key === 'Enter' && e.target && e.target.hasAttribute && e.target.hasAttribute('data-panel-tile-name')) { e.preventDefault(); var goR = panel && panel.querySelector('[data-panel-tile-rename-go]'); if (goR) goR.click(); }
			if (e.key === 'Enter' && e.target && e.target.hasAttribute && e.target.hasAttribute('data-panel-name')) { e.preventDefault(); var go = panel && panel.querySelector('[data-panel-save-go]'); if (go) go.click(); }
			if (e.key === 'Enter' && e.target && e.target.hasAttribute && e.target.hasAttribute('data-panel-publish-name')) { e.preventDefault(); var goP = panel && panel.querySelector('[data-panel-publish-go]'); if (goP) goP.click(); }
		}, true);
		function released() {
			if (!dragging) return;
			dragging = false;
			if (pendingRender) { pendingRender = false; render(); }
		}
		document.addEventListener('change', function (e) {
			var r = e.target;
			if (r && r.hasAttribute && (r.hasAttribute('data-panel-hsl') || r.hasAttribute('data-panel-hex'))) { setTimeout(settleColour, 0); return; }
			if (!r || !r.classList || !r.classList.contains('reading-range')) return;
			var stop = Math.round(+r.value); r.value = stop; r.style.setProperty('--fill', Math.round(100 * stop / r.max) + '%');
		});
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
		window.addEventListener('blur', released); 
		document.addEventListener('lostpointercapture', released, true);
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
			try { h.setPointerCapture(e.pointerId); } catch (err) {  }
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
		document.addEventListener('keydown', function (e) {
			if (!e.altKey || e.metaKey || e.ctrlKey || e.shiftKey || e.code !== 'KeyD') return;
			if (e.target && e.target.closest && e.target.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"]')) return;
			e.preventDefault();
			if (panel && !panel.hidden) { close(); return; }
			var door = Array.prototype.filter.call(document.querySelectorAll('[data-reading-panel-open]'), function (b) { return b.getClientRects().length && getComputedStyle(b).visibility !== 'hidden'; })[0];
			if (!door) door = document.querySelector('.architrave-panel-opener[data-folded]');
			if (door) door.click();
		});
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
			if ((e.metaKey || e.ctrlKey) && !e.shiftKey && (e.key === 'z' || e.key === 'Z') && panel && !panel.hidden && !(e.target && e.target.closest && e.target.closest('input, textarea')) && Styles.canUndo && Styles.canUndo()) { e.preventDefault(); Styles.undo(); return; }
			if (e.key === 'Escape' && panel && !panel.hidden && !document.querySelector('.rail-more-trigger[aria-expanded="true"], .rail-more-sub:not([hidden])')) { e.preventDefault(); if (tileMenu) { var tmId = tileMenu.id; tileMenu = null; render(); var tb = panel.querySelector('[data-panel-style="' + tmId + '"]'); if (tb) tb.focus({ preventScroll: true }); } else if (moreOpen || asking || saving || pasting) { moreOpen = false; asking = null; saving = false; pasting = false; saveForReaders = false; render(); var mb = panel.querySelector('[data-panel-more]'); if (mb) mb.focus({ preventScroll: true }); } else if (popup) { var kindWas = popup; popup = null; render(); var row = panel.querySelector('[data-panel-popup="' + kindWas + '"]'); if (row) row.focus({ preventScroll: true }); } else close(); }
			
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
