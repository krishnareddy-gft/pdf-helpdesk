# PDF HelpDesk

A production-ready PDF processing application built with Next.js 14, running entirely on Vercel with Vercel Blob storage.

## Features

- **Merge PDFs** - Combine multiple PDF files into one
- **Split PDF** - Split PDFs by page ranges
- **Extract Pages** - Extract specific pages from PDFs
- **Compress PDF** - Reduce file size while maintaining quality
- **Sign PDF** - Add digital signatures and text overlays
- **Lock/Unlock PDF** - Password protection (feature-flagged)

## Tech Stack

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** with dark theme
- **Framer Motion** for animations
- **PDF.js** for client-side PDF preview
- **pdf-lib** for server-side PDF processing
- **Vercel Blob** for file storage
- **Zod** for validation
- **React Hook Form** for forms

## Getting Started

### Prerequisites

- Node.js 18+ 
- Vercel account
- Vercel Blob storage setup

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd pdf-helpdesk
npm install
```

### 2. Environment Setup

Create a `.env.local` file:

```bash
cp env.example .env.local
```

Fill in your environment variables:

```env
# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN=your_blob_read_write_token_here

# Feature flags
NEXT_PUBLIC_ENABLE_LOCK=false

# Rate limiting (optional)
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=60000
```

### 3. Vercel Blob Setup

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Create a new project or select existing
3. Go to Storage tab and create a Blob store
4. Copy the `BLOB_READ_WRITE_TOKEN` to your `.env.local`

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

```bash
# Or use Vercel CLI
npm i -g vercel
vercel
```

### Environment Variables for Production

Make sure to set these in your Vercel project settings:

- `BLOB_READ_WRITE_TOKEN` - Your Vercel Blob token
- `NEXT_PUBLIC_ENABLE_LOCK` - Set to "true" to enable lock/unlock features

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── blob/          # Blob storage utilities
│   │   ├── merge/         # PDF merge endpoint
│   │   ├── split/         # PDF split endpoint
│   │   ├── extract/       # PDF extract endpoint
│   │   ├── compress/      # PDF compress endpoint
│   │   └── sign/          # PDF sign endpoint
│   ├── tools/             # Tool pages
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── ToolCard.tsx      # Tool card component
│   ├── Uploader.tsx      # File upload component
│   ├── PdfPreview.tsx    # PDF preview component
│   ├── OverlayCanvas.tsx # Signature overlay component
│   └── SidebarActions.tsx # Action sidebar
├── lib/                  # Utility libraries
│   ├── blob.ts          # Vercel Blob utilities
│   ├── pdf.ts           # PDF processing utilities
│   ├── ranges.ts        # Page range parsing
│   ├── retry.ts         # Retry logic for Blob consistency
│   ├── types.ts         # TypeScript types
│   └── utils.ts         # General utilities
└── public/              # Static assets
```

## API Endpoints

All endpoints accept JSON and return JSON responses:

### POST /api/merge
Merge multiple PDFs into one.

```json
{
  "files": ["blob_url_1", "blob_url_2"]
}
```

### POST /api/split
Split a PDF by page ranges.

```json
{
  "file": "blob_url",
  "ranges": [{"start": 1, "end": 3}, {"start": 5, "end": 5}]
}
```

### POST /api/extract
Extract specific pages from a PDF.

```json
{
  "file": "blob_url",
  "pages": [1, 3, 5]
}
```

### POST /api/compress
Compress a PDF file.

```json
{
  "file": "blob_url",
  "level": "balanced"
}
```

### POST /api/sign
Add overlays to a PDF.

```json
{
  "file": "blob_url",
  "overlays": [{
    "page": 1,
    "type": "text",
    "data": "Hello World",
    "x": 100,
    "y": 100
  }]
}
```

### POST /api/image-to-pdf
Convert images to PDF.

```json
{
  "files": ["blob_url_1", "blob_url_2"],
  "pageSize": "A4",
  "orientation": "portrait"
}
```

## File Flow

1. **Client Upload**: Files are uploaded directly to Vercel Blob using server-generated upload URLs
2. **Processing**: Server downloads files from Blob, processes them with pdf-lib
3. **Storage**: Results are uploaded back to Blob storage
4. **Download**: Client downloads processed files from Blob URLs

## Development

### Code Quality

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Format code
npx prettier --write .
```

### Testing

```bash
# Run tests (when implemented)
npm test

# E2E tests with Playwright
npx playwright test
```

## Performance Considerations

- **Client-side PDF.js**: Lazy-loaded for faster initial page load
- **Direct Blob uploads**: No server memory usage for large files
- **Retry logic**: Handles Vercel Blob eventual consistency
- **Optimized builds**: Tree-shaking and code splitting enabled

## Security

- **Input validation**: All API inputs validated with Zod schemas
- **File type restrictions**: Only PDF and image files accepted
- **Size limits**: Configurable file size limits
- **Rate limiting**: Optional rate limiting per IP
- **No permanent storage**: Files are processed and cleaned up

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
- Create an issue on GitHub
- Check the documentation
- Review the API endpoints

## Roadmap

- [ ] Advanced PDF editing features
- [ ] Batch processing
- [ ] User accounts and file history
- [ ] API rate limiting dashboard
- [ ] More compression algorithms
- [ ] OCR text extraction
- [ ] PDF form filling
