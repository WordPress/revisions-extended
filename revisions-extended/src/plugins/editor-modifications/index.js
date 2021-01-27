/**
 * External dependencies
 */
import { registerPlugin } from '@wordpress/plugins';
import { Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */
import UpdateButtonModifier from './update-button-modifier';
import PluginPostStatusInfo from './plugin-post-status-info';

import { pluginNamespace } from '../../utils';
import { usePost } from '../../hooks';

const MainPlugin = () => {
	const { isPublished } = usePost();

	if ( ! isPublished ) {
		return null;
	}

	return (
		<Fragment>
			<UpdateButtonModifier />
			<PluginPostStatusInfo />
		</Fragment>
	);
};

registerPlugin( `${ pluginNamespace }-main-plugin`, {
	render: MainPlugin,
} );
