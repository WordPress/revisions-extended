/**
 * WordPress dependencies
 */
import {
	PluginSidebar as Sidebar,
	PluginSidebarMoreMenuItem,
} from '@wordpress/edit-post';
import { PanelRow, PanelBody } from '@wordpress/components';
import { PostExcerpt, BlockInspector } from '@wordpress/editor';
import { cog } from '@wordpress/icons';
import { Fragment } from '@wordpress/element';

const PluginSidebar = () => {
	return (
		<Fragment>
			<PluginSidebarMoreMenuItem target="sidebar-name" icon={ cog }>
				Expanded Sidebar - More item
			</PluginSidebarMoreMenuItem>
			<Sidebar name="sidebar-name" icon={ cog } title="My Sidebar">
				<PanelBody>
					<PanelRow>
						A whole bunch of stuff for managing a revision
					</PanelRow>
					<PostExcerpt />
					<BlockInspector />
				</PanelBody>
			</Sidebar>
		</Fragment>
	);
};

export default PluginSidebar;
