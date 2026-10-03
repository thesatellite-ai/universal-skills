<!-- Prompt for the landscape agent. Fill every {{PLACEHOLDER}}; delete hint lines in [brackets]. -->

You are researching for a new {{LANGUAGE}} library, `{{MODULE_PATH}}` (owner: {{OWNER_NAME}}). Mission: {{MISSION_SENTENCE}}. This is EXPLORATION ONLY: no code.

Your job: build the definitive LANDSCAPE of existing {{DOMAIN}} libraries across ecosystems, using WebSearch and WebFetch (load them via ToolSearch "select:WebSearch,WebFetch" if deferred) and the GitHub API to verify against real READMEs, docs and source. Do not rely on memory for links, stars, status or feature claims: verify each GitHub link resolves and record approximate stars, archived status and last release date, all dated {{TODAY}}.

Cover at least these, and find more (dig past the famous ones; search GitHub and package registries for "{{DOMAIN}} abstraction <language>"):
{{SEED_LIST}}
[One bullet per ecosystem: PHP, Node/TS, Python, Ruby, JVM, Rust, .NET, Elixir, and {{LANGUAGE}} itself (most important: check every library). Name the 3-10 libraries you already know in each, plus the user's pasted references: {{EXTERNAL_REFERENCES}}.]
- Hosted and self-hosted services worth mapping feature-wise (not as dependencies).
- In-house layers that large open-source {{LANGUAGE}} products built for themselves instead of adopting a library. Quote their interfaces from source. These are the strongest evidence of a gap.

For each library record: name, ecosystem, GitHub link (verified), approx stars, status (active / maintenance / archived + last release), core abstraction (interface shape with method names), backend/adapter count and notable ones, extension model (plugins / middleware / layers / decorators / events / hooks), standout features, and lessons (what to steal, what to avoid).

Then synthesize:
1. A cross-library feature matrix (rows = capabilities, columns = the top ~15 libraries).
2. "The 10 design ideas we must steal", each with source attribution.
3. The gap in {{LANGUAGE}} today: what no library offers, as a table of missing capability -> closest thing and why it falls short.
4. Anti-patterns seen in the wild (dead or archived projects and why they died, API shapes that lie about the backend, hidden global state, native-library dependencies in a core), each with "our rule".
5. 2025-2026 shifts worth knowing (deprecations, archivals, successor projects).

OUTPUT: write ONE file: {{REPO_PATH}}/docsi/research/LANDSCAPE.md. It is an internal doc rendered by filemark: FIRST invoke the Skill tool with skill "filemark" and use its component grammar (Callout, Details for deep dives, tables), observing its survival rules. ABSOLUTE RULES: never hard-wrap markdown (every paragraph, bullet and table cell is one physical line); never mention AI tools or assistants in the doc; every library entry carries its GitHub link. Date it {{TODAY}}. Be thorough: this is the project's reference document. Use tables to keep it scannable.

When done, reply with a ~25-line summary: number of libraries covered, the top 10 ideas to steal, the gap, and anything surprising (especially facts that should change a default, such as an archived dev server or a deprecated SDK package).
