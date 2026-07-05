# Session Handoff

**Category:** documentation  
**ID:** `documentation/session-handoff`  
**Version:** 1.0.0

---

## Purpose

Preserve continuity between AI sessions or contributors.

---

## Expected input

- Work completed
- Work in progress
- Blockers
- Next steps

---

## Expected output

- Handoff summary
- File/state pointers
- Recommended next prompt

---

## When to execute

End of session, phase slice, or contributor change.

---

## Dependencies

Any active work stream

---

## Compatible AI assistants

**All**  -  ChatGPT, Claude, Cursor, Codex, Gemini, OpenHands.

---

## Prompt

```
You are producing a session handoff for {PROJECT_NAME}.

Completed: {TASK_DESCRIPTION}
In progress: (describe)
Blockers: (list)

Deliver:
1. **Summary**  -  3 - 5 sentences
2. **Artifacts**  -  branches, PRs, docs touched
3. **State**  -  tests, migrations, flags
4. **Next steps**  -  ordered, with prompt IDs
5. **Do not redo**  -  decisions already made

Optimize for the next assistant with zero prior context.
```

---

*Repository-agnostic prompt per [SCHEMA.md](../SCHEMA.md).*
