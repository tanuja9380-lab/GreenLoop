import {
  useEffect,
  useState,
} from "react";

import {
  getHealth,
  getWasteRecords,
  getFamilies,
  createWasteRecord,
  createFamily,
  deleteWasteRecord,
  getCurrentUser,
  logoutUser,
} from "./api/api";
import WasteRecordForm from "./components/WasteRecordForm";
import AuthForm from "./components/AuthForm";

function App() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [records, setRecords] = useState<any[]>([]);
  const [families, setFamilies] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [backendStatus, setBackendStatus] =
    useState("Checking...");

  // Add Waste Record form state
  const [showAddRecord, setShowAddRecord] =
    useState(false);

  const [recordId, setRecordId] = useState("");
  const [selectedFamilyId, setSelectedFamilyId] =
    useState("");

  const [totalWeight, setTotalWeight] = useState("");
  const [dryWeight, setDryWeight] = useState("");
  const [wetWeight, setWetWeight] = useState("");
  const [recyclableWeight, setRecyclableWeight] =
    useState("");

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  // Add Family form state
  const [showAddFamily, setShowAddFamily] = useState(false);
  const [familyId, setFamilyId] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [householdSize, setHouseholdSize] = useState("");

  // Check backend health
  useEffect(() => {
    getHealth()
      .then((data) => {
        console.log("Backend health:", data);
        setBackendStatus("Connected");
      })
      .catch((error) => {
        console.error(
          "Backend health check failed:",
          error
        );
        setBackendStatus("Disconnected");
      });
  }, []);
  // Check if user is already logged in
useEffect(() => {
  getCurrentUser()
    .then((user) => {
      console.log("Current user:", user);
      setCurrentUser(user);
    })
    .catch(() => {
      setCurrentUser(null);
    })
    .finally(() => {
      setAuthChecking(false);
    });
}, []);
function handleLoginSuccess(user: any) {
  setCurrentUser(user);
}

