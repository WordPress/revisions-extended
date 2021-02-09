/**
 * WordPress dependencies
 */
import {
	createContext,
	useContext,
	useEffect,
	useState,
} from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';

const StateContext = createContext();

export function ParentPostProvider( { children, links } ) {
	const [ parent, setParent ] = useState( {} );

	const getHref = () => {
		try {
			return links.parent[ 0 ].href;
		} catch ( ex ) {}
	};

	useEffect( () => {
		const getParentPost = async ( path ) => {
			try {
				const res = await apiFetch( {
					path,
					method: 'GET',
				} );

				setParent( res );
			} catch ( ex ) {
				// TO DO: Maybe consider add a default object since the ui depends on the type
			}
		};

		const href = getHref();

		if ( ! href ) return;

		getParentPost( href );
	}, [ links ] );

	return (
		<StateContext.Provider value={ parent }>
			{ children }
		</StateContext.Provider>
	);
}

export function useParentPost() {
	const context = useContext( StateContext );

	if ( context === undefined ) {
		throw new Error( 'useParentPost must be used within a Provider' );
	}

	return context;
}
