<?php

namespace RevisionsExtended\Revision;

use WP_Error, WP_Post, WP_Post_Type;
use function RevisionsExtended\Post_Status\get_revision_statuses;
use function RevisionsExtended\Post_Status\validate_revision_status;

defined( 'WPINC' ) || die();

/**
 * Actions and filters.
 */
add_action( 'registered_post_type', __NAMESPACE__ . '\modify_revision_post_type', 10, 2 );
add_action( 'registered_post_type', __NAMESPACE__ . '\redirect_on_revision_page' );
add_filter( 'pre_wp_unique_post_slug', __NAMESPACE__ . '\filter_pre_wp_unique_post_slug', 10, 5 );
add_filter( 'wp_insert_post_data', __NAMESPACE__ . '\filter_wp_insert_post_data' );

/**
 * Change the properties of the built-in revision post type so it's editable in the block editor.
 *
 * @param string $post_type
 * @param WP_Post_Type $post_type_object
 *
 * @return void
 */
function modify_revision_post_type( $post_type, $post_type_object ) {
	if ( 'revision' === $post_type ) {
		$post_type_object->show_ui  = true;
		$post_type_object->supports = array( 'title', 'editor', 'author', 'excerpt' );
		$post_type_object->add_supports();

		$post_type_object->show_in_rest          = true;
		$post_type_object->rest_base             = 'revision';
		$post_type_object->rest_controller_class = '\\RevisionsExtended\\REST_Revision_Controller';
	}
}

/**
 * Returns revisions of specified post.
 *
 * Specify a value for $args['post_status'] to get other types of revisions.
 *
 * Modified from wp_get_post_revisions in wp-includes/revision.php in Core.
 *
 * @see get_children()
 *
 * @param int|WP_Post $post_id Optional. Post ID or WP_Post object. Default is global `$post`.
 * @param array|null  $args    Optional. Arguments for retrieving post revisions. Default null.
 *
 * @return array An array of revisions, or an empty array if none.
 */
function get_post_revisions( $post_id = 0, $args = null ) {
	$post = get_post( $post_id );
	if ( ! $post || empty( $post->ID ) ) {
		return array();
	}

	$defaults = array(
		'order'         => 'DESC',
		'orderby'       => 'date ID',
		'check_enabled' => true,
		'post_status'   => 'inherit', // Changed from Core.
	);
	$args     = wp_parse_args( $args, $defaults );

	if ( $args['check_enabled'] && ! wp_revisions_enabled( $post ) ) {
		return array();
	}

	$args = array_merge(
		$args,
		array(
			'post_parent' => $post->ID,
			'post_type'   => 'revision',
			// Changed from Core.
		)
	);

	$revisions = get_children( $args );
	if ( ! $revisions ) {
		return array();
	}

	return $revisions;
}

/**
 * Inserts post data into the posts table as a post revision.
 *
 * Modified from _wp_put_post_revision in wp-includes/revision.php in Core.
 *
 * @access private
 *
 * @param int|WP_Post|array|null $post     Post ID, post object OR post array.
 * @param bool                   $autosave Optional. Is the revision an autosave?
 *
 * @return int|WP_Error WP_Error if error, new revision ID if success. (Change from Core.)
 */
function put_post_revision( $post = null, $autosave = false ) {
	if ( is_object( $post ) ) {
		$post = get_object_vars( $post );
	} elseif ( ! is_array( $post ) ) {
		$post = get_post( $post, ARRAY_A );
	}

	if ( ! $post || empty( $post['ID'] ) ) {
		return new WP_Error( 'invalid_post', __( 'Invalid post ID.' ) );
	}

	if ( isset( $post['post_type'] ) && 'revision' === $post['post_type'] ) {
		return new WP_Error( 'post_type', __( 'Cannot create a revision of a revision' ) );
	}

	// Begin changes from Core.
	if ( ! validate_revision_status( $post['post_status'] ) ) {
		return new WP_Error(
			'invalid_revision_status',
			__( 'Invalid revision status.', 'revisions-extended' ),
		);
	}

	/**
	 * The _wp_post_revision_data function overrides some fields that need to be different
	 * for pending/scheduled revisions. We could override that function, but we'd still need
	 * to override this one as well, so we might as well just do it in one place.
	 */
	$keep_props = array( 'post_status', 'post_date', 'post_date_gmt' );
	$keep       = array_intersect_key( $post, array_fill_keys( $keep_props, '' ) );
	// End changes from Core.

	$post = _wp_post_revision_data( $post, $autosave );
	$post = array_merge( $post, $keep ); // Changed from Core.
	$post = wp_slash( $post ); // Since data is from DB.

	$revision_id = wp_insert_post( $post, true ); // Changed from Core.
	if ( is_wp_error( $revision_id ) ) {
		return $revision_id;
	}

	// TODO save a parent revision ID as post meta?

	if ( $revision_id ) {
		/**
		 * Fires once a revision has been saved.
		 *
		 * @since 2.6.0
		 *
		 * @param int $revision_id Post revision ID.
		 */
		do_action( '_wp_put_post_revision', $revision_id );
	}

	return $revision_id;
}

