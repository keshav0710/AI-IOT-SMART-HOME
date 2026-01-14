import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Home, User, Lock, Loader2, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

// Firebase imports
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  User as FirebaseUser,
  AuthError
} from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// Firebase configuration - Using environment variables for security
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [user, setUser] = useState<FirebaseUser | null>(null);

  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Redirect to dashboard if already logged in
        navigate('/dashboard');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Handle form submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log("Login successful:", user.uid);

      // Redirect to dashboard
      navigate('/dashboard');

    } catch (error) {
      const authError = error as AuthError;
      console.error("Login error:", authError);

      // Handle different error types
      switch (authError.code) {
        case 'auth/user-not-found':
          setError("No account found with this email address");
          break;
        case 'auth/wrong-password':
          setError("Incorrect password");
          break;
        case 'auth/invalid-email':
          setError("Invalid email address");
          break;
        case 'auth/user-disabled':
          setError("This account has been disabled");
          break;
        case 'auth/too-many-requests':
          setError("Too many failed login attempts. Please try again later");
          break;
        default:
          setError("Login failed. Please check your credentials");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError(""); // Clear error when user starts typing
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (error) setError(""); // Clear error when user starts typing
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated Gradient Mesh Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
      </div>

      {/* Decorative Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

      <Card className="relative z-10 w-full max-w-md border border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl shadow-black/10">
        <CardHeader className="text-center space-y-6 pb-2">
          {/* Animated Logo */}
          <div className="mx-auto relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-purple-600 rounded-2xl blur-xl opacity-50 animate-pulse" />
            <div className="relative w-20 h-20 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Home className="w-10 h-10 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-muted-foreground text-base">
              Sign in to your Smart Home Dashboard
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-4">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="border-red-500/30 bg-red-500/10 backdrop-blur-sm">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-foreground/80">Email Address</Label>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-xl opacity-0 group-focus-within:opacity-100 blur-sm transition-opacity" />
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={handleEmailChange}
                    className="pl-12 h-13 border-border/50 bg-background/50 backdrop-blur-sm rounded-xl focus-visible:ring-primary/30 transition-all"
                    disabled={loading}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-foreground/80">Password</Label>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-xl opacity-0 group-focus-within:opacity-100 blur-sm transition-opacity" />
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={handlePasswordChange}
                    className="pl-12 h-13 border-border/50 bg-background/50 backdrop-blur-sm rounded-xl focus-visible:ring-primary/30 transition-all"
                    disabled={loading}
                    required
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-13 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 rounded-xl font-semibold text-base shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="text-center pt-4 border-t border-border/30">
            <p className="text-xs text-muted-foreground">
              Powered by <span className="font-semibold text-primary">Smart Home AI</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;