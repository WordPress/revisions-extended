<?php
/**
 * Plugin name: Revisions Extended
 * Description:
 * Version:     0.1
 * Author:      WordPress.org
 * Author URI:  http://wordpress.org/
 * License:     GPLv2 or later
 */

namespace RevisionsExtended;

use RevisionsExtended\REST_Revisions_Controller;

defined( 'WPINC' ) || die();

/**
 * Constants.
 */
define( __NAMESPACE__ . '\PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( __NAMESPACE__ . '\PLUGIN_URL', plugins_url( '/', __FILE__ ) );

/**
 * Actions and filters.
 */
add_action( 'plugins_loaded', __NAMESPACE__ . '\load_files' );
add_action( 'rest_api_init', __NAMESPACE__ . '\initialize_rest_routes', 100 );

/**
 * Load the other PHP files for the plugin.
 *
 * @return void
 */
function load_files() {
	require_once get_includes_path() . 'capabilities.php';
	require_once get_includes_path() . 'post-status.php';
	require_once get_includes_path() . 'post-type.php';
	require_once get_includes_path() . 'rest-revisions-controller.php';
	require_once get_includes_path() . 'revision.php';
	require_once get_includes_path() . 'block-editor-modifier.php';
}

/**
 * Shortcut to the includes directory.
 *
 * @return string
 */
function get_includes_path() {
	return PLUGIN_DIR . 'includes/';
}

/**
 * Create REST controllers and register their routes.
 *
 * @return void
 */
function initialize_rest_routes() {
	foreach ( get_post_types( array( 'show_in_rest' => true ), 'objects' ) as $post_type ) {
		if ( post_type_supports( $post_type->name, 'revisions' ) ) {
			$controller = new REST_Revisions_Controller( $post_type->name );
			$controller->register_routes();
		}
	}
}
