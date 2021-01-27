/**
 * External dependencies
 */
import { useEffect } from 'react';

/**
 * WordPress Dependencies
 */
import { dispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */

import { usePost } from '../../../hooks';

const RevisionIndicator = () => {
	const { savedPost } = usePost();

	useEffect( () => {
		const [ id ] = savedPost.slug.split( '-' );
		dispatch( 'core/notices' ).createNotice(
			'warning',
			`You are currently editing a <u>scheduled revision</u> for post #<a href="/wp-admin/post.php?post=${ id }&action=edit">${ id }</a>.`,
			{
				__unstableHTML: true,
				id: 'revisions-extended-notice',
				isDismissible: false,
			}
		);
	}, [] );

	return null;
};

export default RevisionIndicator;
