/**
 * WordPress dependencies
 */
import { useEffect } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { useParentPost } from '../../../hooks';
import { getAllRevisionUrl } from '../../../utils';

/**
 * Module variables
 */

let wpButtonElement;

/**
 * Returns the WP button element
 *
 * @return {HTMLElement} Html anchor tag.
 */
const getWPButton = () => {
	if ( wpButtonElement ) return wpButtonElement;

	return document.querySelector( '.edit-post-fullscreen-mode-close' );
};

const WPButtonModifier = () => {
	const { type } = useParentPost();

	useEffect( () => {
		if ( ! type ) return;
		const btn = getWPButton();

		if ( btn ) {
			btn.href = getAllRevisionUrl( type );
		}
	} );

	return null;
};

export default WPButtonModifier;
