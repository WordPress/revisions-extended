/**
 * WordPress dependencies
 */
import { registerPlugin } from '@wordpress/plugins';

/**
 * Internal dependencies
 */
import { ErrorBoundary } from '../../components';
import DocumentSettingsPanel from './document-settings-panel';
import RevisionIndicator from './revision-indicator';
import WPButtonModifier from './wp-button-modifier';
import TabTextModifier from './tab-text-modifier';
import UpdateDropdownButton from './update-dropdown-button';
import PublishSuccessWindow from './publish-success-window';

// The filter will run once on load
import './wp-button-filter';

import { pluginNamespace, getEditUrl } from '../../utils';

import {
	InterfaceProvider,
	ParentPostProvider,
	TypesProvider,
	usePost,
} from '../../hooks';

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
		<ErrorBoundary>
			<InterfaceProvider>
				<ParentPostProvider links={ savedPost._links }>
					<TypesProvider>
						<UpdateDropdownButton />
						<DocumentSettingsPanel />
						<RevisionIndicator />
						<WPButtonModifier />
						<TabTextModifier />
						<PublishSuccessWindow />
					</TypesProvider>
				</ParentPostProvider>
			</InterfaceProvider>
		</ErrorBoundary>
	);
};

registerPlugin( GUTENBERG_PLUGIN_NAMESPACE, {
	render: PluginWrapper,
} );
