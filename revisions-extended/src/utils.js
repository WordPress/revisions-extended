/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
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

export const getAllRevisionUrl = ( type ) => {
	if ( type.toLowerCase() === 'page' ) {
		return '/wp-admin/edit.php?page=page-updates';
	}

	return '/wp-admin/edit.php?page=post-updates';
};

export const getFormattedDate = ( date ) => {
	return format( 'D, F j, Y G:i a', date );
};
export const getShortenedFormattedDate = ( date ) => {
	return format( 'M j, Y', date );
};

export const getStatusDisplay = ( postStatus, date ) => {
	if ( POST_STATUS_SCHEDULED === postStatus ) {
		return `Publish on ${ getShortenedFormattedDate( date ) }`;
	}
	if ( POST_STATUS_PENDING === postStatus ) {
		return 'Pending';
	}
	return '';
};
