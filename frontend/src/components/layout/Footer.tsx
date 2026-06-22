import { Link } from "react-router-dom";
import { Briefcase, Github, Twitter, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <Link to="/" className="flex items-center gap-2 font-bold text-lg">
              <Briefcase className="h-5 w-5 text-primary" />
              JobBoard
            </Link>
            <p className="text-sm text-muted-foreground">
              Connecting top talent with great companies.
            </p>
            <div className="flex gap-3 mt-2">
              <a href="#" aria-label="Twitter" className="text-muted-foreground hover:text-primary">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" aria-label="LinkedIn" className="text-muted-foreground hover:text-primary">
                <Linkedin className="h-4 w-4" />
              </a>
              <a href="#" aria-label="GitHub" className="text-muted-foreground hover:text-primary">
                <Github className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* For Candidates */}
          <div>
            <h4 className="font-semibold mb-3 text-sm">For Candidates</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/jobs" className="hover:text-primary">Browse Jobs</Link></li>
              <li><Link to="/register" className="hover:text-primary">Create Account</Link></li>
              <li><Link to="/applications" className="hover:text-primary">My Applications</Link></li>
            </ul>
          </div>

          {/* For Employers */}
          <div>
            <h4 className="font-semibold mb-3 text-sm">For Employers</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/dashboard/post-job" className="hover:text-primary">Post a Job</Link></li>
              <li><Link to="/dashboard" className="hover:text-primary">Dashboard</Link></li>
              <li><Link to="/register" className="hover:text-primary">Employer Sign Up</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-3 text-sm">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary">About Us</a></li>
              <li><a href="#" className="hover:text-primary">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} JobBoard. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
