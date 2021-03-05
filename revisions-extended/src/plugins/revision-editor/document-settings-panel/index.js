/**
 * External dependencies
 */
import { useEffect } from 'react';

/**
 * WordPress dependencies
 */
import { select, dispatch } from '@wordpress/data';
import { PluginDocumentSettingPanel } from '@wordpress/edit-post';
import { PanelRow } from '@wordpress/components';

/**
 * Internal dependencies
 */
import PostSchedule from './post-schedule';
import PostStatusTrashButton from './post-status-trash-button';
import PostStatusPublishCheckbox from './post-status-publish-checkbox';

import {
	useInterface,
	useRevision,
	usePost,
	useParentPost,
} from '../../../hooks';
import { WP_PUBLISH_STATUS } from '../../../settings';

import { GUTENBERG_PLUGIN_NAMESPACE } from '../index';

/**
 * Module Constants
 */

const STORE_KEY = 'core/edit-post';
const PANEL_NAME = 'scheduled-revisions';

const DocumentSettingsPanel = () => {
	const { shouldIntercept, setShouldIntercept } = useInterface();
	const { trash } = useRevision();
	const { getEditedPostAttribute } = usePost();
	const { status: parentStatus } = useParentPost();

	useEffect( () => {
		// Hide the default panel;
		dispatch( STORE_KEY ).removeEditorPanel( 'post-status' );

		// Make sure we turn on our panel
		const togglePanelOn = async () => {
			const isToggledOn = await select( STORE_KEY ).isEditorPanelOpened(
				`${ GUTENBERG_PLUGIN_NAMESPACE }/${ PANEL_NAME }`
			);

			if ( ! isToggledOn ) {
				await dispatch( STORE_KEY ).toggleEditorPanelOpened(
					`${ GUTENBERG_PLUGIN_NAMESPACE }/${ PANEL_NAME }`
				);
			}
		};

		togglePanelOn();
	}, [] );

	return (
		<PluginDocumentSettingPanel name={ PANEL_NAME }>
			<PanelRow>
				<PostSchedule />
			</PanelRow>
			{ parentStatus === WP_PUBLISH_STATUS && (
				<PanelRow>
					<PostStatusPublishCheckbox
						toggled={ shouldIntercept }
						onToggle={ setShouldIntercept }
					/>
				</PanelRow>
			) }
			<PanelRow>
				<PostStatusTrashButton
					id={ getEditedPostAttribute( 'id' ) }
					onDelete={ trash }
				/>
			</PanelRow>
		</PluginDocumentSettingPanel>
	);
};

export default DocumentSettingsPanel;
