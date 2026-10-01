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
	/* HELD STILL (0.11.149): read and written with transitions at no length;
	   the plugin's guest-size.js says
	   why (the lift below, THE TILE WEARS THE THEME'S OWN PAPER, reads the page
	   between two sides). */
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
	/* WHAT "NO SITE DEFAULT" IS CALLED (2026-09-24): Standard on Architrave, whose
	   own look it is; on a guest the theme's own look ('host'), and there
	   Standard (Classic) is one more style that may be the default. */
	var GUEST = !!window.architravePanelGuest, NONE = GUEST ? 'host' : 'standard';
	var PENDING = null; /* an order being made, shown while it is sent (setVisible) */
	// The reader's language, where the site has one for the word (functions.php,
	// architrave_settings_words). Names pass through untouched.
	var WORDS = window.architraveWords || {};
	function t(word) { return WORDS[word] || word; }

	var STYLES = [
		/* Standard is the site's own room, the one a first visit opens in:
		   Neutral in the reader's side. It was called Night and pressed the dark
		   side until 2026-09-07 (Manuel: "a confusing name"). Book was Paper,
		   which is also the palette's name. */
		/* THE PARAGRAPH IS PART OF THE RECIPE (Manuel, 2026-09-10: "we should
		   have those settings on all, also on standard"): justified text,
		   hyphenation and the drop cap are three switches every style
		   offers, each style with its own rest, and a reader's press on one
		   is a tweak of that style like a dial's. Book rests with all three
		   on; the others off. */
		{ id: 'standard', label: 'Classic', /* Standard until 2026-09-23 (Manuel: "if we now set a site default, the first one cannot be called Standard", German's word for a default). The id stays. */ palette: 'neutral', tint: 'purple', sans: 'inter', reading: 'default', face: 'newsreader', leading: 'default', justify: false, dropcap: false, rounded: true, lines: false, bold: false, scope: 'article', fills: true, roles: {} },
		{ id: 'book', label: 'Book', measure: '60', /* ITS OWN WIDTH, a printed page is narrow (Manuel, 2026-09-25, lab/the-tile-widths.html: "all yes") */ palette: 'paper', tint: 'brown', sans: 'hyperlegible', reading: 'default', face: 'vollkorn', leading: 'default', justify: true, dropcap: true, rounded: false, lines: false, bold: false, scope: 'article', fills: true, roles: {} /* THE PICTURES SHOW (Manuel, 2026-09-26: a style that hides the pictures "is not going to work"): Book rests on them as published. Hidden stays a choice in Picture effects for any style and theme, only no style rests on it. */ /* NO PINS (2026-09-22): every role followed its anchor by name, Vollkorn on the article's three and Hyperlegible on the site's three, and now says so */ } /* MANUEL'S OWN BOOK (2026-09-19, the record copied out of his panel: "I updated the book style. Can you take that as the default values for book?"): square corners, the pictures hidden behind their lines (shown again 2026-09-26), the quotes in Vollkorn and the comments in Hyperlegible, which the recipe had left on Newsreader and Inter. His record's `line: 14` is 1.3.267's mistaken rest, not a choice, and Lines is off; it is not taken. */ /* BACK ON VOLLKORN (Manuel, 2026-09-17 evening, with the final twelve): it was Book's face from the day Book was decided on lab/the-book-face.html, went to EB Garamond for the few hours Vollkorn was out of the theme, and returns with it. */,
		/* CLEAR (Large print, then Poster, until 2026-09-12; Manuel: "Klar it is", it never looked like a poster; Apple names a look by what the reader gets) RESTS LIGHT AND SQUARE (Manuel, 2026-09-12: "default should
		   be light and no rounded corners and airy"): the one style besides
		   Book that named a side until 2026-09-12; its box has no rounded corner. The terminal palette, not Persona or
		   Neutral (Manuel, 2026-09-12: "true white and true black"): #ffffff
		   paper with #000000 ink, and the black sheet when flipped, the same
		   pair Terminal reads from the other side; style.css puts Neutral's
		   purple back in place of the green. Ragged and unhyphenated, as
		   poster type breaks. No lines (Manuel, 2026-09-12, settling it: "Poster
		   should be, by default: lines off, airy, and accent blue").
		   THE GREY PAIR (the same afternoon, after the one white sheet left
		   the corner squares "floating in nowhere"): Manuel's four values,
		   #4a4a4d with #ebebf6 by day, #000000 with #8d8d95 by night, the
		   rail a step from the paper on both; style.css, THE GREY PAIR. */
		/* THE REWORK OF 1.3.278 IS TAKEN BACK (Manuel, the same evening: "I like the style of the shield before better. Can you reverse it?"). The line below is the one that stood before it, his own values of 1.3.272 under the new name. What was tried and did not stay: the title 48, the headings bold at 28, the category line 16 in capitals, a regular body, the quote at 24, Lines on at 14 %, dates and tags in capitals, the dimming by night. */
		{ id: 'large', label: 'Poster', measure: '60', /* ITS OWN WIDTH, big letters read best in short lines (Manuel, 2026-09-25, lab/the-tile-widths.html: "all yes") */ /* POSTER SINCE 2026-09-23 (Manuel: "I don't like the name Schild, make it Poster"). Large print, Poster, Clear, and Signage since 2026-09-19 (Manuel: the tiles are things, a book, a terminal; this one is a sign, Schild in German). The id stays, so a stored choice and a link still find it. */ palette: 'grey', tint: 'blue', sans: 'hyperlegible', reading: 'large', /* BIG WIDE TEXT (Manuel, 2026-09-28: "yes, do it for Poster"): its huge title over the 22 px column broke onto three and four lines; at Large (28 px) the same 60 letters make a column of about 740, and the title has room. Poster alone: the other tiles keep one size (2026-09-13, 2026-09-25) */ face: 'hyperlegible', leading: 'airy', justify: false, dropcap: false, rounded: false, lines: false, bold: true, scope: 'article', fills: true, pictures: 'accent', roles: { kicker: { italic: false }, head: { weight: 'extrabold', tracking: 'tight', size: '56' }, read: { weight: 'medium' }, quote: { size: '32' } /* the title 56 since the text went Large (2026-09-28): at 72 it grew with the wider column and kept its three lines; at 56 it stands about 63 px, as before, and has the room. Was: the title 72 and the quote 32: Manuel's record of 2026-09-19 evening; the six Hyperlegible pins went on 2026-09-22, since one face on both anchors is what every follower gives */ } }, /* MANUEL'S OWN CLEAR (2026-09-19, the record copied out of his panel): the pictures in Duoton, and the quotes and the comments in Hyperlegible, which the recipe had left on Newsreader and Inter. The rest of his record was the recipe. */
		/* TERMINAL IS A STYLE, NOT THE MATRIX COLOUR (Manuel, 2026-09-10): Apple's
		   Terminal is black on white, so the Neutral room; Geist Mono to start. */
		/* TERMINAL, GONE OVER (Manuel, 2026-09-19: "go over the terminal style and tweak every setting and every font choice so it's the best you can do … there's a Newsreader somewhere and that's off"). The Newsreader was the quotes, and the comments were Inter: the recipe named four roles and left two on the theme's rest; all of them are the one mono now (a quote follows the reading face). What a terminal does with one face and one size, the recipe does with case and weight: the title smaller and semibold, since monospace capitals run wide; the headings in the article at the body's size in capitals, as a man page sets NAME and SYNOPSIS; the category line and the section titles in spaced capitals. The lines a little further apart, which a mono wants. The screen: soft scan lines, the glow by night, the pictures in the pair's own two colours with their own colours under the pointer. Was: { id: 'terminal', label: 'Terminal', palette: 'terminal', tint: 'green', sans: 'mono', reading: 'default', face: 'mono', leading: 'default', justify: false, dropcap: false, rounded: false, lines: true, bold: false, scope: 'article', fills: false, roles: { kicker: { face: 'mono', italic: false }, head: { face: 'mono' }, small: { face: 'mono' }, title: { face: 'mono' } } } */
		/* MANUEL'S OWN TERMINAL (2026-09-19, the record copied out of his panel, "can we update this for the terminal?"): against the recipe of the same afternoon, the fills ON and the lines at 10 %, a faint grid and not the 45 it had. The rest of his record is the recipe. */
		/* MATRIX IS MARTIAN MONO (Manuel, 2026-09-19: three tiles in Geist "is not good. The matrix should probably have Martian"): every face of the line below, which was Geist Mono throughout. Terminal keeps Geist Mono. Martian is wide: its measure is its own 44ch, and the title's 40 stands. */
		{ id: 'terminal', label: 'Matrix', measure: '88', /* ITS OWN WIDTH, a full screen of code, the widest (Manuel, 2026-09-25, lab/the-tile-widths.html: "all yes") */ /* the green one was called Terminal until 2026-09-19 (below); the id stays, so a stored choice and a link still find it */ palette: 'terminal', tint: 'green', sans: 'martian-mono', reading: 'default', face: 'martian-mono', leading: 'relaxed', justify: false, dropcap: false, rounded: false, lines: true, bold: false, scope: 'article', fills: true, /* scan lines off since 2026-09-19 evening (Manuel); the strength stays for whoever turns them on */ scan: '2', line: '10', glow: true, pictures: 'duo', roles: { kicker: { italic: false, caps: true, tracking: 'p10', size: '18' }, head: { weight: 'semibold', size: '40', tracking: 'm2', members: { sub: { size: '22', caps: true, tracking: 'p5' } } }, title: { caps: true, tracking: 'p10' }, quote: { italic: false, size: '22' } } /* the one mono is both anchors, so no role pins it (2026-09-22) */ }, /* the category line at 18 and the quote at the body's 22, after the first capture: at their rests (26) both outshouted a 40 title */
		/* TERMINAL, THE NEW ONE (Manuel, 2026-09-19, a photograph of a printed spread: markup set in a mono on a near-black page, white, the attribute names in a soft blue, a dialog and its Cancel button drawn as thin white outlines; "maybe terminal is actually a matrix … that could be our terminal. New tile"). The green one keeps everything and takes the name Matrix. This one: the page nearly black and the ink nearly white by night, turned over by day; the blue of the attribute names as the accent; one mono throughout, set as Matrix is; Lines on and strong, Fills off, since the photograph's boxes are outlines and nothing in it is filled; square corners; no scan lines, no glow, no grain, which are the green screen's; pictures black and white. The colours are the style's own (`colours`), on the Neutral pair, because no pair has a black page. The face is Geist Mono, the theme's; the photograph's is another mono with a slanted cut, which the theme does not carry. */
		{ id: 'console', label: 'Terminal', measure: '80', /* ITS OWN WIDTH, the 80-column terminal (Manuel, 2026-09-25, lab/the-tile-widths.html: "all yes") */ palette: 'neutral', tint: 'blue', sans: 'mono', reading: 'default', face: 'mono', leading: 'relaxed', justify: false, dropcap: false, rounded: false, lines: true, line: '60', bold: false, scope: 'article', fills: false, pictures: 'bw', preset: 'carbon', roles: { kicker: { italic: false, caps: true, tracking: 'p10', size: '18' }, head: { weight: 'semibold', size: '40', tracking: 'm2', members: { sub: { size: '22', caps: true, tracking: 'p5' } } }, title: { caps: true, tracking: 'p10' }, quote: { italic: false, size: '22' } } /* the one mono is both anchors, so no role pins it (2026-09-22) */ },
		/* BLUEPRINT (Manuel, 2026-09-19, a second photograph: a spread on pale blue-grey paper in blue ink, a bold mono headline, a light sans for the reading, a list between fine rules with one thick bar down its side, mono numbers beside dashed rules; "in the past we wanted to do a style called Blueprint … inspired by that and also by your inspiration, making it appropriate for the name"). Two drawings, one per side. BY DAY the photograph: a drafting sheet, slate-blue ink on a cool pale paper, the drawing's blue as the accent. BY NIGHT the blueprint proper, the cyanotype: pale lines on a deep blue sheet. What makes it a drawing on both: everything is LINE and nothing is filled (Lines on, Fills off, square corners); the labels are the draughtsman's, small mono capitals, spaced (category line, dates, section titles); the headline the bold mono of the title block; the reading a light sans, as the photograph's; a little grain, the sheet's tooth; and the pictures in Duoton, which in this blue is a cyanotype print. The colours are the style's own on the Neutral pair. */
		/* BLUEPRINT IN THE PHOTOGRAPH'S TYPE (2026-09-19): the reading in IBM Plex Sans, as the spread; the titles in JETBRAINS MONO's bold ITALIC and the labels in JetBrains Mono, which stands in for Plex Mono (static, so its weight slider had four stops and two italic cuts; Manuel: "maybe we can replace it with a variable font which looks similar"). The italic is what gives the spread its slightly playful hand; the reading, the quotes and the comments in Plex Sans, light. It was Geist and Geist Mono for an hour, the nearest of the twelve. */
		{ id: 'blueprint', label: 'Blueprint', measure: '80', /* ITS OWN WIDTH, a wide drawing sheet (Manuel, 2026-09-25, lab/the-tile-widths.html: "all yes") */ palette: 'neutral', tint: 'blue', sans: 'plex-sans', reading: 'default', face: 'plex-sans', leading: 'relaxed', justify: false, dropcap: false, rounded: false, lines: true, line: '30', linestyle: 'dashed', bold: false, scope: 'article', fills: false, /* the grain came out (Manuel, 2026-09-19 evening: "I don't like the Korn") */ pictures: 'accent', preset: 'draft', roles: { kicker: { face: 'jetbrains-mono', italic: false, caps: true, tracking: 'p10', size: '16', weight: 'medium' }, head: { face: 'jetbrains-mono', weight: 'bold', italic: true, size: '56', /* 48 until the same evening: "the heading could be a little bit bigger" */ members: { sub: { size: '28' } } }, read: { weight: 'light' }, quote: { italic: true, size: '24', weight: 'light' }, small: { face: 'jetbrains-mono', caps: true, tracking: 'p5', members: { captions: { caps: false, tracking: 'default' }, author: { caps: false, tracking: 'default' } } }, title: { face: 'jetbrains-mono', caps: true, tracking: 'p10' } } /* the quote and the comments follow the Plex Sans anchors; the mono is PINNED on the headlines, the category line, the dates and the section titles, which is what a pin is for (2026-09-22) */ },
		/* INSTRUMENT (2026-09-20, the ask: a written description of a product site's look, a near-black page, paper-white type, one acid lime for the single action, hairlines in place of shadows, one grotesque throughout at low weights and tight tracking; "include that tile in the panel"). The reference's measurements, in this theme's dials: Inter in every role, the headings semibold (medium until 1.3.312, which the reference's article page corrected) and nothing bolder, their tracking left at the theme's rest, which measured within a hair of the reference's (a step tighter doubled it on the title); Lines on and faint, since the reference draws its edges as hairlines; Fills on, its cards a step above the page; rounded corners; no grain, no scan lines, no glow. The colours are a preset on the Neutral pair, the lime by night and an olive of the same hue by day, where a lime cannot hold 4.5:1 on a light paper. Backstage and by link, as every tile but Standard. */
		{ id: 'instrument', label: 'Instrument', space: 'compact', /* ITS OWN AIR, the reference's dense lists (Manuel, 2026-09-25, lab/the-space-of-a-page.html) */ palette: 'neutral', tint: 'green', sans: 'inter', reading: 'small', /* THE REFERENCE'S OWN SIZES (Manuel, 2026-09-25, lab/the-tiles-side-by-side.html: "no, except Instrument"): text 18 (it reads 17), title 48 under Small; every tile read 22 before */ face: 'inter', leading: 'default', justify: false, dropcap: false, rounded: true, corners: 'small', /* the reference's cards 12, buttons 6 (1.3.311) */ lines: true, line: '10', hairlines: true, /* the reference's half-pixel lines (2026-09-26) */ bold: false, scope: 'article', fills: true, /* fill '25' rested here for a day (1.3.465) to bring the cards down to the reference's 3 % step; the slider scales every step, so the rail's hover went with it and was barely visible (Manuel, 2026-09-26, screenshot). Back to the rest. */ soft: true, softlevel: '30', /* FAINTER BY DEFAULT (Manuel, 2026-09-25: "make this softer reading a little bit more prominent so that the reading text is fainter"): the rest's 15 barely showed; 30 is the reference's muted body on its near-black page, and the slider's own note says 45 still holds 4.5:1 on this pair, so 30 reads on both sides */ quietlevel: '40', /* the reference's small print, 2026-09-23 */ /* pictures in colour: black and white was the default for an hour (1.3.340) and went again (Manuel, 2026-09-23: "bring coloured images back to instrument") */ picturedim: true, pictureframe: false, /* no mat, no line: the reference's pictures stand on the page with their corner (2026-09-23); the fade stays a switch, off, since a random picture does not sink (Manuel) */ alternates: true, /* Inter's round quotes and flagged one, 2026-09-23 */ titlefinish: 'shine', headitalics: 'serif', headarrival: 'blur', cardlight: 'glow', buttonfinish: 'glow', button: 'ink', toppattern: 'dots', guides: 'dashed', greytint: '10', pageglow: 'soft', movinglight: 'on', effects: { serif: { which: 'last' }, arrival: { scope: 'all' }, cardlight: { level: '75', colour: 'light' }, moving: { where: 'all' }, button: { glow: 'light', sweep: 'on' }, pattern: { level: '50', colour: 'light' }, guides: { level: '50', colour: 'light', marks: 'on' }, pointer: { look: 'on' }, dividers: { look: 'glow' }, topline: { look: 'on' }, picglow: { look: 'soft' } }, colours: { dark: { light: '#9b7cff', second: '#5ad8ff' } }, /* ROUND TWO (Manuel, 2026-09-29: "I would go for those settings, which I have on the lab right now", his line from lab/the-instrument-extras.html): violet Light and cyan Second light, the white button glowing violet, dots, the aurora, moving light, the pointer's light, glowing dividers, the paper's top line, pictures in light, the last word of every heading in Newsreader italic. */ /* THE EXTRAS (Manuel, 2026-09-29, lab/the-instrument-extras.html, "My pick"): titles shine, italics turn serif, headings arrive from a blur, cards are lit from above, the main button glows, dashed guides, a touch of the lime in the greys. The pattern, the aurora and the moving light stay off. */ /* 1.3.312, after the reference's own article page was measured: its headings are 590 and near white over a softer text, its pictures made for the dark page */ preset: 'limelight', roles: { kicker: { italic: false }, head: { weight: 'semibold', leading: 'tight', /* 1.12 x 0.92 = 1.03, the reference's titles sit at 1.0; its weight (590) and tracking (-0.022em) the tile already had, measured 2026-09-23 */ members: { sub: { weight: 'semibold', tracking: 'p1' } } /* the headings inside the article rest bold; the reference's are 590 too. Their spacing half a step open, -0.0125em against the title's -0.025em: the reference's 20-32px headings sit at -0.012em (2026-09-26) */ }, quote: { italic: false }, title: { weight: 'medium' } } /* Inter on both anchors, no pins (2026-09-22) */ },
		/* CATALOGUE (Manuel, 2026-09-24, a written description of a warm editorial product site with its link and its article page: "Can you build a new style out of that?", then "Instrument serif. lets do all 4"). Its article page, measured: headings in a thin high-contrast serif (title 64/64 at -0.05em, section heads 40/45), the text in the same serif at 20/30, every small word in a mono in capitals, a warm cream ground with a dotted grid, hairlines and no shadows, one near-black filled button, links in olive, a highlighter yellow as decoration only. Instrument Serif for the serif (his pick), IBM Plex Mono for the mono. The four switches it needed were built with it: dots, marker, inkbutton, centretitle. */
		{ id: 'catalogue', label: 'Catalogue', space: 'spacious', /* ITS OWN AIR, the reference's open pages (Manuel, 2026-09-25, lab/the-space-of-a-page.html) */ palette: 'neutral', tint: 'green', sans: 'ibm-plex-mono', reading: 'compact', face: 'source-serif-4', leading: 'snug', /* ONE SERIF FOR HEADINGS AND TEXT, as the reference sets its own; SOURCE SERIF 4 for both (Manuel, 2026-09-25: Newsreader on Catalogue and Classic alike "is a bit boring. Let's use another one" of the lab's candidates). Of the three on lab/the-reading-face-for-catalogue.html it is the one that can draw the reference's headline: 96 at weight 300 needs a variable face, and Spectral ships only 400 and 700 (it held the text once, 1.3.442, and clamped the light head to 400 when tried for both). Its flat serifs are the reference's ABC Synt's (+4 % width, +7 % x-height). Newsreader (1.3.443) stays Classic's, so the two styles read apart. 20/30 as the reference. */ justify: false, dropcap: false, rounded: true, corners: 'small', lines: true, line: '20', bold: false, scope: 'article', fills: true, soft: false, /* the reference's text is its full ink and its links keep the olive, which Softer reading text would take away */ pictureframe: true, framewidth: '16', framepattern: 'checker', /* the reference's checkerboard in a wider mat (Manuel, 2026-09-25: "nicer with the checker, not with the dots") */ measure: '84', /* the reference's column holds about 82 letters of Newsreader (684 px at 20) */ widepicture: true, categories: 'above', dots: true, marker: true, button: 'ink', preset: 'vellum', roles: { head: { face: 'source-serif-4', weight: 'light', /* THE REFERENCE'S SIGNATURE, NOT ITS ARTICLE (Manuel, 2026-09-25: "why are we not taking their styles … they have bigger font sizes"): its headline is 96 at 300; its article page sat at 64, which is Classic's own */ size: '112', /* 112 on the slider draws about 96 while the text is Compact */ tracking: 'm2', /* with the head's own -0.025em, the reference's -0.05em */ leading: 'dense', /* 1.12 x 0.85 = 0.95, the reference's 96/90 */ align: 'center', /* the title centred, as the reference's; the headings inside the article stay on the left */ members: { sub: { size: '56', align: 'default' } } /* draws the section heads at about 48 while the text is Compact, the reference's section titles */ }, kicker: { face: 'ibm-plex-mono', caps: true, italic: false, weight: 'medium', size: '14', align: 'center' }, title: { face: 'ibm-plex-mono', caps: true, weight: 'medium' }, quote: { face: 'source-serif-4' } } },
		/* GALLERY (Manuel, 2026-09-26, from a measured style sheet of the reference's
		   product launch page — the white gallery): everything on white, the ink
		   near-black, one blue for links and buttons, the type one sans in two jobs
		   — a huge tight semibold display over a small dense body with negative
		   tracking — big soft corners on cards and pictures, no lines, no shadows,
		   generous air between sections. Drawn with today's dials: neutral pair on
		   the blue tint is its white/ink/blue; Inter stands in for the reference's
		   own face, as the sheet itself suggests; the 80 display at m2/dense is its
		   hero (80/600, -1.2px, 1.05); the centred kicker over the title is its
		   product label; Small reading at snug is its 17/1.47; Large corners are
		   its 28 cards; Lines off keeps the fills and loses the rules, which is its
		   shadowless hairline-sparse page. WHAT THE DIALS CANNOT SAY YET (his
		   question "what new settings would we need", answered in CHANGELOG
		   0.11.105): pill buttons TOGETHER WITH large cards (corners is one step
		   for both), a second blue (links vs filled buttons), and white cards on a
		   grey ground (fills always mix the box DARKER than the paper, never
		   lighter). Arrives hidden, as Instrument did. */
		{ id: 'gallery', label: 'Gallery', space: 'spacious', palette: 'neutral', tint: 'blue', sans: 'inter', reading: 'small', face: 'inter', leading: 'snug', justify: false, dropcap: false, rounded: true, corners: 'large', buttonshape: 'pill', preset: 'gallery', button: 'own', colours: { light: { button: '#0071e3' }, dark: { button: '#0a84ff' } }, /* THE SECOND BLUE (Manuel, 2026-09-26, lab/the-new-dials-on-the-styles.html 1: "yes nice"): the reference's filled button beside its link blue */ /* its own colours (above), not the tint's */ /* the reference's two radii at once: 28 cards, stadium buttons — the ask this switch was built for (2026-09-26) */ lines: false, bold: false, scope: 'article', fills: true, soft: false, widepicture: true, pictureframe: false, categories: 'above', roles: { head: { weight: 'semibold', size: '80', leading: 'tight', /* 1.03 against the reference's 1.05; dense drew 60 on 51 on a guest and a second line would collide (2026-09-26) */ tracking: 'm1', /* -0.0125em, the half step beside the reference's -0.015em; the head's rest was -0.025em */ align: 'center', members: { sub: { size: '40', align: 'default' } } /* the feature statements, 40/600, on the left as the reference's editorial blocks */ }, kicker: { weight: 'semibold', size: '20', tracking: 'p2', italic: false, caps: false, align: 'center' }, title: { weight: 'semibold' }, quote: { italic: false } } },
		/* STORYBOOK (Manuel, 2026-09-26, a measured style sheet of an illustrated
		   agency page: "make a style like this"). Everything on a warm cream paper,
		   a warm near-black ink, one fresh green; one sans in every job, the
		   display huge (140/500, -0.06em, 0.95) over a plain 17/1.5 body; cards and
		   buttons fully soft (50 radius), no lines, no shadows, the depth carried
		   by the step from paper to ground alone. Drawn with today's dials: the
		   Meadow pair is its cream, ink and green (the green darkened by day to
		   hold 5:1 as a link, the reference's own by night); Inter is its face;
		   head 128 at medium, m2 (with the head's own -0.025em, its -0.05 to
		   -0.06), dense (0.95); Small at snug is its 17/1.5; Very large corners
		   (built for it, cards 44 against its 50) + pill buttons are its soft
		   stickers; Lines off. WHAT THE DIALS CANNOT SAY YET: white
		   cards on the cream (fills mix darker, as Gallery found); its decorative
		   yellow and coral (one accent per pair); a closing band in a colour of
		   its own at the foot. Arrives hidden, as Gallery did. */
		{ id: 'storybook', label: 'Storybook', space: 'spacious', palette: 'neutral', tint: 'green', preset: 'meadow', button: 'own', colours: { light: { button: '#ffffff' }, dark: { button: '#ffffff' } }, /* THE WHITE BUTTON (Manuel, 2026-09-26, lab/storybook-goes-green.html, 2): the reference's white "Get a quote"; the coral had gone rust */ sans: 'inter', reading: 'small', face: 'inter', leading: 'snug', justify: false, dropcap: false, rounded: true, corners: 'xlarge', buttonshape: 'pill', lines: false, bold: false, scope: 'article', fills: true, soft: false, widepicture: true, pictureframe: false, categories: 'above', roles: { head: { weight: 'medium', size: '128', tracking: 'm2', leading: 'dense', align: 'center', members: { sub: { weight: 'medium', size: '56', align: 'default' } } /* its section heads, 53/500, on the left */ }, kicker: { weight: 'medium', italic: false, caps: false, align: 'center' }, title: { weight: 'medium' }, quote: { italic: false } } },
		/* SPECIMEN (Manuel, 2026-09-26, a measured style sheet of a biotech
		   research site: "make a style like this"). A near-black green ink, a
		   warm off-white page, one pale lime kept for small signals; one sans at
		   one weight in every job, hierarchy by size and tight spacing alone; a
		   mono in capitals for menus, dates and buttons; hairlines, no shadows.
		   The reference has no article pages of its own (its news links leave
		   for the journals), so its Newsroom was measured instead: the page
		   light (#f7f7f5), the title 140/1.0 at 400 and -0.03em, the intro
		   24/1.2, list titles 22, dates Roboto Mono 14 in capitals, the menus
		   the same with 8 corners, and the light page closing on a pure black
		   footer over 40 rounded corners. Drawn with today's dials: the Lichen
		   pair is its off-white, green-black ink and lime (the lime darkened by
		   day to hold 5.2:1 as a link; by night its own on the ink, 11.5:1);
		   Inter Tight is its face (the sheet's own stand-in) at regular in every
		   role; Roboto Mono is the interface, in capitals on the kicker, the
		   dates and the section titles; head 128 at regular, tight; Small at
		   snug is its 18/1.3; Medium corners are its 8 buttons and 16-20 cards;
		   fine lines at 20; filled buttons in the ink, never the lime.
		   WHAT THE DIALS CANNOT SAY YET: a dark band at the foot with the page's
		   rounded end over it; white cards on the off-white (Gallery's gap 3);
		   a small accent dot before categories; round tags beside square
		   buttons; a title past 128. Arrived hidden, as Storybook did; shown in the panel the same day (Manuel: "show it in the panel"). */
		{ id: 'specimen', label: 'Specimen', space: 'spacious', palette: 'neutral', tint: 'green', preset: 'lichen', sans: 'roboto-mono', reading: 'small', face: 'inter-tight', leading: 'snug', justify: false, dropcap: false, rounded: true, lines: true, line: '20', hairlines: true, bold: false, scope: 'article', fills: true, soft: false, /* the reference's text is its full ink */ button: 'ink', /* its filled buttons are the ink; the lime never fills a button */ darkground: true, /* the reference's light page on its black ground (2026-09-26) */ widehead: true, /* its 140 title runs across the page, not down the text column (2026-09-26) */ widepicture: true, pictureframe: false, roles: { head: { face: 'inter-tight', weight: 'regular', size: '128', leading: 'tight', members: { sub: { weight: 'regular', size: '48' } } /* draws its section statements at about 36 while the text is Small */ }, kicker: { face: 'roboto-mono', caps: true, italic: false, weight: 'regular', size: '16', colour: 'accent' /* THE CATEGORY LINE IN THE ACCENT (Manuel, 2026-09-26, the same sheet, 4): for the reference's accent dot */ } /* about 14 under Small, its mono labels */, small: { caps: true, members: { captions: { caps: false }, author: { caps: false } } }, ui: { members: { masthead: { weight: 'regular' } } }, title: { caps: true, weight: 'regular' } /* quote: { italic: false } until 2026-09-27: it wrote nothing on Architrave, whose stylesheet slants a quote, so its quotes have leaned since it was made; the rest keeps them so */ } },
		/* TERRACOTTA (Manuel, 2026-09-26, a measured style sheet of a coastal
		   café page plus the page itself: "make a style like this", "I specially
		   like those terracotta colors for bg"). A rust field floods the page and
		   cream is its writing; flat colour, no shadows, no gradients. The sheet
		   named a serif for everything; the page itself was checked and says
		   otherwise: a grotesque sans in tracked capitals for menus, labels and
		   headings, a text serif for running copy, a small mono for times and
		   descriptions. Drawn with today's dials: the Corten pair is its rust
		   paper and cream ink by day (4.7:1) with white links (5.1:1), and by
		   night its deeper bordeaux under the same cream (11.4:1) with a pale
		   clay for links (7.0:1); Sandstone is the same world turned over, cream
		   paper and rust writing, for a reader who wants it lighter. Schibsted
		   Grotesk stands in for its sans, Source Serif 4 for its text serif, DM
		   Mono is its own mono. Headings in capitals at semibold, opened to the
		   reference's 0.10em; the kicker the same at regular; dates and small
		   print in the mono. Medium corners are its 14 cards, pill buttons its
		   pill buttons and fields; fine rules at 20.
		   WHAT THE DIALS CANNOT SAY YET: outlined buttons (ours fill); square
		   pictures while the cards keep their corner; a rust field above a cream
		   page on the same side (one paper per side); the line drawings and the
		   title set on a curve. Shown in the panel from its first day (Manuel: "show it in the panel"). */
		{ id: 'terracotta', label: 'Terracotta', space: 'spacious', palette: 'neutral', tint: 'orange', preset: 'corten', button: 'ink', /* THE CREAM BUTTON (Manuel, 2026-09-26, the same sheet, 3): the reference's cream buttons; the outline is round two */ sans: 'schibsted-grotesk', reading: 'small', face: 'source-serif-4', leading: 'snug', justify: false, dropcap: false, rounded: true, corners: 'medium', buttonshape: 'pill', lines: true, line: '20', bold: false, scope: 'article', fills: false, /* flat: two surfaces, no raised boxes */ soft: false, widepicture: true, pictureframe: false, marker: true, markercolour: 'orange', /* the highlighter, the warm apricot pen beside the rust (Manuel, 2026-09-26: "make this the standard for that style") */ roles: { head: { face: 'schibsted-grotesk', weight: 'semibold', size: '56', caps: true, tracking: 'p12', /* +0.125 on the head's own -0.025em = the reference's 0.10em */ leading: 'tight', align: 'center', members: { sub: { size: '28', caps: true } } /* its menu heads, COFFEE & TEA */ }, kicker: { face: 'schibsted-grotesk', weight: 'regular', size: '16', caps: true, tracking: 'p10', italic: false, align: 'center' }, small: { face: 'dm-mono', tracking: 'm2' /* the mono tightened, as its times and temperatures */ }, title: { caps: true, weight: 'regular', tracking: 'p5' } /* quote: { italic: false } until 2026-09-27: it wrote nothing on Architrave, whose stylesheet slants a quote, so its quotes have leaned since it was made; the rest keeps them so */ } },
		/* ZEITUNG, the newspaper style of 2026-09-12, is GONE (Manuel, 2026-09-15:
		   "I don't like the tile"), with Libre Franklin, Noto Serif, the
		   Newsprint pair and the red that were its alone. */
		/* ARCADE, MADE PROPERLY (Manuel, 2026-09-14: "really arcade '80s … the most
		   expressive one … variable fonts, whatever combination you think is
		   cool"): Tourney, wide and black, for the headlines, the marquee over
		   the cabinet; Space Grotesk to read; Kode Mono in capitals for every
		   small word, the scoreboard. The arcade pair, blue by night and by
		   day, one orange. The pictures in the pair's own colours, the CRT;
		   scanlines and a vignette from the style block in style.css. */
		{ id: 'arcade', label: 'Arcade', measure: '60', /* ITS OWN WIDTH, a narrow cabinet screen (Manuel, 2026-09-25, lab/the-tile-widths.html: "all yes") */ palette: 'arcade', tint: 'orange', sans: 'martian-mono', reading: 'default', face: 'geist', leading: 'default', justify: false, dropcap: false, rounded: true, lines: false, bold: false, scope: 'article', fills: true, scanlines: true, vignette: true, pictures: 'duo', roles: { kicker: { face: 'handjet', caps: true, tracking: 'wide', italic: false }, head: { face: 'handjet', weight: 'bold', tracking: 'wide', caps: true }, small: { weight: 'medium', caps: true, tracking: 'wide' }, title: { caps: true, tracking: 'widest' } } /* the scoreboard follows the interface anchor, Martian Mono; the comments now follow it too and the quotes follow Geist, where both had sat on the theme's Inter and Newsreader (2026-09-22; backstage, unjudged) */ }, /* THE MARQUEE IS A PIXEL FACE (2026-09-17 evening): Tourney and Bricolage Grotesque left with the final twelve, so the headlines take Pixelify Sans, which is what an arcade cabinet actually sets its name in, and the reading goes to Geist. The scoreboard stayed Martian Mono when Kode Mono left in the morning; Kode Mono is back in the list but the scoreboard reads well as it is. Arcade is backstage and Manuel has not judged it live, so this is a repointing, not a design. Handjet took Pixelify Sans's place in the list on 2026-09-20 and the headlines went with it. */
		/* TUBE (Manuel, 2026-09-29/30, lab/the-tube.html, from a studio site that draws its whole page in one shader: "this old monitor … old screen scan line style"; then "two styles out of it … the first one Tube like an old TV"). The screen's words in VT323, the terminal's own bitmap face, the headline in the boot screen's bold italic serif drawn crisp; the boot blue by night; a black bezel, scan lines, a colour fringe, the glow, a little grain, a vignette, a soft shimmer, the set switching on with a burst of static when the side changes, the boot screen on the first visit; pictures in pixels. */
		{ id: 'tube', label: 'Tube', palette: 'neutral', tint: 'blue', preset: 'television', sans: 'libre-franklin', reading: 'default', face: 'libre-franklin', leading: 'default', justify: false, dropcap: false, rounded: true, lines: true, line: '60', bold: false, scope: 'article', fills: false, soft: true, button: 'ink', buttonshape: 'rounded', buttonstyle: 'outlined', pictures: 'bw', scanlines: true, scan: '3', glow: true, grain: true, grainlevel: '2', graincrawl: 'moving', vignette: true, vignettelevel: '2', bloom: 'soft', shimmer: 'soft', switchon: 'on', static: 'on', bootscreen: 'card', effects: { glow: { reach: 'headings' }, vignette: { night: 'half' } }, roles: { head: { face: 'league-gothic', weight: 'regular', caps: true, size: '80', leading: 'tight', members: { sub: { size: '40', weight: 'regular' } } }, kicker: { italic: false, caps: true, tracking: 'p12', weight: 'semibold', size: '13' }, small: { caps: true, tracking: 'p12', weight: 'semibold', members: { author: { caps: false, tracking: 'default', weight: 'regular' } } }, title: { caps: true, tracking: 'p12' }, quote: { italic: true } } }, /* A BLACK-AND-WHITE SET (Manuel, 2026-09-30, a day of rounds ending in lab/the-tube.html, his choice of its version B: "I will go with your recommendation … bring that live"). What stood on such a screen was never pixels: every word was a card before a camera, in the bold open faces that survived a soft picture. So: tall narrow capitals for the titles (League Gothic, his pick over a Clarendon), Franklin's gothic for everything that is read (Libre Franklin, with real bolds and italics), two faces and no more. No colour fringe, which is a colour set's fault; no crisp edges, which are a computer's; the glow on the headings only and the reading a touch under full white; the snow alive; a breath of blue in the white (preset Television); round corners, since a tube has no sharp one; pictures in greys; by night the shimmer and the vignette at half; the test card first. Both faces come from the font library, fetched on the owner's first visit. */
		/* BROCHURE (Manuel, 2026-09-30, lab/the-brochure.html, from a studio site that draws its page as an old advertisement: "the second like an old Apple advertisement … both retro but different"; then, the first version live, "super tiny everything. make it similar to the screenshot", and of version B "what you have in the lab looks awesome … bring it to the live panel"). One sturdy text serif for everything, large. The headline a sentence over the whole paper, centred, a medium weight set tight; the categories above it and the date close under it, both italic. The top picture as wide as the headline, the copy under it in one column, paragraphs indented and none spaced, the grain crawling; links plain underlined words, the menu too. Pictures bare on the paper in sepia (the panel's Halftone is a far coarser screen than the lab's fine dots and drowns a dark picture, tried 2026-09-30; it stays a choice). The paper a warm cream, clean: a little grain, the edges yellowed at the very rim, the letters sharp, print's magenta slip on the titles alone, no bend. The site's logo takes the stripes; between two posts six thin stripes with paper between them run across the whole paper (lab round of 2026-10-01: the cat out of the band, gaps between the lines, the reference's softer hues); the page ends on a black plate with the logo, the name in bold italic capitals, the tagline and the copyright line. */
		{ id: 'brochure', label: 'Brochure', palette: 'neutral', tint: 'brown', preset: 'newsprint', sans: 'stix-two-text', reading: 'default', face: 'stix-two-text', leading: 'tight', measure: '68', justify: false, dropcap: false, rounded: true, lines: false, bold: false, scope: 'article', fills: true, /* fills and corners back on (Manuel, 2026-10-01: "no surfaces at all is also looking weird", "in the lab we had rounded corners") */ widehead: true, widepicture: true, categories: 'above', button: 'ink', buttonstyle: 'text', buttonmedium: 'gray', /* Gray, not Text (Manuel, 2026-10-01: under Text the copy-URL and .md pair, the rail squares, the search and the focus eye stood bare beside the grey comments bubble, and their grey hover came out of nothing; "setting that middle button to gray and we got everything back") */ buttonquiet: 'gray', /* the quiet buttons (Next, the comments bubble) show the grey box under the pointer, the same box the icon buttons show; at the rest their hover was a 6 % tint, nothing on cream (Manuel, 2026-10-01: on Weiter "there's no hover at all") */ links: 'underlined', pictures: 'sepia', pictureframe: false, grain: true, grainlevel: '2', /* a step up from 1 (Manuel, 2026-10-01: "we had this nice little gristle in the lab, it looks so plain now") */ graincrawl: 'moving', vignette: true, vignettelevel: '2', vignettereach: '2', edges: 'yellowed', fringe: 'sliptitle', columns: '1', paragraphs: 'indented', rainbow: 'logo', postband: 'rainbow', footband: 'plate', stripes: 'gaps', menuline: 'plain', /* the underline left the rail's menu (Manuel, 2026-10-01: odd on the rail, the hover box is the rail's own) */ legalline: 'on', sitename: 'caps', roles: { head: { face: 'stix-two-text', weight: 'medium', size: '112', tracking: 'm2', leading: 'tight', align: 'center', members: { sub: { size: '40', weight: 'medium', align: 'default' } } }, kicker: { face: 'stix-two-text', italic: true, size: '22', align: 'center' }, small: { face: 'stix-two-text', italic: true, size: '20' }, ui: { size: '18', members: { masthead: { size: '26' } } }, title: { face: 'crimson-pro' }, quote: { italic: true } } }, /* the section titles' face is the wordmark's (sitename caps reads it): Crimson Pro, measured the narrowest bold italic in the library (ELMASTUDIO 145 against the text serif's 164 at 24px, 2026-10-01) */
	];
	/* ORIGINAL ON ARCHITRAVE TOO (Manuel, 2026-09-28: "coherent … no special case for Architrave"): on its own theme
	   Classic is the theme as it is, so it is called what it is everywhere else, Original. On another theme the
	   theme's own look is Original and Classic stays the name of Architrave's look. */
	if (!window.architravePanelGuest) STYLES.forEach(function (s) { if (s.id === 'standard') s.label = 'Original'; });
	/* THE READER'S OWN STYLES (Manuel, 2026-09-14, the designer's colour
	   page; lab sheet the-designers-colour-page): a style saved from the
	   Farbe page is a recipe like the six, snapshot from the tile it was
	   made on, with its colours beside, and lives in this browser. Loaded
	   here, before the stored style is looked up, so a saved style is a
	   style on first paint. */
	var OWN_KEY = 'architrave-own-styles';
	var HIDDEN_KEY = 'architrave-hidden-order'; /* the owner's order for Only visible to you (shown) */
	function hiddenOrder() { try { var l = JSON.parse(localStorage.getItem(HIDDEN_KEY) || '[]'); return Array.isArray(l) ? l : []; } catch (e) { return []; } }
	function readOwn() {
		try { var list = JSON.parse(localStorage.getItem(OWN_KEY) || '[]'); return Array.isArray(list) ? list : []; } catch (e) { return []; }
	}
	function writeOwn() {
		try { localStorage.setItem(OWN_KEY, JSON.stringify(STYLES.filter(function (x) { return x.own; }))); } catch (e) { /* private mode */ }
	}
	readOwn().forEach(function (o) { if (o && typeof o.id === 'string' && /^own-/.test(o.id) && o.label) { liftCentre(o); o.own = true; STYLES.push(o); } });
	/* THE SITE'S STYLES (2026-09-18, inc/site-styles.php; Manuel: "style a
	   new tile and make this the default, visible for everyone seeing that
	   site"). A third kind beside the theme's and the reader's own: records
	   the site's owner published from this panel, printed into every page
	   before this script. They are tiles for everyone and no reader can
	   delete them. THE DEFAULT TAKES STANDARD'S PLACE (Manuel, 2026-09-18:
	   "replaces Standard"): it stands first in the list, where every way
	   back leads, and Standard leaves the tiles on that site. A reader who
	   chose a style keeps it; the default speaks where nothing was chosen. */
	var SITE = { styles: [], 'default': '' };
	var PUBLISH = window.architravePublish || null;
	function baseOf(s) { return (s.own || s.site) ? (s.base || 'standard') : s.id; }
	function takeSite(state) {
		for (var i = STYLES.length - 1; i >= 0; i--) if (STYLES[i].site) STYLES.splice(i, 1);
		SITE = state && typeof state === 'object' ? state : { styles: [], 'default': '' };
		(Array.isArray(SITE.styles) ? SITE.styles : []).forEach(function (o) {
			if (o && typeof o.id === 'string' && /^site-[a-z0-9]+$/.test(o.id) && o.label) { var lb = plainName(o.label); o = liftCentre(plain(o) || {}); o.label = lb; o.site = true; delete o.own; STYLES.push(o); }
		});
		/* ANY STYLE MAY BE THE DEFAULT (2026-09-23): a published one, or one of the
		   built-in ones (Book, Poster …); Classic is the absence of one. */
		var d = STYLES.filter(function (x) { return !x.own && !x.host && (GUEST || x.id !== 'standard') && x.id === SITE['default']; })[0];
		/* ON A GUEST ANY STYLE MAY BE THE DEFAULT TOO (Manuel, 2026-09-24: "I want
		   to make Book or Classic the default theme and Ollie Original should
		   therefore not be the default"). Original is then what no default is, as
		   Standard is on Architrave: a default that is unpublished, or never set,
		   gives the site back to the theme. The default stands first, Original
		   right behind it. This runs again after every write to the route, when
		   the Original tile is already in STYLES; at load it is added after. */
		var host = STYLES.filter(function (x) { return x.host; })[0];
		if (d) { STYLES.splice(STYLES.indexOf(d), 1); STYLES.splice(0, 0, d); DEFAULT = d.id; }
		else DEFAULT = NONE; /* Original is added after this at load; see THE THEME'S OWN LOOK */
		if (host) { STYLES.splice(STYLES.indexOf(host), 1); STYLES.splice(d ? 1 : 0, 0, host); }
	}
	takeSite(window.architraveSiteStyles);
	/* A STYLE IS A LINK (2026-09-18, the day's second release). Two forms:
	   `?style=<id>` names a style this site offers, a published tile or one
	   of the theme's, and opens the site wearing it; `#style=<record>` carries
	   a whole record, base64url of the export, so a look nobody published,
	   a reader's own or an adjusted one, travels too. Opening either puts the
	   style on as a press would and, for a carried record, makes it a tile of
	   the reader's own first, as Paste style… does; the same record already
	   held is not added twice. The address is cleaned afterwards so a reload
	   is an ordinary visit. Read here, before paint, like the stored style. */
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
	/* A record as a tile of the reader's own: the whitelist Paste style… reads
	   through, and the tile already there when the same record was pasted. */
	/* A RECORD FROM OUTSIDE IS PLAIN VALUES ONLY (2026-09-24). A style link, a
	   paste and the site's published list all end up written into the panel's
	   HTML: a name as text, a colour and a slug inside attributes. A value
	   carrying a quote or an angle bracket could close that attribute and open
	   one of its own, so a link someone sent could run a script on this site.
	   No real value has one: slugs, hex and rgb() colours, numbers, switches. A
	   string that does is dropped; a name loses those characters. */
	function plain(v, depth) {
		if (typeof v === 'string') return /[<>"'`\\&]/.test(v) ? undefined : v;
		if (typeof v === 'number' || typeof v === 'boolean') return v;
		if (!v || typeof v !== 'object' || Array.isArray(v) || (depth || 0) > 6) return undefined;
		var out = {};
		Object.keys(v).forEach(function (k) { if (!/^[A-Za-z][A-Za-z0-9_-]{0,47}$/.test(k)) return; var c = k === 'hostFace' && typeof v[k] === 'string' && /^[\w\s,.'"-]{1,200}$/.test(v[k]) ? v[k] : plain(v[k], (depth || 0) + 1); if (c !== undefined) out[k] = c; }); /* a face list keeps its quotes; faceAttr escapes it where it is written */
		return out;
	}
	function plainName(x) { return String(x || '').replace(/[<>"'`\\&]/g, '').trim(); }
	/* CENTRED TITLE BECAME AN ALIGNMENT (2026-09-25, THE ALIGNMENT OF A ROLE). A
	   record, a link, a published style or a tweak that still says
	   `centretitle` is read into the roles here, before any list of known keys
	   can drop it: true is Überschriften and Kategorien centred with the
	   headings inside the article on the left, exactly what the switch drew;
	   a hand-set alignment wins. On a tweak (`style` given) false says the
	   reader turned a style's centring off; on a record false was only written
	   because every export wrote every switch, and means nothing. The tweak's
	   members replace the style's (roleOf), so the style's are copied first. */
	function liftCentre(rec, style) {
		if (!rec || typeof rec !== 'object') return rec;
		/* CORNERS' PILL STEP SPLIT OFF (Manuel, 2026-09-26, "pill buttons with large
		   cards"): pill was the fourth corner step and pinned the cards to medium;
		   it is the switch `pillbuttons` now, riding on any corner size. An old
		   record, link, published style or tweak that says corners 'pill' keeps
		   what it meant: buttons as pills, cards on medium (the old step's rest).
		   A hand-set pillbuttons wins, as ever. Keep this lift: old exports carry it. */
		if (rec.corners === 'pill') { delete rec.corners; if (typeof rec.pillbuttons !== 'boolean') rec.pillbuttons = true; }
		/* PILL BUTTONS BECAME THE BUTTON'S SHAPE (2026-09-26, THE SHAPE ROUND): true
		   is buttonshape 'pill'; false on a tweak is 'cards' (the reader turned a
		   style's pill off); false on a record means nothing. A hand-set shape wins.
		   Keep this lift: old exports carry it. */
		if (rec.pillbuttons !== undefined) { var pb = rec.pillbuttons === true; delete rec.pillbuttons; if (pb) { if (rec.buttonshape === undefined) rec.buttonshape = 'pill'; } else if (style && rec.buttonshape === undefined) rec.buttonshape = 'cards'; }
		/* MAIN BUTTON IN INK BECAME THE BUTTON'S COLOUR (2026-09-26, THE BUTTON'S
		   COLOUR): a record, link, published style or tweak that still says
		   `inkbutton` keeps what it meant: true is button 'ink'; on a tweak false
		   says the reader turned a style's ink button off, so 'accent'; on a
		   record false was written because every export wrote every switch, and
		   means nothing. A hand-set button wins. Keep this lift: old exports carry it. */
		if (rec.inkbutton !== undefined) { var ib = rec.inkbutton === true; delete rec.inkbutton; if (ib) { if (rec.button === undefined) rec.button = 'ink'; } else if (style && rec.button === undefined) rec.button = 'accent'; }
		/* CATEGORIES ABOVE THE TITLE BECAME A PLACE (2026-09-27, the text marks): a
		   record, link, published style or tweak that still says `kickerabove`
		   keeps what it meant: true is categories 'above'; on a tweak false says
		   the reader moved a style's categories back under the title, so
		   'below'; on a record false means nothing. A hand-set place wins. Keep
		   this lift: old exports carry it. */
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
		if (data.effects && typeof data.effects === 'object') { var fx0 = effectsOf({ effects: data.effects }, null); if (Object.keys(fx0).length) entry.effects = fx0; } /* only known details, only off their rest */
		if (data.colours && typeof data.colours === 'object') entry.colours = data.colours;
		var shape = function (x) { var c = {}; Object.keys(x).forEach(function (k) { if (k !== 'id') c[k] = x[k]; }); return JSON.stringify(c); };
		var had = STYLES.filter(function (x) { return x.own && shape(x) === shape(entry); })[0];
		if (had) return had;
		STYLES.push(entry); writeOwn();
		return entry;
	}
	/* What the tiles offer: the reader's own, the site's, and of the theme's
	   the finished ones, Standard only while no site style stands in for it. */
	/* THE READER'S THREE (Manuel, 2026-09-23: readers get the small panel "and
	   maybe 3 styles to choose from, like a browser reader … the owner picks
	   them"; the same on every site, elmastudio.de included, and no way through
	   to Customise). `architravePanelReader` is printed for everyone who may not
	   publish (inc/site-styles.php). A reader is offered the site's own look,
	   which is the theme's on a guest and the site default or Standard on
	   Architrave, and the two the owner picked (readerPicks, below, for the
	   two before the owner has picked). The owner sees everything, as before. */
	var READER = !!window.architravePanelReader;
	function readerPicks() {
		if (SITE && Array.isArray(SITE.readers)) return SITE.readers.filter(function (id) { return typeof id === 'string'; }); /* AS MANY AS THE OWNER LIKES (Manuel, 2026-09-23: "make it choosable more than 2, as much as the user likes to show"); two until then */
		/* Until the owner picks: on a guest, two of the public four (Book is
		   not public any more, 2026-09-25); on Architrave, where Standard IS
		   the site's own, Book and Instrument as before. */
		return (window.architravePanelGuest ? ['standard', 'instrument'] : ['standard', 'book', 'instrument']).filter(function (id) { return id !== DEFAULT; }).slice(0, 2);
	}
	/* THE PUBLIC FOUR (Manuel, 2026-09-25, before wordpress.org): on another
	   theme a fresh site offers only the finished looks — Classic, Matrix,
	   Instrument, Catalogue — beside the theme's own. The rest stay in
	   STYLES, unseen by anyone there until they are ready ("I'm still
	   developing them … once they're finished I want to make them join the
	   others"): a saved choice and a link still find them, so nothing a
	   reader kept ever breaks, and promoting one is adding its id here.
	   Architrave is Manuel's own site and shows him everything, as before. */
	var PUBLIC = ['standard', 'terminal', 'instrument', 'catalogue', 'gallery', 'tube', 'brochure']; /* Gallery promoted 2026-09-26 (Manuel, "keep going"), after its fixes were judged on TT5 */
	function offered(p) {
		if (READER) return !!(p.host || p.id === DEFAULT || readerPicks().indexOf(p.id) !== -1);
		/* AND WHAT THE SITE ALREADY SHOWS ITS READERS (2026-09-25: Book stood on
		   Twenty Twenty-Five's "On your site" from before the public four, its tile
		   was drawn and a press on it found no button, so it did nothing). A choice
		   the site made keeps working, as the public four promise; a fresh site
		   still meets only the four. */
		if (window.architravePanelGuest && !(p.host || p.own || p.site || p.id === DEFAULT || PUBLIC.indexOf(p.id) !== -1 || readerPicks().indexOf(p.id) !== -1)) return false;
		/* THE OWNER SEES EVERY STYLE (Manuel, 2026-09-23: "make all styles visible
		   on elmastudio again"). SHOWN below was what elmastudio.de offered its
		   readers; readers have their own three now, chosen on For readers, so the
		   short list has nothing left to protect and whoever may publish gets the
		   whole row, Standard included beside a site default. The dead branches
		   that used to follow (SHOWN, the guest case, the backstage door) left
		   with the door on 2026-09-25; SHOWN itself still says what the rail's
		   Style menu offers below. */
		return true;
	}
	/* >>> THE LIST'S TABLES, GENERATED (tools/settings-list.mjs, from plugin/settings.json) */
	/* Do not edit between the markers: change plugin/settings.json and run `node tools/settings-list.mjs`,
	   which writes this block and then the list again from the running code; --check fails when they part. */
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
	/* <<< THE LIST'S TABLES */
	/* THE QUOTE'S SLANT RESTS WHERE THE THEME PUTS IT (2026-09-27, found by the new
	   window's check): Architrave sets its quotes in italic, so its rest is italic and the
	   switch reads on; it read off while every quote on the page leaned, and turning it
	   off could never stand one upright. A stranger's theme sets its own (Twenty
	   Twenty-Five's stand upright), so there the rest stays off and the theme's own shows. */
	if (window.architravePanelGuest) ROLE_DEFAULT.quote.italic = false;
	/* DIALS: the list's tables above (plugin/settings.json). */
	/* ROUNDED CORNERS joined 2026-09-11 (Manuel: square corners "could be a
	   setting … on the other styles as well, but not by default"): on
	   everywhere but Terminal, whose text-mode box has no rounded corner. */
	/* LINES joined 2026-09-12 (Manuel: Terminal's line work "could also be a
	   setting that could turn on and off, and it could be applied to all
	   the others as well"): on in Terminal's recipe, off elsewhere. */
	/* BOLD TEXT joined 2026-09-12 (Manuel, from Books' own switch: "that's an
	   individual toggle, so would we need something as well?"): the body and
	   the meta at 500, headlines untouched; Clear rests on, the others off. */
	/* FILLS joined 2026-09-12 (Manuel): the resting fills of cards, fields,
	   buttons and squares; off, the lines alone draw them. Terminal rests
	   off, the rest on; lines and fills are independent now. */
	/* WIDE LETTERS joined 2026-09-12 (the reader's side, as Books' character
	   spacing): the reading text tracked and word-spaced a little; every
	   style rests off. */
	/* SCANLINES AND GLOW joined 2026-09-19 (Manuel: "Make scan lines their own
	   switch and make a glow setting as well"): the cabinet's glass was
	   Arcade's alone, tied to data-style; it is a switch of the page now, on
	   in Arcade's recipe and off elsewhere, and any style may wear it. Glow
	   is a soft light around the letters in their own ink, an old screen's;
	   every style rests off. It shows by night; on a pale paper a dark ink
	   has no light to give. */
	/* widehead joined 2026-09-26 for Specimen (Manuel: "that big font has to be wider … a quite short headline for four lines, that's not good"): the title, the categories and the date line take the wide picture's width */
	/* darkground joined 2026-09-26 for Specimen (Manuel: "yes" to a dark band at the foot; Architrave has no foot, so it is the ground around the paper): see THE DARK GROUND below */
	/* inkbutton left 2026-09-26 for the pick `button` (THE BUTTON'S COLOUR); liftCentre reads it still */ /* OPTS: the list's tables above (plugin/settings.json). */ /* pillbuttons left 2026-09-26 for the pick `buttonshape` (THE SHAPE ROUND); liftCentre reads it still. tagsfollow joined the same day */ /* hairlines joined 2026-09-26, the reference's half-pixel lines for Instrument; only with Lines on */ /* pillbuttons joined 2026-09-26, split out of the corners dial's pill step (liftCentre) */ /* centretitle left on 2026-09-25 for the roles' alignment (liftCentre) */ /* dots, marker, inkbutton and centretitle joined 2026-09-24 for Catalogue (Manuel: "lets do all 4"); soft joined 2026-09-21 (lab/the-heading-colour.html, way B): the reading text a step toward the paper, headings, bold words and links at the ink; every style rests off but Instrument */ /* grain, the paper's own, joined the same evening (LEVELS `grainlevel`); every style rests off */ /* scanlines and glow joined 2026-09-19 (below); Arcade rests on scanlines, every other style off */ /* the two picture switches joined 2026-09-19; every style rests off */ /* bold left 2026-09-13: it is Lesetext's weight now (ROLES) */ /* wide left 2026-09-13: character spacing is a dial now (TRACKING) */ /* hyphens left the list 2026-09-12: it follows justify (below) */
	/* THE TINT (Manuel, 2026-09-12: "colors should be apple colors. what would
	   apple do?"): Apple's accent-colour row, Multicolor first meaning the
	   app's own, then eight named colours. Here 'default' is the pair's
	   own accent and the eight are Apple's system colours; a choice is a
	   tweak of the style, stamped as data-tint before paint, gone on reset.
	   Named by the theme, ahead of QDS, which takes them later. */
	/* THE SITE'S OWN THREE (Manuel, 2026-09-12, after a morning with Apple's
	   eight: "we need to have our already used colors in the accent list,
	   so take the others which are not part of any default out"): the
	   purple Standard and Poster rest on, Book's brown, Terminal's green.
	   Every style names one in its recipe, the row marks it, and a reader
	   may move a style onto another; the accent is the style's own dial
	   now, not the pair's, so Standard moved onto Paper stays purple. */
	/* TINTS: the list's tables above (plugin/settings.json). */ /* orange: the arcade's (2026-09-14) */ /* red, the newspaper's, went with it (2026-09-15) */ /* blue, Persona's, back for Poster (Manuel, 2026-09-12: "a fourth color for plakat, the blue back again") */
	/* A PRESET SETS ALL THREE (Manuel, 2026-09-16: "I want to reverse that step
	   where we said the accent should not be part of the preset … A preset
	   consists of three things: the paper, the ink and the accent. Therefore
	   if I choose a preset, all three are set"). The fifteen authored pairs
	   carry their accent in their own table; the five modes carry theirs here,
	   the tint each was drawn with, which is the accent Standard, Book, Klar,
	   Terminal and Arcade have always worn. */
	var PAIR_TINTS = { neutral: 'purple', paper: 'brown', grey: 'blue', terminal: 'green', arcade: 'orange' };
	function tintOf() {
		var s = byId(current), tw = readTweaks()[current];
		if (tw && TINTS.indexOf(tw.tint) !== -1) return tw.tint;
		return (s && s.tint) || TINTS[0];
	}
	function applyTint() { var v = tintOf(); if (root.getAttribute('data-tint') !== v) root.setAttribute('data-tint', v); }
	/* THE INTERFACE FACE (Manuel, 2026-09-12: "we can choose between the
	   reading font and the meta font … so we could individually combine
	   each font with one another"): the sans around the writing, the rail,
	   the dates, the panel, was each style's own in the stylesheet; it is
	   a dial now, stamped as data-sans before paint from the recipe or the
	   reader's tweak, the reading face's twin. */
	/* ONE LIST FOR EVERY ROLE (Manuel, 2026-09-13: "all those fonts are
	   available in all locations"; the serifs were kept off the interface
	   until the roles' dials could make any face work anywhere). */
	/* THE SAME TWELVE THE ARTICLE HAS (2026-09-13: "all those fonts are
	   available in all locations"), in the same order and the same four groups —
	   one list, so Oberfläche cannot offer a face Überschriften does not. */
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
		/* A PICK UNDER A GUEST'S OWN LOOK IS A PICK EVEN WHEN IT IS OUR REST (see setRole): stamped so the guest sheet spends it. */
		var own = window.architravePanelGuest && !isLook(current) && (readTweaks()[current] || {}).sans !== undefined;
		if (own) root.setAttribute('data-sans-own', ''); else root.removeAttribute('data-sans-own');
	}
	/* THE ROLES OF TYPE (Manuel, 2026-09-13; lab/the-roles-of-type.html:
	   "the question is always which font to apply to which area"). Five
	   roles a page has, each with the same dials: the face, the weight, a
	   size step, the character spacing, capitals. Überschriften is the
	   titles and the headings and the kicker under the title; Lesetext the
	   article's paragraphs (its face is the Artikel dial, its size the
	   reader's stepper, so those two are not repeated here); Kleintext the
	   dates, categories, captions and tags; Oberfläche the rail, the menus,
	   the buttons, the cards (its face is the Oberfläche dial); Titel der
	   Oberfläche the section and group titles. A recipe names only what
	   differs from Standard; a reader's press is a tweak of the style like
	   every dial. The values are written on <html> as custom properties
	   before paint, one mechanism for every role. */
	/* KOMMENTARE, A ROLE OF ITS OWN (Manuel, 2026-09-17: "a commenter's name is
	   part of the article but not the comment itself. That doesn't make sense
	   to me"). It did not: the name was Nebentext's and the words were
	   Oberfläche's, so one comment was set by two roles and neither of them
	   was about comments. A comment is a body of text somebody reads for
	   minutes, which is what deserves its own face, weight, size and line
	   spacing; Oberfläche goes back to meaning the buttons and the menus. The
	   role takes the name, the words, the reply link, the form and the two
	   titles over them (style.css, KOMMENTARE). */
	/* ROLES: the list's tables above (plugin/settings.json). */ /* quote: Zitate, the sixth, 2026-09-15; comment: Kommentare, the eighth, 2026-09-17 */
	/* ROLE_DEFAULT: the list's tables above (plugin/settings.json). */
	/* EVERY ROLE CARRIES EVERY DIAL (Manuel, 2026-09-17): the same six
	   settings on every row, and the four spacings — Größe, Zeilenabstand,
	   Laufweite, Wortabstand — on all of them. Wortabstand was Fließtext's
	   alone since 2026-09-15; it is every role's now, written as
	   --<role>-words beside --<role>-tracking in style.css. Fließtext keeps
	   its own two tokens (--reading-tracking, --reading-word-gap), which
	   reach the article's whole content and not one selector. */
	/* TWO VOICES, NOT EIGHT (Manuel, 2026-09-22: "if we do it we should do it
	   coherently … what about the categories and the other stuff? … let's
	   think it through coherently"). A page has the article's voice and the
	   site's, and every role already rested on one of them; Zitate said so
	   ('inherit') and the others named the face the anchor happened to be,
	   which is why one row read "same as" and the next read "Newsreader".
	   Now two roles are ANCHORS, Fließtext (data-face) and Oberfläche
	   (data-sans), and the six others are FOLLOWERS: a follower's face is
	   'read' or 'ui', the anchor it follows, or a face of its own, a pin.
	   At rest every follower follows, so one press on Schriftart changes
	   the whole article, and a tile pins a face on a role where it means
	   to (Blueprint's headlines in JetBrains Mono over a Plex Sans text).
	   Only the FACE follows: weight, size, spacing, case and slant are the
	   role's own, because "the title is bold" is a decision about the
	   title. This reverses A FACE A DIAL CANNOT MOVE (style.css,
	   2026-09-17) with its eyes open: the fault then was rows that FOLLOWED
	   AND SAID A NAME; a row that says "Same as interface" is honest. */
	/* head: 64 is the article TITLE's own size, which is what the slider names (2026-09-17) */
	/* quote: at rest the quote reads in the reading face and keeps the stylesheet's italic */
	/* kicker: THE CATEGORY LINE (Manuel, 2026-09-15: "part of the initial design … not the same style as the date"); at rest it reads in the article's voice, italic */
	/* comment: the rest is where --text-comment-body already stood: three rungs under the reading */
	/* ui: members: the role's family, see THE MEMBERS OF A ROLE */
	/* Every face the theme ships, by the family theme.json registers. */
	var FAMILY = {
		/* INTER IS --face-inter AND NOT THE font-sans PRESET. The Oberfläche dial
		   rewrites that preset, so a role stamped with it did not mean Inter, it
		   meant "the same as Oberfläche" — and Nebentext, Kommentare and
		   Abschnittstitel followed that row until the reader set them
		   (style.css, A FACE A DIAL CANNOT MOVE, 2026-09-17). */
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
		'plex-mono': 'var(--wp--preset--font-family--font-jetbrains-mono)', /* a style saved in the few hours Plex Mono was here still finds a face */
		doto: 'var(--wp--preset--font-family--font-doto)',
		vt323: 'var(--wp--preset--font-family--font-vt-323)',
		handjet: 'var(--wp--preset--font-family--font-handjet)'
	};
	var SERIFS = ['newsreader', 'libre-baskerville', 'vollkorn'];
	/* THE FACES THAT SHIP AN ITALIC (theme.json's font faces; Manuel,
	   2026-09-13: italic or regular is a font setting too). The others would
	   only be slanted by the browser, so the switch is not offered for them. */
	/* THE FACES THAT SHIP AN ITALIC, and it is the SHIPPED FILE that decides,
	   not the family: each of these has a matching -italic woff2 in
	   assets/fonts/webfonts. The others would only be slanted by the browser,
	   so the switch is not offered for them (2026-09-13). */
	var ITALICS = ['newsreader', 'libre-baskerville', 'vollkorn', 'geist', 'plex-sans', 'jetbrains-mono'];
	function hasItalic(face) {
		face = realFace(face); return ITALICS.indexOf(face) !== -1; }
	/* THE WEIGHT IS THE FACE'S (Manuel, 2026-09-13: "not all of them have the
	   same possibilities"): five names on one ladder, and a face offers
	   the ones inside its own range, from theme.json's font faces. A
	   weight a face cannot set falls to its nearest. */
	/* THE NINE WEIGHTS, named as the type world names them (Manuel,
	   2026-09-13: "there's no font weight called lighter"): Google Fonts'
	   ladder, 100 to 900. A face offers the ones inside its own range. */
	var WEIGHT = { thin: 100, extralight: 200, light: 300, regular: 400, medium: 500, semibold: 600, bold: 700, extrabold: 800, black: 900 };
	/* The names of 1.1.942, as older tweaks may still say them. */
	/* WEIGHT_ALIAS: the list's tables above (plugin/settings.json). */
	/* EVERY RANGE READ OFF THE SHIPPED FILE'S fvar TABLE (2026-09-17), not off a
	   specimen page: Bodoni Moda starts at 400 and has no light weights at all,
	   and a ladder that offers one it cannot set is a ladder that lies.
	   Workbench has NO wght axis — its two are a bleed and a scanline — so its
	   range is empty and the weight row disables itself, as Kursiv does on a
	   face without one. */
	var RANGE = { inter: [100, 900], hyperlegible: [200, 800], geist: [100, 900], newsreader: [200, 800], 'libre-baskerville': [400, 700], vollkorn: [400, 900], mono: [100, 900], 'martian-mono': [100, 800], 'kode-mono': [400, 700], 'plex-sans': [100, 700], 'jetbrains-mono': [100, 800], doto: [100, 900], vt323: [], handjet: [100, 900] }; /* Doto replaced Workbench (2026-09-18); VT323 and Handjet replaced Geist Pixel and Pixelify Sans (Manuel, 2026-09-20). VT323 is one weight, as Geist Pixel was, so its row greys out */
	/* A ROLE THAT FOLLOWS AN ANCHOR (2026-09-16; both anchors since 2026-09-22):
	   'read' and 'ui' are not faces of their own, so everything that asks
	   about a face resolves them first. 'inherit' is the word 'read' went by
	   until 2026-09-22 and a style saved before then may still carry it. */
	/* FOLLOW_ALIAS: the list's tables above (plugin/settings.json). */
	function isAnchor(face) { return face === 'read' || face === 'ui'; }
	function realFace(face) {
		face = FOLLOW_ALIAS[face] || face;
		if (face === 'read') return root.getAttribute('data-face') || 'newsreader';
		if (face === 'ui') return root.getAttribute('data-sans') || 'inter';
		return face;
	}
	/* What a follower's token is set to: the anchor's own token, so the
	   stylesheet follows the anchor wherever it goes, or a pinned family. */
	function faceValue(face) {
		if (face === 'read') return 'var(--font-reading)';
		if (face === 'ui') return 'var(--font-sans)';
		return FAMILY[face] || FAMILY.newsreader;
	}
	/* THE LIBRARY (2026-09-23): seventy-four faces more, from
	   window.ArchitraveFontLibrary (tools/font-library.py), on every list the
	   fifteen are on. A library face's family is its stack itself, not a preset
	   variable: they are not given to WordPress as theme data. A static face
	   says its exact cuts (`weights`, Space Mono's 400 and 700), so the weight
	   row offers those two and not a Medium the file cannot draw. */
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
		/* A FACE WITH NO WEIGHT AXIS AT ALL (Workbench, 2026-09-17): there is
		   nothing to fit to, so the role keeps the weight it had and gets it back
		   the moment another face is chosen. Without this the nearest-weight
		   search reads ok[0] off an empty list and the role's weight becomes
		   undefined, which reaches the stylesheet as the string "undefined". */
		if (!ok.length) return w;
		if (ok.indexOf(w) !== -1) return w;
		var want = WEIGHT[w] || 400, best = ok[0];
		ok.forEach(function (k) { if (Math.abs(WEIGHT[k] - want) < Math.abs(WEIGHT[best] - want)) best = k; });
		return best;
	}
	/* THE FULL RANGE (Manuel, 2026-09-13: "we always need the full range",
	   for a terminal look whose titles read at the text's size): nine
	   factors from half to one and a half, and for Überschriften a first
	   stop, 'text', that sets the title and every heading to the reading
	   text's own size. The ids are the percentages. */
	/* A STEP IS A RUNG, NOT A PERCENTAGE (Manuel, 2026-09-16: "what would apple
	   do?" — Dynamic Type walks one curated ladder of real sizes, and no
	   element is scaled by a free factor). Each role has a base, the size it
	   ships at, and a list of rungs off the system's scale; a step writes the
	   factor rung ÷ base, so the role's own element lands exactly on that
	   rung and everything else under the role keeps its relation to it.
	   Nothing moves at rest: the base IS the resting size. */
	/* A ROLE'S BASE IS THE ELEMENT THE NUMBER NAMES. A step writes rung ÷ base,
	   so exactly one element per role lands on the number the slider says and
	   everything else under that role keeps its relation to it.

	   ÜBERSCHRIFTEN NAMES THE TITLE, NOT THE H1 (Manuel, 2026-09-17). It was 44,
	   the h1's size, so the article title — 64 at rest, the biggest thing on the
	   page and the thing a reader is looking at while dragging — came out 45%
	   over the number: 72 on the slider, 104 on the page. Nobody noticed while
	   the ladder ran 28 to 72 and every stop was near the title's own size; at
	   12 to 72 it is the first thing you see. No shipped style names a head
	   size, so nothing moves and there is nothing to migrate.

	   KOMMENTARE KEEPS 16, the size a comment reads at under the article, and
	   knowingly: with the frame on the comments stand in their own column at 13,
	   so there is no single number that is right in both places. Trading one
	   wrong number for another buys nothing. */
	var ROLE_BASE = { head: 64, read: 22, quote: 26, kicker: 26, small: 16, comment: 14, ui: 13, title: 11 }; /* comment 14 since 2026-09-19: one rest on both sides */
	/* THE MEMBERS OF A ROLE (Manuel, 2026-09-18; lab/the-members-of-a-role.html).
	   Oberfläche's one number names the menus and the buttons, the family's
	   lead, and four more sizes follow it in their order: the masthead above,
	   the card titles, the labels and the credit line below. That is how the
	   role always worked — one dial, five sizes in a hierarchy — and it is
	   what Manuel asked to keep by default ("one size, one role … unless we
	   could have another setting which binds some of them together and I
	   could unbind them on purpose").

	   So a member is BOUND unless the style says otherwise: it reads at its
	   resting size times the lead's factor, and the record does not mention
	   it. Released, it carries its own size, a rung of the interface ladder:
	   roles.ui.members.masthead = { size: '20' }. Absence is the binding, as
	   it is for the colour sides (`unlinked`). The stylesheet reads each
	   member through its own token with the lead's as the fallback
	   (--ui-size-masthead, var(--ui-size)), gated on data-ui-members so a
	   released member moves while the lead rests.

	   `rest` is the member's size at Standard's rest, read from the browser
	   (2026-09-18), which the panel multiplies by the lead's factor to say
	   the number a bound member reads at. The card titles rest at the base
	   size, the lead's own; they are a member because they are a different
	   set of things (the rail's rows, the related rows, the search results,
	   the newsletter door, the link card's name line, the ruler's label),
	   not because they were a different number.

	   `weight` is the member's resting weight, read from the browser the same
	   day (Manuel, 2026-09-18, on a bound row saying Bold over a semibold
	   heading: "fix the small lie"): a bound row says this until the role's
	   own weight dial moves, because that is what the element reads at. The
	   nearest named weight stands for the room's 420/440 body weight. */
	/* MEMBERS: the list's tables above (plugin/settings.json). */
	/* ui.masthead: 20 since 2026-09-19, a rung over the large card titles */
	/* ui.linkcard: the link card's title, back from Fließtext (2026-09-18): one member, one size, and 18 is its own; the theme card's title joined it the same night */
	/* ui.newsletter: the newsletter door's title, text and words; they rest at 16 and were filed under the card titles at 13 (the audit, 2026-09-18) */
	/* ui.fields: the search field; it rests at the base size and grows to 16 on a touch screen alone (the iOS zoom rule), which the number here does not show */
	/* ui.labels: 11 since 2026-09-19: the 12 rung is gone */
	/* head.sub: the headings inside the article, h1 to h6, a ladder that moves as one; 36 is h2's */
	/* small.date: the article's date line */
	/* small.author: the author's name and bio under the article (Manuel, 2026-09-18: "there should be a difference between the little categories and tags, and author name and bio"); the name rests a weight up, at medium */
	/* small.terms: the categories and tags lines at the article's end */
	/* small.captions: under the pictures, and the quote's source */
	/* small.carddates: the dates on the rail's rows, the related rows, the cards */
	/* small.release: the version line and the archive banner on a theme's release post (2026-09-18: they read at 22 by an old accident, 16 is what release-post.css always stated) */
	/* comment.name: the commenter's name, a weight up at rest; in the frame's column it rests a rung under the words */
	/* comment.small: dates and reply links */
	/* comment.form: the form's labels, notes and buttons */
	/* read.excerpts: the excerpts on the front page's cards; Gilt für binds them to the paragraphs, a release gives them a size of their own either way */
	/* read.boxes: paragraphs and buttons in a box with a background inside the article (Manuel, 2026-09-18: "those are a little big?"): a note in a box is an aside, so it rests a size under the paragraph, at the interface's 18 */
	/* title.years: the archive's year titles, at 16 under a dial that rests at 11 (the audit, 2026-09-18) */
	/* title.release: the titles over a release post's demo and download buttons */
	/* THE FOUR DIALS A RELEASED MEMBER MAY CARRY (Manuel, 2026-09-18: "do all of
	   that"): its size, its weight, its capitals, its character spacing. Each
	   is released on its own; a member with none is bound and absent from the
	   record. The stylesheet reads a released dial through a token of the
	   member's own (--ui-weight-masthead) under an attribute of its own
	   (data-ui-m-masthead-weight); see THE MEMBERS' OVERRIDES at the end of
	   style.css. */
	var MEMBER_DIALS = ['size', 'weight', 'caps', 'tracking'];
	/* THE ALIGNMENT OF A ROLE (Manuel, 2026-09-25: centring "should be like how
	   its text is aligned … left, centred, right-aligned … would cover us in the
	   future"). A dial of the two roles that open a piece, Überschriften and
	   Kategorien, where ROLE_DEFAULT carries `align`; 'default' is the theme's
	   own, the start, and writes nothing. It replaced the switch `centretitle`
	   (liftCentre below). Überschriften's member `sub`, the headings inside the
	   article, can keep an alignment of its own, so a centred title stands over
	   headings on the left. Reading text keeps Justified text instead, and the
	   date row is nobody's to centre. */
	var ALIGN = { 'default': 'start', center: 'center', right: 'right' };
	var ALIGNS = Object.keys(ALIGN);
	/* THE COLOUR OF A ROLE (Manuel, 2026-09-26, lab/the-heading-colour-2.html, A:
	   "go with your recommendation"; round one of the settings plan). A dial of
	   the same two roles: the headings and the category line wear the ink (the
	   rest, writes nothing), the accent, or a colour of their own, a well per
	   side (`colours.<side>.head`, `colours.<side>.kicker`, edited as paper and
	   ink are, picked from the accent's twenty, never Custom). The token is
	   `--<role>-colour`, written off the rest as var(--accent) or the well's
	   token; style.css spends it on the role's elements and their links. */
	/* ROLE_COLOURS: the list's tables above (plugin/settings.json). */
	function memberDialsOf(role) { return ROLE_DEFAULT[role] && ROLE_DEFAULT[role].align !== undefined ? MEMBER_DIALS.concat('align') : MEMBER_DIALS; }
	function membersOf(role) { return MEMBERS[role] || []; }
	/* ONE LADDER, AND EVERY ROLE GETS ALL OF IT (Manuel, 2026-09-17: "for the
	   font size setting in general, do we make always the max amount of possible
	   settings available? That regards all typo rows").

	   It answers a question the eight short ladders never did: WHO decided that
	   Abschnittstitel stops at 16 and Zitate cannot go under 18? Nobody, on the
	   day each list was typed. Each was a guess at the sizes that role would
	   plausibly want, and a guess in a dial's range is a wall the reader walks
	   into with no way through and no reason given.

	   So: the union of all eight, which is every size the theme's scale names,
	   11 to 72, and every role offers all of it. A role still RESTS at its own
	   size (ROLE_BASE) and the slider still opens there; it just no longer stops
	   early. The same argument as the weights on 2026-09-13 ("we always need the
	   full range").

	   The stops are real sizes and not percentages, which is why one list works
	   for a 72 and an 11 alike: the dial writes rung ÷ base, so each role lands
	   exactly on the number the slider says. */
	/* THE ONE PLACE A ROLE'S LADDER STILL STOPS SHORT is the floor the system
	   sets, and it is not a guess: DS-059 says anything read as content stays at
	   12 and true 11 belongs to interface chrome (style.css, --text-floor-content
	   and --text-floor-ui). A content role offered an 11 that the floor then
	   clamped to 12 — the slider said one number and the page showed another,
	   measured live. So the two interface roles start at 11 and the six content
	   roles at 12, which is the rule written as a ladder rather than fought. */
	var ALL_RUNGS = [12, 13, 14, 16, 18, 20, 22, 24, 26, 28, 32, 36, 40, 44, 48, 56, 64, 72];
	var UI_RUNGS = [11].concat(ALL_RUNGS);
	var ROLE_RUNGS = {};
	['head', 'read', 'quote', 'kicker', 'small', 'comment'].forEach(function (r) { ROLE_RUNGS[r] = ALL_RUNGS; });
	/* ÜBERSCHRIFTEN GO ON PAST 72 (Manuel, 2026-09-18: "sometimes I wanted to have it even bigger"). Until 1.3.203 the head's base was 44, so 72 on the slider drew the title at 104; the base is the title's 64 now and the number is true, which took the top third of the range with it. Four rungs above the scale, for the one role that is a title. */
	ROLE_RUNGS.head = ALL_RUNGS.concat([80, 96, 112, 128]);
	['ui', 'title'].forEach(function (r) { ROLE_RUNGS[r] = UI_RUNGS; });
	/* The nine percentages of every style saved before today, and the five
	   letters before them, read as the nearest rung of the role they are on. */
	var PERCENTS = { '50': 50, '65': 65, '80': 80, '90': 90, '100': 100, '110': 110, '120': 120, '135': 135, '150': 150, xs: 80, s: 90, m: 100, l: 110, xl: 120 };
	function rungFor(role, v) {
		var rungs = ROLE_RUNGS[role] || ROLE_RUNGS.read;
		if (v === 'text') return String(ROLE_BASE[role] || ROLE_BASE.read); /* the retired stop, read as the role's own size (2026-09-17) */
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
	/* NO "WIE FLIESSTEXT" STOP (Manuel, 2026-09-17: "that is a setting 'wie
	   Fließtext' I don't want. Make the px value instead"). It was the head's
	   first stop since 2026-09-16 — one stop on a ladder of numbers that was not
	   a number, and the one thing on the slider that made Überschriften follow
	   another row. Every stop is a size now, on every role. A style saved with
	   it reads as the head's own resting size (rungFor). */
	function sizesFor(role) { return (ROLE_RUNGS[role] || ROLE_RUNGS.read).map(String); }
	/* SEVEN STOPS, NORMAL IN THE MIDDLE (Manuel, 2026-09-13: "normal should
	   sit in the middle"): three tighter, three wider. */
	/* THIRTEEN STEPS, THE SAME WAY IN BOTH DIRECTIONS (Manuel, 2026-09-16: "we
	   can go up to +10%, but only down to -7.5%. That doesn't make sense
	   either … maybe up to +15% and -15% in both directions"). The ids are
	   the number they set, so the slider, the stylesheet and the saved style
	   all say the same thing; the old names still resolve (TRACK_ALIAS). */
	/* Four more at each end (Manuel, 2026-09-18: "a little bit more values"): the ladder runs -0.25em to 0.25em. */
	var TRACK = { m25: '-0.25em', m22: '-0.225em', m20: '-0.2em', m17: '-0.175em', m15: '-0.15em', m12: '-0.125em', m10: '-0.1em', m7: '-0.075em', m5: '-0.05em', m2: '-0.025em', m1: '-0.0125em', 'default': '0', p1: '0.0125em', p2: '0.025em', p5: '0.05em', p7: '0.075em', p10: '0.1em', p12: '0.125em', p15: '0.15em', p17: '0.175em', p20: '0.2em', p22: '0.225em', p25: '0.25em' }; /* the half steps either side of normal joined 2026-09-26: the reference behind Instrument sets its 20-32px headings at -0.012em, halfway between the heading's tight rest and normal, which no whole step could reach. Letter spacing only; word spacing keeps its steps. */
	/* TRACK_ALIAS: the list's tables above (plugin/settings.json). */
	/* WORDS_ALIAS: the list's tables above (plugin/settings.json). */
	var TRACKING = Object.keys(TRACK);
	/* WORTABSTAND, A DIAL OF ITS OWN (Manuel, 2026-09-15: "another setting
	   word spacing"): the space between the reading text's words, apart from
	   the letters'. Laufweite widened the words with it until now; each is
	   set on its own now, both at rest where the face has them. */
	var WORDS = { m25: '-0.25em', m22: '-0.225em', m20: '-0.2em', m17: '-0.175em', m15: '-0.15em', m12: '-0.125em', m10: '-0.1em', m7: '-0.075em', m5: '-0.05em', m2: '-0.025em', 'default': 'normal', p2: '0.025em', p5: '0.05em', p7: '0.075em', p10: '0.1em', p12: '0.125em', p15: '0.15em', p17: '0.175em', p20: '0.2em', p22: '0.225em', p25: '0.25em' };
	/* ZEILENABSTAND FOR EVERY ROLE (Manuel, 2026-09-13: why not all of them?):
	   the reading text keeps its own scale (data-leading); the other four
	   take a factor on their own line height, stamped only when chosen. */
	var LEAD = { solid: 0.56, packed: 0.62, close: 0.69, densest: 0.75, dense: 0.85, tight: 0.92, snug: 0.96, 'default': 1, relaxed: 1.06, airy: 1.1, wider: 1.15, wide: 1.25, open: 1.37, loose: 1.5, loosest: 1.62 }; /* fifteen since 2026-09-18, the reading text's own fifteen: each is that step's line height over 1.6 */ /* nine, with the reading text's own nine (2026-09-16) */
	/* Has the reader (or a copy of the theme's look) set this role's slant itself. */
	function ownItalic(role) {
		var s = byId(current), tw = readTweaks()[current];
		return !!((s && s.roles && s.roles[role] && s.roles[role].italic !== undefined) || (tw && tw.roles && tw.roles[role] && tw.roles[role].italic !== undefined));
	}
	/* The theme's own slant for a role, read off the first part the plugin's italic rule
	   would reach (panel-page.css), with our own stamp lifted while it is read. */
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
		if (FOLLOW_ALIAS[out.face]) out.face = FOLLOW_ALIAS[out.face]; /* 'inherit' (2026-09-16 to 2026-09-19) is 'read' */
		/* The members: the style's released ones, or the tweak's whole set
		   (a press writes the set as it stands, so the tweak replaces). */
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
		/* The two faces that are dials of their own already. */
		if (role === 'read') out.face = root.getAttribute('data-face') || 'newsreader';
		if (role === 'ui') out.face = sansOf();
		out.weight = fitWeight(out.face, WEIGHT_ALIAS[out.weight] || out.weight);
		out.size = rungFor(role, out.size); /* every size is a rung now, and rungFor reads the retired 'text' as the role's own (2026-09-17) */
		out.tracking = TRACK_ALIAS[out.tracking] || out.tracking; /* the seven names of 1.3.116 and before (2026-09-16) */
		out.words = WORDS_ALIAS[out.words] || out.words;
		/* ON A STRANGER'S THEME, UNDER ITS OWN LOOK, THE SLANT IS WHAT THE PAGE SHOWS
		   (2026-09-27, found by the new window's check on Twenty Twenty-Five: Category
		   line › Italic read on over an upright category line, since our rest is
		   Architrave's italic one, and off changed nothing). Until the reader sets it,
		   the switch reads the theme's own slant off the page. */
		if (window.architravePanelGuest && !isLook(current) && !ownItalic(role)) out.italic = hostSlant(role);
		if (!hasItalic(out.face)) out.italic = false;
		if (out.align !== undefined && ALIGNS.indexOf(out.align) === -1) out.align = 'default';
		if (out.colour !== undefined && ROLE_COLOURS.indexOf(out.colour) === -1) out.colour = 'ink';
		return out;
	}
	/* A REST WRITES NOTHING (2026-09-13, measured live: the roles stamped 400
	   and 0 on every page, and the theme's own values under them, the
	   room's 440/420 body weight, the title's tight tracking, the headings'
	   600, were gone; and the room's weight rule outranked the role's).
	   The weight and the tracking are written only when they differ from
	   Standard's rest; the stylesheet's fallbacks are the theme as it was.
	   The three weights the stylesheet gates on an attribute, Lesetext's,
	   Oberfläche's and Kommentare's, are stamped as data-read-weight,
	   data-ui-weight and data-comment-weight. */
	function applyRoles() {
		var st = root.style;
		ROLES.forEach(function (role) {
			var v = roleOf(role), p = '--' + role + '-', rest = ROLE_DEFAULT[role], s0 = byId(current);
			/* what the reader set by hand under a guest's own look: stamped even when it equals our rest (see setRole) */
			var hostTw = window.architravePanelGuest && !isLook(current) ? ((readTweaks()[current] || {}).roles || {})[role] || {} : {};
			/* A FOLLOWER'S FACE IS ALWAYS WRITTEN OUT (2026-09-22), the anchor's
			   token or the pinned family, never left to a stylesheet fallback:
			   the fallbacks say six different things (--font-reading here,
			   --face-newsreader there, --face-inter and --font-sans further
			   down), and trusting one of them is how "Wie Fließtext" set a
			   Newsreader quote into every style on 2026-09-19. */
			if (role !== 'read' && role !== 'ui') st.setProperty(p + 'face', faceValue(v.face));
			/* THE READER'S SMALL FACE OUTRANKS A STYLE'S CAPTION FACE (Manuel,
			   2026-09-26, after Book's captions went to the reading italic: "let the
			   reader's choice win"). A style may set its captions in a face of its
			   own at rest (style.css, Book); once Kleintext's face is anything but
			   its rest, the captions follow the role like the dates and tags.
			   Stamped on every site, since the stylesheet cannot tell a written
			   rest from a choice (the face is always on the root). */
			if (role === 'small') { if (v.face !== rest.face) root.setAttribute('data-small-face-own', ''); else root.removeAttribute('data-small-face-own'); }
			if (v.weight === rest.weight && hostTw.weight === undefined) st.removeProperty(p + 'weight'); else st.setProperty(p + 'weight', String(WEIGHT[v.weight] || 400));
			if (role === 'read' || role === 'ui' || role === 'comment') { if (v.weight === rest.weight) root.removeAttribute('data-' + role + '-weight'); else root.setAttribute('data-' + role + '-weight', v.weight); }
			st.setProperty(p + 'size', String(sizeFactor(role, v.size)));
			/* THE READER'S OWN SIZE, APART FROM THE STYLE'S (2026-09-27, found by the new
			   window's check on Twenty Twenty-Five under Classic: Category line, Small text
			   and Interface moved nothing). On a stranger's theme a look leaves the size
			   outside the article alone (guest-size.js), so the style's own sizes do not
			   reach a landing page; that took the reader's dial with them. This factor is
			   the reader's move alone, the size now over the style's own for the role, 1
			   while the style is as it came, and guest-size.js spends it there. */
			if (window.architravePanelGuest) {
				var mine = sizeFactor(role, v.size) / sizeFactor(role, rungFor(role, (s0 && s0.roles && s0.roles[role] && s0.roles[role].size) || rest.size));
				if (Math.abs(mine - 1) < 0.0001) st.removeProperty(p + 'size-mine'); else st.setProperty(p + 'size-mine', String(mine));
			}
			if (role === 'head') root.removeAttribute('data-head-size'); /* the 'text' stop is retired (2026-09-17); the attribute is cleared off styles that still carry it */
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
			} /* the buttons and the menus' rows scale only once a step is chosen (style.css, 2026-09-15); Kommentare the same, for the same reason (2026-09-17) */
			if (v.tracking === rest.tracking && hostTw.tracking === undefined) st.removeProperty(p + 'tracking'); else st.setProperty(p + 'tracking', TRACK[v.tracking] || '0');
			if (v.words === rest.words && hostTw.words === undefined) st.removeProperty(p + 'words'); else st.setProperty(p + 'words', WORDS[v.words] || 'normal');
			st.setProperty(p + 'case', v.caps ? 'uppercase' : 'none');
			if (rest.colour !== undefined) { if (v.colour === rest.colour) { st.removeProperty(p + 'colour'); root.removeAttribute('data-' + role + '-colour'); } else { st.setProperty(p + 'colour', v.colour === 'accent' ? 'var(--accent)' : 'var(--' + role + '-own-colour, var(--accent))'); root.setAttribute('data-' + role + '-colour', v.colour); } }
			if (rest.align !== undefined) { if (v.align === rest.align) { st.removeProperty(p + 'align'); root.removeAttribute('data-' + role + '-align'); } else { st.setProperty(p + 'align', ALIGN[v.align]); root.setAttribute('data-' + role + '-align', v.align); } }
			/* A QUOTE IN A FACE WITHOUT AN ITALIC STANDS UPRIGHT (2026-09-19): the stylesheet slants a quote at rest, and a face that ships no italic was slanted by the browser, which the ITALICS list exists to prevent. */
			/* AND A QUOTE AT ITS REST WRITES NOTHING (2026-09-27): the stylesheet's own slant stands, italic in the article and upright on a quote post's card; off writes upright, since the stylesheet's fallback is italic and removing the property would leave it leaning. */
			if (role === 'quote' && !hasItalic(v.face)) st.setProperty(p + 'style', 'normal');
			else if (role === 'quote' && v.italic === rest.italic && !(s0 && s0.roles && s0.roles.quote && s0.roles.quote.italic !== undefined)) st.removeProperty(p + 'style'); /* a style that asks for the slant itself (Blueprint) keeps it on its quote cards too */
			else if (v.italic) st.setProperty(p + 'style', 'italic');
			else if (role === 'quote') st.setProperty(p + 'style', 'normal');
			else st.removeProperty(p + 'style');
			if (role !== 'read') { if (v.leading === rest.leading || !LEAD[v.leading]) { st.removeProperty(p + 'leading'); root.removeAttribute('data-' + role + '-leading'); } else { st.setProperty(p + 'leading', String(LEAD[v.leading])); root.setAttribute('data-' + role + '-leading', v.leading); } }
			if (role === 'read') { st.setProperty('--reading-tracking', TRACK[v.tracking] || '0'); st.setProperty('--reading-word-gap', WORDS[v.words] || 'normal'); }
			/* WHAT A GUEST GATES ON (0.9.0). Four of the eight faces are written
			   on the root even at rest (--head-face, --small-face,
			   --comment-face, --title-face, measured on a stock theme), so the
			   presence of a property is not a reader's choice and a guest sheet
			   that spent it would restyle a stranger's page on arrival. The
			   comparison with the role's own rest IS the choice, and it is
			   known here and nowhere else, so it is written out as an attribute
			   for the stylesheet to gate on. Guests only: on a host the global
			   is undefined, nothing is stamped, and the judge compares the
			   root's attributes directly. */
			if (window.architravePanelGuest) {
				/* UNDER A LOOK, A ROLE'S REST IS A CHOICE TOO (Manuel, 2026-09-22:
				   "the Newsreader font is still not applying from the standard to
				   the heading"). Standard's headings rest on Newsreader, which on
				   Architrave the theme's own stylesheet supplies, so the role
				   writes nothing and nothing is missing. On a stranger's theme
				   nothing supplies it, and a title left on the host's sans while
				   the article reads in Newsreader is a look half arrived. So while
				   a LOOK is on, every face and weight the role carries is stamped;
				   on the theme's own look none of them is, because that tile is
				   the absence of every choice. A dial the reader moved himself is
				   stamped either way. */
				var look = isLook(current);
				/* AND THE VALUE, NOT ONLY THE ATTRIBUTE. A dial at rest writes
				   NOTHING (see A REST WRITES NOTHING above), because on Architrave
				   the stylesheet's own fallback is the theme as it was. A guest has
				   no such fallback, so a gated rule reading `var(--head-weight)`
				   with the property absent throws the declaration away and the
				   title inherits the host's weight. Under a look the role writes
				   what it rests on. Reading text and Interface are left out: their
				   faces are data-face and data-sans, dials of their own. */
				if (look) st.setProperty(p + 'weight', String(WEIGHT[v.weight] || 400));
				/* A FOLLOWER ON A STRANGER'S PAGE (2026-09-22). Its face is stamped
				   when the anchor it follows has been chosen (data-face written,
				   or data-sans off Inter), because a title that stayed in the
				   host's sans after the reader set the text in Vollkorn would
				   contradict the row that says "Same as reading text"; when a
				   look is on, since the look chose the anchors; and when the
				   reader pinned a face. Under the theme's own look with the
				   anchor unchosen, the anchor IS the host's face, so a follower
				   sent to it is written the host's family outright rather than
				   a token that would name Inter or Newsreader on a page that
				   has neither (the panel draws itself in --font-sans, so that
				   token cannot be repointed at the host). */
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
					italic: look ? (v.italic !== rest.italic || v.italic) : ownItalic(role) /* under the theme's own look only the reader's own pick is stamped; the rest is the theme's */
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
	/* WHERE THE PARAGRAPH SETTINGS APPLY (Manuel, 2026-09-13: "it shouldn't
	   be an automatic separation between index and single, so it should be
	   a choice"): the article alone, as always, or everywhere, the index's
	   excerpts and the format cards' paragraphs too. Justify, the cap,
	   the hyphens and the character spacing follow it; the faces, the
	   colours, the corners and the line spacing were everywhere already.
	   A dial of the style, stamped as data-scope. */
	/* THE PICTURES (Manuel, 2026-09-14; lab sheet the-picture-looks): three
	   looks, named, no grades. Wie sie sind; Schwarzweiß, the newspaper's,
	   its rest; Getönt, the picture in the pair's own paper and ink. Sepia
	   and a muted look were drawn and dropped ("really just tiny
	   variations"); Book rests on Wie sie sind now, its quarter sepia gone
	   with them. A dial of the style, stamped as data-pictures. */
	/* MORE PICTURE EFFECTS (Manuel, 2026-09-19; lab sheet the-picture-effects):
	   Duoton (Getönt with the accent in the ink's place), Raster, Pixel,
	   Korn, and Ausgeblendet, which is no pictures and a line for each. The
	   two that go WITH a look are switches (OPTS): picturehover, picturedim. */
	/* PICTURES: the list's tables above (plugin/settings.json). */ /* sepia back 2026-09-19 (Manuel: "and sepia too"), whole this time, not the quarter that was dropped on 2026-09-14 */
	function picturesOf() {
		var s = byId(current), tw = readTweaks()[current];
		if (tw && PICTURES.indexOf(tw.pictures) !== -1) return tw.pictures;
		return (s && s.pictures) || PICTURES[0];
	}
	/* THE INITIAL'S HEIGHT (Manuel, 2026-09-15: "how many lines the drop caps
	   should be tall"): two, three or four lines, three at rest, Book's
	   number. A dial of the style, stamped as data-dropcap-lines. */
	/* CAP_LINES: the list's tables above (plugin/settings.json). */
	function capLinesOf() {
		var s = byId(current), tw = readTweaks()[current];
		if (tw && CAP_LINES.indexOf(tw.capLines) !== -1) return tw.capLines;
		return (s && s.capLines) || CAP_LINES[0];
	}
	function applyCapLines() {
		var v = capLinesOf(), was = root.getAttribute('data-dropcap-lines') || CAP_LINES[0];
		if (v === CAP_LINES[0]) root.removeAttribute('data-dropcap-lines'); else if (root.getAttribute('data-dropcap-lines') !== v) root.setAttribute('data-dropcap-lines', v);
		/* Chrome draws the initial once (applyOptions): a new height needs the paragraph laid out again. */
		if (was !== v) document.querySelectorAll('.wp-block-post-content > p:first-of-type, .wp-block-post-excerpt > p:first-of-type').forEach(function (p) { var d = p.style.display; p.style.display = 'none'; void p.offsetHeight; p.style.display = d; });
	}
	/* TWO STRENGTHS, EACH A SLIDER UNDER ITS SWITCH (Manuel, 2026-09-19, the
	   three-word pop-up of the same morning: "the setting light is already
	   very strong so probably we would need even more settings. What about
	   that strength of the lines, not the scan lines, the lines?"). Dials of
	   the style, record keys `scan` and `line`. Scan lines: ten stops, the
	   number is the lines' alpha in hundredths, 3 at rest. Lines: the ink's
	   share in the line's colour, 45 at rest, the stylesheet's own with Lines on. Written as a custom property and an
	   attribute only off the rest. A `scan` of soft, medium or strong, saved
	   before the slider, falls to the rest. */
	/* LEVELS: the list's tables above (plugin/settings.json). Its values are the list's; what each strength writes into its custom property is code, and stays here, and is attached to the table below. */
	var LEVEL_CSS = {
		scan: function (v) { return String(+v / 100); },
		line: function (v) { return v + '%'; },
		/* FLÄCHEN AND LEUCHTEN HAVE ONE TOO (Manuel, 2026-09-19: "can we also have an intensity switch like we have for the lines? And the same for glow"). Glow: the halo's alpha in tenths, 4 at rest. Fills: a percentage of the pair's OWN three steps, 100 at rest where nothing is written. Not an absolute share: the steps are 6, 10, 16 by day and as much as 18 on Terminal's night (measured), so one number for all would have jumped at its first move, the lines' fault again. The pair's steps are read off the page with nothing written, multiplied, and written on the root; read again when the side or the pair changes. */
		glowlevel: function (v) { return String(+v / 10); },
		/* KORN IM HINTERGRUND (Manuel, 2026-09-19: a grain "not on the image, sondern for the background itself. And we would need a strength or intensity slider for that too"): the texture layer's first half, body::before, which the theme has carried unused since the palettes were planned. The switch is OPTS `grain`; this is its opacity in tenths, 4 at rest. */
		grainlevel: function (v) { return String(+v / 10); },
		/* DIE VIGNETTE (Manuel, 2026-09-22: "on the Arcade tile there is a vignette. Could we have that as a setting?"): the texture layer's third drawing, body::after's radial gradient, which until today belonged to the Arcade style alone and could not be turned off there or on anywhere else. The switch is OPTS `vignette`; this is the ink's share at the page's corners in tenths, 2 at rest, which is Arcade's own 0.22 rounded to the slider's step. */
		vignettelevel: function (v) { return String(+v / 10); },
		/* AND HOW FAR IT REACHES IN (Manuel, 2026-09-22, of the second dial the vignette could have: "build it too"). The gradient is clear to a point and darkens from there to the edge; this is that point, and the slider reads the way the eye does, so a bigger number is MORE vignette. 3 is the rest, 55 per cent, where the drawing has always started. */
		vignettereach: function (v) { return [85, 70, 55, 40, 25, 10][+v - 1] + '%'; },
		/* WEICHERER LESETEXT HAS ONE TOO (2026-09-21, the ask: "15% or 25% intensity, like the setting you had in the lab"): how far the reading text steps from the ink toward the paper. 15 is the rest, the pair's own secondary rung; 25 is the sheet's stronger setting and the top, since beyond it a gentle pair's night text falls under 5:1. The switch is OPTS `soft`. */
		softlevel: function (v) { return v + '%'; }, /* WIDER (Manuel, 2026-09-23: "I want to make it even softer. It's just 20. We should give it a bigger range"): 10 to 45. 45 is the top because it is the last step that holds 4.5:1 on Instrument's night pair (5.1; 50 falls to 4.3). A gentler pair falls under sooner, Book's night at about 30: the slider trusts the owner there. */
		/* THE SMALL TEXT TOO (2026-09-23, the reference measured again: its reading text sits about 16 % from the ink, its dates, captions and small print about 45 %, #8a8f98, where ours held the pair's 25 %). How far --text-muted steps from the ink toward the paper, with Softer reading text on; 25 is the pair's own rung and the rest, so nothing is written there. */
		quietlevel: function (v) { return v + '%'; },
		smallsoft: function (v) { return v + '%'; },
		/* LINE LENGTH (Manuel, 2026-09-25, of the reference: "their site looks really big … we could make a character count"). Letters a line of the reading text. The column's measure is each face's own ch count tuned to about 72 letters (style.css, THE MEASURE), so the slider scales that measure by letters / 72 and the line stays true in every face. The reference's column holds about 82 letters of Newsreader. */
		measure: function (v) { return String(Math.round(+v / 72 * 1000) / 1000); },
		/* SPACE (Manuel, 2026-09-25, lab/the-space-of-a-page.html: "build it"). How
		   much air the page has: Compact, Standard, Spacious. Standard is the rest,
		   the theme's own, and writes nothing. The number is the step for the gaps
		   between sections; space.js (the plugin's) reads the page and gives every
		   other kind of gap its own share of it, so a group never comes apart. */
		space: function (v) { return { xcompact: '0.5', compact: '0.7', spacious: '1.4', xspacious: '1.8' }[v]; }, /* the two outer steps (Manuel, the same evening, on TT5: "maybe an even tighter version and a more spacious version") */
		/* FRAME WIDTH (the same morning): the mat around every picture in a piece and on the cards, 8 at rest (--space-2). Only with Frame around pictures. */
		framewidth: function (v) { return v + 'px'; },
		/* THE DOT GRID'S SIZE AND STRENGTH (Manuel, 2026-09-25: "a setting where
		   they could be changed, like to a bigger grid or a different colour"; his
		   yes to two sliders and no colour, the dots always the look's own ink).
		   Only with Dotted background. 24 and 13 are the grid's rest. */
		dotsize: function (v) { return v + 'px'; },
		dotlevel: function (v) { return v + '%'; }
	};
	Object.keys(LEVEL_CSS).forEach(function (k) { LEVELS[k].css = LEVEL_CSS[k]; });
	/* THE LINES' REST IS 45, NOT 14 (2026-09-19, Manuel on the slider: "when I turn it down to make the lines lighter, sometimes it goes a little bit up again"). At the rest nothing is written and the stylesheet's own value stands, and with Lines on that value is 45 % in EVERY style (style.css, the Lines block), not Terminal's alone as 1.3.267 believed; 14 is the hairline of a page with Lines off. So the stop called 14 wrote nothing and the page went back to 45: lighter, lighter, then darker. A style's own `line`, or its base's, is its rest. */
	function levelRest(k) {
		var L = LEVELS[k], s = byId(current), b = s && byId(baseOf(s));
		if (s && L.stops.indexOf(s[k]) !== -1) return s[k];
		if (b && L.stops.indexOf(b[k]) !== -1) return b[k];
		/* THE SMALL TEXT, A ROW OF ITS OWN (2026-09-27, the text marks): `smallsoft`
		   works with soft on or off. Until a style or a hand sets it, it stands
		   where Softer reading text's second slider (`quietlevel`) put the small
		   text, so no saved style and no reader's changes move. */
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
				root.style.removeProperty('--fill-factor'); /* the dark cards restate their steps on the card (style.css); they take the factor itself */
				if (v === L.rest) { root.removeAttribute(L.attr); return; }
				if (root.getAttribute(L.attr) !== v) root.setAttribute(L.attr, v);
				root.style.setProperty('--fill-factor', String(+v / 100));
				var cs = getComputedStyle(root);
				names.forEach(function (nm) { var own = parseFloat(cs.getPropertyValue(nm)); if (own > 0) root.style.setProperty(nm, (Math.round(own * +v) / 100) + '%'); });
				return;
			}
			/* WRITTEN AGAINST THE STYLESHEET'S REST, NOT THE STYLE'S (2026-09-19): levelRest says what a style rests on, which decides whether a tweak is kept; what the PAGE needs is whether the value differs from what the stylesheet gives with nothing written. 1.3.268 asked the style here, so a recipe's own value counted as nothing to write, and Terminal's scan 2 and line 10 never reached the page. */
			if (v === L.rest) { root.removeAttribute(L.attr); root.style.removeProperty(L.prop); }
			else { if (root.getAttribute(L.attr) !== v) root.setAttribute(L.attr, v); root.style.setProperty(L.prop, L.css(v)); }
		});
	}
	/* LINIENART (2026-09-19): solid, dashed or dotted, with Lines on. A dial of the style, record key `linestyle`, stamped as data-line-style off the rest; style.css carries the generated block. */
	/* LINE_STYLE: the list's tables above (plugin/settings.json). */
	function lineStyleOf() {
		var s = byId(current), tw = readTweaks()[current];
		if (tw && LINE_STYLE.indexOf(tw.linestyle) !== -1) return tw.linestyle;
		return (s && LINE_STYLE.indexOf(s.linestyle) !== -1) ? s.linestyle : LINE_STYLE[0];
	}
	/* ECKENGRÖSSE (2026-09-20, lab/the-corner-steps.html): small, medium or large, with Rounded corners on. A dial of the style, record key `corners`, stamped as data-corners off the rest (medium). One step re-cuts the radius scale in style.css; every corner that is a sum of the control's follows, and no gap moves. */
	/* CORNERS: the list's tables above (plugin/settings.json). */ /* xlarge, Very large, 2026-09-26: the soft sticker cards of Storybook's reference */ /* pill was the fourth step 2026-09-22 to 2026-09-26 and is the switch `pillbuttons` now, so it can ride on any size (liftCentre carries old records over) */
	function cornersOf() {
		var s = byId(current), tw = readTweaks()[current];
		if (tw && CORNERS.indexOf(tw.corners) !== -1) return tw.corners;
		return (s && CORNERS.indexOf(s.corners) !== -1) ? s.corners : CORNERS[0];
	}
	/* WHICH EDGES FADE (Manuel, 2026-09-23: "the top should also have a fade … it
	   should have some options"): with Fade the edges on, the top picture sinks at
	   its bottom only, at its sides and bottom (the rest, as 1.3.333 drew it), or
	   on all four sides. Record key `fadeedges`, stamped as data-fade-edges off
	   the rest. */
	/* FADE_EDGES: the list's tables above (plugin/settings.json). */
	function fadeEdgesOf() {
		var s = byId(current), tw = readTweaks()[current];
		if (tw && FADE_EDGES.indexOf(tw.fadeedges) !== -1) return tw.fadeedges;
		return (s && FADE_EDGES.indexOf(s.fadeedges) !== -1) ? s.fadeedges : FADE_EDGES[0];
	}
	/* THE HIGHLIGHTER'S COLOUR (Manuel, 2026-09-24, Catalogue: "lets do all 4"): the
	   marker is decoration only, never text on the paper, so it is a pick of
	   highlighter colours with the ink of the day side over it, not a fourth
	   well. Record key `markercolour`, stamped as data-marker-colour off the rest. */
	/* MARKERS: the list's tables above (plugin/settings.json). */ /* own (2026-09-26, round one): the well colours.<side>.marker; its ink and its bar follow from the pen (markerBody). text and muted (Manuel, 2026-09-26: "like the reading text or the year in the same color"): the pen is the reading text's colour or the date's, read from each side's own rungs in style.css, so it holds by day and by night */
	function markerColourOf() {
		var s = byId(current), tw = readTweaks()[current];
		if (tw && MARKERS.indexOf(tw.markercolour) !== -1) return tw.markercolour;
		return (s && MARKERS.indexOf(s.markercolour) !== -1) ? s.markercolour : MARKERS[0];
	}
	/* THE FRAME'S PATTERN (Manuel, 2026-09-25: the reference's checkerboard "is a distinctive style … maybe on the frame around the images"): what the mat around a picture shows, plain (the rest), the page's dot grid, or a checkerboard, the transparency grid of a design tool. Record key `framepattern`, data-frame-pattern off the rest. Only with Frame around pictures. */
	/* FRAME_PATTERNS: the list's tables above (plugin/settings.json). */
	function framePatternOf() {
		var s = byId(current), tw = readTweaks()[current];
		if (tw && FRAME_PATTERNS.indexOf(tw.framepattern) !== -1) return tw.framepattern;
		return (s && FRAME_PATTERNS.indexOf(s.framepattern) !== -1) ? s.framepattern : FRAME_PATTERNS[0];
	}
	function applyFramePattern() { var v = framePatternOf(); if (v === FRAME_PATTERNS[0]) root.removeAttribute('data-frame-pattern'); else if (root.getAttribute('data-frame-pattern') !== v) root.setAttribute('data-frame-pattern', v); }
	/* THE BUTTON'S COLOUR (Manuel, 2026-09-26, lab/the-link-colour.html, "go with
	   your recommendation"): the filled buttons wear the accent (the rest), the
	   ink, or a colour of their own; the links keep the accent, which is Apple's
	   tint, first of all the colour of links. It replaces the switch `inkbutton`
	   (on = ink; liftCentre moves old records over). The own colour is a fourth
	   well, `colours.<side>.button`, edited as paper and ink are; it never counts
	   as Custom and never drops a preset. Record key `button`, stamped as
	   data-button off the rest. */
	/* BUTTONS: the list's tables above (plugin/settings.json). */
	function buttonOf() {
		var s = byId(current), tw = readTweaks()[current];
		if (tw && BUTTONS.indexOf(tw.button) !== -1) return tw.button;
		return (s && BUTTONS.indexOf(s.button) !== -1) ? s.button : BUTTONS[0];
	}
	/* THE SHAPE ROUND (Manuel, 2026-09-26, lab/the-shape-round.html, "I go with
	   your recommendation", all four). Four picks of Corners and lines, each a
	   record key stamped as data-<attr> off its rest, the first value:
	     buttonshape  cards (the corner size's) / square / rounded / pill; it
	                  replaced the switch pillbuttons (liftCentre)
	     buttonstyle  filled / outlined / shadow (outlined with a hard shadow)
	     linewidth    1 / 2 / 3 / 5 px, while Lines is on
	     cards        box / top (a line along the top only), while Lines is on
	   and one switch, tagsfollow (OPTS): the tags take the buttons' corner. */
	/* PICKS: the list's tables above (plugin/settings.json). */
	/* LINKS FOLLOW THE SOFTER TEXT (2026-09-27, the text marks): until a style or
	   a hand names a way, a style with soft text marks its links underlined in
	   the ink, what the switch drew before links had a row of their own. So no
	   saved style and no reader's changes move, and nothing needs lifting. */
	/* The rows that follow soft until named (pickRest, levelRest): which of them
	   neither the style nor a hand names now. An export leaves those out. */
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
	/* THE EXTRAS' DETAILS (EFFECTS, the list's table; 2026-09-29, lab/the-instrument-extras.html
	   round two). A style's `effects` holds per effect only the details off their rest; a
	   reader's tweak the same, over it. effectsOf merges the two, keeping only known
	   details and values from their lists; applyEffects stamps each one that is off its rest
	   as data-fx-<effect>-<detail> on the root and removes it at the rest, so at the rest
	   nothing is written and the theme alone never meets one. */
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
		if (document.body) warpDirection(); /* the warp's direction is a detail (2026-09-30) */
	}
	/* THE HEADINGS ARRIVE (PICKS `headarrival`, effects.arrival) AND THE SERIF WORDS
	   (`headitalics`, effects.serif). On a page, each word of the titles and the
	   article's headings is wrapped once (span.ldp-w, its place in --ldp-i) whenever
	   either needs words. Arriving: a heading is marked .ldp-arrive and gains .ldp-in
	   when it comes into view; with the scope Text (or All) the article's paragraphs
	   (and pictures) are marked whole, .ldp-arrive-block. style.css holds back only
	   what is marked and not yet in, so a page whose script never ran shows it all;
	   nothing arrives for a reader who asks for less motion. Serif words: the last word
	   of every heading, or every word of a title, is marked .ldp-serif (the italics a
	   writer set need no mark). Words stay wrapped when the settings go back: a span is
	   invisible to the rest; a script that reads a heading reads its textContent. */
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
	/* THE POINTER'S LIGHT (effects.pointer): the card under the pointer learns where it is. */
	document.addEventListener('pointermove', function (ev) {
		if (!root.hasAttribute('data-fx-pointer-look') || !ev.target || !ev.target.closest) return;
		var c = ev.target.closest('.post-link-card, .support-box, .release-panel, .release-archive-card, .theme-card, .about-numbers, .format-quote blockquote.wp-block-quote, .single-format-quote .wp-block-post-content blockquote.wp-block-quote'); if (!c) return;
		var r = c.getBoundingClientRect();
		c.style.setProperty('--ldp-mx', (ev.clientX - r.left) + 'px'); c.style.setProperty('--ldp-my', (ev.clientY - r.top) + 'px');
	}, { passive: true });
	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', headingsArrive); 
	/* THE SCREEN AND THE PRINT (2026-09-30, lab/the-tube.html + lab/the-brochure.html; Manuel: "make both live on the site as new styles"). What CSS cannot do alone:
	   the overlays (bezel, glass sheen, room, shimmer, static) are one box, drawn inside the framed paper (absolute, so it stays on the paper while the column scrolls) or fixed over the window elsewhere;
	   the warp, the ghosting and the crisp edges are SVG filters written once; the boot screen and the typed title run once per visit; the switch-on watches the side; the columns are CSS alone. Everything is gated on the root attribute, so a pick that goes back to its rest leaves the page as it was. */
	var SCREEN_ATTRS = ['data-monitor-frame', 'data-room-glass', 'data-shimmer', 'data-static', 'data-boot-screen', 'data-warp', 'data-ghosting', 'data-crisp', 'data-typed-title', 'data-switch-on'];
	function screenHost() { return document.querySelector('.frame-paper') || document.body; } /* the paper: the warp, the ghosting and the switch-on act on it */
	function screenBox() { return document.body; } /* THE OVERLAYS COVER THE WINDOW, rail and all (Manuel, 2026-09-30, Tube live: the bezel wrapped only the paper and the rail stood outside the monitor) */
	function screenFilters() {
		if (document.getElementById('ldp-filters')) return;
		var N = 256, c = document.createElement('canvas'); if (typeof c.getContext !== 'function') return; /* the generator's stub has no canvas */ c.width = c.height = N; var g = c.getContext('2d'), d = g.createImageData(N, N), i, x, y, u, v, r2;
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
		var seen = false; try { seen = sessionStorage.getItem('ldp-boot') === '1'; } catch (e) { /* no storage: boot */ }
		if (seen) { root.removeAttribute('data-ldp-booting'); return; }
		try { sessionStorage.setItem('ldp-boot', '1'); } catch (e) { /* not kept */ }
		var title = (document.querySelector('.wp-block-site-title') || {}).textContent || (document.title || '').split(/ [–|-] /)[0] || '';
		var line = (document.querySelector('.wp-block-site-tagline') || {}).textContent || '';
		/* THE TEST CARD (2026-09-30, Tube): the pick's third value. A television's start, drawn: the site's name on the plate in the heading's own face, its line above, two lines a station said. Shown about two seconds, a moment with less motion asked for. */
		if (root.getAttribute('data-boot-screen') === 'card') {
			var c = document.createElement('div'); c.className = 'ldp-card'; c.setAttribute('aria-hidden', 'true');
			c.innerHTML = '<svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet"><defs><pattern id="ldp-tc-grid" width="50" height="50" patternUnits="userSpaceOnUse"><path d="M50 0H0V50" fill="none" stroke="#fff" stroke-width="1" opacity=".38"/></pattern><pattern id="ldp-tc-1" width="16" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#fff"/></pattern><pattern id="ldp-tc-2" width="10" height="8" patternUnits="userSpaceOnUse"><rect width="5" height="8" fill="#fff"/></pattern><pattern id="ldp-tc-3" width="6" height="8" patternUnits="userSpaceOnUse"><rect width="3" height="8" fill="#fff"/></pattern><pattern id="ldp-tc-4" width="4" height="8" patternUnits="userSpaceOnUse"><rect width="2" height="8" fill="#fff"/></pattern><clipPath id="ldp-tc-round"><circle cx="400" cy="300" r="262"/></clipPath></defs><rect x="-1200" y="-900" width="3200" height="2400" fill="#2b2b2b"/><rect x="-1200" y="-900" width="3200" height="2400" fill="url(#ldp-tc-grid)"/><g fill="#2b2b2b" stroke="#fff" stroke-width="2"><circle cx="85" cy="85" r="56"/><circle cx="715" cy="85" r="56"/><circle cx="85" cy="515" r="56"/><circle cx="715" cy="515" r="56"/></g><path stroke="#fff" stroke-width="2" d="M29 85h112M85 29v112M659 85h112M715 29v112M29 515h112M85 459v112M659 515h112M715 459v112"/><circle cx="400" cy="300" r="270" fill="#6f6f6f" stroke="#fff" stroke-width="4"/><g clip-path="url(#ldp-tc-round)"><rect x="130" y="30" width="540" height="110" fill="#111"/><rect x="200" y="78" width="96" height="48" fill="url(#ldp-tc-1)"/><rect x="302" y="78" width="96" height="48" fill="url(#ldp-tc-2)"/><rect x="404" y="78" width="96" height="48" fill="url(#ldp-tc-3)"/><rect x="506" y="78" width="96" height="48" fill="url(#ldp-tc-4)"/><rect x="130" y="140" width="540" height="64" fill="#e9e9e9"/><rect x="130" y="392" width="540" height="58" fill="#111"/><rect x="160" y="400" width="60" height="42" fill="#fff"/><rect x="220" y="400" width="60" height="42" fill="#dadada"/><rect x="280" y="400" width="60" height="42" fill="#b6b6b6"/><rect x="340" y="400" width="60" height="42" fill="#929292"/><rect x="400" y="400" width="60" height="42" fill="#6d6d6d"/><rect x="460" y="400" width="60" height="42" fill="#494949"/><rect x="520" y="400" width="60" height="42" fill="#242424"/><rect x="580" y="400" width="60" height="42" fill="#000"/><rect x="130" y="450" width="540" height="120" fill="#3d3d3d"/><path d="M400 30v110M400 450v120" stroke="#fff" stroke-width="2"/></g><rect x="150" y="218" width="500" height="160" fill="#0d0d0d" stroke="#fff" stroke-width="3"/><text class="ldp-card-name" x="400" y="296" text-anchor="middle" fill="#f2f2f2"></text><text class="ldp-card-line" x="400" y="346" text-anchor="middle" fill="#f2f2f2"></text><text class="ldp-card-small" data-at="top" x="400" y="178" text-anchor="middle" fill="#111"></text><text class="ldp-card-small" data-at="foot" x="400" y="500" text-anchor="middle" fill="#f2f2f2"></text></svg>';
			var say = function (x) { var W = window.architraveWords || WORDS || {}; return W[x] || x; }, put = function (sel, text) { var el = c.querySelector(sel); if (el) el.textContent = text; return el; };
			var name = put('.ldp-card-name', title.trim()); put('.ldp-card-line', say('Please stand by')); put('[data-at="top"]', (line.trim() || String(location.hostname || '').replace(/^www\./, '')).slice(0, 40)); /* the site's line, or its address where it has none, as a station signs its card */ put('[data-at="foot"]', say('Transmission begins shortly'));
			document.body.appendChild(c); root.setAttribute('data-ldp-booting', 'card');
			try { if (name && name.getComputedTextLength && name.getComputedTextLength() > 460) { name.setAttribute('textLength', '460'); name.setAttribute('lengthAdjust', 'spacingAndGlyphs'); } } catch (e) { /* not measured: the name stands as it is */ }
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
	/* THE PRINT'S FOOT AND WHAT THE BANDS NEED (2026-09-30, Brochure B; picks `footband`, `legalline`, `postband`). Three things a rule cannot do: (1) the foot is an element at the column's end, built once: the legal line, an advertisement's small print made only of words the site already has (the copyright sign, the year, the site's name, its tagline where the page shows one), and the taller band under it; (2) a band reaches the paper's edges, so the column is told its own insets, again when the window changes; (3) the logo in the band between posts is the rail's stencil, whose address the site's logo block carries, so the column is handed it. Architrave's column only: a guest's page has none, and its rows are not offered there. */
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
			/* THE TAGLINE IS NOT ON THE PAGE: Architrave prints no tagline block, so the plate asks the site once, through the address every WordPress answers, and keeps the answer for the session (a page with a tagline block needs no asking) */
			if (!line && window.fetch) {
				var kept = null; try { kept = sessionStorage.getItem('ldp-tagline'); } catch (e) { /* no storage: ask */ }
				var say = function (t) { t = String(t || '').trim(); if (!t) return; lineEl.textContent = t; lineEl.hidden = false; f.firstChild.textContent = legal + '. ' + t; };
				if (kept !== null) say(kept);
				else fetch('/wp-json/', { credentials: 'same-origin' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) { var t = j && j.description ? String(j.description) : ''; try { sessionStorage.setItem('ldp-tagline', t); } catch (e) { /* not kept */ } say(t); }).catch(function () { /* the plate stands without its line */ });
			}
		}
		var inset = function () { var cs = window.getComputedStyle(col); col.style.setProperty('--ldp-col-inset', cs.paddingLeft); col.style.setProperty('--ldp-col-foot', cs.paddingBottom); };
		inset();
		if (!footWatched) { footWatched = true; window.addEventListener('resize', inset, { passive: true }); }
		var logo = document.querySelector('.has-stencil-logo'), url = logo && logo.style.getPropertyValue('--architrave-logo-stencil'), ratio = logo && logo.style.getPropertyValue('--architrave-logo-ratio');
		if (url) { col.style.setProperty('--ldp-logo', url); col.style.setProperty('--ldp-logo-ratio', ratio || '1'); col.classList.add('ldp-has-logo'); }
	}
	function screenEffects() {
		if (!document.body || typeof document.createElementNS !== 'function' || !window.getComputedStyle) return; /* not in the generator's stub */
		var need = SCREEN_ATTRS.some(function (a) { return root.hasAttribute(a); });
		var host = screenBox(), box = document.querySelector('.ldp-screen');
		if (need && !box) { box = document.createElement('div'); box.className = 'ldp-screen'; box.setAttribute('aria-hidden', 'true'); box.innerHTML = '<i class="ldp-shimmer"></i><i class="ldp-room"></i><i class="ldp-static"></i><i class="ldp-bezel"></i>'; host.appendChild(box); }
		else if (box && box.parentNode !== host) host.appendChild(box);
		if (root.hasAttribute('data-warp') || root.hasAttribute('data-ghosting') || root.hasAttribute('data-crisp')) { screenFilters(); warpDirection(); }
		if (root.hasAttribute('data-ghosting')) ghosting();
		if (root.hasAttribute('data-switch-on')) switchOn();
		printFoot();
		typedTitle(); bootScreen(); /* the columns need no script: the headings span every column (column-span: all), so each section balances on its own */
	}
	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', screenEffects); else screenEffects();
	/* the boot screen must cover the first paint: presets.js runs in the head, so the root says it is booting before the body exists and door.css paints the blue over everything until the screen itself is built */
	(function () { var d = PICKS.bootscreen; if (d && pickOf('bootscreen') !== d.list[0]) { var seen = false; try { seen = sessionStorage.getItem('ldp-boot') === '1'; } catch (e) {} if (!seen) root.setAttribute('data-ldp-booting', pickOf('bootscreen') === 'card' ? 'card' : ''); } })();
	function applyButton() { var v = buttonOf(); if (v === BUTTONS[0]) root.removeAttribute('data-button'); else if (root.getAttribute('data-button') !== v) root.setAttribute('data-button', v); }
	function applyMarkerColour() { var v = markerColourOf(); if (v === MARKERS[0]) root.removeAttribute('data-marker-colour'); else if (root.getAttribute('data-marker-colour') !== v) root.setAttribute('data-marker-colour', v); }
	function applyFadeEdges() { var v = fadeEdgesOf(); if (v === FADE_EDGES[0]) root.removeAttribute('data-fade-edges'); else if (root.getAttribute('data-fade-edges') !== v) root.setAttribute('data-fade-edges', v); }
	function applyCorners() { var v = cornersOf(); if (v === CORNERS[0]) root.removeAttribute('data-corners'); else if (root.getAttribute('data-corners') !== v) root.setAttribute('data-corners', v); }
	function applyLineStyle() { var v = lineStyleOf(); if (v === LINE_STYLE[0]) root.removeAttribute('data-line-style'); else if (root.getAttribute('data-line-style') !== v) root.setAttribute('data-line-style', v); }
	function applyPictures() { var v = picturesOf(); if (v === PICTURES[0]) root.removeAttribute('data-pictures'); else if (root.getAttribute('data-pictures') !== v) root.setAttribute('data-pictures', v); }
	/* SCOPE: the list's tables above (plugin/settings.json). */
	function scopeOf() {
		/* ÜBERALL, ALWAYS (Manuel, 2026-09-15: "kick that out and make it überall
		   by default everywhere. That makes life easier. We'll figure out later
		   what to do when we just want to have it in a certain place"). The
		   paragraph's settings reach the index and the cards as they reach the
		   article; the dial and its storage stay for that later day. */
		return 'all';
	}
	function applyScope() { var v = scopeOf(); if (root.getAttribute('data-scope') !== v) root.setAttribute('data-scope', v); }
	function byId(id) {
		return STYLES.filter(function (s) { return s.id === id; })[0];
	}

	/* THE STYLE, BEFORE FIRST PAINT, like every dial: a look that arrives late
	   repaints the whole page under the reader. */
	/* The link is read here, after every list the record could name (OPTS, the tints) exists. */
	var linked = null; /* the style a link asked for, pressed once the rows exist */
	var PREVIEW_LINK = null; /* a preview link's visit: nothing it shows is stored */
	(function () {
		var q = window.location.search, h = window.location.hash, m, data;
		if ((m = /[?&]style=([^&]+)/.exec(q))) {
			var id = decodeURIComponent(m[1]);
			if (byId(id) && id !== 'standard') linked = byId(id);
			else if (id === 'standard' && (DEFAULT === 'standard' || DEFAULT === 'host')) linked = byId('standard') || STYLES[0];
		} else if ((m = /^#style=(.+)$/.exec(h)) && (data = decodeRecord(m[1]))) {
			linked = ownFromRecord(data);
		}
		/* A PREVIEW LINK (2026-09-28, inc/site-styles.php PREVIEW LINKS): the page wears the style the link carries for this
		   visit only; nothing is stored, the button steps aside, and a quiet bar says what this is and when it ends. */
		var pv = window.architraveSiteStyles && window.architraveSiteStyles.preview;
		if (pv) {
			PREVIEW_LINK = pv;
			/* THE VISITOR'S OWN CHOICES COME BACK WHOLE: the rows a style presses keep their own storage, so what this
			   browser held before the visit is put back as the page is left, and the preview leaves no trace. */
			try {
				var held = {}; for (var li = 0; li < localStorage.length; li++) { var lk = localStorage.key(li); held[lk] = localStorage.getItem(lk); }
				window.addEventListener('pagehide', function () { try { localStorage.clear(); Object.keys(held).forEach(function (k) { localStorage.setItem(k, held[k]); }); } catch (e) { /* storage refused: nothing was kept either */ } });
			} catch (e) { /* no storage: nothing to put back */ }
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
			try { history.replaceState(null, '', window.location.pathname + q.replace(/([?&])style=[^&]*(&|$)/, function (a, b, c) { return c ? b : ''; }) + (/^#style=/.test(h) ? '' : h)); } catch (e) { /* the address stays; the style is on */ }
		}
	})();
	/* THE THEME'S OWN LOOK, AS A TILE (0.9.0, guests only). Standard is
	   Architrave's own look, so on Architrave a reader is always one press from
	   home. On a stranger's theme there was no way back at all (Manuel,
	   2026-09-22: "how does he come back to his original design?"). This tile is
	   not a look: it is the absence of every choice. It writes no attribute, it
	   stores nothing, and pressing it forgets what the panel has stored and
	   loads the page again, which is the only way to give back a theme's own
	   design exactly rather than by a list of things to undo. */
	var HOST = window.architravePanelHostStyle || null;
	if (HOST) {
		/* ITS FACE IS 'host', NOT NEWSREADER (Manuel, 2026-09-22: "the original has
		   a dot in the top-right corner, which means there was a change, but I
		   can't see any change, and if I click on Customise and then on Reset that
		   dot is not going away"). It never could. `now()` reads a page with no
		   `data-face` on it as 'host', which is exactly what the theme's own look
		   is; the recipe here said 'newsreader', so the two never agreed and the
		   tile that means UNTOUCHED was marked as touched from the first paint,
		   with nothing a reset could take away. Measured on a browser with empty
		   storage: adjusted('host') was true, every other tile false. */
		STYLES.unshift({ id: 'host', label: HOST.label, host: true, palette: 'neutral', tint: 'default', sans: 'inter', reading: 'default', face: 'host', leading: 'default', justify: false, dropcap: false, rounded: true, lines: false, bold: false, scope: 'all', fills: true, roles: {} });
		if (DEFAULT !== 'host') { var dRec = byId(DEFAULT); STYLES.splice(STYLES.indexOf(dRec), 1); STYLES.unshift(dRec); } /* a site default stands before it */
		/* THE TILE WEARS THE THEME'S OWN PAPER, INK AND FACE (Manuel, 2026-09-22:
		   "the original is now grey but it doesn't have dark mode … it also
		   doesn't have this serif font by default"). Measured off the page once
		   it has a body, with the room's paint lifted for the length of three
		   reads: the paint is a stylesheet rule on `data-chosen`, and two
		   attribute writes with no frame between them never reach the screen.
		   AND ON EACH SIDE (0.11.47): the theme's own look has two sides now, its
		   own and the one the plugin writes from its palette (panel.php, THE
		   THEME'S OWN OTHER SIDE), so each side is read with that side named on
		   the root, and the body's own transition held for the reads. */
		document.addEventListener('DOMContentLoaded', function () { still(function () { /* held still: guest-size.js, HELD STILL */
			var rec = byId('host'), had = root.hasAttribute('data-chosen'), hadC = root.getAttribute('data-colours'), hadT = root.getAttribute('data-theme');
			if (!rec) return;
			if (had) root.removeAttribute('data-chosen');
			if (hadC !== null) root.removeAttribute('data-colours'); /* your own colours paint the theme's palette too since 2026-09-24; the theme's own is what is measured */
			var bodyT = document.body.style.getPropertyValue('transition'), bodyP = document.body.style.getPropertyPriority('transition');
			document.body.style.setProperty('transition', 'none', 'important');
			var read = function (side) {
				root.setAttribute('data-theme', 'neutral-' + side);
				var cs = window.getComputedStyle(document.body), paper = cs.backgroundColor;
				if (!paper || /rgba\(0, 0, 0, 0\)|transparent/.test(paper)) paper = '#ffffff';
				/* THE THEME'S ACCENT TOO (2026-09-25, Manuel on the Original tile:
				   "weird that the colors of the Original are the same as on
				   Classic"). Paper and ink alone left the tile's accent line to
				   the panel's own violet, which is Classic's; a link in the
				   content is where a theme says its accent, and a theme whose
				   links are set in the ink (Twenty Twenty-Five's are) honestly
				   has the ink for an accent. */
				/* NOT A BUTTON'S WORD (2026-09-25, Manuel: the small square in the
				   tile's corner "doesn't have a dot"). The first link on Twenty
				   Twenty-Five's front page is the Learn more button, whose word is
				   the paper's own white on its dark fill, so the measured accent
				   WAS the paper and the dot painted itself invisible. A link only
				   counts as the theme's accent when it stands readable on the
				   page's own paper. */
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
			/* THE BANDS THE THEME PAINTED WITH A FIXED COLOUR (0.11.47, Kadence's white
			   header under the made dark side; panel.php, THE THEME'S OWN OTHER SIDE).
			   A large part of the page whose ground is the theme's own page colour, or
			   paler, and does not move when the side does, was painted with a value and
			   not a palette name: it is marked, and the made side paints it. Read on
			   the theme's own side and then on the other, so the parts the palette
			   already carries over are left alone. */
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
			/* THE SIDE THE THEME IS ON (2026-09-24, the audit: on Twenty Twenty-Five's white
			   page a Red paper came out a dark red, since the panel read the stored side,
			   dark, and offered the dark side's colours). A light page is light. The
			   plugin says so before the first paint (architravePanelHostSide); the
			   page is the second opinion, for a palette too thin to read. */
			var ch = (light.paper.match(/[\d.]+/g) || [255, 255, 255]).slice(0, 3).map(Number);
			rec.hostSide = window.architravePanelHostSide || ((0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2]) < 128 ? 'dark' : 'light');
		}); });
	}
	/* A LOOK is any tile but the theme's own and any tile SAVED FROM the theme's
	   own (`bare`, see saveAs): those carry a reader's few changes over the
	   theme as it is, so no room is painted under them and no face is stamped
	   that the reader did not choose. */
	function isLook(id) { var s = byId(id); return id !== 'host' && !(s && s.bare); }
	/* HAS THE READER ASKED FOR A LOOK. The paint that gives a guest's page the
	   room's paper and ink (panel-tokens.css, PAINT) waits on this mark, and a
	   room belongs to a look: the theme's own look has whatever sides the theme
	   itself has, and its Light / Dark / System row is dead. So the mark is
	   simply "a tile other than the theme's own is on", which a site default
	   also is, since then the OWNER has chosen. It was "any key in store" until
	   2026-09-22, and that counted the A/A stepper: a reader on the theme's own
	   look who pressed Larger, and nothing else, had a dark page after the next
	   reload, because the panel's default side has been dark since 2026-09-19
	   (measured on Twenty Twenty-Five). */
	function markChosen() {
		if (!HOST) return;
		if (isLook(current)) root.setAttribute('data-chosen', '');
		else root.removeAttribute('data-chosen');
		/* AND WHICH ONE (2026-09-25): a guest's pastels come from the look's own
		   reference (Instrument's from Linear), and the stylesheet has to know
		   which look it is dressing to say so. */
		if (isLook(current) && typeof current === 'string') root.setAttribute('data-look', current);
		else root.removeAttribute('data-look');
	}
	/* THE WAY HOME FORGETS THE CHOICES, NOT THE READER'S OWN WORK. Every dial's
	   key goes, so the page comes back exactly as the theme meant it. Two keys
	   stay: the styles the reader made himself (OWN_KEY), which are his and
	   would be lost for good, and the tweaks he made to other tiles
	   (TWEAKS_KEY), which apply nothing while no tile is on and are waiting
	   for him when he comes back to one; on Architrave, pressing Standard
	   forgets neither, and this is the same press. */
	/* NOT CHOICES OF LOOK (2026-09-26): the reader's light or dark, where the
	   owner dragged the door, and the owner's order of the hidden styles. The
	   sweep took them too, so after Original the next page opened on the
	   other side and the door jumped home. */
	var KEEP_HOME = ['quire-side', 'architrave-opener-spot', HIDDEN_KEY];
	function goHome() {
		var kill = [];
		try {
			for (var i = 0; i < localStorage.length; i++) {
				var k = localStorage.key(i);
				if (/^(architrave|quire)-/.test(k || '') && k !== OWN_KEY && k !== TWEAKS_KEY && KEEP_HOME.indexOf(k) === -1) kill.push(k);
			}
			kill.forEach(function (k) { localStorage.removeItem(k); });
			var all = readTweaks(); /* an entry recorded against the theme's own look, by a build before remember() learned to skip it */
			if (all.host) { delete all.host; writeTweaks(all); }
		} catch (e) { /* private mode: the strip below still gives the theme back */ }
		/* IT USED TO LOAD THE PAGE AGAIN (Manuel, 2026-09-22: "when I click on all
		   tiles it goes very fast unless I click on Original, it somehow looks
		   different"). It did, because it was not a change of look at all, it was
		   a reload: a white flash, the scroll kept but everything redrawn, and no
		   way to dissolve one look into the next. The reload was there because
		   giving a theme back by a list of things to undo is a list that rots.
		   It does not rot if it is not written by hand: every dial this file
		   knows is put back to the theme's own record, which is the record of
		   having chosen nothing, and the three marks that are not dials are taken
		   off. Verified by photographing the page after pressing Original against
		   a browser that had never chosen anything: the same page, to the pixel.
		   A browser without view transitions still gets the change, just at once. */
		var h = byId('host');
		if (!h) { location.reload(); return; }
		/* THE HOST RECORD CARRIES THE THEME'S OWN PAPER AND INK, which is how the
		   Original TILE is painted in the theme's own colours. Painting them on
		   to the PAGE is another thing entirely: the theme already has them, and
		   a copy written over the top is one more sheet between the reader and
		   the design they asked to be given back. Measured: `data-colours` stayed
		   on after a press of Original, the only mark that did. */
		applyNow(h, { palette: wanted(h).palette, reading: wanted(h).reading, face: wanted(h).face, leading: wanted(h).leading, colours: null });
		root.removeAttribute('data-colours');
		root.removeAttribute('data-chosen');
		root.removeAttribute('data-look');
		if (wanted(h).face === 'host') {
			root.removeAttribute('data-face');
			try { localStorage.removeItem('architrave-face'); } catch (e) { /* private mode */ }
		}
		applyRoles();
		mark();
	}

	var stored = null;
	try { stored = localStorage.getItem(KEY); } catch (e) { stored = null; }
	/* A STORED 'standard' IS MAPPED TO THE DEFAULT ONLY WHERE THE DEFAULT STANDS
	   IN FOR STANDARD, which a site default does and the theme's own look does
	   not: it stands BEFORE Standard, not instead of it. Without the second test
	   a guest who pressed Standard was thrown back to Original by the next
	   reload, and the size he had set came back as the theme's own (measured on
	   Twenty Twenty-Five, 2026-09-22: "it seems like it's not working anymore"). */
	/* AND ON ARCHITRAVE A CLASSIC THAT IS OFFERED IS KEPT (Manuel, 2026-09-24: a reader pressed
	   Classic under a site default and the next page gave the default back). A stored
	   'standard' stands for the default only where Classic is not offered to this reader:
	   stored before a default existed, it is not a choice among the site's styles. Where
	   the owner shows Classic beside the default, pressing it is one, and it holds. */
	var current = linked ? linked.id : (byId(stored) && !(stored === 'standard' && !GUEST && DEFAULT !== 'standard' && !offered(byId('standard'))) ? stored : DEFAULT); /* on a guest Standard is Classic, a style like any other, so a stored one is kept */
	function stamp(id) {
		current = id;
		if (id === 'standard' || id === 'host') root.removeAttribute(ATTR); /* Standard is the absence of the attribute; a site default wears its own id */
		else root.setAttribute(ATTR, id);
		try {
			if (PREVIEW_LINK) { /* a preview link's visit stores no choice */ }
			else if (id === 'host' && DEFAULT === 'host') localStorage.removeItem(KEY); /* the theme's own look is the absence of a choice, so it stores none; under a site default it is one, and is kept */
			else localStorage.setItem(KEY, id);
		} catch (e) { /* private mode: the page is still right */ }
		markChosen(); /* the mark follows the tile, and nothing else moves it */
	}
	stamp(current);
	/* READER NUMBERS (2026-09-28, the prototype's Readers page): one page view in ten tells the site
	   which style it was read in, and nothing else: no cookie, nothing kept in the browser. The site
	   prints the address only while the owner lets it count (inc/site-styles.php). */
	(function () {
		var to = window.architraveSiteStyles && window.architraveSiteStyles.count;
		if (!READER || PREVIEW_LINK || !to || !navigator.sendBeacon || Math.random() >= 0.1) return;
		try { navigator.sendBeacon(to, new Blob([JSON.stringify({ style: current })], { type: 'application/json' })); } catch (e) { /* not counted */ }
	})();

	/* A FIRST VISIT ON A SITE DEFAULT (2026-09-18). The dials' own scripts
	   have already stamped their rest before this runs, and a style presses
	   its recipe only on a press; so a reader arriving with nothing chosen
	   would see the default's name on <html> over Standard's dials. Where
	   the stored style did not resolve to itself (nothing stored, Standard
	   mapped to the default, a default since unpublished) the four dials are
	   stamped here, before paint, from the default's recipe, and the rows
	   are pressed once the page is in so their marks and their storage
	   follow. Sites without a site default are untouched: Standard's rest
	   is the dials' own rest already. */
	var seeded = false;
	if (linked || (current !== stored && current === DEFAULT && DEFAULT !== NONE)) {
		var w0 = wanted(byId(current));
		try {
			var sideNow = String(root.getAttribute('data-theme') || (Modes ? Modes.default : '')).split('-')[1] || 'light';
			if (Modes && Modes.apply) Modes.apply(w0.palette, root, sideNow);
			if (window.QuireReading && window.QuireReading.apply) window.QuireReading.apply(w0.reading, root);
			if (w0.face && w0.face !== 'newsreader') root.setAttribute('data-face', w0.face); else root.removeAttribute('data-face');
			if (w0.leading && w0.leading !== 'default') root.setAttribute('data-leading', w0.leading); else root.removeAttribute('data-leading');
		} catch (e) { /* the press below still lands */ }
		seeded = true;
	}

	/* THE THREE SWITCHES, PER STYLE (2026-09-10; Book's two of 2026-09-09
	   were site-wide and Book's alone). Each is stamped on <html> as
	   on/off before paint, from the style's recipe or the reader's tweak
	   of it, which lives in the same tweak record as the dials. */
	/* Where a switch rests: the recipe's word. (For a day the lines also
	   rested on for any style on the black-and-white pair; gone 2026-09-12,
	   since Poster rests on that pair without lines by design. A reader
	   who moves Standard onto black has the Linien switch.) */
	/* A SWITCH THAT RESTS ON (2026-09-23): every switch rests off where a style
	   does not name it, which is right for a look added later. The picture
	   frame is the other way round: every picture has worn it since before
	   the switch, so a style, a saved style or a record that does not name it
	   keeps it. */
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
		/* Written only when the value changes: an unchanged setAttribute still
		   fires the observers, and one press re-rendered the panel three
		   times (the audit, 2026-09-12). */
		function stampAttr(name, value) { if (root.getAttribute(name) !== value) root.setAttribute(name, value); }
		OPTS.forEach(function (k) { stampAttr('data-' + k, optionOn(k) ? 'on' : 'off'); });
		/* THE STYLE'S OWN TEXT SIZE (Manuel, 2026-09-25, of the big A: "what would
		   Apple do?", then "yes, do both"). A reader's size step makes the letters
		   bigger or smaller and the column keeps the width the style gave it, as a
		   book's page does: the line holds fewer letters, not a wider block.
		   style.css (THE COLUMN KEEPS ITS WIDTH) turns this and data-reading into
		   the ratio the measure is scaled by. The style's own step is its record's
		   (or its base's), not a tweak: a reader's press lands in the tweaks. */
		(function () { var st = byId(current), b = st && byId(baseOf(st)); stampAttr('data-reading-base', (st && st.reading) || (b && b.reading) || 'default'); })();
		/* HYPHENATION FOLLOWS THE JUSTIFYING (2026-09-11, the Apple review:
		   justified text without hyphens makes rivers, so the two switches
		   were one decision). Blocksatz on hyphenates; off, ragged and
		   unhyphenated. The stored key stays, for the record, and is written
		   from the justify switch. */
		stampAttr('data-hyphens', optionOn('justify') ? 'on' : 'off');
		/* CHROME DRAWS THE INITIAL ONCE (Manuel, 2026-09-10: "after I toggled
		   on and off some switches, I ended up with a small w"). Switching
		   initial-letter off and on again leaves the letter inline with its
		   gap, measured live; a reflow of the paragraph makes it draw. So
		   the first paragraphs are taken out of layout and put back when the
		   switch changes, which costs nothing a reader can see. */
		if (wasCap !== null && wasCap !== root.getAttribute('data-dropcap')) {
			document.querySelectorAll('.wp-block-post-content > p:first-of-type, .wp-block-post-excerpt > p:first-of-type').forEach(function (p) {
				var was = p.style.display;
				p.style.display = 'none';
				void p.offsetHeight;
				p.style.display = was;
			});
		}
		try { localStorage.removeItem('architrave-justify'); localStorage.removeItem('architrave-hyphens'); } catch (e) { /* the site-wide keys of 2026-09-09 */ }
	}

	/* THE ACCENT IS THE SITE'S, NOT A STYLE'S (Manuel, 2026-09-10: "if
	   someone doesn't like the colourful links, he could switch that off",
	   then: not only the links, "all the accent colours"). One switch for
	   every style and every room; off stamps data-accent="off" and the
	   accent is the ink. */
	var ACCENT_KEY = 'architrave-accent';
	function accentOn() {
		try { return localStorage.getItem(ACCENT_KEY) !== 'off'; } catch (e) { return true; }
	}
	function applyAccent() {
		if (accentOn()) root.removeAttribute('data-accent'); else root.setAttribute('data-accent', 'off');
		try { localStorage.removeItem('architrave-links'); } catch (e) { /* 1.1.715's key */ }
	}

	/* THE TWEAKS, one set of dial values per style, kept only while they
	   differ from the recipe. */
	/* READ THROUGH A WHITELIST (the audit, 2026-09-13): keys older builds wrote
	   and this one no longer reads (bold, wide, hyphens, tracking at the top
	   level) and unaliased role values stayed in a reader's record and kept a
	   style "adjusted" with nothing to reset. Only what is read survives. */
	var TWEAK_KEYS = DIALS.concat(OPTS, ['tint', 'sans', 'scope', 'roles', 'colours', 'pictures', 'capLines', 'scan', 'line', 'fill', 'glowlevel', 'grainlevel', 'vignettelevel', 'vignettereach', 'softlevel', 'quietlevel', 'smallsoft', 'measure', 'space', 'framewidth', 'dotsize', 'dotlevel', 'linestyle', 'corners', 'fadeedges', 'markercolour', 'framepattern', 'button', 'buttonshape', 'buttonstyle', 'buttonmedium', 'buttonquiet', 'tags', 'chosenitem', 'linewidth', 'cards', 'quotes', 'notes', 'fields', 'titlefinish', 'headitalics', 'headarrival', 'cardlight', 'buttonfinish', 'toppattern', 'guides', 'greytint', 'pageglow', 'movinglight', 'monitorframe', 'fringe', 'crisp', 'scanstyle', 'shimmer', 'warp', 'switchon', 'bloom', 'ghosting', 'jitter', 'graincrawl', 'typedtitle', 'bootscreen', 'roomglass', 'phosphor', 'static', 'dropout', 'headrule', 'ink', 'tooth', 'edges', 'columns', 'paragraphs', 'rainbow', 'postband', 'footband', 'menuline', 'legalline', 'stripes', 'sitename', 'fullpicture', 'categories', 'links', 'unlinked', 'preset', 'was', 'effects']);
	function cleanTweaks(all) {
		var out = {};
		Object.keys(all || {}).forEach(function (id) {
			var e = all[id], s = byId(id), clean = {};
			if (!s || !e || typeof e !== 'object') return;
			liftCentre(e, s);
			TWEAK_KEYS.forEach(function (k) { if (k !== 'roles' && k !== 'colours' && k !== 'effects' && e[k] !== undefined) clean[k] = e[k]; });
			/* The colours: two sides, three wells, hex alone; a value equal to the
			   style's own saved colour is no tweak. */
			/* AND THE MASK (Manuel, 2026-09-20: "I can't click on presets"). A style
			   that carries colours of its own, a site default or an own tile, leaves
			   them by masking each with an empty string (setCustom below, the way a
			   tint masks an own accent). Hex alone was kept here, so the mask was
			   dropped on the very next read, coloursOf found the style's colours
			   again, custom() stayed true and the switch sprang back to Eigene: on
			   such a style Voreinstellung could not be reached at all. An empty
			   string is kept for a well the style itself fills, and only there. */
			if (e.colours && typeof e.colours === 'object') {
				var colours = {};
				['light', 'dark'].forEach(function (side) {
					var c = e.colours[side]; if (!c || typeof c !== 'object') return;
					var keptC = {};
					['paper', 'ink', 'accent', 'button', 'head', 'kicker', 'ground', 'lift', 'marker', 'inverse', 'light', 'second'].forEach(function (k) { /* button, head, kicker, ground, lift, marker: the wells of 2026-09-26 */
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
						if (v !== rest || (window.architravePanelGuest && (s.host || s.bare))) kept[d] = v; /* a guest's own look keeps a pick equal to our rest (see setRole) */
					});
					if (Object.keys(kept).length) roles[role] = kept;
				});
				if (Object.keys(roles).length) clean.roles = roles;
			}
			/* THE EXTRAS' DETAILS: known effects and details, values from their list, and
			   only what differs from the style's own (or from the rest, where it names none). */
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
	/* ONE STEP BACK, AND THE ONE BEFORE IT (Manuel, 2026-09-19, "what would Apple do … ok do it"): every change the panel makes to a style goes through writeTweaks, so what stood before each write is kept, with the side, and Rückgängig puts it back; one wrong press on Zurücksetzen had lost a whole evening's tuning. A drag writes at every stop, so writes that follow each other within 0.7s are one step and what is kept is what stood before the first. Kept for the page's life only, forty deep; changing tile is not a change to a style and is not in it. */
	var HISTORY = [], FUTURE = [], lastPush = 0, undoing = false; /* FUTURE: what Undo took back, for Redo (2026-09-28, the lab's ⇧⌘Z) */
	function storedSide() { try { return localStorage.getItem('quire-side') || ''; } catch (e) { return ''; } } /* not `sideNow`: a variable of that name further down in this file shadowed the function, every save threw inside its own try, and nothing the panel changed was kept (caught by the undo test before it shipped) */
	/* WHAT A STEP CHANGED, so Undo can say it (2026-09-23, Apple's "Undo Typing"):
	   the first key of this style's tweaks that differs, a role's id when it was
	   a role, else the key itself. */
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
				versionSoon(); FUTURE = []; /* a new change ends what Redo could bring back */
				var nowMs = Date.now();
				if (nowMs - lastPush > 700) { HISTORY.push({ tweaks: was, side: storedSide(), style: current, what: changedKey(was, next) }); if (HISTORY.length > 40) HISTORY.shift(); }
				lastPush = nowMs;
			}
			/* nothing tweaked is no key at all (2026-09-26): '{}' broke "a dial at rest writes nothing" */
			if (next === '{}') localStorage.removeItem(TWEAKS_KEY); else localStorage.setItem(TWEAKS_KEY, next);
		} catch (e) { /* as above */ }
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

	/* THE FOCUS MODE IS THE THEME'S (2026-09-21, the panel's move to a plugin;
	   Manuel: "the focus mode stays with the theme"). It lived here from
	   2026-09-11; it is assets/js/focus-mode.js now, window.ArchitraveFocus,
	   loaded in the head before this file. The four names this object offered
	   (focus, motion, retime, setFocus) stay and hand over, so nothing that
	   called them has to know. */
	var Focus = window.ArchitraveFocus || { on: function () { return false; }, motion: function () { return 0; }, retime: function () { return 0; }, set: function () {} };

	// What <html> says for each dial, with the resting states named: the
	// default of every dial is the absence of its attribute.
	/* THE THREE COLOURS A PAIR IS AUTHORED FROM (Manuel, 2026-09-14): Papier,
	   Tinte, Akzent, per side. A style's own saved colours first, the
	   reader's wells over them. Empty where the pair's own colour stands. */
	function coloursOf(id) {
		var s = byId(id || current), tw = readTweaks()[(s && s.id) || current] || {}, out = { light: {}, dark: {} };
		['light', 'dark'].forEach(function (side) {
			/* A RECIPE MAY NAME A PRESET (2026-09-19): its six colours are the style's own, read from the list and not restated in the recipe. Not while the reader has let the preset go (a tweak's empty `preset`), when the colours are whatever they then set. */
			/* A RECIPE MAY NAME A PRESET AND A WELL OF ITS OWN BESIDE IT (2026-09-26, Gallery's second blue on its button): the preset's six come first, the recipe's own wells over them. */
			var named = (s && s.preset && tw.preset === undefined) ? presetById(s.preset) : null;
			var base = {}, t = (tw.colours && tw.colours[side]) || {};
			[(named && named[side]) || {}, (s && s.colours && s.colours[side]) || {}].forEach(function (src) { Object.keys(src).forEach(function (k) { if (src[k]) base[k] = src[k]; }); });
			['paper', 'ink', 'accent', 'button', 'head', 'kicker', 'ground', 'lift', 'marker', 'inverse', 'light', 'second'].forEach(function (k) { var v = t[k] !== undefined ? t[k] : base[k]; if (v) out[side][k] = v; });
		});
		/* PHOSPHOR (2026-09-30, Tube): a pick that turns the whole night screen one phosphor; it writes the night's paper, ink and accent over whatever the style and the reader set, and only for the style on the page (an export keeps the style's own). */
		if (!id || id === current) { var ph = PHOSPHOR[pickOf('phosphor')]; if (ph) { out.dark.paper = ph[0]; out.dark.ink = ph[1]; out.dark.accent = ph[2]; } }
		return out;
	}
	var PHOSPHOR = { blue: ['#3535a0', '#fcf9f3', '#fcf9f3'], green: ['#061a0c', '#62ff85', '#b6ffc4'], amber: ['#1a1104', '#ffb340', '#ffd48a'], white: ['#0f1012', '#ececec', '#ffffff'], black: ['#000000', '#fcf9f3', '#ffffff'] };
	/* THE COLOUR PRESETS (Manuel, 2026-09-16: "my point is having more colour
	   presets that people can choose from … let's say in the beginning: 20").
	   The five that were here are QDS modes, registered in the design system
	   with a light and a dark side each, which is why there were five: a new
	   one meant work in the system. These fifteen are not modes. They are what
	   the reader's own colours already are — a paper, an ink and an accent per
	   side — and the ladder mixes the rest from them, the canvas and the plane,
	   the fields and the rungs, the lines, the inverse and the focus. So a
	   preset is six values in a table, and the pair list holds twenty.

	   NAMED IN OUR OWN WORDS. Codex and tweakcn offer forty-odd looks under
	   names that belong to other projects; the colours are free to be inspired
	   by, the names are theirs, and this theme's code names no outside product.
	   These are materials and weathers, in the voice the first five speak:
	   Kreide, Sand, Leinen, Moos, Nebel.

	   Every pair is checked against the same gate the panel shows the reader:
	   ink on paper at 4.5:1 or better on both sides (tools/check-presets.py). */
	var PRESETS = [
		{ id: 'chalk', label: 'Salt morning', light: { paper: '#f7f7f5', ink: '#1f2124', accent: '#4a5568' }, dark: { paper: '#17181a', ink: '#e8e8e6', accent: '#9aa7b8' } },
		{ id: 'sand', label: 'Evening dune', light: { paper: '#f3e7d3', ink: '#2e2418', accent: '#a35a1f' }, dark: { paper: '#241c12', ink: '#eadfcb', accent: '#e0a35c' } },
		{ id: 'linen', label: 'Linen noon', light: { paper: '#f1efe6', ink: '#26261f', accent: '#6b6a4f' }, dark: { paper: '#1d1d18', ink: '#e6e4d8', accent: '#b5b489' } },
		{ id: 'moss', label: 'Jade valley', light: { paper: '#eaf0e6', ink: '#1c2a1c', accent: '#2f6b36' }, dark: { paper: '#141a14', ink: '#dfe8dc', accent: '#7fc98a' } },
		{ id: 'fog', label: 'Foggy morning', light: { paper: '#eceff3', ink: '#1f262e', accent: '#3d6b8f' }, dark: { paper: '#161a1f', ink: '#dfe6ee', accent: '#86b6dd' } },
		{ id: 'brick', label: 'Ember rock', light: { paper: '#f5e9e2', ink: '#2b1d18', accent: '#a8402a' }, dark: { paper: '#201715', ink: '#eddcd4', accent: '#e08268' } },
		{ id: 'cobalt', label: 'Blue hour', light: { paper: '#eef1f8', ink: '#16203a', accent: '#2743a8' }, dark: { paper: '#121727', ink: '#e1e7f5', accent: '#8ba3f5' } },
		{ id: 'olive', label: 'Cactus light', light: { paper: '#f0f0e2', ink: '#262a19', accent: '#5d6b1f' }, dark: { paper: '#1a1c14', ink: '#e5e7d5', accent: '#b6c563' } },
		{ id: 'meadow', label: 'Meadow morning', light: { paper: '#9dd36f', ink: '#2c2e2a', accent: '#1d4d0a' }, dark: { paper: '#2f4a25', ink: '#f5f1e4', accent: '#9dd36f' }, ground: { light: '#f5f1e4', dark: '#1e3218' }, lift: { light: '#ffffff', dark: '#43643a' } }, /* THE GREEN PAPER (Manuel, 2026-09-26, lab/storybook-goes-green.html: "those two fit together", A by day and C by night). By day the reference's green is the paper and its cream the rail around it, links a dark green (5.7:1 on the green); by night a deep green that stays dark, the cream its ink and the fresh green its links. The dark grey night is gone: the reference has none. */ /* ITS OWN GROUND AND LIFT (Manuel, 2026-09-26: "it's nice and green and we want it to be a little bit fun … the green and the sand, then nice white stuff on it"): the reference's fresh green around the paper and under the rail, white menus, buttons and filled boxes on the sand; by night a deep green around the dark paper (cream on it 7:1) and a lifted grey for the white. */ /* Storybook's (2026-09-26): the reference's cream paper and warm near-black by day, its fresh green #8ed462 darkened for links (5.1:1; the green itself holds 1.7); by night its ink becomes the paper, the cream the ink, and the green reads as it is (7.7:1) */
		{ id: 'lichen', label: 'Lichen night', light: { paper: '#f7f7f5', ink: '#222f30', accent: '#46731a' }, dark: { paper: '#222f30', ink: '#ffffff', accent: '#cef79e' } }, /* Specimen's (2026-09-26): the reference's off-white and green-black ink by day, its pale lime darkened for links (5.2:1; the lime itself holds 1.2); by night the ink becomes the paper, white the text, and the lime reads as it is (11.5:1) */
		{ id: 'corten', label: 'Corten field', light: { paper: '#b84b30', ink: '#f8f4e9', accent: '#ffffff' }, dark: { paper: '#5f1d1a', ink: '#f8f4e9', accent: '#f2b49c' } }, /* Terracotta's (2026-09-26): the reference's rust field with its cream writing by day (4.7:1) and white links (5.1:1; no other hue holds 4.5 on the rust); by night its bordeaux under the same cream (11.4:1), links a pale clay (7.0:1) */
		{ id: 'sandstone', label: 'Sandstone', light: { paper: '#f8f4e9', ink: '#b84b30', accent: '#5f1d1a' }, dark: { paper: '#b84b30', ink: '#f8f4e9', accent: '#ffffff' } }, /* Terracotta's lighter reading (2026-09-26): the reference's cream pages with rust writing by day (4.7:1) and bordeaux links (11.4:1); by night the rust field itself (4.7:1, white links 5.1:1) */
		{ id: 'plum', label: 'Mallow evening', light: { paper: '#f2ecf3', ink: '#271e2c', accent: '#6f3a80' }, dark: { paper: '#1b161e', ink: '#e8dfea', accent: '#c496d6' } },
		{ id: 'rust', label: 'Rust desert', light: { paper: '#f6ece3', ink: '#2c2018', accent: '#b4531d' }, dark: { paper: '#211915', ink: '#eee0d3', accent: '#e79355' } },
		{ id: 'navy', label: 'Sea night', light: { paper: '#edf0f2', ink: '#14212b', accent: '#0f4c70' }, dark: { paper: '#101a21', ink: '#dfe8ee', accent: '#6fb3d8' } },
		{ id: 'sage', label: 'Oasis light', light: { paper: '#ecf1ed', ink: '#1e2a22', accent: '#3f7a5c' }, dark: { paper: '#151b17', ink: '#e0e9e3', accent: '#85c9a6' } },
		{ id: 'charcoal', label: 'Grey hour', light: { paper: '#f0f0f0', ink: '#202020', accent: '#555555' }, dark: { paper: '#141414', ink: '#e4e4e4', accent: '#a0a0a0' } },
		{ id: 'midnight', label: 'Indigo night', light: { paper: '#eaecf4', ink: '#171a2e', accent: '#303c8c' }, dark: { paper: '#0f1120', ink: '#dfe2f0', accent: '#8f9bea' } },
		{ id: 'espresso', label: 'Earth shadow', light: { paper: '#f2ebe4', ink: '#241a14', accent: '#7a4a26' }, dark: { paper: '#1b1512', ink: '#e8ded4', accent: '#c89468' } },
		/* THE TILES' OWN (Manuel, 2026-09-19, Terminal's colour page stuck on Eigene: "for the tiles, we should always use a preset. In this case we probably won't have a preset. Therefore we should create one"). Terminal's and Blueprint's colours were written into their recipes as colours of their own, which the page reads as Eigene with no way back. They are presets now, named in the list's own voice, and the recipes name them. */
		{ id: 'carbon', label: 'Carbon night', light: { paper: '#f6f5f2', ink: '#1b1a1c', accent: '#3d4bb5' }, dark: { paper: '#1b1a1c', ink: '#f1f0ee', accent: '#9aa5e8' } },
		{ id: 'draft', label: 'Drafting blue', light: { paper: '#edf1f6', ink: '#23395f', accent: '#2a5bc0' }, dark: { paper: '#133a7c', ink: '#eaf1ff', accent: '#a9cbff' } },
		{ id: 'limelight', label: 'Lime night', light: { paper: '#f4f5f6', ink: '#08090a', accent: '#5c6300' }, dark: { paper: '#0f1011', ink: '#f4f6f8', accent: '#e4f222' } }, /* Instrument's (2026-09-20); the night ink a cool near-white since 1.3.312, so the softened text under it takes the reference's bluish grey */
		{ id: 'gallery', label: 'Gallery white', ground: 'paper', light: { paper: '#ffffff', ink: '#1d1d1f', accent: '#0066cc' }, dark: { paper: '#000000', ink: '#f5f5f7', accent: '#2997ff' }, lift: { dark: '#1d1d1f' }, frame: { dark: '#161617' } }, /* BLACK PAPER, GREY CARDS BY NIGHT (Manuel, 2026-09-26, lab/gallery-by-night.html, A with the box fixed + A2: the night "more like" the reference's dark product page): its black page with its dark grey cards #1d1d1f standing clearly off it, and on Architrave its footer grey #161617 as the ground, so the paper keeps its edge. The black no longer swallows the fills, because the cards, buttons and hovers take the lift instead of a mix of the paper. */ /* Gallery's (Manuel, 2026-09-26, "go"): the reference's white, its near-black ink and its link blue #0066cc (5.6:1 on white) by day; by night #121212 (black since, with its own lift: see above), a black that fills can show on (Manuel, the same day: cards, quotes and hovers "basically invisible" on #000000 — every fill is a step above the paper, and on true black it landed at #0a0a0a, which screens crush to black), with a sky blue that reads there (6.2:1) — the blue tint alone drew a signal blue, rgb 0 0 255 */
		{ id: 'bootblue', label: 'Boot blue', light: { paper: '#fcf9f3', ink: '#1a1a1a', accent: '#3535a0' }, dark: { paper: '#3535a0', ink: '#fcf9f3', accent: '#fcf9f3' } }, /* Tube's (2026-09-30): the boot screen's blue with cream type by night; by day the cream page with the blue as its accent */
		{ id: 'television', label: 'Television', light: { paper: '#e6e8ec', ink: '#14161a', accent: '#14161a' }, dark: { paper: '#0e1014', ink: '#e6eaf1', accent: '#ffffff' } }, /* A BREATH OF BLUE IN THE WHITE, NO BLUE LINK (2026-09-30, lab/the-tube.html): a black-and-white tube's phosphor leaned cool, and the set has no colour, so by day the accent is the ink */ /* Tube's (2026-09-30): white phosphor on near black by night, a light grey screen by day, the boot blue as the day's accent */
		{ id: 'newsprint', label: 'Newsprint', light: { paper: '#ebe3d1', ink: '#1c1a17', accent: '#1c1a17' }, dark: { paper: '#1e1a15', ink: '#f1e8d6', accent: '#f1e8d6' } }, /* Brochure's (2026-09-30): the aged white of a magazine page, its ink the accent too, as an advertisement's; by night the same page under a lamp */
		{ id: 'vellum', label: 'Vellum', light: { paper: '#f6f6f4', ink: '#2c2c26', accent: '#6f6c42' }, dark: { paper: '#23231f', ink: '#f2f1ea', accent: '#c9c48a' } }, /* Catalogue's (2026-09-24): the reference's warm cream and warm near-black by day; its link olive #7e7b4e held 4.0:1 on the cream, so one step darker (5.0:1). By night its dark footer's ground and a khaki from its tags. */
		/* THE LAB'S EIGHT NEW BOLD ONES (lab/the-panel-prototype.html, 2026-09-28): strong papers, shown with a New badge and always in the Bold group */
		{ id: 'vermilion', label: 'Vermilion', light: { paper: '#b82a16', ink: '#fff6ec', accent: '#ffe680' }, dark: { paper: '#2a0a06', ink: '#ffd9cc', accent: '#ff7a5c' }, fresh: true, group: 'bold' },
		{ id: 'ultramarine', label: 'Ultramarine', light: { paper: '#1f33c9', ink: '#f2f4ff', accent: '#ffd23f' }, dark: { paper: '#0a0f33', ink: '#dfe4ff', accent: '#8c98ff' }, fresh: true, group: 'bold' },
		{ id: 'cadmium', label: 'Cadmium yellow', light: { paper: '#ffd23f', ink: '#231c00', accent: '#b3124f' }, dark: { paper: '#1f1a05', ink: '#fff3c4', accent: '#ffd23f' }, fresh: true, group: 'bold' },
		{ id: 'flamingo', label: 'Flamingo', light: { paper: '#ffc9da', ink: '#3b0a1f', accent: '#b01d5c' }, dark: { paper: '#2a0b18', ink: '#ffe0ea', accent: '#ff79aa' }, fresh: true, group: 'bold' },
		{ id: 'viridian', label: 'Viridian', light: { paper: '#0b6358', ink: '#eafff9', accent: '#ffd59a' }, dark: { paper: '#062521', ink: '#cff5ec', accent: '#46d9c0' }, fresh: true, group: 'bold' },
		{ id: 'ultraviolet', label: 'Ultraviolet', light: { paper: '#ece2ff', ink: '#24005c', accent: '#6a12e8' }, dark: { paper: '#16002e', ink: '#eadcff', accent: '#c6ff3d' }, fresh: true, group: 'bold' },
		{ id: 'tangerine', label: 'Tangerine', light: { paper: '#ff8a1f', ink: '#1f0e00', accent: '#3d1a8f' }, dark: { paper: '#2a1300', ink: '#ffe3c7', accent: '#ff9a3d' }, fresh: true, group: 'bold' },
		{ id: 'lagoon', label: 'Lagoon', light: { paper: '#b6f0de', ink: '#0b3b33', accent: '#c2185b' }, dark: { paper: '#0a2a26', ink: '#c9f7ea', accent: '#6ff0c8' }, fresh: true, group: 'bold' }
	];
	/* THE ACCENT'S OWN LIST (Manuel, 2026-09-17: "we're going to pack more
	   accent colours on that list so that it somehow makes sense that it's an
	   own window. We should like the whole colour rainbow section there, like
	   the Tailwind colours. And then we should pick for our tiles the one that
	   is already in that colour list").

	   Twenty colours across the spectrum, each a pair: the one that reads on a
	   light paper and the one that reads on a dark one. The five the styles
	   have always used — Lila, Braun, Grün, Blau, Orange — are IN this list at
	   their own values, so a style whose accent is Lila finds itself here and
	   nothing on the site changed colour. The other fifteen fill the wheel
	   between them.

	   They are poured as an own accent, the same way the wheel's colour is:
	   nothing here touches the design system's tint registry, and a colour
	   chosen is the style's, per side. */
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
	/* THE SAME TWENTY, THREE TIMES (Manuel, 2026-09-16: "the asymmetry is weird
	   and we should solve that. The customisation could also be like a list for
	   ink and for paper … a list for paper, a list for ink, a list for accent.
	   Underneath all three we have the colour wheel").

	   One set of hues runs through all three lists, each at the lightness its
	   job asks for: a paper is the palest step of its hue, an ink the darkest,
	   an accent the one that carries. Per side they turn over, because a dark
	   room's paper is the darkest step and its ink the palest. So Blau means
	   the same colour in all three lists and in both sides; what changes is
	   how much of it there is.

	   THESE ARE NOT THE PRESETS' COLOURS (Manuel, 2026-09-16: "the
	   customisation area is completely not connected to our presets … even if
	   it's the same colour they are not connected any more. It's more like, by
	   accident, the same colour"). A preset is a made pair and it is chosen
	   whole; these are parts, and choosing one is leaving the preset. A row
	   here is marked only when the reader set it here.

	   NOTHING IS BLOCKED. An unreadable pair can be built out of these, and
	   that is the reader's to build; the contrast chip on the ink says what
	   the pair reads at (Manuel: "that's their choice and that's the whole
	   thing about customisation"). */
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
	var LISTS = { paper: PAPERS, ink: INKS, accent: ACCENTS, button: ACCENTS, head: ACCENTS, kicker: ACCENTS, ground: PAPERS, lift: PAPERS, marker: ACCENTS, light: ACCENTS, second: ACCENTS }; /* the button's, the roles' and the pen's own colours pick from the accent's twenty; the ground and the card from the paper's */
	/* WHICH ROW OF A LIST IS ON: the colour the style holds on both sides, found
	   in that list. A style wearing a preset holds the preset's colours, which
	   are not these, so nothing is marked; a style wearing its own tint holds no
	   colour at all, and nothing is marked either. Only what was set here is
	   marked here (Manuel, 2026-09-16, reversing the tint fallback of the day
	   before: "the answer is no"). */
	function listColourOf(key) {
		var c = coloursOf(), light = (c.light || {})[key], dark = (c.dark || {})[key];
		if (!light || !dark) return '';
		var hit = (LISTS[key] || []).filter(function (x) { return x.light === light && x.dark === dark; })[0];
		return hit ? hit.id : ''; /* a colour mixed on the wheel is in no list */
	}
	function accentById(id) { return ACCENTS.filter(function (a) { return a.id === id; })[0] || null; }
	/* The accent's own name for the list it stands in; the check mark of
	   2026-09-17, which followed a style's tint into the list, went with the
	   accent leaving the customisation area's neighbours (2026-09-16). */
	function accentColourOf() { return listColourOf('accent'); }
	function presetById(id) { return PRESETS.filter(function (p) { return p.id === id; })[0] || null; }
	function presetOf() {
		var s = byId(current), tw = readTweaks()[current];
		if (tw && tw.preset !== undefined) return tw.preset || '';
		return (s && s.preset) || '';
	}
	/* THE OTHER SIDE FOLLOWS (Manuel, 2026-09-15: "sometimes I like to start
	   with the dark side"). A pair has two sides; whichever side a colour is
	   set on first is the source, and the same colour on the other side is
	   derived from it until that side is touched itself: the hue and the
	   chroma kept, the lightness moved to where that side's papers and inks
	   stand (Neutral's paper #efece6 and ink #232323 by day, #373737 and
	   #e6e6e6 by night). Derived colours are never stored: a saved style
	   keeps only what was set, so the following side keeps following. */
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
		if (key === 'accent') return hex; /* the accent is the same colour on both sides; the ladder picks its ink */
		var o = hexToOklch(hex), L = o.L;
		if (toSide === 'dark') { if (key === 'paper') { L = 0.26 + (1 - L) * 0.6; o.C *= 0.7; } else L = 0.6 + (1 - L) * 0.4; } /* Neutral's #efece6 lands near its own night paper #373737 */
		else { if (key === 'paper') L = 0.82 + (1 - L) * 0.18; else L = 0.42 - 0.2 * L; }
		o.L = Math.max(0, Math.min(1, L));
		return oklchToHex(o);
	}
	/* The two sides as the page shows them: what was set, and on the other side what follows. */
	/* Whether this style's two sides are kept apart; linked at rest. */
	function unlinkedOf() {
		var s = byId(current), tw = readTweaks()[current];
		if (tw && typeof tw.unlinked === 'boolean') return tw.unlinked;
		return !!(s && s.unlinked);
	}
	/* THE ACCENT FOLLOWS THE SIDE (Manuel, 2026-09-18, Radarnacht: "I styled the
	   dark version … adjusted the accent, but when I click on the light
	   version it's the same accent. It looks wrong"). Until today the chain
	   carried the accent across unchanged, on the thought that the ladder
	   picks its ink; but a pale green made for a black paper is a pale green
	   on a pale paper too, and no ink under it makes a link readable. The
	   derived accent keeps its hue and chroma and moves in lightness, toward
	   the ink's end of that side, until it reads at 4.5:1 on that side's
	   paper; an accent that already reads is left alone. */
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
				/* the pen crosses over and is fitted to that side's paper below */
				if (out[from].marker && !out[to].marker && out.derived[from].indexOf('marker') === -1) { out[to].marker = out[from].marker; out.derived[to].push('marker'); }
			});
		});
		/* The accent last, once each side's paper is known: the pair's own paper
		   where the style sets none, read off the registry's swatch. */
		['light', 'dark'].forEach(function (side) {
			var paper = out[side].paper || paperOf(side);
			if (out.derived[side].indexOf('accent') !== -1) out[side].accent = accentForPaper(out[side].accent, paper);
			['button', 'head', 'kicker', 'light', 'second'].forEach(function (k) { if (out.derived[side].indexOf(k) !== -1) out[side][k] = accentForPaper(out[side][k], paper); }); /* the button's and the roles' own colours follow to the other side as the accent does */
			/* THE PEN FOLLOWS THE SIDE TOO (Manuel, 2026-09-26: a cream pen "is not really
			   adjusting. What works on dark is not working on light"). It kept one colour on
			   both sides, and the bar under the title, a line on the paper, all but vanished
			   on the other one. Now it keeps its hue and moves in lightness until it stands
			   at 3:1 on that side's paper, the measure for a line; a pen set by hand on both
			   sides keeps each. */
			if (out.derived[side].indexOf('marker') !== -1) out[side].marker = accentForPaper(out[side].marker, paper, 3);
		});
		return out;
	}
	function lum(hex) {
		var c = hex.replace('#', ''), v = [0, 2, 4].map(function (i) { var n = parseInt(c.substr(i, 2), 16) / 255; return n <= 0.03928 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4); });
		return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
	}
	function contrast(a, b) { var x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
	/* THE PAIR FROM THREE COLOURS: the design system's ladder in miniature.
	   Author the paper, the ink and the accent; the canvas and the plane,
	   the fields and the rungs, the second inks, the lines, the inverse and
	   the focus follow, mixed as the system mixes them. The steps stay the
	   room's. Named the theme's for now; the recipe belongs in QDS, as a
	   runtime pair, once it has been judged live. */
	/* THE SIDE WITHOUT A NAME (Manuel, 2026-09-17: "if I click for example on
	   blue, it doesn't change the link accent colour to blue"). Every rule
	   written here was hung on `[data-theme$="-light"]` or `-dark`, and a
	   reader who has never pressed Hell or Dunkel has no `data-theme` at all:
	   the site's rest state is the system's light room, written on :root with
	   no attribute to match. So none of a reader's own colours applied until
	   they touched the side switch — not the accent, not the paper, not a
	   preset. A light-side rule now also answers a root with no mode on it. */
	function sideSelectors(side, extra) {
		var on = 'html:root[data-colours="on"]';
		var list = [on + '[data-theme$="-' + side + '"]' + (extra || '')];
		if (side === 'light') list.push(on + ':not([data-theme])' + (extra || ''));
		return list;
	}
	function sideRule(side, extra, suffix, body) {
		return sideSelectors(side, extra).map(function (sel) { return sel + (suffix || ''); }).join(',') + '{' + body + '}';
	}
	/* HOW FAR A SURFACE STANDS FROM ITS PAPER (Manuel, 2026-09-16: "the ones you
	   created have quite dark grid lines compared to the paper, while Neutral
	   and Warmes Papier have much smaller contrast. I'm wondering how you
	   achieved that and why you chose that").

	   Because the recipe was a guess. The rail's ground was the paper carried a
	   PERCENTAGE OF THE WAY TO THE INK — 7% by day — and on the night side 40%
	   of the way to black, which is three times what any room does. A share of
	   the ink is the wrong measure: it makes the step as dark as the ink is, so
	   a preset with a deep ink got a deep rail, and the five rooms never did.

	   Measured, all ten sides of the five rooms move their surfaces by an
	   ABSOLUTE amount of lightness, in oklab, and by nearly the same amount
	   whichever side they are on (tools/check-steps.py prints the table):

	       canvas      -5      the rail's ground and the page behind the paper
	       plane       -2.5    the plane the paper lies on
	       navigation  -3.5 by day, -8 by night
	       subtle      -4.5    fields
	       raised       0 by day, +3 by night — a card is its paper by day

	   So the surfaces are stepped by lightness now, the hue and the chroma of
	   the paper kept, and a paper that is already black is left alone, which is
	   what Terminal does: its canvas IS its paper.

	   The second inks and the lines stayed fractions of paper-to-ink, which is
	   the right measure for them — a pale ink should give a pale second ink —
	   but they were measured too and moved: the rooms' secondary ink sits at
	   85% of the way to the ink where this wrote 75%, and their strongest line
	   at 29% where this wrote 26%. */
	function shade(hex, dL) {
		var o = hexToOklch(hex);
		o.L = Math.max(0, Math.min(1, o.L + dL));
		return oklchToHex(o);
	}
	/* THE GROUNDS SINK, THE FIELDS TURN OVER. A paper at black has nothing below
	   it: the canvas, the plane and the rail simply stay black, which is what
	   Terminal does, and a rail that is its own paper is a rail with no seam
	   rather than a rail with a wrong one. A field is different — it has to be
	   findable — so on a paper that cannot sink, a field rises by the same
	   amount instead, as Terminal's own fields do. */
	function sink(hex, d) { var o = hexToOklch(hex); return o.L <= 0.03 ? hex : shade(hex, -d); }
	/* HOW BIG A STEP HAS TO BE ON A DARK PAPER. Oklab's lightness is even to the
	   eye, but the screen runs out of room at the black end: five hundredths
	   above black is #020202, which is not a field, it is black. The rooms know
	   this — Terminal lifts its fields by twenty and its cards by twenty-four,
	   where Neutral's night side moves them by four and one. So a step grows as
	   the paper approaches black, from what an ordinary night paper takes to
	   what a black one needs, and it is the same curve for each of them. */
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
	/* A pair's tokens as one declaration block, for its side on the root and for
	   the dark ground's two scopes (THE DARK GROUND). */
	/* What a set says about its own grounds, for its side (pairBody, pairCss). */
	function pairLooks(c, side) {
		/* THE GROUND CAN BE THE PAPER (Manuel, 2026-09-26, Gallery on TT5: the page
		   came out #eeeeee under a white paper). A set that says ground: 'paper'
		   keeps the page itself on the paper, as the white-gallery reference does;
		   every other set sinks the ground a step below it, as before. */
		var pre = PRESETS.filter(function (x) { return x.id === presetOf(); })[0], flat = !!(window.architravePanelGuest && pre && pre.ground === 'paper');
		/* A SET MAY NAME ITS OWN GROUND AND LIFT (Manuel, 2026-09-26, Storybook:
		   "the green and the sand, then nice white stuff on it"). ground[side] is
		   the page around the paper and under the rail, instead of a step sunk
		   below the paper; lift[side] is what stands on the paper (menus, buttons,
		   filled boxes, the hover), instead of a mix darker than it. Only while
		   the set's own paper and ink are in use: a set the owner has recoloured
		   goes back to the derived grounds, since a green chosen for a sand paper
		   says nothing about another. */
		var mine = pre && pre[side] && String(c.paper).toLowerCase() === pre[side].paper && String(c.ink).toLowerCase() === pre[side].ink;
		/* THE GROUND AND THE CARD AS ROWS (Manuel, 2026-09-26, round one of the settings plan, "go with your recommendation"): Colour › Custom has a Ground row and a Card row, wells `colours.<side>.ground` and `.lift`, which stand before the set's own. */
		var G = c.ground || (mine && pre.ground && typeof pre.ground === 'object' ? pre.ground[side] : ''), F = c.lift || (mine && pre.lift ? pre.lift[side] : '');
		/* A GROUND FOR THE FRAME ONLY (Manuel, 2026-09-26, Gallery by night, A2): a set whose ground is the paper on other themes may still name the ground Architrave draws around its paper, frame[side], so the paper does not melt into the page there. */
		if (!G && mine && pre.frame && pre.frame[side] && !window.architravePanelGuest) G = pre.frame[side]; /* GUESTS ONLY (Manuel, 2026-09-26, "keep going" on the recommendation): on another theme the ground IS the page; on Architrave it is the frame around the paper, and a white one would erase the paper's edge */
		return { flat: flat, G: G, F: F };
	}
	function pairBody(c, side) {
		var P = c.paper, I = c.ink, Ig = c.grey || I, dark = lum(P) < lum(I); /* Ig: the ink the greys are mixed from, the ink itself unless the greys are tinted (greyTinted) */
		var mix = function (a, b, pct) { return 'color-mix(in oklab, ' + a + ', ' + b + ' ' + pct + '%)'; };
		var k = pairLooks(c, side), flat = k.flat, G = k.G, F = k.F;
		return '' +
			'color-scheme:' + (dark ? 'dark' : 'light') + ';' +
			'--surface-base:' + P + ';--text-primary:' + I + ';' +
			'--surface-canvas:' + (G || (flat ? P : sink(P, 0.05))) + ';' +
			'--surface-plane:' + (G || (flat ? P : sink(P, 0.025))) + ';' +
			'--surface-navigation:' + (G || sink(P, dark ? 0.08 : 0.035)) + ';' +
			'--surface-subtle:' + (F || field(P, 0.045, 0.20)) + ';' +
			(F ? '--surface-floating:' + F + ';--ldp-lift:' + F + ';' : '') + /* --ldp-lift: the theme's own shaded boxes take the card colour on other themes (panel.php) */
			/* A card is its paper by day and a step above it by night; the darker
			   the night paper, the further the step, because on a black paper a
			   card at three hundredths is no card at all (Terminal lifts its own
			   by twenty-four). */
			'--surface-raised:' + (dark ? shade(P, rise(P, 0.03, 0.24)) : P) + ';' +
			'--surface-hover:' + (F || 'color-mix(in srgb, ' + P + ', ' + Ig + ' var(--step-surface-hover, 6%))') + ';' +
			'--surface-selected:color-mix(in srgb, ' + P + ', ' + Ig + ' var(--step-surface-selected, 10%));' +
			'--surface-pressed:color-mix(in srgb, ' + P + ', ' + Ig + ' var(--step-surface-pressed, 16%));' +
			'--surface-track:color-mix(in srgb, ' + P + ', ' + Ig + ' var(--step-surface-hover, 6%));' +
			'--surface-track-selected:color-mix(in srgb, ' + P + ', ' + Ig + ' var(--step-track-selected, 12%));' +
			'--text-secondary:' + mix(Ig, P, 15) + ';--text-muted:' + mix(Ig, P, 25) + ';--text-subtle:' + mix(Ig, P, 61) + ';--text-disabled:' + mix(Ig, P, 72) + ';' +
			'--border-subtle:' + mix(P, Ig, 7) + ';--border-default:' + mix(P, Ig, 14) + ';--border-strong:' + mix(P, Ig, 29) + ';--border-control:' + mix(P, Ig, 52) + ';' +
			'--code-surface:' + (F && dark ? F : field(P, dark ? 0.06 : 0.04, 0.12)) + ';' + /* by night a set's own lift is the code's box too (2026-09-26, Gallery's black paper: the field came out #060606) */ '--code-plain:' + I + ';' +
			'--surface-inverse:' + I + ';--surface-inverse-subtle:' + mix(I, P, 10) + ';--text-inverse:' + P + ';--text-inverse-subtle:' + mix(P, I, 35) + ';--border-inverse:' + mix(I, P, 30) + ';' +
			'--ink-alpha-weak:rgb(from ' + I + ' r g b / 0.06);--ink-alpha-soft:rgb(from ' + I + ' r g b / 0.12);--ink-alpha-medium:rgb(from ' + I + ' r g b / 0.24);--ink-alpha-strong:rgb(from ' + I + ' r g b / 0.48);' +
			'--mode-swatch:' + P + ';' +
			'--toggle-knob-ink:' + (dark ? I : 'var(--surface-raised)') + ';';
	}
	/* The cards that wear a set's lift and are only read (pairCss). */
	var LIFT_CARDS = ' :is(.support-box, .about-numbers, .release-panel, .release-archive-card, :is(.post-card.format-quote, .single-format-quote .single-post-article .wp-block-post-content) blockquote.wp-block-quote)';
	function pairCss(side, c) {
		var P = c.paper, I = c.ink, dark = lum(P) < lum(I);
		var mix = function (a, b, pct) { return 'color-mix(in oklab, ' + a + ', ' + b + ' ' + pct + '%)'; };
		var k = pairLooks(c, side), G = k.G, F = k.F;
		var css = sideRule(side, '', '', pairBody(c, side)) +
			/* The switches read the scheme, not the side's name (Manuel, 2026-09-14, a
			   light paper on a pair's dark side: a black groove cut into it). */
			sideRule(side, '', ' .quire-segmented:not(:where(.reading-panel, .reading-panel *))', dark
				? '--groove-page:color-mix(in srgb, var(--interaction-surface, var(--surface-canvas)), var(--text-primary) var(--step-surface-hover, 10%));--chip-page:color-mix(in srgb, var(--interaction-surface, var(--surface-canvas)), var(--text-primary) var(--step-surface-pressed, 24%));'
				: '--groove-page:color-mix(in srgb, var(--interaction-surface, var(--surface-canvas)), var(--text-primary) var(--switch-groove, 10%));--chip-page:var(--surface-raised);');
		if (c.accent) css += accentCss(side, c.accent, P, I);
		/* THE LIFT STANDS ON THE PAPER: the buttons and the filled boxes rest on
		   it instead of on the paper's darker rung (hover, press, open and
		   pressed keep their own rungs, so a press still reads). Only with Fills
		   on; Fills off means no fill, whatever the set says. */
		/* WHAT ANSWERS THE POINTER AND WHAT DOES NOT (Manuel, 2026-09-26, the
		   support card on Storybook: "they have a hover now … I don't know if
		   that's intended"). It was not: the cards shared the buttons' list,
		   which lets go of the lift under the pointer so a button's own hover
		   shows, and a card that cannot be pressed turned grey when touched.
		   The buttons and the link card keep that; the cards that are only
		   read wear the lift always. The paper's corner squares join the
		   buttons (the same day: the collapse and comments squares stood grey
		   beside a white search and contents square). */
		if (F) css += sideRule(side, ':not([data-fills="off"])', ' :is(.quire-button:not(.primary, .ghost, .comments-pill), .comments-open-btn, .paper-stack-btn, .post-link-card, .quire-badge:not(.comments-count), .quire-search-field):not(:hover, :active, [aria-expanded="true"], [aria-pressed="true"]):not(:where(.reading-panel, .reading-panel *, .architrave-panel-opener))', 'background-color:' + F + ';');
		/* The collapse square says aria-expanded="true" while the rail is out, which is its state and not a press, so the corner squares let go of the lift only under the pointer. */
		if (F) css += sideRule(side, ':not([data-fills="off"])', ' :is(.rail-collapse-btn, .rail-collapse-corner .quire-icon-button, .rail-expand .quire-icon-button, .rail-expand-search .quire-icon-button):not(:hover, :active):not(:where(.reading-panel, .reading-panel *, .architrave-panel-opener))', 'background-color:' + F + ';');
		/* THE HOVER STAYS ON THE LIFT (Manuel, 2026-09-26, the link card and the
		   corner squares on Storybook's green: "that feels a little bit intense,
		   that hover"; A, "white cards", a very light grey under the pointer).
		   Letting go of the lift dropped them onto the paper's rungs, a muddy
		   darker green. Now the pointer, the open state and the press are the
		   system's own rungs mixed from the lift instead of the paper, so white
		   turns a light grey (half a rung, 3 %, could not be seen on white). */
		var NOT_PANEL = ':not(:where(.reading-panel, .reading-panel *, .architrave-panel-opener))';
		var rung = function (step) { return 'background-color:color-mix(in srgb, ' + F + ', ' + I + ' var(' + step + '));'; };
		if (F) {
			var LIFTED = ' :is(.quire-button:not(.primary, .ghost, .comments-pill), .comments-open-btn, .paper-stack-btn, .post-link-card, .quire-badge:not(.comments-count), .quire-search-field, .rail-collapse-btn, .rail-collapse-corner .quire-icon-button, .rail-expand .quire-icon-button, .rail-expand-search .quire-icon-button)';
			css += sideRule(side, ':not([data-fills="off"])', LIFTED + ':hover' + NOT_PANEL, rung('--step-surface-hover'));
			css += sideRule(side, ':not([data-fills="off"])', LIFTED + ':is([aria-expanded="true"], [aria-pressed="true"]):not(.rail-collapse-btn, .quire-icon-button)' + NOT_PANEL, rung('--step-surface-selected'));
			css += sideRule(side, ':not([data-fills="off"])', LIFTED + ':active' + NOT_PANEL, rung('--step-surface-pressed'));
		}
		if (F) css += sideRule(side, ':not([data-fills="off"])', LIFT_CARDS + ':not(:where(.reading-panel, .reading-panel *, .architrave-panel-opener))', 'background-color:' + F + ';');
		/* A BUTTON ON A CARD STANDS A RUNG ABOVE IT (Manuel, 2026-09-26, Storybook:
		   "the buttons ??? fix it everywhere"). The card and its buttons both wore
		   the lift, white on white, so the Gray buttons, badges and fields inside a
		   lifted card, a code block or a menu rest one rung up from the lift and
		   step on from there, the system's own rule for a button on a card. */
		if (F) {
			var ON_CARD = ' :is(' + LIFT_CARDS + ', .single-post-article .wp-block-post-content .code-block, .quire-menu, .rail-more-menu, .rail-more-sub, .paper-stack-menu) :is(.quire-button:not(.primary, .ghost, .comments-pill), .quire-badge:not(.comments-count), .quire-search-field)' + NOT_PANEL;
			css += sideRule(side, ':not([data-fills="off"])', ON_CARD, rung('--step-surface-hover'));
			css += sideRule(side, ':not([data-fills="off"])', ON_CARD.replace(')' + NOT_PANEL, '):hover' + NOT_PANEL), rung('--step-surface-selected'));
			css += sideRule(side, ':not([data-fills="off"])', ON_CARD.replace(')' + NOT_PANEL, '):active' + NOT_PANEL), rung('--step-surface-pressed'));
		}
		/* THE CODE BLOCK STANDS ON IT TOO (Manuel, 2026-09-26, Storybook's green
		   paper: the block was a darker green with teal and green code on it, hard
		   to read). The block names its ground once (--interaction-surface) and its
		   controls and its fade read it, so the lift goes there, not on the fill. */
		if (F) css += sideRule(side, ':not([data-fills="off"])', ' .single-post-article .wp-block-post-content .code-block', '--interaction-surface:' + F + ';');
		/* And the menus stand on it, as the reference's white bar stands on its
		   green: their rows' hover, press and switches are mixed from it. */
		if (F) css += sideRule(side, '', ' :is(.quire-menu, .rail-more-menu, .rail-more-sub, .paper-stack-menu, .quire-tooltip-bubble):not(:where(.reading-panel, .reading-panel *, .architrave-panel-opener))', 'background-color:' + F + ';--interaction-surface:' + F + ';');
		/* THE RAIL'S QUIET WORDS ARE MIXED FROM ITS OWN GROUND: mixed from the
		   paper they came out sand-grey on the green. */
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
	/* A COLOUR SET BY HAND LETS THE PRESET GO (2026-09-26, found with the Ground
	   row on Storybook: a chip under Custom threw the page back to Preset). A
	   preset the TWEAK named simply goes; a preset the RECIPE names has to be
	   masked with the empty string, as setCustom masks it, or presetOf() finds
	   the recipe's again and Custom is gone with the next press. */
	function letGoPreset(entry) { var s = byId(current); if (s && s.preset) entry.preset = ''; else delete entry.preset; }
	var COLOURS_STYLE = 'architrave-own-colours';
	/* TINT THE GREYS (PICKS `greytint`, the extras, 2026-09-29): the paper takes a
	   third of the share of the accent and every grey is mixed from an ink that
	   takes the whole share, so the page leans toward the accent while the ink
	   itself, and with it the reading contrast, stays. Only where the style's
	   pair and accent are known here; a style without its own colours keeps the
	   system's greys. The mix is Oklab's, as the stylesheet's color-mix. */
	function mixHex(a, b, w) {
		var x = hexToOklch(a), y = hexToOklch(b), lab = function (o) { return [o.L, o.C * Math.cos(o.h), o.C * Math.sin(o.h)]; };
		var p = lab(x), q = lab(y), m = [0, 1, 2].map(function (i) { return p[i] + (q[i] - p[i]) * w; });
		return oklchToHex({ L: m[0], C: Math.sqrt(m[1] * m[1] + m[2] * m[2]), h: Math.atan2(m[2], m[1]) });
	}
	function greyTinted(v) {
		var t = +pickOf('greytint') || 0, hex = /^#[0-9a-f]{6}$/i, by = effectOf('tint').colour; /* the tint's colour (effects.tint): Light, Second light or the accent; an unset light is the accent */
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
			else if (v.accent) css += accentCss(side, v.accent, null, null); /* an accent alone: its ink by its own lightness, the pair's paper unknown here */
			/* THE BUTTON'S OWN COLOUR: two tokens on the root, spent by style.css
			   under data-button="own" on the filled controls alone (their writing
			   is whichever of paper and ink holds better on it, as the accent's). */
			if (v.button) css += sideRule(side, '', '', buttonBody(v.button, v.paper || null, v.ink || null));
			/* THE BUTTON'S COLOUR ON A CARD OF THE SAME COLOUR (Manuel, 2026-09-26,
			   Storybook's white button on its white support card): where the
			   button's own colour cannot be told from the lift, the filled button
			   on a lifted card wears the paper instead, or the ink when the paper
			   stands too close to the card as well. */
			if (v.button && v.paper && v.ink) {
				var LF = pairLooks(v, side).F;
				if (LF && contrast(v.button, LF) < 1.3) css += sideRule(side, ':not([data-fills="off"])', LIFT_CARDS, buttonBody(contrast(v.paper, LF) >= 1.3 ? v.paper : v.ink, v.paper, v.ink));
			}
			/* THE ROLES' OWN COLOURS: one token each, spent by the role's colour token (applyRoles). */
			if (v.head) css += sideRule(side, '', '', '--head-own-colour:' + v.head + ';');
			/* THE STYLE'S TWO LIGHTS (the extras' details, 2026-09-29): Light and Second light, spent by style.css as --fx-light / --fx-second, the accent (and the accent turned) where unset. */
			if (v.light) css += sideRule(side, '', '', '--fx-light-own:' + v.light + ';');
			if (v.second) css += sideRule(side, '', '', '--fx-second-own:' + v.second + ';');
			/* THE PEN OF YOUR OWN (2026-09-26): the pen, the ink read over it (dark on a
			   light pen, light on a dark one) and the bar's deeper tone for the day. */
			if (v.marker) css += sideRule(side, '[data-marker-colour="own"]', '', markerBody(v.marker));
			if (v.kicker) css += sideRule(side, '', '', '--kicker-own-colour:' + v.kicker + ';');
		});
		/* THE DARK GROUND'S OWN COLOURS: the night side on the ground, the day
		   side given back to the paper (see THE DARK GROUND). */
		if (c.light.paper && c.light.ink && c.dark.paper && c.dark.ink) {
			var on = 'html:root[data-colours="on"]';
			css += on + ' .ground-dark{' + pairBody(c.dark, 'dark') + (c.dark.accent ? accentBody(c.dark.accent, c.dark.paper, c.dark.ink) : '') + '}' +
				on + ' .ground-light{' + pairBody(c.light, 'light') + (c.light.accent ? accentBody(c.light.accent, c.light.paper, c.light.ink) : '') + '}';
		}
		/* THE DARK GROUND'S OWN COLOUR (the lab's Ground colour under Dark ground,
		   2026-09-28): by day the ground takes this colour instead of the night's
		   paper, with whichever of the night's ink and the day's paper reads better
		   on it, and the night's accent fitted to it. Nothing while it is unset. */
		if (c.light.inverse) {
			var GP = c.light.inverse, GI = [c.dark.ink, c.light.paper, '#ffffff', '#111111'].filter(Boolean).reduce(function (best, x) { return contrast(x, GP) > contrast(best, GP) + 0.5 ? x : best; });
			var GA = accentForPaper(c.dark.accent || c.light.accent || GI, GP);
			css += 'html:root[data-darkground="on"] .ground-dark{' + pairBody({ paper: GP, ink: GI, ground: GP }, lum(GP) < lum(GI) ? 'dark' : 'light') + accentBody(GA, GP, GI) + '}';
		}
		/* A DARK ROOM ON THE PAGE TAKES THE STYLE'S NIGHT ACCENT (2026-09-26,
		   Manuel, the newsletter page's Subscribe in the tint's orange while the
		   style had its own colours: "not really connected to the styles"). The
		   theme's night page is Neutral dark as a class, and its accent rules read
		   the TINT (:root[data-tint] .newsletter-night), which a style's own colours
		   never reach. Any neutral dark room on the page, outside the panel, now
		   takes the style's dark-side accent, its writing by the accent's own
		   lightness and its muted rung mixed from the room's own ground. */
		if (c.dark.accent) css += 'html:root[data-colours="on"]:not([data-accent="off"]) .theme-neutral-dark:not(:where(.reading-panel, .reading-panel *, .architrave-panel-opener)){' + accentBody(c.dark.accent, null, null) + '}';
		var el = document.getElementById(COLOURS_STYLE);
		if (!el && css) { el = document.createElement('style'); el.id = COLOURS_STYLE; (document.head || root).appendChild(el); }
		if (el && el.textContent !== css) el.textContent = css;
		if (typeof markerLine === 'function' && document.readyState !== 'loading') markerLine(); /* your own paper may have changed under the pen's bar (THE BAR ON A STRONG PAPER) */
		if (css) { if (root.getAttribute('data-colours') !== 'on') root.setAttribute('data-colours', 'on'); }
		else root.removeAttribute('data-colours');
		/* AN ACCENT YOU PICKED, SAID ON THE ROOT FOR A GUEST (2026-09-24, the audit: on
		   Twenty Twenty-Five the article's links wear the text colour, so an accent
		   had nothing to show on). The guest sheet colours the article's links with it. */
		var tw = (readTweaks()[current] || {}).colours || {};
		var ownAccent = window.architravePanelGuest && ((tw.light && tw.light.accent) || (tw.dark && tw.dark.accent));
		if (ownAccent) root.setAttribute('data-accent-own', ''); else root.removeAttribute('data-accent-own');
	}
	/* THE DARK GROUND (Manuel, 2026-09-26, for Specimen: "yes" to the reference's
	   black band at the foot, a light page ending on rounded corners over it).
	   Architrave has no foot: its page is the paper lying on a ground, the rails
	   on the ground beside it. So the switch hands the GROUND the style's night
	   side and gives the paper its day side back: the body wears the dark
	   pair's class (every pair is written for `:root[data-theme=…]` AND
	   `.theme-…`, so a pair can be worn by one element, as the panel wears
	   its own), the paper and the buttons on its corners wear the light one.
	   By day only (by night it is all dark already), and only while the frame
	   is drawn: on a phone there is no ground to see, and the body's class
	   would darken the whole page. Your own colours follow through the
	   `.ground-dark` / `.ground-light` rules applyColours writes. On other
	   themes the guest sheet darkens the footer instead (panel-page.css). */
	/* THE BAR ON A STRONG PAPER (Manuel, 2026-09-26, Terracotta: the highlighter
	   "should also be there … what would be the best color?"). The bar under a
	   title takes a deeper tone of the pen by day, made for a light paper; on
	   Terracotta's rust every one of them stood at 1.5:1 and the bar all but
	   vanished. So when the paper itself is not light, the bar takes the pen,
	   as it does by night (3.0 to 4.4:1 on the rust). Read from the paper as it
	   is drawn, so a colour set and your own colours are judged alike. */
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
	/* WHAT THE READING TEXT'S AND THE DATE'S PENS MARK IS READ IN THE BETTER OF
	   PAPER AND INK (2026-09-26). The date's rung is half see-through on some
	   pairs (Standard: the ink at 50 %), and paper letters on it stood at 3.2:1
	   by day; on Terracotta the paper holds and the ink does not. So the pen is
	   read as it is drawn, over the paper, and the one of the two that stands
	   higher on it writes the marked words and the selection.
	   AND THE WASH MOVES UNTIL THEY READ (Manuel, 2026-09-26, "yes" to a softer
	   wash for the date's pen). Neither held 4.5:1 on a mid-tone pen (Standard
	   by night, 3.1:1). The bar keeps the pen; the wash behind marked words
	   steps away from the letters, toward the paper for ink letters or toward
	   the ink for paper letters, until they read at 4.5:1, and of the two the
	   one that moves the least is taken, so the wash stays nearest the pen. */
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
			new MutationObserver(markerLine).observe(root, { attributes: true, attributeFilter: ['data-theme', 'data-marker', 'data-style', 'data-colours', 'data-preset', 'data-marker-colour', 'data-soft', 'data-soft-level', 'data-quiet-level', 'data-small-soft', 'style'] }); /* the last five for the text and date pens' ink (markerInk) */
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
		/* A GUEST HAS A FOOT: its footer part wears the night, at every width. */
		if (GUEST) { wear(document.querySelector('.wp-site-blocks > footer'), night, 'ground-dark'); return; }
		if (!body.classList.contains('has-frame') || (GROUND_WIDE && !GROUND_WIDE.matches)) return;
		wear(body, night, 'ground-dark');
		Array.prototype.forEach.call(document.querySelectorAll(ON_PAPER), function (el) { wear(el, day, 'ground-light'); });
	}
	/* EVERYTHING THAT STANDS ON THE PAPER WITHOUT LIVING IN IT (Manuel,
	   2026-09-26: "the buttons in the top left change their color depending
	   on whether the rail is closed or open"). The corner squares are pinned
	   over the paper but printed outside it (wp_footer), so they inherit the
	   ground, not the paper, and each one has to wear the day by name. The
	   list named the collapse square and forgot the two that take its place
	   while the rail is away, the expand square and its search: shut, they
	   stood in the night's colours on a day paper. Any new square pinned on
	   the paper goes on this list, or it wears the ground. */
	var ON_PAPER = '.frame-paper, .paper-stack, .rail-collapse-corner, .rail-expand, .rail-expand-search, .comments-open';
	(function () {
		var go = function () {
			applyGround();
			new MutationObserver(applyGround).observe(root, { attributes: true, attributeFilter: ['data-theme', 'data-darkground'] });
			if (GROUND_WIDE) { if (GROUND_WIDE.addEventListener) GROUND_WIDE.addEventListener('change', applyGround); else GROUND_WIDE.addListener(applyGround); }
		};
		if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
	})();
	/* The pair's own paper on a side, for the readouts and an accent set alone: the registry's swatch. */
	function paperOf(side) {
		var pal = String(root.getAttribute('data-theme') || (Modes ? Modes.default : 'neutral-light')).split('-')[0];
		var m = ((Modes && Modes.modes) || []).filter(function (x) { return x.palette === pal && x.side === side; })[0];
		return (m && m.swatch) || (side === 'dark' ? '#373737' : '#ffffff'); /* Neutral's day paper is white since 2026-09-19 */
	}
	applyColours();

	function now() {
		var mode = root.getAttribute('data-theme') || (Modes ? Modes.default : 'neutral-light');
		return {
			palette: String(mode).split('-')[0],
			reading: root.getAttribute('data-reading') || 'default',
			/* ON A GUEST, NO FACE IS THE HOST'S FACE (2026-09-22), not Newsreader:
			   a guest writes data-face for every chosen face including the
			   default (reading-face.js), so its absence is a page nobody has
			   touched, and a bare tile records that as 'host' so a save keeps
			   the host's face and a later press of Newsreader is a choice. */
			face: root.getAttribute('data-face') || (window.architravePanelGuest ? 'host' : 'newsreader'),
			leading: root.getAttribute('data-leading') || 'default'
		};
	}
	function same(a, b) {
		return DIALS.every(function (d) { return a[d] === b[d]; });
	}
	// The dials a style wants: its recipe, or the reader's own version of it.
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
	/* ONE LOOK DISSOLVES INTO THE NEXT (Manuel, 2026-09-22, pointing at the
	   light/dark switch on jakubantalik.com: "can we make a transition between
	   the tiles like on the inspiration"). The browser's own view transition
	   does it: it photographs the page, lets the change happen, and cross-fades
	   the two. Nothing in this file has to know what moved, which is the point,
	   because a look moves everything at once. Where the browser has no such
	   thing, or the reader has asked for less motion, the change simply happens
	   as it always did. */
	function slowly(change) {
		var quiet = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (quiet || !document.startViewTransition) { change(); return; }
		try {
			var t = document.startViewTransition(change);
			/* A transition the browser decides to skip rejects its promise; that is
			   not a fault and the change has happened either way. */
			if (t && t.finished && t.finished.catch) t.finished.catch(function () {});
			if (t && t.updateCallbackDone && t.updateCallbackDone.catch) t.updateCallbackDone.catch(function () {});
			if (t && t.ready && t.ready.catch) t.ready.catch(function () {});
		} catch (e) { change(); }
	}
	var applying = false, applyTimer = null;
	function apply(s, dials) {
		if (s && s.host) { goHome(); return; } /* not a look: see THE THEME'S OWN LOOK above */
		slowly(function () { applyNow(s, dials); });
	}
	function applyNow(s, dials) {
		if (versionTimer && s && s.id !== current) versionNow();
		applying = true;
		stamp(s.id);
		press('[data-quire-modes="palette"] [data-palette="' + dials.palette + '"]');
		/* THE SIDE IS THE READER'S, NEVER THE STYLE'S (Manuel, 2026-09-12: "I
		   change my mind … whatever is set up on that colour mode, that is
		   what we see"). From 2026-09-11 to this morning a style pressed a
		   side of its own (Terminal dark, Book and Poster light); now the
		   Hell/Dunkel/System switch alone says which side every style shows,
		   and it rests on System, so a first visit reads the device. */
		press('[data-reading-step="' + dials.reading + '"]');
		/* A BARE TILE (saved from the theme's own look, a guest) whose face is
		   'host' presses no reading face: nothing was chosen when it was saved,
		   and the article stays in the theme's own until the reader picks one.
		   One saved with a face chosen (Vollkorn under the theme's own look, then
		   Save) carries it like any tile (2026-09-22; until then every bare tile
		   lost the face it was saved with). */
		if (s.bare && dials.face === 'host') { root.removeAttribute('data-face'); try { localStorage.removeItem('architrave-face'); } catch (e) { /* private mode */ } }
		else press('[data-face-choice="' + dials.face + '"]');
		press('[data-leading-step="' + dials.leading + '"]');
		/* THE GUARD HOLDS UNTIL THE PAIR HAS LANDED (the audit, 2026-09-13):
		   color-mode.js swaps the palette inside a view transition after the
		   press returns, so a guard cleared here let the observer record the
		   OLD pair against the new style for one beat, and for good where no
		   palette row exists. The data-theme record clears it; a timer does
		   where nothing ever lands. */
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

	/* A READER'S PRESS ON A DIAL IS A TWEAK OF THE STYLE THAT IS ON. Recorded
	   from the press itself, once the dial's own script has answered it, and
	   never from a change the page made on its own. */
	function remember() {
		var s = byId(current), all = readTweaks(), dials = now();
		if (!s || s.host) return; /* the theme's own look is not a look, so a press under it is the dial's own and no tweak of a tile (a guest, 0.9.0) */
		/* EVERYTHING THAT IS NOT A DIAL TRAVELS WITH THE RECORD (Manuel,
		   2026-09-16: the colours went back to the style's own the moment he
		   changed sides). This rebuilt the record from a hand-written list of
		   keys, and the keys added since — the colours, the chain between the
		   sides, the pictures, the drop cap's height — were not on it, so a
		   dial's press, or the side switch the observer reads as one, dropped
		   them. The whitelist the record is read through says what a record
		   holds; the dials are set here, the rest is carried over. */
		var entry = {}, held = all[s.id] || {};
		TWEAK_KEYS.forEach(function (k) { if (DIALS.indexOf(k) === -1 && held[k] !== undefined) entry[k] = held[k]; });
		if (!same(dials, s)) DIALS.forEach(function (d) { entry[d] = dials[d]; });
		if (Object.keys(entry).length) all[s.id] = entry; else delete all[s.id];
		/* Nothing written when nothing changed (the audit): the observer
		   calls this on every attribute echo. */
		if (JSON.stringify(all) !== JSON.stringify(readTweaks())) writeTweaks(all);
		applyOptions(); /* the lines follow the pair (2026-09-12) */
		mark();
	}

	// Book joined 2026-09-09 (1.1.647), the first style made properly and seen
	// live; Terminal 2026-09-11 (1.1.815), after two days on the backstage.
	// STANDARD ALONE since 2026-09-20 (Manuel: "Let's hide all the tiles except
	// standard"). The others stay in STYLES, so a stored choice and a link still
	// find them. Was: ['standard', 'book', 'large',
	// 'console', 'terminal', 'blueprint']. Instrument (2026-09-20) arrived hidden and was shown an hour later.
	// The backstage door (`?backstage`, 2026-09-09 to 2026-09-25) is gone: it was
	// the working preview of hidden tiles, and whoever may publish sees every
	// tile since 0.9.8, so it had nothing left to open.
	var SHOWN = ['standard', 'instrument', 'catalogue', 'terracotta', 'specimen', 'tube', 'brochure']; /* Tube and Brochure shown from their first day (Manuel, 2026-09-30: "make them live on the site as new styles") */ /* Specimen shown on Manuel's word (2026-09-26, "show it in the panel") */ /* Terracotta shown on Manuel's word the day it arrived (2026-09-26, "show it in the panel") */ /* Catalogue shown from its first day (2026-09-24), as Instrument was */ /* Instrument shown since 1.3.310 (2026-09-20, the same evening: "is it a new tile? I can't see it"); the ask had been a tile IN the panel */ /* console: the new Terminal, public from its first day on Manuel's word (2026-09-19); terminal is Matrix now */ /* Poster public 2026-09-12 (1.1.878) */

	/* THE MARKS: the style that is on carries the check, and "adjusted" after
	   its name while the dials are off its recipe. The way back shows while
	   anything is off Standard's rest. */
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

	/* WHAT THE READING PANEL READS (2026-09-09): the list, which of it is
	   offered, and the two things <html> does not say, whether a style has
	   been tweaked and the way to put it back. */
	/* VERSIONS (2026-09-27, Manuel chose "Last 20"; the prototype's page): a style's
	   earlier states, kept as its owner works, to look at on the page and bring back.
	   Every version is the whole style as a record, the one Copy Style makes, so it
	   still means the same after the style is saved or published again. This browser
	   keeps them as you work: after a quiet minute, before another style is put on,
	   and when the page is left; the twenty newest per style. The site keeps the
	   records a publish replaced (inc/site-styles.php). The theme's own look has
	   none: it is the theme as it is. */
	var VERSIONS_KEY = 'architrave-versions', VERSIONS_KEEP = 20, versionTimer = 0, versionFor = '', previewing = null;
	function readVersions() { try { var v = JSON.parse(localStorage.getItem(VERSIONS_KEY) || '{}'); return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; } catch (e) { return {}; } }
	function versionSoon() { if (previewing || READER) return; /* readers never see Versions, so their browsers keep none */ clearTimeout(versionTimer); versionFor = current; versionTimer = setTimeout(function () { versionTimer = 0; if (versionFor === current) keepVersion(); }, 60000); }
	function versionNow() { if (!versionTimer) return; clearTimeout(versionTimer); versionTimer = 0; if (versionFor === current) keepVersion(); }
	/* the record without the words that are not the look */
	function lookOf(rec) { var o = {}; Object.keys(rec || {}).forEach(function (k) { if (k !== 'architrave' && k !== 'label' && k !== 'base' && k !== 'id') o[k] = rec[k]; }); return o; }
	/* The style as it was saved or published, as a record: its changes set aside for a moment, nothing written. */
	function savedRecord() {
		var raw = null; try { raw = localStorage.getItem(TWEAKS_KEY); } catch (e) { return null; }
		var all = readTweaks(); if (!all[current]) return lookOf(JSON.parse(window.ArchitraveStyles.exportStyle() || '{}'));
		delete all[current];
		try { localStorage.setItem(TWEAKS_KEY, JSON.stringify(all)); } catch (e) { /* as above */ }
		var out = lookOf(JSON.parse(window.ArchitraveStyles.exportStyle() || '{}'));
		try { if (raw === null) localStorage.removeItem(TWEAKS_KEY); else localStorage.setItem(TWEAKS_KEY, raw); } catch (e) { /* as above */ }
		return out;
	}
	function keepVersion() {
		var s = byId(current); if (!s || s.host || previewing || READER) return false;
		var all = readVersions(), list = Array.isArray(all[s.id]) ? all[s.id] : [], rec = lookOf(JSON.parse(window.ArchitraveStyles.exportStyle() || '{}'));
		if (list[0] && JSON.stringify(list[0].record) === JSON.stringify(rec)) return false;
		if (!list.length && JSON.stringify(savedRecord()) === JSON.stringify(rec)) return false; /* nothing changed yet */
		list.unshift({ t: Date.now(), record: rec }); if (list.length > VERSIONS_KEEP) list.length = VERSIONS_KEEP;
		all[s.id] = list;
		try { localStorage.setItem(VERSIONS_KEY, JSON.stringify(all)); } catch (e) { /* full or private: the versions are a help, not the style */ }
		return true;
	}
	/* WHAT MAKES THIS STYLE LOOK LIKE A RECORD: the changes over its saved self that
	   turn the one into the other. A key the record does not name stays as saved. */
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
	/* written without a step of Undo: a look at a version is not a change */
	function writeQuiet(all) { var was = undoing; undoing = true; writeTweaks(all); undoing = was; }
	function endPreview() {
		if (!previewing) return false;
		var p = previewing; previewing = null;
		try { if (p.raw === null) localStorage.removeItem(TWEAKS_KEY); else localStorage.setItem(TWEAKS_KEY, p.raw); } catch (e) { /* as above */ }
		var s = byId(p.id); if (s) applyNow(s, wanted(s));
		return true;
	}
	window.addEventListener('pagehide', function () { endPreview(); versionNow(); });

	/* One write to the route; the state that comes back replaces the site's
	   list in place, so the tiles and the default are what the server holds. */
	/* ONLY THE NEWEST ANSWER IS TAKEN (2026-09-28): the site's settings come back whole with every answer, and on a
	   slow server an older answer arrived after a newer change and put the old settings back (Aurora came back on,
	   the band went back). An answer overtaken by a later request is left; the later one brings the settings. */
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
		/* THE READER'S OWN COME SECOND, NEWEST FIRST (Manuel, 2026-09-22, having
		   saved one and found it at the bottom: "it doesn't save it next to the
		   original, it saves at the last"). They are stored at the end of the list,
		   which is right, because the list is also the order things were made in;
		   what is shown is another question. A reader has a handful of styles of
		   their own and made every one of them, while the site's set is long and
		   stays put, so at a hundred tiles "last" means a tile the reader made and
		   cannot see. Original stays first, because it is the way back. */
		shown: function () {
			var all = STYLES.filter(offered);
			/* A READER SEES THE OWNER'S ORDER (2026-09-23): the site's own look first,
			   then the picks in the order For readers holds them, which the owner
			   drags. */
			if (READER) {
				var picks = readerPicks();
				return all.filter(function (s) { return s.host || s.id === DEFAULT; })
					.concat(picks.map(function (id) { return all.filter(function (s) { return s.id === id && !s.host && s.id !== DEFAULT; })[0]; }).filter(Boolean));
			}
			/* THE OWNER'S ONE GRID (Manuel, 2026-09-23: "the tiles on top and the
			   tiles below … it's already getting quite crowded"): the site default
			   first, which is what a first visit opens in, then the built-in styles,
			   the published ones and your own. */
			var seen = this.visibleOrder(), rest = all.filter(function (s) { return seen.indexOf(s.id) === -1; });
			rest = rest.filter(function (s) { return !s.own && !s.site; })
				.concat(rest.filter(function (s) { return s.site; }))
				.concat(rest.filter(function (s) { return s.own; }).reverse());
			/* THE ORDER YOU GAVE THE REST (Manuel, 2026-09-24: "the rearranging in the
			   lower section is not locking in"). Only visible to you had no order of
			   its own, so a tile dragged there went back to its kind's place. The
			   order the owner drags is kept in this browser, beside their own
			   styles; a style it does not name yet (one just made) comes first. */
			var mine = hiddenOrder();
			if (mine.length) rest = rest.filter(function (s) { return mine.indexOf(s.id) === -1; })
				.concat(mine.map(function (id) { return rest.filter(function (s) { return s.id === id; })[0]; }).filter(Boolean));
			return seen.map(byId).filter(Boolean).concat(rest);
		},
		setHiddenOrder: function (ids) { try { localStorage.setItem(HIDDEN_KEY, JSON.stringify(ids || [])); } catch (e) { /* private mode */ } },
		isOwn: function (id) { var s = byId(id); return !!(s && s.own); },
		/* The side the theme's own look is on (measured at load), for a guest's Original. */
		hostSide: function () { var h = byId('host'); return h && h.hostSide ? h.hostSide : ''; },
		/* THE SITE'S STYLES (2026-09-18): what the panel asks about them and
		   the four writes, each a call to the theme's route with the record the
		   export makes. Every answer is the whole state, taken as printed. */
		isSite: function (id) { var s = byId(id); return !!(s && s.site); },
		/* THE RECORD, DESCRIBED (2026-09-18): every field a style record may
		   carry and the values each accepts, read from the lists this script
		   runs on, so an assistant writing a record for the route does not
		   guess. tools/style-schema.mjs writes it to inc/style-schema.json,
		   which the route serves at /site-styles/schema. */
		/* WHAT EACH FIELD MEANS, FOR AN ASSISTANT (Manuel, 2026-09-19: "make everything better so that AI can read … what could be an AI approach even better"). The schema lists what a field ACCEPTS; this says what it DOES, in one sentence, with its unit and the switch it depends on, which is what a model needs to turn "a little warmer, fewer lines" into a record. Kept here beside the lists so it cannot drift: tools/style-schema.mjs fails when a record key has no meaning. */
		guide: function () {
			/* The meanings are the list's (plugin/settings.json, `means`), written into LIST above in the order the guide prints them. */
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
					face: (r === 'read' || r === 'ui' ? [] : ['read', 'ui']).concat(Object.keys(FAMILY)), /* a follower may name its anchor (2026-09-22); 'inherit', the old word for 'read', is still read */
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
			/* The members, with each one's resting size, so an assistant can write
			   a whole hierarchy: a member named here is released at that size; a
			   member left out follows the lead. */
			Object.keys(MEMBERS).forEach(function (r) {
				var mem = {};
				MEMBERS[r].forEach(function (m) { if (!m.lead) { mem[m.id] = { size: sizesFor(r), weight: Object.keys(WEIGHT), caps: 'boolean', tracking: Object.keys(TRACK), rest: m.rest }; if (memberDialsOf(r).indexOf('align') !== -1) mem[m.id].align = ALIGNS; } });
				roles[r].members = mem;
			});
			var side = {}; LIST.wells.forEach(function (w) { side[w] = 'hex'; });
			/* THE FIELDS COME FROM THE LIST (plugin/settings.json, step 4): its keys in the order
			   the schema prints them, each answered by its table. What is not a table of the list
			   is read where it lives: the styles, the colour pairs, the reading sizes, the faces. */
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
		/* ONE OF YOUR STYLES, SHOWN TO READERS AS IT IS (Manuel, 2026-09-23: "I made
		   my own style … I want to make it public … and my new base style"). It is
		   published under its own name and leaves Your styles, so it is not there
		   twice; with makeDefault it is also what a first visit opens in. */
		/* Whether readers see a style: the site's own look, and the ones on For readers. */
		seenByReaders: function (id) {
			var s = byId(id); if (!s) return false;
			return !!(s.host || id === DEFAULT || readerPicks().indexOf(id) !== -1);
		},
		/* MAKE IT WHAT A FIRST VISIT OPENS IN, whatever it is: one of yours is
		   published first; Classic is the absence of a default. */
		makeDefault: function (id) {
			if (!byId(id)) return Promise.reject(new Error('no style'));
			return this.setVisible([id].concat(this.visibleOrder().filter(function (x) { return x !== id; }))); /* the old default steps to second place, still seen */
		},
		/* SHOWN TO READERS OR NOT, from a tile: one of yours is published and
		   added; any other is added to or taken off For readers' list. */
		/* OFF THE SITE AND KEPT AS YOURS (Manuel, 2026-09-24: "Für alle sichtbar" off
		   must lose nothing). The published style goes from the site and comes back
		   as one of your own, under its name, with any unsaved changes it carried. */
		unpublishKeep: function (id) {
			var s = byId(id); if (!s || !s.site) return Promise.reject(new Error('not a site style'));
			var rec = JSON.parse(JSON.stringify(s)); delete rec.site; rec.architrave = 1;
			var wasCurrent = current === id, carried = readTweaks()[id]; /* read before the site forgets the style: the cleaner drops tweaks of a style it cannot find */
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
		/* A NEW NAME FROM THE TILE'S MENU (2026-09-23): one of yours is renamed here,
		   a published one on the site. Built-in styles keep theirs. */
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
			/* AT ONCE, NOT THROUGH THE DISSOLVE (2026-09-24): apply() waits for a view
			   transition, so publish() read the style that was on before, and the own
			   copy's removal then chose the first tile over the new one. The switch is
			   made now, the own copy leaves without choosing anything, and publish()
			   puts the published style on. */
			if (current !== id) applyNow(s, wanted(s));
			return this.publish(s.label, makeDefault).then(function (newId) {
				if (newId) {
					if (PENDING) { var k = PENDING.indexOf(id); if (k !== -1) PENDING[k] = newId; } /* the published copy takes the own one's place in an order being made */
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
		/* The two the owner hands readers, and the write that changes them. */
		reader: function () { return READER; },
		readers: function () { return readerPicks().filter(function (id) { return id !== DEFAULT && !!byId(id); }); }, /* a pick that names nothing, or the site's own look, holds no place */
		/* The look a reader always gets first: the site default, else the theme's own on a guest and Standard on Architrave. */
		readerFirst: function () { return DEFAULT; },
		/* READERS MAY COPY A STYLE (Manuel, 2026-09-23: "a reader could copy a
		   style from his site and use that style on his site too"). The owner's
		   switch on For readers; the reader then gets Copy style, which copies
		   the style's link, and the link carries the whole style (#style=), so
		   Paste style… takes it on any site that runs the panel. */
		readersCopy: function () { return !!(SITE && SITE.readersCopy); },
		setReadersCopy: function (on) {
			var was = SITE.readersCopy; SITE.readersCopy = !!on; /* the switch moves at once, the server follows */
			return sendSite({ action: 'readers-copy', on: !!on }).then(function () { return true; }, function (e) { SITE.readersCopy = was; throw e; });
		},
		/* THE LIVE DESIGN BUTTON (Manuel, 2026-09-23, lab/the-button-page.html):
		   where the door sits and how it looks, for the whole site. The owner's
		   change shows at once (panel-opener.js hears the event) and the server
		   follows; a refused write puts the old settings back. */
		button: function () { return SITE && SITE.button ? SITE.button : null; },
		setButton: function (key, value) {
			if (!SITE || !SITE.button) return Promise.reject(new Error('no button'));
			var was = SITE.button, next = {};
			Object.keys(was).forEach(function (k) { next[k] = was[k]; });
			next[key] = value;
			if (key === 'place' && value !== 'auto') next.fixed = value; /* the map's last pick, for when Automatic is switched off again */
			SITE.button = next;
			window.dispatchEvent(new CustomEvent('architrave-button-settings', { detail: { settings: next, picked: key } }));
			return sendSite({ action: 'button', settings: next }).then(function () { return true; }, function (e) {
				SITE.button = was;
				window.dispatchEvent(new CustomEvent('architrave-button-settings', { detail: { settings: was } }));
				throw e;
			});
		},
		/* WHAT EVERYONE SEES, AS ONE ORDERED LIST (Manuel, 2026-09-23: "should the
		   complete order be drag-and-drop possible?"). The owner's grid shows it as
		   its first group: the site default first, then the styles readers are
		   offered, in their order. visibleOrder reads it; setVisible writes a new
		   one: the first becomes the default (on Architrave), the rest For readers'
		   list, and one of your own in it is published on the way. The grid moves
		   at once; the site follows. */
		visibleOrder: function () {
			if (PENDING) return PENDING.filter(function (id) { return !!byId(id); });
			/* ORIGINAL IS ALWAYS SEEN (2026-09-24): first when no style is the default,
			   else right behind it. It is no pick, so it has no other place. */
			var first = [DEFAULT].concat(STYLES.filter(function (x) { return x.host && x.id !== DEFAULT; }).map(function (x) { return x.id; }));
			return first.concat(readerPicks().filter(function (id) { return first.indexOf(id) === -1 && !!byId(id); }));
		},
		setVisible: function (ids) {
			var self = this;
			ids = (ids || []).filter(function (id, i, a) { return !!byId(id) && a.indexOf(id) === i; });
			if (!ids.length) return Promise.reject(new Error('someone has to be first'));
			var owns = ids.filter(function (id) { return byId(id).own; });
			/* THE GRID TAKES THE NEW ORDER AT ONCE (Manuel, 2026-09-24: "it will snap back
			   for a second to where it was until it's loaded"): one of your own is
			   published first, a round trip, and the grid showed the old order until
			   it came back. The order asked for is shown meanwhile. */
			PENDING = ids;
			/* one of yours is published first, in turn, and its new id takes its place */
			var chain = owns.reduce(function (p, id) {
				return p.then(function () { return self.publishOwn(id, false).then(function (nid) { var k = ids.indexOf(id); if (nid && k !== -1) ids[k] = nid; }); });
			}, Promise.resolve());
			return chain.then(function () {
				var picks = ids.slice(1).filter(function (id) { return !byId(id).host; }); /* Original is always offered; it is no pick */
				var def = ids[0] === NONE ? '' : ids[0];
				var wasDefault = SITE['default'] || '', wasReaders = SITE.readers;
				if (def !== null) SITE['default'] = def;
				SITE.readers = picks.slice();
				PENDING = null; takeSite(SITE); renderHosts(); /* the grid moves now */
				/* one after the other: each answer is the whole state, and the second must not be overtaken by the first */
				return sendSite({ action: 'readers', ids: picks })
					.then(function () { return def !== null && def !== wasDefault ? sendSite({ action: 'default', id: def }) : null; })
					.then(function () { mark(); return true; }, function (e) { SITE['default'] = wasDefault; SITE.readers = wasReaders; takeSite(SITE); renderHosts(); throw e; });
			}, function (e) { PENDING = null; renderHosts(); throw e; });
		},
		setReaders: function (ids) {
			/* AT ONCE (Manuel, 2026-09-23: "everything is a little slow here, a little
			   delay"): each press waited for the site to answer before the row moved,
			   a round trip on a hosted site. The list changes here first and the
			   server's answer confirms it; a refusal puts the old list back. */
			var was = SITE.readers; SITE.readers = (ids || []).slice();
			return sendSite({ action: 'readers', ids: (ids || []) }).then(function () { return true; }, function (e) { SITE.readers = was; throw e; });
		},
		setSiteDefault: function (id) {
			return sendSite({ action: 'default', id: id || '' }).then(function () { mark(); return true; });
		},
		/* THE COLOURS (Manuel, 2026-09-14): the wells on the Farbe page. */
		colours: coloursResolved, /* with the following side filled in and named in .derived; saving reads coloursOf, what was set alone */
		/* THE PRESETS: fifteen pairs authored here, beside the five the design
		   system registers. Choosing one writes its six colours into the style,
		   both sides at once, so the chain has nothing to follow and the ladder
		   mixes everything else; choosing a mode, or moving a colour by hand,
		   lets it go again. */
		presets: function () { return PRESETS.map(function (p) { return { id: p.id, label: p.label, light: { paper: p.light.paper, ink: p.light.ink, accent: p.light.accent }, dark: { paper: p.dark.paper, ink: p.dark.ink, accent: p.dark.accent }, fresh: !!p.fresh, group: p.group || '' }; }); },
		/* THE THREE LISTS OF THE CUSTOMISATION AREA (Manuel, 2026-09-16): twenty
		   papers, twenty inks, twenty accents, the same hues in all three. A
		   colour chosen here is written on both sides at once, so the chain has
		   nothing to follow, and it leaves whatever preset was on: a preset is
		   picked whole, a part is picked here. */
		swatchList: function (key) { return (LISTS[key] || []).map(function (x) { return { id: x.id, label: x.label, light: x.light, dark: x.dark }; }); },
		listColour: listColourOf,
		setListColour: function (key, id) {
			var x = (LISTS[key] || []).filter(function (c) { return c.id === id; })[0];
			if (!x) return;
			var all = readTweaks(), entry = all[current] || {};
			entry.colours = entry.colours || {};
			/* the theme's own look has one side, its own: that side's colour on both (2026-09-24) */
			var cur = byId(current), one = cur && cur.host && cur.hostSide;
			['light', 'dark'].forEach(function (side) { entry.colours[side] = entry.colours[side] || {}; entry.colours[side][key] = x[one || side]; });
			if (['button', 'head', 'kicker', 'marker', 'inverse', 'light', 'second'].indexOf(key) === -1) letGoPreset(entry); /* a part chosen by hand is nobody's preset any more; the button's, the roles' and the pen's own colours sit beside a preset */
			/* The chain is left as the reader set it: a row here carries a colour
			   for each side, so neither side has anything to follow, and the
			   wheel under the list still edits the side that is shown. */
			all[current] = entry;
			writeTweaks(all);
			if (key === 'accent' && !accentOn()) { try { localStorage.removeItem(ACCENT_KEY); } catch (e) { /* private window */ } applyAccent(); }
			applyColours(); mark();
		},
		accentColour: accentColourOf,
		/* PRESET OR OWN, ONE CHOICE (Manuel, 2026-09-16: "when we select a preset
		   it should be shown on that page and therefore we haven't selected a
		   custom solution. It's either/or … I think it is important to make clear
		   either the one or the other"). A style is on its own colours when it
		   holds colours that no preset put there; a preset's six carry its mark
		   and a mode's pair is the room's, so both of those are the preset side
		   of the switch. */
		custom: function () {
			if (presetOf()) return false;
			/* ORIGINAL'S OWN COLOURS ARE NOT SET BY HAND (2026-09-24, Manuel on Ollie:
			   "can't click preset"). The theme's paper and ink are measured into the
			   Original record for its tile, and counted here they made Custom always
			   on, so Preset had nothing to cross from. On Original only the reader's
			   own colours count. */
			var s0 = byId(current);
			if (s0 && s0.host) {
				var e0 = (readTweaks()[current] || {}).colours || {};
				return ['light', 'dark'].some(function (sd) { return Object.keys(e0[sd] || {}).some(function (k) { return ['button', 'head', 'kicker', 'marker', 'inverse', 'light', 'second'].indexOf(k) === -1 && !!e0[sd][k]; }); });
			}
			var c = coloursOf();
			return ['light', 'dark'].some(function (sd) { return Object.keys(c[sd] || {}).some(function (k) { return ['button', 'head', 'kicker', 'marker'].indexOf(k) === -1; }); }); /* the button's, the roles' and the pen's own colours are not Custom */
		},
		/* Crossing over keeps what is on the page. Going to Eigene takes the
		   preset's own six colours with it, so nothing moves on the crossing and
		   the three rows open on the colours the reader was looking at; a mode
		   has none to take, so the page's own paper, ink and accent are written
		   for the side being shown and the other side follows. Going back to
		   Voreinstellung drops the colours set by hand and returns to the preset
		   that was on before, which is remembered for exactly this. */
		setCustom: function (on, seed) {
			var s = byId(current), all = readTweaks(), entry = all[current] || {};
			if (on) {
				/* A preset the RECIPE names is let go the same way: its six colours are written into the tweak first, so nothing moves on the crossing, and the empty `preset` says Eigene. */
				var c = coloursOf();
				if (entry.preset) { entry.was = entry.preset; delete entry.preset; }
				else if (s && s.preset && entry.preset === undefined) { entry.was = s.preset; entry.preset = ''; var preG = presetById(s.preset); ['light', 'dark'].forEach(function (sd) { if (preG && preG.ground && typeof preG.ground === 'object' && preG.ground[sd]) c[sd].ground = preG.ground[sd]; if (preG && preG.lift && preG.lift[sd]) c[sd].lift = preG.lift[sd]; }); /* the set's own ground and card cross with it (2026-09-26) */ entry.colours = { light: { paper: c.light.paper, ink: c.light.ink, accent: c.light.accent, ground: c.light.ground, lift: c.light.lift }, dark: { paper: c.dark.paper, ink: c.dark.ink, ground: c.dark.ground, lift: c.dark.lift, accent: c.dark.accent } }; }
				/* ORIGINAL STARTS CUSTOM FROM ITS OWN COLOURS (2026-09-25, found by the
				   ten-theme test: pressing Custom under Original did nothing). The
				   theme's measured paper and ink are the record's, not the reader's,
				   so they are written into the tweak as the reader's starting point. */
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
			/* Back to the preset the recipe names: the tweak simply goes, and the recipe speaks again. */
			if (s && s.preset && back === s.preset) { delete entry.preset; if (Object.keys(entry).length) all[current] = entry; else delete all[current]; writeTweaks(all); applyColours(); mark(); return; }
			/* A style with colours of its own keeps them in its own record, so
			   they are masked rather than deleted, the way a tint masks an own
			   accent (2026-09-14). */
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
				/* Letting a preset go takes its six colours with it, and only
				   them: a colour moved by hand has already cleared the mark, so
				   a record that still carries one carries nothing else of the
				   reader's. */
				if (entry.preset) delete entry.colours;
				/* A TILE THAT BRINGS ITS OWN PRESET (Instrument's Lime night)
				   fell straight back to it when a pair was chosen, so the five
				   pairs did nothing there (Manuel, 2026-09-23). Letting go on
				   such a tile is written as none, not forgotten. */
				var own = byId(current);
				if (own && own.preset) entry.preset = ''; else delete entry.preset;
				if (Object.keys(entry).length) all[current] = entry; else delete all[current];
				writeTweaks(all); applyColours(); mark(); return;
			}
			entry.colours = { light: { paper: p.light.paper, ink: p.light.ink, accent: p.light.accent }, dark: { paper: p.dark.paper, ink: p.dark.ink, accent: p.dark.accent } };
			entry.preset = p.id;
			delete entry.unlinked; /* both sides are written, so the chain is at rest */
			all[current] = entry;
			writeTweaks(all);
			/* A preset brings an accent, so the accent is on: it is the same rule
			   the wheel follows when a colour is poured into it (2026-09-15). */
			if (!accentOn()) { try { localStorage.removeItem(ACCENT_KEY); } catch (e) { /* private window */ } applyAccent(); }
			applyColours(); mark();
		},
		contrast: contrast,
		paperOf: paperOf,
		setColour: function (side, key, hex) {
			if (['light', 'dark'].indexOf(side) === -1 || ['paper', 'ink', 'accent', 'button', 'head', 'kicker', 'ground', 'lift', 'marker', 'inverse', 'light', 'second'].indexOf(key) === -1 || !/^#[0-9a-f]{6}$/i.test(hex || '')) return;
			var all = readTweaks(), entry = all[current] || {};
			entry.colours = entry.colours || {}; entry.colours[side] = entry.colours[side] || {};
			/* LINKED MEANS THE OTHER SIDE FOLLOWS, EVERY TIME (Manuel,
			   2026-09-16: "it did for a while until I came to a point where it
			   wasn't connected anymore, even when the connected sign was still
			   toggled on"). A side follows only while it holds nothing of its
			   own, and it came to hold something the moment it was the side
			   being edited, or the chain had been broken and closed again once.
			   From then on the colour set here landed on one side alone and
			   the chain said otherwise. With the chain closed, setting a colour
			   frees the other side of that colour again, so it follows the new
			   one; broken, both sides keep what they have. */
			if (!unlinkedOf()) {
				var other = side === 'dark' ? 'light' : 'dark';
				if (entry.colours[other]) { delete entry.colours[other][key]; if (!Object.keys(entry.colours[other]).length) delete entry.colours[other]; }
			}
			entry.colours[side][key] = hex.toLowerCase();
			if (['button', 'head', 'kicker', 'marker', 'inverse', 'light', 'second'].indexOf(key) === -1) letGoPreset(entry); /* a colour moved by hand is nobody's preset any more; the button's, the roles' and the pen's own colours sit beside a preset */
			all[current] = entry; writeTweaks(all);
			applyColours(); mark();
		},
		clearColour: function (side, key) {
			var all = readTweaks(), entry = all[current] || {}, s = byId(current);
			if (entry.colours && entry.colours[side]) { delete entry.colours[side][key]; if (!Object.keys(entry.colours[side]).length) delete entry.colours[side]; }
			if (entry.colours && !Object.keys(entry.colours).length) delete entry.colours;
			/* On a saved style the well goes back to the saved colour; clearing means: no colour of my own, the pair's. */
			if (s && (s.own || s.site) && s.colours && s.colours[side] && s.colours[side][key]) { entry.colours = entry.colours || {}; entry.colours[side] = entry.colours[side] || {}; entry.colours[side][key] = ''; }
			if (Object.keys(entry).length) all[current] = entry; else delete all[current];
			writeTweaks(all);
			applyColours(); mark();
		},
		/* ALS STIL SICHERN (Manuel, 2026-09-14; Apple: duplicate, then edit, then
		   name): the style as the reader left it, dials, switches, roles and
		   colours, becomes a tile of its own; the tile it was made on goes back
		   to clean. */
		/* A STYLE AS TEXT (Manuel, 2026-09-16, from Codex's Import / Copy theme):
		   the look leaves the browser as one line of JSON and comes back into
		   any other, which is also how a style reaches the people who build
		   with it. The shape is the saved style's own, with the theme's name
		   and a version on it so a paste can be told from any other text. */
		exportStyle: function () {
			var s = byId(current); if (!s) return '';
			var tw = readTweaks()[current] || {}, w = wanted(s), out = { architrave: 1, label: s.label, base: baseOf(s) };
			DIALS.forEach(function (d) { out[d] = w[d]; });
			OPTS.forEach(function (k) { out[k] = optionOn(k); });
			var loose = followers();
			out.tint = tintOf(); out.sans = sansOf(); out.scope = scopeOf(); out.pictures = picturesOf(); out.capLines = capLinesOf(); out.button = buttonOf(); Object.keys(PICKS).forEach(function (k) { out[k] = pickOf(k); }); out.scan = levelOf('scan'); out.line = levelOf('line'); out.fill = levelOf('fill'); out.glowlevel = levelOf('glowlevel'); out.grainlevel = levelOf('grainlevel'); out.vignettelevel = levelOf('vignettelevel'); out.vignettereach = levelOf('vignettereach'); out.softlevel = levelOf('softlevel'); out.quietlevel = levelOf('quietlevel'); out.smallsoft = levelOf('smallsoft'); out.linestyle = lineStyleOf(); out.corners = cornersOf(); out.fadeedges = fadeEdgesOf(); out.markercolour = markerColourOf(); out.framepattern = framePatternOf(); out.measure = levelOf('measure'); out.space = levelOf('space'); out.framewidth = levelOf('framewidth'); out.dotsize = levelOf('dotsize'); out.dotlevel = levelOf('dotlevel');
			loose.forEach(function (k) { delete out[k]; }); /* a row that only follows soft is not written, so it goes on following */
			if (unlinkedOf()) out.unlinked = true; /* save and update carried it, the text did not: a shared or published style arrived with its sides linked (2026-09-26) */
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
		/* A pasted style becomes a tile of the reader's own and is put on at
		   once; nothing already saved is touched. */
		importStyle: function (text, name) {
			var data;
			try { data = JSON.parse(String(text || '').trim()); } catch (e) { return null; }
			if (!data || data.architrave !== 1) return null;
			var entry = ownFromRecord(data, name);
			renderHosts();
			apply(entry, entry);
			return entry.id;
		},
		/* THE LINK (2026-09-18): the style that is on, as an address. A tile
		   the site offers, unadjusted, is named; anything else is carried. */
		shareLink: function (whole) {
			var s = byId(current); if (!s) return '';
			var base = window.location.origin + window.location.pathname;
			/* WHOLE: the style written into the link even when it is a tile as it
			   came, for a reader taking it to their own site (2026-09-23), where a
			   bare `?style=book` would name a tile that site may not have or may
			   draw differently. */
			if (!whole && !s.own && !this.adjusted(s.id)) return base + '?style=' + encodeURIComponent(s.id);
			var record = JSON.parse(this.exportStyle());
			return base + '#style=' + encodeRecord(record);
		},
		/* A pasted link, from this site or another. Resolves to the id put on,
		   or null when the text is no link the panel can read. */
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
		/* DUPLICATE (Manuel, 2026-09-24): a copy of any style as one of your own, as it stands
		   now, its unsaved changes included, under "{name} copy". The style you are on stays
		   on and the one copied is untouched; the copy stands first in Only visible to you. */
		duplicate: function (id) {
			var s = byId(id); if (!s) return null;
			var record, name = t('{name} copy').replace('{name}', t(s.label));
			/* NUMBERED, AS FINDER NUMBERS COPIES (2026-09-25): two tiles both
			   called "Original copy" say nothing apart. */
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
			/* SAVED FROM THE THEME'S OWN LOOK (Manuel, 2026-09-22: "maybe it should be
			   a customization option but then we should be able to save it as a new
			   tile"): the tile is the theme plus the reader's few changes, and stays
			   that. No room is painted under it, nothing is stamped that was not
			   chosen, and it wears the theme's own paper and face on the tile. */
			if (s.host || s.bare) { entry.bare = true; entry.hostFace = s.hostFace; entry.colours = s.colours; }
			/* Under the theme's own look no tweak is ever recorded (remember), so
			   what the page shows IS the reader's version of it. */
			DIALS.forEach(function (d) { entry[d] = s.host ? now()[d] : w[d]; });
			OPTS.forEach(function (k) { entry[k] = optionOn(k); });
			var loose = followers();
			entry.tint = tintOf(); entry.sans = sansOf(); entry.scope = scopeOf(); entry.pictures = picturesOf(); entry.capLines = capLinesOf(); entry.button = buttonOf(); Object.keys(PICKS).forEach(function (k) { entry[k] = pickOf(k); }); entry.scan = levelOf('scan'); entry.line = levelOf('line'); entry.fill = levelOf('fill'); entry.glowlevel = levelOf('glowlevel'); entry.grainlevel = levelOf('grainlevel'); entry.vignettelevel = levelOf('vignettelevel'); entry.vignettereach = levelOf('vignettereach'); entry.softlevel = levelOf('softlevel'); entry.quietlevel = levelOf('quietlevel'); entry.smallsoft = levelOf('smallsoft'); entry.linestyle = lineStyleOf(); entry.corners = cornersOf(); entry.fadeedges = fadeEdgesOf(); entry.markercolour = markerColourOf(); entry.framepattern = framePatternOf(); entry.measure = levelOf('measure'); entry.space = levelOf('space'); entry.framewidth = levelOf('framewidth'); entry.dotsize = levelOf('dotsize'); entry.dotlevel = levelOf('dotlevel'); entry.unlinked = unlinkedOf();
			loose.forEach(function (k) { delete entry[k]; }); /* a row that only follows soft is not written, so it goes on following */
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
		/* STIL AKTUALISIEREN (Manuel, 2026-09-14: "I want to update that style,
		   not create a new style"): the reader's changes fold into the saved
		   style itself; nothing is copied. */
		update: function () {
			var s = byId(current); if (!s || !s.own) return false;
			var tw = readTweaks()[current] || {}, w = wanted(s);
			DIALS.forEach(function (d) { s[d] = w[d]; });
			OPTS.forEach(function (k) { s[k] = optionOn(k); });
			var loose = followers();
			s.tint = tintOf(); s.sans = sansOf(); s.scope = scopeOf(); s.pictures = picturesOf(); s.capLines = capLinesOf(); s.button = buttonOf(); Object.keys(PICKS).forEach(function (k) { s[k] = pickOf(k); }); s.scan = levelOf('scan'); s.line = levelOf('line'); s.fill = levelOf('fill'); s.glowlevel = levelOf('glowlevel'); s.grainlevel = levelOf('grainlevel'); s.vignettelevel = levelOf('vignettelevel'); s.vignettereach = levelOf('vignettereach'); s.softlevel = levelOf('softlevel'); s.quietlevel = levelOf('quietlevel'); s.smallsoft = levelOf('smallsoft'); s.linestyle = lineStyleOf(); s.corners = cornersOf(); s.fadeedges = fadeEdgesOf(); s.markercolour = markerColourOf(); s.framepattern = framePatternOf(); s.measure = levelOf('measure'); s.space = levelOf('space'); s.framewidth = levelOf('framewidth'); s.dotsize = levelOf('dotsize'); s.dotlevel = levelOf('dotlevel'); s.unlinked = unlinkedOf();
			loose.forEach(function (k) { delete s[k]; }); /* a row that only follows soft is not written, so it goes on following */
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
		restSize: function (role) { return ROLE_DEFAULT[role] ? rungFor(role, ROLE_DEFAULT[role].size) : null; }, /* the size a role rests on, for the panel's stops in words (a guest, 2026-09-22) */
		adjusted: function (id) {
			var s = byId(id); if (!s) return false;
			if (readTweaks()[id]) return true;
			return id === current && !same(now(), s);
		},
		option: optionOn,
		setOption: function (k, on) {
			if (OPTS.indexOf(k) === -1) return;
			/* Measured against the REST, not the recipe alone (Manuel, 2026-09-12:
			   "I cannot turn the lines off when I'm in the poster mode"): Poster's
			   recipe says off, its pair says on, and a press to off compared to
			   the recipe was no tweak at all, so the pair had it back at once. */
			var all = readTweaks(), entry = all[current] || {};
			if (!!on === restOf(k)) delete entry[k]; else entry[k] = !!on;
			if (Object.keys(entry).length) all[current] = entry; else delete all[current];
			writeTweaks(all);
			applyOptions(); applyPicks(); applyLevels(); mark(); /* the links and the small text follow soft (pickRest, levelRest) */
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
		faceOf: realFace, /* a follower's anchor resolved to the face it stands in (the panel's Typografie row, 2026-09-22) */
		weights: Object.keys(WEIGHT),
		weightsFor: weightsFor,
		sizesFor: sizesFor,
		wanted: function (id) { var s = byId(id); return s ? wanted(s) : {}; }, /* the dials a style would press now, tweaks included (the tiles paint it, 2026-09-13) */
		hasItalic: hasItalic,
		/* A press on a role's dial: a tweak of the style, gone when it
		   equals what the recipe (or Standard) says. The two faces that are
		   dials of their own go through their own setters. */
		/* A MEMBER'S SIZE, OR ITS BINDING (2026-09-18, see THE MEMBERS OF A
		   ROLE). setMember(role, id, '20') releases the member at that rung;
		   setMember(role, id, null) binds it again. The tweak carries the
		   whole set as it stands after the press, and none when all are bound. */
		members: function (role) {
			var v = roleOf(role), f = sizeFactor(role, v.size);
			return membersOf(role).map(function (m) {
				var own = (!m.lead && v.members && v.members[m.id]) || {};
				return {
					id: m.id, rest: m.rest, lead: !!m.lead, bound: !Object.keys(own).length,
					own: own,
					size: m.lead ? String(v.size) : own.size !== undefined ? own.size : String(Math.round(m.rest * f)),
					weight: own.weight !== undefined ? fitWeight(v.face, own.weight) : (v.weight !== ROLE_DEFAULT[role].weight || !m.weight ? v.weight : fitWeight(v.face, m.weight)), /* the role's dial where it moved, the member's rest otherwise */
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
		/* setMember(role, id, dial, value) releases that dial of the member at
		   that value; value null binds the dial again; dial null binds the
		   whole member. The tweak carries the set as it stands after the
		   press, and none when it equals the style's own. */
		setMember: function (role, id, dial, value) {
			var m = membersOf(role).filter(function (x) { return x.id === id; })[0];
			if (!m || m.lead) return;
			var v = roleOf(role), set = {};
			Object.keys(v.members || {}).forEach(function (k) { var o = {}; Object.keys(v.members[k]).forEach(function (d) { o[d] = v.members[k][d]; }); set[k] = o; });
			if (dial === null || dial === undefined) delete set[id];
			else if (memberDialsOf(role).indexOf(dial) !== -1) {
				set[id] = set[id] || {};
				if (value === null || value === undefined) delete set[id][dial];
				else if (dial === 'size') set[id].size = nearestRung(role, value); /* a bound member reads at rest × step, which is often between rungs (15 at a lead of 16); released, it lands on the nearest, not on the role's base */
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
			/* ON A STRANGER'S THEME, UNDER ITS OWN LOOK, A PICK EQUAL TO OUR REST IS STILL A
			   PICK (2026-09-23, the audit on Astra: its headings stand at 600, Bold is
			   Classic's rest, so moving the slider to Bold was taken for "no change" and
			   nothing reached the page). The rest here is the host's, which we do not own. */
			var hostLook = window.architravePanelGuest && s && (s.host || s.bare); /* and a copy of it (2026-09-27: Italic on a copy of Twenty Twenty-Five's look was dropped as equal to our rest) */
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
		/* THE TWO SIDES, LINKED OR ON THEIR OWN (Manuel, 2026-09-16: "a button
		   that connects both … and toggle off changing just one"). The sides
		   cannot hold one value — a dark paper is not a light one — so what the
		   chain says is whether the side you are NOT looking at still follows
		   the one you set. Linked is how the panel has always worked, unwritten;
		   the button writes it down and lets you switch it off, which freezes
		   the other side where it stands. */
		linked: function () { return !unlinkedOf(); },
		setLinked: function (on, side) {
			var all = readTweaks(), entry = all[current] || {}, s = byId(current);
			if (on) {
				var other = side === 'dark' ? 'light' : 'dark';
				if (entry.colours && entry.colours[other]) { delete entry.colours[other]; if (!Object.keys(entry.colours).length) delete entry.colours; }
				/* Linked is how a style rests, so a chain closed again leaves no
				   tweak behind: written down, it kept the style marked adjusted
				   with nothing in it to put back. */
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
			/* THE RECORD IS WRITTEN AT ONCE, only the page waits for the crossfade:
			   the view transition runs its callback a frame later, and the panel
			   re-rendered in between read the old level, so the knob sat one step
			   behind the page (fixed 2026-09-26). */
			writeTweaks(all);
			var go = function () { applyLevels(); mark(); };
			/* Space crossfades (plugin/assets/js/space.js, SOFT MOTION) */
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
		/* THE EXTRAS' DETAILS: the table, one effect's details as they stand (rest, then the
		   style's own, then the reader's), and the setter. A value equal to the style's own
		   (or to the rest) is no tweak; an effect with none left goes. */
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
			/* A dot chosen is the accent; a colour of the reader's own gives way (2026-09-14). */
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
			try { if (on) localStorage.removeItem(ACCENT_KEY); else localStorage.setItem(ACCENT_KEY, 'off'); } catch (e) { /* as above */ }
			applyAccent();
		},
		focus: function () { return Focus.on(); },
		motion: function (press) { return Focus.motion(press); },
		retime: function () { return Focus.retime(); },
		setFocus: function (on) { Focus.set(on); },
		canUndo: function () { return HISTORY.length > 0; },
		/* The key the next Undo takes back ('' when it is not known). */
		undoWhat: function () { var h = HISTORY[HISTORY.length - 1]; return h && h.what || ''; },
		canRedo: function () { return FUTURE.length > 0; },
		redoWhat: function () { var h = FUTURE[FUTURE.length - 1]; return h && h.what || ''; },
		redo: function () {
			var h = FUTURE.pop(); if (!h) return false;
			var was = ''; try { was = localStorage.getItem(TWEAKS_KEY) || '{}'; } catch (e) { /* private window */ }
			HISTORY.push({ tweaks: was, side: storedSide(), style: current, what: h.what });
			undoing = true;
			try { localStorage.setItem(TWEAKS_KEY, h.tweaks); } catch (e) { /* private window */ }
			var s = byId(h.style) || byId(current);
			if (s) { apply(s, wanted(s)); applyRoles(); }
			if (h.side && h.side !== storedSide()) press('[data-quire-modes="palette"] [data-side="' + h.side + '"]');
			undoing = false; lastPush = 0;
			mark();
			return true;
		},
		undo: function () {
			var h = HISTORY.pop(); if (!h) return false;
			var now = ''; try { now = localStorage.getItem(TWEAKS_KEY) || '{}'; } catch (e) { /* private window */ }
			FUTURE.push({ tweaks: now, side: storedSide(), style: current, what: h.what }); /* what stands now, for Redo */
			undoing = true;
			try { localStorage.setItem(TWEAKS_KEY, h.tweaks); } catch (e) { /* private window */ }
			var s = byId(h.style) || byId(current);
			if (s) { apply(s, wanted(s)); applyRoles(); }
			if (h.side && h.side !== storedSide()) press('[data-quire-modes="palette"] [data-side="' + h.side + '"]');
			undoing = false; lastPush = 0;
			mark();
			return true;
		},
		/* ONE STYLE'S CHANGES GO, NOTHING ELSE (2026-09-24, the tile's own menu): the side,
		   the accent and the focus stay as the reader has them, which Reset everything
		   does not. On the style that is on, the style is put on again; Original's
		   changes are the dials themselves, so it is given back whole. */
		/* WHAT THIS STYLE CARRIES OVER ITS SAVED SELF, and a way back for a part of it
		   (Manuel, 2026-09-24, the changed-setting dots): paths as the tweak holds them,
		   'lines', 'roles.head', 'roles.head.size', 'colours.dark.ink'. */
		changes: function () {
			var s = byId(current) || {}, e = readTweaks()[current] || {}, out = {};
			/* the four dials are kept as a set when any one moves (remember), so a dial equal to the recipe is no change */
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
		/* VERSIONS (see readVersions): this browser's, newest first, each { t, record };
		   the style as saved or published; one kept now; a look at one on the page
		   (null ends it); and one brought back, which Undo takes back. */
		versions: function () { var s = byId(current); if (!s || s.host) return []; var l = readVersions()[s.id]; return Array.isArray(l) ? l.slice() : []; },
		savedRecord: function () { var s = byId(current); return s && !s.host ? savedRecord() : null; },
		nowRecord: function () {
			var s = byId(current); if (!s || s.host) return null;
			if (!previewing) return lookOf(JSON.parse(this.exportStyle() || '{}'));
			/* while a version is on the page, Now is what stood before the look */
			var shown = null; try { shown = localStorage.getItem(TWEAKS_KEY); if (previewing.raw === null) localStorage.removeItem(TWEAKS_KEY); else localStorage.setItem(TWEAKS_KEY, previewing.raw); } catch (e) { return null; }
			var out = lookOf(JSON.parse(this.exportStyle() || '{}'));
			try { if (shown === null) localStorage.removeItem(TWEAKS_KEY); else localStorage.setItem(TWEAKS_KEY, shown); } catch (e) { /* as above */ }
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
			keepVersion(); /* what stood is kept too, so the list can bring it back as well as Undo */
			var all = readTweaks(), e = entryFromRecord(rec);
			if (Object.keys(e).length) all[s.id] = e; else delete all[s.id];
			lastPush = 0; writeTweaks(all);
			if (HISTORY.length) HISTORY[HISTORY.length - 1].what = 'version';
			applyNow(s, wanted(s)); applyRoles();
			return true;
		},
		reset: function (id) {
			var s = byId(id); if (!s) return;
			if (s.host) { goHome(); return; } /* there is nothing to reset TO but the theme itself */
			var all = readTweaks(); delete all[id]; writeTweaks(all);
			apply(s, s);
			/* EVERYTHING (Manuel, 2026-09-13: "it really should reset everything"):
			   the side back to its default, the accent on, the focus mode on; the
			   text size is in the recipe already. */
			/* THE DEFAULT SIDE IS DARK (Manuel, 2026-09-19: "when I make Zurücksetzen it is dunkel. Dunkel ist der Default"). 1.3.269 made a first visit dark and left the reset pressing System, so by day a reset turned the page light. */
			press('[data-quire-modes="palette"] [data-side="dark"]');
			this.setAccent(true);
			this.setFocus(false);
		}
	};

	/* The article's face is stamped by reading-face.js and the interface's
	   by applySans: the roles read both, so they follow every change. */
	new MutationObserver(function () { applyRoles(); }).observe(root, { attributes: true, attributeFilter: ['data-face', 'data-sans'] });
	/* The fills' strength multiplies the pair's own steps, which change with the pair and the side. */
	new MutationObserver(function () { if (root.hasAttribute('data-fill')) applyLevels(); }).observe(root, { attributes: true, attributeFilter: ['data-theme'] });

	function renderHosts() {
		var CHECK = window.QuireIcons
			? window.QuireIcons.markup('check', 'class="quire-menu-check"')
			: '';
		document.querySelectorAll('[data-architrave-presets]').forEach(function (host) {
			/* THE STYLES BEING TUNED (Manuel, 2026-09-07 evening): only the
			   finished ones are offered; the rest stay in STYLES, hidden, and
			   come back one by one as their rooms are made right. */
			host.innerHTML = STYLES.filter(offered).map(function (p) {
				return '<li><button type="button" class="quire-menu-item" role="menuitemradio" ' +
					'aria-checked="false" data-preset="' + p.id + '">' +
					'<span class="quire-menu-label">' + t(p.label) + '</span>' + CHECK + '</button></li>';
			}).join('');
		});
		mark();
	}

	/* A TILE'S REST THAT MOVED REACHES WHO WORE IT (Manuel, 2026-09-30, Brochure B live: "sorry but that looks so different. Make it like in the lab"). The four dials are kept by their own scripts under their own keys, so a browser that wore a tile keeps the tile's OLD size, face and leading when a release changes them, and the next echo records them as an adjustment nobody made (his Brochure stood in the small Garamond of its first version under the new tile's everything else). A tile names the rests it has left here. At load: a record whose dials are exactly an old rest loses them, and where that tile is on and the page still wears an old rest, the tile's dials are pressed again. A reader who changed any dial away from the old rest has made a choice and keeps it. */
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
		if (seeded) apply(byId(current), wanted(byId(current))); /* a first visit on a site default, or a link: the rows follow the stamp (above) */
		restMoved();
		/* A carried link reached while the page is open changes the hash and
		   nothing else, so it is read here as well as before paint. */
		window.addEventListener('hashchange', function () {
			var m = /^#style=(.+)$/.exec(window.location.hash), data = m && decodeRecord(m[1]);
			if (!data) return;
			var entry = ownFromRecord(data); renderHosts(); apply(entry, entry);
			try { history.replaceState(null, '', window.location.pathname + window.location.search); } catch (e) { /* the address stays */ }
		});
		/* (the focus square's count and its press are focus-mode.js's now) */
		/* THE PAIR ARRIVES LATE (2026-09-12): color-mode.js swaps the palette
		   inside a view transition, after the press returns, so a reset or a
		   press that read the pair at once read the old one and the lines
		   stayed (Manuel: "if we are on Standard and I clicked Zurücksetzen,
		   that toggle for the lines is still on"). The switches are stamped
		   again when the page's theme actually changes. */
		new MutationObserver(function (records) {
			/* AND THE RECORD IS TAKEN HERE TOO (2026-09-12, measured live: the
			   press remembered the pair before it, so Standard's record said
			   Schwarzweiß after Neutral was chosen, and the next press or a
			   return to the tile played it back with the lines). A dial's
			   change on <html> is the fact; the press was only the wish. */
			if (records.some(function (r) { return r.attributeName === 'data-theme'; }) && applying) { applying = false; if (applyTimer) { clearTimeout(applyTimer); applyTimer = null; } }
			if (!applying) remember();
			if (records.some(function (r) { return r.attributeName === 'data-theme'; })) applyOptions();
			mark();
		}).observe(root, {
			attributes: true,
			attributeFilter: ['data-theme', 'data-reading', 'data-face', 'data-leading']
		});

		document.addEventListener('click', function (e) {
			/* A WAY BACK (2026-09-09). The row under the dials puts Standard on
			   with every dial at rest, forgetting Standard's own tweaks, and
			   shows only while something is off that rest. */
			if (e.target.closest('[data-architrave-reset]')) {
				if (STYLES[0] && STYLES[0].host) { slowly(goHome); return; }
				var all = readTweaks(); delete all[DEFAULT]; writeTweaks(all);
				apply(STYLES[0], STYLES[0]);
				return;
			}
			var row = e.target.closest('[data-preset]');
			if (row) {
				var p = byId(row.getAttribute('data-preset'));
				/* THE WAY BACK TO A CLEAN STYLE (2026-09-09, Manuel, live: "I
				   wanted to go back to the Book preset, there was no way"). A
				   tweak is remembered, so pressing Book brought back the tweaked
				   Book. Pressing the style that is already on, while it says
				   adjusted, forgets its tweaks and puts its recipe on: press once
				   to come back, press again to come back clean. */
				/* Adjusted by any dial, not the four alone (measured live
				   2026-09-13: a Book with square corners never came back clean). */
				/* THE DOUBLE-PRESS IS GONE (the audit, 2026-09-13: a hidden gesture
				   beside a visible reset; Books has one Reset Theme and nothing
				   on a tile). A press on the tile that is on re-applies it as
				   the reader left it; Zurücksetzen alone forgets the tweaks. */
				if (p && p.host) slowly(goHome); /* the theme's own look arrives with the same dissolve as any other tile */
				else if (p) apply(p, wanted(p));
				// The menu stays open, like the four dials: the check arriving
				// is the proof, and the page re-setting behind it.
				return;
			}
			if (applying) return;
			var dial = e.target.closest('[data-quire-modes="palette"] [data-palette], [data-reading-step], [data-face-choice], [data-leading-step]');
			void dial; /* remembered by the observer above, once the change has landed */
		});
	});
})();
