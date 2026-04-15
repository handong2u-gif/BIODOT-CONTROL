

# Fix Build Errors

## Problem
The auto-generated `types.ts` has empty table/function definitions (`[_ in never]: never`), so the typed Supabase client rejects all `.from()` and `.rpc()` calls with `never` type errors. The chatbot file itself is already correct — the errors are in three other files plus a missing import.

## Root Cause
The Lovable Cloud database schema is not reflected in `src/integrations/supabase/types.ts`. Since we cannot edit that file manually, all Supabase calls need `as any` casts to bypass the empty type definitions.

## Changes

### 1. Fix `src/pages/Clients.tsx`
- Add missing `useEffect` import (line 1: add `useEffect` to the React import)
- Add missing `supabase` import
- Cast `supabase` as `any` on the `.from('clients')` call (line 42-43)

### 2. Fix `src/components/products/ProductImageManager.tsx`
- Cast `supabase` as `any` on `.from(tableName)` and `.update(...)` calls (lines 55-58)

### 3. Fix `src/pages/Products.tsx`
- Cast `supabase.rpc(...)` as `(supabase as any).rpc(...)` on line 202

These are minimal changes — just adding type casts and the missing import — to unblock the build while the types file remains empty.

