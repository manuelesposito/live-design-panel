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
	
	var FOCUS_KEY = 'architrave-focus', FOCUS_RESTORE = 'architrave-focus-restore';
	function focusOn() {
		try { return localStorage.getItem(FOCUS_KEY) === 'on'; } catch (e) { return false; }
	}
	function applyFocus() {
		root.removeAttribute('data-focus-mode'); 
		if (focusOn()) root.setAttribute('data-focus-on', ''); else root.removeAttribute('data-focus-on');
		document.querySelectorAll('[data-focus-toggle]').forEach(function (b) { b.setAttribute('aria-pressed', focusOn() ? 'true' : 'false'); });
	}
	applyFocus();
	window.ArchitraveFocus = {
		on: focusOn,
		motion: function (press) {
			root.setAttribute('data-focus-motion', '');
			if (press) root.setAttribute('data-press-motion', ''); else root.removeAttribute('data-press-motion');
			return this.retime();
		},
		retime: function () {
			var ms = parseFloat(getComputedStyle(root).getPropertyValue('--focus-duration')) || 700;
			clearTimeout(window.__architraveFocusMotion);
			window.__architraveFocusMotion = setTimeout(function () { root.removeAttribute('data-focus-motion'); root.removeAttribute('data-focus-folds-rail'); root.removeAttribute('data-press-motion'); root.removeAttribute('data-focus-off'); }, ms + 80);
			return ms;
		},
		set: function (on) {
			var railOut = !root.hasAttribute('data-rail-collapsed');
			
			if (on) root.setAttribute('data-focus-on', '');
			if (!on) root.setAttribute('data-focus-off', ''); else root.removeAttribute('data-focus-off');
			this.motion();
			if (on && railOut) root.setAttribute('data-focus-folds-rail', ''); else root.removeAttribute('data-focus-folds-rail');
			try { if (on) localStorage.setItem(FOCUS_KEY, 'on'); else localStorage.removeItem(FOCUS_KEY); } catch (e) {  }
			var commentsOut = root.hasAttribute('data-comments-open');
			if (on) {
				try { sessionStorage.setItem(FOCUS_RESTORE, (railOut ? 'rail ' : '') + (commentsOut ? 'comments' : '')); } catch (e) {  }
				root.setAttribute('data-focus-pressing', '');
				if (railOut) press('.rail-collapse-btn');
				if (commentsOut) press('.comments-open-btn');
				root.removeAttribute('data-focus-pressing');
				if (window.ArchitraveReadingPanel) window.ArchitraveReadingPanel.close();
			} else {
				var back = '';
				try { back = sessionStorage.getItem(FOCUS_RESTORE) || ''; sessionStorage.removeItem(FOCUS_RESTORE); } catch (e) {  }
				root.setAttribute('data-focus-pressing', '');
				if (/rail/.test(back) && root.hasAttribute('data-rail-collapsed')) press('.rail-expand-btn');
				if (/comments/.test(back) && !root.hasAttribute('data-comments-open')) press('.comments-open-btn');
				root.removeAttribute('data-focus-pressing');
				void root.offsetWidth;
				root.removeAttribute('data-focus-on');
				this.retime();
			}
			applyFocus();
		}
	};
	document.addEventListener('DOMContentLoaded', function () {
		applyFocus(); 
		requestAnimationFrame(applyFocus); 
		window.addEventListener('load', applyFocus); 
		document.addEventListener('click', function (e) {
			var b = e.target.closest('[data-focus-toggle]');
			if (b) { e.preventDefault(); window.ArchitraveFocus.set(!focusOn()); }
		});
	});
	
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
