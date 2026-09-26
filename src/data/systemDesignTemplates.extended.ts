import type { TemplateDefinition } from '@/data/templateTypes';
import { TemplateBuilder } from '@/data/templateBuilders';

export const systemDesignTemplatesExtended: TemplateDefinition[] = [
  {
    id: 'sd-chat',
    name: 'Chat / WhatsApp',
    description: 'WebSocket mesh, message queue, presence, media CDN, multi-device sync',
    category: 'system-design',
    build: () => {
      const b = new TemplateBuilder('Chat Messenger', 'Real-time messaging at scale with presence and delivery guarantees');
      const edge = b.publicEdge(-16);
      const clients = b.mobileAndWebClients(-16);
      b.e(clients.mobile, edge.internet, 'HTTPS');
      b.e(clients.web, edge.internet, 'HTTPS');
      const ws = b.n('microservice', { x: -8, y: 0, z: -4 }, { name: 'WebSocket Gateway' });
      const chat = b.n('microservice', { x: 0, y: 0, z: -4 }, { name: 'Chat Service' });
      const presence = b.n('microservice', { x: 8, y: 0, z: -4 }, { name: 'Presence Service' });
      const media = b.n('microservice', { x: -4, y: 0, z: 0 }, { name: 'Media Upload' });
      const push = b.n('worker', { x: 4, y: 0, z: 0 }, { name: 'Push Delivery Workers' });
      const mq = b.n('message-queue', { x: 0, y: 0, z: 4 }, { name: 'Message Queue' });
      const kafka = b.n('kafka', { x: -6, y: 0, z: 4 }, { name: 'Chat Event Bus' });
      const presCache = b.n('cache', { x: 8, y: 0, z: 4 }, { name: 'Presence Cache' });
      const sessionCache = b.n('cache', { x: -8, y: 0, z: 4 }, { name: 'Session Router' });
      const dbPrimary = b.n('database', { x: -4, y: 0, z: 8 }, { name: 'Message Store Primary' });
      const dbReplica = b.n('database', { x: 0, y: 0, z: 8 }, { name: 'Message Read Replica' });
      const blobs = b.n('object-storage', { x: -8, y: 0, z: 8 }, { name: 'Media Blob Store' });
      b.e(edge.gw, ws, 'WebSocket').e(edge.gw, chat, 'gRPC').e(edge.gw, media, 'HTTP');
      b.e(ws, chat, 'gRPC').e(chat, mq, 'AMQP').e(mq, dbPrimary, 'TCP');
      b.e(chat, kafka, 'Kafka').e(kafka, push, 'Kafka').e(chat, presCache, 'TCP');
      b.e(presence, presCache, 'TCP').e(edge.gw, presence, 'gRPC');
      b.e(ws, sessionCache, 'TCP').e(media, blobs, 'HTTPS').e(edge.cdn, blobs, 'HTTPS');
      b.e(dbPrimary, dbReplica, 'TCP').e(chat, dbPrimary, 'TCP');
      b.observability(edge.gw);
      b.g('Edge', 'region', [edge.internet.id, edge.dns.id, edge.cdn.id, edge.lb.id, edge.gw.id, edge.auth.id], { min: { x: -11, y: -1, z: -18 }, max: { x: 11, y: 3, z: -8 } });
      b.g('Messaging', 'service-group', [ws.id, chat.id, presence.id, media.id, push.id, sessionCache.id], { min: { x: -10, y: -1, z: -6 }, max: { x: 10, y: 3, z: 2 } });
      b.g('Data', 'database-cluster', [mq.id, kafka.id, presCache.id, dbPrimary.id, dbReplica.id, blobs.id], { min: { x: -10, y: -1, z: 3 }, max: { x: 10, y: 3, z: 10 } });
      return b.build();
    },
  },
  {
    id: 'sd-uber',
    name: 'Uber / Ride Sharing',
    description: 'Geo indexing, dispatch, surge pricing, trip lifecycle, payment settlement',
    category: 'system-design',
    build: () => {
      const b = new TemplateBuilder('Uber Ride Sharing', 'Ride-hailing with real-time location and matching');
      const edge = b.publicEdge(-16);
      const rider = b.n('mobile-app', { x: -5, y: 0, z: -16 }, { name: 'Rider App' });
      const driver = b.n('mobile-app', { x: 5, y: 0, z: -16 }, { name: 'Driver App' });
      b.e(rider, edge.internet, 'HTTPS');
      b.e(driver, edge.internet, 'HTTPS');
      const location = b.n('microservice', { x: -8, y: 0, z: -4 }, { name: 'Location Service' });
      const matching = b.n('microservice', { x: 0, y: 0, z: -4 }, { name: 'Dispatch / Matching' });
      const trip = b.n('microservice', { x: 8, y: 0, z: -4 }, { name: 'Trip Service' });
      const pricing = b.n('microservice', { x: -4, y: 0, z: 0 }, { name: 'Surge Pricing' });
      const notify = b.n('microservice', { x: 4, y: 0, z: 0 }, { name: 'ETA Notifications' });
      const geo = b.n('cache', { x: -8, y: 0, z: 4 }, { name: 'Geo Hash Index' });
      const driverCache = b.n('cache', { x: 0, y: 0, z: 4 }, { name: 'Online Drivers Cache' });
      const kafka = b.n('kafka', { x: 6, y: 0, z: 4 }, { name: 'Trip Events' });
      const tripDb = b.n('database', { x: -4, y: 0, z: 8 }, { name: 'Trips DB' });
      const userDb = b.n('database', { x: 4, y: 0, z: 8 }, { name: 'Users DB' });
      const payment = b.n('external-api', { x: 8, y: 0, z: 8 }, { name: 'Payment Gateway' });
      const maps = b.n('external-api', { x: -8, y: 0, z: 8 }, { name: 'Maps API' });
      b.e(edge.gw, location, 'gRPC').e(edge.gw, matching, 'gRPC').e(edge.gw, trip, 'gRPC');
      b.e(location, geo, 'TCP').e(location, maps, 'HTTPS').e(matching, geo, 'TCP').e(matching, driverCache, 'TCP');
      b.e(matching, pricing, 'gRPC').e(trip, kafka, 'Kafka').e(trip, tripDb, 'TCP');
      b.e(trip, payment, 'HTTPS').e(kafka, notify, 'Kafka').e(edge.gw, userDb, 'TCP');
      b.observability(edge.gw);
      b.g('Edge', 'region', [edge.internet.id, edge.lb.id, edge.gw.id, rider.id, driver.id], { min: { x: -8, y: -1, z: -18 }, max: { x: 8, y: 3, z: -8 } });
      b.g('Core Services', 'service-group', [location.id, matching.id, trip.id, pricing.id, notify.id], { min: { x: -10, y: -1, z: -6 }, max: { x: 10, y: 3, z: 2 } });
      b.g('Data & Integrations', 'database-cluster', [geo.id, driverCache.id, kafka.id, tripDb.id, userDb.id, payment.id, maps.id], { min: { x: -10, y: -1, z: 3 }, max: { x: 12, y: 3, z: 10 } });
      return b.build();
    },
  },
  {
    id: 'sd-youtube',
    name: 'YouTube / Video Streaming',
    description: 'Upload pipeline, transcoding farm, CDN playback, recommendations, comments',
    category: 'system-design',
    build: () => {
      const b = new TemplateBuilder('YouTube Video Streaming', 'Video platform with upload, transcode, and global CDN delivery');
      const edge = b.publicEdge(-16);
      const clients = b.mobileAndWebClients(-16);
      b.e(clients.mobile, edge.internet, 'HTTPS');
      b.e(clients.web, edge.internet, 'HTTPS');
      const upload = b.n('microservice', { x: -8, y: 0, z: -4 }, { name: 'Upload API' });
      const stream = b.n('microservice', { x: 0, y: 0, z: -4 }, { name: 'Playback API' });
      const meta = b.n('microservice', { x: 8, y: 0, z: -4 }, { name: 'Metadata Service' });
      const transcode = b.n('worker', { x: -8, y: 0, z: 0 }, { name: 'Transcode Workers' });
      const thumb = b.n('worker', { x: -4, y: 0, z: 0 }, { name: 'Thumbnail Workers' });
      const reco = b.n('microservice', { x: 4, y: 0, z: 0 }, { name: 'Recommendation' });
      const comments = b.n('microservice', { x: 8, y: 0, z: 0 }, { name: 'Comments Service' });
      const kafka = b.n('kafka', { x: 0, y: 0, z: 4 }, { name: 'Video Pipeline Events' });
      const videos = b.n('object-storage', { x: -6, y: 0, z: 8 }, { name: 'Video Object Store' });
      const catalog = b.n('database', { x: 4, y: 0, z: 8 }, { name: 'Video Catalog DB' });
      const viewCache = b.n('cache', { x: 0, y: 0, z: 8 }, { name: 'View Count Cache' });
      b.e(edge.gw, upload, 'HTTP').e(edge.gw, stream, 'HTTP').e(edge.gw, meta, 'gRPC');
      b.e(edge.cdn, videos, 'HTTPS').e(upload, transcode, 'gRPC').e(transcode, videos, 'HTTPS');
      b.e(upload, thumb, 'gRPC').e(upload, kafka, 'Kafka').e(kafka, meta, 'Kafka');
      b.e(stream, catalog, 'TCP').e(stream, viewCache, 'TCP').e(reco, catalog, 'TCP');
      b.e(edge.gw, reco, 'HTTP').e(comments, catalog, 'TCP').e(meta, catalog, 'TCP');
      b.observability(edge.gw);
      b.g('Edge & CDN', 'region', [edge.internet.id, edge.cdn.id, edge.lb.id, edge.gw.id], { min: { x: -10, y: -1, z: -18 }, max: { x: 10, y: 3, z: -8 } });
      b.g('Video Services', 'service-group', [upload.id, stream.id, meta.id, transcode.id, thumb.id, reco.id, comments.id], { min: { x: -10, y: -1, z: -6 }, max: { x: 10, y: 3, z: 2 } });
      b.g('Storage', 'database-cluster', [kafka.id, videos.id, catalog.id, viewCache.id], { min: { x: -8, y: -1, z: 3 }, max: { x: 10, y: 3, z: 10 } });
      return b.build();
    },
  },
  {
    id: 'sd-netflix',
    name: 'Netflix / OTT',
    description: 'Open Connect CDN, personalized rows, playback tokens, A/B experimentation',
    category: 'system-design',
    build: () => {
      const b = new TemplateBuilder('Netflix OTT', 'Global streaming with edge caches and ML recommendations');
      const edge = b.publicEdge(-16);
      const tv = b.n('client', { x: -4, y: 0, z: -16 }, { name: 'Smart TV Client' });
      const mobile = b.n('mobile-app', { x: 4, y: 0, z: -16 }, { name: 'Mobile App' });
      b.e(tv, edge.internet, 'HTTPS');
      b.e(mobile, edge.internet, 'HTTPS');
      const playback = b.n('microservice', { x: -6, y: 0, z: -4 }, { name: 'Playback Service' });
      const reco = b.n('microservice', { x: 0, y: 0, z: -4 }, { name: 'Recommendation Engine' });
      const catalog = b.n('microservice', { x: 6, y: 0, z: -4 }, { name: 'Catalog Service' });
      const ab = b.n('microservice', { x: -6, y: 0, z: 0 }, { name: 'A/B Experimentation' });
      const entitle = b.n('microservice', { x: 6, y: 0, z: 0 }, { name: 'Entitlements' });
      const catalogCache = b.n('cache', { x: 0, y: 0, z: 4 }, { name: 'Catalog Cache' });
      const sessionCache = b.n('cache', { x: -6, y: 0, z: 4 }, { name: 'Session Tokens' });
      const kafka = b.n('kafka', { x: 6, y: 0, z: 4 }, { name: 'Viewing Events' });
      const encoded = b.n('object-storage', { x: -8, y: 0, z: 8 }, { name: 'Encoded Video Assets' });
      const userDb = b.n('database', { x: 4, y: 0, z: 8 }, { name: 'User & Profile DB' });
      const mlStore = b.n('object-storage', { x: 0, y: 0, z: 8 }, { name: 'ML Feature Store' });
      b.e(edge.gw, playback, 'HTTP').e(edge.gw, reco, 'HTTP').e(edge.gw, catalog, 'gRPC');
      b.e(edge.cdn, encoded, 'HTTPS').e(playback, sessionCache, 'TCP').e(playback, entitle, 'gRPC');
      b.e(reco, catalogCache, 'TCP').e(reco, mlStore, 'HTTPS').e(catalog, catalogCache, 'TCP');
      b.e(catalog, userDb, 'TCP').e(ab, kafka, 'Kafka').e(playback, kafka, 'Kafka');
      b.e(entitle, userDb, 'TCP');
      b.observability(edge.gw);
      b.g('Edge', 'region', [edge.internet.id, edge.cdn.id, edge.lb.id, tv.id, mobile.id], { min: { x: -8, y: -1, z: -18 }, max: { x: 10, y: 3, z: -8 } });
      b.g('Streaming Tier', 'service-group', [edge.gw.id, playback.id, reco.id, catalog.id, ab.id, entitle.id], { min: { x: -8, y: -1, z: -6 }, max: { x: 8, y: 3, z: 2 } });
      b.g('Data', 'database-cluster', [catalogCache.id, sessionCache.id, kafka.id, encoded.id, userDb.id, mlStore.id], { min: { x: -10, y: -1, z: 3 }, max: { x: 10, y: 3, z: 10 } });
      return b.build();
    },
  },
  {
    id: 'sd-spotify',
    name: 'Spotify / Music Streaming',
    description: 'Adaptive bitrate streaming, playlist graph, audio CDN, listening history pipeline',
    category: 'system-design',
    build: () => {
      const b = new TemplateBuilder('Spotify', 'Music streaming with offline sync and social playlists');
      const edge = b.publicEdge(-16);
      const clients = b.mobileAndWebClients(-16);
      b.e(clients.mobile, edge.internet, 'HTTPS');
      b.e(clients.web, edge.internet, 'HTTPS');
      const stream = b.n('microservice', { x: -8, y: 0, z: -4 }, { name: 'Streaming Service' });
      const catalog = b.n('microservice', { x: 0, y: 0, z: -4 }, { name: 'Catalog Service' });
      const playlist = b.n('microservice', { x: 8, y: 0, z: -4 }, { name: 'Playlist Service' });
      const search = b.n('search-engine', { x: -4, y: 0, z: 0 }, { name: 'Music Search' });
      const history = b.n('worker', { x: 4, y: 0, z: 0 }, { name: 'Listening History Workers' });
      const sessionCache = b.n('cache', { x: -8, y: 0, z: 4 }, { name: 'Session Cache' });
      const playlistCache = b.n('cache', { x: 8, y: 0, z: 4 }, { name: 'Playlist Cache' });
      const kafka = b.n('kafka', { x: 0, y: 0, z: 4 }, { name: 'Play Events' });
      const audio = b.n('object-storage', { x: -6, y: 0, z: 8 }, { name: 'Audio Files' });
      const musicDb = b.n('database', { x: 4, y: 0, z: 8 }, { name: 'Music Metadata DB' });
      const socialDb = b.n('database', { x: 8, y: 0, z: 8 }, { name: 'Social Graph DB' });
      b.e(edge.gw, stream, 'HTTP').e(edge.gw, catalog, 'gRPC').e(edge.gw, playlist, 'gRPC');
      b.e(edge.cdn, audio, 'HTTPS').e(stream, sessionCache, 'TCP').e(stream, audio, 'HTTPS');
      b.e(catalog, musicDb, 'TCP').e(catalog, search, 'HTTP').e(playlist, playlistCache, 'TCP');
      b.e(playlist, socialDb, 'TCP').e(stream, kafka, 'Kafka').e(kafka, history, 'Kafka');
      b.e(history, musicDb, 'TCP');
      b.observability(edge.gw);
      b.g('Edge & CDN', 'region', [edge.internet.id, edge.cdn.id, edge.lb.id, edge.gw.id], { min: { x: -10, y: -1, z: -18 }, max: { x: 10, y: 3, z: -8 } });
      b.g('Music Services', 'service-group', [stream.id, catalog.id, playlist.id, search.id, history.id], { min: { x: -10, y: -1, z: -6 }, max: { x: 10, y: 3, z: 2 } });
      b.g('Data', 'database-cluster', [sessionCache.id, playlistCache.id, kafka.id, audio.id, musicDb.id, socialDb.id], { min: { x: -8, y: -1, z: 3 }, max: { x: 10, y: 3, z: 10 } });
      return b.build();
    },
  },
  {
    id: 'sd-ecommerce',
    name: 'E-Commerce (Amazon)',
    description: 'Catalog, cart, checkout, inventory, search, order events, fraud checks',
    category: 'system-design',
    build: () => {
      const b = new TemplateBuilder('E-Commerce Platform', 'Full retail stack with search, cart, and fulfillment events');
      const edge = b.publicEdge(-16);
      const clients = b.mobileAndWebClients(-16);
      b.e(clients.mobile, edge.internet, 'HTTPS');
      b.e(clients.web, edge.internet, 'HTTPS');
      const catalog = b.n('microservice', { x: -8, y: 0, z: -4 }, { name: 'Catalog Service' });
      const cart = b.n('microservice', { x: -2, y: 0, z: -4 }, { name: 'Cart Service' });
      const order = b.n('microservice', { x: 4, y: 0, z: -4 }, { name: 'Order Service' });
      const payment = b.n('microservice', { x: 8, y: 0, z: -4 }, { name: 'Payment Service' });
      const inventory = b.n('microservice', { x: -6, y: 0, z: 0 }, { name: 'Inventory Service' });
      const fraud = b.n('microservice', { x: 6, y: 0, z: 0 }, { name: 'Fraud Detection' });
      const search = b.n('search-engine', { x: -8, y: 0, z: 4 }, { name: 'Product Search' });
      const cartCache = b.n('cache', { x: -2, y: 0, z: 4 }, { name: 'Cart Cache' });
      const invCache = b.n('cache', { x: -6, y: 0, z: 4 }, { name: 'Stock Cache' });
      const kafka = b.n('kafka', { x: 2, y: 0, z: 4 }, { name: 'Order Events' });
      const ordersDb = b.n('database', { x: 4, y: 0, z: 8 }, { name: 'Orders DB' });
      const catalogDb = b.n('database', { x: -4, y: 0, z: 8 }, { name: 'Catalog DB' });
      const warehouse = b.n('worker', { x: 8, y: 0, z: 4 }, { name: 'Fulfillment Workers' });
      b.e(edge.gw, catalog, 'gRPC').e(edge.gw, cart, 'gRPC').e(edge.gw, order, 'gRPC');
      b.e(catalog, catalogDb, 'TCP').e(catalog, search, 'HTTP').e(cart, cartCache, 'TCP');
      b.e(order, payment, 'gRPC').e(payment, fraud, 'gRPC').e(order, kafka, 'Kafka');
      b.e(kafka, warehouse, 'Kafka').e(inventory, invCache, 'TCP').e(inventory, catalogDb, 'TCP');
      b.e(order, ordersDb, 'TCP').e(payment, ordersDb, 'TCP').e(order, inventory, 'gRPC');
      b.observability(edge.gw);
      b.g('Edge', 'region', [edge.internet.id, edge.lb.id, edge.gw.id, edge.auth.id], { min: { x: -11, y: -1, z: -18 }, max: { x: 11, y: 3, z: -8 } });
      b.g('Commerce Services', 'service-group', [catalog.id, cart.id, order.id, payment.id, inventory.id, fraud.id, warehouse.id], { min: { x: -10, y: -1, z: -6 }, max: { x: 10, y: 3, z: 2 } });
      b.g('Data', 'database-cluster', [search.id, cartCache.id, invCache.id, kafka.id, ordersDb.id, catalogDb.id], { min: { x: -10, y: -1, z: 3 }, max: { x: 10, y: 3, z: 10 } });
      return b.build();
    },
  },
  {
    id: 'sd-web-search',
    name: 'Web Search (Google)',
    description: 'Query serving, inverted index shards, crawler pipeline, spell correction',
    category: 'system-design',
    build: () => {
      const b = new TemplateBuilder('Web Search Engine', 'Large-scale web search with offline indexing pipeline');
      const edge = b.publicEdge(-16);
      const clients = b.mobileAndWebClients(-16);
      b.e(clients.mobile, edge.internet, 'HTTPS');
      b.e(clients.web, edge.internet, 'HTTPS');
      const query = b.n('search-engine', { x: 0, y: 0, z: -4 }, { name: 'Query Service' });
      const spell = b.n('microservice', { x: -6, y: 0, z: -4 }, { name: 'Spell Correction' });
      const rank = b.n('worker', { x: 6, y: 0, z: -4 }, { name: 'Ranking Workers' });
      const snippet = b.n('microservice', { x: -6, y: 0, z: 0 }, { name: 'Snippet Generator' });
      const queryCache = b.n('cache', { x: 0, y: 0, z: 0 }, { name: 'Query Result Cache' });
      const crawler = b.n('worker', { x: -8, y: 0, z: 4 }, { name: 'Crawlers' });
      const parser = b.n('worker', { x: -2, y: 0, z: 4 }, { name: 'Parser Workers' });
      const frontier = b.n('message-queue', { x: -8, y: 0, z: 0 }, { name: 'URL Frontier' });
      const kafka = b.n('kafka', { x: 2, y: 0, z: 4 }, { name: 'Page Pipeline' });
      const index = b.n('database', { x: 6, y: 0, z: 4 }, { name: 'Inverted Index Shards' });
      const docStore = b.n('object-storage', { x: 0, y: 0, z: 8 }, { name: 'Document Store' });
      const clickLog = b.n('kafka', { x: -4, y: 0, z: 8 }, { name: 'Click Logs' });
      b.e(edge.lb, query, 'HTTPS').e(query, spell, 'gRPC').e(query, queryCache, 'TCP');
      b.e(query, index, 'HTTP').e(query, rank, 'gRPC').e(query, snippet, 'gRPC');
      b.e(frontier, crawler, 'AMQP').e(crawler, kafka, 'Kafka').e(kafka, parser, 'Kafka');
      b.e(parser, index, 'TCP').e(parser, docStore, 'HTTPS').e(parser, frontier, 'AMQP');
      b.e(query, clickLog, 'Kafka');
      b.observability(edge.gw);
      b.g('Edge', 'region', [edge.internet.id, edge.dns.id, edge.lb.id, edge.gw.id], { min: { x: -10, y: -1, z: -18 }, max: { x: 10, y: 3, z: -8 } });
      b.g('Search Serving', 'service-group', [query.id, spell.id, rank.id, snippet.id, queryCache.id], { min: { x: -8, y: -1, z: -6 }, max: { x: 8, y: 3, z: 2 } });
      b.g('Indexing Pipeline', 'database-cluster', [frontier.id, crawler.id, parser.id, kafka.id, index.id, docStore.id, clickLog.id], { min: { x: -10, y: -1, z: 3 }, max: { x: 10, y: 3, z: 10 } });
      return b.build();
    },
  },
  {
    id: 'sd-google-docs',
    name: 'Google Docs / Collaboration',
    description: 'Operational transform, realtime WebSocket, version history, permission ACLs',
    category: 'system-design',
    build: () => {
      const b = new TemplateBuilder('Google Docs', 'Collaborative documents with OT and realtime sync');
      const edge = b.publicEdge(-16);
      const clients = b.mobileAndWebClients(-16);
      b.e(clients.mobile, edge.internet, 'HTTPS');
      b.e(clients.web, edge.internet, 'HTTPS');
      const ws = b.n('microservice', { x: -6, y: 0, z: -4 }, { name: 'Realtime Gateway' });
      const collab = b.n('microservice', { x: 0, y: 0, z: -4 }, { name: 'Collab / OT Service' });
      const doc = b.n('microservice', { x: 6, y: 0, z: -4 }, { name: 'Document Service' });
      const acl = b.n('microservice', { x: -6, y: 0, z: 0 }, { name: 'Permissions / ACL' });
      const snapshot = b.n('worker', { x: 6, y: 0, z: 0 }, { name: 'Snapshot Workers' });
      const activeCache = b.n('cache', { x: 0, y: 0, z: 0 }, { name: 'Active Doc Cache' });
      const kafka = b.n('kafka', { x: -4, y: 0, z: 4 }, { name: 'Edit Event Stream' });
      const docDb = b.n('database', { x: 4, y: 0, z: 4 }, { name: 'Document DB' });
      const versionStore = b.n('object-storage', { x: 0, y: 0, z: 8 }, { name: 'Version History Blobs' });
      const userDb = b.n('database', { x: -6, y: 0, z: 8 }, { name: 'User / Share DB' });
      b.e(edge.gw, ws, 'WebSocket').e(edge.gw, doc, 'HTTP').e(ws, collab, 'gRPC');
      b.e(collab, activeCache, 'TCP').e(collab, kafka, 'Kafka').e(doc, docDb, 'TCP');
      b.e(kafka, snapshot, 'Kafka').e(snapshot, versionStore, 'HTTPS').e(kafka, docDb, 'Kafka');
      b.e(edge.gw, acl, 'gRPC').e(acl, userDb, 'TCP').e(doc, acl, 'gRPC');
      b.e(edge.auth, acl, 'gRPC');
      b.observability(edge.gw);
      b.g('Edge', 'region', [edge.internet.id, edge.lb.id, edge.gw.id, edge.auth.id], { min: { x: -11, y: -1, z: -18 }, max: { x: 11, y: 3, z: -8 } });
      b.g('Collaboration', 'service-group', [ws.id, collab.id, doc.id, acl.id, snapshot.id, activeCache.id], { min: { x: -8, y: -1, z: -6 }, max: { x: 8, y: 3, z: 2 } });
      b.g('Persistence', 'database-cluster', [kafka.id, docDb.id, versionStore.id, userDb.id], { min: { x: -8, y: -1, z: 3 }, max: { x: 8, y: 3, z: 10 } });
      return b.build();
    },
  },
  {
    id: 'sd-dropbox',
    name: 'Dropbox / File Sync',
    description: 'Block-level sync, metadata service, deduplication, conflict resolution workers',
    category: 'system-design',
    build: () => {
      const b = new TemplateBuilder('Dropbox File Sync', 'Multi-device file sync with block storage');
      const edge = b.publicEdge(-16);
      const desktop = b.n('client', { x: -4, y: 0, z: -16 }, { name: 'Desktop Client' });
      const mobile = b.n('mobile-app', { x: 4, y: 0, z: -16 }, { name: 'Mobile Client' });
      b.e(desktop, edge.internet, 'HTTPS');
      b.e(mobile, edge.internet, 'HTTPS');
      const sync = b.n('microservice', { x: -6, y: 0, z: -4 }, { name: 'Sync Service' });
      const metadata = b.n('microservice', { x: 6, y: 0, z: -4 }, { name: 'Metadata Service' });
      const upload = b.n('microservice', { x: 0, y: 0, z: -4 }, { name: 'Block Upload API' });
      const workers = b.n('worker', { x: 0, y: 0, z: 0 }, { name: 'Sync / Conflict Workers' });
      const dedup = b.n('worker', { x: -6, y: 0, z: 0 }, { name: 'Dedup Workers' });
      const notify = b.n('microservice', { x: 6, y: 0, z: 0 }, { name: 'Change Notifications' });
      const metaCache = b.n('cache', { x: 6, y: 0, z: 4 }, { name: 'Metadata Cache' });
      const kafka = b.n('kafka', { x: 0, y: 0, z: 4 }, { name: 'File Change Events' });
      const blocks = b.n('object-storage', { x: -6, y: 0, z: 8 }, { name: 'Block Storage' });
      const metaDb = b.n('database', { x: 4, y: 0, z: 8 }, { name: 'File Metadata DB' });
      const metaReplica = b.n('database', { x: 8, y: 0, z: 8 }, { name: 'Metadata Replica' });
      b.e(edge.gw, sync, 'HTTPS').e(edge.gw, metadata, 'HTTPS').e(edge.gw, upload, 'HTTPS');
      b.e(sync, workers, 'gRPC').e(upload, blocks, 'HTTPS').e(upload, dedup, 'gRPC');
      b.e(metadata, metaCache, 'TCP').e(metadata, metaDb, 'TCP').e(metaDb, metaReplica, 'TCP');
      b.e(workers, blocks, 'HTTPS').e(workers, kafka, 'Kafka').e(kafka, notify, 'Kafka');
      b.e(sync, metaDb, 'TCP');
      b.observability(edge.gw);
      b.g('Edge', 'region', [edge.internet.id, edge.lb.id, edge.gw.id, desktop.id, mobile.id], { min: { x: -8, y: -1, z: -18 }, max: { x: 8, y: 3, z: -8 } });
      b.g('Sync Tier', 'service-group', [sync.id, metadata.id, upload.id, workers.id, dedup.id, notify.id], { min: { x: -8, y: -1, z: -6 }, max: { x: 8, y: 3, z: 2 } });
      b.g('Storage', 'database-cluster', [metaCache.id, kafka.id, blocks.id, metaDb.id, metaReplica.id], { min: { x: -8, y: -1, z: 3 }, max: { x: 10, y: 3, z: 10 } });
      return b.build();
    },
  },
  {
    id: 'sd-rate-limiter',
    name: 'Rate Limiter',
    description: 'Distributed token bucket, Redis cluster, edge enforcement, quota tiers',
    category: 'system-design',
    build: () => {
      const b = new TemplateBuilder('Distributed Rate Limiter', 'High-throughput API rate limiting with Redis');
      const edge = b.publicEdge(-16);
      const clients = b.mobileAndWebClients(-16);
      b.e(clients.mobile, edge.internet, 'HTTPS');
      b.e(clients.web, edge.internet, 'HTTPS');
      const limiter = b.n('microservice', { x: -4, y: 0, z: -4 }, { name: 'Rate Limiter Service' });
      const policy = b.n('microservice', { x: 4, y: 0, z: -4 }, { name: 'Quota Policy Service' });
      const api = b.n('application-server', { x: 0, y: 0, z: 0 }, { name: 'Protected API Tier' });
      const admin = b.n('web-server', { x: -8, y: 0, z: 0 }, { name: 'Admin Console' });
      const redisA = b.n('cache', { x: -6, y: 0, z: 4 }, { name: 'Redis Shard A' });
      const redisB = b.n('cache', { x: 0, y: 0, z: 4 }, { name: 'Redis Shard B' });
      const redisC = b.n('cache', { x: 6, y: 0, z: 4 }, { name: 'Redis Shard C' });
      const policyDb = b.n('database', { x: 4, y: 0, z: 8 }, { name: 'Policy Config DB' });
      const kafka = b.n('kafka', { x: -4, y: 0, z: 8 }, { name: 'Rate Limit Events' });
      const sync = b.n('worker', { x: 0, y: 0, z: 8 }, { name: 'Counter Sync Workers' });
      b.chain([edge.lb, limiter, api], 'HTTPS');
      b.e(edge.gw, policy, 'gRPC').e(policy, policyDb, 'TCP');
      b.e(limiter, redisA, 'TCP').e(limiter, redisB, 'TCP').e(limiter, redisC, 'TCP');
      b.e(limiter, kafka, 'Kafka').e(kafka, sync, 'Kafka').e(sync, redisA, 'TCP');
      b.e(edge.gw, admin, 'HTTPS').e(admin, policyDb, 'TCP');
      b.observability(edge.gw);
      b.g('Edge', 'region', [edge.internet.id, edge.lb.id, edge.gw.id, limiter.id], { min: { x: -10, y: -1, z: -18 }, max: { x: 10, y: 3, z: -6 } });
      b.g('Enforcement', 'service-group', [policy.id, api.id, admin.id, sync.id], { min: { x: -10, y: -1, z: -6 }, max: { x: 10, y: 3, z: 2 } });
      b.g('Counters', 'database-cluster', [redisA.id, redisB.id, redisC.id, policyDb.id, kafka.id], { min: { x: -8, y: -1, z: 3 }, max: { x: 8, y: 3, z: 10 } });
      return b.build();
    },
  },
  {
    id: 'sd-notifications',
    name: 'Notification System',
    description: 'Event ingestion, channel routing, template engine, delivery workers, preferences',
    category: 'system-design',
    build: () => {
      const b = new TemplateBuilder('Notification System', 'Multi-channel notifications with user preferences');
      const edge = b.publicEdge(-16);
      const mobile = b.n('mobile-app', { x: 0, y: 0, z: -16 }, { name: 'User App' });
      b.e(mobile, edge.internet, 'HTTPS');
      const producers = b.n('microservice', { x: -8, y: 0, z: -4 }, { name: 'Product Services' });
      const ingest = b.n('microservice', { x: 0, y: 0, z: -4 }, { name: 'Notification Ingest' });
      const router = b.n('microservice', { x: 8, y: 0, z: -4 }, { name: 'Channel Router' });
      const templates = b.n('microservice', { x: -4, y: 0, z: 0 }, { name: 'Template Engine' });
      const prefs = b.n('microservice', { x: 4, y: 0, z: 0 }, { name: 'Preferences API' });
      const workers = b.n('worker', { x: 0, y: 0, z: 4 }, { name: 'Delivery Workers' });
      const retry = b.n('message-queue', { x: -6, y: 0, z: 4 }, { name: 'Retry Queue' });
      const kafka = b.n('kafka', { x: -8, y: 0, z: 0 }, { name: 'Notification Events' });
      const push = b.n('external-api', { x: -4, y: 0, z: 8 }, { name: 'Push Provider' });
      const email = b.n('external-api', { x: 0, y: 0, z: 8 }, { name: 'Email Provider' });
      const sms = b.n('external-api', { x: 4, y: 0, z: 8 }, { name: 'SMS Provider' });
      const prefDb = b.n('database', { x: 8, y: 0, z: 4 }, { name: 'Preferences DB' });
      const dedupCache = b.n('cache', { x: 8, y: 0, z: 8 }, { name: 'Dedup Cache' });
      b.e(producers, kafka, 'Kafka').e(kafka, ingest, 'Kafka').e(ingest, router, 'gRPC');
      b.e(router, templates, 'gRPC').e(router, prefs, 'gRPC').e(prefs, prefDb, 'TCP');
      b.e(edge.gw, prefs, 'HTTP').e(router, workers, 'gRPC').e(workers, push, 'HTTPS');
      b.e(workers, email, 'HTTPS').e(workers, sms, 'HTTPS').e(workers, retry, 'AMQP');
      b.e(retry, workers, 'AMQP').e(router, dedupCache, 'TCP');
      b.observability(edge.gw);
      b.g('Ingress', 'region', [edge.internet.id, edge.lb.id, edge.gw.id, producers.id], { min: { x: -10, y: -1, z: -18 }, max: { x: 10, y: 3, z: -6 } });
      b.g('Notification Core', 'service-group', [ingest.id, router.id, templates.id, prefs.id, workers.id], { min: { x: -10, y: -1, z: -6 }, max: { x: 10, y: 3, z: 2 } });
      b.g('Delivery & Data', 'database-cluster', [retry.id, kafka.id, push.id, email.id, sms.id, prefDb.id, dedupCache.id], { min: { x: -8, y: -1, z: 3 }, max: { x: 10, y: 3, z: 10 } });
      return b.build();
    },
  },
  {
    id: 'sd-ticketmaster',
    name: 'Ticketmaster / Flash Sale',
    description: 'Virtual waiting room, seat inventory locks, async booking, payment capture',
    category: 'system-design',
    build: () => {
      const b = new TemplateBuilder('Ticketmaster', 'High-concurrency event ticketing with queueing');
      const edge = b.publicEdge(-16);
      const clients = b.mobileAndWebClients(-16);
      b.e(clients.mobile, edge.internet, 'HTTPS');
      b.e(clients.web, edge.internet, 'HTTPS');
      const waiting = b.n('microservice', { x: -6, y: 0, z: -4 }, { name: 'Waiting Room' });
      const booking = b.n('microservice', { x: 0, y: 0, z: -4 }, { name: 'Booking Service' });
      const catalog = b.n('microservice', { x: 6, y: 0, z: -4 }, { name: 'Event Catalog' });
      const inventory = b.n('cache', { x: -4, y: 0, z: 0 }, { name: 'Seat Inventory Cache' });
      const queue = b.n('message-queue', { x: 4, y: 0, z: 0 }, { name: 'Booking Queue' });
      const workers = b.n('worker', { x: 4, y: 0, z: 4 }, { name: 'Booking Workers' });
      const hold = b.n('cache', { x: -6, y: 0, z: 4 }, { name: 'Seat Hold Locks' });
      const kafka = b.n('kafka', { x: 0, y: 0, z: 4 }, { name: 'Sale Events' });
      const bookingsDb = b.n('database', { x: 0, y: 0, z: 8 }, { name: 'Bookings DB' });
      const eventsDb = b.n('database', { x: 6, y: 0, z: 8 }, { name: 'Events DB' });
      const payment = b.n('external-api', { x: -4, y: 0, z: 8 }, { name: 'Payment Gateway' });
      b.e(edge.gw, waiting, 'HTTP').e(waiting, queue, 'AMQP').e(edge.gw, catalog, 'HTTP');
      b.e(edge.gw, booking, 'HTTP').e(booking, queue, 'AMQP').e(queue, workers, 'AMQP');
      b.e(workers, inventory, 'TCP').e(workers, hold, 'TCP').e(workers, bookingsDb, 'TCP');
      b.e(workers, payment, 'HTTPS').e(workers, kafka, 'Kafka').e(catalog, eventsDb, 'TCP');
      b.e(booking, inventory, 'TCP');
      b.observability(edge.gw);
      b.g('Edge', 'region', [edge.internet.id, edge.lb.id, edge.gw.id, edge.auth.id], { min: { x: -11, y: -1, z: -18 }, max: { x: 11, y: 3, z: -8 } });
      b.g('Ticketing', 'service-group', [waiting.id, booking.id, catalog.id, workers.id], { min: { x: -8, y: -1, z: -6 }, max: { x: 8, y: 3, z: 2 } });
      b.g('Inventory & Payments', 'database-cluster', [inventory.id, queue.id, hold.id, kafka.id, bookingsDb.id, eventsDb.id, payment.id], { min: { x: -8, y: -1, z: 3 }, max: { x: 10, y: 3, z: 10 } });
      return b.build();
    },
  },
  {
    id: 'sd-yelp',
    name: 'Yelp / Nearby Places',
    description: 'Geo search, business profiles, reviews, photo CDN, ranking signals',
    category: 'system-design',
    build: () => {
      const b = new TemplateBuilder('Yelp Nearby', 'Local business discovery with geo queries');
      const edge = b.publicEdge(-16);
      const mobile = b.n('mobile-app', { x: 0, y: 0, z: -16 }, { name: 'Yelp Mobile' });
      b.e(mobile, edge.internet, 'HTTPS');
      const geoSearch = b.n('search-engine', { x: -6, y: 0, z: -4 }, { name: 'Geo Search' });
      const business = b.n('microservice', { x: 6, y: 0, z: -4 }, { name: 'Business Service' });
      const reviews = b.n('microservice', { x: 0, y: 0, z: -4 }, { name: 'Reviews Service' });
      const rank = b.n('worker', { x: -6, y: 0, z: 0 }, { name: 'Ranking Workers' });
      const photos = b.n('microservice', { x: 6, y: 0, z: 0 }, { name: 'Photo Service' });
      const geoIndex = b.n('cache', { x: -6, y: 0, z: 4 }, { name: 'Geo Spatial Index' });
      const bizCache = b.n('cache', { x: 6, y: 0, z: 4 }, { name: 'Business Profile Cache' });
      const kafka = b.n('kafka', { x: 0, y: 0, z: 4 }, { name: 'Review Events' });
      const businessDb = b.n('database', { x: 4, y: 0, z: 8 }, { name: 'Business DB' });
      const reviewDb = b.n('database', { x: -4, y: 0, z: 8 }, { name: 'Reviews DB' });
      const searchIndex = b.n('search-engine', { x: 0, y: 0, z: 8 }, { name: 'Full-Text Index' });
      b.e(edge.gw, geoSearch, 'HTTP').e(edge.gw, business, 'HTTP').e(edge.gw, reviews, 'HTTP');
      b.e(geoSearch, geoIndex, 'TCP').e(geoSearch, rank, 'gRPC').e(business, bizCache, 'TCP');
      b.e(business, businessDb, 'TCP').e(reviews, reviewDb, 'TCP').e(reviews, kafka, 'Kafka');
      b.e(kafka, searchIndex, 'Kafka').e(photos, edge.cdn, 'HTTPS').e(photos, businessDb, 'TCP');
      b.e(edge.cdn, photos, 'HTTPS');
      b.observability(edge.gw);
      b.g('Edge & CDN', 'region', [edge.internet.id, edge.cdn.id, edge.lb.id, edge.gw.id, mobile.id], { min: { x: -10, y: -1, z: -18 }, max: { x: 10, y: 3, z: -8 } });
      b.g('Discovery', 'service-group', [geoSearch.id, business.id, reviews.id, rank.id, photos.id], { min: { x: -8, y: -1, z: -6 }, max: { x: 8, y: 3, z: 2 } });
      b.g('Data', 'database-cluster', [geoIndex.id, bizCache.id, kafka.id, businessDb.id, reviewDb.id, searchIndex.id], { min: { x: -8, y: -1, z: 3 }, max: { x: 10, y: 3, z: 10 } });
      return b.build();
    },
  },
  {
    id: 'sd-leaderboard',
    name: 'Leaderboard / Gaming',
    description: 'Real-time scores, sorted-set cache, aggregation pipeline, anti-cheat checks',
    category: 'system-design',
    build: () => {
      const b = new TemplateBuilder('Gaming Leaderboard', 'Global leaderboards with event-driven score updates');
      const edge = b.publicEdge(-16);
      const mobile = b.n('mobile-app', { x: 0, y: 0, z: -16 }, { name: 'Game Client' });
      b.e(mobile, edge.internet, 'HTTPS');
      const game = b.n('microservice', { x: -6, y: 0, z: -4 }, { name: 'Game Service' });
      const board = b.n('microservice', { x: 6, y: 0, z: -4 }, { name: 'Leaderboard API' });
      const match = b.n('microservice', { x: 0, y: 0, z: -4 }, { name: 'Matchmaking' });
      const anticheat = b.n('microservice', { x: -6, y: 0, z: 0 }, { name: 'Anti-Cheat' });
      const aggregator = b.n('worker', { x: 0, y: 0, z: 0 }, { name: 'Score Aggregator' });
      const kafka = b.n('kafka', { x: -4, y: 0, z: 4 }, { name: 'Score Events' });
      const redis = b.n('cache', { x: 6, y: 0, z: 4 }, { name: 'Sorted Set Leaderboard' });
      const sessionCache = b.n('cache', { x: -6, y: 0, z: 4 }, { name: 'Player Session Cache' });
      const playerDb = b.n('database', { x: -2, y: 0, z: 8 }, { name: 'Player DB' });
      const statsDb = b.n('database', { x: 4, y: 0, z: 8 }, { name: 'Historical Stats DB' });
      const archive = b.n('object-storage', { x: 0, y: 0, z: 8 }, { name: 'Replay Archive' });
      b.e(edge.gw, game, 'HTTPS').e(edge.gw, board, 'HTTPS').e(edge.gw, match, 'gRPC');
      b.e(game, sessionCache, 'TCP').e(game, kafka, 'Kafka').e(kafka, aggregator, 'Kafka');
      b.e(aggregator, redis, 'TCP').e(board, redis, 'TCP').e(game, anticheat, 'gRPC');
      b.e(game, playerDb, 'TCP').e(aggregator, statsDb, 'TCP').e(game, archive, 'HTTPS');
      b.observability(edge.gw);
      b.g('Edge', 'region', [edge.internet.id, edge.lb.id, edge.gw.id, mobile.id], { min: { x: -10, y: -1, z: -18 }, max: { x: 10, y: 3, z: -8 } });
      b.g('Game Tier', 'service-group', [game.id, board.id, match.id, anticheat.id, aggregator.id], { min: { x: -8, y: -1, z: -6 }, max: { x: 8, y: 3, z: 2 } });
      b.g('Scores & Storage', 'database-cluster', [kafka.id, redis.id, sessionCache.id, playerDb.id, statsDb.id, archive.id], { min: { x: -8, y: -1, z: 3 }, max: { x: 10, y: 3, z: 10 } });
      return b.build();
    },
  },
  {
    id: 'sd-payments',
    name: 'Payment System (Stripe-like)',
    description: 'Payment intents, double-entry ledger, fraud ML, idempotency, reconciliation',
    category: 'system-design',
    build: () => {
      const b = new TemplateBuilder('Payment System', 'Card payments with ledger and fraud pipeline');
      const edge = b.publicEdge(-16);
      const clients = b.mobileAndWebClients(-16);
      b.e(clients.mobile, edge.internet, 'HTTPS');
      b.e(clients.web, edge.internet, 'HTTPS');
      const payment = b.n('microservice', { x: -4, y: 0, z: -4 }, { name: 'Payment Service' });
      const wallet = b.n('microservice', { x: 4, y: 0, z: -4 }, { name: 'Wallet / Balance' });
      const fraud = b.n('microservice', { x: 0, y: 0, z: -4 }, { name: 'Fraud Detection' });
      const idempotency = b.n('cache', { x: -8, y: 0, z: 0 }, { name: 'Idempotency Keys' });
      const webhook = b.n('worker', { x: 8, y: 0, z: 0 }, { name: 'Webhook Workers' });
      const reconcile = b.n('worker', { x: 0, y: 0, z: 0 }, { name: 'Reconciliation Workers' });
      const ledger = b.n('database', { x: -6, y: 0, z: 4 }, { name: 'Ledger DB' });
      const ledgerReplica = b.n('database', { x: -10, y: 0, z: 4 }, { name: 'Ledger Read Replica' });
      const kafka = b.n('kafka', { x: 4, y: 0, z: 4 }, { name: 'Payment Events' });
      const cardNet = b.n('external-api', { x: 8, y: 0, z: 4 }, { name: 'Card Networks' });
      const vault = b.n('object-storage', { x: -4, y: 0, z: 8 }, { name: 'PCI Token Vault' });
      const audit = b.n('database', { x: 4, y: 0, z: 8 }, { name: 'Audit Log DB' });
      b.e(edge.gw, payment, 'HTTPS').e(edge.gw, wallet, 'gRPC').e(payment, fraud, 'gRPC');
      b.e(payment, idempotency, 'TCP').e(payment, ledger, 'TCP').e(ledger, ledgerReplica, 'TCP');
      b.e(payment, cardNet, 'HTTPS').e(payment, vault, 'HTTPS').e(payment, kafka, 'Kafka');
      b.e(kafka, webhook, 'Kafka').e(kafka, reconcile, 'Kafka').e(reconcile, ledger, 'TCP');
      b.e(fraud, audit, 'TCP').e(wallet, ledger, 'TCP');
      b.observability(edge.gw);
      b.g('Edge', 'region', [edge.internet.id, edge.lb.id, edge.gw.id, edge.auth.id], { min: { x: -11, y: -1, z: -18 }, max: { x: 11, y: 3, z: -8 } });
      b.g('Payments', 'service-group', [payment.id, wallet.id, fraud.id, webhook.id, reconcile.id], { min: { x: -10, y: -1, z: -6 }, max: { x: 10, y: 3, z: 2 } });
      b.g('Ledger & Compliance', 'database-cluster', [idempotency.id, ledger.id, ledgerReplica.id, kafka.id, cardNet.id, vault.id, audit.id], { min: { x: -12, y: -1, z: 3 }, max: { x: 12, y: 3, z: 10 } });
      return b.build();
    },
  },
  {
    id: 'sd-typeahead',
    name: 'Typeahead / Autocomplete',
    description: 'Prefix trie cache, trending queries, log aggregation, search index refresh',
    category: 'system-design',
    build: () => {
      const b = new TemplateBuilder('Typeahead Autocomplete', 'Low-latency autocomplete with offline aggregation');
      const edge = b.publicEdge(-16);
      const clients = b.mobileAndWebClients(-16);
      b.e(clients.mobile, edge.internet, 'HTTPS');
      b.e(clients.web, edge.internet, 'HTTPS');
      const suggest = b.n('microservice', { x: 0, y: 0, z: -4 }, { name: 'Suggest API' });
      const normalize = b.n('microservice', { x: -6, y: 0, z: -4 }, { name: 'Query Normalizer' });
      const rank = b.n('worker', { x: 6, y: 0, z: -4 }, { name: 'Ranking Workers' });
      const trie = b.n('cache', { x: -4, y: 0, z: 0 }, { name: 'Prefix Trie Cache' });
      const trending = b.n('cache', { x: 4, y: 0, z: 0 }, { name: 'Trending Queries' });
      const index = b.n('search-engine', { x: 6, y: 0, z: 0 }, { name: 'Search Index' });
      const kafka = b.n('kafka', { x: 0, y: 0, z: 4 }, { name: 'Query Logs' });
      const aggregator = b.n('worker', { x: -4, y: 0, z: 4 }, { name: 'Aggregation Workers' });
      const batch = b.n('worker', { x: 4, y: 0, z: 4 }, { name: 'Index Refresh Workers' });
      const catalogDb = b.n('database', { x: 0, y: 0, z: 8 }, { name: 'Catalog DB' });
      const logStore = b.n('object-storage', { x: -6, y: 0, z: 8 }, { name: 'Raw Query Logs' });
      b.e(edge.lb, suggest, 'HTTPS').e(suggest, normalize, 'gRPC').e(suggest, trie, 'TCP');
      b.e(suggest, trending, 'TCP').e(suggest, index, 'HTTP').e(suggest, rank, 'gRPC');
      b.e(suggest, kafka, 'Kafka').e(kafka, aggregator, 'Kafka').e(aggregator, trie, 'TCP');
      b.e(aggregator, logStore, 'HTTPS').e(kafka, batch, 'Kafka').e(batch, index, 'HTTP');
      b.e(batch, catalogDb, 'TCP');
      b.observability(edge.gw);
      b.g('Edge', 'region', [edge.internet.id, edge.lb.id, edge.gw.id], { min: { x: -10, y: -1, z: -18 }, max: { x: 10, y: 3, z: -8 } });
      b.g('Suggest Tier', 'service-group', [suggest.id, normalize.id, rank.id, aggregator.id, batch.id], { min: { x: -8, y: -1, z: -6 }, max: { x: 8, y: 3, z: 2 } });
      b.g('Indexes', 'database-cluster', [trie.id, trending.id, index.id, kafka.id, catalogDb.id, logStore.id], { min: { x: -8, y: -1, z: 3 }, max: { x: 10, y: 3, z: 10 } });
      return b.build();
    },
  },
  {
    id: 'sd-hotel-booking',
    name: 'Hotel Booking (Booking.com)',
    description: 'Search filters, availability cache, reservations, payments, supplier integrations',
    category: 'system-design',
    build: () => {
      const b = new TemplateBuilder('Hotel Booking', 'Travel reservations with inventory and payments');
      const edge = b.publicEdge(-16);
      const clients = b.mobileAndWebClients(-16);
      b.e(clients.mobile, edge.internet, 'HTTPS');
      b.e(clients.web, edge.internet, 'HTTPS');
      const search = b.n('microservice', { x: -6, y: 0, z: -4 }, { name: 'Hotel Search' });
      const reserve = b.n('microservice', { x: 6, y: 0, z: -4 }, { name: 'Reservation Service' });
      const pricing = b.n('microservice', { x: 0, y: 0, z: -4 }, { name: 'Dynamic Pricing' });
      const supplier = b.n('microservice', { x: -6, y: 0, z: 0 }, { name: 'Supplier Integration' });
      const avail = b.n('cache', { x: 0, y: 0, z: 0 }, { name: 'Availability Cache' });
      const searchIndex = b.n('search-engine', { x: -6, y: 0, z: 4 }, { name: 'Hotel Search Index' });
      const kafka = b.n('kafka', { x: 6, y: 0, z: 0 }, { name: 'Booking Events' });
      const hotelsDb = b.n('database', { x: -4, y: 0, z: 8 }, { name: 'Hotels DB' });
      const bookingsDb = b.n('database', { x: 4, y: 0, z: 8 }, { name: 'Reservations DB' });
      const payment = b.n('external-api', { x: 8, y: 0, z: 8 }, { name: 'Payment API' });
      const confirm = b.n('worker', { x: 6, y: 0, z: 4 }, { name: 'Confirmation Workers' });
      const partner = b.n('external-api', { x: -8, y: 0, z: 8 }, { name: 'Hotel Partners API' });
      b.e(edge.gw, search, 'HTTP').e(edge.gw, reserve, 'HTTP').e(search, avail, 'TCP');
      b.e(search, searchIndex, 'HTTP').e(search, hotelsDb, 'TCP').e(reserve, avail, 'TCP');
      b.e(reserve, pricing, 'gRPC').e(reserve, bookingsDb, 'TCP').e(reserve, payment, 'HTTPS');
      b.e(reserve, kafka, 'Kafka').e(kafka, confirm, 'Kafka').e(supplier, partner, 'HTTPS');
      b.e(supplier, hotelsDb, 'TCP').e(confirm, bookingsDb, 'TCP');
      b.observability(edge.gw);
      b.g('Edge', 'region', [edge.internet.id, edge.lb.id, edge.gw.id, edge.auth.id], { min: { x: -11, y: -1, z: -18 }, max: { x: 11, y: 3, z: -8 } });
      b.g('Booking Services', 'service-group', [search.id, reserve.id, pricing.id, supplier.id, confirm.id], { min: { x: -8, y: -1, z: -6 }, max: { x: 8, y: 3, z: 2 } });
      b.g('Inventory & Payments', 'database-cluster', [avail.id, searchIndex.id, kafka.id, hotelsDb.id, bookingsDb.id, payment.id, partner.id], { min: { x: -10, y: -1, z: 3 }, max: { x: 10, y: 3, z: 10 } });
      return b.build();
    },
  },
  {
    id: 'sd-stock-exchange',
    name: 'Stock Exchange / Trading',
    description: 'Order gateway, matching engine, market data fanout, trade persistence',
    category: 'system-design',
    build: () => {
      const b = new TemplateBuilder('Stock Exchange', 'Low-latency trading with market data distribution');
      const edge = b.publicEdge(-16);
      const trader = b.n('client', { x: -4, y: 0, z: -16 }, { name: 'Trading Terminal' });
      const mobile = b.n('mobile-app', { x: 4, y: 0, z: -16 }, { name: 'Mobile Trader' });
      b.e(trader, edge.internet, 'HTTPS');
      b.e(mobile, edge.internet, 'HTTPS');
      const orders = b.n('microservice', { x: -6, y: 0, z: -4 }, { name: 'Order Gateway' });
      const risk = b.n('microservice', { x: 6, y: 0, z: -4 }, { name: 'Risk Checks' });
      const matching = b.n('application-server', { x: 0, y: 0, z: -4 }, { name: 'Matching Engine' });
      const marketData = b.n('microservice', { x: 6, y: 0, z: 0 }, { name: 'Market Data API' });
      const book = b.n('cache', { x: 0, y: 0, z: 0 }, { name: 'In-Memory Order Book' });
      const kafka = b.n('kafka', { x: -6, y: 0, z: 0 }, { name: 'Market Data Feed' });
      const settle = b.n('worker', { x: -6, y: 0, z: 4 }, { name: 'Settlement Workers' });
      const tradeLog = b.n('database', { x: 0, y: 0, z: 4 }, { name: 'Trade Log DB' });
      const reference = b.n('database', { x: 6, y: 0, z: 4 }, { name: 'Reference Data DB' });
      const archive = b.n('object-storage', { x: -2, y: 0, z: 8 }, { name: 'Tick Archive' });
      const wsFeed = b.n('microservice', { x: 4, y: 0, z: 8 }, { name: 'WebSocket Feed' });
      b.e(edge.gw, orders, 'gRPC').e(orders, risk, 'gRPC').e(orders, matching, 'TCP');
      b.e(matching, book, 'TCP').e(matching, kafka, 'Kafka').e(matching, tradeLog, 'TCP');
      b.e(kafka, marketData, 'Kafka').e(kafka, wsFeed, 'Kafka').e(kafka, settle, 'Kafka');
      b.e(settle, tradeLog, 'TCP').e(orders, reference, 'TCP').e(kafka, archive, 'HTTPS');
      b.e(trader, wsFeed, 'WebSocket');
      b.observability(edge.gw);
      b.g('Edge', 'region', [edge.internet.id, edge.lb.id, edge.gw.id, trader.id, mobile.id], { min: { x: -8, y: -1, z: -18 }, max: { x: 10, y: 3, z: -8 } });
      b.g('Trading Core', 'service-group', [orders.id, risk.id, matching.id, marketData.id, settle.id, wsFeed.id], { min: { x: -8, y: -1, z: -6 }, max: { x: 8, y: 3, z: 2 } });
      b.g('Market Data', 'database-cluster', [book.id, kafka.id, tradeLog.id, reference.id, archive.id], { min: { x: -8, y: -1, z: 3 }, max: { x: 10, y: 3, z: 10 } });
      return b.build();
    },
  },
  {
    id: 'sd-zoom',
    name: 'Zoom / Video Conferencing',
    description: 'Signaling, SFU media plane, TURN relay, recordings, calendar integrations',
    category: 'system-design',
    build: () => {
      const b = new TemplateBuilder('Video Conferencing', 'Realtime meetings with media routing and recordings');
      const edge = b.publicEdge(-16);
      const clients = b.mobileAndWebClients(-16);
      b.e(clients.mobile, edge.internet, 'HTTPS');
      b.e(clients.web, edge.internet, 'HTTPS');
      const signal = b.n('microservice', { x: -6, y: 0, z: -4 }, { name: 'Signaling Service' });
      const sfu = b.n('application-server', { x: 6, y: 0, z: -4 }, { name: 'Media SFU' });
      const rooms = b.n('microservice', { x: 0, y: 0, z: -4 }, { name: 'Room / Session Service' });
      const calendar = b.n('external-api', { x: -8, y: 0, z: 0 }, { name: 'Calendar APIs' });
      const turn = b.n('external-api', { x: 6, y: 0, z: 0 }, { name: 'TURN / STUN' });
      const record = b.n('worker', { x: 0, y: 0, z: 0 }, { name: 'Recording Workers' });
      const chat = b.n('microservice', { x: -6, y: 0, z: 0 }, { name: 'In-Meeting Chat' });
      const sessionCache = b.n('cache', { x: 0, y: 0, z: 4 }, { name: 'Active Session Cache' });
      const kafka = b.n('kafka', { x: -6, y: 0, z: 4 }, { name: 'Meeting Events' });
      const recordings = b.n('object-storage', { x: 4, y: 0, z: 4 }, { name: 'Recordings Store' });
      const sessionDb = b.n('database', { x: 0, y: 0, z: 8 }, { name: 'Session DB' });
      const userDb = b.n('database', { x: -6, y: 0, z: 8 }, { name: 'User DB' });
      b.e(edge.lb, signal, 'WebSocket').e(signal, sfu, 'gRPC').e(signal, rooms, 'gRPC');
      b.e(clients.web, sfu, 'WebSocket').e(sfu, turn, 'HTTPS').e(sfu, record, 'gRPC');
      b.e(record, recordings, 'HTTPS').e(rooms, sessionCache, 'TCP').e(rooms, sessionDb, 'TCP');
      b.e(signal, kafka, 'Kafka').e(chat, kafka, 'Kafka').e(edge.gw, calendar, 'HTTPS');
      b.e(edge.gw, userDb, 'TCP').e(signal, userDb, 'TCP');
      b.observability(edge.gw);
      b.g('Edge', 'region', [edge.internet.id, edge.lb.id, edge.gw.id, edge.auth.id], { min: { x: -11, y: -1, z: -18 }, max: { x: 11, y: 3, z: -8 } });
      b.g('Realtime', 'service-group', [signal.id, sfu.id, rooms.id, record.id, chat.id], { min: { x: -8, y: -1, z: -6 }, max: { x: 8, y: 3, z: 2 } });
      b.g('Media & Sessions', 'database-cluster', [calendar.id, turn.id, sessionCache.id, kafka.id, recordings.id, sessionDb.id, userDb.id], { min: { x: -10, y: -1, z: 3 }, max: { x: 10, y: 3, z: 10 } });
      return b.build();
    },
  },
  {
    id: 'sd-web-crawler',
    name: 'Web Crawler',
    description: 'URL frontier, distributed fetchers, dedup, parser pipeline, index builder',
    category: 'system-design',
    build: () => {
      const b = new TemplateBuilder('Web Crawler', 'Large-scale web crawling and indexing pipeline');
      const scheduler = b.n('api-gateway', { x: 0, y: 0, z: -12 }, { name: 'Crawl Scheduler' });
      const dns = b.n('dns', { x: -6, y: 0, z: -12 }, { name: 'DNS Resolver' });
      const frontier = b.n('message-queue', { x: 0, y: 0, z: -8 }, { name: 'URL Frontier' });
      const priority = b.n('microservice', { x: 6, y: 0, z: -8 }, { name: 'Priority Scorer' });
      const fetchA = b.n('worker', { x: -8, y: 0, z: -4 }, { name: 'Fetch Workers A' });
      const fetchB = b.n('worker', { x: -2, y: 0, z: -4 }, { name: 'Fetch Workers B' });
      const dedup = b.n('cache', { x: 6, y: 0, z: -4 }, { name: 'URL Dedup Cache' });
      const robots = b.n('cache', { x: -6, y: 0, z: -4 }, { name: 'Robots.txt Cache' });
      const parser = b.n('worker', { x: 0, y: 0, z: 0 }, { name: 'Parser Workers' });
      const kafka = b.n('kafka', { x: 0, y: 0, z: 4 }, { name: 'Crawl Pipeline' });
      const htmlStore = b.n('object-storage', { x: -6, y: 0, z: 4 }, { name: 'Raw HTML Store' });
      const index = b.n('search-engine', { x: 6, y: 0, z: 4 }, { name: 'Index Builder' });
      const linkDb = b.n('database', { x: 0, y: 0, z: 8 }, { name: 'Link Graph DB' });
      const stats = b.n('monitoring', { x: 8, y: 0, z: 0 }, { name: 'Crawl Metrics' });
      const logging = b.n('logging', { x: 8, y: 0, z: 3 }, { name: 'Crawl Logs' });
      b.e(scheduler, frontier, 'AMQP').e(frontier, priority, 'gRPC').e(frontier, fetchA, 'AMQP');
      b.e(frontier, fetchB, 'AMQP').e(fetchA, dns, 'DNS').e(fetchB, dns, 'DNS');
      b.e(fetchA, dedup, 'TCP').e(fetchA, robots, 'TCP').e(fetchA, parser, 'gRPC');
      b.e(parser, kafka, 'Kafka').e(kafka, htmlStore, 'Kafka').e(parser, index, 'HTTP');
      b.e(parser, linkDb, 'TCP').e(parser, frontier, 'AMQP').e(scheduler, stats, 'HTTP');
      b.e(scheduler, logging, 'TCP');
      b.g('Orchestration', 'region', [scheduler.id, dns.id, frontier.id, priority.id], { min: { x: -8, y: -1, z: -14 }, max: { x: 8, y: 3, z: -6 } });
      b.g('Fetch & Parse', 'service-group', [fetchA.id, fetchB.id, dedup.id, robots.id, parser.id], { min: { x: -10, y: -1, z: -6 }, max: { x: 10, y: 3, z: 2 } });
      b.g('Index Pipeline', 'database-cluster', [kafka.id, htmlStore.id, index.id, linkDb.id, stats.id, logging.id], { min: { x: -8, y: -1, z: 3 }, max: { x: 10, y: 3, z: 10 } });
      return b.build();
    },
  },
  {
    id: 'sd-distributed-cache',
    name: 'Distributed Cache (Redis Cluster)',
    description: 'Client-side hashing, cache proxy, shard replicas, backfill and monitoring',
    category: 'system-design',
    build: () => {
      const b = new TemplateBuilder('Distributed Cache', 'Horizontally scaled Redis cluster with proxy tier');
      const appA = b.n('application-server', { x: -4, y: 0, z: -12 }, { name: 'App Tier A' });
      const appB = b.n('application-server', { x: 4, y: 0, z: -12 }, { name: 'App Tier B' });
      const proxy = b.n('load-balancer', { x: 0, y: 0, z: -8 }, { name: 'Cache Proxy / Router' });
      const shardA = b.n('cache', { x: -8, y: 0, z: -4 }, { name: 'Shard A Primary' });
      const shardARep = b.n('cache', { x: -8, y: 0, z: 0 }, { name: 'Shard A Replica' });
      const shardB = b.n('cache', { x: 0, y: 0, z: -4 }, { name: 'Shard B Primary' });
      const shardBRep = b.n('cache', { x: 0, y: 0, z: 0 }, { name: 'Shard B Replica' });
      const shardC = b.n('cache', { x: 8, y: 0, z: -4 }, { name: 'Shard C Primary' });
      const shardCRep = b.n('cache', { x: 8, y: 0, z: 0 }, { name: 'Shard C Replica' });
      const coordinator = b.n('microservice', { x: 0, y: 0, z: -4 }, { name: 'Cluster Coordinator' });
      const backfill = b.n('worker', { x: -4, y: 0, z: 4 }, { name: 'Cache Backfill Workers' });
      const invalidation = b.n('kafka', { x: 4, y: 0, z: 4 }, { name: 'Invalidation Events' });
      const sourceDb = b.n('database', { x: 0, y: 0, z: 8 }, { name: 'Source of Truth DB' });
      const metrics = b.n('monitoring', { x: 10, y: 0, z: -4 }, { name: 'Cache Metrics' });
      const logging = b.n('logging', { x: 10, y: 0, z: 0 }, { name: 'Slow Query Logs' });
      const health = b.n('microservice', { x: 10, y: 0, z: 4 }, { name: 'Health Checker' });
      b.e(appA, proxy, 'TCP').e(appB, proxy, 'TCP').e(appA, sourceDb, 'TCP');
      b.e(proxy, shardA, 'TCP').e(proxy, shardB, 'TCP').e(proxy, shardC, 'TCP');
      b.e(shardA, shardARep, 'TCP').e(shardB, shardBRep, 'TCP').e(shardC, shardCRep, 'TCP');
      b.e(coordinator, shardA, 'TCP').e(coordinator, shardB, 'TCP').e(coordinator, shardC, 'TCP');
      b.e(proxy, coordinator, 'gRPC').e(invalidation, backfill, 'Kafka');
      b.e(backfill, sourceDb, 'TCP').e(backfill, shardA, 'TCP').e(health, metrics, 'HTTP');
      b.e(proxy, metrics, 'HTTP').e(proxy, logging, 'TCP');
      b.g('Applications', 'region', [appA.id, appB.id, proxy.id], { min: { x: -6, y: -1, z: -14 }, max: { x: 6, y: 3, z: -6 } });
      b.g('Redis Cluster', 'database-cluster', [shardA.id, shardARep.id, shardB.id, shardBRep.id, shardC.id, shardCRep.id, coordinator.id], { min: { x: -10, y: -1, z: -6 }, max: { x: 10, y: 3, z: 2 } });
      b.g('Ops & Source', 'service-group', [backfill.id, invalidation.id, sourceDb.id, metrics.id, logging.id, health.id], { min: { x: -6, y: -1, z: 3 }, max: { x: 12, y: 3, z: 10 } });
      return b.build();
    },
  },
  {
    id: 'sd-whatsapp-scale',
    name: 'Messenger at Scale',
    description: 'Multi-region chat shards, session routing, cross-region sync, media CDN',
    category: 'system-design',
    build: () => {
      const b = new TemplateBuilder('Messenger at Scale', 'Global messenger with regional shards and sync');
      const edge = b.publicEdge(-16);
      const mobile = b.n('mobile-app', { x: 0, y: 0, z: -16 }, { name: 'Messenger App' });
      b.e(mobile, edge.internet, 'HTTPS');
      const router = b.n('microservice', { x: 0, y: 0, z: -4 }, { name: 'Session Router' });
      const shardUs = b.n('microservice', { x: -8, y: 0, z: 0 }, { name: 'Chat Shard US' });
      const shardEu = b.n('microservice', { x: 8, y: 0, z: 0 }, { name: 'Chat Shard EU' });
      const wsUs = b.n('microservice', { x: -8, y: 0, z: -4 }, { name: 'WebSocket US' });
      const wsEu = b.n('microservice', { x: 8, y: 0, z: -4 }, { name: 'WebSocket EU' });
      const media = b.n('microservice', { x: 0, y: 0, z: 0 }, { name: 'Media Service' });
      const presence = b.n('cache', { x: 0, y: 0, z: 4 }, { name: 'Global Presence' });
      const kafka = b.n('kafka', { x: 0, y: 0, z: 8 }, { name: 'Cross-Region Sync' });
      const dbUs = b.n('database', { x: -8, y: 0, z: 8 }, { name: 'Messages US' });
      const dbEu = b.n('database', { x: 8, y: 0, z: 8 }, { name: 'Messages EU' });
      const blobs = b.n('object-storage', { x: -4, y: 0, z: 8 }, { name: 'Media Blobs' });
      const e2e = b.n('microservice', { x: 4, y: 0, z: 4 }, { name: 'E2E Key Directory' });
      const push = b.n('worker', { x: -4, y: 0, z: 4 }, { name: 'Push Workers' });
      b.e(edge.dns, router, 'DNS').e(edge.gw, router, 'gRPC').e(router, presence, 'TCP');
      b.e(router, wsUs, 'gRPC').e(router, wsEu, 'gRPC').e(wsUs, shardUs, 'gRPC');
      b.e(wsEu, shardEu, 'gRPC').e(shardUs, dbUs, 'TCP').e(shardEu, dbEu, 'TCP');
      b.e(shardUs, kafka, 'Kafka').e(shardEu, kafka, 'Kafka').e(edge.gw, media, 'HTTP');
      b.e(media, blobs, 'HTTPS').e(edge.cdn, blobs, 'HTTPS').e(kafka, push, 'Kafka');
      b.e(e2e, dbUs, 'TCP').e(edge.gw, e2e, 'gRPC');
      b.observability(edge.gw);
      b.g('Global Edge', 'region', [edge.internet.id, edge.dns.id, edge.cdn.id, edge.lb.id, edge.gw.id, mobile.id], { min: { x: -10, y: -1, z: -18 }, max: { x: 10, y: 3, z: -8 } });
      b.g('Regional Chat', 'service-group', [router.id, wsUs.id, wsEu.id, shardUs.id, shardEu.id, media.id, push.id, e2e.id], { min: { x: -10, y: -1, z: -6 }, max: { x: 10, y: 3, z: 2 } });
      b.g('Data Plane', 'database-cluster', [presence.id, kafka.id, dbUs.id, dbEu.id, blobs.id], { min: { x: -10, y: -1, z: 3 }, max: { x: 10, y: 3, z: 10 } });
      return b.build();
    },
  },
];
