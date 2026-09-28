<?php
/**
 * FONTS ON DEMAND (2026-09-23, docs/fonts-on-demand.md).
 *
 * wordpress.org takes a plugin only as a zip under 10 MB, and the font
 * library's files were 7.6 MB of 9.1. So the zip carries only the fonts the
 * built-in styles wear (fonts.json), and a library face's files are fetched
 * the first time the owner picks it: server to server, once, from the
 * addresses tools/font-library.py wrote to font-files.json, into
 * uploads/live-design-panel/fonts/, where one stylesheet holds the @font-face
 * rules of every face fetched so far.
 *
 * Readers only ever get files from the site itself. Nothing on a public page
 * loads from a font service: loading Google Fonts from Google's servers passes
 * the visitor's address to Google, and a Munich court fined a site for it in
 * 2022. A face not fetched yet is simply a stack whose first name the browser
 * does not have, so it falls back to its section's system face.
 *
 * @package LiveDesignPanel
 */

defined( 'ABSPATH' ) || exit;

/**
 * Where fetched faces live: the folder and its address.
 *
 * @return array{path: string, url: string}
 */
function architrave_fonts_dir() {
	$up = wp_upload_dir( null, false );
	return array(
		'path' => trailingslashit( $up['basedir'] ) . 'live-design-panel/fonts/',
		'url'  => set_url_scheme( trailingslashit( $up['baseurl'] ) . 'live-design-panel/fonts/' ),
	);
}

/**
 * The filesystem WordPress hands out, asked for the fonts folder, so a host
 * that routes writes through something other than PHP's own calls is obeyed.
 * Uploads are web-writable on any site that can hold media, so this resolves
 * to the direct method there; where it cannot, the caller says the folder
 * cannot be written to, which is the truth.
 *
 * @return WP_Filesystem_Base|null
 */
function architrave_fonts_fs() {
	global $wp_filesystem;
	if ( ! $wp_filesystem instanceof WP_Filesystem_Base ) {
		require_once ABSPATH . 'wp-admin/includes/file.php';
		if ( ! WP_Filesystem( false, architrave_fonts_dir()['path'] ) ) {
			return null;
		}
	}
	return $wp_filesystem;
}

/**
 * The library's faces and their files, as font-library.py wrote them.
 *
 * @return array<string, array>
 */
function architrave_fonts_manifest() {
	static $faces = null;
	if ( null === $faces ) {
		$file  = plugin_dir_path( ARCHITRAVE_PANEL_FILE ) . 'font-files.json';
		$data  = file_exists( $file ) ? json_decode( (string) file_get_contents( $file ), true ) : null; // phpcs:ignore WordPressVIPMinimum.Performance.FetchingRemoteData.FileGetContentsUnknown
		$faces = is_array( $data ) && ! empty( $data['faces'] ) ? $data['faces'] : array();
	}
	return $faces;
}

/**
 * The faces whose every file is on this site.
 *
 * @return string[]
 */
function architrave_fonts_have() {
	$dir  = architrave_fonts_dir()['path'];
	$have = array();
	foreach ( architrave_fonts_manifest() as $id => $face ) {
		$all = ! empty( $face['files'] );
		foreach ( $face['files'] as $f ) {
			if ( ! file_exists( $dir . $f['name'] ) ) {
				$all = false;
				break;
			}
		}
		if ( $all ) {
			$have[] = $id;
		}
	}
	return $have;
}

/**
 * Rewrite the stylesheet from the faces now on the site. Written whole each
 * time, so it can only ever name files that are there.
 */
function architrave_fonts_write_css() {
	$dir   = architrave_fonts_dir()['path'];
	$faces = architrave_fonts_manifest();
	/* No face left, no sheet: a reader's page does not load an empty one. */
	if ( ! architrave_fonts_have() ) {
		wp_delete_file( $dir . 'fonts.css' );
		return;
	}
	$rules = array( '/* Live Design Panel: the library faces fetched for this site. Written by the plugin; each face\'s licence is beside its files. */' );
	foreach ( architrave_fonts_have() as $id ) {
		foreach ( $faces[ $id ]['files'] as $f ) {
			$rules[] = sprintf(
				'@font-face { font-family: "%s"; font-style: %s; font-weight: %s; font-display: swap; src: url("%s") format("woff2"); unicode-range: %s; }',
				$faces[ $id ]['family'],
				$f['style'],
				$f['weight'],
				$f['name'],
				$f['range']
			);
		}
	}
	$fs = architrave_fonts_fs();
	if ( $fs ) {
		$fs->put_contents( $dir . 'fonts.css', implode( "\n", $rules ) . "\n", FS_CHMOD_FILE );
	}
}

