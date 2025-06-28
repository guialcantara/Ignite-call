import { useState } from 'react'
import { Btn } from './styles'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'

export function LoginButton() {
  const session = useSession()
  const router = useRouter()

  const handleLogin = async () => {
    await signIn('google')
  }

  const handleUpdateSchedule = async () => {
    await router.push('/update/time-intervals')
  }

  const isSignedIn = session.status === 'authenticated'

  return !isSignedIn ? (
    <Btn onClick={handleLogin}>Login</Btn>
  ) : (
    <Btn onClick={handleUpdateSchedule}>Alterar dados</Btn>
  )
}
