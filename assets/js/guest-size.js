/*
 * THE SIZE DIALS, ON A THEME THAT IS NOT ARCHITRAVE (0.9.0).
 *
 * A role's size is a MULTIPLIER: Headings at 1.25 means a quarter larger than
 * whatever that heading already was. On Architrave the stylesheet knows what it
 * already was, because Architrave set it: `calc(var(--text-article-title) *
 * var(--head-size, 1))`. On a stranger's theme there is no such token, and CSS
 * has no way to ask an element how big it is. `calc(1em * factor)` looks like
 * the answer and is not: in a `font-size`, `1em` is the PARENT's size, so on any
 * element that carries its own size the rule throws that size away. Measured on
 * Twenty Twenty-Five, a first attempt took the post title from 48px to 22px.
 *
 * So the size rows were greyed. This file un-greys them. The browser can answer
 * the question a stylesheet cannot: read each element's own size once, keep it,
 * and write back the product. Nothing is written while a dial is at rest, so a
 * page nobody has touched is its own theme's page, as everywhere else in this
 * plugin; and the kept size is the theme's own, re-read whenever the window
 * changes, so a title the theme sized fluidly stays fluid.
 *
 * GUESTS ONLY. On Architrave `window.architravePanelGuest` is undefined and
 * this file returns on its first line, because Architrave's own stylesheet does
 * this properly, in CSS, with the tokens it owns.
 */
