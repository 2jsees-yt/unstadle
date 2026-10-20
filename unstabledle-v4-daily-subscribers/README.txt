UNSTABLEDLE v4 — DAILY YOUTUBE SUBSCRIBER UPDATES

What this version does
- Reads subscriber counts from subscribers.json when the game loads.
- GitHub Actions runs the updater once a day (around 05:17 UTC).
- The updater uses YouTube Data API v3 and commits the updated subscribers.json.
- The API key is stored as a GitHub Actions secret, not in the public website.
- If a channel cannot be found or its subscriber count is hidden, the previous value is kept.

IMPORTANT LIMITATION
This does not update a purely local folder by itself. Daily updates require the project to be in a GitHub repository with Actions enabled. The game can still be tested locally, but the page must be served over HTTP (not opened as file://) for fetch('./subscribers.json') to work reliably. For example, in the project folder run:
  python -m http.server 8000
Then open http://localhost:8000

SETUP
1. Create a GitHub repository and upload the contents of this folder, including the hidden .github folder.
2. In Google Cloud Console, create a project, enable "YouTube Data API v3", and create an API key.
3. In the GitHub repository, go to Settings > Secrets and variables > Actions > New repository secret.
   Name: YOUTUBE_API_KEY
   Value: your API key
4. Open youtube-channels.json and verify every @handle. These are starting guesses and may need correction.
   The key on the left must exactly match the character's `name` in game.js.
   The handle on the right must be that creator's actual YouTube @handle.
5. In GitHub, open Actions and enable workflows. Run "Update YouTube subscriber counts" manually once using Run workflow.
6. Check subscribers.json and the workflow log. Fix any handles that returned "No channel found".
7. If you want the public site, enable GitHub Pages in Settings > Pages (deploy from your main branch/root, if your repo setup supports it).

API NOTES
- YouTube's public subscriberCount is rounded down to three significant figures, so it may not show every single subscriber.
- Updates run once per day, not instantly when a channel gains subscribers.
- The API has quotas and counts can be unavailable/hidden for some channels.
- Nationality, status, dimension, debut arc, pronouns, and role are still maintained manually in game.js.
- Stats remain local to each player's browser.

EDITING CHARACTERS
Edit the CHARACTERS array at the top of game.js.
Edit youtube-channels.json to connect each character name to a YouTube handle.
Do not put your API key in game.js or any public JSON file.
