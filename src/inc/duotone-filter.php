<?php
/**
 * THE FOUR SVG FILTERS THE PICTURE LOOKS ARE MADE OF.
 *
 * ONE COPY, TWO HOMES (0.9.0). Duotone, halftone, dither and grain are drawn
 * by these filters and named by url(#architrave-…) in the stylesheet. The
 * theme prints them on its own pages; the plugin prints them where it is a
 * guest, because a stranger's theme has never heard of them and the four looks
 * came out blank. The file is shared rather than copied: a hand copy of a
 * sixteen-cell Bayer loop drifts, and a dither that is subtly wrong looks like
 * a design choice rather than a bug.
 *
 * It declares the function and hooks nothing. Each side hooks it itself, and
 * each side checks first that the other has not already declared it.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * The duotone behind Getönt (2026-09-14): an SVG filter the pictures reference
 * by id. Its two floods take the pair's colours from CSS (style.css, THE
 * BILDER DIAL), so one filter serves every pair and both sides: the picture's
 * luminance carries the lighter colour over the darker.
 *
 * THREE MORE BESIDE IT (2026-09-19; lab sheet the-picture-effects), and none
 * of them loads an image: each pattern is drawn from floods in one small
 * cell and tiled, so the cost is the cell's, not the picture's.
 *
 * Raster: an 8px cell, a dot in the middle and a quarter dot in each corner
 * (which is a 45 degree screen once tiled), blurred into a field of soft
 * bumps and stretched to the full range. Half the picture's grey plus half
 * the field, cut at the middle: a dot grows where the picture is dark. The
 * half-and-half is what keeps the alpha at one; grey MINUS field leaves it
 * at a half and every colour comes out doubled.
 *
 * Pixel: the grey picture sampled once per 3px cell and spread over the cell
 * (a sample, then dilate by one: the cell has to be odd for that), then cut
 * against the 4x4 ordered matrix in 3px cells, written here as one minus the
 * threshold for the same half-and-half.
 *
 * Korn: 160px of noise, stitched so it tiles, its alpha set to one, laid
 * over the picture as overlay. Middle grey is overlay's nothing, so the
 * colour stays.
 *
 * Raster and Pixel come out black and white; style.css sends them through
 * the duotone after, which is where they take the pair's colours.
 */
