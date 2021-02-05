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

const PluginPostStatusCheckbox = () => {
	const { shouldIntercept, setShouldIntercept } = useInterface();

	return (
		<PostStatusInfo>
			<CheckboxControl
				label={ __( 'Publish immediately' ) }
				checked={ shouldIntercept }
				onChange={ setShouldIntercept }
			/>
		</PostStatusInfo>
	);
};

export default PluginPostStatusCheckbox;
