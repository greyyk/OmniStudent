"""Smart Schedule Sync.

Generates a study schedule for the next N days by:
  1. Collecting the user's existing events (class/work/personal) as "busy".
  2. Finding free gaps during study hours (08:00-22:00) each day.
  3. Filling those gaps with study sessions for incomplete assignments,
     most urgent (soonest due) first.

The algorithm is intentionally simple, a greedy fill. It's easy to reason
about and good enough for this.
"""
