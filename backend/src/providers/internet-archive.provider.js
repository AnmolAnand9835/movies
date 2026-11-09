/**
 * Internet Archive Provider for CineAtlas
 * Provides access to public domain and appropriately licensed videos from archive.org.
 */

const ARCHIVE_BASE = 'https://archive.org';
const ADVANCED_SEARCH = `${ARCHIVE_BASE}/advancedsearch.php`;
const SUPPORTED_VIDEO_FORMATS = ['mp4', 'webm', 'ogg', 'mov', 'mkv', 'avi'];

export { ARCHIVE_BASE, ADVANCED_SEARCH, SUPPORTED_VIDEO_FORMATS };

const textValue = (value) => (
  Array.isArray(value) ? value.join(', ') : value == null ? '' : String(value)
);

const downloadUrl = (identifier, filename) => (
  `${ARCHIVE_BASE}/download/${encodeURIComponent(identifier)}/${encodeURIComponent(filename)}`
);

export class InternetArchiveProvider {
  constructor() {
    this.name = 'Internet Archive';
    this.type = 'internet-archive';
    this.status = 'initialized';
    this.enabled = true;
  }

  async search(query, page = 1, limit = 20) {
    if (!query || !query.trim()) {
      return { success: false, error: 'Search query required', results: [], total: 0 };
    }

    try {
      const rows = Math.min(Math.max(Number(limit) || 20, 1), 20);
      const startPage = Math.max(Number(page) || 1, 1);
      const params = new URLSearchParams({
        q: `${query.trim()} AND mediatype:movies`,
        'fl[]': 'identifier,title,description,year,creator',
        rows: String(rows),
        page: String(startPage),
        output: 'json',
      });
      const response = await fetch(`${ADVANCED_SEARCH}?${params}`);
      if (!response.ok) {
        throw new Error(`Archive search failed: ${response.status}`);
      }

      const data = await response.json();
      const docs = data.response?.docs || data.docs || [];
      const total = data.response?.numFound || data.numFound || 0;
      const results = [];

      for (const doc of docs) {
        if (!doc.identifier) continue;

        const details = await this.getDetails(doc.identifier);
        if (!details.success || !details.data.available) continue;

        results.push({
          ...details.data,
          title: textValue(doc.title) || details.data.title,
          description: textValue(doc.description) || details.data.description,
          year: Number(doc.year || details.data.year) || undefined,
          creator: textValue(doc.creator) || details.data.creator,
        });
      }

      return {
        success: true,
        results,
        total,
        page: startPage,
        total_pages: Math.ceil(total / rows),
      };
    } catch (error) {
      console.error('Internet Archive search error:', error);
      return { success: false, error: error.message, results: [], total: 0 };
    }
  }

  async getDetails(identifier) {
    try {
      const metadata = await this.fetchMetadata(identifier);
      if (!metadata) {
        return { success: false, error: 'Item not found' };
      }

      const videoFiles = this.filterVideoFiles(metadata.files || []);
      const playableFile = videoFiles.find((file) => (
        ['mp4', 'webm'].includes(this.getFileFormat(file.name))
      ));
      const format = playableFile ? this.getFileFormat(playableFile.name) : null;
      const license = textValue(metadata.license);
      const isApproved = this.isLicenseApproved(metadata);

      return {
        success: true,
        data: {
          identifier,
          title: textValue(metadata.title) || identifier,
          description: textValue(metadata.description),
          year: Number(metadata.year) || undefined,
          creator: textValue(metadata.creator) || undefined,
          license,
          available: isApproved && Boolean(playableFile),
          playback_url: isApproved && playableFile
            ? downloadUrl(identifier, playableFile.name)
            : null,
          format,
          available_formats: videoFiles.map((file) => this.getFileFormat(file.name)),
          license_info: {
            type: license,
            attribution_required: this.requiresAttribution(metadata),
          },
          metadata: {
            collection: metadata.collection,
            date_created: metadata.date_created,
            language: metadata.language,
          },
        },
      };
    } catch (error) {
      console.error('Internet Archive details error:', error);
      return { success: false, error: error.message };
    }
  }

  isLicenseApproved(metadata) {
    const license = textValue(metadata.license).toLowerCase();
    if (license.includes('public domain') || license.includes('pd.')) return true;
    if (
      license.includes('creative commons')
      || license.includes('cc-by')
      || license.includes('cc0')
    ) return true;

    const collection = textValue(metadata.collection).toLowerCase();
    return collection.includes('library_of_congress') || collection.includes('gov');
  }

  requiresAttribution(metadata) {
    const license = textValue(metadata.license).toLowerCase();
    const hasCreativeCommons = license.includes('creative commons') || license.includes('cc-by');
    const isPublicDomain = license.includes('public domain') || license.includes('pd.');
    return hasCreativeCommons && !isPublicDomain;
  }

  getFileFormat(filename) {
    if (!filename) return '';
    return filename.split('.').pop().toLowerCase();
  }

  filterVideoFiles(files) {
    return files
      .filter((file) => file && file.name)
      .filter((file) => SUPPORTED_VIDEO_FORMATS.includes(this.getFileFormat(file.name)));
  }

  async fetchMetadata(identifier) {
    try {
      const response = await fetch(
        `${ARCHIVE_BASE}/metadata/${encodeURIComponent(identifier)}?${new URLSearchParams({ format: 'json' })}`
      );
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error(`Failed to fetch metadata for ${identifier}:`, error);
      return null;
    }
  }
}
