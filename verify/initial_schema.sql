-- Verify ksl-notify:initial_schema on pg

BEGIN;

Select id, ksl_id, title, price, location from listings where false;
Select id, url from searches where false;
Select id, search_id, listing_id from search_listings where false;

ROLLBACK;
