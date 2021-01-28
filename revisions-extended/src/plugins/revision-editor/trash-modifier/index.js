/**
 * WordPress Dependencies
 */
import { __ } from '@wordpress/i18n';
import { dispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { useScheduledRevision, usePost } from '../../../hooks';

/**
 * Module constants
 */
const GUTENBERG_TRASH_BTN_CLASS = '.editor-post-trash';
const GUTENBERG_BUSY_CLASS = 'is-busy';

const TrashModifier = () => {
	const { trash } = useScheduledRevision();
	const { getEditedPostAttribute } = usePost();

	dispatch( 'core/editor' ).trashPost = async () => {
		const trashBtnElement = document.querySelector(
			GUTENBERG_TRASH_BTN_CLASS
		);

		trashBtnElement.classList.add( GUTENBERG_BUSY_CLASS );

		const { data, error } = await trash( getEditedPostAttribute( 'id' ) );

		trashBtnElement.classList.remove( GUTENBERG_BUSY_CLASS );

		if ( error ) {
			dispatch( 'core/notices' ).createNotice(
				'error',
				__( 'Error deleting revision' ),
				{
					id: 'revisions-extended-delete-notice',
				}
			);
		}

		if ( data ) {
			window.history.back();
		}
	};

	return null;
};

export default TrashModifier;
