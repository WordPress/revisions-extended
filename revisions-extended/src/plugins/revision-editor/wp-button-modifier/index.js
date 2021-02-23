/**
 * WordPress dependencies
 */
import { useEffect, useState } from '@wordpress/element';
import { subscribe } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { useParentPost } from '../../../hooks';
import { getAllRevisionUrl } from '../../../utils';

/**
 * Returns the WP button element
 *
 * @return {HTMLElement} Html anchor tag.
 */
const getWPButton = () => {
	return document.querySelector( '.edit-post-fullscreen-mode-close' );
};

const WPButtonModifier = () => {
	const [ typeUrl, setTypeUrl ] = useState();
	const { type } = useParentPost();

	subscribe( () => {
		if ( ! typeUrl ) {
			return;
		}

		const wpButtonElement = getWPButton();

		if ( wpButtonElement && wpButtonElement.href !== typeUrl ) {
			wpButtonElement.href = typeUrl;
		}
	} );

	useEffect( () => {
		if ( ! type ) {
			return;
		}

		setTypeUrl( getAllRevisionUrl( type ) );
	}, [ type ] );

	return null;
};

export default WPButtonModifier;
