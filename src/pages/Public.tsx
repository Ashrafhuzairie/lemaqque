import { Link } from "react-router-dom";
import { Brand } from "../components/Shell";
import { Button } from "../components/ui/button";
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
          LÉMAQQUE keeps your training, nutrition and progress records in your
          chosen workspace. Here is how storage, backups and deletion work.
        </p>
        <h2>Device-local workspace</h2>
        <p>
          Signed-in members can use a device workspace when cloud storage is
          unavailable. Its records are stored in this browser and are not
          automatically uploaded. Anyone with access to this browser profile may
          access those records. Export backups in Settings. Clearing browser
          storage removes local records.
        </p>
        <h2>Cloud accounts</h2>
        <p>
          When Supabase is configured and you sign in, profile, training,
          nutrition and measurement records are stored in the connected Supabase
          project. Email and authentication are handled by Supabase. Local and
          account records stay separate. If a connection or save fails, the app
          shows an error; cloud writes are not queued for an offline upload.
        </p>
        <h2>Export and deletion</h2>
        <p>
          Settings exports your tracking records as JSON. Local deletion clears
          this workspace. Cloud deletion calls a server function that deletes
          your private files and account. If deletion fails, the app shows an
          error so you can retry. Export a backup before deleting records you
          want to keep.
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
