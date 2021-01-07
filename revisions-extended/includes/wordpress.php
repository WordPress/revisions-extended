<?php

namespace RevisionsExtended\WordPress;

use WP_Error, WP_Post;

defined( 'WPINC' ) || die();

/**
 * Returns all revisions of specified post.
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
function wp_get_post_revisions( $post_id = 0, $args = null ) {
	$post = get_post( $post_id );
	if ( ! $post || empty( $post->ID ) ) {
		return array();
	}

	$defaults = array(
		'order'         => 'DESC',
		'orderby'       => 'date ID',
		'check_enabled' => true,
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
			'post_status' => 'scheduled', // changed from Core.
		)
	);

	$revisions = get_children( $args );
	if ( ! $revisions ) {
		return array();
	}

	return $revisions;
}

/**
 * Creates a revision for the current version of a post.
 *
 * Modified from wp_save_post_revision in wp-includes/revision.php in Core.
 *
 * @param int $post_id The ID of the post to save as a revision.
 * @return int|WP_Error|void Void or 0 if error, new revision ID, if success.
 */
function wp_save_post_revision( $post_id ) {
	if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
		return;
	}

	$post = get_post( $post_id );
	if ( ! $post ) {
		return;
	}

	if ( ! post_type_supports( $post->post_type, 'revisions' ) ) {
		return;
	}

	if ( 'auto-draft' === $post->post_status ) {
		return;
	}

	if ( ! wp_revisions_enabled( $post ) ) {
		return;
	}

	/*
	 * Compare the proposed update with the last stored revision verifying that
	 * they are different, unless a plugin tells us to always save regardless.
	 * If no previous revisions, save one.
	 */
	$revisions = wp_get_post_revisions( $post_id );
	if ( $revisions ) {
		// Grab the last revision, but not an autosave.
		foreach ( $revisions as $revision ) {
			if ( false !== strpos( $revision->post_name, "{$revision->post_parent}-revision" ) ) {
				$last_revision = $revision;
				break;
			}
		}

		/**
		 * Filters whether the post has changed since the last revision.
		 *
		 * By default a revision is saved only if one of the revisioned fields has changed.
		 * This filter can override that so a revision is saved even if nothing has changed.
		 *
		 * @since 3.6.0
		 *
		 * @param bool    $check_for_changes Whether to check for changes before saving a new revision.
		 *                                   Default true.
		 * @param WP_Post $last_revision     The last revision post object.
		 * @param WP_Post $post              The post object.
		 */
		if ( isset( $last_revision ) && apply_filters( 'wp_save_post_revision_check_for_changes', true, $last_revision, $post ) ) {
			$post_has_changed = false;

			foreach ( array_keys( _wp_post_revision_fields( $post ) ) as $field ) {
				if ( normalize_whitespace( $post->$field ) !== normalize_whitespace( $last_revision->$field ) ) {
					$post_has_changed = true;
					break;
				}
			}

			/**
			 * Filters whether a post has changed.
			 *
			 * By default a revision is saved only if one of the revisioned fields has changed.
			 * This filter allows for additional checks to determine if there were changes.
			 *
			 * @since 4.1.0
			 *
			 * @param bool    $post_has_changed Whether the post has changed.
			 * @param WP_Post $last_revision    The last revision post object.
			 * @param WP_Post $post             The post object.
			 */
			$post_has_changed = (bool) apply_filters( 'wp_save_post_revision_post_has_changed', $post_has_changed, $last_revision, $post );

			// Don't save revision if post unchanged.
			if ( ! $post_has_changed ) {
				return;
			}
		}
	}

	$return = _wp_put_post_revision( $post ); // changed from Core.

	// changed from Core.

	return $return;
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
 * @return int|WP_Error WP_Error or 0 if error, new revision ID if success.
 */
function _wp_put_post_revision( $post = null, $autosave = false ) {
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

	$post['post_status'] = 'scheduled'; // changed from Core.
	$post['post_date']   = ''; // TODO

	$post = wp_slash( $post ); // Since data is from DB.

	$revision_id = wp_insert_post( $post );
	if ( is_wp_error( $revision_id ) ) {
		return $revision_id;
	}

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
