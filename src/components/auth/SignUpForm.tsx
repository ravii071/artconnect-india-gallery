
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SignUpFormProps {
  onSubmit: (data: {
    email: string;
    password: string;
    type: 'sign-up';
    userType: 'artist' | 'client';
    fullName: string;
    artType?: string;
    district?: string;
  }) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({ onSubmit, loading, error }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState<"artist" | "client" | "">("");
  const [fullName, setFullName] = useState("");
  const [artType, setArtType] = useState("");
  const [district, setDistrict] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userType) return;
    
    await onSubmit({
      email,
      password,
      type: 'sign-up',
      userType: userType as 'artist' | 'client',
      fullName,
      artType,
      district
    });
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

      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-700">
          I am a:
        </Label>
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant={userType === "client" ? "default" : "outline"}
            onClick={() => setUserType("client")}
            className={`h-11 ${userType === "client" ? 'bg-blue-600 hover:bg-blue-700' : 'border-gray-200 hover:bg-gray-50'}`}
            disabled={loading}
          >
            Customer
          </Button>
          <Button
            type="button"
            variant={userType === "artist" ? "default" : "outline"}
            onClick={() => setUserType("artist")}
            className={`h-11 ${userType === "artist" ? 'bg-blue-600 hover:bg-blue-700' : 'border-gray-200 hover:bg-gray-50'}`}
            disabled={loading}
          >
            Artist
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
          Full Name
        </Label>
        <Input
          id="fullName"
          placeholder="Enter your full name"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          disabled={loading}
          className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      {userType === "artist" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="artType" className="text-sm font-medium text-gray-700">
              Art Specialty
            </Label>
            <Input
              id="artType"
              placeholder="e.g. Painter, Sculptor, Digital Artist"
              value={artType}
              onChange={e => setArtType(e.target.value)}
              disabled={loading}
              className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="district" className="text-sm font-medium text-gray-700">
              Location
            </Label>
            <Input
              id="district"
              placeholder="Your city or district"
              value={district}
              onChange={e => setDistrict(e.target.value)}
              disabled={loading}
              className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </>
      )}

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
        {loading ? "Creating account..." : "Create Account"}
      </Button>
    </form>
  );
};
