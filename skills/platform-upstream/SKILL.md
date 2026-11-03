---
name: platform-upstream
description: Move an improvement or fix born in a Platform family app's platform code into Kitchen-Sink first, so the template carries it to every family app, or record a dated exception when the app cannot wait. Use when a change touches a path listed in .platform/manifest (apps/api/src/Platform/**, apps/web/src/shared/platform/**, docs/platform/**, Directory.Packages.Platform.props, the pnpm platform catalog), when copier update leaves conflict markers in a platform file, when a template conformance check fails, or when the user says "upstream this", "push this to Kitchen-Sink" or "add a platform exception".
---

# Platform Upstream

In a family app, the paths listed in `.platform/manifest` belong to the Kitchen-Sink template. A change to one of them travels one way: into Kitchen-Sink, out as a template tag, into every family app with `copier update`. This skill moves a change that started in an app onto that route, or, when the app cannot wait, records a dated exception until it gets there.

The rules behind it are in Foundations `ai/ARCHITECTURE.md` ("Platform family": one owner per file, conformance, upstream first) and `ai/ENGINEERING.md` ("Template conformance").

## 1. Is it a platform path?

Match every changed file against the app's `.platform/manifest` (gitwildmatch globs, `#` comments):

```bash
grep -Ev '^\s*(#|$)' .platform/manifest | sed 's/^/:(glob)/' | xargs git diff --name-only origin/main --
```

It lists the platform files that differ from `main`, committed or not. If it prints nothing, the change is the app's own: stop here, this skill does not apply. If the repository has no `.copier-answers.yml`, it is not a family app and this skill does not apply either.

## 2. Choose the route

- **Upstream (the default).** The change is a fix or an improvement any family app would want, or it is needed by this app and harmless to the others.
- **Dated exception.** The app needs the change before a template tag can carry it (a production incident, a release date), or the app has not yet converged a capability onto the platform code. The exception is temporary by construction, and its issue is the upstream work.

If the change is genuinely specific to this app, it does not belong in a platform path at all. Upstream an **extension point** instead (a port, a configuration value, a catalog entry the platform reads), and put the app-specific part in an app file that plugs into it.

## 3. Upstream route

1. **Clone Kitchen-Sink fresh** on a new branch. It is private: it requires access to the PlainConceptsPlatform organisation. Without access, take the exception route and ask someone with access to open the Kitchen-Sink issue.
2. **Make the change at the same path.** Platform paths are identical in every app, so the file you edit in Kitchen-Sink is the one you edited in the app. Keep it generic: no app name, no app business, nothing that only makes sense in one domain.
3. **Change everything the template owns for it**: the capability's spec, `docs/platform/` when behaviour or configuration changes, and `Directory.Packages.Platform.props` or the pnpm `platform` catalog when a dependency moves.
4. **Test it in Kitchen-Sink.** Every platform capability runs there for real, so the change is proven against all of them, not only against the app it came from. Add or update the test that shows the fix; do not weaken one.
5. **Open the pull request in Kitchen-Sink**, linking the app's issue or pull request where the need appeared. Once merged, the change ships in Kitchen-Sink's next `v*` tag.
6. **Take the tag in the app** in its own pull request:

   ```bash
   copier update --trust --defaults --conflict inline
   ```

   The app's local edit and the template's version should now be the same, so the platform path shows no difference. Delete the app's exception for it, if there was one.
7. **The other family apps** get the change with their next template sync. Nothing is copied to them by hand.

## 4. Exception route

Add an entry to the app's `.platform/exceptions.yml`, in the same pull request as the divergent change:

```yaml
exceptions:
  - path: apps/api/src/Platform/Auditing/AuditAppender.cs
    reason: Hotfix for duplicate audit rows under retry; upstream fix in progress.
    issue: https://github.com/PlainConceptsPlatform/Kitchen-Sink/issues/<n>
    expires: 2026-11-30
```

- **`path`**: the narrowest glob that covers the change, never a whole directory to be safe.
- **`reason`**: one sentence a reviewer can check: why the app cannot wait for a tag.
- **`issue`**: the Kitchen-Sink issue or pull request that upstreams the change. Open one if none exists. An exception without an issue is not an exception.
- **`expires`**: when the tag should have landed. Weeks, not months. When it passes, the exception stops counting and the conformance check fails, which is the point: someone has to decide again.

When the tag lands, run `copier update` and delete the entry. Extending `expires` needs a new reason written in the issue, not just a later date.

## 5. Conflict markers after `copier update`

A platform file the app had changed comes back with `<<<<<<< before updating` / `=======` / `>>>>>>> after updating` markers. For each hunk:

- Take the template's side when the app's edit was a workaround the template has since made unnecessary, or a change nobody can explain.
- Keep the app's side only on the exception route, with an entry in `.platform/exceptions.yml`, and start the upstream route for it.

Never commit a platform file with markers in it, and never resolve a conflict by editing the platform file into something that matches neither side.

## Rules

1. Kitchen-Sink first, then the template tag, then the apps. Never the other way round, and never app to app.
2. Never edit a platform path in an app without either an upstream pull request or a dated exception.
3. One change per Kitchen-Sink pull request, so a tag's contents can be read and reverted one by one.
4. Never put an app's name or domain into platform code; add an extension point instead.
5. Never move a platform path into the app's ownership by deleting it from `.platform/manifest` in the app: the manifest is a template file and comes back with the next update.
