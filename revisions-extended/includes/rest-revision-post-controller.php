<?php

namespace RevisionsExtended;

use WP_Error, WP_Post_Type;
use WP_REST_Posts_Controller, WP_REST_Revisions_Controller, WP_REST_Request, WP_REST_Response, WP_REST_Server;
use function RevisionsExtended\Post_Status\get_revision_statuses;
use function RevisionsExtended\Post_Status\validate_revision_status;

defined( 'WPINC' ) || die();

/**
 * Manage revision posts.
 *
 * @see WP_REST_Posts_Controller
 */
class REST_Revision_Post_Controller extends WP_REST_Posts_Controller {
	/**
	 * Constructor.
	 *
	 * @param string $post_type Post type.
	 */
	public function __construct( $post_type ) {
		parent::__construct( $post_type );

		//$this->namespace = 'revisions-extended/v1';

		//$this->post_type = $post_type;
		//$this->namespace = 'revisions-extended/v1';
		//$obj             = get_post_type_object( $post_type );
		//$this->rest_base = ! empty( $obj->rest_base ) ? $obj->rest_base : $obj->name;

		//$this->meta = new WP_REST_Post_Meta_Fields( $this->post_type );
	}

	/**
	 * Registers the routes for the objects of the controller.
	 *
	 * @see register_rest_route()
	 */
	public function register_routes() {
		$get_item_args = array(
			'context' => $this->get_context_param( array( 'default' => 'view' ) ),
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/(?P<id>[\d]+)',
			array(
				'args'   => array(
					'id' => array(
						'description' => __( 'Unique identifier for the object.' ),
						'type'        => 'integer',
					),
				),
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_item' ),
					'permission_callback' => array( $this, 'get_item_permissions_check' ),
					'args'                => $get_item_args,
				),
				array(
					'methods'             => WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'update_item' ),
					'permission_callback' => array( $this, 'update_item_permissions_check' ),
					'args'                => $this->get_valid_endpoint_args( WP_REST_Server::EDITABLE ),
				),
				array(
					'methods'             => WP_REST_Server::DELETABLE,
					'callback'            => array( $this, 'delete_item' ),
					'permission_callback' => array( $this, 'delete_item_permissions_check' ),
					'args'                => array(
						'force' => array(
							'type'        => 'boolean',
							'default'     => false,
							'description' => __( 'Whether to bypass Trash and force deletion.' ),
						),
					),
				),
				'schema' => array( $this, 'get_public_item_schema' ),
			)
		);
	}

	/**
	 * Get the subset of the parent post type's endpoint args that are valid for our purposes.
	 *
	 * @param string $method
	 *
	 * @return array
	 */
	protected function get_valid_endpoint_args( $method ) {
		$revision_fields   = array_map(
			function( $item ) {
				return str_replace( 'post_', '', $item );
			},
			array_keys( _wp_post_revision_fields() )
		);
		$revision_fields[] = 'status';
		$revision_fields[] = 'date';
		$revision_fields[] = 'date_gmt';

		$parent_endpoint_args = parent::get_endpoint_args_for_item_schema( $method );

		$parent_endpoint_args['status']['enum'] = wp_list_pluck( get_revision_statuses(), 'name' );

		return array_intersect_key( $parent_endpoint_args, array_fill_keys( $revision_fields, '' ) );
	}

	/**
	 * Checks if a given request has access to read a post.
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 *
	 * @return true|WP_Error True if the request has read access for the item, WP_Error object otherwise.
	 */
	public function get_item_permissions_check( $request ) {
		$post = $this->get_post( $request['id'] );
		if ( is_wp_error( $post ) ) {
			return $post;
		}

		$revisions_controller = $this->get_revisions_controller( get_post_type( $post->post_parent ) );
		$request['parent']    = $post->post_parent;

		return $revisions_controller->get_item_permissions_check( $request );
	}

	/**
	 * Retrieves a single post.
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 *
	 * @return WP_REST_Response|WP_Error Response object on success, or WP_Error object on failure.
	 */
	public function get_item( $request ) {
		$post = $this->get_post( $request['id'] );
		if ( is_wp_error( $post ) ) {
			return $post;
		}

		$revisions_controller = $this->get_revisions_controller( get_post_type( $post->post_parent ) );
		$request['parent']    = $post->post_parent;

		return $revisions_controller->get_item( $request );
	}

	/**
	 * Checks if a given request has access to delete a post.
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 *
	 * @return true|WP_Error True if the request has access to delete the item, WP_Error object otherwise.
	 */
	public function delete_item_permissions_check( $request ) {
		$post = $this->get_post( $request['id'] );
		if ( is_wp_error( $post ) ) {
			return $post;
		}

		$revisions_controller = $this->get_revisions_controller( get_post_type( $post->post_parent ) );
		$request['parent']    = $post->post_parent;

		return $revisions_controller->delete_item_permissions_check( $request );
	}

	/**
	 * Deletes a single post.
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 *
	 * @return WP_REST_Response|WP_Error Response object on success, or WP_Error object on failure.
	 */
	public function delete_item( $request ) {
		$post = $this->get_post( $request['id'] );
		if ( is_wp_error( $post ) ) {
			return $post;
		}

		$revisions_controller = $this->get_revisions_controller( get_post_type( $post->post_parent ) );
		$request['parent']    = $post->post_parent;

		return $revisions_controller->delete_item( $request );
	}

	/**
	 * Determines validity and normalizes the given status parameter.
	 *
	 * @param string       $post_status Post status.
	 * @param WP_Post_Type $post_type   Post type.
	 *
	 * @return string|WP_Error Post status or WP_Error if lacking the proper permission.
	 */
	protected function handle_status_param( $post_status, $post_type ) {
		if ( ! validate_revision_status( $post_status ) ) {
			return new WP_Error(
				'rest_cannot_update_status',
				__( 'Sorry, this post status is not allowed for revisions.', 'revisions-extended' ),
				array( 'status' => 403 )
			);
		}

		return $post_status;
	}

	/**
	 * Get a revisions controller for a particular parent post type.
	 *
	 * @param string $parent_post_type
	 *
	 * @return WP_REST_Revisions_Controller
	 */
	protected function get_revisions_controller( $parent_post_type ) {
		static $controllers = array();

		if ( ! isset( $controllers[ $parent_post_type ] ) ) {
			$controllers[ $parent_post_type ] = new WP_REST_Revisions_Controller( $parent_post_type );
		}

		return $controllers[ $parent_post_type ];
	}
}
