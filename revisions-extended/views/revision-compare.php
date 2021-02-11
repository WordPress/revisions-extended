<?php

namespace RevisionsExtended\Admin;

use WP_Post;

defined( 'WPINC' ) || die();

/** @var int $revision_id */
/** @var WP_Post $revision */
?>

<div class="wrap">
	<h1 class="long-header"><?php echo 'Compare'; // TODO ?></h1>

	<?php if ( ! $revision ) : ?>
		<div class="notice notice-error">
			<p><?php esc_html_e( 'Invalid revision ID.', 'revisions-extended' ); ?></p>
		</div>
	<?php endif; ?>
</div>

<?php wp_print_revision_templates(); ?>
