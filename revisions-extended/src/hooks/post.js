/**
 * WordPress dependencies
 */
import { useSelect } from '@wordpress/data';

export const usePost = () => {
	return useSelect((select) => {
		const store = select('core/editor');

		return {
            isRevision: false,
			isPublished: store.isCurrentPostPublished(),
			changingToScheduled: store.isEditedPostBeingScheduled(),
			post: store.getCurrentPost(),
			content: store.getEditedPostContent(),
		};
	}, []);
};
