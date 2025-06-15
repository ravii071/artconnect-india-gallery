
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SignInFormProps {
  onSubmit: (data: { email: string; password: string; type: 'sign-in' }) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const SignInForm: React.FC<SignInFormProps> = ({ onSubmit, loading, error }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ email, password, type: 'sign-in' });
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
          Email address
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          disabled={loading}
          onChange={e => setEmail(e.target.value)}
          className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium text-gray-700">
          Password
        </Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          value={password}
          disabled={loading}
          onChange={e => setPassword(e.target.value)}
          className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <Button 
        type="submit" 
        className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium"
        disabled={loading}
      >
        {loading ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  );
};
