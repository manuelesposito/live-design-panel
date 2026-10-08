/* THE CAP NEEDS ROOM (2026-10-08, Manuel, the index under Reading Room: "if we just have four lines of an
   excerpt, having a drop cap occupying three lines is a misproportion ... to have a drop cap we at least need a
   nice long paragraph"). A drop cap is drawn only where the paragraph runs at least two lines past the cap's
   height: a three-line cap wants five lines, a two-line cap four. A shorter paragraph keeps its first letter
   plain. The stylesheets (the theme's, the panel's on any theme, the kit's on a plain page) draw the cap from
   --reading-dropcap, which a paragraph inherits from the root; a paragraph too short is told `normal` on itself,
   and the gap beside the letter goes with it. Measured with the cap off, since a three-line cap makes a two-line
   paragraph three lines tall. Measured again when the page resizes, when the fonts arrive, and whenever the
   style changes anything on the root (the dial, the text size, the face, the column), since each of these moves
   the lines. Never touched: a page where the cap is off. */
(function () {
	var root = document.documentElement;
	var SEL = '.wp-block-post-content > p:first-of-type, .wp-block-post-excerpt > p:first-of-type, .entry-content > p:first-of-type, [data-role="read"] > p:first-of-type';
	var ROOM = 2; 
	var MARK = 'data-cap-short';
	var queued = false;
	function capLines() { return parseInt(root.getAttribute('data-dropcap-lines'), 10) || 3; }
	function linesOf(p) {
		var cs = window.getComputedStyle(p), lh = parseFloat(cs.lineHeight);
		if (!lh) lh = 1.5 * parseFloat(cs.fontSize);
		return Math.round(p.getBoundingClientRect().height / lh);
	}
	function plain(p) { p.style.setProperty('--reading-dropcap', 'normal'); p.style.setProperty('--reading-dropcap-gap', '0'); p.setAttribute(MARK, ''); }
	function cap(p) { p.style.removeProperty('--reading-dropcap'); p.style.removeProperty('--reading-dropcap-gap'); p.removeAttribute(MARK); }
	function run() {
		queued = false;
		var ps = Array.prototype.slice.call(document.querySelectorAll(SEL));
		if (!ps.length) return;
		if (root.getAttribute('data-dropcap') !== 'on') { ps.forEach(function (p) { if (p.hasAttribute(MARK)) cap(p); }); return; }
		var need = capLines() + ROOM;
		ps.forEach(plain); 
		var tall = ps.map(function (p) { return linesOf(p) >= need; });
		ps.forEach(function (p, i) { if (tall[i]) cap(p); });
	}
	function soon() { if (queued) return; queued = true; window.requestAnimationFrame(run); }
	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
	window.addEventListener('load', soon);
	window.addEventListener('resize', soon);
	if (document.fonts && document.fonts.ready) document.fonts.ready.then(soon);
	new MutationObserver(soon).observe(root, { attributes: true });
	window.ArchitraveDropcap = { run: run };
})();
