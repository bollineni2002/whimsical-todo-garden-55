import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { verifyOTP } from "@/lib/api";
import { TailSpin } from "react-loader-spinner";
import { Mail } from "lucide-react";

interface AuthHeaderProps {
  businessName: string;
}

const AuthHeader = ({ businessName }: AuthHeaderProps) => {
  return (
    <div className="flex justify-center mb-6">
      <h1 className="text-2xl font-bold">{businessName}</h1>
    </div>
  );
};

const VerifyOTP = () => {
  const [otp, setOTP] = React.useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get("email");
  const { setUser } = useAuth();

  const { mutate: verify, isLoading } = useMutation({
    mutationFn: async () => {
      if (!email) {
        throw new Error("Email is required");
      }
      return verifyOTP(email, otp);
    },
    onSuccess: (data) => {
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);
      navigate("/");
      toast({
        title: "Success",
        description: "OTP verified successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to verify OTP",
        variant: "destructive",
      });
    },
  });
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <div className="mx-auto w-full max-w-md">
        <div className="flex flex-col space-y-6 p-6 bg-card rounded-lg shadow-md">
          <AuthHeader businessName="TransactLy" />
          <CardHeader>
            <CardTitle>Verify OTP</CardTitle>
            <CardDescription>
              Enter the OTP sent to your email to verify your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">OTP</Label>
                <Input
                  id="otp"
                  placeholder="Enter OTP"
                  type="text"
                  value={otp}
                  onChange={(e) => setOTP(e.target.value)}
                />
              </div>
              <Button disabled={isLoading} className="w-full" onClick={() => verify()}>
                {isLoading ? (
                  <TailSpin
                    height="20"
                    width="20"
                    color="white"
                    ariaLabel="loading-indicator"
                  />
                ) : (
                  "Verify OTP"
                )}
              </Button>
            </form>
          </CardContent>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
