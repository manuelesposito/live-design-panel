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
	/* THE OWNER'S SETTINGS (2026-09-23, the Live Design button page), printed on
	   the door by panel.php and changed live by presets.js's event. */
	var S = {};
	(function () { var own = pill.style.getPropertyValue('--opener-own').trim(); if (own) { var n = parseInt(own.slice(1), 16), l = 0.2126 * (n >> 16 & 255) + 0.7152 * (n >> 8 & 255) + 0.0722 * (n & 255); pill.style.setProperty('--opener-own-ink', l > 150 ? '#111111' : '#ffffff'); } }()); /* words that read on the button's own colour, from the first paint */
	['place', 'match', 'size', 'color', 'aurora'].forEach(function (k) { S[k] = pill.getAttribute('data-' + k); }); /* match: printed from the place by panel.php */
	/* Each place keeps its own nudge, so a door moved at the foot does not land off the screen when the owner sends it to the top. */
	function spot() { return S.place && S.place !== 'auto' && S.place !== 'bottom-center' ? KEY + ':' + S.place : KEY; }

	function put() {
		if (at.x || at.y) { pill.style.setProperty('--opener-x', at.x + 'px'); pill.style.setProperty('--opener-y', at.y + 'px'); }
		else { pill.style.removeProperty('--opener-x'); pill.style.removeProperty('--opener-y'); }
	}
	function keep() {
		if (docked) return;
		try { if (at.x || at.y) localStorage.setItem(spot(), JSON.stringify(at)); else localStorage.removeItem(spot()); } catch (e) { /* private mode */ }
	}
	/* INSIDE THE WINDOW, 8 off every edge and clear of WordPress's toolbar
	   (Manuel, 2026-09-22, with the door half off three of the four edges: "make
	   the button stop on the left edge of the screen … on the right edge … make
	   sure that the button stops at the bottom of the screen").

	   IT MEASURES WHAT IS ON THE SCREEN, so the screen has to have it first. This
	   read the door's box while the box still showed the PREVIOUS place, and took
	   the resting place to be `box.left - at.x`: true only when the two agree. A
	   drag by the door moves a few pixels a frame, so the answer was a few pixels
	   wrong and the door slid 20 past the foot; a drag by the panel's head sets
	   the place in one jump, so the answer was wrong by the whole jump and the
	   door left the window altogether (measured: left edge at -294, then 1804 on a
	   1440 window). Everything that moves the door now calls `fit`, which writes
	   the place, reads it back and writes the corrected one. */
	function clamp() {
		var box = pill.getBoundingClientRect(), edge = 8, bar = document.getElementById('wpadminbar');
		var roof = edge + (bar ? Math.max(0, bar.getBoundingClientRect().bottom) : 0);
		/* AND THE PANEL IS NOT SQUEEZED (Manuel, the same afternoon, with the door
		   carried to the head of the window and the panel a stub above it: "make
		   sure that the panel can't be squeezed more than that"). The panel stands
		   over the door and takes the room that is left, so the door's own roof is
		   the one that leaves the panel its height: what it needs, or 380, whichever
		   is less, and the 8 between them. Closed, the door may go to the top.
		   THE HEIGHT IT NEEDS IS NOT ITS OWN HEIGHT: the panel's rows scroll inside
		   it, so a squeezed panel reports exactly the height it has been squeezed
		   to, and a roof read off that follows the door down as it rises. The rows'
		   own full height is what it needs, and the panel's frame around them. */
		/* NO ROOF ANY MORE (Manuel, 2026-09-24: on a window about 800 tall the panel ran
		   off the top and the button, set to the top right, stayed halfway down). The
		   roof kept the button under the panel's height while the panel was up; the
		   panel turns over to whichever side of the button has the room now
		   (reading-panel.js), and shrinks with its rows scrolling where neither has
		   enough, so the button may stand anywhere in the window. */
		var left = box.left - at.x, top = box.top - at.y; /* where it stands at rest */
		at.x = Math.round(Math.max(edge - left, Math.min(window.innerWidth - edge - box.width - left, at.x)));
		at.y = Math.round(Math.max(roof - top, Math.min(window.innerHeight - edge - box.height - top, at.y)));
	}
	/* THE ONE WAY THE DOOR MOVES: put it where it was asked, read the window back,
	   put it where it is allowed.

	   AND IT READS WITH THE EASE HELD OFF. The door eases into place, and a box
	   read while that ease is running is the box it is easing FROM: the measuring
	   then takes the resting place to be somewhere far outside the window and
	   lets the door stand anywhere (measured: asked for -9999 it settled at -9999,
	   while the same call with a reading in between settled at 8). The ease is
	   suspended for the two writes and the reading between them, the place is
	   committed, and the ease comes back with nothing left to animate. A move that
	   is being dragged was never eased anyway; this makes the rest of them safe. */
	function fit() {
		if (docked) return; /* a door in the site's own row stands where the row puts it */
		var was = pill.style.transitionProperty;
		pill.style.transitionProperty = 'none';
		put(); clamp(); put();
		void pill.offsetWidth; /* the place is taken before the ease is given back */
		if (was) pill.style.transitionProperty = was; else pill.style.removeProperty('transition-property');
	}
	function follow() { window.dispatchEvent(new Event('architrave-panel-anchor')); }
	/* BOTH HALVES KNOW THEY ARE BEING CARRIED. Nothing turns any more (the tilt
	   came out on 2026-09-22), but the panel still takes the carried shadow with
	   the door, and a drag by the door has to say so: a drag by the panel's own
	   head marks the panel already. */
	function carrying(on) {
		if (on) pill.setAttribute('data-dragging', ''); else pill.removeAttribute('data-dragging');
		var q = document.querySelector('.reading-panel');
		if (q && !q.hidden) { if (on) q.setAttribute('data-dragging', ''); else q.removeAttribute('data-dragging'); }
	}

	function recall() {
		at.x = 0; at.y = 0;
		try { var s = JSON.parse(localStorage.getItem(spot()) || 'null'); if (s && isFinite(s.x) && isFinite(s.y)) { at.x = +s.x; at.y = +s.y; } } catch (e) { /* nothing kept */ }
	}

	/* ── THE DOOR FINDS ITS SPOT (Manuel, 2026-09-23: "every website is
	   different … finding that spot makes it look like it belongs to that site
	   where this is on"). Automatic tries two places, then floats:
	   1. a spot the theme marks with data-live-design-slot (Architrave's is the
	      corner beside the focus button): the door takes the place and the
	      size, corner and colours of the visible button beside it;
	   2. on any other theme, the site's menu in its header: the door becomes
	      one more item after the last, in the menu's own type and colour.
	   A spot that is not on the screen (a menu folded into its phone button, a
	   corner hidden in a layout) does not count, and the door floats instead. */
	var home = document.createComment(' live-design-button ');
	pill.parentNode.insertBefore(home, pill);
	var docked = null, menuItem = null;
	var DOCK = ['--dock-size', '--dock-radius', '--dock-bg', '--dock-fg', '--dock-edge', '--dock-shadow', '--dock-font', '--dock-font-size', '--dock-weight', '--dock-tracking', '--dock-pad'];
	var mate = null, sides = [], twin = null;
	function shown(el) { if (!el) return false; var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && (getComputedStyle(el).visibility !== 'hidden' || el.hasAttribute('data-in-panel')); } /* a door that has become the panel is only out of sight, and still docks (2026-09-24: Automatic switched on from the open panel left it floating) */
	function see(c) { return c && c !== 'transparent' && !/^rgba\(.*,\s*0\)$/.test(c); }
	function groundOf(el) {
		for (; el && el !== document.documentElement; el = el.parentElement) { var c = getComputedStyle(el).backgroundColor; if (see(c)) return c; }
		var b = getComputedStyle(document.body).backgroundColor; return see(b) ? b : getComputedStyle(document.documentElement).backgroundColor;
	}
	/* THE SITE'S OWN BUTTON, for the Colour called Site colour and a menu door's corner. A floating button's corner is its own (door.css). */
	function siteButton() {
		var probe = document.createElement('button');
		probe.className = window.architravePanelGuest ? 'wp-element-button wp-block-button__link' : 'quire-button primary'; /* Architrave's main button wears the look's accent */
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
		pill.setAttribute('data-match', S.match); /* out of the row it wears what its place says again */
		if (twin) { pill.setAttribute('aria-expanded', twin.getAttribute('aria-expanded') || 'false'); twin.removeAttribute('data-live-design-twin'); twin.removeAttribute('data-docked'); pill.removeAttribute('data-twin'); twin = null; }
		DOCK.forEach(function (p) { pill.style.removeProperty(p); });
		sides.forEach(function (x) { x[0].setAttribute('data-side', x[1]); if (x[2] === null) x[0].removeAttribute('data-align'); else x[0].setAttribute('data-align', x[2]); }); sides = [];
		docked = null; mate = null;
	}
	function set(p, v) { if (v) pill.style.setProperty(p, v); }
	function toSlot(phoneOnly) {
		/* THE FIRST SPOT ON SCREEN (2026-09-24): a theme may name more than one, the
		   corner by the focus square on a wide screen and the phone's top bar, and only
		   one of them shows at a time. A button placed by hand takes the phone's only. */
		var slot = null;
		Array.prototype.some.call(document.querySelectorAll(phoneOnly ? PHONE_SLOT : '[data-live-design-slot]'), function (s) {
			if (!s.parentElement) return false;
			mate = Array.prototype.filter.call(s.parentElement.querySelectorAll('button, a'), function (b) { return b !== pill && !s.contains(b) && shown(b); })[0];
			if (mate) slot = s;
			return !!mate;
		});
		if (!slot) return false;
		slot.appendChild(pill); pill.setAttribute('data-docked', 'slot'); docked = 'slot';
		/* WHERE THE ROW HAS A SQUARE OF ITS OWN FOR THE PANEL, THAT SQUARE IS THE BUTTON
		   (Manuel, 2026-09-30: the corner's squares must "all behave identically in all
		   styles and everywhere … sometimes they behave differently", and docked beside the
		   focus square the button "shouldn't have the aurora so that it can behave exactly
		   like the others"). Architrave prints its own design square in this slot, the same
		   kind of button as the search and the focus square, and this sheet hid it for the
		   door, which then copied its neighbour: face, ink, corner and line at rest, two
		   variables for hover and press. Every look that answers the pointer another way
		   (a line that darkens, a dashed line, a press that inverts, a finish on the face,
		   the page's own focus ring) showed the copy for what it was. So the door steps
		   back here and the row's own square is shown again: it opens the same panel
		   (every door is found by data-reading-panel-open), wears the chosen icon (take,
		   below) and is drawn by the very rules that draw its neighbours, in every look
		   there is and every one to come. The door stays in the slot, out of sight, so it
		   is back the moment Automatic goes off. A slot without a square of its own keeps
		   the door in its neighbour's clothes, without the light. */
		twin = slot.querySelector('[data-reading-panel-open]:not(.architrave-panel-opener)');
		if (twin) {
			twin.setAttribute('data-live-design-twin', ''); pill.setAttribute('data-twin', '');
			twin.setAttribute('data-docked', 'slot'); /* the window asks a button this before it flows out of it: one in the site's row stays in the row */
			twin.setAttribute('aria-keyshortcuts', 'Alt+D');
			twin.setAttribute('aria-expanded', pill.getAttribute('aria-expanded') || 'false');
		}
		/* THE ROW'S TOOLTIPS GO ABOVE (Manuel, 2026-09-23: the focus button's
		   tooltip stood to its left, over the door that now stands there). */
		Array.prototype.forEach.call(slot.parentElement.querySelectorAll('.quire-tooltip[data-side]'), function (t) { sides.push([t, t.getAttribute('data-side'), t.getAttribute('data-align')]); t.setAttribute('data-side', 'top'); if (!t.nextElementSibling) t.setAttribute('data-align', 'end'); });
		wear();
		return true;
	}
	/* THE NEIGHBOUR'S CLOTHES, AS THE LOOK ON THE PAGE DRAWS THEM (Manuel,
	   2026-09-23, on Instrument: the focus button had a light outline and the
	   door did not). Its face, ink, corner, line and shadow are read again
	   whenever a look changes, so the door follows the style that is on. */
	function wear() {
		if (docked !== 'slot' || !mate) return;
		var cs = getComputedStyle(mate), bg = see(cs.backgroundColor) ? cs.backgroundColor : groundOf(mate.parentElement);
		set('--dock-size', mate.offsetHeight + 'px'); set('--dock-radius', cs.borderTopLeftRadius);
		set('--dock-bg', bg); set('--dock-fg', cs.color);
		if (parseFloat(cs.borderTopWidth) > 0 && see(cs.borderTopColor)) set('--dock-edge', cs.borderTopColor);
		else pill.style.removeProperty('--dock-edge'); /* no line of its own: the edge is the face, so the hover fills it to the rim */
		pill.style.setProperty('--dock-shadow', cs.boxShadow && cs.boxShadow !== 'none' ? cs.boxShadow : 'none');
	}
	var wearing = 0;
	/* AND ONCE MORE WHEN THE LOOK HAS SETTLED (2026-09-23, the audit on Astra: the
	   menu's ink was read while a dark look was still fading in, and the door kept
	   a mid-fade grey on the dark header). */
	var settled = 0;
	function rewear() { siteColour(); if (docked === 'slot') wear(); else if (docked) dock(); }
	/* not for what changes no look (2026-10-02, the panel audit): the window's own aiming class and the passing marks of a crossing or a boot screen docked the button again each time */
	var NO_LOOK = /^(class|data-ldp-crossing|data-ldp-booting|data-rail-ready|data-comments-side)$/;
	new MutationObserver(function (ms) { if (ms.every(function (m) { return NO_LOOK.test(m.attributeName || ''); })) return; cancelAnimationFrame(wearing); wearing = requestAnimationFrame(rewear); clearTimeout(settled); settled = setTimeout(rewear, 500); })
		.observe(document.documentElement, { attributes: true }); /* a look writes many switches on the root; any of them may redraw the neighbour */
	/* A SQUARE BESIDE THE MENU (Manuel, 2026-09-24, lab/the-button-on-tt5.html: "I
	   would go for the icon for the square"). The door is a tool, not a page, so on
	   a menu that lays its items out in a row it stands after them as a square with
	   its icon, the way a site's search sits beside its menu; and since it stands
	   beside the menu and not in its list, it stays when the menu folds into its
	   phone button. A name the owner writes widens it into icon and word. A menu
	   that is not a row takes it as one more item, as before. */
	function toMenu() {
		if (!window.architravePanelGuest) return false; /* on Architrave the slot is the spot; its rail is not a menu to join */
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
				pill.setAttribute('data-docked', 'menu'); /* measured in its square, not in its floating shape */
				/* THE HEADER KEEPS ITS HEIGHT (2026-09-24, ten themes: the square is two
				   lines of the menu's type and the row one, so Twenty Twenty-Five's header
				   grew 5px and pushed the whole page down). What the square stands out
				   above and below the row it gives back as margin, so the row, the header
				   and the page stay exactly where the theme put them (measured below, once
				   the square wears the menu's type). */

				/* NO ROOM BESIDE IT (Manuel, 2026-09-24: "keep it outside, add the crowded
				   fallback"): when the square would push the header onto a second line, or
				   squeeze the site's name onto two, it goes into the menu instead, as its
				   last item with its name, folded away with the others on a phone. */
				if ((name && name.getBoundingClientRect().height > tall + 1) || (wide && head.scrollWidth > head.clientWidth + 1)) {
					box.remove(); menuItem = null;
					var any = nav.querySelectorAll('li > a'), lastAny = any[any.length - 1];
					item = item || (lastAny && lastAny.closest('li')); list = list || (item && item.parentElement);
					/* A ROW OF LINKS WITH NO LIST to fold into: the button goes home before the next menu is
					   tried (2026-10-01, the panel audit). It left with the box, `docked` was never set, so
					   undock() did nothing and the button was gone from the page for good. */
					if (!item || !list) { home.parentNode.insertBefore(pill, home.nextSibling); pill.removeAttribute('data-docked'); pill.removeAttribute('data-folded'); continue; }
					row = false; pill.setAttribute('data-folded', '');
				}
			}
			if (!row) {
				var li = document.createElement('li');
				li.className = item.className.replace(/\b(current[\w-]*|[\w-]*has-child[\w-]*|[\w-]*submenu[\w-]*|(?:page|menu)-item-\d+)\b/g, '').replace(/\s+/g, ' ').trim() + ' live-design-menu-item'; /* the neighbour's kind, not its page's id (2026-09-23, the audit: Kadence's item carried page-item-49) */
				li.appendChild(pill); list.appendChild(li); menuItem = li;
			}
			pill.setAttribute('data-docked', 'menu'); docked = 'menu';
			/* ITS LOOK FROM A LINK THAT IS NOT THE PAGE YOU ARE ON (Manuel, 2026-09-24, Matrix on
			   the Sample Page: the word stood dark on the dark header). The last link was the
			   current page, which a look may draw inverted, dark ink on a lit block; the door
			   wore that ink without the block. The door is not the page you are on, so it
			   dresses like the links that are not. When every one is current (Ollie's one-page
			   menu on that page), its type still comes from the last and its ink from the menu
			   itself, which is what a link wears before a look marks it. */
			var plain = links.filter(function (a) { return !a.hasAttribute('aria-current') && !a.closest('.current-menu-item, .current_page_item, .current-menu-ancestor, .current_page_parent, .current-menu-parent'); });
			var cs = getComputedStyle(plain.length ? plain[plain.length - 1] : type); /* on a phone the links are folded away and none is shown: the type comes from the menu's own link */
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
	/* The square's name, for the pointer (a tooltip) and for a screen reader (its label). */
	function tip() {
		if (!menuItem) return;
		menuItem.setAttribute('data-tip', pill.getAttribute('aria-label') || '');
		menuItem.style.setProperty('--tip-bg', pill.style.getPropertyValue('--dock-fg')); /* the menu's ink and ground, turned round, as a tooltip is */
		menuItem.style.setProperty('--tip-fg', pill.style.getPropertyValue('--dock-bg'));
	}
	/* ON A PHONE IT IS ALWAYS IN THE SITE'S BAR, WHATEVER THE PLACE SAYS (Manuel,
	   2026-09-30, the button set to the bottom centre and floating over the article on
	   his phone: "on mobile it always sits in the navigation bar next to the search,
	   regardless of whether it's automatic or not … on desktop the button is maybe
	   sitting in the left corner or right corner"). A place picked on the map is a
	   place in a wide window; a phone has one row of tools, at the top, and a button
	   floating over the text is in the thumb's way. So a button placed by hand docks
	   too where the window is a phone's: in the spot a theme marks for its phone bar,
	   or, on any other theme, beside the menu as Automatic would. Docked, it wears the
	   row's clothes, as on Automatic (data-match), and gets its own back on the way out.
	   Where there is no such spot it floats, at the foot (door.css). */
	var PHONE_SLOT = '.mobile-live-design-slot[data-live-design-slot], [data-live-design-slot="phone"]';
	function phone() { return window.matchMedia('(max-width: 781px)').matches; } /* where WordPress's own bars turn into a phone's */
	function dock() {
		/* THE FOCUS STAYS WITH IT (2026-10-01, the panel audit): every change on the root and every resize docks it again, which moves it in the page, and a moved element loses the keyboard's focus. */
		var had = document.activeElement === pill;
		dockNow();
		if (had && document.activeElement !== pill && shown(pill)) pill.focus({ preventScroll: true });
	}
	function dockNow() {
		undock();
		var byHand = S.place !== 'auto';
		pill.setAttribute('data-match', 'true'); /* before it is measured in the row: a square beside a menu is drawn by the row's rules, and measured by hand's it came out wide and was folded into the menu */
		if ((byHand ? toSlot(true) || (phone() && toMenu()) : toSlot() || toMenu()) && (shown(twin || pill) || pill.hasAttribute('data-folded'))) return; /* folded into a phone's menu it is out of sight until the menu opens, and still home */
		undock();
		pill.setAttribute('data-match', S.match);
	}
	var SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
	var GLYPH = { sliders: SVG + '<path d="M10 5H3"/><path d="M12 19H3"/><path d="M14 3v4"/><path d="M16 17v4"/><path d="M21 12h-9"/><path d="M21 19h-5"/><path d="M21 5h-7"/><path d="M8 10v4"/><path d="M8 12H3"/></svg>', aa: '<span class="ldp-glyph-aa" aria-hidden="true">Aa</span>', sparkles: SVG + '<path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/><path d="M20 2v4"/><path d="M22 4h-4"/><circle cx="4" cy="20" r="2"/></svg>', brush: SVG + '<path d="m14.622 17.897-10.68-2.913"/><path d="M18.376 2.622a1 1 0 1 1 3.002 3.002L17.36 9.643a.5.5 0 0 0 0 .707l.944.944a2.41 2.41 0 0 1 0 3.408l-.944.944a.5.5 0 0 1-.707 0L8.354 7.348a.5.5 0 0 1 0-.707l.944-.944a2.41 2.41 0 0 1 3.408 0l.944.944a.5.5 0 0 0 .707 0z"/><path d="M9 8c-1.804 2.71-3.97 3.46-6.583 3.948a.507.507 0 0 0-.302.819l7.32 8.883a1 1 0 0 0 1.185.204C12.735 20.405 16 16.792 16 15"/></svg>' }; /* Lucide (ISC) */
	function ink(hex) { var n = parseInt(String(hex).slice(1), 16), l = 0.2126 * (n >> 16 & 255) + 0.7152 * (n >> 8 & 255) + 0.0722 * (n & 255); return l > 150 ? '#111111' : '#ffffff'; }
	function take(next) {
		if (next && next.own) { pill.style.setProperty('--opener-own', next.own); pill.style.setProperty('--opener-own-ink', ink(next.own)); } /* the button's own colour and words that read on it */
		['place', 'size', 'color', 'aurora', 'show', 'corners', 'band'].forEach(function (k) {
			if (next && next[k] !== undefined) { S[k] = String(next[k]); pill.setAttribute('data-' + k, S[k]); }
		});
		/* AUTOMATIC WEARS THE SITE'S CLOTHES; A PLACE PICKED ON THE MAP WEARS ITS OWN
		   SIZE AND COLOUR. There is no switch between the two any more. */
		S.match = S.place === 'auto' ? 'true' : 'false'; pill.setAttribute('data-match', S.match);
		/* THE ICON CHOSEN (2026-09-28): every door wears it at once */
		if (next && next.glyph && GLYPH[next.glyph] && next.glyph !== (S.glyph || 'sliders')) {
			S.glyph = next.glyph;
			Array.prototype.forEach.call(document.querySelectorAll('[data-reading-panel-open]'), function (b) {
				var at = b.querySelector('.opener-icon') || b, old = at.querySelector(':scope > svg, :scope > .ldp-glyph-aa');
				if (!old || (at === b && !b.classList.contains('paper-stack-btn'))) return; /* only the doors that wear the sliders */
				var box = document.createElement('span'); box.innerHTML = GLYPH[next.glyph];
				at.replaceChild(box.firstChild, old);
			});
		}
		/* its icon and its name in a menu (2026-09-24): the name as text, never as markup */
		if (next && next.icon !== undefined) pill.setAttribute('data-icon', next.icon ? 'true' : 'false');
		if (next && next.label !== undefined) {
			var word = pill.querySelector('.opener-word > span > span'), name = String(next.label || '').trim() || (window.architraveWords && window.architraveWords['Live Design']) || 'Live Design';
			if (word) word.textContent = name;
			pill.setAttribute('aria-label', name);
			pill.setAttribute('data-named', String(next.label || '').trim() ? 'true' : 'false');
			tip();
		}
	}
	/* PICKING A PLACE PUTS THE DOOR THERE (Manuel, 2026-09-23: "once the button
	   is moved it doesn't go back to its setting even when I click the setting").
	   A drag is a nudge for this browser only, kept per place; choosing a place
	   on the Live Design button page, even the one already chosen, forgets the
	   nudge, so the door stands exactly where the setting says. */
	window.addEventListener('architrave-button-settings', function (e) {
		var d = e.detail || {};
		take(d.settings);
		if (d.picked === 'place') { try { localStorage.removeItem(spot()); } catch (x) { /* private mode */ } }
		recall(); dock(); put(); fit(); follow();
	});
	var fitting = 0;
	window.addEventListener('resize', function () { cancelAnimationFrame(fitting); fitting = requestAnimationFrame(function () { var was = docked; dock(); if (was !== docked) { put(); fit(); follow(); } }); });

	recall();
	dock();
	fit();

	pill.addEventListener('pointerdown', function (e) {
		/* ON AUTOMATIC IT STAYS IN ITS ROW (Manuel, 2026-09-30: "it shouldn't be possible to pull out when it's automatic"). For
		   two days the owner could pull it out of the site's row (the lab's, 2026-09-28); on a real site that was a press that
		   slipped, a button that changed size under the hand and a place nobody chose. It moves once Automatic is switched off
		   on the Live Design Button page: by the map there, or by dragging the button itself. */
		if (e.button !== 0 || docked) return;
		drag = { x: e.clientX, y: e.clientY, ox: at.x, oy: at.y, pid: e.pointerId };
		moved = false;
		try { pill.setPointerCapture(e.pointerId); } catch (x) { /* the drag still follows while the pointer is over the pill */ }
	});
	pill.addEventListener('pointermove', function (e) {
		if (!drag) return;
		var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
		if (!moved && Math.abs(dx) < 4 && Math.abs(dy) < 4) return; /* a press with a shaky hand is still a press */
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
	/* THE SEVEN PLACES SHOW AS RINGS WHILE THE OWNER CARRIES THE BUTTON (2026-09-28, the lab's): the
	   nearest lights up, and on letting go the button lands on that place, which becomes the site's
	   (Automatic goes off). Close to a ring it clicks onto it; a little off, the nudge is kept for that
	   place, as a drag always was. A reader's drag stays a nudge of their own. */
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
		/* each place a small dashed square at the centre of where the button stands there (the lab's); pale on a dark page, dark on a light one */
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
		at.x = 0; at.y = 0; /* IT ALWAYS SNAPS (2026-09-28): let go anywhere, it lands exactly on the nearest place */
		if (place) { S.place = place; pill.setAttribute('data-place', place); }
		fit();
		/* IT GLIDES THERE, overshooting a little and settling (the lab's .35s spring): from where it was let go to where it lands */
		var to = pill.getBoundingClientRect(), gx = r.left - to.left, gy = r.top - to.top, glide = null;
		if ((gx || gy) && pill.animate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) glide = pill.animate([{ transform: 'translate(' + gx + 'px, ' + gy + 'px)' }, { transform: 'none' }], { duration: 350, easing: 'cubic-bezier(.3, 1.2, .5, 1)' });
		/* THE GLIDE FIRST, THE WRITE AFTER (2026-09-28): saving the place re-measures the page, 12 ms on a test page
		   and more on a real one, and it ran before the glide began, so the button hesitated on letting go. Now the
		   button is already on its way (and on its place) when the site's copy is written. */
		/* IT CLICKS INTO PLACE (2026-09-28): a small sound as it arrives, when the owner has sounds on */
		var landed = false, arrived = function () { if (landed) return; landed = true; var W = window.LiveDesignWindow; if (W && W.sound) W.sound('snap'); if (place) window.ArchitraveStyles.setButton('place', place).catch(function () { /* refused: the old place came back with the event */ }); };
		if (glide && glide.finished) { glide.finished.then(arrived, arrived); setTimeout(arrived, 600); } else arrived(); /* a glide in a tab that is out of sight never ends (measured 2026-09-30), and the place was never saved: the clock is the second way in */
	}
	/* NO NATIVE DRAG UNDER A CARRIED DOOR (2026-09-23, measured at Top left:
	   the door moved once and stopped). The press over the site's title link
	   started the browser's own drag of that link, which cancels the pointer,
	   so the door was dropped after its first step. While the door is held,
	   no drag of anything else may begin. */
	document.addEventListener('dragstart', function (e) { if (drag) e.preventDefault(); }, true);
	pill.addEventListener('pointerup', end);
	pill.addEventListener('pointercancel', end);
	pill.addEventListener('lostpointercapture', end); /* A HAND THAT IS LOST STILL LETS GO (2026-09-30: the rings stayed on the page with the button at rest): whatever takes the pointer away, the carry ends and the button lands */
	/* The press that ends a drag must not open the panel: reading-panel.js
	   hears the click on the document, so it is stopped here, before it. */
	/* FROM INSIDE A PHONE'S MENU THE MENU STEPS ASIDE FIRST: the site's menu is a sheet
	   of its own over the page, and the panel opened under it, out of sight. Its own
	   close button is pressed, or, where it has none we know, Escape, as a person
	   would; the panel then comes up over the page. */
	pill.addEventListener('click', function () {
		if (!pill.hasAttribute('data-folded')) return;
		var sheet = pill.closest('.wp-block-navigation__responsive-container.is-menu-open, [aria-modal="true"], .is-menu-open, .toggled');
		if (!sheet) return;
		var shut = sheet.querySelector('.wp-block-navigation__responsive-container-close, [aria-label*="lose" i], .menu-toggle');
		if (shut && shut !== pill) shut.click(); else sheet.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
	}, true);
	pill.addEventListener('click', function (e) { if (moved) { moved = false; e.stopImmediatePropagation(); e.preventDefault(); } }, true);
	/* A DOOR THAT WAS HIGH UP COMES DOWN WHEN THE PANEL OPENS, for the same
	   reason: the roof is lower while the panel stands on it. The press is heard
	   on the way out, before the document hears it, so the fitting waits a frame
	   for the panel to be there. A press that ended a drag never gets this far. */
	pill.addEventListener('click', function () { requestAnimationFrame(function () { fit(); keep(); follow(); }); });
	pill.addEventListener('dblclick', function () { if (docked) return; at.x = 0; at.y = 0; put(); keep(); follow(); });
	window.addEventListener('resize', function () { if (at.x || at.y) fit(); });
	/* THE DOOR GREW A WORD (2026-09-22): at rest it is a square with the settings
	   glyph in it, and under the pointer the word slides out and it becomes three
	   times as wide. A door parked hard against the right edge would have grown
	   straight off the screen, so the window is measured again once the word has
	   finished arriving, and the door is brought back in if it has to be. */
	pill.addEventListener('transitionend', function (e) {
		if (e.propertyName === 'grid-template-columns' && (at.x || at.y)) fit();
	});

	/* THE PANEL IS CARRIED BY THE SAME HAND (Manuel, 2026-09-22: "I can drag the
	   window away from the button and then it starts to be a little bit
	   confusing … I don't know if that's necessary actually"). It was not: the
	   panel had a drag of its own, so the two could be pulled apart and then
	   argued about where they belonged, one snapping back and the other to the
	   middle. They are ONE THING now, with two places to take hold of it. The
	   panel's head asks this file to move the pill, and the panel is placed on
	   the pill as it always was, so nothing can separate them. */
	window.ArchitravePanelOpener = {
		/* CARRIED, NOT SENT. The pill is marked as being dragged while the
		   panel's head moves it: that takes the transition off its `translate`
		   (a pill easing into place reports a box the panel is then centred on,
		   and the panel trailed 100px behind, measured 2026-09-22) and gives it
		   the same one degree of tilt as a drag by the pill itself. */
		moveBy: function (dx, dy) { if (!pill.hasAttribute('data-dragging')) carrying(true); at.x = Math.round(dx); at.y = Math.round(dy); fit(); follow(); },
		at: function () { return { x: at.x, y: at.y }; },
		rest: function () { at.x = 0; at.y = 0; put(); keep(); follow(); }, /* home is the printed place: it needs no fitting, and it eases */
		done: function () { carrying(false); keep(); follow(); }
	};
}());
