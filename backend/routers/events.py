"""CRUD routes for calendar events, scoped to the current user.

Study sessions and emergency blocks are stored here too, they are just events
with type="study" or type="emergency". The scheduler creates study events via
the schedule router. this router is for the user's own manual events.
"""
