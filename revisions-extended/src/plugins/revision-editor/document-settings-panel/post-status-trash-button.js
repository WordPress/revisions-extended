/**
 * External dependencies
 */
import { useState } from 'react';
/**
 * WordPress dependencies
 */
import { dispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { getAllRevisionUrl } from '../../../utils';

const PostStatusTrashButton = ( { onDelete, id, parentType } ) => {
	const [ isBusy, setBusy ] = useState( false );

	const deleteUpdate = async () => {
		setBusy( true );
		const { data, error } = await onDelete( id );

		setBusy( false );

		if ( error ) {
			dispatch( 'core/notices' ).createNotice(
				'error',
				__( 'Error deleting update.', 'revisions-extended' ),
				{
					id: 'revisions-extended-delete-notice',
				}
			);
		}

		if ( data ) {
			window.location.href = getAllRevisionUrl( parentType );
		}
	};

	const onTrashClick = () => {
		const message = __( 'Are you sure you want to delete this update?', 'revisions-extended' );

		// eslint-disable-next-line no-alert
		if ( window.confirm( message ) ) {
			deleteUpdate();
		}
	};

	return (
		<Button onClick={ onTrashClick } isTertiary isDestructive isBusy={ isBusy }>
			{ __( 'Delete permanently', 'revisions-extended' ) }
		</Button>
	);
};

export default PostStatusTrashButton;
