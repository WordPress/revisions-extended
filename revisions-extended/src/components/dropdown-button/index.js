/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { DropdownMenu } from '@wordpress/components';
import { arrowDown } from '@wordpress/icons';

import './index.scss';

const DropdownButton = ( { render, disabled } ) => {
	return (
		<div className="revisions-extended-dropdown-btn">
			<DropdownMenu
				className="revisions-extended-dropdown-btn-toggle"
				icon={ arrowDown }
				label={ __( 'Select an action', 'revisions-extended' ) }
				toggleProps={ {
					disabled,
				} }
			>
				{ ( { onClose } ) => render( { onClose } ) }
			</DropdownMenu>
		</div>
	);
};

export default DropdownButton;
