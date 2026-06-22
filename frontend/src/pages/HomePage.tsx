import { Link } from "react-router-dom";
import { Search, ArrowRight, Briefcase, Building2, Users, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { JobCard } from "@/features/jobs/JobCard";
import { Spinner } from "@/components/ui/Spinner";
import { useJobs } from "@/features/jobs/useJobs";

const CATEGORIES = [
  { name: "Engineering", icon: "⚙️", slug: "engineering" },
  { name: "Design", icon: "🎨", slug: "design" },
  { name: "Marketing", icon: "📣", slug: "marketing" },
  { name: "Sales", icon: "💼", slug: "sales" },
  { name: "Finance", icon: "📊", slug: "finance" },
  { name: "Healthcare", icon: "🏥", slug: "healthcare" },
];

export default function HomePage() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { data: featuredJobs, isLoading } = useJobs({ ordering: "-created_at", page: 1 });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) navigate(`/jobs?q=${encodeURIComponent(query)}`);
    else navigate("/jobs");
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-secondary/20 py-20">
        <div className="container text-center">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
              Find Your{" "}
              <span className="text-primary">Dream Job</span>
              <br />
              Today
            </h1>
            <p className="mt-4 text-xl text-muted-foreground">
              Connect with thousands of top employers. Browse curated listings and
              land your next opportunity.
            </p>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="mt-8 flex gap-2 max-w-xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Job title, keyword, or company…"
                  className="flex h-12 w-full rounded-md border border-input bg-background pl-10 pr-4 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
              <Button type="submit" size="lg">
                Search
              </Button>
            </form>

            <p className="mt-3 text-sm text-muted-foreground">
              Popular: Remote, React, Python, Marketing, Design
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y bg-muted/30 py-8">
        <div className="container">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4 text-center">
            {[
              { icon: <Briefcase className="mx-auto h-6 w-6 text-primary mb-1" />, value: "10K+", label: "Jobs Posted" },
              { icon: <Building2 className="mx-auto h-6 w-6 text-primary mb-1" />, value: "2K+", label: "Companies" },
              { icon: <Users className="mx-auto h-6 w-6 text-primary mb-1" />, value: "50K+", label: "Job Seekers" },
              { icon: <TrendingUp className="mx-auto h-6 w-6 text-primary mb-1" />, value: "5K+", label: "Hires Made" },
            ].map((stat) => (
              <div key={stat.label}>
                {stat.icon}
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-2xl font-bold mb-6">Browse by Category</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                to={`/jobs?category=${cat.slug}`}
                className="flex flex-col items-center justify-center gap-2 rounded-lg border bg-card p-4 text-center hover:border-primary hover:shadow-sm transition-all"
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-sm font-medium">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured jobs */}
      <section className="bg-muted/30 py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Latest Jobs</h2>
            <Button variant="outline" size="sm" asChild>
              <Link to="/jobs" className="gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </div>

          {isLoading && (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          )}

          {!isLoading && featuredJobs && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {featuredJobs.results.slice(0, 6).map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}

          {!isLoading && featuredJobs?.results.length === 0 && (
            <p className="text-center text-muted-foreground py-12">
              No jobs available yet.{" "}
              <Link to="/register" className="text-primary hover:underline">
                Be the first to post!
              </Link>
            </p>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container">
          <div className="rounded-2xl bg-primary px-8 py-12 text-center text-primary-foreground">
            <h2 className="text-3xl font-bold">Ready to hire top talent?</h2>
            <p className="mt-2 text-primary-foreground/80">
              Post your job listing and reach thousands of qualified candidates.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Button variant="secondary" size="lg" asChild>
                <Link to="/register">Post a Job Free</Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                asChild
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Link to="/jobs">Browse Jobs</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
