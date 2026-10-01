/**
 * Architrave — the styles.
 *
 * Four named looks a reader can put on: Standard, Book, Clear and Terminal
 * (Arcade waits backstage). Until 2026-09-09 they were "presets": a press that set the four
 * dials (colours, reading size, face, line spacing) and remembered nothing of
 * its own, so the moment a dial moved the preset was simply gone, and the
 * looks that made a style a style, grain, a drop cap, a justified column,
 * hung on the COLOUR room instead. Manuel, in Book, switching the colour to
 * Matrix: "that would probably be a customisation of the Book style, and Book
 * would lose its check mark". That is the Apple Books shape, and it is the
 * shape now:
 *
 * A STYLE IS A STATE OF ITS OWN. It is written on <html> as `data-style`
 * before first paint and held in localStorage like the dials, and the
 * stylesheet hangs the style's looks on that attribute: `data-style="book"`
 * is what draws the grain and the drop cap, whichever colours are under it.
 * Standard is the absence of the attribute, as Newsreader is the absence of
 * a face.
 *
 * A STYLE HAS A RECIPE, the four dial values it presses when chosen. It does
 * not name a side: light or dark is the reader's, and a style keeps it.
 *
 * A STYLE IS NOT LOST BY TWEAKING IT. Move a dial while Book is on and Book
 * stays on, marked "adjusted"; the tweak is remembered for Book, so coming
 * back to Book after a visit to Terminal finds it as you left it. Only a
 * tweak made by a reader's own press is remembered: a dial the site moves
 * for other reasons (a hidden room falling back to Neutral) is not a wish.
 *
 * IT DRIVES THE CONTROLS RATHER THAN THE STORAGE. Each dial has its own
 * script with its own key, its own attribute and its own marks; a style
 * presses the rows the reader would press, so every control keeps its own
 * handler, its own storage and its own proof. The rows exist on every page,
 * because the rail's flyouts are in the document whether open or not.
 *
 * THE LIST IS THIS THEME'S, like the faces: which looks a site offers whole
 * is the site's decision. Palettes and sides are the system's registry
 * (quire.modes.js); the ids below are checked against it.
 */
