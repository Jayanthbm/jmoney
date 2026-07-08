# Transaction Grouping Implementation Plan

Introduce a transaction grouping feature (e.g. for tracking trips, special projects, or other user-defined tags) where each transaction can optionally belong to exactly one group.

## User Review Required

> [!IMPORTANT]
> The table name `transaction_groups` is recommended instead of `groups` to avoid collisions with PostgreSQL reserved keywords (like `GROUP BY`).
> The `groups_cache` will be stored in IndexedDB using `idb-keyval` following the pattern used for other entities.

---

## Proposed Changes

### Database Layer (Supabase)

#### [NEW] [transaction_groups.sql](file:///Users/jayanthbharadwajm/development/jmoney/supabase/tables/transaction_groups.sql)
Define the schema for the new table `transaction_groups`:
```sql
create table public.transaction_groups (
  id uuid not null default extensions.uuid_generate_v4 (),
  user_id uuid null,
  name text not null,
  description text null,
  created_at timestamp without time zone null default now(),
  constraint transaction_groups_pkey primary key (id),
  constraint transaction_groups_user_name_unique unique (user_id, name),
  constraint transaction_groups_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade,
  constraint transaction_groups_name_not_empty check ((char_length(name) > 0))
) tablespace pg_default;
```

#### [MODIFY] [transactions.sql](file:///Users/jayanthbharadwajm/development/jmoney/supabase/tables/transactions.sql)
Add a foreign key column to reference `transaction_groups`:
```sql
alter table public.transactions add column group_id uuid null;
alter table public.transactions add constraint transactions_group_id_fkey foreign key (group_id) references transaction_groups(id) on delete set null;
```

#### [MODIFY] [get_user_transactions.sql](file:///Users/jayanthbharadwajm/development/jmoney/supabase/functions/get_user_transactions.sql)
Update the output columns and query structure of the RPC function:
* Add `group_id uuid` and `group_name text` to the `returns table` section.
* In the `select` statement, add `t.group_id` and `g.name as group_name`.
* Add `left join transaction_groups g on g.id = t.group_id`.

---

### Local Cache & Sync Layer (IndexedDB / Supabase SDK)

#### [MODIFY] [constants.js](file:///Users/jayanthbharadwajm/development/jmoney/src/constants.js)
Define cache key names:
```javascript
export const MY_KEYS = {
  // ...
  GROUPS_CACHE_KEY: "transaction_groups",
  LAST_GROUP_FETCH_CACHE_KEY: "last_groups_fetch",
}
```

#### [MODIFY] [utils.js](file:///Users/jayanthbharadwajm/development/jmoney/src/utils.js)
Export helper functions for retrieving the groups cache key:
```javascript
export const getGroupCacheKey = () => {
  const userId = getSupabaseUserIdFromLocalStorage();
  return {
    GROUPS_CACHE_KEY: `${userId}_${MY_KEYS.GROUPS_CACHE_KEY}`,
    GROUPS_EXPIRY_KEY: `${userId}_${MY_KEYS.LAST_GROUP_FETCH_CACHE_KEY}`,
  };
};
```

#### [NEW] [groupDb.js](file:///Users/jayanthbharadwajm/development/jmoney/src/db/groupDb.js)
Create client-side IndexedDB persistence helpers for groups using `idb-keyval`:
```javascript
import { get, set } from "idb-keyval";
import { getGroupCacheKey } from "../utils";
import { fetchGroupsData } from "../supabaseData";

export const addGroup = async (group) => {
  const { GROUPS_CACHE_KEY } = getGroupCacheKey();
  const existing = (await get(GROUPS_CACHE_KEY)) || [];
  await set(GROUPS_CACHE_KEY, [...existing, group]);
};

export const updateGroup = async (updatedGroup) => {
  const { GROUPS_CACHE_KEY } = getGroupCacheKey();
  const existing = (await get(GROUPS_CACHE_KEY)) || [];
  const updated = existing.map((g) =>
    g.id === updatedGroup.id ? updatedGroup : g
  );
  await set(GROUPS_CACHE_KEY, updated);
};

export const deleteGroup = async (id) => {
  const { GROUPS_CACHE_KEY } = getGroupCacheKey();
  const existing = (await get(GROUPS_CACHE_KEY)) || [];
  const updated = existing.filter((g) => g.id !== id);
  await set(GROUPS_CACHE_KEY, updated);
};

export const getCachedGroups = async () => {
  const { GROUPS_CACHE_KEY } = getGroupCacheKey();
  let groups = await get(GROUPS_CACHE_KEY);
  if (!groups || !Array.isArray(groups)) {
    groups = await fetchGroupsData();
  }
  return groups;
};
```

