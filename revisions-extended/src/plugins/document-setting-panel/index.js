/**
 * External dependencies
 */
import { useEffect, useState } from 'react';
import { PluginDocumentSettingPanel } from '@wordpress/edit-post';

/**
 * WordPress dependencies
 */
import { registerPlugin } from '@wordpress/plugins';
import { __ } from '@wordpress/i18n';
import { format } from '@wordpress/date';
import { PanelRow } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { NewRevisionView, UpdateRevisionView } from './views';
import { SuccessMessage, ErrorMessage } from '../../components';
import { pluginName, pluginNamespace } from '../../utils';
import { usePost, useRevision } from '../../hooks';

const COMPONENT_NAMESPACE = `${ pluginNamespace }-document-slot`;

const PluginDocumentSettingPanelDemo = () => {
	const [ revisions, setRevisions ] = useState( [] );
	const [ createSuccess, setCreateSuccess ] = useState( false );
	const [ createFail, setCreateFail ] = useState( false );
	const [ createIsBusy, setCreateIsBusy ] = useState( false );
	const {
		content,
		savedPost,
		getEditedPostAttribute,
		isPublished,
		isRevision,
	} = usePost();
	const {
		createScheduledRevision,
		updateRevision,
		getScheduledRevisions,
	} = useRevision();

	useEffect( () => {
		const getAllRevisions = async () => {
			const { error, data } = await getScheduledRevisions( {
				postType: savedPost.type,
				postId: savedPost.id,
			} );

			if ( error ) {
				// TO DO, we have an error
			} else {
				setRevisions( data );
			}
		};

		if ( savedPost.id ) {
			getAllRevisions();
		}
	}, [] );

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
			{ savedPost.date !== getEditedPostAttribute( 'date' ) && (
				<PanelRow>
					Scheduled for:{ ' ' }
					{ format( 'r', getEditedPostAttribute( 'date' ) ) }
				</PanelRow>
			) }

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

			{ revisions.map( ( i ) => (
				<div key={ i.id }>{ i.slug }</div>
			) ) }

			{ isRevision ? (
				<UpdateRevisionView
					isBusy={ createIsBusy }
					onBtnClick={ async () =>
						btnClickHandler( updateRevision, {
							postType: savedPost.type,
							postId: savedPost.parent,
							date: savedPost.date,
							revisionId: savedPost.id,
							content,
						} )
					}
				/>
			) : (
				<NewRevisionView
					isBusy={ createIsBusy }
					onBtnClick={ async () =>
						btnClickHandler( createScheduledRevision, {
							postType: savedPost.type,
							postId: savedPost.id,
							date: savedPost.date,
							status: 'revex_future',
							content,
						} )
					}
				/>
			) }
		</PluginDocumentSettingPanel>
	);
};

registerPlugin( COMPONENT_NAMESPACE, {
	render: PluginDocumentSettingPanelDemo,
} );
