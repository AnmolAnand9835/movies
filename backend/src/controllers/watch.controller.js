import { InternetArchiveProvider } from '../providers/internet-archive.provider.js';
import { getJellyfinStatus, authenticateJellyfin, getJellyfinLibrary, getJellyfinMedia, getJellyfinItemMetadata, checkJellyfinPlayback } from '../providers/jellyfin.provider.js';
import { ProviderStatus, ProviderType } from '../types/provider.types.js';

export const getProviders = (req, res) => {
  const jellyfinStatus = isJellyfinConfigured()
    ? getJellyfinStatus()
    : { configured: false, available: false, description: 'Jellyfin not configured' };

  const providers = [
    {
      id: 'internet-archive',
      name: 'Internet Archive',
      type: ProviderType.INTERNET_ARCHIVE,
      status: ProviderStatus.ACTIVE,
      enabled: true,
      requiresAuth: false,
      description: 'Public domain and appropriately licensed videos from archive.org',
    },
    ...(jellyfinStatus.configured ? [{
      id: 'jellyfin',
      name: 'Jellyfin',
      type: ProviderType.JELLYFIN,
      status: ProviderStatus.ACTIVE,
      enabled: true,
      requiresAuth: true,
      description: 'User\'s self-hosted media library',
    }] : []),
  ];

  res.json({
    success: true,
    data: {
      providers,
      total: providers.length,
    },
  });
};

// Helper to check if Jellyfin is configured
const isJellyfinConfigured = () => {
  return !!(
    process.env.JELLYFIN_BASE_URL &&
    process.env.JELLYFIN_USERNAME
  );
};