/**
 * WordPress dependencies
 */
import { createContext, useContext, useState } from '@wordpress/element';

const StateContext = createContext();

export function InterfaceProvider( { children } ) {
	const [ state, setState ] = useState( {} );

	return (
		<StateContext.Provider
			value={ {
				state,
				setState,
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
