<!-- Prompt for the local-references agent. Fill every {{PLACEHOLDER}}; delete hint lines in [brackets]. Skip this agent when the user named no local code. -->

You are studying local reference code for a new {{LANGUAGE}} library, `{{MODULE_PATH}}` (owner: {{OWNER_NAME}}). Mission: {{MISSION_SENTENCE}}. It will use {{REQUIRED_DEPS}} and be architected like {{TEMPLATE_PROJECT}}. EXPLORATION ONLY: write no code.

Read and analyse these codebases thoroughly (the real source, not just READMEs):
{{LOCAL_REFERENCE_LIST}}
[One numbered entry per path the user gave, each with what to extract: its interface, data model (tables/columns), features, flows, surfaces (HTTP/GraphQL/CLI), what is good, what is weak or missing.]
- {{TEMPLATE_PROJECT}}: THE ARCHITECTURAL TEMPLATE. Read its CLAUDE.md, README, docs, decision records and core source files. Document precisely: how plugins are defined and registered, how they extend the schema, how operations and the request pipeline work, hooks/observers, migrations, the module split and any dependency guard tests, config/options shape, testing approach (contract suites, integration engines), docs tooling and the check gate. For each pattern decide whether it transfers to the new library as-is, adapted, or not at all.
- {{REQUIRED_DEPS}}: find the source locally (sibling directory or the module cache). Summarise its API and what the new library would need from it, with gaps and workarounds.
- Other packages by the same owner that the new library should integrate with or must not depend on in its core. Also read the owner's stack skill if one exists: {{STACK_SKILL}}.

OUTPUT: write ONE file: {{REPO_PATH}}/docsi/research/LOCAL_REFERENCES.md. Internal filemark-rendered doc: FIRST invoke the Skill tool with skill "filemark" and follow its grammar and survival rules. ABSOLUTE RULES: never hard-wrap markdown; never mention AI tools or assistants. Date it {{TODAY}}. Cite file:line for key claims. Sections: one per codebase (what it is, interface/data model, features, strengths, weaknesses, what to carry over), then "Patterns to transfer from {{TEMPLATE_PROJECT}}" (a table: pattern -> how it maps -> as-is / adapt / don't), then "{{REQUIRED_DEPS}} fit and gaps", then "ecosystem integrations". Flag any conflict between the owner's rules and the template's choices in a Callout rather than resolving it.

When done, reply with a ~25-line summary of the most important findings, especially the template's architecture patterns and the reference data model.
