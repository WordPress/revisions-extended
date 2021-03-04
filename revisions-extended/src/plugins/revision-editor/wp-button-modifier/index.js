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
	const { type } = useParentPost();

	if ( ! type ) {
		return null;
	}

	const wpButtonElement = getWPButton();

	if ( ! wpButtonElement ) {
		return null;
	}

	wpButtonElement.href = getAllRevisionUrl( type );

	return null;
};

export default WPButtonModifier;
