/**
 * WordPress dependencies
 */
import { useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { PluginPostStatusInfo as PostStatusInfo } from '@wordpress/edit-post';
import { CheckboxControl } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { useInterface, usePost } from '../../../hooks';

const PluginPostStatusInfo = () => {
	const { shouldIntercept, setShouldIntercept } = useInterface();
	const { changingToScheduled } = usePost();

	const isChangingToScheduled = changingToScheduled();

	useEffect( () => {
		// We want to update the checkbox if the date is moving into the future.
		if ( shouldIntercept !== isChangingToScheduled ) {
			setShouldIntercept( isChangingToScheduled );
		}
	}, [ isChangingToScheduled ] );

	return (
		<PostStatusInfo>
			<CheckboxControl
				label={ __( 'Create future update' ) }
				checked={ shouldIntercept }
				onChange={ setShouldIntercept }
			/>
		</PostStatusInfo>
	);
};

export default PluginPostStatusInfo;
