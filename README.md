# Shoply Marketplace

A static storefront prototype with browser-local demo accounts, cart, order history, admin panel, and simulated checkout.

## Run locally

Open `index.html` in a browser. Product photography loads from Unsplash, so images require an internet connection.

## Deploy with GitHub Pages

The workflow in `.github/workflows/deploy.yml` publishes the static site whenever changes reach `main`.

1. In the GitHub repository, open **Settings → Pages**.
2. Set **Build and deployment → Source** to **GitHub Actions**.
3. Push the `main` branch. The **Deploy Shoply to GitHub Pages** workflow publishes the site and shows its URL in the deployment details.

Demo data is stored in each visitor's browser. There is no backend and no real payment processing.
