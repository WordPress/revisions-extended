/**
 * External dependencies
 */
import { registerPlugin } from '@wordpress/plugins';

/**
 * Internal dependencies
 */
import UpdateButtonModifier from './update-button-modifier';
import PluginPostStatusInfo from './plugin-post-status-info';
import RevisionIndicator from './revision-indicator';

import { pluginNamespace } from '../../utils';

registerPlugin( `${ pluginNamespace }-update-button-modifier`, {
	render: UpdateButtonModifier,
} );

registerPlugin( `${ pluginNamespace }-post-status-info`, {
	render: PluginPostStatusInfo,
} );

registerPlugin( `${ pluginNamespace }-revision-indicator`, {
	render: RevisionIndicator,
} );
