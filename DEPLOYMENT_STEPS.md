# Deployment and GitHub Update Steps

This portfolio is a static website. It does not require npm, a framework or a build command.

## Before uploading

1. Extract the final ZIP file.
2. Open the extracted folder.
3. Confirm that `index.html`, `styles.css` and `script.js` are directly inside the folder.
4. Do not upload only the ZIP file to the repository.
5. Do not place the website inside another unnecessary folder unless your hosting configuration points to that folder.

The correct repository root should begin like this:

```text
index.html
styles.css
script.js
favicon.svg
assets/
Sarmad_Saeed_CV.pdf
...
```

---

## Update an existing GitHub repository using the GitHub website

1. Sign in to GitHub.
2. Open the repository containing the previous portfolio.
3. Select **Add file** and then **Upload files**.
4. Drag all files and folders from the extracted final portfolio into the upload area.
5. GitHub will recognise files with the same names as replacements.
6. Use this commit message:

```text
Upgrade portfolio design, motion, responsiveness and case studies
```

7. Select **Commit changes**.
8. Wait several minutes for GitHub Pages or a connected deployment service to publish the update.

### Removing files that no longer exist

Uploading replaces matching files but does not automatically remove obsolete files with different names. Delete old duplicate portfolio files from the repository when they are no longer used. Keep the final CV names included in this package.

---

## Update using GitHub Desktop

1. Open GitHub Desktop and sign in.
2. Clone the existing portfolio repository if it is not already on your computer.
3. Open the local repository folder.
4. Back up any private or unpublished files.
5. Replace the old website files with all files from this final package.
6. Return to GitHub Desktop.
7. Review the changed-file list.
8. Enter this summary:

```text
Upgrade portfolio design, motion, responsiveness and case studies
```

9. Select **Commit to main**.
10. Select **Push origin**.

---

## GitHub Pages

1. Open the GitHub repository.
2. Go to **Settings**.
3. Select **Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the `main` branch.
6. Select the `/ (root)` folder.
7. Save.
8. Wait for the deployment to complete.

The included `.nojekyll` file helps GitHub Pages serve the static files exactly as provided.

After deployment, test:

- Welcome screen and Enter button
- Mobile menu
- Theme switcher
- CV PDF and DOCX downloads
- Project filters and case-study dialogs
- `Ctrl+K` or `Command+K` command palette
- LinkedIn and email links

---

## Netlify connected to GitHub

1. Sign in to Netlify.
2. Choose **Add new site** and **Import an existing project**.
3. Connect GitHub.
4. Select the portfolio repository.
5. Leave the build command empty.
6. Use `.` as the publish directory if Netlify requests one.
7. Deploy.

Future GitHub commits will trigger automatic deployments. The included `netlify.toml` and `_headers` files provide deployment and security-header settings.

### Netlify manual deployment

For a temporary test without GitHub:

1. Extract the ZIP.
2. Open Netlify Drop.
3. Drag the extracted portfolio folder onto the deployment area.
4. Wait for the generated testing URL.

Upload the folder, not only the ZIP archive.

---

## Vercel

1. Sign in to Vercel.
2. Import the GitHub repository.
3. Set the framework preset to **Other** if requested.
4. Leave the build command empty.
5. Keep the output directory as the repository root.
6. Deploy.

The included `vercel.json` adds basic security headers.

---

## Cloudflare Pages

1. Open Cloudflare Pages.
2. Connect the GitHub repository.
3. Choose **None** or a static-site option for the framework preset.
4. Leave the build command empty.
5. Set the output directory to the repository root.
6. Deploy.

---

## Clear cached old versions

The CSS and JavaScript links include a version query to reduce stale-cache problems. After deployment:

1. Open the site in a private/incognito window.
2. Test it on a real phone.
3. Hard refresh on desktop using `Ctrl+Shift+R` or `Command+Shift+R`.
4. If a hosting service still shows the old build, trigger a new deployment from its dashboard.

---

## Custom-domain finishing step

When the final domain is connected, update the Open Graph image path in `index.html` from:

```html
<meta property="og:image" content="assets/social-preview.png">
```

to the full domain URL, for example:

```html
<meta property="og:image" content="https://your-domain.com/assets/social-preview.png">
```

Do the same for the Twitter image metadata. This improves LinkedIn and social preview reliability.
