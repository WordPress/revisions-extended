/**
 * External dependencies
 */
import { registerPlugin } from '@wordpress/plugins';

/**
 * Internal dependencies
 */
import UpdateButtonModifier from './update-button-modifier';

import { pluginNamespace } from '../../utils';

registerPlugin( `${ pluginNamespace }-update-button-modifier`, {
	render: UpdateButtonModifier,
} );

alert('editor-modifications');