/**
 * WordPress dependencies
 */
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { pluginCustomPostType } from '../utils';

/**
 * Overrides Gutenberg `savePost` function.
 */
import { POST_STATUS_PENDING, POST_STATUS_SCHEDULED } from './revision';

export const usePost = () => {
	return useSelect( ( select ) => {
		const store = select( 'core/editor' );

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
		};
	}, [] );
};
