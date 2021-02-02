/**
 * External dependencies
 */
import { useEffect, useState } from 'react';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Notice } from '@wordpress/components';
import { dispatch } from '@wordpress/data';
import { Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { ConfirmWindow } from '../../../components';
import {
	usePost,
	useRevision,
	useInterface,
	POST_STATUS_SCHEDULED,
} from '../../../hooks';
import {
	getEditUrl,
	getFormattedDate,
	getAllRevisionUrl,
} from '../../../utils';

/**
 * Module constants
 */
const PROP_BTN_TEXT = 'btnText';
const PROP_FN_SAVE = 'savePost';

const UpdateButtonModifier = () => {
	const [ newRevision, setNewRevision ] = useState();
	const { create } = useRevision();
	const {
		shouldIntercept,
		setBtnText,
		setSavePostFunction,
		getStashProp,
	} = useInterface();
	const {
		savedPost,
		changingToScheduled,
		isPublished,
		getEditedPostAttribute,
	} = usePost();

	const _savePost = async ( gutenbergProps ) => {
		if ( gutenbergProps && gutenbergProps.isAutosave ) {
			return;
		}

		const { data, error } = await create( {
			postType: savedPost.type,
			postId: savedPost.id,
			date: getEditedPostAttribute( 'date' ),
			title: getEditedPostAttribute( 'title' ),
			excerpt: getEditedPostAttribute( 'excerpt' ),
			content: getEditedPostAttribute( 'content' ),
			changingToScheduled,
		} );

		if ( error ) {
			dispatch( 'core/notices' ).createNotice(
				'error',
				__( 'Error creating revision.' )
			);
		}

		if ( data ) {
			setNewRevision( data );
		}
	};

	useEffect( () => {
		let btnText, savePost;

		if ( shouldIntercept ) {
			btnText = __( 'Create Revision', 'revisions-extended' );
			savePost = _savePost;
		} else {
			btnText = getStashProp( PROP_BTN_TEXT );
			savePost = getStashProp( PROP_FN_SAVE );
		}

		setBtnText( btnText );
		setSavePostFunction( savePost );
	}, [ isPublished, changingToScheduled, shouldIntercept ] );

	if ( newRevision ) {
		return (
			<ConfirmWindow
				title="Revisions Extended"
				notice={
					<Notice status="success" isDismissible={ false }>
						{ newRevision.status === POST_STATUS_SCHEDULED ? (
							<Fragment>
								<span>
									Successfully saved your revision for publish
									on:
								</span>
								<b style={ { display: 'block' } }>
									{ getFormattedDate( newRevision.date ) }
								</b>
							</Fragment>
						) : (
							<span>Successfully saved your revision.</span>
						) }
					</Notice>
				}
				links={ [
					{
						text: 'Continue editing your update.',
						href: getEditUrl( newRevision.id ),
					},
					{
						text: `Reload original ${ savedPost.type }.`,
						href: getEditUrl( savedPost.id ),
					},
					{
						text: `View all ${ savedPost.type } updates.`,
						href: getAllRevisionUrl( savedPost.type ),
					},
				] }
			/>
		);
	}

	return null;
};

export default UpdateButtonModifier;
