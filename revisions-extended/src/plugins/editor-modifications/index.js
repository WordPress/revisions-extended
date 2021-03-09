/**
 * WordPress dependencies
 */
import { registerPlugin } from '@wordpress/plugins';

/**
 * Internal dependencies
 */
import { ErrorBoundary } from '../../components';
import DocumentSettingsPanel from './document-settings-panel';
import UpdateDropdownButton from './update-dropdown-button';
import CreateSuccessWindow from './create-success-window';
import CreateSidebar from './create-sidebar';

import { pluginNamespace } from '../../utils';
import { InterfaceProvider, TypesProvider, usePost } from '../../hooks';

/**
 * Module constants
 */
export const PLUGIN_NAME = `${ pluginNamespace }-main-plugin`;

const MainPlugin = () => {
	const { isPublished } = usePost();

	if ( ! isPublished ) {
		return null;
	}

	return (
		<ErrorBoundary>
			<InterfaceProvider>
				<TypesProvider>
					<CreateSuccessWindow />
					<UpdateDropdownButton />
					<CreateSidebar />
					<DocumentSettingsPanel />
				</TypesProvider>
			</InterfaceProvider>
		</ErrorBoundary>
	);
};

registerPlugin( PLUGIN_NAME, {
	render: MainPlugin,
} );
