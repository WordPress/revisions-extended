/**
 * External dependencies
 */
import { useEffect } from 'react';

/**
 * WordPress dependencies
 */
import { dispatch } from '@wordpress/data';
import { PluginDocumentSettingPanel } from '@wordpress/edit-post';

/**
 * Internal dependencies
 */
import PostSchedule from './post-schedule';

const DocumentSettingsPanel = () => {
	useEffect( () => {
		// Hide the default panel;
		dispatch( 'core/edit-post' ).removeEditorPanel( 'post-status' );
	}, [] );

	return (
		<PluginDocumentSettingPanel name="scheduled-revisions">
			<PostSchedule />
		</PluginDocumentSettingPanel>
	);
};

export default DocumentSettingsPanel;
