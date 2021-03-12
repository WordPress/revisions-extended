/**
 * External dependencies
 */
import { useEffect, useState, useMemo } from 'react';

/**
 * WordPress dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import { PluginDocumentSettingPanel } from '@wordpress/edit-post';
import { dispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { RevisionList } from '../../../components';
import { useRevision, usePost, useTypes } from '../../../hooks';
import {
	getEditUrl,
	getStatusDisplay,
	getAllRevisionUrl,
} from '../../../utils';

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
				restBase: getTypeInfo( `${ savedPost.type }.rest_base` ),
			} );

			if ( error ) {
				// TO Something
			}

			if ( data ) {
				const sortedRevisions = data.sort( revisionSort );

				if ( sortedRevisions.length > 0 ) {
					dispatch( 'core/notices' ).createWarningNotice(
						sprintf(
							// translators: %s: post type singular name.
							__(
								'This %s has a scheduled update that will replace any changes that you make here.',
								'revisions-extended'
							),
							getTypeInfo(
								`${ savedPost.type }.labels.singular_name`
							).toLowerCase()
						),
						{
							isDismissible: true,
							actions: [
								{
									url: getEditUrl( sortedRevisions[ 0 ].id ),
									label: __(
										'Edit latest update',
										'revisions-extended'
									),
								},
								{
									url: `${ getAllRevisionUrl(
										savedPost.type
									) }&p=${ savedPost.id }`,
									label: __(
										'See all updates',
										'revisions-extended'
									),
								},
							],
						}
					);
				}

				setRevisions( sortedRevisions );
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

	const mappedRevisions = useMemo( () => revisions.map( revisionMap ), [
		revisions,
	] );

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
