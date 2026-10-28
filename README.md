# Milaor Weather Archive

A responsive historical weather dashboard for Milaor, Camarines Sur, Philippines. It uses the Open-Meteo Historical Weather API and displays monthly summary cards, charts, daily records, and a CSV export.

## Features

- Choose a month and year from 1940 onward.
- View mean, minimum, and maximum temperature.
- View daily precipitation, relative humidity, and maximum wind speed.
- Interactive Chart.js charts.
- Export the selected month to CSV.
- Responsive layout for desktop and mobile.
- Automatic GitHub Pages deployment through GitHub Actions.

## Weather data and location

The app uses Open-Meteo's Historical Weather API:

`https://archive-api.open-meteo.com/v1/archive`

The location is set to approximate Milaor town-center coordinates in `app.js`:

- Latitude: `13.5965`
- Longitude: `123.1774`
- Time zone: `Asia/Manila`

If you need to adjust the location, edit `LATITUDE` and `LONGITUDE` at the top of `app.js`.

Historical weather API data is based on reanalysis. It is a model-based estimate and may differ from readings from a local weather station. The latest dates may have a publication delay. This website is for reference and education, not official warnings.

Open-Meteo API documentation: https://open-meteo.com/en/docs/historical-weather-api

## Run locally

No build tools or package installation are needed.

1. Download or clone this repository.
2. Open `index.html` in a modern browser.
3. Connect to the internet so the website can load Chart.js and weather data.

If your browser restricts local file requests, run a small local server from the project folder:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Publish using GitHub Pages

1. Create a new GitHub repository, for example `milaor-weather-dashboard`.
2. Upload the project files and folders to the repository's `main` branch. Keep the `.github/workflows/deploy.yml` file in its exact path.
3. Open the repository's **Settings**.
4. Select **Pages** under **Code and automation**.
5. Under **Build and deployment**, choose **GitHub Actions** as the source.
6. Open the **Actions** tab and wait for `Deploy Milaor Weather Dashboard` to complete successfully.
7. Open **Settings → Pages** to find the published website URL. It normally follows this format:

   `https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/`

Each push to `main` triggers a new deployment. You can also run the workflow manually from the Actions tab.

## Project structure

```text
milaor-weather-dashboard/
├── index.html
├── styles.css
├── app.js
├── README.md
└── .github/
    └── workflows/
        └── deploy.yml
```

## Troubleshooting

- **No data appears:** check your internet connection, reload the page, or try another past month.
- **The newest month is incomplete:** the app only requests dates up to today's date. Historical records may still be delayed.
- **Charts do not appear:** check whether your browser or network blocks the Chart.js CDN.
- **GitHub Pages deployment fails:** verify that Pages is set to **GitHub Actions** and check the failed workflow log in the Actions tab.
- **Coordinates need adjustment:** update `LATITUDE` and `LONGITUDE` in `app.js`.

## Attribution

Weather data provided by [Open-Meteo](https://open-meteo.com/). Review the provider's terms and attribution requirements for your intended use.
