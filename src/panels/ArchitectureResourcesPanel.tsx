import { BookOpen, ExternalLink, Library } from 'lucide-react';
import { useProject } from '@/store/architectureStore';
import { getArchitectureResources } from '@/data/architectureResources';

function LinkRow({ label, url }: { label: string; url: string }) {
  return (
    <li>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-start gap-2 rounded-md px-2 py-1.5 text-xs text-gray-300 hover:bg-white/5 hover:text-accent-glow"
      >
        <ExternalLink className="mt-0.5 h-3 w-3 shrink-0 opacity-60 group-hover:opacity-100" aria-hidden />
        <span className="leading-snug">{label}</span>
      </a>
    </li>
  );
}

export function ArchitectureResourcesPanel() {
  const project = useProject();
  const resources = getArchitectureResources(project.metadata);

  return (
    <div className="shrink-0 border-t border-surface-border bg-surface-raised/80 p-3">
      <div className="mb-2 flex items-center gap-2">
        <BookOpen className="h-4 w-4 text-accent" aria-hidden />
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">Study &amp; sources</h3>
      </div>
      <p className="mb-2 text-[11px] leading-relaxed text-gray-500">
        Resources for <span className="text-gray-300">{resources.title}</span>
        {project.metadata.templateId ? (
          <span className="ml-1 font-mono text-[10px] text-gray-600">({project.metadata.templateId})</span>
        ) : null}
      </p>

      <div className="mb-2">
        <div className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
          <Library className="h-3 w-3" />
          Primary source
        </div>
        <a
          href={resources.primarySource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/10 px-2.5 py-2 text-xs font-medium text-accent-glow hover:bg-accent/15"
        >
          <ExternalLink className="h-3.5 w-3.5 shrink-0" />
          {resources.primarySource.label}
        </a>
      </div>

      <div>
        <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-gray-500">Study links</div>
        <ul className="max-h-36 space-y-0.5 overflow-y-auto">
          {resources.studyLinks.map((link) => (
            <LinkRow key={`${link.url}-${link.label}`} label={link.label} url={link.url} />
          ))}
        </ul>
      </div>
    </div>
  );
}
