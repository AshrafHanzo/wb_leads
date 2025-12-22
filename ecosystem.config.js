// PM2 Ecosystem Configuration
// This file configures PM2 to manage the Node.js backend process

module.exports = {
    apps: [{
        name: 'wb-leads-backend',
        script: 'index.js',
        cwd: './server',
        instances: 1,
        autorestart: true,
        watch: false,
        max_memory_restart: '1G',
        env: {
            NODE_ENV: 'production',
            PORT: 3001
        },
        error_file: './logs/err.log',
        out_file: './logs/out.log',
        log_file: './logs/combined.log',
        time: true,
        merge_logs: true
    }]
};