/**
 * Update a post with the contents of a revision.
 *
 * Uses the same mechanism as for restoring a past revision, but if the revision is pending/scheduled,
 * it will be converted to a standard revision first, using the current time for the post date.
 *
 * @param int $revision_id
 *
 * @return int|WP_Error The ID of the updated post. Otherwise a WP_Error.
 */
function update_post_from_revision( $revision_id ) {
	$revision = wp_get_post_revision( $revision_id );
	if ( is_null( $revision ) ) {
		return new WP_Error(
			'invalid_revision_id',
			__( 'Invalid revision ID.', 'revisions-extended' )
		);
	}

	$status = get_post_status( $revision );
	if ( 'inherit' !== $status ) {
		$postarr = array(
			'ID'            => $revision->ID,
			'post_status'   => 'inherit',
			// Set the revision's post date to the current time.
			'post_date'     => '0000-00-00 00:00:00',
			'post_date_gmt' => '0000-00-00 00:00:00',
		);

		$update = wp_update_post( wp_slash( $postarr ), true );

		if ( is_wp_error( $update ) ) {
			return $update;
		}
	}

	$result = wp_restore_post_revision( $revision_id );

	// Restore failed.
	if ( is_null( $result ) ) {
		return new WP_Error(
			'revision_error',
			__( 'The revision could not be restored.', 'revisions-extended' )
		);
	}

	// Restore succeeded, but there were no fields to update.
	if ( ! $result ) {
		$result = $revision->post_parent;
	}

	return $result;
}


/**
 * Returns the post id from a url. IE: wp-admin/post.php?post=151&action=edit
 *
 * @return string|null
 */
function get_post_id_from_referrer() {
	if ( ! isset( $_SERVER['HTTP_REFERER'] ) ) {
		return null;
	}

	// Split the url to get query params
	$split_url = explode( '?', $_SERVER['HTTP_REFERER'] );

	// We don't have query string params
	if ( ! isset( $split_url[1] ) ) {
		return null;
	}

	// parse query params
	parse_str( $split_url[1], $parsed );

	// we didn't find the post
	if ( ! isset( $parsed['post'] ) ) {
		return null;
	}

	return $parsed['post'];
}

/**
 * Returns the revision parent's post type.
 *
 * @param int $revision_id
 *
 * @return string|null
 */
function get_parent_post_type( $revision_id ) {
	if ( ! isset( $revision_id ) ) {
		return null;
	}

	// get revision
	$revision = get_post( $revision_id );

	if ( ! isset( $revision ) ) {
		return null;
	}

	// get parent
	$parent = get_post( $revision->post_parent );

	return isset( $parent->post_type ) ? $parent->post_type : null;
}

/**
 * Redirects user to respective revision list
 */
function redirect_on_revision_page() {
	if ( isset( $_GET['post_type'] ) && 'revision' === $_GET['post_type'] ) {
		// If anything goes wrong, we'll redirect to the posts update
		$redirect_url = '/wp-admin/edit.php?page=post-updates';

		$revision_id      = get_post_id_from_referrer();
		$parent_post_type = get_parent_post_type( $revision_id );

		if ( ! is_null( $parent_post_type ) && 'page' === $parent_post_type ) {
			$redirect_url = '/wp-admin/edit.php?post_type=page&page=page-updates';
		}

		wp_safe_redirect( $redirect_url );
		exit;
	}
}

/**
 * Ensure pending/scheduled revision posts use the same slug naming convention as normal revisions.
 *
 * @param string|null $override
 * @param string $slug
 * @param int $post_ID
 * @param string $post_status
 * @param string $post_type
 *
 * @return string|null
 */
function filter_pre_wp_unique_post_slug( $override, $slug, $post_ID, $post_status, $post_type ) {
	$statuses = wp_list_pluck( get_revision_statuses(), 'name' );

	if ( 'revision' === $post_type && in_array( $post_status, $statuses, true ) ) {
		$override = $slug;
	}

	return $override;
}

/**
 * Ensure the modified date for a scheduled revision is the current date, not the future publish date.
 *
 * @param array $data
 *
 * @return array
 */
function filter_wp_insert_post_data( $data ) {
	if (
		'revision' === $data['post_type']
		&& 'future' === $data['post_status']
		&& $data['post_date_gmt'] === $data['post_modified_gmt']
		&& strtotime( $data['post_date_gmt'] ) > time()
	) {
		$data['post_modified']     = current_time( 'mysql' );
		$data['post_modified_gmt'] = current_time( 'mysql', 1 );
	}

	return $data;
}
