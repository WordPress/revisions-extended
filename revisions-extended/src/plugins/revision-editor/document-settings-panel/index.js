/**
 * External dependencies
 */
import { useEffect } from 'react';

/**
 * WordPress dependencies
 */
import { select, dispatch } from '@wordpress/data';
import { PluginDocumentSettingPanel } from '@wordpress/edit-post';

/**
 * Internal dependencies
 */
import PostSchedule from './post-schedule';
import { GUTENBERG_PLUGIN_NAMESPACE } from '../index';

/**
 * Module Constants
 */

const STORE_KEY = 'core/edit-post';
const PANEL_NAME = 'scheduled-revisions';

const DocumentSettingsPanel = () => {
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
			<PostSchedule />
		</PluginDocumentSettingPanel>
	);
};

export default DocumentSettingsPanel;
