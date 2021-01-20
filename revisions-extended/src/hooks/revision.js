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

const trashRevision = async ( { postType, postId, revisionId } ) => {
	return await executeFetch( async () => {
		return await apiFetch( {
			path: `${ getRestApiUrl( postType, postId ) }/${ revisionId }`,
			method: 'DELETE',
		} );
	} );
};

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

	const trash = async ( data ) => {
		return await trashRevision( data );
	};

	const publish = async ( data ) => {
		return await publishRevision( data );
	};

	return {
		get,
		create,
		update,
		trash,
		publish,
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
	};
};

export { useScheduledRevision, usePendingRevision };
