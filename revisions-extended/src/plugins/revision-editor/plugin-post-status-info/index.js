/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { dispatch } from '@wordpress/data';
import { PluginPostStatusInfo as PostStatusInfo } from '@wordpress/edit-post';
import { Button } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { getEditUrl } from '../../../utils';
import { useRevision, usePost } from '../../../hooks';
import { NOTICE_ID } from '../revision-indicator';

const PluginPostStatusInfo = () => {
	const { savedPost } = usePost();
	const { publish } = useRevision();

	const runPublish = async () => {
		const { data, error } = await publish( {
			postId: savedPost.parent,
			postType: 'post',
			revisionId: savedPost.id,
		} );

		if ( data ) {
			dispatch( 'core/notices' ).removeNotice( NOTICE_ID );
			const notes = [
				__( 'This revision has been published.' ),
				`[ <a href="${ getEditUrl(
					savedPost.parent
				) }">Edit post</a>. |`,
				`<a href="/?p=${ savedPost.parent }">View post</a>. ]`,
			];
			dispatch( 'core/notices' ).createNotice(
				'success',
				notes.join( ' ' ),
				{
					__unstableHTML: true,
					isDismissible: false,
				}
			);
		}

		if ( error ) {
			dispatch( 'core/notices' ).createNotice(
				'error',
				__( 'Error publishing revision.' )
			);
		}
	};

	return (
		<PostStatusInfo>
			<Button isLink onClick={ runPublish }>
				{ __( 'Publish Now', 'revisions-extended' ) }
			</Button>
		</PostStatusInfo>
	);
};

export default PluginPostStatusInfo;
