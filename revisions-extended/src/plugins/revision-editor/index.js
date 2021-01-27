/**
 * External dependencies
 */
import { registerPlugin } from '@wordpress/plugins';

/**
 * Internal dependencies
 */
import RevisionIndicator from './revision-indicator';
import TrashModifier from './trash-modifier';
import { pluginNamespace } from '../../utils';

registerPlugin( `${ pluginNamespace }-revision-indicator`, {
	render: RevisionIndicator,
} );

registerPlugin( `${ pluginNamespace }-trash-modifier`, {
	render: TrashModifier,
} );
