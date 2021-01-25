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
import { NewRevision } from '../../../components';

/**
 * Module constants
 */
const COMPONENT_NAMESPACE = `${ pluginNamespace }-document-update-button-modifier`;
const EDITOR_STORE = 'core/editor';
const REDIRECT_URL = 'google.com';


	// // We can listen to the state and update things as necessary
	// subscribe( () => {
	// 	if ( postIsDirty() ) {
	// 		// updatePost({
	// 		//     status: 'something'
	// 		// });
	// 	}
	// } );



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

const getStashedSaveFunction = () => {
	return window.gutenbergOriginalSaveFunction;
};

const stashSaveFunction = () => {
	window.gutenbergOriginalSaveFunction = dispatch( EDITOR_STORE ).savePost;
};

const UpdateButtonModifier = () => {
	const [ wasPublished, setWasPublished ] = useState( false );
	const [ showPopup, setShowPopup ] = useState( false );

	const { changingToScheduled, isPublished } = usePost();
	const saveSuccess = select( EDITOR_STORE ).didPostSaveRequestSucceed();

	useEffect( () => {
		if (
			wasPublished &&
			! isPublished &&
			changingToScheduled &&
			saveSuccess
		) {
			setShowPopup( true );
		}

		setWasPublished( isPublished );
	}, [ saveSuccess ] );

	useEffect( () => {
		if ( isPublished && changingToScheduled ) {
			dispatch( EDITOR_STORE ).savePost = () => {
				setShowPopup( true );
			};
		} else {
			if ( ! getStashedSaveFunction() ) {
				stashSaveFunction();
			}

			dispatch( EDITOR_STORE ).savePost = getStashedSaveFunction();
		}
	}, [ isPublished, changingToScheduled ] );

	// only modify if changing published to scheduled.
	if ( showPopup ) {
		return (
			<Modal title="Revisions Extended" onRequestClose={ () => setShowPopup( false ) } icons="plugins">
                <p>You have selected a date in the future for a published post.</p>
				<NewRevision/>
			</Modal>
		);
	}

	return null;
};

export default UpdateButtonModifier;
