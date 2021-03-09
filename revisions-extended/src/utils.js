/**
 * WordPress dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import { format } from '@wordpress/date';
import { addQueryArgs } from '@wordpress/url';

export const pluginNamespace = 'revisions-extended';
export const pluginName = __( 'Revisions Extended', 'revisions-extended' );
export const pluginCustomPostType = 'revision';
import { POST_STATUS_SCHEDULED, POST_STATUS_PENDING } from './settings';
const CONTAINER_ID = 'revision-button-container';

export const getRestApiUrl = ( restBase, parentId ) => {
	return `revisions-extended/v1/${ restBase }/${ parentId }/revisions`;
};

export const getRestApiUrlV2 = ( revisionId ) => {
	return `wp/v2/revision/${ revisionId }`;
};

export const getEditUrl = ( postId ) => {
	return addQueryArgs( 'post.php', {
		post: postId,
		action: 'edit',
	} );
};

export const getAllRevisionUrl = ( type ) => {
	if ( ! type || ! type.length ) {
		return '';
	}

	if ( type.toLowerCase() === 'post' ) {
		return addQueryArgs( 'edit.php', {
			page: 'post-updates',
		} );
	}

	return addQueryArgs( 'edit.php', {
		post_type: type,
		page: `${ type }-updates`,
	} );
};

/**
 * Returns the link for the revision comparison page
 *
 * @param {string} revisionId
 * @return {string} Url
 */
export const getCompareLink = ( revisionId ) => {
	return addQueryArgs( 'revision.php', {
		page: 'compare-updates',
		revision_id: revisionId,
	} );
};

export const getFormattedDate = ( date ) => {
	return format( 'D, F j, Y G:i a', date );
};
export const getShortenedFormattedDate = ( date ) => {
	return format( 'M j, Y', date );
};

export const getStatusDisplay = ( postStatus, date ) => {
	if ( POST_STATUS_SCHEDULED === postStatus ) {
		return sprintf(
			// translators: %s: formatted date
			__( 'Scheduled for %s', 'revisions-extended' ),
			getShortenedFormattedDate( date )
		);
	}
	if ( POST_STATUS_PENDING === postStatus ) {
		return __( 'Pending', 'revisions-extended' );
	}
	return '';
};

export const clearLocalChanges = ( id ) => {
	// There's gotta be a better approach
	window.sessionStorage.removeItem( `wp-autosave-block-editor-post-${ id }` );
};

const insertContainer = ( btnDomRef ) => {
	const container = document.createElement( 'div' );
	container.id = CONTAINER_ID;

	btnDomRef.parentElement.insertBefore( container, btnDomRef.nextSibling );
};

/**
 * Insert an html element to the right
 *
 * @param {HTMLElement} newNode Element to be added
 */
export const insertButton = ( newNode ) => {
	const btnDomRef = document.querySelector(
		'.editor-post-publish-button__button'
	);

	if ( ! btnDomRef ) {
		return;
	}
	insertContainer( btnDomRef );

	/* eslint-disable no-undef*/
	ReactDOM.render( newNode, document.getElementById( CONTAINER_ID ) );
};
