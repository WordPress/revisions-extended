/**
 * External dependencies
 */
import { useState } from 'react';
import { PluginDocumentSettingPanel } from '@wordpress/edit-post';

/**
 * WordPress dependencies
 */
import { registerPlugin } from '@wordpress/plugins';
import { __ } from '@wordpress/i18n';
import { format } from '@wordpress/date';
import { Button, PanelRow } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { SuccessMessage, ErrorMessage } from '../../components';
import { pluginName, pluginNamespace } from '../../utils';
import { usePost, useRevision } from '../../hooks';

const COMPONENT_NAMESPACE = `${pluginNamespace}-document-slot`;

const PluginDocumentSettingPanelDemo = () => {
	const [createSuccess, setCreateSuccess] = useState(false);
	const [createFail, setCreateFail] = useState(false);
	const [createIsBusy, setCreateIsBusy] = useState();
	const { content, post, isPublished, isRevision } = usePost();
	const { createRevision, updateRevision } = useRevision();

	if (!isPublished) {
		return null;
	}

	const btnClickHandler = async (fn, props) => {
		const { error } = await fn(props);

		error ? setCreateFail(true) : setCreateSuccess(true);

		setCreateIsBusy(false);
	};

	return (
		<PluginDocumentSettingPanel
			name={COMPONENT_NAMESPACE}
			title={pluginName}
			className={COMPONENT_NAMESPACE}
		>
			<PanelRow>Date: {format('r', post.date)}</PanelRow>
			{createSuccess && <SuccessMessage>Success</SuccessMessage>}
			{createFail && <ErrorMessage>Failed</ErrorMessage>}

			{isRevision ? (
				<Button
					isPrimary
					isBusy={createIsBusy}
					onClick={async () =>
						btnClickHandler(updateRevision, {
							postType: post.type,
							postId: post.id,
							date: post.date,
							revisionId: 75,
							content,
						})
					}
				>
					{__('Update Revision', pluginNamespace)}
				</Button>
			) : (
				<Button
					isPrimary
					isBusy={createIsBusy}
					onClick={async () =>
						btnClickHandler(createRevision, {
							postType: post.type,
							postId: post.id,
							date: post.date,
							content,
						})
					}
				>
					{__('Schedule Revision', pluginNamespace)}
				</Button>
			)}
		</PluginDocumentSettingPanel>
	);
};

registerPlugin(COMPONENT_NAMESPACE, {
	render: PluginDocumentSettingPanelDemo,
});
