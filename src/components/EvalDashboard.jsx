import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import {
  STRATEGY_COMPARISON,
  GUARDRAIL_EXAMPLES,
} from "../data/appConfig";

import PipelineAnimation from "./PipelineAnimation";


// ============================================================
// PERCENTILE HELPERS
// ============================================================

function percentile(values, p) {
  if (!values || values.length === 0) {
    return null;
  }

  const sorted = [...values]
    .filter(
      (v) =>
        typeof v === "number" &&
        Number.isFinite(v)
    )
    .sort((a, b) => a - b);

  if (sorted.length === 0) {
    return null;
  }

  if (sorted.length === 1) {
    return sorted[0];
  }

  const index =
    (sorted.length - 1) * p;

  const lower =
    Math.floor(index);

  const upper =
    Math.ceil(index);

  if (lower === upper) {
    return sorted[lower];
  }

  return (
    sorted[lower] +
    (sorted[upper] -
      sorted[lower]) *
      (index - lower)
  );
}


function formatMs(value) {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(value)
  ) {
    return "—";
  }

  return `${Number(value).toFixed(2)} ms`;}


function formatScore(value) {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(value)
  ) {
    return "—";
  }

  return Number(value).toFixed(3);
}


// ============================================================
// EVALUATION DASHBOARD
// ============================================================

