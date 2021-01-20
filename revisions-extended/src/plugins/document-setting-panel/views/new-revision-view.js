/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';

const NewRevisionView = ( { onBtnClick, isBusy } ) => {
	return (
		<Button isPrimary isBusy={ isBusy } onClick={ onBtnClick }>
			{ __( 'Schedule Revision', 'revisions-extended' ) }
		</Button>
	);
};

export default NewRevisionView;
