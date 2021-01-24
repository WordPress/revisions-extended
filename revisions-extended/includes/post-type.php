<?php

namespace RevisionsExtended\Post_Type;

defined( 'WPINC' ) || die();

/**
 * Actions and filters.
 */
add_action( 'init', __NAMESPACE__ . '\register' );

/**
 * Register post types.
 *
 * @return void
 */
function register() {
	$labels = array(
		'name'          => __( 'Scheduled Updates', 'revisions-extended' ),
		'singular_name' => __( 'Scheduled Update', 'revisions-extended' ),
	);

	register_post_type(
		'revex_revision',
		array(
			'label'             => __( 'Scheduled Updates', 'revisions-extended' ),
			'labels'            => $labels,
			'public'            => false,
			'show_ui'           => true,
			'show_in_menu'      => true,
			'show_in_nav_menus' => false,
			'show_in_admin_bar' => false,
			'show_in_rest'      => true,
			'menu_position'     => 50,
			'menu_icon'         => 'dashicons-backup',
			'supports'          => array( 'title', 'editor', 'excerpt', 'author' ),
		)
	);
}
