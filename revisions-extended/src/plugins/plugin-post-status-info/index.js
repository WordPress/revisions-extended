/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { registerPlugin } from '@wordpress/plugins';
import { PluginPostStatusInfo } from '@wordpress/edit-post';

/**
 * Internal dependencies
 */
import { WarningMessage } from '../../components';
import { pluginNamespace } from '../../utils';
import { usePost } from '../../hooks';
import './index.css';

const COMPONENT_NAMESPACE = `${ pluginNamespace }-post-status`;

const OurPluginPostStatusInfo = () => {
	const { changingToScheduled } = usePost();

	if ( ! changingToScheduled ) {
		return null;
	}

	return (
		<PluginPostStatusInfo>
			<WarningMessage>
				{ __(
					'You have selected a date in the future.',
					'revisions-extended'
				) }
			</WarningMessage>
		</PluginPostStatusInfo>
	);
};

registerPlugin( COMPONENT_NAMESPACE, {
	render: OurPluginPostStatusInfo,
} );
