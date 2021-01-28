/**
 * External dependencies
 */
import { useEffect, useState, useMemo } from 'react';

/**
 * WordPress dependencies
 */
import { PluginDocumentSettingPanel } from '@wordpress/edit-post';
import { format } from '@wordpress/date';

/**
 * Internal dependencies
 */
import { RevisionList } from '../../../components';
import { useScheduledRevision, usePost } from '../../../hooks';
import { getEditUrl } from '../../../utils';

const DocumentSettingsPanel = () => {
	const [ revisions, setRevisions ] = useState( [] );
	const { savedPost } = usePost();
	const { get } = useScheduledRevision();

	useEffect( () => {
		const runQuery = async () => {
			const { data, error } = await get( {
				postId: savedPost.id,
				postType: savedPost.type,
			} );

			if ( error ) {
				// TO Something
			}

			if ( data ) {
				setRevisions( data );
			}
		};

		runQuery();
	}, [] );

	const revisionSort = ( a, b ) =>
		new Date( a.date_gmt ) - new Date( b.date_gmt );

	const revisionMap = ( i ) => {
		return {
			text: format( 'D, F j, Y G:i a', i.date_gmt ),
			href: getEditUrl( i.id ),
		};
	};

	const mappedRevisions = useMemo(
		() => revisions.sort( revisionSort ).map( revisionMap ),
		[ revisions ]
	);

	return (
		<PluginDocumentSettingPanel
			name="scheduled-revisions"
			title="Scheduled Revisions"
			icon="nothing"
		>
			<RevisionList items={ mappedRevisions } />
		</PluginDocumentSettingPanel>
	);
};

export default DocumentSettingsPanel;
