/**
 * Internal dependencies
 */
import { getAllRevisionUrl, getEditUrl } from '../revisions-extended/src/utils';

describe( 'Utils', () => {
	it( 'Should return an empty string if no type is passes', () => {
		expect( getAllRevisionUrl() ).toEqual( '' );
	} );

	it( 'Should return post revision list', () => {
		expect( getAllRevisionUrl( 'post' ) ).toEqual( 'edit.php?page=post-updates' );
	} );

	it( 'Should return custom post type revision list', () => {
		expect( getAllRevisionUrl( 'custom' ) ).toEqual( 'edit.php?post_type=custom&page=custom-updates' );
	} );

	it( 'Should return full formed edit url', () => {
		expect( getEditUrl( 1 ) ).toEqual( 'post.php?post=1&action=edit' );
	} );
} );
