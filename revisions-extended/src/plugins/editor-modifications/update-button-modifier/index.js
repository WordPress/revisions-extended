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
import { dispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { usePost, useScheduledRevision, useInterface } from '../../../hooks';
import './index.css';

/**
 * Module constants
 */
const EDITOR_STORE = 'core/editor';
const PROP_BTN_TEXT = 'btnText';
const PROP_FN_SAVE = 'savePost';

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

const getEditUrl = ( postId ) => {
	return `/wp-admin/post.php?post=${ postId }&action=edit`;
};

const UpdateButtonModifier = () => {
	const [ newRevision, setNewRevision ] = useState();
	const { create } = useScheduledRevision();
	const { clearLocalChanges } = useInterface();
	const {
		savedPost,
		changingToScheduled,
		isPublished,
		isSavingPost,
		getEditedPostAttribute,
	} = usePost();

	const _savePost = async () => {
		const { data, error } = await create( {
			postType: savedPost.type,
			postId: savedPost.id,
			date: getEditedPostAttribute( 'date' ),
			title: getEditedPostAttribute( 'title' ),
			excerpt: getEditedPostAttribute( 'excerpt' ),
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
		}
	};

	const onLeave = ( e ) => {
		e.preventDefault();

		// Clear out any weird autosaves.
		clearLocalChanges( savedPost.id );

		window.location.href = e.target.href;
	};

	useEffect( () => {
		if ( ! getStashProp( PROP_FN_SAVE ) ) {
			stashGutenbergData( {
				savePost: dispatch( EDITOR_STORE ).savePost,
			} );
		}

		const btnRef = getBtnElement();

		if ( btnRef && ! getStashProp( PROP_BTN_TEXT ) && ! isSavingPost ) {
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

	if ( newRevision ) {
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
								href={ getEditUrl( newRevision.id ) }
								onClick={ onLeave }
							>
								Continue editing your revision.
							</a>
						</li>
						<li>
							<a href="/revisions" onClick={ onLeave }>
								View all your revisions{ ' ' }
							</a>
						</li>
						<li>
							<a
								href={ getEditUrl( savedPost.id ) }
								onClick={ onLeave }
							>
								Reload original post
							</a>
						</li>
					</ul>
				</div>
			</Modal>
		);
	}

	return null;
};

export default UpdateButtonModifier;
