export default function PrivacyPage() {
  return (
    <main className="flex flex-col items-center px-4 py-12 flex-1">
      <div className="w-full max-w-xl">
        <p className="font-mono text-xs tracking-[0.4em] uppercase text-gray-400 dark:text-gray-500 mb-2">
          Rent Golf
        </p>
        <h1 className="font-mono text-4xl font-bold tracking-tight uppercase mb-10">
          Privacy
        </h1>

        <div className="space-y-6 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          <p>
            Rent Golf is a free game with no user accounts, no tracking, and no advertising.
          </p>

          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white mb-1">What we collect</h2>
            <p>
              If you submit your score to the leaderboard, your chosen display name and score are stored. No email address, IP address, or personal information is collected or required.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white mb-1">Apartment data</h2>
            <p>
              Apartment listings displayed in the game are sourced from publicly available rental data, collected painstakingly by hand. They are used solely for entertainment purposes.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white mb-1">Third parties</h2>
            <p>
              We do not sell, share, or transfer any data to third parties.
            </p>
          </div>

          <p className="text-xs text-gray-400 dark:text-gray-500 pt-4 border-t border-gray-200 dark:border-neutral-700">
            © 2025 Rent Golf
          </p>
        </div>
      </div>
    </main>
  );
}
