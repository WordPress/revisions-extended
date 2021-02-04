/**
 * External dependencies
 */
import { useEffect, useState } from 'react';

/**
 * WordPress dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import { Notice } from '@wordpress/components';
import { dispatch } from '@wordpress/data';
import { Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { ConfirmWindow } from '../../../components';
import { usePost, useRevision, useInterface } from '../../../hooks';
import { POST_STATUS_SCHEDULED } from '../../../settings';
import {
	getEditUrl,
	getFormattedDate,
	getAllRevisionUrl,
} from '../../../utils';

const UpdateButtonModifier = () => {
	const [ newRevision, setNewRevision ] = useState();
	const { create } = useRevision();
	const { setBtnDefaults } = useInterface();
	const {
		savedPost,
		changingToScheduled,
		getEditedPostAttribute,
	} = usePost();

	const _savePost = async () => {
		const { data, error } = await create( {
			postType: savedPost.type,
			postId: savedPost.id,
			date: getEditedPostAttribute( 'date' ),
			title: getEditedPostAttribute( 'title' ),
			excerpt: getEditedPostAttribute( 'excerpt' ),
			content: getEditedPostAttribute( 'content' ),
			changingToScheduled: changingToScheduled(),
		} );

		if ( error ) {
			dispatch( 'core/notices' ).createNotice(
				'error',
				__( 'Error creating revision.' )
			);
		}

		if ( data ) {
			setNewRevision( data );
		}
	};

	useEffect( () => {
		setBtnDefaults( {
			callback: async () => {
				return await _savePost();
			},
		} );
	}, [] );

	if ( newRevision ) {
		return (
			<ConfirmWindow
				title="Revisions Extended"
				notice={
					<Notice status="success" isDismissible={ false }>
						{ newRevision.status === POST_STATUS_SCHEDULED ? (
							<Fragment>
								<span>
									{ ' ' }
									{ __(
										'Successfully saved your update for publish on:'
									) }
								</span>
								<b style={ { display: 'block' } }>
									{ getFormattedDate( newRevision.date ) }
								</b>
							</Fragment>
						) : (
							<span>
								{ __( 'Successfully saved your update.' ) }
							</span>
						) }
					</Notice>
				}
				links={ [
					{
						text: __( 'Continue editing your update.' ),
						href: getEditUrl( newRevision.id ),
					},
					{
						text: sprintf(
							// translators: %s: post type.
							__( 'Edit original %s.' ),
							savedPost.type
						),
						href: getEditUrl( savedPost.id ),
					},
					{
						text: sprintf(
							// translators: %s: post type.
							__( 'View all %s updates.' ),
							savedPost.type
						),
						href: getAllRevisionUrl( savedPost.type ),
					},
				] }
			/>
		);
	}

	return null;
};

export default UpdateButtonModifier;