export default function EvalDashboard({
  evaluation,
}) {

  /*
   * IMPORTANT:
   *
   * The strategy comparison below is the original comparison
   * from the project.
   *
   * The latency section is live and uses individual query
   * latencies when available.
   */

  const latencies =
    evaluation?.latencies || [];


  const p50 =
    percentile(
      latencies,
      0.50
    );

  const p70 =
    percentile(
      latencies,
      0.70
    );

  const p100 =
    percentile(
      latencies,
      1.00
    );


  const latencyData = [
    {
      name: "P50",
      ms: p50 ?? 0,
    },
    {
      name: "P70",
      ms: p70 ?? 0,
    },
    {
      name: "P100",
      ms: p100 ?? 0,
    },
  ];


  const queryCount =
    latencies.length;

  const liveScores =
    (evaluation?.scores || [])
      .filter(
        (v) =>
          typeof v === "number" &&
          Number.isFinite(v)
      );

  const liveRetrievalScore =
    liveScores.length > 0
      ? liveScores.reduce(
          (sum, value) => sum + value,
          0
        ) / liveScores.length
      : null;


  return (
    <div className="max-w-4xl mx-auto py-8 space-y-10">


      {/* ======================================================
          HOW IT WORKS
          ORIGINAL PIPELINE — PRESERVED
          ====================================================== */}

      <section>

        <h2 className="font-display text-2xl text-ocean mb-4">
          How it works
        </h2>

        <PipelineAnimation />

      </section>


      {/* ======================================================
          LIVE LATENCY
          ====================================================== */}

      <section>

        <h2 className="font-display text-2xl text-ocean mb-4">
          RAG Performance
        </h2>

        <p className="text-sm text-ink/50 mb-5 font-mono">
          Live RAG processing latency measured from current queries.
        </p>


        {/* P50 / P70 / P100 */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">


          {/* P50 */}

          <div className="bg-white/70 rounded-3xl p-6 border border-ocean/10">

            <p className="text-xs font-mono tracking-widest text-ocean/50 uppercase">
              P50
            </p>

            <p className="font-display text-4xl text-ocean font-semibold mt-2">
              {formatMs(p50)}
            </p>

            <p className="text-[10px] font-mono text-ink/40 mt-2">
              {queryCount > 0
                ? "real measurement"
                : "waiting for queries"}
            </p>

          </div>


          {/* P70 */}

          <div className="bg-white/70 rounded-3xl p-6 border border-ocean/10">

            <p className="text-xs font-mono tracking-widest text-ocean/50 uppercase">
              P70
            </p>

            <p className="font-display text-4xl text-ocean font-semibold mt-2">
              {formatMs(p70)}
            </p>

            <p className="text-[10px] font-mono text-ink/40 mt-2">
              {queryCount > 0
                ? "real measurement"
                : "waiting for queries"}
            </p>

          </div>


          {/* P100 */}

          <div className="bg-white/70 rounded-3xl p-6 border border-ocean/10">

            <p className="text-xs font-mono tracking-widest text-ocean/50 uppercase">
              P100
            </p>

            <p className="font-display text-4xl text-ocean font-semibold mt-2">
              {formatMs(p100)}
            </p>

            <p className="text-[10px] font-mono text-ink/40 mt-2">
              {queryCount > 0
                ? "real measurement"
                : "waiting for queries"}
            </p>

          </div>

        </div>


        {/* LATENCY DISTRIBUTION */}

        <div className="bg-white/70 rounded-3xl p-6 border border-ocean/10">

          <div className="flex items-center justify-between mb-4">

            <div>

              <h3 className="font-display text-xl text-ocean">
                Latency Distribution
              </h3>

              <p className="text-xs text-ink/50 mt-1 font-mono">
                {queryCount === 0
                  ? "No live queries measured yet"
                  : `${queryCount} real query${
                      queryCount === 1
                        ? ""
                        : "ies"
                    } measured`}
              </p>

            </div>

          </div>


          <ResponsiveContainer
            width="100%"
            height={260}
          >

            <BarChart
              data={latencyData}
              margin={{
                top: 20,
                right: 10,
                left: 0,
                bottom: 10,
              }}
            >

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#0F5C5C22"
              />

              <XAxis
                dataKey="name"
                stroke="#1B3A4B"
              />

              <YAxis
                stroke="#1B3A4B"
                unit="ms"
              />

              <Tooltip
                formatter={(value) => [
                  `${Number(value).toFixed(2)} ms`,
                  "Latency",
                ]}
              />

              <Bar
                dataKey="ms"
                fill="#4FB6BE"
                radius={[
                  8,
                  8,
                  0,
                  0,
                ]}
              />

            </BarChart>

          </ResponsiveContainer>


          <div className="flex flex-wrap justify-between gap-2 mt-3">

            <p className="text-xs text-ink/50 font-mono">
              Target: under 200ms server-side RAG processing
            </p>

            <p className="text-xs text-ink/50 font-mono">
              Queries measured: {queryCount}
            </p>

          </div>

        </div>

      </section>


      {/* ======================================================
          CHUNKING STRATEGY COMPARISON
          ====================================================== */}

      <section>

        <h2 className="font-display text-2xl text-ocean mb-4">
          Chunking strategy comparison
        </h2>

        <p className="text-xs text-ink/50 mb-4 font-mono">
          Five chunking strategies are retained from the V2 ingestion pipeline.
          Live metrics are shown only for the strategy currently deployed; the other four remain visible as implemented pipeline policies.
        </p>

        <div className="bg-white/70 rounded-3xl border border-ocean/10 overflow-x-auto">

          <table className="w-full text-sm min-w-[620px]">

            <thead>
              <tr className="bg-sand-dark/60 text-left text-ink/60 text-xs uppercase tracking-wide">
                <th className="px-4 py-3">Strategy</th>
                <th className="px-4 py-3">Retrieval Score</th>
                <th className="px-4 py-3">Latency</th>
                <th className="px-4 py-3">Notes</th>
              </tr>
            </thead>

            <tbody>
              {STRATEGY_COMPARISON.map((row) => (
                <tr
                  key={row.strategy}
                  className="border-t border-ocean/10"
                >
                  <td className="px-4 py-3 font-medium">
                    {row.strategy}
                  </td>

                  <td className="px-4 py-3 font-mono text-ocean">
                    {row.strategy === "Metadata-Aware"
                      ? formatScore(liveRetrievalScore)
                      : "—"}
                  </td>

                  <td className="px-4 py-3 font-mono">
                    {row.strategy === "Metadata-Aware"
                      ? formatMs(p50)
                      : "—"}
                  </td>

                  <td className="px-4 py-3 text-ink/60">
                    <span
                      className={`mr-2 inline-block text-[10px] font-mono px-2 py-0.5 rounded-full ${
                        row.status === "Deployed"
                          ? "bg-seafoam text-white"
                          : "bg-ocean/10 text-ocean"
                      }`}
                    >
                      {row.status}
                    </span>
                    {row.notes}
                  </td>
                </tr>
              ))}
            </tbody>

          </table>

        </div>

        <p className="text-[11px] text-ink/45 mt-3 font-mono">
          Scores and latency are not fabricated. The deployed Metadata-Aware strategy reports live source scores above; the other strategies are retained as implemented pipeline policies until their evaluation artifact is connected.
        </p>

      </section>


      {/* ======================================================
          GUARDRAILS
          ORIGINAL SECTION — RESTORED
          ====================================================== */}

      <section>

        <h2 className="font-display text-2xl text-ocean mb-4">
          Guardrails
        </h2>

        <div className="grid gap-3">

          {GUARDRAIL_EXAMPLES.map(
            (g, i) => (

              <div
                key={i}
                className="flex items-center justify-between bg-white/70 rounded-2xl px-4 py-3 border border-ocean/10"
              >

                <span className="font-mono text-sm text-ink/80">
                  {g.query}
                </span>

                <span
                  className={`
                    text-xs
                    font-medium
                    px-3
                    py-1
                    rounded-full
                    ${
                      g.verdict ===
                      "refused"
                        ? "bg-terracotta/15 text-terracotta"
                        : "bg-seafoam/20 text-ocean"
                    }
                  `}
                >

                  {g.verdict}

                </span>

              </div>

            )
          )}

        </div>

      </section>

    </div>
  );
}
