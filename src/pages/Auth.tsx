import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Mail, Phone, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

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

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn(email, password);
      toast({
        title: "Login Successful",
        description: "You have successfully logged in.",
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="mx-auto w-full max-w-md p-6 space-y-6">
      <AuthHeader businessName="TransactLy" />
      <div className="space-y-4">
        <form onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="shadow-sm"
            />
          </div>
          <div className="space-y-2 relative">
            <Label htmlFor="password">Password</Label>
            <Input
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="shadow-sm"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-7 rounded-full shadow-none hover:bg-secondary"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span className="sr-only">Toggle password visibility</span>
            </Button>
          </div>
          <Button type="submit" className="w-full">
            Sign In
          </Button>
        </form>
        <div className="text-sm">
          <Link to="/reset-password" className="text-primary hover:underline">
            Forgot password?
          </Link>
        </div>
      </div>
      <div className="text-center text-sm">
        Don't have an account?{" "}
        <Link to="/auth" className="text-primary hover:underline">
          Sign up
        </Link>
      </div>
    </div>
  );
};

const RegistrationForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signUp(email, password, name, phone);
      toast({
        title: "Registration Successful",
        description: "Please verify your email to continue.",
      });
      navigate("/verify-otp");
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="mx-auto w-full max-w-md p-6 space-y-6">
      <AuthHeader businessName="TransactLy" />
      <div className="space-y-4">
        <form onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              type="text"
              id="name"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="shadow-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="shadow-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              type="tel"
              id="phone"
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="shadow-sm"
            />
          </div>
          <div className="space-y-2 relative">
            <Label htmlFor="password">Password</Label>
            <Input
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="shadow-sm"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-7 rounded-full shadow-none hover:bg-secondary"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span className="sr-only">Toggle password visibility</span>
            </Button>
          </div>
          <Button type="submit" className="w-full">
            Sign Up
          </Button>
        </form>
      </div>
      <div className="text-center text-sm">
        Already have an account?{" "}
        <Link to="/auth" className="text-primary hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
};

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-4">
          <Button
            variant={isLogin ? "default" : "outline"}
            onClick={() => setIsLogin(true)}
            className={isLogin ? "mr-2" : "mr-2 hover:bg-secondary"}
          >
            Sign In
          </Button>
          <Button
            variant={!isLogin ? "default" : "outline"}
            onClick={() => setIsLogin(false)}
            className={!isLogin ? "ml-2" : "ml-2 hover:bg-secondary"}
          >
            Sign Up
          </Button>
        </div>
        {isLogin ? <LoginForm /> : <RegistrationForm />}
      </div>
    </div>
  );
};

export default Auth;
