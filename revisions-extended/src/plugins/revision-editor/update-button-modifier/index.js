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
import {
	usePost,
	useRevision,
	useInterface,
	useParentPost,
} from '../../../hooks';
import { getEditUrl, getAllRevisionUrl } from '../../../utils';

const UpdateButtonModifier = () => {
	const [ showSuccess, setShowSuccess ] = useState( false );
	const { setBtnDefaults } = useInterface();
	const { savedPost, didPostSaveRequestSucceed, savePost } = usePost();
	const { type: parentType } = useParentPost();
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
						text: sprintf(
							// translators: %s: post type.
							__( 'View published %s.' ),
							parentType
						),
						href: `/?p=${ savedPost.parent }`,
					},
					{
						text: sprintf(
							// translators: %s: post type.
							__( 'Edit original %s.' ),
							parentType
						),
						href: getEditUrl( savedPost.parent ),
					},
					{
						text: sprintf(
							// translators: %s: post type.
							__( 'View all %s updates.' ),
							parentType
						),
						href: getAllRevisionUrl( parentType ),
					},
				] }
			/>
		);
	}

	return null;
};

export default UpdateButtonModifier;
