/**
 * Wordpress dependencies
 */
import apiFetch from '@wordpress/api-fetch';

/**
 * Internal dependencies
 */
import { getRestApiUrl } from '../utils';

const POST_STATUS_SCHEDULED = 'revex_future';
const POST_STATUS_PENDING = 'revex_pending';

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

const getPostRevisions = async ( data, status ) => {
	const { postType, postId } = data;

	return await executeFetch( async () => {
		return await apiFetch( {
			path: `${ getRestApiUrl( postType, postId ) }?status=${ status }`,
			method: 'GET',
		} );
	} );
};

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

export const useRevision = () => {
	const getScheduledRevisions = async ( data ) => {
		return await getPostRevisions( data, POST_STATUS_SCHEDULED );
	};

	const getPendingRevisions = async ( data ) => {
		return await getPostRevisions( data, POST_STATUS_PENDING );
	};

	const createScheduledRevision = async ( data ) => {
		return await createRevision( data, POST_STATUS_SCHEDULED );
	};

	const createPendingRevision = async ( data ) => {
		return await createRevision( data, POST_STATUS_PENDING );
	};

	const updateScheduledRevision = async ( data ) => {
		return await updateRevision( data, POST_STATUS_SCHEDULED );
	};

	const updatePendingRevision = async ( data ) => {
		return await updateRevision( data, POST_STATUS_PENDING );
	};

	return {
		getScheduledRevisions,
		getPendingRevisions,
		createScheduledRevision,
		createPendingRevision,
		updateScheduledRevision,
		updatePendingRevision,
	};
};
