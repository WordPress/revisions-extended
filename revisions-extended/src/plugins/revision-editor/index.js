/**
 * External dependencies
 */
import { registerPlugin } from '@wordpress/plugins';

/**
 * Internal dependencies
 */
import DocumentSettingPanel from './document-setting-panel';
import RevisionIndicator from './revision-indicator';
import { pluginNamespace } from '../../utils';

registerPlugin( `${ pluginNamespace }-document-setting-panel`, {
	render: DocumentSettingPanel,
} );

registerPlugin( `${ pluginNamespace }-revision-indicator`, {
	render: RevisionIndicator,
} );
