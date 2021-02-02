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
import { getEditUrl } from '../../../utils';

/**
 * Module Constants
 */
export const NOTICE_ID = 'revisions-extended-notice';

const RevisionIndicator = () => {
	const { savedPost } = usePost();

	const getRevisionType =
		savedPost.status === POST_STATUS_SCHEDULED
			? __( 'scheduled', 'revisions-extended' )
			: __( 'pending', 'revisions-extended' );

	const notes = [
		`You are currently editing a <b>${ getRevisionType } revision</b>.`,
		`[ <a href="${ getEditUrl( savedPost.parent ) }">Edit post</a>`,
		` | <a href="/wp-admin/revision.php?revision=${ savedPost.id }&gutenberg=true" />See changes</a> ]`,
	];

	useEffect( () => {
		dispatch( 'core/notices' ).createNotice( 'warning', notes.join( ' ' ), {
			__unstableHTML: true,
			id: NOTICE_ID,
			isDismissible: false,
		} );
	}, [] );

	return null;
};

export default RevisionIndicator;
