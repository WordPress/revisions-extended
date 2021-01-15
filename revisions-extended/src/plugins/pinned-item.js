import { registerPlugin } from '@wordpress/plugins';
import { image } from '@wordpress/icons';


const PinnedItem = () => (
	<button >
        rock & roll </button>
);

registerPlugin( 'pinned-item', { render: PinnedItem, icon: image } );
