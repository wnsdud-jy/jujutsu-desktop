import type { Config } from "tailwindcss";
import sharedConfig from "@jujutsu/ui/tailwind.config";

const config: Config = {
    ...sharedConfig,
    content: [
        "./src/**/*.{ts,tsx}",
        "../../packages/ui/src/**/*.{ts,tsx}", // Scan shared UI
    ],
    presets: [sharedConfig],
};

export default config;
