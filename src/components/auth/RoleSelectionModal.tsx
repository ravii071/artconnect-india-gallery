
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Palette, User } from "lucide-react";

interface RoleSelectionModalProps {
  open: boolean;
  onRoleSelect: (userType: "artist" | "client") => Promise<void>;
  loading: boolean;
}

export const RoleSelectionModal: React.FC<RoleSelectionModalProps> = ({
  open,
  onRoleSelect,
  loading
}) => {
  const [selectedRole, setSelectedRole] = useState<"artist" | "client" | null>(null);

  const handleContinue = async () => {
    if (selectedRole) {
      await onRoleSelect(selectedRole);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            Welcome to ArtSpace!
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-center text-gray-600">
            Please choose how you'd like to use ArtSpace:
          </p>
          
          <div className="grid grid-cols-1 gap-4">
            <Card 
              className={`cursor-pointer transition-all ${
                selectedRole === "artist" 
                  ? "ring-2 ring-blue-500 bg-blue-50" 
                  : "hover:bg-gray-50"
              }`}
              onClick={() => setSelectedRole("artist")}
            >
              <CardHeader className="text-center pb-2">
                <Palette className="w-12 h-12 mx-auto text-blue-600" />
                <CardTitle className="text-lg">I'm an Artist</CardTitle>
              </CardHeader>
              <CardContent className="text-center pt-0">
                <p className="text-sm text-gray-600">
                  Showcase your art and connect with clients
                </p>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-all ${
                selectedRole === "client" 
                  ? "ring-2 ring-blue-500 bg-blue-50" 
                  : "hover:bg-gray-50"
              }`}
              onClick={() => setSelectedRole("client")}
            >
              <CardHeader className="text-center pb-2">
                <User className="w-12 h-12 mx-auto text-green-600" />
                <CardTitle className="text-lg">I'm a Client</CardTitle>
              </CardHeader>
              <CardContent className="text-center pt-0">
                <p className="text-sm text-gray-600">
                  Discover and book talented artists
                </p>
              </CardContent>
            </Card>
          </div>

          <Button 
            onClick={handleContinue}
            disabled={!selectedRole || loading}
            className="w-full"
          >
            {loading ? "Setting up..." : "Continue"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
