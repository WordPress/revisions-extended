/**
 * WordPress dependencies
 */
import { DropdownMenu } from '@wordpress/components';
import { arrowDown } from '@wordpress/icons';

import './index.css';

const UpdateDropdownButton = ( { render } ) => {
	return (
		<div className="dropdown-btn">
			<DropdownMenu
				className="dropdown-btn-toggle"
				icon={ arrowDown }
				label="Select a direction"
			>
				{ ( { onClose } ) => render( { onClose } ) }
			</DropdownMenu>
		</div>
	);
};

export default UpdateDropdownButton;
