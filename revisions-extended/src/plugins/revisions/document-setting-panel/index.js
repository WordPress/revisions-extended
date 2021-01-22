/**
 * External dependencies
 */
import { PluginDocumentSettingPanel as Panel } from '@wordpress/edit-post';

/**
 * WordPress dependencies
 */
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
import { pluginName, pluginNamespace } from '../../../utils';

const COMPONENT_NAMESPACE = `${ pluginNamespace }-document-slot`;

const DocumentSettingPanel = () => {
	return (
		<Panel
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
		</Panel>
	);
};

export default DocumentSettingPanel;
