/**
 * WordPress dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import { Notice } from '@wordpress/components';
import { Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { ConfirmWindow } from '../../../components';
import { POST_STATUS_SCHEDULED } from '../../../settings';
import {
	getEditUrl,
	getFormattedDate,
	getAllRevisionUrl,
} from '../../../utils';
import { useTypes, useInterface, usePost } from '../../../hooks';

const CreateConfirmWindow = () => {
	const {
		state: { newRevision },
	} = useInterface();
	const { savedPost } = usePost();
	const { getTypeInfo } = useTypes();

	if ( ! newRevision ) {
		return null;
	}

	return (
		<ConfirmWindow
			title="Revisions Extended"
			notice={
				<Notice status="success" isDismissible={ false }>
					{ newRevision.status === POST_STATUS_SCHEDULED ? (
						<Fragment>
							<span>
								{ __(
									'Successfully saved your update for publish on:',
									'revisions-extended'
								) }
							</span>
							<b style={ { display: 'block' } }>
								{ getFormattedDate( newRevision.date ) }
							</b>
						</Fragment>
					) : (
						<span>
							{ __(
								'Successfully saved your update.',
								'revisions-extended'
							) }
						</span>
					) }
				</Notice>
			}
			links={ [
				{
					text: __(
						'Continue editing your update.',
						'revisions-extended'
					),
					href: getEditUrl( newRevision.id ),
				},
				{
					text: sprintf(
						// translators: %s: post type.
						__( 'Edit original %s.', 'revisions-extended' ),
						getTypeInfo(
							`${ savedPost.type }.labels.singular_name`
						).toLowerCase()
					),
					href: getEditUrl( savedPost.id ),
				},
				{
					text: sprintf(
						// translators: %s: post type.
						__( 'View all %s updates.', 'revisions-extended' ),
						getTypeInfo(
							`${ savedPost.type }.labels.singular_name`
						).toLowerCase()
					),
					href: getAllRevisionUrl( savedPost.type ),
				},
			] }
		/>
	);
};

export default CreateConfirmWindow;
