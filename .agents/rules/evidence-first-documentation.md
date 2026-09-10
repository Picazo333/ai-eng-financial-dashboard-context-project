# Evidence-first documentation rule

**Scope:** Repository summaries, agent notes, memory-bank updates, and claims
about current behavior.

Support important statements with a concrete repository path or an executable
check. Use `UNVERIFIED` when the implementation does not establish a claim.
For example, the README documents Compose startup and the route implementation
defines supported endpoints; a root backend URL should not be documented as
available because [backend/app/routes.py](../../backend/app/routes.py) has no
root route.

Keep documentation aligned with the current implementation rather than with
stale fixtures or aspirational product descriptions.
