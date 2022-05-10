/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';

/**
 * Updates the button text for the revision page
 */
addFilter( 'i18n.gettext', 'revision-extended/update-btn-text', ( translation, text ) => {
	if ( text === 'Schedule' ) {
		return __( 'Update', 'revisions-extended' );
	}

	if ( text === 'Scheduling…' ) {
		return __( 'Update…', 'revisions-extended' );
	}

	return translation;
} );
