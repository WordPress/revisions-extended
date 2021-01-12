<?php

namespace RevisionsExtended;

use WP_Error, WP_Post;
use WP_REST_Controller, WP_REST_Posts_Controller, WP_REST_Revisions_Controller, WP_REST_Request, WP_REST_Response, WP_REST_Server;
use function RevisionsExtended\Post_Status\get_revision_statuses;
use function RevisionsExtended\Revision\put_post_revision;

defined( 'WPINC' ) || die();

/**
 * Manage pending and scheduled revisions via the REST API.
 *
 * @see WP_REST_Revisions_Controller
 * @see WP_REST_Controller
 */
class REST_Revisions_Controller extends WP_REST_Revisions_Controller {
	/**
	 * Parent post type.
	 *
	 * @var string
	 */
	protected $parent_post_type;

	/**
	 * Parent controller.
	 *
	 * @var WP_REST_Controller
	 */
	protected $parent_controller;

	/**
	 * The base of the parent controller's route.
	 *
	 * @var string
	 */
	protected $parent_base;

	/**
	 * Constructor.
	 *
	 * @param string $parent_post_type Post type of the parent.
	 */
	public function __construct( $parent_post_type ) {
		parent::__construct( $parent_post_type );

		$this->parent_post_type  = $parent_post_type;
		$this->namespace         = 'revisions-extended/v1';
		$this->rest_base         = 'revisions';
		$post_type_object        = get_post_type_object( $parent_post_type );
		$this->parent_base       = ! empty( $post_type_object->rest_base ) ? $post_type_object->rest_base : $post_type_object->name;
		$this->parent_controller = $post_type_object->get_rest_controller();

		if ( ! $this->parent_controller ) {
			$this->parent_controller = new WP_REST_Posts_Controller( $parent_post_type );
		}
	}

