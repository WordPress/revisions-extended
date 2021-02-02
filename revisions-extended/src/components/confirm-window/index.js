/**
 * WordPress dependencies
 */
import { Modal, __experimentalText as Text } from '@wordpress/components';

import { useInterface, usePost } from '../../hooks';
import './index.css';

const ConfirmWindow = ( { title, notice, links } ) => {
	const { savedPost } = usePost();
	const { clearLocalChanges } = useInterface();

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
					Next Steps
				</Text>
				<Text as="h4">Select of on the following actions:</Text>
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
