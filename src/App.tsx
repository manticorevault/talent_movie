import { Outlet, Link } from '@tanstack/react-router';
import { ErrorBoundary } from '@shared/ui/ErrorBoundary';
import { Film } from 'lucide-react';

function App() {
  return (
    <ErrorBoundary>
      <div className="relative flex min-h-screen flex-col bg-background text-foreground">
        {/* Simple header */}
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto flex h-16 items-center px-4 md:px-8">
            <div className="flex gap-6 md:gap-10">
              <Link to="/movies" className="flex items-center space-x-2">
                <Film className="h-6 w-6 text-primary" />
                <span className="inline-block font-bold">Talent Movie</span>
              </Link>
              <nav className="flex gap-6">
                <Link
                  to="/movies"
                  preload="intent"
                  className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground [&.active]:text-foreground"
                >
                  Movies
                </Link>
                <Link
                  to="/favorites"
                  preload="intent"
                  className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground [&.active]:text-foreground"
                >
                  Favorites
                </Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 px-4 md:px-8">
          <Outlet />
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;
