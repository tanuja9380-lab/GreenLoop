interface WasteRecordFormProps {
  recordId: string;
  selectedFamilyId: string;
  totalWeight: string;
  dryWeight: string;
  wetWeight: string;
  recyclableWeight: string;
  submitting: boolean;

  setRecordId: (value: string) => void;
  setSelectedFamilyId: (value: string) => void;
  setTotalWeight: (value: string) => void;
  setDryWeight: (value: string) => void;
  setWetWeight: (value: string) => void;
  setRecyclableWeight: (value: string) => void;

  onSubmit: () => void;
  onReset: () => void;
}

function WasteRecordForm({
  recordId,
  selectedFamilyId,
  totalWeight,
  dryWeight,
  wetWeight,
  recyclableWeight,
  submitting,
  setRecordId,
  setSelectedFamilyId,
  setTotalWeight,
  setDryWeight,
  setWetWeight,
  setRecyclableWeight,
  onSubmit,
  onReset,
}: WasteRecordFormProps) {
  const fieldStyle = {
    display: "flex",
    flexDirection: "column" as const,
    gap: "6px",
    width: "100%",
  };

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box" as const,
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "6px",
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "500px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "15px",
        boxSizing: "border-box",
      }}
    >
      <h2 style={{ margin: 0 }}>Add Waste Record</h2>

      <p style={{ margin: 0 }}>
        Enter the waste collection details below.
      </p>

      <div style={fieldStyle}>
        <label>Record ID</label>
        <input
          type="text"
          style={inputStyle}
          value={recordId}
          onChange={(event) => setRecordId(event.target.value)}
        />
      </div>

      <div style={fieldStyle}>
        <label>Family</label>
        <input
          type="text"
          style={inputStyle}
          value={selectedFamilyId}
          onChange={(event) =>
            setSelectedFamilyId(event.target.value)
          }
        />
      </div>

      <div style={fieldStyle}>
        <label>Total Weight (kg)</label>
        <input
          type="number"
          min="0"
          step="0.1"
          style={inputStyle}
          value={totalWeight}
          onChange={(event) =>
            setTotalWeight(event.target.value)
          }
        />
      </div>

      <div style={fieldStyle}>
        <label>Dry Waste (kg)</label>
        <input
          type="number"
          min="0"
          step="0.1"
          style={inputStyle}
          value={dryWeight}
          onChange={(event) =>
            setDryWeight(event.target.value)
          }
        />
      </div>

      <div style={fieldStyle}>
        <label>Wet Waste (kg)</label>
        <input
          type="number"
          min="0"
          step="0.1"
          style={inputStyle}
          value={wetWeight}
          onChange={(event) =>
            setWetWeight(event.target.value)
          }
        />
      </div>

      <div style={fieldStyle}>
        <label>Recyclable Waste (kg)</label>
        <input
          type="number"
          min="0"
          step="0.1"
          style={inputStyle}
          value={recyclableWeight}
          onChange={(event) =>
            setRecyclableWeight(event.target.value)
          }
        />
      </div>

      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting}
          style={{
            padding: "10px 16px",
            border: "none",
            borderRadius: "6px",
            cursor: submitting ? "not-allowed" : "pointer",
          }}
        >
          {submitting ? "Saving..." : "Save Waste Record"}
        </button>

        <button
          type="button"
          onClick={onReset}
          style={{
            padding: "10px 16px",
            border: "1px solid #ccc",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Reset Form
        </button>
      </div>
    </div>
  );
}

export default WasteRecordForm;