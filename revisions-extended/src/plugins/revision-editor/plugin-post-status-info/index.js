/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { PluginPostStatusInfo as PostStatusInfo } from '@wordpress/edit-post';

/**
 * Internal dependencies
 */
import { WarningMessage } from '../../../components';
import { usePost } from '../../../hooks';
import './index.css';

const PluginPostStatusInfo = () => {
	const { changingToScheduled, isPublished } = usePost();

	if ( ! isPublished || ! changingToScheduled ) {
		return null;
	}

	return (
		<PostStatusInfo>
			<WarningMessage>
				{ __(
					'You have selected a date in the future.',
					'revisions-extended'
				) }
			</WarningMessage>
		</PostStatusInfo>
	);
};

export default PluginPostStatusInfo;