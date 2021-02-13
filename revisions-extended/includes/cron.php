<?php

namespace RevisionsExtended\Cron;

use WP_Post;

defined( 'WPINC' ) || die();

/**
 * Actions and filters.
 */
add_action( 'future_revision', __NAMESPACE__ . '\unschedule_default_publish', 20 );
add_action( 'future_revision', __NAMESPACE__ . '\schedule_update', 30, 2 );

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

	wp_schedule_single_event( $time, 'publish_future_revision', array( $post->ID ) );
}
