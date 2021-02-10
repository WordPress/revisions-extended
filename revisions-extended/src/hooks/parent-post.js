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
		/**
		 * Fetches type information from WP Rest api
		 *
		 * @param {string} postType
		 * @return {Object} Information about the post type
		 */
		const getPostTypeLabel = async ( postType ) => {
			return await apiFetch( {
				path: `wp/v2/types/${ postType }`,
				method: 'GET',
				data: {
					context: 'edit'
				}
			} );
		};

		/**
		 * Fetches post object of parent
		 *
		 * @param {string} url
		 */
		const getParentPost = async ( url ) => {
			try {
				const res = await apiFetch( {
					url,
					method: 'GET',
				} );

				const typeInfo = await getPostTypeLabel( res.type );

				if ( typeInfo ) {
					setParent( {
						...res,
						labels: typeInfo.labels,
					} );
				}
			} catch ( ex ) {
				// TO DO: Maybe consider add a default object since the ui depends on the type
			}
		};

		const href = getHref();

		if ( ! href ) return;

		getParentPost( href );
	}, [ links ] );

	/**
	 * Returns the label for a specific key
	 *
	 * @param {string} key The key of a label
	 * @return {string} String defined in post type declaration
	 */
	const getLabel = ( key ) => {
		return parent.labels ? parent.labels[ key ] : '';
	};

	return (
		<StateContext.Provider
			value={ {
				...parent,
				getLabel,
			} }
		>
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
