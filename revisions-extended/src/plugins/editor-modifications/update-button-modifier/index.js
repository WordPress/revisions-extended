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
import { usePost, useScheduledRevision } from '../../../hooks';

/**
 * Module constants
 */
const EDITOR_STORE = 'core/editor';

const PROP_BTN_TEXT = 'btnText';
const PROP_FN_SAVE = 'savePost';
let updateBtnElement;

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

const setSavePostFunction = ( fn ) => {
	dispatch( EDITOR_STORE ).savePost = fn;
};

const setBtnText = () => {
	if ( updateBtnElement ) {
		updateBtnElement.innerText = __(
			'Schedule Revision',
			'revisions-extended'
		);
	}
};

const UpdateButtonModifier = () => {
	const [ showPopup, setShowPopup ] = useState( false );
	const [ newRevision, setNewRevision ] = useState( {} );
	const {
		savedPost,
		changingToScheduled,
		isPublished,
		getEditedPostAttribute,
	} = usePost();
	const { create } = useScheduledRevision();

	updateBtnElement = document.querySelector(
		'.editor-post-publish-button__button'
	);

	const _savePost = async () => {
		const { data, error } = await create( {
			postType: savedPost.type,
			postId: savedPost.id,
			title: getEditedPostAttribute( 'title' ),
			content: getEditedPostAttribute( 'content' ),
		} );

		if ( error ) {
			console.log( 'Error' );
		}

		if ( data ) {
			setNewRevision( data );
			setShowPopup( true );
		}
	};

	console.log( savedPost );

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
	}, [ savedPost ] );

	useEffect( () => {
		let btnText, savePost;
		// We want to intercept when the post is published and changing to a future date
		if ( isPublished && changingToScheduled ) {
			btnText = __( 'Schedule Revision', 'revisions-extended' );
			savePost = _savePost;
		} else {
			btnText = getStashProp( PROP_BTN_TEXT );
			savePost = getStashProp( PROP_FN_SAVE );
		}

		setBtnText( btnText );
		setSavePostFunction( savePost );
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
					<a
						href={ `/wp-admin/post.php?post=${ newRevision.id }&action=edit` }
					>
						Continue editing your
					</a>
					revision.
				</p>
				<p>
					<a href="/revisions">View all your revisions </a>
				</p>
				<p>
					<a href="/revisions">View original post</a>
				</p>
			</Modal>
		);
	}

	return null;
};

export default UpdateButtonModifier;
