/**
 * WordPress Dependencies
 */
import { useEffect } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { dispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */

import { useParentPost, useTypes } from '../../../hooks';
import { WP_PUBLISH_STATUS } from '../../../settings';

const NotPublishableIndicator = () => {
	const { type, status } = useParentPost();
	const { loaded: loadedTypes, getTypeInfo } = useTypes();

	useEffect( () => {
		if ( ! type || ! loadedTypes ) return;

		if ( status !== WP_PUBLISH_STATUS ) {
			const typeInfo = getTypeInfo( `${ type }.labels.singular_name` ).toLowerCase();

			dispatch( 'core/notices' ).createErrorNotice(
				[
					sprintf(
						// translators: %s is the singular label of a post type.
						__( 'The original %s is not published.', 'revisions-extended' ),
						typeInfo
					),
					sprintf(
						// translators: %s is the singular label of a post type.
						__(
							"You can edit this update but it can't be published until the original %s is live.",
							'revisions-extended'
						),
						typeInfo
					),
				].join( ' ' )
			);
		}
	}, [ type, loadedTypes ] );

	return null;
};

export default NotPublishableIndicator;
