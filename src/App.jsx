import React, { useState } from "react";
import axios from "axios";

function App() {
  const [data, setData] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const selectFile = (e) => {
    setFile(e.target.files[0]);
    setMessage("");
  };

  const uploadFile = async () => {
    if (!file) {
      setMessage("Please select a CSV file.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    try {
      const res = await axios.post("https://anomaly-detection-backend-1.onrender.com/upload/", formData);
      setData(res.data);
      setMessage("");
    } catch (err) {
      console.error(err);
      setMessage("Error uploading file.");
    }
    setLoading(false);
  };

  const detectAnomalies = async () => {
    setLoading(true);
    try {
      const response = await axios.get("https://anomaly-detection-backend-1.onrender.com/detect/");
      setData(response.data);
      setMessage("");
    } catch (err) {
      console.error(err);
      setMessage("Error fetching detection results.");
    }
    setLoading(false);
  };

  const saveReport = () => {
    if (!data) return;
    const lines = [];
    lines.push("Classification Report:\n");
    if (data.classification_report) {
      for (const [cls, stats] of Object.entries(data.classification_report)) {
        if (typeof stats === "object") {
          lines.push(`${cls}: Precision=${stats.precision?.toFixed(3)}, Recall=${stats.recall?.toFixed(3)}, F1=${stats["f1-score"]?.toFixed(3)}, Support=${stats.support}`);
        }
      }
    }
    lines.push(`\nTotal anomalies detected: ${data.anomaly_count}\n`);
    lines.push("Top Anomaly Explanations:\n");
    data.anomaly_explanations?.forEach((exp, i) => {
      const row = Object.entries(exp).map(([k, v]) => `${k} = ${v.toFixed(3)}`).join(", ");
      lines.push(`Anomaly ${i + 1}: ${row}`);
    });

    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "anomaly_report.txt";
    link.click();
  };

  return (
    <div style={{ backgroundColor: "#121212", minHeight: "100vh", width: "100vw", padding: "40px 0", fontFamily: "Arial, sans-serif", color: "#fff", display: "flex", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: "1000px", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "20px" }}>Anomaly Detection System</h1>

        <div style={{ backgroundColor: "#1e1e1e", padding: "20px", borderRadius: "10px", maxWidth: "500px", width: "100%", marginBottom: "30px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ width: "80%", marginBottom: "10px" }}>
            <input
              type="file"
              onChange={selectFile}
              accept=".csv"
              style={{
                width: "100%",
                padding: "10px",
                backgroundColor: "#333",
                border: "1px solid #444",
                color: "#fff",
                borderRadius: "5px",
              }}
            />
          </div>
          <div style={{ width: "80%", marginBottom: "10px" }}>
            <button
              onClick={uploadFile}
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#007bff",
                border: "none",
                borderRadius: "5px",
                color: "#fff",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              {loading ? "Analysing..." : "Upload & Analyse"}
            </button>
          </div>
          <div style={{ width: "80%" }}>
            <button
              onClick={detectAnomalies}
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#dc3545",
                border: "none",
                borderRadius: "5px",
                color: "#fff",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              {loading ? "Fetching..." : "Run Analysis"}
            </button>
          </div>
          {message && <p style={{ color: "tomato", marginTop: "10px" }}>{message}</p>}
        </div>

        {data && (
          <div style={{ width: "100%", backgroundColor: "#1e1e1e", padding: "30px", borderRadius: "10px" }}>
            {data.classification_report ? (
              <>
                <h2 style={{ color: "#ffcc00", textAlign: "center" }}>Classification Report</h2>
                <table style={{ width: "100%", marginTop: "15px", backgroundColor: "#2a2a2a", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Class</th>
                      <th style={thStyle}>Precision</th>
                      <th style={thStyle}>Recall</th>
                      <th style={thStyle}>F1 Score</th>
                      <th style={thStyle}>Support</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(data.classification_report).map(([label, val]) => (
                      typeof val === "object" ? (
                        <tr key={label}>
                          <td style={tdStyle}>{label}</td>
                          <td style={tdStyle}>{val.precision?.toFixed(3)}</td>
                          <td style={tdStyle}>{val.recall?.toFixed(3)}</td>
                          <td style={tdStyle}>{val["f1-score"]?.toFixed(3)}</td>
                          <td style={tdStyle}>{val.support}</td>
                        </tr>
                      ) : null
                    ))}
                  </tbody>
                </table>
              </>
            ) : (
              <h3 style={{ color: "#ccc", textAlign: "center" }}>No Classification Report Available (unsupervised data)</h3>
            )}

            <h2 style={{ color: "#ffcc00", textAlign: "center", marginTop: "30px" }}>Predicted Anomalies</h2>
            <p style={{ textAlign: "center" }}>Total anomalies detected: <strong>{data.anomaly_count}</strong></p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, 20px)", gap: "6px", justifyContent: "center", marginTop: "10px", fontSize: "12px" }}>
              {data.predictions?.map((p, i) => (
                <span key={i} style={{ color: p === 1 ? "red" : "#ccc", textAlign: "center" }}>{p}</span>
              ))}
            </div>

            <h2 style={{ color: "#ffcc00", textAlign: "center", marginTop: "30px" }}>Top Anomaly Explanations</h2>
            <div style={{ marginTop: "15px" }}>
              {data.anomaly_explanations?.map((exp, i) => (
                <div key={i} style={{ backgroundColor: "#2a2a2a", padding: "10px", marginBottom: "10px", borderRadius: "5px" }}>
                  <strong>Anomaly {i + 1}:</strong> {Object.entries(exp).map(([k, v]) => `${k} = ${v.toFixed(3)}`).join(", ")}
                </div>
              ))}
            </div>

            <button onClick={saveReport} style={{ marginTop: "20px", padding: "10px 20px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", display: "block", marginLeft: "auto", marginRight: "auto" }}>
              Download Report
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const thStyle = {
  padding: "10px",
  backgroundColor: "#444",
  color: "#fff",
  borderBottom: "1px solid #555"
};

const tdStyle = {
  padding: "10px",
  textAlign: "center",
  borderBottom: "1px solid #333",
};

export default App;