async function handleLogout() {
  try {
    await logoutUser();
  } catch (error) {
    console.error("Logout failed:", error);
  } finally {
    setCurrentUser(null);
  }
}

  // Load waste records and families
  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [wasteData, familyData] =
        await Promise.all([
          getWasteRecords(),
          getFamilies(),
        ]);

      setRecords(wasteData);
      setFamilies(familyData);

      // Select first family automatically
      if (
        !selectedFamilyId &&
        familyData.length > 0
      ) {
        setSelectedFamilyId(
          familyData[0].family_id
        );
      }
    } catch (err) {
      console.error(err);
      setError(
        "Failed to load GreenLoop data"
      );
    } finally {
      setLoading(false);
    }
  }

  // Load data when page opens
  useEffect(() => {
    loadData();
  }, []);

  // Calculate total waste
  const totalWaste = records.reduce(
    (total, record) =>
      total +
      Number(record.total_weight || 0),
    0
  );

  // Calculate total green coins
  const totalCoins = records.reduce(
    (total, record) =>
      total +
      Number(record.green_coins || 0),
    0
  );

  // Calculate number of families
  const totalFamilies =
    families.length > 0
      ? families.length
      : new Set(
          records.map(
            (record) => record.family_id
          )
        ).size;

  // Calculate dry waste
  const dryWaste = records.reduce(
    (total, record) =>
      total +
      Number(
        record.dry_weight ??
          record.dry_waste ??
          record.dry ??
          0
      ),
    0
  );

  // Calculate wet waste
  const wetWaste = records.reduce(
    (total, record) =>
      total +
      Number(
        record.wet_weight ??
          record.wet_waste ??
          record.wet ??
          0
      ),
    0
  );

  // Calculate recyclable waste
  const recyclableWaste = records.reduce(
    (total, record) =>
      total +
      Number(
        record.recyclable_weight ??
          record.recyclable_waste ??
          record.recyclable ??
          0
      ),
    0
  );

  // Reset form
  function resetForm() {
    setRecordId("");
    setTotalWeight("");
    setDryWeight("");
    setWetWeight("");
    setRecyclableWeight("");

    setFormError("");
    setFormSuccess("");

    if (families.length > 0) {
      setSelectedFamilyId(
        families[0].family_id
      );
    }
  }
  // Add a new family
  async function handleAddFamily() {
    setFormError("");
    setFormSuccess("");

    if (!familyId.trim()) {
      setFormError("Please enter a Family ID.");
      return;
    }

    if (!familyName.trim()) {
      setFormError("Please enter a Family Name.");
      return;
    }

    if (!householdSize || Number(householdSize) <= 0) {
      setFormError("Please enter a valid household size.");
      return;
    }

    try {
      await createFamily({
        family_id: familyId.trim(),
        family_name: familyName.trim(),
        household_size: Number(householdSize),
      });

      setFormSuccess("Family created successfully.");

      setFamilyId("");
      setFamilyName("");
      setHouseholdSize("");

      setShowAddFamily(false);

      await loadData();
    } catch (err: any) {
      setFormError(
        err?.message || "Failed to create family."
      );
    }
  }

  // Add a new waste record
  async function handleAddWasteRecord(
  ) {

    setFormError("");

    // Validate Record ID
    if (!recordId.trim()) {
      setFormError(
        "Please enter a Record ID."
      );
      return;
    }

    // Validate family
    if (!selectedFamilyId) {
      setFormError(
        "Please select a family."
      );
      return;
    }

    // Validate empty fields
    if (
      totalWeight === "" ||
      dryWeight === "" ||
      wetWeight === "" ||
      recyclableWeight === ""
    ) {
      setFormError(
        "Please fill in all waste weight fields."
      );
      return;
    }

    const total = Number(totalWeight);
    const dry = Number(dryWeight);
    const wet = Number(wetWeight);
    const recyclable =
      Number(recyclableWeight);

    // Validate numbers
    if (
      !Number.isFinite(total) ||
      !Number.isFinite(dry) ||
      !Number.isFinite(wet) ||
      !Number.isFinite(recyclable)
    ) {
      setFormError(
        "Please enter valid numbers."
      );
      return;
    }

    // Validate negative values
    if (
      total < 0 ||
      dry < 0 ||
      wet < 0 ||
      recyclable < 0
    ) {
      setFormError(
        "Waste weights cannot be negative."
      );
      return;
    }

    try {
      setSubmitting(true);

      const newRecord =
        await createWasteRecord({
          record_id: recordId.trim(),
          family_id: selectedFamilyId,
          total_weight: total,
          dry_weight: dry,
          wet_weight: wet,
          recyclable_weight: recyclable,
        });

      console.log(
        "Waste record created:",
        newRecord
      );

      setFormSuccess(
        "Waste record created successfully!"
      );

      // Reload dashboard data
      await loadData();

      // Clear form
      setRecordId("");
      setTotalWeight("");
      setDryWeight("");
      setWetWeight("");
      setRecyclableWeight("");
    } catch (err) {
      console.error(err);

      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError(
          "Failed to create waste record."
        );
      }
    } finally {
      setSubmitting(false);
    }
  }
  async function handleDeleteWasteRecord(recordId: string) {
  const confirmed = window.confirm(
    `Are you sure you want to delete ${recordId}?`
  );

  if (!confirmed) {
    return;
  }

  try {
    await deleteWasteRecord(recordId);
    setFormSuccess("Waste record deleted successfully.");
    setFormError("");
    await loadData();
  } catch (err: any) {
    setFormError(
      err?.message || "Failed to delete waste record."
    );
  }
}

  if (authChecking) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Arial, sans-serif",
      }}
    >
      Checking authentication...
    </div>
  );
}

