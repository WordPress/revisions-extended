/**
 * Wordpress dependencies
 */
import apiFetch from '@wordpress/api-fetch';

/**
 * Internal dependencies
 */
import { getRestApiUrl } from '../utils';

export const useRevision = () => {
	const createRevision = async ( data ) => {
		const { postType, postId } = data;
		try {
			return {
				data: await apiFetch( {
					path: getRestApiUrl( postType, postId ),
					method: 'POST',
					data,
				} ),
			};
		} catch ( ex ) {
			return {
				error: ex,
			};
		}
	};

	const updateRevision = async ( {
		postType,
		postId,
		content,
		revisionId,
	} ) => {
		try {
			return {
				data: await apiFetch( {
					path: `${ getRestApiUrl(
						postType,
						postId
					) }/${ revisionId }`,
					method: 'POST',
					data: {
						title: 'New Title',
						content,
					},
				} ),
			};
		} catch ( ex ) {
			return {
				error: ex,
			};
		}
	};

	return {
		createRevision,
		updateRevision,
	};
};
