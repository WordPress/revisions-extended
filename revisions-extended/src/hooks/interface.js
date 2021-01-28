/**
 * WordPress dependencies
 */
import { createContext, useContext, useState } from '@wordpress/element';

const StateContext = createContext();
export function InterfaceProvider( { children } ) {
	const [ shouldCreateRevision, setShouldCreateRevision ] = useState( false );

	return (
		<StateContext.Provider
			value={ {
				shouldCreateRevision,
				setShouldCreateRevision,
				clearLocalChanges: ( id ) => {
					// There's gotta be a better approach
					window.sessionStorage.removeItem(
						`wp-autosave-block-editor-post-${ id }`
					);
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
