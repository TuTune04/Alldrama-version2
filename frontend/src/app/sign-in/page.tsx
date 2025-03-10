"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { FaGoogle, FaEye, FaEyeSlash } from "react-icons/fa";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Llama a signIn de NextAuth con el proveedor "credentials"
    const result = await signIn("credentials", {
      redirect: false, // Si deseas manejar la navegación tras el inicio de sesión mediante código
      email,
      password,
      callbackUrl: "/profile",
    });
  
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("¡Inicio de sesión exitoso!");
      router.push(result?.url || "/profile");
    }
  };
  
  const handleOAuthSignIn = (provider: "google") => {
    toast.promise(signIn(provider, { callbackUrl: "/profile" }), {
      loading: `Iniciando sesión con ${provider}...`,
      success: `¡Sesión iniciada con ${provider} exitosamente!`,
      error: `Error al iniciar sesión con ${provider}`,
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="w-full max-w-md">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-white">
              Inicia sesión en MovieStream
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">
                  Contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 pr-10"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white focus:outline-none"
                  >
                    {showPassword ? (
                      <FaEyeSlash className="h-5 w-5" />
                    ) : (
                      <FaEye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label htmlFor="remember" className="text-sm text-gray-300">
                  Recuérdame
                </Label>
              </div>
              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white">
                Iniciar sesión
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-600"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-gray-800 px-2 text-gray-400">O continúa con</span>
              </div>
            </div>

            <div className="flex space-x-4">
              <Button
                variant="outline"
                className="w-full bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
                onClick={() => handleOAuthSignIn("google")}
              >
                <FaGoogle className="mr-2 h-4 w-4" /> Google
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Link href="/forgot-password" className="text-sm text-blue-400 hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
            <p className="text-sm text-gray-400">
              ¿No tienes una cuenta?{" "}
              <Link href="/sign-up" className="text-blue-400 hover:underline">
                Regístrate
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
      <Image
        src="/placeholder.svg?height=1080&width=1920"
        alt="Fondo"
        fill
        className="absolute inset-0 -z-10 opacity-20 object-cover"
      />
    </div>
  );
}
