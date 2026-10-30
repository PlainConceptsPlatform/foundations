# DOCUMENTATION

The documentation structure every Platform application keeps, so that a reader moving between applications finds the same things in the same places, and how it stays current. This describes a shape, not a site: Markdown in the repository is enough.

The usual failure is not missing documentation. It is plenty of it that nobody can route through, with the most-read files the most out of date. So the structure is organised around who is reading, and anything a machine can derive is generated instead of written.

## Structure

```text
README.md                 what this is, how to run it, and a link to docs/README.md
ARCHITECTURE.md           the map: system context, containers, and where each topic lives
docs/
├── README.md             the portal: one entry per audience
├── how-to/               task guides for developers
├── explanation/          why it works the way it does
├── reference/            facts, generated wherever possible
├── runbooks/             what to do when something breaks
├── decisions/            decision records, with a generated index
└── glossary.md           domain and product terms
```

A small application may merge folders, for example a single `docs/operations.md`. What must survive is the portal and the separation below: the file names are a default, the questions are the standard.

| Document | Audience | It must answer |
| --- | --- | --- |
| `README.md` | Anyone arriving | What is this, how do I run it, where do I go next? |
| `docs/README.md` | Developer, operator, auditor, business owner | Where do I start, given who I am? |
| `ARCHITECTURE.md` | Developer | What are the parts, how do they talk, what do they depend on? |
| `docs/how-to/` | Developer | How do I do this task here? |
| `docs/explanation/` | Developer | Why is it built this way? |
| `docs/reference/` | Everyone | What exactly exists: components, configuration, permissions, jobs, integrations? |
| `docs/runbooks/` | Operator | It is broken: how do I tell, fix it and confirm? |
| `docs/decisions/` | Developer, auditor | What was decided, why, and does it still hold? |
| `docs/glossary.md` | Everyone | What does this word mean here? |

The four kinds of page come from [Diátaxis](https://diataxis.fr/): tutorials, how-to guides, reference and explanation serve different needs, and a page that tries to do two does neither. Architecture diagrams follow [C4](https://c4model.com/): context and containers are enough for most applications, written as Mermaid in the repository so they change with the code.

## Rules

- **One fact, one place.** Agent instructions, contributor guides and READMEs link to a rule. They do not restate it, because the copies are what drifts.
- **Generate what can be derived.** Component lists, permission matrices, job catalogues, decision indexes and counts come from the code, and CI fails when the generated file is out of date. A count typed by hand is already wrong.
- **Documents state their limits.** A runbook says what it does not cover. A page that has been superseded says so at the top and links forward.
- **Runbooks follow failures.** Write one for what has actually broken or would hurt most, with how to detect it, how to fix it, and how to confirm. Start with failed deploy, dependency down, data restore and secret rotation.
- **Archive, don't accumulate.** Parked or historical material moves to `docs/archive/` and leaves the portal. It is not deleted, and it is not in the reader's way.

## Decision records

- Every record has a status: Proposed, Accepted, Deprecated or Superseded.
- A record is not rewritten when a decision changes. A new record states what it supersedes, and the old one is marked Superseded with a link to its replacement.
- Status and supersession are machine-readable, in the same format across the repository, so the index can be generated. The index is how a reader finds the decision that holds today.

## Keeping it current

Two mechanisms, because they catch different things.

**Every pull request.** A change to the application, infrastructure or CI updates what a reader relies on, or declares why nothing changes for a reader with a `Docs-impact: none - <reason>` commit trailer. A spec or decision record does not satisfy this on its own. Tests, dependency bumps and documentation-only changes are exempt. A broken relative link fails the build.

**Every 15 days.** The `docs-audit` worker from [`agentic-workflows`](https://github.com/PlainConceptsPlatform/agentic-workflows) compares the entry points with the code and with this standard. When something is stale it files an issue with the evidence, which then goes through refinement like any other. When everything is current it files nothing.

The first proves a document moved or that someone said why not, never that the document is right. The second finds what got past it.

## Adoption checklist

Each line is a yes or no.

- [ ] `README.md` links to `docs/README.md`, and the portal has an entry for each audience the application has.
- [ ] `ARCHITECTURE.md` has a context and a container diagram that match what is deployed.
- [ ] Every Accepted decision still holds, and superseded ones link forward.
- [ ] Reference pages that can be generated are generated, and CI checks them.
- [ ] The application's main failure modes have a runbook.
- [ ] The glossary covers the domain terms a new reader would stumble on.
- [ ] CI requires documentation or a declaration in every pull request, and fails on broken links.
- [ ] The `docs-audit` worker is installed with its own slot.
