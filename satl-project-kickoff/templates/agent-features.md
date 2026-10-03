<!-- Prompt for the feature-catalogue agent. Fill every {{PLACEHOLDER}}; delete hint lines in [brackets]. -->

You are researching for a new {{LANGUAGE}} library, `{{MODULE_PATH}}` (owner: {{OWNER_NAME}}). Mission: {{MISSION_SENTENCE}}. EXPLORATION ONLY: no code.

Your job: produce the exhaustive FEATURE CATALOGUE of what real applications need from {{DOMAIN}}, ranked by how commonly real products ship each feature. Ground claims with WebSearch/WebFetch (load via ToolSearch "select:WebSearch,WebFetch" if deferred) in real products and libraries: {{GROUNDING_LIST}}.

{{MIRROR_INSTRUCTION}}
[If the owner has an earlier catalogue of this shape, e.g. another project's FEATURES doc: "Model it on <path>: read it first and mirror its structure (categories, ranking by how many real products ship a feature, P0-P4 bands, a P0 set that defines what 'it has X' means to a user)." Otherwise: "Use this structure: categories, per-category tables, P0-P4 bands by commonality, a P0 set that defines what 'it has X' means to a developer."]

Categories to cover (extend freely): {{CATEGORY_SEEDS}}
[List 15-30 seed categories: core operations, data model, security, observability, testing, developer ergonomics, plus one category per app archetype the user named (SaaS, social, marketplace, chat, CMS, mobile backend, ...).]

For each feature: id, name, one-line description, which real products/libraries ship it (name them), a commonality score, priority band P0-P4, and its home: CORE, ADAPTER capability, PLUGIN/contrib module, or OUT OF SCOPE (with the reason). Also include:
- an "app archetypes" table: for each kind of app the user cares about, the feature bundle beyond P0 it needs and what it typically skips;
- a "proposed module split" table (module -> contents -> feature rows), applying the placement test: does it import a vendor SDK, a framework, a database driver or a heavy native library? No -> core. Vendor SDK -> adapter module. Anything else heavy -> plugin module;
- a "what this means for build order" section, including where single rows hide state machines.

OUTPUT: write ONE file: {{REPO_PATH}}/docsi/research/FEATURES.md. Internal filemark-rendered doc: FIRST invoke the Skill tool with skill "filemark" and use its component grammar (Stats, tables, Callouts, Details), observing its survival rules. ABSOLUTE RULES: never hard-wrap markdown; never mention AI tools or assistants. Date it {{TODAY}}. Be exhaustive (expect 200+ features) but scannable. Verify by script that each feature's band matches its score.

When done, reply with a ~25-line summary: category count, feature count per band, the P0 list, and the proposed core vs plugin split.
