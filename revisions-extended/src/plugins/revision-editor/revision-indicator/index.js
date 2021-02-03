/**
 * External dependencies
 */
import { useEffect } from 'react';

/**
 * WordPress Dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import { dispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */

import { usePost } from '../../../hooks';
import { POST_STATUS_SCHEDULED } from '../../../settings';
import { getEditUrl } from '../../../utils';

/**
 * Module Constants
 */
export const NOTICE_ID = 'revisions-extended-notice';

const RevisionIndicator = () => {
	const { savedPost } = usePost();

	const getRevisionType =
		savedPost.status === POST_STATUS_SCHEDULED
			? __( 'scheduled' )
			: __( 'pending' );

	const notes = [
		sprintf(
			// translators: %s: post type.
			__( 'You are currently editing a <b>%s update</b>.' ),
			getRevisionType
		),
		`[ <a href="${ getEditUrl( savedPost.parent ) }">${ __(
			'Edit post'
		) }</a>`,
		` | <a href="/wp-admin/revision.php?revision=${
			savedPost.id
		}&gutenberg=true" />${ __( 'See changes' ) }</a> ]`,
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
