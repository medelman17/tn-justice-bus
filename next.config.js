/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Disable OpenTelemetry
    instrumentationHook: false,
  },
  // Any existing config...
  
  webpack: (config, { isServer }) => {
    // Handle problematic files and modules
    config.module.rules.push({
      test: /\.md$/,
      use: 'ignore-loader',
    });
    
    // Prevent bundling of specific packages that cause issues
    if (isServer) {
      config.externals = [...(config.externals || []), 
        '@libsql/client',
        'bufferutil'
      ];
    }
    
    // Add module resolution aliases
    config.resolve.alias = {
      ...config.resolve.alias,
      '@libsql/client': require.resolve('./src/lib/mocks/libsql-mock.js'),
    };
    
    return config;
  },
}

module.exports = nextConfig 