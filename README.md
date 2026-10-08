# Linux in a tab

A small Linux VM that runs in the visitor's browser (using v86) and is hosted free on GitHub Pages.

## Files you must add yourself
Download these from the v86 project (https://github.com/copy/v86) and place them here:

| File | Put it in |
|------|-----------|
| libv86.js | lib/ |
| v86.wasm | lib/ |
| seabios.bin | bios/ |
| vgabios.bin | bios/ |
| a small Linux ISO, renamed linux.iso | images/ |

If your file names differ, edit the CONFIG block at the top of app.js.

## Publish
Settings -> Pages -> Deploy from a branch -> main, / (root).
Your VM will be live at https://<username>.github.io/<repo>/

## Notes
- Each file must be under 100 MB for GitHub to accept it.
- Saved state is stored in each visitor's own browser, not in the repo.
- If you change the ISO or memory size, change saveVersion in app.js.
