/*
 * THE PILL CAN BE MOVED (Manuel, 2026-09-22, from a site whose customisation
 * button he had dragged from the top right to the foot: "it has a nice hover
 * effect so it can be dragged around, like our panel can be dragged around
 * too"). The door is printed by panel.php at the foot of the window, centred.
 * A press opens the panel; a drag moves the pill, by two custom properties the
 * stylesheet adds to its resting place, so the place itself never changes in
 * two files. Where the reader leaves it is kept, per browser, and put back on
 * the next page; a double press sends it home; it never leaves the window, and
 * a window that shrinks brings it back in. The panel, if it is up, follows.
 */
(function () {
	var KEY = 'architrave-opener-spot';
	var pill = document.querySelector('.architrave-panel-opener');
	if (!pill) return;
	var at = { x: 0, y: 0 }, drag = null, moved = false;
	var S = {};
	(function () { var own = pill.style.getPropertyValue('--opener-own').trim(); if (own) { var n = parseInt(own.slice(1), 16), l = 0.2126 * (n >> 16 & 255) + 0.7152 * (n >> 8 & 255) + 0.0722 * (n & 255); pill.style.setProperty('--opener-own-ink', l > 150 ? '#111111' : '#ffffff'); } }()); 
	['place', 'match', 'size', 'color', 'aurora'].forEach(function (k) { S[k] = pill.getAttribute('data-' + k); }); 
	function spot() { return S.place && S.place !== 'auto' && S.place !== 'bottom-center' ? KEY + ':' + S.place : KEY; }
	function put() {
		if (at.x || at.y) { pill.style.setProperty('--opener-x', at.x + 'px'); pill.style.setProperty('--opener-y', at.y + 'px'); }
		else { pill.style.removeProperty('--opener-x'); pill.style.removeProperty('--opener-y'); }
	}
	function keep() {
		if (docked) return;
		try { if (at.x || at.y) localStorage.setItem(spot(), JSON.stringify(at)); else localStorage.removeItem(spot()); } catch (e) {  }
	}
	function clamp() {
		var box = pill.getBoundingClientRect(), edge = 8, bar = document.getElementById('wpadminbar');
		var roof = edge + (bar ? Math.max(0, bar.getBoundingClientRect().bottom) : 0);
		
		var left = box.left - at.x, top = box.top - at.y; 
		at.x = Math.round(Math.max(edge - left, Math.min(window.innerWidth - edge - box.width - left, at.x)));
		at.y = Math.round(Math.max(roof - top, Math.min(window.innerHeight - edge - box.height - top, at.y)));
	}
	function fit() {
		if (docked) return; 
		var was = pill.style.transitionProperty;
		pill.style.transitionProperty = 'none';
		put(); clamp(); put();
		void pill.offsetWidth; 
		if (was) pill.style.transitionProperty = was; else pill.style.removeProperty('transition-property');
	}
	function follow() { window.dispatchEvent(new Event('architrave-panel-anchor')); }
	function carrying(on) {
		if (on) pill.setAttribute('data-dragging', ''); else pill.removeAttribute('data-dragging');
		var q = document.querySelector('.reading-panel');
		if (q && !q.hidden) { if (on) q.setAttribute('data-dragging', ''); else q.removeAttribute('data-dragging'); }
	}
	function recall() {
		at.x = 0; at.y = 0;
		try { var s = JSON.parse(localStorage.getItem(spot()) || 'null'); if (s && isFinite(s.x) && isFinite(s.y)) { at.x = +s.x; at.y = +s.y; } } catch (e) {  }
	}
	
	var home = document.createComment(' live-design-button ');
	pill.parentNode.insertBefore(home, pill);
	var docked = null, menuItem = null;
	var DOCK = ['--dock-size', '--dock-radius', '--dock-bg', '--dock-fg', '--dock-edge', '--dock-shadow', '--dock-font', '--dock-font-size', '--dock-weight', '--dock-tracking', '--dock-pad'];
	var mate = null, sides = [], twin = null;
	function shown(el) { if (!el) return false; var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && (getComputedStyle(el).visibility !== 'hidden' || el.hasAttribute('data-in-panel')); } 
	function see(c) { return c && c !== 'transparent' && !/^rgba\(.*,\s*0\)$/.test(c); }
	function groundOf(el) {
		for (; el && el !== document.documentElement; el = el.parentElement) { var c = getComputedStyle(el).backgroundColor; if (see(c)) return c; }
		var b = getComputedStyle(document.body).backgroundColor; return see(b) ? b : getComputedStyle(document.documentElement).backgroundColor;
	}
	function siteButton() {
		var probe = document.createElement('button');
		probe.className = window.architravePanelGuest ? 'wp-element-button wp-block-button__link' : 'quire-button primary'; 
		probe.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none';
		probe.textContent = 'x';
		document.body.appendChild(probe);
		var cs = getComputedStyle(probe), out = { bg: cs.backgroundColor, fg: cs.color, radius: cs.borderTopLeftRadius };
		probe.remove();
		return out;
	}
	var site;
	function siteColour() {
		site = siteButton();
		pill.style.setProperty('--site-button-bg', see(site.bg) ? site.bg : 'var(--surface-floating)');
		pill.style.setProperty('--site-button-fg', site.fg);
	}
	siteColour();
	function undock() {
		if (!docked) return;
		home.parentNode.insertBefore(pill, home.nextSibling);
		if (menuItem) { menuItem.remove(); menuItem = null; }
		pill.removeAttribute('data-docked'); pill.removeAttribute('data-folded');
		if (twin) { pill.setAttribute('aria-expanded', twin.getAttribute('aria-expanded') || 'false'); twin.removeAttribute('data-live-design-twin'); twin.removeAttribute('data-docked'); pill.removeAttribute('data-twin'); twin = null; }
		DOCK.forEach(function (p) { pill.style.removeProperty(p); });
		sides.forEach(function (x) { x[0].setAttribute('data-side', x[1]); if (x[2] === null) x[0].removeAttribute('data-align'); else x[0].setAttribute('data-align', x[2]); }); sides = [];
		docked = null; mate = null;
	}
	function set(p, v) { if (v) pill.style.setProperty(p, v); }
	function toSlot() {
		var slot = null;
		Array.prototype.some.call(document.querySelectorAll('[data-live-design-slot]'), function (s) {
			if (!s.parentElement) return false;
			mate = Array.prototype.filter.call(s.parentElement.querySelectorAll('button, a'), function (b) { return b !== pill && !s.contains(b) && shown(b); })[0];
			if (mate) slot = s;
			return !!mate;
		});
		if (!slot) return false;
		slot.appendChild(pill); pill.setAttribute('data-docked', 'slot'); docked = 'slot';
		twin = slot.querySelector('[data-reading-panel-open]:not(.architrave-panel-opener)');
		if (twin) {
			twin.setAttribute('data-live-design-twin', ''); pill.setAttribute('data-twin', '');
			twin.setAttribute('data-docked', 'slot'); 
			twin.setAttribute('aria-keyshortcuts', 'Alt+D');
			twin.setAttribute('aria-expanded', pill.getAttribute('aria-expanded') || 'false');
		}
		Array.prototype.forEach.call(slot.parentElement.querySelectorAll('.quire-tooltip[data-side]'), function (t) { sides.push([t, t.getAttribute('data-side'), t.getAttribute('data-align')]); t.setAttribute('data-side', 'top'); if (!t.nextElementSibling) t.setAttribute('data-align', 'end'); });
		wear();
		return true;
	}
	function wear() {
		if (docked !== 'slot' || !mate) return;
		var cs = getComputedStyle(mate), bg = see(cs.backgroundColor) ? cs.backgroundColor : groundOf(mate.parentElement);
		set('--dock-size', mate.offsetHeight + 'px'); set('--dock-radius', cs.borderTopLeftRadius);
		set('--dock-bg', bg); set('--dock-fg', cs.color);
		if (parseFloat(cs.borderTopWidth) > 0 && see(cs.borderTopColor)) set('--dock-edge', cs.borderTopColor);
		else pill.style.removeProperty('--dock-edge'); 
		pill.style.setProperty('--dock-shadow', cs.boxShadow && cs.boxShadow !== 'none' ? cs.boxShadow : 'none');
	}
	var wearing = 0;
	var settled = 0;
	function rewear() { siteColour(); if (docked === 'slot') wear(); else if (docked) dock(); }
	new MutationObserver(function () { cancelAnimationFrame(wearing); wearing = requestAnimationFrame(rewear); clearTimeout(settled); settled = setTimeout(rewear, 500); })
		.observe(document.documentElement, { attributes: true }); 
	function toMenu() {
		if (!window.architravePanelGuest) return false; 
		var navs = document.querySelectorAll('header .wp-block-navigation, header nav, .site-header nav, #site-navigation');
		for (var i = 0; i < navs.length; i++) {
			var nav = navs[i], rowH = 0;
			if (!shown(nav)) continue;
			var links = Array.prototype.filter.call(nav.querySelectorAll('a'), shown);
			var last = links[links.length - 1], item = last && last.closest('li'), list = item && item.parentElement;
			var row = /flex/.test(getComputedStyle(nav).display), type = last || nav.querySelector('a');
			if (!type || !(row || (list && shown(list)))) continue;
			if (row) {
				var head = nav.closest('header') || document.body, name = head.querySelector('.wp-block-site-title, .site-title, .site-branding, .custom-logo-link');
				var tall = name ? name.getBoundingClientRect().height : 0, wide = head.scrollWidth <= head.clientWidth + 1;
				rowH = nav.getBoundingClientRect().height;
				var box = document.createElement('span');
				box.className = 'live-design-menu-item';
				box.appendChild(pill); nav.appendChild(box); menuItem = box;
				pill.setAttribute('data-docked', 'menu'); 
				
				if ((name && name.getBoundingClientRect().height > tall + 1) || (wide && head.scrollWidth > head.clientWidth + 1)) {
					box.remove(); menuItem = null;
					var any = nav.querySelectorAll('li > a'), lastAny = any[any.length - 1];
					item = item || (lastAny && lastAny.closest('li')); list = list || (item && item.parentElement);
					if (!item || !list) continue;
					row = false; pill.setAttribute('data-folded', '');
				}
			}
			if (!row) {
				var li = document.createElement('li');
				li.className = item.className.replace(/\b(current[\w-]*|[\w-]*has-child[\w-]*|[\w-]*submenu[\w-]*|(?:page|menu)-item-\d+)\b/g, '').replace(/\s+/g, ' ').trim() + ' live-design-menu-item'; 
				li.appendChild(pill); list.appendChild(li); menuItem = li;
			}
			pill.setAttribute('data-docked', 'menu'); docked = 'menu';
			var plain = links.filter(function (a) { return !a.hasAttribute('aria-current') && !a.closest('.current-menu-item, .current_page_item, .current-menu-ancestor, .current_page_parent, .current-menu-parent'); });
			var cs = getComputedStyle(plain.length ? plain[plain.length - 1] : type); 
			set('--dock-fg', plain.length ? cs.color : getComputedStyle(list || nav).color); set('--dock-font', cs.fontFamily); set('--dock-font-size', cs.fontSize);
			set('--dock-weight', cs.fontWeight); set('--dock-tracking', cs.letterSpacing);
			set('--dock-pad', cs.paddingTop + ' ' + cs.paddingRight + ' ' + cs.paddingBottom + ' ' + cs.paddingLeft);
			set('--dock-bg', groundOf(nav)); set('--dock-radius', site.radius);
			tip();
			if (menuItem && rowH) { var grow = nav.getBoundingClientRect().height - rowH; if (grow > 0.5) menuItem.style.marginBlock = (-grow / 2) + 'px'; }
			return true;
		}
		return false;
	}
	function tip() {
		if (!menuItem) return;
		menuItem.setAttribute('data-tip', pill.getAttribute('aria-label') || '');
		menuItem.style.setProperty('--tip-bg', pill.style.getPropertyValue('--dock-fg')); 
		menuItem.style.setProperty('--tip-fg', pill.style.getPropertyValue('--dock-bg'));
	}
	function dock() {
		undock();
		if (S.place !== 'auto') return;
		if ((toSlot() || toMenu()) && (shown(twin || pill) || pill.hasAttribute('data-folded'))) return; 
		undock();
	}
	var SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
	var GLYPH = { sliders: SVG + '<path d="M10 5H3"/><path d="M12 19H3"/><path d="M14 3v4"/><path d="M16 17v4"/><path d="M21 12h-9"/><path d="M21 19h-5"/><path d="M21 5h-7"/><path d="M8 10v4"/><path d="M8 12H3"/></svg>', aa: '<span class="ldp-glyph-aa" aria-hidden="true">Aa</span>', sparkles: SVG + '<path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/><path d="M20 2v4"/><path d="M22 4h-4"/><circle cx="4" cy="20" r="2"/></svg>', brush: SVG + '<path d="m14.622 17.897-10.68-2.913"/><path d="M18.376 2.622a1 1 0 1 1 3.002 3.002L17.36 9.643a.5.5 0 0 0 0 .707l.944.944a2.41 2.41 0 0 1 0 3.408l-.944.944a.5.5 0 0 1-.707 0L8.354 7.348a.5.5 0 0 1 0-.707l.944-.944a2.41 2.41 0 0 1 3.408 0l.944.944a.5.5 0 0 0 .707 0z"/><path d="M9 8c-1.804 2.71-3.97 3.46-6.583 3.948a.507.507 0 0 0-.302.819l7.32 8.883a1 1 0 0 0 1.185.204C12.735 20.405 16 16.792 16 15"/></svg>' }; 
	function ink(hex) { var n = parseInt(String(hex).slice(1), 16), l = 0.2126 * (n >> 16 & 255) + 0.7152 * (n >> 8 & 255) + 0.0722 * (n & 255); return l > 150 ? '#111111' : '#ffffff'; }
	function take(next) {
		if (next && next.own) { pill.style.setProperty('--opener-own', next.own); pill.style.setProperty('--opener-own-ink', ink(next.own)); } 
		['place', 'size', 'color', 'aurora', 'show', 'corners', 'band'].forEach(function (k) {
			if (next && next[k] !== undefined) { S[k] = String(next[k]); pill.setAttribute('data-' + k, S[k]); }
		});
		S.match = S.place === 'auto' ? 'true' : 'false'; pill.setAttribute('data-match', S.match);
		if (next && next.glyph && GLYPH[next.glyph] && next.glyph !== (S.glyph || 'sliders')) {
			S.glyph = next.glyph;
			Array.prototype.forEach.call(document.querySelectorAll('[data-reading-panel-open]'), function (b) {
				var at = b.querySelector('.opener-icon') || b, old = at.querySelector(':scope > svg, :scope > .ldp-glyph-aa');
				if (!old || (at === b && !b.classList.contains('paper-stack-btn'))) return; 
				var box = document.createElement('span'); box.innerHTML = GLYPH[next.glyph];
				at.replaceChild(box.firstChild, old);
			});
		}
		if (next && next.icon !== undefined) pill.setAttribute('data-icon', next.icon ? 'true' : 'false');
		if (next && next.label !== undefined) {
			var word = pill.querySelector('.opener-word > span > span'), name = String(next.label || '').trim() || (window.architraveWords && window.architraveWords['Live Design']) || 'Live Design';
			if (word) word.textContent = name;
			pill.setAttribute('aria-label', name);
			pill.setAttribute('data-named', String(next.label || '').trim() ? 'true' : 'false');
			tip();
		}
	}
	window.addEventListener('architrave-button-settings', function (e) {
		var d = e.detail || {};
		take(d.settings);
		if (d.picked === 'place') { try { localStorage.removeItem(spot()); } catch (x) {  } }
		recall(); dock(); put(); fit(); follow();
	});
	var fitting = 0;
	window.addEventListener('resize', function () { cancelAnimationFrame(fitting); fitting = requestAnimationFrame(function () { var was = docked; dock(); if (was !== docked) { put(); fit(); follow(); } }); });
	recall();
	dock();
	fit();
	pill.addEventListener('pointerdown', function (e) {
		if (e.button !== 0 || docked) return;
		drag = { x: e.clientX, y: e.clientY, ox: at.x, oy: at.y, pid: e.pointerId };
		moved = false;
		try { pill.setPointerCapture(e.pointerId); } catch (x) {  }
	});
	pill.addEventListener('pointermove', function (e) {
		if (!drag) return;
		var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
		if (!moved && Math.abs(dx) < 4 && Math.abs(dy) < 4) return; 
		if (!moved) {
			moved = true;
			carrying(true); if (owner()) rings();
		}
		at.x = drag.ox + dx; at.y = drag.oy + dy;
		fit(); follow();
		if (ghosts) nearest();
	});
	function end() {
		if (!drag) return;
		drag = null;
		if (moved) { carrying(false); if (ghosts) land(); keep(); follow(); }
	}
	var SPOTS = ['top-left', 'top-right', 'left', 'right', 'bottom-left', 'bottom-center', 'bottom-right'];
	var ghosts = null, rests = {}, near = null, snapped = false;
	function owner() { var W = window.liveDesignWindow; return !!(W && !W.reader && window.ArchitraveStyles && window.ArchitraveStyles.setButton); }
	function rings() {
		var was = pill.getAttribute('data-place'), tr = pill.style.transitionProperty;
		pill.style.transitionProperty = 'none'; pill.style.removeProperty('--opener-x'); pill.style.removeProperty('--opener-y');
		SPOTS.forEach(function (sp) { pill.setAttribute('data-place', sp); var r = pill.getBoundingClientRect(); rests[sp] = { left: r.left, top: r.top, w: r.width, h: r.height, cx: r.left + r.width / 2, cy: r.top + r.height / 2 }; });
		pill.setAttribute('data-place', was); put(); void pill.offsetWidth;
		if (tr) pill.style.transitionProperty = tr; else pill.style.removeProperty('transition-property');
		ghosts = document.createElement('div'); ghosts.className = 'architrave-door-ghosts'; ghosts.setAttribute('aria-hidden', 'true');
		var bg = [document.body, document.documentElement].map(function (el) { return getComputedStyle(el).backgroundColor; }).filter(function (c) { return !/rgba\([^)]*,\s*0\)$|transparent/.test(c); })[0] || 'rgb(255, 255, 255)', m = /(\d+)[^\d]+(\d+)[^\d]+(\d+)/.exec(bg);
		if (0.2126 * m[1] + 0.7152 * m[2] + 0.0722 * m[3] < 128) ghosts.setAttribute('data-dark', '');
		ghosts.innerHTML = SPOTS.map(function (sp) { var q = rests[sp]; return '<i data-sp="' + sp + '" style="left:' + q.cx + 'px;top:' + q.cy + 'px"></i>'; }).join('');
		document.body.appendChild(ghosts);
	}
	function nearest() {
		var r = pill.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, bd = 1e9;
		SPOTS.forEach(function (sp) { var d = (rests[sp].cx - cx) * (rests[sp].cx - cx) + (rests[sp].cy - cy) * (rests[sp].cy - cy); if (d < bd) { bd = d; near = sp; } });
		snapped = bd < 72 * 72;
		Array.prototype.forEach.call(ghosts.children, function (g) { g.classList.toggle('is-near', g.getAttribute('data-sp') === near); });
	}
	function land() {
		var r = pill.getBoundingClientRect(), home = rests[near], nx = Math.round(r.left - home.left), ny = Math.round(r.top - home.top);
		ghosts.remove(); ghosts = null;
		var place = near && near !== S.place ? near : null;
		at.x = 0; at.y = 0; 
		if (place) { S.place = place; pill.setAttribute('data-place', place); }
		fit();
		var to = pill.getBoundingClientRect(), gx = r.left - to.left, gy = r.top - to.top, glide = null;
		if ((gx || gy) && pill.animate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) glide = pill.animate([{ transform: 'translate(' + gx + 'px, ' + gy + 'px)' }, { transform: 'none' }], { duration: 350, easing: 'cubic-bezier(.3, 1.2, .5, 1)' });
		
		var landed = false, arrived = function () { if (landed) return; landed = true; var W = window.LiveDesignWindow; if (W && W.sound) W.sound('snap'); if (place) window.ArchitraveStyles.setButton('place', place).catch(function () {  }); };
		if (glide && glide.finished) { glide.finished.then(arrived, arrived); setTimeout(arrived, 600); } else arrived(); 
	}
	document.addEventListener('dragstart', function (e) { if (drag) e.preventDefault(); }, true);
	pill.addEventListener('pointerup', end);
	pill.addEventListener('pointercancel', end);
	pill.addEventListener('lostpointercapture', end); 
	
	pill.addEventListener('click', function () {
		if (!pill.hasAttribute('data-folded')) return;
		var sheet = pill.closest('.wp-block-navigation__responsive-container.is-menu-open, [aria-modal="true"], .is-menu-open, .toggled');
		if (!sheet) return;
		var shut = sheet.querySelector('.wp-block-navigation__responsive-container-close, [aria-label*="lose" i], .menu-toggle');
		if (shut && shut !== pill) shut.click(); else sheet.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
	}, true);
	pill.addEventListener('click', function (e) { if (moved) { moved = false; e.stopImmediatePropagation(); e.preventDefault(); } }, true);
	pill.addEventListener('click', function () { requestAnimationFrame(function () { fit(); keep(); follow(); }); });
	pill.addEventListener('dblclick', function () { if (docked) return; at.x = 0; at.y = 0; put(); keep(); follow(); });
	window.addEventListener('resize', function () { if (at.x || at.y) fit(); });
	pill.addEventListener('transitionend', function (e) {
		if (e.propertyName === 'grid-template-columns' && (at.x || at.y)) fit();
	});
	
	window.ArchitravePanelOpener = {
		moveBy: function (dx, dy) { if (!pill.hasAttribute('data-dragging')) carrying(true); at.x = Math.round(dx); at.y = Math.round(dy); fit(); follow(); },
		at: function () { return { x: at.x, y: at.y }; },
		rest: function () { at.x = 0; at.y = 0; put(); keep(); follow(); }, 
		done: function () { carrying(false); keep(); follow(); }
	};
}());
