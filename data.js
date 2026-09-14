/* ============================================================================
   data.js — the content of this site. Everything the page renders comes from
   here; the HTML is only a shell. To add work, add an object.

   Every record carries an evidence tier, which is rendered on the page:
     owned        Conceived, architected and built by me.
     contributed  Employer product. My scope stated per module.
     progress     Currently being built. Not claimed as shipped.
     academic     University work, scope as stated.

   Employer work is described generically by agreement — the class of system
   and my contribution to it, without product or client specifics.
   ========================================================================== */

const DATA = {

  /* --- identity ---------------------------------------------------------- */
  profile: {
    name: "Anish Kania",
    role: "Technology & Operations Manager",
    firm: "Dot Logic India",
    employer: "APT Solutions",
    location: "Vadodara, Gujarat, India",
    email: "kaniaanish64@gmail.com",
    linkedin: "https://linkedin.com/in/kaniaanish",
    resume: "",          // drop a PDF in the repo root and name it here
    // relocation row removed from the contact card. Re-add it by putting a
    // { note: "Relocation", label: ..., href: null } entry back in script.js.
    relocation: ""
  },

  tiers: {
    owned:       { label: "Owned",        note: "Conceived, architected and built by me" },
    contributed: { label: "Contributed",  note: "Employer product — my scope stated per module" },
    progress:    { label: "In progress",  note: "Employer initiative, currently being built" },
    academic:    { label: "Academic",     note: "University work, scope as stated" }
  },

  /* --- page copy — single voice, focused on the work -------------------- */
  copy: {
    eyebrow: "Technology & Operations Manager · Vadodara, India",
    headline: ["Systems that hold", "on the day they matter."],
    lede: "Six years on a high-stakes digital examination platform where a bad deploy becomes somebody's exam day, and a multi-tenant ERP of my own alongside it. Database architecture, enterprise reporting, authentication, and the production support that keeps a twenty-day evaluation cycle running.",
    ctaPrimary:   { label: "See the systems", href: "#systems" },
    ctaSecondary: { label: "The incident", href: "#incident" },
    standfirst: "Technology & Operations Manager at APT Solutions. MS Data Science, Drexel University, 2025.",
    availability: "Open to opportunities",
    contactHeading: ["What I'm", "looking for."],
    contactBody: "Technology leadership and operations roles where the remit covers both the architecture and the running of it.",
    contactCta: "Start a conversation"
  },

  /* --- control plane tiles ------------------------------------------------ */
  status: [
    { label: "Assessment cycle", value: "99.9%",  note: "uptime across 20+ day continuous cycles", status: "live"  },
    { label: "Reporting layer",  value: "40%",    note: "faster after execution-plan overhaul",   status: "live"  },
    { label: "Manual audit",     value: "−50%",   note: "time removed by Python/SQL automation",  status: "live"  },
    { label: "Multi-tenant ERP", value: "Phase A",note: "tenant_id rollout in progress",          status: "build" }
  ],

  /* ==========================================================================
     SYSTEMS — each has its own schematic and its own module inventory.
     The hero diagram and the module map both key off whichever is selected.
     ====================================================================== */
  systems: [

    /* ------------------------------------------ employer platform (generic) */
    {
      id: "exam",
      name: "Exam platform",
      full: "Digital examination & evaluation platform",
      owner: "APT Solutions",
      tier: "contributed",
      period: "2021 — present",
      subtitle: "High-volume university examination assessment, digitised end to end — and kept anonymous.",
      caption: "Assessment lifecycle · candidate identity separated at intake, rejoined only at results",
      entityLabel: "What it handles",
      topology: {
        nodes: [
          { id: "book",   label: "Script intake",  kind: "edge",    col: 0, row: 1 },
          { id: "mask",   label: "Anonymisation",  kind: "control", col: 1, row: 1 },
          { id: "vault",  label: "Identity store", kind: "store",   col: 1, row: 2 },
          { id: "scan",   label: "Digitisation",   kind: "service", col: 2, row: 0 },
          { id: "images", label: "Image store",    kind: "store",   col: 2, row: 1 },
          { id: "alloc",  label: "Allocation",     kind: "control", col: 3, row: 1 },
          { id: "eval",   label: "Assessment",     kind: "service", col: 4, row: 0 },
          { id: "mod",    label: "Review",         kind: "service", col: 4, row: 2 },
          { id: "result", label: "Results",        kind: "service", col: 5, row: 1 },
          { id: "audit",  label: "Audit log",      kind: "store",   col: 5, row: 2 }
        ],
        edges: [
          ["book","mask"], ["mask","vault"], ["mask","scan"],
          ["scan","images"], ["images","alloc"],
          ["alloc","eval"], ["alloc","mod"],
          ["eval","result"], ["mod","result"], ["vault","result"],
          ["eval","audit"], ["result","audit"]
        ],
        legend: [
          { kind: "edge",    text: "Intake" },
          { kind: "control", text: "Control point — identity and allocation" },
          { kind: "service", text: "Workflow stage" },
          { kind: "store",   text: "Persistence — identity sits behind its own boundary" }
        ]
      },
      note: "The assessment layer never sees a candidate. Identity is separated at intake, held behind its own access boundary, and rejoined only at results — which is the single most important edge on this diagram.",
      modules: [
        { no: "01", name: "Intake & digitisation", group: "Ingestion", ownership: "contributing",
          line: "High-volume capture, at the throughput a live assessment window demands.",
          detail: "Physical scripts are digitised at capture centres and enter the system as image sets carrying a non-identifying reference. The engineering constraint is throughput rather than cleverness: a centre running at capacity for weeks on end cannot tolerate ingestion backpressure, because a stall here stalls every assessor downstream. The pipelines behind it were designed around I/O cost, at a volume measured in millions of pages per cycle.",
          entities: ["High-volume ingestion", "Batch tracking", "Image handling", "Throughput monitoring"] },

        { no: "02", name: "Candidate anonymisation", group: "Ingestion", ownership: "contributing",
          line: "Separating who wrote it from what was written — and keeping them separated.",
          detail: "An assessor must never be able to associate a script with a candidate. A non-identifying reference becomes the only identity the assessment layer ever sees. Architecturally this is harder than it sounds: the identity mapping is the highest-value target in the system, so access control cannot rest on roles alone — it has to be enforced at the data access layer, so no assessment-side query path can reach it at all. Every rejoin to candidate identity is a logged event. Re-assessment needs a second separation pass, because a re-assessor must not see the earlier marks or the earlier assessor either. Anonymity is a per-stage property, not a one-time operation at intake.",
          entities: ["Identity separation", "Access boundary enforcement", "Rejoin auditing", "Per-stage anonymity"],
          owned: "Database architecture and authentication work this depends on" },

        { no: "03", name: "On-screen assessment", group: "Assessment", ownership: "contributing",
          line: "Marking over the digitised script rather than on paper.",
          detail: "Renders large multi-page image sets at low latency, with the navigation, zoom and structured mark entry an assessor needs to work at pace for hours. Validation runs at entry rather than at submission. Concurrency is resolved in the database rather than in application code, so two assessors can never end up working the same script.",
          entities: ["Image rendering at scale", "Structured mark entry", "Entry-time validation", "Concurrency control"],
          owned: "Backend APIs serving this, and the database schema and query paths beneath it" },

        { no: "04", name: "Assessor allocation", group: "Assessment", ownership: "contributing",
          line: "Distributing work under institution-defined rules and load balancing.",
          detail: "Subject, faculty, workload balancing and rules that differ between institutions. The reporting side is where my heavier work sits: consolidating allocation data with assessment, review and results data into a single operational view is one of the harder cross-module joins in the platform, because a script in transition between stages has to appear in the report showing the gap rather than being silently dropped.",
          entities: ["Rule-driven distribution", "Workload balancing", "Progress tracking", "Cross-stage consolidation"] },

        { no: "05", name: "Review & moderation", group: "Assessment", ownership: "contributing",
          line: "Second-pass review, with different visibility rules and a different audit posture.",
          detail: "Structurally similar to assessment, but what a reviewer may see and what must be recorded both differ. Sampling is driven statistically rather than manually, so the scripts that warrant a second look are surfaced by the system instead of chosen by hand.",
          entities: ["Statistical sampling", "Restricted visibility", "Review workflow", "Audit posture"],
          owned: "Institution-specific review reporting" },

        { no: "06", name: "Re-assessment", group: "Assessment", ownership: "contributing",
          line: "Candidate-initiated reassessment — the highest-scrutiny path in the platform.",
          detail: "Outputs here are contestable and may be examined through an institution's grievance process, which raises the bar on both anonymity and audit. Requires the second separation pass described in module 02.",
          entities: ["Request handling", "Second-pass anonymity", "Revised outcomes", "Contestability trail"],
          owned: "Institution-specific re-assessment reporting" },

        { no: "07", name: "Results processing", group: "Processing", ownership: "contributing",
          line: "Where the non-identifying reference rejoins candidate identity.",
          detail: "Granular marks are consolidated into validated outcomes inside transactional blocks that guarantee no partial state, then joined back to candidate identity. Reporting outputs delivered on top of it: candidate-level summaries, subject-level summaries and faculty-level reporting.",
          entities: ["Mark consolidation", "Transactional integrity", "Identity rejoin", "Outcome publication"],
          owned: "The reporting layer that consumes it" },

        { no: "08", name: "Authentication & access", group: "Platform", ownership: "primary",
          line: "Identity, access control and per-institution security policy.",
          detail: "Primary ownership of authentication across the platform, including the security and access improvements implemented to satisfy specific institutional policy requirements.",
          entities: ["Authentication", "Access control", "Institutional policy", "Authentication auditing"] },

        { no: "09", name: "Reporting & analytics", group: "Platform", ownership: "primary",
          line: "The enterprise reporting layer across every stage of the platform.",
          detail: "Primary ownership. Operational reporting for administrators, faculty-level reporting, review and re-assessment reporting, and candidate and subject outcome summaries — delivered through a managed reporting service and a custom SQL layer with user-defined functions on top of it.",
          entities: ["Operational reporting", "Custom report delivery", "Cross-stage views", "Administrator dashboards"] },

        { no: "10", name: "Audit logging", group: "Platform", ownership: "contributing",
          line: "Who did what to which script, and when.",
          detail: "The trail that makes every other part of the platform defensible under review — particularly the re-assessment path, where outcomes may be formally contested.",
          entities: ["Change history", "Actor attribution", "Script lifecycle trail", "Review defensibility"] }
      ]
    },

    /* ----------------------------------------------------------------- ERP */
    {
      id: "erp",
      name: "SaaS ERP",
      full: "Multi-tenant SaaS ERP",
      owner: "Dot Logic India",
      tier: "owned",
      period: "Active build",
      subtitle: "Ten business modules on a two-level tenancy model. One codebase, many client companies.",
      entityLabel: "Principal entities",
      caption: "Request path — every call resolves tenant, identity and role before business logic",
      topology: {
        nodes: [
          { id: "client",  label: "Client",         kind: "edge",    col: 0, row: 1 },
          { id: "gateway", label: "API gateway",    kind: "edge",    col: 1, row: 1 },
          { id: "authn",   label: "Auth · 2FA",     kind: "control", col: 2, row: 0 },
          { id: "tenant",  label: "Tenant resolve", kind: "control", col: 2, row: 1 },
          { id: "rbac",    label: "RBAC",           kind: "control", col: 2, row: 2 },
          { id: "module",  label: "Module service", kind: "service", col: 3, row: 1 },
          { id: "db",      label: "PostgreSQL",     kind: "store",   col: 4, row: 1 },
          { id: "audit",   label: "Audit log",      kind: "store",   col: 4, row: 2 },
          { id: "report",  label: "Reporting",      kind: "service", col: 4, row: 0 }
        ],
        edges: [
          ["client","gateway"], ["gateway","authn"], ["gateway","tenant"], ["gateway","rbac"],
          ["authn","module"], ["tenant","module"], ["rbac","module"],
          ["module","db"], ["module","audit"], ["module","report"]
        ],
        legend: [
          { kind: "edge",    text: "Entry" },
          { kind: "control", text: "Control plane — every request passes all three" },
          { kind: "service", text: "Business logic" },
          { kind: "store",   text: "Persistence" }
        ]
      },
      note: "Two-level tenancy — Tenant → Organization — because a contractor runs multiple sites and often multiple legal entities. Flat tenancy forces them into one blurred tenant (losing entity separation for GST and payroll) or several unrelated tenants (losing consolidated reporting).",
      modules: [
        { no: "01", name: "Authentication & 2FA", group: "Platform", ownership: "primary",
          line: "Identity, sessions and second-factor enrolment across every tenant.",
          detail: "Tenant-scoped accounts with two-factor enrolment live in the auth module, session handling and password policy. Nothing in the system is reachable without passing this first, which is what makes the rest of the isolation model trustworthy.",
          entities: ["users", "sessions", "mfa_enrolments", "password_policy"] },
        { no: "02", name: "HRM", group: "People", ownership: "primary",
          line: "Employee master, org structure, registers and exit workflow.",
          detail: "The employee record every other people-module reads from: profile, designation, reporting line, transfers and promotions, posting and document history. Specialised registers sit alongside it — competency and licence register, periodic medical examination register — plus exit clearance workflow.",
          entities: ["employees", "designations", "org_units", "registers", "documents"] },
        { no: "03", name: "Attendance", group: "People", ownership: "primary",
          line: "Daily muster, shifts and roster, captured at site.",
          detail: "Attendance built for sites rather than desks — shift and roster management, muster roll and exception handling, feeding straight into payroll instead of being re-keyed at month end.",
          entities: ["attendance_days", "shifts", "rosters", "exceptions"] },
        { no: "04", name: "Leave", group: "People", ownership: "primary",
          line: "Entitlement, accrual, approval chain.",
          detail: "Leave types, accrual rules and a configurable approval chain. Balances resolve against attendance and payroll so the three never disagree.",
          entities: ["leave_types", "balances", "requests", "approvals"] },
        { no: "05", name: "Payroll", group: "People", ownership: "primary",
          line: "Runs, components, statutory deductions, payslips.",
          detail: "Earning and deduction components, a locked payroll run producing payslips, and the statutory outputs Indian payroll actually requires — PF ECR, ESIC, professional tax, TDS, Form 16, gratuity and CLRA. The hardest module to get wrong quietly, so it carries the most audit coverage.",
          entities: ["pay_components", "payroll_runs", "payslips", "statutory_returns"] },
        { no: "06", name: "Accounts & GST", group: "Finance", ownership: "primary",
          line: "Ledger, vouchers and GST-compliant documents.",
          detail: "Chart of accounts, voucher entry and GST treatment on the documents that need it — built against Indian compliance requirements rather than retrofitted onto a generic ledger.",
          entities: ["accounts", "vouchers", "tax_rates", "gst_documents"] },
        { no: "07", name: "Inventory", group: "Operations", ownership: "primary",
          line: "Items, stores, movement and valuation.",
          detail: "Item master, multiple stores, issue and receipt movement with valuation — written for material that moves between sites, which is the case generic packages handle worst.",
          entities: ["items", "stores", "stock_moves", "valuations"] },
        { no: "08", name: "Procurement", group: "Operations", ownership: "primary",
          line: "Indent through purchase order to receipt.",
          detail: "Indent, vendor, purchase order, goods receipt — with the approval thresholds that decide when a human has to look. Closes the loop into inventory and accounts.",
          entities: ["indents", "vendors", "purchase_orders", "receipts"] },
        { no: "09", name: "Projects", group: "Operations", ownership: "primary",
          line: "Sites, work breakdown, cost against budget.",
          detail: "Project and site structure with work breakdown, so labour, material and procurement cost can be read against budget while the work is still running rather than after it.",
          entities: ["projects", "sites", "wbs", "cost_lines"] },
        { no: "10", name: "Audit", group: "Platform", ownership: "primary",
          line: "Append-only record of who changed what, and when.",
          detail: "Every mutation across every module writes here, append-only and tenant-scoped. It is the module that makes the other nine defensible in a review.",
          entities: ["audit_events", "actors", "change_sets"] }
      ]
    }
  ],

  /* ==========================================================================
     RECORDS — every system on the same six questions.
     ====================================================================== */
  cases: [
    {
      id: "exam", published: true, tier: "contributed", no: "01",
      kicker: "Assessment technology", sector: "Higher education",
      title: "Digital examination & evaluation platform",
      summary: "A platform that digitises the university assessment lifecycle end to end while guaranteeing an assessor never learns whose script they are marking. Deployed per institution from a shared codebase, with institutional variation absorbed as extension points rather than forks.",
      strip: ["Anonymisation", "Digitisation", "Allocation", "Assessment", "Review", "Results", "Reporting"],
      metrics: [
        { value: "99.9%", label: "uptime, 20+ day cycles" },
        { value: "40%",   label: "reporting performance gain" },
        { value: "~50%",  label: "manual audit time removed" }
      ],
      context: "University assessment in India was almost entirely paper-bound: scripts physically transported between centres, no chain-of-custody visibility once they left, serial result declaration that candidates wait on, opaque workload distribution, and assessors able to see candidate identity — which defeats anonymous assessment before it starts.",
      constraint: "Every institution wanted something different: custom reporting, institution-specific workflows, faculty-level slices, bespoke review reporting, and security work to satisfy their own policy. The naive answer is a branch per client, which produces N divergent codebases and a maintenance cost that compounds with every release.",
      architecture: "An ecosystem of interoperating modules on one shared codebase — legacy desktop clients alongside modern web applications over a service layer, a JavaScript front end, and a Microsoft SQL Server data platform underneath with managed ETL and a custom reporting layer on top. Institutional variation is absorbed into extension points on the common core, never a fork.",
      rollout: "Deployed per institution with client-specific extensions, on on-premise and hybrid infrastructure. My scope: primary ownership of enterprise reporting, authentication and the database architecture; contributing member across digitisation, allocation, assessment, review, re-assessment, results processing and audit logging.",
      outcome: "99.9% uptime across continuous 20+ day assessment cycles — the detail that gives the figure meaning, since an outage mid-cycle strands assessors and delays an institution's results. A 40% reporting performance improvement from execution-plan-driven overhaul of legacy T-SQL, and roughly half the manual audit time removed through automation of outcome calculation and anomaly detection.",
      tradeoff: "Extending a shared core rather than forking is correct, but it concentrates risk: a change to an extension point touches every institution at once, so the regression surface is the whole client base rather than one of them. It demands a release discipline a forked model lets you skip. I would take the same decision again — it is the constraint that taught me the multi-tenant model the ERP now uses.",
      stack: ["C#", "ASP.NET Core", "Web API", "React", "TypeScript", "SQL Server", "T-SQL", "SSIS", "SSRS", "Python"],
      links: []
    },
    {
      id: "erp", published: true, tier: "owned", no: "02",
      kicker: "Multi-tenant SaaS", sector: "Heavy civil & mining",
      title: "Multi-tenant ERP platform",
      summary: "Ten business modules on a two-level tenancy model, built to serve many client companies from one deployment rather than a fork per customer. Conceived, architected and built by me.",
      strip: ["Tenant resolve", "Auth & RBAC", "Module service", "PostgreSQL", "Audit log", "Reporting"],
      metrics: [
        { value: "10", label: "business modules" },
        { value: "2",  label: "levels of tenancy" },
        { value: "1",  label: "codebase, many clients" }
      ],
      context: "The first client is a mining and heavy-civil contractor running people, material and project cost across multiple sites. The obvious build is a system for that one company. The useful build is a platform that can take the next nine without a fork — which is the same lesson the shared-core architecture on the assessment platform taught, applied from the start this time.",
      constraint: "Multi-tenancy had to be retrofitted onto an existing single-tenant codebase without a big-bang rewrite, and without any window in which one client's data could be read by another.",
      architecture: "Node.js and TypeScript on Express, PostgreSQL through raw pg with no ORM, React and Vite on the front. Tenancy is two-level — Tenant → Organization — so one client can hold several sites or legal entities under one account. Every request resolves tenant, identity and role before it reaches business logic. I evaluated migrating to ASP.NET Core and SQL Server, which is my deepest stack, and chose to stay on Node and Postgres for query control over abstraction.",
      rollout: "Phased. Phase 1 codebase audit complete, Phase 2 architecture complete, Phase A build in progress. Step one is the tenants table and the tenant_id rollout migration, with the first client backfilled as tenant #1 — which makes the migration additive rather than destructive, and turns the single-tenant path into a special case of the multi-tenant path rather than a second code path. Self-serve signup with trial provisioning sits on the same route.",
      outcome: "One deployment can take additional client companies without a code fork, and every mutation across all ten modules lands in a single append-only audit trail.",
      tradeoff: "Raw pg over an ORM means tenant scoping is enforced by discipline and code review rather than by the framework. The upside is predictable SQL and no hidden query cost; the standing risk is a query that forgets its tenant predicate, which is the first thing review looks for. The open gap is automated test coverage — that closes before this is marketed as production-grade.",
      stack: ["Node.js", "TypeScript", "Express", "PostgreSQL", "React", "Vite", "Docker Compose"],
      links: []
    },
    {
      id: "aptauth", published: true, tier: "progress", no: "03",
      kicker: "Identity & access", sector: "Enterprise IAM",
      title: "Centralised authentication service",
      summary: "A tenant-aware IAM service intended to replace per-product authentication across multiple enterprise applications. One of the primary contributors to the architecture. Currently being built — not a shipped product.",
      strip: ["ASP.NET Identity", "JWT + refresh", "RBAC / claims", "MFA", "Audit"],
      metrics: [],
      context: "Multiple enterprise applications each carrying their own authentication means each one is a separate place to get access control wrong, and a separate place to fix it when policy changes.",
      constraint: "It has to be tenant-aware from the start, and it has to be adoptable product by product rather than requiring every application to cut over at once.",
      architecture: "ASP.NET Core Identity for authentication, JWT with a managed refresh-token lifecycle, RBAC and claims-based authorisation models, secure password storage and policy design, and audit logging for authentication events and system actions. Multi-factor approaches evaluated with proof-of-concept implementations built. Principle of least privilege applied at design stage; OWASP secure-coding principles throughout, with ongoing security review of authentication flows.",
      rollout: "In progress since 2025. Adjacent security work on record: reverse-engineering security assessments of legacy desktop applications, encryption of sensitive examination data where applicable, and security documentation and remediation of scan findings.",
      outcome: "Architecture and proof-of-concept stage. I am deliberately not claiming a shipped outcome here.",
      tradeoff: "Centralised identity is the right destination and a real single point of failure on the way there. Until every consuming application has migrated, the estate runs two authentication models at once, which is worse than either — so sequencing the migration matters more than the service design.",
      stack: ["C#", "ASP.NET Core Identity", "JWT", "OWASP", "RBAC"],
      links: []
    },
    {
      id: "dbeng", published: true, tier: "contributed", no: "04",
      kicker: "Database engineering", sector: "Platform",
      title: "Database architecture & automated processing",
      summary: "The data layer under the whole assessment platform: schema, stored procedures, reporting queries, ETL and the automation built on top of it.",
      strip: ["Schema design", "Execution plan analysis", "SSIS migration", "SSRS + UDFs", "Python automation"],
      metrics: [
        { value: "40%",   label: "reporting performance gain" },
        { value: "~50%",  label: "manual audit time removed" },
        { value: "99.9%", label: "uptime, peak cycles" }
      ],
      context: "Reporting had to consolidate several workflow stages that each maintain their own lifecycle state, over a dataset growing by millions of pages per cycle, on legacy T-SQL that had accreted rather than been designed.",
      constraint: "Optimisation had to be defensible, not speculative. The common anti-pattern is adding indexes until something improves, which leaves you unable to explain what you fixed.",
      architecture: "Execution-plan-driven overhaul: read the plan, identify the actual cost driver, address it — rather than adding indexes speculatively until something improves. The pattern that surfaced repeatedly was a key lookup on a high-cardinality filter column, where the fix is not a new index but making the existing seek cover the columns the query actually projects. Alongside that: stored procedures, views and user-defined functions, managed ETL migration of legacy data for multi-campus institutions, and pipelines with I/O cost as the explicit constraint.",
      rollout: "Delivered from 2020 onward, in production, against live assessment cycles. Python and SQL utilities layered on top for automated outcome calculation and anomaly detection. OCR prototypes built for reference and handwritten digit extraction, to remove manual data entry from physical documents.",
      outcome: "40% reporting performance improvement, roughly 50% reduction in manual audit time, and 99.9% uptime across continuous 20+ day assessment cycles on on-premise and hybrid infrastructure.",
      tradeoff: "The consolidated cross-stage report keeps outer joins deliberately: a script assessed but not yet reviewed must still appear, showing the gap. The narrower join is faster and silently hides exactly the scripts an administrator most needs to see. Correctness won, and the performance had to be recovered through indexing instead.",
      stack: ["SQL Server", "T-SQL", "SSIS", "SSRS", "Python", "Windows Server"],
      links: []
    },
    {
      id: "furniture", published: true, tier: "owned", no: "05",
      kicker: "Freelance delivery", sector: "Retail",
      title: "Furniture World business management system",
      summary: "Full-lifecycle solo delivery — requirements, design, database, development, testing, deployment and user training — replacing paper record-keeping with a centralised digital system.",
      strip: ["Requirements", "Database design", "Build", "Testing", "Deployment", "Training"],
      metrics: [{ value: "6", label: "modules delivered" }, { value: "1", label: "person, end to end" }],
      context: "A retail business running customers, stock, billing, sales and purchasing on paper, with no single place any of it could be read from.",
      constraint: "Solo delivery, including the parts engineers usually hand off: user training and the transition off paper.",
      architecture: "VB.NET with MySQL. Six modules — customer management, inventory, billing and invoicing, sales, purchase records and reporting.",
      rollout: "January to December 2017, requirements through to training.",
      outcome: "Manual paper-based record-keeping replaced by a centralised digital system.",
      tradeoff: "Nine years on, the stack is dated. It stays on this record because alongside the ERP it is one of only two engagements where I hold genuine conceive-and-deploy credit, and it is the proof that a delivery can be owned end to end without a team around it.",
      stack: ["VB.NET", "MySQL"],
      links: []
    },
    {
      id: "jobintel", published: true, tier: "owned", no: "06",
      kicker: "Python engineering", sector: "Personal tooling",
      title: "Job intelligence & self-knowledge system",
      summary: "A nine-module Python project combining job-posting lifecycle tracking with a personal skills knowledge base. Built and verified end to end.",
      strip: ["ATS fetchers", "Relevance scoring", "SQLite lifecycle", "Gap rollup", "Excel export"],
      metrics: [{ value: "9", label: "modules" }, { value: "3", label: "CLI commands" }],
      context: "Tracking job postings across companies means tracking a lifecycle — appeared, still open, closed — not just a snapshot, and knowing which skills a posting wants that you do not yet have.",
      constraint: "Postings must upsert by stable key across runs, or the lifecycle feature produces duplicates instead of history.",
      architecture: "Separated by responsibility: config, db, sources, relevance, knowledge, report, main. ATS platforms — Greenhouse, Lever, Ashby — expose free public JSON endpoints, so consuming those is structurally better than scraping LinkedIn or Indeed: no anti-bot surface, stable schema, no terms-of-service exposure.",
      rollout: "SQLite chosen over Excel as the engine precisely because of the upsert requirement, with an Excel export layer preserving the human-readable view. Migration to Azure SQL is a connection-function swap.",
      outcome: "Verified working: relevance scoring returning matched and missing skills, lifecycle close detection, and skill gap logging.",
      tradeoff: "Keyword-based relevance scoring is crude next to embedding similarity. It is also explainable, debuggable and free, which for a tool with one user is the better trade.",
      stack: ["Python", "SQLite", "Pandas", "openpyxl"],
      links: []
    },
    {
      id: "backup", published: true, tier: "owned", no: "07",
      kicker: "Operations tooling", sector: "Platform",
      title: "Database backup manager",
      summary: "Python service automating database backup operations to remove human error from the step everyone assumes is already handled.",
      strip: ["Backup agent", "Verification", "Retention policy", "Status logging"],
      metrics: [],
      context: "Backups that are taken but never verified are a false sense of security; backups with no retention policy quietly fill a volume until something else breaks.",
      constraint: "Operational visibility matters as much as the backup itself — an unmonitored job that stopped running six weeks ago is worse than no job.",
      architecture: "Structured as agent, core and services layers with automated tests. Pipeline: database → backup agent → backup file → verification → retention policy → logging and status.",
      rollout: "In use for APT database operations.",
      outcome: "Backup, verification and retention automated with status reporting rather than assumed.",
      tradeoff: "Verification currently confirms the backup file, not a full restore rehearsal. A restore drill is the only real proof, and that is the next thing to add.",
      stack: ["Python"],
      links: []
    },
    {
      id: "aitutor", published: true, tier: "academic", no: "08",
      kicker: "Applied AI", sector: "Drexel University",
      title: "RAG-based AI tutor",
      summary: "Retrieval-augmented educational assistant built independently, grounding LLM responses in indexed academic material.",
      strip: ["Ingestion", "Chunking", "Embedding", "Semantic retrieval", "Grounded generation"],
      metrics: [],
      context: "In an educational setting a confidently wrong answer is worse than no answer, which makes hallucination the central problem rather than a side effect.",
      constraint: "Responses must be constrained to retrieved source text rather than model priors.",
      architecture: "Python and LangChain. Document ingestion, chunking, embedding generation, semantic retrieval against the query, then generation grounded in retrieved context.",
      rollout: "Built independently as MS coursework.",
      outcome: "Working pipeline, evaluated qualitatively against a set of representative questions.",
      tradeoff: "Qualitative evaluation is the honest description of what was done. Without a labelled answer set there is no retrieval precision figure, and I am not going to invent one.",
      stack: ["Python", "LangChain", "Embeddings", "Vector search"],
      links: []
    },
    {
      id: "embedviz", published: true, tier: "academic", no: "09",
      kicker: "Team research", sector: "Drexel College of Engineering",
      title: "Embedding visualisation platform — backend",
      summary: "Team research project converting over a million microscopy images into 2-D embeddings. My scope was the backend, the data pipeline, testing and cross-team coordination — stated precisely because the rest of it was not mine.",
      strip: ["FastAPI", "Data pipeline", "Testing", "Coordination"],
      metrics: [],
      context: "A research platform for exploring semantic relationships across a very large image corpus, led by Chirayu Patel as research assistant work at Drexel College of Engineering, 2024–2025.",
      constraint: "A team project with clearly divided ownership. The scope boundary below is the accurate one and it does not move.",
      architecture: "My contribution: the FastAPI backend and API layer, the data pipeline feeding it, testing, documentation and cross-team coordination.",
      rollout: "Not mine: the GPU and cuML accelerated processing, and the React and PixiJS visualisation frontend. Those belong to other members of the team.",
      outcome: "The platform converted over one million microscopy images into 2-D embeddings. My deliverable within it was the backend and pipeline.",
      tradeoff: "It would be easy to describe this project by its most impressive component. That component is not mine, and a portfolio that claims it is one verification call away from being worthless.",
      stack: ["Python", "FastAPI"],
      links: []
    },
    {
      id: "portal", published: true, tier: "academic", no: "10",
      kicker: "Coursework", sector: "Drexel University",
      title: "University data submission portal",
      summary: "ASP.NET Core Web API with JWT authentication and role-based access control for centralised, validated data submission and administrative review.",
      strip: ["Web API", "JWT", "RBAC", "Validation"],
      metrics: [],
      context: "Departmental data submission handled through spreadsheets and email, with no validation at the point of entry and no review trail.",
      constraint: "Validation has to happen at submission, not at review, or the review queue becomes the cleaning step.",
      architecture: "ASP.NET Core Web API, JWT authentication, role-based access control separating submitter from reviewer.",
      rollout: "Built as MS coursework.",
      outcome: "Centralised, validated submission with an administrative review path.",
      tradeoff: "Scoped as coursework — it was not deployed into a real departmental workflow, and I am describing it as what it is.",
      stack: ["C#", "ASP.NET Core", "JWT"],
      links: []
    }
  ],

  /* ==========================================================================
     INCIDENT — the six-stage resolution pattern.
     The strongest single interview artifact on the record.
     ====================================================================== */
  incident: {
    label: "Production incident",
    title: "A reporting discrepancy, mid-cycle, with no downtime available",
    situation: "A recurring reporting discrepancy surfaced during an active assessment cycle. Assessors were working, scripts were moving, and the system could not be taken down.",
    cause: "Three interacting factors, not one bug: complex business rules, data inconsistencies, and SQL query performance bottlenecks.",
    steps: [
      { no: "01", name: "Analyse the whole workflow", line: "End to end, rather than the symptom that was reported." },
      { no: "02", name: "Trace through the procedure layer", line: "Follow the discrepancy down into the stored procedures actually producing it." },
      { no: "03", name: "Optimise joins and indexes", line: "Address the performance component of the failure." },
      { no: "04", name: "Correct the business logic", line: "Address the correctness component, which the performance fix would otherwise have hidden." },
      { no: "05", name: "Validate with stakeholders", line: "Confirm the corrected output against expectation before release, not after." },
      { no: "06", name: "Deploy without disruption", line: "Released into a live assessment cycle with no interruption to activity." }
    ],
    why: "The sequencing is the point. Fixing performance without fixing logic produces fast wrong answers. Fixing logic without fixing performance produces correct answers too late to be useful mid-cycle. The incident required both, under a no-downtime constraint.",
    note: "Further incidents of this class — workflow, API integration and database performance — are being written up in the same six-stage form."
  },

  /* ==========================================================================
     REPORTING — surfaces delivered and in build. This section grows.
     shape: bars | line | stack   ·   series: plain numbers, drawn to scale
     ====================================================================== */
  reporting: [
    { id: "consolidated", title: "Consolidated operational report", module: "Assessment platform · reporting",
      line: "Allocation, assessment, review and outcome state in one view — including the scripts stuck between stages.",
      shape: "bars", series: [62, 71, 68, 80, 76, 88, 84], unit: "exam cycle", state: "live" },
    { id: "candidate", title: "Candidate & subject outcome summaries", module: "Assessment platform · results",
      line: "Candidate-level and subject-level consolidation after identity is rejoined.",
      shape: "line", series: [18, 26, 31, 44, 52, 61, 73, 79], unit: "declaration", state: "live" },
    { id: "faculty", title: "Faculty-wise reporting", module: "Assessment platform · reporting",
      line: "Assessment progress and workload by faculty, for administrators mid-cycle.",
      shape: "bars", series: [40, 55, 48, 63, 58, 72, 66], unit: "faculty", state: "live" },
    { id: "moderation", title: "Review & re-assessment reporting", module: "Assessment platform · review",
      line: "Institution-specific reporting across the two highest-scrutiny workflows in the platform.",
      shape: "stack", series: [55, 62, 58, 70, 66, 74], unit: "institution", state: "live" },
    { id: "anomaly", title: "Outcome anomaly detection", module: "Assessment platform · automation",
      line: "Python and SQL utilities flagging calculation anomalies — roughly half the manual audit time removed.",
      shape: "line", series: [22, 19, 24, 16, 13, 15, 9, 11], unit: "anomalies", state: "live" },
    { id: "payroll-run", title: "Payroll run summary", module: "ERP · payroll",
      line: "Component totals and statutory split per run, locked once the run closes.",
      shape: "bars", series: [33, 47, 41, 58, 51, 64, 60], unit: "run", state: "build" },
    { id: "cost-budget", title: "Cost against budget", module: "ERP · projects",
      line: "Committed and actual cost per site, read while the work is still running.",
      shape: "line", series: [12, 24, 29, 41, 50, 58, 70, 77], unit: "% of budget", state: "build" },
    { id: "gst-position", title: "GST position", module: "ERP · accounts",
      line: "Output and input tax by period against filed returns.",
      shape: "stack", series: [45, 52, 48, 60, 56, 64], unit: "period", state: "scope" }
  ],

  /* --- capability, with honest confidence levels -------------------------- */
  capability: [
    { no: "01", name: "Relational database engineering", confidence: "Very high",
      line: "The deepest thing I do. Schema, tuning, and the reporting layer on top.",
      items: ["SQL Server · T-SQL", "Stored procedures, views, UDFs", "Execution-plan tuning", "Indexing strategy", "SSIS", "SSRS", "PostgreSQL"] },
    { no: "02", name: ".NET backend", confidence: "Very high",
      line: "Web applications and service layers across a production estate.",
      items: ["C#", "ASP.NET · ASP.NET Core", "Web API · REST", "ASP.NET Identity", "VB.NET (legacy)"] },
    { no: "03", name: "Security & identity", confidence: "High",
      line: "The part that keeps an enterprise buyer in the room.",
      items: ["OWASP secure coding", "JWT + refresh lifecycle", "RBAC & claims authorisation", "2FA / MFA", "Audit logging", "Least privilege", "Security review & remediation"] },
    { no: "04", name: "Node & frontend", confidence: "High",
      line: "The ERP stack — chosen over .NET deliberately, not by default.",
      items: ["Node.js · TypeScript", "Express", "React · Vite", "JavaScript", "HTML · CSS"] },
    { no: "05", name: "Python engineering", confidence: "High",
      line: "Automation, reporting and the tools that remove manual work.",
      items: ["Automation & scripting", "Pandas", "Anomaly detection", "FastAPI", "OCR prototyping"] },
    { no: "06", name: "ETL & high-volume pipelines", confidence: "High",
      line: "Millions of scanned pages per cycle, with I/O as the design constraint.",
      items: ["SSIS", "High-volume ingestion", "I/O optimisation", "Legacy data migration", "Multi-campus consolidation"] },
    { no: "07", name: "Multi-tenant SaaS", confidence: "High · active",
      line: "Tenant→Organization modelling and the migration onto it.",
      items: ["Two-level tenancy", "tenant_id retrofit migration", "Trial provisioning", "Shared-core extension points"] },
    { no: "08", name: "Applied AI", confidence: "Moderate · academic + daily practice",
      line: "Used in the work, daily. Stated at the level it is actually true.",
      items: ["RAG · LangChain", "Embeddings & vector search", "AI-assisted engineering", "Prompt engineering", "LLM applications"] },
    { no: "09", name: "Operations & delivery", confidence: "High",
      line: "Running the thing, not only building it.",
      items: ["Production support, live cycles", "Windows Server · SQL clusters", "On-premise & hybrid deployment", "Business process automation", "Requirements & scoping", "Stakeholder validation"] }
  ],

  /* --- AI-assisted engineering — stated as practice, with the caveat ------ */
  aiPractice: {
    title: "AI-assisted engineering",
    line: "Disciplined practice rather than casual tool use.",
    items: ["Initial code drafts, reviewed and productionised by me", "Complex SQL and application debugging", "Architecture brainstorming and trade-off validation", "Technical and API documentation", "Accelerated framework learning", "Code-quality review and refactoring", "Test-case generation", "Security best-practice research", "Proof-of-concept construction ahead of production builds"],
    caveat: "All engineering decisions, implementation, testing and deployment remain mine. That caveat is the pitch, not a hedge on it."
  },

  /* --- track -------------------------------------------------------------- */
  track: [
    { period: "2020 — present", org: "APT Solutions", role: "Technology & Operations Manager",
      place: "Vadodara, India",
      line: "Technology and business operations as a combined remit across a high-volume assessment platform: primary ownership of enterprise reporting, authentication and database architecture; contributing member across the assessment workflow modules; production support through live cycles. Registered with Drexel as co-op placement during the MS.",
      tags: ["Assessment technology", "Database engineering", "Enterprise reporting", "Operations"] },
    { period: "Ongoing", org: "Dot Logic India", role: "Architecture & delivery",
      place: "Independent practice",
      line: "End-to-end delivery of enterprise systems outside my employed work — the multi-tenant SaaS ERP and the operations tooling around it. Architecture, build, security review and deployment, owned start to finish.",
      tags: ["Multi-tenant SaaS", "End-to-end delivery", "Automation"] },
    { period: "2018 — 2019", org: "Scan Plus Technologies", role: "IT Support Engineer",
      place: "India",
      line: "Enterprise network health management for corporate clients, automated backup configuration, and proactive system health monitoring and troubleshooting.",
      tags: ["Infrastructure", "Backup", "Monitoring"] },
    { period: "2017", org: "Furniture World", role: "Freelance · Full-lifecycle delivery",
      place: "Independent",
      line: "Solo delivery of a six-module business management system from requirements through to user training.",
      tags: ["VB.NET", "MySQL", "End-to-end"] }
  ],

  education: [
    { period: "2023 — 2025", name: "Drexel University", qual: "MS · Data Science",
      place: "Philadelphia, PA", note: "Awarded 14 June 2025 · GPA 3.56 · Graduate Co-op Option" },
    { period: "2019 — 2021", name: "National Institute of Business Studies", qual: "MBA · Marketing",
      place: "New Delhi", note: "" },
    { period: "2016 — 2019", name: "National Institute of Business Studies", qual: "BBA",
      place: "New Delhi", note: "" },
    { period: "2013 — 2016", name: "National Institute of Business Studies", qual: "Diploma · Computer Science Engineering",
      place: "New Delhi", note: "" }
  ],

  /* Graduate coursework — from the official transcript, so every grade here
     is verifiable. Shown as evidence for the academic tier claims.          */
  coursework: [
    { code: "DSCI 631", name: "Applied Machine Learning", grade: "A+" },
    { code: "DSCI 632", name: "Applied Cloud Computing", grade: "A+" },
    { code: "DSCI 592", name: "Data Science Capstone II", grade: "A+" },
    { code: "INFO 606", name: "Advanced Database Management", grade: "A" },
    { code: "INFO 607", name: "Applied Database Technologies", grade: "A" },
    { code: "CS 614",   name: "Applications of Machine Learning", grade: "A" },
    { code: "DSCI 501", name: "Quantitative Foundations", grade: "A" },
    { code: "DSCI 521", name: "Analysis and Interpretation", grade: "A" },
    { code: "DSCI 691", name: "NLP with Deep Learning", grade: "A−" },
    { code: "MIS 632",  name: "Database Analysis & Design for Business", grade: "A−" },
    { code: "DSCI 591", name: "Data Science Capstone I", grade: "A−" },
    { code: "INFO 633", name: "Information Visualization", grade: "A−" }
  ],

  /* --- not yet published --------------------------------------------------
     Entries with confirm: true are not rendered. Working notes for these
     live outside the repository.                                          */
  gated: []
};
