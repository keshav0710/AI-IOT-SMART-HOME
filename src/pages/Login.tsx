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
    <div className="min-h-screen bg-gradient-login flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-hover border-0 bg-card/95 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-smart rounded-full flex items-center justify-center">
            <Home className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-foreground">Smart Home Login</CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              Access your home automation dashboard
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email / Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={handleEmailChange}
                  className="pl-10 h-12 border-input bg-background/50 backdrop-blur-sm"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={handlePasswordChange}
                  className="pl-10 h-12 border-input bg-background/50 backdrop-blur-sm"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-smart hover:opacity-90 transition-all duration-300 font-semibold"
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Login'
                )}
              </Button>

            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;