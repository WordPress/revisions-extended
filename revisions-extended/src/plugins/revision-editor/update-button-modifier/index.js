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

const UpdateButtonModifier = () => {
	const [ showSuccess, setShowSuccess ] = useState( false );
	const { setBtnDefaults } = useInterface();
	const { savedPost, didPostSaveRequestSucceed, savePost } = usePost();
	const { publish } = useRevision();

	const _savePost = async () => {
		// Save the post first
		await savePost();

		if ( ! didPostSaveRequestSucceed() ) {
			dispatch( 'core/notices' ).createNotice(
				'error',
				__( 'Error saving update before publish.' )
			);
			return;
		}

		const { data, error } = await publish( savedPost.id );

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
		setBtnDefaults( {
			callback: async () => {
				return await _savePost();
			},
		} );
	}, [] );

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
