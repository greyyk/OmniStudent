"""Emergency Block Rescheduler.

When a user creates an emergency block:
  1. Any scheduled study session that overlaps the emergency is marked "missed".
  2. Each missed session is rescheduled into the earliest free slot found after
     the emergency ends (within the next 7 days).

Returns the emergency event, the list of missed sessions, and the rescheduled
replacements.
"""
