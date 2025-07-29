# Branch Protection Rules Setup

This file contains instructions for setting up branch protection rules for the `master` branch. These rules cannot be automated via files and must be configured through the GitHub web interface.

## How to Setup Branch Protection Rules

1. **Navigate to Repository Settings**
   - Go to your repository on GitHub
   - Click on "Settings" tab
   - Click on "Branches" in the left sidebar

2. **Add Branch Protection Rule**
   - Click "Add rule"
   - Enter branch name pattern: `master`

3. **Configure Protection Settings**

   ### Required Settings:
   ```
   ✅ Require a pull request before merging
       ✅ Require approvals: 1
       ✅ Dismiss stale PR approvals when new commits are pushed
       ✅ Require review from code owners
   
   ✅ Require status checks to pass before merging
       ✅ Require branches to be up to date before merging
       ✅ Status checks to require:
           - PR Quality Checks / validate-checklist
           - PR Quality Checks / backend-tests
           - PR Quality Checks / frontend-checks
           - PR Quality Checks / mobile-checks
           - PR Quality Checks / documentation-checks
           - PR Quality Checks / security-checks
           - PR Quality Checks / final-validation
   
   ✅ Require conversation resolution before merging
   
   ✅ Require signed commits (optional but recommended)
   
   ✅ Require linear history (optional - prevents merge commits)
   
   ✅ Do not allow bypassing the above settings
       ✅ Restrict pushes that create files larger than 100 MB
   ```

   ### Additional Recommended Settings:
   ```
   ✅ Restrict pushes to matching branches
       - Add yourself (@ivan-zdravkov) as an exception for emergency fixes
   
   ✅ Allow force pushes: Everyone (for feature branches only)
   
   ✅ Allow deletions: Enabled (for cleaning up feature branches)
   ```

4. **Save Protection Rule**
   - Click "Create" to save the branch protection rule

## What This Achieves

- **🔒 Prevents direct pushes to master** - All changes must go through pull requests
- **👥 Requires code review** - At least one approval required before merging
- **🧪 Enforces quality checks** - All automated tests and checks must pass
- **📝 Ensures documentation** - Forces checklist completion and conversation resolution
- **🔐 Maintains code integrity** - Prevents bypassing of quality standards

## Testing the Setup

After configuring, test by:

1. Creating a feature branch
2. Making changes and opening a PR
3. Verifying that the checks run automatically
4. Confirming that merge is blocked until all requirements are met

## Troubleshooting

If status checks don't appear in the required list:
1. Create a test PR first to trigger the workflows
2. The status check names will then be available for selection
3. Update the branch protection rule to include them

## Emergency Procedures

In case of critical bugs requiring immediate fixes:
1. Repository admins can temporarily disable protection rules
2. Make the emergency fix
3. Re-enable protection rules immediately after
4. Follow up with a post-incident review

---

**Note**: These protection rules help maintain code quality and prevent issues from reaching production. They are essential for a professional development workflow.
