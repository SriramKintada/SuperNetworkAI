# SuperNetworkAI - API Reference

Complete documentation for all Edge Functions and database operations.

---

## 🔐 Authentication

All endpoints (except public search) require authentication via JWT token:

```bash
Authorization: Bearer YOUR_JWT_TOKEN
```

Get token after login:
```typescript
const { data: { session } } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})
const token = session.access_token
```

---

## 👤 Profile Management

### GET /get-profile

Get user profile by user_id.

**Endpoint:** `GET /functions/v1/get-profile?user_id={userId}`

**Query Parameters:**
- `user_id` (required): UUID of user to fetch

**Response:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "name": "John Doe",
  "headline": "AI Engineer at Stripe",
  "bio": "Building RAG systems...",
  "intent_text": "Looking for technical cofounder...",
  "skills": ["Python", "RAG", "LLMs"],
  "location": "San Francisco, CA",
  "visibility": "community_only",
  "created_at": "2025-01-15T10:30:00Z"
}
```

**Example:**
```typescript
const response = await fetch(
  `${SUPABASE_URL}/functions/v1/get-profile?user_id=${userId}`,
  {
    headers: { Authorization: `Bearer ${token}` }
  }
)
const profile = await response.json()
```

---

### PUT /update-profile

Update current user's profile.

**Endpoint:** `PUT /functions/v1/update-profile`

**Request Body:**
```json
{
  "name": "John Doe",
  "headline": "Senior AI Engineer",
  "bio": "Specializing in RAG systems...",
  "intent_text": "Looking for AI cofounder to build SaaS",
  "skills": ["Python", "RAG", "LLMs", "Vector DBs"],
  "location": "San Francisco, CA",
  "visibility": "community_only"
}
```

**Response:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "name": "John Doe",
  "updated_at": "2025-01-15T11:00:00Z",
  ...
}
```

**Validation Rules:**
- `name`: Required, max 100 chars
- `intent_text`: Required, min 20 chars
- `bio`: Max 500 chars
- `visibility`: One of: `public`, `private`, `community_only`

---

## 🔍 Search & Matching

### POST /search-profiles

Semantic search for profiles using vector embeddings.

**Endpoint:** `POST /functions/v1/search-profiles`

**Request Body:**
```json
{
  "query": "technical cofounder with RAG systems experience",
  "limit": 20
}
```

**Response:**
```json
{
  "results": [
    {
      "id": "uuid",
      "name": "Jane Smith",
      "headline": "AI Engineer",
      "bio": "Built RAG systems at scale...",
      "intent_text": "Looking to join early-stage startup",
      "skills": ["Python", "RAG", "pgvector"],
      "similarity": 0.87
    }
  ]
}
```

**How it works:**
1. Generates embedding for query using OpenAI text-embedding-3-small
2. Performs vector similarity search using pgvector
3. Returns top matches above threshold (0.5)

**Performance:** ~1-2 seconds for 1000+ profiles

---

### POST /match-ranking

Re-rank search results using GPT-4o Mini for intelligent matching.

**Endpoint:** `POST /functions/v1/match-ranking`

**Request Body:**
```json
{
  "query": "technical cofounder",
  "matches": [
    {
      "id": "uuid",
      "name": "Jane Smith",
      "headline": "AI Engineer",
      "intent_text": "Looking for cofounder",
      "skills": ["Python", "RAG"]
    }
  ]
}
```

**Response:**
```json
{
  "results": [
    {
      "profile": { ... },
      "match_score": 0.92,
      "explanation": "Strong technical background in AI/ML with cofounder intent. Skills align perfectly with RAG systems."
    }
  ]
}
```

**Cost:** ~$0.02 per 20 profiles (using GPT-4o Mini)

**Caching:** Results cached for 24h in `match_scores` table

---

## 🔗 Connections

### POST /connections

Request a connection with another user.

**Endpoint:** `POST /functions/v1/connections`

**Request Body:**
```json
{
  "target_user_id": "uuid",
  "message": "Hi! I'd love to connect and discuss potential collaboration..."
}
```

**Response:**
```json
{
  "id": "uuid",
  "user_id_1": "uuid",
  "user_id_2": "uuid",
  "status": "pending",
  "message": "Hi! I'd love to connect...",
  "initiated_by": "uuid",
  "created_at": "2025-01-15T12:00:00Z"
}
```

---

### GET /connections

Get all connections for current user.

**Endpoint:** `GET /functions/v1/connections`

**Response:**
```json
{
  "connections": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "name": "Jane Smith",
      "headline": "AI Engineer",
      "photo_url": "https://...",
      "status": "accepted",
      "message": "Hi! I'd love to connect...",
      "created_at": "2025-01-15T12:00:00Z"
    }
  ]
}
```

