**Going Deeper — Change Log**

*Fellowship of the Heart — Series 2 of 3*

*Editorial pass per the user's May 2026 review decisions*

# What this delivery is

16 Going Deeper documents after a two-phase editorial pass:

- Phase A — silent mechanical vocabulary normalization. ~292 word-by-word replacements across the bundle, applied silently because every substitution was pre-approved.
- Phase B — tracked substantive edits. One tracked change in the handbook (Three Taxonomies disambiguation in Appendix C), visible in Word's Review pane with 'Claude' as author.

All 16 files validate as well-formed. The handbook visually renders correctly with tracked changes (verified via PDF export).

# Why so few substantive edits

Three of the four planned substantive edits were dropped after closer inspection of the actual content — the original consistency review was somewhat more pessimistic than the corpus warranted. Specifically: the Hebrews 12 architecture is NOT repeatedly restated across the weeks (only Wks 1, 12, and the handbook carry the full architecture); the co-processing forward reference in Wk 3 already has appropriate bridge sentences; and the GD handbook doesn't reference Inviting Others at all. See the 'Considered changes that were intentionally not made' table below for full reasoning.

# Canonical vocabulary applied

| **Concept** | **Old forms** | **Canonical (applied)** |
| --- | --- | --- |
| Third volume | Sent / Sent series / Sent semester / Spring series / bare 'Sent' as volume | Going Out |
| Team role (lead, prose) | Facilitator / facilitator | Companion |
| Team role (lead, run sheet) | Lead Fac | Lead Comp |
| Team role (cohort, run sheet) | Co-Fac (T) / Co-Fac (P) | Teen Comp / Parent Comp |
| Team role (junior, run sheet) | Co-Fac | Co-Comp |
| Plural Companions | Facilitators / facilitators | Companions |
| Document header | FACILITATOR LESSON PLAN | COMPANION LESSON PLAN |
| Four Connects (with article) | the Four Connects | the four Connects |

Notable for GD: the third volume's name needed three passes of cleanup. The initial bare-Sent regex was too conservative (it required 'Sent series', 'Sent semester', etc.), so a second pass caught common volume contexts ('Sent begins', 'enter Sent'), and a final broad pass cleaned up remaining bare references. After verifying no verb-context 'Sent' instances existed, the final pass was safe to do as a blanket replacement.

# Per-file mechanical edit counts (Phase A — silent)

The GD bundle had ~292 mechanical edits total. The two heaviest files were the handbook and Wk 12 (Sending and Bridge), which contain the most cross-volume references.

| **File** | **Silent edits** |
| --- | --- |
| FotH\_GD\_Handbook\_v1\_2\_Master.docx | 52 (35 + 16 bare-Sent + 1 final pass) |
| GD\_Wk1\_WelcomeBack.docx | 13 |
| GD\_Wk2\_Soils.docx | 11 |
| GD\_Wk3\_Knots.docx | 13 |
| GD\_Wk4\_CoProcessing.docx | 11 |
| GD\_Wk5\_Confession.docx | 13 |
| GD\_Wk6\_PROAPT.docx | 12 |
| GD\_Wk7\_CorporateListening.docx | 13 |
| GD\_Wk8\_GroupHearsItself.docx | 16 |
| GD\_Wk9\_ShadowMission.docx | 12 |
| GD\_Wk10\_CallingDiscernment\_v2.docx | 14 (12 + 1 + 1) |
| GD\_Wk11\_WhereIsOurCohort.docx | 17 |
| GD\_Wk12\_SendingAndBridge\_v2.docx | 93 (60 + 7 + 26) |
| IJH\_Family\_Conversation\_Cards.docx | 0 |
| IJH\_Reading\_List.docx | 2 |
| IJH\_Rhythm\_Card.docx | 0 |

# Substantive tracked edits (Phase B — review-visible)

| **Location** | **What changed (tracked)** |
| --- | --- |
| Handbook Appendix C | Inserted Three Taxonomies disambiguation note as the appendix's opening — clarifying the three different five-level frameworks (Affective Taxonomy / Group Level taxonomy / Leader Level taxonomy) so a session reference like 'Level 3' is unambiguous. |

This is the only substantive tracked edit needed in GD. The weekly sessions needed only mechanical work.

# Considered changes that were intentionally not made

| **Considered change** | **Why not applied** |
| --- | --- |
| Hebrews 12 consolidation across weeks | Originally proposed in the review report as 'full architecture restated in 5+ places.' On closer inspection, only Wks 1 and 12 (and the handbook) contain the full Hebrews 12 architecture diagram. Wks 2, 3, 4, 5 reference SPECIFIC CLAUSES of Hebrews 12 (e.g., 'weight' vs 'sin' in Wk 3) as they relate to that week's diagnostic or therapeutic work. That is appropriate teaching scaffolding, not redundancy. No condensation warranted. |
| Co-processing forward reference in Wk 3 | Originally flagged as missing bridge sentence. On closer inspection, Wk 3 already contains explicit forward references: 'Wk 4 (next week) is Co-Processing in the Room — the corporate mechanism...' and 'Next Tuesday is Wk 4 — Co-Processing in the Room.' The bridge is already present. No edit needed. |
| Acts 13 pre-introduction | Acts 13 is named in Wk 10's lesson title and is referenced briefly earlier as a forward concept ('the Acts 13 mode'). No misleading anchor references that would confuse a first-time reader. |
| Section 10 Inviting Others repositioning | GD handbook doesn't reference Inviting Others — that repositioning work was specific to the GS handbook. No edit needed here. |
| Author letter trimming | GD's letter from John is substantively different from GS's — it specifically prepares the reader for the harder work of the second movement. Considered for trimming but the content is mostly non-redundant. Leave as-is. |
| Run sheet column header 'Lead' or 'Min' | Minor formatting; the column header is set per session and doesn't follow a uniform global pattern; tracked-edit cost too high for the small clarity benefit. |

# Known follow-ups / open items

- Word's TOC in the handbook may show stale page numbers after these edits. Refresh: right-click in the TOC, choose 'Update Field' → 'Update entire table'.
- Tracked change is attributed to 'Claude' as author. Change in Word's Review tab if preferred.
- The Three Taxonomies disambiguation was inserted as plain text paragraphs (not styled heading) for the same reason as the GS 'A note on Inviting Others' insertion — tracked-insert headings render inconsistently. On accept, the first paragraph ('A note on the three Level taxonomies in the IJH corpus.') can be promoted to a Heading 3 style for hierarchical clarity.
- Going Out / Sent series remains to be processed in the next round.

# How to review

- Open FotH\_GD\_Handbook\_v1\_2\_Master.docx in Word.
- Go to Review → All Markup to see the one tracked change inline.
- Step through with Next / Previous. Accept or reject.
- Mechanical edits do not appear in Review — they're already applied.