if (!currentUser) {
  return (
    <AuthForm
      onLoginSuccess={handleLoginSuccess}
    />
  );
}

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f4f7f5",
        fontFamily: "Arial, sans-serif",
        color: "#222",
      }}
    >
      {/* HEADER */}
      <header
        style={{
          backgroundColor: "white",
          borderBottom:
            "1px solid #e5e5e5",
          padding: "20px 30px",
        }}
      >
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "32px",
                color: "#1b5e20",
              }}
            >
              GreenLoop
            </h1>

            <p
              style={{
                margin: "5px 0 0",
                color: "#666",
                fontSize: "15px",
              }}
            >
              Smart Waste Management &
              Green Rewards Platform
            </p>
          </div>

          {/* BACKEND STATUS */}
          <div
            style={{
              padding: "10px 16px",
              borderRadius: "20px",
              backgroundColor:
                backendStatus ===
                "Connected"
                  ? "#e8f5e9"
                  : backendStatus ===
                    "Disconnected"
                  ? "#ffebee"
                  : "#fff8e1",
              color:
                backendStatus ===
                "Connected"
                  ? "#2e7d32"
                  : backendStatus ===
                    "Disconnected"
                  ? "#c62828"
                  : "#f57c00",
              fontWeight: "bold",
              fontSize: "14px",
              whiteSpace: "nowrap",
            }}
          >
            ● Backend: {backendStatus}
          </div>
          <button
  onClick={handleLogout}
  style={{
    backgroundColor: "#c62828",
    color: "white",
    border: "none",
    padding: "10px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  }}
>
  Logout
</button>
        </div>
      </header>

      {/* MAIN */}
      <main
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "35px 30px",
        }}
      >
        {/* TITLE + ACTIONS */}
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            marginBottom: "25px",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "24px",
              }}
            >
              Overview of waste
              management activity
            </h2>
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            {/* REFRESH */}
            <button
              onClick={loadData}
              style={{
                backgroundColor:
                  "#2e7d32",
                color: "white",
                border: "none",
                padding:
                  "12px 20px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Refresh Records
            </button>

            {/* ADD RECORD */}
            {/* ADD FAMILY */}
<button
  onClick={() => {
    setShowAddFamily(!showAddFamily);
    setFormError("");
    setFormSuccess("");
  }}
  style={{
    backgroundColor: "#2e7d32",
    color: "white",
    border: "none",
    padding: "12px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    marginRight: "10px",
  }}
>
  {showAddFamily ? "Close Family Form" : "Add Family"}
</button>
            <button
              onClick={() => {
                setShowAddRecord(
                  !showAddRecord
                );
                setFormError("");
                setFormSuccess("");
              }}
              style={{
                backgroundColor:
                  "#1565c0",
                color: "white",
                border: "none",
                padding:
                  "12px 20px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              {showAddRecord
                ? "Close Form"
                : "Add Waste Record"}
            </button>
          </div>
        </div>

        {/* ADD FAMILY FORM */}
{showAddFamily && (
  <div
    style={{
      backgroundColor: "white",
      padding: "25px",
      borderRadius: "12px",
      marginBottom: "25px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    }}
  >
    <h2
      style={{
        marginTop: 0,
        marginBottom: "20px",
      }}
    >
      Add New Family
    </h2>

    <div
      style={{
        display: "grid",
        gap: "15px",
      }}
    >
      <input
        type="text"
        placeholder="Family ID"
        value={familyId}
        onChange={(e) => setFamilyId(e.target.value)}
        style={{
          padding: "12px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          fontSize: "16px",
        }}
      />

      <input
        type="text"
        placeholder="Family Name"
        value={familyName}
        onChange={(e) => setFamilyName(e.target.value)}
        style={{
          padding: "12px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          fontSize: "16px",
        }}
      />

      <input
        type="number"
        placeholder="Household Size"
        value={householdSize}
        onChange={(e) => setHouseholdSize(e.target.value)}
        min="1"
        style={{
          padding: "12px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          fontSize: "16px",
        }}
      />

      <div>
        <button
          onClick={handleAddFamily}
          style={{
            backgroundColor: "#2e7d32",
            color: "white",
            border: "none",
            padding: "12px 20px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
            marginRight: "10px",
          }}
        >
          Add Family
        </button>

        <button
          onClick={() => {
            setFamilyId("");
            setFamilyName("");
            setHouseholdSize("");
            setFormError("");
            setFormSuccess("");
          }}
          style={{
            backgroundColor: "#757575",
            color: "white",
            border: "none",
            padding: "12px 20px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Reset
        </button>
      </div>
    </div>
  </div>
)}

       {/* ADD WASTE RECORD FORM */}
{showAddRecord && (
  <WasteRecordForm
    recordId={recordId}
    selectedFamilyId={selectedFamilyId}
    totalWeight={totalWeight}
    dryWeight={dryWeight}
    wetWeight={wetWeight}
    recyclableWeight={recyclableWeight}
    submitting={submitting}
    setRecordId={setRecordId}
    setSelectedFamilyId={setSelectedFamilyId}
    setTotalWeight={setTotalWeight}
    setDryWeight={setDryWeight}
    setWetWeight={setWetWeight}
    setRecyclableWeight={setRecyclableWeight}
    onSubmit={() => handleAddWasteRecord()}
    onReset={resetForm}
  />
)}
{formSuccess && (
  <div
    style={{
      backgroundColor: "#e8f5e9",
      color: "#2e7d32",
      padding: "15px 20px",
      borderRadius: "8px",
      marginBottom: "25px",
    }}
  >
    {formSuccess}
  </div>
)}
{formError && (
  <div
    style={{
      backgroundColor: "#ffebee",
      color: "#c62828",
      padding: "15px 20px",
      borderRadius: "8px",
      marginBottom: "25px",
    }}
  >
    {formError}
  </div>
)}

        {/* LOADING */}
        {loading && (
          <div
            style={{
              backgroundColor: "white",
              padding: "30px",
              borderRadius: "12px",
              textAlign: "center",
              marginBottom: "25px",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "18px",
              }}
            >
              Loading GreenLoop data...
            </p>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div
            style={{
              backgroundColor: "#ffebee",
              color: "#c62828",
              padding: "15px 20px",
              borderRadius: "8px",
              marginBottom: "25px",
            }}
          >
            {error}
          </div>
        )}

        {/* DASHBOARD */}
        {!loading && !error && (
          <>
            {/* MAIN STAT CARDS */}
            <section
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "20px",
                marginBottom: "25px",
              }}
            >
              {/* TOTAL WASTE */}
              <div
                style={{
                  backgroundColor:
                    "white",
                  padding: "25px",
                  borderRadius:
                    "12px",
                  boxShadow:
                    "0 2px 8px rgba(0,0,0,0.08)",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    color: "#666",
                    fontSize: "15px",
                  }}
                >
                  Total Waste
                </p>

                <h2
                  style={{
                    margin:
                      "10px 0 0",
                    fontSize:
                      "28px",
                  }}
                >
                  {totalWaste.toFixed(
                    1
                  )}{" "}
                  kg
                </h2>
              </div>

              {/* GREEN COINS */}
              <div
                style={{
                  backgroundColor:
                    "white",
                  padding: "25px",
                  borderRadius:
                    "12px",
                  boxShadow:
                    "0 2px 8px rgba(0,0,0,0.08)",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    color: "#666",
                    fontSize: "15px",
                  }}
                >
                  Green Coins
                </p>

                <h2
                  style={{
                    margin:
                      "10px 0 0",
                    fontSize:
                      "28px",
                  }}
                >
                  {totalCoins}
                </h2>
              </div>

              {/* FAMILIES */}
              <div
                style={{
                  backgroundColor:
                    "white",
                  padding: "25px",
                  borderRadius:
                    "12px",
                  boxShadow:
                    "0 2px 8px rgba(0,0,0,0.08)",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    color: "#666",
                    fontSize: "15px",
                  }}
                >
                  Families
                </p>

                <h2
                  style={{
                    margin:
                      "10px 0 0",
                    fontSize:
                      "28px",
                  }}
                >
                  {totalFamilies}
                </h2>
              </div>

              {/* RECORDS */}
              <div
                style={{
                  backgroundColor:
                    "white",
                  padding: "25px",
                  borderRadius:
                    "12px",
                  boxShadow:
                    "0 2px 8px rgba(0,0,0,0.08)",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    color: "#666",
                    fontSize: "15px",
                  }}
                >
                  Waste Records
                </p>

                <h2
                  style={{
                    margin:
                      "10px 0 0",
                    fontSize:
                      "28px",
                  }}
                >
                  {records.length}
                </h2>
              </div>
            </section>

            {/* WASTE CATEGORY CARDS */}
            <section
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "20px",
                marginBottom: "30px",
              }}
            >
              {/* DRY */}
              <div
                style={{
                  backgroundColor:
                    "white",
                  padding: "25px",
                  borderRadius:
                    "12px",
                  boxShadow:
                    "0 2px 8px rgba(0,0,0,0.08)",
                  textAlign:
                    "center",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    color: "#666",
                  }}
                >
                  Dry Waste
                </p>

                <h2
                  style={{
                    margin:
                      "10px 0 0",
                    fontSize:
                      "25px",
                  }}
                >
                  {dryWaste.toFixed(
                    1
                  )}{" "}
                  kg
                </h2>
              </div>

              {/* WET */}
              <div
                style={{
                  backgroundColor:
                    "white",
                  padding: "25px",
                  borderRadius:
                    "12px",
                  boxShadow:
                    "0 2px 8px rgba(0,0,0,0.08)",
                  textAlign:
                    "center",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    color: "#666",
                  }}
                >
                  Wet Waste
                </p>

                <h2
                  style={{
                    margin:
                      "10px 0 0",
                    fontSize:
                      "25px",
                  }}
                >
                  {wetWaste.toFixed(
                    1
                  )}{" "}
                  kg
                </h2>
              </div>

              {/* RECYCLABLE */}
              <div
                style={{
                  backgroundColor:
                    "white",
                  padding: "25px",
                  borderRadius:
                    "12px",
                  boxShadow:
                    "0 2px 8px rgba(0,0,0,0.08)",
                  textAlign:
                    "center",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    color: "#666",
                  }}
                >
                  Recyclable Waste
                </p>

                <h2
                  style={{
                    margin:
                      "10px 0 0",
                    fontSize:
                      "25px",
                  }}
                >
                  {recyclableWaste.toFixed(
                    1
                  )}{" "}
                  kg
                </h2>
              </div>
            </section>

            {/* FAMILIES TABLE */}
<section
  style={{
    backgroundColor: "white",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    marginBottom: "25px",
  }}
>
  <h2
    style={{
      margin: "0 0 8px",
      textAlign: "center",
    }}
  >
    Families
  </h2>

  <p
    style={{
      textAlign: "center",
      color: "#666",
      marginBottom: "20px",
    }}
  >
    Registered household families
  </p>

  {families.length === 0 ? (
    <p style={{ textAlign: "center" }}>
      No families found.
    </p>
  ) : (
    <div style={{ overflowX: "auto" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
        }}
      >
        <thead>
          <tr>
            <th style={{ padding: "12px", textAlign: "left" }}>
              Family ID
            </th>
            <th style={{ padding: "12px", textAlign: "left" }}>
              Family Name
            </th>
            <th style={{ padding: "12px", textAlign: "center" }}>
              Household Size
            </th>
          </tr>
        </thead>

        <tbody>
          {families.map((family) => (
            <tr key={family.id}>
              <td style={{ padding: "12px" }}>
                {family.family_id}
              </td>
              <td style={{ padding: "12px" }}>
                {family.family_name}
              </td>
              <td style={{ padding: "12px", textAlign: "center" }}>
                {family.household_size}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</section>

            {/* WASTE RECORDS TABLE */}
            <section
              style={{
                backgroundColor:
                  "white",
                padding: "25px",
                borderRadius:
                  "12px",
                boxShadow:
                  "0 2px 8px rgba(0,0,0,0.08)",
              }}
            >
              <h2
                style={{
                  marginTop: 0,
                  textAlign:
                    "center",
                }}
              >
                Waste Records
              </h2>

              <p
                style={{
                  textAlign:
                    "center",
                  color: "#666",
                  marginBottom:
                    "25px",
                }}
              >
                Latest waste collection
                records
              </p>

              {records.length ===
              0 ? (
                <p
                  style={{
                    textAlign:
                      "center",
                  }}
                >
                  No waste records
                  found.
                </p>
              ) : (
                <div
                  style={{
                    overflowX:
                      "auto",
                  }}
                >
                  <table
                    style={{
                      width: "100%",
                      borderCollapse:
                        "collapse",
                      minWidth:
                        "750px",
                    }}
                  >
                    <thead>
                      <tr>
                        <th
                          style={{
                            textAlign:
                              "left",
                            padding:
                              "12px",
                            borderBottom:
                              "1px solid #ddd",
                          }}
                        >
                          Record ID
                        </th>

                        <th
                          style={{
                            textAlign:
                              "left",
                            padding:
                              "12px",
                            borderBottom:
                              "1px solid #ddd",
                          }}
                        >
                          Family ID
                        </th>

                        <th
                          style={{
                            textAlign:
                              "left",
                            padding:
                              "12px",
                            borderBottom:
                              "1px solid #ddd",
                          }}
                        >
                          Total
                        </th>

                        <th
                          style={{
                            textAlign:
                              "left",
                            padding:
                              "12px",
                            borderBottom:
                              "1px solid #ddd",
                          }}
                        >
                          Dry
                        </th>

                        <th
                          style={{
                            textAlign:
                              "left",
                            padding:
                              "12px",
                            borderBottom:
                              "1px solid #ddd",
                          }}
                        >
                          Wet
                        </th>

                        <th
                          style={{
                            textAlign:
                              "left",
                            padding:
                              "12px",
                            borderBottom:
                              "1px solid #ddd",
                          }}
                        >
                          Recyclable
                        </th>

                        <th
                          style={{
                            textAlign:
                              "left",
                            padding:
                              "12px",
                            borderBottom:
                              "1px solid #ddd",
                          }}
                        >
                          Green Coins
                        </th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {records.map(
                        (record) => (
                          <tr
                            key={
                              record.id
                            }
                          >
                            <td
                              style={{
                                padding:
                                  "12px",
                                borderBottom:
                                  "1px solid #eee",
                              }}
                            >
                              {
                                record.record_id
                              }
                            </td>

                            <td
                              style={{
                                padding:
                                  "12px",
                                borderBottom:
                                  "1px solid #eee",
                              }}
                            >
                              {
                                record.family_id
                              }
                            </td>

                            <td
                              style={{
                                padding:
                                  "12px",
                                borderBottom:
                                  "1px solid #eee",
                              }}
                            >
                              {Number(
                                record.total_weight ||
                                  0
                              ).toFixed(
                                1
                              )}{" "}
                              kg
                            </td>

                            <td
                              style={{
                                padding:
                                  "12px",
                                borderBottom:
                                  "1px solid #eee",
                              }}
                            >
                              {Number(
                                record.dry_weight ||
                                  0
                              ).toFixed(
                                1
                              )}{" "}
                              kg
                            </td>

                            <td
                              style={{
                                padding:
                                  "12px",
                                borderBottom:
                                  "1px solid #eee",
                              }}
                            >
                              {Number(
                                record.wet_weight ||
                                  0
                              ).toFixed(
                                1
                              )}{" "}
                              kg
                            </td>

                            <td
                              style={{
                                padding:
                                  "12px",
                                borderBottom:
                                  "1px solid #eee",
                              }}
                            >
                              {Number(
                                record.recyclable_weight ||
                                  0
                              ).toFixed(
                                1
                              )}{" "}
                              kg
                            </td>

                            <td
                              style={{
                                padding:
                                  "12px",
                                borderBottom:
                                  "1px solid #eee",
                              }}
                            >
                              {
  record.green_coins
}
</td>

<td>
  <button
    onClick={() =>
      handleDeleteWasteRecord(record.record_id)
    }
    style={{
      padding: "6px 12px",
      backgroundColor: "#dc3545",
      color: "white",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
    }}
  >
    Delete
  </button>
</td>

</tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default App;