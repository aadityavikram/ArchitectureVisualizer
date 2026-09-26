import type { TemplateDefinition } from '@/data/templateTypes';
import { TemplateBuilder } from '@/data/templateBuilders';

export const systemDesignTemplatesPrimary: TemplateDefinition[] = [
  {
    id: 'sd-url-shortener',
    name: 'URL Shortener (TinyURL)',
    description: 'Multi-tier URL service with cache-aside, analytics pipeline, HA DB',
    category: 'system-design',
    build: () => {
      const b = new TemplateBuilder('URL Shortener', 'Production-style TinyURL / bit.ly architecture');
      const edge = b.publicEdge(-16);
      const clients = b.mobileAndWebClients(-16);
      b.e(clients.mobile, edge.internet, 'HTTPS');
      b.e(clients.web, edge.internet, 'HTTPS');
      const encode = b.n('microservice', { x: -7, y: 0, z: -4 }, { name: 'Encode Service' });
      const redirect = b.n('microservice', { x: 7, y: 0, z: -4 }, { name: 'Redirect Service' });
      const analytics = b.n('worker', { x: 0, y: 0, z: -4 }, { name: 'Analytics Workers' });
      const cache = b.n('cache', { x: 7, y: 0, z: 0 }, { name: 'Redis Hot URLs' });
      const dbPrimary = b.n('database', { x: -5, y: 0, z: 5 }, { name: 'URL DB Primary' });
      const dbReplica = b.n('database', { x: -9, y: 0, z: 5 }, { name: 'Read Replica' });
      const blob = b.n('object-storage', { x: 5, y: 0, z: 5 }, { name: 'Click Logs' });
      const kafka = b.n('kafka', { x: 0, y: 0, z: 5 }, { name: 'Click Stream' });
      const admin = b.n('web-server', { x: -7, y: 0, z: 9 }, { name: 'Admin Dashboard' });
      const search = b.n('search-engine', { x: -7, y: 0, z: 12 }, { name: 'URL Search Index' });
      b.e(edge.gw, encode, 'HTTP').e(edge.gw, redirect, 'HTTP').e(edge.cdn, redirect, 'HTTPS');
      b.e(encode, dbPrimary, 'TCP').e(dbPrimary, dbReplica, 'TCP');
      b.e(redirect, cache, 'TCP').e(cache, dbPrimary, 'TCP').e(redirect, kafka, 'Kafka');
      b.e(kafka, analytics, 'Kafka').e(analytics, blob, 'HTTPS').e(analytics, search, 'HTTP');
      b.e(edge.gw, admin, 'HTTPS').e(admin, search, 'HTTP');
      b.observability(edge.gw);
      b.g('Edge', 'region', [edge.internet.id, edge.dns.id, edge.cdn.id, edge.lb.id], { min: { x: -10, y: -1, z: -18 }, max: { x: 10, y: 3, z: -10 } }, '#64748b35');
      b.g('Services', 'service-group', [edge.gw.id, edge.auth.id, encode.id, redirect.id, analytics.id, admin.id], { min: { x: -11, y: -1, z: -6 }, max: { x: 11, y: 3, z: 10 } });
      b.g('Data', 'database-cluster', [cache.id, dbPrimary.id, dbReplica.id, kafka.id, blob.id, search.id], { min: { x: -11, y: -1, z: 3 }, max: { x: 11, y: 3, z: 14 } });
      return b.build();
    },
  },
  {
    id: 'sd-pastebin',
    name: 'Pastebin',
    description: 'Read/write split, CDN, object store, rate limit, expiration workers',
    category: 'system-design',
    build: () => {
      const b = new TemplateBuilder('Pastebin', 'Scalable pastebin with blob storage and metadata DB');
      const edge = b.publicEdge(-15);
      const clients = b.mobileAndWebClients(-15);
      b.e(clients.mobile, edge.internet, 'HTTPS');
      b.e(clients.web, edge.internet, 'HTTPS');
      const writer = b.n('microservice', { x: -6, y: 0, z: -3 }, { name: 'Paste Writer' });
      const reader = b.n('microservice', { x: 6, y: 0, z: -3 }, { name: 'Paste Reader' });
      const limiter = b.n('microservice', { x: 0, y: 0, z: -3 }, { name: 'Rate Limiter' });
      const expire = b.n('worker', { x: 0, y: 0, z: 1 }, { name: 'TTL / Expiry Workers' });
      const mq = b.n('message-queue', { x: -6, y: 0, z: 1 }, { name: 'Write Queue' });
      const blobs = b.n('object-storage', { x: -6, y: 0, z: 6 }, { name: 'Paste Blob Store' });
      const meta = b.n('database', { x: 6, y: 0, z: 6 }, { name: 'Metadata DB' });
      const metaReplica = b.n('database', { x: 10, y: 0, z: 6 }, { name: 'Metadata Replica' });
      const cache = b.n('cache', { x: 6, y: 0, z: 2 }, { name: 'Popular Pastes Cache' });
      const kafka = b.n('kafka', { x: 0, y: 0, z: 6 }, { name: 'Audit Events' });
      b.e(edge.gw, limiter, 'HTTP').e(limiter, writer, 'HTTP').e(edge.gw, reader, 'HTTP');
      b.e(edge.cdn, reader, 'HTTPS').e(writer, mq, 'AMQP').e(mq, blobs, 'HTTPS');
      b.e(writer, meta, 'TCP').e(meta, metaReplica, 'TCP').e(reader, cache, 'TCP').e(cache, meta, 'TCP');
      b.e(reader, blobs, 'HTTPS').e(expire, meta, 'TCP').e(expire, blobs, 'HTTPS');
      b.e(writer, kafka, 'Kafka');
      b.observability(edge.gw);
      b.g('Edge & CDN', 'region', [edge.internet.id, edge.cdn.id, edge.lb.id, edge.gw.id], { min: { x: -10, y: -1, z: -17 }, max: { x: 10, y: 3, z: -8 } });
      b.g('Application', 'service-group', [writer.id, reader.id, limiter.id, expire.id], { min: { x: -8, y: -1, z: -5 }, max: { x: 8, y: 3, z: 3 } });
      b.g('Storage', 'database-cluster', [blobs.id, meta.id, metaReplica.id, cache.id, kafka.id], { min: { x: -8, y: -1, z: 4 }, max: { x: 12, y: 3, z: 8 } });
      return b.build();
    },
  },
  {
    id: 'sd-news-feed',
    name: 'News Feed (Twitter/X)',
    description: 'Fanout-on-write, timeline cache, graph store, search, notifications',
    category: 'system-design',
    build: () => {
      const b = new TemplateBuilder('News Feed', 'Twitter-style home timeline and social graph');
      const edge = b.publicEdge(-16);
      const clients = b.mobileAndWebClients(-16);
      b.e(clients.mobile, edge.internet, 'HTTPS');
      b.e(clients.web, edge.internet, 'HTTPS');
      const post = b.n('microservice', { x: -8, y: 0, z: -4 }, { name: 'Post / Tweet Service' });
      const timeline = b.n('microservice', { x: 0, y: 0, z: -4 }, { name: 'Timeline Service' });
      const user = b.n('microservice', { x: 8, y: 0, z: -4 }, { name: 'User / Graph Service' });
      const fanout = b.n('worker', { x: -4, y: 0, z: 0 }, { name: 'Fanout Workers' });
      const rank = b.n('worker', { x: 4, y: 0, z: 0 }, { name: 'Ranking Workers' });
      const kafka = b.n('kafka', { x: 0, y: 0, z: 4 }, { name: 'Post Event Bus' });
      const tCache = b.n('cache', { x: -6, y: 0, z: 8 }, { name: 'Timeline Cache' });
      const graphDb = b.n('database', { x: 2, y: 0, z: 8 }, { name: 'Social Graph DB' });
      const blob = b.n('object-storage', { x: -10, y: 0, z: 8 }, { name: 'Media Storage' });
      const search = b.n('search-engine', { x: 6, y: 0, z: 8 }, { name: 'Tweet Search' });
      const notify = b.n('microservice', { x: 10, y: 0, z: 0 }, { name: 'Notification Service' });
      b.e(edge.gw, post, 'gRPC').e(edge.gw, timeline, 'gRPC').e(edge.gw, user, 'gRPC');
      b.e(post, kafka, 'Kafka').e(kafka, fanout, 'Kafka').e(fanout, tCache, 'TCP').e(fanout, graphDb, 'TCP');
      b.e(timeline, tCache, 'TCP').e(timeline, rank, 'gRPC').e(post, blob, 'HTTPS').e(post, graphDb, 'TCP');
      b.e(user, graphDb, 'TCP').e(kafka, search, 'Kafka').e(kafka, notify, 'Kafka');
      b.observability(edge.gw);
      b.g('Edge', 'region', [edge.internet.id, edge.lb.id, edge.gw.id, edge.auth.id], { min: { x: -11, y: -1, z: -18 }, max: { x: 11, y: 3, z: -8 } });
      b.g('Core Services', 'service-group', [post.id, timeline.id, user.id, fanout.id, rank.id, notify.id], { min: { x: -12, y: -1, z: -6 }, max: { x: 12, y: 3, z: 2 } });
      b.g('Data Layer', 'database-cluster', [kafka.id, tCache.id, graphDb.id, blob.id, search.id], { min: { x: -12, y: -1, z: 3 }, max: { x: 12, y: 3, z: 10 } });
      return b.build();
    },
  },
  {
    id: 'sd-instagram',
    name: 'Instagram / Photo Sharing',
    description: 'Upload pipeline, CDN, feed, stories cache, ML tagging workers',
    category: 'system-design',
    build: () => {
      const b = new TemplateBuilder('Instagram', 'Photo sharing with media pipeline and feed');
      const edge = b.publicEdge(-16);
      const mobile = b.n('mobile-app', { x: 0, y: 0, z: -16 }, { name: 'Instagram App' });
      b.e(mobile, edge.internet, 'HTTPS');
      const upload = b.n('microservice', { x: -8, y: 0, z: -4 }, { name: 'Upload Service' });
      const feed = b.n('microservice', { x: 0, y: 0, z: -4 }, { name: 'Feed Service' });
      const social = b.n('microservice', { x: 8, y: 0, z: -4 }, { name: 'Social Graph' });
      const transcode = b.n('worker', { x: -8, y: 0, z: 0 }, { name: 'Transcode Workers' });
      const ml = b.n('worker', { x: -4, y: 0, z: 0 }, { name: 'ML Tagging Workers' });
      const kafka = b.n('kafka', { x: 0, y: 0, z: 4 }, { name: 'Media Events' });
      const photos = b.n('object-storage', { x: -8, y: 0, z: 8 }, { name: 'Photo Object Store' });
      const feedCache = b.n('cache', { x: 0, y: 0, z: 8 }, { name: 'Feed Cache' });
      const meta = b.n('database', { x: 8, y: 0, z: 8 }, { name: 'Metadata DB' });
      const search = b.n('search-engine', { x: 4, y: 0, z: 12 }, { name: 'Hashtag Search' });
      b.e(edge.gw, upload, 'HTTP').e(edge.gw, feed, 'HTTP').e(edge.gw, social, 'gRPC');
      b.e(edge.cdn, photos, 'HTTPS').e(upload, transcode, 'gRPC').e(transcode, photos, 'HTTPS');
      b.e(upload, kafka, 'Kafka').e(kafka, ml, 'Kafka').e(upload, meta, 'TCP');
      b.e(feed, feedCache, 'TCP').e(feed, meta, 'TCP').e(social, meta, 'TCP').e(ml, search, 'HTTP');
      b.observability(edge.gw);
      b.g('Edge & CDN', 'region', [edge.internet.id, edge.cdn.id, edge.lb.id], { min: { x: -10, y: -1, z: -18 }, max: { x: 10, y: 3, z: -10 } });
      b.g('App Tier', 'service-group', [edge.gw.id, upload.id, feed.id, social.id, transcode.id, ml.id], { min: { x: -10, y: -1, z: -6 }, max: { x: 10, y: 3, z: 2 } });
      b.g('Media & Data', 'database-cluster', [photos.id, feedCache.id, meta.id, kafka.id, search.id], { min: { x: -10, y: -1, z: 6 }, max: { x: 10, y: 3, z: 14 } });
      return b.build();
    },
  },
];
