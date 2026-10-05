# Risks

- Browser simulator is narrow command matching, not Linux. Fixed fixtures and multiple-choice explanations can be memorized; practice pass is not general mastery.
- Versioned localStorage improves continuity only. It is client-editable, same-browser/device state and must never be trusted for certification or authorization.
- Persistence/hydration browser regression is still manual; CI currently proves typecheck, pure behavioral tests, audit and build, not real browser refresh/storage behavior.
- Curriculum is a skeleton; most advertised domain labs are planned rather than delivered.
- Parent directory permissions, ACL/SELinux and other configuration are assumed healthy in current fixtures, so the exercise does not cover the full Linux access path.
- Dependency overrides require compatibility monitoring; audit reflects registry findings at verification time, not proof of absence of vulnerabilities.
- Real sandbox architecture is a design only. No runtime, isolation verification or cost controls implemented.
- Concurrent runs must re-read PR/head/main before updating; never force-push main.
