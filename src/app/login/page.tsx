"use client";

import { useState } from "react";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";

export default function LoginPage() {
  const [error, setError] = useState("");

  return (
    <div className="login-stage">
      <div className="login-card">
        <div className="admin-mark">
          lt<span>ops</span>
        </div>
        <h1>Admin access</h1>
        <p>
          Sign in with Google. Only accounts with{" "}
          <code>profiles.is_superadmin = true</code> can enter the control room.
        </p>
        <GoogleSignInButton onError={setError} />
        {error ? <p className="form-error">{error}</p> : null}
      </div>
    </div>
  );
}
