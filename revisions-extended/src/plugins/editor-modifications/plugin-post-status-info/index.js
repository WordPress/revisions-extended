/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { PluginPostStatusInfo as PostStatusInfo } from '@wordpress/edit-post';
import { CheckboxControl } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { useInterface } from '../../../hooks';

const PluginPostStatusInfo = () => {
	const { shouldIntercept, setShouldIntercept } = useInterface();

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