**Status values:**
- `pending`: Request sent, awaiting response
- `accepted`: Connection accepted
- `declined`: Connection declined

---

### PUT /connections?id={connectionId}

Accept or decline a connection request.

**Endpoint:** `PUT /functions/v1/connections?id={connectionId}`

**Request Body:**
```json
{
  "action": "accept" // or "decline"
}
```

**Response:**
```json
{
  "id": "uuid",
  "status": "accepted",
  "accepted_at": "2025-01-15T13:00:00Z"
}
```

---

## 🏘️ Communities

### GET /communities

List all communities.

**Endpoint:** `GET /functions/v1/communities`

**Response:**
```json
{
  "communities": [
    {
      "id": "uuid",
      "name": "AI Builders",
      "description": "Community for AI entrepreneurs...",
      "type": "public",
      "logo_url": "https://...",
      "member_count": 127,
      "created_at": "2025-01-01T00:00:00Z"
    }
  ]
}
```

---

### GET /communities/:id

Get community details with members.

**Endpoint:** `GET /functions/v1/communities/{communityId}`

**Response:**
```json
{
  "id": "uuid",
  "name": "AI Builders",
  "description": "Community for AI entrepreneurs...",
  "type": "public",
  "member_count": 127,
  "community_members": [
    {
      "user_id": "uuid",
      "role": "admin",
      "joined_at": "2025-01-01T00:00:00Z"
    }
  ]
}
```

---

### POST /communities

Create a new community.

**Endpoint:** `POST /functions/v1/communities`

**Request Body:**
```json
{
  "name": "AI Builders",
  "description": "Community for AI entrepreneurs building with LLMs",
  "type": "public",
  "logo_url": "https://..."
}
```

**Response:**
```json
{
  "community": {
    "id": "uuid",
    "name": "AI Builders",
    "created_by": "uuid",
    ...
  },
  "invite_code": "ABC12345"
}
```

**Note:** Creator is automatically added as admin.

---

### POST /communities/:id/join?action=join

Join community with invite code.

**Endpoint:** `POST /functions/v1/communities/{communityId}/join?action=join`

**Request Body:**
```json
{
  "invite_code": "ABC12345"
}
```

**Response:**
```json
{
  "success": true,
  "member": {
    "id": "uuid",
    "community_id": "uuid",
    "user_id": "uuid",
    "role": "member"
  }
}
```

**Errors:**
- Invalid invite code
- Invite code expired
- Max uses reached
- Already a member

---

### DELETE /communities/:id

Leave a community.

**Endpoint:** `DELETE /functions/v1/communities/{communityId}`

**Response:**
```json
{
  "success": true
}
```

---

## 💬 Messages

### POST /messages

Send a message to another user.

**Endpoint:** `POST /functions/v1/messages`

**Request Body:**
```json
{
  "recipient_id": "uuid",
  "content": "Hey! Just saw your profile..."
}
```

**Response:**
```json
{
  "id": "uuid",
  "sender_id": "uuid",
  "recipient_id": "uuid",
  "content": "Hey! Just saw your profile...",
  "created_at": "2025-01-15T14:00:00Z",
  "read_at": null
}
```

**Side Effects:**
- Creates notification for recipient
- Triggers real-time update via Supabase Realtime

---

### GET /messages?user_id={userId}

Get conversation with another user.

**Endpoint:** `GET /functions/v1/messages?user_id={userId}`

**Response:**
```json
{
  "messages": [
    {
      "id": "uuid",
      "sender_id": "uuid",
      "recipient_id": "uuid",
      "content": "Hey! Just saw your profile...",
      "created_at": "2025-01-15T14:00:00Z",
      "read_at": "2025-01-15T14:05:00Z"
    }
  ]
}
```

**Ordering:** Chronological (oldest first)

---

## 🤖 Embeddings

### POST /generate-embedding

Generate vector embedding for a profile.

**Endpoint:** `POST /functions/v1/generate-embedding`

**Request Body:**
```json
{
  "profileId": "uuid"
}
```

**Response:**
```json
{
  "success": true
}
```

**How it works:**
1. Fetches profile data (name, headline, bio, intent, skills)
2. Concatenates into embedding text
3. Calls OpenAI API with text-embedding-3-small
4. Stores 1536-dimension vector in `profile_embeddings` table

**Cost:** ~$0.0001 per profile

**When to call:**
- After profile creation
- After profile update
- When regenerating embeddings

**Note:** This is called automatically via database trigger on profile updates.

---

## 🔄 Real-time Subscriptions

