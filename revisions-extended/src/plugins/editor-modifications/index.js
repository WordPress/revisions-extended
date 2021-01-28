/**
 * External dependencies
 */
import { registerPlugin } from '@wordpress/plugins';

/**
 * Internal dependencies
 */
import UpdateButtonModifier from './update-button-modifier';
import PluginPostStatusInfo from './plugin-post-status-info';
import DocumentSettingsPanel from './document-settings-panel';

import { pluginNamespace } from '../../utils';
import { InterfaceProvider, usePost } from '../../hooks';

const MainPlugin = () => {
	const { isPublished } = usePost();

	if ( ! isPublished ) {
		return null;
	}

	return (
		<InterfaceProvider>
			<UpdateButtonModifier />
			<PluginPostStatusInfo />
			<DocumentSettingsPanel />
		</InterfaceProvider>
	);
};

registerPlugin( `${ pluginNamespace }-main-plugin`, {
	render: MainPlugin,
} );
