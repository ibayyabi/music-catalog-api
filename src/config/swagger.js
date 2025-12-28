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
            description: 'Lightweight Music Catalog Microservice optimized for STB devices',
            contact: {
                name: 'Anggota B - Sistem Terintegrasi',
            },
            license: {
                name: 'ISC',
            },
        },
        servers: [
            {
                url: `http://localhost:${config.server.port}`,
                description: 'Development server',
            },
            {
                url: 'http://your-stb-ip:3000',
                description: 'STB Production server',
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
                        TrackId: {
                            type: 'integer',
                            description: 'Unique track identifier',
                            example: 1,
                        },
                        Name: {
                            type: 'string',
                            description: 'Track name',
                            example: 'For Those About To Rock (We Salute You)',
                        },
                        AlbumId: {
                            type: 'integer',
                            description: 'Album identifier',
                            example: 1,
                        },
                        MediaTypeId: {
                            type: 'integer',
                            description: 'Media type identifier',
                            example: 1,
                        },
                        GenreId: {
                            type: 'integer',
                            description: 'Genre identifier',
                            example: 1,
                        },
                        Composer: {
                            type: 'string',
                            description: 'Track composer',
                            example: 'Angus Young, Malcolm Young, Brian Johnson',
                            nullable: true,
                        },
                        Milliseconds: {
                            type: 'integer',
                            description: 'Track duration in milliseconds',
                            example: 343719,
                        },
                        Bytes: {
                            type: 'integer',
                            description: 'Track file size in bytes',
                            example: 11170334,
                            nullable: true,
                        },
                        UnitPrice: {
                            type: 'number',
                            format: 'decimal',
                            description: 'Track price',
                            example: 0.99,
                        },
                    },
                },
                Genre: {
                    type: 'object',
                    properties: {
                        GenreId: {
                            type: 'integer',
                            description: 'Genre identifier',
                            example: 1,
                        },
                        Name: {
                            type: 'string',
                            description: 'Genre name',
                            example: 'Rock',
                        },
                    },
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
