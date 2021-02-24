/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { CheckboxControl } from '@wordpress/components';

const PostStatusPublishCheckbox = ( { toggled, onToggle } ) => {
	return (
		<CheckboxControl
			label={ __( 'Publish immediately', 'revisions-extended' ) }
			checked={ toggled }
			onChange={ onToggle }
		/>
	);
};

export default PostStatusPublishCheckbox;
