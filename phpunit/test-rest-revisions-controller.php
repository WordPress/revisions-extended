<?php

namespace RevisionsExtended\Tests;

use WP_UnitTest_Factory;
use WP_Test_REST_Controller_Testcase;
use WP_Post, WP_REST_Posts_Controller, WP_REST_Request, WP_REST_Response;

defined( 'WPINC' ) || die();

/**
 * Tests for the REST controller.
 */
class Test_REST_Revisions_Controller extends WP_Test_REST_Controller_Testcase {
	protected static $post_id;
	protected static $update_id;
	protected static $page_id;

	protected static $editor_id;
	protected static $author_id;

	/**
	 * Set up posts and users before running any tests.
	 *
	 * @param WP_UnitTest_Factory $factory
	 *
	 * @return void
	 */
	public static function wpSetUpBeforeClass( WP_UnitTest_Factory $factory ) {
		self::$post_id = $factory->post->create();
		self::$page_id = $factory->post->create(
			array(
				'post_type'   => 'page',
				'post_status' => 'draft',
			)
		);

		self::$editor_id = $factory->user->create(
			array(
				'role' => 'editor',
			)
		);
		self::$author_id = $factory->user->create(
			array(
				'role' => 'author',
			)
		);

		wp_set_current_user( self::$editor_id );

		wp_update_post(
			array(
				'post_content' => 'This content is better.',
				'ID'           => self::$post_id,
			)
		);
		wp_update_post(
			array(
				'post_content' => 'This content is marvelous.',
				'ID'           => self::$post_id,
			)
		);
		wp_update_post(
			array(
				'post_content' => 'This content is fantastic.',
				'ID'           => self::$post_id,
			)
		);

		self::$update_id = $factory->post->create(
			array(
				'post_type'   => 'revision',
				'post_status' => 'future',
				'post_date'   => wp_date( 'Y-m-d H:i:s', strtotime( '+ 1 week' ) ),
				'post_parent' => self::$post_id,
				'post_author' => self::$editor_id,
			)
		);

		wp_set_current_user( 0 );
	}

	/**
	 * Tear down posts and users after running all tests.
	 *
	 * @return void
	 */
	public static function wpTearDownAfterClass() {
		// Also deletes revisions.
		wp_delete_post( self::$post_id, true );
		wp_delete_post( self::$update_id, true );
		wp_delete_post( self::$page_id, true );

		self::delete_user( self::$editor_id );
		self::delete_user( self::$author_id );
	}

	/**
	 * Reset between each test.
	 *
	 * @return void
	 */
	public function tearDown(): void {
		parent::tearDown();
		wp_set_current_user( 0 );
	}

	/**
	 * Helper function to test response objects.
	 *
	 * Modified from WP_Test_REST_Revisions_Controller::check_get_revision_response.
	 *
	 * @param WP_REST_Response|array $response
	 * @param WP_Post                $revision
	 *
	 * @return void
	 */
	protected function check_revision_response( $response, $revision ) {
		if ( $response instanceof WP_REST_Response ) {
			$links    = $response->get_links();
			$response = $response->get_data();
		} else {
			$this->assertArrayHasKey( '_links', $response );
			$links = $response['_links'];
		}

		$this->assertEquals( $revision->post_status, $response['status'] );

		$parent        = get_post( $revision->post_parent );
		$parent_object = get_post_type_object( $parent->post_type );
		$parent_base   = ! empty( $parent_object->rest_base ) ? $parent_object->rest_base : $parent_object->name;
		$this->assertSame( rest_url( '/wp/v2/' . $parent_base . '/' . $revision->post_parent ), $links['parent'][0]['href'] );
		$this->assertArrayHasKey( 'embeddable', $links['parent'][0] );

		$this->assertEquals( $revision->post_author, $response['author'] );
		$this->assertSame( rest_url( '/wp/v2/users/' . self::$editor_id ), $links['author'][0]['href'] );
		$this->assertArrayHasKey( 'embeddable', $links['author'][0] );

		$rendered_content = apply_filters( 'the_content', $revision->post_content );
		$this->assertSame( $rendered_content, $response['content']['rendered'] );

		$this->assertSame( mysql_to_rfc3339( $revision->post_date ), $response['date'] );
		$this->assertSame( mysql_to_rfc3339( $revision->post_date_gmt ), $response['date_gmt'] );

		$rendered_excerpt = apply_filters( 'the_excerpt', apply_filters( 'get_the_excerpt', $revision->post_excerpt, $revision ) );
		$this->assertSame( $rendered_excerpt, $response['excerpt']['rendered'] );

		$rendered_guid = apply_filters( 'get_the_guid', $revision->guid, $revision->ID );
		$this->assertSame( $rendered_guid, $response['guid']['rendered'] );

		$this->assertSame( $revision->ID, $response['id'] );
		$this->assertSame( mysql_to_rfc3339( $revision->post_modified ), $response['modified'] );
		$this->assertSame( mysql_to_rfc3339( $revision->post_modified_gmt ), $response['modified_gmt'] );
		$this->assertSame( $revision->post_name, $response['slug'] );

		$rendered_title = get_the_title( $revision->ID );
		$this->assertSame( $rendered_title, $response['title']['rendered'] );
	}

