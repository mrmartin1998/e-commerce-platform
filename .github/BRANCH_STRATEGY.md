# Branch Strategy

This repository follows a modified GitFlow workflow:

## Main Branches

- `master` - Production-ready code
- `develop` - Master development branch

## Supporting Branches

### Feature Branches
- Purpose: New features and non-emergency bug fixes
- Branch from: `develop`
- Merge into: `develop`
- Naming: `feature/descriptive-name`

### Bugfix Branches
- Purpose: Bug fixes
- Branch from: `develop`
- Merge into: `develop`
- Naming: `bugfix/descriptive-name`

### Release Branches
- Purpose: Release preparation
- Branch from: `develop`
- Merge into: `master` and `develop`
- Naming: `release/version-number`

## Merge Strategy
When merging PRs in GitHub:
- Use "Create a merge commit" (not squash or rebase)
- This preserves the commit history and makes local branch cleanup easier
- Ensures Git can properly track merged branches

## Branch Protection Rules

Set up these branch protection rules in GitHub:

1. `master` branch (Production):
   - Require pull request reviews (minimum 1 reviewer)
   - Require status checks to pass
   - Only allow PRs from `develop` branch
   - No direct pushes
   - Must be up to date before merging

2. `develop` branch (Integration):
   - Require status checks to pass
   - No direct pushes (all changes via feature branches)
   - Must be up to date before merging
   - Automated tests must pass

## Quality Gates

1. Feature/Bugfix Branches → develop:
   - All tests must pass
   - Code follows style guidelines
   - Changes are properly documented
   - PR template is fully completed

2. develop → master:
   - All integration tests pass
   - Code review completed
   - Documentation is up to date
   - No pending/failed tests
   - Release notes updated if needed

## Workflow

1. Create feature/bugfix branch from `develop`
2. Work on your changes
3. Create PR to merge into `develop`
4. After tests pass and review, merge into `develop`
5. Once `develop` is stable and tested:
   - Create PR from `develop` to `master`
   - Get final review
   - Merge to `master` for production

## Workflow checklist

1. Starting a Feature:
   - [ ] Be on develop branch: `git checkout develop`
   - [ ] Pull latest changes: `git pull origin develop`
   - [ ] Create feature branch: `git checkout -b feature/name`

2. Working on Feature:
   - [ ] Make changes
   - [ ] Run local tests: `npm run test` (or your test command)
   - [ ] Commit changes: `git add . && git commit -m "type: description"`
   - [ ] Push to remote: `git push origin feature/name`

3. Creating PR to develop:
   - [ ] Go to GitHub repository website
   - [ ] Click "Compare & pull request" or "New pull request"
   - [ ] ⚠️ VERIFY target is `develop` branch
   - [ ] Add proper description and link to issue (#number)
   - [ ] Complete PR template fully
   - [ ] Wait for all checks to pass
   - [ ] Request review if required

4. After Feature PR Merge:
   - [ ] Switch to develop: `git checkout develop`
   - [ ] Pull latest: `git pull origin develop`
   - [ ] Delete local feature branch: `git branch -d feature/name`
   - [ ] Delete remote feature branch: `git push origin --delete feature/name`
   - [ ] Verify branch deletion: `git branch -r` or check GitHub branches page
   - [ ] Clean up: `git fetch --prune`

5. Promoting to Production:
   - [ ] Switch to develop: `git checkout develop`
   - [ ] Verify develop is stable: `git pull origin develop`
   - [ ] Verify tests: `npm run test` (or your test command)
   - [ ] Create PR on GitHub from develop to master
   - [ ] Get code review
   - [ ] Merge via GitHub interface only

