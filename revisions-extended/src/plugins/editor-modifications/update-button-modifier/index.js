/**
 * External dependencies
 */
import { useEffect, useState } from 'react';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	Modal,
	Notice,
	__experimentalText as Text,
} from '@wordpress/components';
import { select, dispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { usePost, useScheduledRevision } from '../../../hooks';
import './index.css';

/**
 * Module constants
 */
const EDITOR_STORE = 'core/editor';
const PROP_BTN_TEXT = 'btnText';
const PROP_FN_SAVE = 'savePost';

/**
 * Return whether the post has been edited and not saved yet.
 *
 * @return {bool}
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

const getBtnElement = () => {
	return document.querySelector( '.editor-post-publish-button__button' );
};

const setBtnText = ( text ) => {
	const btn = getBtnElement();
	if ( btn && text ) {
		btn.innerText = text;
	}
};

const UpdateButtonModifier = () => {
	const [ showSuccess, setShowSuccess ] = useState( false );
	const [ newRevision, setNewRevision ] = useState( {} );
	const {
		savedPost,
		changingToScheduled,
		isPublished,
		getEditedPostAttribute,
	} = usePost();
	const { create } = useScheduledRevision();

	const _savePost = async () => {
		const { data, error } = await create( {
			postType: savedPost.type,
			postId: savedPost.id,
			date: getEditedPostAttribute( 'date' ),
			title: getEditedPostAttribute( 'title' ),
			content: getEditedPostAttribute( 'content' ),
		} );

		if ( error ) {
			dispatch( 'core/notices' ).createNotice(
				'error',
				__( 'Erroring creating revision.' )
			);
		}

		if ( data ) {
			setNewRevision( data );
			setShowSuccess( true );
		}
	};

	useEffect( () => {
		if ( ! getStashProp( PROP_FN_SAVE ) ) {
			stashGutenbergData( {
				savePost: dispatch( EDITOR_STORE ).savePost,
			} );
		}

		const btnRef = getBtnElement();

		if (
			btnRef &&
			! getStashProp( PROP_BTN_TEXT ) &&
			! select( 'core/editor' ).isSavingPost()
		) {
			stashGutenbergData( {
				btnText: btnRef.innerText,
			} );
		}
	}, [ savedPost ] );

	useEffect( () => {
		let btnText, savePost;

		if ( isPublished && changingToScheduled ) {
			btnText = __( 'Create Revision', 'revisions-extended' );
			savePost = _savePost;
		} else {
			btnText = getStashProp( PROP_BTN_TEXT );
			savePost = getStashProp( PROP_FN_SAVE );
		}

		setBtnText( btnText );
		setSavePostFunction( savePost );
	}, [ isPublished, changingToScheduled ] );

	// only modify if changing published to scheduled.
	if ( showSuccess ) {
		return (
			<Modal
				title="Revisions Extended"
				icons="plugins"
				isDismissible={ false }
				className="update-button-modifier-notice"
			>
				<Notice status="success" isDismissible={ false }>
					Successfully saved your revision.
				</Notice>
				<div className="update-button-modifier-notice__content">
					<Text variant="title.small" as="h3">
						Next Steps
					</Text>
					<Text as="h4">Select of on the following actions:</Text>
					<ul>
						<li>
							<a
								href={ `/wp-admin/post.php?post=${ newRevision.id }&action=edit` }
							>
								Continue editing your revision.
							</a>
						</li>
						<li>
							<a href="/revisions">View all your revisions </a>
						</li>
						<li>
							<a href="/revisions">View original post</a>
						</li>
					</ul>
				</div>
			</Modal>
		);
	}

	return null;
};

export default UpdateButtonModifier;
