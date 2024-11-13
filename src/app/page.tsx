
// export default function Home() {
//   return (
//     <div>
//       hello world
//     </div>
//   );
// }


import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Globe, Map, Trophy, Users } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link className="flex items-center justify-center" href="#">
          <Globe className="h-6 w-6 mr-2" />
          <span className="font-bold text-lg">GlobeQuest</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#">
            How to Play
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#">
            Leaderboard
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#">
            About
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Explore the World with GlobeQuest
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Test your geography skills in this exciting virtual globe-trotting adventure. Guess locations, earn points, and become a world explorer!
                </p>
              </div>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90" size="lg">
                Start Playing Now
              </Button>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12">
              How GlobeQuest Works
            </h2>
            <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
              <Card>
                <CardHeader>
                  <Map className="h-8 w-8 mb-2" />
                  <CardTitle>Explore Street Views</CardTitle>
                </CardHeader>
                <CardContent>
                  You&apos;ll be dropped into random locations around the world using street view technology. Look for clues to figure out where you are!
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Globe className="h-8 w-8 mb-2" />
                  <CardTitle>Make Your Guess</CardTitle>
                </CardHeader>
                <CardContent>
                  Use your knowledge and observation skills to pinpoint your location on the world map. The closer you are, the more points you&apos;ll earn!
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Trophy className="h-8 w-8 mb-2" />
                  <CardTitle>Compete and Win</CardTitle>
                </CardHeader>
                <CardContent>
                  Challenge friends, climb the global leaderboard, and unlock achievements as you improve your geography skills and explore the world.
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Ready to Test Your Geography Skills?
                </h2>
                <p className="mx-auto max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                  Join thousands of players around the world in the ultimate geography guessing game.
                </p>
              </div>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90" size="lg">
                Play GlobeQuest Now
              </Button>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">© 2024 GlobeQuest. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
} 