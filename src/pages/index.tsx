import type { NextPage } from 'next'
import Head from 'next/head'

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>AIChatFlows Onboarding</title>
        <meta name="description" content="AIChatFlows Onboarding Form" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-green-400 neon-glow">
            AIChatFlows Onboarding
          </h1>
          <p className="text-green-300 mt-4 text-lg">
            Onboarding Form
          </p>
        </div>
      </main>
    </>
  )
}

export default Home