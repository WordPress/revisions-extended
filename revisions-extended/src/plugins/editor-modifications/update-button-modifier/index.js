/**
 * External dependencies
 */
import { useEffect, useState } from 'react';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Modal } from '@wordpress/components';
import { select, dispatch } from '@wordpress/data';
import { Icon, check } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import { usePost } from '../../../hooks';

/**
 * Module constants
 */
const EDITOR_STORE = 'core/editor';

const PROP_BTN_TEXT = 'btnText';
const PROP_FN_SAVE = 'savePost';

/**
 * Return whether the post has been edited and not saved yet.
 * @returns {bool}
 */
const postIsDirty = () => {
	return select( EDITOR_STORE ).isEditedPostDirty();
};

const getStashProp = ( prop ) => {
	return window.revisionPluginStash
		? window.revisionPluginStash[ prop ]
		: undefined;
};

const stashGutenbergData = ( data ) => {
	window.revisionPluginStash = {
		...window.revisionPluginStash,
		...data,
	};
};


const UpdateButtonModifier = () => {
	const [ wasPublished, setWasPublished ] = useState( false );
	const [ showPopup, setShowPopup ] = useState( false );

	const { changingToScheduled, isPublished } = usePost();
	const saveSuccess = select( EDITOR_STORE ).didPostSaveRequestSucceed();
	const updateBtnElement = document.querySelector(
		'.editor-post-publish-button__button'
    );
    
    console.log( select( EDITOR_STORE ).getCurrentPost() );

	useEffect( () => {
		if ( ! getStashProp( PROP_FN_SAVE ) ) {
			stashGutenbergData( {
				savePost: dispatch( EDITOR_STORE ).savePost,
			} );
		}

		if ( updateBtnElement && ! getStashProp( PROP_BTN_TEXT ) ) {
			stashGutenbergData( {
				btnText: updateBtnElement.innerText,
			} );
		}
	}, [ select( EDITOR_STORE ).getCurrentPost() ] );

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
		// We want to intercept when the post is published and changing to a future date
		if ( isPublished && changingToScheduled ) {
			updateBtnElement.innerText = __(
				'Schedule Revision',
				'revisions-extended'
			);

			dispatch( EDITOR_STORE ).savePost = () => {
				// Save using apiFetch

                // wp.data.dispatch('core/editor').refreshPost()
				// // Show confirmation
                // setShowPopup( true );
                
                wp.data.dispatch('core').savePost();

		    wp.data.dispatch('core').saveEntityRecord( 'postType', 'page', {
                status: "publish",
                content:'something',
                title: "Banana"
            } );
  

			};
		} else {
			if ( updateBtnElement ) {
				updateBtnElement.innerText = getStashProp( PROP_BTN_TEXT );
			}

			dispatch( EDITOR_STORE ).savePost = getStashProp( PROP_FN_SAVE );
		}
	}, [ isPublished, changingToScheduled ] );

	// only modify if changing published to scheduled.
	if ( showPopup ) {
		return (
			<Modal
				title="Revisions Extended"
				onRequestClose={ () => setShowPopup( false ) }
				icons="plugins"
			>
				<p>
					<Icon icon={ check } /> Successfully save your revision.
				</p>
				<p>
					<a href="/revisions/232">Continue editing your</a>{ ' ' }
					revisions.
				</p>
				<p>
					<a href="/revisions">View all your revisions </a>
				</p>
				<p>
					<a
						href="/revisions"
					>
						View original post
					</a>
				</p>
			</Modal>
		);
	}

	return null;
};

export default UpdateButtonModifier;

