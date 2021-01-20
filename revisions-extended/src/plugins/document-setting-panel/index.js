/**
 * External dependencies
 */
import { useEffect, useState } from 'react';
import { PluginDocumentSettingPanel } from '@wordpress/edit-post';

/**
 * WordPress dependencies
 */
import { registerPlugin } from '@wordpress/plugins';
import { format } from '@wordpress/date';
import { PanelRow } from '@wordpress/components';

/**
 * Internal dependencies
 */
import {
	NewRevisionView,
	UpdateRevisionView,
	DeleteRevisionView,
	PublishRevisionView,
} from './views';
import { RevisionList } from '../../components';
import { pluginName, pluginNamespace } from '../../utils';
import { usePost, useScheduledRevision } from '../../hooks';

const COMPONENT_NAMESPACE = `${ pluginNamespace }-document-slot`;

const PluginDocumentSettingPanelDemo = () => {
	const [ revisions, setRevisions ] = useState( [] );
	const { savedPost, getEditedPostAttribute, isPublished } = usePost();
	const { get: getRevisions } = useScheduledRevision();

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

	if ( ! isPublished ) {
		return null;
	}

	return (
		<PluginDocumentSettingPanel
			name={ COMPONENT_NAMESPACE }
			title={ pluginName }
			className={ COMPONENT_NAMESPACE }
		>
			{ savedPost.date !== getEditedPostAttribute( 'date' ) && (
				<PanelRow>
					Scheduled for:{ ' ' }
					{ format( 'r', getEditedPostAttribute( 'date' ) ) }
				</PanelRow>
			) }
			<RevisionList items={ revisions } />
			<PanelRow>
				<NewRevisionView />
			</PanelRow>
			<PanelRow>
				<UpdateRevisionView />
			</PanelRow>
			<PanelRow>
				<DeleteRevisionView />
			</PanelRow>
			<PanelRow>
				<PublishRevisionView />
			</PanelRow>
		</PluginDocumentSettingPanel>
	);
};

registerPlugin( COMPONENT_NAMESPACE, {
	render: PluginDocumentSettingPanelDemo,
} );
