type WasteRecordFormProps = {
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
};

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
  return (
    <div
      style={{
        backgroundColor: "white",
        padding: "25px",
        borderRadius: "12px",
        marginBottom: "25px",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <h2>Add Waste Record</h2>

      <div
  style={{
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    width: "100%",
  }}
>
        <label>Record ID</label>
        <input
          value={recordId}
          onChange={(e) => setRecordId(e.target.value)}
        />
      </div>

      <div
  style={{
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    width: "100%",
  }}
>
        <label>Family ID</label>
        <input
        style={{
  width: "100%",
  boxSizing: "border-box",
}}
          value={selectedFamilyId}
          onChange={(e) => setSelectedFamilyId(e.target.value)}
        />
      </div>

      <div
  style={{
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    width: "100%",
  }}
>
        <label>Total Weight (kg)</label>
        <input
          type="number"
          value={totalWeight}
          onChange={(e) => setTotalWeight(e.target.value)}
        />
      </div>

      <div
  style={{
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    width: "100%",
  }}
>
        <label>Dry Waste (kg)</label>
        <input
          type="number"
          value={dryWeight}
          onChange={(e) => setDryWeight(e.target.value)}
        />
      </div>

      <div
  style={{
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    width: "100%",
  }}
>
        <label>Wet Waste (kg)</label>
        <input
          type="number"
          value={wetWeight}
          onChange={(e) => setWetWeight(e.target.value)}
        />
      </div>

      <div
  style={{
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    width: "100%",
  }}
>
        <label>Recyclable Waste (kg)</label>
        <input
          type="number"
          value={recyclableWeight}
          onChange={(e) =>
            setRecyclableWeight(e.target.value)
          }
        />
      </div>

      <button onClick={onSubmit} disabled={submitting}>
        {submitting ? "Saving..." : "Save Waste Record"}
      </button>

      <button onClick={onReset} disabled={submitting}>
        Reset Form
      </button>
    </div>
  );
}

export default WasteRecordForm;