# Learning model

The Linux practice sequence has four SIMULATED incidents across two causal families plus two bounded changed-evidence assessment steps.

1. Guided file access: nginx worker `www-data` receives HTTP 403 for a root-owned file mode 600. Learner collects HTTP symptom, file mode and worker identity, records a `permission` hypothesis, applies the minimal public-page read repair and verifies HTTP. The mechanism explanation is `other-read`.
2. Permission transfer: `report-worker` is a supplementary member of group `web`. Copying the memorized 644 repair makes HTTP healthy but fails least-access assessment; 640 is required because the report is group-private. The mechanism explanation is `group-read`.
3-4. Same-symptom health differential pair: client gets connection refused at 127.0.0.1:8080. Learner-facing title, summary, README and diagnostic commands do not disclose the hidden cause. One case shows a running api-server on 9090 and requires a `network` hypothesis before reconfiguring the listener. The competing case shows no api-server process/listener and requires a `process` hypothesis before starting the service on 8080.

The two health causes do not occupy fixed positions. A practice assignment stores `listener-first` or `process-first` plus differential step 0/1. Either cause can appear first. Current-case reset keeps the assignment; full restart selects a fresh one at the browser boundary. Simulator behavior remains deterministic after assignment. Independent Web Crypto selection can repeat an order, so this is randomized exposure rather than guaranteed alternation or statistical counterbalancing.

LabState distinguishes observations from inferred conclusions. TCP service state separately models process presence and listening port. The hypothesis is typed but only known causal classes `permission`, `process` and `network` are accepted. Repair syntax stays hidden until the hypothesis is locked. Explanation requires three source-linked factual claims, exactly two identity/resource sources supporting a typed mechanism and a minimal target. Wrong source/fact/support/target cannot be rescued by a correct mechanism label.

## Changed-evidence transfer A: permission identity

After the private report is repaired to mode 640 and explained as group-read, original identity/file sources remain fixed evidence. The hypothetical keeps file owner/group `root:web` and mode `640` but removes `report-worker` from supplementary group `web`. The learner must predict HTTP `403`, that an access change is still `required`, and causal relation `group-membership-required`. This gate is required before entering differential diagnosis and remains required throughout later progression.

## Changed-evidence transfer B: listener target

After a correct explanation of the wrong-listener case, original evidence remains process present and socket listening on 9090. The hypothetical changes only the socket observation to 127.0.0.1:8080. The learner must predict HTTP `200`, no remaining listener repair (`none`) and causal relation `listener-target-match`. Listener-first cannot advance to the second health case before the gate; process-first cannot complete the practice until it passes.

For both gates, editing the related explanation or transfer draft revokes dependent completion. Resetting the source case clears its own transfer state; later cases may preserve already-passed canonical gates. A wrong causal hypothesis cannot earn verified completion even if the learner later runs the correct repair and makes the endpoint healthy. Blind repair cannot retrospectively create before-repair evidence.

Persistence uses practice schema version 7 / Linux fixture version 5. Schema-v6 and older checkpoints are discarded because permission-transfer/progression state changed; fixture version remains 5 because incident definitions and command output did not. Validator rejects order/step/scenario contradictions, cross-case TCP tuples, invalid evidence/reasoning, forged transfer answers and impossible carry. Every differential checkpoint must contain a canonical passed permission gate; final completion also requires the listener gate.

Learning limits remain substantial. Two fixed perturbations across different relations are stronger than one memorized listener token, but both can still be memorized and retried; strict tokens can fail separately from conceptual understanding; the corpus is tiny; localStorage is forgeable; and the simplified models omit many production mechanisms. Passing current gates is assisted local practice, never authoritative mastery/certification.

Playwright dependency reproducibility and Git/CI breadth are delivered. Pre-repair source-linked Git rationale is delivered. The graph causality slice is delivered. The next frontier is one mechanism-first Git foundations lesson leading into existing revision/graph practice, using different teaching fixtures and preserving assessment gates.


## Git & CI vertical slice — producer/consumer contract

The Git & CI practice begins with a neutral failed downstream pipeline symptom. The learner cannot lock a hypothesis until three pre-repair sources are captured: workflow structure, producer job output and consumer failure output. This preserves the same instructional invariant as the Linux labs: observation precedes causal commitment.

