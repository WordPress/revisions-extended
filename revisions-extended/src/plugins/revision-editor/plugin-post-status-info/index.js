/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { PluginPostStatusInfo as PostStatusInfo } from '@wordpress/edit-post';
import { CheckboxControl } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { useInterface, usePost } from '../../../hooks';

const PluginPostStatusInfo = () => {
	const { shouldIntercept, setShouldIntercept } = useInterface();
	const { getCurrentPostAttribute, editPost } = usePost();

	return (
		<PostStatusInfo>
			<CheckboxControl
				label={ __( 'Publish immediately' ) }
				checked={ shouldIntercept }
				onChange={ ( checked ) => {
					let originalSlug = getCurrentPostAttribute( 'slug' );

					// Make a very superficial change to turn on the publish button.
					if ( checked ) {
						originalSlug = `${ originalSlug } `;
					}

					editPost( {
						slug: originalSlug,
					} );

					setShouldIntercept( checked );
				} }
			/>
		</PostStatusInfo>
	);
};

export default PluginPostStatusInfo;
