-- Revert ksl-notify:initial_schema from pg

BEGIN;

DROP TABLE search_listings;
DROP TABLE listings;
DROP TABLE searches;

COMMIT;
