import { registerPlugin } from '@wordpress/plugins';
import { PluginDocumentSettingPanel } from '@wordpress/edit-post';

const PluginDocumentSettingPanelDemo = () => {
	return (
		<PluginDocumentSettingPanel
			name="custom-panel"
			title="Custom Panel"
			className="custom-panel"
		>
			PLUGIN - Custom Panel Contents
		</PluginDocumentSettingPanel>
	);
};

registerPlugin( 'plugin-document-slot', {
	render: PluginDocumentSettingPanelDemo,
} );
