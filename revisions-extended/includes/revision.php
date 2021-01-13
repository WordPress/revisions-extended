<?php

namespace RevisionsExtended\Revision;

use WP_Error, WP_Post;
use function RevisionsExtended\Post_Status\get_revision_statuses;
use function RevisionsExtended\Post_Status\validate_revision_status;

defined( 'WPINC' ) || die();

/**
 * Actions and filters.
 */
add_filter( 'pre_wp_unique_post_slug', __NAMESPACE__ . '\filter_pre_wp_unique_post_slug', 10, 5 );

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
 * @return int|WP_Error
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
