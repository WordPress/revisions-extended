/**
 * WordPress dependencies
 */
import {
	createContext,
	useContext,
	useState,
	useEffect,
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import DropdownBtn from '../plugins/editor-modifications/dropdown-btn';

/**
 * Module constants
 */
const CONTAINER_ID = 'revision-button-container';

let addedBtn = false;

const getGutenbergButtonElement = () => {
	return document.querySelector( '.editor-post-publish-button__button' );
};

const insertContainer = ( btnDomRef ) => {
	const container = document.createElement( 'div' );
	container.id = CONTAINER_ID;

	btnDomRef.parentElement.insertBefore( container, btnDomRef.nextSibling );
};

/**
 * Insert an html element to the right
 *
 * @param {HTMLElement} btnDomRef The gutenberg button dom reference
 * @param {HTMLElement} newNode Element to be added
 */
const insertButton = ( btnDomRef, newNode ) => {
	try {
		btnDomRef.parentElement.removeChild( newNode );
	} catch ( ex ) {}

	insertContainer( btnDomRef );

	ReactDOM.render( newNode, document.getElementById( CONTAINER_ID ) );
};

/**
 * Turns on our button and turns off Gutenberg's button
 *
 * @param {HTMLElement} gutenbergBtn The gutenberg button dom reference
 * @param {Object} btnState
 */
const toggleBtnOn = ( gutenbergBtn, callback ) => {
	insertButton( gutenbergBtn, <DropdownBtn onClick={ callback } /> );
};

const StateContext = createContext();

export function InterfaceProvider( { children } ) {
	return (
		<StateContext.Provider
			value={ {
				setBtnDefaults: ( { callback } ) => {
					if ( callback && ! addedBtn ) {
						toggleBtnOn( getGutenbergButtonElement(), callback );

						addedBtn = true;
					}
				},
			} }
		>
			{ children }
		</StateContext.Provider>
	);
}

export function useInterface() {
	const context = useContext( StateContext );

	if ( context === undefined ) {
		throw new Error( 'useInterface must be used within a Provider' );
	}

	return context;
}
