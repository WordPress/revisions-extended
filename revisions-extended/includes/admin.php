<?php

namespace RevisionsExtended\Admin;

use RevisionsExtended\Admin\Revision_List_Table;
use function RevisionsExtended\get_includes_path;
use function RevisionsExtended\get_views_path;

defined( 'WPINC' ) || die();

/**
 * Actions and filters.
 */
add_action( 'admin_menu', __NAMESPACE__ . '\add_subpages' );

/**
 * Register a subpage for each post type that supports revisions.
 *
 * @return void
 */
function add_subpages() {
	$supported_post_types = get_post_types_by_support( 'revisions' );

	foreach ( $supported_post_types as $post_type ) {
		$parent_slug = 'edit.php';
		if ( 'post' !== $post_type ) {
			$parent_slug = add_query_arg( 'post_type', $post_type, $parent_slug );
		}

		add_submenu_page(
			$parent_slug,
			__( 'Scheduled Updates', 'revisions-extended' ),
			__( 'Updates', 'revisions-extended' ),
			'edit_posts',
			$post_type . '-updates',
			__NAMESPACE__ . '\render_subpage'
		);

		$page_hook = get_plugin_page_hook( $post_type . '-updates', $parent_slug );

		add_action(
			"load-$page_hook",
			function() {
				// This is a hack to ensure that the list table columns are registered properly. It has to happen
				// before the subpage's render function is called.
				get_list_table();

				// This also has to be called before the render function fires.
				add_screen_option( 'per_page' );
			}
		);
	}
}

/**
 * Render a subpage for updates.
 *
 * @return void
 */
function render_subpage() {
	$post_id    = filter_input( INPUT_GET, 'p', FILTER_VALIDATE_INT );
	$list_table = get_list_table();

	require get_views_path() . 'edit-revisions.php';
}

/**
 * Get an instance of the revision list table.
 *
 * @return \RevisionsExtended\Admin\Revision_List_Table
 */
function get_list_table() {
	require_once get_includes_path() . 'revision-list-table.php';

	return new Revision_List_Table();
}

/**
 * Get the full admin URL for an updates subpage for a given post type.
 *
 * @param string $parent_post_type
 *
 * @return string
 */
function get_subpage_url( $parent_post_type ) {
	$url = add_query_arg(
		array(
			'page' => "$parent_post_type-updates",
		),
		admin_url( 'edit.php' )
	);

	if ( 'post' !== $parent_post_type ) {
		$url = add_query_arg( 'post_type', $parent_post_type, $url );
	}

	return $url;
}
