# Changesets

This directory contains changesets for tracking version changes across packages.

## Usage

```bash
# Create a changeset
pnpm changeset

# Version packages based on changesets
pnpm changeset version

# Publish packages (requires npm credentials)
pnpm changeset publish
```

## Workflow

1. **Make changes** to packages
2. **Run `pnpm changeset`** to document the change
3. **Commit changeset file** (e.g., `.changeset/awesome-feature.md`)
4. **On release**, run `pnpm changeset version` to bump all affected versions
5. Commit and tag the version change
6. Run `pnpm changeset publish` to publish to npm

## More Info

See [Changesets docs](https://github.com/changesets/changesets) for detailed usage.
