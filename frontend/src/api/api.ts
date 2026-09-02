const API_BASE_URL = "http://localhost:8000";

export async function getHealth() {
  const response = await fetch(`${API_BASE_URL}/health`);

  if (!response.ok) {
    throw new Error("Backend request failed");
  }

  return response.json();
}

export async function getWasteRecords() {
  const response = await fetch(`${API_BASE_URL}/waste-records`,
    {
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch waste records");
  }

  return response.json();
}

export async function getFamilies() {
  const response = await fetch(`${API_BASE_URL}/families`,
    {
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch families");
  }

  return response.json();
}
export async function createFamily(data: {
  family_id: string;
  family_name: string;
  household_size: number;
}) {
  const response = await fetch(`${API_BASE_URL}/families`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    credentials: "include",
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(
      responseData?.detail || "Failed to create family"
    );
  }

  return responseData;
}

export async function createWasteRecord(data: {
  record_id: string;
  family_id: string;
  total_weight: number;
  dry_weight: number;
  wet_weight: number;
  recyclable_weight: number;
}) {
  const response = await fetch(`${API_BASE_URL}/waste-records`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    credentials: "include",
  });

  if (!response.ok) {
    let errorMessage = "Failed to create waste record.";

    try {
      const errorData = await response.json();

      if (errorData?.detail) {
        errorMessage =
          typeof errorData.detail === "string"
            ? errorData.detail
            : JSON.stringify(errorData.detail);
      }
    } catch {
      // Keep the default error message
    }

    throw new Error(errorMessage);
  }

  return response.json();
}
export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
}) {
  const response = await fetch(
    `${API_BASE_URL}/auth/register`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(
      responseData?.detail ||
        "Registration failed"
    );
  }

  return responseData;
}

export async function loginUser(data: {
  email: string;
  password: string;
}) {
  const response = await fetch(
    `${API_BASE_URL}/auth/login`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(
      responseData?.detail ||
        "Login failed"
    );
  }

  return responseData;
}

export async function logoutUser() {
  const response = await fetch(
    `${API_BASE_URL}/auth/logout`,
    {
      method: "POST",
      credentials: "include",
    }
  );

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(
      responseData?.detail ||
        "Logout failed"
    );
  }

  return responseData;
}

export async function getCurrentUser() {
  const response = await fetch(
    `${API_BASE_URL}/auth/me`,
    {
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error(
      "Not authenticated"
    );
  }

  return response.json();
}
export async function deleteWasteRecord(recordId: string) {
  const response = await fetch(
    `${API_BASE_URL}/waste-records/${recordId}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(
      responseData?.detail ||
        "Failed to delete waste record"
    );
  }

  return responseData;
}