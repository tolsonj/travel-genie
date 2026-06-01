Discord Channel ID: 
1485710745432883385

channel:1485710745432883385



User Id:
701669884798697503

user:701669884798697503


Developer Portal: https://discord.com/developers/applications/1502368878297223208/information

Application ID
1502368878297223208


real guild ID 1485710743776137287

OPENCLAW token/Gateway Token: set via environment variable `OPENCLAW_GATEWAY_TOKEN` (never commit tokens)


Best skill for Gmail (read, send, draft):

`gmail` skill — the canonical choice.

openclaw skill install gmail

- Reads threads and individual messages
- Sends emails
- Creates drafts natively via `gmail.compose` scope
- Manages labels, search with natural language
- Automatically logs in after initial one-time OAuth setup — subsequent sessions reuse the stored token, no re-auth needed


### The Follow-Up Sequence

Once OpenClaw finishes the Route, use these "Bridge Prompts" to feed your original 16 steps into the machine one by one.

#### For Step 3: Immigration & Entry

> "Execute **Step 3: Immigration and Entry Specialist**. Use my US citizenship and the 2026 facts in `TRAVEL_MASTER.md`. **Task**: Detail the UK ETA process for London and the EES biometric procedures for Paris/Amsterdam. **Output**: A country-by-country entry checklist and 'Red Flag' warnings. Append this to the file."

#### For Step 4: The Itinerary

> "Execute **Step 4: Master Itinerary**. Dates: Sept 1–14, 2026. Pace: Moderate/Comfortable Adventurer. **Task**: Build the day-by-day schedule with 'Wow Moments' and 'Soft Days' as defined in my framework. **Validation**: Check for transit overload and orientation fatigue. Append to the file."

#### For Steps 5–16 (The Pattern)

For every subsequent step (Accommodation, Food, Tech, etc.), use this short-code format:

> "Execute **Step [Number]: [Role Name]**. Refer to the itinerary in Step 4 now stored in `TRAVEL_MASTER.md`. [Paste the specific TASK and VALIDATION text from your original prompt list]. Append the result to the master file."

---

### Pro-Tips for OpenClaw Success:

- **The "Context Check":** Every 3 or 4 prompts, ask: _"OpenClaw, summarize the current length and status of `TRAVEL_MASTER.md` to ensure you haven't lost the thread."_
    
- **Handling September 2026:** Since you are traveling in September, remind OpenClaw in the **Step 4 (Itinerary)** prompt that you are in **"Shoulder Season"**—this should trigger it to find better prices and slightly thinner crowds.
    
- **The Final Step:** After Step 16, your last prompt should be: _"Review the entire `TRAVEL_MASTER.md` file. Check for any contradictions (e.g., an activity in Paris scheduled while the transport log says I'm in London). Create a Final Table of Contents at the top of the document."_
