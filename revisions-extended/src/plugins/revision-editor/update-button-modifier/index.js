/**
 * External dependencies
 */
import { useEffect, useState } from 'react';

/**
 * WordPress dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import { dispatch } from '@wordpress/data';
import { Notice } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { ConfirmWindow } from '../../../components';
import { usePost, useRevision, useInterface } from '../../../hooks';
import { getEditUrl, getAllRevisionUrl } from '../../../utils';

/**
 * Module constants
 */
const PROP_BTN_TEXT = 'btnText';
const PROP_FN_SAVE = 'savePost';

const UpdateButtonModifier = () => {
	const [ showSuccess, setShowSuccess ] = useState( false );
	const {
		shouldIntercept,
		setBtnText,
		setSavePostFunction,
		getStashProp,
	} = useInterface();
	const { savedPost, didPostSaveRequestSucceed } = usePost();
	const { publish } = useRevision();

	const _savePost = async ( gutenbergProps ) => {
		if ( gutenbergProps && gutenbergProps.isAutosave ) {
			return;
		}

		// Save the post first
		// Grab the default Gutenberg function
		const savePost = getStashProp( PROP_FN_SAVE );

		await savePost();

		if ( ! didPostSaveRequestSucceed() ) {
			dispatch( 'core/notices' ).createNotice(
				'error',
				__( 'Error saving update before publish.' )
			);
			return;
		}

		const { data, error } = await publish( {
			postId: savedPost.parent,
			postType: 'post',
			revisionId: savedPost.id,
		} );

		if ( data ) {
			setShowSuccess( true );
		}

		if ( error ) {
			dispatch( 'core/notices' ).createNotice(
				'error',
				__( 'Error publishing revision.' )
			);
		}
	};

	useEffect( () => {
		let btnText = getStashProp( PROP_BTN_TEXT );
		let savePost = getStashProp( PROP_FN_SAVE );

		if ( shouldIntercept ) {
			btnText = __( 'Publish' );
			savePost = _savePost;
		}

		if ( btnText ) {
			setBtnText( btnText );
		}

		if ( savePost ) {
			setSavePostFunction( savePost );
		}
	}, [ shouldIntercept ] );

	if ( showSuccess ) {
		return (
			<ConfirmWindow
				title={ __( 'Revisions Extended' ) }
				notice={
					<Notice status="success" isDismissible={ false }>
						{ __( 'Successfully published your update.' ) }
					</Notice>
				}
				links={ [
					{
						text: __( 'View published post.' ),
						href: `/?p=${ savedPost.parent }`,
					},
					{
						text: __( 'Edit original post.' ),
						href: getEditUrl( savedPost.parent ),
					},
					{
						text: sprintf(
							// translators: %s: post type.
							__( 'View all %s updates.' ),
							savedPost.type
						),
						href: getAllRevisionUrl( savedPost.type ),
					},
				] }
			/>
		);
	}

	return null;
};

export default UpdateButtonModifier;
