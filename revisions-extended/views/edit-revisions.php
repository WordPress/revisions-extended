<?php

namespace RevisionsExtended\Admin;

use RevisionsExtended\Admin\Revision_List_Table;
use function RevisionsExtended\Admin\get_updates_subpage_url;

defined( 'WPINC' ) || die();

/** @var int $post_id */
/** @var Revision_List_Table $list_table */
/** @var array $notices */

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

	<?php foreach ( $notices as $notice_type => $messages ) : ?>
		<?php foreach ( $messages as $message ) : ?>
			<div class="is-dismissible notice notice-<?php echo esc_attr( $notice_type ); ?>">
				<?php echo wp_kses_post( wpautop( $message ) ); ?>
			</div>
		<?php endforeach; ?>
	<?php endforeach; ?>

	<?php $list_table->views(); ?>

	<form method="get">
		<?php if ( 'post' !== $list_table->parent_post_type ) : ?>
			<input type="hidden" name="post_type" value="<?php echo esc_attr( $list_table->parent_post_type ); ?>" />
		<?php endif; ?>
		<input type="hidden" name="page" value="<?php echo esc_attr( "{$list_table->parent_post_type}-updates" ); ?>" />
		<?php if ( $post_id ) : ?>
			<input type="hidden" name="p" value="<?php echo esc_attr( $post_id ); ?>" />
		<?php endif; ?>

		<?php $list_table->search_box( __( 'Search Updates', 'revisions-extended' ), 'revision' ); ?>
		<?php $list_table->display(); ?>
	</form>
</div>
