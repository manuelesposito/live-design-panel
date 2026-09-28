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
			try { if (el.matches(SEL[ORDER[i]])) return ORDER[i]; } catch (e) {  }
		}
		return null;
	}
	function carrier(el) {
		if (roleOf(el)) return el;
		var all = el.querySelectorAll('*');
		for (var i = 0; i < all.length; i++) { if (roleOf(all[i])) return all[i]; }
		return null;
	}
	function touched(role) {
		if (root.hasAttribute('data-chosen')) return true;
		var names = root.getAttributeNames();
		for (var i = 0; i < names.length; i++) { if (names[i].indexOf('data-' + role + '-') === 0) return true; }
		return false;
	}
	var ruler = null;
	function spaceOf(cs) {
		var px = parseFloat(cs.fontSize) || 16;
		try {
			ruler = ruler || document.createElement('canvas').getContext('2d');
			ruler.font = cs.fontStyle + ' ' + cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
			var w = ruler.measureText(' ').width;
			if (w > 0) return w;
		} catch (e) {  }
		return px * 0.25;
	}
	function size(el) { return parseFloat(window.getComputedStyle(el).fontSize) || 0; }
	function words(el) {
		var t = el.textContent;
		return !!(t && t.trim());
	}
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
		var parents = [], seen = [];
		for (var k in SEL) {
			var found = document.querySelectorAll(SEL[k]);
			for (var i = 0; i < found.length; i++) {
				var p = found[i].parentElement;
				if (!p || p === document.body || seen.indexOf(p) !== -1) continue;
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
				line.push({ el: el || kids[c], role: el ? roleOf(el) : null, top: box.top, bottom: box.bottom, left: box.left, right: box.right });
			}
			if (line.length < 2) continue;
			var first = line[0], row = [], roles = [];
			for (var m = 0; m < line.length; m++) {
				if (m && !(line[m].top < first.bottom && line[m].bottom > first.top)) continue;
				row.push(line[m]);
				if (line[m].role && roles.indexOf(line[m].role) === -1) roles.push(line[m].role);
			}
			if (row.length < 2) continue;
			var lead = null;
			for (var f = 0; f < row.length; f++) { if (row[f].role) { lead = row[f]; break; } }
			if (!lead) continue;
			var ours = false;
			for (var o = 0; o < roles.length; o++) { if (touched(roles[o])) { ours = true; break; } }
			if (!ours) continue;
			var look = root.hasAttribute('data-chosen'), ground = size(lead.el);
			
			var face = window.getComputedStyle(lead.el).fontFamily;
			var uneven = function (p) { return look && lead.role !== 'ui' && (p.role === lead.role || !p.role) && (Math.abs(size(p.el) - ground) > 0.5 || (!p.role && window.getComputedStyle(p.el).fontFamily !== face)); };
			if (roles.length < 2) {
				var any = false;
				for (var u = 0; u < row.length; u++) { if (uneven(row[u])) { any = true; break; } }
				if (!any) continue;
			}
			
			var how = window.getComputedStyle(parents[n]).justifyContent;
			if (how === 'space-between' || how === 'space-around' || how === 'space-evenly') continue;
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
				var own = row[r].el.__ldpOwn && row[r].el.__ldpOwn['font-size']; 
				if (own && own[0]) row[r].el.style.setProperty('font-size', own[0], own[1]); else row[r].el.style.removeProperty('font-size');
				for (var q = 0; q < PROPS.length; q++) {
					row[r].el.style.setProperty('--panel-row-' + PROPS[q][0], look.getPropertyValue(PROPS[q][1]));
				}
				stamped++;
			}
		}
		if (stamped) root.setAttribute('data-panel-rows', 'on'); else root.removeAttribute('data-panel-rows');
		running = false;
		for (var z = 0; z < before.length; z++) {
			if (!before[z].hasAttribute('data-panel-row')) { document.dispatchEvent(new Event('architrave-guest-rows')); break; }
		}
	}
	var timer = null;
	function soon() { if (timer) clearTimeout(timer); timer = setTimeout(pass, 60); }
	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', soon); else soon();
	window.addEventListener('load', soon);
	window.addEventListener('resize', soon);
	document.addEventListener('architrave-guest-sized', soon);
	document.addEventListener('architrave-space-reading', function () { still(ungap); });
	document.addEventListener('architrave-space-written', pass);
	new MutationObserver(soon).observe(root, { attributes: true, attributeFilter: (function () {
		var out = ['data-theme', 'data-reading', 'data-face', 'data-sans', 'data-leading', 'data-chosen'];
		for (var i = 0; i < ORDER.length; i++) {
			out.push('data-' + ORDER[i] + '-face', 'data-' + ORDER[i] + '-weight', 'data-' + ORDER[i] + '-leading',
				'data-' + ORDER[i] + '-caps', 'data-' + ORDER[i] + '-tracking', 'data-' + ORDER[i] + '-words',
				'data-' + ORDER[i] + '-italic');
		}
		return out;
	}()) });
	if (document.fonts && document.fonts.ready) document.fonts.ready.then(soon);
}());
