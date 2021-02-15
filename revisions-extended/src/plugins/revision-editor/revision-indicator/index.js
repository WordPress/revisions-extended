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

import { usePost, useParentPost } from '../../../hooks';
import { POST_STATUS_SCHEDULED } from '../../../settings';
import { getEditUrl, getCompareLink } from '../../../utils';

/**
 * Module Constants
 */
export const NOTICE_ID = 'revisions-extended-notice';

const RevisionIndicator = () => {
	const { savedPost } = usePost();
	const { type: parentType, getLabel } = useParentPost();

	const getRevisionType =
		savedPost.status === POST_STATUS_SCHEDULED
			? __( 'scheduled' )
			: __( 'pending' );

	const notes = [
		sprintf(
			// translators: %s: revision type.
			__( 'You are currently editing a <b>%s update</b>.' ),
			getRevisionType
		),
		sprintf(
			// translators: %1$s: url %2$s: post type.
			__( '[ <a href="%1$s">Edit %2$s</a>.' ),
			getEditUrl( savedPost.parent ),
			getLabel( 'singular_name' ).toLowerCase()
		),
		` | <a href="${ getCompareLink( savedPost.id ) }" />${ __(
			'See changes'
		) }</a> ]`,
	];

	useEffect( () => {
		if ( ! parentType ) return;

		dispatch( 'core/notices' ).createNotice( 'warning', notes.join( ' ' ), {
			__unstableHTML: true,
			id: NOTICE_ID,
			isDismissible: false,
		} );
	}, [ parentType ] );

	return null;
};

export default RevisionIndicator;
