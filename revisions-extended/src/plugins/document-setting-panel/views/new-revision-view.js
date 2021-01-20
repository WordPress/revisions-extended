/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';

const NewRevisionView = ( { onBtnClick } ) => {
	return (
		<Button isPrimary isBusy={ true } onClick={ onBtnClick }>
			{ __( 'Schedule Revision', 'revisions-extended' ) }
		</Button>
	);
};

export default NewRevisionView;
