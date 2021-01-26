/**
 * External dependencies
 */
import { useEffect } from 'react';

/**
 * WordPress Dependencies
 */
import { __ } from '@wordpress/i18n';
import { dispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { useScheduledRevision, usePost } from '../../../hooks';

const TrashModifier = () => {
	const { trash } = useScheduledRevision();
	const { getEditedPostAttribute } = usePost();

	dispatch( 'core/editor' ).trashPost = async () => {
		const { data, error } = trash( getEditedPostAttribute( 'id' ) );

		if ( error ) {
			dispatch( 'core/notices' ).createNotice(
				'error',
				__( 'Error deleting revision' ),
				{
					id: 'revisions-extended-delete-notice',
				}
			);
		}

		if ( data ) {
			// To something here
			console.log( ' go back' );
			history.back();
		}
	};

	return null;
};

export default TrashModifier;