(function () {
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
	var Modes = window.QuireModes;
	var KEY = 'architrave-style';
	var TWEAKS_KEY = 'architrave-style-tweaks';
	var ATTR = 'data-style';
	var DEFAULT = 'standard';
	var GUEST = !!window.architravePanelGuest, NONE = GUEST ? 'host' : 'standard';
	var PENDING = null; 
	var WORDS = window.architraveWords || {};
	function t(word) { return WORDS[word] || word; }
	var STYLES = [
		
		{ id: 'standard', label: 'Classic',  palette: 'neutral', tint: 'purple', sans: 'inter', reading: 'default', face: 'newsreader', leading: 'default', justify: false, dropcap: false, rounded: true, lines: false, bold: false, scope: 'article', fills: true, roles: {} },
		{ id: 'book', label: 'Book', measure: '60',  palette: 'paper', tint: 'brown', sans: 'hyperlegible', reading: 'default', face: 'vollkorn', leading: 'default', justify: true, dropcap: true, rounded: false, lines: false, bold: false, scope: 'article', fills: true, roles: {}   }  ,
		
		{ id: 'large', label: 'Poster', measure: '60',   palette: 'grey', tint: 'blue', sans: 'hyperlegible', reading: 'large',  face: 'hyperlegible', leading: 'airy', justify: false, dropcap: false, rounded: false, lines: false, bold: true, scope: 'article', fills: true, pictures: 'accent', roles: { kicker: { italic: false }, head: { weight: 'extrabold', tracking: 'tight', size: '56' }, read: { weight: 'medium' }, quote: { size: '32' }  } }, 
		
		
		{ id: 'terminal', label: 'Matrix', measure: '88',   palette: 'terminal', tint: 'green', sans: 'martian-mono', reading: 'default', face: 'martian-mono', leading: 'relaxed', justify: false, dropcap: false, rounded: false, lines: true, bold: false, scope: 'article', fills: true,  scan: '2', line: '10', glow: true, pictures: 'duo', roles: { kicker: { italic: false, caps: true, tracking: 'p10', size: '18' }, head: { weight: 'semibold', size: '40', tracking: 'm2', members: { sub: { size: '22', caps: true, tracking: 'p5' } } }, title: { caps: true, tracking: 'p10' }, quote: { italic: false, size: '22' } }  }, 
		{ id: 'console', label: 'Terminal', measure: '80',  palette: 'neutral', tint: 'blue', sans: 'mono', reading: 'default', face: 'mono', leading: 'relaxed', justify: false, dropcap: false, rounded: false, lines: true, line: '60', bold: false, scope: 'article', fills: false, pictures: 'bw', preset: 'carbon', roles: { kicker: { italic: false, caps: true, tracking: 'p10', size: '18' }, head: { weight: 'semibold', size: '40', tracking: 'm2', members: { sub: { size: '22', caps: true, tracking: 'p5' } } }, title: { caps: true, tracking: 'p10' }, quote: { italic: false, size: '22' } }  },
		
		{ id: 'blueprint', label: 'Blueprint', measure: '80',  palette: 'neutral', tint: 'blue', sans: 'plex-sans', reading: 'default', face: 'plex-sans', leading: 'relaxed', justify: false, dropcap: false, rounded: false, lines: true, line: '30', linestyle: 'dashed', bold: false, scope: 'article', fills: false,  pictures: 'accent', preset: 'draft', roles: { kicker: { face: 'jetbrains-mono', italic: false, caps: true, tracking: 'p10', size: '16', weight: 'medium' }, head: { face: 'jetbrains-mono', weight: 'bold', italic: true, size: '56',  members: { sub: { size: '28' } } }, read: { weight: 'light' }, quote: { italic: true, size: '24', weight: 'light' }, small: { face: 'jetbrains-mono', caps: true, tracking: 'p5', members: { captions: { caps: false, tracking: 'default' }, author: { caps: false, tracking: 'default' } } }, title: { face: 'jetbrains-mono', caps: true, tracking: 'p10' } }  },
		{ id: 'instrument', label: 'Instrument', space: 'compact',  palette: 'neutral', tint: 'green', sans: 'inter', reading: 'small',  face: 'inter', leading: 'default', justify: false, dropcap: false, rounded: true, corners: 'small',  lines: true, line: '10', hairlines: true,  bold: false, scope: 'article', fills: true,  soft: true, softlevel: '30',  quietlevel: '40',   picturedim: true, pictureframe: false,  alternates: true,  titlefinish: 'shine', headitalics: 'serif', headarrival: 'blur', cardlight: 'glow', buttonfinish: 'glow', button: 'ink', toppattern: 'dots', guides: 'dashed', greytint: '10', pageglow: 'soft', movinglight: 'on', effects: { serif: { which: 'last' }, arrival: { scope: 'all' }, cardlight: { level: '75', colour: 'light' }, moving: { where: 'all' }, button: { glow: 'light', sweep: 'on' }, pattern: { level: '50', colour: 'light' }, guides: { level: '50', colour: 'light', marks: 'on' }, pointer: { look: 'on' }, dividers: { look: 'glow' }, topline: { look: 'on' }, picglow: { look: 'soft' } }, colours: { dark: { light: '#9b7cff', second: '#5ad8ff' } },    preset: 'limelight', roles: { kicker: { italic: false }, head: { weight: 'semibold', leading: 'tight',  members: { sub: { weight: 'semibold', tracking: 'p1' } }  }, quote: { italic: false }, title: { weight: 'medium' } }  },
		{ id: 'catalogue', label: 'Catalogue', space: 'spacious',  palette: 'neutral', tint: 'green', sans: 'ibm-plex-mono', reading: 'compact', face: 'source-serif-4', leading: 'snug',  justify: false, dropcap: false, rounded: true, corners: 'small', lines: true, line: '20', bold: false, scope: 'article', fills: true, soft: false,  pictureframe: true, framewidth: '16', framepattern: 'checker',  measure: '84',  widepicture: true, categories: 'above', dots: true, marker: true, button: 'ink', preset: 'vellum', roles: { head: { face: 'source-serif-4', weight: 'light',  size: '112',  tracking: 'm2',  leading: 'dense',  align: 'center',  members: { sub: { size: '56', align: 'default' } }  }, kicker: { face: 'ibm-plex-mono', caps: true, italic: false, weight: 'medium', size: '14', align: 'center' }, title: { face: 'ibm-plex-mono', caps: true, weight: 'medium' }, quote: { face: 'source-serif-4' } } },
		{ id: 'gallery', label: 'Gallery', space: 'spacious', palette: 'neutral', tint: 'blue', sans: 'inter', reading: 'small', face: 'inter', leading: 'snug', justify: false, dropcap: false, rounded: true, corners: 'large', buttonshape: 'pill', preset: 'gallery', button: 'own', colours: { light: { button: '#0071e3' }, dark: { button: '#0a84ff' } },    lines: false, bold: false, scope: 'article', fills: true, soft: false, widepicture: true, pictureframe: false, categories: 'above', roles: { head: { weight: 'semibold', size: '80', leading: 'tight',  tracking: 'm1',  align: 'center', members: { sub: { size: '40', align: 'default' } }  }, kicker: { weight: 'semibold', size: '20', tracking: 'p2', italic: false, caps: false, align: 'center' }, title: { weight: 'semibold' }, quote: { italic: false } } },
		{ id: 'storybook', label: 'Storybook', space: 'spacious', palette: 'neutral', tint: 'green', preset: 'meadow', button: 'own', colours: { light: { button: '#ffffff' }, dark: { button: '#ffffff' } },  sans: 'inter', reading: 'small', face: 'inter', leading: 'snug', justify: false, dropcap: false, rounded: true, corners: 'xlarge', buttonshape: 'pill', lines: false, bold: false, scope: 'article', fills: true, soft: false, widepicture: true, pictureframe: false, categories: 'above', roles: { head: { weight: 'medium', size: '128', tracking: 'm2', leading: 'dense', align: 'center', members: { sub: { weight: 'medium', size: '56', align: 'default' } }  }, kicker: { weight: 'medium', italic: false, caps: false, align: 'center' }, title: { weight: 'medium' }, quote: { italic: false } } },
		{ id: 'specimen', label: 'Specimen', space: 'spacious', palette: 'neutral', tint: 'green', preset: 'lichen', sans: 'roboto-mono', reading: 'small', face: 'inter-tight', leading: 'snug', justify: false, dropcap: false, rounded: true, lines: true, line: '20', hairlines: true, bold: false, scope: 'article', fills: true, soft: false,  button: 'ink',  darkground: true,  widehead: true,  widepicture: true, pictureframe: false, roles: { head: { face: 'inter-tight', weight: 'regular', size: '128', leading: 'tight', members: { sub: { weight: 'regular', size: '48' } }  }, kicker: { face: 'roboto-mono', caps: true, italic: false, weight: 'regular', size: '16', colour: 'accent'  } , small: { caps: true, members: { captions: { caps: false }, author: { caps: false } } }, ui: { members: { masthead: { weight: 'regular' } } }, title: { caps: true, weight: 'regular' }  } },
		{ id: 'terracotta', label: 'Terracotta', space: 'spacious', palette: 'neutral', tint: 'orange', preset: 'corten', button: 'ink',  sans: 'schibsted-grotesk', reading: 'small', face: 'source-serif-4', leading: 'snug', justify: false, dropcap: false, rounded: true, corners: 'medium', buttonshape: 'pill', lines: true, line: '20', bold: false, scope: 'article', fills: false,  soft: false, widepicture: true, pictureframe: false, marker: true, markercolour: 'orange',  roles: { head: { face: 'schibsted-grotesk', weight: 'semibold', size: '56', caps: true, tracking: 'p12',  leading: 'tight', align: 'center', members: { sub: { size: '28', caps: true } }  }, kicker: { face: 'schibsted-grotesk', weight: 'regular', size: '16', caps: true, tracking: 'p10', italic: false, align: 'center' }, small: { face: 'dm-mono', tracking: 'm2'  }, title: { caps: true, weight: 'regular', tracking: 'p5' }  } },
		
		{ id: 'arcade', label: 'Arcade', measure: '60',  palette: 'arcade', tint: 'orange', sans: 'martian-mono', reading: 'default', face: 'geist', leading: 'default', justify: false, dropcap: false, rounded: true, lines: false, bold: false, scope: 'article', fills: true, scanlines: true, vignette: true, pictures: 'duo', roles: { kicker: { face: 'handjet', caps: true, tracking: 'wide', italic: false }, head: { face: 'handjet', weight: 'bold', tracking: 'wide', caps: true }, small: { weight: 'medium', caps: true, tracking: 'wide' }, title: { caps: true, tracking: 'widest' } }  }, 
		{ id: 'tube', label: 'Tube', palette: 'neutral', tint: 'blue', preset: 'television', sans: 'libre-franklin', reading: 'default', face: 'libre-franklin', leading: 'default', justify: false, dropcap: false, rounded: true, lines: true, line: '60', bold: false, scope: 'article', fills: false, soft: true, button: 'ink', buttonshape: 'rounded', buttonstyle: 'outlined', pictures: 'bw', scanlines: true, scan: '3', glow: true, grain: true, grainlevel: '2', graincrawl: 'moving', vignette: true, vignettelevel: '2', bloom: 'soft', shimmer: 'soft', switchon: 'on', static: 'on', bootscreen: 'card', effects: { glow: { reach: 'headings' }, vignette: { night: 'half' } }, roles: { head: { face: 'league-gothic', weight: 'regular', caps: true, size: '80', leading: 'tight', members: { sub: { size: '40', weight: 'regular' } } }, kicker: { italic: false, caps: true, tracking: 'p12', weight: 'semibold', size: '13' }, small: { caps: true, tracking: 'p12', weight: 'semibold', members: { author: { caps: false, tracking: 'default', weight: 'regular' } } }, title: { caps: true, tracking: 'p12' }, quote: { italic: true } } }, 
		{ id: 'brochure', label: 'Brochure', palette: 'neutral', tint: 'brown', preset: 'newsprint', sans: 'stix-two-text', reading: 'default', face: 'stix-two-text', leading: 'tight', measure: '68', justify: false, dropcap: false, rounded: false, lines: false, bold: false, scope: 'article', fills: false, widehead: true, widepicture: true, categories: 'above', button: 'ink', buttonstyle: 'text', buttonmedium: 'text', buttonquiet: 'gray',  links: 'underlined', pictures: 'sepia', pictureframe: false, grain: true, grainlevel: '1', graincrawl: 'moving', vignette: true, vignettelevel: '2', vignettereach: '2', edges: 'yellowed', fringe: 'sliptitle', columns: '1', paragraphs: 'indented', rainbow: 'logo', postband: 'rainbow', footband: 'plate', stripes: 'gaps', menuline: 'underlined', legalline: 'on', sitename: 'caps', roles: { head: { face: 'stix-two-text', weight: 'medium', size: '112', tracking: 'm2', leading: 'tight', align: 'center', members: { sub: { size: '40', weight: 'medium', align: 'default' } } }, kicker: { face: 'stix-two-text', italic: true, size: '22', align: 'center' }, small: { face: 'stix-two-text', italic: true, size: '20' }, ui: { size: '18', members: { masthead: { size: '26' } } }, title: { face: 'crimson-pro' }, quote: { italic: true } } }, 
	];
	if (!window.architravePanelGuest) STYLES.forEach(function (s) { if (s.id === 'standard') s.label = 'Original'; });
	var OWN_KEY = 'architrave-own-styles';
	var HIDDEN_KEY = 'architrave-hidden-order'; 
	function hiddenOrder() { try { var l = JSON.parse(localStorage.getItem(HIDDEN_KEY) || '[]'); return Array.isArray(l) ? l : []; } catch (e) { return []; } }
	function readOwn() {
		try { var list = JSON.parse(localStorage.getItem(OWN_KEY) || '[]'); return Array.isArray(list) ? list : []; } catch (e) { return []; }
	}
	function writeOwn() {
		try { localStorage.setItem(OWN_KEY, JSON.stringify(STYLES.filter(function (x) { return x.own; }))); } catch (e) {  }
	}
	readOwn().forEach(function (o) { if (o && typeof o.id === 'string' && /^own-/.test(o.id) && o.label) { liftCentre(o); o.own = true; STYLES.push(o); } });
	var SITE = { styles: [], 'default': '' };
	var PUBLISH = window.architravePublish || null;
	function baseOf(s) { return (s.own || s.site) ? (s.base || 'standard') : s.id; }
	function takeSite(state) {
		for (var i = STYLES.length - 1; i >= 0; i--) if (STYLES[i].site) STYLES.splice(i, 1);
		SITE = state && typeof state === 'object' ? state : { styles: [], 'default': '' };
		(Array.isArray(SITE.styles) ? SITE.styles : []).forEach(function (o) {
			if (o && typeof o.id === 'string' && /^site-[a-z0-9]+$/.test(o.id) && o.label) { var lb = plainName(o.label); o = liftCentre(plain(o) || {}); o.label = lb; o.site = true; delete o.own; STYLES.push(o); }
		});
		var d = STYLES.filter(function (x) { return !x.own && !x.host && (GUEST || x.id !== 'standard') && x.id === SITE['default']; })[0];
		var host = STYLES.filter(function (x) { return x.host; })[0];
		if (d) { STYLES.splice(STYLES.indexOf(d), 1); STYLES.splice(0, 0, d); DEFAULT = d.id; }
		else DEFAULT = NONE; 
		if (host) { STYLES.splice(STYLES.indexOf(host), 1); STYLES.splice(d ? 1 : 0, 0, host); }
	}
	takeSite(window.architraveSiteStyles);
	function encodeRecord(obj) {
		try { return btoa(unescape(encodeURIComponent(JSON.stringify(obj)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); } catch (e) { return ''; }
	}
	function decodeRecord(str) {
		try {
			str = String(str || '').replace(/-/g, '+').replace(/_/g, '/');
			while (str.length % 4) str += '=';
			var data = JSON.parse(decodeURIComponent(escape(atob(str))));
			return data && data.architrave === 1 ? data : null;
		} catch (e) { return null; }
	}
	
	function plain(v, depth) {
		if (typeof v === 'string') return /[<>"'`\\&]/.test(v) ? undefined : v;
		if (typeof v === 'number' || typeof v === 'boolean') return v;
		if (!v || typeof v !== 'object' || Array.isArray(v) || (depth || 0) > 6) return undefined;
		var out = {};
		Object.keys(v).forEach(function (k) { if (!/^[A-Za-z][A-Za-z0-9_-]{0,47}$/.test(k)) return; var c = k === 'hostFace' && typeof v[k] === 'string' && /^[\w\s,.'"-]{1,200}$/.test(v[k]) ? v[k] : plain(v[k], (depth || 0) + 1); if (c !== undefined) out[k] = c; }); 
		return out;
	}
	function plainName(x) { return String(x || '').replace(/[<>"'`\\&]/g, '').trim(); }
	function liftCentre(rec, style) {
		if (!rec || typeof rec !== 'object') return rec;
		if (rec.corners === 'pill') { delete rec.corners; if (typeof rec.pillbuttons !== 'boolean') rec.pillbuttons = true; }
		if (rec.pillbuttons !== undefined) { var pb = rec.pillbuttons === true; delete rec.pillbuttons; if (pb) { if (rec.buttonshape === undefined) rec.buttonshape = 'pill'; } else if (style && rec.buttonshape === undefined) rec.buttonshape = 'cards'; }
		if (rec.inkbutton !== undefined) { var ib = rec.inkbutton === true; delete rec.inkbutton; if (ib) { if (rec.button === undefined) rec.button = 'ink'; } else if (style && rec.button === undefined) rec.button = 'accent'; }
		if (rec.kickerabove !== undefined) { var ka = rec.kickerabove === true; delete rec.kickerabove; if (ka) { if (rec.categories === undefined) rec.categories = 'above'; } else if (style && rec.categories === undefined) rec.categories = 'below'; }
		if (rec.centretitle === undefined) return rec;
		var on = rec.centretitle === true;
		delete rec.centretitle;
		if (!on && !style) return rec;
		var roles = rec.roles && typeof rec.roles === 'object' ? rec.roles : (rec.roles = {});
		['head', 'kicker'].forEach(function (r) {
			var o = roles[r] && typeof roles[r] === 'object' ? roles[r] : (roles[r] = {});
			if (o.align === undefined) o.align = on ? 'center' : 'default';
		});
		if (on) {
			var h = roles.head;
			if (!h.members || typeof h.members !== 'object') {
				var sm = style && style.roles && style.roles.head && style.roles.head.members;
				h.members = sm ? JSON.parse(JSON.stringify(sm)) : {};
			}
			var sub = h.members.sub && typeof h.members.sub === 'object' ? h.members.sub : (h.members.sub = {});
			if (sub.align === undefined) sub.align = 'default';
		}
		return rec;
	}
	function ownFromRecord(data, name) {
		var named = plainName(name || data.label);
		data = liftCentre(plain(data) || {});
		data.label = named;
		var entry = { id: 'own-' + Date.now().toString(36), label: data.label.slice(0, 40) || t('My style'), own: true, base: byId(data.base) ? data.base : STYLES[0].id };
		DIALS.forEach(function (d) { if (data[d] !== undefined) entry[d] = data[d]; });
		OPTS.forEach(function (k) { if (typeof data[k] === 'boolean') entry[k] = data[k]; });
		['tint', 'sans', 'scope', 'pictures', 'capLines', 'scan', 'line', 'fill', 'glowlevel', 'grainlevel', 'vignettelevel', 'vignettereach', 'softlevel', 'quietlevel', 'smallsoft', 'measure', 'space', 'framewidth', 'dotsize', 'dotlevel', 'linestyle', 'corners', 'fadeedges', 'markercolour', 'framepattern', 'button', 'buttonshape', 'buttonstyle', 'buttonmedium', 'buttonquiet', 'tags', 'chosenitem', 'linewidth', 'cards', 'quotes', 'notes', 'fields', 'titlefinish', 'headitalics', 'headarrival', 'cardlight', 'buttonfinish', 'toppattern', 'guides', 'greytint', 'pageglow', 'movinglight', 'monitorframe', 'fringe', 'crisp', 'scanstyle', 'shimmer', 'warp', 'switchon', 'bloom', 'ghosting', 'jitter', 'graincrawl', 'typedtitle', 'bootscreen', 'roomglass', 'phosphor', 'static', 'dropout', 'headrule', 'ink', 'tooth', 'edges', 'columns', 'paragraphs', 'rainbow', 'postband', 'footband', 'menuline', 'legalline', 'stripes', 'sitename', 'fullpicture', 'categories', 'links', 'unlinked'].forEach(function (k) { if (data[k] !== undefined) entry[k] = data[k]; });
		if (data.roles && typeof data.roles === 'object') entry.roles = data.roles;
		if (data.effects && typeof data.effects === 'object') { var fx0 = effectsOf({ effects: data.effects }, null); if (Object.keys(fx0).length) entry.effects = fx0; } 
		if (data.colours && typeof data.colours === 'object') entry.colours = data.colours;
		var shape = function (x) { var c = {}; Object.keys(x).forEach(function (k) { if (k !== 'id') c[k] = x[k]; }); return JSON.stringify(c); };
		var had = STYLES.filter(function (x) { return x.own && shape(x) === shape(entry); })[0];
		if (had) return had;
		STYLES.push(entry); writeOwn();
		return entry;
	}
	
	var READER = !!window.architravePanelReader;
	function readerPicks() {
		if (SITE && Array.isArray(SITE.readers)) return SITE.readers.filter(function (id) { return typeof id === 'string'; }); 
		return (window.architravePanelGuest ? ['standard', 'instrument'] : ['standard', 'book', 'instrument']).filter(function (id) { return id !== DEFAULT; }).slice(0, 2);
	}
	var PUBLIC = ['standard', 'terminal', 'instrument', 'catalogue', 'gallery', 'tube', 'brochure']; 
	function offered(p) {
		if (READER) return !!(p.host || p.id === DEFAULT || readerPicks().indexOf(p.id) !== -1);
		if (window.architravePanelGuest && !(p.host || p.own || p.site || p.id === DEFAULT || PUBLIC.indexOf(p.id) !== -1 || readerPicks().indexOf(p.id) !== -1)) return false;
		return true;
	}
	
	var DIALS = ['palette', 'reading', 'face', 'leading'];
	var OPTS = ['justify', 'dropcap', 'rounded', 'lines', 'fills', 'darkground', 'widehead', 'hairlines', 'picturehover', 'picturedim', 'picturefade', 'pictureframe', 'scanlines', 'glow', 'grain', 'vignette', 'soft', 'alternates', 'dots', 'marker', 'widepicture', 'tagsfollow'];
	var TINTS = ['purple', 'brown', 'green', 'blue', 'orange'];
	var SCOPE = ['article', 'all'];
	var PICTURES = ['plain', 'bw', 'sepia', 'duo', 'accent', 'halftone', 'dither', 'grain', 'hidden'];
	var CAP_LINES = ['3', '2', '4'];
	var BUTTONS = ['accent', 'ink', 'own'];
	var LINE_STYLE = ['solid', 'dashed', 'dotted'];
	var CORNERS = ['medium', 'small', 'large', 'xlarge'];
	var FADE_EDGES = ['sides', 'bottom', 'all'];
	var MARKERS = ['yellow', 'green', 'pink', 'blue', 'orange', 'text', 'muted', 'own'];
	var FRAME_PATTERNS = ['plain', 'dots', 'checker'];
	var PICKS = { fullpicture: { attr: 'data-full-picture', list: ['off', 'on'] }, categories: { attr: 'data-categories', list: ['below', 'above', 'hidden'] }, buttonshape: { attr: 'data-button-shape', list: ['cards', 'square', 'rounded', 'pill'] }, buttonstyle: { attr: 'data-button-style', list: ['filled', 'outlined', 'shadow', 'tinted', 'gray', 'text'] }, buttonmedium: { attr: 'data-button-medium', list: ['gray', 'filled', 'tinted', 'outlined', 'shadow', 'text'] }, buttonquiet: { attr: 'data-button-quiet', list: ['text', 'filled', 'tinted', 'gray', 'outlined', 'shadow'] }, tags: { attr: 'data-tags', list: ['text', 'filled', 'tinted', 'gray', 'outlined'] }, chosenitem: { attr: 'data-chosen-item', list: ['gray', 'filled', 'outlined', 'bold'] }, linewidth: { attr: 'data-line-width', list: ['1', '2', '3', '5'] }, cards: { attr: 'data-cards', list: ['box', 'top', 'flat', 'raised'] }, quotes: { attr: 'data-quotes', list: ['line', 'plain', 'box'] }, notes: { attr: 'data-notes', list: ['flat', 'box', 'raised'] }, fields: { attr: 'data-fields', list: ['flat', 'box', 'raised'] }, titlefinish: { attr: 'data-title-finish', list: ['flat', 'shine', 'accent'] }, headitalics: { attr: 'data-head-italics', list: ['same', 'serif', 'classic', 'vollkorn', 'fraunces'] }, headarrival: { attr: 'data-head-arrival', list: ['none', 'fade', 'blur'] }, cardlight: { attr: 'data-card-light', list: ['off', 'edge', 'glow'] }, buttonfinish: { attr: 'data-button-finish', list: ['flat', 'glass', 'glow'] }, toppattern: { attr: 'data-top-pattern', list: ['none', 'dots', 'grid', 'cross', 'diagonal'] }, guides: { attr: 'data-guides', list: ['off', 'solid', 'dashed'] }, greytint: { attr: 'data-grey-tint', list: ['0', '5', '10', '15'] }, pageglow: { attr: 'data-page-glow', list: ['off', 'soft', 'strong'] }, movinglight: { attr: 'data-moving-light', list: ['off', 'on'] }, monitorframe: { attr: 'data-monitor-frame', list: ['off', 'thin', 'medium', 'thick'] }, fringe: { attr: 'data-fringe', list: ['off', 'faint', 'soft', 'strong', 'slip', 'sliptitle'] }, crisp: { attr: 'data-crisp', list: ['off', 'headings', 'all'] }, scanstyle: { attr: 'data-scan-style', list: ['lines', 'grille', 'both'] }, shimmer: { attr: 'data-shimmer', list: ['off', 'soft', 'roll'] }, warp: { attr: 'data-warp', list: ['off', 'slight', 'bulged', 'strong'] }, switchon: { attr: 'data-switch-on', list: ['off', 'on'] }, bloom: { attr: 'data-bloom', list: ['off', 'soft', 'strong'] }, ghosting: { attr: 'data-ghosting', list: ['off', 'on'] }, jitter: { attr: 'data-jitter', list: ['off', 'rare', 'often'] }, graincrawl: { attr: 'data-grain-crawl', list: ['still', 'moving'] }, typedtitle: { attr: 'data-typed-title', list: ['off', 'on'] }, bootscreen: { attr: 'data-boot-screen', list: ['off', 'on', 'card'] }, roomglass: { attr: 'data-room-glass', list: ['off', 'on'] }, phosphor: { attr: 'data-phosphor', list: ['off', 'blue', 'green', 'amber', 'white', 'black'] }, static: { attr: 'data-static', list: ['off', 'on'] }, dropout: { attr: 'data-dropout', list: ['off', 'on'] }, headrule: { attr: 'data-head-rule', list: ['off', 'on'] }, ink: { attr: 'data-ink', list: ['sharp', 'spread'] }, tooth: { attr: 'data-tooth', list: ['off', 'on'] }, edges: { attr: 'data-edges', list: ['ink', 'yellowed'] }, columns: { attr: 'data-columns', list: ['1', '2', '3'] }, paragraphs: { attr: 'data-paragraphs', list: ['spaced', 'indented'] }, rainbow: { attr: 'data-rainbow', list: ['off', 'rule', 'mark', 'both', 'logo'] }, postband: { attr: 'data-post-band', list: ['off', 'rainbow', 'logo'] }, footband: { attr: 'data-foot-band', list: ['off', 'on', 'plate'] }, menuline: { attr: 'data-menu-line', list: ['plain', 'underlined'] }, legalline: { attr: 'data-legal-line', list: ['off', 'on'] }, stripes: { attr: 'data-stripes', list: ['solid', 'gaps'] }, sitename: { attr: 'data-site-name', list: ['plain', 'caps'] }, links: { attr: 'data-links', list: ['both', 'coloured', 'underlined'] } };
	var EFFECTS = { title: { depth: { list: ['50', '70', '30'], rest: '50' }, dir: { list: ['diagonal', 'down', 'across'], rest: 'diagonal' }, colour: { list: ['light', 'second', 'accent', 'ink'], rest: 'light' }, reach: { list: ['all', 'title'], rest: 'all' } }, serif: { which: { list: ['italics', 'last', 'title'], rest: 'italics' }, style: { list: ['italic', 'upright'], rest: 'italic' } }, arrival: { speed: { list: ['calm', 'quick', 'slow'], rest: 'calm' }, blur: { list: ['8', '4', '14'], rest: '8' }, scope: { list: ['headings', 'text', 'all'], rest: 'headings' } }, cardlight: { level: { list: ['100', '25', '50', '75'], rest: '100' }, colour: { list: ['auto', 'light', 'second', 'accent', 'ink'], rest: 'auto' }, edge: { list: ['70', '40', '100'], rest: '70' }, reach: { list: ['55', '35', '85'], rest: '55' } }, moving: { colour: { list: ['light', 'second', 'accent', 'ink'], rest: 'light' }, speed: { list: ['7', '11', '4'], rest: '7' }, length: { list: ['34', '20', '55'], rest: '34' }, where: { list: ['cards', 'buttons', 'all'], rest: 'cards' }, rhythm: { list: ['constant', 'now'], rest: 'constant' } }, button: { glow: { list: ['fill', 'light', 'second', 'accent', 'ink'], rest: 'fill' }, level: { list: ['75', '40', '100'], rest: '75' }, ring: { list: ['on', 'off'], rest: 'on' }, lift: { list: ['on', 'off'], rest: 'on' }, sweep: { list: ['off', 'on'], rest: 'off' }, glass: { list: ['2', '1', '3'], rest: '2' } }, pattern: { level: { list: ['100', '25', '50', '75'], rest: '100' }, colour: { list: ['ink', 'light', 'second', 'accent'], rest: 'ink' }, size: { list: ['m', 's', 'l'], rest: 'm' }, reach: { list: ['560', '300', '900', 'all'], rest: '560' } }, guides: { level: { list: ['100', '25', '50', '75'], rest: '100' }, colour: { list: ['ink', 'light', 'second', 'accent'], rest: 'ink' }, marks: { list: ['off', 'on'], rest: 'off' } }, tint: { colour: { list: ['light', 'second', 'accent'], rest: 'light' } }, aurora: { first: { list: ['light', 'second', 'accent', 'ink'], rest: 'light' }, second: { list: ['second', 'light', 'accent', 'ink'], rest: 'second' }, place: { list: ['title', 'top', 'page'], rest: 'title' }, speed: { list: ['slow', 'still', 'lively'], rest: 'slow' }, shape: { list: ['glow', 'beams'], rest: 'glow' } }, pointer: { look: { list: ['off', 'on'], rest: 'off' }, colour: { list: ['light', 'second', 'accent', 'ink'], rest: 'light' } }, dividers: { look: { list: ['plain', 'fade', 'glow'], rest: 'plain' }, colour: { list: ['light', 'second', 'accent', 'ink'], rest: 'light' } }, topline: { look: { list: ['off', 'on'], rest: 'off' }, colour: { list: ['light', 'second', 'accent', 'ink'], rest: 'light' } }, picglow: { look: { list: ['off', 'soft', 'strong'], rest: 'off' }, colour: { list: ['light', 'second', 'accent', 'ink'], rest: 'light' } }, monitor: { curve: { list: ['round', 'slight', 'bulged'], rest: 'round' }, sheen: { list: ['off', 'on'], rest: 'off' } }, warp: { direction: { list: ['in', 'out'], rest: 'in' } }, glow: { reach: { list: ['all', 'headings'], rest: 'all' } }, vignette: { night: { list: ['same', 'half'], rest: 'same' } } };
	var LEVELS = {
		scan: { stops: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'], rest: '3', attr: 'data-scan', prop: '--scan-alpha' },
		line: { stops: ['6', '10', '14', '20', '30', '45', '60', '80', '100'], rest: '45', attr: 'data-line', prop: '--line-strength' },
		fill: { stops: ['25', '50', '75', '100', '125', '150', '200', '300'], rest: '100', attr: 'data-fill', steps: true },
		glowlevel: { stops: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'], rest: '4', attr: 'data-glow-level', prop: '--surface-glow-level' },
		grainlevel: { stops: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'], rest: '4', attr: 'data-grain-level', prop: '--grain-level' },
		vignettelevel: { stops: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'], rest: '2', attr: 'data-vignette-level', prop: '--vignette-level' },
		vignettereach: { stops: ['1', '2', '3', '4', '5', '6'], rest: '3', attr: 'data-vignette-reach', prop: '--surface-vignette-reach' },
		softlevel: { stops: ['10', '15', '20', '25', '30', '35', '40', '45'], rest: '15', attr: 'data-soft-level', prop: '--soft-strength' },
		quietlevel: { stops: ['25', '30', '35', '40', '45', '50'], rest: '25', attr: 'data-quiet-level', prop: '--quiet-strength' },
		smallsoft: { stops: ['25', '30', '35', '40', '45', '50'], rest: '25', attr: 'data-small-soft', prop: '--small-strength' },
		measure: { stops: ['60', '64', '68', '72', '76', '80', '84', '88'], rest: '72', attr: 'data-measure', prop: '--measure-factor' },
		space: { stops: ['xcompact', 'compact', 'standard', 'spacious', 'xspacious'], rest: 'standard', attr: 'data-space', prop: '--space-step' },
		framewidth: { stops: ['4', '8', '12', '16', '24', '32'], rest: '8', attr: 'data-frame-width', prop: '--picture-frame' },
		dotsize: { stops: ['16', '24', '32'], rest: '24', attr: 'data-dot-size', prop: '--dot-size' },
		dotlevel: { stops: ['6', '9', '13', '18', '24'], rest: '13', attr: 'data-dot-level', prop: '--dot-strength' }
	};
	var ROLES = ['head', 'read', 'quote', 'kicker', 'small', 'comment', 'ui', 'title'];
	var ROLE_DEFAULT = {
		head: { face: 'read', weight: 'bold', size: '64', tracking: 'default', words: 'default', caps: false, italic: false, leading: 'default', align: 'default', colour: 'ink', members: {} },
		read: { face: 'newsreader', weight: 'regular', size: '22', tracking: 'default', words: 'default', caps: false, italic: false, leading: 'default', members: {} },
		quote: { face: 'read', weight: 'regular', size: '26', tracking: 'default', words: 'default', caps: false, italic: true, leading: 'default' },
		kicker: { face: 'read', weight: 'regular', size: '26', tracking: 'default', words: 'default', caps: false, italic: true, leading: 'default', align: 'default', colour: 'ink' },
		small: { face: 'ui', weight: 'regular', size: '16', tracking: 'default', words: 'default', caps: false, italic: false, leading: 'default', members: {} },
		comment: { face: 'ui', weight: 'regular', size: '14', tracking: 'default', words: 'default', caps: false, italic: false, leading: 'default', members: {} },
		ui: { face: 'inter', weight: 'regular', size: '13', tracking: 'default', words: 'default', caps: false, italic: false, leading: 'default', members: {} },
		title: { face: 'ui', weight: 'medium', size: '11', tracking: 'default', words: 'default', caps: false, italic: false, leading: 'default', members: {} }
	};
	var MEMBERS = {
		ui: [
			{ id: 'masthead', rest: 20, weight: 'semibold' },
			{ id: 'cards', rest: 13, weight: 'regular' },
			{ id: 'linkcard', rest: 18, weight: 'regular' },
			{ id: 'newsletter', rest: 16, weight: 'regular' },
			{ id: 'fields', rest: 13, weight: 'regular' },
			{ id: 'menus', rest: 13, lead: true },
			{ id: 'labels', rest: 11, weight: 'regular' },
			{ id: 'credit', rest: 11, weight: 'regular' }
		],
		head: [
			{ id: 'title', rest: 64, lead: true },
			{ id: 'sub', rest: 36, weight: 'semibold' }
		],
		small: [
			{ id: 'date', rest: 16, lead: true },
			{ id: 'author', rest: 16, weight: 'regular' },
			{ id: 'terms', rest: 13, weight: 'regular' },
			{ id: 'captions', rest: 13, weight: 'regular' },
			{ id: 'carddates', rest: 13, weight: 'regular' },
			{ id: 'release', rest: 16, weight: 'regular' }
		],
		comment: [
			{ id: 'title', rest: 18, weight: 'medium' },
			{ id: 'name', rest: 16, weight: 'medium' },
			{ id: 'text', rest: 14, lead: true },
			{ id: 'small', rest: 13, weight: 'regular' },
			{ id: 'form', rest: 13, weight: 'regular' }
		],
		read: [
			{ id: 'text', rest: 22, lead: true },
			{ id: 'excerpts', rest: 22, weight: 'regular' },
			{ id: 'boxes', rest: 18, weight: 'regular' }
		],
		title: [
			{ id: 'sections', rest: 11, lead: true },
			{ id: 'years', rest: 16, weight: 'medium' },
			{ id: 'release', rest: 16, weight: 'semibold' }
		]
	};
	var TRACK_ALIAS = { tightest: 'm7', tighter: 'm5', tight: 'm2', loose: 'p2', wide: 'p5', widest: 'p10' };
	var WORDS_ALIAS = { tighter: 'm10', tight: 'm5', loose: 'p5', wide: 'p10', widest: 'p15' };
	var WEIGHT_ALIAS = { lighter: 'light', normal: 'regular', heavy: 'extrabold' };
	var FOLLOW_ALIAS = { inherit: 'read' };
	var ROLE_COLOURS = ['ink', 'accent', 'own'];
	var LIST = {
		labelMax: 40,
		schema: ['architrave', 'label', 'base', 'palette', 'reading', 'face', 'leading', 'justify', 'dropcap', 'rounded', 'lines', 'fills', 'darkground', 'widehead', 'hairlines', 'picturehover', 'picturedim', 'picturefade', 'pictureframe', 'dots', 'marker', 'widepicture', 'fullpicture', 'categories', 'tagsfollow', 'soft', 'alternates', 'scanlines', 'glow', 'grain', 'vignette', 'tint', 'sans', 'scope', 'pictures', 'capLines', 'scan', 'line', 'fill', 'glowlevel', 'grainlevel', 'vignettelevel', 'vignettereach', 'softlevel', 'quietlevel', 'smallsoft', 'links', 'measure', 'space', 'framewidth', 'dotsize', 'dotlevel', 'framepattern', 'linestyle', 'corners', 'fadeedges', 'markercolour', 'button', 'buttonshape', 'buttonstyle', 'buttonmedium', 'buttonquiet', 'tags', 'chosenitem', 'linewidth', 'cards', 'quotes', 'notes', 'fields', 'titlefinish', 'headitalics', 'headarrival', 'cardlight', 'buttonfinish', 'toppattern', 'guides', 'greytint', 'pageglow', 'movinglight', 'monitorframe', 'fringe', 'crisp', 'scanstyle', 'shimmer', 'warp', 'switchon', 'bloom', 'ghosting', 'jitter', 'graincrawl', 'typedtitle', 'bootscreen', 'roomglass', 'phosphor', 'static', 'dropout', 'headrule', 'ink', 'tooth', 'edges', 'columns', 'paragraphs', 'rainbow', 'postband', 'footband', 'menuline', 'legalline', 'stripes', 'sitename', 'unlinked', 'effects', 'roles', 'colours'],
		choices: { tint: TINTS, scope: SCOPE, pictures: PICTURES, capLines: ['2', '3', '4'], button: BUTTONS, linestyle: LINE_STYLE, corners: CORNERS, fadeedges: FADE_EDGES, markercolour: MARKERS, framepattern: FRAME_PATTERNS },
		wells: ['paper', 'ink', 'accent', 'button', 'head', 'kicker', 'ground', 'lift', 'marker', 'inverse', 'light', 'second'],
		meaning: {
			architrave: 'Always 1. Marks the JSON as a style record.',
			label: 'The name on the tile.',
			base: 'The built-in style this record starts from; every key left out rests on it. See examples for what each base is.',
			palette: 'The colour pair (a light and a dark side designed together). colours overrides its paper, ink and accent.',
			reading: 'The reading size step of the article, a fluid rung and not a pixel value; default is about 22px on a desktop. Do not set a size for a monospaced reading face, its phone floor is handled by the theme.',
			face: 'The font of the article body.',
			sans: 'The font of the interface: the rail, buttons, menus.',
			leading: 'Line spacing of the article, from solid (tightest) to loosest; default is 1.6.',
			justify: 'Justified paragraphs with hyphenation.',
			dropcap: 'A large initial on the first paragraph; capLines is its height in lines.',
			capLines: 'Height of the initial in lines. Only with dropcap.',
			rounded: 'Rounded corners on cards, buttons and pictures. false is square.',
			lines: 'Hairlines around cards, buttons and fields and between rows. false means no lines anywhere except link underlines.',
			line: 'Strength of those lines: the ink\'s share in the line colour, in per cent. 45 is the rest. Only with lines.',
			corners: 'medium, small or large corners. One step re-cuts every corner together; nested corners stay sums. Only with rounded.',
			dots: 'A fine grid of dots on the page ground, a cutting mat.',
			dotsize: 'The dot grid\'s spacing in pixels: 16 (fine), 24 or 32 (wide). 24 is the rest. Only with dots.',
			dotlevel: 'Strength of the dots: the ink\'s share in the dot colour, in per cent: 6, 9, 13, 18 or 24. 13 is the rest. Only with dots.',
			marker: 'A highlighter: marked words and selected text get a wash in the marker colour, and a short bar stands under the article title. Decoration only, never a text colour.',
			markercolour: 'The highlighter\'s colour: yellow, green, pink, blue, orange, text (the reading text\'s colour), muted (the date\'s colour), or own (the well colours.<side>.marker, fitted to the other side\'s paper when set on one side only; its ink and bar follow from the pen). Only with marker.',
			measure: 'Line length of the reading text in letters: 60 to 88 in steps of 4. 72 is the rest.',
			space: 'The space of the page: xcompact, compact, standard, spacious or xspacious. Standard is the rest, the theme\'s own. Each kind of gap moves by its own amount: inside a group a little, between items more, between sections most, so what belongs together stays together. The reading text of an article keeps its own rhythm.',
			framewidth: 'Width of the frame around pictures in pixels: 4, 8, 12, 16, 24 or 32. 8 is the rest. Only with pictureframe.',
			framepattern: 'What the frame around pictures shows: plain, dots (the dot grid) or checker (a transparency checkerboard). Only with pictureframe.',
			widehead: 'The article\'s title, categories and date line stand as wide as the wide top picture, so a big title needs fewer lines; the text keeps its column.',
			widepicture: 'The article\'s top picture stands wider than the text column, as wide as the paper allows.',
			fullpicture: 'While the top picture is wide (widepicture), on stretches it edge to edge across the paper as a low banner (21:9, square corners). Off (the rest) keeps it wide.',
			categories: 'Where the line of categories stands on the article and on its cards: below the title (the rest), above it, or hidden. It replaced the switch kickerabove.',
			kickerabove: 'Retired 2026-09-27 and still read: true becomes categories above.',
			button: 'What fills the main buttons: accent (the rest), ink, or own (colours.<side>.button). The links keep the accent either way.',
			inkbutton: 'Retired 2026-09-26 and still read: true becomes button ink.',
			buttonshape: 'The buttons\' and hover pills\' corner: cards (the corner size\'s own, the rest), square, rounded (8 px) or pill. Only with rounded. The cards keep the corner size.',
			tagsfollow: 'The tags take the buttons\' corner instead of staying round.',
			buttonstyle: 'How the main buttons look: filled (the rest), outlined, shadow (outlined with a hard shadow), tinted, gray or text (text only), in the button colour where it has one.',
			buttonmedium: 'How the other buttons (the gray secondary ones) look: gray (the rest), filled, tinted, outlined, shadow (outlined with a hard shadow) or text (text only), in the button colour where it has one.',
			buttonquiet: 'How the quiet buttons (small actions without a fill) look: text (the rest), filled, tinted, gray, outlined or shadow (outlined with a hard shadow). Architrave\'s alone; another theme has no quiet kind.',
			tags: 'How the tags at the end of an article look: text (the rest: words, as the theme sets them), or small pills that are filled, tinted, gray or outlined, made from the button colour. Tags follow the buttons gives the pills the buttons\' corner.',
			chosenitem: 'How the chosen item is marked, the page you are on in the menu and the open tab: gray (the rest: the theme\'s own mark), filled with the button colour, outlined in it, or bold and underlined.',
			linewidth: 'Line width in px: 1 (the rest), 2, 3 or 5. Only with lines; fine lines only at 1.',
			cards: 'How cards look: box (the rest: the card\'s fill and, with lines, its line), top (a line along the top only, no fill, square; only with lines), flat (the fill alone, no line) or raised (the paper, lifted by a shadow).',
			quotes: 'How quotes in an article look: a line at the side (the rest), plain, or in a box.',
			notes: 'How a box the writer coloured inside an article looks: flat (the rest: its fill), outlined, or raised by a shadow.',
			fields: 'How search, comment and sign-up fields look: flat (the rest: the fill, with lines its line), outlined on the paper, or raised by a shadow.',
			titlefinish: 'How the title and the headings are drawn: flat (the rest: their colour), shine (from the full colour to half of it, top left to bottom right, as brushed metal) or accent (from their colour into the accent).',
			headitalics: 'The face of the serif words in titles and headings (which words: effects.serif): same (the rest: no serif), serif (Newsreader), classic (Libre Baskerville), vollkorn (Vollkorn) or fraunces (Fraunces).',
			headarrival: 'How the title and the article\'s headings come into view: none (the rest: they are simply there), fade (word by word) or blur (word by word, from a blur to sharp). Nothing moves for readers who ask for less motion.',
			cardlight: 'Light on the cards: off (the rest), edge (a thin light along the top edge that dies out toward the corners) or glow (the edge and a faint light falling into the card). The ink by night, the accent by day.',
			buttonfinish: 'A finish over the main and other buttons: flat (the rest: their look as set), glass (a faint sheet of the ink with a hairline) or glow (the main button keeps its fill and gets a soft light of the button colour under it; the other buttons glass).',
			toppattern: 'A pattern on the head of the paper that fades out before the reading begins: none (the rest), dots, grid, cross (small crosses) or diagonal lines.',
			guides: 'Lines down each side of the article, a gutter out, as on a drawing board: off (the rest), solid or dashed. Not on a phone.',
			greytint: 'How much of the accent the paper, the grounds and every grey take, in percent: 0 (the rest), 5, 10 or 15. The ink itself stays as it is. Only with the style\'s own colour pair.',
			pageglow: 'Two slow glows of the accent behind the article\'s title: off (the rest), soft or strong. They stay still for readers who ask for less motion.',
			movinglight: 'A short streak of the accent that travels along the top edge of the cards: off (the rest) or on. Not for readers who ask for less motion.',
			monitorframe: 'A black bezel around the page with rounded corners, an old monitor\'s frame: off (the rest), thin, medium or thick.',
			fringe: 'A colour fringe on every letter, the three guns of a tube not quite meeting: off (the rest), faint, soft, strong, slip (print\'s one magenta ghost on all text) or sliptitle (that ghost on the titles and headings only, the reading left sharp).',
			crisp: 'Letters drawn without smoothing, the stair-step of an old screen: off (the rest), headings, or all text.',
			scanstyle: 'How the scan lines are drawn: lines (the rest), grille (the RGB stripes of an aperture grille) or both. Only with scanlines.',
			shimmer: 'The screen\'s brightness moving: off (the rest), soft (a slow hum) or roll (a faint band drifting down). Still for readers who ask for less motion.',
			warp: 'The page bent like a tube\'s glass: off (the rest), slight, bulged or strong. The page is redrawn as a picture, so text softens a little.',
			switchon: 'The screen collapses to a line and blinks back when the side changes: off (the rest) or on.',
			bloom: 'The glow spilling into the paper, not only round the letters: off (the rest), soft or strong. By night only.',
			ghosting: 'A vertical smear while the page scrolls, the phosphor fading: off (the rest) or on.',
			jitter: 'The picture nudges sideways for a moment now and then, a bad sync: off (the rest), rare or often.',
			graincrawl: 'The grain standing still (the rest) or moving, as a tube\'s noise crawls. Only with grain.',
			typedtitle: 'The article\'s title arrives letter by letter behind a block cursor: off (the rest) or on.',
			bootscreen: 'A start screen on the first visit of a session, then the page: off (the rest), on (a computer\'s boot screen: the site\'s name, its line and a bar of blocks) or card (a television\'s test card with the site\'s name on its plate).',
			roomglass: 'A window reflected across the top corner of the glass: off (the rest) or on.',
			phosphor: 'The whole night screen in one phosphor: off (the rest, the style\'s own colours), blue, green, amber, white or black.',
			static: 'A burst of noise while the set switches on: off (the rest) or on. Only with switchon.',
			dropout: 'The title in the paper\'s colour on a block of ink, a headline over a photograph: off (the rest) or on.',
			headrule: 'A rule under the title: off (the rest) or on.',
			ink: 'Print bleeds a hair: sharp (the rest) or spread, the letters a little softer and heavier.',
			tooth: 'A coarser grain, the tooth of magazine stock: off (the rest) or on.',
			edges: 'The vignette\'s colour: ink (the rest) or yellowed, an old page\'s brown.',
			columns: 'The article\'s sections in columns: 1 (the rest), 2 or 3. Each heading with its text balances into its columns and the next starts below; one column on a phone.',
			paragraphs: 'Paragraphs spaced apart (the rest) or indented with no space between, as print sets them.',
			rainbow: 'Six rainbow stripes: off (the rest), rule (on the dividers), mark (a small square before the site\'s name), both, or logo (the stripes fill the site\'s logo itself; for a logo on a transparent ground).',
			postband: 'What stands between two posts on a page of posts: off (the rest, the theme\'s own gap), rainbow (the six stripes across the whole paper) or logo (the stripes with the site\'s logo small in a gap at their middle).',
			footband: 'What closes the page at its very foot: off (the rest), on (the six rainbow stripes as a taller band) or plate (a black plate across the paper: the site\'s logo and name, its tagline and the copyright line, with a faint colour fringe, the last card of a film).',
			menuline: 'The side column\'s menu links: plain (the rest) or underlined in the ink, as a printed page sets its navigation.',
			legalline: 'A small italic line at the foot of the page, an advertisement\'s small print: the copyright sign, the year, the site\'s name and its tagline. Only words the site already has. Off (the rest) or on.',
			stripes: 'How the rainbow bands between posts and at the page foot are drawn: solid (the rest, six stripes edge to edge) or gaps (six thinner stripes with paper between them, in softer hues).',
			sitename: 'The site\'s name in the side column and on the plate: plain (the rest, as the interface sets it) or caps (bold italic capitals set tight, in the section titles\' face, as an advertisement\'s wordmark).',
			pillbuttons: 'Retired 2026-09-26 and still read: true becomes buttonshape pill.',
			centretitle: 'Retired 2026-09-25 and still read: true becomes roles.head.align and roles.kicker.align center, with roles.head.members.sub.align default.',
			fadeedges: 'which edges of the top picture fade with picturefade: sides (bottom and sides), bottom, or all four.',
			linestyle: 'solid, dashed or dotted lines. Dashes are long only when rounded is false. Only with lines.',
			fills: 'Tinted fills on cards, buttons and fields. With lines and fills both false, controls are plain glyphs.',
			fill: 'Strength of the fills as a percentage of the colour pair\'s own steps; 100 is the rest. Only with fills.',
			scanlines: 'Faint horizontal lines over the whole page, an old screen.',
			scan: 'Strength of the scan lines, 1 to 10 (opacity in hundredths). 3 is the rest. Only with scanlines.',
			glow: 'A soft light around the letters in their own colour. Shows on the dark side only.',
			glowlevel: 'Strength of the glow, 1 to 10. 4 is the rest. Only with glow.',
			grain: 'A fine film grain over the whole page, the tooth of paper.',
			softlevel: 'How far the reading text steps toward the paper, in percent: 10 to 45 in steps of 5. 15 is the rest. Only with soft.',
			quietlevel: 'How far the small text (dates, captions, meta) steps toward the paper with soft on, in percent: 25 to 50 in steps of 5. 25 is the rest. Only with soft, and only while smallsoft is not set; the row Small text writes smallsoft since 2026-09-27.',
			smallsoft: 'How far the small text (dates, captions, meta) steps toward the paper, in percent: 25 to 50 in steps of 5, with soft on or off. 25 is the rest, the pair\'s own rung. Not set, it follows quietlevel while soft is on, and an export leaves it out.',
			links: 'How links in the text are marked: both (the rest: the accent and an underline), coloured (the accent, underlined only under the pointer) or underlined (the ink with a quiet underline). Not set, a style with soft marks them underlined, and an export leaves it out.',
			grainlevel: 'Strength of the grain, 1 to 10. 4 is the rest. Only with grain.',
			vignette: 'A darkening at the page\'s four edges, as a screen\'s glass has.',
			vignettelevel: 'Strength of the vignette, 1 to 10. 2 is the rest. Only with vignette.',
			vignettereach: 'How far the vignette reaches in from the edges, 1 to 6. 3 is the rest. Only with vignette.',
			pictures: 'How every image on the site is shown: plain as published, bw, sepia, duo (the pair\'s paper and ink), accent (paper and accent, a duotone), halftone (printed dots), dither (coarse two-colour pixels), grain (film grain), hidden (no images; each article picture becomes a line that shows it).',
			picturehover: 'The picture effect lifts under the pointer and the real colours show. No effect when pictures is plain or hidden.',
			alternates: 'Inter\'s alternate letters: the one with a longer flag, round quotes, commas and apostrophes. Only while the interface face is Inter; the article keeps its own face\'s letters.',
			soft: 'The reading text is one step softer than the ink (the secondary rung); headings and bold words keep the ink. How links are marked is links.',
			picturedim: 'Pictures are dimmed a little on the dark side. Applies to plain, bw, sepia and grain.',
			picturefade: 'The article\'s top picture fades out toward its bottom and sides, into the paper. Not with hidden pictures.',
			pictureframe: 'Pictures wear a frame: a mat in the fields\' colour, and with lines a line around it. Off, a picture stands on the paper with its corner alone.',
			darkground: 'By day, the ground around the page takes the style\'s night colours while the page stays light: the rails and the space around the paper. On other themes, the footer. Nothing changes by night.',
			hairlines: 'Every line at half a pixel: the cards\' edges, the fields, the frame and the dividers thin to a hairline. Only with lines.',
			tint: 'The accent colour by name, used for links and the primary button. colours.accent overrides it.',
			scope: 'Legacy. The theme always applies paragraph settings everywhere.',
			unlinked: 'true when the light and dark colours were set independently; false lets one side follow the other.',
			effects: 'The extras\' details, one object per effect (title, serif, arrival, cardlight, moving, button, pattern, guides, tint, aurora, pointer, dividers, topline, picglow), each holding only the details that differ from their rest; the effect\'s own switch is its flat pick (titlefinish, headitalics, headarrival, cardlight, buttonfinish, toppattern, guides, greytint, pageglow, movinglight) or, for the last four, its look.',
			roles: 'Typography by role. head: titles and headings. read: article body. quote: block quotes. kicker: the category line under a title. small: dates, tags, captions, the author line. comment: the comment thread. ui: the interface. title: section titles in the rail and archive. Each role takes face, weight, size (px at desktop width), tracking (m25 to p25, letter spacing in per mille steps, default is none), words (word spacing, same steps), caps, italic, leading. head and kicker also take align (default, the theme\'s own start; center; right) and colour (ink, the rest; accent; own, the well colours.<side>.head or .kicker). members are named sub-groups of a role that may take their own size, weight, caps and tracking, and under head also align, so the headings inside an article (sub) can stay left under a centred title; a member left out follows its role.',
			colours: 'The style\'s own paper (page background), ink (text) and accent (links) per side, as hex; also, since 2026-09-26, button (the filled buttons), head and kicker (the roles\' own colours, with roles.head.colour or roles.kicker.colour own), ground (the page around the paper) and lift (what stands on the paper: menus, buttons, filled boxes). Every other colour is mixed from these. Ink on paper must reach 4.5:1 and accent on paper 3:1 on both sides.'
		}
	};
	
	if (window.architravePanelGuest) ROLE_DEFAULT.quote.italic = false;
	
	
	
	
	            
	
	
	var PAIR_TINTS = { neutral: 'purple', paper: 'brown', grey: 'blue', terminal: 'green', arcade: 'orange' };
	function tintOf() {
		var s = byId(current), tw = readTweaks()[current];
		if (tw && TINTS.indexOf(tw.tint) !== -1) return tw.tint;
		return (s && s.tint) || TINTS[0];
	}
	function applyTint() { var v = tintOf(); if (root.getAttribute('data-tint') !== v) root.setAttribute('data-tint', v); }
	
	var SANS = [
		{ id: 'inter', label: 'Inter' },
		{ id: 'hyperlegible', label: 'Atkinson Hyperlegible' },
		{ id: 'geist', label: 'Geist' },
		{ id: 'plex-sans', label: 'IBM Plex Sans' },
		{ id: 'newsreader', label: 'Newsreader' },
		{ id: 'libre-baskerville', label: 'Libre Baskerville' },
		{ id: 'vollkorn', label: 'Vollkorn' },
		{ id: 'mono', label: 'Geist Mono' },
		{ id: 'martian-mono', label: 'Martian Mono' },
		{ id: 'kode-mono', label: 'Kode Mono' },
		{ id: 'jetbrains-mono', label: 'JetBrains Mono' },
		{ id: 'doto', label: 'Doto' },
		{ id: 'vt323', label: 'VT323' },
		{ id: 'handjet', label: 'Handjet' }
	];
	function sansOf() {
		var s = byId(current), tw = readTweaks()[current];
		if (tw && SANS.some(function (f) { return f.id === tw.sans; })) return tw.sans;
		return (s && s.sans) || SANS[0].id;
	}
	function applySans() {
		var v = sansOf(); if (root.getAttribute('data-sans') !== v) root.setAttribute('data-sans', v);
		var own = window.architravePanelGuest && !isLook(current) && (readTweaks()[current] || {}).sans !== undefined;
		if (own) root.setAttribute('data-sans-own', ''); else root.removeAttribute('data-sans-own');
	}
	
	
	
	
	
	
	var FAMILY = {
		inter: 'var(--face-inter)',
		hyperlegible: 'var(--wp--preset--font-family--font-atkinson-hyperlegible-next)',
		geist: 'var(--wp--preset--font-family--font-geist)',
		newsreader: 'var(--face-newsreader)',
		'libre-baskerville': 'var(--wp--preset--font-family--font-libre-baskerville)',
		vollkorn: 'var(--wp--preset--font-family--font-vollkorn)',
		mono: 'var(--wp--preset--font-family--font-geist-mono)',
		'martian-mono': 'var(--wp--preset--font-family--font-martian-mono)',
		'kode-mono': 'var(--wp--preset--font-family--font-kode-mono)',
		'plex-sans': 'var(--wp--preset--font-family--font-plex-sans)',
		'jetbrains-mono': 'var(--wp--preset--font-family--font-jetbrains-mono)',
		'plex-mono': 'var(--wp--preset--font-family--font-jetbrains-mono)', 
		doto: 'var(--wp--preset--font-family--font-doto)',
		vt323: 'var(--wp--preset--font-family--font-vt-323)',
		handjet: 'var(--wp--preset--font-family--font-handjet)'
	};
	var SERIFS = ['newsreader', 'libre-baskerville', 'vollkorn'];
	
	var ITALICS = ['newsreader', 'libre-baskerville', 'vollkorn', 'geist', 'plex-sans', 'jetbrains-mono'];
	function hasItalic(face) {
		face = realFace(face); return ITALICS.indexOf(face) !== -1; }
	
	var WEIGHT = { thin: 100, extralight: 200, light: 300, regular: 400, medium: 500, semibold: 600, bold: 700, extrabold: 800, black: 900 };
	
	var RANGE = { inter: [100, 900], hyperlegible: [200, 800], geist: [100, 900], newsreader: [200, 800], 'libre-baskerville': [400, 700], vollkorn: [400, 900], mono: [100, 900], 'martian-mono': [100, 800], 'kode-mono': [400, 700], 'plex-sans': [100, 700], 'jetbrains-mono': [100, 800], doto: [100, 900], vt323: [], handjet: [100, 900] }; 
	
	function isAnchor(face) { return face === 'read' || face === 'ui'; }
	function realFace(face) {
		face = FOLLOW_ALIAS[face] || face;
		if (face === 'read') return root.getAttribute('data-face') || 'newsreader';
		if (face === 'ui') return root.getAttribute('data-sans') || 'inter';
		return face;
	}
	function faceValue(face) {
		if (face === 'read') return 'var(--font-reading)';
		if (face === 'ui') return 'var(--font-sans)';
		return FAMILY[face] || FAMILY.newsreader;
	}
	var CUTS = {};
	(window.ArchitraveFontLibrary || []).forEach(function (f) {
		if (FAMILY[f.id]) return;
		SANS.push({ id: f.id, label: f.label });
		FAMILY[f.id] = f.family;
		if (f.weights) { CUTS[f.id] = f.weights; RANGE[f.id] = [f.weights[0], f.weights[f.weights.length - 1]]; } else RANGE[f.id] = f.range;
		if (f.italic) ITALICS.push(f.id);
	});
	function weightsFor(face) {
		face = realFace(face);
		if (CUTS[face]) return Object.keys(WEIGHT).filter(function (k) { return CUTS[face].indexOf(WEIGHT[k]) !== -1; });
		var r = RANGE[face] || [100, 900];
		return Object.keys(WEIGHT).filter(function (k) { return WEIGHT[k] >= r[0] && WEIGHT[k] <= r[1]; });
	}
	function fitWeight(face, w) {
		face = realFace(face);
		var ok = weightsFor(face);
		if (!ok.length) return w;
		if (ok.indexOf(w) !== -1) return w;
		var want = WEIGHT[w] || 400, best = ok[0];
		ok.forEach(function (k) { if (Math.abs(WEIGHT[k] - want) < Math.abs(WEIGHT[best] - want)) best = k; });
		return best;
	}
	
	var ROLE_BASE = { head: 64, read: 22, quote: 26, kicker: 26, small: 16, comment: 14, ui: 13, title: 11 }; 
	
	
	
	
	
	
	
	
	
	
	
	var MEMBER_DIALS = ['size', 'weight', 'caps', 'tracking'];
	var ALIGN = { 'default': 'start', center: 'center', right: 'right' };
	var ALIGNS = Object.keys(ALIGN);
	
	function memberDialsOf(role) { return ROLE_DEFAULT[role] && ROLE_DEFAULT[role].align !== undefined ? MEMBER_DIALS.concat('align') : MEMBER_DIALS; }
	function membersOf(role) { return MEMBERS[role] || []; }
	
	var ALL_RUNGS = [12, 13, 14, 16, 18, 20, 22, 24, 26, 28, 32, 36, 40, 44, 48, 56, 64, 72];
	var UI_RUNGS = [11].concat(ALL_RUNGS);
	var ROLE_RUNGS = {};
	['head', 'read', 'quote', 'kicker', 'small', 'comment'].forEach(function (r) { ROLE_RUNGS[r] = ALL_RUNGS; });
	ROLE_RUNGS.head = ALL_RUNGS.concat([80, 96, 112, 128]);
	['ui', 'title'].forEach(function (r) { ROLE_RUNGS[r] = UI_RUNGS; });
	var PERCENTS = { '50': 50, '65': 65, '80': 80, '90': 90, '100': 100, '110': 110, '120': 120, '135': 135, '150': 150, xs: 80, s: 90, m: 100, l: 110, xl: 120 };
	function rungFor(role, v) {
		var rungs = ROLE_RUNGS[role] || ROLE_RUNGS.read;
		if (v === 'text') return String(ROLE_BASE[role] || ROLE_BASE.read); 
		if (rungs.indexOf(+v) !== -1) return String(v);
		var pct = PERCENTS[v];
		if (!pct) return String(ROLE_BASE[role] || ROLE_BASE.read);
		var want = (ROLE_BASE[role] || ROLE_BASE.read) * pct / 100, best = rungs[0];
		rungs.forEach(function (r) { if (Math.abs(r - want) < Math.abs(best - want)) best = r; });
		return String(best);
	}
	function nearestRung(role, v) {
		var rungs = ROLE_RUNGS[role] || ROLE_RUNGS.read, want = +v, best = rungs[0];
		if (!want) return rungFor(role, v);
		rungs.forEach(function (r) { if (Math.abs(r - want) < Math.abs(best - want)) best = r; });
		return String(best);
	}
	function sizeFactor(role, v) { return (+v || ROLE_BASE[role]) / (ROLE_BASE[role] || ROLE_BASE.read); }
	function sizesFor(role) { return (ROLE_RUNGS[role] || ROLE_RUNGS.read).map(String); }
	
	var TRACK = { m25: '-0.25em', m22: '-0.225em', m20: '-0.2em', m17: '-0.175em', m15: '-0.15em', m12: '-0.125em', m10: '-0.1em', m7: '-0.075em', m5: '-0.05em', m2: '-0.025em', m1: '-0.0125em', 'default': '0', p1: '0.0125em', p2: '0.025em', p5: '0.05em', p7: '0.075em', p10: '0.1em', p12: '0.125em', p15: '0.15em', p17: '0.175em', p20: '0.2em', p22: '0.225em', p25: '0.25em' }; 
	
	var TRACKING = Object.keys(TRACK);
	var WORDS = { m25: '-0.25em', m22: '-0.225em', m20: '-0.2em', m17: '-0.175em', m15: '-0.15em', m12: '-0.125em', m10: '-0.1em', m7: '-0.075em', m5: '-0.05em', m2: '-0.025em', 'default': 'normal', p2: '0.025em', p5: '0.05em', p7: '0.075em', p10: '0.1em', p12: '0.125em', p15: '0.15em', p17: '0.175em', p20: '0.2em', p22: '0.225em', p25: '0.25em' };
	var LEAD = { solid: 0.56, packed: 0.62, close: 0.69, densest: 0.75, dense: 0.85, tight: 0.92, snug: 0.96, 'default': 1, relaxed: 1.06, airy: 1.1, wider: 1.15, wide: 1.25, open: 1.37, loose: 1.5, loosest: 1.62 };  
	function ownItalic(role) {
		var s = byId(current), tw = readTweaks()[current];
		return !!((s && s.roles && s.roles[role] && s.roles[role].italic !== undefined) || (tw && tw.roles && tw.roles[role] && tw.roles[role].italic !== undefined));
	}
	var SLANT_PART = { read: '.wp-block-post-content p, .entry-content p', head: '.wp-block-post-title, .entry-title, .wp-block-heading', quote: '.wp-block-quote, .wp-block-pullquote', kicker: '.wp-block-post-terms', small: '.wp-block-post-date, .entry-meta, figcaption', comment: '.wp-block-comment-content', ui: '.wp-block-navigation-item__content, .wp-block-site-title' };
	function hostSlant(role) {
		var el = SLANT_PART[role] && document.querySelector(SLANT_PART[role]);
		if (!el) return false;
		var a = 'data-' + role + '-italic', had = root.getAttribute(a);
		if (had !== null) root.removeAttribute(a);
		var it = window.getComputedStyle(el).fontStyle !== 'normal';
		if (had !== null) root.setAttribute(a, had);
		return it;
	}
	function roleOf(role) {
		var s = byId(current), tw = readTweaks()[current], out = {};
		Object.keys(ROLE_DEFAULT[role]).forEach(function (k) {
			out[k] = ROLE_DEFAULT[role][k];
			if (s && s.roles && s.roles[role] && s.roles[role][k] !== undefined) out[k] = s.roles[role][k];
			if (tw && tw.roles && tw.roles[role] && tw.roles[role][k] !== undefined) out[k] = tw.roles[role][k];
		});
		if (FOLLOW_ALIAS[out.face]) out.face = FOLLOW_ALIAS[out.face]; 
		if (membersOf(role).length) {
			var mem = {};
			var take = function (src) {
				if (!src || typeof src !== 'object') return; mem = {};
				Object.keys(src).forEach(function (id) {
					var m = src[id], o = {}; if (!m || typeof m !== 'object') return;
					if (m.size !== undefined) o.size = rungFor(role, m.size);
					if (m.weight !== undefined) o.weight = WEIGHT_ALIAS[m.weight] || m.weight;
					if (m.caps !== undefined) o.caps = !!m.caps;
					if (m.tracking !== undefined) o.tracking = TRACK_ALIAS[m.tracking] || m.tracking;
					if (m.align !== undefined && ALIGNS.indexOf(m.align) !== -1 && memberDialsOf(role).indexOf('align') !== -1) o.align = m.align;
					if (Object.keys(o).length) mem[id] = o;
				});
			};
			take(s && s.roles && s.roles[role] && s.roles[role].members);
			take(tw && tw.roles && tw.roles[role] && tw.roles[role].members);
			out.members = mem;
		} else delete out.members;
		if (role === 'read') out.face = root.getAttribute('data-face') || 'newsreader';
		if (role === 'ui') out.face = sansOf();
		out.weight = fitWeight(out.face, WEIGHT_ALIAS[out.weight] || out.weight);
		out.size = rungFor(role, out.size); 
		out.tracking = TRACK_ALIAS[out.tracking] || out.tracking; 
		out.words = WORDS_ALIAS[out.words] || out.words;
		if (window.architravePanelGuest && !isLook(current) && !ownItalic(role)) out.italic = hostSlant(role);
		if (!hasItalic(out.face)) out.italic = false;
		if (out.align !== undefined && ALIGNS.indexOf(out.align) === -1) out.align = 'default';
		if (out.colour !== undefined && ROLE_COLOURS.indexOf(out.colour) === -1) out.colour = 'ink';
		return out;
	}
	function applyRoles() {
		var st = root.style;
		ROLES.forEach(function (role) {
			var v = roleOf(role), p = '--' + role + '-', rest = ROLE_DEFAULT[role], s0 = byId(current);
			var hostTw = window.architravePanelGuest && !isLook(current) ? ((readTweaks()[current] || {}).roles || {})[role] || {} : {};
			if (role !== 'read' && role !== 'ui') st.setProperty(p + 'face', faceValue(v.face));
			if (role === 'small') { if (v.face !== rest.face) root.setAttribute('data-small-face-own', ''); else root.removeAttribute('data-small-face-own'); }
			if (v.weight === rest.weight && hostTw.weight === undefined) st.removeProperty(p + 'weight'); else st.setProperty(p + 'weight', String(WEIGHT[v.weight] || 400));
			if (role === 'read' || role === 'ui' || role === 'comment') { if (v.weight === rest.weight) root.removeAttribute('data-' + role + '-weight'); else root.setAttribute('data-' + role + '-weight', v.weight); }
			st.setProperty(p + 'size', String(sizeFactor(role, v.size)));
			if (window.architravePanelGuest) {
				var mine = sizeFactor(role, v.size) / sizeFactor(role, rungFor(role, (s0 && s0.roles && s0.roles[role] && s0.roles[role].size) || rest.size));
				if (Math.abs(mine - 1) < 0.0001) st.removeProperty(p + 'size-mine'); else st.setProperty(p + 'size-mine', String(mine));
			}
			if (role === 'head') root.removeAttribute('data-head-size'); 
			if (role === 'ui' || role === 'comment') { if (v.size === rest.size) root.removeAttribute('data-' + role + '-size'); else root.setAttribute('data-' + role + '-size', v.size); }
			if (membersOf(role).length) {
				var free = 0;
				membersOf(role).forEach(function (m) {
					var own = (!m.lead && v.members && v.members[m.id]) || {}, any = false;
					memberDialsOf(role).forEach(function (d) {
						var tok = p + (d === 'caps' ? 'case' : d) + '-' + m.id, attr = 'data-' + role + '-m-' + m.id + '-' + d, val = null;
						if (own[d] !== undefined) {
							if (d === 'size') val = String((+own.size || m.rest) / m.rest);
							else if (d === 'weight') val = String(WEIGHT[fitWeight(v.face, own.weight)] || WEIGHT[own.weight] || 400);
							else if (d === 'caps') val = own.caps ? 'uppercase' : 'none';
							else if (d === 'align') val = ALIGN[own.align] || 'start';
							else val = TRACK[own.tracking] || '0';
						}
						if (val === null) { st.removeProperty(tok); root.removeAttribute(attr); } else { any = true; st.setProperty(tok, val); root.setAttribute(attr, d === 'size' ? own.size : d === 'align' ? own.align : String(val)); }
					});
					if (any) free++;
				});
				if (free) root.setAttribute('data-' + role + '-members', String(free)); else root.removeAttribute('data-' + role + '-members');
			} 
			if (v.tracking === rest.tracking && hostTw.tracking === undefined) st.removeProperty(p + 'tracking'); else st.setProperty(p + 'tracking', TRACK[v.tracking] || '0');
			if (v.words === rest.words && hostTw.words === undefined) st.removeProperty(p + 'words'); else st.setProperty(p + 'words', WORDS[v.words] || 'normal');
			st.setProperty(p + 'case', v.caps ? 'uppercase' : 'none');
			if (rest.colour !== undefined) { if (v.colour === rest.colour) { st.removeProperty(p + 'colour'); root.removeAttribute('data-' + role + '-colour'); } else { st.setProperty(p + 'colour', v.colour === 'accent' ? 'var(--accent)' : 'var(--' + role + '-own-colour, var(--accent))'); root.setAttribute('data-' + role + '-colour', v.colour); } }
			if (rest.align !== undefined) { if (v.align === rest.align) { st.removeProperty(p + 'align'); root.removeAttribute('data-' + role + '-align'); } else { st.setProperty(p + 'align', ALIGN[v.align]); root.setAttribute('data-' + role + '-align', v.align); } }
			
			if (role === 'quote' && !hasItalic(v.face)) st.setProperty(p + 'style', 'normal');
			else if (role === 'quote' && v.italic === rest.italic && !(s0 && s0.roles && s0.roles.quote && s0.roles.quote.italic !== undefined)) st.removeProperty(p + 'style'); 
			else if (v.italic) st.setProperty(p + 'style', 'italic');
			else if (role === 'quote') st.setProperty(p + 'style', 'normal');
			else st.removeProperty(p + 'style');
			if (role !== 'read') { if (v.leading === rest.leading || !LEAD[v.leading]) { st.removeProperty(p + 'leading'); root.removeAttribute('data-' + role + '-leading'); } else { st.setProperty(p + 'leading', String(LEAD[v.leading])); root.setAttribute('data-' + role + '-leading', v.leading); } }
			if (role === 'read') { st.setProperty('--reading-tracking', TRACK[v.tracking] || '0'); st.setProperty('--reading-word-gap', WORDS[v.words] || 'normal'); }
			if (window.architravePanelGuest) {
				var look = isLook(current);
				if (look) st.setProperty(p + 'weight', String(WEIGHT[v.weight] || 400));
				var readChosen = root.hasAttribute('data-face'), uiChosen = (root.getAttribute('data-sans') || 'inter') !== 'inter';
				if (!look && isAnchor(v.face) && !(v.face === 'read' ? readChosen : uiChosen)) {
					var hostRec = byId('host');
					if (hostRec && hostRec.hostFace) st.setProperty(p + 'face', hostRec.hostFace);
				}
				var picked = {
					face: role === 'read' ? (root.getAttribute('data-face') || rest.face) !== rest.face
						: role === 'ui' ? v.face !== rest.face
						: look || v.face !== rest.face || (v.face === 'read' && readChosen) || (v.face === 'ui' && uiChosen),
					weight: v.weight !== rest.weight || look || hostTw.weight !== undefined,
					tracking: v.tracking !== rest.tracking || hostTw.tracking !== undefined,
					words: v.words !== rest.words || hostTw.words !== undefined,
					size: String(v.size) !== String(rest.size) || hostTw.size !== undefined,
					caps: !!v.caps,
					italic: look ? (v.italic !== rest.italic || v.italic) : ownItalic(role) 
				};
				Object.keys(picked).forEach(function (d) {
					if (picked[d]) root.setAttribute('data-' + role + '-' + d, String(v[d] === true ? 'on' : v[d]));
					else root.removeAttribute('data-' + role + '-' + d);
				});
			}
		});
	}
	function trackingOf() { return roleOf('read').tracking; }
	function applyTracking() { applyRoles(); }
	
	 
	function picturesOf() {
		var s = byId(current), tw = readTweaks()[current];
		if (tw && PICTURES.indexOf(tw.pictures) !== -1) return tw.pictures;
		return (s && s.pictures) || PICTURES[0];
	}
	
	function capLinesOf() {
		var s = byId(current), tw = readTweaks()[current];
		if (tw && CAP_LINES.indexOf(tw.capLines) !== -1) return tw.capLines;
		return (s && s.capLines) || CAP_LINES[0];
	}
	function applyCapLines() {
		var v = capLinesOf(), was = root.getAttribute('data-dropcap-lines') || CAP_LINES[0];
		if (v === CAP_LINES[0]) root.removeAttribute('data-dropcap-lines'); else if (root.getAttribute('data-dropcap-lines') !== v) root.setAttribute('data-dropcap-lines', v);
		if (was !== v) document.querySelectorAll('.wp-block-post-content > p:first-of-type, .wp-block-post-excerpt > p:first-of-type').forEach(function (p) { var d = p.style.display; p.style.display = 'none'; void p.offsetHeight; p.style.display = d; });
	}
	
	var LEVEL_CSS = {
		scan: function (v) { return String(+v / 100); },
		line: function (v) { return v + '%'; },
		glowlevel: function (v) { return String(+v / 10); },
		grainlevel: function (v) { return String(+v / 10); },
		vignettelevel: function (v) { return String(+v / 10); },
		vignettereach: function (v) { return [85, 70, 55, 40, 25, 10][+v - 1] + '%'; },
		softlevel: function (v) { return v + '%'; }, 
		quietlevel: function (v) { return v + '%'; },
		smallsoft: function (v) { return v + '%'; },
		measure: function (v) { return String(Math.round(+v / 72 * 1000) / 1000); },
		space: function (v) { return { xcompact: '0.5', compact: '0.7', spacious: '1.4', xspacious: '1.8' }[v]; }, 
		framewidth: function (v) { return v + 'px'; },
		dotsize: function (v) { return v + 'px'; },
		dotlevel: function (v) { return v + '%'; }
	};
	Object.keys(LEVEL_CSS).forEach(function (k) { LEVELS[k].css = LEVEL_CSS[k]; });
	function levelRest(k) {
		var L = LEVELS[k], s = byId(current), b = s && byId(baseOf(s));
		if (s && L.stops.indexOf(s[k]) !== -1) return s[k];
		if (b && L.stops.indexOf(b[k]) !== -1) return b[k];
		if (k === 'smallsoft') return optionOn('soft') ? levelOf('quietlevel') : L.rest;
		return L.rest;
	}
	function levelOf(k) {
		var L = LEVELS[k], tw = readTweaks()[current];
		if (tw && L.stops.indexOf(tw[k]) !== -1) return tw[k];
		return levelRest(k);
	}
	function applyLevels() {
		Object.keys(LEVELS).forEach(function (k) {
			var L = LEVELS[k], v = levelOf(k);
			if (L.steps) {
				var names = ['--step-surface-hover', '--step-surface-selected', '--step-surface-pressed'];
				names.forEach(function (nm) { root.style.removeProperty(nm); });
				root.style.removeProperty('--fill-factor'); 
				if (v === L.rest) { root.removeAttribute(L.attr); return; }
				if (root.getAttribute(L.attr) !== v) root.setAttribute(L.attr, v);
				root.style.setProperty('--fill-factor', String(+v / 100));
				var cs = getComputedStyle(root);
				names.forEach(function (nm) { var own = parseFloat(cs.getPropertyValue(nm)); if (own > 0) root.style.setProperty(nm, (Math.round(own * +v) / 100) + '%'); });
				return;
			}
			if (v === L.rest) { root.removeAttribute(L.attr); root.style.removeProperty(L.prop); }
			else { if (root.getAttribute(L.attr) !== v) root.setAttribute(L.attr, v); root.style.setProperty(L.prop, L.css(v)); }
		});
	}
	
	function lineStyleOf() {
		var s = byId(current), tw = readTweaks()[current];
		if (tw && LINE_STYLE.indexOf(tw.linestyle) !== -1) return tw.linestyle;
		return (s && LINE_STYLE.indexOf(s.linestyle) !== -1) ? s.linestyle : LINE_STYLE[0];
	}
	  
	function cornersOf() {
		var s = byId(current), tw = readTweaks()[current];
		if (tw && CORNERS.indexOf(tw.corners) !== -1) return tw.corners;
		return (s && CORNERS.indexOf(s.corners) !== -1) ? s.corners : CORNERS[0];
	}
	
	function fadeEdgesOf() {
		var s = byId(current), tw = readTweaks()[current];
		if (tw && FADE_EDGES.indexOf(tw.fadeedges) !== -1) return tw.fadeedges;
		return (s && FADE_EDGES.indexOf(s.fadeedges) !== -1) ? s.fadeedges : FADE_EDGES[0];
	}
	 
	function markerColourOf() {
		var s = byId(current), tw = readTweaks()[current];
		if (tw && MARKERS.indexOf(tw.markercolour) !== -1) return tw.markercolour;
		return (s && MARKERS.indexOf(s.markercolour) !== -1) ? s.markercolour : MARKERS[0];
	}
	
	function framePatternOf() {
		var s = byId(current), tw = readTweaks()[current];
		if (tw && FRAME_PATTERNS.indexOf(tw.framepattern) !== -1) return tw.framepattern;
		return (s && FRAME_PATTERNS.indexOf(s.framepattern) !== -1) ? s.framepattern : FRAME_PATTERNS[0];
	}
	function applyFramePattern() { var v = framePatternOf(); if (v === FRAME_PATTERNS[0]) root.removeAttribute('data-frame-pattern'); else if (root.getAttribute('data-frame-pattern') !== v) root.setAttribute('data-frame-pattern', v); }
	
	function buttonOf() {
		var s = byId(current), tw = readTweaks()[current];
		if (tw && BUTTONS.indexOf(tw.button) !== -1) return tw.button;
		return (s && BUTTONS.indexOf(s.button) !== -1) ? s.button : BUTTONS[0];
	}
	
	
	function followers() {
		var s = byId(current), b = s && byId(baseOf(s)), tw = readTweaks()[current] || {};
		return [['links', PICKS.links.list], ['smallsoft', LEVELS.smallsoft.stops]].filter(function (x) {
			var k = x[0], ok = function (o) { return o && x[1].indexOf(o[k]) !== -1; };
			return !ok(tw) && !ok(s) && !(k === 'smallsoft' && ok(b));
		}).map(function (x) { return x[0]; });
	}
	function pickRest(key) { return key === 'links' && optionOn('soft') ? 'underlined' : PICKS[key].list[0]; }
	function pickOf(key) {
		var d = PICKS[key], s = byId(current), tw = readTweaks()[current];
		if (tw && d.list.indexOf(tw[key]) !== -1) return tw[key];
		return (s && d.list.indexOf(s[key]) !== -1) ? s[key] : pickRest(key);
	}
	function applyPicks() { Object.keys(PICKS).forEach(function (k) { var d = PICKS[k], v = pickOf(k); if (v === d.list[0]) root.removeAttribute(d.attr); else if (root.getAttribute(d.attr) !== v) root.setAttribute(d.attr, v); });  headingsArrive(); screenEffects(); }
	function effectsOf(s, tw) {
		var out = {};
		Object.keys(EFFECTS).forEach(function (fid) {
			var o = {};
			[s && s.effects && s.effects[fid], tw && tw.effects && tw.effects[fid]].forEach(function (src) {
				if (!src || typeof src !== 'object') return;
				Object.keys(src).forEach(function (d) { if (EFFECTS[fid][d] && EFFECTS[fid][d].list.indexOf(src[d]) !== -1) o[d] = src[d]; });
			});
			Object.keys(o).forEach(function (d) { if (o[d] === EFFECTS[fid][d].rest) delete o[d]; });
			if (Object.keys(o).length) out[fid] = o;
		});
		return out;
	}
	function effectOf(fid) {
		var e = (effectsOf(byId(current), readTweaks()[current] || {})[fid]) || {}, out = {};
		Object.keys(EFFECTS[fid] || {}).forEach(function (d) { out[d] = e[d] !== undefined ? e[d] : EFFECTS[fid][d].rest; });
		return out;
	}
	function applyEffects() {
		var e = effectsOf(byId(current), readTweaks()[current] || {});
		Object.keys(EFFECTS).forEach(function (fid) {
			Object.keys(EFFECTS[fid]).forEach(function (d) {
				var a = 'data-fx-' + fid + '-' + d, v = e[fid] && e[fid][d];
				if (v === undefined) root.removeAttribute(a); else if (root.getAttribute(a) !== v) root.setAttribute(a, v);
			});
		});
		headingsArrive();
		if (document.body) warpDirection(); 
	}
	var arriveSeen = null;
	var HEADS = '.single-post-article > .wp-block-post-title, .single-post-article .wp-block-post-content :is(h1, h2, h3, h4), .post-card .wp-block-post-title, .content-column .archive-page > h1, body.single :is(.wp-block-post-title, .wp-block-post-content :is(h2, h3, h4), .entry-content :is(h2, h3, h4)), .entry-title';
	var TITLES = '.wp-block-post-title, .archive-page > h1, .entry-title';
	function wrapWords(h) {
		if (h.classList.contains('ldp-words')) return;
		var i = 0, walk = document.createTreeWalker(h, NodeFilter.SHOW_TEXT), texts = [];
		while (walk.nextNode()) texts.push(walk.currentNode);
		texts.forEach(function (n) {
			var frag = document.createDocumentFragment();
			n.nodeValue.split(/(\s+)/).forEach(function (part) {
				if (!part) return;
				if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
				var w = document.createElement('span'); w.className = 'ldp-w'; w.style.setProperty('--ldp-i', i++); w.textContent = part; frag.appendChild(w);
			});
			n.parentNode.replaceChild(frag, n);
		});
		h.classList.add('ldp-words');
	}
	function headingsArrive() {
		if (!document.body) return;
		var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		var arrive = root.hasAttribute('data-head-arrival') && !still && !!window.IntersectionObserver;
		var which = root.hasAttribute('data-head-italics') ? root.getAttribute('data-fx-serif-which') : null;
		Array.prototype.forEach.call(document.querySelectorAll('.ldp-serif'), function (w) { w.classList.remove('ldp-serif'); });
		if (!arrive && !which) return;
		if (arrive && !arriveSeen) arriveSeen = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('ldp-in'); arriveSeen.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
		Array.prototype.forEach.call(document.querySelectorAll(HEADS), function (h) {
			if (h.closest('.reading-panel, #ldp-window, #wpadminbar')) return;
			wrapWords(h);
			if (which === 'last') { var ws = h.querySelectorAll('.ldp-w'); if (ws.length) ws[ws.length - 1].classList.add('ldp-serif'); }
			if (which === 'title' && h.matches(TITLES)) Array.prototype.forEach.call(h.querySelectorAll('.ldp-w'), function (w) { w.classList.add('ldp-serif'); });
			if (arrive && !h.closest('.post-card') && !h.classList.contains('ldp-arrive')) { h.classList.add('ldp-arrive'); arriveSeen.observe(h); }
		});
		if (!arrive) return;
		var scope = root.getAttribute('data-fx-arrival-scope');
		var blocks = scope ? document.querySelectorAll('.single-post-article .wp-block-post-content > p' + (scope === 'all' ? ', .single-post-article .wp-block-post-content > :is(figure, .wp-block-image, .wp-block-gallery), .single-post-article .article-media' : '')) : [];
		Array.prototype.forEach.call(blocks, function (b) { if (!b.classList.contains('ldp-arrive-block')) { b.classList.add('ldp-arrive-block'); arriveSeen.observe(b); } });
	}
	document.addEventListener('pointermove', function (ev) {
		if (!root.hasAttribute('data-fx-pointer-look') || !ev.target || !ev.target.closest) return;
		var c = ev.target.closest('.post-link-card, .support-box, .release-panel, .release-archive-card, .theme-card, .about-numbers, .format-quote blockquote.wp-block-quote, .single-format-quote .wp-block-post-content blockquote.wp-block-quote'); if (!c) return;
		var r = c.getBoundingClientRect();
		c.style.setProperty('--ldp-mx', (ev.clientX - r.left) + 'px'); c.style.setProperty('--ldp-my', (ev.clientY - r.top) + 'px');
	}, { passive: true });
	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', headingsArrive); 
	var SCREEN_ATTRS = ['data-monitor-frame', 'data-room-glass', 'data-shimmer', 'data-static', 'data-boot-screen', 'data-warp', 'data-ghosting', 'data-crisp', 'data-typed-title', 'data-switch-on'];
	function screenHost() { return document.querySelector('.frame-paper') || document.body; } 
	function screenBox() { return document.body; } 
	function screenFilters() {
		if (document.getElementById('ldp-filters')) return;
		var N = 256, c = document.createElement('canvas'); if (typeof c.getContext !== 'function') return;  c.width = c.height = N; var g = c.getContext('2d'), d = g.createImageData(N, N), i, x, y, u, v, r2;
		for (y = 0; y < N; y++) for (x = 0; x < N; x++) { u = (x + 0.5) / N * 2 - 1; v = (y + 0.5) / N * 2 - 1; r2 = u * u + v * v; i = (y * N + x) * 4; d.data[i] = 128 + Math.round(u * r2 * 60); d.data[i + 1] = 128 + Math.round(v * r2 * 60); d.data[i + 2] = 0; d.data[i + 3] = 255; }
		g.putImageData(d, 0, 0); var urlIn = c.toDataURL();
		for (i = 0; i < d.data.length; i += 4) { d.data[i] = 255 - d.data[i]; d.data[i + 1] = 255 - d.data[i + 1]; }
		g.putImageData(d, 0, 0); var urlOut = c.toDataURL();
		var warp = function (id, k) { return '<filter id="ldp-warp-' + id + '" x="0" y="0" width="1" height="1" color-interpolation-filters="sRGB"><feImage class="ldp-warp-map" href="' + urlIn + '" data-in="' + urlIn + '" data-out="' + urlOut + '" width="100%" height="100%" preserveAspectRatio="none" result="m"/><feDisplacementMap in="SourceGraphic" in2="m" scale="' + k + '" xChannelSelector="R" yChannelSelector="G"/></filter>'; };
		var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.id = 'ldp-filters'; svg.setAttribute('width', '0'); svg.setAttribute('height', '0'); svg.setAttribute('aria-hidden', 'true'); svg.style.position = 'absolute';
		svg.innerHTML = warp('slight', 14) + warp('bulged', 34) + warp('strong', 70) + '<filter id="ldp-crisp" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB"><feComponentTransfer><feFuncA type="discrete" tableValues="0 1"/></feComponentTransfer></filter><filter id="ldp-ghost" x="0" y="0" width="1" height="1"><feGaussianBlur stdDeviation="0 4"/></filter>';
		document.body.appendChild(svg);
	}
	function warpDirection() { var out = root.getAttribute('data-fx-warp-direction') === 'out'; Array.prototype.forEach.call(document.querySelectorAll('.ldp-warp-map'), function (m) { var want = m.getAttribute(out ? 'data-out' : 'data-in'); if (m.getAttribute('href') !== want) m.setAttribute('href', want); }); }
	var ghostT = null, ghostBound = false;
	function ghosting() {
		if (ghostBound) return; ghostBound = true;
		var onScroll = function () { if (!root.hasAttribute('data-ghosting')) return; var h = screenHost(); h.classList.add('ldp-moving'); clearTimeout(ghostT); ghostT = setTimeout(function () { h.classList.remove('ldp-moving'); }, 90); };
		if (window.architraveScroll && window.architraveScroll.onScroll) window.architraveScroll.onScroll(onScroll); else window.addEventListener('scroll', onScroll, { passive: true });
	}
	var sideSeen = null, sideWatched = false;
	function switchOn() {
		if (sideWatched) return; sideWatched = true;
		var sideOf = function () { return /-dark$/.test(root.getAttribute('data-theme') || '') ? 'dark' : 'light'; };
		sideSeen = sideOf();
		new MutationObserver(function () {
			var now = sideOf(); if (now === sideSeen) return; sideSeen = now;
			if (!root.hasAttribute('data-switch-on') || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
			var h = screenHost(), st = document.querySelector('.ldp-static');
			h.classList.remove('ldp-switch'); void h.offsetWidth; h.classList.add('ldp-switch'); if (st) st.classList.add('ldp-on');
			setTimeout(function () { h.classList.remove('ldp-switch'); if (st) st.classList.remove('ldp-on'); }, 750);
		}).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
	}
	var typedDone = false;
	function typedTitle() {
		if (typedDone || !root.hasAttribute('data-typed-title')) return; typedDone = true;
		var h = document.querySelector('.single-post-article > .wp-block-post-title, body.single .wp-block-post-title, body.single .entry-title'); if (!h || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
		var text = h.textContent, html = h.innerHTML, i = 0, step;
		h.classList.add('ldp-typing');
		step = function () { i++; h.textContent = text.slice(0, i); var c = document.createElement('span'); c.className = 'ldp-cursor'; h.appendChild(c); if (i < text.length) setTimeout(step, 45 + Math.random() * 55); else setTimeout(function () { h.innerHTML = html; h.classList.remove('ldp-typing'); }, 1200); };
		step();
	}
	var bootDone = false;
	function bootScreen() {
		if (bootDone) return; bootDone = true;
		if (!root.hasAttribute('data-boot-screen')) { root.removeAttribute('data-ldp-booting'); return; }
		var seen = false; try { seen = sessionStorage.getItem('ldp-boot') === '1'; } catch (e) {  }
		if (seen) { root.removeAttribute('data-ldp-booting'); return; }
		try { sessionStorage.setItem('ldp-boot', '1'); } catch (e) {  }
		var title = (document.querySelector('.wp-block-site-title') || {}).textContent || (document.title || '').split(/ [–|-] /)[0] || '';
		var line = (document.querySelector('.wp-block-site-tagline') || {}).textContent || '';
		if (root.getAttribute('data-boot-screen') === 'card') {
			var c = document.createElement('div'); c.className = 'ldp-card'; c.setAttribute('aria-hidden', 'true');
			c.innerHTML = '<svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet"><defs><pattern id="ldp-tc-grid" width="50" height="50" patternUnits="userSpaceOnUse"><path d="M50 0H0V50" fill="none" stroke="#fff" stroke-width="1" opacity=".38"/></pattern><pattern id="ldp-tc-1" width="16" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#fff"/></pattern><pattern id="ldp-tc-2" width="10" height="8" patternUnits="userSpaceOnUse"><rect width="5" height="8" fill="#fff"/></pattern><pattern id="ldp-tc-3" width="6" height="8" patternUnits="userSpaceOnUse"><rect width="3" height="8" fill="#fff"/></pattern><pattern id="ldp-tc-4" width="4" height="8" patternUnits="userSpaceOnUse"><rect width="2" height="8" fill="#fff"/></pattern><clipPath id="ldp-tc-round"><circle cx="400" cy="300" r="262"/></clipPath></defs><rect x="-1200" y="-900" width="3200" height="2400" fill="#2b2b2b"/><rect x="-1200" y="-900" width="3200" height="2400" fill="url(#ldp-tc-grid)"/><g fill="#2b2b2b" stroke="#fff" stroke-width="2"><circle cx="85" cy="85" r="56"/><circle cx="715" cy="85" r="56"/><circle cx="85" cy="515" r="56"/><circle cx="715" cy="515" r="56"/></g><path stroke="#fff" stroke-width="2" d="M29 85h112M85 29v112M659 85h112M715 29v112M29 515h112M85 459v112M659 515h112M715 459v112"/><circle cx="400" cy="300" r="270" fill="#6f6f6f" stroke="#fff" stroke-width="4"/><g clip-path="url(#ldp-tc-round)"><rect x="130" y="30" width="540" height="110" fill="#111"/><rect x="200" y="78" width="96" height="48" fill="url(#ldp-tc-1)"/><rect x="302" y="78" width="96" height="48" fill="url(#ldp-tc-2)"/><rect x="404" y="78" width="96" height="48" fill="url(#ldp-tc-3)"/><rect x="506" y="78" width="96" height="48" fill="url(#ldp-tc-4)"/><rect x="130" y="140" width="540" height="64" fill="#e9e9e9"/><rect x="130" y="392" width="540" height="58" fill="#111"/><rect x="160" y="400" width="60" height="42" fill="#fff"/><rect x="220" y="400" width="60" height="42" fill="#dadada"/><rect x="280" y="400" width="60" height="42" fill="#b6b6b6"/><rect x="340" y="400" width="60" height="42" fill="#929292"/><rect x="400" y="400" width="60" height="42" fill="#6d6d6d"/><rect x="460" y="400" width="60" height="42" fill="#494949"/><rect x="520" y="400" width="60" height="42" fill="#242424"/><rect x="580" y="400" width="60" height="42" fill="#000"/><rect x="130" y="450" width="540" height="120" fill="#3d3d3d"/><path d="M400 30v110M400 450v120" stroke="#fff" stroke-width="2"/></g><rect x="150" y="218" width="500" height="160" fill="#0d0d0d" stroke="#fff" stroke-width="3"/><text class="ldp-card-name" x="400" y="296" text-anchor="middle" fill="#f2f2f2"></text><text class="ldp-card-line" x="400" y="346" text-anchor="middle" fill="#f2f2f2"></text><text class="ldp-card-small" data-at="top" x="400" y="178" text-anchor="middle" fill="#111"></text><text class="ldp-card-small" data-at="foot" x="400" y="500" text-anchor="middle" fill="#f2f2f2"></text></svg>';
			var say = function (x) { var W = window.architraveWords || WORDS || {}; return W[x] || x; }, put = function (sel, text) { var el = c.querySelector(sel); if (el) el.textContent = text; return el; };
			var name = put('.ldp-card-name', title.trim()); put('.ldp-card-line', say('Please stand by')); put('[data-at="top"]', (line.trim() || String(location.hostname || '').replace(/^www\./, '')).slice(0, 40));  put('[data-at="foot"]', say('Transmission begins shortly'));
			document.body.appendChild(c); root.setAttribute('data-ldp-booting', 'card');
			try { if (name && name.getComputedTextLength && name.getComputedTextLength() > 460) { name.setAttribute('textLength', '460'); name.setAttribute('lengthAdjust', 'spacingAndGlyphs'); } } catch (e) {  }
			var calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
			setTimeout(function () { c.classList.add('ldp-gone'); root.removeAttribute('data-ldp-booting'); setTimeout(function () { c.remove(); }, 500); }, calm ? 700 : 1900);
			return;
		}
		var b = document.createElement('div'); b.className = 'ldp-boot'; b.setAttribute('aria-hidden', 'true');
		var bar = ''; for (var k = 0; k < 24; k++) bar += '<i></i>';
		b.innerHTML = '<div><h1></h1><p></p><div class="ldp-boot-bar">' + bar + '</div></div>';
		b.querySelector('h1').textContent = title.trim(); b.querySelector('p').textContent = line.trim();
		document.body.appendChild(b); root.setAttribute('data-ldp-booting', '');
		var blocks = b.querySelectorAll('.ldp-boot-bar i'), i = 0, still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		var fill = function () { if (i < blocks.length && !still) { blocks[i++].classList.add('ldp-lit'); setTimeout(fill, 40 + Math.random() * 40); } else setTimeout(function () { b.classList.add('ldp-gone'); root.removeAttribute('data-ldp-booting'); setTimeout(function () { b.remove(); }, 500); }, still ? 400 : 350); };
		fill();
	}
	var footWatched = false;
	function printFoot() {
		var col = document.querySelector('.content-column'); if (!col) return;
		var foot = root.hasAttribute('data-foot-band') || root.hasAttribute('data-legal-line'), band = root.hasAttribute('data-post-band');
		if (!foot && !band) return;
		if (foot && !col.querySelector('.ldp-foot')) {
			var f = document.createElement('div'); f.className = 'ldp-foot'; f.innerHTML = '<p class="ldp-legal"></p><i class="ldp-footband" aria-hidden="true"></i><div class="ldp-plate"><a class="ldp-plate-name" href="/"><i class="ldp-plate-mark" aria-hidden="true"></i><span></span></a><p class="ldp-plate-line"></p><p class="ldp-plate-legal"></p></div>';
			var name = ((document.querySelector('.wp-block-site-title') || {}).textContent || '').trim(), line = ((document.querySelector('.wp-block-site-tagline') || {}).textContent || '').trim();
			var legal = '\u00a9 ' + new Date().getFullYear() + (name ? ' ' + name : '');
			f.firstChild.textContent = legal + (line ? '. ' + line : '');
			f.querySelector('.ldp-plate-name span').textContent = name; f.querySelector('.ldp-plate-legal').textContent = legal;
			var lineEl = f.querySelector('.ldp-plate-line'); lineEl.textContent = line; if (!line) lineEl.hidden = true;
			col.appendChild(f);
			if (!line && window.fetch) {
				var kept = null; try { kept = sessionStorage.getItem('ldp-tagline'); } catch (e) {  }
				var say = function (t) { t = String(t || '').trim(); if (!t) return; lineEl.textContent = t; lineEl.hidden = false; f.firstChild.textContent = legal + '. ' + t; };
				if (kept !== null) say(kept);
				else fetch('/wp-json/', { credentials: 'same-origin' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) { var t = j && j.description ? String(j.description) : ''; try { sessionStorage.setItem('ldp-tagline', t); } catch (e) {  } say(t); }).catch(function () {  });
			}
		}
		var inset = function () { var cs = window.getComputedStyle(col); col.style.setProperty('--ldp-col-inset', cs.paddingLeft); col.style.setProperty('--ldp-col-foot', cs.paddingBottom); };
		inset();
		if (!footWatched) { footWatched = true; window.addEventListener('resize', inset, { passive: true }); }
		var logo = document.querySelector('.has-stencil-logo'), url = logo && logo.style.getPropertyValue('--architrave-logo-stencil'), ratio = logo && logo.style.getPropertyValue('--architrave-logo-ratio');
		if (url) { col.style.setProperty('--ldp-logo', url); col.style.setProperty('--ldp-logo-ratio', ratio || '1'); col.classList.add('ldp-has-logo'); }
	}
	function screenEffects() {
		if (!document.body || typeof document.createElementNS !== 'function' || !window.getComputedStyle) return; 
		var need = SCREEN_ATTRS.some(function (a) { return root.hasAttribute(a); });
		var host = screenBox(), box = document.querySelector('.ldp-screen');
		if (need && !box) { box = document.createElement('div'); box.className = 'ldp-screen'; box.setAttribute('aria-hidden', 'true'); box.innerHTML = '<i class="ldp-shimmer"></i><i class="ldp-room"></i><i class="ldp-static"></i><i class="ldp-bezel"></i>'; host.appendChild(box); }
		else if (box && box.parentNode !== host) host.appendChild(box);
		if (root.hasAttribute('data-warp') || root.hasAttribute('data-ghosting') || root.hasAttribute('data-crisp')) { screenFilters(); warpDirection(); }
		if (root.hasAttribute('data-ghosting')) ghosting();
		if (root.hasAttribute('data-switch-on')) switchOn();
		printFoot();
		typedTitle(); bootScreen(); 
	}
	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', screenEffects); else screenEffects();
	(function () { var d = PICKS.bootscreen; if (d && pickOf('bootscreen') !== d.list[0]) { var seen = false; try { seen = sessionStorage.getItem('ldp-boot') === '1'; } catch (e) {} if (!seen) root.setAttribute('data-ldp-booting', pickOf('bootscreen') === 'card' ? 'card' : ''); } })();
	function applyButton() { var v = buttonOf(); if (v === BUTTONS[0]) root.removeAttribute('data-button'); else if (root.getAttribute('data-button') !== v) root.setAttribute('data-button', v); }
	function applyMarkerColour() { var v = markerColourOf(); if (v === MARKERS[0]) root.removeAttribute('data-marker-colour'); else if (root.getAttribute('data-marker-colour') !== v) root.setAttribute('data-marker-colour', v); }
	function applyFadeEdges() { var v = fadeEdgesOf(); if (v === FADE_EDGES[0]) root.removeAttribute('data-fade-edges'); else if (root.getAttribute('data-fade-edges') !== v) root.setAttribute('data-fade-edges', v); }
	function applyCorners() { var v = cornersOf(); if (v === CORNERS[0]) root.removeAttribute('data-corners'); else if (root.getAttribute('data-corners') !== v) root.setAttribute('data-corners', v); }
	function applyLineStyle() { var v = lineStyleOf(); if (v === LINE_STYLE[0]) root.removeAttribute('data-line-style'); else if (root.getAttribute('data-line-style') !== v) root.setAttribute('data-line-style', v); }
	function applyPictures() { var v = picturesOf(); if (v === PICTURES[0]) root.removeAttribute('data-pictures'); else if (root.getAttribute('data-pictures') !== v) root.setAttribute('data-pictures', v); }
	function scopeOf() {
		return 'all';
	}
	function applyScope() { var v = scopeOf(); if (root.getAttribute('data-scope') !== v) root.setAttribute('data-scope', v); }
	function byId(id) {
		return STYLES.filter(function (s) { return s.id === id; })[0];
	}
	
	var linked = null; 
	var PREVIEW_LINK = null; 
	(function () {
		var q = window.location.search, h = window.location.hash, m, data;
		if ((m = /[?&]style=([^&]+)/.exec(q))) {
			var id = decodeURIComponent(m[1]);
			if (byId(id) && id !== 'standard') linked = byId(id);
			else if (id === 'standard' && (DEFAULT === 'standard' || DEFAULT === 'host')) linked = byId('standard') || STYLES[0];
		} else if ((m = /^#style=(.+)$/.exec(h)) && (data = decodeRecord(m[1]))) {
			linked = ownFromRecord(data);
		}
		var pv = window.architraveSiteStyles && window.architraveSiteStyles.preview;
		if (pv) {
			PREVIEW_LINK = pv;
			try {
				var held = {}; for (var li = 0; li < localStorage.length; li++) { var lk = localStorage.key(li); held[lk] = localStorage.getItem(lk); }
				window.addEventListener('pagehide', function () { try { localStorage.clear(); Object.keys(held).forEach(function (k) { localStorage.setItem(k, held[k]); }); } catch (e) {  } });
			} catch (e) {  }
			if (pv.id && byId(pv.id)) linked = byId(pv.id);
			root.setAttribute('data-ldp-preview', pv.ended ? 'ended' : 'on');
			var bar = function () {
				if (!document.body || document.querySelector('.ldp-preview-bar')) return;
				var b = document.createElement('div'), W = window.architraveWords || {}, w = function (x) { return W[x] || x; };
				b.className = 'ldp-preview-bar'; b.setAttribute('role', 'status');
				if (pv.ended) b.textContent = w('This preview link has ended.');
				else { var until = new Date(pv.until * 1000), strong = document.createElement('b'); strong.textContent = pv.name; b.appendChild(document.createTextNode(w('Preview of') + ' ')); b.appendChild(strong); b.appendChild(document.createTextNode(' · ' + w('Ends') + ' ' + until.toLocaleDateString(document.documentElement.lang || undefined, { day: 'numeric', month: 'long' }))); }
				document.body.appendChild(b);
			};
			if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bar); else bar();
		}
		if (linked && window.history && history.replaceState) {
			try { history.replaceState(null, '', window.location.pathname + q.replace(/([?&])style=[^&]*(&|$)/, function (a, b, c) { return c ? b : ''; }) + (/^#style=/.test(h) ? '' : h)); } catch (e) {  }
		}
	})();
	var HOST = window.architravePanelHostStyle || null;
	if (HOST) {
		STYLES.unshift({ id: 'host', label: HOST.label, host: true, palette: 'neutral', tint: 'default', sans: 'inter', reading: 'default', face: 'host', leading: 'default', justify: false, dropcap: false, rounded: true, lines: false, bold: false, scope: 'all', fills: true, roles: {} });
		if (DEFAULT !== 'host') { var dRec = byId(DEFAULT); STYLES.splice(STYLES.indexOf(dRec), 1); STYLES.unshift(dRec); } 
		document.addEventListener('DOMContentLoaded', function () { still(function () { 
			var rec = byId('host'), had = root.hasAttribute('data-chosen'), hadC = root.getAttribute('data-colours'), hadT = root.getAttribute('data-theme');
			if (!rec) return;
			if (had) root.removeAttribute('data-chosen');
			if (hadC !== null) root.removeAttribute('data-colours'); 
			var bodyT = document.body.style.getPropertyValue('transition'), bodyP = document.body.style.getPropertyPriority('transition');
			document.body.style.setProperty('transition', 'none', 'important');
			var read = function (side) {
				root.setAttribute('data-theme', 'neutral-' + side);
				var cs = window.getComputedStyle(document.body), paper = cs.backgroundColor;
				if (!paper || /rgba\(0, 0, 0, 0\)|transparent/.test(paper)) paper = '#ffffff';
				
				var lumIn = function (c2) { var v2 = (String(c2).match(/[\d.]+/g) || []).map(Number); return v2.length >= 3 ? 0.2126 * v2[0] + 0.7152 * v2[1] + 0.0722 * v2[2] : null; };
				var paperLum = lumIn(paper), accent = '';
				var links = document.querySelectorAll('.wp-block-post-content a, .entry-content a, main a, article a');
				for (var li = 0; li < links.length && li < 60; li++) {
					var a1 = links[li];
					if (a1.closest('.wp-block-button, .wp-block-buttons, button, .wp-block-social-links, .reading-panel, .architrave-panel-opener')) continue;
					var c1 = window.getComputedStyle(a1).color, l1 = lumIn(c1);
					if (l1 === null || paperLum === null || Math.abs(l1 - paperLum) < 40) continue;
					accent = c1; break;
				}
				return { paper: paper, ink: cs.color, accent: accent && accent !== cs.color ? accent : cs.color };
			};
			var light = read('light'), dark = read('dark'), face = window.getComputedStyle(document.body).fontFamily;
			var own = window.architravePanelHostSide, other = own === 'dark' ? 'light' : 'dark';
			if (own && window.architravePanelGuest) {
				var bands = Array.prototype.slice.call(document.querySelectorAll('header, footer, nav, main, aside, [id*="header"], [id*="footer"], [id*="masthead"], [class*="site-header"], [class*="site-footer"]'), 0, 120)
					.filter(function (e) { return !e.closest('.reading-panel, .architrave-panel-opener, #wpadminbar'); });
				var bgOf = function () { return bands.map(function (e) { return window.getComputedStyle(e).backgroundColor; }); };
				var lum = function (c) { var v = (String(c).match(/[\d.]+/g) || []).map(Number); return v.length >= 3 && (v[3] === undefined || v[3] > 0.5) ? 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2] : null; };
				root.setAttribute('data-theme', 'neutral-' + own); var ownBg = bgOf();
				root.setAttribute('data-theme', 'neutral-' + other); var otherBg = bgOf();
				var pageLum = lum((own === 'light' ? light : dark).paper);
				bands.forEach(function (e, i) {
					var l = lum(ownBg[i]);
					if (l === null || pageLum === null || ownBg[i] !== otherBg[i]) return;
					var same = Math.abs(l - pageLum) < 2, beyond = own === 'light' ? l > pageLum + 2 : l < pageLum - 2;
					if (same) e.setAttribute('data-ldp-paper', ''); else if (beyond) e.setAttribute('data-ldp-raised', '');
				});
			}
			if (hadT !== null) root.setAttribute('data-theme', hadT); else root.removeAttribute('data-theme');
			if (bodyT) document.body.style.setProperty('transition', bodyT, bodyP); else document.body.style.removeProperty('transition');
			if (had) root.setAttribute('data-chosen', '');
			if (hadC !== null) root.setAttribute('data-colours', hadC);
			rec.colours = { light: light, dark: dark };
			rec.hostFace = face;
			var ch = (light.paper.match(/[\d.]+/g) || [255, 255, 255]).slice(0, 3).map(Number);
			rec.hostSide = window.architravePanelHostSide || ((0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2]) < 128 ? 'dark' : 'light');
		}); });
	}
	function isLook(id) { var s = byId(id); return id !== 'host' && !(s && s.bare); }
	function markChosen() {
		if (!HOST) return;
		if (isLook(current)) root.setAttribute('data-chosen', '');
		else root.removeAttribute('data-chosen');
		if (isLook(current) && typeof current === 'string') root.setAttribute('data-look', current);
		else root.removeAttribute('data-look');
	}
	
	var KEEP_HOME = ['quire-side', 'architrave-opener-spot', HIDDEN_KEY];
	function goHome() {
		var kill = [];
		try {
			for (var i = 0; i < localStorage.length; i++) {
				var k = localStorage.key(i);
				if (/^(architrave|quire)-/.test(k || '') && k !== OWN_KEY && k !== TWEAKS_KEY && KEEP_HOME.indexOf(k) === -1) kill.push(k);
			}
			kill.forEach(function (k) { localStorage.removeItem(k); });
			var all = readTweaks(); 
			if (all.host) { delete all.host; writeTweaks(all); }
		} catch (e) {  }
		var h = byId('host');
		if (!h) { location.reload(); return; }
		applyNow(h, { palette: wanted(h).palette, reading: wanted(h).reading, face: wanted(h).face, leading: wanted(h).leading, colours: null });
		root.removeAttribute('data-colours');
		root.removeAttribute('data-chosen');
		root.removeAttribute('data-look');
		if (wanted(h).face === 'host') {
			root.removeAttribute('data-face');
			try { localStorage.removeItem('architrave-face'); } catch (e) {  }
		}
		applyRoles();
		mark();
	}
	var stored = null;
	try { stored = localStorage.getItem(KEY); } catch (e) { stored = null; }
	
	var current = linked ? linked.id : (byId(stored) && !(stored === 'standard' && !GUEST && DEFAULT !== 'standard' && !offered(byId('standard'))) ? stored : DEFAULT); 
	function stamp(id) {
		current = id;
		if (id === 'standard' || id === 'host') root.removeAttribute(ATTR); 
		else root.setAttribute(ATTR, id);
		try {
			if (PREVIEW_LINK) {  }
			else if (id === 'host' && DEFAULT === 'host') localStorage.removeItem(KEY); 
			else localStorage.setItem(KEY, id);
		} catch (e) {  }
		markChosen(); 
	}
	stamp(current);
	(function () {
		var to = window.architraveSiteStyles && window.architraveSiteStyles.count;
		if (!READER || PREVIEW_LINK || !to || !navigator.sendBeacon || Math.random() >= 0.1) return;
		try { navigator.sendBeacon(to, new Blob([JSON.stringify({ style: current })], { type: 'application/json' })); } catch (e) {  }
	})();
	
	var seeded = false;
	if (linked || (current !== stored && current === DEFAULT && DEFAULT !== NONE)) {
		var w0 = wanted(byId(current));
		try {
			var sideNow = String(root.getAttribute('data-theme') || (Modes ? Modes.default : '')).split('-')[1] || 'light';
			if (Modes && Modes.apply) Modes.apply(w0.palette, root, sideNow);
			if (window.QuireReading && window.QuireReading.apply) window.QuireReading.apply(w0.reading, root);
			if (w0.face && w0.face !== 'newsreader') root.setAttribute('data-face', w0.face); else root.removeAttribute('data-face');
			if (w0.leading && w0.leading !== 'default') root.setAttribute('data-leading', w0.leading); else root.removeAttribute('data-leading');
		} catch (e) {  }
		seeded = true;
	}
	
	
	var OPT_ON = { pictureframe: true };
	function restOf(k) {
		var s = byId(current);
		if (s && typeof s[k] === 'boolean') return s[k];
		return !!OPT_ON[k];
	}
	function optionOn(k) {
		var tw = readTweaks()[current];
		if (tw && typeof tw[k] === 'boolean') return tw[k];
		return restOf(k);
	}
	function applyOptions() {
		var wasCap = root.getAttribute('data-dropcap');
		function stampAttr(name, value) { if (root.getAttribute(name) !== value) root.setAttribute(name, value); }
		OPTS.forEach(function (k) { stampAttr('data-' + k, optionOn(k) ? 'on' : 'off'); });
		(function () { var st = byId(current), b = st && byId(baseOf(st)); stampAttr('data-reading-base', (st && st.reading) || (b && b.reading) || 'default'); })();
		stampAttr('data-hyphens', optionOn('justify') ? 'on' : 'off');
		if (wasCap !== null && wasCap !== root.getAttribute('data-dropcap')) {
			document.querySelectorAll('.wp-block-post-content > p:first-of-type, .wp-block-post-excerpt > p:first-of-type').forEach(function (p) {
				var was = p.style.display;
				p.style.display = 'none';
				void p.offsetHeight;
				p.style.display = was;
			});
		}
		try { localStorage.removeItem('architrave-justify'); localStorage.removeItem('architrave-hyphens'); } catch (e) {  }
	}
	
	var ACCENT_KEY = 'architrave-accent';
	function accentOn() {
		try { return localStorage.getItem(ACCENT_KEY) !== 'off'; } catch (e) { return true; }
	}
	function applyAccent() {
		if (accentOn()) root.removeAttribute('data-accent'); else root.setAttribute('data-accent', 'off');
		try { localStorage.removeItem('architrave-links'); } catch (e) {  }
	}
	
	var TWEAK_KEYS = DIALS.concat(OPTS, ['tint', 'sans', 'scope', 'roles', 'colours', 'pictures', 'capLines', 'scan', 'line', 'fill', 'glowlevel', 'grainlevel', 'vignettelevel', 'vignettereach', 'softlevel', 'quietlevel', 'smallsoft', 'measure', 'space', 'framewidth', 'dotsize', 'dotlevel', 'linestyle', 'corners', 'fadeedges', 'markercolour', 'framepattern', 'button', 'buttonshape', 'buttonstyle', 'buttonmedium', 'buttonquiet', 'tags', 'chosenitem', 'linewidth', 'cards', 'quotes', 'notes', 'fields', 'titlefinish', 'headitalics', 'headarrival', 'cardlight', 'buttonfinish', 'toppattern', 'guides', 'greytint', 'pageglow', 'movinglight', 'monitorframe', 'fringe', 'crisp', 'scanstyle', 'shimmer', 'warp', 'switchon', 'bloom', 'ghosting', 'jitter', 'graincrawl', 'typedtitle', 'bootscreen', 'roomglass', 'phosphor', 'static', 'dropout', 'headrule', 'ink', 'tooth', 'edges', 'columns', 'paragraphs', 'rainbow', 'postband', 'footband', 'menuline', 'legalline', 'stripes', 'sitename', 'fullpicture', 'categories', 'links', 'unlinked', 'preset', 'was', 'effects']);
	function cleanTweaks(all) {
		var out = {};
		Object.keys(all || {}).forEach(function (id) {
			var e = all[id], s = byId(id), clean = {};
			if (!s || !e || typeof e !== 'object') return;
			liftCentre(e, s);
			TWEAK_KEYS.forEach(function (k) { if (k !== 'roles' && k !== 'colours' && k !== 'effects' && e[k] !== undefined) clean[k] = e[k]; });
			
			if (e.colours && typeof e.colours === 'object') {
				var colours = {};
				['light', 'dark'].forEach(function (side) {
					var c = e.colours[side]; if (!c || typeof c !== 'object') return;
					var keptC = {};
					['paper', 'ink', 'accent', 'button', 'head', 'kicker', 'ground', 'lift', 'marker', 'inverse', 'light', 'second'].forEach(function (k) { 
						var v = c[k];
						if (v === '' && s.colours && s.colours[side] && s.colours[side][k]) { keptC[k] = ''; return; }
						if (typeof v !== 'string' || !/^#[0-9a-f]{6}$/i.test(v)) return;
						var rest = s.colours && s.colours[side] && s.colours[side][k];
						if (String(v).toLowerCase() !== String(rest || '').toLowerCase()) keptC[k] = v.toLowerCase();
					});
					if (Object.keys(keptC).length) colours[side] = keptC;
				});
				if (Object.keys(colours).length) clean.colours = colours;
			}
			if (e.roles && typeof e.roles === 'object') {
				var roles = {};
				ROLES.forEach(function (role) {
					var r = e.roles[role]; if (!r || typeof r !== 'object') return;
					var kept = {};
					Object.keys(ROLE_DEFAULT[role]).forEach(function (d) {
						if (r[d] === undefined) return;
						var v = r[d];
						if (d === 'align' && ALIGNS.indexOf(v) === -1) return;
						if (d === 'colour' && ROLE_COLOURS.indexOf(v) === -1) return;
						if (d === 'weight') v = WEIGHT_ALIAS[v] || v;
						if (d === 'size') v = rungFor(role, v);
						var rest = ROLE_DEFAULT[role][d];
						if (s.roles && s.roles[role] && s.roles[role][d] !== undefined) rest = s.roles[role][d];
						if (d === 'weight') rest = WEIGHT_ALIAS[rest] || rest;
						if (d === 'size') rest = rungFor(role, rest);
						if (v !== rest || (window.architravePanelGuest && (s.host || s.bare))) kept[d] = v; 
					});
					if (Object.keys(kept).length) roles[role] = kept;
				});
				if (Object.keys(roles).length) clean.roles = roles;
			}
			if (e.effects && typeof e.effects === 'object') {
				var fx = {};
				Object.keys(EFFECTS).forEach(function (fid) {
					var r = e.effects[fid]; if (!r || typeof r !== 'object') return;
					var kept = {};
					Object.keys(EFFECTS[fid]).forEach(function (d) {
						var v = r[d]; if (EFFECTS[fid][d].list.indexOf(v) === -1) return;
						var own = s.effects && s.effects[fid] && s.effects[fid][d];
						if (v !== (own !== undefined ? own : EFFECTS[fid][d].rest)) kept[d] = v;
					});
					if (Object.keys(kept).length) fx[fid] = kept;
				});
				if (Object.keys(fx).length) clean.effects = fx;
			}
			if (Object.keys(clean).length) out[id] = clean;
		});
		return out;
	}
	function readTweaks() {
		try { return cleanTweaks(JSON.parse(localStorage.getItem(TWEAKS_KEY) || '{}') || {}); } catch (e) { return {}; }
	}
	var HISTORY = [], FUTURE = [], lastPush = 0, undoing = false; 
	function storedSide() { try { return localStorage.getItem('quire-side') || ''; } catch (e) { return ''; } } 
	function changedKey(wasText, nextText) {
		var a, b;
		try { a = (JSON.parse(wasText || '{}') || {})[current] || {}; b = (JSON.parse(nextText || '{}') || {})[current] || {}; } catch (e) { return ''; }
		var keys = Object.keys(a).concat(Object.keys(b));
		for (var i = 0; i < keys.length; i++) {
			var k = keys[i];
			if (JSON.stringify(a[k]) === JSON.stringify(b[k])) continue;
			if (k === 'roles') {
				var ra = a.roles || {}, rb = b.roles || {}, rk = Object.keys(ra).concat(Object.keys(rb));
				for (var j = 0; j < rk.length; j++) if (JSON.stringify(ra[rk[j]]) !== JSON.stringify(rb[rk[j]])) return 'role:' + rk[j];
			}
			if (k === 'effects') {
				var fa = a.effects || {}, fb = b.effects || {}, fk = Object.keys(fa).concat(Object.keys(fb));
				for (var q = 0; q < fk.length; q++) if (JSON.stringify(fa[fk[q]]) !== JSON.stringify(fb[fk[q]])) return 'effect:' + fk[q];
			}
			return k;
		}
		return a && b && JSON.stringify(a) !== JSON.stringify(b) ? '' : 'reset';
	}
	function writeTweaks(all) {
		var next = JSON.stringify(all);
		try {
			var was = localStorage.getItem(TWEAKS_KEY) || '{}';
			if (!undoing && !previewing && was !== next) {
				versionSoon(); FUTURE = []; 
				var nowMs = Date.now();
				if (nowMs - lastPush > 700) { HISTORY.push({ tweaks: was, side: storedSide(), style: current, what: changedKey(was, next) }); if (HISTORY.length > 40) HISTORY.shift(); }
				lastPush = nowMs;
			}
			if (next === '{}') localStorage.removeItem(TWEAKS_KEY); else localStorage.setItem(TWEAKS_KEY, next);
		} catch (e) {  }
	}
	applyOptions();
	applyTint();
	applySans();
	applyTracking();
	applyScope();
	applyPictures();
	applyCapLines();
	applyLevels();
	applyLineStyle();
	applyFadeEdges();
	applyMarkerColour();
	applyButton();
	applyPicks();
	applyEffects();
	applyFramePattern();
	applyCorners();
	applyAccent();
	
	var Focus = window.ArchitraveFocus || { on: function () { return false; }, motion: function () { return 0; }, retime: function () { return 0; }, set: function () {} };
	
	function coloursOf(id) {
		var s = byId(id || current), tw = readTweaks()[(s && s.id) || current] || {}, out = { light: {}, dark: {} };
		['light', 'dark'].forEach(function (side) {
			
			var named = (s && s.preset && tw.preset === undefined) ? presetById(s.preset) : null;
			var base = {}, t = (tw.colours && tw.colours[side]) || {};
			[(named && named[side]) || {}, (s && s.colours && s.colours[side]) || {}].forEach(function (src) { Object.keys(src).forEach(function (k) { if (src[k]) base[k] = src[k]; }); });
			['paper', 'ink', 'accent', 'button', 'head', 'kicker', 'ground', 'lift', 'marker', 'inverse', 'light', 'second'].forEach(function (k) { var v = t[k] !== undefined ? t[k] : base[k]; if (v) out[side][k] = v; });
		});
		if (!id || id === current) { var ph = PHOSPHOR[pickOf('phosphor')]; if (ph) { out.dark.paper = ph[0]; out.dark.ink = ph[1]; out.dark.accent = ph[2]; } }
		return out;
	}
	var PHOSPHOR = { blue: ['#3535a0', '#fcf9f3', '#fcf9f3'], green: ['#061a0c', '#62ff85', '#b6ffc4'], amber: ['#1a1104', '#ffb340', '#ffd48a'], white: ['#0f1012', '#ececec', '#ffffff'], black: ['#000000', '#fcf9f3', '#ffffff'] };
	var PRESETS = [
		{ id: 'chalk', label: 'Salt morning', light: { paper: '#f7f7f5', ink: '#1f2124', accent: '#4a5568' }, dark: { paper: '#17181a', ink: '#e8e8e6', accent: '#9aa7b8' } },
		{ id: 'sand', label: 'Evening dune', light: { paper: '#f3e7d3', ink: '#2e2418', accent: '#a35a1f' }, dark: { paper: '#241c12', ink: '#eadfcb', accent: '#e0a35c' } },
		{ id: 'linen', label: 'Linen noon', light: { paper: '#f1efe6', ink: '#26261f', accent: '#6b6a4f' }, dark: { paper: '#1d1d18', ink: '#e6e4d8', accent: '#b5b489' } },
		{ id: 'moss', label: 'Jade valley', light: { paper: '#eaf0e6', ink: '#1c2a1c', accent: '#2f6b36' }, dark: { paper: '#141a14', ink: '#dfe8dc', accent: '#7fc98a' } },
		{ id: 'fog', label: 'Foggy morning', light: { paper: '#eceff3', ink: '#1f262e', accent: '#3d6b8f' }, dark: { paper: '#161a1f', ink: '#dfe6ee', accent: '#86b6dd' } },
		{ id: 'brick', label: 'Ember rock', light: { paper: '#f5e9e2', ink: '#2b1d18', accent: '#a8402a' }, dark: { paper: '#201715', ink: '#eddcd4', accent: '#e08268' } },
		{ id: 'cobalt', label: 'Blue hour', light: { paper: '#eef1f8', ink: '#16203a', accent: '#2743a8' }, dark: { paper: '#121727', ink: '#e1e7f5', accent: '#8ba3f5' } },
		{ id: 'olive', label: 'Cactus light', light: { paper: '#f0f0e2', ink: '#262a19', accent: '#5d6b1f' }, dark: { paper: '#1a1c14', ink: '#e5e7d5', accent: '#b6c563' } },
		{ id: 'meadow', label: 'Meadow morning', light: { paper: '#9dd36f', ink: '#2c2e2a', accent: '#1d4d0a' }, dark: { paper: '#2f4a25', ink: '#f5f1e4', accent: '#9dd36f' }, ground: { light: '#f5f1e4', dark: '#1e3218' }, lift: { light: '#ffffff', dark: '#43643a' } },   
		{ id: 'lichen', label: 'Lichen night', light: { paper: '#f7f7f5', ink: '#222f30', accent: '#46731a' }, dark: { paper: '#222f30', ink: '#ffffff', accent: '#cef79e' } }, 
		{ id: 'corten', label: 'Corten field', light: { paper: '#b84b30', ink: '#f8f4e9', accent: '#ffffff' }, dark: { paper: '#5f1d1a', ink: '#f8f4e9', accent: '#f2b49c' } }, 
		{ id: 'sandstone', label: 'Sandstone', light: { paper: '#f8f4e9', ink: '#b84b30', accent: '#5f1d1a' }, dark: { paper: '#b84b30', ink: '#f8f4e9', accent: '#ffffff' } }, 
		{ id: 'plum', label: 'Mallow evening', light: { paper: '#f2ecf3', ink: '#271e2c', accent: '#6f3a80' }, dark: { paper: '#1b161e', ink: '#e8dfea', accent: '#c496d6' } },
		{ id: 'rust', label: 'Rust desert', light: { paper: '#f6ece3', ink: '#2c2018', accent: '#b4531d' }, dark: { paper: '#211915', ink: '#eee0d3', accent: '#e79355' } },
		{ id: 'navy', label: 'Sea night', light: { paper: '#edf0f2', ink: '#14212b', accent: '#0f4c70' }, dark: { paper: '#101a21', ink: '#dfe8ee', accent: '#6fb3d8' } },
		{ id: 'sage', label: 'Oasis light', light: { paper: '#ecf1ed', ink: '#1e2a22', accent: '#3f7a5c' }, dark: { paper: '#151b17', ink: '#e0e9e3', accent: '#85c9a6' } },
		{ id: 'charcoal', label: 'Grey hour', light: { paper: '#f0f0f0', ink: '#202020', accent: '#555555' }, dark: { paper: '#141414', ink: '#e4e4e4', accent: '#a0a0a0' } },
		{ id: 'midnight', label: 'Indigo night', light: { paper: '#eaecf4', ink: '#171a2e', accent: '#303c8c' }, dark: { paper: '#0f1120', ink: '#dfe2f0', accent: '#8f9bea' } },
		{ id: 'espresso', label: 'Earth shadow', light: { paper: '#f2ebe4', ink: '#241a14', accent: '#7a4a26' }, dark: { paper: '#1b1512', ink: '#e8ded4', accent: '#c89468' } },
		{ id: 'carbon', label: 'Carbon night', light: { paper: '#f6f5f2', ink: '#1b1a1c', accent: '#3d4bb5' }, dark: { paper: '#1b1a1c', ink: '#f1f0ee', accent: '#9aa5e8' } },
		{ id: 'draft', label: 'Drafting blue', light: { paper: '#edf1f6', ink: '#23395f', accent: '#2a5bc0' }, dark: { paper: '#133a7c', ink: '#eaf1ff', accent: '#a9cbff' } },
		{ id: 'limelight', label: 'Lime night', light: { paper: '#f4f5f6', ink: '#08090a', accent: '#5c6300' }, dark: { paper: '#0f1011', ink: '#f4f6f8', accent: '#e4f222' } }, 
		{ id: 'gallery', label: 'Gallery white', ground: 'paper', light: { paper: '#ffffff', ink: '#1d1d1f', accent: '#0066cc' }, dark: { paper: '#000000', ink: '#f5f5f7', accent: '#2997ff' }, lift: { dark: '#1d1d1f' }, frame: { dark: '#161617' } },  
		{ id: 'bootblue', label: 'Boot blue', light: { paper: '#fcf9f3', ink: '#1a1a1a', accent: '#3535a0' }, dark: { paper: '#3535a0', ink: '#fcf9f3', accent: '#fcf9f3' } }, 
		{ id: 'television', label: 'Television', light: { paper: '#e6e8ec', ink: '#14161a', accent: '#14161a' }, dark: { paper: '#0e1014', ink: '#e6eaf1', accent: '#ffffff' } },  
		{ id: 'newsprint', label: 'Newsprint', light: { paper: '#ebe3d1', ink: '#1c1a17', accent: '#1c1a17' }, dark: { paper: '#1e1a15', ink: '#f1e8d6', accent: '#f1e8d6' } }, 
		{ id: 'vellum', label: 'Vellum', light: { paper: '#f6f6f4', ink: '#2c2c26', accent: '#6f6c42' }, dark: { paper: '#23231f', ink: '#f2f1ea', accent: '#c9c48a' } }, 
		{ id: 'vermilion', label: 'Vermilion', light: { paper: '#b82a16', ink: '#fff6ec', accent: '#ffe680' }, dark: { paper: '#2a0a06', ink: '#ffd9cc', accent: '#ff7a5c' }, fresh: true, group: 'bold' },
		{ id: 'ultramarine', label: 'Ultramarine', light: { paper: '#1f33c9', ink: '#f2f4ff', accent: '#ffd23f' }, dark: { paper: '#0a0f33', ink: '#dfe4ff', accent: '#8c98ff' }, fresh: true, group: 'bold' },
		{ id: 'cadmium', label: 'Cadmium yellow', light: { paper: '#ffd23f', ink: '#231c00', accent: '#b3124f' }, dark: { paper: '#1f1a05', ink: '#fff3c4', accent: '#ffd23f' }, fresh: true, group: 'bold' },
		{ id: 'flamingo', label: 'Flamingo', light: { paper: '#ffc9da', ink: '#3b0a1f', accent: '#b01d5c' }, dark: { paper: '#2a0b18', ink: '#ffe0ea', accent: '#ff79aa' }, fresh: true, group: 'bold' },
		{ id: 'viridian', label: 'Viridian', light: { paper: '#0b6358', ink: '#eafff9', accent: '#ffd59a' }, dark: { paper: '#062521', ink: '#cff5ec', accent: '#46d9c0' }, fresh: true, group: 'bold' },
		{ id: 'ultraviolet', label: 'Ultraviolet', light: { paper: '#ece2ff', ink: '#24005c', accent: '#6a12e8' }, dark: { paper: '#16002e', ink: '#eadcff', accent: '#c6ff3d' }, fresh: true, group: 'bold' },
		{ id: 'tangerine', label: 'Tangerine', light: { paper: '#ff8a1f', ink: '#1f0e00', accent: '#3d1a8f' }, dark: { paper: '#2a1300', ink: '#ffe3c7', accent: '#ff9a3d' }, fresh: true, group: 'bold' },
		{ id: 'lagoon', label: 'Lagoon', light: { paper: '#b6f0de', ink: '#0b3b33', accent: '#c2185b' }, dark: { paper: '#0a2a26', ink: '#c9f7ea', accent: '#6ff0c8' }, fresh: true, group: 'bold' }
	];
	var ACCENTS = [
		{ id: 'red', label: 'Red', light: '#dc2626', dark: '#f87171' },
		{ id: 'orange', label: 'Orange', light: '#c24400', dark: '#ff9a2e' },
		{ id: 'amber', label: 'Amber', light: '#b45309', dark: '#fbbf24' },
		{ id: 'yellow', label: 'Yellow', light: '#a16207', dark: '#facc15' },
		{ id: 'lime', label: 'Lime', light: '#4d7c0f', dark: '#a3e635' },
		{ id: 'green', label: 'Green', light: '#03791f', dark: '#5af169' },
		{ id: 'emerald', label: 'Emerald', light: '#047857', dark: '#34d399' },
		{ id: 'teal', label: 'Teal', light: '#0f766e', dark: '#2dd4bf' },
		{ id: 'cyan', label: 'Cyan', light: '#0e7490', dark: '#22d3ee' },
		{ id: 'sky', label: 'Sky', light: '#0369a1', dark: '#38bdf8' },
		{ id: 'blue', label: 'Blue', light: '#0000ff', dark: '#6b7fff' },
		{ id: 'indigo', label: 'Indigo', light: '#4338ca', dark: '#818cf8' },
		{ id: 'violet', label: 'Violet', light: '#6d28d9', dark: '#a78bfa' },
		{ id: 'purple', label: 'Purple', light: '#7444b4', dark: '#9a73ff' },
		{ id: 'fuchsia', label: 'Fuchsia', light: '#a21caf', dark: '#e879f9' },
		{ id: 'pink', label: 'Pink', light: '#be185d', dark: '#f472b6' },
		{ id: 'rose', label: 'Rose', light: '#be123c', dark: '#fb7185' },
		{ id: 'brown', label: 'Brown', light: '#8b5727', dark: '#e0b490' },
		{ id: 'slate', label: 'Slate', light: '#475569', dark: '#94a3b8' },
		{ id: 'stone', label: 'Stone', light: '#57534e', dark: '#a8a29e' }
	];
	var PAPERS = [
		{ id: 'red', label: 'Red', light: '#fef2f2', dark: '#450a0a' },
		{ id: 'orange', label: 'Orange', light: '#fff7ed', dark: '#431407' },
		{ id: 'amber', label: 'Amber', light: '#fffbeb', dark: '#451a03' },
		{ id: 'yellow', label: 'Yellow', light: '#fefce8', dark: '#422006' },
		{ id: 'lime', label: 'Lime', light: '#f7fee7', dark: '#1a2e05' },
		{ id: 'green', label: 'Green', light: '#f0fdf4', dark: '#052e16' },
		{ id: 'emerald', label: 'Emerald', light: '#ecfdf5', dark: '#022c22' },
		{ id: 'teal', label: 'Teal', light: '#f0fdfa', dark: '#042f2e' },
		{ id: 'cyan', label: 'Cyan', light: '#ecfeff', dark: '#083344' },
		{ id: 'sky', label: 'Sky', light: '#f0f9ff', dark: '#082f49' },
		{ id: 'blue', label: 'Blue', light: '#eff6ff', dark: '#172554' },
		{ id: 'indigo', label: 'Indigo', light: '#eef2ff', dark: '#1e1b4b' },
		{ id: 'violet', label: 'Violet', light: '#f5f3ff', dark: '#2e1065' },
		{ id: 'purple', label: 'Purple', light: '#faf5ff', dark: '#3b0764' },
		{ id: 'fuchsia', label: 'Fuchsia', light: '#fdf4ff', dark: '#4a044e' },
		{ id: 'pink', label: 'Pink', light: '#fdf2f8', dark: '#500724' },
		{ id: 'rose', label: 'Rose', light: '#fff1f2', dark: '#4c0519' },
		{ id: 'brown', label: 'Brown', light: '#faf5f0', dark: '#2a1a12' },
		{ id: 'slate', label: 'Slate', light: '#f8fafc', dark: '#020617' },
		{ id: 'stone', label: 'Stone', light: '#fafaf9', dark: '#0c0a09' }
	];
	var INKS = [
		{ id: 'red', label: 'Red', light: '#7f1d1d', dark: '#fee2e2' },
		{ id: 'orange', label: 'Orange', light: '#7c2d12', dark: '#ffedd5' },
		{ id: 'amber', label: 'Amber', light: '#78350f', dark: '#fef3c7' },
		{ id: 'yellow', label: 'Yellow', light: '#713f12', dark: '#fef9c3' },
		{ id: 'lime', label: 'Lime', light: '#365314', dark: '#ecfccb' },
		{ id: 'green', label: 'Green', light: '#14532d', dark: '#dcfce7' },
		{ id: 'emerald', label: 'Emerald', light: '#064e3b', dark: '#d1fae5' },
		{ id: 'teal', label: 'Teal', light: '#134e4a', dark: '#ccfbf1' },
		{ id: 'cyan', label: 'Cyan', light: '#164e63', dark: '#cffafe' },
		{ id: 'sky', label: 'Sky', light: '#0c4a6e', dark: '#e0f2fe' },
		{ id: 'blue', label: 'Blue', light: '#1e3a8a', dark: '#dbeafe' },
		{ id: 'indigo', label: 'Indigo', light: '#312e81', dark: '#e0e7ff' },
		{ id: 'violet', label: 'Violet', light: '#4c1d95', dark: '#ede9fe' },
		{ id: 'purple', label: 'Purple', light: '#581c87', dark: '#f3e8ff' },
		{ id: 'fuchsia', label: 'Fuchsia', light: '#701a75', dark: '#fae8ff' },
		{ id: 'pink', label: 'Pink', light: '#831843', dark: '#fce7f3' },
		{ id: 'rose', label: 'Rose', light: '#881337', dark: '#ffe4e6' },
		{ id: 'brown', label: 'Brown', light: '#4a2f1c', dark: '#f0e4d8' },
		{ id: 'slate', label: 'Slate', light: '#0f172a', dark: '#f1f5f9' },
		{ id: 'stone', label: 'Stone', light: '#1c1917', dark: '#f5f5f4' }
	];
	var LISTS = { paper: PAPERS, ink: INKS, accent: ACCENTS, button: ACCENTS, head: ACCENTS, kicker: ACCENTS, ground: PAPERS, lift: PAPERS, marker: ACCENTS, light: ACCENTS, second: ACCENTS }; 
	function listColourOf(key) {
		var c = coloursOf(), light = (c.light || {})[key], dark = (c.dark || {})[key];
		if (!light || !dark) return '';
		var hit = (LISTS[key] || []).filter(function (x) { return x.light === light && x.dark === dark; })[0];
		return hit ? hit.id : ''; 
	}
	function accentById(id) { return ACCENTS.filter(function (a) { return a.id === id; })[0] || null; }
	function accentColourOf() { return listColourOf('accent'); }
	function presetById(id) { return PRESETS.filter(function (p) { return p.id === id; })[0] || null; }
	function presetOf() {
		var s = byId(current), tw = readTweaks()[current];
		if (tw && tw.preset !== undefined) return tw.preset || '';
		return (s && s.preset) || '';
	}
	function hexToOklch(hex) {
		var c = hex.replace('#', ''), rgb = [0, 2, 4].map(function (i) { var n = parseInt(c.substr(i, 2), 16) / 255; return n <= 0.04045 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4); });
		var l = 0.4122214708 * rgb[0] + 0.5363325363 * rgb[1] + 0.0514459929 * rgb[2], m = 0.2119034982 * rgb[0] + 0.6806995451 * rgb[1] + 0.1073969566 * rgb[2], s = 0.0883024619 * rgb[0] + 0.2817188376 * rgb[1] + 0.6299787005 * rgb[2];
		l = Math.cbrt(l); m = Math.cbrt(m); s = Math.cbrt(s);
		var L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, b = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
		return { L: L, C: Math.sqrt(a * a + b * b), h: Math.atan2(b, a) };
	}
	function oklchToHex(o) {
		var a = o.C * Math.cos(o.h), b = o.C * Math.sin(o.h);
		var l = o.L + 0.3963377774 * a + 0.2158037573 * b, m = o.L - 0.1055613458 * a - 0.0638541728 * b, s = o.L - 0.0894841775 * a - 1.291485548 * b;
		l = l * l * l; m = m * m * m; s = s * s * s;
		var rgb = [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s];
		return '#' + rgb.map(function (v) { v = Math.max(0, Math.min(1, v)); v = v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055; var h = Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16); return h.length < 2 ? '0' + h : h; }).join('');
	}
	function deriveColour(hex, key, toSide) {
		if (key === 'accent') return hex; 
		var o = hexToOklch(hex), L = o.L;
		if (toSide === 'dark') { if (key === 'paper') { L = 0.26 + (1 - L) * 0.6; o.C *= 0.7; } else L = 0.6 + (1 - L) * 0.4; } 
		else { if (key === 'paper') L = 0.82 + (1 - L) * 0.18; else L = 0.42 - 0.2 * L; }
		o.L = Math.max(0, Math.min(1, L));
		return oklchToHex(o);
	}
	
	function unlinkedOf() {
		var s = byId(current), tw = readTweaks()[current];
		if (tw && typeof tw.unlinked === 'boolean') return tw.unlinked;
		return !!(s && s.unlinked);
	}
	function accentForPaper(hex, paper, min) {
		min = min || 4.5;
		if (!paper || contrast(hex, paper) >= min) return hex;
		var o = hexToOklch(hex), towardDark = lum(paper) > 0.18, best = hex;
		for (var i = 0; i < 40; i++) {
			o.L = Math.max(0.05, Math.min(0.97, o.L + (towardDark ? -0.02 : 0.02)));
			best = oklchToHex(o);
			if (contrast(best, paper) >= min) break;
		}
		return best;
	}
	function coloursResolved(id) {
		var out = coloursOf(id); out.derived = { light: [], dark: [] };
		[['light', 'dark'], ['dark', 'light']].forEach(function (pair) {
			var from = pair[0], to = pair[1];
			['paper', 'ink', 'accent', 'button', 'head', 'kicker', 'ground', 'lift', 'light', 'second'].forEach(function (k) {
				if (out[from][k] && !out[to][k] && out.derived[from].indexOf(k) === -1) { out[to][k] = deriveColour(out[from][k], k === 'paper' || k === 'ink' ? k : k === 'ground' || k === 'lift' ? 'paper' : 'accent', to); out.derived[to].push(k); }
				if (out[from].marker && !out[to].marker && out.derived[from].indexOf('marker') === -1) { out[to].marker = out[from].marker; out.derived[to].push('marker'); }
			});
		});
		['light', 'dark'].forEach(function (side) {
			var paper = out[side].paper || paperOf(side);
			if (out.derived[side].indexOf('accent') !== -1) out[side].accent = accentForPaper(out[side].accent, paper);
			['button', 'head', 'kicker', 'light', 'second'].forEach(function (k) { if (out.derived[side].indexOf(k) !== -1) out[side][k] = accentForPaper(out[side][k], paper); }); 
			if (out.derived[side].indexOf('marker') !== -1) out[side].marker = accentForPaper(out[side].marker, paper, 3);
		});
		return out;
	}
	function lum(hex) {
		var c = hex.replace('#', ''), v = [0, 2, 4].map(function (i) { var n = parseInt(c.substr(i, 2), 16) / 255; return n <= 0.03928 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4); });
		return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
	}
	function contrast(a, b) { var x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
	
	function sideSelectors(side, extra) {
		var on = 'html:root[data-colours="on"]';
		var list = [on + '[data-theme$="-' + side + '"]' + (extra || '')];
		if (side === 'light') list.push(on + ':not([data-theme])' + (extra || ''));
		return list;
	}
	function sideRule(side, extra, suffix, body) {
		return sideSelectors(side, extra).map(function (sel) { return sel + (suffix || ''); }).join(',') + '{' + body + '}';
	}
	function shade(hex, dL) {
		var o = hexToOklch(hex);
		o.L = Math.max(0, Math.min(1, o.L + dL));
		return oklchToHex(o);
	}
	function sink(hex, d) { var o = hexToOklch(hex); return o.L <= 0.03 ? hex : shade(hex, -d); }
	function rise(hex, d, dBlack) {
		var L = hexToOklch(hex).L;
		if (L >= 0.18) return d;
		var t = 1 - L / 0.18;
		return d + (dBlack - d) * t * t;
	}
	function field(hex, d, dBlack) {
		var L = hexToOklch(hex).L;
		return L < 0.18 ? shade(hex, rise(hex, d, dBlack)) : shade(hex, -d);
	}
	
	function pairLooks(c, side) {
		var pre = PRESETS.filter(function (x) { return x.id === presetOf(); })[0], flat = !!(window.architravePanelGuest && pre && pre.ground === 'paper');
		var mine = pre && pre[side] && String(c.paper).toLowerCase() === pre[side].paper && String(c.ink).toLowerCase() === pre[side].ink;
		var G = c.ground || (mine && pre.ground && typeof pre.ground === 'object' ? pre.ground[side] : ''), F = c.lift || (mine && pre.lift ? pre.lift[side] : '');
		if (!G && mine && pre.frame && pre.frame[side] && !window.architravePanelGuest) G = pre.frame[side]; 
		return { flat: flat, G: G, F: F };
	}
	function pairBody(c, side) {
		var P = c.paper, I = c.ink, Ig = c.grey || I, dark = lum(P) < lum(I); 
		var mix = function (a, b, pct) { return 'color-mix(in oklab, ' + a + ', ' + b + ' ' + pct + '%)'; };
		var k = pairLooks(c, side), flat = k.flat, G = k.G, F = k.F;
		return '' +
			'color-scheme:' + (dark ? 'dark' : 'light') + ';' +
			'--surface-base:' + P + ';--text-primary:' + I + ';' +
			'--surface-canvas:' + (G || (flat ? P : sink(P, 0.05))) + ';' +
			'--surface-plane:' + (G || (flat ? P : sink(P, 0.025))) + ';' +
			'--surface-navigation:' + (G || sink(P, dark ? 0.08 : 0.035)) + ';' +
			'--surface-subtle:' + (F || field(P, 0.045, 0.20)) + ';' +
			(F ? '--surface-floating:' + F + ';--ldp-lift:' + F + ';' : '') + 
			'--surface-raised:' + (dark ? shade(P, rise(P, 0.03, 0.24)) : P) + ';' +
			'--surface-hover:' + (F || 'color-mix(in srgb, ' + P + ', ' + Ig + ' var(--step-surface-hover, 6%))') + ';' +
			'--surface-selected:color-mix(in srgb, ' + P + ', ' + Ig + ' var(--step-surface-selected, 10%));' +
			'--surface-pressed:color-mix(in srgb, ' + P + ', ' + Ig + ' var(--step-surface-pressed, 16%));' +
			'--surface-track:color-mix(in srgb, ' + P + ', ' + Ig + ' var(--step-surface-hover, 6%));' +
			'--surface-track-selected:color-mix(in srgb, ' + P + ', ' + Ig + ' var(--step-track-selected, 12%));' +
			'--text-secondary:' + mix(Ig, P, 15) + ';--text-muted:' + mix(Ig, P, 25) + ';--text-subtle:' + mix(Ig, P, 61) + ';--text-disabled:' + mix(Ig, P, 72) + ';' +
			'--border-subtle:' + mix(P, Ig, 7) + ';--border-default:' + mix(P, Ig, 14) + ';--border-strong:' + mix(P, Ig, 29) + ';--border-control:' + mix(P, Ig, 52) + ';' +
			'--code-surface:' + (F && dark ? F : field(P, dark ? 0.06 : 0.04, 0.12)) + ';' +  '--code-plain:' + I + ';' +
			'--surface-inverse:' + I + ';--surface-inverse-subtle:' + mix(I, P, 10) + ';--text-inverse:' + P + ';--text-inverse-subtle:' + mix(P, I, 35) + ';--border-inverse:' + mix(I, P, 30) + ';' +
			'--ink-alpha-weak:rgb(from ' + I + ' r g b / 0.06);--ink-alpha-soft:rgb(from ' + I + ' r g b / 0.12);--ink-alpha-medium:rgb(from ' + I + ' r g b / 0.24);--ink-alpha-strong:rgb(from ' + I + ' r g b / 0.48);' +
			'--mode-swatch:' + P + ';' +
			'--toggle-knob-ink:' + (dark ? I : 'var(--surface-raised)') + ';';
	}
	var LIFT_CARDS = ' :is(.support-box, .about-numbers, .release-panel, .release-archive-card, :is(.post-card.format-quote, .single-format-quote .single-post-article .wp-block-post-content) blockquote.wp-block-quote)';
	function pairCss(side, c) {
		var P = c.paper, I = c.ink, dark = lum(P) < lum(I);
		var mix = function (a, b, pct) { return 'color-mix(in oklab, ' + a + ', ' + b + ' ' + pct + '%)'; };
		var k = pairLooks(c, side), G = k.G, F = k.F;
		var css = sideRule(side, '', '', pairBody(c, side)) +
			sideRule(side, '', ' .quire-segmented:not(:where(.reading-panel, .reading-panel *))', dark
				? '--groove-page:color-mix(in srgb, var(--interaction-surface, var(--surface-canvas)), var(--text-primary) var(--step-surface-hover, 10%));--chip-page:color-mix(in srgb, var(--interaction-surface, var(--surface-canvas)), var(--text-primary) var(--step-surface-pressed, 24%));'
				: '--groove-page:color-mix(in srgb, var(--interaction-surface, var(--surface-canvas)), var(--text-primary) var(--switch-groove, 10%));--chip-page:var(--surface-raised);');
		if (c.accent) css += accentCss(side, c.accent, P, I);
		
		if (F) css += sideRule(side, ':not([data-fills="off"])', ' :is(.quire-button:not(.primary, .ghost, .comments-pill), .comments-open-btn, .paper-stack-btn, .post-link-card, .quire-badge:not(.comments-count), .quire-search-field):not(:hover, :active, [aria-expanded="true"], [aria-pressed="true"]):not(:where(.reading-panel, .reading-panel *, .architrave-panel-opener))', 'background-color:' + F + ';');
		if (F) css += sideRule(side, ':not([data-fills="off"])', ' :is(.rail-collapse-btn, .rail-collapse-corner .quire-icon-button, .rail-expand .quire-icon-button, .rail-expand-search .quire-icon-button):not(:hover, :active):not(:where(.reading-panel, .reading-panel *, .architrave-panel-opener))', 'background-color:' + F + ';');
		var NOT_PANEL = ':not(:where(.reading-panel, .reading-panel *, .architrave-panel-opener))';
		var rung = function (step) { return 'background-color:color-mix(in srgb, ' + F + ', ' + I + ' var(' + step + '));'; };
		if (F) {
			var LIFTED = ' :is(.quire-button:not(.primary, .ghost, .comments-pill), .comments-open-btn, .paper-stack-btn, .post-link-card, .quire-badge:not(.comments-count), .quire-search-field, .rail-collapse-btn, .rail-collapse-corner .quire-icon-button, .rail-expand .quire-icon-button, .rail-expand-search .quire-icon-button)';
			css += sideRule(side, ':not([data-fills="off"])', LIFTED + ':hover' + NOT_PANEL, rung('--step-surface-hover'));
			css += sideRule(side, ':not([data-fills="off"])', LIFTED + ':is([aria-expanded="true"], [aria-pressed="true"]):not(.rail-collapse-btn, .quire-icon-button)' + NOT_PANEL, rung('--step-surface-selected'));
			css += sideRule(side, ':not([data-fills="off"])', LIFTED + ':active' + NOT_PANEL, rung('--step-surface-pressed'));
		}
		if (F) css += sideRule(side, ':not([data-fills="off"])', LIFT_CARDS + ':not(:where(.reading-panel, .reading-panel *, .architrave-panel-opener))', 'background-color:' + F + ';');
		if (F) {
			var ON_CARD = ' :is(' + LIFT_CARDS + ', .single-post-article .wp-block-post-content .code-block, .quire-menu, .rail-more-menu, .rail-more-sub, .paper-stack-menu) :is(.quire-button:not(.primary, .ghost, .comments-pill), .quire-badge:not(.comments-count), .quire-search-field)' + NOT_PANEL;
			css += sideRule(side, ':not([data-fills="off"])', ON_CARD, rung('--step-surface-hover'));
			css += sideRule(side, ':not([data-fills="off"])', ON_CARD.replace(')' + NOT_PANEL, '):hover' + NOT_PANEL), rung('--step-surface-selected'));
			css += sideRule(side, ':not([data-fills="off"])', ON_CARD.replace(')' + NOT_PANEL, '):active' + NOT_PANEL), rung('--step-surface-pressed'));
		}
		if (F) css += sideRule(side, ':not([data-fills="off"])', ' .single-post-article .wp-block-post-content .code-block', '--interaction-surface:' + F + ';');
		if (F) css += sideRule(side, '', ' :is(.quire-menu, .rail-more-menu, .rail-more-sub, .paper-stack-menu, .quire-tooltip-bubble):not(:where(.reading-panel, .reading-panel *, .architrave-panel-opener))', 'background-color:' + F + ';--interaction-surface:' + F + ';');
		if (G) css += sideRule(side, '', ' .sidebar-column', '--text-subtle:' + mix(I, G, 45) + ';--text-muted:' + mix(I, G, 25) + ';');
		return css;
	}
	function accentCss(side, A, P, I) {
		return sideRule(side, ':not([data-accent="off"])', '', accentBody(A, P, I));
	}
	function accentBody(A, P, I) {
		var onPaper = P ? contrast(A, P) : 0, onInk = I ? contrast(A, I) : 0;
		var contrastInk = (P && I) ? (onPaper >= onInk ? P : I) : (lum(A) > 0.35 ? '#111111' : '#ffffff');
		return '--accent:' + A + ';--accent-contrast:' + contrastInk + ';--accent-muted:color-mix(in oklab, ' + A + ', ' + (P || 'var(--surface-base)') + ' 78%);--focus:color-mix(in srgb, ' + A + ' 40%, transparent);';
	}
	function markerBody(M) {
		var light = lum(M) > 0.35;
		return '--marker:' + M + ';--marker-ink:' + (light ? '#1c1c18' : '#f7f7f5') + ';--marker-line-own:' + (light ? 'color-mix(in oklab, ' + M + ', #000000 32%)' : M) + ';';
	}
	function buttonBody(B, P, I) {
		var onPaper = P ? contrast(B, P) : 0, onInk = I ? contrast(B, I) : 0;
		var writing = (P && I) ? (onPaper >= onInk ? P : I) : (lum(B) > 0.35 ? '#111111' : '#ffffff');
		return '--button-colour:' + B + ';--button-contrast:' + writing + ';';
	}
	function letGoPreset(entry) { var s = byId(current); if (s && s.preset) entry.preset = ''; else delete entry.preset; }
	var COLOURS_STYLE = 'architrave-own-colours';
	function mixHex(a, b, w) {
		var x = hexToOklch(a), y = hexToOklch(b), lab = function (o) { return [o.L, o.C * Math.cos(o.h), o.C * Math.sin(o.h)]; };
		var p = lab(x), q = lab(y), m = [0, 1, 2].map(function (i) { return p[i] + (q[i] - p[i]) * w; });
		return oklchToHex({ L: m[0], C: Math.sqrt(m[1] * m[1] + m[2] * m[2]), h: Math.atan2(m[2], m[1]) });
	}
	function greyTinted(v) {
		var t = +pickOf('greytint') || 0, hex = /^#[0-9a-f]{6}$/i, by = effectOf('tint').colour; 
		var tc = by === 'second' ? v.second || v.accent : by === 'light' ? v.light || v.accent : v.accent;
		if (!t || !hex.test(v.paper || '') || !hex.test(v.ink || '') || !hex.test(tc || '')) return v;
		var o = {}; Object.keys(v).forEach(function (k) { o[k] = v[k]; });
		o.paper = mixHex(v.paper, tc, t * 0.35 / 100);
		o.grey = mixHex(v.ink, tc, t / 100);
		return o;
	}
	function applyColours() {
		var c = coloursResolved(), css = '';
		['light', 'dark'].forEach(function (side) {
			var v = greyTinted(c[side]);
			if (v.paper && v.ink) css += pairCss(side, v);
			else if (v.accent) css += accentCss(side, v.accent, null, null); 
			if (v.button) css += sideRule(side, '', '', buttonBody(v.button, v.paper || null, v.ink || null));
			if (v.button && v.paper && v.ink) {
				var LF = pairLooks(v, side).F;
				if (LF && contrast(v.button, LF) < 1.3) css += sideRule(side, ':not([data-fills="off"])', LIFT_CARDS, buttonBody(contrast(v.paper, LF) >= 1.3 ? v.paper : v.ink, v.paper, v.ink));
			}
			if (v.head) css += sideRule(side, '', '', '--head-own-colour:' + v.head + ';');
			if (v.light) css += sideRule(side, '', '', '--fx-light-own:' + v.light + ';');
			if (v.second) css += sideRule(side, '', '', '--fx-second-own:' + v.second + ';');
			if (v.marker) css += sideRule(side, '[data-marker-colour="own"]', '', markerBody(v.marker));
			if (v.kicker) css += sideRule(side, '', '', '--kicker-own-colour:' + v.kicker + ';');
		});
		if (c.light.paper && c.light.ink && c.dark.paper && c.dark.ink) {
			var on = 'html:root[data-colours="on"]';
			css += on + ' .ground-dark{' + pairBody(c.dark, 'dark') + (c.dark.accent ? accentBody(c.dark.accent, c.dark.paper, c.dark.ink) : '') + '}' +
				on + ' .ground-light{' + pairBody(c.light, 'light') + (c.light.accent ? accentBody(c.light.accent, c.light.paper, c.light.ink) : '') + '}';
		}
		if (c.light.inverse) {
			var GP = c.light.inverse, GI = [c.dark.ink, c.light.paper, '#ffffff', '#111111'].filter(Boolean).reduce(function (best, x) { return contrast(x, GP) > contrast(best, GP) + 0.5 ? x : best; });
			var GA = accentForPaper(c.dark.accent || c.light.accent || GI, GP);
			css += 'html:root[data-darkground="on"] .ground-dark{' + pairBody({ paper: GP, ink: GI, ground: GP }, lum(GP) < lum(GI) ? 'dark' : 'light') + accentBody(GA, GP, GI) + '}';
		}
		if (c.dark.accent) css += 'html:root[data-colours="on"]:not([data-accent="off"]) .theme-neutral-dark:not(:where(.reading-panel, .reading-panel *, .architrave-panel-opener)){' + accentBody(c.dark.accent, null, null) + '}';
		var el = document.getElementById(COLOURS_STYLE);
		if (!el && css) { el = document.createElement('style'); el.id = COLOURS_STYLE; (document.head || root).appendChild(el); }
		if (el && el.textContent !== css) el.textContent = css;
		if (typeof markerLine === 'function' && document.readyState !== 'loading') markerLine(); 
		if (css) { if (root.getAttribute('data-colours') !== 'on') root.setAttribute('data-colours', 'on'); }
		else root.removeAttribute('data-colours');
		var tw = (readTweaks()[current] || {}).colours || {};
		var ownAccent = window.architravePanelGuest && ((tw.light && tw.light.accent) || (tw.dark && tw.dark.accent));
		if (ownAccent) root.setAttribute('data-accent-own', ''); else root.removeAttribute('data-accent-own');
	}
	
	var markerProbe = null;
	function markerLine() {
		var on = false;
		if (root.getAttribute('data-marker') === 'on' && !/-dark$/.test(root.getAttribute('data-theme') || '')) {
			try {
				if (!markerProbe) { markerProbe = document.createElement('canvas'); markerProbe.width = markerProbe.height = 1; }
				var i = document.createElement('i');
				i.style.cssText = 'position:absolute;visibility:hidden;color:var(--surface-base)';
				root.appendChild(i);
				var c = getComputedStyle(i).color;
				root.removeChild(i);
				var x = markerProbe.getContext('2d');
				x.clearRect(0, 0, 1, 1); x.fillStyle = '#ffffff'; x.fillStyle = c; x.fillRect(0, 0, 1, 1);
				var d = x.getImageData(0, 0, 1, 1).data;
				on = lum('#' + [d[0], d[1], d[2]].map(function (n) { return ('0' + n.toString(16)).slice(-2); }).join('')) < 0.35;
			} catch (e) { on = false; }
		}
		if (on) root.setAttribute('data-marker-bright', ''); else root.removeAttribute('data-marker-bright');
		markerInk();
	}
	var markerInkProbe = null;
	function markerInk() {
		var body = document.body; if (!body) return;
		var pen = root.getAttribute('data-marker-colour');
		var clear = function () { body.style.removeProperty('--marker-ink'); body.style.removeProperty('--marker-wash'); };
		if (root.getAttribute('data-marker') !== 'on' || (pen !== 'text' && pen !== 'muted')) { clear(); return; }
		try {
			if (!markerInkProbe) { markerInkProbe = document.createElement('canvas'); markerInkProbe.width = markerInkProbe.height = 1; }
			var x = markerInkProbe.getContext('2d', { willReadFrequently: true });
			var read = function (colours) {
				x.clearRect(0, 0, 1, 1);
				colours.forEach(function (c) { x.fillStyle = '#ffffff'; x.fillStyle = c; x.fillRect(0, 0, 1, 1); });
				var d = x.getImageData(0, 0, 1, 1).data;
				return '#' + [d[0], d[1], d[2]].map(function (n) { return ('0' + n.toString(16)).slice(-2); }).join('');
			};
			var i = document.createElement('i');
			i.style.cssText = 'position:absolute;visibility:hidden';
			body.appendChild(i);
			i.style.color = 'var(--surface-base)'; var P = getComputedStyle(i).color;
			i.style.color = 'var(--text-primary)'; var I = getComputedStyle(i).color;
			i.style.color = 'var(--marker)'; var M = getComputedStyle(i).color;
			body.removeChild(i);
			var paper = read([P]), wash = read([P, M]), ink = read([P, I]);
			var mix = function (a, b, t) { var h = function (c, i) { return parseInt(c.substr(1 + i * 2, 2), 16); }; return '#' + [0, 1, 2].map(function (i) { return ('0' + Math.round(h(a, i) + (h(b, i) - h(a, i)) * t).toString(16)).slice(-2); }).join(''); };
			var fit = function (letters, toward) { for (var t = 0; t <= 1.0001; t += 0.02) { var w = mix(wash, toward, t); if (contrast(letters, w) >= 4.5) return { t: t, wash: w }; } return { t: 2, wash: wash }; };
			var onInk = fit(ink, paper), onPaper = fit(paper, ink), best = onPaper.t <= onInk.t ? 'paper' : 'ink';
			if (onInk.t === 2 && onPaper.t === 2) best = contrast(paper, wash) >= contrast(ink, wash) ? 'paper' : 'ink';
			body.style.setProperty('--marker-ink', best === 'paper' ? 'var(--surface-base)' : 'var(--text-primary)');
			var W = best === 'paper' ? onPaper : onInk;
			if (W.t > 0 && W.t <= 1) body.style.setProperty('--marker-wash', W.wash); else body.style.removeProperty('--marker-wash');
		} catch (e) { clear(); }
	}
	(function () {
		var go = function () {
			markerLine();
			new MutationObserver(markerLine).observe(root, { attributes: true, attributeFilter: ['data-theme', 'data-marker', 'data-style', 'data-colours', 'data-preset', 'data-marker-colour', 'data-soft', 'data-soft-level', 'data-quiet-level', 'data-small-soft', 'style'] }); 
		};
		if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
	})();
	var GROUND_WIDE = window.matchMedia ? window.matchMedia('(min-width: 1010px)') : null;
	var groundWorn = [];
	function applyGround() {
		var body = document.body;
		groundWorn.forEach(function (w) { w.el.classList.remove(w.cls, w.scope); });
		groundWorn = [];
		if (!body || root.getAttribute('data-darkground') !== 'on') return;
		var day = root.getAttribute('data-theme') || 'neutral-light';
		if (!/-light$/.test(day)) return;
		var M = window.QuireModes, night = M && M.resolve ? M.resolve(day, 'dark') : day.replace(/-light$/, '-dark');
		var wear = function (el, mode, scope) { if (!el) return; el.classList.add('theme-' + mode, scope); groundWorn.push({ el: el, cls: 'theme-' + mode, scope: scope }); };
		if (GUEST) { wear(document.querySelector('.wp-site-blocks > footer'), night, 'ground-dark'); return; }
		if (!body.classList.contains('has-frame') || (GROUND_WIDE && !GROUND_WIDE.matches)) return;
		wear(body, night, 'ground-dark');
		Array.prototype.forEach.call(document.querySelectorAll(ON_PAPER), function (el) { wear(el, day, 'ground-light'); });
	}
	var ON_PAPER = '.frame-paper, .paper-stack, .rail-collapse-corner, .rail-expand, .rail-expand-search, .comments-open';
	(function () {
		var go = function () {
			applyGround();
			new MutationObserver(applyGround).observe(root, { attributes: true, attributeFilter: ['data-theme', 'data-darkground'] });
			if (GROUND_WIDE) { if (GROUND_WIDE.addEventListener) GROUND_WIDE.addEventListener('change', applyGround); else GROUND_WIDE.addListener(applyGround); }
		};
		if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
	})();
	function paperOf(side) {
		var pal = String(root.getAttribute('data-theme') || (Modes ? Modes.default : 'neutral-light')).split('-')[0];
		var m = ((Modes && Modes.modes) || []).filter(function (x) { return x.palette === pal && x.side === side; })[0];
		return (m && m.swatch) || (side === 'dark' ? '#373737' : '#ffffff'); 
	}
	applyColours();
	function now() {
		var mode = root.getAttribute('data-theme') || (Modes ? Modes.default : 'neutral-light');
		return {
			palette: String(mode).split('-')[0],
			reading: root.getAttribute('data-reading') || 'default',
			face: root.getAttribute('data-face') || (window.architravePanelGuest ? 'host' : 'newsreader'),
			leading: root.getAttribute('data-leading') || 'default'
		};
	}
	function same(a, b) {
		return DIALS.every(function (d) { return a[d] === b[d]; });
	}
	function wanted(s) {
		var tw = readTweaks()[s.id];
		var out = {};
		DIALS.forEach(function (d) { out[d] = (tw && tw[d]) || s[d]; });
		return out;
	}
	function press(selector) {
		var row = document.querySelector(selector);
		if (row) row.click();
	}
	function slowly(change) {
		var quiet = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (quiet || !document.startViewTransition) { change(); return; }
		try {
			var t = document.startViewTransition(change);
			if (t && t.finished && t.finished.catch) t.finished.catch(function () {});
			if (t && t.updateCallbackDone && t.updateCallbackDone.catch) t.updateCallbackDone.catch(function () {});
			if (t && t.ready && t.ready.catch) t.ready.catch(function () {});
		} catch (e) { change(); }
	}
	var applying = false, applyTimer = null;
	function apply(s, dials) {
		if (s && s.host) { goHome(); return; } 
		slowly(function () { applyNow(s, dials); });
	}
	function applyNow(s, dials) {
		if (versionTimer && s && s.id !== current) versionNow();
		applying = true;
		stamp(s.id);
		press('[data-quire-modes="palette"] [data-palette="' + dials.palette + '"]');
		press('[data-reading-step="' + dials.reading + '"]');
		if (s.bare && dials.face === 'host') { root.removeAttribute('data-face'); try { localStorage.removeItem('architrave-face'); } catch (e) {  } }
		else press('[data-face-choice="' + dials.face + '"]');
		press('[data-leading-step="' + dials.leading + '"]');
		if (String(root.getAttribute('data-theme') || (Modes ? Modes.default : '')).split('-')[0] === dials.palette) applying = false;
		else { if (applyTimer) clearTimeout(applyTimer); applyTimer = setTimeout(function () { applying = false; remember(); }, 1500); }
		applyOptions();
		applyTint();
		applyColours();
		applySans();
		applyTracking();
		applyScope();
		applyPictures();
		applyCapLines();
		applyLevels();
		applyLineStyle();
		applyFadeEdges();
		applyMarkerColour();
		applyButton();
		applyPicks();
		applyEffects();
		applyFramePattern();
		applyCorners();
		mark();
	}
	
	function remember() {
		var s = byId(current), all = readTweaks(), dials = now();
		if (!s || s.host) return; 
		var entry = {}, held = all[s.id] || {};
		TWEAK_KEYS.forEach(function (k) { if (DIALS.indexOf(k) === -1 && held[k] !== undefined) entry[k] = held[k]; });
		if (!same(dials, s)) DIALS.forEach(function (d) { entry[d] = dials[d]; });
		if (Object.keys(entry).length) all[s.id] = entry; else delete all[s.id];
		if (JSON.stringify(all) !== JSON.stringify(readTweaks())) writeTweaks(all);
		applyOptions(); 
		mark();
	}
	var SHOWN = ['standard', 'instrument', 'catalogue', 'terracotta', 'specimen', 'tube', 'brochure'];       
	
	function mark() {
		var dials = now(), s = byId(current);
		var offStandard = current !== DEFAULT || !same(dials, STYLES[0]);
		document.querySelectorAll('[data-architrave-reset]').forEach(function (r) { r.hidden = !offStandard; });
		document.querySelectorAll('[data-preset]').forEach(function (b) {
			var p = byId(b.getAttribute('data-preset'));
			var on = !!p && p.id === current;
			var label = b.querySelector('.quire-menu-label');
			if (label) label.textContent = t(p.label) + (on && s && !same(dials, s) ? ' · ' + t('adjusted') : '');
			b.classList.toggle('is-selected', on);
			b.setAttribute('aria-checked', on ? 'true' : 'false');
		});
	}
	
	var VERSIONS_KEY = 'architrave-versions', VERSIONS_KEEP = 20, versionTimer = 0, versionFor = '', previewing = null;
	function readVersions() { try { var v = JSON.parse(localStorage.getItem(VERSIONS_KEY) || '{}'); return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; } catch (e) { return {}; } }
	function versionSoon() { if (previewing || READER) return;  clearTimeout(versionTimer); versionFor = current; versionTimer = setTimeout(function () { versionTimer = 0; if (versionFor === current) keepVersion(); }, 60000); }
	function versionNow() { if (!versionTimer) return; clearTimeout(versionTimer); versionTimer = 0; if (versionFor === current) keepVersion(); }
	function lookOf(rec) { var o = {}; Object.keys(rec || {}).forEach(function (k) { if (k !== 'architrave' && k !== 'label' && k !== 'base' && k !== 'id') o[k] = rec[k]; }); return o; }
	function savedRecord() {
		var raw = null; try { raw = localStorage.getItem(TWEAKS_KEY); } catch (e) { return null; }
		var all = readTweaks(); if (!all[current]) return lookOf(JSON.parse(window.ArchitraveStyles.exportStyle() || '{}'));
		delete all[current];
		try { localStorage.setItem(TWEAKS_KEY, JSON.stringify(all)); } catch (e) {  }
		var out = lookOf(JSON.parse(window.ArchitraveStyles.exportStyle() || '{}'));
		try { if (raw === null) localStorage.removeItem(TWEAKS_KEY); else localStorage.setItem(TWEAKS_KEY, raw); } catch (e) {  }
		return out;
	}
	function keepVersion() {
		var s = byId(current); if (!s || s.host || previewing || READER) return false;
		var all = readVersions(), list = Array.isArray(all[s.id]) ? all[s.id] : [], rec = lookOf(JSON.parse(window.ArchitraveStyles.exportStyle() || '{}'));
		if (list[0] && JSON.stringify(list[0].record) === JSON.stringify(rec)) return false;
		if (!list.length && JSON.stringify(savedRecord()) === JSON.stringify(rec)) return false; 
		list.unshift({ t: Date.now(), record: rec }); if (list.length > VERSIONS_KEEP) list.length = VERSIONS_KEEP;
		all[s.id] = list;
		try { localStorage.setItem(VERSIONS_KEY, JSON.stringify(all)); } catch (e) {  }
		return true;
	}
	function entryFromRecord(rec) {
		var base = savedRecord() || {}, e = {}, J = JSON.stringify;
		if (DIALS.some(function (d) { return rec[d] !== undefined && rec[d] !== base[d]; })) DIALS.forEach(function (d) { e[d] = rec[d] !== undefined ? rec[d] : base[d]; });
		TWEAK_KEYS.forEach(function (k) { if (DIALS.indexOf(k) !== -1 || k === 'roles' || k === 'colours' || k === 'effects' || k === 'was') return; if (rec[k] !== undefined && J(rec[k]) !== J(base[k])) e[k] = rec[k]; });
		var roles = {};
		ROLES.forEach(function (role) {
			var a = (rec.roles || {})[role] || {}, b = (base.roles || {})[role] || {}, r = {};
			Object.keys(ROLE_DEFAULT[role]).forEach(function (d) {
				var want = a[d] !== undefined ? a[d] : ROLE_DEFAULT[role][d], was = b[d] !== undefined ? b[d] : ROLE_DEFAULT[role][d];
				if (J(want) !== J(was)) r[d] = want;
			});
			if (Object.keys(r).length) roles[role] = r;
		});
		if (Object.keys(roles).length) e.roles = roles;
		var fxs = {};
		Object.keys(EFFECTS).forEach(function (fid) {
			var a = (rec.effects || {})[fid] || {}, b = (base.effects || {})[fid] || {}, r = {};
			Object.keys(EFFECTS[fid]).forEach(function (d) { var rest = EFFECTS[fid][d].rest, want = a[d] !== undefined ? a[d] : rest, was = b[d] !== undefined ? b[d] : rest; if (want !== was) r[d] = want; });
			if (Object.keys(r).length) fxs[fid] = r;
		});
		if (Object.keys(fxs).length) e.effects = fxs;
		var colours = {};
		['light', 'dark'].forEach(function (side) {
			var a = (rec.colours || {})[side] || {}, b = (base.colours || {})[side] || {}, c = {};
			Object.keys(a).concat(Object.keys(b)).forEach(function (k) { var want = a[k] !== undefined ? a[k] : ''; if (String(want).toLowerCase() !== String(b[k] || '').toLowerCase()) c[k] = want; });
			if (Object.keys(c).length) colours[side] = c;
		});
		if (Object.keys(colours).length) e.colours = colours;
		return e;
	}
	function writeQuiet(all) { var was = undoing; undoing = true; writeTweaks(all); undoing = was; }
	function endPreview() {
		if (!previewing) return false;
		var p = previewing; previewing = null;
		try { if (p.raw === null) localStorage.removeItem(TWEAKS_KEY); else localStorage.setItem(TWEAKS_KEY, p.raw); } catch (e) {  }
		var s = byId(p.id); if (s) applyNow(s, wanted(s));
		return true;
	}
	window.addEventListener('pagehide', function () { endPreview(); versionNow(); });
	
	var SENT = 0;
	function sendSite(body) {
		if (!PUBLISH || !PUBLISH.url || !window.fetch) return Promise.reject(new Error('cannot publish'));
		var mine = ++SENT;
		return fetch(PUBLISH.url, {
			method: 'POST', credentials: 'same-origin',
			headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': PUBLISH.nonce },
			body: JSON.stringify(body)
		}).then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error((j && j.message) || r.status); return j; }); })
		.then(function (state) { if (mine === SENT) { takeSite(state); renderHosts(); } return state; });
	}
	window.ArchitraveStyles = {
		list: STYLES,
		shown: function () {
			var all = STYLES.filter(offered);
			if (READER) {
				var picks = readerPicks();
				return all.filter(function (s) { return s.host || s.id === DEFAULT; })
					.concat(picks.map(function (id) { return all.filter(function (s) { return s.id === id && !s.host && s.id !== DEFAULT; })[0]; }).filter(Boolean));
			}
			var seen = this.visibleOrder(), rest = all.filter(function (s) { return seen.indexOf(s.id) === -1; });
			rest = rest.filter(function (s) { return !s.own && !s.site; })
				.concat(rest.filter(function (s) { return s.site; }))
				.concat(rest.filter(function (s) { return s.own; }).reverse());
			var mine = hiddenOrder();
			if (mine.length) rest = rest.filter(function (s) { return mine.indexOf(s.id) === -1; })
				.concat(mine.map(function (id) { return rest.filter(function (s) { return s.id === id; })[0]; }).filter(Boolean));
			return seen.map(byId).filter(Boolean).concat(rest);
		},
		setHiddenOrder: function (ids) { try { localStorage.setItem(HIDDEN_KEY, JSON.stringify(ids || [])); } catch (e) {  } },
		isOwn: function (id) { var s = byId(id); return !!(s && s.own); },
		hostSide: function () { var h = byId('host'); return h && h.hostSide ? h.hostSide : ''; },
		isSite: function (id) { var s = byId(id); return !!(s && s.site); },
		
		guide: function () {
			var meaning = {};
			Object.keys(LIST.meaning).forEach(function (k) { meaning[k] = LIST.meaning[k]; });
			var recipes = {};
			STYLES.filter(function (x) { return !x.own && !x.site && SHOWN.indexOf(x.id) !== -1; }).forEach(function (x) {
				var rec = { architrave: 1, label: x.label, base: x.id };
				Object.keys(x).forEach(function (k) { if (k !== 'id' && k !== 'label' && k !== 'bold' && k !== 'preset') rec[k] = x[k]; });
				var p = x.preset && presetById(x.preset);
				if (p) rec.colours = { light: { paper: p.light.paper, ink: p.light.ink, accent: p.light.accent }, dark: { paper: p.dark.paper, ink: p.dark.ink, accent: p.dark.accent } };
				recipes[x.id] = rec;
			});
			return {
				meaning: meaning,
				rules: [
					'Send only the keys you want to change from the base; a smaller record is a better record.',
					'A first visit opens on the dark side, so design the dark colours first and check both.',
					'Contrast: ink on paper at 4.5:1 or better, accent on paper at 3:1 or better, on both sides.',
					'A strength key (line, scan, fill, glowlevel, grainlevel, vignettelevel, vignettereach, softlevel, quietlevel, framewidth, dotsize, dotlevel) does nothing unless its switch is true.',
					'Pick fonts from the listed ids only; the theme ships no others.',
					'To try a record without publishing it, open the site at /#style= followed by the base64url of the record JSON.'
				],
				examples: recipes,
				colourPresets: PRESETS.map(function (p) { return { id: p.id, label: p.label, light: p.light, dark: p.dark }; })
			};
		},
		schema: function () {
			var faces = (window.ArchitraveFaces || []).map(function (f) { return f.id; });
			var role = function (r) {
				return {
					face: (r === 'read' || r === 'ui' ? [] : ['read', 'ui']).concat(Object.keys(FAMILY)), 
					weight: Object.keys(WEIGHT),
					size: sizesFor(r),
					tracking: Object.keys(TRACK),
					words: Object.keys(WORDS),
					caps: 'boolean',
					italic: 'boolean',
					leading: r === 'read' ? undefined : Object.keys(LEAD),
					align: ROLE_DEFAULT[r].align !== undefined ? ALIGNS : undefined,
					colour: ROLE_DEFAULT[r].colour !== undefined ? ROLE_COLOURS : undefined
				};
			};
			var roles = {}; ROLES.forEach(function (r) { roles[r] = role(r); });
			Object.keys(MEMBERS).forEach(function (r) {
				var mem = {};
				MEMBERS[r].forEach(function (m) { if (!m.lead) { mem[m.id] = { size: sizesFor(r), weight: Object.keys(WEIGHT), caps: 'boolean', tracking: Object.keys(TRACK), rest: m.rest }; if (memberDialsOf(r).indexOf('align') !== -1) mem[m.id].align = ALIGNS; } });
				roles[r].members = mem;
			});
			var side = {}; LIST.wells.forEach(function (w) { side[w] = 'hex'; });
			var from = {
				architrave: 1,
				label: 'string, at most ' + LIST.labelMax + ' characters',
				base: STYLES.filter(function (x) { return !x.own && !x.site; }).map(function (x) { return x.id; }),
				palette: Modes && Modes.palettes ? Modes.palettes.map(function (p) { return p.id; }) : [],
				reading: window.QuireReading ? window.QuireReading.ids : [],
				face: faces,
				leading: Object.keys(LEAD),
				sans: SANS.map(function (x) { return x.id; }),
				unlinked: 'boolean',
				roles: roles,
				effects: (function () { var o = {}; Object.keys(EFFECTS).forEach(function (fid) { o[fid] = {}; Object.keys(EFFECTS[fid]).forEach(function (d) { o[fid][d] = EFFECTS[fid][d].list; }); }); return o; })(),
				colours: { light: side, dark: side }
			};
			var out = {};
			LIST.schema.forEach(function (k) {
				out[k] = k in from ? from[k] : OPTS.indexOf(k) !== -1 ? 'boolean' : LEVELS[k] ? LEVELS[k].stops : PICKS[k] ? PICKS[k].list : LIST.choices[k];
			});
			return out;
		},
		siteDefault: function () { return DEFAULT === NONE ? '' : DEFAULT; },
		canPublish: function () { return !!(PUBLISH && PUBLISH.url && window.fetch); },
		publish: function (name, makeDefault) {
			var s = byId(current); if (!s) return Promise.reject(new Error('no style'));
			var record = JSON.parse(this.exportStyle());
			return sendSite({ action: 'publish', record: record, name: String(name || '').trim().slice(0, 40), 'default': !!makeDefault }).then(function (state) {
				var all = readTweaks(); delete all[s.id]; writeTweaks(all);
				var landed = state.styles[state.styles.length - 1];
				var e = landed && byId(landed.id); if (e) apply(e, e);
				return e ? e.id : null;
			});
		},
		
		seenByReaders: function (id) {
			var s = byId(id); if (!s) return false;
			return !!(s.host || id === DEFAULT || readerPicks().indexOf(id) !== -1);
		},
		makeDefault: function (id) {
			if (!byId(id)) return Promise.reject(new Error('no style'));
			return this.setVisible([id].concat(this.visibleOrder().filter(function (x) { return x !== id; }))); 
		},
		
		unpublishKeep: function (id) {
			var s = byId(id); if (!s || !s.site) return Promise.reject(new Error('not a site style'));
			var rec = JSON.parse(JSON.stringify(s)); delete rec.site; rec.architrave = 1;
			var wasCurrent = current === id, carried = readTweaks()[id]; 
			return sendSite({ action: 'remove', id: id }).then(function () {
				var entry = ownFromRecord(rec, s.label);
				if (carried) { var all = readTweaks(); all[entry.id] = carried; writeTweaks(all); }
				renderHosts();
				if (wasCurrent || !byId(current)) apply(entry, entry); else mark();
				return entry.id;
			});
		},
		setSeen: function (id, on) {
			if (!byId(id)) return Promise.reject(new Error('no style'));
			if (!on && byId(id).site) { var self = this; return this.unpublishKeep(id).then(function () { return self.setVisible(self.visibleOrder()); }); }
			var order = this.visibleOrder().filter(function (x) { return x !== id; });
			return this.setVisible(on ? order.concat([id]) : order);
		},
		rename: function (id, name) {
			var s = byId(id); name = String(name || '').trim().slice(0, 40);
			if (!s || !name) return Promise.reject(new Error('nothing to rename'));
			if (s.own) { s.label = name; writeOwn(); renderHosts(); return Promise.resolve(true); }
			if (!s.site) return Promise.reject(new Error('a built-in style keeps its name'));
			var record = JSON.parse(JSON.stringify(s)); delete record.site; record.label = name;
			return sendSite({ action: 'update', id: id, record: record }).then(function () { return true; });
		},
		publishOwn: function (id, makeDefault) {
			var s = byId(id); if (!s || !s.own) return Promise.reject(new Error('not your style'));
			if (current !== id) applyNow(s, wanted(s));
			return this.publish(s.label, makeDefault).then(function (newId) {
				if (newId) {
					if (PENDING) { var k = PENDING.indexOf(id); if (k !== -1) PENDING[k] = newId; } 
					var o = byId(id), all = readTweaks();
					if (all[id]) { delete all[id]; writeTweaks(all); }
					if (o) { STYLES.splice(STYLES.indexOf(o), 1); writeOwn(); renderHosts(); }
				}
				return newId;
			});
		},
		updateSite: function () {
			var s = byId(current); if (!s || !s.site) return Promise.reject(new Error('not a site style'));
			var record = JSON.parse(this.exportStyle()); record.label = s.label;
			return sendSite({ action: 'update', id: s.id, record: record }).then(function () {
				var all = readTweaks(); delete all[s.id]; writeTweaks(all);
				var e = byId(s.id); if (e) apply(e, e);
				return true;
			});
		},
		unpublish: function (id) {
			var s = byId(id); if (!s || !s.site) return Promise.reject(new Error('not a site style'));
			return sendSite({ action: 'remove', id: id }).then(function () {
				var all = readTweaks(); delete all[id]; writeTweaks(all);
				if (!byId(current)) apply(STYLES[0], wanted(STYLES[0])); else mark();
				return true;
			});
		},
		reader: function () { return READER; },
		readers: function () { return readerPicks().filter(function (id) { return id !== DEFAULT && !!byId(id); }); }, 
		readerFirst: function () { return DEFAULT; },
		readersCopy: function () { return !!(SITE && SITE.readersCopy); },
		setReadersCopy: function (on) {
			var was = SITE.readersCopy; SITE.readersCopy = !!on; 
			return sendSite({ action: 'readers-copy', on: !!on }).then(function () { return true; }, function (e) { SITE.readersCopy = was; throw e; });
		},
		button: function () { return SITE && SITE.button ? SITE.button : null; },
		setButton: function (key, value) {
			if (!SITE || !SITE.button) return Promise.reject(new Error('no button'));
			var was = SITE.button, next = {};
			Object.keys(was).forEach(function (k) { next[k] = was[k]; });
			next[key] = value;
			if (key === 'place' && value !== 'auto') next.fixed = value; 
			SITE.button = next;
			window.dispatchEvent(new CustomEvent('architrave-button-settings', { detail: { settings: next, picked: key } }));
			return sendSite({ action: 'button', settings: next }).then(function () { return true; }, function (e) {
				SITE.button = was;
				window.dispatchEvent(new CustomEvent('architrave-button-settings', { detail: { settings: was } }));
				throw e;
			});
		},
		visibleOrder: function () {
			if (PENDING) return PENDING.filter(function (id) { return !!byId(id); });
			var first = [DEFAULT].concat(STYLES.filter(function (x) { return x.host && x.id !== DEFAULT; }).map(function (x) { return x.id; }));
			return first.concat(readerPicks().filter(function (id) { return first.indexOf(id) === -1 && !!byId(id); }));
		},
		setVisible: function (ids) {
			var self = this;
			ids = (ids || []).filter(function (id, i, a) { return !!byId(id) && a.indexOf(id) === i; });
			if (!ids.length) return Promise.reject(new Error('someone has to be first'));
			var owns = ids.filter(function (id) { return byId(id).own; });
			PENDING = ids;
			var chain = owns.reduce(function (p, id) {
				return p.then(function () { return self.publishOwn(id, false).then(function (nid) { var k = ids.indexOf(id); if (nid && k !== -1) ids[k] = nid; }); });
			}, Promise.resolve());
			return chain.then(function () {
				var picks = ids.slice(1).filter(function (id) { return !byId(id).host; }); 
				var def = ids[0] === NONE ? '' : ids[0];
				var wasDefault = SITE['default'] || '', wasReaders = SITE.readers;
				if (def !== null) SITE['default'] = def;
				SITE.readers = picks.slice();
				PENDING = null; takeSite(SITE); renderHosts(); 
				return sendSite({ action: 'readers', ids: picks })
					.then(function () { return def !== null && def !== wasDefault ? sendSite({ action: 'default', id: def }) : null; })
					.then(function () { mark(); return true; }, function (e) { SITE['default'] = wasDefault; SITE.readers = wasReaders; takeSite(SITE); renderHosts(); throw e; });
			}, function (e) { PENDING = null; renderHosts(); throw e; });
		},
		setReaders: function (ids) {
			var was = SITE.readers; SITE.readers = (ids || []).slice();
			return sendSite({ action: 'readers', ids: (ids || []) }).then(function () { return true; }, function (e) { SITE.readers = was; throw e; });
		},
		setSiteDefault: function (id) {
			return sendSite({ action: 'default', id: id || '' }).then(function () { mark(); return true; });
		},
		colours: coloursResolved, 
		presets: function () { return PRESETS.map(function (p) { return { id: p.id, label: p.label, light: { paper: p.light.paper, ink: p.light.ink, accent: p.light.accent }, dark: { paper: p.dark.paper, ink: p.dark.ink, accent: p.dark.accent }, fresh: !!p.fresh, group: p.group || '' }; }); },
		swatchList: function (key) { return (LISTS[key] || []).map(function (x) { return { id: x.id, label: x.label, light: x.light, dark: x.dark }; }); },
		listColour: listColourOf,
		setListColour: function (key, id) {
			var x = (LISTS[key] || []).filter(function (c) { return c.id === id; })[0];
			if (!x) return;
			var all = readTweaks(), entry = all[current] || {};
			entry.colours = entry.colours || {};
			var cur = byId(current), one = cur && cur.host && cur.hostSide;
			['light', 'dark'].forEach(function (side) { entry.colours[side] = entry.colours[side] || {}; entry.colours[side][key] = x[one || side]; });
			if (['button', 'head', 'kicker', 'marker', 'inverse', 'light', 'second'].indexOf(key) === -1) letGoPreset(entry); 
			all[current] = entry;
			writeTweaks(all);
			if (key === 'accent' && !accentOn()) { try { localStorage.removeItem(ACCENT_KEY); } catch (e) {  } applyAccent(); }
			applyColours(); mark();
		},
		accentColour: accentColourOf,
		custom: function () {
			if (presetOf()) return false;
			var s0 = byId(current);
			if (s0 && s0.host) {
				var e0 = (readTweaks()[current] || {}).colours || {};
				return ['light', 'dark'].some(function (sd) { return Object.keys(e0[sd] || {}).some(function (k) { return ['button', 'head', 'kicker', 'marker', 'inverse', 'light', 'second'].indexOf(k) === -1 && !!e0[sd][k]; }); });
			}
			var c = coloursOf();
			return ['light', 'dark'].some(function (sd) { return Object.keys(c[sd] || {}).some(function (k) { return ['button', 'head', 'kicker', 'marker'].indexOf(k) === -1; }); }); 
		},
		setCustom: function (on, seed) {
			var s = byId(current), all = readTweaks(), entry = all[current] || {};
			if (on) {
				var c = coloursOf();
				if (entry.preset) { entry.was = entry.preset; delete entry.preset; }
				else if (s && s.preset && entry.preset === undefined) { entry.was = s.preset; entry.preset = ''; var preG = presetById(s.preset); ['light', 'dark'].forEach(function (sd) { if (preG && preG.ground && typeof preG.ground === 'object' && preG.ground[sd]) c[sd].ground = preG.ground[sd]; if (preG && preG.lift && preG.lift[sd]) c[sd].lift = preG.lift[sd]; });  entry.colours = { light: { paper: c.light.paper, ink: c.light.ink, accent: c.light.accent, ground: c.light.ground, lift: c.light.lift }, dark: { paper: c.dark.paper, ink: c.dark.ink, ground: c.dark.ground, lift: c.dark.lift, accent: c.dark.accent } }; }
				if (s && s.host) {
					['light', 'dark'].forEach(function (sd) {
						var have = c[sd] || {}, pick = {};
						['paper', 'ink', 'accent'].forEach(function (k) { var v = have[k] || (seed && seed[k]); if (/^#[0-9a-f]{6}$/i.test(v || '')) pick[k] = v.toLowerCase(); });
						if (Object.keys(pick).length) { entry.colours = entry.colours || {}; entry.colours[sd] = pick; }
					});
				} else if (!Object.keys(c.light).length && !Object.keys(c.dark).length && seed) {
					var side = (String(root.getAttribute('data-theme') || (Modes ? Modes.default : 'neutral-light')).split('-')[1]) === 'dark' ? 'dark' : 'light';
					entry.colours = entry.colours || {}; entry.colours[side] = entry.colours[side] || {};
					['paper', 'ink', 'accent'].forEach(function (k) { if (/^#[0-9a-f]{6}$/i.test(seed[k] || '')) entry.colours[side][k] = seed[k].toLowerCase(); });
				}
				all[current] = entry; writeTweaks(all); applyColours(); mark();
				return;
			}
			var back = entry.was || '';
			delete entry.was; delete entry.colours;
			if (s && s.preset && back === s.preset) { delete entry.preset; if (Object.keys(entry).length) all[current] = entry; else delete all[current]; writeTweaks(all); applyColours(); mark(); return; }
			['light', 'dark'].forEach(function (side) {
				var own = (s && (s.own || s.site) && s.colours && s.colours[side]) || null;
				if (!own) return;
				entry.colours = entry.colours || {}; entry.colours[side] = entry.colours[side] || {};
				['paper', 'ink', 'accent'].forEach(function (k) { if (own[k]) entry.colours[side][k] = ''; });
			});
			if (Object.keys(entry).length) all[current] = entry; else delete all[current];
			writeTweaks(all);
			if (back) { window.ArchitraveStyles.setPreset(back); return; }
			applyColours(); mark();
		},
		pairTint: function (id) { return PAIR_TINTS[id] || ''; },
		preset: presetOf,
		setPreset: function (id) {
			var p = presetById(id);
			var all = readTweaks(), entry = all[current] || {};
			if (!p) {
				if (entry.preset) delete entry.colours;
				var own = byId(current);
				if (own && own.preset) entry.preset = ''; else delete entry.preset;
				if (Object.keys(entry).length) all[current] = entry; else delete all[current];
				writeTweaks(all); applyColours(); mark(); return;
			}
			entry.colours = { light: { paper: p.light.paper, ink: p.light.ink, accent: p.light.accent }, dark: { paper: p.dark.paper, ink: p.dark.ink, accent: p.dark.accent } };
			entry.preset = p.id;
			delete entry.unlinked; 
			all[current] = entry;
			writeTweaks(all);
			if (!accentOn()) { try { localStorage.removeItem(ACCENT_KEY); } catch (e) {  } applyAccent(); }
			applyColours(); mark();
		},
		contrast: contrast,
		paperOf: paperOf,
		setColour: function (side, key, hex) {
			if (['light', 'dark'].indexOf(side) === -1 || ['paper', 'ink', 'accent', 'button', 'head', 'kicker', 'ground', 'lift', 'marker', 'inverse', 'light', 'second'].indexOf(key) === -1 || !/^#[0-9a-f]{6}$/i.test(hex || '')) return;
			var all = readTweaks(), entry = all[current] || {};
			entry.colours = entry.colours || {}; entry.colours[side] = entry.colours[side] || {};
			if (!unlinkedOf()) {
				var other = side === 'dark' ? 'light' : 'dark';
				if (entry.colours[other]) { delete entry.colours[other][key]; if (!Object.keys(entry.colours[other]).length) delete entry.colours[other]; }
			}
			entry.colours[side][key] = hex.toLowerCase();
			if (['button', 'head', 'kicker', 'marker', 'inverse', 'light', 'second'].indexOf(key) === -1) letGoPreset(entry); 
			all[current] = entry; writeTweaks(all);
			applyColours(); mark();
		},
		clearColour: function (side, key) {
			var all = readTweaks(), entry = all[current] || {}, s = byId(current);
			if (entry.colours && entry.colours[side]) { delete entry.colours[side][key]; if (!Object.keys(entry.colours[side]).length) delete entry.colours[side]; }
			if (entry.colours && !Object.keys(entry.colours).length) delete entry.colours;
			if (s && (s.own || s.site) && s.colours && s.colours[side] && s.colours[side][key]) { entry.colours = entry.colours || {}; entry.colours[side] = entry.colours[side] || {}; entry.colours[side][key] = ''; }
			if (Object.keys(entry).length) all[current] = entry; else delete all[current];
			writeTweaks(all);
			applyColours(); mark();
		},
		
		exportStyle: function () {
			var s = byId(current); if (!s) return '';
			var tw = readTweaks()[current] || {}, w = wanted(s), out = { architrave: 1, label: s.label, base: baseOf(s) };
			DIALS.forEach(function (d) { out[d] = w[d]; });
			OPTS.forEach(function (k) { out[k] = optionOn(k); });
			var loose = followers();
			out.tint = tintOf(); out.sans = sansOf(); out.scope = scopeOf(); out.pictures = picturesOf(); out.capLines = capLinesOf(); out.button = buttonOf(); Object.keys(PICKS).forEach(function (k) { out[k] = pickOf(k); }); out.scan = levelOf('scan'); out.line = levelOf('line'); out.fill = levelOf('fill'); out.glowlevel = levelOf('glowlevel'); out.grainlevel = levelOf('grainlevel'); out.vignettelevel = levelOf('vignettelevel'); out.vignettereach = levelOf('vignettereach'); out.softlevel = levelOf('softlevel'); out.quietlevel = levelOf('quietlevel'); out.smallsoft = levelOf('smallsoft'); out.linestyle = lineStyleOf(); out.corners = cornersOf(); out.fadeedges = fadeEdgesOf(); out.markercolour = markerColourOf(); out.framepattern = framePatternOf(); out.measure = levelOf('measure'); out.space = levelOf('space'); out.framewidth = levelOf('framewidth'); out.dotsize = levelOf('dotsize'); out.dotlevel = levelOf('dotlevel');
			loose.forEach(function (k) { delete out[k]; }); 
			if (unlinkedOf()) out.unlinked = true; 
			out.roles = {};
			ROLES.forEach(function (role) {
				var r = {};
				if (s.roles && s.roles[role]) Object.keys(s.roles[role]).forEach(function (k) { r[k] = s.roles[role][k]; });
				if (tw.roles && tw.roles[role]) Object.keys(tw.roles[role]).forEach(function (k) { r[k] = tw.roles[role][k]; });
				if (Object.keys(r).length) out.roles[role] = r;
			});
			var fxOut = effectsOf(s, tw); if (Object.keys(fxOut).length) out.effects = fxOut;
			var c = coloursOf(); out.colours = {};
			['light', 'dark'].forEach(function (side) { if (Object.keys(c[side]).length) out.colours[side] = c[side]; });
			return JSON.stringify(out);
		},
		importStyle: function (text, name) {
			var data;
			try { data = JSON.parse(String(text || '').trim()); } catch (e) { return null; }
			if (!data || data.architrave !== 1) return null;
			var entry = ownFromRecord(data, name);
			renderHosts();
			apply(entry, entry);
			return entry.id;
		},
		shareLink: function (whole) {
			var s = byId(current); if (!s) return '';
			var base = window.location.origin + window.location.pathname;
			if (!whole && !s.own && !this.adjusted(s.id)) return base + '?style=' + encodeURIComponent(s.id);
			var record = JSON.parse(this.exportStyle());
			return base + '#style=' + encodeRecord(record);
		},
		importLink: function (text) {
			var self = this, url;
			try { url = new URL(String(text || '').trim()); } catch (e) { return Promise.resolve(null); }
			var m = /^#style=(.+)$/.exec(url.hash), data = m && decodeRecord(m[1]);
			if (data) return Promise.resolve(self.importStyle(JSON.stringify(data)));
			var id = url.searchParams.get('style');
			if (!id) return Promise.resolve(null);
			if (url.origin === window.location.origin && byId(id)) { var p = byId(id); apply(p, wanted(p)); return Promise.resolve(p.id); }
			if (!/^site-[a-z0-9]+$/.test(id) || !window.fetch) return Promise.resolve(null);
			return fetch(url.origin + '/?rest_route=' + encodeURIComponent('/architrave/v1/site-styles/' + id), { mode: 'cors' })
				.then(function (r) { return r.ok ? r.json() : null; })
				.then(function (rec) { return rec && rec.architrave === 1 ? self.importStyle(JSON.stringify(rec)) : null; })
				.catch(function () { return null; });
		},
		duplicate: function (id) {
			var s = byId(id); if (!s) return null;
			var record, name = t('{name} copy').replace('{name}', t(s.label));
			var taken = function (l) { return STYLES.some(function (x) { return t(x.label) === l; }); };
			if (taken(name)) { var nth = 2; while (taken(name + ' ' + nth)) nth++; name = name + ' ' + nth; }
			if (id === current) record = JSON.parse(this.exportStyle());
			else {
				var tw = readTweaks()[id] || {}, w = wanted(s);
				record = {};
				Object.keys(s).forEach(function (k) { record[k] = s[k]; });
				Object.keys(tw).forEach(function (k) { if (k !== 'roles' && k !== 'effects') record[k] = tw[k]; });
				var fxDup = effectsOf(s, tw); if (Object.keys(fxDup).length) record.effects = fxDup; else delete record.effects;
				DIALS.forEach(function (d) { record[d] = w[d]; });
				var roles = {};
				ROLES.forEach(function (role) {
					var r = {};
					if (s.roles && s.roles[role]) Object.keys(s.roles[role]).forEach(function (k) { r[k] = s.roles[role][k]; });
					if (tw.roles && tw.roles[role]) Object.keys(tw.roles[role]).forEach(function (k) { r[k] = tw.roles[role][k]; });
					if (Object.keys(r).length) roles[role] = r;
				});
				record.roles = roles;
				record.base = baseOf(s);
			}
			var entry = ownFromRecord(record, name);
			if (s.host || s.bare) { entry.bare = true; entry.hostFace = s.hostFace; if (!entry.colours) entry.colours = s.colours; writeOwn(); }
			renderHosts();
			return entry.id;
		},
		saveAs: function (name) {
			var s = byId(current); if (!s) return null;
			var tw = readTweaks()[current] || {}, w = wanted(s);
			var entry = { id: 'own-' + Date.now().toString(36), label: String(name || '').trim().slice(0, 40) || t('My style'), own: true, base: baseOf(s) };
			if (s.host || s.bare) { entry.bare = true; entry.hostFace = s.hostFace; entry.colours = s.colours; }
			DIALS.forEach(function (d) { entry[d] = s.host ? now()[d] : w[d]; });
			OPTS.forEach(function (k) { entry[k] = optionOn(k); });
			var loose = followers();
			entry.tint = tintOf(); entry.sans = sansOf(); entry.scope = scopeOf(); entry.pictures = picturesOf(); entry.capLines = capLinesOf(); entry.button = buttonOf(); Object.keys(PICKS).forEach(function (k) { entry[k] = pickOf(k); }); entry.scan = levelOf('scan'); entry.line = levelOf('line'); entry.fill = levelOf('fill'); entry.glowlevel = levelOf('glowlevel'); entry.grainlevel = levelOf('grainlevel'); entry.vignettelevel = levelOf('vignettelevel'); entry.vignettereach = levelOf('vignettereach'); entry.softlevel = levelOf('softlevel'); entry.quietlevel = levelOf('quietlevel'); entry.smallsoft = levelOf('smallsoft'); entry.linestyle = lineStyleOf(); entry.corners = cornersOf(); entry.fadeedges = fadeEdgesOf(); entry.markercolour = markerColourOf(); entry.framepattern = framePatternOf(); entry.measure = levelOf('measure'); entry.space = levelOf('space'); entry.framewidth = levelOf('framewidth'); entry.dotsize = levelOf('dotsize'); entry.dotlevel = levelOf('dotlevel'); entry.unlinked = unlinkedOf();
			loose.forEach(function (k) { delete entry[k]; }); 
			entry.roles = {};
			ROLES.forEach(function (role) {
				var r = {};
				if (s.roles && s.roles[role]) Object.keys(s.roles[role]).forEach(function (k) { r[k] = s.roles[role][k]; });
				if (tw.roles && tw.roles[role]) Object.keys(tw.roles[role]).forEach(function (k) { r[k] = tw.roles[role][k]; });
				if (Object.keys(r).length) entry.roles[role] = r;
			});
			var fxSave = effectsOf(s, tw); if (Object.keys(fxSave).length) entry.effects = fxSave;
			var c = coloursOf(); entry.colours = {};
			['light', 'dark'].forEach(function (side) { if (Object.keys(c[side]).length) entry.colours[side] = c[side]; });
			var all = readTweaks(); delete all[current]; writeTweaks(all);
			STYLES.push(entry); writeOwn(); renderHosts();
			apply(entry, entry);
			return entry.id;
		},
		update: function () {
			var s = byId(current); if (!s || !s.own) return false;
			var tw = readTweaks()[current] || {}, w = wanted(s);
			DIALS.forEach(function (d) { s[d] = w[d]; });
			OPTS.forEach(function (k) { s[k] = optionOn(k); });
			var loose = followers();
			s.tint = tintOf(); s.sans = sansOf(); s.scope = scopeOf(); s.pictures = picturesOf(); s.capLines = capLinesOf(); s.button = buttonOf(); Object.keys(PICKS).forEach(function (k) { s[k] = pickOf(k); }); s.scan = levelOf('scan'); s.line = levelOf('line'); s.fill = levelOf('fill'); s.glowlevel = levelOf('glowlevel'); s.grainlevel = levelOf('grainlevel'); s.vignettelevel = levelOf('vignettelevel'); s.vignettereach = levelOf('vignettereach'); s.softlevel = levelOf('softlevel'); s.quietlevel = levelOf('quietlevel'); s.smallsoft = levelOf('smallsoft'); s.linestyle = lineStyleOf(); s.corners = cornersOf(); s.fadeedges = fadeEdgesOf(); s.markercolour = markerColourOf(); s.framepattern = framePatternOf(); s.measure = levelOf('measure'); s.space = levelOf('space'); s.framewidth = levelOf('framewidth'); s.dotsize = levelOf('dotsize'); s.dotlevel = levelOf('dotlevel'); s.unlinked = unlinkedOf();
			loose.forEach(function (k) { delete s[k]; }); 
			s.roles = s.roles || {};
			ROLES.forEach(function (role) { if (tw.roles && tw.roles[role]) { s.roles[role] = s.roles[role] || {}; Object.keys(tw.roles[role]).forEach(function (k) { s.roles[role][k] = tw.roles[role][k]; }); } });
			var fxUp = effectsOf(s, tw); if (Object.keys(fxUp).length) s.effects = fxUp; else delete s.effects;
			var c = coloursOf(); s.colours = {};
			['light', 'dark'].forEach(function (side) { if (Object.keys(c[side]).length) s.colours[side] = c[side]; });
			var all = readTweaks(); delete all[current]; writeTweaks(all);
			writeOwn(); apply(s, s);
			return true;
		},
		remove: function (id) {
			var s = byId(id); if (!s || !s.own) return;
			var all = readTweaks(); delete all[id]; writeTweaks(all);
			STYLES.splice(STYLES.indexOf(s), 1); writeOwn(); renderHosts();
			if (current === id) apply(STYLES[0], wanted(STYLES[0]));
		},
		current: function () { return current; },
		restSize: function (role) { return ROLE_DEFAULT[role] ? rungFor(role, ROLE_DEFAULT[role].size) : null; }, 
		adjusted: function (id) {
			var s = byId(id); if (!s) return false;
			if (readTweaks()[id]) return true;
			return id === current && !same(now(), s);
		},
		option: optionOn,
		setOption: function (k, on) {
			if (OPTS.indexOf(k) === -1) return;
			var all = readTweaks(), entry = all[current] || {};
			if (!!on === restOf(k)) delete entry[k]; else entry[k] = !!on;
			if (Object.keys(entry).length) all[current] = entry; else delete all[current];
			writeTweaks(all);
			applyOptions(); applyPicks(); applyLevels(); mark(); 
		},
		tints: TINTS,
		tint: tintOf,
		sans: SANS,
		sansNow: sansOf,
		setSans: function (v) {
			if (!SANS.some(function (f) { return f.id === v; })) return;
			var s = byId(current), all = readTweaks(), entry = all[current] || {};
			if (v === ((s && s.sans) || SANS[0].id) && !(window.architravePanelGuest && s && s.host)) delete entry.sans; else entry.sans = v;
			if (Object.keys(entry).length) all[current] = entry; else delete all[current];
			writeTweaks(all);
			applySans(); mark();
		},
		tracking: TRACKING,
		trackingNow: trackingOf,
		setTracking: function (v) { this.setRole('read', 'tracking', v); },
		roles: ROLES,
		role: roleOf,
		faceOf: realFace, 
		weights: Object.keys(WEIGHT),
		weightsFor: weightsFor,
		sizesFor: sizesFor,
		wanted: function (id) { var s = byId(id); return s ? wanted(s) : {}; }, 
		hasItalic: hasItalic,
		
		members: function (role) {
			var v = roleOf(role), f = sizeFactor(role, v.size);
			return membersOf(role).map(function (m) {
				var own = (!m.lead && v.members && v.members[m.id]) || {};
				return {
					id: m.id, rest: m.rest, lead: !!m.lead, bound: !Object.keys(own).length,
					own: own,
					size: m.lead ? String(v.size) : own.size !== undefined ? own.size : String(Math.round(m.rest * f)),
					weight: own.weight !== undefined ? fitWeight(v.face, own.weight) : (v.weight !== ROLE_DEFAULT[role].weight || !m.weight ? v.weight : fitWeight(v.face, m.weight)), 
					caps: own.caps !== undefined ? own.caps : v.caps,
					tracking: own.tracking !== undefined ? own.tracking : v.tracking,
					align: v.align === undefined ? undefined : own.align !== undefined ? own.align : v.align
				};
			});
		},
		memberSizes: function (role) { return sizesFor(role); },
		memberDials: MEMBER_DIALS,
		memberDialsFor: memberDialsOf,
		aligns: ALIGNS,
		setMember: function (role, id, dial, value) {
			var m = membersOf(role).filter(function (x) { return x.id === id; })[0];
			if (!m || m.lead) return;
			var v = roleOf(role), set = {};
			Object.keys(v.members || {}).forEach(function (k) { var o = {}; Object.keys(v.members[k]).forEach(function (d) { o[d] = v.members[k][d]; }); set[k] = o; });
			if (dial === null || dial === undefined) delete set[id];
			else if (memberDialsOf(role).indexOf(dial) !== -1) {
				set[id] = set[id] || {};
				if (value === null || value === undefined) delete set[id][dial];
				else if (dial === 'size') set[id].size = nearestRung(role, value); 
				else if (dial === 'weight') set[id].weight = WEIGHT_ALIAS[value] || value;
				else if (dial === 'caps') set[id].caps = !!value;
				else if (dial === 'align') set[id].align = ALIGNS.indexOf(value) !== -1 ? value : 'default';
				else set[id].tracking = TRACK_ALIAS[value] || value;
				if (!Object.keys(set[id]).length) delete set[id];
			}
			var s = byId(current), all = readTweaks(), entry = all[current] || {};
			var base = (s && s.roles && s.roles[role] && s.roles[role].members) || {};
			var same = JSON.stringify(set) === JSON.stringify((function () { var o = {}; Object.keys(base).sort().forEach(function (k) { o[k] = base[k]; }); return o; })()) ;
			entry.roles = entry.roles || {}; entry.roles[role] = entry.roles[role] || {};
			if (same) delete entry.roles[role].members; else entry.roles[role].members = set;
			if (!Object.keys(entry.roles[role]).length) delete entry.roles[role];
			if (!Object.keys(entry.roles).length) delete entry.roles;
			if (Object.keys(entry).length) all[current] = entry; else delete all[current];
			writeTweaks(all);
			applyRoles(); mark();
		},
		setRole: function (role, dial, v) {
			if (ROLES.indexOf(role) === -1 || !(dial in ROLE_DEFAULT[role]) || dial === 'members') return;
			if (dial === 'align' && ALIGNS.indexOf(v) === -1) return;
			if (dial === 'colour' && ROLE_COLOURS.indexOf(v) === -1) return;
			if (dial === 'face' && role === 'read') { press('[data-architrave-face] [data-face-choice="' + v + '"]'); return; }
			if (dial === 'face' && role === 'ui') { this.setSans(v); return; }
			var s = byId(current), all = readTweaks(), entry = all[current] || {}, rest = ROLE_DEFAULT[role][dial];
			if (s && s.roles && s.roles[role] && s.roles[role][dial] !== undefined) rest = s.roles[role][dial];
			if (dial === 'weight') { v = WEIGHT_ALIAS[v] || v; rest = WEIGHT_ALIAS[rest] || rest; }
			if (dial === 'size') { v = rungFor(role, v); rest = rungFor(role, rest); }
			if (dial === 'tracking') { v = TRACK_ALIAS[v] || v; rest = TRACK_ALIAS[rest] || rest; }
			if (dial === 'words') { v = WORDS_ALIAS[v] || v; rest = WORDS_ALIAS[rest] || rest; }
			entry.roles = entry.roles || {}; entry.roles[role] = entry.roles[role] || {};
			var hostLook = window.architravePanelGuest && s && (s.host || s.bare); 
			if (v === rest && !hostLook) delete entry.roles[role][dial]; else entry.roles[role][dial] = v;
			if (!Object.keys(entry.roles[role]).length) delete entry.roles[role];
			if (!Object.keys(entry.roles).length) delete entry.roles;
			if (Object.keys(entry).length) all[current] = entry; else delete all[current];
			writeTweaks(all);
			applyRoles(); mark();
		},
		scope: SCOPE,
		scopeNow: scopeOf,
		pictures: PICTURES,
		picturesNow: picturesOf,
		linked: function () { return !unlinkedOf(); },
		setLinked: function (on, side) {
			var all = readTweaks(), entry = all[current] || {}, s = byId(current);
			if (on) {
				var other = side === 'dark' ? 'light' : 'dark';
				if (entry.colours && entry.colours[other]) { delete entry.colours[other]; if (!Object.keys(entry.colours).length) delete entry.colours; }
				if (s && s.unlinked) entry.unlinked = false; else delete entry.unlinked;
			} else {
				var res = coloursResolved();
				entry.colours = entry.colours || {};
				['light', 'dark'].forEach(function (s2) {
					entry.colours[s2] = entry.colours[s2] || {};
					['paper', 'ink', 'accent'].forEach(function (k) { if (res[s2][k]) entry.colours[s2][k] = res[s2][k]; });
					if (!Object.keys(entry.colours[s2]).length) delete entry.colours[s2];
				});
				entry.unlinked = true;
			}
			if (Object.keys(entry).length) all[current] = entry; else delete all[current];
			writeTweaks(all);
			applyColours(); mark();
		},
		capLines: ['2', '3', '4'],
		setCapLines: function (v) {
			if (CAP_LINES.indexOf(v) === -1) return;
			var s = byId(current), all = readTweaks(), entry = all[current] || {};
			if (v === ((s && s.capLines) || CAP_LINES[0])) delete entry.capLines; else entry.capLines = v;
			if (Object.keys(entry).length) all[current] = entry; else delete all[current];
			writeTweaks(all);
			applyCapLines(); mark();
		},
		levels: { scan: LEVELS.scan.stops, line: LEVELS.line.stops, fill: LEVELS.fill.stops, glowlevel: LEVELS.glowlevel.stops, grainlevel: LEVELS.grainlevel.stops, vignettelevel: LEVELS.vignettelevel.stops, vignettereach: LEVELS.vignettereach.stops, softlevel: LEVELS.softlevel.stops, quietlevel: LEVELS.quietlevel.stops, smallsoft: LEVELS.smallsoft.stops, measure: LEVELS.measure.stops, space: LEVELS.space.stops, framewidth: LEVELS.framewidth.stops, dotsize: LEVELS.dotsize.stops, dotlevel: LEVELS.dotlevel.stops },
		level: function (k) { return LEVELS[k] ? levelOf(k) : ''; },
		setLevel: function (k, v) {
			var L = LEVELS[k]; if (!L || L.stops.indexOf(v) === -1) return;
			var s = byId(current), all = readTweaks(), entry = all[current] || {};
			if (v === levelRest(k)) delete entry[k]; else entry[k] = v;
			if (Object.keys(entry).length) all[current] = entry; else delete all[current];
			writeTweaks(all);
			var go = function () { applyLevels(); mark(); };
			if (k === 'space' && window.ArchitraveSpace) window.ArchitraveSpace.soft(go); else go();
		},
		cornerSteps: CORNERS,
		corners: cornersOf,
		setCorners: function (v) {
			if (CORNERS.indexOf(v) === -1) return;
			var s = byId(current), all = readTweaks(), entry = all[current] || {};
			if (v === ((s && CORNERS.indexOf(s.corners) !== -1) ? s.corners : CORNERS[0])) delete entry.corners; else entry.corners = v;
			if (Object.keys(entry).length) all[current] = entry; else delete all[current];
			writeTweaks(all);
			applyCorners(); mark();
		},
		framePatterns: FRAME_PATTERNS,
		framePattern: framePatternOf,
		setFramePattern: function (v) {
			if (FRAME_PATTERNS.indexOf(v) === -1) return;
			var s = byId(current), all = readTweaks(), entry = all[current] || {};
			if (v === ((s && FRAME_PATTERNS.indexOf(s.framepattern) !== -1) ? s.framepattern : FRAME_PATTERNS[0])) delete entry.framepattern; else entry.framepattern = v;
			if (Object.keys(entry).length) all[current] = entry; else delete all[current];
			writeTweaks(all);
			applyFramePattern(); mark();
		},
		picks: PICKS,
		pick: pickOf,
		effects: EFFECTS,
		effect: effectOf,
		setEffect: function (fid, d, v) {
			var def = EFFECTS[fid] && EFFECTS[fid][d]; if (!def || def.list.indexOf(v) === -1) return;
			var s = byId(current), all = readTweaks(), entry = all[current] || {}, fx = entry.effects || {}, o = fx[fid] || {};
			var own = s && s.effects && s.effects[fid] && s.effects[fid][d];
			if (v === (own !== undefined ? own : def.rest)) delete o[d]; else o[d] = v;
			if (Object.keys(o).length) fx[fid] = o; else delete fx[fid];
			if (Object.keys(fx).length) entry.effects = fx; else delete entry.effects;
			if (Object.keys(entry).length) all[current] = entry; else delete all[current];
			writeTweaks(all);
			applyEffects(); if (fid === 'tint') applyColours(); mark();
		},
		setPick: function (key, v) {
			var d = PICKS[key]; if (!d || d.list.indexOf(v) === -1) return;
			var s = byId(current), all = readTweaks(), entry = all[current] || {};
			if (v === ((s && d.list.indexOf(s[key]) !== -1) ? s[key] : pickRest(key))) delete entry[key]; else entry[key] = v;
			if (Object.keys(entry).length) all[current] = entry; else delete all[current];
			writeTweaks(all);
			applyPicks(); if (key === 'greytint' || key === 'phosphor') applyColours(); mark();
		},
		buttonColours: BUTTONS,
		buttonColour: buttonOf,
		setButtonColour: function (v) {
			if (BUTTONS.indexOf(v) === -1) return;
			var s = byId(current), all = readTweaks(), entry = all[current] || {};
			if (v === ((s && BUTTONS.indexOf(s.button) !== -1) ? s.button : BUTTONS[0])) delete entry.button; else entry.button = v;
			if (Object.keys(entry).length) all[current] = entry; else delete all[current];
			writeTweaks(all);
			applyButton(); mark();
		},
		markerColours: MARKERS,
		markerColour: markerColourOf,
		setMarkerColour: function (v) {
			if (MARKERS.indexOf(v) === -1) return;
			var s = byId(current), all = readTweaks(), entry = all[current] || {};
			if (v === ((s && MARKERS.indexOf(s.markercolour) !== -1) ? s.markercolour : MARKERS[0])) delete entry.markercolour; else entry.markercolour = v;
			if (Object.keys(entry).length) all[current] = entry; else delete all[current];
			writeTweaks(all);
			applyMarkerColour(); mark();
		},
		fadeEdgesList: FADE_EDGES,
		fadeEdges: fadeEdgesOf,
		setFadeEdges: function (v) {
			if (FADE_EDGES.indexOf(v) === -1) return;
			var s = byId(current), all = readTweaks(), entry = all[current] || {};
			if (v === ((s && FADE_EDGES.indexOf(s.fadeedges) !== -1) ? s.fadeedges : FADE_EDGES[0])) delete entry.fadeedges; else entry.fadeedges = v;
			if (Object.keys(entry).length) all[current] = entry; else delete all[current];
			writeTweaks(all);
			applyFadeEdges(); mark();
		},
		lineStyles: LINE_STYLE,
		lineStyle: lineStyleOf,
		setLineStyle: function (v) {
			if (LINE_STYLE.indexOf(v) === -1) return;
			var s = byId(current), all = readTweaks(), entry = all[current] || {};
			if (v === ((s && LINE_STYLE.indexOf(s.linestyle) !== -1) ? s.linestyle : LINE_STYLE[0])) delete entry.linestyle; else entry.linestyle = v;
			if (Object.keys(entry).length) all[current] = entry; else delete all[current];
			writeTweaks(all);
			applyLineStyle(); mark();
		},
		setPictures: function (v) {
			if (PICTURES.indexOf(v) === -1) return;
			var s = byId(current), all = readTweaks(), entry = all[current] || {};
			if (v === ((s && s.pictures) || PICTURES[0])) delete entry.pictures; else entry.pictures = v;
			if (Object.keys(entry).length) all[current] = entry; else delete all[current];
			writeTweaks(all);
			applyPictures(); mark();
		},
		setScope: function (v) {
			if (SCOPE.indexOf(v) === -1) return;
			var s = byId(current), all = readTweaks(), entry = all[current] || {};
			if (v === ((s && s.scope) || SCOPE[0])) delete entry.scope; else entry.scope = v;
			if (Object.keys(entry).length) all[current] = entry; else delete all[current];
			writeTweaks(all);
			applyScope(); mark();
		},
		setTint: function (v) {
			if (TINTS.indexOf(v) === -1) return;
			var s = byId(current), all = readTweaks(), entry = all[current] || {};
			if (v === ((s && s.tint) || TINTS[0])) delete entry.tint; else entry.tint = v;
			['light', 'dark'].forEach(function (side) {
				if (entry.colours && entry.colours[side]) { delete entry.colours[side].accent; if (!Object.keys(entry.colours[side]).length) delete entry.colours[side]; }
				if (s && (s.own || s.site) && s.colours && s.colours[side] && s.colours[side].accent) { entry.colours = entry.colours || {}; entry.colours[side] = entry.colours[side] || {}; entry.colours[side].accent = ''; }
			});
			if (entry.colours && !Object.keys(entry.colours).length) delete entry.colours;
			if (Object.keys(entry).length) all[current] = entry; else delete all[current];
			writeTweaks(all);
			applyTint(); applyColours(); mark();
		},
		accent: accentOn,
		setAccent: function (on) {
			try { if (on) localStorage.removeItem(ACCENT_KEY); else localStorage.setItem(ACCENT_KEY, 'off'); } catch (e) {  }
			applyAccent();
		},
		focus: function () { return Focus.on(); },
		motion: function (press) { return Focus.motion(press); },
		retime: function () { return Focus.retime(); },
		setFocus: function (on) { Focus.set(on); },
		canUndo: function () { return HISTORY.length > 0; },
		undoWhat: function () { var h = HISTORY[HISTORY.length - 1]; return h && h.what || ''; },
		canRedo: function () { return FUTURE.length > 0; },
		redoWhat: function () { var h = FUTURE[FUTURE.length - 1]; return h && h.what || ''; },
		redo: function () {
			var h = FUTURE.pop(); if (!h) return false;
			var was = ''; try { was = localStorage.getItem(TWEAKS_KEY) || '{}'; } catch (e) {  }
			HISTORY.push({ tweaks: was, side: storedSide(), style: current, what: h.what });
			undoing = true;
			try { localStorage.setItem(TWEAKS_KEY, h.tweaks); } catch (e) {  }
			var s = byId(h.style) || byId(current);
			if (s) { apply(s, wanted(s)); applyRoles(); }
			if (h.side && h.side !== storedSide()) press('[data-quire-modes="palette"] [data-side="' + h.side + '"]');
			undoing = false; lastPush = 0;
			mark();
			return true;
		},
		undo: function () {
			var h = HISTORY.pop(); if (!h) return false;
			var now = ''; try { now = localStorage.getItem(TWEAKS_KEY) || '{}'; } catch (e) {  }
			FUTURE.push({ tweaks: now, side: storedSide(), style: current, what: h.what }); 
			undoing = true;
			try { localStorage.setItem(TWEAKS_KEY, h.tweaks); } catch (e) {  }
			var s = byId(h.style) || byId(current);
			if (s) { apply(s, wanted(s)); applyRoles(); }
			if (h.side && h.side !== storedSide()) press('[data-quire-modes="palette"] [data-side="' + h.side + '"]');
			undoing = false; lastPush = 0;
			mark();
			return true;
		},
		
		changes: function () {
			var s = byId(current) || {}, e = readTweaks()[current] || {}, out = {};
			Object.keys(e).forEach(function (k) { if (k !== 'was' && !(DIALS.indexOf(k) !== -1 && e[k] === s[k])) out[k] = e[k]; });
			return out;
		},
		resetPaths: function (paths) {
			var s = byId(current), all = readTweaks(), entry = all[current];
			if (!s || !entry) return;
			paths.forEach(function (path) {
				var p = path.split('.'), trail = [entry];
				for (var i = 0; i < p.length - 1; i++) { var nx = trail[i][p[i]]; if (!nx || typeof nx !== 'object') return; trail.push(nx); }
				delete trail[p.length - 1][p[p.length - 1]];
				for (var j = p.length - 2; j >= 0; j--) if (!Object.keys(trail[j + 1]).length) delete trail[j][p[j]];
			});
			if (Object.keys(entry).length) all[current] = entry; else delete all[current];
			writeTweaks(all);
			if (s.host) goHome(); else apply(s, wanted(s));
		},
		resetChanges: function (id) {
			var s = byId(id); if (!s) return;
			var all = readTweaks(); delete all[id]; writeTweaks(all);
			if (id === current) apply(s, s);
			else mark();
		},
		versions: function () { var s = byId(current); if (!s || s.host) return []; var l = readVersions()[s.id]; return Array.isArray(l) ? l.slice() : []; },
		savedRecord: function () { var s = byId(current); return s && !s.host ? savedRecord() : null; },
		nowRecord: function () {
			var s = byId(current); if (!s || s.host) return null;
			if (!previewing) return lookOf(JSON.parse(this.exportStyle() || '{}'));
			var shown = null; try { shown = localStorage.getItem(TWEAKS_KEY); if (previewing.raw === null) localStorage.removeItem(TWEAKS_KEY); else localStorage.setItem(TWEAKS_KEY, previewing.raw); } catch (e) { return null; }
			var out = lookOf(JSON.parse(this.exportStyle() || '{}'));
			try { if (shown === null) localStorage.removeItem(TWEAKS_KEY); else localStorage.setItem(TWEAKS_KEY, shown); } catch (e) {  }
			return out;
		},
		keepVersion: function () { versionNow(); return keepVersion(); },
		previewVersion: function (rec) {
			var s = byId(current); if (!s || s.host) return false;
			if (!rec) return endPreview();
			if (!previewing) { var raw = null; try { raw = localStorage.getItem(TWEAKS_KEY); } catch (e) { return false; } versionNow(); previewing = { id: s.id, raw: raw }; }
			var all = readTweaks(), e = entryFromRecord(rec);
			if (Object.keys(e).length) all[s.id] = e; else delete all[s.id];
			writeQuiet(all);
			applyNow(s, wanted(s)); applyRoles();
			return true;
		},
		previewing: function () { return !!previewing; },
		restoreVersion: function (rec) {
			var s = byId(current); if (!s || s.host || !rec) return false;
			endPreview();
			keepVersion(); 
			var all = readTweaks(), e = entryFromRecord(rec);
			if (Object.keys(e).length) all[s.id] = e; else delete all[s.id];
			lastPush = 0; writeTweaks(all);
			if (HISTORY.length) HISTORY[HISTORY.length - 1].what = 'version';
			applyNow(s, wanted(s)); applyRoles();
			return true;
		},
		reset: function (id) {
			var s = byId(id); if (!s) return;
			if (s.host) { goHome(); return; } 
			var all = readTweaks(); delete all[id]; writeTweaks(all);
			apply(s, s);
			
			press('[data-quire-modes="palette"] [data-side="dark"]');
			this.setAccent(true);
			this.setFocus(false);
		}
	};
	
	new MutationObserver(function () { applyRoles(); }).observe(root, { attributes: true, attributeFilter: ['data-face', 'data-sans'] });
	new MutationObserver(function () { if (root.hasAttribute('data-fill')) applyLevels(); }).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
	function renderHosts() {
		var CHECK = window.QuireIcons
			? window.QuireIcons.markup('check', 'class="quire-menu-check"')
			: '';
		document.querySelectorAll('[data-architrave-presets]').forEach(function (host) {
			host.innerHTML = STYLES.filter(offered).map(function (p) {
				return '<li><button type="button" class="quire-menu-item" role="menuitemradio" ' +
					'aria-checked="false" data-preset="' + p.id + '">' +
					'<span class="quire-menu-label">' + t(p.label) + '</span>' + CHECK + '</button></li>';
			}).join('');
		});
		mark();
	}
	
	var RESTED = { brochure: [{ palette: 'neutral', reading: 'small', face: 'eb-garamond', leading: 'snug' }] };
	function restMoved() {
		var all = readTweaks(), changed = false;
		Object.keys(RESTED).forEach(function (id) {
			var tw = all[id]; if (!tw || !DIALS.every(function (d) { return tw[d] !== undefined; })) return;
			if (!RESTED[id].some(function (o) { return same(tw, o); })) return;
			DIALS.forEach(function (d) { delete tw[d]; });
			if (!Object.keys(tw).length) delete all[id];
			changed = true;
		});
		if (changed) writeTweaks(all);
		var s = byId(current), olds = s && !s.host && RESTED[s.id], d = now();
		if (olds && !same(d, s) && olds.some(function (o) { return same(d, o); }) && !DIALS.some(function (k) { return (all[s.id] || {})[k] !== undefined; })) apply(s, wanted(s));
	}
	document.addEventListener('DOMContentLoaded', function () {
		renderHosts();
		if (seeded) apply(byId(current), wanted(byId(current))); 
		restMoved();
		window.addEventListener('hashchange', function () {
			var m = /^#style=(.+)$/.exec(window.location.hash), data = m && decodeRecord(m[1]);
			if (!data) return;
			var entry = ownFromRecord(data); renderHosts(); apply(entry, entry);
			try { history.replaceState(null, '', window.location.pathname + window.location.search); } catch (e) {  }
		});
		
		new MutationObserver(function (records) {
			if (records.some(function (r) { return r.attributeName === 'data-theme'; }) && applying) { applying = false; if (applyTimer) { clearTimeout(applyTimer); applyTimer = null; } }
			if (!applying) remember();
			if (records.some(function (r) { return r.attributeName === 'data-theme'; })) applyOptions();
			mark();
		}).observe(root, {
			attributes: true,
			attributeFilter: ['data-theme', 'data-reading', 'data-face', 'data-leading']
		});
		document.addEventListener('click', function (e) {
			if (e.target.closest('[data-architrave-reset]')) {
				if (STYLES[0] && STYLES[0].host) { slowly(goHome); return; }
				var all = readTweaks(); delete all[DEFAULT]; writeTweaks(all);
				apply(STYLES[0], STYLES[0]);
				return;
			}
			var row = e.target.closest('[data-preset]');
			if (row) {
				var p = byId(row.getAttribute('data-preset'));
				
				if (p && p.host) slowly(goHome); 
				else if (p) apply(p, wanted(p));
				return;
			}
			if (applying) return;
			var dial = e.target.closest('[data-quire-modes="palette"] [data-palette], [data-reading-step], [data-face-choice], [data-leading-step]');
			void dial; 
		});
	});
})();
