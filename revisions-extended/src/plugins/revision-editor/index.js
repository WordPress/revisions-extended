/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { registerPlugin } from '@wordpress/plugins';

/**
 * Internal dependencies
 */
import DocumentSettingsPanel from './document-settings-panel';
import UpdateButtonModifier from './update-button-modifier';
import RevisionIndicator from './revision-indicator';
import TrashModifier from './trash-modifier';
import PluginPostStatusInfo from './plugin-post-status-info';
import { pluginNamespace, getEditUrl } from '../../utils';

import { InterfaceProvider, usePost, ParentPostProvider } from '../../hooks';

/**
 * Module Constants
 */
export const GUTENBERG_PLUGIN_NAMESPACE = `${ pluginNamespace }-plugin-wrapper`;

const PluginWrapper = () => {
	const { isRevision, savedPost } = usePost();

	// If we don't support the revision status, leave to the parent.
	if ( ! isRevision ) {
		window.location.href = getEditUrl( savedPost.parent );
	}

	return (
		<InterfaceProvider btnText={ __( 'Update' ) }>
			<ParentPostProvider>
				<DocumentSettingsPanel />
				<UpdateButtonModifier />
				<RevisionIndicator />
				<TrashModifier />
				<PluginPostStatusInfo />
			</ParentPostProvider>
		</InterfaceProvider>
	);
};

registerPlugin( GUTENBERG_PLUGIN_NAMESPACE, {
	render: PluginWrapper,
} );
