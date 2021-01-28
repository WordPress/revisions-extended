/**
 * Wordpress dependencies
 */
import apiFetch from '@wordpress/api-fetch';

/**
 * Internal dependencies
 */
import { getRestApiUrl, getRestApiUrlV2 } from '../utils';

/**
 * Module Constants
 */
const POST_STATUS_SCHEDULED = 'future'; // Matches API
const POST_STATUS_PENDING = 'pending';

/**
 * This function normalizes the apiFetch response
 *
 * @param {Function} fn Asynchronous api call
 *
 * @return {Object} Response object
 */
const executeFetch = async ( fn ) => {
	try {
		return {
			data: await fn(),
		};
	} catch ( ex ) {
		return {
			error: ex,
		};
	}
};

/**
 * Get all the post revisions for a specific post type
 *
 * @param {Object} data - Data sent to api
 * @param {string} data.postType - The type of the post.
 * @param {string} data.postId - The id of the post.
 * @param {string} status
 *
 * @return {Object} Api response
 */
const getPostRevisions = async ( data, status ) => {
	const { postType, postId } = data;

	return await executeFetch( async () => {
		return await apiFetch( {
			path: `${ getRestApiUrl( postType, postId ) }?status=${ status }`,
			method: 'GET',
		} );
	} );
};

/**
 * Creates a revision for a specific post type
 *
 * @param {Object} data Data sent to api
 * @param {string} data.postType - The type of the post.
 * @param {string} data.postId - The id of the post.
 * @param {string} status
 *
 * @return {Object} Api response
 */
const createRevision = async ( data, status ) => {
	const { postType, postId } = data;

	return await executeFetch( async () => {
		return await apiFetch( {
			path: getRestApiUrl( postType, postId ),
			method: 'POST',
			data: {
				...data,
				status,
			},
		} );
	} );
};

/**
 * Trashes a revision
 *
 * @param {string} revisionId - The revision id.
 * @return {Object} Api response
 */
const trashRevision = async ( revisionId ) => {
	return await executeFetch( async () => {
		return await apiFetch( {
			path: getRestApiUrlV2( revisionId ),
			method: 'DELETE',
			data: {
				force: true,
			},
		} );
	} );
};

/**
 * Publishes a revision, changing it into a past
 *
 * @param {Object} data - Data sent to api
 * @param {string} data.postType - The type of the id.
 * @param {string} data.postId - The id of the post.
 * @param {string} data.revisionId - The revision id.
 *
 * @return {Object} Api response
 */
const publishRevision = async ( { postType, postId, revisionId } ) => {
	return await executeFetch( async () => {
		return await apiFetch( {
			path: `${ getRestApiUrl(
				postType,
				postId
			) }/${ revisionId }/publish`,
			method: 'POST',
		} );
	} );
};

const useRevision = () => {
	const get = async ( data ) => {
		return await getPostRevisions( data, POST_STATUS_SCHEDULED );
	};

	const create = async ( data ) => {
		const status = data.changingToScheduled
			? POST_STATUS_SCHEDULED
			: POST_STATUS_PENDING;
		return await createRevision( data, status );
	};

	return {
		get,
		create,
		trash: trashRevision,
		publish: publishRevision,
	};
};

export { useRevision };
