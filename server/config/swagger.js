/**
 * Swagger / OpenAPI 3.0 Configuration
 */
const swaggerJsDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Khalid Resilience — GRC Platform API',
      version: '1.0.0',
      description:
        'Enterprise Governance, Risk & Compliance API. Bilingual (Arabic/English). ' +
        'Supports ISO 31000, ISO 22301, NCA ECC, SAMA BCM, DGA, NDMO SUMOOD compliance.',
      contact: {
        name: 'Khalid Alghofaili',
        email: 'admin@khalid-resilience.com',
      },
    },
    servers: [
      { url: '/api/v1', description: 'API v1' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT obtained from POST /auth/login',
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Health', description: 'System health checks' },
      { name: 'Authentication', description: 'Login, MFA, token management' },
      { name: 'Risks', description: 'Risk management (ISO 31000)' },
      { name: 'BIA', description: 'Business Impact Analysis (ISO 22301)' },
      { name: 'Sumood', description: 'National Resilience Index (NDMO SUMOOD)' },
      { name: 'Vendors', description: 'Third-Party Risk Management' },
      { name: 'Incidents', description: 'Incident management & response' },
      { name: 'Quantification', description: 'Monte Carlo risk quantification' },
      { name: 'Regulatory', description: 'Regulatory intelligence' },
      { name: 'AI', description: 'AI Risk Intelligence Agent' },
      { name: 'Reports', description: 'PDF/Excel report exports' },
      { name: 'Audit', description: 'Immutable audit log' },
      { name: 'Workflow', description: 'BIA approval workflow' },
      { name: 'Admin', description: 'AI System administration' },
    ],
  },
  apis: ['./routes/*.js'],
};

module.exports = swaggerJsDoc(options);
