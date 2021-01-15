import { registerPlugin } from '@wordpress/plugins';
import { PluginMoreMenuItem } from '@wordpress/edit-post';
import { image } from '@wordpress/icons';

const MyButtonMoreMenuItemTest = () => (
	<PluginMoreMenuItem
		icon={ image }
		onClick={ () => {

                const m = wp.data.dispatch( 'core/interface' ).pinItem( 'core/edit-post', 'pinned-item' );

                console.log( m );
 
		} }
	>
		PLUGIN - More Menu Item
	</PluginMoreMenuItem>
);

registerPlugin( 'more-menu-item-test', { render: MyButtonMoreMenuItemTest } );
