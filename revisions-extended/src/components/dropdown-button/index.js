/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { DropdownMenu } from '@wordpress/components';
import { arrowDown } from '@wordpress/icons';

import './index.css';

const UpdateDropdownButton = ( { render } ) => {
	return (
		<div className="revisions-extended-dropdown-btn">
			<DropdownMenu
				className="revisions-extended-dropdown-btn-toggle"
				icon={ arrowDown }
				label={ __( 'Select an action', 'revisions-extended' ) }
			>
				{ ( { onClose } ) => render( { onClose } ) }
			</DropdownMenu>
		</div>
	);
};

export default UpdateDropdownButton;
