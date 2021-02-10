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

		$post_type_object = get_post_type_object( $post_type );

		add_submenu_page(
			$parent_slug,
			__( 'Scheduled Updates', 'revisions-extended' ),
			__( 'Updates', 'revisions-extended' ),
			$post_type_object->cap->edit_posts,
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
