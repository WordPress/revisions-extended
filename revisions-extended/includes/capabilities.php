<?php

namespace RevisionsExtended\Capabilities;

use function RevisionsExtended\Post_Status\get_revision_statuses;

defined( 'WPINC' ) || die();

/**
 * Actions and filters.
 */
add_filter( 'map_meta_cap', __NAMESPACE__ . '\map_meta_caps', 10, 4 );

/**
 * Modify capabilities.
 *
 * @param array $caps
 * @param string $cap
 * @param int $user_id
 * @param array $args
 *
 * @return array
 */
function map_meta_caps( $caps, $cap, $user_id, $args ) {
	$statuses = wp_list_pluck( get_revision_statuses(), 'name' );

	switch ( $cap ) {
		case 'delete_post':
			$post = get_post( $args[0] );

			if ( 'revision' === $post->post_type && in_array( $post->post_status, $statuses, true ) ) {
				$do_not_allow = array_keys( $caps, 'do_not_allow', true );
				foreach ( $do_not_allow as $index ) {
					unset( $caps[ $index ] );
				}

				$post_type_object = get_post_type_object( $post->post_type );

				if ( $post->post_author && $user_id === $post->post_author ) {
					$caps[] = $post_type_object->cap->delete_posts;
				} else {
					$caps[] = $post_type_object->cap->delete_others_posts;
				}
			}
			break;
	}

	return $caps;
}
