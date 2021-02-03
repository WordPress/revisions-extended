/**
 * WordPress dependencies
 */
import { dispatch, useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { pluginCustomPostType } from '../utils';
import {
	POST_STATUS_PENDING,
	POST_STATUS_SCHEDULED,
	GUTENBERG_EDITOR_STORE,
} from '../settings';

export const usePost = () => {
	return useSelect( ( select ) => {
		const store = select( GUTENBERG_EDITOR_STORE );

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
			didPostSaveRequestSucceed: store.didPostSaveRequestSucceed,
			editPost: dispatch( GUTENBERG_EDITOR_STORE ).editPost,
		};
	}, [] );
};
