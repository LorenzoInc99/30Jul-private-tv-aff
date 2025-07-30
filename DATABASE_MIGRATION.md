# Database Migration Guide

This document explains the migration from the old database schema to the new one while maintaining all frontend functionality.

## Overview

The migration uses a **database adapter pattern** that maps the new database schema to the expected frontend data structure. This approach allows us to:

- ✅ Maintain all existing frontend functionality
- ✅ Keep the same user experience
- ✅ Avoid major code changes
- ✅ Easily switch between database schemas if needed

## Database Schema Changes

### Old Schema → New Schema

| Old Table | New Table | Key Changes |
|-----------|-----------|-------------|
| `Events` | `fixtures` | `start_time` → `starting_at`, `competition_id` → `league_id` |
| `Competitions` | `leagues` | No major changes |
| `Teams` | `teams_new` | No major changes |
| `Event_Broadcasters` | `fixturetvstations` | Junction table with country_id |
| `Broadcasters` | `tvstations` | `logo_url` → `image_path` |
| `Odds` | `odds` | Different structure with `market_id` and `label` |
| `Operators` | `bookmakers` | `affiliate_url` → `url` |

### Key Differences

1. **Match Status**: Old schema used string status, new schema uses `state_id` (integer)
2. **Odds Structure**: New schema groups odds by `market_id` with `label` field
3. **TV Stations**: New schema includes country-specific broadcasting
4. **Timestamps**: `starting_at` instead of `start_time`

## Migration Components

### 1. Database Adapter (`src/lib/database-adapter.ts`)

The adapter provides functions that transform the new schema to match the expected frontend format:

- `getMatchesForDate()` - Fetches matches for a specific date
- `getMatchById()` - Fetches a single match by ID
- `getAllCompetitions()` - Fetches all competitions/leagues
- `getCompetitionDetails()` - Fetches competition with all matches

### 2. Database Configuration (`src/lib/database-config.ts`)

Configuration file containing:

- Status mappings (`state_id` ↔ status strings)
- Table names and relationships
- Data transformation helpers
- Default values

### 3. Updated Components

All components now use the adapter instead of direct database queries:

- `MatchSchedule.tsx` - Uses `getMatchesForDate()`
- `api/match/[matchId]/route.ts` - Uses `getMatchById()`
- `competitions/page.tsx` - Uses `getAllCompetitions()`
- `competition/[competitionSlug]/page.tsx` - Uses `getCompetitionDetails()`

## Status Mapping

The new database uses `state_id` integers instead of status strings. The mapping is:

```typescript
const MATCH_STATUS_MAP = {
  1: 'Scheduled',
  2: 'Live', 
  3: 'Finished',
  4: 'Postponed',
  5: 'Cancelled',
  6: 'Suspended',
  7: 'Abandoned'
};
```

**Important**: You may need to adjust these mappings based on your actual `state_id` values in the new database.

## Odds Transformation

The new odds structure is different:

### Old Structure
```typescript
{
  id: number,
  home_win: number,
  draw: number, 
  away_win: number,
  Operators: { name, affiliate_url }
}
```

### New Structure
```typescript
{
  id: number,
  fixture_id: number,
  bookmaker_id: number,
  market_id: number,
  label: string, // '1', 'X', '2'
  value: number
}
```

The adapter groups odds by `market_id` and transforms them to the expected format.

## Usage

### Basic Usage

```typescript
import { getMatchesForDate, getMatchById } from '@/lib/database-adapter';

// Get matches for today
const matches = await getMatchesForDate(new Date());

// Get specific match
const match = await getMatchById('123');
```

### Error Handling

All adapter functions throw errors that should be caught:

```typescript
try {
  const matches = await getMatchesForDate(date);
  // Handle success
} catch (error) {
  console.error('Error fetching matches:', error);
  // Handle error
}
```

## Configuration

### Adjusting Status Mappings

If your `state_id` values are different, update `src/lib/database-config.ts`:

```typescript
export const MATCH_STATUS_MAP: { [key: number]: string } = {
  // Update these values based on your actual state_id values
  1: 'Scheduled',
  2: 'Live',
  // ... etc
};
```

### Custom Transformations

You can add custom transformation functions in `database-config.ts`:

```typescript
export function customTransform(data: any) {
  // Your custom transformation logic
  return transformedData;
}
```

## Testing the Migration

1. **Update your Supabase connection** to point to the new database
2. **Test the main pages**:
   - Home page (match schedule)
   - Competition pages
   - Match detail pages
3. **Verify data transformation** by checking browser console
4. **Test error handling** by temporarily breaking the connection

## Troubleshooting

### Common Issues

1. **Status not displaying correctly**
   - Check the `MATCH_STATUS_MAP` in `database-config.ts`
   - Verify your `state_id` values match the mapping

2. **Odds not showing**
   - Check the `transformOdds` function
   - Verify the `label` values in your odds data

3. **TV stations not appearing**
   - Check the `fixturetvstations` junction table
   - Verify the foreign key relationships

4. **Teams not loading**
   - Check the foreign key constraints in `fixtures` table
   - Verify team IDs exist in `teams_new` table

### Debug Mode

Add debug logging to the adapter functions:

```typescript
export async function getMatchesForDate(date: Date, supabase = supabaseBrowser) {
  console.log('Fetching matches for date:', date);
  // ... rest of function
  console.log('Transformed matches:', transformedMatches);
  return transformedMatches;
}
```

## Rollback Plan

If you need to rollback to the old schema:

1. **Revert the import changes** in components
2. **Remove the adapter files** (`database-adapter.ts`, `database-config.ts`)
3. **Restore direct Supabase queries** in components
4. **Update connection** to point back to old database

## Performance Considerations

- The adapter adds a small overhead for data transformation
- Consider caching transformed data if performance becomes an issue
- Monitor query performance with the new schema

## Future Enhancements

- Add caching layer for frequently accessed data
- Implement real-time updates using Supabase subscriptions
- Add data validation and sanitization
- Create migration scripts for data transformation 