	/**
	 * Registers the routes for revisions based on post types supporting revisions.
	 *
	 * @return void
	 */
	public function register_routes() {
		register_rest_route(
			$this->namespace,
			'/' . $this->parent_base . '/(?P<parent>[\d]+)/' . $this->rest_base,
			array(
				'args'   => array(
					'parent' => array(
						'description' => __( 'The ID for the parent of the object.', 'revisions-extended' ),
						'type'        => 'integer',
					),
				),
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_items' ),
					'permission_callback' => array( $this, 'get_items_permissions_check' ),
					'args'                => $this->get_collection_params(),
				),
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'create_item' ),
					'permission_callback' => array( $this, 'create_item_permissions_check' ),
					'args'                => $this->parent_controller->get_endpoint_args_for_item_schema( WP_REST_Server::EDITABLE ),
				),
				'schema' => array( $this, 'get_public_item_schema' ),
			)
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->parent_base . '/(?P<parent>[\d]+)/' . $this->rest_base . '/(?P<id>[\d]+)',
			array(
				'args'   => array(
					'parent' => array(
						'description' => __( 'The ID for the parent of the object.', 'revisions-extended' ),
						'type'        => 'integer',
					),
					'id'     => array(
						'description' => __( 'Unique identifier for the object.', 'revisions-extended' ),
						'type'        => 'integer',
					),
				),
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_item' ),
					'permission_callback' => array( $this, 'get_item_permissions_check' ),
					'args'                => array(
						'context' => $this->get_context_param( array( 'default' => 'view' ) ),
					),
				),
				array(
					'methods'             => WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'update_item' ),
					'permission_callback' => array( $this, 'update_item_permissions_check' ),
					'args'                => $this->get_endpoint_args_for_item_schema( WP_REST_Server::EDITABLE ),
				),
				array(
					'methods'             => WP_REST_Server::DELETABLE,
					'callback'            => array( $this, 'delete_item' ),
					'permission_callback' => array( $this, 'delete_item_permissions_check' ),
					'args'                => array(
						'force' => array(
							'type'        => 'boolean',
							'default'     => false,
							'description' => __( 'Required to be true, as revisions do not support trashing.', 'revisions-extended' ),
						),
					),
				),
				'schema' => array( $this, 'get_public_item_schema' ),
			)
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->parent_base . '/(?P<parent>[\d]+)/' . $this->rest_base . '/(?P<id>[\d]+)/approve',
			array(
				'args'   => array(
					'parent' => array(
						'description' => __( 'The ID for the parent of the object.', 'revisions-extended' ),
						'type'        => 'integer',
					),
					'id'     => array(
						'description' => __( 'Unique identifier for the object.', 'revisions-extended' ),
						'type'        => 'integer',
					),
				),
				array(
					'methods'             => WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'approve_item' ),
					'permission_callback' => array( $this, 'approve_item_permissions_check' ),
				),
				'schema' => array( $this->parent_controller, 'get_public_item_schema' ),
			)
		);
	}

	/**
	 * Callback for retrieving a collection of revision posts.
	 *
	 * @param WP_REST_Request $request
	 *
	 * @return WP_Error|WP_Post|WP_REST_Response
	 */
	public function get_items( $request ) {
		add_filter( 'rest_revision_query', array( $this, 'filter_rest_revision_query' ), 10, 2 );
		add_filter( 'rest_prepare_revision', array( $this, 'filter_rest_prepare_revision' ), 10, 3 );
		$response = parent::get_items( $request );
		remove_filter( 'rest_revision_query', array( $this, 'filter_rest_revision_query' ) );
		remove_filter( 'rest_prepare_revision', array( $this, 'filter_rest_prepare_revision' ) );

		return $response;
	}

	/**
	 * Callback for retrieving a specific revision post.
	 *
	 * @param WP_REST_Request $request
	 *
	 * @return WP_Error|WP_Post|WP_REST_Response
	 */
	public function get_item( $request ) {
		add_filter( 'rest_prepare_revision', array( $this, 'filter_rest_prepare_revision' ), 10, 3 );
		$response = parent::get_item( $request );
		remove_filter( 'rest_prepare_revision', array( $this, 'filter_rest_prepare_revision' ) );

		return $response;
	}

	/**
	 * Callback for deleting a specific revision post.
	 *
	 * @param WP_REST_Request $request
	 *
	 * @return WP_Error|WP_Post|WP_REST_Response
	 */
	public function delete_item( $request ) {
		add_filter( 'rest_prepare_revision', array( $this, 'filter_rest_prepare_revision' ), 10, 3 );
		$response = parent::delete_item( $request );
		remove_filter( 'rest_prepare_revision', array( $this, 'filter_rest_prepare_revision' ) );

		return $response;
	}

	/**
	 * Checks if a given request has access to create a revision.
	 *
	 * Revisions inherit permissions from the parent post,
	 * check if the current user has permission to create a post.
	 *
	 * Modified from WP_REST_Autosaves_Controller::create_item_permissions_check.
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 *
	 * @return true|WP_Error True if the request has access to create the item, WP_Error object otherwise.
	 */
	public function create_item_permissions_check( $request ) {
		$parent = $this->get_parent( $request->get_param( 'parent' ) );
		if ( is_wp_error( $parent ) ) {
			return $parent;
		}

		return $this->parent_controller->create_item_permissions_check( $request );
	}

	/**
	 * Callback for creating a new revision post.
	 *
	 * @param WP_REST_Request $request
	 *
	 * @return WP_REST_Response|WP_Error
	 */
	public function create_item( $request ) {
		$parent = $this->get_parent( $request['parent'] );
		if ( is_wp_error( $parent ) ) {
			return $parent;
		}

		$public_statuses = get_post_stati( array( 'public' => true ) );
		if ( ! in_array( get_post_status( $parent ), $public_statuses, true ) ) {
			return new WP_Error(
				'rest_invalid_post',
				__( 'Revisions cannot be created for posts with non-public statuses.', 'revisions-extended' ),
				array( 'status' => 403 )
			);
		}

		// TODO prevent multiple pending revisions for the same post, and multiple scheduled revisions for a post at the same date/time.

		$prepared_post = $this->parent_controller->prepare_item_for_database( $request );

		// The revision author should be the current user rather than the parent post author.
		$prepared_post->post_author = get_current_user_id();

		$revision_id = put_post_revision( (array) $prepared_post, false, $prepared_post['post_status'] );

		if ( is_wp_error( $revision_id ) ) {
			return $revision_id;
		}

		$revision = get_post( $revision_id );
		$request->set_param( 'context', 'edit' );

		$response = $this->prepare_item_for_response( $revision, $request );
		$response = rest_ensure_response( $response );

		return $response;
	}

	/**
	 * Checks if a given request has access to update a revision.
	 *
	 * Revisions inherit permissions from the parent post,
	 * check if the current user has permission to edit the post.
	 *
	 * @param WP_REST_Request $request
	 *
	 * @return true|WP_Error
	 */
	public function update_item_permissions_check( $request ) {
		$parent = $this->get_parent( $request->get_param( 'parent' ) );
		if ( is_wp_error( $parent ) ) {
			return $parent;
		}

		$revision = $this->get_revision( $request['id'] );
		if ( is_wp_error( $revision ) ) {
			return $revision;
		}

		return $this->parent_controller->update_item_permissions_check( $request );
	}

	/**
	 * Callback for updating a specific revision post.
	 *
	 * @param WP_REST_Request $request
	 *
	 * @return WP_REST_Response|WP_Error
	 */
	public function update_item( $request ) {
		$parent = $this->get_parent( $request['parent'] );
		if ( is_wp_error( $parent ) ) {
			return $parent;
		}

		$revision = $this->get_revision( $request['id'] );
		if ( is_wp_error( $revision ) ) {
			return $revision;
		}

		$prepared_post     = $this->parent_controller->prepare_item_for_database( $request );
		$prepared_post->ID = $revision->ID;

		// Convert the post object to an array and add slashes, wp_update_post() expects escaped array.
		$revision_id = wp_update_post( wp_slash( (array) $prepared_post ), true );

		if ( is_wp_error( $revision_id ) ) {
			return $revision_id;
		}

		$revision = $this->get_revision( $revision_id );
		$request->set_param( 'context', 'edit' );

		$response = $this->prepare_item_for_response( $revision, $request );
		$response = rest_ensure_response( $response );

		return $response;
	}

	public function approve_item_permissions_check( $request ) {
		// TODO
	}

	public function approve_item( $request ) {
		// TODO
	}

	/**
	 * Retrieves the revision's schema, conforming to JSON Schema.
	 *
	 * @return array Item schema data.
	 */
	public function get_item_schema() {
		$schema = parent::get_item_schema();

		$schema['properties']['status'] = array(
			'description' => __( 'A named status for the object.' ),
			'type'        => 'string',
			'enum'        => wp_list_pluck( get_revision_statuses(), 'name' ),
			'context'     => array( 'view', 'edit' ),
		);

		return $schema;
	}

	/**
	 * Retrieves the query params for collections.
	 *
	 * @return array Collection parameters.
	 */
	public function get_collection_params() {
		$query_params = parent::get_collection_params();

		$query_params['status'] = array(
			'default'     => array( 'any' ),
			'description' => __( 'Limit result set to revisions assigned one or more statuses.', 'revisions-extended' ),
			'type'        => 'array',
			'items'       => array(
				'enum' => array_merge( array( 'any' ), wp_list_pluck( get_revision_statuses(), 'name' ) ),
				'type' => 'string',
			),
		);

		return $query_params;
	}

	/**
	 * Modify the query args for retrieving revision posts.
	 *
	 * @param array $args
	 * @param WP_REST_Request $request
	 *
	 * @return array
	 */
	public function filter_rest_revision_query( $args, $request ) {
		$registered = $this->get_collection_params();

		if ( isset( $registered['status'], $request['status'] ) && ! in_array( 'any', $request['status'], true ) ) {
			$args['post_status'] = $request['status'];
		} else {
			$args['post_status'] = wp_list_pluck( get_revision_statuses(), 'name' );
		}

		return $args;
	}

	/**
	 * Modify the revision data being prepared for the database.
	 *
	 * @param WP_REST_Response $response
	 * @param WP_Post $post
	 * @param WP_REST_Request $request
	 *
	 * @return WP_REST_Response
	 */
	public function filter_rest_prepare_revision( $response, $post, $request ) {
		$fields = $this->get_fields_for_response( $request );

		if ( in_array( 'status', $fields, true ) ) {
			$response->data['status'] = $post->post_status;
		}

		return $response;
	}
}
