const swaggerJsdoc = require('swagger-jsdoc');
const config = require('../../config/config');

/**
 * Swagger Configuration
 * OpenAPI 3.0 specification for Music Catalog API
 */

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Music Catalog API',
            version: '1.0.0',
            description: `Lightweight Music Catalog Microservice optimized for STB devices. Generated: ${new Date().toISOString()}`,
            contact: {
                name: 'Anggota B - Sistem Terintegrasi',
            },
            license: {
                name: 'ISC',
            },
        },
        servers: [
            {
                url: 'https://ibay.ibayderikfariqalghanzaka.my.id',
                description: 'STB Production server',
            },
            {
                url: 'http://localhost:3000',
                description: 'Local development server',
            },
        ],
        security: [
            {
                ApiKeyAuth: [],
            },
        ],
        components: {
            securitySchemes: {
                ApiKeyAuth: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'X-API-Key',
                    description: 'API Key for authentication. Use the key from your .env file',
                },
            },
            schemas: {
                Track: {
                    type: 'object',
                    properties: {
                        track_id: {
                            type: 'string',
                            description: 'Spotify Track ID',
                            example: '3322ArxAq7wCSZI4fF77Q0',
                        },
                        track_name: {
                            type: 'string',
                            description: 'Track name',
                            example: 'Please Don\'t Say You Love Me',
                        },
                        artists: {
                            type: 'string',
                            description: 'Artist name(s)',
                            example: 'Gabrielle Aplin',
                        },
                        track_genre: {
                            type: 'string',
                            description: 'Music genre',
                            example: 'acoustic',
                        },
                    },
                },
                Genre: {
                    type: 'string',
                    description: 'Music genre name',
                    example: 'acoustic',
                },
                Error: {
                    type: 'object',
                    properties: {
                        error: {
                            type: 'string',
                            description: 'Error message',
                            example: 'Invalid API Key',
                        },
                    },
                },
                PaginationMeta: {
                    type: 'object',
                    properties: {
                        total: {
                            type: 'integer',
                            description: 'Total number of records',
                            example: 3503,
                        },
                        page: {
                            type: 'integer',
                            description: 'Current page number',
                            example: 1,
                        },
                        limit: {
                            type: 'integer',
                            description: 'Number of items per page',
                            example: 20,
                        },
                        totalPages: {
                            type: 'integer',
                            description: 'Total number of pages',
                            example: 176,
                        },
                    },
                },
            },
            responses: {
                Unauthorized: {
                    description: 'Unauthorized - Invalid or missing API Key',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error',
                            },
                            example: {
                                error: 'Invalid API Key',
                            },
                        },
                    },
                },
                NotFound: {
                    description: 'Resource not found',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error',
                            },
                            example: {
                                error: 'Track not found',
                            },
                        },
                    },
                },
                ServerError: {
                    description: 'Internal server error',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error',
                            },
                            example: {
                                error: 'Database error',
                            },
                        },
                    },
                },
            },
        },
        tags: [
            {
                name: 'Tracks',
                description: 'Track management endpoints',
            },
            {
                name: 'Genres',
                description: 'Genre-related endpoints (public access)',
            },
        ],
    },
    apis: ['./src/interfaces/routes/*.js'], // Path to the API routes
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
