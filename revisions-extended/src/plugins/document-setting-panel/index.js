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

const COMPONENT_NAMESPACE = `${ pluginNamespace }-document-slot`;

const PluginDocumentSettingPanelDemo = () => {
	const [ createSuccess, setCreateSuccess ] = useState( false );
	const [ createFail, setCreateFail ] = useState( false );
	const [ createIsBusy, setCreateIsBusy ] = useState();
	const { content, post, isPublished, isRevision } = usePost();
	const { createRevision, updateRevision } = useRevision();

	if ( ! isPublished ) {
		return null;
	}

	const btnClickHandler = async ( fn, props ) => {
		setCreateIsBusy( true );
		const { error } = await fn( props );
		if ( error ) {
			setCreateFail( true );
		} else {
			setCreateSuccess( true );
		}
		setCreateIsBusy( false );
	};

	return (
		<PluginDocumentSettingPanel
			name={ COMPONENT_NAMESPACE }
			title={ pluginName }
			className={ COMPONENT_NAMESPACE }
		>
			<PanelRow>Date: { format( 'r', post.date ) }</PanelRow>
			{ createSuccess && (
				<SuccessMessage>
					{ __(
						'Successfully updated revision.',
						'revisions-extended'
					) }
				</SuccessMessage>
			) }
			{ createFail && (
				<ErrorMessage>
					{ __( 'Failed to update revision.', 'revisions-extended' ) }
				</ErrorMessage>
			) }
			<PanelRow>
				{ isRevision ? (
					<Button
						isPrimary
						isBusy={ createIsBusy }
						onClick={ async () =>
							btnClickHandler( updateRevision, {
								postType: post.type,
								postId: post.parent,
								date: post.date,
								revisionId: post.id,
								content,
							} )
						}
					>
						{ __( 'Update Revision', 'revisions-extended' ) }
					</Button>
				) : (
					<Button
						isPrimary
						isBusy={ createIsBusy }
						onClick={ async () =>
							btnClickHandler( createRevision, {
								postType: post.type,
								postId: post.id,
								date: post.date,
								content,
							} )
						}
					>
						{ __( 'Schedule Revision', 'revisions-extended' ) }
					</Button>
				) }
			</PanelRow>
		</PluginDocumentSettingPanel>
	);
};

registerPlugin( COMPONENT_NAMESPACE, {
	render: PluginDocumentSettingPanelDemo,
} );
