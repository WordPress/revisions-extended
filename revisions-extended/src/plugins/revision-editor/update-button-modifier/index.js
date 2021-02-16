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
	useTypes,
} from '../../../hooks';
import { getEditUrl, getAllRevisionUrl } from '../../../utils';

const UpdateButtonModifier = () => {
	const [ singularName, setSingularName ] = useState();
	const [ showSuccess, setShowSuccess ] = useState( false );
	const { setBtnDefaults } = useInterface();
	const { savedPost, didPostSaveRequestSucceed, savePost } = usePost();
	const { type: parentType } = useParentPost();
	const { loaded: loadedTypes, getTypeInfo } = useTypes();
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

	useEffect( () => {
		if ( ! parentType || ! loadedTypes ) return;

		const getSingularName = async () => {
			const labels = await getTypeInfo( parentType, 'labels' );

			// In case something goes wrong, use default
			if ( ! labels || ! labels.singular_name ) {
				setSingularName( __( 'post', 'revisions-extended' ) );
			} else {
				setSingularName( labels.singular_name.toLowerCase() );
			}
		};

		getSingularName();
	}, [ parentType, loadedTypes ] );

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
							singularName
						),
						href: `/?p=${ savedPost.parent }`,
					},
					{
						text: sprintf(
							// translators: %s: post type.
							__( 'Edit original %s.' ),
							singularName
						),
						href: getEditUrl( savedPost.parent ),
					},
					{
						text: sprintf(
							// translators: %s: post type.
							__( 'View all %s updates.' ),
							singularName
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
