# Video Timestamp Links Guide

## How to Add Video Timestamps to Page Headings

Use the `<VideoTimestamp />` component to add YouTube video jump-to-timestamp links in heading text.

### Setup (One-time)

Ensure import at top of markdown file:

```mdx
import VideoTimestamp from '@site/src/components/VideoTimestamp';
```

### Usage in Headings

Add the component inline with heading text:

```mdx
## Section Title <VideoTimestamp seconds={30} label="Jump to video @ 0:30" />
```

**Parameters:**
- `seconds` (number) – Time in seconds to jump to in the video
- `label` (string) – Hover text / link label shown to user

### Example

```mdx
## The Problem You're Solving <VideoTimestamp seconds={30} label="Jump to video @ 0:30" />

## Run the Demo Scene <VideoTimestamp seconds={60} label="Jump to video @ 1:00" />

## How It Works <VideoTimestamp seconds={90} label="Jump to video @ 1:30" />
```

### Where to Add

Currently used in: `docs/quick-start.md`

Timestamps are **removed** and will be re-added after correct video is available. When ready, add them back using the format above.

### Current Video Status

⚠️ Current video (YouTube ID: `4aqx69E9T4A`) is incorrect. Timestamps will be re-added after new video is confirmed.