SuperNetworkAI uses Supabase Realtime for live updates.

### Subscribe to Messages

```typescript
import { supabase } from '@/lib/realtime'

const channel = supabase
  .channel('messages')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `recipient_id=eq.${userId}`,
    },
    (payload) => {
      console.log('New message:', payload.new)
      // Update UI
    }
  )
  .subscribe()

// Cleanup
channel.unsubscribe()
```

### Subscribe to Connection Requests

```typescript
const channel = supabase
  .channel('connections')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'connections',
      filter: `user_id_2=eq.${userId}`,
    },
    (payload) => {
      console.log('New connection request:', payload.new)
      // Show notification
    }
  )
  .subscribe()
```

### Subscribe to Notifications

```typescript
const channel = supabase
  .channel('notifications')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${userId}`,
    },
    (payload) => {
      console.log('New notification:', payload.new)
      // Show toast
    }
  )
  .subscribe()
```

---

## 📊 Database Functions

### match_profiles

Vector similarity search function.

**SQL Function:**
```sql
SELECT * FROM match_profiles(
  query_embedding := '[0.1, 0.2, ...]'::vector(1536),
  match_threshold := 0.5,
  match_count := 20
);
```

**Returns:** Profiles with similarity > threshold, sorted by similarity

---

### get_user_connections

Get all connections for a user.

**SQL Function:**
```sql
SELECT * FROM get_user_connections(
  target_user_id := 'uuid'
);
```

**Returns:** All connections (pending, accepted, declined) with profile data

---

### get_user_conversations

Get all conversations with last message.

**SQL Function:**
```sql
SELECT * FROM get_user_conversations(
  target_user_id := 'uuid'
);
```

**Returns:** List of conversations with unread counts

---

## ⚠️ Error Handling

All endpoints return errors in this format:

```json
{
  "error": "Error message here"
}
```

**Common HTTP Status Codes:**
- `200`: Success
- `400`: Bad request (validation error)
- `401`: Unauthorized (missing/invalid token)
- `403`: Forbidden (RLS policy blocked)
- `404`: Not found
- `500`: Internal server error

**Example Error Response:**
```json
{
  "error": "Profile not found"
}
```

---

## 🔒 Row-Level Security (RLS)

All tables use RLS to enforce privacy:

### Profiles
- Users can read their own profile
- Users can update their own profile
- Public profiles visible to all
- Community-only profiles visible to community members
- Private profiles only visible to owner

### Messages
- Users can read messages where they are sender or recipient
- Users can only send messages to connected users

### Connections
- Users can read connections where they are participant
- Users can update connections where they are participant

### Communities
- All users can view public communities
- Only members can view private community details
- Only admins can update community settings

---

## 📈 Rate Limits

**Supabase Edge Functions:**
- 1000 requests/minute per IP
- 10 concurrent requests per IP

**OpenAI API:**
- text-embedding-3-small: 3000 requests/minute
- gpt-4o-mini: 500 requests/minute

**Best Practices:**
- Implement exponential backoff for retries
- Cache embeddings (don't regenerate unnecessarily)
- Cache match scores (24h TTL)
- Batch operations when possible

---

## 🎯 Performance Tips

### Search Optimization
```typescript
// Use pagination
const { results } = await searchProfiles(query, { limit: 20, offset: 0 })

// Cache results client-side
const cachedResults = localStorage.getItem(`search:${query}`)
```

### Embedding Generation
```typescript
// Batch process (max 10 at a time)
const batches = chunk(profiles, 10)
for (const batch of batches) {
  await Promise.all(batch.map(p => generateEmbedding(p.id)))
  await sleep(1000) // Rate limit
}
```

### Real-time Subscriptions
```typescript
// Unsubscribe when component unmounts
useEffect(() => {
  const channel = subscribeToMessages(userId, handleMessage)
  return () => channel.unsubscribe()
}, [userId])
```

---

## 🧪 Testing

### cURL Examples

**Search:**
```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/search-profiles \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "AI engineer", "limit": 10}'
```

**Create Connection:**
```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/connections \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"target_user_id": "uuid", "message": "Hi!"}'
```

**Send Message:**
```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/messages \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"recipient_id": "uuid", "content": "Hello!"}'
```

---

## 📚 Additional Resources

- **TDD:** `important_reference_files/SuperNetworkAI_TDD_Complete.md`
- **Deployment Guide:** `DEPLOYMENT_GUIDE.md`
- **Debugging Playbook:** `important_reference_files/The_AI_Agent_Debugging_Playbook.md`
- **Supabase Docs:** [supabase.com/docs](https://supabase.com/docs)

---

**Last Updated:** 2025-10-26
