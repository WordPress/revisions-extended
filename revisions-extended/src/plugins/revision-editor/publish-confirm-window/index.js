/**
 * WordPress dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import { Notice } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { ConfirmWindow } from '../../../components';
import { getEditUrl, getAllRevisionUrl } from '../../../utils';
import { usePost, useTypes, useParentPost, useInterface } from '../../../hooks';

const PublishConfirmWindow = () => {
	const { getTypeInfo } = useTypes();
	const { savedPost } = usePost();
	const { type: parentType } = useParentPost();
	const {
		state: { showSuccess },
	} = useInterface();

	if ( ! showSuccess ) {
		return null;
	}

	return (
		<ConfirmWindow
			title={ __( 'Revisions Extended', 'revisions-extended' ) }
			notice={
				<Notice status="success" isDismissible={ false }>
					{ __(
						'Successfully published your update.',
						'revisions-extended'
					) }
				</Notice>
			}
			links={ [
				{
					text: sprintf(
						// translators: %s: post type.
						__( 'View published %s.', 'revisions-extended' ),
						getTypeInfo(
							`${ parentType }.labels.singular_name`
						).toLowerCase()
					),
					href: `/?p=${ savedPost.parent }`,
				},
				{
					text: sprintf(
						// translators: %s: post type.
						__( 'Edit original %s.', 'revisions-extended' ),
						getTypeInfo(
							`${ parentType }.labels.singular_name`
						).toLowerCase()
					),
					href: getEditUrl( savedPost.parent ),
				},
				{
					text: sprintf(
						// translators: %s: post type.
						__( 'View all %s updates.', 'revisions-extended' ),
						getTypeInfo(
							`${ parentType }.labels.singular_name`
						).toLowerCase()
					),
					href: getAllRevisionUrl( parentType ),
				},
			] }
		/>
	);
};

export default PublishConfirmWindow;