/**
 * Fetch one address. Only from the one place font-library.py fetches from.
 *
 * @param string $url The address.
 * @return string|WP_Error The body.
 */
function architrave_fonts_get( $url ) {
	if ( 0 !== strpos( $url, 'https://cdn.jsdelivr.net/' ) ) { // phpcs:ignore PluginCheck.CodeAnalysis.Offloading.OffloadedContent -- nothing is served from jsDelivr: this is the allow-list guard for a one-time, admin-initiated, server-side fetch into the site's own uploads (readme.txt, External services). Visitors' pages load fonts only from this site.
		return new WP_Error( 'architrave_font_source', 'Not a font address.' );
	}
	$res = wp_remote_get( $url, array( 'timeout' => 30 ) );
	if ( is_wp_error( $res ) ) {
		return $res;
	}
	if ( 200 !== (int) wp_remote_retrieve_response_code( $res ) ) {
		return new WP_Error( 'architrave_font_fetch', sprintf( 'HTTP %d for %s', (int) wp_remote_retrieve_response_code( $res ), $url ) );
	}
	return wp_remote_retrieve_body( $res );
}

/**
 * Fetch one face: its files and its licence, then the stylesheet again.
 *
 * @param string $id A library face's id.
 * @return true|WP_Error
 */
function architrave_fonts_fetch( $id ) {
	$faces = architrave_fonts_manifest();
	if ( empty( $faces[ $id ] ) ) {
		return new WP_Error( 'architrave_no_font', __( 'No such font.', 'live-design-panel' ), array( 'status' => 404 ) );
	}
	$dir = architrave_fonts_dir()['path'];
	$fs  = architrave_fonts_fs();
	if ( ! wp_mkdir_p( $dir ) || ! wp_is_writable( $dir ) || ! $fs ) {
		return new WP_Error( 'architrave_font_folder', __( 'The uploads folder cannot be written to.', 'live-design-panel' ), array( 'status' => 500 ) );
	}
	/* The licence first: a face's files do not arrive without it. */
	$jobs   = array( array( $faces[ $id ]['licence']['url'], $faces[ $id ]['licence']['name'], false ) );
	foreach ( $faces[ $id ]['files'] as $f ) {
		$jobs[] = array( $f['url'], $f['name'], true );
	}
	foreach ( $jobs as $job ) {
		list( $url, $name, $woff2 ) = $job;
		if ( file_exists( $dir . $name ) ) {
			continue;
		}
		$body = architrave_fonts_get( $url );
		if ( is_wp_error( $body ) ) {
			$body->add_data( array( 'status' => 502 ) );
			return $body;
		}
		if ( $woff2 && 'wOF2' !== substr( $body, 0, 4 ) ) {
			return new WP_Error( 'architrave_font_file', 'Not a woff2 file: ' . $url, array( 'status' => 502 ) );
		}
		/* Written aside and moved, so a half-written file is never a face. */
		$tmp = $dir . $name . '.part';
		if ( ! $fs->put_contents( $tmp, $body, FS_CHMOD_FILE ) || ! $fs->move( $tmp, $dir . $name, true ) ) {
			wp_delete_file( $tmp );
			return new WP_Error( 'architrave_font_folder', __( 'The uploads folder cannot be written to.', 'live-design-panel' ), array( 'status' => 500 ) );
		}
	}
	architrave_fonts_write_css();
	return true;
}

/**
 * The library faces the site's published styles name: the reading font, the
 * interface font and every role's pinned font. A reader can wear only these
 * (a reader has no Font row), so these are what a reader's page may need.
 *
 * @return string[]
 */
function architrave_fonts_published() {
	$used = array();
	if ( ! function_exists( 'architrave_site_styles' ) ) {
		return $used;
	}
	foreach ( architrave_site_styles()['styles'] as $record ) {
		$names = array( $record['face'] ?? '', $record['sans'] ?? '' );
		foreach ( (array) ( $record['roles'] ?? array() ) as $role ) {
			$names[] = is_array( $role ) ? ( $role['face'] ?? '' ) : '';
		}
		foreach ( $names as $n ) {
			if ( is_string( $n ) && '' !== $n ) {
				$used[ $n ] = true;
			}
		}
	}
	return array_values( array_intersect( array_keys( $used ), array_keys( architrave_fonts_manifest() ) ) );
}

/**
 * REMOVE UNUSED FONTS (step 5). Every fetched face that no published style
 * names and the owner's own page does not either ($keep, sent by the panel:
 * what the page wears now and what the owner's own saved styles name, which
 * live in the owner's browser and the server cannot see). Nothing is lost for
 * good: picking a removed face fetches it again.
 *
 * @param string[] $keep Face ids the owner's page still names.
 * @return string[] The faces removed.
 */