	/**
	 * Test that routes have been registered.
	 *
	 * @return void
	 */
	public function test_register_routes() {
		$routes = rest_get_server()->get_routes();
		$this->assertArrayHasKey( '/revisions-extended/v1/posts/(?P<parent>[\d]+)/revisions', $routes );
		$this->assertArrayHasKey( '/revisions-extended/v1/pages/(?P<parent>[\d]+)/revisions', $routes );
	}

	/**
	 * Test getting a collection.
	 *
	 * @return void
	 */
	public function test_get_items() {
		wp_set_current_user( self::$editor_id );
		$request  = new WP_REST_Request(
			'GET',
			'/revisions-extended/v1/posts/' . self::$post_id . '/revisions',
			array(
				'status' => 'future',
			)
		);
		$response = rest_get_server()->dispatch( $request );
		$data     = $response->get_data();
		$this->assertSame( 200, $response->get_status() );
		$this->assertCount( 1, $data );

		$this->assertSame( self::$update_id, $data[0]['id'] );
		$this->check_revision_response( $data[0], wp_get_post_revision( self::$update_id ) );
	}

	/**
	 * Test creating a revision.
	 *
	 * @return void
	 */
	public function test_create_item() {
		wp_set_current_user( self::$editor_id );

		$request = new WP_REST_Request(
			'POST',
			'/revisions-extended/v1/posts/' . self::$post_id . '/revisions'
		);
		$request->add_header( 'content-type', 'application/x-www-form-urlencoded' );
		$params = array(
			'title'  => 'Post title',
			'status' => 'future',
			'date'   => wp_date( 'Y-m-d H:i:s', strtotime( '+ 2 weeks' ) ),
		);
		$request->set_body_params( $params );
		$response = rest_get_server()->dispatch( $request );
		$data     = $response->get_data();
		$this->assertSame( 201, $response->get_status() );
		$this->assertArrayHasKey( 'id', $data );

		$created_id     = $data['id'];
		$created_object = wp_get_post_revision( $created_id );
		$this->assertInstanceOf( 'WP_Post', $created_object );
		$this->assertEquals( self::$editor_id, $created_object->post_author );
		$this->check_revision_response( $data, $created_object );
	}

	/**
	 * Test creating a revision with insufficient permissions.
	 *
	 * @return void
	 */
	public function test_create_item_no_permission() {
		wp_set_current_user( self::$author_id );

		$request = new WP_REST_Request(
			'POST',
			'/revisions-extended/v1/posts/' . self::$post_id . '/revisions'
		);
		$request->add_header( 'content-type', 'application/x-www-form-urlencoded' );
		$params = array(
			'title'  => 'Post title',
			'status' => 'future',
			'date'   => wp_date( 'Y-m-d H:i:s', strtotime( '+ 2 weeks' ) ),
		);
		$request->set_body_params( $params );
		$response = rest_get_server()->dispatch( $request );

		$this->assertErrorResponse( 'rest_cannot_edit', $response, 403 );
	}

	/**
	 * Test creating a revision for a post that's not public.
	 *
	 * @return void
	 */
	public function test_create_item_parent_not_public() {
		wp_set_current_user( self::$editor_id );

		$request = new WP_REST_Request(
			'POST',
			'/revisions-extended/v1/pages/' . self::$page_id . '/revisions'
		);
		$request->add_header( 'content-type', 'application/x-www-form-urlencoded' );
		$params = array(
			'title'  => 'Page title',
			'status' => 'future',
			'date'   => wp_date( 'Y-m-d H:i:s', strtotime( '+ 2 weeks' ) ),
		);
		$request->set_body_params( $params );
		$response = rest_get_server()->dispatch( $request );

		$this->assertErrorResponse( 'rest_invalid_post', $response, 403 );
	}

