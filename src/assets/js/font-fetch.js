/* Live Design Panel: fonts on demand, the owner's half (2026-09-23,
   docs/fonts-on-demand.md; the server's half is fonts-on-demand.php).

   A library face's files are not in the plugin. The first time the page
   names one this site has not fetched, this asks the server to fetch it, and
   then reads the fetched faces' stylesheet again. It does not hook the rows:
   a face reaches the page by the reading font (data-face), the interface font
   (data-sans), a role's pinned font (a family in the root's style) or a style
   pasted or published, and all four end on the root. So it watches the root.

   Printed for the owner only (edit_theme_options). A reader's page never
   fetches anything: until the owner has, a reader sees the section's system
   face, which is the rest of the face's own stack. */
(function () {
	var cfg = window.architraveFonts;
	var lib = window.ArchitraveFontLibrary || [];
	if (!cfg || !lib.length || !window.fetch) return;

	var root = document.documentElement;
	var have = {}, busy = {}, failed = {};
	cfg.have.forEach(function (id) { have[id] = true; });
	/* The family's own name, as the stack starts: "Mona Sans", system-ui, … */
	var names = lib.filter(function (f) { return !f.bundled; }).map(function (f) { /* a face the plugin ships (Fraunces, Routed Gothic) is never fetched: asking for it answered 404 (2026-10-02) */ return { id: f.id, name: f.family.split(',')[0].trim() }; });

	function named() {
		var face = root.getAttribute('data-face'), sans = root.getAttribute('data-sans'), style = root.getAttribute('style') || '';
		return names.filter(function (f) {
			return f.id === face || f.id === sans || style.indexOf(f.name) !== -1;
		}).map(function (f) { return f.id; });
	}

	/* THE ROW WHILE IT LOADS. The panel builds its rows again on every level,
	   so the mark is a rule keyed on the face, not a class on a row. */
	var mark = document.createElement('style');
	mark.id = 'architrave-font-fetch-busy';
	document.head.appendChild(mark);
	function paint() {
		var ids = Object.keys(busy);
		mark.textContent = ids.length
			? ids.map(function (id) {
				return '[data-panel-role-face="' + id + '"], [data-panel-face="' + id + '"], [data-panel-sans="' + id + '"], [data-face-choice="' + id + '"]';
			}).join(', ') + ' { opacity: .5; cursor: progress; }'
			: '';
	}

	function reload(url) {
		if (!url) return;
		var link = document.getElementById('architrave-font-files-css');
		if (!link) {
			link = document.createElement('link');
			link.id = 'architrave-font-files-css';
			link.rel = 'stylesheet';
			document.head.appendChild(link);
		}
		link.href = url;
	}

	function get(id) {
		busy[id] = true;
		paint();
		fetch(cfg.url, {
			method: 'POST',
			credentials: 'same-origin',
			headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': cfg.nonce },
			body: JSON.stringify({ id: id })
		}).then(function (r) {
			return r.json().then(function (j) { if (!r.ok) throw new Error(j && j.message || r.status); return j; });
		}).then(function (j) {
			(j.have || []).forEach(function (x) { have[x] = true; });
			reload(j.css);
		}).catch(function (e) {
			failed[id] = true; /* once a page: a face that could not be fetched is not asked for again on every change */
			if (window.console) console.warn('Live Design Panel: could not fetch the font ' + id + ': ' + e.message);
		}).then(function () {
			delete busy[id];
			paint();
		});
	}

	var queued = false;
	function check() {
		queued = false;
		named().forEach(function (id) {
			if (!have[id] && !busy[id] && !failed[id]) get(id);
		});
	}
	function soon() {
		if (!queued) { queued = true; setTimeout(check, 0); }
	}

	new MutationObserver(soon).observe(root, { attributes: true, attributeFilter: ['data-face', 'data-sans', 'style'] });
	soon();

	/* REMOVE UNUSED FONTS (step 5). The server knows the published styles and
	   keeps their faces itself; it cannot see the owner's browser, so the page
	   says what else it still names: what it wears now, and the owner's own
	   saved styles and adjustments. A face named there stays. Keeping one too
	   many costs a few kilobytes; removing one too many only means it is
	   fetched again when it is next picked. */
	var pruning = false;
	var OWN = ['architrave-own-styles', 'architrave-style-tweaks', 'architrave-face', 'architrave-style'];
	function keep() {
		var raw = OWN.map(function (k) { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } });
		var ids = named();
		lib.forEach(function (f) {
			if (ids.indexOf(f.id) !== -1) return;
			if (raw.some(function (r) { return r === f.id || r.indexOf('"' + f.id + '"') !== -1; })) ids.push(f.id);
		});
		return ids;
	}
	/* The panel draws its page again on every press, so the row pressed is
	   gone by the time the answer comes: the word goes on the row there now. */
	function label(word) {
		var span = document.querySelector('[data-panel-font-prune] .reading-row-label');
		var words = window.architraveWords || {};
		if (span) span.textContent = words[word] || word;
	}
	document.addEventListener('click', function (e) {
		var row = e.target.closest && e.target.closest('[data-panel-font-prune]');
		if (!row || pruning) return;
		pruning = true;
		fetch(cfg.url, {
			method: 'POST',
			credentials: 'same-origin',
			headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': cfg.nonce },
			body: JSON.stringify({ prune: true, keep: keep() })
		}).then(function (r) {
			return r.json().then(function (j) { if (!r.ok) throw new Error(j && j.message || r.status); return j; });
		}).then(function (j) {
			have = {};
			(j.have || []).forEach(function (x) { have[x] = true; });
			reload(j.css);
			pruning = false;
			label((j.removed || []).length ? 'Unused fonts removed' : 'No unused fonts');
		}).catch(function (err) {
			pruning = false;
			if (window.console) console.warn('Live Design Panel: could not remove unused fonts: ' + err.message);
		});
	});

	window.ArchitraveFontFetch = {
		/* How many library faces are on the site: the Font page shows its
		   Remove unused fonts row only when there is something to remove. */
		fetched: function () { return Object.keys(have).length; }
	};
})();
