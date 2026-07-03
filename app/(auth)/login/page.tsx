"use client"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getSession } from "next-auth/react";
export default function LoginPage() {
  const [email,setEmail]=useState("")
  const [password,setPassword]=useState("")
  const [emailError,setEmailError]=useState("")
  const [passwordError,setPasswordError]=useState("")
  const router =useRouter()
  const handleLogin = async () => {
  setEmailError("")
  setPasswordError("")

  if(!email){
    setEmailError("Email is required")
    return
  }
  if (!password){
    setPasswordError("Password is required")
    return
  }
  const result = await signIn("credentials", {
  email,
  password,
  redirect: false,
});

console.log(result);

  if (result?.error){
    setPasswordError("Invalid Email or Password");
    return
  }
  const session=await getSession();
 if(!session || !session.user) return;

  switch(session.user.role){
    case "ADMIN":
      router.push("/admin/dashboard/")
      break;
    case "USER":
      router.push("/user/dashboard/")
      break;
    case "PRODUCT_OWNER":
      router.push("/product-owner/dashboard")
  }
  
  
  setEmail("")
  setPassword("")
};

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome Back</CardTitle>
          <CardDescription>
            Sign in to continue
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
  <div className="space-y-2">
    <Label htmlFor="email">Email</Label>
    <Input
      id="email"
      type="email"
      placeholder="Enter your email"
      value={email}
      onChange={(e)=>setEmail(e.target.value)}
    />
    {emailError && (<p className="text-red-500 text-sm">{emailError}</p>)}
  </div>

  <div className="space-y-2">
    <Label htmlFor="password">Password</Label>
    <Input
      id="password"
      type="password"
      placeholder="Enter your password"
      value={password}
      onChange={(e)=>setPassword(e.target.value)}
    />
    {passwordError && (<p className="text-red-500 text-sm">{passwordError}</p>)}
  </div>

  <Button className="w-full" onClick={handleLogin}>
    Login
  </Button>
</CardContent>
      </Card>
    </main>
  );
}