The original incident is intentionally not graded by pipeline color alone. The minimally sufficient mapping repair can make the simulated pipeline green after either a correct or incorrect locked hypothesis. Only a correct artifact-contract diagnosis made from complete pre-repair evidence produces `verified=true`. This separates operational recovery from demonstrated diagnostic reasoning.

After verification, the learner must submit a source-linked explanation using the canonical workflow, producer and consumer source IDs and facts. The required mechanism is the producer/consumer artifact-name contract, not a generic statement that CI was misconfigured.

The changed transfer uses a different failure representation. The artifact name matches, but the producer archive retains a nested relative path while the consumer assumes a flatter extraction result. The learner must derive the post-extraction path and identify the path-preservation relation. Reusing the original name-mapping token fails.

This remains assisted deterministic practice. It demonstrates completion of a bounded Git/CI reasoning exercise; it does not prove Git mastery, general CI transfer or production readiness.


## Git revision causality and annotated-tag transfer — PR #30

A green release with unmet acceptance presents neutral copy. Five pre-repair sources distinguish cache/target hypotheses from checkout selection. Build-start ref snapshot plus actual checkout/metadata SHA and approved intent establish the consumed-revision relation. Repair choices open only after immutable class and factual-rationale lock. Every repair may leave pipeline green, but only pinning the approved immutable commit changes consumed SHA. A separate verify action checks checkout and metadata against intent; even matching SHA after wrong class, source ID, fact or relation cannot verify learning.

Five explanation source/fact pairs independently validate, then one changed transfer replaces branch -> commit with annotated tag object -> commit while main advances. The learner selects immutable target COMMIT, not original SHA, tag object or current branch. Exact grammar is visible, finite and retryable. Editing explanation or transfer revokes downstream pass; reset/rebuild/reverification revoke affected work and refresh validates semantic consistency.

PR #32 closes label-only pre-repair guessing: five captured source/fact pairs and a causal relation are committed with the class before repair. Complete wrong rationale can lock without grader feedback, but cannot verify learning even after correct repair. Post-repair explanation cannot rescue it. The draft persists before lock and is immutable after lock until reset. Grammar remains finite, visible and retryable, so copying a complete rationale or forging consistent local state remains possible. This is assisted local learning, not trusted mastery or arbitrary prose evaluation.



## Graph causality and changed integration policy — PR #34

Six independent observations precede immutable class/rationale commitment. The initial request requires ordered base/PR-head direct parents and consumed integration revision; a green PR-head build or two-parent commit containing a different head cannot satisfy it. Wrong factual reasoning remains unverified after correct recovery; later explanation cannot rewrite the lock.

Transfer changes to a linear replayed series. Approved base is an ancestor through two edges while original PR-head identity is absent. The learner must distinguish parent count, ancestry and reviewed change series; an extra-change descendant fails despite preserving ancestry. These are deterministic synthetic exercises with visible finite grammar, not a general Git/rebase competence test. A foundations lesson should precede claims of a coherent near-zero learning path.


## Git foundations lesson before graph assessment — 2026-10-06

A near-zero learner now gets an explicit teaching sequence before the graph diagnostic form:

1. **Snapshot identity** — a commit identifies an immutable snapshot; a branch name is not the snapshot itself.
2. **Moving ref** — a branch ref can resolve to different commits over time while an existing commit identity remains fixed.
3. **Direct parent** — a direct parent is exactly one parent edge away; ordered parent lists are properties of a concrete commit and any delivery policy must be read from its actual contract.
4. **Ancestry** — an ancestor may be reachable through multiple parent edges and is not synonymous with direct parent.

The lesson graph uses IDs that are disjoint from the graph incident/transfer fixtures. Its four-question readiness self-check is finite, visible, retryable and deliberately non-credit. Passing it only reveals navigation into the existing graph diagnostic lab; it does not set or infer diagnosis, verified, explanation or transfer state. A production browser invariant compares the full persisted Git/CI practice state before and after lesson use and requires exact equality.

This closes a preparation gap, not a mastery gap. The assessment still has finite grammar and substantial SHA transcription, and the lesson self-check itself can be guessed. General Git competence, production debugging and trusted certification remain unsupported claims.
