<?php

namespace RevisionsExtended\Post_Status;

defined( 'WPINC' ) || die();

/**
 * Get array of revision-specific post status objects.
 *
 * @return object[]
 */
function get_revision_statuses() {
	$stati = get_post_stati(
		array(
			'_builtin' => true,
		),
		'objects'
	);

	return array_intersect_key(
		$stati,
		array(
			'future' => true,
		)
	);
}

/**
 * Check if a given status is a valid revision status.
 *
 * Note that this does not include the 'inherit' status used by the Core revision system.
 *
 * @param string $status
 *
 * @return bool
 */
function validate_revision_status( $status ) {
	$statuses = wp_list_pluck( get_revision_statuses(), 'name' );

	return in_array( $status, $statuses, true );
}
