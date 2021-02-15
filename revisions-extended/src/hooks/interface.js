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
 * Module variables
 */
const OUR_BUTTON_ID = 'revisions-extended-button';

const getGutenbergButtonElement = () => {
	return document.querySelector( '.editor-post-publish-button__button' );
};

const getOurButtonElement = () => {
	return document.getElementById( OUR_BUTTON_ID );
};

const showElement = ( el ) => ( el.style.display = 'block' );
const hideElement = ( el ) => ( el.style.display = 'none' );

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

	btnDomRef.parentElement.insertBefore( newNode, btnDomRef.nextSibling );
};

/**
 * Clones the button and updates its properties
 *
 * @param {HTMLElement} btnDomRef The gutenberg button dom reference
 * @param {Object} param
 * @param {string} param.text
 * @param {Function} param.callback
 */
const cloneButton = ( btnDomRef, { text, callback } ) => {
	const newNode = btnDomRef.cloneNode();

	// Update some of the cloned properties
	newNode.id = OUR_BUTTON_ID;
	newNode.innerText = text ? text : btnDomRef.innerText;
	newNode.setAttribute( 'aria-disabled', false );
	newNode.addEventListener( 'click', callback );

	// It will copy its hidden-ness
	showElement( newNode );

	return newNode;
};

/**
 * Removes itself from the DOM
 *
 * @param {HTMLElement} domNode HTML node to remove
 */
const removeBtn = ( domNode ) => {
	try {
		domNode.parentElement.removeChild( domNode );
	} catch ( ex ) {}
};

/**
 * Turns on our button and turns off Gutenberg's button
 *
 * @param {HTMLElement} gutenbergBtn The gutenberg button dom reference
 * @param {Object} btnState
 */
const toggleBtnOn = ( gutenbergBtn, btnState ) => {
	const newNode = cloneButton( gutenbergBtn, btnState );
	insertButton( gutenbergBtn, newNode );

	// Hide the gutenberg btn
	hideElement( gutenbergBtn );
};

/**
 * Turns off our button and turns on Gutenberg's button
 *
 * @param {HTMLElement} gutenbergBtn The gutenberg button dom reference
 */
const toggleBtnOff = ( gutenbergBtn ) => {
	// Remove our button
	removeBtn( getOurButtonElement() );

	// Show the Gutenberg button
	showElement( gutenbergBtn );
};

const StateContext = createContext();

export function InterfaceProvider( { children, btnText = false } ) {
	const [ shouldIntercept, setIntercept ] = useState( false );
	const [ gutenbergBtn, setGutenbergBtn ] = useState( false );
	const [ btnState, setBtnDefaults ] = useState( {
		text: btnText,
		callback: () => {},
	} );

	useEffect( () => {
		setGutenbergBtn( getGutenbergButtonElement() );
	}, [] );

	return (
		<StateContext.Provider
			value={ {
				setBtnDefaults: ( args ) => {
					setBtnDefaults( { ...btnState, ...args } );
				},
				shouldIntercept,
				setShouldIntercept: ( isChecked ) => {
					if ( isChecked ) {
						toggleBtnOn( gutenbergBtn, btnState );
					} else {
						toggleBtnOff( gutenbergBtn );
					}
					setIntercept( isChecked );
				},
				btnState,
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
