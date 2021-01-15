import { registerPlugin } from '@wordpress/plugins';
import { PluginPostStatusInfo } from '@wordpress/edit-post';
 
const PluginPostStatusInfoTest = () => (
    <PluginPostStatusInfo>
        <p>PLUGIN - Post Status Info SlotFill</p>
    </PluginPostStatusInfo>
);
 
registerPlugin( 'post-status-info-test', { render: PluginPostStatusInfoTest } );
