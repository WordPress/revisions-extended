/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { registerPlugin } from '@wordpress/plugins';

/**
 * Internal dependencies
 */
import { ErrorBoundary } from '../../components';
import DocumentSettingsPanel from './document-settings-panel';
import UpdateButtonModifier from './update-button-modifier';
import RevisionIndicator from './revision-indicator';
import WPButtonModifier from './wp-button-modifier';
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
<<<<<<< HEAD
		<ErrorBoundary>
			<InterfaceProvider btnText={ __( 'Publish' ) }>
				<ParentPostProvider links={ savedPost._links }>
					<TypesProvider>
						<DocumentSettingsPanel />
						<UpdateButtonModifier />
						<RevisionIndicator />
						<WPButtonModifier />
					</TypesProvider>
				</ParentPostProvider>
			</InterfaceProvider>
		</ErrorBoundary>
=======
		<InterfaceProvider btnText={ __( 'Publish' ) }>
			<ParentPostProvider links={ savedPost._links }>
				<DocumentSettingsPanel />
				<UpdateButtonModifier />
				<RevisionIndicator />
				<WPButtonModifier />
			</ParentPostProvider>
		</InterfaceProvider>
>>>>>>> Revert "Make the getTypeInfo function async for get the object."
	);
};

registerPlugin( GUTENBERG_PLUGIN_NAMESPACE, {
	render: PluginWrapper,
} );
