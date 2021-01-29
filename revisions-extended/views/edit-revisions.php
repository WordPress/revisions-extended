<?php

namespace RevisionsExtended\Admin;

use WP_Posts_List_Table;

defined( 'WPINC' ) || die();

/** @var int $post_id */
/** @var WP_Posts_List_Table $list_table */

$list_table->prepare_items();
?>

<div class="wrap">
	<h1 class="wp-heading-inline">
		<?php
			if ( $post_id ) :
				printf(
					/* translators: %s: Link to post. */
					wp_kses_post( __( 'Scheduled Updates for &#8220;%s&#8221;', 'revisions-extended' ) ),
					sprintf(
						'<a href="%1$s">%2$s</a>',
						esc_url( get_edit_post_link( $post_id ) ),
						wp_kses_data( get_the_title( $post_id ) )
					)
				);
			else :
				esc_html_e( 'Scheduled Updates', 'revisions-extended' );
			endif;
		?>
	</h1>

	<hr class="wp-header-end">

	<?php $list_table->views(); ?>

	<form>
		<?php $list_table->display(); ?>
	</form>
</div>