#### [MODIFY] [supabaseData.js](file:///Users/jayanthbharadwajm/development/jmoney/src/supabaseData.js)
Integrate groups caching and transactions mapping:
* Expose functions: `fetchGroupsData()`, `addGroupInDb(payload)`, `updateGroupInDb(group)`, and `deleteGroupInDb(id)`. These will execute IndexedDB write steps immediately and perform Supabase updates in the background (fire-and-forget).
* Update `loadTransactionsFromSupabase` to parse and store `group_id` and `group_name` values returned by the updated RPC query.
* Update `addTransaction` and `updateTransaction` to accept, validate, and write the optional `group_id` to local storage and Supabase sync calls.

---

### User Interface Layer

#### [MODIFY] [Settings.js](file:///Users/jayanthbharadwajm/development/jmoney/src/pages/Settings/Settings.js)
* Fetch local/server groups.
* Render a new **Groups** grid section below Categories and Payees.
* Implement UI triggers (buttons/icons/modals) to:
  * When no groups are configured, show a dashed placeholder "No Groups. Add New" button.
  * When groups exist, render a `+` icon on the right side of the "Groups" title to add a new group.
  * Open the edit/delete group form inside a `MyModal` popup on click of any group card.

#### [MODIFY] [AddTransaction.jsx](file:///Users/jayanthbharadwajm/development/jmoney/src/components/Views/AddTransaction.jsx)
* Add a new drop-down select field for Group.
* Populated by groups fetched from local store.
* Submit `group_id` inside payload to `addTransaction`.

#### [MODIFY] [SingleTransaction.jsx](file:///Users/jayanthbharadwajm/development/jmoney/src/components/Views/SingleTransaction.jsx)
* Add a Group dropdown selection in edit mode.
* Allow users to change the associated group.
* Submit the modified `group_id` field inside payload to `updateTransaction`.

#### [NEW] [SummaryByGroup.jsx](file:///Users/jayanthbharadwajm/development/jmoney/src/components/Views/SummaryByGroup.jsx)
Create a new report view component showing transaction statistics grouped by Group:
* Computes totals and percentages of expenses/incomes mapped to groups.
* Standard monthly/yearly filtering.
* Clickable groups to view itemized group transactions list.

#### [MODIFY] [Reports.js](file:///Users/jayanthbharadwajm/development/jmoney/src/pages/Reports/Reports.js)
* Register "Transactions By Group" in the reports list metadata block.
* Render `<SummaryByGroup />` in the `switch(viewMode)` router block.

---

## Verification Plan

### Automated Tests
Currently, `utils.test.js` exists. Verify and write regression tests for local database updates if applicable.

### Manual Verification
1. Open Database UI/Terminal and create `transaction_groups` table and migration actions.
2. Verify UI updates on Settings Page: Add three groups, delete one. Check IndexedDB storage (`transaction_groups`) via Chrome DevTools Application tab.
3. Open Add Transaction panel: Verify Group dropdown contains the groups. Save a transaction. Verify local IndexedDB transaction object now contains `group_id` and `group_name`.
4. Open Single Transaction details page: Verify you can edit/clear the group assignment.
5. Access the Reports tab: Select "Transactions By Group" report, verify totals correctly calculate across dates and group percentages are displayed.
