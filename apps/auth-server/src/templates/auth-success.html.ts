export function generateAuthSuccessHTML(token: string, username?: string, avatarUrl?: string): string {
  const params = new URLSearchParams({ token });
  if (username) params.set('username', username);
  if (avatarUrl) params.set('avatar', avatarUrl);

  const deepLink = `jujutsu://auth?${params.toString()}`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Authentication Successful - Jujutsu Desktop</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            border: "hsl(240 5.9% 90%)",
            background: "hsl(0 0% 100%)",
            foreground: "hsl(240 10% 3.9%)",
            primary: "hsl(240 5.9% 10%)",
            'primary-foreground': "hsl(0 0% 98%)",
            muted: "hsl(240 4.8% 95.9%)",
            'muted-foreground': "hsl(240 3.8% 46.1%)",
          }
        }
      }
    }
  </script>
  <style>
    @media (prefers-color-scheme: dark) {
      :root {
        color-scheme: dark;
      }
    }
  </style>
</head>
<body class="bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 min-h-screen flex items-center justify-center p-4">
  <div class="w-full max-w-md">
    <div class="bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg p-8 space-y-6">
      <!-- Success Icon -->
      <div class="flex justify-center">
        <div class="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
          <svg class="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
      </div>

      <!-- Title -->
      <div class="text-center space-y-2">
        <h1 class="text-2xl font-bold tracking-tight">Authentication Successful!</h1>
        <p class="text-sm text-zinc-600 dark:text-zinc-400">
          You will be redirected to the app in <span id="countdown" class="font-semibold">3</span> seconds...
        </p>
      </div>

      <!-- Manual Button -->
      <button
        onclick="redirectToApp()"
        class="w-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
        </svg>
        Return to App Now
 </button>

    </div>

    <!-- Footer -->
    <div class="mt-6 text-center text-xs text-zinc-500 dark:text-zinc-500">
      <p>Jujutsu Desktop © 2026</p>
    </div>
  </div>

  <script>
    const deepLink = '${deepLink}';
    let countdown = 3;

    function redirectToApp() {
      window.location.href = deepLink;
    }

    function updateCountdown() {
      const countdownElement = document.getElementById('countdown');
      if (countdown > 0) {
        countdownElement.textContent = countdown;
        countdown--;
        setTimeout(updateCountdown, 1000);
      } else {
        redirectToApp();
      }
    }

    // Start countdown on page load
    updateCountdown();
  </script>
</body>
</html>
  `.trim();
}
