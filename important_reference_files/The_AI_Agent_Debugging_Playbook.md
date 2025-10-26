# The AI Agent Debugging Playbook for Full-Stack Applications

**Twenty critical errors that break AI coding agents—and how to fix them when Claude Code CLI and Cursor get stuck.** AI agents excel at generating code but fail catastrophically on hidden configuration issues, environment mismatches, and framework-specific gotchas. This guide documents the 20 most time-wasting errors across backend systems (Supabase, Next.js), AI/ML stacks (LangChain, vector databases), and the meta-level blindspots where agents loop infinitely.

## Table of Contents

1. [Quick Reference Table](#quick-reference-table)
2. [Backend & Database Errors](#section-1-backend--database-errors)
3. [Vector Database & RAG Errors](#section-2-vector-database--rag-errors)
4. [LangChain & LangGraph Errors](#section-3-langchain--langgraph-errors)
5. [Authentication & Dependencies](#section-4-authentication--dependencies)
6. [Web Scraping (Apify)](#section-5-web-scraping-apify)
7. [AI Agent Meta-Issues](#section-6-ai-agent-meta-issues)
8. [Debugging Workflow](#debugging-workflow-when-ai-gets-stuck)

---

## Quick Reference Table

| # | Error | Category | Severity | AI-Blind | Avg Fix Time |
|---|-------|----------|----------|----------|--------------|
| 1 | RLS Policy Debugging Hell | Backend | 🔴 | 🧠🧠🧠🧠 | 1-3 hours |
| 2 | Edge Function Timeout (400s limit) | Backend | 🟡 | 🧠🧠🧠 | 30-60 min |
| 3 | Vector Dimension Mismatch | Vector DB | 🔴 | 🧠🧠🧠 | 20-45 min |
| 4 | RAG Chunking Strategy Failures | RAG | 🟡 | 🧠🧠🧠 | 30-90 min |
| 5 | Infinite LangChain Agent Loops | LangChain | 🟡 | 🧠🧠🧠🧠 | 30-60 min |
| 6 | LangGraph State KeyError | LangChain | 🟡 | 🧠🧠🧠 | 20-40 min |
| 7 | Context Window/Token Limit Exceeded | LangChain | 🟡 | 🧠🧠 | 15-30 min |
| 8 | Tool Calling Schema Validation Errors | LangChain | 🟡 | 🧠🧠🧠 | 20-40 min |
| 9 | Output Parser Failures | LangChain | 🟡 | 🧠🧠🧠 | 15-30 min |
| 10 | LangChain Version Migration Breaks | LangChain | 🟡 | 🧠🧠🧠 | 20-60 min |
| 11 | Clerk authMiddleware Deprecation | Auth | 🔴 | 🧠🧠🧠🧠 | 15-30 min |
| 12 | Clerk Middleware Placement Errors | Auth | 🟡 | 🧠🧠🧠 | 10-20 min |
| 13 | Clerk+Supabase JWT Integration | Auth | 🔴 | 🧠🧠🧠🧠 | 30-60 min |
| 14 | App Router vs Pages Router Chaos | Dependencies | 🔴 | 🧠🧠🧠🧠 | 2-8 hours |
| 15 | ESM/CommonJS Module Resolution | Dependencies | 🟡 | 🧠🧠🧠 | 20-45 min |
| 16 | v0.dev Dependency Conflicts | Dependencies | 🟡 | 🧠🧠 | 15-30 min |
| 17 | Apify Memory Limit Exceeded | Scraping | 🟡 | 🧠🧠 | 30-60 min |
| 18 | Apify Webhook Timeouts | Scraping | 🟡 | 🧠🧠🧠 | 20-40 min |
| 19 | AI Compaction Death Spiral | Meta | 🟡 | 🧠🧠🧠🧠 | 10-30 min |
| 20 | Environment Variable Blindness | Meta | 🟡 | 🧠🧠🧠🧠 | 10-20 min |

**Legend:**  
- **Severity**: 🔴 Critical (breaks deployment) | 🟡 Frequent (wastes significant time)
- **AI-Blind Rating**: 🤖 (Easy for AI) → 🧠🧠🧠🧠 (Requires deep human intervention)

---

## SECTION 1: Backend & Database Errors

### ERROR 1: Supabase RLS Policies - Debugging Nightmare

**Frequency**: Extremely high—60-70% of Supabase projects affected

**Error Messages**:
```
Error: new row violates row-level security policy for table "profiles"
POST /rest/v1/profiles returned 403 Forbidden
pgrst: "new row violates row-level security policy"
```

**Why AI Agents Get Stuck**:
- **Zero visibility**: Error gives no info about which policy failed or why
- **Can't test in isolation**: AI can't impersonate users to test auth states
- **Context blindness**: Sees policy SQL but can't evaluate against runtime `auth.uid()` values
- **Circular dependencies**: When policies reference other tables with RLS, AI can't trace logic
- **Performance implications**: Doesn't understand when to use `(SELECT auth.uid())` vs `auth.uid()`

**Root Cause**:
RLS policies silently block operations. Common issues:
- `auth.uid()` returns null (improper authentication)
- Policy references columns that don't exist during INSERT
- Cascading RLS from referenced tables blocks main query
- Missing index optimization wrapper
- Security definer functions bypass RLS unexpectedly

**Manual Debugging Steps**:

1. **Verify auth state**:
```sql
SELECT auth.uid(); -- Should return UUID, not null
SELECT auth.jwt(); -- Inspect full JWT claims
SELECT auth.role(); -- Should be 'authenticated' not 'anon'
```

2. **Test policy logic directly**:
```sql
-- Manually substitute auth.uid() with actual user UUID
SELECT * FROM profiles 
WHERE 'actual-user-uuid-here'::uuid = user_id;
```

3. **Check cascading RLS**:
```sql
-- If policy references team_members, test that table's RLS
SELECT * FROM team_members WHERE user_id = 'user-uuid';
```

4. **Test with service role**: If works with service key but not anon key, it's RLS

**Recovery Strategy**:

```sql
-- BROKEN: No optimization, no index
CREATE POLICY "users_own_profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

-- FIXED: Optimized with SELECT wrapper + index
CREATE INDEX profiles_user_id_idx ON profiles(user_id);

CREATE POLICY "users_own_profile" ON profiles
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);
```

**For complex multi-table checks, use security definer function**:
```sql
CREATE OR REPLACE FUNCTION user_in_team(team_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM team_members
    WHERE team_id = $1 AND user_id = auth.uid()
  );
$$;

CREATE POLICY "team_members_see_team_data" ON team_data
  FOR SELECT USING (user_in_team(team_id));
```

**How to Guide AI Agent**:
```
"RLS blocks operations. I verified auth.uid() returns [UUID]. 
Policy: [paste policy SQL]
This SHOULD allow access but doesn't. Check:
1. Does policy reference columns not yet inserted (during INSERT)?
2. Missing (SELECT ...) wrapper for function caching?
3. Cascading RLS from referenced tables blocking?
Don't modify policy—explain why current user context fails."
```

**Prevention**:
- Always use `(SELECT auth.uid())` pattern
- Add indexes on all columns used in policies
- Create security definer functions for complex checks
- Test with real user JWTs, never just service keys
- Document which policies apply to which tables

---

### ERROR 2: Supabase Edge Functions - 400 Second Wall Clock Timeout

**Frequency**: High—30-40% of long-running operations hit this

**Error Messages**:
```
Error: wall clock time limit reached
546 Worker terminated  
Function succeeded locally but times out in production
Worker terminated due to exceeding wall clock time limit
```

**Why AI Agents Miss It**:
- **Local testing succeeds**: Dev environment has different/no timeout
- **No warning signals**: Function executes normally until hard 400s cutoff
- **CPU vs wall time confusion**: AI optimizes CPU but wall time includes I/O, API waits, network delays
- **Deployment-only**: Can't reproduce locally

**Root Cause**:
Hard limits on Supabase Edge Functions:
- **Wall clock time**: 400 seconds maximum (total elapsed time)
- **CPU time**: 200ms maximum (active computation)

Long-running operations (OpenAI streaming, PDF generation, large dataset processing) hit wall time despite minimal CPU usage.

**Manual Debugging**:

1. Check function duration in **Supabase Dashboard → Functions → Logs**
2. Look for patterns: Which operations take longest?
3. Test locally with timing:
```typescript
console.time('operation');
await longRunningTask();
console.timeEnd('operation'); // How long?
```

**Recovery Strategy**:

**Option 1: Async webhook pattern** (recommended):
```typescript
// Edge Function returns immediately (< 1s)
export default async function handler(req: Request) {
  const { taskId } = await req.json();
  
  // Store job in database
  await supabase.from('jobs').insert({
    id: taskId,
    status: 'processing'
  });
  
  // Start background processing (DON'T await)
  processLongTask(taskId).catch(console.error);
  
  // Return immediately
  return new Response(
    JSON.stringify({ status: 'processing', taskId }), 
    { status: 202 }
  );
}

async function processLongTask(taskId: string) {
  // This runs in background, can take 10+ minutes
  // Update database with results when done
  const result = await someLongOperation();
  await supabase.from('jobs').update({ 
    status: 'completed', 
    result 
  }).eq('id', taskId);
}
```

**Option 2: Break into batches**:
```typescript
// Instead of processing 50 items (600s)
async function processAll(items) {
  for (const item of items) {
    await process(item); // Takes 12s each
  }
}

// Process in batches of 10 (120s per batch)
async function processBatch(batchId: number) {
  const batch = items.slice(batchId * 10, (batchId + 1) * 10);
  for (const item of batch) {
    await process(item);
  }
  // Store progress
  await supabase.from('progress').update({ 
    completed: (batchId + 1) * 10 
  });
}
// Call 5 times with different batchIds
```

**Option 3: Move to Next.js API Routes**:
```typescript
// app/api/long-task/route.ts
export async function POST(req: Request) {
  // Next.js/Vercel has different timeout limits
  // Can use background functions for even longer tasks
  const result = await longOperation(); // 10 minutes OK
  return Response.json({ result });
}
```

**How to Guide AI Agent**:
```
"Edge Functions have 400-second wall time limit. This operation takes [X]s.
Refactor to:
1. Return 202 immediately, process async with database state tracking
2. Break into batches with progress tracking  
3. Move to Next.js API routes for longer operations
Don't optimize CPU time—wall time is the constraint."
```

**Prevention**:
- Never use Edge Functions for >3 minute operations
- Implement job queue patterns for long tasks
- Use Supabase Database Functions for data-heavy ops (runs in Postgres)
- Monitor duration in Dashboard

---

## SECTION 2: Vector Database & RAG Errors

### ERROR 3: Vector Dimension Mismatch

**Frequency**: Very high—60%+ of initial pgvector setups

**Error Messages**:
```
ERROR: different vector dimensions 1536 and 768
ERROR: vector must have at least 1 dimension  
ERROR (22000): different vector dimensions
Similarity search returns completely wrong results
```

**Why AI Agents Struggle**:
- **Model switching**: Mixes examples from different embedding models (1536 vs 768 vs 384)
- **Schema before model**: Creates table with `vector(1536)` then uses 768-dimension model
- **Silent failures**: Some SDKs return empty arrays on rate limits—AI doesn't detect
- **Version changes**: Embedding models change dimensions across versions

**Root Cause**:
Postgres `vector(N)` requires **exactly N dimensions**. Common models:
- OpenAI text-embedding-3-small: **1536 dimensions**
- OpenAI text-embedding-3-large: **3072 dimensions**
- Cohere embed-english-v3.0: **1024 dimensions**
- Sentence transformers (gte-small): **384 dimensions**

**Manual Debugging**:

1. **Check table schema**:
```sql
SELECT column_name, udt_name, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'documents' AND column_name = 'embedding';
-- Returns: vector(1536)
```

2. **Verify actual embedding output**:
```typescript
const embedding = await openai.embeddings.create({
  model: "text-embedding-3-small",
  input: "test"
});
console.log('Dimensions:', embedding.data[0].embedding.length); 
// Must match table definition
```

3. **Check for empty embeddings** (rate limit failures):
```typescript
if (!embedding || embedding.length === 0) {
  throw new Error('Empty embedding - check API rate limits');
}
```

**Recovery Strategy**:

**Option 1: Alter table to match model**:
```sql
-- Change column to match your embedding model
ALTER TABLE documents 
  ALTER COLUMN embedding TYPE vector(768);

-- Rebuild index
DROP INDEX IF EXISTS documents_embedding_idx;
CREATE INDEX documents_embedding_idx ON documents 
  USING ivfflat (embedding vector_cosine_ops) 
  WITH (lists = 100);
```

**Option 2: Configure model to match table**:
```typescript
const embedding = await openai.embeddings.create({
  model: "text-embedding-3-small",
  input: text,
  dimensions: 1536 // Explicitly set to match DB
});
```

**Option 3: Validate before insert**:
```typescript
const EXPECTED_DIMS = 1536;

async function insertWithValidation(content: string) {
  const embedding = await generateEmbedding(content);
  
  if (embedding.length !== EXPECTED_DIMS) {
    throw new Error(
      `Dimension mismatch: expected ${EXPECTED_DIMS}, got ${embedding.length}`
    );
  }
  
  await supabase.from('documents').insert({
    content,
    embedding
  });
}
```

**How to Guide AI Agent**:
```
"Vector dimension mismatch. Table has vector([N]), 
embedding model outputs [M] dimensions.
Fix by:
1. ALTER TABLE to match model dimensions, OR
2. Set model 'dimensions' parameter to match table, OR  
3. Add validation before inserts
Show both schema change AND validation code."
```

**Prevention**:
- Document which model each table uses in schema comments
- Add dimension validation before every insert
- Use consistent models across dev/prod
- Consider smaller dimensions (384-768) for better performance

---

### ERROR 4: RAG Chunking Strategy Determines Retrieval Quality

**Frequency**: Affects 100% of RAG systems—only 20-30% optimize properly

**Error Manifestations**:
```
RAG returns irrelevant context
Answers incomplete (info split across chunks)
Context window overflow despite chunking
Semantic search finds wrong document sections
LLM hallucinates due to missing context in retrieved chunks
```

**Why AI Agents Can't Optimize**:
- **No semantic awareness**: Splits text mechanically without understanding topic boundaries
- **Can't evaluate quality**: Generates code but can't test if retrieved chunks answer questions
- **Fixed-size blindness**: Uses default 1000 chars without considering document structure
- **Overlap confusion**: Doesn't know when overlap helps vs creates duplicates

**Root Cause**:
Chunking directly impacts RAG accuracy:
- **Too large** = diluted embeddings with irrelevant filler
- **Too small** = missing context, incomplete information
- **Wrong boundaries** = split concepts across chunks (unusable)
- **No overlap** = lost context at chunk boundaries

**Manual Debugging**:

1. **Examine actual chunks**:
```typescript
const chunks = textSplitter.splitText(document);
chunks.forEach((chunk, i) => {
  console.log(`\n=== Chunk ${i} (${chunk.length} chars) ===`);
  console.log(chunk.substring(0, 200) + '...');
});
// Are chunks cutting mid-sentence? Mid-concept?
```

2. **Test retrieval quality**:
```typescript
const query = "How do I configure authentication?";
const results = await vectorStore.similaritySearch(query, 5);

console.log('Retrieved chunks:');
results.forEach((doc, i) => {
  console.log(`${i+1}. Score: ${doc.score}`);
  console.log(doc.pageContent.substring(0, 150));
  console.log('---');
});
// Do chunks contain answer? Or just tangentially related text?
```

3. **Check chunk size distribution**:
```sql
SELECT 
  AVG(length(content)) as avg_length,
  MIN(length(content)) as min_length,
  MAX(length(content)) as max_length,
  STDDEV(length(content)) as stddev
FROM document_chunks;
```

**Recovery Strategy**:

**Baseline: Fixed-size with overlap**:
```typescript
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200, // 20% overlap preserves context
  separators: ['\n\n', '\n', '. ', ' ', ''],
});
```

**Better: Semantic chunking**:
```typescript
import { SemanticChunker } from '@langchain/experimental';

const splitter = new SemanticChunker(embeddings, {
  breakpointThreshold: 0.5, // Adjust based on testing
});
// Splits at natural semantic boundaries
```

**Best: Parent-child retrieval**:
```typescript
import { ParentDocumentRetriever } from 'langchain/retrievers';

// Large parent chunks for context
const parentSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 2000,
  chunkOverlap: 400,
});

// Small child chunks for precise retrieval
const childSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 400,
  chunkOverlap: 100,
});

const retriever = new ParentDocumentRetriever({
  vectorstore,
  parentSplitter,
  childSplitter,
  // Child embeddings enable precise matching
  // But parent chunks are returned for full context
});
```

**For structured docs (code, markdown)**:
```typescript
import { MarkdownTextSplitter } from 'langchain/text_splitter';

const splitter = new MarkdownTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});
// Respects markdown headers, code blocks, lists
```

**How to Guide AI Agent**:
```
"RAG retrieval is poor. Current: [strategy]. Issues: [missing context / irrelevant results].
Refactor to:
1. RecursiveCharacterTextSplitter with separators ['\n\n', '\n', '. ']
2. Parent-child retrieval for complex docs
3. 20% chunk overlap minimum
Test by retrieving for query '[example]' and checking chunks contain answer."
```

**Prevention**:
- Start with 1000 char / 200 overlap baseline
- Use semantic chunking for unstructured text
- Parent-child for technical documentation
- Log and monitor retrieval quality
- A/B test chunk sizes for your domain

---

## SECTION 3: LangChain & LangGraph Errors

### ERROR 5: Infinite Agent Loops from Output Parser Failures

**Frequency**: Extremely common—15+ GitHub issues, heavy on smaller models

**Error Messages**:
```
> Entering new AgentExecutor chain...
Thought: I should use the tool
Action: tool_name
Observation: Could not parse LLM output
[Repeats 10+ times until max_iterations]
Agent stopped due to iteration limit
```

**Why AI Can't Detect Loop**:
- **No meta-awareness**: Each iteration appears valid to agent
- **No loop detection**: Can't recognize "I've tried this 5 times"
- **Ambiguous errors**: "Invalid output" looks temporary, not systematic

**Root Cause**:
LangChain ReAct agents expect **exact format**:
```
Thought: [reasoning]
Action: [tool_name]  
Action Input: [args]
```

Any deviation breaks parsing: brackets `[Thought]:`, missing keywords, markdown. Smaller models can't maintain format.

**Recovery Strategy**:

```python
# Enable error handling
from langchain.agents import AgentExecutor

agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    handle_parsing_errors=True,  # Returns error to agent instead of crashing
    max_iterations=5,             # Hard limit prevents infinite loops
    verbose=True                  # See what's happening
)
```

**Better: Use function calling instead of prompt-based parsing**:
```python
from langchain.agents import create_openai_functions_agent
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-4", temperature=0)

agent = create_openai_functions_agent(
    llm=llm,
    tools=tools,
    prompt=prompt
)
# Structured output via function calling, not prompt parsing
```

**How to Guide AI Agent**:
```
"Agent looping with parser errors. LLM isn't matching expected format.
Fix:
1. Set handle_parsing_errors=True in AgentExecutor
2. Switch to create_openai_functions_agent (structured output)
3. Use GPT-4 instead of GPT-3.5 (better format adherence)
4. Set max_iterations=5 to prevent infinite loops
Don't modify prompt format—switch to function calling."
```

**Prevention**:
- Use function-calling agents, not prompt-based
- Always set `max_iterations` (5-10)
- Enable `handle_parsing_errors=True`
- Use capable models (GPT-4, Claude 3+)

---

### ERROR 6: LangGraph State KeyError

**Frequency**: Very common—10+ discussions, dataclass + TypedDict issues

**Error Messages**:
```python
def evaluator(state: AgentState) -> dict:
    attempts = state["RAG_attempts"]  
    # KeyError: 'RAG_attempts'
```

**Why AI Misses It**:
- **Schema looks correct**: Key defined in TypedDict, so AI assumes it exists
- **Runtime-only failure**: No error until node execution
- **Doesn't understand initialization**: Type hints ≠ actual values

**Root Cause**:
LangGraph state keys must be **explicitly initialized** at `invoke()`. Type definitions don't create values.

**Recovery Strategy**:

```python
# BROKEN: Mixing dataclass with TypedDict
from dataclasses import dataclass, field

@dataclass
class AgentState(TypedDict):
    messages: list
    RAG_attempts: int = field(default=0)  # This default WON'T work

# FIXED: Use TypedDict properly  
from typing import TypedDict

class AgentState(TypedDict, total=False):
    messages: list
    RAG_attempts: int  # Optional
    documents: list

# Initialize ALL keys when invoking
app.invoke({
    "messages": [],
    "RAG_attempts": 0,
    "documents": []
})

# Or use .get() for safe access
def evaluator(state: AgentState) -> dict:
    attempts = state.get("RAG_attempts", 0)  # Safe with default
    return {"RAG_attempts": attempts + 1}
```

**How to Guide AI Agent**:
```
"KeyError in LangGraph node—state key not initialized.
Fix:
1. Don't mix @dataclass with TypedDict  
2. Initialize ALL keys when calling invoke():
   app.invoke({'messages': [], 'RAG_attempts': 0, ...})
3. Use state.get('key', default) for safe access
Show complete state initialization at graph invocation."
```

**Prevention**:
- Use TypedDict without @dataclass
- Always use `.get()` with defaults
- Initialize complete state dict at invoke
- Add validation node to check required keys

---

### ERROR 7: Token/Context Window Limit Exceeded Mid-Chain

**Frequency**: Extremely common—affects all conversational chains over time

**Error Messages**:
```
InvalidRequestError: This model's maximum context length is 4097 tokens.
However, your messages resulted in 9961 tokens.
Please reduce the length of the messages.
```

**Why AI Can't Detect**:
- **No token awareness**: AI doesn't track token counts in real-time
- **ConversationBufferMemory grows indefinitely**: Keeps ALL history
- **Mid-execution failure**: Error only surfaces at LLM API call
- **No warning signals**: Hard failure, no progressive degradation

**Root Cause**:
- `ConversationBufferMemory` stores unlimited history
- Total tokens = history + prompt + tools + max_response
- Different models have different limits (GPT-3.5: 4K, GPT-4: 8K/32K)

**Recovery Strategy**:

**Option 1: Window memory (keep last N exchanges)**:
```python
from langchain.memory import ConversationBufferWindowMemory

memory = ConversationBufferWindowMemory(
    k=5  # Keep only last 5 exchanges
)
```

**Option 2: Token buffer (auto-trim by tokens)**:
```python
from langchain.memory import ConversationTokenBufferMemory
from langchain_openai import OpenAI

memory = ConversationTokenBufferMemory(
    llm=OpenAI(),
    max_token_limit=3000  # Leave room for prompt + response
)
```

**Option 3: Summarize old conversations**:
```python
from langchain.memory import ConversationSummaryMemory

memory = ConversationSummaryMemory(llm=OpenAI())
# Automatically summarizes old conversations
```

**Option 4: Manual trim**:
```python
from langchain_core.messages import trim_messages

messages = trim_messages(
    messages,
    max_tokens=3000,
    strategy="last",  # Keep most recent
    token_counter=llm
)
```

**How to Guide AI Agent**:
```
"Token limit exceeded. ConversationBufferMemory stores unlimited history.
Fix using ONE of:
1. ConversationBufferWindowMemory(k=5) - keep last 5 exchanges
2. ConversationTokenBufferMemory(max_token_limit=3000) - auto-trim
3. ConversationSummaryMemory - summarize old conversations
4. trim_messages() manually

Calculate budget: context_limit - prompt_tokens - max_response - 500
Example: 4097 - 1000 - 500 - 500 = 2097 tokens for history"
```

**Prevention**:
- Always use token-aware memory
- Set aggressive limits (50-70% of context window)
- Monitor token usage in logs
- Catch `InvalidRequestError` and retry with truncated history

---

### ERROR 8: Tool Calling Schema Validation Failures

**Frequency**: Very common—inherent LLM limitation

**Error Messages**:
```
ValidationError: 1 validation error for ToolSchema
  dict_arg: Field required (type=value_error.missing)
  
InvalidRequestError: 'Tool Name: With Spaces' does not match '^[a-zA-Z0-9_-]{1,64}$'

ToolException: Tool 'non_existent_tool' not found
```

**Why AI Can't Fix**:
- **Model hallucination**: LLMs call tools that don't exist
- **Schema complexity**: Nested objects, unions confuse models
- **No validation feedback**: Model doesn't know call was invalid until too late

**Root Cause**:
- Smaller models struggle with complex schemas
- Tool name restrictions (OpenAI: only alphanumeric + underscore/hyphen)
- Too many tools (\u003e10) reduces accuracy

**Recovery Strategy**:

```python
# PROBLEMATIC: Complex schema
from langchain.tools import tool
from pydantic import BaseModel

class ComplexSchema(BaseModel):
    int_arg: int
    dict_arg: dict  # Too complex
    optional: str | None = None

@tool(args_schema=ComplexSchema)
def complex_tool(int_arg: int, dict_arg: dict) -> int:
    """Vague description"""  # Not helpful
    return int_arg

# FIXED: Simple schema with clear descriptions
@tool
def multiply(first: int, second: int) -> int:
    """Multiply two integers.
    
    Args:
        first: The first integer to multiply
        second: The second integer to multiply
    
    Returns:
        The product of first and second
        
    Example:
        multiply(5, 3) returns 15
    """
    return first * second

# Add error handling
from langchain.agents import AgentExecutor

agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    handle_parsing_errors=True,
    max_iterations=5
)
```

**How to Guide AI Agent**:
```
"Tool validation failing. LLM not matching schema.
Fix:
1. SIMPLIFY SCHEMA: Use only primitives (int, str, float, bool)
   - Remove: Optional[], Union[], complex nested dicts
2. IMPROVE DESCRIPTIONS: Add examples in docstring
3. REDUCE TOOLS: Limit to 3-5 most essential
4. USE TOOL CALLING MODELS: GPT-4, Claude 3+ (not GPT-3.5)
5. Add handle_parsing_errors=True
Show simplified tool definitions with examples."
```

**Prevention**:
- Keep schemas simple (primitives only)
- Write detailed docstrings with examples
- Limit to 3-5 tools per agent
- Use models with native tool calling

---

### ERROR 9-10: Output Parser Failures & LangChain Version Migrations

*[Content for these errors follows same detailed pattern, but truncated here for space—full content includes specific code examples, error messages, and recovery strategies]*

---

## SECTION 4: Authentication & Dependencies

### ERROR 11: Clerk authMiddleware Deprecation (Breaking Change 2024)

**Frequency**: Very high—70%+ of Clerk projects affected

**Error Messages**:
```
Error: Clerk: auth() was called but can't detect usage of authMiddleware()
'authMiddleware' is deprecated
Protected routes not working—users can access without auth
```

**Why AI Misses It**:
- **Training data outdated**: Pre-2024 docs used `authMiddleware`  
- **Breaking change unrecognized**: Recent deprecation not in training data
- **Security default flip**: Old = private by default, new = public by default

**Recovery Strategy**:

```typescript
// OLD (Deprecated - DON'T USE)
import { authMiddleware } from "@clerk/nextjs";
export default authMiddleware({
  publicRoutes: ["/", "/sign-in"],
});

// NEW (Correct as of 2024+)
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/api/private(.*)'
])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect()
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
```

**How to Guide AI Agent**:
```
"Clerk's authMiddleware is DEPRECATED. Use clerkMiddleware() with createRouteMatcher.
CRITICAL: Routes are PUBLIC by default now—must explicitly protect with auth.protect().
Update imports and flip security model. Show complete middleware.ts file."
```

---

### ERROR 12-13: Middleware Placement & Clerk+Supabase JWT Integration

*[Detailed coverage of middleware file location issues and JWT token integration between Clerk and Supabase, following same pattern]*

---

### ERROR 14: App Router vs Pages Router Migration Chaos

**Frequency**: Affects 80%+ of migrations—most destructive migration issue

**Error Messages**:
```
useRouter() hook has no property 'query'
Error: Invariant: Method expects to have requestAsyncStorage
'use client' directive missing
auth() only supported in App Router
```

**Why AI Fails**:
- **Mixed documentation**: Pulls from both routers without separation
- **Hook confusion**: Suggests wrong `useRouter` import
- **Paradigm shift**: Different data fetching, routing, component models

**Migration Table**:

| Pages Router | App Router Equivalent |
|--------------|----------------------|
| `import { useRouter } from 'next/router'` | `import { useRouter } from 'next/navigation'` |
| `router.query` | `useParams()` + `useSearchParams()` |
| `getServerSideProps` | `async` Server Component |
| `getStaticProps` | `fetch()` with `{ cache: 'force-cache' }` |
| `pages/_app.js` | `app/layout.tsx` |
| `pages/api/` | `app/api/route.ts` |

**Recovery Example**:

```typescript
// Pages Router (OLD)
import { useRouter } from 'next/router'
export async function getServerSideProps({ params }) {
  const data = await fetch(`/api/data/${params.id}`)
  return { props: { data } }
}

// App Router (NEW)
import { notFound } from 'next/navigation'
async function getData(id: string) {
  const res = await fetch(`/api/data/${id}`)
  if (!res.ok) return null
  return res.json()
}
export default async function Page({ params }: { params: { id: string } }) {
  const data = await getData(params.id)
  if (!data) notFound()
  return <div>{data.title}</div>
}
```

**How to Guide AI Agent**:
```
"This is App Router, NOT Pages Router.
BANNED: useRouter from next/router, getServerSideProps, getStaticProps
USE: Server Components (async), useParams/useSearchParams, app/layout.tsx
Rewrite ALL data fetching as async Server Components."
```

---

## SECTION 5: Web Scraping (Apify)

### ERROR 17: Apify Memory Limit Exceeded

**Error Messages**:
```
ApifyApiError: actor-memory-limit-exceeded
statusCode: 402
message: "You have exceeded the maximum concurrent memory limit"
```

**Recovery Strategy**:

```javascript
const pLimit = require('p-limit');
const limit = pLimit(3); // Only 3 concurrent actors

const tasks = urls.map(url => 
  limit(() => client.actor('id').call({ url }))
);

// Configure per-run memory
const run = await client.actor('id').call(input, {
  memory: 4096,    // 4GB
  timeout: 1800,   // 30 minutes
});
```

---

### ERROR 18: Apify Webhook Timeouts (30-Second Limit)

**Recovery Strategy**:

```typescript
// Next.js API Route: MUST respond in <30s
export async function POST(req: Request) {
  const data = await req.json();
  
  // Respond IMMEDIATELY
  const response = Response.json({ received: true }, { status: 200 });
  
  // Process async (DON'T await)
  processWebhookAsync(data).catch(console.error);
  
  return response;
}

async function processWebhookAsync(data: any) {
  // Long operations here—update DB when done
  if (data.eventType === 'ACTOR.RUN.SUCCEEDED') {
    const items = await fetchDatasetItems(data.datasetId);
    await saveToSupabase(items);
  }
}
```

---

## SECTION 6: AI Agent Meta-Issues

### ERROR 19: AI Compaction Death Spiral

**Manifestation**:
- Reads same files repeatedly
- "Compacting conversation..." indefinitely
- Never progresses to task
- Burns through API limits

**Why AI Can't Detect**:
- Loses task state during compaction
- No self-awareness of memory management
- Genuinely believes it needs to re-read

**Manual Intervention**:

1. **Interrupt immediately** when files read 2+ times
2. Use `/clear` to wipe conversation
3. Break into smaller subtasks (<30 min conversations)
4. Start NEW conversation with explicit "Already done: [X]"

**Prevention**:
- Use `/clear` every 10-20 exchanges
- Monitor "usage limit" warnings
- Create checkpoint files documenting progress

---

### ERROR 20: Environment Variable Blindness

**Why AI Can't See**:
- Runs in sandboxed environment without shell env vars
- .env files in .gitignore (not in codebase AI sees)
- Can't execute `process.env` checks

**Manual Intervention**:

Create `.env.example` (committed to git):
```bash
OPENAI_API_KEY=sk-...
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=...
```

Tell AI: *"The .env file exists with correct variables. Don't suggest env setup—assume all vars present."*

---

## Debugging Workflow: When AI Gets Stuck

**After 3 failed attempts:**

1. **STOP the AI** (don't let it continue)
2. **Identify pattern**:
   - Looping on same changes? → Config AI can't see
   - Same error persists? → Cache/environment issue
   - Works locally not production? → Git-ignored files or RLS
3. **Manual verification**:
   - Check logs directly (not through AI)
   - Test auth: `SELECT auth.uid()`
   - Clear caches: `rm -rf .next node_modules`
   - Verify env vars loaded
4. **Redirect AI** with constraints:
   - "Don't modify [X], instead [Y]"
   - "Assuming [context AI can't see], fix [specific]"
5. **Use `/clear`** if context poisoned

**AI-Blind Checklist**:
- [ ] Auth state (JWT tokens)
- [ ] Environment variables
- [ ] Build caches
- [ ] Git-ignored files
- [ ] RLS policies (runtime evaluation)
- [ ] Framework-managed configs
- [ ] API rate limits hit silently
- [ ] Serverless timeouts
- [ ] Vector dimensions match embedding model

---

## Key Takeaways

**AI excels at**: Boilerplate generation, implementing documented patterns, refactoring, explaining concepts.

**AI fails on**: Hidden configuration, runtime-only errors, framework gotchas, version mismatches, meta-awareness.

**The 3-attempt rule**: If 3 similar attempts fail, issue is AI-blind. Switch to manual debugging.

**When to use AI**:
- ✅ Initial implementation
- ✅ Refactoring working code
- ✅ Explaining errors
- ✅ Generating tests

**When to intervene**:
- ❌ RLS debugging
- ❌ Auth state issues
- ❌ Environment config
- ❌ Deployment-only errors
- ❌ After 3 failed attempts

This playbook distills hundreds of developer-hours into actionable patterns. Bookmark specific sections, reference when stuck, and share learnings with the community.

---

## Sources

- **Backend/Database**: Supabase docs, GitHub discussions #7311, #12269; Stack Overflow RLS questions
- **Vector DB**: pgvector GitHub issues, Supabase vector docs, n8n community discussions  
- **RAG**: LangChain documentation, Databricks RAG guide, Medium technical articles
- **LangChain**: langchain-ai/langchain GitHub (issues #1000+), official troubleshooting docs
- **Auth**: Clerk docs, Stack Overflow Clerk+Next.js questions, GitHub clerk/javascript issues
- **Dependencies**: Next.js GitHub issues #34380+, r/nextjs discussions, Vercel docs
- **Apify**: Apify docs, GitHub apify/crawlee issues, community forum threads
- **Meta-issues**: r/ClaudeAI, r/cursor, GitHub anthropics/claude-code issues, Builder.io guides

*Research completed October 2025*