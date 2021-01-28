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
import './index.css';

const PluginPostStatusInfo = () => {
	const { shouldCreateRevision, setShouldCreateRevision } = useInterface();

	return (
		<PostStatusInfo>
			<CheckboxControl
				label={ __( 'Create new revision', 'revisions-extended' ) }
				checked={ shouldCreateRevision }
				onChange={ setShouldCreateRevision }
			/>
		</PostStatusInfo>
	);
};

export default PluginPostStatusInfo;
