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
import { usePost, useScheduledRevision } from '../../../../hooks';

const DeleteRevisionView = () => {
	const [ isBusy, setBusy ] = useState( false );
	const { trash } = useScheduledRevision();
	const { savedPost } = usePost();

	return (
		<Button
			isBusy={ isBusy }
			isTertiary
			isDestructive
			onClick={ async () => {
				setBusy( true );
				const res = await trash( {
					postType: savedPost.type,
					postId: savedPost.parent,
					revisionId: savedPost.id,
				} );

				console.log( res );
				setBusy( false );
			} }
		>
			{ __( 'Delete Revision', 'revisions-extended' ) }
		</Button>
	);
};

export default DeleteRevisionView;
