# WebApp — Bundled Static Export

This folder should contain the static Next.js export produced by running:

```bash
bash scripts/build-ios.sh https://your-backend-url.com
```

That command writes the output to `./out/` in the repo root.
Copy the **contents** of `./out/` into this `WebApp/` folder (so that
`WebApp/index.html`, `WebApp/_next/`, etc. are present).

The folder is intentionally kept empty in version control (the build
artefacts are in `.gitignore`). Generate the assets locally before
building the iOS app.
