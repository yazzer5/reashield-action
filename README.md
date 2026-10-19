# REAShield exposure gate

A GitHub Action that scores how easily an AI agent can reverse-engineer your
JavaScript or Electron app, and fails the check when the score drops below your
minimum. Use it to catch a pull request that ships a hard-coded key, a readable
license check or a source map before it reaches users.

Scoring is free. Hardening the build first is a [REAShield Pro](https://reashield.q-axiom.com.au/#pricing) feature.

## Quick start (free)

Add this to `.github/workflows/reashield.yml`, after your build step:

```yaml
name: REAShield
on: [pull_request]

jobs:
  exposure:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      # ... build your app here, e.g. npm ci && npm run build
      - uses: yazzer5/reashield-action@v1
        with:
          path: dist          # your built app
          min-score: 60       # fail below this (0 to 100, higher is better)
```

Every run writes the score and what leaks to the job summary.

## Harden, then gate (Pro)

Add your license key as a repository secret named `REASHIELD_LICENSE_KEY`, then:

```yaml
      - uses: yazzer5/reashield-action@v1
        with:
          path: dist
          harden: true
          license-key: ${{ secrets.REASHIELD_LICENSE_KEY }}
          output: dist-hardened
          min-score: 70
```

The hardened build is written to `output`, ready for your packaging step
(electron-builder, Electron Forge and so on). Test the hardened app before you
ship it.

## Inputs

| Input | Default | What it does |
|---|---|---|
| `path` | (required) | Folder to score, usually your built app. |
| `min-score` | `60` | Fail when the score is below this. |
| `harden` | `false` | Pro: harden first and score the hardened build. |
| `license-key` | | Pro license key. Pass it from a secret. |
| `output` | `.reashield-hardened` | Where the hardened build goes. |
| `cli-url` | REAShield CLI tarball | Where the CLI is installed from. |

## Outputs

`score` (0 to 100), `grade` (A to F), `scanned-path`.

## Notes

- Needs Node 18 or newer on the runner (GitHub-hosted runners already have it).
- A folder with no JavaScript fails the check, so a wrong `path` can never pass by accident.
- Your code is scored on the runner. Nothing is uploaded. Only a Pro license check calls home.
- Hardening raises the cost of reverse-engineering. It does not make an app impossible to copy.

Try the free web scanner at https://reashield.q-axiom.com.au.
