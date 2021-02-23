<?php

namespace RevisionsExtended\Cron;

use WP_Post;

defined( 'WPINC' ) || die();

/**
 * Actions and filters.
 */
add_action( 'future_revision', __NAMESPACE__ . '\unschedule_default_publish', 20 );
add_action( 'future_revision', __NAMESPACE__ . '\schedule_update', 30, 2 );
add_action( 'wp_delete_post_revision', __NAMESPACE__ . '\unschedule_update', 10, 2 );
add_action( 'rest_delete_revision', __NAMESPACE__ . '\unschedule_update', 10, 2 );

/**
 * Remove the default scheduled event that would attempt to publish the future revision post.
 *
 * @param int $post_id
 *
 * @return void
 */
function unschedule_default_publish( $post_id ) {
	wp_clear_scheduled_hook( 'publish_future_post', array( $post_id ) );
}

/**
 * Schedule a future event to update the parent post with the future revision.
 *
 * @param int     $post_id
 * @param WP_Post $post
 *
 * @return void
 */
function schedule_update( $post_id, $post ) {
	$time = strtotime( $post->post_date_gmt . ' GMT' );

	// Clear previous scheduled events for the same revision.
	wp_clear_scheduled_hook( 'publish_future_revision', array( $post->ID ) );

	wp_schedule_single_event( $time, 'publish_future_revision', array( $post->ID ) );
}

/**
 * Unschedule a future event to update a parent post with a revision when the revision is deleted.
 *
 * This is hooked to two different actions that provide parameters in different orders. Thus sometimes
 * the first parameter is the WP_Post object, and sometimes the second one is.
 *
 * @param int|WP_Post $revision
 * @param WP_Post|\WP_REST_Request
 */
function unschedule_update( $revision, $revision2 ) {
	$update = null;

	if ( $revision instanceof WP_Post ) {
		$update = $revision;
	} elseif ( $revision2 instanceof WP_Post ) {
		$update = $revision2;
	}

	if ( ! $update ) {
		return;
	}

	if ( 'future' === get_post_status( $update ) ) {
		wp_clear_scheduled_hook( 'publish_future_revision', array( $update->ID ) );
	}
}