function architrave_duotone_filter() {
	$cut = static function ( $slope, $intercept ) {
		$f = '';
		foreach ( array( 'R', 'G', 'B' ) as $c ) {
			$f .= '<feFunc' . $c . ' type="linear" slope="' . $slope . '" intercept="' . $intercept . '"/>';
		}
		return $f;
	};
	$whole = ' color-interpolation-filters="sRGB" x="0" y="0" width="100%" height="100%"';
	$mix   = ' operator="arithmetic" k1="0" k2=".5" k3=".5" k4="0" result="mix"/>';

	$bayer  = array( 0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5 );
	$cells  = '';
	$merged = '';
	foreach ( $bayer as $i => $b ) {
		$v       = (int) round( 255 * ( 1 - ( $b + 0.5 ) / 16 ) );
		$cells  .= '<feFlood x="' . ( ( $i % 4 ) * 3 ) . '" y="' . ( intdiv( $i, 4 ) * 3 ) . '" width="3" height="3" flood-color="rgb(' . $v . ',' . $v . ',' . $v . ')" result="b' . $i . '"/>';
		$merged .= '<feMergeNode in="b' . $i . '"/>';
	}

	// phpcs:disable WordPress.Security.EscapeOutput.OutputNotEscaped -- fixed SVG assembled above from string literals and integers computed in this file (the Bayer matrix, cell coordinates); no user input reaches it, and wp_kses knows no SVG filter grammar to pass it through.
	echo '<svg class="architrave-duotone" aria-hidden="true" focusable="false"><filter id="architrave-duotone" color-interpolation-filters="sRGB">'
		. '<feColorMatrix in="SourceGraphic" type="luminanceToAlpha" result="luma"/>'
		. '<feFlood class="duo-light" result="light"/>'
		. '<feComposite in="light" in2="luma" operator="in" result="lit"/>'
		. '<feFlood class="duo-dark" result="dark"/>'
		. '<feComposite in="dark" in2="SourceGraphic" operator="in" result="ground"/>'
		. '<feComposite in="lit" in2="ground" operator="over"/>'
		. '</filter>'
		. '<filter id="architrave-halftone"' . $whole . '>'
		. '<feFlood x="0" y="0" width="8" height="8" flood-color="#fff" result="w"/>'
		. '<feFlood x="2.5" y="2.5" width="3" height="3" flood-color="#000" result="c"/>'
		. '<feFlood x="0" y="0" width="1.5" height="1.5" flood-color="#000" result="c1"/>'
		. '<feFlood x="6.5" y="0" width="1.5" height="1.5" flood-color="#000" result="c2"/>'
		. '<feFlood x="0" y="6.5" width="1.5" height="1.5" flood-color="#000" result="c3"/>'
		. '<feFlood x="6.5" y="6.5" width="1.5" height="1.5" flood-color="#000" result="c4"/>'
		. '<feMerge x="0" y="0" width="8" height="8" result="cell"><feMergeNode in="w"/><feMergeNode in="c"/><feMergeNode in="c1"/><feMergeNode in="c2"/><feMergeNode in="c3"/><feMergeNode in="c4"/></feMerge>'
		. '<feTile in="cell" result="grid"/>'
		. '<feGaussianBlur in="grid" stdDeviation="1.5" result="soft"/>'
		. '<feComponentTransfer in="soft" result="screen">' . $cut( '2.4', '-1.28' ) . '</feComponentTransfer>'
		. '<feColorMatrix in="SourceGraphic" type="saturate" values="0" result="g"/>'
		. '<feComposite in="g" in2="screen"' . $mix
		. '<feComponentTransfer in="mix" result="ink">' . $cut( '12', '-5.5' ) . '</feComponentTransfer>'
		. '<feComposite in="ink" in2="SourceAlpha" operator="in"/>'
		. '</filter>'
		. '<filter id="architrave-dither"' . $whole . '>'
		. '<feFlood x="1" y="1" width="1" height="1" flood-color="#000" result="p"/>'
		. '<feOffset in="p" x="0" y="0" width="3" height="3" result="pc"/>'
		. '<feTile in="pc" result="pts"/>'
		. '<feColorMatrix in="SourceGraphic" type="saturate" values="0" result="g"/>'
		. '<feComposite in="g" in2="pts" operator="in" result="s"/>'
		. '<feMorphology in="s" operator="dilate" radius="1" result="mosaic"/>'
		. $cells
		. '<feMerge x="0" y="0" width="12" height="12" result="bc">' . $merged . '</feMerge>'
		. '<feTile in="bc" result="bayer"/>'
		. '<feComposite in="mosaic" in2="bayer"' . $mix
		. '<feComponentTransfer in="mix" result="bit">' . $cut( '255', '-127' ) . '</feComponentTransfer>'
		. '<feComposite in="bit" in2="SourceAlpha" operator="in"/>'
		. '</filter>'
		. '<filter id="architrave-grain"' . $whole . '>'
		. '<feTurbulence x="0" y="0" width="160" height="160" type="fractalNoise" baseFrequency=".8" numOctaves="2" seed="7" stitchTiles="stitch" result="n"/>'
		. '<feTile in="n" result="nt"/>'
		. '<feColorMatrix in="nt" type="matrix" values=".33 .33 .33 0 0 .33 .33 .33 0 0 .33 .33 .33 0 0 0 0 0 0 1" result="nf"/>'
		// The noise sits within a few per cent of middle grey, which is overlay's nothing: Manuel, 2026-09-19, "Korn is basically invisible". Stretched 1.8 times about the middle (three times was sand), so the grain is seen and the picture's own brightness stays.
		. '<feComponentTransfer in="nf" result="ng">' . $cut( '1.8', '-0.4' ) . '</feComponentTransfer>'
		. '<feBlend in="ng" in2="SourceGraphic" mode="overlay" result="b"/>'
		. '<feComposite in="b" in2="SourceAlpha" operator="in"/>'
		. '</filter></svg>';
	// phpcs:enable WordPress.Security.EscapeOutput.OutputNotEscaped
}
