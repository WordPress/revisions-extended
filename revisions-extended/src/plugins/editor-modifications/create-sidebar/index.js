/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';
import { dispatch } from '@wordpress/data';
import { getDate, isInTheFuture } from '@wordpress/date';
import { PluginSidebar } from '@wordpress/edit-post';
import { calendar } from '@wordpress/icons';
import { Button, Flex, FlexItem, Panel, PanelBody, Spinner } from '@wordpress/components';

/**
 * Internal dependencies
 */
import DatePicker from './datepicker';
import { GUTENBERG_EDIT_POST_STORE, GUTENBERG_INTERFACE_STORE } from '../../../settings';
import { useInterface, usePost, useRevision, useTypes } from '../../../hooks';
import { PLUGIN_NAME } from '../index';
import MinDateNotice from './min-date-notice';
import './index.css';

/**
 * Modules constants
 */
export const CREATE_SIDEBAR_NAME = 'create-sidebar';
const POST_AUTOSAVE_LOCK_ID = 'revisions-extended-lock';
const CREATE_SIDEBAR_FULL_NAMESPACE = `${ PLUGIN_NAME }/${ CREATE_SIDEBAR_NAME }`;

const CreateSidebar = () => {
	const [ saving, setSaving ] = useState();
	const [ createDate, setCreateDate ] = useState( getDate() );
	const [ showMinDate, setShowMinDate ] = useState( false );
	const { create } = useRevision();
	const { savedPost, getEditedPostAttribute, clearPostEdits } = usePost();
	const { fetchTypes } = useTypes();
	const {
		state: { activeComplementaryAreaBefore },
		setState,
	} = useInterface();

	useEffect( () => {
		dispatch( GUTENBERG_INTERFACE_STORE ).unpinItem(
			GUTENBERG_EDIT_POST_STORE,
			CREATE_SIDEBAR_FULL_NAMESPACE
		);
	}, [] );

	const closeSidebar = () => {
		if ( activeComplementaryAreaBefore ) {
			dispatch( GUTENBERG_EDIT_POST_STORE ).openGeneralSidebar( activeComplementaryAreaBefore );
		} else {
			dispatch( GUTENBERG_EDIT_POST_STORE ).closeGeneralSidebar( CREATE_SIDEBAR_FULL_NAMESPACE );
		}
	};

	const _savePost = async () => {
		const noticeDispatch = dispatch( 'core/notices' );

		// We have to refetch because the context is obliterated because this function has been associated to the html element.
		const types = await fetchTypes();

		if ( ! types ) {
			noticeDispatch.createNotice(
				'error',
				__( 'Error creating update: missing post type info.', 'revisions-extended' )
			);
		}

		const editorDispatch = dispatch( 'core/editor' );
		// Lock the post autosaves to stop updates.
		await editorDispatch.lockPostAutosaving( POST_AUTOSAVE_LOCK_ID );

		setSaving( true );
		const { data, error } = await create( {
			restBase: types[ savedPost.type ].rest_base,
			postId: savedPost.id,
			date: createDate,
			title: getEditedPostAttribute( 'title' ),
			excerpt: getEditedPostAttribute( 'excerpt' ),
			content: getEditedPostAttribute( 'content' ),
			changingToScheduled: true,
		} );

		setSaving( false );

		if ( error ) {
			noticeDispatch.createNotice( 'error', __( 'Error creating update.', 'revisions-extended' ) );

			await editorDispatch.unlockPostAutosaving( POST_AUTOSAVE_LOCK_ID );
		}

		if ( data ) {
			setState( {
				newRevision: data,
			} );
			closeSidebar();
		}

		await clearPostEdits( savedPost );
	};

	return (
		<PluginSidebar
			name={ CREATE_SIDEBAR_NAME }
			title={ __( 'Save for later', 'revisions-extended' ) }
			icon={ calendar }
			isPinnable={ false }
		>
			{ saving && (
				<Flex align="center" justify="center" className="revisions-extended-sidebar-spinner">
					<Spinner />
				</Flex>
			) }

			{ ! saving && (
				<>
					<Panel>
						<PanelBody>
							<DatePicker
								date={ createDate }
								onChange={ ( date ) => {
									setShowMinDate( false );
									setCreateDate( date );
								} }
							/>
						</PanelBody>
					</Panel>
					<PanelBody>
						{ showMinDate && <MinDateNotice /> }

						<Flex>
							<FlexItem>
								<Button isSecondary onClick={ closeSidebar }>
									{ __( 'Cancel', 'revisions-extended' ) }
								</Button>
							</FlexItem>
							<FlexItem>
								<Button
									isPrimary
									disabled={ ! isInTheFuture( createDate ) }
									onClick={ () => {
										// It's possible that user click the button before the
										// disable state is triggered since the inputs work on blur and the user may not have
										// blurred the input yet
										if ( isInTheFuture( createDate ) ) {
											_savePost();
										} else {
											setShowMinDate( true );
										}
									} }
								>
									{ __( 'Save update', 'revisions-extended' ) }
								</Button>
							</FlexItem>
						</Flex>
					</PanelBody>
				</>
			) }
		</PluginSidebar>
	);
};

export default CreateSidebar;
