/**
 * Provider Architecture for CineAtlas
 * 
 * This module defines the interface for video playback providers.
 * Supported providers:
 * - internet-archive: Public domain and licensed content from archive.org
 * - jellyfin: Self-hosted media library (optional)
 */

export const ProviderStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DISABLED: 'disabled',
  ERROR: 'error',
};

export const ProviderType = {
  INTERNET_ARCHIVE: 'internet-archive',
  JELLYFIN: 'jellyfin',
};
