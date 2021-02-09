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

	const onTrashClick = () => {
		const message = __(
			'Are you sure you want to delete this update?',
			'revisions-extended'
		);

		// eslint-disable-next-line no-alert
		if ( window.confirm( message ) ) {
			trashPost();
		}
	};

	return (
		<PostStatusInfo>
			<Button
				onClick={ onTrashClick }
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
