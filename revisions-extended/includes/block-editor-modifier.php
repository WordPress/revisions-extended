<?php

namespace RevisionsExtended\BlockEditorModifier;

/**
 *
 */
function get_block_info( $fileName ) {
	$dir             = dirname( __DIR__, 1 );
	$block_deps_path = "{$dir}/build/{$fileName}.asset.php";

	if ( ! file_exists( $block_deps_path ) ) {
		return null;
	}

	$block_info = require $block_deps_path;

	return $block_info;
}

/**
 * Function that enqueues the assets
 */
function enqueue_the_assets( $fileName ) {
	$block_info = get_block_info( $fileName );

	if ( $block_info ) {
		$block_version = $block_info['version'];

		wp_enqueue_script(
			"revisions-extended-{$fileName}-script",
			plugins_url( "build/{$fileName}.js", dirname( __FILE__, 1 ) ),
			$block_info['dependencies'],
			$block_version,
			false
		);

		wp_enqueue_style(
			"revisions-extended-{$fileName}-style",
			plugins_url( "build/{$fileName}.css", dirname( __FILE__, 1 ) ),
			array(),
			$block_version
		);
	}
}

/**
 * Register scripts, styles, and block.
 */
function enqueue_assets() {
	// Enqueue our block script with WordPress.
	$isEditingRevision = false;

	if ( isset( $_REQUEST['post'] ) ) {
		$post = get_post( $_REQUEST['post'] );

		$isEditingRevision = $post->post_type === 'revision';
	}

	if ( $isEditingRevision ) {
		// We only queue up the management assets when we are viewing out our post type and it isn't a new post
		enqueue_the_assets( 'revision-editor' );
	} else {
		//This shouldn't be queued on the custom post type
		enqueue_the_assets( 'editor-modifications' );
	}

}

add_action( 'enqueue_block_editor_assets', __NAMESPACE__ . '\enqueue_assets' );
