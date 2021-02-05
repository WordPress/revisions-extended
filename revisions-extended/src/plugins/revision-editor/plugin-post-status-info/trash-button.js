/**
 * External dependencies
 */
import { useState } from 'react';
/**
 * WordPress dependencies
 */
import { dispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { PluginPostStatusInfo as PostStatusInfo } from '@wordpress/edit-post';
import { Button } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { useRevision, usePost } from '../../../hooks';

const PluginPostStatusTrashButton = () => {
	const [ isBusy, setBusy ] = useState( false );
	const { trash } = useRevision();
	const { getEditedPostAttribute } = usePost();

	const trashPost = async () => {
		setBusy( true );
		const { data, error } = await trash( getEditedPostAttribute( 'id' ) );

		setBusy( false );

		if ( error ) {
			dispatch( 'core/notices' ).createNotice(
				'error',
				__( 'Error deleting update.' ),
				{
					id: 'revisions-extended-delete-notice',
				}
			);
		}

		if ( data ) {
			window.history.back();
		}
	};

	return (
		<PostStatusInfo>
			<Button
				onClick={ trashPost }
				isTertiary
				isDestructive
				isBusy={ isBusy }
			>
				{ __( 'Delete permanently' ) }
			</Button>
		</PostStatusInfo>
	);
};

export default PluginPostStatusTrashButton;
