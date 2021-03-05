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
import { usePost, useInterface, useRevision } from '../../../hooks';
import { insertButton } from '../../../utils';

const UpdateDropdownButton = () => {
	const { savedPost, didPostSaveRequestSucceed, savePost } = usePost();
	const { publish } = useRevision();
	const { setState } = useInterface();

	const _savePost = async () => {
		// Save the post first
		await savePost();

		if ( ! didPostSaveRequestSucceed() ) {
			dispatch( 'core/notices' ).createNotice(
				'error',
				__(
					'Error saving update before publish.',
					'revisions-extended'
				)
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
							info="Update immediately"
							onClick={ async () => {
								onClose();
								await _savePost();
							} }
						>
							{ __( 'Publish Now', 'revisions-extended' ) }
						</MenuItem>
					</MenuGroup>
				) }
			/>
		);
	}, [] );

	return null;
};

export default UpdateDropdownButton;
