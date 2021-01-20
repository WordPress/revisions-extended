/**
 * Internal Dependencies
 */
import { useState, useEffect } from 'react';

/**
 * Internal dependencies
 */
import { RevisionList } from '../../../components';
import { usePost, useScheduledRevision } from '../../../hooks';

const Revisions = () => {
	const [ revisions, setRevisions ] = useState( [] );
	const { get: getRevisions } = useScheduledRevision();
	const { savedPost } = usePost();

	useEffect( () => {
		const getAllRevisions = async () => {
			const { error, data } = await getRevisions( {
				postType: savedPost.type,
				postId: savedPost.id,
			} );

			if ( error ) {
				// TO DO, we have an error
			} else {
				setRevisions( data );
			}
		};

		if ( savedPost.id ) {
			getAllRevisions();
		}
	}, [] );

	return <RevisionList items={ revisions } />;
};

export default Revisions;
