/**
 * External dependencies
 */
import { registerPlugin } from '@wordpress/plugins';

/**
 * Internal dependencies
 */
import DocumentSettingPanel from './document-setting-panel';
import PluginSidebar from './plugin-sidebar';
import { pluginNamespace } from '../../utils';

registerPlugin( `${ pluginNamespace }-document-setting-panel`, {
	render: DocumentSettingPanel,
} );

registerPlugin( `${ pluginNamespace }-plugin-sidebar`, {
	render: PluginSidebar,
} );
