/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Modal, __experimentalText as Text } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { usePost } from '../../hooks';
import { clearLocalChanges } from '../../utils';
import './index.css';

const ConfirmWindow = ( { title, notice, links } ) => {
	const { savedPost } = usePost();

	const onLeave = ( e ) => {
		e.preventDefault();

		// Clear out any weird autosaves.
		clearLocalChanges( savedPost.id );

		window.location.href = e.target.href;
	};

	return (
		<Modal
			title={ title }
			icons="plugins"
			isDismissible={ false }
			className="confirm-window"
		>
			{ notice }
			<div className="confirm-window__content">
				<Text variant="title.small" as="h3">
					{ __( 'Next Steps', 'revisions-extended' ) }
				</Text>
				<Text as="h4">
					{ __(
						'Select one of the following actions:',
						'revisions-extended'
					) }
				</Text>
				<ul>
					{ links.map( ( i ) => (
						<li key={ i.href }>
							<a href={ i.href } onClick={ onLeave }>
								{ i.text }
							</a>
						</li>
					) ) }
				</ul>
			</div>
		</Modal>
	);
};

export default ConfirmWindow;