function architrave_fonts_prune( $keep ) {
	$faces = architrave_fonts_manifest();
	$dir   = architrave_fonts_dir()['path'];
	$stay  = array_flip( array_merge( architrave_fonts_published(), array_map( 'strval', (array) $keep ) ) );
	/* Counted from what was there before, so two presses at once both say so. */
	$gone  = array_values( array_diff( architrave_fonts_have(), array_keys( $stay ) ) );
	foreach ( $faces as $id => $face ) {
		if ( isset( $stay[ $id ] ) ) {
			continue;
		}
		foreach ( $face['files'] as $f ) {
			if ( file_exists( $dir . $f['name'] ) ) {
				wp_delete_file( $dir . $f['name'] );
			}
		}
		/* The licence goes with the last of the face's files. */
		if ( file_exists( $dir . $face['licence']['name'] ) ) {
			wp_delete_file( $dir . $face['licence']['name'] );
		}
	}
	if ( is_dir( $dir ) ) {
		architrave_fonts_write_css();
	}
	return $gone;
}

/**
 * THE ROUTE. POST { id } fetches a face, for whoever may publish styles;
 * POST { prune: true, keep: [ids] } removes the unused ones.
 * The answer is what the panel needs to show it: the faces now on the site
 * and the stylesheet's address, versioned so the browser reads it again.
 */
function architrave_fonts_route() {
	register_rest_route(
		'architrave/v1',
		'/fonts',
		array(
			'methods'             => WP_REST_Server::CREATABLE,
			'permission_callback' => static function () {
				return current_user_can( 'edit_theme_options' );
			},
			'args'                => array(
				'id'    => array(
					'type'    => 'string',
					'pattern' => '^[a-z0-9-]{1,64}$',
				),
				'prune' => array( 'type' => 'boolean' ),
				'keep'  => array(
					'type'  => 'array',
					'items' => array(
						'type'    => 'string',
						'pattern' => '^[a-z0-9-]{1,64}$',
					),
				),
			),
			'callback'            => static function ( $request ) {
				$gone = array();
				if ( $request['prune'] ) {
					$gone = architrave_fonts_prune( (array) $request['keep'] );
				} elseif ( is_string( $request['id'] ) ) {
					$done = architrave_fonts_fetch( $request['id'] );
					if ( is_wp_error( $done ) ) {
						return $done;
					}
				} else {
					return new WP_Error( 'architrave_no_action', __( 'Nothing to do.', 'live-design-panel' ), array( 'status' => 400 ) );
				}
				return rest_ensure_response(
					array(
						'have'    => architrave_fonts_have(),
						'removed' => $gone,
						'css'     => architrave_fonts_css_url(),
					)
				);
			},
		)
	);
}
add_action( 'rest_api_init', 'architrave_fonts_route' );

/**
 * The stylesheet's address with its version, or '' before the first face.
 *
 * @return string
 */
function architrave_fonts_css_url() {
	$d    = architrave_fonts_dir();
	$file = $d['path'] . 'fonts.css';
	return file_exists( $file ) ? add_query_arg( 'ver', (string) filemtime( $file ), $d['url'] . 'fonts.css' ) : '';
}

/**
 * The fetched faces' stylesheet, for everyone, wherever the panel runs; and,
 * for the owner, font-fetch.js, which fetches a face the page names and the
 * site does not have yet.
 */
function architrave_fonts_enqueue() {
	if ( ! architrave_panel_runs() ) {
		return;
	}
	$css = architrave_fonts_css_url();
	if ( '' !== $css ) {
		wp_enqueue_style( 'architrave-font-files', $css, array(), null ); // phpcs:ignore WordPress.WP.EnqueuedResourceParameters.MissingVersion -- the address carries its own
	}
	if ( ! current_user_can( 'edit_theme_options' ) ) {
		return;
	}
	$rel = 'assets/js/font-fetch.js';
	wp_enqueue_script( 'architrave-font-fetch', plugin_dir_url( ARCHITRAVE_PANEL_FILE ) . $rel, array( 'architrave-font-library' ), architrave_panel_asset_version( $rel ), array( 'in_footer' => true ) );
	wp_add_inline_script(
		'architrave-font-fetch',
		'window.architraveFonts = ' . wp_json_encode(
			array(
				'url'   => rest_url( 'architrave/v1/fonts' ),
				'nonce' => wp_create_nonce( 'wp_rest' ),
				'have'  => architrave_fonts_have(),
			)
		) . ';',
		'before'
	);
}
add_action( 'wp_enqueue_scripts', 'architrave_fonts_enqueue', 12 );
