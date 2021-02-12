<?php

namespace RevisionsExtended\Admin;

use RevisionsExtended\Admin\Revision_List_Table;
use function RevisionsExtended\get_assets_path;
use function RevisionsExtended\get_build_asset_info;
use function RevisionsExtended\get_includes_path;
use function RevisionsExtended\get_views_path;

defined( 'WPINC' ) || die();

/**
 * Actions and filters.
 */
add_action( 'admin_enqueue_scripts', __NAMESPACE__ . '\enqueue_admin_assets', 1 );
add_action( 'enqueue_block_editor_assets', __NAMESPACE__ . '\enqueue_block_editor_assets' );
add_action( 'admin_menu', __NAMESPACE__ . '\add_updates_subpages' );
add_action( 'admin_menu', __NAMESPACE__ . '\register_revision_compare_screen' );

/**
 * Enqueue assets for admin screens, except the block editor.
 *
 * @param string $hook_suffix
 *
 * @return void
 */
function enqueue_admin_assets( $hook_suffix ) {
	global $pagenow, $typenow;

	$parent_screen = $pagenow;
	if ( ! empty( $typenow ) ) {
		$parent_screen = add_query_arg( 'post_type', $typenow, $parent_screen );
	}

	$post_type = $typenow ?: 'post';

	switch ( $hook_suffix ) {
		case 'admin_page_compare-updates':
			$revision_id = filter_input( INPUT_GET, 'revision_id', FILTER_VALIDATE_INT );
			$revision    = wp_get_post_revision( $revision_id );

			if ( $revision ) {
				wp_enqueue_script( 'revisions' );
				wp_localize_script( 'revisions', '_wpRevisionsSettings', prepare_compare_data( $revision_id ) );

				// This is an ugly hack to get the revisions.js script to work.
				wp_add_inline_script( 'revisions', "window.adminpage = 'revision-php';", 'before' );
			}

			wp_enqueue_style(
				'revisions-extended-compare-updates',
				plugins_url( 'assets/compare-updates.css', dirname( __FILE__, 1 ) ),
				array(),
				filemtime( get_assets_path() . 'compare-updates.css' )
			);
			break;

		case get_plugin_page_hookname( "$post_type-updates", $parent_screen ):
			wp_enqueue_style(
				'revisions-extended-edit-revisions',
				plugins_url( 'assets/edit-revisions.css', dirname( __FILE__, 1 ) ),
				array(),
				filemtime( get_assets_path() . 'edit-revisions.css' )
			);
			break;
	}
}

/**
 * Enqueue assets for the block editor.
 *
 * @return void
 */
function enqueue_block_editor_assets() {
	global $typenow;

	$post_type = $typenow ?: 'post';

	$handles = array();
	if ( 'revision' === $post_type ) {
		$handles[] = 'revision-editor';
	} elseif ( post_type_supports( $post_type, 'revisions' ) ) {
		$handles[] = 'editor-modifications';
	}

	foreach ( $handles as $handle ) {
		$asset = get_build_asset_info( $handle );

		if ( ! empty( $asset ) ) {
			wp_enqueue_script(
				"revisions-extended-$handle-script",
				plugins_url( "build/$handle.js", dirname( __FILE__, 1 ) ),
				$asset['dependencies'],
				$asset['version'],
				false
			);

			wp_enqueue_style(
				"revisions-extended-$handle-style",
				plugins_url( "build/$handle.css", dirname( __FILE__, 1 ) ),
				array(),
				$asset['version']
			);
		}
	}
}

/**
 * Register a subpage for each post type that supports revisions.
 *
 * @return void
 */
