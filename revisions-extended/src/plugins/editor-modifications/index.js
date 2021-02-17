/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { registerPlugin } from '@wordpress/plugins';

/**
 * Internal dependencies
 */
import { ErrorBoundary } from '../../components';
import UpdateButtonModifier from './update-button-modifier';
import PluginPostStatusInfo from './plugin-post-status-info';
import DocumentSettingsPanel from './document-settings-panel';

import { pluginNamespace } from '../../utils';
import { InterfaceProvider, TypesProvider, usePost } from '../../hooks';

const MainPlugin = () => {
	const { isPublished } = usePost();

	if ( ! isPublished ) {
		return null;
	}

	return (
		<ErrorBoundary>
			<InterfaceProvider btnText={ __( 'Create update' ) }>
				<TypesProvider>
					<UpdateButtonModifier />
					<PluginPostStatusInfo />
					<DocumentSettingsPanel />
				</TypesProvider>
			</InterfaceProvider>
		</ErrorBoundary>
	);
};

registerPlugin( `${ pluginNamespace }-main-plugin`, {
	render: MainPlugin,
} );
