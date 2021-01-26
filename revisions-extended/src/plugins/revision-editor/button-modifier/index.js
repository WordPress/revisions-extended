/**
 * External dependencies
 */
import { useEffect } from 'react';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { usePost } from '../../../hooks';

/**
 * Module constants
 */
const GUTENBERG_BUTTON_CLASS = '.editor-post-publish-button';

const ButtonModifierPlugin = () => {
	const { isRevision } = usePost();
	let updateBtn;

	if ( ! isRevision ) {
		return null;
	}

	const updateButtonText = () => {
		if ( ! updateBtn ) {
			return;
		}
		updateBtn.innerText = __( 'Save Revision', 'revisions-extended' );
	};

	useEffect( () => {
		updateBtn = document.querySelector( GUTENBERG_BUTTON_CLASS );

		updateButtonText();

		const callback = ( mutationsList ) => {
			for ( const mutation of mutationsList ) {
				if ( mutation.type === 'attributes' ) {
					updateButtonText();
				}
			}
		};

		const observer = new MutationObserver( callback );

		observer.observe( updateBtn, { attributes: true } );
	}, [] );

	return null;
};

export default ButtonModifierPlugin;
