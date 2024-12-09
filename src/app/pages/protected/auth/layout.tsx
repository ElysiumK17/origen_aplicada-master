// protected/auth/layout.tsx
"use client"

import React from "react"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className=" h-screen flex w-screen items-center justify-center bg-gray-100">
        {children}
    </div>
  )
}