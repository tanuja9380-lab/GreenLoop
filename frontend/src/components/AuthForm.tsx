import { useState, type FormEvent } from "react";

import {
  loginUser,
  registerUser,
} from "../api/api";

type AuthFormProps = {
  onLoginSuccess: (user: any) => void;
};

function AuthForm({
  onLoginSuccess,
}: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent
  ) {
    event.preventDefault();

    setError("");

    if (!email.trim() || !password.trim()) {
      setError(
        "Please enter your email and password."
      );
      return;
    }

    if (!isLogin && !name.trim()) {
      setError("Please enter your name.");
      return;
    }

    try {
      setLoading(true);

      let user;

      if (isLogin) {
        user = await loginUser({
          email: email.trim(),
          password,
        });
      } else {
        user = await registerUser({
          name: name.trim(),
          email: email.trim(),
          password,
        });
      }

      onLoginSuccess(user);

      setName("");
      setEmail("");
      setPassword("");
    } catch (err) {
      console.error(err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Something went wrong."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f4f7f5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          backgroundColor: "white",
          padding: "35px",
          borderRadius: "15px",
          boxShadow:
            "0 4px 15px rgba(0,0,0,0.1)",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            color: "#1b5e20",
            marginBottom: "8px",
          }}
        >
          GreenLoop
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#666",
            marginBottom: "30px",
          }}
        >
          Smart Waste Management &
          Green Rewards
        </p>

        <h2
          style={{
            textAlign: "center",
            marginBottom: "25px",
          }}
        >
          {isLogin
            ? "Welcome Back"
            : "Create Account"}
        </h2>

        {error && (
          <div
            style={{
              backgroundColor: "#ffebee",
              color: "#c62828",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "20px",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div
              style={{
                marginBottom: "18px",
              }}
            >
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontWeight: "bold",
                }}
              >
                Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="Enter your name"
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  boxSizing: "border-box",
                }}
              />
            </div>
          )}

          <div
            style={{
              marginBottom: "18px",
            }}
          >
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontWeight: "bold",
              }}
            >
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="Enter your email"
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div
            style={{
              marginBottom: "22px",
            }}
          >
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontWeight: "bold",
              }}
            >
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Enter your password"
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "13px",
              backgroundColor: "#2e7d32",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: loading
                ? "not-allowed"
                : "pointer",
              fontWeight: "bold",
              fontSize: "16px",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading
              ? "Please wait..."
              : isLogin
              ? "Login"
              : "Create Account"}
          </button>
        </form>

        <div
          style={{
            textAlign: "center",
            marginTop: "22px",
          }}
        >
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
            style={{
              background: "none",
              border: "none",
              color: "#1565c0",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            {isLogin
              ? "Don't have an account? Register"
              : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuthForm;