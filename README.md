# Swarm Ingestion Stream - React Example

This project provides a basic React client application demonstrating how to display HLS (HTTP Live Streaming) live and Video-on-Demand (VOD) streams delivered via the Swarm decentralized storage network. It showcases integration with backend services like the [Stream Aggregator (Solar-Punk-Ltd/swarm-stream-aggregator-js)](https://github.com/Solar-Punk-Ltd/swarm-stream-aggregator-js) and [MSSD Ingestion (Solar-Punk-Ltd/mssd-ingestion)](https://github.com/Solar-Punk-Ltd/mssd-ingestion).

## Table of Contents

- [Purpose](#purpose)
- [Core Technologies](#core-technologies)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [Cloning the Repository](#1-cloning-the-repository)
  - [Installing Dependencies](#2-installing-dependencies)
  - [Configuring Environment Variables](#3-configuring-environment-variables)
  - [Running the Development Server](#4-running-the-development-server)
- [Features Demonstrated](#features-demonstrated)
- [Key Concept: Custom `hls.js` Implementation](#key-concept-custom-hlsjs-implementation)
- [Related Repositories](#related-repositories)

## Purpose

The primary objective of this example application is to offer developers a practical, functional illustration of playing HLS streams from Swarm. By examining this codebase, you can:

- Understand the foundational setup required for consuming HLS media from Swarm.
- Observe a concrete example of how Swarm-based HLS streams (both live and VOD) can be integrated and played using a modified `hls.js` library.
- Gain a starting point for developing your own decentralized video streaming applications leveraging Swarm.

## Core Technologies

This example application interacts with or demonstrates the use of:

- **Swarm Network:** For decentralized storage and delivery of HLS media segments and manifests.
- **HLS (HTTP Live Streaming):** The streaming protocol used for segmenting and delivering video.
- **Custom `hls.js`:** A modified version of `hls.js` tailored for Swarm's content-addressed nature.
- **[Solar-Punk-Ltd/swarm-stream-aggregator-js](https://github.com/Solar-Punk-Ltd/swarm-stream-aggregator-js):** A backend service responsible for aggregating or managing stream metadata on Swarm Feeds.
- **[Solar-Punk-Ltd/mssd-ingestion](https://github.com/Solar-Punk-Ltd/mssd-ingestion):** A backend service for ingesting media and uploading it to Swarm.

## Prerequisites

Before you begin, please ensure you have the following installed and configured:

- [Node.js](https://nodejs.org/) (which includes npm for running scripts).
- [pnpm](https://pnpm.io/installation) (this project uses `pnpm` for package management).
- One or more [Swarm Bee nodes](https://docs.ethswarm.org/docs/bee/installation/install) running and accessible. This will be used by the application to fetch HLS manifests and segments from the Swarm network.

## Getting Started

Follow these steps to get the example application running locally:

### 1. Cloning the Repository

```bash
git clone [https://github.com/Solar-Punk-Ltd/swarm-ingestion-stream-react-example.git](https://github.com/Solar-Punk-Ltd/swarm-ingestion-stream-react-example.git)
cd swarm-ingestion-stream-react-example
```

````

### 2\. Installing Dependencies

This project uses `pnpm` for efficient package management.

```bash
pnpm install
```

### 3\. Configuring Environment Variables

The application requires certain environment variables to connect to Swarm and identify the target stream. Create a `.env` file in the root of the project directory by copying `.env.example` (if one exists) or by creating it manually.

Add the following variables to your `.env` file:

```env
# URL of your Swarm Bee node or a public gateway for reading stream data
VITE_READER_BEE_URL=http://localhost:1633

# The Swarm address of the owner of the feed written by the stream aggregator
VITE_APP_OWNER=YourStreamAggregatorFeedOwnerAddress (without 0x)

# The topic (name) of the feed written by the stream aggregator
VITE_APP_RAW_TOPIC=yourStreamAggregatorFeedTopic
```

### 4\. Running the Development Server

Once dependencies are installed and environment variables are configured, start the development server:

```bash
npm run dev
```

This command will launch the Vite development server, and you should be able to access the application in your web browser (typically at `http://localhost:5173` or a similar address).

## Features Demonstrated

- **Aggregated Feed Display:** Demonstrates fetching and displaying data from a Swarm feed managed by the "stream aggregator."
- **Swarm HLS Playback:** Showcases live and VOD HLS stream playback from Swarm using a customized `hls.js` player.

## Key Concept: Custom `hls.js` Implementation

A significant aspect of this example is its use of a modified `hls.js` library. This customization is necessary due to the nature of content addressing and mutable resources (Feeds) on Swarm.

**The Challenge:**
Standard `hls.js` expects the URL for HLS manifests (e.g., `master.m3u8`, `media.m3u8`) to be static or predictable. However, when new media segments are added to a live stream on Swarm, the manifest file is updated, and its content hash changes. Uploading this updated manifest to Swarm results in a new Swarm hash (address) for the manifest. This dynamic manifest URL breaks the default fetching mechanism of `hls.js`.

**The Solution:**
This example implements a custom manifest fetching and handling strategy within `hls.js` to address these challenges:

1.  **Dynamic Feed Lookup:** Instead of a static manifest URL, the player first performs a lookup on the stream's Swarm Feed to retrieve the latest version of the HLS manifest.
2.  **Proactive Next Index Fetching:** The custom loader asynchronously attempts to fetch the next potential update of the feed index. If a newer manifest exists, it's added to a local cache.
3.  **Cache Fallback:** If a newer manifest isn't immediately found (e.g., due to network latency or because the stream hasn't updated yet), the player serves the most recent manifest available from its cache.
4.  **Merged "EVENT" Manifest for Live Streams:** For live streams, the player might not be able to process segments as quickly as they are pruned from a rapidly updating live manifest. To mitigate this, the custom `hls.js` implementation takes incoming live manifests and merges them into a continuously growing "EVENT"-type playlist. This ensures that segments remain available in the manifest for a longer duration, allowing the player sufficient time to buffer and play them. This approach also enables playback from the beginning of the available live stream window.

This tailored `hls.js` ensures smoother playback and better resilience for HLS streams delivered over Swarm.

## Related Repositories

For more information on the backend components and the ecosystem, refer to:

- **MSSD Ingestion Service:** [Solar-Punk-Ltd/mssd-ingestion](https://github.com/Solar-Punk-Ltd/mssd-ingestion)
- **Stream Aggregator Library:** [Solar-Punk-Ltd/swarm-stream-aggregator-js](https://github.com/Solar-Punk-Ltd/swarm-stream-aggregator-js)
````
