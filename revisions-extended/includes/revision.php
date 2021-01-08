<?php

namespace RevisionsExtended\Revision;

use WP_Error, WP_Post;

defined( 'WPINC' ) || die();

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
 * @param string                 $type     Optional. The type of revision. 'default', 'pending', or 'scheduled'.
 *                                         (Change from Core.)
 *
 * @return int|WP_Error WP_Error or 0 if error, new revision ID if success.
 */
function put_post_revision( $post = null, $autosave = false, $type = 'default' ) {
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

	$post = _wp_post_revision_data( $post, $autosave );
	// Begin changes from Core.
	/**
	 * The _wp_post_revision_data function sets the post status of the revision to 'inherit'. We could
	 * do a modified version of that function to set a different post status, but we'd still have to modify
	 * _wp_put_post_revision as well, so it seems better to just do it here.
	 */
	switch ( $type ) {
		case 'pending':
			$post['post_status'] = 'revex_pending';
			break;
		case 'scheduled':
			$post['post_status'] = 'revex_future';
			break;
	}
	// End changes from Core.
	$post = wp_slash( $post ); // Since data is from DB.

	$revision_id = wp_insert_post( $post );
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

/*
function wp_switch_to_scheduled_post_revision( $revision_id ) {
	// TODO Get the revision, update the status from scheduled to inherit, then use wp_restore_post_revision
}
 */
