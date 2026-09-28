<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
/* Quire Design System — quire-icons.php
 * GENERATED FILE — do not edit.
 *
 * version 0.75.8
 * build   38507ae4ac9c
 *
 * Source:  design-system/tokens/icons.json
 * Wiring:  design-system/tokens/manifest.json
 * Rebuild: node design-system/tokens/build.mjs
 *
 * This file is copied into consuming projects. The two values above are
 * how a copy identifies itself once it is no longer beside its source:
 * "version" is the release, "build" is a hash of everything below this
 * comment. Run "npm run consumers" in the design system to see where
 * every copy stands.
 */
/**
 * Every drawing the system ships, by name, for a consumer that renders on the
 * server. Same registry as quire.icons.js — emitted twice because a block theme
 * builds its HTML before a browser ever sees it, and a mark that needs
 * JavaScript flashes in, is missing without it, and is invisible to anything
 * reading the page as HTML.
 *
 * No size, stroke or colour: those are the icon roles in the tokens, and a
 * drawing carrying its own would be a second opinion about them.
 *
 * @return array<string, string> icon name => the SVG body, without the tag.
 */

return array(
	// The size of the type, for a reading-scale picker (DS-257). Two letter A's
	// at two sizes — the only mark in the family that says SIZE rather than
	// reading; the row wore `newspaper` until this arrived, which means reading
	// and left the control saying the wrong half of its job. Lucide's own path,
	// unaltered: the small a's bowl is a 1.02-ratio arc and redrawing it by hand
	// is how a copy stops matching the family.
	'a-large-small' => "<path d=\"m15 16 2.536-7.328a1.02 1.02 1 0 1 1.928 0L22 16\"/><path d=\"M15.697 14h5.606\"/><path d=\"m2 16 4.039-9.69a.5.5 0 0 1 .923 0L11 16\"/><path d=\"M3.304 13h6.392\"/>", // lucide:a-large-small
	// Where you are in a list, and where a row will take you (DS-280). The
	// family had `arrow-up-right`, which is the LEAVING mark — it means this
	// link goes somewhere off this site — and `chevron-right`, which means this
	// row opens something. Neither says 'this one, here, now'. Lucide's own
	// path, unaltered.
	'arrow-right' => "<path d=\"M5 12h14\"/><path d=\"m12 5 7 7-7 7\"/>", // lucide:arrow-right
	// THE OLDER POST (2026-09-15): the date line's two arrows walk the posts;
	// the mirror of the mark above, Lucide's own path, unaltered.
	'arrow-left' => "<path d=\"m12 19-7-7 7-7\"/><path d=\"M19 12H5\"/>", // lucide:arrow-left
	'arrow-up-right' => "<path d=\"M7 7h10v10\"/><path d=\"M7 17 17 7\"/>", // lucide:arrow-up-right
	// A POST FORMAT'S MARK (DS-290). WordPress lets a post declare what KIND of
	// thing it is — eight formats plus the standard post — and a list of a
	// thousand titles is where that matters: the mark is what tells a two-line
	// aside from a gallery before you read either. Every row carries one,
	// standard included, because a glyph on some rows and not others gives one
	// list two title edges (DS-045). Lucide's own path, unaltered. The audio
	// format. NOT `volume-2`, which the registry already has and which means how
	// loud this is — a control's mark, not a kind of post.
	'audio-lines' => "<path d=\"M2 10v3\"/><path d=\"M6 6v11\"/><path d=\"M10 3v18\"/><path d=\"M14 8v7\"/><path d=\"M18 5v13\"/><path d=\"M22 10v3\"/>", // lucide:audio-lines
	// A YEAR, OR A DATE (DS-341). The About page's numbers card says when the
	// blog began, and a year in a list of counts wants the mark that says TIME
	// rather than amount. Lucide's own path, unaltered; `calendar-days` was the
	// other candidate and its six dots at 16px are texture, not information.
	'calendar' => "<path d=\"M8 2v3\"/><path d=\"M16 2v3\"/><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/><path d=\"M3 9h18\"/>", // lucide:calendar
	'check' => "<path d=\"M20 6 9 17l-5-5\"/>", // lucide:check
	'chevron-down' => "<path d=\"m6 9 6 6 6-6\"/>", // lucide:chevron-down
	'chevron-left' => "<path d=\"m15 18-6-6 6-6\"/>", // lucide:chevron-left
	'chevron-right' => "<path d=\"m9 18 6-6-6-6\"/>", // lucide:chevron-right
	'chevron-up' => "<path d=\"m18 15-6-6-6 6\"/>", // lucide:chevron-up
	'chevrons-down' => "<path d=\"m7 6 5 5 5-5\"/><path d=\"m7 13 5 5 5-5\"/>", // lucide:chevrons-down
	'chevrons-up-down' => "<path d=\"m7 15 5 5 5-5\"/><path d=\"m7 9 5-5 5 5\"/>", // lucide:chevrons-up-down
	'settings' => "<path d=\"M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/>", // lucide:settings
	'eye-closed' => "<path d=\"m15 18-.722-3.25\"/><path d=\"M2 8a10.645 10.645 0 0 0 20 0\"/><path d=\"m20 15-1.726-2.05\"/><path d=\"m4 15 1.726-2.05\"/><path d=\"m9 18 .722-3.25\"/>", // lucide:eye-closed
	// Drawn to the menu mark's own width (4→20 rather than Lucide's 6→18)
	// because the two are one control in two states: they swap in place, and ink
	// that changes width makes the control jump.
	'close' => "<line x1=\"20\" y1=\"4\" x2=\"4\" y2=\"20\"/><line x1=\"4\" y1=\"4\" x2=\"20\" y2=\"20\"/>", // quire
	// THE COFFEE (DS-337). Drawn into Architrave's copy of quire-icons.php on
	// 2026-08-26 for the coffee card under an article, and the sync refused to
	// overwrite the edit on 2026-08-27, which is how it came home. Lucide's own
	// path, unaltered. `cup` (cup-soda) stays for whoever picked it.
	'coffee' => "<path d=\"M10 2v2\"/><path d=\"M14 2v2\"/><path d=\"M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1\"/><path d=\"M6 2v2\"/>", // lucide:coffee
	// A table of contents: three rules of UNEQUAL length, left aligned. The
	// registry's own `menu` note rules against three strokes at chrome sizes —
	// and that ruling is about three EQUAL strokes, which close into a grey
	// block because nothing distinguishes them. Lengths of 18, 12 and 14 units
	// leave two ragged ends doing the reading, and the mark holds at 16. Named
	// for what it means rather than for the alignment it borrows: no consumer
	// wants this to say `align-left`.
	'contents' => "<path d=\"M21 6H3\"/><path d=\"M15 12H3\"/><path d=\"M17 18H3\"/>", // lucide:align-left
	'copy' => "<rect width=\"14\" height=\"14\" x=\"8\" y=\"8\" rx=\"2\" ry=\"2\"/><path d=\"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2\"/>", // lucide:copy
	'cup' => "<path d=\"M10 2v2\"/><path d=\"M14 2v2\"/><path d=\"M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1\"/><path d=\"M6 2v2\"/>", // lucide:cup-soda
	// The taking mark (DS-323, 2026-08-18): a row's artifact comes to you —
	// first asked for by Architrave's themes overview, where a theme card's
	// third action hands over the zip itself while Info explains and the
	// repository shows the code. An arrow INTO the tray, the inverse of the
	// leaving arrow's direction of travel. Lucide's own path, unaltered, as the
	// family rule requires.
	'download' => "<path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\"/><path d=\"m7 10 5 5 5-5\"/><path d=\"M12 15V3\"/>", // lucide:download
	// THE LANGUAGE, AS A WORLD (2026-09-10, Manuel, pointing at Lucide's
	// drawing): a globe with its continents, where `globe` is the wireframe
	// sphere and `languages` the script mark whose A fought the reading panel's
	// Aa beside it. Lucide's own paths, unaltered.
	'earth' => "<path d=\"M21.54 15H17a2 2 0 0 0-2 2v4.54\"/><path d=\"M7 3.34V5a3 3 0 0 0 3 3a2 2 0 0 1 2 2c0 1.1.9 2 2 2a2 2 0 0 0 2-2c0-1.1.9-2 2-2h3.17\"/><path d=\"M11 21.95V18a2 2 0 0 0-2-2a2 2 0 0 1-2-2v-1a2 2 0 0 0-2-2H2.05\"/><circle cx=\"12\" cy=\"12\" r=\"10\"/>", // lucide:earth
	'expand' => "<path d=\"M15 3h6v6\"/><path d=\"M9 21H3v-6\"/><path d=\"M21 3l-7 7\"/><path d=\"M3 21l7-7\"/>", // lucide:maximize-2
	// The looking mark (DS-327, 2026-08-22): Architrave's theme card had a third
	// action that handed over the zip (DS-323); Manuel turned it into VIEW DEMO
	// — the card's third thing is now to look at the theme running, not to take
	// it. Lucide's own path, unaltered, as the family rule requires. `download`
	// stays in the registry for whoever needs the taking mark.
	'eye' => "<path d=\"M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/>", // lucide:eye
	// Go forward through what has not played yet. The twin of `rewind`.
	'fast-forward' => "<path d=\"M12 6a2 2 0 0 1 3.414-1.414l6 6a2 2 0 0 1 0 2.828l-6 6A2 2 0 0 1 12 18z\"/><path d=\"M2 6a2 2 0 0 1 3.414-1.414l6 6a2 2 0 0 1 0 2.828l-6 6A2 2 0 0 1 2 18z\"/>", // lucide:fast-forward
	// A POST FORMAT'S MARK (DS-290). WordPress lets a post declare what KIND of
	// thing it is — eight formats plus the standard post — and a list of a
	// thousand titles is where that matters: the mark is what tells a two-line
	// aside from a gallery before you read either. Every row carries one,
	// standard included, because a glyph on some rows and not others gives one
	// list two title edges (DS-045). Lucide's own path, unaltered. THE STANDARD
	// POST, which is most of any blog — so this glyph sets the texture of the
	// whole column and was chosen last, against eight others. It says written
	// rather than filed: `file-text` and `newspaper` both draw a DOCUMENT, which
	// is what a post is stored as, not what it is. `newspaper` was also
	// unavailable — it already means "related articles" in Architrave's bar
	// under a post.
	'feather' => "<path d=\"M12.67 19a2 2 0 0 0 1.416-.588l6.154-6.172a6 6 0 0 0-8.49-8.49L5.586 9.914A2 2 0 0 0 5 11.328V18a1 1 0 0 0 1 1z\"/><path d=\"M16 8 2 22\"/><path d=\"M17.5 15H9\"/>", // lucide:feather
	'fold' => "<path d=\"m7 20 5-5 5 5\"/><path d=\"m7 4 5 5 5-5\"/>", // lucide:chevrons-down-up
	// A CATEGORY (DS-341): a post is filed under one, so the mark is the thing
	// posts are filed in. Lucide's own path, unaltered.
	'folder' => "<path d=\"M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z\"/>", // lucide:folder
	// The site itself in another language. Chosen over `languages` (A文) for the
	// language switcher: the translation glyph reads as translation happening to
	// this page, and a language switch is a destination that already exists.
	'globe' => "<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20\"/><path d=\"M2 12h20\"/>", // lucide:globe
	// A POST FORMAT'S MARK (DS-290). WordPress lets a post declare what KIND of
	// thing it is — eight formats plus the standard post — and a list of a
	// thousand titles is where that matters: the mark is what tells a two-line
	// aside from a gallery before you read either. Every row carries one,
	// standard included, because a glyph on some rows and not others gives one
	// list two title edges (DS-045). Lucide's own path, unaltered. One
	// photograph. Sits beside `images` for the gallery, and the two differ by a
	// single stacked frame — which is the right amount of difference, since one
	// picture and several are the same idea at two counts.
	'image' => "<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" ry=\"2\"/><circle cx=\"9\" cy=\"9\" r=\"2\"/><path d=\"m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21\"/>", // lucide:image
	// A POST FORMAT'S MARK (DS-290). WordPress lets a post declare what KIND of
	// thing it is — eight formats plus the standard post — and a list of a
	// thousand titles is where that matters: the mark is what tells a two-line
	// aside from a gallery before you read either. Every row carries one,
	// standard included, because a glyph on some rows and not others gives one
	// list two title edges (DS-045). Lucide's own path, unaltered. The gallery
	// format: the same frame as `image` with one behind it.
	'images' => "<path d=\"m22 11-1.296-1.296a2.4 2.4 0 0 0-3.408 0L11 16\"/><path d=\"M4 8a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2\"/><circle cx=\"13\" cy=\"7\" r=\"1\" fill=\"currentColor\"/><rect x=\"8\" y=\"2\" width=\"14\" height=\"14\" rx=\"2\"/>", // lucide:images
	'languages' => "<path d=\"m5 8 6 6\"/><path d=\"m4 14 6-6 2-3\"/><path d=\"M2 5h12\"/><path d=\"M7 2h1\"/><path d=\"m22 22-5-10-5 10\"/><path d=\"M14 18h6\"/>", // lucide:languages
	// Copying an address, not opening one (DS-281). The family's other two
	// right-leaning marks say where a link GOES — `arrow-up-right` leaves the
	// site, `chevron-right` opens a thing — and this one is about the URL itself
	// as a thing you can take away. Lucide's own path, unaltered: two half-links
	// meeting on a diagonal, which reads at control size where a whole chain
	// would not.
	'link' => "<path d=\"M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71\"/><path d=\"M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71\"/>", // lucide:link
	// The letter on the rail's newsletter button (Architrave 1.1.571): a closed
	// envelope, the thing a newsletter arrives in. `mailbox` is where the site's
	// mail lives; this is one letter.
	'mail' => "<rect width=\"20\" height=\"16\" x=\"2\" y=\"4\" rx=\"2\"/><path d=\"m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7\"/>", // lucide:mail
	'mailbox' => "<path d=\"M22 17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9.5C2 7 4 5 6.5 5H18c2.2 0 4 1.8 4 4v8Z\"/><path d=\"M15 9h3v2\"/><path d=\"M6.5 5C9 5 11 7 11 9.5V17a2 2 0 0 1-2 2\"/><path d=\"M6 10h1\"/>", // lucide:mailbox
	// Two strokes, not Lucide's three. The system draws its own here: at the
	// sizes chrome uses, three strokes at the fixed 1.25 weight close up into a
	// grey block, and the mark has to read at 16 as well as 24.
	'menu' => "<line x1=\"4\" y1=\"8\" x2=\"20\" y2=\"8\"/><line x1=\"4\" y1=\"16\" x2=\"20\" y2=\"16\"/>", // quire
	// A POST FORMAT'S MARK (DS-290). WordPress lets a post declare what KIND of
	// thing it is — eight formats plus the standard post — and a list of a
	// thousand titles is where that matters: the mark is what tells a two-line
	// aside from a gallery before you read either. Every row carries one,
	// standard included, because a glyph on some rows and not others gives one
	// list two title edges (DS-045). Lucide's own path, unaltered. The status
	// format — a short update, the thing a blog posts instead of a tweet. IT IS
	// ROUND FOR A REASON: `message-square` is already the COMMENTS mark, on
	// comment counts and in the article bar, so the obvious bubble was spoken
	// for and shape is what keeps the two apart. Chosen from fourteen candidates
	// on a specimen; `at-sign` said social rather than short, `megaphone` and
	// `radio` were loud for two sentences, `ellipsis` and `rss` already mean
	// menu and subscribe everywhere else.
	'message-circle' => "<path d=\"M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719\"/>", // lucide:message-circle
	// THE ROUND BUBBLE'S COLLAPSED PAIR (DS-326). Architrave's comments panel
	// tried the round pair on its two doors instead of the square (DS-324):
	// `message-circle` opening, this closing. Manuel confirmed it from Lucide's
	// own set (2026-08-19), so it joins rather than being drawn by hand in the
	// theme. Lucide's own path, unaltered.
	'message-circle-dashed' => "<path d=\"M10.1 2.182a10 10 0 0 1 3.8 0\"/><path d=\"M13.9 21.818a10 10 0 0 1-3.8 0\"/><path d=\"M17.609 3.72a10 10 0 0 1 2.69 2.7\"/><path d=\"M2.182 13.9a10 10 0 0 1 0-3.8\"/><path d=\"M20.28 17.61a10 10 0 0 1-2.7 2.69\"/><path d=\"M21.818 10.1a10 10 0 0 1 0 3.8\"/><path d=\"M3.721 6.391a10 10 0 0 1 2.7-2.69\"/><path d=\"m6.163 21.117-2.906.85a1 1 0 0 1-1.236-1.169l.965-2.98\"/>", // lucide:message-circle-dashed
	// The round bubble, struck through (DS-328). Architrave's comments door
	// wears it when a post has its comments switched off (2026-08-21, Manuel:
	// "we would need another icon, the one with the stroke through"). It was
	// drawn into the theme's copy of this file first and came home at the next
	// sync. Lucide's own path, unaltered.
	'message-circle-off' => "<path d=\"M20.5 14.9A9 9 0 0 0 9.1 3.5\"/><path d=\"m2 2 20 20\"/><path d=\"M5.6 5.6C3 8.3 2.2 12.5 4 16l-2 6 6-2c3.4 1.8 7.6 1.1 10.3-1.7\"/>", // lucide:message-circle-off
	// A comment thread, and the count on it (DS-264). Registered for
	// Architrave's single post, where a control beside the date says how many
	// comments a piece has and goes to them. The SQUARE bubble rather than the
	// circle: this system's surfaces are rounded rectangles — rows, panels,
	// cards, the menu — and a round bubble beside them reads as a mark from a
	// different family. Lucide's own path, unaltered.
	'message-square' => "<path d=\"M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z\"/>", // lucide:message-square
	// THE COMMENTS PANEL'S CLOSE (DS-324). Architrave puts the thread beside the
	// article, in a panel opened from a comment mark at the paper's top-right;
	// the panel's own control puts it away again. Two marks were tried the same
	// afternoon: `panel-right-close` said 'a column of chrome' where the reader
	// had opened a conversation, and `message-square-off` said DISABLED — a
	// state of the site, not of the panel. The dashed bubble says the outline is
	// here and the thing is not, which is what a collapsed panel is. Manuel:
	// 'the strike-through is too harsh, it means comments disabled.' The pair
	// swaps in place like panel-open/close: both drawn, one hidden. Lucide's own
	// path, unaltered.
	'message-square-dashed' => "<path d=\"M14 3h2\"/><path d=\"M16 19h-2\"/><path d=\"M2 12v-2\"/><path d=\"M2 16v5.286a.71.71 0 0 0 1.212.502l1.149-1.149\"/><path d=\"M20 19a2 2 0 0 0 2-2v-1\"/><path d=\"M22 10v2\"/><path d=\"M22 6V5a2 2 0 0 0-2-2\"/><path d=\"M4 3a2 2 0 0 0-2 2v1\"/><path d=\"M8 19h2\"/><path d=\"M8 3h2\"/>", // lucide:message-square-dashed
	'moon' => "<path d=\"M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z\"/>", // lucide:moon
	'more' => "<circle cx=\"12\" cy=\"12\" r=\"1\"/><circle cx=\"19\" cy=\"12\" r=\"1\"/><circle cx=\"5\" cy=\"12\" r=\"1\"/>", // lucide:ellipsis
	'newspaper' => "<path d=\"M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2\"/><path d=\"M18 14h-8\"/><path d=\"M15 18h-5\"/><path d=\"M10 6h8v4h-8V6Z\"/>", // lucide:newspaper
	'palette' => "<circle cx=\"13.5\" cy=\"6.5\" r=\".5\" fill=\"currentColor\"/><circle cx=\"17.5\" cy=\"10.5\" r=\".5\" fill=\"currentColor\"/><circle cx=\"8.5\" cy=\"7.5\" r=\".5\" fill=\"currentColor\"/><circle cx=\"6.5\" cy=\"12.5\" r=\".5\" fill=\"currentColor\"/><path d=\"M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z\"/>", // lucide:palette
	'panel-close' => "<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\"/><path d=\"M9 3v18\"/><path d=\"m16 15-3-3 3-3\"/>", // lucide:panel-left-close
	'panel-open' => "<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\"/><path d=\"M9 3v18\"/><path d=\"m14 9 3 3-3 3\"/>", // lucide:panel-left-open
	// The pair above draws the LEFT panel. A consumer with a panel on the other
	// side was mirroring those with `scaleX(-1)`, which reads correctly and is
	// the consumer drawing rather than the system saying — and put two identical
	// marks on one screen for two different columns. Lucide ships the right-hand
	// pair; the family already had the idea.
	'panel-right-close' => "<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\"/><path d=\"M15 3v18\"/><path d=\"m8 9 3 3-3 3\"/>", // lucide:panel-right-close
	'panel-right-open' => "<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\"/><path d=\"M15 3v18\"/><path d=\"m10 15-3-3 3-3\"/>", // lucide:panel-right-open
	// Stop playing, without giving up the position. The twin of `play` — see
	// that entry.
	'pause' => "<rect x=\"14\" y=\"3\" width=\"5\" height=\"18\" rx=\"1\"/><rect x=\"5\" y=\"3\" width=\"5\" height=\"18\" rx=\"1\"/>", // lucide:pause
	// A POST FORMAT'S MARK (DS-290). WordPress lets a post declare what KIND of
	// thing it is — eight formats plus the standard post — and a list of a
	// thousand titles is where that matters: the mark is what tells a two-line
	// aside from a gallery before you read either. Every row carries one,
	// standard included, because a glyph on some rows and not others gives one
	// list two title edges (DS-045). Lucide's own path, unaltered. The aside
	// format: a short note, written in passing. `square-pen` was the alternative
	// and reads as COMPOSE — an editor's button — which is a control and not a
	// label.
	'pencil-line' => "<path d=\"M13 21h8\"/><path d=\"m15 5 4 4\"/><path d=\"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z\"/>", // lucide:pencil-line
	// Start playing. Registered for Architrave's spoken-article control
	// (DS-266), and the pair below it is the whole reason it is two entries
	// rather than one: a control that starts something must be able to stop it,
	// and a registry holding only half the pair invites the other half to be
	// drawn by hand.
	'play' => "<path d=\"M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z\"/>", // lucide:play
	// A POST FORMAT'S MARK (DS-290). WordPress lets a post declare what KIND of
	// thing it is — eight formats plus the standard post — and a list of a
	// thousand titles is where that matters: the mark is what tells a two-line
	// aside from a gallery before you read either. Every row carries one,
	// standard included, because a glyph on some rows and not others gives one
	// list two title edges (DS-045). Lucide's own path, unaltered. The quote
	// format. Lucide's two pairs of marks rather than a bubble, which keeps it
	// clear of everything in the message family.
	'quote' => "<path d=\"M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z\"/><path d=\"M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z\"/>", // lucide:quote
	// THE COMMENT'S REPLY (DS-325). Architrave's thread had Reply as a bare
	// muted link under each comment; beside the article, in the comments panel,
	// it becomes a small ghost button and wants a glyph in front of its word —
	// the turning arrow every mail client has taught. Lucide's own path,
	// unaltered.
	'reply' => "<path d=\"M20 18v-2a4 4 0 0 0-4-4H4\"/><path d=\"m9 17-5-5 5-5\"/>", // lucide:reply
	// Go back through what has played — the transport mark, two triangles
	// pointing back (DS-271). Registered beside `fast-forward` as a pair.
	// Distinct from `rotate-ccw`, which is a circular arrow and reads as undo or
	// reload; this one only ever means a recording.
	'rewind' => "<path d=\"M12 6a2 2 0 0 0-3.414-1.414l-6 6a2 2 0 0 0 0 2.828l6 6A2 2 0 0 0 12 18z\"/><path d=\"M22 6a2 2 0 0 0-3.414-1.414l-6 6a2 2 0 0 0 0 2.828l6 6A2 2 0 0 0 22 18z\"/>", // lucide:rewind
	// Go back over ground already covered — a seek backwards in a player, an
	// undo of a step (DS-267). Registered as the twin of `rotate-cw`, for the
	// same reason `play` and `pause` were registered together.
	'rotate-ccw' => "<path d=\"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8\"/><path d=\"M3 3v5h5\"/>", // lucide:rotate-ccw
	// Go forward over ground not yet covered — a seek forwards. The twin of
	// `rotate-ccw`.
	'rotate-cw' => "<path d=\"M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8\"/><path d=\"M21 3v5h-5\"/>", // lucide:rotate-cw
	// The distance between lines, for a line-spacing picker (DS-347). A box
	// ruled into three equal rows: the rows are the lines and the box is the
	// block they fill, so tighter or looser is read straight off it. Sits beside
	// `a-large-small` (SIZE) and `type` (FACE) as the third half-sentence of how
	// a page is set. Lucide's own path, unaltered.
	'rows-3' => "<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\"/><path d=\"M21 9H3\"/><path d=\"M21 15H3\"/>", // lucide:rows-3
	// A LINK THAT HANDS YOU THE WRITING RATHER THAN SHOWING IT (DS-294). The
	// mark on a feed row: the dot and two arcs everybody has recognised since
	// 2004, and the one glyph in this family whose meaning was settled by
	// convention rather than by drawing. Not for a SUBSCRIBE control — that is
	// an action and takes a button's own label; this says where a row goes.
	// First consumer is Architrave's rail, which recognises a feed URL and marks
	// it the way it already marks a link that leaves the site, at the row's
	// trailing edge. Lucide's own path, unaltered.
	'rss' => "<path d=\"M4 11a9 9 0 0 1 9 9\"/><path d=\"M4 4a16 16 0 0 1 16 16\"/><circle cx=\"5\" cy=\"19\" r=\"1\"/>", // lucide:rss
	'search' => "<circle cx=\"11\" cy=\"11\" r=\"8\"/><path d=\"m21 21-4.3-4.3\"/>", // lucide:search
	// The reader's settings as one door (DS-348): three sliders, each at its own
	// position, which is what a set of adjustable things looks like before you
	// open it. Sits on Architrave's phone foot where four labelled buttons
	// stood, and opens the same four rows the rail's More menu shows. Lucide's
	// own path, unaltered. Corrected in v0.58.0 to Lucide 1.41's drawing: the
	// first cut was the older line-based one, recalled rather than read.
	'sliders-horizontal' => "<path d=\"M10 5H3\"/><path d=\"M12 19H3\"/><path d=\"M14 3v4\"/><path d=\"M16 17v4\"/><path d=\"M21 12h-9\"/><path d=\"M21 19h-5\"/><path d=\"M21 5h-7\"/><path d=\"M8 10v4\"/><path d=\"M8 12H3\"/>", // lucide:sliders-horizontal
	// THE MADE-BY-AI MARK (DS-335, 2026-08-27). Architrave carries things a
	// machine made from the writers' work: the spoken article in a cloned voice,
	// a translation. Each stands in a dashed card with a tag on its edge, and
	// the tag needed the sign readers already know for AI. Manuel asked for it
	// by name ("these stars or sparkling"). The dashed border is the family
	// mark; this glyph is what a reader who does not know the family reads.
	// Lucide's own path, unaltered.
	'sparkles' => "<path d=\"M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z\"/><path d=\"M20 2v4\"/><path d=\"M22 4h-4\"/><circle cx=\"4\" cy=\"20\" r=\"2\"/>", // lucide:sparkles
	'sun' => "<circle cx=\"12\" cy=\"12\" r=\"4\"/><path d=\"M12 2v2\"/><path d=\"M12 20v2\"/><path d=\"m4.93 4.93 1.41 1.41\"/><path d=\"m17.66 17.66 1.41 1.41\"/><path d=\"M2 12h2\"/><path d=\"M20 12h2\"/><path d=\"m6.34 17.66-1.41 1.41\"/><path d=\"m19.07 4.93-1.41 1.41\"/>", // lucide:sun
	// APPEARANCE, WHICH IS BOTH SIDES AT ONCE (DS-312). The registry had `sun`
	// and `moon` — each of them names one side of the ladder, and a row that
	// opens a control holding System, Light AND Dark cannot wear either without
	// saying that one of the three is the subject. `palette` was the stand-in
	// and had the opposite fault: it names the six colour rooms, which is the
	// flyout's SECOND control, so the row was labelled by its lower half. This
	// drawing is a moon with the sun's rays around it: the whole choice, not a
	// side of it. Lucide's own path, unaltered — the moon here is a single arc
	// that closes against the rays and a redrawn version is exactly the copy
	// DS-258 warns about.
	'sun-moon' => "<path d=\"M12 2v2\"/><path d=\"M14.837 16.385a6 6 0 1 1-7.223-7.222c.624-.147.97.66.715 1.248a4 4 0 0 0 5.26 5.259c.589-.255 1.396.09 1.248.715\"/><path d=\"M16 12a4 4 0 0 0-4-4\"/><path d=\"m19 5-1.256 1.256\"/><path d=\"M20 12h2\"/>", // lucide:sun-moon
	// THE LIGHT SIDE, AS APPLE BOOKS DRAWS IT (2026-09-09, Manuel beside Books'
	// Light / Dark / Automatic menu: "do we find better icons that fit better").
	// Books' Light is a sun over a horizon; `sun` alone is a noon sun and
	// `sunrise` carries an arrow. Haze is the half sun with rays over two
	// horizon lines, Lucide's own path, unaltered.
	'haze' => "<path d=\"m5.2 6.2 1.4 1.4\"/><path d=\"M2 13h2\"/><path d=\"M20 13h2\"/><path d=\"m17.4 7.6 1.4-1.4\"/><path d=\"M22 17H2\"/><path d=\"M22 21H2\"/><path d=\"M16 13a4 4 0 0 0-8 0\"/><path d=\"M12 5V2.5\"/>", // lucide:haze
	// THE DARK SIDE, AS APPLE BOOKS DRAWS IT (2026-09-09): a crescent with a
	// small star, where `moon` alone is the bare crescent. Lucide's own path,
	// unaltered.
	'moon-star' => "<path d=\"M18 5h4\"/><path d=\"M20 3v4\"/><path d=\"M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401\"/>", // lucide:moon-star
	// AUTOMATIC, AS APPLE BOOKS DRAWS IT (2026-09-09): a circle whose right half
	// is filled, the two sides in one mark, on the row and on the button that
	// opens the three. Lucide's own paths; the half is FILLED here where Lucide
	// strokes it, because a stroked half reads as a lens and the filled one as a
	// side.
	'contrast' => "<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 18a6 6 0 0 0 0-12v12z\" fill=\"currentColor\"/>", // lucide:contrast
	'sunrise' => "<path d=\"M12 2v8\"/><path d=\"m4.93 10.93 1.41 1.41\"/><path d=\"M2 18h2\"/><path d=\"M20 18h2\"/><path d=\"m19.07 10.93-1.41 1.41\"/><path d=\"M22 22H2\"/><path d=\"m8 6 4-4 4 4\"/><path d=\"M16 18a4 4 0 0 0-8 0\"/>", // lucide:sunrise
	// A fan of swatches, for a picker of PRESETS (DS-349): whole arrangements of
	// the reader's settings with a name each, where `sliders-horizontal` is the
	// door to the single dials. A swatch is exactly that, a finished combination
	// you pick rather than mix. Lucide's own path, unaltered.
	'swatch-book' => "<path d=\"M11 17a4 4 0 0 1-8 0V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2Z\"/><path d=\"M16.7 13H19a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H7\"/><path d=\"M 7 17h.01\"/><path d=\"m11 8 2.3-2.3a2.4 2.4 0 0 1 3.404.004L18.6 7.6a2.4 2.4 0 0 1 .026 3.434L9.9 19.8\"/>", // lucide:swatch-book
	// A TAG (DS-341), the other way a post is labelled. Lucide's own path,
	// unaltered, including the filled hole — the one place in the family a dot
	// is filled, as `palette` already does.
	'tag' => "<path d=\"M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z\"/><circle cx=\"7.5\" cy=\"7.5\" r=\".5\" fill=\"currentColor\"/>", // lucide:tag
	// The face of the type, for a reading-face picker (DS-345). A letter T on
	// its baseline, the mark every text editor already uses for a font. Sits
	// beside `a-large-small`, which says SIZE: the two are the two halves of how
	// a page is set, and a reader who has met one knows the other. Lucide's own
	// path, unaltered.
	'type' => "<path d=\"M12 4v16\"/><path d=\"M4 7V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2\"/><path d=\"M9 20h6\"/>", // lucide:type
	'unfold' => "<path d=\"m7 15 5 5 5-5\"/><path d=\"m7 9 5-5 5 5\"/>", // lucide:chevrons-up-down
	// A POST FORMAT'S MARK (DS-290). WordPress lets a post declare what KIND of
	// thing it is — eight formats plus the standard post — and a list of a
	// thousand titles is where that matters: the mark is what tells a two-line
	// aside from a gallery before you read either. Every row carries one,
	// standard included, because a glyph on some rows and not others gives one
	// list two title edges (DS-045). Lucide's own path, unaltered. The video
	// format.
	'video' => "<path d=\"m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5\"/><rect x=\"2\" y=\"6\" width=\"14\" height=\"12\" rx=\"2\"/>", // lucide:video
	// Sound is on, and how loud (DS-268). The twin below is muted; a control
	// that turns sound on has to be able to turn it off, which is the DS-266
	// rule again.
	'volume-2' => "<path d=\"M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z\"/><path d=\"M16 9a5 5 0 0 1 0 6\"/><path d=\"M19.364 18.364a9 9 0 0 0 0-12.728\"/>", // lucide:volume-2
	// Sound is off. The twin of `volume-2`.
	'volume-x' => "<path d=\"M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z\"/><line x1=\"22\" x2=\"16\" y1=\"9\" y2=\"15\"/><line x1=\"16\" x2=\"22\" y1=\"9\" y2=\"15\"/>", // lucide:volume-x
);
