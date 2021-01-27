/**
 * External dependencies
 */
import { registerPlugin } from '@wordpress/plugins';

/**
 * Internal dependencies
 */
import UpdateButtonModifier from './update-button-modifier';
import PluginPostStatusInfo from './plugin-post-status-info';
import { usePost } from '../../hooks';
import { pluginNamespace } from '../../utils';

const MainPlugin = () => {
	const { isPublished } = usePost();

	if ( ! isPublished ) {
		return null;
	}

	registerPlugin( `${ pluginNamespace }-update-button-modifier`, {
		render: UpdateButtonModifier,
	} );

	registerPlugin( `${ pluginNamespace }-post-status-info`, {
		render: PluginPostStatusInfo,
	} );
};

registerPlugin( `${ pluginNamespace }-main-plugin`, {
	render: MainPlugin,
} );
