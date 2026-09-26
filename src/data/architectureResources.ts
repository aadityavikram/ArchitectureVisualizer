import type { ProjectMetadata } from '@/types/architecture';
import { templates } from '@/data/templates';

export type ResourceLink = {
  label: string;
  url: string;
};

export type ArchitectureResourceSet = {
  templateId: string;
  title: string;
  primarySource: ResourceLink;
  studyLinks: ResourceLink[];
};

const primer = 'https://github.com/donnemartin/system-design-primer';
const bytebytego = 'https://blog.bytebytego.com';

const resourcesByTemplateId: Record<string, ArchitectureResourceSet> = {
  'demo-ecommerce': {
    templateId: 'demo-ecommerce',
    title: 'E-Commerce Platform',
    primarySource: { label: 'AWS — Microservices architecture', url: 'https://aws.amazon.com/microservices/' },
    studyLinks: [
      { label: 'System Design Primer — Scalability', url: `${primer}#index-of-system-design-topics` },
      { label: 'ByteByteGo — Payment system design', url: `${bytebytego}/p/how-to-design-a-payment-system` },
      { label: 'Designing Data-Intensive Applications (book overview)', url: 'https://dataintensive.net/' },
    ],
  },
  'simple-web': {
    templateId: 'simple-web',
    title: 'Simple Web Application',
    primarySource: { label: 'MDN — Web application architecture', url: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side/First_steps/Client-Server_overview' },
    studyLinks: [
      { label: 'System Design Primer — Basics', url: primer },
      { label: 'Three-tier architecture (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Multitier_architecture' },
    ],
  },
  'scalable-web': {
    templateId: 'scalable-web',
    title: 'Scalable Web Application',
    primarySource: { label: 'AWS — Well-Architected Framework', url: 'https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html' },
    studyLinks: [
      { label: 'System Design Primer — Load balancing', url: `${primer}#load-balancer` },
      { label: 'Cloudflare — What is a CDN?', url: 'https://www.cloudflare.com/learning/cdn/what-is-a-cdn/' },
      { label: 'ByteByteGo — API gateway vs load balancer', url: `${bytebytego}/p/api-gateway-vs-load-balancer` },
    ],
  },
  microservices: {
    templateId: 'microservices',
    title: 'Microservices',
    primarySource: { label: 'microservices.io — Patterns', url: 'https://microservices.io/' },
    studyLinks: [
      { label: 'Martin Fowler — Microservices', url: 'https://martinfowler.com/articles/microservices.html' },
      { label: 'System Design Primer — Microservices', url: primer },
      { label: 'Google SRE Book — Managing microservices', url: 'https://sre.google/sre-book/table-of-contents/' },
    ],
  },
  'event-driven': {
    templateId: 'event-driven',
    title: 'Event-Driven Architecture',
    primarySource: { label: 'Apache Kafka — Documentation', url: 'https://kafka.apache.org/documentation/' },
    studyLinks: [
      { label: 'Martin Fowler — Event-driven architecture', url: 'https://martinfowler.com/articles/201701-event-driven.html' },
      { label: 'ByteByteGo — Event-driven architecture', url: `${bytebytego}/p/event-driven-architecture-eda` },
      { label: 'AWS — Event-driven on AWS', url: 'https://aws.amazon.com/event-driven-architecture/' },
    ],
  },
  kubernetes: {
    templateId: 'kubernetes',
    title: 'Kubernetes',
    primarySource: { label: 'Kubernetes — Official docs', url: 'https://kubernetes.io/docs/home/' },
    studyLinks: [
      { label: 'Kubernetes — Ingress concept', url: 'https://kubernetes.io/docs/concepts/services-networking/ingress/' },
      { label: 'CNCF — Cloud native trail map', url: 'https://github.com/cncf/trailmap' },
      { label: 'Google — Borg/Omega paper (K8s lineage)', url: 'https://research.google/pubs/pub43438/' },
    ],
  },
  'sd-url-shortener': {
    templateId: 'sd-url-shortener',
    title: 'URL Shortener',
    primarySource: { label: 'System Design Primer — URL shortener', url: `${primer}#design-a-url-shortener` },
    studyLinks: [
      { label: 'ByteByteGo — URL shortener design', url: `${bytebytego}/p/how-to-design-a-url-shortener` },
      { label: 'High Scalability — URL shortener scaling', url: 'http://highscalability.com/blog/2009/10/29/how-bitly-stabilized-short-urls-and-grew-to-2-billion-clic.html' },
    ],
  },
  'sd-pastebin': {
    templateId: 'sd-pastebin',
    title: 'Pastebin',
    primarySource: { label: 'System Design Primer — Pastebin', url: `${primer}#design-pastebincom-or-bitly` },
    studyLinks: [
      { label: 'ByteByteGo — Pastebin design', url: `${bytebytego}/p/how-to-design-pastebin` },
    ],
  },
  'sd-news-feed': {
    templateId: 'sd-news-feed',
    title: 'News Feed',
    primarySource: { label: 'System Design Primer — Twitter timeline', url: `${primer}#design-the-twitter-timeline-and-search-api` },
    studyLinks: [
      { label: 'ByteByteGo — News feed system', url: `${bytebytego}/p/how-to-design-a-news-feed-system` },
      { label: 'Facebook — Fanout on write (paper)', url: 'https://www.usenix.org/system/files/conference/atc12/atc12-final187.pdf' },
    ],
  },
  'sd-instagram': {
    templateId: 'sd-instagram',
    title: 'Instagram / Photos',
    primarySource: { label: 'Instagram engineering blog', url: 'https://instagram-engineering.com/' },
    studyLinks: [
      { label: 'ByteByteGo — Instagram architecture', url: `${bytebytego}/p/how-does-instagram-store-and-retrieve` },
      { label: 'System Design Primer — Media storage', url: primer },
    ],
  },
  'sd-chat': {
    templateId: 'sd-chat',
    title: 'Chat / Messenger',
    primarySource: { label: 'System Design Primer — Chat messenger', url: `${primer}#design-a-chat-application-like-whatsapp` },
    studyLinks: [
      { label: 'ByteByteGo — Chat system design', url: `${bytebytego}/p/how-to-design-a-chat-system` },
      { label: 'WhatsApp architecture (High Scalability)', url: 'http://highscalability.com/blog/2012/2/13/the-whatsapp-architecture-facebook-bought-for-19-billion.html' },
    ],
  },
  'sd-uber': {
    templateId: 'sd-uber',
    title: 'Uber / Rides',
    primarySource: { label: 'Uber — Engineering blog', url: 'https://www.uber.com/blog/engineering/' },
    studyLinks: [
      { label: 'ByteByteGo — Uber architecture', url: `${bytebytego}/p/how-does-uber-find-your-ride` },
      { label: 'System Design Primer — Ride sharing', url: primer },
    ],
  },
  'sd-youtube': {
    templateId: 'sd-youtube',
    title: 'YouTube / Video',
    primarySource: { label: 'YouTube — Engineering blog', url: 'https://blog.youtube/inside-youtube/' },
    studyLinks: [
      { label: 'ByteByteGo — YouTube architecture', url: `${bytebytego}/p/how-does-youtube-store-and-stream-videos` },
      { label: 'Google — Video storage (GFS/Colossus lineage)', url: 'https://research.google/pubs/pub33026/' },
    ],
  },
  'sd-netflix': {
    templateId: 'sd-netflix',
    title: 'Netflix',
    primarySource: { label: 'Netflix TechBlog', url: 'https://netflixtechblog.com/' },
    studyLinks: [
      { label: 'ByteByteGo — Netflix architecture', url: `${bytebytego}/p/how-netflix-really-works` },
      { label: 'Netflix — Open Connect CDN', url: 'https://openconnect.netflix.com/en/' },
    ],
  },
  'sd-spotify': {
    templateId: 'sd-spotify',
    title: 'Spotify',
    primarySource: { label: 'Spotify — Engineering blog', url: 'https://engineering.atspotify.com/' },
    studyLinks: [
      { label: 'ByteByteGo — Spotify architecture', url: `${bytebytego}/p/how-does-spotify-stream-music` },
      { label: 'Spotify — Backend architecture (classic post)', url: 'https://engineering.atspotify.com/2013/03/spotify-engineering-culture-part-1/' },
    ],
  },
  'sd-ecommerce': {
    templateId: 'sd-ecommerce',
    title: 'E-Commerce',
    primarySource: { label: 'System Design Primer — E-commerce', url: `${primer}#design-an-e-commerce-store` },
    studyLinks: [
      { label: 'ByteByteGo — E-commerce system design', url: `${bytebytego}/p/how-to-design-an-e-commerce-system` },
      { label: 'Amazon — Builder\'s Library (architecture)', url: 'https://aws.amazon.com/builders-library/' },
    ],
  },
  'sd-web-search': {
    templateId: 'sd-web-search',
    title: 'Web Search',
    primarySource: { label: 'Google — How Search works', url: 'https://www.google.com/search/howsearchworks/' },
    studyLinks: [
      { label: 'System Design Primer — Web crawler', url: `${primer}#design-a-web-crawler` },
      { label: 'ByteByteGo — Search engine design', url: `${bytebytego}/p/how-to-design-a-search-engine` },
    ],
  },
  'sd-google-docs': {
    templateId: 'sd-google-docs',
    title: 'Google Docs / Collaboration',
    primarySource: { label: 'Google — Real-time collaboration', url: 'https://research.google/pubs/pub44823/' },
    studyLinks: [
      { label: 'ByteByteGo — Google Docs design', url: `${bytebytego}/p/how-google-docs-works` },
      { label: 'Operational Transformation (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Operational_transformation' },
    ],
  },
  'sd-dropbox': {
    templateId: 'sd-dropbox',
    title: 'Dropbox',
    primarySource: { label: 'Dropbox — Tech blog', url: 'https://dropbox.tech/' },
    studyLinks: [
      { label: 'ByteByteGo — Dropbox sync design', url: `${bytebytego}/p/how-does-dropbox-sync-files` },
      { label: 'System Design Primer — File sync', url: primer },
    ],
  },
  'sd-rate-limiter': {
    templateId: 'sd-rate-limiter',
    title: 'Rate Limiter',
    primarySource: { label: 'Cloudflare — Rate limiting', url: 'https://www.cloudflare.com/learning/bots/what-is-rate-limiting/' },
    studyLinks: [
      { label: 'ByteByteGo — Rate limiter design', url: `${bytebytego}/p/how-to-design-a-rate-limiter` },
      { label: 'Redis — Rate limiting patterns', url: 'https://redis.io/docs/latest/develop/use/patterns/rate-limiting/' },
    ],
  },
  'sd-notifications': {
    templateId: 'sd-notifications',
    title: 'Notification System',
    primarySource: { label: 'System Design Primer — Notifications', url: `${primer}#design-a-notification-system` },
    studyLinks: [
      { label: 'ByteByteGo — Notification system', url: `${bytebytego}/p/how-to-design-a-notification-system` },
      { label: 'Firebase Cloud Messaging docs', url: 'https://firebase.google.com/docs/cloud-messaging' },
    ],
  },
  'sd-ticketmaster': {
    templateId: 'sd-ticketmaster',
    title: 'Ticketmaster',
    primarySource: { label: 'ByteByteGo — Ticket booking', url: `${bytebytego}/p/how-to-design-a-ticket-booking-system` },
    studyLinks: [
      { label: 'System Design Primer — High throughput writes', url: primer },
      { label: 'Queue-based load leveling (Microsoft)', url: 'https://learn.microsoft.com/en-us/azure/architecture/patterns/queue-based-load-leveling' },
    ],
  },
  'sd-yelp': {
    templateId: 'sd-yelp',
    title: 'Yelp / Geo search',
    primarySource: { label: 'Yelp — Engineering blog', url: 'https://engineeringblog.yelp.com/' },
    studyLinks: [
      { label: 'ByteByteGo — Proximity search', url: `${bytebytego}/p/how-to-design-a-proximity-server` },
      { label: 'Elasticsearch — Geo queries', url: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/geo-queries.html' },
    ],
  },
  'sd-leaderboard': {
    templateId: 'sd-leaderboard',
    title: 'Leaderboard',
    primarySource: { label: 'Redis — Sorted sets', url: 'https://redis.io/docs/latest/develop/data-types/sorted-sets/' },
    studyLinks: [
      { label: 'ByteByteGo — Leaderboard design', url: `${bytebytego}/p/how-to-design-a-leaderboard` },
      { label: 'System Design Primer — Scaling', url: primer },
    ],
  },
  'sd-payments': {
    templateId: 'sd-payments',
    title: 'Payment System',
    primarySource: { label: 'Stripe — Engineering blog', url: 'https://stripe.com/blog/engineering' },
    studyLinks: [
      { label: 'ByteByteGo — Payment system design', url: `${bytebytego}/p/how-to-design-a-payment-system` },
      { label: 'System Design Primer — Payment', url: primer },
    ],
  },
  'sd-typeahead': {
    templateId: 'sd-typeahead',
    title: 'Typeahead',
    primarySource: { label: 'System Design Primer — Typeahead', url: `${primer}#design-a-typeahead-suggestion-system` },
    studyLinks: [
      { label: 'ByteByteGo — Autocomplete design', url: `${bytebytego}/p/how-to-design-an-autocomplete-system` },
    ],
  },
  'sd-hotel-booking': {
    templateId: 'sd-hotel-booking',
    title: 'Hotel Booking',
    primarySource: { label: 'ByteByteGo — Hotel reservation system', url: `${bytebytego}/p/how-to-design-a-hotel-reservation-system` },
    studyLinks: [
      { label: 'System Design Primer — Booking systems', url: primer },
      { label: 'ACID vs availability in reservations', url: 'https://martinfowler.com/articles/microservices.html#DecentralizedDataManagement' },
    ],
  },
  'sd-stock-exchange': {
    templateId: 'sd-stock-exchange',
    title: 'Stock Exchange',
    primarySource: { label: 'NASDAQ — Trading technology', url: 'https://www.nasdaq.com/solutions/nasdaq-trading-technology' },
    studyLinks: [
      { label: 'ByteByteGo — Stock exchange design', url: `${bytebytego}/p/how-to-design-a-stock-exchange` },
      { label: 'LMAX architecture (Martin Fowler)', url: 'https://martinfowler.com/articles/lmax.html' },
    ],
  },
  'sd-zoom': {
    templateId: 'sd-zoom',
    title: 'Video Conferencing',
    primarySource: { label: 'WebRTC — Official site', url: 'https://webrtc.org/' },
    studyLinks: [
      { label: 'ByteByteGo — Zoom architecture', url: `${bytebytego}/p/how-does-zoom-work` },
      { label: 'System Design Primer — Real-time systems', url: primer },
    ],
  },
  'sd-web-crawler': {
    templateId: 'sd-web-crawler',
    title: 'Web Crawler',
    primarySource: { label: 'System Design Primer — Web crawler', url: `${primer}#design-a-web-crawler` },
    studyLinks: [
      { label: 'ByteByteGo — Web crawler design', url: `${bytebytego}/p/how-to-design-a-web-crawler` },
      { label: 'Google — Large-scale crawl', url: 'https://research.google/pubs/pub37750/' },
    ],
  },
  'sd-distributed-cache': {
    templateId: 'sd-distributed-cache',
    title: 'Distributed Cache',
    primarySource: { label: 'Redis — Cluster specification', url: 'https://redis.io/docs/latest/operate/oss_and_stack/management/scaling/' },
    studyLinks: [
      { label: 'ByteByteGo — Cache system design', url: `${bytebytego}/p/how-to-design-a-cache-system` },
      { label: 'AWS — Caching best practices', url: 'https://docs.aws.amazon.com/whitepapers/latest/database-caching-using-redis/database-caching-using-redis.html' },
    ],
  },
  'sd-whatsapp-scale': {
    templateId: 'sd-whatsapp-scale',
    title: 'Messenger at Scale',
    primarySource: { label: 'System Design Primer — WhatsApp', url: `${primer}#design-a-chat-application-like-whatsapp` },
    studyLinks: [
      { label: 'ByteByteGo — Chat system at scale', url: `${bytebytego}/p/how-to-design-a-chat-system` },
      { label: 'Facebook — Messenger infrastructure', url: 'https://engineering.fb.com/' },
    ],
  },
};

const genericResources: ArchitectureResourceSet = {
  templateId: 'custom',
  title: 'Custom architecture',
  primarySource: { label: 'System Design Primer (start here)', url: primer },
  studyLinks: [
    { label: 'ByteByteGo — Newsletter archive', url: bytebytego },
    { label: 'AWS Architecture Center', url: 'https://aws.amazon.com/architecture/' },
    { label: 'Google SRE Book', url: 'https://sre.google/sre-book/table-of-contents/' },
  ],
};

const projectNameToTemplateId: Record<string, string> = (() => {
  const map: Record<string, string> = {
    'E-Commerce Platform Demo': 'demo-ecommerce',
  };
  for (const t of templates) {
    map[t.build().metadata.name] = t.id;
  }
  return map;
})();

function matchTemplateIdByProjectName(name: string): string | undefined {
  return projectNameToTemplateId[name];
}

export function getArchitectureResources(metadata: ProjectMetadata): ArchitectureResourceSet {
  const id = metadata.templateId ?? matchTemplateIdByProjectName(metadata.name);
  if (id && resourcesByTemplateId[id]) {
    return resourcesByTemplateId[id];
  }
  return { ...genericResources, title: metadata.name || genericResources.title };
}

export function getAllResourceTemplateIds(): string[] {
  return Object.keys(resourcesByTemplateId);
}
