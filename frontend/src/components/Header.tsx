function Header() {
  return (
    <header
      style={{
        backgroundColor: "white",
        borderBottom: "1px solid #e5e5e5",
        padding: "20px 30px",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "20px",
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
            Smart Waste Management & Green Rewards Platform
          </p>
        </div>

        <div
          style={{
            padding: "10px 16px",
            borderRadius: "20px",
            backgroundColor: "#e8f5e9",
            color: "#2e7d32",
            fontWeight: "bold",
            fontSize: "14px",
            whiteSpace: "nowrap",
          }}
        >
          ● Backend: Connected
        </div>
      </div>
    </header>
  );
}

export default Header;