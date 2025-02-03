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

## Branch Protection Rules

Set up these branch protection rules in GitHub:

1. `master` branch:
   - Require pull request reviews
   - Require status checks to pass
   - No direct pushes

2. `develop` branch:
   - Require pull request reviews
   - Require status checks to pass
   - No direct pushes

## Workflow

1. Create feature/bugfix branch from `develop`
2. Work on your changes
3. Create PR to merge into `develop`
4. After review and testing, merge into `develop`
5. Create release branch when ready
6. After final testing, merge release into `master` and `develop` 

## Workflow checklist

1. Starting a Feature:
   - [ ] Be on develop branch: `git checkout develop`
   - [ ] Pull latest changes: `git pull origin develop`
   - [ ] Create feature branch: `git checkout -b feature/name`

2. Working on Feature:
   - [ ] Make changes
   - [ ] Commit changes
   - [ ] Push to remote: `git push origin feature/name`

3. Creating PR:
   - [ ] Create PR on GitHub
   - [ ] ⚠️ VERIFY target is `develop` branch
   - [ ] Add proper description and link to issue (#number)

4. After PR Merge:
   - [ ] Switch to develop: `git checkout develop`
   - [ ] Pull latest: `git pull origin develop`
   - [ ] Delete local feature branch: `git branch -d feature/name`
   - [ ] Verify remote branch was deleted (should happen automatically)
   - [ ] git fetch prune

5. Check that master is up to date:
   - [ ] git checkout master
   - [ ] git pull origin master
   - [ ] git merge develop
   - [ ] git push origin master

