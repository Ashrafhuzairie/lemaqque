import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Plus, TrendingUp, Trash2 } from "lucide-react";
import { z } from "zod";
import { Button } from "../components/ui/button";
import {
  PageHead,
  Field,
  Notice,
  DataGate,
  Empty,
  round,
} from "../components/common";
import {
  useRows,
  useSave,
  useRemove,
  useStore,
  useProfile,
  identity,
} from "../lib/store";
import { localDay, volume } from "../lib/fitness";
export default function Progress() {
  const measurements = useRows("body_measurements"),
    logs = useRows("set_logs"),
    sessions = useRows("workout_sessions");
  const save = useSave("body_measurements"),
    remove = useRemove("body_measurements");
  const { userId } = useStore();
  const { profile } = useProfile();
  const [show, setShow] = useState(false),
    [error, setError] = useState(""),
    [period, setPeriod] = useState(30);
  const since = new Date();
  since.setDate(since.getDate() - period);
  const data =
    measurements.data
      ?.filter((m) => m.day >= localDay(since, profile?.timezone))
      .sort((a, b) => a.day.localeCompare(b.day)) || [];
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    try {
      const form = Object.fromEntries(new FormData(e.currentTarget));
      const values = z
        .object({
          day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
          weight: z.coerce.number().min(30).max(400),
          waist: z.preprocess(
            (v) => (v === "" ? null : v),
            z.coerce.number().min(20).max(300).nullable(),
          ),
          chest: z.preprocess(
            (v) => (v === "" ? null : v),
            z.coerce.number().min(20).max(300).nullable(),
          ),
          hips: z.preprocess(
            (v) => (v === "" ? null : v),
            z.coerce.number().min(20).max(300).nullable(),
          ),
        })
        .parse(form);
      if (values.day > localDay(new Date(), profile?.timezone))
        throw Error("Measurements cannot be dated in the future.");
      await save.mutateAsync({ ...identity(userId!), ...values });
      setShow(false);
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <>
      <PageHead
        title="Progress, in perspective."
        description="Look at the trend. Celebrate the work behind it."
      >
        <Button onClick={() => setShow(!show)}>
          <Plus size={17} />
          Log measurement
        </Button>
      </PageHead>
      <DataGate queries={[measurements, logs, sessions]}>
        {error && <Notice error>{error}</Notice>}
        <div className="attendance-stats">
          <div>
            <strong>
              {measurements.data?.sort((a, b) => b.day.localeCompare(a.day))[0]
                ?.weight || "—"}{" "}
              <small>kg</small>
            </strong>
            <span>latest logged weight</span>
          </div>
          <div>
            <strong>
              {sessions.data?.filter((s) => s.status === "completed").length ||
                0}
            </strong>
            <span>completed sessions</span>
          </div>
          <div>
            <strong>
              {round(
                volume(
                  (logs.data || []).filter((l) =>
                    sessions.data?.some(
                      (s) => s.id === l.session_id && s.status === "completed",
                    ),
                  ),
                ),
              )}{" "}
              <small>kg</small>
            </strong>
            <span>total recorded volume</span>
          </div>
        </div>
        {show && (
          <form className="panel" onSubmit={submit}>
            <h2>A moment to check in.</h2>
            <div className="form-grid">
              <Field label="Measurement date">
                <input
                  type="date"
                  name="day"
                  defaultValue={localDay(new Date(), profile?.timezone)}
                  required
                />
              </Field>
              <Field label="Weight · kg">
                <input
                  type="number"
                  name="weight"
                  step={0.1}
                  min={30}
                  max={400}
                  required
                />
              </Field>
              {["waist", "chest", "hips"].map((k) => (
                <Field
                  key={k}
                  label={`${k[0].toUpperCase() + k.slice(1)} · cm (optional)`}
                >
                  <input type="number" name={k} step={0.1} min={20} max={300} />
                </Field>
              ))}
            </div>
            <Button disabled={save.isPending}>Save measurement</Button>
          </form>
        )}
        <section className="panel">
          <header className="chart-header">
            <div>
              <h2>Body weight</h2>
              <p>
                Only your recorded measurements. No predicted transformation.
              </p>
            </div>
            <select
              aria-label="Chart period"
              value={period}
              onChange={(e) => setPeriod(Number(e.target.value))}
            >
              <option value={7}>7 days</option>
              <option value={30}>30 days</option>
              <option value={90}>90 days</option>
              <option value={365}>1 year</option>
            </select>
          </header>
          {data.length < 2 ? (
            <Empty
              title={
                data.length
                  ? "One entry. A starting point."
                  : "Your story is still unfolding."
              }
            >
              Log at least two measurements in this period to see a trend.
            </Empty>
          ) : (
            <>
              <div
                className="chart"
                role="img"
                aria-label="Body weight trend, detailed values in the table below"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data}>
                    <CartesianGrid vertical={false} stroke="#343742" />
                    <XAxis
                      dataKey="day"
                      tick={{ fill: "#b8becf", fontSize: 11 }}
                      tickFormatter={(v) => v.slice(5)}
                      axisLine={false}
                    />
                    <YAxis
                      domain={["dataMin - 2", "dataMax + 2"]}
                      tick={{ fill: "#b8becf", fontSize: 11 }}
                      axisLine={false}
                      unit="kg"
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#20232e",
                        border: "none",
                        borderRadius: 12,
                        color: "#f6f7fb",
                      }}
                    />
                    <Area
                      dataKey="weight"
                      name="Weight · kg"
                      type="monotone"
                      stroke="#ff4d57"
                      fill="#ff4d57"
                      fillOpacity={0.1}
                      strokeWidth={2}
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
          <div className="table-scroll">
            <table>
              <caption className="sr-only">Measurement history</caption>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Weight</th>
                  <th>Waist</th>
                  <th>Chest</th>
                  <th>Hips</th>
                  <th>
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.map((m) => (
                  <tr key={m.id}>
                    <td>{m.day}</td>
                    <td>{m.weight} kg</td>
                    <td>{m.waist ? m.waist + " cm" : "—"}</td>
                    <td>{m.chest ? m.chest + " cm" : "—"}</td>
                    <td>{m.hips ? m.hips + " cm" : "—"}</td>
                    <td>
                      <button
                        aria-label={"Delete measurement " + m.day}
                        onClick={() => {
                          if (window.confirm("Delete this measurement?"))
                            remove.mutate(m.id, {
                              onError: (e) => setError(e.message),
                            });
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="panel progress-note">
          <TrendingUp size={25} />
          <div>
            <h2>More than a number.</h2>
            <p>
              Strength, consistency, and how you feel all matter. Daily weight
              can fluctuate. This app does not measure muscle growth or predict
              physical appearance.
            </p>
          </div>
        </section>
      </DataGate>
    </>
  );
}
