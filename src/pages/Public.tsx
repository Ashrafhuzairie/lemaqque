import { Link } from "react-router-dom";
import { Brand } from "../components/Shell";
import { Button } from "../components/ui/button";
import Programs from "./Programs";
export function PublicPrograms() {
  return (
    <div className="public-document">
      <nav>
        <Brand />
        <Button asChild variant="outline">
          <Link to="/auth">Open workspace</Link>
        </Button>
      </nav>
      <main>
        <Programs publicPage />
      </main>
    </div>
  );
}
export function Privacy() {
  return (
    <div className="public-document">
      <nav>
        <Brand />
        <Link to="/app">Workspace</Link>
      </nav>
      <main className="prose">
        <h1>Your data belongs to you.</h1>
        <p>
          LÉMAQQUE is an early-stage fitness tracking application. This page
          describes the implementation, not a claim of legal certification.
        </p>
        <h2>Device-local workspace</h2>
        <p>
          Data is stored in your browser’s IndexedDB. No account is created, and
          local records are not automatically uploaded. Anyone with access to
          this browser profile may access those records. Export backups in
          Settings. Clearing browser storage removes local records.
        </p>
        <h2>Cloud accounts</h2>
        <p>
          When Supabase is configured and you sign in, profile, training,
          nutrition and measurement records are stored in the connected Supabase
          project. The database migration restricts records to the authenticated
          owner. Email and authentication are handled by Supabase. Connection
          security and deployed policies must be verified by the operator before
          production use.
        </p>
        <h2>Export and deletion</h2>
        <p>
          Settings exports your tracking records as JSON. Local deletion clears
          this workspace. Cloud deletion calls a server function that deletes
          your private files and account. This requires the function to be
          deployed correctly. Contact details and the legal operating entity
          must be supplied before launch.
        </p>
        <h2>No invented health measurements</h2>
        <p>
          Body weight is entered by you. The application does not infer body
          composition, diagnose conditions, or promise a transformation. Food
          values come from your entries and cited sources.
        </p>
        <h2>Service and asset requests</h2>
        <p>
          Fonts are self-hosted. 3D assets are loaded only if an approved
          catalog entry is configured. Optional AI, advertising, and
          subscriptions are not enabled. Error reporting currently stays in the
          browser.
        </p>
        <Button asChild>
          <Link to="/app/settings">Manage my data</Link>
        </Button>
      </main>
    </div>
  );
}
export function Pricing() {
  return (
    <div className="public-document">
      <nav>
        <Brand />
        <Link to="/">Home</Link>
      </nav>
      <main className="prose">
        <h1>Focus on the practice.</h1>
        <p>
          Membership plans and billing have not launched. No price,
          subscription, or payment collection is active.
        </p>
        <Button asChild>
          <Link to="/auth">Open your workspace</Link>
        </Button>
      </main>
    </div>
  );
}