	/**
	 * Test getting the schema for collections and single items.
	 *
	 * There shouldn't be a schema for the single item in this endpoint.
	 *
	 * @return void
	 */
	public function test_context_param() {
		// Collection.
		$request  = new WP_REST_Request(
			'OPTIONS',
			'/revisions-extended/v1/posts/' . self::$post_id . '/revisions'
		);
		$response = rest_get_server()->dispatch( $request );
		$data     = $response->get_data();
		$this->assertSame( 'view', $data['endpoints'][0]['args']['context']['default'] );
		$this->assertSameSets( array( 'view', 'edit', 'embed' ), $data['endpoints'][0]['args']['context']['enum'] );
		// Single.
		$request  = new WP_REST_Request(
			'OPTIONS',
			'/revisions-extended/v1/posts/' . self::$post_id . '/revisions/' . self::$update_id
		);
		$response = rest_get_server()->dispatch( $request );
		$data     = $response->get_data();
		$this->assertEmpty( $data );
	}

	/**
	 * Test getting a single revision.
	 *
	 * This shouldn't be possible on this endpoint.
	 *
	 * @return void
	 */
	public function test_get_item() {
		wp_set_current_user( self::$editor_id );
		$request  = new WP_REST_Request(
			'GET',
			'/revisions-extended/v1/posts/' . self::$post_id . '/revisions/' . self::$update_id
		);
		$response = rest_get_server()->dispatch( $request );
		$this->assertErrorResponse( 'rest_no_route', $response, 404 );
	}

	/**
	 * Test updating a single revision.
	 *
	 * This shouldn't be possible on this endpoint.
	 *
	 * @return void
	 */
	public function test_update_item() {
		wp_set_current_user( self::$editor_id );
		$request  = new WP_REST_Request(
			'POST',
			'/revisions-extended/v1/posts/' . self::$post_id . '/revisions/' . self::$update_id
		);
		$response = rest_get_server()->dispatch( $request );
		$this->assertErrorResponse( 'rest_no_route', $response, 404 );
	}

	/**
	 * Test deleting a single revision.
	 *
	 * This shouldn't be possible on this endpoint.
	 *
	 * @return void
	 */
	public function test_delete_item() {
		wp_set_current_user( self::$editor_id );
		$request  = new WP_REST_Request(
			'DELETE',
			'/revisions-extended/v1/posts/' . self::$post_id . '/revisions/' . self::$update_id
		);
		$response = rest_get_server()->dispatch( $request );
		$this->assertErrorResponse( 'rest_no_route', $response, 404 );
	}

	/**
	 * Test the response structure of a single item.
	 *
	 * @return void
	 */
	public function test_prepare_item() {
		wp_set_current_user( self::$editor_id );
		$request  = new WP_REST_Request(
			'GET',
			'/revisions-extended/v1/posts/' . self::$post_id . '/revisions',
			array(
				'status' => 'future',
			)
		);
		$response = rest_get_server()->dispatch( $request );
		$data     = $response->get_data();
		$this->assertSame( 200, $response->get_status() );
		$this->check_revision_response( $data[0], wp_get_post_revision( self::$update_id ) );
	}

	/**
	 * Test the schema of an item from a response.
	 *
	 * @return void
	 */
	public function test_get_item_schema() {
		$request    = new WP_REST_Request(
			'OPTIONS',
			'/revisions-extended/v1/posts/' . self::$post_id . '/revisions'
		);
		$response   = rest_get_server()->dispatch( $request );
		$data       = $response->get_data();
		$properties = $data['schema']['properties'];
		$this->assertSame( 14, count( $properties ) );
		$this->assertArrayHasKey( 'author', $properties );
		$this->assertArrayHasKey( 'content', $properties );
		$this->assertArrayHasKey( 'date', $properties );
		$this->assertArrayHasKey( 'date_gmt', $properties );
		$this->assertArrayHasKey( 'excerpt', $properties );
		$this->assertArrayHasKey( 'guid', $properties );
		$this->assertArrayHasKey( 'id', $properties );
		$this->assertArrayHasKey( 'meta', $properties );
		$this->assertArrayHasKey( 'modified', $properties );
		$this->assertArrayHasKey( 'modified_gmt', $properties );
		$this->assertArrayHasKey( 'parent', $properties );
		$this->assertArrayHasKey( 'slug', $properties );
		$this->assertArrayHasKey( 'title', $properties );
		$this->assertArrayHasKey( 'status', $properties );
	}
}
