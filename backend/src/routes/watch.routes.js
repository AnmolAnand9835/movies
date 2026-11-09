import { getProviders } from '../controllers/watch.controller.js';
import { InternetArchiveProvider } from '../providers/internet-archive.provider.js';

const watchRoutes = (app) => {
  // Get available providers
  app.get('/api/v1/providers', getProviders);

  // Search across providers
  app.get('/api/v1/watch/search', async (req, res) => {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required',
      });
    }

    const results = [];

    // Search Internet Archive
    const archiveProvider = new InternetArchiveProvider();
    const archiveResults = await archiveProvider.search(query, req.query.page || 1, req.query.limit || 20);
    if (archiveResults.success && archiveResults.results.length > 0) {
      results.push({
        provider: 'internet-archive',
        results: archiveResults.results,
        total: archiveResults.total,
      });
    }

    res.json({
      success: true,
      data: {
        query,
        results,
        total: results.reduce((sum, r) => sum + (r.total || 0), 0),
      },
    });
  });

  // Get details for a specific provider item
  app.get('/api/v1/watch/details/:provider/:id', async (req, res) => {
    const { provider, id } = req.params;

    if (provider === 'internet-archive') {
      const archiveProvider = new InternetArchiveProvider();
      const details = await archiveProvider.getDetails(id);
      if (details.success) {
        return res.json(details);
      }
    }

    res.status(404).json({
      success: false,
      error: 'Provider or item not found',
    });
  });

  // Get sources for a specific provider item
  app.get('/api/v1/watch/sources/:provider/:id', async (req, res) => {
    const { provider, id } = req.params;

    if (provider === 'internet-archive') {
      const archiveProvider = new InternetArchiveProvider();
      const details = await archiveProvider.getDetails(id);
      if (details.success && details.data.available) {
        return res.json({
          success: true,
          data: {
            provider: 'internet-archive',
            available: true,
            title: details.data.title,
            playback_url: details.data.playback_url,
            format: details.data.format,
            license: details.data.license_info,
          },
        });
      }
    }

    res.json({
      success: false,
      data: {
        available: false,
      },
    });
  });

  // Check availability for a media type and ID
  app.get('/api/v1/watch/availability/:mediaType/:id', async (req, res) => {
    const { mediaType, id } = req.params;

    // Check Internet Archive
    const archiveProvider = new InternetArchiveProvider();
    const details = await archiveProvider.getDetails(id);

    if (details.success && details.data.available) {
      return res.json({
        success: true,
        data: {
          provider: 'internet-archive',
          available: true,
          title: details.data.title,
          playback_url: details.data.playback_url,
          format: details.data.format,
        },
      });
    }

    // If not available from any provider
    res.json({
      success: false,
      data: {
        available: false,
        message: 'Not available for playback',
      },
    });
  });

  // Health check
  app.get('/api/v1/watch/health', (req, res) => {
    res.json({
      success: true,
      data: {
        status: 'ok',
        providers: ['internet-archive'],
        timestamp: new Date().toISOString(),
      },
    });
  });
};

export default watchRoutes;