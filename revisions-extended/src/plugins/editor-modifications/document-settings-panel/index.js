/**
 * External dependencies
 */
import { useEffect, useState, useMemo } from 'react';

/**
 * WordPress dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import { PluginDocumentSettingPanel } from '@wordpress/edit-post';

/**
 * Internal dependencies
 */
import { RevisionList } from '../../../components';
import { useRevision, usePost, useTypes } from '../../../hooks';
import { getEditUrl, getStatusDisplay } from '../../../utils';

const DocumentSettingsPanel = () => {
	const [ revisions, setRevisions ] = useState( [] );
	const { savedPost } = usePost();
	const { loaded: loadedTypes, getTypeInfo } = useTypes();
	const { get } = useRevision();

	useEffect( () => {
		if ( ! loadedTypes ) return;

		const runQuery = async () => {
			const { data, error } = await get( {
				postId: savedPost.id,
				restBase: await getTypeInfo( savedPost.type, 'rest_base' ),
			} );

			if ( error ) {
				// TO Something
			}

			if ( data ) {
				setRevisions( data );
			}
		};

		runQuery();
	}, [ loadedTypes ] );

	const revisionSort = ( a, b ) =>
		new Date( a.date_gmt ) - new Date( b.date_gmt );

	const getAuthorName = ( revision ) => {
		try {
			return revision._embedded.author[ 0 ].slug;
		} catch ( e ) {}
	};

	const getAuthorString = ( revision ) => {
		const authorName = getAuthorName( revision );

		if ( authorName ) {
			return `(by ${ authorName })`;
		}

		return '';
	};

	const revisionMap = ( i ) => {
		return {
			text: sprintf(
				// translators: %1s: revision id, %2s: author name .
				__( 'Update #%1$s %2$s' ),
				i.id,
				getAuthorString( i )
			),
			status: `${ getStatusDisplay( i.status, i.date_gmt ) }`,
			href: getEditUrl( i.id ),
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
			title={ __( 'Updates', 'revisions-extended' ) }
			icon="nothing"
		>
			<RevisionList items={ mappedRevisions } />
		</PluginDocumentSettingPanel>
	);
};

export default DocumentSettingsPanel;
