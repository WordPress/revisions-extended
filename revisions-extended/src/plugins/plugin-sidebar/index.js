/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { registerPlugin } from '@wordpress/plugins';
import { plugins } from '@wordpress/icons';
import { PluginSidebar, PluginSidebarMoreMenuItem } from '@wordpress/edit-post';
import { Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { pluginName, pluginNamespace } from '../../utils';

const COMPONENT_NAMESPACE = `${pluginNamespace}-sidebar`;

const OurPluginSidebar = () => {
	return (
		<Fragment>
			<PluginSidebarMoreMenuItem
				target={COMPONENT_NAMESPACE}
				icon={plugins}
			>
				{pluginName}
			</PluginSidebarMoreMenuItem>
			<PluginSidebar
				name={COMPONENT_NAMESPACE}
				icon={plugins}
				title={pluginName}
			>
				Panel
			</PluginSidebar>
		</Fragment>
	);
};

registerPlugin(COMPONENT_NAMESPACE, { render: OurPluginSidebar });
