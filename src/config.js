// config.js
const config = {
    development: {
        apiUrl: 'http://localhost:3001',
    },
    production: {
        apiUrl: 'http://localhost:3001', // or whatever port you use in production
    },
};

const env = process.env.NODE_ENV || 'development';

export default config[env];