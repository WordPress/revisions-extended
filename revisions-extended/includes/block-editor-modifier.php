<?php

namespace RevisionsExtended\BlockEditorModifier;

/**
 * Register scripts, styles, and block.
 */
function enqueue_assets() {
	$block_deps_path =  dirname(__DIR__, 1) . '/build/index.asset.php';

	if ( ! file_exists( $block_deps_path ) ) {
		return;
	}

	$block_info = require $block_deps_path;

	// Enqueue our block script with WordPress.
	wp_enqueue_script(
		'revisions-extended-script',
		plugins_url('build/index.js', dirname(__FILE__, 1) ),
		$block_info['dependencies'],
		$block_info['version'],
		false
	);
}
add_action('enqueue_block_editor_assets', __NAMESPACE__ . '\enqueue_assets');