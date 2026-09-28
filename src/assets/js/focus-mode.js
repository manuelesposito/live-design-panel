/**
 * The focus mode: the eye in the paper's stack.
 *
 * THE THEME'S, NOT THE PANEL'S (2026-09-21). This lived inside presets.js from
 * 2026-09-11. The design panel is leaving the theme for a plugin (Architrave
 * Panel) and Manuel decided: "the focus mode stays with the theme". So the
 * code came here whole, comments and all, and presets.js hands over to it
 * under the names it used to offer (ArchitraveStyles.focus, motion, retime,
 * setFocus). rail-collapse.js and comments-side.js ask this object first.
 *
 * In the HEAD, not deferred: a reader who left the mode on must not see the
 * squares for a frame, so data-focus-on is stamped before first paint.
 */
(function () {
	var root = document.documentElement;
	function press(selector) {
		var row = document.querySelector(selector);
		if (row) row.click();
	}

	/* THE FOCUS MODE IS THE SITE'S TOO (Manuel, 2026-09-11: "a setting where
	   we can decide focus mode on or off"): on, the controls step back
	   while you read (focus.js); off stamps data-focus-mode="off" and
	   nothing ever fades. Not a style's, so no reset touches it. */
	/* THE FOCUS MODE IS A SQUARE IN THE PAPER'S STACK (Manuel, 2026-09-14:
	   "take out the focus mode and put it as an icon button … if it's turned
	   on it should hide all icons and icon buttons and collapse the comments
	   and also the rail"). Off, the page is as it is and the controls step
	   back while you read (focus.js). On, stamped data-focus-on: every square
	   but its own, the comments door and the corner are gone; the rail folds
	   and the comments close on the press, and the rail comes back on the
	   press off if this press folded it. Rests off. */
	var FOCUS_KEY = 'architrave-focus', FOCUS_RESTORE = 'architrave-focus-restore';
	function focusOn() {
		try { return localStorage.getItem(FOCUS_KEY) === 'on'; } catch (e) { return false; }
	}
	function applyFocus() {
		root.removeAttribute('data-focus-mode'); /* the switch of 2026-09-11, retired */
		if (focusOn()) root.setAttribute('data-focus-on', ''); else root.removeAttribute('data-focus-on');
		document.querySelectorAll('[data-focus-toggle]').forEach(function (b) { b.setAttribute('aria-pressed', focusOn() ? 'true' : 'false'); });
		/* (The eye rose by the squares above it until 2026-09-15; it keeps
		   its place now and the others fade where they stand, style.css.) */
	}
	applyFocus();

	window.ArchitraveFocus = {
		on: focusOn,
		/* THE ONE MOTION (Manuel, 2026-09-14: the rail's and the column's own
		   presses "just snap … nothing in common with our smooth animation"):
		   the focus press, the collapse, the expand and the comments door all
		   stamp the same window, and the stylesheet's focus clock runs the
		   slide for any of them (rail-collapse.js, comments-side.js call this). */
		motion: function (press) {
			root.setAttribute('data-focus-motion', '');
			/* A rail or comments press is the brisk kind (style.css, TWO CURVES,
			   TWO DURATIONS); the focus press is the slow one. */
			if (press) root.setAttribute('data-press-motion', ''); else root.removeAttribute('data-press-motion');
			return this.retime();
		},
		/* The window lasts as long as the motion the stylesheet chose, and a
		   little; read again after a press has changed the state the pace is
		   picked from (the focus press off, below). */
		retime: function () {
			var ms = parseFloat(getComputedStyle(root).getPropertyValue('--focus-duration')) || 700;
			clearTimeout(window.__architraveFocusMotion);
			window.__architraveFocusMotion = setTimeout(function () { root.removeAttribute('data-focus-motion'); root.removeAttribute('data-focus-folds-rail'); root.removeAttribute('data-press-motion'); root.removeAttribute('data-focus-off'); }, ms + 80);
			return ms;
		},
		set: function (on) {
			var railOut = !root.hasAttribute('data-rail-collapsed');
			/* The mode's attribute FIRST, then the window: the stylesheet picks
			   the pace from it (TWO CURVES, TWO DURATIONS), and the window is
			   measured from that pace. Stamped the other way round the press
			   on was measured at the return's 480 and the window shut at 560
			   with the 700 motion still running, so everything jumped to its
			   end (Manuel, 2026-09-14: "a little hiccup"). */
			/* ON: the attribute first, so the window is measured at the mode's
			   pace. OFF: the attribute stays until the rail and the comments have
			   been pressed back, so the corner square is still laid out in the
			   style pass where the rail returns and has a place to glide from
			   (Manuel, 2026-09-14: the square "just appears"); the window is
			   measured again once the attribute is off. */
			if (on) root.setAttribute('data-focus-on', '');
			/* THE WAY OUT RUNS ON ONE CLOCK FROM ITS FIRST PRESS (Manuel, 2026-09-15,
			   under lines: the paper "squeezes together and the space arises for
			   the two rails … afterwards the rails just move in and bounce
			   against the paper. They are differently timed"). The rail's and the
			   column's presses run while data-focus-on still stands, so their
			   slides started on the 700 curve in, and the paper's margins, set
			   free when the attribute went, on the 480 curve back: two clocks,
			   a gap between rail and paper for the whole slide. data-focus-off
			   names the direction before the first press, and the stylesheet
			   reads the return's clock from it. */
			if (!on) root.setAttribute('data-focus-off', ''); else root.removeAttribute('data-focus-off');
			/* The slide, for this press alone (style.css, THE FOCUS MODE, ON). */
			this.motion();
			/* This press folds the rail: the collapse square leaves with the stack and the expand square stays away (style.css). */
			if (on && railOut) root.setAttribute('data-focus-folds-rail', ''); else root.removeAttribute('data-focus-folds-rail');
			try { if (on) localStorage.setItem(FOCUS_KEY, 'on'); else localStorage.removeItem(FOCUS_KEY); } catch (e) { /* as above */ }
			var commentsOut = root.hasAttribute('data-comments-open');
			if (on) {
				/* What this press folds comes back on the press off: the rail, the comments (Manuel, 2026-09-14). */
				try { sessionStorage.setItem(FOCUS_RESTORE, (railOut ? 'rail ' : '') + (commentsOut ? 'comments' : '')); } catch (e) { /* nothing to restore then */ }
				/* The presses below are the FOCUS press's: rail-collapse.js and
				   comments-side.js read this flag and leave the pace to it. */
				root.setAttribute('data-focus-pressing', '');
				if (railOut) press('.rail-collapse-btn');
				if (commentsOut) press('.comments-open-btn');
				root.removeAttribute('data-focus-pressing');
				if (window.ArchitraveReadingPanel) window.ArchitraveReadingPanel.close();
			} else {
				var back = '';
				try { back = sessionStorage.getItem(FOCUS_RESTORE) || ''; sessionStorage.removeItem(FOCUS_RESTORE); } catch (e) { /* as above */ }
				root.setAttribute('data-focus-pressing', '');
				if (/rail/.test(back) && root.hasAttribute('data-rail-collapsed')) press('.rail-expand-btn');
				if (/comments/.test(back) && !root.hasAttribute('data-comments-open')) press('.comments-open-btn');
				root.removeAttribute('data-focus-pressing');
				/* A STYLE PASS BETWEEN (Manuel, 2026-09-15: the corner square "is
				   just popping up" on the return): the rail's press and the
				   attribute's removal ran in one task, so the square went from
				   display none straight to its resting place with nothing to
				   glide from. The layout is read once here, which makes the
				   browser lay the square out risen before it is let down. */
				void root.offsetWidth;
				root.removeAttribute('data-focus-on');
				this.retime();
			}
			applyFocus();
		}
	};

	document.addEventListener('DOMContentLoaded', function () {
		applyFocus(); /* the stack's square exists now */
		requestAnimationFrame(applyFocus); /* and paper-stack.js has removed a contents square with nothing to list */
		window.addEventListener('load', applyFocus); /* a hidden tab never paints a frame; the count is taken once more when everything is in */
		document.addEventListener('click', function (e) {
			var b = e.target.closest('[data-focus-toggle]');
			if (b) { e.preventDefault(); window.ArchitraveFocus.set(!focusOn()); }
		});
	});

	/* THE LAST SQUARES FADE WHEN THE HAND IS STILL (Manuel, 2026-09-23, the layout
	   pass; as Books and a video player hide their controls): with the mode on,
	   three seconds without the pointer moving stamp data-focus-idle and the eye
	   and the design door fade; any movement, a key or a touch brings them back
	   at once. Never while the pointer rests on one of them or one has focus. */
	var idleTimer = 0;
	function awake() {
		if (root.hasAttribute('data-focus-idle')) root.removeAttribute('data-focus-idle');
		clearTimeout(idleTimer);
		if (!root.hasAttribute('data-focus-on')) return;
		idleTimer = setTimeout(function () {
			var busy = document.querySelector('.paper-stack-focus:hover, .paper-stack-focus:has(:focus-visible), .architrave-panel-opener:hover, .architrave-panel-opener:focus-visible, .architrave-panel-opener[aria-expanded="true"]');
			if (root.hasAttribute('data-focus-on') && !busy) root.setAttribute('data-focus-idle', '');
		}, 3000);
	}
	['pointermove', 'pointerdown', 'keydown', 'touchstart'].forEach(function (t) { document.addEventListener(t, awake, { passive: true }); });
	new MutationObserver(awake).observe(root, { attributes: true, attributeFilter: ['data-focus-on'] });
})();
