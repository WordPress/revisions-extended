/**
 * External dependencies
 */
import { registerPlugin } from '@wordpress/plugins';

/**
 * Internal dependencies
 */
import DocumentSettingPanel from './document-setting-panel';
import PluginPostStatusInfo from './plugin-post-status-info';
import PluginSidebar from './plugin-sidebar';
import ButtonModifierPlugin from './button-modifier';
import { pluginNamespace } from '../../utils';

registerPlugin( `${ pluginNamespace }-document-setting-panel`, {
	render: DocumentSettingPanel,
} );

registerPlugin( `${ pluginNamespace }-post-status-info`, {
	render: PluginPostStatusInfo,
} );

registerPlugin( `${ pluginNamespace }-plugin-sidebar`, {
	render: PluginSidebar,
} );

registerPlugin( `${ pluginNamespace }-button-modifier`, {
	render: ButtonModifierPlugin,
} );

alert('revision-editor');