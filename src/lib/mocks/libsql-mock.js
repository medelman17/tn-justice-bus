// Mock implementation for LibSQL to prevent import errors
module.exports = {
  createClient: () => ({
    execute: async () => ({ rows: [] }),
    batch: async () => ({ rows: [] }),
    sync: async () => {},
  }),
}; 