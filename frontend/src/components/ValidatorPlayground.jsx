import React, { useState } from "react";
import { ShieldCheck, CheckCircle2, AlertCircle, X } from "lucide-react";
import { validatorApi } from "../api/client";

export default function ValidatorPlayground({ isOpen, onClose }) {
  // 1) Component local state
  const [testUrl, setTestUrl] = useState("");
  const [testPlatform, setTestPlatform] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // 2) Validate URL using Phase 1 validator API
  const handleValidate = async (e) => {
    if (e) e.preventDefault();
    if (!testUrl.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      // Step A: Call backend validation endpoint
      const res = await validatorApi.validateUrl(
        testUrl.trim(),
        testPlatform || null,
      );
      setResult(res);
    } catch (err) {
      setResult({
        is_valid: false,
        error_message: err.message || "Validation request failed.",
      });
    } finally {
      setLoading(false);
    }
  };

  // 3) Pre-built test samples helper
  const runSampleTest = (url, plat = "") => {
    setTestUrl(url);
    setTestPlatform(plat);
    setTimeout(async () => {
      setLoading(true);
      try {
        const res = await validatorApi.validateUrl(url, plat || null);
        setResult(res);
      } catch (err) {
        setResult({ is_valid: false, error_message: err.message });
      } finally {
        setLoading(false);
      }
    }, 50);
  };

  return (
    <div className="modal-overlay">
      <div
        className="glass-panel-glow"
        style={{ width: "100%", maxWidth: "580px", padding: "26px" }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "18px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                padding: "6px",
                borderRadius: "6px",
                background: "rgba(52, 211, 153, 0.15)",
                color: "#34d399",
              }}
            >
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 800 }}>
                Strict Submission Proof Validator
              </h3>
              <p style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
                Phase 1 Testing Tool: Verify that generic problem links are
                rejected and verdict proofs are accepted.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* URL Form */}
        <form
          onSubmit={handleValidate}
          style={{ display: "flex", flexDirection: "column", gap: "12px" }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.8rem",
                color: "var(--text-muted)",
                marginBottom: "4px",
              }}
            >
              Paste Any Competitive Programming URL:
            </label>
            <input
              type="url"
              required
              placeholder="e.g. https://codeforces.com/contest/1800/submission/278912301"
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              style={{ width: "100%" }}
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <select
              value={testPlatform}
              onChange={(e) => setTestPlatform(e.target.value)}
              style={{ fontSize: "0.8rem" }}
            >
              <option value="">Auto-Detect Platform</option>
              <option value="codeforces">Codeforces</option>
              <option value="codechef">CodeChef</option>
              <option value="atcoder">AtCoder</option>
              <option value="leetcode">LeetCode</option>
              <option value="other">Other</option>
            </select>

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "Checking..." : "Validate Link"}
            </button>
          </div>
        </form>

        {/* Result Outcome Display */}
        {result && (
          <div
            style={{
              marginTop: "16px",
              padding: "14px",
              borderRadius: "8px",
              background: result.is_valid
                ? "rgba(16, 185, 129, 0.1)"
                : "rgba(239, 68, 68, 0.1)",
              border: result.is_valid
                ? "1px solid rgba(16, 185, 129, 0.4)"
                : "1px solid rgba(239, 68, 68, 0.4)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "4px",
              }}
            >
              {result.is_valid ? (
                <CheckCircle2 size={18} color="#34d399" />
              ) : (
                <AlertCircle size={18} color="#f87171" />
              )}
              <h4
                style={{
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  color: result.is_valid ? "#34d399" : "#f87171",
                }}
              >
                {result.is_valid
                  ? "VALID SUBMISSION PROOF"
                  : "REJECTED: GENERIC PROBLEM LINK"}
              </h4>
            </div>
            {result.detected_platform && (
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "#00f2fe",
                  marginBottom: "2px",
                }}
              >
                Detected Platform:{" "}
                <strong>{result.detected_platform.toUpperCase()}</strong>
              </p>
            )}
            {result.error_message && (
              <p
                style={{
                  fontSize: "0.8rem",
                  color: "#fca5a5",
                  marginTop: "4px",
                }}
              >
                {result.error_message}
              </p>
            )}
          </div>
        )}

        {/* 1-Click Test Samples */}
        <div
          style={{
            marginTop: "20px",
            borderTop: "1px solid var(--border-subtle)",
            paddingTop: "14px",
          }}
        >
          <p
            style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "var(--text-dim)",
              marginBottom: "8px",
            }}
          >
            CLICK TO TEST PRE-BUILT SAMPLES:
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "8px",
            }}
          >
            <button
              onClick={() =>
                runSampleTest(
                  "https://codeforces.com/contest/1800/submission/278912301",
                  "codeforces",
                )
              }
              className="btn-secondary"
              style={{ fontSize: "0.75rem", justifyContent: "flex-start" }}
            >
              🟢 Valid Codeforces Proof
            </button>
            <button
              onClick={() =>
                runSampleTest(
                  "https://codeforces.com/problemset/problem/1800/E",
                  "codeforces",
                )
              }
              className="btn-secondary"
              style={{
                fontSize: "0.75rem",
                justifyContent: "flex-start",
                color: "#f87171",
              }}
            >
              🔴 Generic Codeforces Problem
            </button>

            <button
              onClick={() =>
                runSampleTest(
                  "https://www.codechef.com/viewsolution/108923412",
                  "codechef",
                )
              }
              className="btn-secondary"
              style={{ fontSize: "0.75rem", justifyContent: "flex-start" }}
            >
              🟢 Valid CodeChef Proof
            </button>
            <button
              onClick={() =>
                runSampleTest(
                  "https://www.codechef.com/problems/FLOW001",
                  "codechef",
                )
              }
              className="btn-secondary"
              style={{
                fontSize: "0.75rem",
                justifyContent: "flex-start",
                color: "#f87171",
              }}
            >
              🔴 Generic CodeChef Problem
            </button>

            <button
              onClick={() =>
                runSampleTest(
                  "https://atcoder.jp/contests/abc340/submissions/50123984",
                  "atcoder",
                )
              }
              className="btn-secondary"
              style={{ fontSize: "0.75rem", justifyContent: "flex-start" }}
            >
              🟢 Valid AtCoder Proof
            </button>
            <button
              onClick={() =>
                runSampleTest(
                  "https://atcoder.jp/contests/abc340/tasks/abc340_a",
                  "atcoder",
                )
              }
              className="btn-secondary"
              style={{
                fontSize: "0.75rem",
                justifyContent: "flex-start",
                color: "#f87171",
              }}
            >
              🔴 Generic AtCoder Task
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
