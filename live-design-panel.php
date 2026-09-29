<?php
/**
 * Plugin Name:       Live Design Panel
 * Description:       Design your site on the live page: a panel with dials for colours, fonts, sizes and spacing, light and dark, and saved styles your readers can pick too.
 * Version:           0.12.16
 * Requires at least: 6.6
 * Requires PHP:      7.4
 * Author:            Elmastudio
 * Author URI:        https://elmastudio.de
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       live-design-panel
 *
 * The panel began inside the Architrave theme (2026-09-21) and this folder is
 * still ASSEMBLED by that theme's `tools/build-plugin.py`, so there is one
 * copy of every file and nothing can drift. On any block theme the plugin
 * stands alone: it brings the panel, its stylesheets, its fonts and its own
 * button, and the page keeps the theme's design until a dial moves. On an
 * Architrave that offers to host it (ARCHITRAVE_PANEL_HOST), the theme hands
 * the panel its rail and its square instead.
 *
 * @package LiveDesignPanel
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( defined( 'ARCHITRAVE_PANEL_VERSION' ) ) {
	add_action(
		'admin_notices',
		static function () {
			$screen = function_exists( 'get_current_screen' ) ? get_current_screen() : null;
			if ( current_user_can( 'activate_plugins' ) && $screen && 'plugins' === $screen->id ) {
				echo '<div class="notice notice-warning"><p>' . esc_html__( 'Live Design Panel is the new name of Architrave Panel. Deactivate and delete "Architrave Panel"; Live Design Panel takes over at once.', 'live-design-panel' ) . '</p></div>';
			}
		}
	);
	return;
}

define( 'ARCHITRAVE_PANEL_VERSION', '0.12.16' );
define( 'ARCHITRAVE_PANEL_FILE', __FILE__ );

require_once __DIR__ . '/panel.php';
require_once __DIR__ . '/fonts-on-demand.php';
require_once __DIR__ . '/window.php';
