/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';

const UpdateRevisionView = ( { onBtnClick, isBusy } ) => {
	return (
		<Button isPrimary isBusy={ isBusy } onClick={ onBtnClick }>
			{ __( 'Update Revision', 'revisions-extended' ) }
		</Button>
	);
};

export default UpdateRevisionView;
