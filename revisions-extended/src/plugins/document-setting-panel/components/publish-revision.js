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

const PublishRevision = () => {
	const [ isBusy, setBusy ] = useState( false );
	const { publish } = useScheduledRevision();
	const { savedPost } = usePost();

	return (
		<Button
			isBusy={ isBusy }
			isPrimary
			onClick={ async () => {
				setBusy( true );
				const res = await publish( {
					postType: savedPost.type,
					postId: savedPost.parent,
					revisionId: savedPost.id,
				} );
				console.log( res );
				setBusy( false );
			} }
		>
			{ __( 'Publish Revision', 'revisions-extended' ) }
		</Button>
	);
};

export default PublishRevision;
