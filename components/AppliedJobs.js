"use client";

import { useState, useEffect } from "react";

const jobs = [
  { id: 1, company: "Google", role: "Software Engineer" },
  { id: 2, company: "Amazon", role: "Data Analyst" },
  { id: 3, company: "Facebook", role: "Product Manager" },
  { id: 4, company: "Microsoft", role: "Cloud Engineer" },
];

export default function JobTrackerPage() {
  const [applications, setApplications] = useState({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem("applications");
      if (saved) setApplications(JSON.parse(saved));
    } catch {
      localStorage.removeItem("applications");
    }
  }, []);

  const handleApply = (jobId, status) => {
    const updated = { ...applications, [jobId]: status };
    setApplications(updated);
    localStorage.setItem("applications", JSON.stringify(updated));
  };

  const handleClear = () => {
    localStorage.removeItem("applications");
    setApplications({});
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h1>Job Application Tracker</h1>

      <button
        onClick={handleClear}
        style={{
          backgroundColor: "#f44336",
          color: "white",
          padding: "0.5rem 1rem",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          marginBottom: "1rem",
        }}
      >
        Clear All
      </button>

      {jobs.map((job) => (
        <div
          key={job.id}
          style={{
            border: "1px solid #ccc",
            padding: "1rem",
            margin: "1rem 0",
            borderRadius: "5px",
          }}
        >
          <strong>{job.role}</strong> at <em>{job.company}</em>
          <div style={{ marginTop: "0.5rem" }}>
            {applications[job.id] ? (
              <span
                style={{
                  color: applications[job.id] === "yes" ? "green" : "red",
                  fontWeight: "bold",
                }}
              >
                {applications[job.id] === "yes" ? "Applied" : "Not Applied"}
              </span>
            ) : (
              <>
                <button
                  onClick={() => handleApply(job.id, "yes")}
                  style={{ marginRight: "0.5rem" }}
                >
                  Yes
                </button>
                <button onClick={() => handleApply(job.id, "no")}>No</button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
