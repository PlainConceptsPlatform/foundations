---
name: platform-upstream
description: Move an improvement or fix born in a Platform family app's platform code into its template (Kitchen-Sink) first, so the template carries it to every family app, or record a dated exception when the app cannot wait. Use when a change touches a path the app's .platform/contract.yml lists under owned (apps/api/src/Platform/**, apps/web/src/shared/platform/**, docs/platform/** and the rest), when the harness guard or check-diff reports a platform file, when a template sync leaves conflict markers in an owned file, when the platform conformance check fails, or when the user says "upstream this", "push this to Kitchen-Sink" or "add a platform exception".
---

# Platform Upstream

In a family app, `.platform/contract.yml` names the template the platform code comes from (`source`) and the paths it owns (`owned`). For the family the template is Kitchen-Sink. A change to an owned path travels one way: into the template, out as a template tag, into every family app with the contract's `sync.update`. This skill moves a change that started in an app onto that route, or, when the app cannot wait, records a dated exception until it gets there.

Read the contract first and take every path, URL and command below from it. A repository that has `.copier-answers.yml` and `.platform/manifest` but no `contract.yml` was adopted before the contract existed: read the manifest's lines as `owned` and `_src_path` as `source.url`; the template's next tag brings the contract.

The rules behind it are in Foundations `ai/ARCHITECTURE.md` ("Platform family": one owner per file, conformance, upstream first) and `ai/ENGINEERING.md` ("Template conformance").

## 1. Is it an owned path?

Match every changed file against the contract's `owned` globs. The conformance guard of the `platform-template` workflows template does it:

```bash
node scripts/check-platform-conformance.mjs --base origin/main
```

It fails naming each owned path that changed since the merge base, unless the change is a template sync or an unexpired exception covers it. Without that template, `node .opencode/scripts/check-diff.mjs` (agent-harness 3.8.0 or later) reports the same paths as `platform-file`. If neither names a file, the change is the app's own: stop here, this skill does not apply. If the repository has no contract, it receives no shared code and this skill does not apply either.

## 2. Choose the route

- **Upstream (the default).** The change is a fix or an improvement any family app would want, or it is needed by this app and harmless to the others.
- **Dated exception.** The app needs the change before a template tag can carry it (a production incident, a release date), or the app has not yet converged a capability onto the platform code. The exception is temporary by construction, and its issue is the upstream work.

If the change is genuinely specific to this app, it does not belong in an owned path at all. Upstream an **extension point** instead (a port, a configuration value, a catalog entry the platform reads), and put the app-specific part in an app file that plugs into it.

## 3. Upstream route

1. **Clone the template fresh** from `source.url` on a new branch. Kitchen-Sink is private: it requires access to the PlainConceptsPlatform organisation. Without access, take the exception route and ask someone with access to open the issue at `source.changes`.
2. **Make the change at the same path.** Owned paths are identical in every app, so the file you edit in the template is the one you edited in the app. Keep it generic: no app name, no app business, nothing that only makes sense in one domain. A difference between apps becomes a setting the platform reads (`Platform:AnonymousPages`, `Platform:TrustedProxies`, `Csp:AllowSameOriginFrames`), an argument with a default (`PlatformAuditActions`), a registration (`AddReadinessProbe`) or a slot (the shell's `logo` and tours), never a branch on the app.
3. **Change everything the template owns for it**: the capability's spec, `docs/platform/` when behaviour or configuration changes, and `Directory.Packages.Platform.props` or the pnpm `platform` catalog when a dependency moves. A change that decides something other apps will rely on (a security default, a seam) gets a decision record in the template's `docs/decisions/`.
4. **Test it in the template.** Every platform capability runs in Kitchen-Sink for real, so the change is proven against all of them, not only against the app it came from. Add or update the test that shows the fix; do not weaken one.
5. **Open the pull request in the template**, linking the app's issue or pull request where the need appeared. Once merged, the change ships in the template's next `v*` tag. When an app must set or change something of its own to take it (a new setting, a changed argument), the release notes say so in a "What apps must do" section, since the template cannot write app files.
6. **Take the tag in the app** in its own pull request. The `Platform: Template sync` workflow opens it on its weekly run, or on demand; by hand, run the contract's `sync.update`, for the family:

   ```bash
   copier update --trust --defaults --conflict inline
   ```

   The app's local edit and the template's version should now be the same, so the owned path shows no difference. Delete the app's exception for it, if there was one.
7. **The other family apps** get the change with their next template sync. Nothing is copied to them by hand.

## 4. Exception route

Add an entry to the exceptions file the contract names (`exceptions`, by default `.platform/exceptions.yml`), in the same pull request as the divergent change. The file is the app's, not the template's:

```yaml
exceptions:
  - path: apps/api/src/Platform/Auditing/AuditAppender.cs
    reason: Hotfix for duplicate audit rows under retry; upstream fix in progress.
    issue: https://github.com/PlainConceptsPlatform/Kitchen-Sink/issues/<n>
    expires: 2026-11-30
```

- **`path`**: the narrowest glob that covers the change, never a whole directory to be safe. It must match owned paths.
- **`reason`**: one sentence a reviewer can check: why the app cannot wait for a tag.
- **`issue`**: the template issue or pull request that upstreams the change. Open one at `source.changes` if none exists. An exception without an issue is not an exception.
- **`expires`**: when the tag should have landed. Weeks, not months. It is inclusive: the entry applies through that day. When it passes, the exception stops counting and the conformance check fails, which is the point: someone has to decide again.

The harness guard and `check-diff` honour the same file, so while the entry is live an agent may edit the path it covers. When the tag lands, take it and delete the entry. Extending `expires` needs a new reason written in the issue, not just a later date.

## 5. Conflict markers after a template sync

An owned file the app had changed comes back with `<<<<<<< before updating` / `=======` / `>>>>>>> after updating` markers. For each hunk:

- Take the template's side when the app's edit was a workaround the template has since made unnecessary, or a change nobody can explain.
- Keep the app's side only on the exception route, with an entry in the exceptions file, and start the upstream route for it.

Never commit an owned file with markers in it (the conformance guard fails on them), and never resolve a conflict by editing the file into something that matches neither side.

## Rules

1. The template first, then the template tag, then the apps. Never the other way round, and never app to app.
2. Never edit an owned path in an app without either an upstream pull request or a dated exception.
3. One change per template pull request, so a tag's contents can be read and reverted one by one.
4. Never put an app's name or domain into platform code; add an extension point instead.
5. Never move a path into the app's ownership by deleting it from `owned` in the app: the contract is an owned file itself and comes back with the next sync. The same holds for `.platform/manifest`, the legacy mirror Kitchen-Sink still ships.
