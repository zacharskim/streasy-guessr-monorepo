export default function PrivacyPage() {
  return (
    <main className="flex flex-col items-center px-4 py-12 flex-1">
      <div className="w-full max-w-xl">
        <p className="text-xs tracking-[0.4em] uppercase text-muted-foreground mb-2">Rent Golf</p>
        <h1 className="font-display text-4xl font-bold tracking-tight mb-10">Privacy</h1>

        <div className="space-y-6 text-sm text-foreground/70 leading-relaxed">
          <p>
            Rent Golf is a free game with no user accounts, no tracking, and no advertising.
          </p>

          <div>
            <h2 className="font-semibold text-foreground mb-1">What we collect</h2>
            <p>
              If you submit your score to the leaderboard, your chosen display name and score are stored. No email address, IP address, or personal information is collected or required.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-foreground mb-1">Apartment data</h2>
            <p>
              Apartment listings displayed in the game are sourced from publicly available rental data, collected painstakingly by hand. They are used solely for entertainment purposes.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-foreground mb-1">Third parties</h2>
            <p>
              We do not sell, share, or transfer any data to third parties.
            </p>
          </div>

          <p className="text-xs text-muted-foreground pt-4 border-t border-border">
            © 2025 Rent Golf
          </p>
        </div>
      </div>
    </main>
  );
}
