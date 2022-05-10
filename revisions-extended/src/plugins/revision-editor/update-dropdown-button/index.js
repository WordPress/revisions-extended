/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { dispatch } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import { MenuGroup, MenuItem } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { DropDownButton } from '../../../components';
import { useInterface, useParentPost, usePost, useRevision } from '../../../hooks';
import { insertButton } from '../../../utils';
import { WP_PUBLISH_STATUS } from '../../../settings';

const UpdateDropdownButton = () => {
	const { savedPost, didPostSaveRequestSucceed, savePost } = usePost();
	const { publish } = useRevision();
	const { setState } = useInterface();
	const { status: parentStatus } = useParentPost();

	const _savePost = async () => {
		// Save the post first
		await savePost();

		if ( ! didPostSaveRequestSucceed() ) {
			dispatch( 'core/notices' ).createNotice(
				'error',
				__( 'Error saving update before publish.', 'revisions-extended' )
			);
			return;
		}

		const { data, error } = await publish( savedPost.id );

		if ( data ) {
			setState( {
				showSuccess: true,
			} );
		}

		if ( error ) {
			dispatch( 'core/notices' ).createNotice(
				'error',
				__( 'Error publishing revision.', 'revisions-extended' )
			);
		}
	};

	useEffect( () => {
		insertButton(
			<DropDownButton
				render={ ( { onClose } ) => (
					<MenuGroup>
						<MenuItem
							info={ __( 'Apply these changes immediately', 'revisions-extended' ) }
							onClick={ async () => {
								onClose();
								await _savePost();
							} }
							disabled={ parentStatus !== WP_PUBLISH_STATUS }
						>
							{ __( 'Publish now', 'revisions-extended' ) }
						</MenuItem>
					</MenuGroup>
				) }
			/>
		);
	}, [ parentStatus ] );

	return null;
};

export default UpdateDropdownButton;
