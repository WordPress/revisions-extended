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
import { GUTENBERG_EDIT_POST_STORE } from '../../../settings';
import { CREATE_SIDEBAR_NAME } from '../create-sidebar';
import { PLUGIN_NAME } from '../index';
import { insertButton } from '../../../utils';

const UpdateDropdownButton = () => {
	useEffect( () => {
		insertButton(
			<DropDownButton
				render={ ( { onClose } ) => (
					<MenuGroup>
						<MenuItem
							info={ __(
								'Publish on a specific date',
								'revisions-extended'
							) }
							onClick={ () => {
								onClose();
								dispatch(
									GUTENBERG_EDIT_POST_STORE
								).openGeneralSidebar(
									`${ PLUGIN_NAME }/${ CREATE_SIDEBAR_NAME }`
								);
							} }
						>
							{ __( 'Schedule update', 'revisions-extended' ) }
						</MenuItem>
					</MenuGroup>
				) }
			/>
		);
	}, [] );

	return null;
};

export default UpdateDropdownButton;
