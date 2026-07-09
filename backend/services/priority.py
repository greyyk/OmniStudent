"""Priority Task Board.

Ranks incomplete assignments by a score that blends:
  - urgency  (fewer days until due = higher)
  - grade_weight (how much of the course grade it's worth)
  - effort   (estimated hours — longer work should start sooner)

Assignments are split into high / medium / low priority thirds.
"""
