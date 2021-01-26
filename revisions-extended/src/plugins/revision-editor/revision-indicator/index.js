/**
 * External dependencies
 */
import { useEffect } from 'react';

/**
 * WordPress Dependencies
 */
import { __ } from '@wordpress/i18n';
import { dispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */

import { usePost } from '../../../hooks';

const RevisionIndicator = () => {
	const { savedPost } = usePost();

	useEffect( () => {
		dispatch( 'core/notices' ).createNotice(
			'warning',
			__(
				`You are currently editing a revision for post #${ savedPost.slug }`
			),
			{
				id: 'revisions-extended-notice',
				isDismissible: false,
			}
		);
	}, [] );

	return null;
};

export default RevisionIndicator;
