/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Notice } from '@wordpress/components';

/**
 * Internal dependencies
 */
import './min-date.css';

const MinDateNotice = () => (
	<Notice
		className="revisions-extended-min-date-notice"
		status="warning"
		isDismissible={ false }
	>
		{ __( 'The date must be in the future.', 'revisions-extended' ) }
	</Notice>
);

export default MinDateNotice;