function add_updates_subpages() {
	$supported_post_types = get_post_types_by_support( 'revisions' );

	foreach ( $supported_post_types as $post_type ) {
		$parent_slug = 'edit.php';
		if ( 'post' !== $post_type ) {
			$parent_slug = add_query_arg( 'post_type', $post_type, $parent_slug );
		}

		$post_type_object = get_post_type_object( $post_type );

		add_submenu_page(
			$parent_slug,
			__( 'Scheduled Updates', 'revisions-extended' ),
			__( 'Updates', 'revisions-extended' ),
			$post_type_object->cap->edit_posts,
			$post_type . '-updates',
			__NAMESPACE__ . '\render_updates_subpage'
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
function render_updates_subpage() {
	$post_id    = filter_input( INPUT_GET, 'p', FILTER_VALIDATE_INT );
	$list_table = get_list_table();
	$messages   = array();

	$action = wp_unslash( filter_input( INPUT_GET, 'action' ) );
	$nonce  = wp_unslash( filter_input( INPUT_GET, '_wpnonce' ) );

	if ( ! $action || '-1' === $action ) {
		$action = wp_unslash( filter_input( INPUT_GET, 'action2' ) );
	}

	if ( $action && '-1' !== $action ) {
		$messages = handle_bulk_edit_actions( $action, $nonce );
	}

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
 * Process list table form submissions for bulk actions.
 *
 * @param string $action
 * @param string $nonce
 *
 * @return array An multidimensional associated array of message strings for different types of notices.
 */
function handle_bulk_edit_actions( $action, $nonce ) {
	$screen         = get_current_screen();
	$nonce_is_valid = wp_verify_nonce( $nonce, "bulk-{$screen->base}" ); // From WP_List_Table::display_tablenav.
	$valid_actions  = array( 'delete' );
	$items          = filter_input( INPUT_GET, 'bulk_edit', FILTER_VALIDATE_INT, FILTER_REQUIRE_ARRAY );
	$edited         = 0;
	$not_edited     = 0;
	$messages       = array(
		'error' => array(),
		'info'  => array(),
	);

	if ( false === $nonce_is_valid || ! in_array( $action, $valid_actions, true ) ) {
		$messages['error'][] = __( 'Invalid form submission.', 'revisions-extended' );
	}

	if ( empty( $items ) ) {
		$messages['error'][] = __( 'No updates were selected for bulk editing.', 'revisions-extended' );
	}

	if ( empty( $messages['error'] ) ) {
		foreach ( $items as $revision_id ) {
			$revision = wp_get_post_revision( $revision_id );

			if ( $revision ) {
				switch ( $action ) {
					case 'delete':
						$result = wp_delete_post_revision( $revision );
						break;
				}

				if ( $result ) {
					$edited ++;
				} else {
					$not_edited ++;
				}
			} else {
				$not_edited ++;
			}
		}
	}

	if ( $edited ) {
		$messages['info'][] = sprintf(
			_n(
				'%s update was successfully deleted.',
				'%s updates were successfully deleted.',
				absint( $edited ),
				'revisions-extended'
			),
			number_format_i18n( $edited )
		);
	}

	if ( $not_edited ) {
		$messages['error'][] = sprintf(
			_n(
				'%s update could not be deleted.',
				'%s updates could not be deleted.',
				absint( $not_edited ),
				'revisions-extended'
			),
			number_format_i18n( $not_edited )
		);
	}

	return $messages;
}

/**
 * Get the full admin URL for an updates subpage for a given post type.
 *
 * @param string $parent_post_type
 *
 * @return string
 */
function get_updates_subpage_url( $parent_post_type ) {
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

/**
 * Register a screen for showing a diff between a post and a scheduled update.
 *
 * @return void
 */
function register_revision_compare_screen() {
	add_submenu_page(
		'revision.php',
		__( 'Compare Updates', 'revisions-extended' ),
		null,
		'read',
		'compare-updates',
		__NAMESPACE__ . '\render_compare_screen'
	);
}

/**
 * Render the screen for showing a diff.
 *
 * @return void
 */
function render_compare_screen() {
	require_once ABSPATH . 'wp-admin/includes/revision.php';

	$revision_id = filter_input( INPUT_GET, 'revision_id', FILTER_VALIDATE_INT );
	$revision    = wp_get_post_revision( $revision_id );
	$errors      = array();

	if ( ! $revision ) {
		$errors[] = __( 'Invalid revision ID.', 'revisions-extended' );
	}

	if ( $revision && ! current_user_can( 'edit_post', $revision->ID ) ) {
		$errors[] = __( 'Sorry, you are not allowed to view this revision.', 'revisions-extended' );
	}

	require get_views_path() . 'revision-compare.php';
}

/**
 * Generate the data used by revisions.js to render a diff.
 *
 * @see wp_prepare_revisions_for_js()
 *
 * @param int $revision_id
 *
 * @return array
 */
function prepare_compare_data( $revision_id ) {
	require_once ABSPATH . 'wp-admin/includes/revision.php';

	$data         = array();
	$show_avatars = get_option( 'show_avatars' );

	$revision = wp_get_post_revision( $revision_id );
	if ( ! $revision ) {
		return array();
	}

	$parent = get_post( $revision->post_parent );

	$data[ $parent->ID ] = array(
		'id'         => $parent->ID,
		'title'      => get_the_title( $parent->ID ),
		'author'     => array(
			'id'     => (int) $parent->post_author,
			'avatar' => $show_avatars ? get_avatar( $parent->post_author, 32 ) : '',
			'name'   => get_the_author_meta( 'display_name', $parent->post_author ),
		),
		'date'       => date_i18n( __( 'M j, Y @ H:i', 'revisions-extended' ), strtotime( $parent->post_modified ) ),
		'dateShort'  => date_i18n( _x( 'j M @ H:i', 'revision date short format', 'revisions-extended' ), strtotime( $parent->post_modified ) ),
		'timeAgo'    => sprintf(
			/* translators: %s: Human-readable time difference. */
			__( '%s ago', 'revisions-extended' ),
			human_time_diff( strtotime( $parent->post_modified_gmt . ' +0000' ), time() )
		),
		'autosave'   => false,
		'current'    => true,
		'restoreUrl' => false,
	);

	$data[ $revision->ID ] = array(
		'id'         => $revision->ID,
		'title'      => get_the_title( $revision->ID ),
		'author'     => array(
			'id'     => (int) $revision->post_author,
			'avatar' => $show_avatars ? get_avatar( $revision->post_author, 32 ) : '',
			'name'   => get_the_author_meta( 'display_name', $revision->post_author ),
		),
		'date'       => date_i18n( __( 'M j, Y @ H:i', 'revisions-extended' ), strtotime( $revision->post_modified ) ),
		'dateShort'  => date_i18n( _x( 'j M @ H:i', 'revision date short format', 'revisions-extended' ), strtotime( $revision->post_modified ) ),
		'timeAgo'    => sprintf(
			/* translators: %s: Human-readable time difference. */
			__( '%s ago', 'revisions-extended' ),
			human_time_diff( strtotime( $revision->post_modified_gmt . ' +0000' ), time() )
		),
		'autosave'   => false,
		'current'    => false,
		'restoreUrl' => false,
	);

	$diffs = array(
		array(
			'id'     => $parent->ID . ':' . $revision->ID,
			'fields' => wp_get_revision_ui_diff( $parent->ID, $parent->ID, $revision->ID ),
		),
	);

	return array(
		'postId'         => $parent->ID,
		'nonce'          => wp_create_nonce( 'revisions-ajax-nonce' ),
		'revisionData'   => array_values( $data ),
		'to'             => $revision->ID,
		'from'           => $parent->ID,
		'diffData'       => $diffs,
		'baseUrl'        => wp_parse_url( admin_url( 'revision.php' ), PHP_URL_PATH ),
		'compareTwoMode' => 0, // Apparently booleans are not allowed.
		'revisionIds'    => array_keys( $data ),
	);
}

/**
 * Get the full admin URL for compare updates screen for a given revision.
 *
 * @param string $parent_post_type
 *
 * @return string
 */
function get_compare_url( $revision_id ) {
	$url = add_query_arg(
		array(
			'page'        => 'compare-updates',
			'revision_id' => $revision_id,
		),
		admin_url( 'revision.php' )
	);

	return $url;
}
