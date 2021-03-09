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

			changingToScheduled: store.isEditedPostBeingScheduled,
			savedPost: store.getCurrentPost(),
			getEditedPostAttribute: store.getEditedPostAttribute,
			getCurrentPostAttribute: store.getCurrentPostAttribute,
			didPostSaveRequestSucceed: store.didPostSaveRequestSucceed,

			savePost: dispatch( GUTENBERG_EDITOR_STORE ).savePost,
			editPost: dispatch( GUTENBERG_EDITOR_STORE ).editPost,

			/**
			 * Clear the current post edits to avoid triggering dirty state
			 */

			clearPostEdits: async ( savedPost ) => {
				const entity = {
					kind: 'postType',
					name: savedPost.type,
					id: savedPost.id,
				};

				const edits = select( 'core' ).getEntityRecordEdits(
					entity.kind,
					entity.name,
					entity.id
				);

				if ( ! edits ) {
					return;
				}

				const clearedEdits = {};

				// Setting them to undefined will effectively clear them.
				Object.keys( edits ).forEach( ( e ) => {
					clearedEdits[ e ] = undefined;
				} );

				return await dispatch( 'core' ).editEntityRecord(
					entity.kind,
					entity.name,
					entity.id,
					clearedEdits,
					{ undoIgnore: true }
				);
			},
		};
	}, [] );
};
