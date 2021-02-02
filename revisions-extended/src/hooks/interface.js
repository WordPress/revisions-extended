/**
 * WordPress dependencies
 */
import { dispatch } from '@wordpress/data';
import {
	createContext,
	useContext,
	useState,
	useEffect,
} from '@wordpress/element';

import { usePost } from './post';

const EDITOR_STORE = 'core/editor';
const PROP_BTN_TEXT = 'btnText';
const PROP_FN_SAVE = 'savePost';

const getStashProp = ( prop ) => {
	return window.revisionPluginStash
		? window.revisionPluginStash[ prop ]
		: undefined;
};

const stashGutenbergData = ( data ) => {
	window.revisionPluginStash = {
		...window.revisionPluginStash,
		...data,
	};
};

const setSavePostFunction = ( fn ) => {
	dispatch( EDITOR_STORE ).savePost = fn;
};

const getBtnElement = () => {
	return document.querySelector( '.editor-post-publish-button__button' );
};

const setBtnText = ( text ) => {
	const btn = getBtnElement();
	if ( btn && text ) {
		btn.innerText = text;
	}
};

const clearLocalChanges = ( id ) => {
	// There's gotta be a better approach
	window.sessionStorage.removeItem( `wp-autosave-block-editor-post-${ id }` );
};

const StateContext = createContext();

export function InterfaceProvider( { children, btnTextOverride } ) {
	const [ shouldIntercept, setShouldIntercept ] = useState( false );
	const { isSavingPost, savedPost } = usePost();

	useEffect( () => {
		if ( btnTextOverride ) {
			setBtnText( btnTextOverride );
		}
	}, [] );

	useEffect( () => {
		if ( ! getStashProp( PROP_FN_SAVE ) ) {
			stashGutenbergData( {
				savePost: dispatch( EDITOR_STORE ).savePost,
			} );
		}

		const btnRef = getBtnElement();

		if ( btnRef && ! getStashProp( PROP_BTN_TEXT ) && ! isSavingPost ) {
			stashGutenbergData( {
				// The revision page sets the button on load since the Gutenberg one doesn't make sense.
				btnText: btnTextOverride ? btnTextOverride : btnRef.innerText,
			} );
		}
	}, [ savedPost ] );

	return (
		<StateContext.Provider
			value={ {
				setBtnText,
				setSavePostFunction,
				getStashProp,
				shouldIntercept,
				setShouldIntercept,
				clearLocalChanges,
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
