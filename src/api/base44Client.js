import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "69041980d92f37b13e78d79b", 
  requiresAuth: true // Ensure authentication is required for all operations
});
