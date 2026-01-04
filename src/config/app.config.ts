export const MAPBOX_CONFIG = {
  accessToken: import.meta.env.VITE_MAPBOX_ACCESS_TOKEN,
  style: 'mapbox://styles/mapbox/streets-v12',
  center: [-74.006, 40.7128], // Default to NYC, will be updated based on data
  zoom: 10,
};

export const APP_CONFIG = {
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  environment: import.meta.env.VITE_ENVIRONMENT || 'development',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '',
};

export const TRACKING_CONFIG = {
  updateInterval: 30000, // 30 seconds
  geofenceRadius: 100, // meters
  locationAccuracyThreshold: 50, // meters
  maxRoutePoints: 1000,
};

export const CHAT_CONFIG = {
  messageLimit: 50,
  typingTimeout: 3000, // 3 seconds
  maxAttachmentSize: 10 * 1024 * 1024, // 10MB
};

export const SECURITY_CONFIG = {
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes
};
