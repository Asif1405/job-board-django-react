import { Link, NavLink, useNavigate } from "react-router-dom";
import { Briefcase, Menu, X, LogOut, User, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLink = ({ isActive }: { isActive: boolean }) =>
    cn(
      "text-sm font-medium transition-colors hover:text-primary",
      isActive ? "text-primary" : "text-muted-foreground"
    );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <Briefcase className="h-5 w-5 text-primary" />
          <span>JobBoard</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <NavLink to="/jobs" className={navLink}>
            Browse Jobs
          </NavLink>
          {isAuthenticated && user?.role === "candidate" && (
            <NavLink to="/applications" className={navLink}>
              My Applications
            </NavLink>
          )}
          {isAuthenticated && user?.role === "employer" && (
            <NavLink to="/dashboard" className={navLink}>
              Dashboard
            </NavLink>
          )}
        </nav>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                {user?.first_name}
              </span>
              {user?.role === "employer" && (
                <Button
                  size="sm"
                  onClick={() => navigate("/dashboard/post-job")}
                >
                  Post a Job
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Log in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/register">Sign up</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile burger */}
        <button
          className="md:hidden p-2"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t bg-background px-4 pb-4 pt-2 flex flex-col gap-3 animate-fade-in">
          <NavLink to="/jobs" className={navLink} onClick={() => setMenuOpen(false)}>
            Browse Jobs
          </NavLink>
          {isAuthenticated && user?.role === "candidate" && (
            <NavLink to="/applications" className={navLink} onClick={() => setMenuOpen(false)}>
              <User className="inline h-4 w-4 mr-1" />
              My Applications
            </NavLink>
          )}
          {isAuthenticated && user?.role === "employer" && (
            <>
              <NavLink to="/dashboard" className={navLink} onClick={() => setMenuOpen(false)}>
                <LayoutDashboard className="inline h-4 w-4 mr-1" />
                Dashboard
              </NavLink>
              <NavLink to="/dashboard/post-job" className={navLink} onClick={() => setMenuOpen(false)}>
                Post a Job
              </NavLink>
            </>
          )}
          {isAuthenticated ? (
            <button
              onClick={() => { handleLogout(); setMenuOpen(false); }}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary"
            >
              <LogOut className="h-4 w-4" /> Log out
            </button>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <Button variant="outline" asChild onClick={() => setMenuOpen(false)}>
                <Link to="/login">Log in</Link>
              </Button>
              <Button asChild onClick={() => setMenuOpen(false)}>
                <Link to="/register">Sign up</Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
