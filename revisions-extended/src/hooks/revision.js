/**
 * Wordpress dependencies
 */
import apiFetch from '@wordpress/api-fetch';

/**
 * Internal dependencies
 */
import { getRestApiUrl } from '../utils';

/**
 * Module Constants
 */
const POST_STATUS_SCHEDULED = 'revex_future'; // Matches API
const POST_STATUS_PENDING = 'revex_pending';

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
 * Updates a revision for a specific post type
 *
 * @param {Object} data - Data sent to api
 * @param {string} data.postType - The type of the post.
 * @param {string} data.postId - The id of the post.
 * @param {string} data.content - The content of the post.
 * @param {string} data.revisionId - The revision id of the post.
 * @param {string} status
 *
 * @return {Object} Api response
 */
const updateRevision = async (
	{ postType, postId, content, revisionId },
	status
) => {
	return await executeFetch( async () => {
		return await apiFetch( {
			path: `${ getRestApiUrl( postType, postId ) }/${ revisionId }`,
			method: 'POST',
			data: {
				title: 'New Title',
				content,
				status,
			},
		} );
	} );
};

/**
 * Trashes a revision
 *
 * @param {Object} data - Data sent to api
 * @param {string} data.postType - The type of the post.
 * @param {string} data.postId - The is of the post.
 * @param {string} data.revisionId - The revision id.
 *
 * @return {Object} Api response
 */
const trashRevision = async ( { postType, postId, revisionId } ) => {
	return await executeFetch( async () => {
		return await apiFetch( {
			path: `${ getRestApiUrl( postType, postId ) }/${ revisionId }`,
			method: 'DELETE',
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

const useScheduledRevision = () => {
	const get = async ( data ) => {
		return await getPostRevisions( data, POST_STATUS_SCHEDULED );
	};

	const create = async ( data ) => {
		return await createRevision( data, POST_STATUS_SCHEDULED );
	};

	const update = async ( data ) => {
		return await updateRevision( data, POST_STATUS_SCHEDULED );
	};

	return {
		get,
		create,
		update,
		trash: trashRevision,
		publish: publishRevision,
	};
};

const usePendingRevision = () => {
	const get = async ( data ) => {
		return await getPostRevisions( data, POST_STATUS_PENDING );
	};

	const create = async ( data ) => {
		return await createRevision( data, POST_STATUS_PENDING );
	};

	const update = async ( data ) => {
		return await updateRevision( data, POST_STATUS_PENDING );
	};

	return {
		get,
		create,
		update,
		trash: trashRevision,
		publish: publishRevision,
	};
};

export { useScheduledRevision, usePendingRevision };
