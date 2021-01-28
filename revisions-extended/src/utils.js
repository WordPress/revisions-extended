/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

export const pluginNamespace = 'revisions-extended';
export const pluginName = __( 'Revisions Extended', 'revisions-extended' );
export const pluginCustomPostType = 'revision';

export const getRestApiUrl = ( postType, parentId ) => {
	return `revisions-extended/v1/${ postType }s/${ parentId }/revisions`;
};

export const getRestApiUrlV2 = ( revisionId ) => {
	return `wp/v2/revision/${ revisionId }`;
};

export const getEditUrl = ( postId ) => {
	return `/wp-admin/post.php?post=${ postId }&action=edit`;
};
