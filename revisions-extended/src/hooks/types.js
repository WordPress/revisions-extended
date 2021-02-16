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
	const [ types, setTypes ] = useState( undefined );
	const [ loading, setLoading ] = useState( false );
	const [ error, setError ] = useState( false );

	/**
	 * Fetches type data from WP api
	 */
	const fetchTypes = async () => {
		return await apiFetch( {
			path: `wp/v2/types?context=edit`,
			method: 'GET',
		} );
	};

	/**
	 * Return the type object.
	 *
	 * @param {string} postType Post type
	 * @param {string|undefined} prop Property to return from type object
	 * @return {Object|undefined} Type object
	 */
	const getTypeInfo = async ( postType, prop ) => {
		let _types = types;

		// Because of some hacks to tie into html elements, the context can be emptied unexpectedly.
		// Let's refetch in that case.
		if ( ! loading && ! types && ! error ) {
			_types = await fetchTypes();
		}

		if ( ! prop ) {
			return _types[ postType ];
		}

		return _types[ postType ] ? _types[ postType ][ prop ] : undefined;
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
				loaded: ! loading && ! error && types !== undefined,
				error,
				types,
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
