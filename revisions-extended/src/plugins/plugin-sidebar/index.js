import { registerPlugin } from '@wordpress/plugins';
import { PluginSidebar, PluginSidebarMoreMenuItem } from '@wordpress/edit-post';
import { PanelBody } from '@wordpress/components';
import { PostExcerpt } from '@wordpress/editor';
import { cog } from '@wordpress/icons';
import { Fragment } from '@wordpress/element';

const PluginSidebarMoreMenuItemTest = () => (
	<Fragment>
		<PluginSidebarMoreMenuItem target="sidebar-name" icon={cog}>
			Expanded Sidebar - More item
		</PluginSidebarMoreMenuItem>
		<PluginSidebar name="sidebar-name" icon={cog} title="My Sidebar">
			<PanelBody>
				<PostExcerpt />
			</PanelBody>
		</PluginSidebar>
	</Fragment>
);

// registerPlugin('plugin-sidebar-expanded-test', {
// 	render: PluginSidebarMoreMenuItemTest,
// });
