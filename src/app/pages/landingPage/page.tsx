import React from 'react'
import Intro from '@/components/landing/intro'
import Contact from '@/components/landing/conctactUs'
import Professionals from '@/components/landing/professionals'
import AboutUs from '@/components/landing/aboutUS'

const LandingPage = () => {
  return (
    <main>
      <div><Intro/></div>
      <div><AboutUs/></div>
      <div><Professionals/></div>
      <div><Contact/></div>
    </main>
    
  )
}

export default LandingPage