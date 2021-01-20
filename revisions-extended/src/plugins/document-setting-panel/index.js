/**
 * External dependencies
 */
import { PluginDocumentSettingPanel } from '@wordpress/edit-post';

/**
 * WordPress dependencies
 */
import { registerPlugin } from '@wordpress/plugins';
import { PanelRow } from '@wordpress/components';

/**
 * Internal dependencies
 */
import {
	Revisions,
	NewRevision,
	UpdateRevision,
	DeleteRevision,
	PublishRevision,
} from './components';
import { pluginName, pluginNamespace } from '../../utils';
import { usePost } from '../../hooks';

const COMPONENT_NAMESPACE = `${ pluginNamespace }-document-slot`;

const PluginDocumentSettingPanelDemo = () => {
	const { isPublished, isRevision } = usePost();

	if ( ! isPublished ) {
		return null;
	}

	return (
		<PluginDocumentSettingPanel
			name={ COMPONENT_NAMESPACE }
			title={ pluginName }
			className={ COMPONENT_NAMESPACE }
		>
			{ ! isRevision && <NewRevision /> }

			{ isRevision && (
				<PanelRow>
					<Revisions />
				</PanelRow>
			) }

			{ isRevision && (
				<PanelRow>
					<UpdateRevision />
				</PanelRow>
			) }
			{ isRevision && (
				<PanelRow>
					<DeleteRevision />
				</PanelRow>
			) }
			{ isRevision && (
				<PanelRow>
					<PublishRevision />
				</PanelRow>
			) }
		</PluginDocumentSettingPanel>
	);
};

registerPlugin( COMPONENT_NAMESPACE, {
	render: PluginDocumentSettingPanelDemo,
} );
