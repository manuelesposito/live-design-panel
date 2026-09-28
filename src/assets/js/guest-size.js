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

	/* HELD STILL WHILE THE PAGE IS READ (0.11.149, the snapshot tool: the same
	   page came out different from one load to the next). Two ways a reading
	   caught the page in the middle of a transition, both measured:
	   1. A value given back and read at once is the value the page is
	      ANIMATING FROM. Kadence gives its pictures `transition: all .1s`, so
	      space.js took back the height it had written and read the same
	      height again, not the theme's, and the card grew 15% at every resize
	      (297, 341, 393, 452px).
	   2. A reading that lifts the look for a moment (the theme's own colours,
	      the other side) and reads the page in between leaves the page with
	      the lifted colours as its "before", so fifteen colour fades started
	      on every load, and guest-ink.js judged the menu's pill half-faded:
	      dark words on a pill still dark, given light words, which the pill
	      then turned white under.
	   So every script that reads the page and writes back does it inside
	   still(): transitions last no time while it runs, and the page is
	   brought up to date before they come back, so nothing it did fades and
	   nothing it reads is on its way somewhere. Shared through the window;
	   whichever file loads first makes it (the same lines are in space.js,
	   guest-rows.js, guest-ink.js, guest-lines.js, guest-buttons.js and
	   presets.js). */
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

	/* The element's own size, before this file ever wrote one. Kept per element
	   rather than per role, because one role holds several sizes: the article
	   title and the h4 under it are both Headings and 48px is not 20px. */
	var ground = [];
	/* The three a released member carries besides its size, with the token the
	   panel writes for each and the property it is spent on. */
	var MEMBER_DIALS = [
		{ dial: 'weight', token: 'weight', css: 'font-weight' },
		{ dial: 'caps', token: 'case', css: 'text-transform' },
		{ dial: 'tracking', token: 'tracking', css: 'letter-spacing' }
	];

	/* THE THEME'S OWN INLINE VALUES ARE KEPT, NOT CLEARED (2026-09-24, ten themes:
	   Twenty Twenty-Five's "MORE POSTS" is an h2 whose author wrote its weight,
	   capitals and letter spacing on the element itself, and a first visit
	   showed it in lower case at 400, because "at rest" cleared the property and
	   took the author's value with it; Twenty Twenty-Four and Bluehost lost
	   weights the same way). Each element's own value for every property this
	   file or guest-rows.js may write is read the first time either meets it,
	   before either writes, and "at rest" puts that value back. */
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
				return; /* a selector a site owner filtered in, that the browser will not take */
			}
			Array.prototype.forEach.call(list, function (el) {
				if (seen.indexOf(el) !== -1) {
					return; /* two groups can name the same element; the first one owns it */
				}
				seen.push(el);
				keep(el);
				ground.push({ el: el, role: g.role, member: g.member || '', step: g.step || '', rest: +g.rest || 0, px: 0 });
			});
		});
		sort();
	}

	/* ARTICLE OR DESIGNED (Manuel, 2026-09-25, a day of Twenty Twenty-Five's
	   pattern pages: a pill at 50px, a small heading at 44, a pull quote at 20,
	   the portfolio's titles at 98, "Hey," broken over two lines. "What would
	   be, in general, a holistic fix for stuff like that?").
	   One mistake made all of them. A look is an article's type system: its
	   ladder, its dials, its leading, its alignment, its accent. A page built
	   from patterns is post content too, so the article's rules reached a
	   layout somebody designed, and resized it piece by piece.
	   So every measured piece is SORTED, by where it stands, on any theme:
	   ARTICLE is text written straight into the post, at any depth, as long as
	   no layout stands between it and the nearest post body: the nearest, so a
	   blog page that prints whole posts inside a page reads each one as an
	   article. DESIGNED is text inside a layout (a list of posts, a cover,
	   columns, media beside text, a section with its own ground or its own row
	   or grid), text the writer sized by hand, a pull quote and a badge.
	   A group that holds the whole post, alone in its body, is the article's
	   box, not a layout: some themes wrap every post in one.
	   Under a look, the article takes the look entirely; designed text takes its
	   faces and colours and keeps its theme's proportions, all of it scaled by
	   one ratio, the look's reading size over the theme's, so a designed
	   section and the text beside it stay on one scale. The mark is
	   `data-ldp-designed` on the piece and `data-ldp-layout` on the layout, and
	   panel-page.css reads both. Reviewed before it was built (a second model,
	   the same afternoon): the nearest body, the one ratio and the marks in CSS
	   are its corrections. */
	var ROOTS = '.wp-block-post-content, .entry-content';
	var LAYOUT = '.wp-block-query, .wp-block-post-template, .wp-block-cover, .wp-block-columns, .wp-block-media-text, .has-background, .wp-block-group.alignfull, .wp-block-group.alignwide';
	var STRUCTURAL = '.wp-block-query, .wp-block-post-template, .wp-block-cover, .wp-block-columns, .wp-block-media-text';
	var NOT_LAYOUT = 'ul, ol, figure, table, details, blockquote, .wp-block-buttons, .wp-block-list';
	function isLayout(a, root, cache) {
		if (cache.has(a)) return cache.get(a);
		var is = false;
		try { is = a.matches(LAYOUT); } catch (e) { /* keep false */ }
		if (!is && !a.matches(NOT_LAYOUT)) is = /flex|grid/.test(window.getComputedStyle(a).display);
		if (is && !a.matches(STRUCTURAL)) {
			/* The article's own box: it and every box above it, up to the body,
			   stand alone. */
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
			/* A title in a list of posts is a card's title, not a headline. */
			return el.closest('.wp-block-query, .wp-block-post-template') ? 'designed' : 'outside';
		}
		for (var a = el.parentElement; a && a !== root; a = a.parentElement) {
			if (isLayout(a, root, cache)) return 'designed';
		}
		/* A size the WRITER chose, never one this file wrote (0.11.149: a quote
		   on Twenty Twenty-Four was sized as the article's on the first pass;
		   on the next, its paragraph found the size this file had written on
		   the quote, took it for the writer's, and grew from 22 to 39px). */
		for (var b = el; b && b !== root; b = b.parentElement) {
			if (/\bhas-[\w-]+-font-size\b/.test(b.className)) return 'designed';
			if (b.__ldpOwn ? b.__ldpOwn['font-size'][0] : b.style.fontSize) return 'designed';
		}
		if (el.closest('.wp-block-pullquote')) return 'designed';
		return 'article';
	}
	function sort() {
		/* The theme's own line spacing, read once with the look lifted, for the
		   designed sections (panel-page.css). */
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

	/* THE ONE RATIO a designed piece is scaled by: the look's reading size over
	   the theme's. The theme's is read from the reading text of the same body,
	   or the body's own size when it has none (a page built only of patterns). */
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

	/* NOTHING MAY STOP FITTING ITS BOX. A heading whose longest word is wider
	   than the room it stands in is brought down until the word fits ("Hey,"
	   at 487px in a 780px column, in a wider face). Headings only, and short
	   ones: a paragraph with a long address in it is the reader's to wrap. */
	var canvas = null;
	function fit(el, px) {
		var text = (el.textContent || '').trim();
		if (!text || text.split(/\s+/).length > 12) return px;
		var g = window.getComputedStyle(el);
		var box = el, bs = g;
		/* THE ROOM IS WHAT THE HEADING MAY GROW INTO, NOT ITS OWN WIDTH (0.11.149,
		   Kadence's page title, a block in a flex column that wraps its words:
		   its own width is its text's, so a canvas that measured the word a
		   hair wider than the page drew it took 2% off the title, and every
		   later pass read the shrunk width and took 2% more, 32px down to 29.3
		   by the time a picture was taken). An item of a flex or grid box, and
		   anything that is not a block, is measured against its parent. */
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

	/* Every inline size is cleared BEFORE anything is read, and then everything
	   is read. Doing both in one pass would measure a child through a parent
	   this file had already written to, and the second element in a pair would
	   record the first one's number as its own. */
	function measure() {
		ground.forEach(function (t) {
			give(t.el, 'font-size'); /* the theme's own inline size, if it wrote one, is the ground */
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
		/* The look's reading size, for the one ratio designed text is scaled by. */
		var lookBody = 0;
		if (look) {
			var bodyRung = num('--panel-rung-body', 0);
			lookBody = bodyRung ? bodyRung * num('--read-size') * num('--panel-step-body') : 0;
		}
		ground.forEach(function (t) {
			if (!t.px) {
				return;
			}
			/* TWO DIALS, ONE SIZE. The role's own row says how much bigger this
			   part is than the theme made it; the A/A stepper says how much
			   bigger the whole article is. On Architrave the stylesheet holds
			   both in one token; here they are multiplied, which comes to the
			   same thing. */
			/* A PIECE THAT HAS JOINED A LINE TAKES NO SIZE OF ITS OWN (guest-rows.js).
			   Its line's first piece says what it looks like, and that is written
			   from the stylesheet; an inline size here would win over it, because an
			   inline `!important` beats a sheet's. Measured before this: the category
			   line had joined the byline and still wore its own 26. */
			if (t.el.hasAttribute('data-panel-row')) { give(t.el, 'font-size'); return; }
			/* AND THE MEMBER'S OTHER THREE DIALS COME THE SAME WAY (Manuel,
			   2026-09-22, on a released Subheadings whose size moved and whose
			   weight, capitals and spacing did not: "not all settings working").
			   On Architrave a released member's weight, capitals and character
			   spacing are spent by THE MEMBERS' OVERRIDES at the end of
			   style.css, which names Architrave's own parts one by one. A guest
			   has no such block and cannot have one written by hand without a
			   second list to keep in step with this one. So the three are
			   written here, on the same elements, from the same tokens the
			   stylesheet would have read, and marked important because the role's
			   own rules in panel-page.css are. Bound, they are taken off again
			   and the role speaks for the member, which is what bound means. */
			if (t.member) {
				MEMBER_DIALS.forEach(function (d) {
					var released = root.hasAttribute('data-' + t.role + '-m-' + t.member + '-' + d.dial);
					if (!released) { give(t.el, d.css); return; }
					var v = window.getComputedStyle(root).getPropertyValue('--' + t.role + '-' + d.token + '-' + t.member).trim();
					if (v) t.el.style.setProperty(d.css, v, 'important'); else give(t.el, d.css);
				});
			}
			/* A RELEASED MEMBER SPEAKS FOR ITSELF (2026-09-22, Manuel: "on Architrave
			   every size has its own switch, but here we have two different sizes
			   which have the same switch"). Bound, a member is the role: one dial
			   moves the whole family and each part keeps its rung. Released, the
			   panel writes a factor of its own, `--head-size-sub`, under an attribute
			   of its own, and it replaces the role's factor entirely, which is what
			   Architrave's own stylesheet does with the same two tokens. */
			var own = t.member && root.hasAttribute('data-' + t.role + '-m-' + t.member + '-size')
				? num('--' + t.role + '-size-' + t.member) : role[t.role];
			/* ARTICLE OR DESIGNED, sorted in find() (sort, above). A single post's own
			   title stands outside its body and is the article's all the same. */
			var inArticle = t.kind === 'article' || (t.kind === 'outside' && !!t.el.closest('.single .wp-block-post-title, .single-post .wp-block-post-title'));
			var f = own * (t.step ? step[t.step] : 1);
			/* OUTSIDE THE ARTICLE A LOOK LEAVES THE SIZE ALONE (Manuel, 2026-09-25,
			   Neve's hero on a phone: 36px under Original, 22 under Matrix, 40 under
			   Poster). A look's size for a role is a place on the article's ladder;
			   on a landing page it multiplied the theme's own size and the page lost
			   its scale. Only the faces change there, as ONLY IN THE ARTICLE says. */
			/* BUT THE READER'S OWN MOVE STILL REACHES IT (2026-09-27): the category line,
			   the date and the menus did not move at all under Classic, whatever the row
			   said. `--{role}-size-mine` is the reader's change over the style's own size
			   (presets.js), 1 while the style is as it came, so the rule above stands. */
			if (look && !inArticle) f = num('--' + t.role + '-size-mine');
			/* UNDER A LOOK THE SCALE IS THE LOOK'S (Manuel, 2026-09-22: "why does
			   the post title look so different even if the standard is clicked on
			   both?"). Standard on Twenty Twenty-Five had Standard's faces over the
			   host's 48px title and 1.4 line spacing, because every size was a
			   ratio of the host's own. So while a look is on (`data-chosen`), a part
			   with a rung of its own starts from Architrave's number for it: the
			   title at 64, an h2 at 36, the text at 22, the date at 16, and the
			   role's dial and the A/A stepper multiply that. On the theme's own
			   look the host's numbers stand, as before. */
			var base = t.px;
			/* ONLY IN THE ARTICLE (2026-09-24, Manuel on Neve FSE's front page: "the
			   title is way bigger in Original, why is it so small in Classic?"). The
			   look's ladder is an article's ladder: every h1 at 44, every h3 at 32.
			   On a landing page that took the hero from 56 to 36 and its small
			   section titles from 24 to 36, and the page lost its order. The rungs
			   are for the text of a post and a single post's own title; everywhere
			   else the theme's sizes stand and only the faces change. */
			if (look && inArticle) {
				/* A size the writer chose, and a pull quote, are DESIGNED and never
				   come here (Manuel, 2026-09-25: "SUBSCRIBE ON YOUR FAVORITE PLATFORM",
				   14px, stood at 44; the pull quote, 48px, at 20). */
				var rung = t.step ? num('--panel-rung-' + t.step, 0) : (t.rest || 0);
				if (rung) { base = rung; }
			}
			/* DESIGNED, UNDER A LOOK: the theme's own size, times the one ratio
			   that keeps the section on the article's scale (sort, above). No rung,
			   no role dial. */
			if (look && t.kind === 'designed') { base = t.px; f = ratioFor(t, lookBody) * num('--' + t.role + '-size-mine'); } /* and the reader's own move on top, as outside the article (2026-09-27: Twenty Twenty-Five's dates are designed, and Small text moved nothing) */
			var px = base * f;
			/* And under a look nothing may stop fitting its box (fit, above). NOR
			   UNDER THE THEME'S OWN, once the reader's size has made a heading
			   bigger than the theme did (2026-09-25, Twenty Twenty-Five's Banners
			   page at Huge: "Stories", 288px, grew to 460 and the page ran 320px
			   wider than the window). Never below the theme's own size: what it
			   drew too wide is its own. */
			if (/^H[1-6]$/.test(t.el.tagName)) {
				if (look) px = fit(t.el, px);
				else if (px > t.px) px = Math.max(t.px, fit(t.el, px));
			}

			if (Math.abs(px - t.px) < 0.01) {
				give(t.el, 'font-size'); /* at rest the theme's own size stands, untouched */
			} else {
				/* IMPORTANT, BECAUSE CORE IS. A block whose author gave it a size
				   from the theme's list wears a class like `has-x-large-font-size`,
				   and core prints those with their own !important. Measured on
				   Twenty Twenty-Five: on a single post the title takes an inline
				   size and on the index it does not, because the index's titles
				   carry that class, so Headings moved one page and not the other.
				   This is the same reason panel-page.css marks font-family. */
				t.el.style.setProperty('font-size', Math.round(px * 1000) / 1000 + 'px', 'important');
			}
		});
		column(look); /* after the sizes, since a character's width is measured at the size the text now has */
		/* And a line that joined (guest-rows.js) is read again at the sizes it now
		   has: read before this ran, it copied the size its first piece had BEFORE
		   the look, and kept it (measured on Twenty Twenty-Four, 2026-09-23). */
		document.dispatchEvent(new Event('architrave-guest-sized'));
	}

	/* THE COLUMN (Manuel, 2026-09-22; panel-page.css, THE COLUMN). The host's
	   content width is read once, before this file writes anything, and only
	   if it is in pixels; a theme that says it in another unit keeps its own. */
	var hostColumn = 0;
	(function () {
		var v = window.getComputedStyle(root).getPropertyValue('--wp--style--global--content-size').trim();
		if (/^\d+(\.\d+)?px$/.test(v)) hostColumn = parseFloat(v);
		if (v) root.style.setProperty('--ldp-host-content', v); /* for a designed section (panel-page.css) */
	}());
	/* THE BROWSER'S OWN `ch`, NOT AN ARITHMETIC ONE. A canvas can measure the
	   advance of a "0" and multiplying it by the count came out 9px short of
	   Architrave's own column over 53 characters (measured 2026-09-22, 646
	   against 655): `ch` is resolved by the layout engine, and a text
	   measurement taken another way is a second opinion about it. So a span
	   nobody sees is given the reading face at the reading size and a width in
	   `ch`, and what the engine makes of that is the number. */
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
		if (look) {
			var t = ground.filter(function (g) { return g.role === 'read' && g.px; })[0];
			if (t) {
				var chars = parseFloat(window.getComputedStyle(root).getPropertyValue('--layout-content-width-reading')) || 53; /* Architrave's rest, style.css THE MEASURE; the faces that set their own come through panel.css */
				var w = chBox(window.getComputedStyle(t.el), chars);
				if (w) want = Math.round(w) + 'px';
			}
		} else if (hostColumn) {
			var f = num('--panel-step-body');
			if (f > 1) want = Math.round(hostColumn * f) + 'px'; /* larger widens; smaller never narrows the host's column */
		}
		/* Written only on change: the root's style is what the observer below
		   watches, and a write that changed nothing would still wake it. */
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

	/* THE ROWS SAY WHAT THEY CAN DO. The panel greys a size row it was told
	   cannot work; a role with something on this page to measure can work after
	   all, so its entry is taken off the list. The array is the one the panel
	   reads, changed in place, and the panel is built when it is first opened,
	   which is after this runs. A role with nothing on the page stays greyed. */
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

	/* A dial moved. presets.js writes --<role>-size onto the root's own style
	   attribute, so that is what is watched. ONCE A FRAME, NOT ONCE A WRITE:
	   a tile press writes the root's style thirty times in one go (measured
	   on Twenty Twenty-Five, Standard pressed), and each write is a mutation.
	   Applying on every one would read every measured element's size thirty
	   times for one result; the first mutation asks for a frame and the rest
	   fall in behind it. */
	var frame = 0;
	new MutationObserver(function () {
		if (frame) {
			return;
		}
		frame = window.requestAnimationFrame(function () {
			frame = 0;
			still(apply);
		});
	}).observe(root, { attributes: true, attributeFilter: ['style', 'data-reading', 'data-chosen', 'data-face'] }); /* data-face: the column's characters are the face's (2026-09-22) */
	/* A FACE THAT ARRIVES LATE IS MEASURED AGAIN: the column counts the width of
	   one character in the reading face, and before the file lands the browser
	   measures the fallback's. */
	if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { still(apply); });
	/* AND EVERY FACE AFTER IT (2026-09-27, found by two snapshot runs of the same pages
	   that did not match: Neotext's column came out 716 px in one and 646 px in the
	   other). `ready` settles once, for the faces asked for by then; a face a style asks
	   for later (Catalogue's mono, a face fetched on demand) lands after it, and the
	   column had been measured in the fallback's characters and was never measured
	   again. Each finished load is measured once more. */
	if (document.fonts && document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', function () { still(apply); });
	document.addEventListener('architrave-guest-badges', function () { all(); }); /* a badge is sorted DESIGNED */
	/* A PIECE THAT LEFT A LINE TAKES ITS OWN SIZE AGAIN (0.11.149, Twenty
	   Twenty-Four's list of posts: a category joined its byline before the
	   sizes were written, guest-rows.js took its size off as a joined piece
	   must, and once the sizes had come the byline wrapped and the category
	   stood on a line of its own, at the theme's 14.4 among bylines at 18.9,
	   in about one load in four). guest-rows.js says when a piece has left. */
	document.addEventListener('architrave-guest-rows', function () { still(apply); });

	/* A WIDER WINDOW IS A DIFFERENT SIZE. A theme that sizes its title with
	   clamp() or a viewport unit gives a different number at every width, and a
	   number this file kept at one width would freeze it there. The measurement
	   is taken again, from a page with nothing of ours written on it. */
	var soon = null;
	window.addEventListener('resize', function () {
		clearTimeout(soon);
		soon = setTimeout(all, 200);
	});
}());
