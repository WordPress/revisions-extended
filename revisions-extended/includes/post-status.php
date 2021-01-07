<?php

namespace RevisionsExtended\Post_Status;

defined( 'WPINC' ) || die();

/**
 * Actions and filters.
 */
add_action( 'init', __NAMESPACE__ . '\register' );

/**
 * Register post statuses.
 *
 * @return void
 */
function register() {
	register_post_status(
		'revex_pending',
		array(
			'label'                     => __( 'Pending Revision', 'revisions-extended' ),
			'labels'                    => (object) array(
				'publish' => __( 'Publish Revision', 'revisions-extended' ),
				'save'    => __( 'Save Revision', 'revisions-extended' ),
				'update'  => __( 'Update Revision', 'revisions-extended' ),
				'plural'  => __( 'Pending Revisions', 'revisions-extended' ),
				'short'   => __( 'Pending', 'revisions-extended' )
			),
			'protected'                 => true,
			'internal'                  => true,
			'label_count'               => _n_noop(
				'Pending <span class="count">(%s)</span>',
				'Pending <span class="count">(%s)</span>',
				'revisions-extended'
			),
			'exclude_from_search'       => false,
			'show_in_admin_all_list'    => false,
			'show_in_admin_status_list' => false,
		)
	);

	register_post_status(
		'revex_future',
		array(
			'label'                     => __( 'Scheduled Revision', 'revisions-extended' ),
			'labels'                    => (object) array(
				'publish' => __( 'Publish Revision', 'revisions-extended' ),
				'save'    => __( 'Save Revision', 'revisions-extended' ),
				'update'  => __( 'Update Revision', 'revisions-extended' ),
				'plural'  => __( 'Scheduled Revisions', 'revisions-extended' ),
				'short'   => __( 'Scheduled', 'revisions-extended' )
			),
			'protected'                 => true,
			'internal'                  => true,
			'label_count'               => _n_noop(
				'Scheduled <span class="count">(%s)</span>',
				'Scheduled <span class="count">(%s)</span>',
				'revisions-extended'
			),
			'exclude_from_search'       => false,
			'show_in_admin_all_list'    => false,
			'show_in_admin_status_list' => false,
		)
	);
}
