/**
 * WordPress dependencies
 */
import { createContext, useContext, useEffect } from '@wordpress/element';

const StateContext = createContext();

export function ParentPostProvider( { children } ) {
	useEffect( () => {
		console.log( 'loaded' );
	}, [] );

	return (
		<StateContext.Provider value={ {} }>{ children }</StateContext.Provider>
	);
}

export function useParentPost() {
	const context = useContext( StateContext );

	if ( context === undefined ) {
		throw new Error( 'useParentPost must be used within a Provider' );
	}

	return context;
}
