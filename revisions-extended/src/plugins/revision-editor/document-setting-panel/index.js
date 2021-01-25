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

			<PanelRow>
				<Revisions />
			</PanelRow>


			<PanelRow>
				<DeleteRevision />
			</PanelRow>

			<PanelRow>
				<PublishRevision />
			</PanelRow>
		</Panel>
	);
};

export default DocumentSettingPanel;
