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

import { usePost, POST_STATUS_SCHEDULED } from '../../../hooks';

const RevisionIndicator = () => {
	const { savedPost } = usePost();

	const getRevisionType =
		savedPost.status === POST_STATUS_SCHEDULED
			? __( 'scheduled', 'revisions-extended' )
			: __( 'pending', 'revisions-extended' );

	const notes = [
		`You are currently editing a <b>${ getRevisionType } revision</b>.`,
		`[ <a href="/wp-admin/post.php?post=${ savedPost.parent }&action=edit">View post</a>`,
		` | <a href="/wp-admin/revision.php?revision=${ savedPost.id }&gutenberg=true" />See changes</a> ]`,
	];

	useEffect( () => {
		dispatch( 'core/notices' ).createNotice( 'warning', notes.join( ' ' ), {
			__unstableHTML: true,
			id: 'revisions-extended-notice',
			isDismissible: false,
		} );
	}, [] );

	return null;
};

export default RevisionIndicator;
