## Code Review Checklist

### General Requirements
- [ ] Code follows project style guide and conventions
- [ ] Variable and function names are clear and meaningful
- [ ] No unnecessary comments (code is self-documenting where possible)
- [ ] No debug/console logs left in code
- [ ] No hardcoded values (use constants/environment variables)
- [ ] Error handling is implemented appropriately
- [ ] Code is DRY (Don't Repeat Yourself)

### Security
- [ ] Input validation is implemented where necessary
- [ ] No sensitive information in logs or comments
- [ ] Authentication/Authorization checks are in place
- [ ] No security vulnerabilities introduced
- [ ] API endpoints are properly secured
- [ ] Environment variables are used for sensitive data

### Performance
- [ ] No obvious performance issues
- [ ] Database queries are optimized
- [ ] Proper indexing is implemented where needed
- [ ] No memory leaks
- [ ] Assets are optimized (images, etc.)
- [ ] Unnecessary dependencies are not added

### Testing
- [ ] Unit tests are written and passing
- [ ] Integration tests are written where necessary
- [ ] Edge cases are covered
- [ ] Error scenarios are tested
- [ ] UI changes are tested across browsers (if applicable)
- [ ] Mobile responsiveness is verified (if applicable)

### Documentation
- [ ] Code changes are documented where necessary
- [ ] README is updated (if applicable)
- [ ] API documentation is updated (if applicable)
- [ ] Comments explain "why" not "what"
- [ ] Complex algorithms are documented
- [ ] Change log is updated (if applicable)

### Best Practices
- [ ] No commented-out code
- [ ] Code is modular and maintainable
- [ ] Functions are small and focused
- [ ] No magic numbers
- [ ] Proper error messages for users
- [ ] Logging is meaningful and helpful

### Project Specific
- [ ] Follows Next.js best practices
- [ ] Component structure matches project standards
- [ ] State management follows project patterns
- [ ] Routing implementation is consistent
- [ ] API endpoints follow REST conventions
- [ ] Database schema changes are backward compatible

### Before Merging
- [ ] All conversations are resolved
- [ ] CI/CD pipeline is passing
- [ ] No merge conflicts
- [ ] Branch is up to date with base branch
- [ ] All requested changes are addressed
- [ ] Required approvals are obtained 