# Reporting Bugs

We appreciate detailed bug reports as they help us improve the platform for everyone. Please follow these guidelines when reporting bugs:

## Before Reporting

1. **Check existing issues**: Search our [GitHub Issues](https://github.com/ivan-zdravkov/free-water-tips/issues) to see if the bug has already been reported.
2. **Try to reproduce**: Make sure you can consistently reproduce the issue.
3. **Check different browsers/devices**: Test if the issue occurs across different platforms.

## Bug Report Template

When creating a bug report, please include:

### **Bug Description**
A clear and concise description of what the bug is.

### **Steps to Reproduce**
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

### **Expected Behavior**
A clear description of what you expected to happen.

### **Actual Behavior**
A clear description of what actually happened.

### **Screenshots/Videos**
If applicable, add screenshots or screen recordings to help explain your problem.

### **Environment Information**
- **Platform**: Web App / Android App / iOS App
- **Browser**: Chrome, Firefox, Safari, etc. (including version)
- **Device**: Desktop, Mobile, Tablet
- **Operating System**: Windows 10, macOS Big Sur, iOS 14, Android 11, etc.
- **Screen Resolution**: If relevant for UI issues

### **Additional Context**
- Any error messages displayed
- Console logs (for web app issues)
- Network connectivity status
- Any recent changes to your setup

## Priority Levels

When reporting bugs, consider the impact:

- **🔴 Critical**: Security vulnerabilities, data loss, app crashes
- **🟠 High**: Major features broken, significant UX issues
- **🟡 Medium**: Minor features broken, cosmetic issues with workarounds
- **🟢 Low**: Minor cosmetic issues, nice-to-have improvements

## Example Bug Report

```markdown
**Bug Description**
The "Find Nearest" button doesn't work when location services are disabled.

**Steps to Reproduce**
1. Open Free Water Tips web app
2. Disable location services in browser settings
3. Click "Find Nearest" button
4. No error message appears, button becomes unresponsive

**Expected Behavior**
Should show an error message asking user to enable location services or manually enter their location.

**Actual Behavior**
Button becomes unresponsive with no feedback to the user.

**Environment**
- Platform: Web App
- Browser: Chrome 119.0.6045.105
- Device: Desktop
- OS: Windows 11

**Screenshots**
[Attach screenshot showing unresponsive button]
```
