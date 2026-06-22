import { useEffect, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { useCategories } from "./useJobs";
import type { JobFilters, JobType } from "@/types";

const JOB_TYPES: { value: JobType; label: string }[] = [
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
  { value: "remote", label: "Remote" },
];

interface JobFiltersProps {
  filters: JobFilters;
  onChange: (filters: JobFilters) => void;
}

export function JobFiltersPanel({ filters, onChange }: JobFiltersProps) {
  const [search, setSearch] = useState(filters.search ?? "");
  const { data: categories } = useCategories();

  // Debounce search
  useEffect(() => {
    const id = setTimeout(() => {
      onChange({ ...filters, search: search || undefined, page: 1 });
    }, 400);
    return () => clearTimeout(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const toggle = (key: keyof JobFilters, value: string | boolean) => {
    const current = filters[key];
    onChange({
      ...filters,
      [key]: current === value ? undefined : value,
      page: 1,
    });
  };

  const clearAll = () => {
    setSearch("");
    onChange({ page: 1 });
  };

  const hasActive =
    !!filters.search ||
    !!filters.job_type ||
    !!filters.category ||
    filters.is_remote;

  return (
    <aside className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search jobs, companies…"
          className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>

      {/* Active filters */}
      {hasActive && (
        <div className="flex flex-wrap gap-1">
          {filters.search && (
            <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => { setSearch(""); onChange({ ...filters, search: undefined }); }}>
              "{filters.search}" <X className="h-3 w-3" />
            </Badge>
          )}
          {filters.job_type && (
            <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => toggle("job_type", filters.job_type!)}>
              {filters.job_type} <X className="h-3 w-3" />
            </Badge>
          )}
          {filters.is_remote && (
            <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => toggle("is_remote", true)}>
              Remote <X className="h-3 w-3" />
            </Badge>
          )}
          <button onClick={clearAll} className="text-xs text-muted-foreground hover:text-destructive underline">
            Clear all
          </button>
        </div>
      )}

      {/* Job type */}
      <div>
        <h3 className="mb-3 text-sm font-semibold flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4" /> Job Type
        </h3>
        <div className="space-y-2">
          {JOB_TYPES.map((jt) => (
            <label key={jt.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.job_type === jt.value}
                onChange={() => toggle("job_type", jt.value)}
                className="rounded border-input"
              />
              <span className="text-sm">{jt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Remote */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={!!filters.is_remote}
            onChange={() => toggle("is_remote", true)}
            className="rounded border-input"
          />
          <span className="text-sm font-medium">Remote only</span>
        </label>
      </div>

      {/* Category */}
      {categories && categories.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold">Category</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {categories.map((cat) => (
              <label key={cat.id} className="flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.category === cat.slug}
                    onChange={() => toggle("category", cat.slug)}
                    className="rounded border-input"
                  />
                  <span className="text-sm group-hover:text-primary transition-colors">{cat.name}</span>
                </div>
                {cat.job_count !== undefined && (
                  <span className="text-xs text-muted-foreground">{cat.job_count}</span>
                )}
              </label>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
