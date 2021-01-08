<?php

namespace RevisionsExtended;

use WP_Error;
use WP_REST_Controller, WP_REST_Revisions_Controller, WP_REST_Request, WP_REST_Server;

defined( 'WPINC' ) || die();

/**
 * Manage pending and scheduled revisions via the REST API.
 *
 * @see WP_REST_Revisions_Controller
 * @see WP_REST_Controller
 */
class REST_Revisions_Controller extends WP_REST_Revisions_Controller {

	const STATUSES = array( 'inherit', 'revex_pending', 'revex_future' );

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
	 * @since 4.7.0
	 *
	 * @param string $parent_post_type Post type of the parent.
	 */
	public function __construct( $parent_post_type ) {
		parent::__construct( $parent_post_type );

		$this->namespace = 'revisions-extended/v1';
	}

	/**
	 * Registers the routes for revisions based on post types supporting revisions.
	 *
	 * @see register_rest_route()
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
	}

	public function get_items( $request ) {
		add_filter( 'rest_revision_query', array( $this, 'filter_rest_revision_query' ), 10, 2 );
		add_filter( 'rest_prepare_revision', array( $this, 'filter_rest_prepare_revision' ), 10, 3 );
		$response = parent::get_items( $request );
		remove_filter( 'rest_revision_query', array( $this, 'filter_rest_revision_query' ) );
		remove_filter( 'rest_prepare_revision', array( $this, 'filter_rest_prepare_revision' ) );

		return $response;
	}

	public function get_item( $request ) {
		add_filter( 'rest_prepare_revision', array( $this, 'filter_rest_prepare_revision' ), 10, 3 );
		$response = parent::get_item( $request );
		remove_filter( 'rest_prepare_revision', array( $this, 'filter_rest_prepare_revision' ) );

		return $response;
	}

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
	 * check if the current user has permission to edit the post.
	 *
	 * Modified from WP_REST_Autosaves_Controller::create_item_permissions_check.
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 * @return true|WP_Error True if the request has access to create the item, WP_Error object otherwise.
	 */
	public function create_item_permissions_check( $request ) {
		$id = $request->get_param( 'parent' );

		if ( empty( $id ) ) {
			return new WP_Error(
				'rest_post_invalid_id',
				__( 'Invalid item ID.' ),
				array( 'status' => 404 )
			);
		}

		return $this->parent_controller->update_item_permissions_check( $request );
	}

	public function create_item( $request ) {}

	public function update_item_permissions_check( $request ) {
		return $this->create_item_permissions_check( $request );
	}

	public function update_item( $request ) {}

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
			'enum'        => self::STATUSES,
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
			'default'     => 'inherit',
			'description' => __( 'Limit result set to revisions assigned one or more statuses.', 'revisions-extended' ),
			'type'        => 'array',
			'items'       => array(
				'enum' => self::STATUSES,
				'type' => 'string',
			),
		);

		return $query_params;
	}

	public function filter_rest_revision_query( $args, $request ) {
		$registered = $this->get_collection_params();

		$parameter_mappings = array(
			'status' => 'post_status',
		);

		foreach ( $parameter_mappings as $api_param => $wp_param ) {
			if ( isset( $registered[ $api_param ], $request[ $api_param ] ) ) {
				$args[ $wp_param ] = $request[ $api_param ];
			}
		}

		return $args;
	}

	public function filter_rest_prepare_revision( $response, $post, $request ) {
		$fields = $this->get_fields_for_response( $request );

		if ( in_array( 'status', $fields, true ) ) {
			$response->data['status'] = $post->post_status;
		}

		return $response;
	}
}
