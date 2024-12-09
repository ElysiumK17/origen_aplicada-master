'use client'
import React from 'react'
import { registerAdminAction } from '@/actions/auth-action'
import { RegisterAdminSchema } from '@/libs/zod'

const handleSubmit = () => {
  const values: RegisterAdminSchema = {
    name: 'admin',
    email: 'admin@gmail.com',
    password: 'admin',
  }
  const res = registerAdminAction(values)

  console.log(res)
}

const registerAdmin = () => {
  return (
    <main>
      <div>Register Admin</div>
      <button onClick={handleSubmit}>Log Admin</button>
    </main>
  )
}

export default registerAdmin
