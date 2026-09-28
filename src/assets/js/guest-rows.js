/*
 * WHEN TWO ROLES MEET ON ONE LINE (Manuel, 2026-09-22, the byline on stock
 * Twenty Twenty-Five: "on the Architrave theme those elements are sitting on
 * separate lines, therefore they can have different font sizes; in the 25 theme
 * they are sitting on the same line so a different size looks wrong … would
 * something like that be possible, that the plugin would realize that they are
 * sitting now in one line and therefore they should become one style?").
 *
 * It is possible, and this is it. The role table gives every area of a page its
 * own face, weight, size and case. That is right when the areas are apart. It is
 * wrong when a theme puts two of them side by side in one sentence: the byline
 * reads "Written by Manuel Esposito in DESIGN, PHILOSOPHY", and the first four
 * words are the small role while the categories are the category line, so one
 * line carried three faces and three sizes (measured 14, 16 and 26).
 *
 * THE RULE: pieces that share a line and carry DIFFERENT roles all take the role
 * of the first piece in reading order. Everything else is left alone.
 *
 * AND ONLY WHEN THE ROLES DIFFER, never when one role simply has two sizes in
 * it. Measured across the home page, a post, a search page and an author page,
 * the only other mixed lines on a stock theme are the header and the footer,
 * where the site title stands beside the menu at 22 against 18 and 32 against
 * 18. Both are the interface role and that gap is the host theme's own decision;
 * a rule that flattened it would shrink the site's name to its menu.
 *
 * IT DOES NOT COPY DIALS, IT COPIES THE ANSWER. Reading the winning role's dials
 * and applying them by hand would go wrong wherever a dial rests, because then
 * the yielding piece would keep its own role's value and nothing would replace
 * it. So the eight text properties are read off the anchor AS THE BROWSER HAS
 * WORKED THEM OUT and written on the pieces that yield. Whatever the anchor
 * ends up looking like, the rest of its line looks the same.
 *
 * A guest only: on Architrave these areas sit on lines of their own, which is
 * where the roles came from.
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
	/* The same addresses panel-page.css uses, in the order a tie is broken. */
	var ORDER = ['head', 'quote', 'comment', 'kicker', 'small', 'ui', 'read'];
	var SEL = {
		head: '.wp-block-post-title, .wp-block-heading, .wp-block-post-content h1, .wp-block-post-content h2, .wp-block-post-content h3, .wp-block-post-content h4, .wp-block-post-content h5, .wp-block-post-content h6',
		quote: '.wp-block-quote, .wp-block-pullquote',
		comment: '.wp-block-comment-author-name, .wp-block-comment-content, .wp-block-comment-date, .wp-block-comment-reply-link, .wp-block-comments-title',
		kicker: '.wp-block-post-terms',
		small: '.wp-block-post-date, .wp-block-post-author-name, .has-small-font-size:not(.wp-block-navigation), figcaption, .wp-element-caption',
		ui: '.wp-block-navigation, .wp-block-navigation-item__content, .wp-block-button__link, .wp-block-site-title, .wp-block-site-tagline, .wp-block-query-pagination, .wp-block-post-navigation-link, .skip-link',
		read: '.wp-block-post-excerpt'
	};
	var PROPS = [
		['face', 'font-family'], ['size', 'font-size'], ['weight', 'font-weight'],
		['style', 'font-style'], ['leading', 'line-height'], ['case', 'text-transform'],
		['tracking', 'letter-spacing'], ['words', 'word-spacing']
	];

	function roleOf(el) {
		for (var i = 0; i < ORDER.length; i++) {
			try { if (el.matches(SEL[ORDER[i]])) return ORDER[i]; } catch (e) { /* an address this browser cannot parse is no address */ }
		}
		return null;
	}
	/* The piece a child of the row stands for: itself, or the first thing under
	   it that carries a role. A theme wraps; the wrapper is not the text. */
	function carrier(el) {
		if (roleOf(el)) return el;
		var all = el.querySelectorAll('*');
		for (var i = 0; i < all.length; i++) { if (roleOf(all[i])) return all[i]; }
		return null;
	}
	/* WHAT THE PANEL HAS PUT ITS HAND ON. A look owns every role; under Original
	   a role is the panel's only once the reader moved one of its dials, which
	   presets.js says by stamping `data-<role>-…` on the root. */
	function touched(role) {
		if (root.hasAttribute('data-chosen')) return true;
		var names = root.getAttributeNames();
		for (var i = 0; i < names.length; i++) { if (names[i].indexOf('data-' + role + '-') === 0) return true; }
		return false;
	}
	/* The width of one space in a face, as the browser draws it. */
	var ruler = null;
	function spaceOf(cs) {
		var px = parseFloat(cs.fontSize) || 16;
		try {
			ruler = ruler || document.createElement('canvas').getContext('2d');
			ruler.font = cs.fontStyle + ' ' + cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
			var w = ruler.measureText(' ').width;
			if (w > 0) return w;
		} catch (e) { /* no canvas: the book face's quarter below */ }
		return px * 0.25;
	}
	function size(el) { return parseFloat(window.getComputedStyle(el).fontSize) || 0; }
	function words(el) {
		var t = el.textContent;
		return !!(t && t.trim());
	}
	/* THE GAP THAT WAS THERE BEFORE THIS FILE WROTE ONE is what it gives back
	   (0.11.149): space.js may have written it, and taking the property off
	   took space.js's gap with it, so the byline's gap was 5.1 on one load
	   and the theme's on the next. */
	function ungap() {
		var gaps = document.querySelectorAll('[data-panel-gap]');
		for (var g = 0; g < gaps.length; g++) {
			var e = gaps[g], was = e.__ldpGap;
			e.removeAttribute('data-panel-gap');
			if (was && e.style.getPropertyValue('column-gap') === was[2]) {
				if (was[0]) e.style.setProperty('column-gap', was[0], was[1]); else e.style.removeProperty('column-gap');
			}
			e.__ldpGap = null;
		}
	}
	function clear() {
		ungap();
		var had = document.querySelectorAll('[data-panel-row]'), left = [];
		for (var i = 0; i < had.length; i++) {
			had[i].removeAttribute('data-panel-row');
			left.push(had[i]);
			for (var j = 0; j < PROPS.length; j++) had[i].style.removeProperty('--panel-row-' + PROPS[j][0]);
		}
		return left;
	}

	var running = false;
	function pass() { still(passNow); }
	function passNow() {
		if (running) return;
		running = true;
		var before = clear();
		/* Every parent that holds a piece with a role. A row is a parent's own
		   children, never two things that merely happen to line up across the
		   page: a band of the window is not a sentence. */
		var parents = [], seen = [];
		for (var k in SEL) {
			var found = document.querySelectorAll(SEL[k]);
			for (var i = 0; i < found.length; i++) {
				var p = found[i].parentElement;
				if (!p || p === document.body || seen.indexOf(p) !== -1) continue;
				/* Not inside a designed section (guest-size.js, ARTICLE OR DESIGNED):
				   its lines are its designer's. */
				if (p.closest('[data-ldp-layout]')) continue;
				seen.push(p); parents.push(p);
			}
		}
		var stamped = 0;
		for (var n = 0; n < parents.length; n++) {
			var kids = parents[n].children, line = [];
			for (var c = 0; c < kids.length; c++) {
				if (!words(kids[c])) continue;
				var box = kids[c].getBoundingClientRect();
				if (!box.width || !box.height) continue;
				var el = carrier(kids[c]);
				/* A PIECE WITH NO ROLE AT ALL IS STILL ON THE LINE (the byline's
				   own words: "Written by" and "in" are plain paragraphs that no
				   address reaches, and they were left at 14 beside a name at 16).
				   It joins, it never leads, and it takes what the line takes. */
				line.push({ el: el || kids[c], role: el ? roleOf(el) : null, top: box.top, bottom: box.bottom, left: box.left, right: box.right });
			}
			if (line.length < 2) continue;
			/* One line: the pieces whose boxes overlap the first one's band. */
			var first = line[0], row = [], roles = [];
			for (var m = 0; m < line.length; m++) {
				if (m && !(line[m].top < first.bottom && line[m].bottom > first.top)) continue;
				row.push(line[m]);
				if (line[m].role && roles.indexOf(line[m].role) === -1) roles.push(line[m].role);
			}
			/* TWO ROLES, NOT TWO SIZES. One role with two sizes in it is the host
			   theme's own decision, and the site title beside its menu is exactly
			   that; a rule that flattened it would shrink the site's name. */
			if (row.length < 2) continue;
			var lead = null;
			for (var f = 0; f < row.length; f++) { if (row[f].role) { lead = row[f]; break; } }
			if (!lead) continue;
			/* A LINE THE PANEL HAS NOT TOUCHED IS THE HOST'S (2026-09-23, Twenty
			   Twenty-Four: on a first visit its byline dash went 16.8 to 14.4).
			   Different roles on one line are only a fault once the panel has
			   made them differ; until then the theme drew that line as it wanted. */
			var ours = false;
			for (var o = 0; o < roles.length; o++) { if (touched(roles[o])) { ours = true; break; } }
			if (!ours) continue;
			/* AND UNDER A LOOK, ONE ROLE AT TWO SIZES IS THE LOOK'S DOING, not the
			   host's (Twenty Twenty-Four again: its "by" is marked small, the date
			   and author beside it are not, and a look rests the two at 13 and 16).
			   The interface role keeps its gap: that is the site title beside its
			   menu, and guest-size.js keeps it as the host's ratio under a look too. */
			var look = root.hasAttribute('data-chosen'), ground = size(lead.el);
			/* A piece no role reaches counts too (Ollie, 2026-09-23: the author
			   block with its picture is no role's, sat in a group the look set at
			   13, beside a date the look rests at 16). */
			/* AND AT TWO FACES (2026-09-24, Ollie's byline under Classic: since the
			   content area takes the reading face (panel-page.css, THE PAGE'S TWO
			   AREAS), "admin ·" in Newsreader beside a date in Inter). */
			var face = window.getComputedStyle(lead.el).fontFamily;
			var uneven = function (p) { return look && lead.role !== 'ui' && (p.role === lead.role || !p.role) && (Math.abs(size(p.el) - ground) > 0.5 || (!p.role && window.getComputedStyle(p.el).fontFamily !== face)); };
			if (roles.length < 2) {
				var any = false;
				for (var u = 0; u < row.length; u++) { if (uneven(row[u])) { any = true; break; } }
				if (!any) continue;
			}
			/* AND IT HAS TO BE A SENTENCE, NOT A ROW (measured on the More posts
			   list and the search results: a card puts its title at one end of
			   the line and its date at the other, and by everything above that is
			   a line with two roles on it. Unified, the date took the title's
			   role and its size. Words that belong to one sentence follow each
			   other closely; a title and a date at opposite ends of a row do not.
			   So a gap wider than one and a half times the leading piece's own
			   size, and never less than 24, ends the sentence and the line is
			   left exactly as the theme built it.) */
			/* A ROW THAT PUSHES ITS ENDS APART IS A ROW, whatever the gap comes to:
			   the More posts list and the search results set a title against a
			   date with `space-between`, and the title's box grows until only 20
			   are left between them. The parent says plainly what it is doing. */
			var how = window.getComputedStyle(parents[n]).justifyContent;
			if (how === 'space-between' || how === 'space-around' || how === 'space-evenly') continue;
			/* AND A PIECE THAT WRAPS IS A BLOCK, NOT A WORD IN A SENTENCE. */
			var wrapped = false;
			for (var w = 0; w < row.length; w++) {
				var lh = parseFloat(window.getComputedStyle(row[w].el).lineHeight) || 0;
				if (lh && row[w].bottom - row[w].top > lh * 1.6) { wrapped = true; break; }
			}
			if (wrapped) continue;
			var sorted = row.slice().sort(function (a, z) { return a.left - z.left; });
			var span = parseFloat(window.getComputedStyle(lead.el).fontSize) || 16;
			var room = Math.max(24, span * 1.5), apart = false;
			for (var g = 1; g < sorted.length; g++) {
				if (sorted[g].left - sorted[g - 1].right > room) { apart = true; break; }
			}
			if (apart) continue;
			var look = window.getComputedStyle(lead.el);
			/* A LINE KEEPS ITS WORD SPACES (Manuel, 2026-09-23, Twenty Twenty-Five's
			   byline under Arcade reading "WRITTEN BYMANUEL ESPOSITOIN ARCHITECTURE":
			   "gap missing"). The theme puts its pieces side by side with a flex gap
			   of 0.2em of the LINE's own size, 13px, so 2.6; a look sets the words
			   at 16 in capitals with letter spacing, and 2.6 is no longer a space.
			   The gap becomes at least one word space of the line's first piece,
			   measured in its own face (a typewriter face's space is 0.6em, a
			   book face's a quarter), plus its letter and word spacing. Never less
			   than the theme's own, so a line the theme spaced wider stays wider. */
			var box = window.getComputedStyle(parents[n]);
			if (/flex|grid/.test(box.display)) {
				var word = spaceOf(look) + (parseFloat(look.letterSpacing) || 0) + (parseFloat(look.wordSpacing) || 0);
				if (word > (parseFloat(box.columnGap) || 0) + 0.5) {
					var gapPx = Math.round(word * 10) / 10 + 'px';
					if (!parents[n].hasAttribute('data-panel-gap')) parents[n].__ldpGap = [parents[n].style.getPropertyValue('column-gap'), parents[n].style.getPropertyPriority('column-gap'), gapPx];
					parents[n].setAttribute('data-panel-gap', '');
					parents[n].style.setProperty('column-gap', gapPx, 'important');
				}
			}
			for (var r = 0; r < row.length; r++) {
				if (row[r] === lead || (row[r].role === lead.role && !uneven(row[r]))) continue;
				row[r].el.setAttribute('data-panel-row', lead.role);
				/* AND ANY SIZE IT WAS GIVEN AS ITS OWN ROLE GOES. guest-size.js
				   writes sizes inline and marks them important, which no sheet
				   can outrank; it leaves a joined piece alone from now on, and
				   this clears what it wrote before the piece joined. */
				var own = row[r].el.__ldpOwn && row[r].el.__ldpOwn['font-size']; /* guest-size.js kept the theme's own inline size: that one stays */
				if (own && own[0]) row[r].el.style.setProperty('font-size', own[0], own[1]); else row[r].el.style.removeProperty('font-size');
				for (var q = 0; q < PROPS.length; q++) {
					row[r].el.style.setProperty('--panel-row-' + PROPS[q][0], look.getPropertyValue(PROPS[q][1]));
				}
				stamped++;
			}
		}
		if (stamped) root.setAttribute('data-panel-rows', 'on'); else root.removeAttribute('data-panel-rows');
		running = false;
		/* A piece that has left its line had its own size taken off when it
		   joined; guest-size.js writes it again (guest-size.js, A PIECE THAT
		   LEFT A LINE). */
		for (var z = 0; z < before.length; z++) {
			if (!before[z].hasAttribute('data-panel-row')) { document.dispatchEvent(new Event('architrave-guest-rows')); break; }
		}
	}

	var timer = null;
	function soon() { if (timer) clearTimeout(timer); timer = setTimeout(pass, 60); }

	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', soon); else soon();
	window.addEventListener('load', soon);
	window.addEventListener('resize', soon);
	/* And whenever guest-size.js has written sizes, since the line copies them. */
	document.addEventListener('architrave-guest-sized', soon);
	/* SPACE READS THE THEME'S GAPS, NOT THIS FILE'S, AND THIS FILE HAS THE LAST
	   WORD (0.11.149, Twenty Twenty-Four's bylines: space.js scaled the gap
	   this file had widened, or wrote over it after, and the gap came out 4.3
	   on one load in twenty-four and 5.1 on the rest). space.js says when it
	   starts reading and when it has written, both at once, not later. */
	document.addEventListener('architrave-space-reading', function () { still(ungap); });
	document.addEventListener('architrave-space-written', pass);
	/* A LOOK CHANGES THE ANSWER, so the line is read again. The panel writes its
	   dials on the root, and every one of them can move a face or a size. */
	new MutationObserver(soon).observe(root, { attributes: true, attributeFilter: (function () {
		var out = ['data-theme', 'data-reading', 'data-face', 'data-sans', 'data-leading', 'data-chosen'];
		for (var i = 0; i < ORDER.length; i++) {
			out.push('data-' + ORDER[i] + '-face', 'data-' + ORDER[i] + '-weight', 'data-' + ORDER[i] + '-leading',
				'data-' + ORDER[i] + '-caps', 'data-' + ORDER[i] + '-tracking', 'data-' + ORDER[i] + '-words',
				'data-' + ORDER[i] + '-italic');
		}
		return out;
	}()) });
	/* And once the webfonts have arrived, because a size read in a fallback face
	   is the size of the fallback face. */
	if (document.fonts && document.fonts.ready) document.fonts.ready.then(soon);
}());
