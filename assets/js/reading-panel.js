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
	var linkCopied = false; 
	var inputMode = 'pointer'; 
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
			reading: root.getAttribute(Reading.attribute) || 'default'
		};
	}
	
	var panel, scrim, level = 1, trigger = null, dotsTimer = null;
	
	function faceAttr(f) { return String(f).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }
	function lumOf(hex) {
		var c = String(hex || '').replace('#', '');
		if (c.length !== 6) return 0.5;
		var v = [0, 2, 4].map(function (i) { var x = parseInt(c.substr(i, 2), 16) / 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); });
		return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
	}
	function anyLum(c0) {
		var m = String(c0 || '').match(/rgba?\(([\d.\s,]+)/);
		if (!m) return lumOf(c0);
		var v = m[1].split(',').map(Number);
		return v.length >= 3 ? (0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]) / 255 : 0.5;
	}
	function tileColours(s, side) {
		var c = Styles.colours ? Styles.colours(s.id)[side] : null;
		if (!c || !c.paper || !c.ink) return '';
		var acc = c.accent;
		if (acc && Math.abs(anyLum(acc) - anyLum(c.paper)) < 0.08) acc = c.ink;
		if (!acc && (s.host || s.bare)) acc = c.ink; 
		return ' style="' + (s.hostFace ? 'font-family:' + faceAttr(s.hostFace) + ';' : '') + '--surface-base:' + c.paper + ';--text-primary:' + c.ink + ';--text-secondary:color-mix(in oklab, ' + c.ink + ', ' + c.paper + ' 40%);--border-default:color-mix(in oklab, ' + c.paper + ', ' + c.ink + ' 16%)' + (acc ? ';--accent:' + acc : '') + '"';
	}
	
	function tileClass(s) {
		var applied = root.getAttribute('data-theme') || (Modes ? Modes.default : 'neutral-light');
		var m = ((Modes && Modes.modes) || []).filter(function (x) { return x.id === applied; })[0];
		var side = (m && m.side) || 'light';
		var pal = (Styles.wanted ? Styles.wanted(s.id).palette : null) || s.palette; 
		var mode = Modes && Modes.resolve ? Modes.resolve(pal, side) : pal + '-' + side;
		return 'theme-' + mode;
	}
	
	function head(title) {
		var close = '<button type="button" class="reading-back" data-panel-close aria-label="' + t('Close') + '">' + icon('close') + '</button>';
		return '<div class="reading-panel-head">' +
			'<span></span>' +
			'<p class="reading-panel-title" id="reading-panel-title" tabindex="-1">' + title + '</p>' +
			(isPhone() ? close : '<span></span>') +
		'</div>';
	}
	function render() {
		if (!panel || panel.hidden) return; 
		var n = now();
		var ids = Reading.ids, at = ids.indexOf(n.reading);
		var shown = Styles.shown();
		var isReader = !!(Styles.reader && Styles.reader());
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
		var html = '<div class="reading-sheet-top">' + head(t('Live Design')) + '</div><div class="reading-sheet-body">' +
			'<div class="reading-stepper reading-tall" role="group" aria-label="' + t('Reading size') + '">' +
				'<button type="button" data-panel-size="down" aria-label="' + t('Smaller') + '"' + (at <= 0 ? ' aria-disabled="true"' : '') + '>A</button>' +
				'<button type="button" class="big" data-panel-size="up" aria-label="' + t('Larger') + '"' + (at >= ids.length - 1 ? ' aria-disabled="true"' : '') + '>A</button>' +
				'<div class="reading-dots" aria-hidden="true">' + ids.map(function (id, i) { return '<i' + (i <= at ? ' class="is-on"' : '') + '></i>'; }).join('') + '</div>' +
			'</div>' +
			'<div class="reading-segment quire-segmented reading-tall" role="radiogroup" aria-label="' + t('Appearance') + '">' +
				SIDES.map(function (s) { return '<button type="button" role="radio"' + (s.id === n.side ? ' class="is-active"' : '') + ' aria-checked="' + (s.id === n.side) + '" data-panel-side="' + s.id + '">' + icon(s.icon) + '<span>' + (s.site || s.own ? s.label : t(s.label)) + '</span></button>'; }).join('') +
			'</div>' +
			tiles +
			(isReader && Styles.readersCopy && Styles.readersCopy() ? '<button type="button" class="quire-button reading-customise" data-panel-copy-link>' + icon('copy') + '<span>' + t(linkCopied ? 'Copied' : 'Copy style') + '</span></button>' : '') +
			'</div>';
		
		var scroller = panel.querySelector('.reading-sheet-body');
		var scrolled = scroller ? scroller.scrollTop : 0;
		var heightWas = !isPhone() && !panel.hidden ? panel.offsetHeight : 0; 
		
		var active = document.activeElement, key = null;
		if (active && panel.contains(active)) {
			for (var ai = 0; ai < active.attributes.length; ai++) {
				var att = active.attributes[ai];
				if (att.name.indexOf('data-panel-') === 0) { key = '[' + att.name + (att.value ? '="' + att.value + '"' : '') + ']'; break; }
			}
		}
		panel.innerHTML = html;
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
		panel.setAttribute('data-input', inputMode);
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
	function open(btn) {
		trigger = btn;
		panel.toggleAttribute('data-door-aurora', !!(btn && btn.getAttribute && btn.getAttribute('data-aurora') === 'true')); 
		level = 1;
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
			var h = Math.min(room, panel.__heightTo || (panel.offsetHeight + (body ? body.scrollHeight - body.clientHeight : 0)));
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
		scrim.hidden = true;
		document.querySelectorAll('[data-reading-panel-open]').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
		var flowing = morph.live();
		if (flowing) morph.unhide(); 
		if (trigger) trigger.focus({ preventScroll: true });
		if (flowing) morph.close(function () { panel.hidden = true; });
		else rollShut(function () { panel.hidden = true; sheet.clear(); });
	}
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
				var link = Styles.shareLink ? Styles.shareLink(true) : ''; 
				if (link && navigator.clipboard) navigator.clipboard.writeText(link).then(function () {
					linkCopied = true; render();
					clearTimeout(panel.__linkCopiedTimer);
					panel.__linkCopiedTimer = setTimeout(function () { linkCopied = false; render(); }, 1200);
				}).catch(function () {  });
			}
			setTimeout(function () { render(); }, 0);
		});
		document.addEventListener('contextmenu', function (e) {
			var tile = e.target && e.target.closest && e.target.closest('.reading-panel .reading-tile');
			if (tile && e.pointerType === 'touch') e.preventDefault();
		});
		document.addEventListener('pointerdown', function () { inputMode = 'pointer'; if (panel) panel.setAttribute('data-input', 'pointer'); }, true);
		document.addEventListener('keydown', function (e) {
			if (e.key === 'Tab' || e.key === 'Enter' || e.key === ' ' || e.key === 'Escape' || e.key.indexOf('Arrow') === 0) { inputMode = 'keyboard'; if (panel) panel.setAttribute('data-input', 'keyboard'); }
		}, true);
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
			if (e.key === 'Escape' && panel && !panel.hidden && !document.querySelector('.rail-more-trigger[aria-expanded="true"], .rail-more-sub:not([hidden])')) { e.preventDefault(); close(); }
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
