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
		dispatch( 'core/notices' ).createNotice(
			'warning',
			`You are currently editing a <b>scheduled revision</b>. <a href="/wp-admin/post.php?post=${ savedPost.parent }&action=edit">View original post</a>.`,
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
