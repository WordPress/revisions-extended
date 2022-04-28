<?php

namespace RevisionsExtended\Admin;

use WP_Post;
use function RevisionsExtended\Revision\get_edit_revision_link;

defined( 'WPINC' ) || die();

/** @var int $revision_id */
/** @var WP_Post $revision */
/** @var array $errors */
?>

<div class="wrap">
	<?php if ( ! empty( $errors ) ) : ?>
		<?php foreach ( $errors as $an_error ) : ?>
			<div class="notice notice-error">
				<p><?php echo esc_html( $an_error ); ?></p>
			</div>
		<?php endforeach; ?>
	<?php else : ?>
		<h1 class="wp-heading-inline">
			<?php
			printf(
				// translators: A post title.
				esc_html__( 'Update to &#8220;%s&#8221;', 'revisions-extended' ),
				esc_html( get_the_title( $revision->post_parent ) )
			);
			?>
		</h1>

		<?php
		printf(
			'<a class="page-title-action" href="%1$s">%2$s</a>',
			esc_url( get_edit_revision_link( $revision_id ) ),
			esc_html__( 'Edit Update', 'revisions-extended' )
		);
		?>

		<?php if ( 'future' === get_post_status( $revision ) ) : ?>
			<p>
				<?php
				printf(
					// translators: A date and time.
					esc_html__( 'Scheduled for %s', 'revisions-extended' ),
					esc_html( date_i18n( __( 'F jS, Y \a\t g:i a', 'revisions-extended' ), strtotime( $revision->post_date ) ) )
				);
				?>
			</p>
		<?php endif; ?>
	<?php endif; ?>

	<hr class="wp-header-end">
</div>

<?php wp_print_revision_templates(); ?>
