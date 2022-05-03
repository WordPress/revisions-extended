/**
 * WordPress dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import { PluginDocumentSettingPanel } from '@wordpress/edit-post';
import { useEffect, useMemo, useState } from '@wordpress/element';
import { dispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { RevisionList } from '../../../components';
import { usePost, useRevision, useTypes } from '../../../hooks';
import { getAllRevisionUrl, getEditUrl, getStatusDisplay } from '../../../utils';
import { GUTENBERG_NOTICE_STORE } from '../../../settings';

/**
 * Displays a notice to the user about an existing update to the current post.
 *
 * @param {string} typeDisplayName The singular name of the post type
 * @param {number} postId          The id of the post
 */
const dispatchSingleUpdateNotice = ( typeDisplayName, postId ) => {
	dispatch( GUTENBERG_NOTICE_STORE ).createWarningNotice(
		sprintf(
			// translators: %s: post type singular label.
			__(
				'This %s has an update that could overwrite any changes that you make here.',
				'revisions-extended'
			),
			typeDisplayName
		),
		{
			isDismissible: true,
			actions: [
				{
					url: getEditUrl( postId ),
					label: __( 'Edit update', 'revisions-extended' ),
				},
			],
		}
	);
};

/**
 * Displays a notice to the user about multiple existing updates to the current post.
 *
 * @param {string} typeDisplayName The singular name of the post type
 * @param {Object} savedPost
 * @param {string} savedPost.type  The post type
 * @param {number} savedPost.id    The post id
 */
const dispatchMultipleUpdateNotice = ( typeDisplayName, savedPost ) => {
	dispatch( GUTENBERG_NOTICE_STORE ).createWarningNotice(
		sprintf(
			// translators: %s: post type singular label.
			__( 'This %s has updates that could overwrite any changes that you make here.', 'revisions-extended' ),
			typeDisplayName
		),
		{
			isDismissible: true,
			actions: [
				{
					url: `${ getAllRevisionUrl( savedPost.type ) }&p=${ savedPost.id }`,
					label: sprintf(
						// translators: %s: post type singular label.
						__( 'See all updates for this %s', 'revisions-extended' ),
						typeDisplayName
					),
				},
			],
		}
	);
};

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
					const typeDisplayName = getTypeInfo(
						`${ savedPost.type }.labels.singular_name`
					).toLowerCase();

					if ( sortedRevisions.length === 1 ) {
						dispatchSingleUpdateNotice( typeDisplayName, sortedRevisions[ 0 ].id );
					} else {
						dispatchMultipleUpdateNotice( typeDisplayName, savedPost );
					}
				}

				setRevisions( sortedRevisions );
			}
		};

		runQuery();
	}, [ loadedTypes ] );

	const revisionSort = ( a, b ) => new Date( a.date_gmt ) - new Date( b.date_gmt );

	const getAuthorName = ( revision ) => {
		try {
			return revision._embedded.author[ 0 ].slug;
		} catch ( exception ) {}
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
				__( 'Update #%1$s %2$s', 'revisions-extended' ),
				i.id,
				getAuthorString( i )
			),
			status: `${ getStatusDisplay( i.status, i.date_gmt ) }`,
			href: getEditUrl( i.id ),
		};
	};

	const mappedRevisions = useMemo( () => revisions.map( revisionMap ), [ revisions ] );

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
