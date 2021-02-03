/**
 * WordPress dependencies
 */
import { dispatch, useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { pluginCustomPostType } from '../utils';

import { POST_STATUS_PENDING, POST_STATUS_SCHEDULED } from './revision';

/**
 * Module constants
 */
const EDITOR_STORE = 'core/editor';

export const usePost = () => {
	return useSelect( ( select ) => {
		const store = select( EDITOR_STORE );

		const postType = store.getEditedPostAttribute( 'type' );
		const postStatus = store.getEditedPostAttribute( 'status' );
		const isRevision =
			postType === pluginCustomPostType &&
			( postStatus === POST_STATUS_PENDING ||
				postStatus === POST_STATUS_SCHEDULED );

		return {
			isRevision,
			isPublished: store.isCurrentPostPublished(),
			isSavingPost: store.isSavingPost(),

			changingToScheduled: store.isEditedPostBeingScheduled(),
			savedPost: store.getCurrentPost(),
			content: store.getEditedPostContent(),
			getEditedPostAttribute: store.getEditedPostAttribute,
			getCurrentPostAttribute: store.getCurrentPostAttribute,
			editPost: dispatch( EDITOR_STORE ).editPost,
		};
	}, [] );
};