(function () {
	if (!window.architravePanelGuest) {
		return;
	}
	var root = document.documentElement;
	
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
	var GROUPS = window.architravePanelGuestSizes || [];
	if (!GROUPS.length) {
		return;
	}
	
	var ground = [];
	var MEMBER_DIALS = [
		{ dial: 'weight', token: 'weight', css: 'font-weight' },
		{ dial: 'caps', token: 'case', css: 'text-transform' },
		{ dial: 'tracking', token: 'tracking', css: 'letter-spacing' }
	];
	
	function keep(el) {
		if (el.__ldpOwn) return;
		var o = {};
		['font-size', 'font-weight', 'text-transform', 'letter-spacing'].forEach(function (p) { o[p] = [el.style.getPropertyValue(p), el.style.getPropertyPriority(p)]; });
		el.__ldpOwn = o;
	}
	function give(el, p) {
		var o = el.__ldpOwn && el.__ldpOwn[p];
		if (o && o[0]) el.style.setProperty(p, o[0], o[1]); else el.style.removeProperty(p);
	}
	function find() {
		ground = [];
		var seen = [];
		GROUPS.forEach(function (g) {
			var list;
			try {
				list = document.querySelectorAll(g.sel);
			} catch (e) {
				return; 
			}
			Array.prototype.forEach.call(list, function (el) {
				if (seen.indexOf(el) !== -1) {
					return; 
				}
				seen.push(el);
				keep(el);
				ground.push({ el: el, role: g.role, member: g.member || '', step: g.step || '', rest: +g.rest || 0, px: 0 });
			});
		});
		sort();
	}
	
	var ROOTS = '.wp-block-post-content, .entry-content';
	var LAYOUT = '.wp-block-query, .wp-block-post-template, .wp-block-cover, .wp-block-columns, .wp-block-media-text, .has-background, .wp-block-group.alignfull, .wp-block-group.alignwide';
	var STRUCTURAL = '.wp-block-query, .wp-block-post-template, .wp-block-cover, .wp-block-columns, .wp-block-media-text';
	var NOT_LAYOUT = 'ul, ol, figure, table, details, blockquote, .wp-block-buttons, .wp-block-list';
	function isLayout(a, root, cache) {
		if (cache.has(a)) return cache.get(a);
		var is = false;
		try { is = a.matches(LAYOUT); } catch (e) {  }
		if (!is && !a.matches(NOT_LAYOUT)) is = /flex|grid/.test(window.getComputedStyle(a).display);
		if (is && !a.matches(STRUCTURAL)) {
			var solo = true;
			for (var e = a; e && e !== root; e = e.parentElement) {
				if (e.parentElement && e.parentElement.children.length !== 1) { solo = false; break; }
			}
			if (solo) is = false;
		}
		cache.set(a, is);
		if (is) a.setAttribute('data-ldp-layout', '');
		return is;
	}
	function kindOf(el, cache) {
		if (el.hasAttribute('data-ldp-badge')) return 'designed';
		var root = el.parentElement && el.parentElement.closest(ROOTS);
		if (!root) {
			return el.closest('.wp-block-query, .wp-block-post-template') ? 'designed' : 'outside';
		}
		for (var a = el.parentElement; a && a !== root; a = a.parentElement) {
			if (isLayout(a, root, cache)) return 'designed';
		}
		for (var b = el; b && b !== root; b = b.parentElement) {
			if (/\bhas-[\w-]+-font-size\b/.test(b.className)) return 'designed';
			if (b.__ldpOwn ? b.__ldpOwn['font-size'][0] : b.style.fontSize) return 'designed';
		}
		if (el.closest('.wp-block-pullquote')) return 'designed';
		return 'article';
	}
	function sort() {
		if (!root.style.getPropertyValue('--ldp-host-leading')) {
			var body = document.querySelector(ROOTS);
			if (body) {
				var held = root.getAttribute('data-chosen');
				if (held !== null) root.removeAttribute('data-chosen');
				var bs = window.getComputedStyle(body), lh = parseFloat(bs.lineHeight) / parseFloat(bs.fontSize);
				if (held !== null) root.setAttribute('data-chosen', held);
				if (lh > 0.8 && lh < 3) root.style.setProperty('--ldp-host-leading', String(Math.round(lh * 1000) / 1000));
			}
		}
		var cache = new Map();
		Array.prototype.forEach.call(document.querySelectorAll('[data-ldp-layout]'), function (e) { e.removeAttribute('data-ldp-layout'); });
		ground.forEach(function (t) {
			t.kind = kindOf(t.el, cache);
			t.root = t.el.parentElement ? t.el.parentElement.closest(ROOTS) : null;
			if (t.kind === 'designed') t.el.setAttribute('data-ldp-designed', ''); else t.el.removeAttribute('data-ldp-designed');
		});
	}
	
	function ratioFor(t, lookBody) {
		if (!lookBody) return 1;
		var theme = 0;
		for (var i = 0; i < ground.length; i++) {
			var g = ground[i];
			if (g.role === 'read' && g.kind === 'article' && g.root === t.root && g.px) { theme = g.px; break; }
		}
		if (!theme) {
			var host = t.root || document.body;
			if (host.__ldpBody === undefined) host.__ldpBody = parseFloat(window.getComputedStyle(host).fontSize) || 0;
			theme = host.__ldpBody;
		}
		return theme ? lookBody / theme : 1;
	}
	
	var canvas = null;
	function fit(el, px) {
		var text = (el.textContent || '').trim();
		if (!text || text.split(/\s+/).length > 12) return px;
		var g = window.getComputedStyle(el);
		var box = el, bs = g;
		var parent = el.parentElement, ps = parent && window.getComputedStyle(parent);
		if (!/^(block|list-item)$/.test(g.display) || g.width === 'fit-content' || (ps && /flex|grid/.test(ps.display))) { box = parent; bs = ps; }
		if (!box) return px;
		var room = box.clientWidth - parseFloat(bs.paddingLeft) - parseFloat(bs.paddingRight);
		if (box !== el) room -= parseFloat(g.paddingLeft) + parseFloat(g.paddingRight);
		if (!(room > 0)) return px;
		canvas = canvas || document.createElement('canvas');
		var ctx = canvas.getContext('2d');
		ctx.font = g.fontStyle + ' ' + g.fontWeight + ' ' + px + 'px ' + g.fontFamily;
		var now = parseFloat(g.fontSize) || px;
		var track = (parseFloat(g.letterSpacing) || 0) * (px / now);
		if (g.textTransform === 'uppercase') text = text.toUpperCase();
		var widest = 0;
		text.split(/\s+/).forEach(function (w) { widest = Math.max(widest, ctx.measureText(w).width + track * w.length); });
		if (widest <= room) return px;
		return Math.max(px * 0.5, px * room / widest * 0.98);
	}
	
	function measure() {
		ground.forEach(function (t) {
			give(t.el, 'font-size'); 
		});
		ground.forEach(function (t) {
			t.px = parseFloat(window.getComputedStyle(t.el).fontSize) || 0;
		});
	}
	function num(name, fallback) {
		var v = parseFloat(window.getComputedStyle(root).getPropertyValue(name));
		return isFinite(v) && v > 0 ? v : (fallback === undefined ? 1 : fallback);
	}
	function apply() {
		var role = {};
		var step = {};
		var look = root.hasAttribute('data-chosen');
		ground.forEach(function (t) {
			if (role[t.role] === undefined) {
				role[t.role] = num('--' + t.role + '-size');
			}
			if (t.step && step[t.step] === undefined) {
				step[t.step] = num('--panel-step-' + t.step);
			}
		});
		var lookBody = 0;
		if (look) {
			var bodyRung = num('--panel-rung-body', 0);
			lookBody = bodyRung ? bodyRung * num('--read-size') * num('--panel-step-body') : 0;
		}
		ground.forEach(function (t) {
			if (!t.px) {
				return;
			}
			
			if (t.el.hasAttribute('data-panel-row')) { give(t.el, 'font-size'); return; }
			if (t.member) {
				MEMBER_DIALS.forEach(function (d) {
					var released = root.hasAttribute('data-' + t.role + '-m-' + t.member + '-' + d.dial);
					if (!released) { give(t.el, d.css); return; }
					var v = window.getComputedStyle(root).getPropertyValue('--' + t.role + '-' + d.token + '-' + t.member).trim();
					if (v) t.el.style.setProperty(d.css, v, 'important'); else give(t.el, d.css);
				});
			}
			var own = t.member && root.hasAttribute('data-' + t.role + '-m-' + t.member + '-size')
				? num('--' + t.role + '-size-' + t.member) : role[t.role];
			var inArticle = t.kind === 'article' || (t.kind === 'outside' && !!t.el.closest('.single .wp-block-post-title, .single-post .wp-block-post-title'));
			var f = own * (t.step ? step[t.step] : 1);
			
			if (look && !inArticle) f = num('--' + t.role + '-size-mine');
			var base = t.px;
			if (look && inArticle) {
				var rung = t.step ? num('--panel-rung-' + t.step, 0) : (t.rest || 0);
				if (rung) { base = rung; }
			}
			if (look && t.kind === 'designed') { base = t.px; f = ratioFor(t, lookBody) * num('--' + t.role + '-size-mine'); } 
			var px = base * f;
			if (/^H[1-6]$/.test(t.el.tagName)) {
				if (look) px = fit(t.el, px);
				else if (px > t.px) px = Math.max(t.px, fit(t.el, px));
			}
			if (Math.abs(px - t.px) < 0.01) {
				give(t.el, 'font-size'); 
			} else {
				t.el.style.setProperty('font-size', Math.round(px * 1000) / 1000 + 'px', 'important');
			}
		});
		column(look); 
		document.dispatchEvent(new Event('architrave-guest-sized'));
	}
	
	var hostColumn = 0;
	(function () {
		var v = window.getComputedStyle(root).getPropertyValue('--wp--style--global--content-size').trim();
		if (/^\d+(\.\d+)?px$/.test(v)) hostColumn = parseFloat(v);
		if (v) root.style.setProperty('--ldp-host-content', v); 
	}());
	var probe = null;
	function chBox(cs, chars) {
		if (!probe) {
			probe = document.createElement('span');
			probe.setAttribute('aria-hidden', 'true');
			probe.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;top:0;left:-9999px;display:block';
			(document.body || root).appendChild(probe);
		}
		probe.style.fontFamily = cs.fontFamily;
		probe.style.fontSize = cs.fontSize;
		probe.style.fontWeight = cs.fontWeight;
		probe.style.fontStyle = cs.fontStyle;
		probe.style.width = chars + 'ch';
		return probe.getBoundingClientRect().width;
	}
	function column(look) {
		var want = '';
		var lf = parseFloat(root.style.getPropertyValue('--measure-factor')) || 1;
		if (look) {
			var t = ground.filter(function (g) { return g.role === 'read' && g.px; })[0];
			if (t) {
				var chars = parseFloat(window.getComputedStyle(root).getPropertyValue('--layout-content-width-reading')) || 53; 
				var w = chBox(window.getComputedStyle(t.el), chars * lf);
				if (w) want = Math.round(w) + 'px';
			}
		} else if (hostColumn) {
			var f = num('--panel-step-body');
			if (f > 1 || lf !== 1) want = Math.round(hostColumn * Math.max(f, 1) * lf) + 'px'; 
		}
		if (want) {
			if (root.style.getPropertyValue('--panel-measure') !== want) root.style.setProperty('--panel-measure', want);
			if (!root.hasAttribute('data-panel-measure')) root.setAttribute('data-panel-measure', '');
		} else if (root.hasAttribute('data-panel-measure')) {
			root.style.removeProperty('--panel-measure');
			root.removeAttribute('data-panel-measure');
		}
	}
	function all() {
		still(function () {
			find();
			measure();
			apply();
		});
	}
	
	function unGrey() {
		var limits = window.architravePanelGuestLimits;
		if (!limits || !limits.splice) {
			return;
		}
		ground.forEach(function (t) {
			if (!t.px) {
				return;
			}
			var at = limits.indexOf('size:' + t.role);
			if (at !== -1) {
				limits.splice(at, 1);
			}
		});
	}
	function start() {
		all();
		unGrey();
	}
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', start);
	} else {
		start();
	}
	
	var frame = 0;
	new MutationObserver(function () {
		if (frame) {
			return;
		}
		frame = window.requestAnimationFrame(function () {
			frame = 0;
			still(apply);
		});
	}).observe(root, { attributes: true, attributeFilter: ['style', 'data-reading', 'data-chosen', 'data-face', 'data-measure'] }); 
	if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { still(apply); });
	if (document.fonts && document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', function () { still(apply); });
	document.addEventListener('architrave-guest-badges', function () { all(); }); 
	document.addEventListener('architrave-guest-rows', function () { still(apply); });
	
	var soon = null;
	window.addEventListener('resize', function () {
		clearTimeout(soon);
		soon = setTimeout(all, 200);
	});
}());
