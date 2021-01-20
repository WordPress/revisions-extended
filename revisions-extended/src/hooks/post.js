/**
 * WordPress dependencies
 */
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { pluginCustomPostType } from '../utils';

export const usePost = () => {
	return useSelect( ( select ) => {
		const store = select( 'core/editor' );

		return {
			isRevision:
				store.getEditedPostAttribute( 'type' ) === pluginCustomPostType,
			isPublished: store.isCurrentPostPublished(),
			changingToScheduled: store.isEditedPostBeingScheduled(),
			savedPost: store.getCurrentPost(),
			content: store.getEditedPostContent(),

			getEditedPostAttribute: store.getEditedPostAttribute,
		};
	}, [] );
};
