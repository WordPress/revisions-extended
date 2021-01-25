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
import { usePost, useScheduledRevision } from '../hooks';

const UpdateRevision = () => {
	const [ isBusy, setBusy ] = useState( false );
	const { content, savedPost } = usePost();
	const { update } = useScheduledRevision();

	return (
		<Button
			isBusy={ isBusy }
			isPrimary
			onClick={ async () => {
				setBusy( true );
				const res = await update( {
					postType: savedPost.type,
					postId: savedPost.parent,
					date: savedPost.date,
					revisionId: savedPost.id,
					content,
				} );

				console.log( res );
				setBusy( false );
			} }
		>
			{ __( 'Update Revision', 'revisions-extended' ) }
		</Button>
	);
};

export default UpdateRevision;
