import { Link } from "react-router-dom";

export const NotFound = () => (
  <main className="grid min-h-screen place-items-center bg-neutral-50 px-6 text-center dark:bg-neutral-950">
    <div>
      <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
        Page not found
      </h1>
      <p className="mt-3 text-neutral-600 dark:text-neutral-400">
        The page you requested does not exist or may have moved.
      </p>
      <Link
        to="/"
        className="mt-6 inline-block font-medium text-primary-700 hover:text-primary-800 dark:text-primary-400"
      >
        Return to Spend Analyzer
      </Link>
    </div>
  </main>
);
