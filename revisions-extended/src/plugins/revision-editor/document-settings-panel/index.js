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

import { useRevision, usePost, useParentPost, useTypes } from '../../../hooks';

import { GUTENBERG_PLUGIN_NAMESPACE } from '../index';
import { GUTENBERG_EDIT_POST_STORE } from '../../../settings';

/**
 * Module Constants
 */

const PANEL_NAME = 'scheduled-revisions';

const DocumentSettingsPanel = () => {
	const { trash } = useRevision();
	const { getEditedPostAttribute } = usePost();
	const { type: parentType } = useParentPost();
	const { getTypeInfo } = useTypes();

	useEffect( () => {
		// Hide the default panel;
		dispatch( GUTENBERG_EDIT_POST_STORE ).removeEditorPanel(
			'post-status'
		);

		// Make sure we turn on our panel
		const togglePanelOn = async () => {
			const isToggledOn = await select(
				GUTENBERG_EDIT_POST_STORE
			).isEditorPanelOpened(
				`${ GUTENBERG_PLUGIN_NAMESPACE }/${ PANEL_NAME }`
			);

			if ( ! isToggledOn ) {
				await dispatch(
					GUTENBERG_EDIT_POST_STORE
				).toggleEditorPanelOpened(
					`${ GUTENBERG_PLUGIN_NAMESPACE }/${ PANEL_NAME }`
				);
			}
		};

		togglePanelOn();
	}, [] );

	useEffect( () => {
		if ( ! parentType ) {
			return;
		}

		const supportsEditor = getTypeInfo( `${ parentType }.supports.editor` );

		if ( ! supportsEditor ) {
			dispatch( GUTENBERG_EDIT_POST_STORE ).removeEditorPanel(
				'post-excerpt'
			);
		}
	}, [ parentType ] );

	return (
		<PluginDocumentSettingPanel name={ PANEL_NAME }>
			<PanelRow>
				<PostSchedule />
			</PanelRow>
			<PanelRow>
				<PostStatusTrashButton
					id={ getEditedPostAttribute( 'id' ) }
					parentType={ parentType }
					onDelete={ trash }
				/>
			</PanelRow>
		</PluginDocumentSettingPanel>
	);
};

export default DocumentSettingsPanel;
