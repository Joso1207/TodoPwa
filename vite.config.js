import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
    base:"/todopwa"
    server: {
        host: true
    },
    preview: {
        host: true
    },
    plugins: [
        VitePWA({
            registerType: "autoUpdate",
            injectRegister: "auto",
            devOptions: { enabled: true },
            manifest: {
                name: "Things App",
                short_name: "Things",
                start_url: "/",
                display: "standalone",
                theme_color: "#1a73e8",
                background_color: "#ffffff",
                icons: [
                    { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
                    { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" }
                ]
            }
        })
    ]
});
