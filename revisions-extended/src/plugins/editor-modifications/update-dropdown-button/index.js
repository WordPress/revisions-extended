/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { select, dispatch } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import { MenuGroup, MenuItem } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { DropDownButton } from '../../../components';
import {
	GUTENBERG_EDIT_POST_STORE,
	GUTENBERG_INTERFACE_STORE,
} from '../../../settings';
import { CREATE_SIDEBAR_NAME } from '../create-sidebar';
import { PLUGIN_NAME } from '../index';
import { insertButton } from '../../../utils';
import { useInterface } from '../../../hooks';

const UpdateDropdownButton = () => {
	const { setState } = useInterface();

	useEffect( () => {
		insertButton(
			<DropDownButton
				render={ ( { onClose } ) => (
					<MenuGroup>
						<MenuItem
							info={ __(
								'Schedule update for a specific time',
								'revisions-extended'
							) }
							onClick={ () => {
								onClose();

								// If the sidebar was open, we'll want to reopen it if they close
								setState( {
									activeComplementaryAreaBefore: select(
										GUTENBERG_INTERFACE_STORE
									).getActiveComplementaryArea(
										'core/edit-post'
									),
								} );

								dispatch(
									GUTENBERG_EDIT_POST_STORE
								).openGeneralSidebar(
									`${ PLUGIN_NAME }/${ CREATE_SIDEBAR_NAME }`
								);
							} }
						>
							{ __( 'Save for later', 'revisions-extended' ) }
						</MenuItem>
					</MenuGroup>
				) }
			/>
		);
	}, [] );

	return null;
};

export default UpdateDropdownButton;
