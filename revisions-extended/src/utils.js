/**
 * WordPress dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import { format } from '@wordpress/date';

export const pluginNamespace = 'revisions-extended';
export const pluginName = __( 'Revisions Extended', 'revisions-extended' );
export const pluginCustomPostType = 'revision';
import { POST_STATUS_SCHEDULED, POST_STATUS_PENDING } from './settings';

export const getRestApiUrl = ( postType, parentId ) => {
	return `revisions-extended/v1/${ postType }s/${ parentId }/revisions`;
};

export const getRestApiUrlV2 = ( revisionId ) => {
	return `wp/v2/revision/${ revisionId }`;
};

export const getEditUrl = ( postId ) => {
	return `/wp-admin/post.php?post=${ postId }&action=edit`;
};

export const getAllRevisionUrl = () => {
	return '/wp-admin/edit.php?post_type=revision';
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
			__( 'Scheduled for %s' ),
			getShortenedFormattedDate( date )
		);
	}
	if ( POST_STATUS_PENDING === postStatus ) {
		return 'Pending';
	}
	return '';
};

export const clearLocalChanges = ( id ) => {
	// There's gotta be a better approach
	window.sessionStorage.removeItem( `wp-autosave-block-editor-post-${ id }` );
};
