/**
 * External dependencies
 */
import { useEffect, useState, useMemo } from 'react';

/**
 * WordPress dependencies
 */
import { PluginDocumentSettingPanel } from '@wordpress/edit-post';

/**
 * Internal dependencies
 */
import { RevisionList } from '../../../components';
import { useRevision, usePost } from '../../../hooks';
import { getEditUrl, getFormattedDate } from '../../../utils';

const DocumentSettingsPanel = () => {
	const [ revisions, setRevisions ] = useState( [] );
	const { savedPost } = usePost();
	const { get } = useRevision();

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
			text: getFormattedDate( i.date_gmt ),
			href: getEditUrl( i.id ),
			author: i.author_name,
		};
	};

	const mappedRevisions = useMemo(
		() => revisions.sort( revisionSort ).map( revisionMap ),
		[ revisions ]
	);

	if ( revisions.length < 1 ) {
		return null;
	}

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
