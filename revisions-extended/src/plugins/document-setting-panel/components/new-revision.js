/**
 * External dependencies
 */
import { useState } from 'react';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { usePost, useScheduledRevision } from '../../../hooks';

const NewRevision = () => {
	const [ isBusy, setBusy ] = useState( false );
	const { content, savedPost } = usePost();
	const { create } = useScheduledRevision();

	return (
		<Button
			isBusy={ isBusy }
			isPrimary
			onClick={ async () => {
				setBusy( true );
				const { error, data } = await create( {
					postType: savedPost.type,
					postId: savedPost.id,
					date: savedPost.date,
					content,
				} );

				if ( ! error ) {
					// We should navigate to the custom post type
				}

				setBusy( false );
			} }
		>
			{ __( 'Schedule Revision', 'revisions-extended' ) }
		</Button>
	);
};

export default NewRevision;
