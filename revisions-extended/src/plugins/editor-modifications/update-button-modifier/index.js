/**
 * External dependencies
 */
import { useEffect, useState } from 'react';

/**
 * WordPress dependencies
 */
import { Modal } from '@wordpress/components';
import { subscribe, select, dispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { pluginNamespace } from '../../../utils';
import { usePost } from '../../../hooks';

/**
 * Module constants
 */
const COMPONENT_NAMESPACE = `${ pluginNamespace }-document-update-button-modifier`;
const EDITOR_STORE = 'core/editor';
const REDIRECT_URL = 'google.com';

/**
 * Return whether the post has been edited and not saved yet.
 * @returns {bool}
 */
const postIsDirty = () => {
	return select( EDITOR_STORE ).isEditedPostDirty();
};

/**
 * Update properties on post object.
 * @param {Object} postProps
 */
const updatePost = ( postProps ) => {
	return select( EDITOR_STORE ).editPost( postProps );
};

/**
 * Overrides Gutenberg `savePost` function.
 */
const overrideGutenbergSavePost = () => {
	// We can override the editor function as an option
	dispatch( EDITOR_STORE ).savePost = () => {
		console.log( 'We have interception.' );
	};
};

/**
 * Redirects user to different page
 */
const redirectUser = () => {
	window.location.href = REDIRECT_URL;
};

const UpdateButtonModifier = () => {
	const [ prevIsSaving, setIsSaving ] = useState( false );
	const [ showPopup, setShowPopup ] = useState( false );

    const { changingToScheduled, isPublished } = usePost();
   
	const isSaving = select( EDITOR_STORE ).isSavingPost();
	useEffect( () => {
		// This will only make sense if we intercept in the backend and stop the publishing.
		const saveSuccess = select( EDITOR_STORE ).didPostSaveRequestSucceed();

		// I wonder if there's a better way to see if it just saved.
		if ( prevIsSaving && ! isSaving && saveSuccess ) {
			// We can automatically redirect
			// redirectUser();

			// We can also just open a window for more context
			setShowPopup( true );
		}

		setIsSaving( true );
    }, [ isSaving ] );
    
    	// only modify if changing published to scheduled.
	if ( ! isPublished || ! changingToScheduled ) {
		return null;
	}

	// We can listen to the state and update things as necessary
	subscribe( () => {
		if ( postIsDirty() ) {
			// updatePost({
			//     status: 'something'
			// });
		}
	} );

	if ( showPopup ) {
		return (
			<Modal onRequestClose={ () => setShowPopup( false ) }>
				<div>
					Your revision has been saved. You can edit your revision
					[here] or view all your revisions [here].
				</div>

				<div>// Add some links/buttons</div>
			</Modal>
		);
	}

	return null;
};

export default UpdateButtonModifier; 