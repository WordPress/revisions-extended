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

export function TypesProvider( { children } ) {
	const [ types, setTypes ] = useState( {} );
	const [ loading, setLoading ] = useState( false );
	const [ error, setError ] = useState( false );

	const getTypeInfo = ( type, prop ) => {
		return types[ type ] ? types[ type ][ prop ] : undefined;
	};

	const fetchTypes = async () => {
		return await apiFetch( {
			path: `wp/v2/types?context=edit`,
			method: 'GET',
		} );
	};

	useEffect( () => {
		const runFetch = async () => {
			setLoading( true );

			try {
				const res = await fetchTypes();

				setTypes( res );
			} catch ( ex ) {
				setError( true );
			}
			setLoading( false );
		};

		runFetch();
	}, [] );

	return (
		<StateContext.Provider
			value={ {
				loading,
				loaded: ! loading && ! error && Object.keys( types ).length > 0,
				error,
				types,
				fetchTypes,
				getTypeInfo,
			} }
		>
			{ children }
		</StateContext.Provider>
	);
}

export function useTypes() {
	const context = useContext( StateContext );

	if ( context === undefined ) {
		throw new Error( 'useTypes must be used within a Provider' );
	}

	return context;
}
