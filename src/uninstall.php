<?php
/**
 * Uninstall: the library faces fetched into uploads (fonts-on-demand.php) and
 * the published styles (the option) go with the plugin. The theme mod
 * `architrave_site_styles` is deliberately left: it belongs to the Architrave
 * theme, which can still read it, and it predates the plugin.
 *
 * @package LiveDesignPanel
 */

defined( 'WP_UNINSTALL_PLUGIN' ) || exit;

delete_option( 'architrave_panel_site_styles' );
delete_option( 'architrave_panel_style_versions' );
delete_option( 'architrave_panel_preview_links' ); /* the preview links (0.11.173) */ /* the kept versions of each published style (0.11.164) */
delete_option( 'architrave_panel_reader_counts' ); /* the reader numbers (0.11.175) */
delete_option( 'architrave_panel_count_readers' );
delete_metadata( 'user', 0, 'live_design_panel_window', '', true ); /* each owner's choice of window (0.11.152) */

require_once ABSPATH . 'wp-admin/includes/file.php';
WP_Filesystem();
global $wp_filesystem;

$architrave_up  = wp_upload_dir( null, false );
$architrave_dir = trailingslashit( $architrave_up['basedir'] ) . 'live-design-panel/fonts/';
if ( $wp_filesystem && $wp_filesystem->is_dir( $architrave_dir ) ) {
	$wp_filesystem->delete( $architrave_dir, true );
	$wp_filesystem->rmdir( dirname( $architrave_dir ) ); // only succeeds when nothing else is in it, which is the point
}
