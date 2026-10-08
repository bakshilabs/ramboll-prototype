# Marketing Assets Intelligence System: Slide Text

All on-screen text from the 17 slides, in order. Labels that float over the 3D scene are listed under "3D labels". Text that is part of the imagery, such as poster copy, is listed under "In the imagery". All figures are illustrative.

---

## 01. Cover

FOR DISCUSSION · OCTOBER 2026

# Marketing Assets Intelligence System

An intelligent creative operating system for multi-brand architecture and design groups.

Concept prototype · Press → to begin · P to play

**In the imagery:** launch poster reading "A pavilion for the long light." · HARBOUR PAVILION · OPENING JUNE 2026 · STUDIO 03 · CULTURAL

---

## 02. Fragmented Universe

CHAPTER 01 · THE STARTING POINT

**Fragmented Universe**

Every studio and region has built its own archives, project folders, conventions and storage over many years.

| Figure | Label |
|---|---|
| 2.4M | Creative assets |
| 14 | Storage systems |
| 6 | Studio brands |
| 9 | Regions |
| 31 | Naming conventions |

Illustrative figures for a design group with six architecture studios.

**3D labels**
- Cloud drive · EMEA · 412,880 files
- DAM · North America · 690,214 files
- Local server · APAC · 238,507 files
- Project folders · Middle East · 171,936 files
- Competition archive · Global · 96,412 files
- Render and film library · Visualisation team · 58,330 files
- Brand books and monographs · 6 studios · 4,918 files
- Social archive · 31 accounts · 702,151 files

---

## 03. Asset Understanding

CHAPTER 02 · THE SYSTEM SEES

**Asset Understanding**

Vision and language models read the contents of every file, so each asset is described by what it shows.

**Counter:** Assets analysed · 2,412,906 · of 2,412,906 · 14 sources connected

**Panel: Global creative index · Analysing**

Detection boxes on the poster: Headline · 0.99 · Building · 0.98 · Logo · 0.97 · Reflection · water

| Attribute | Value |
|---|---|
| Objects | Pavilion, cantilevered roof, water |
| Project | Harbour Pavilion, cultural, 2026 |
| Logo | Studio 03 arch mark, clear space met |
| Typography | Display 600, sentence case |
| Palette | Five swatches: #16384a, #5c93ad, #e9b892, #f3d8bf, #4e9bc4 |
| Layout | Building on lower third, copy top left |
| Scene | Dusk on water, interior lit |
| Campaign | Pavilion launch (inferred 0.93) |
| Region | Nordics (inferred 0.88) |
| Related | 214 renders, drawings and photographs |

---

## 04. Statement

Fragmented creative intelligence

BECOMES

**structured knowledge**

---

## 05. Organised Library

CHAPTER 03 · CHAOS BECOMES STRUCTURE

**Organised Library**

Assets arrange themselves by studio, project and type, using the meaning the system extracted from each one.

**Panel: Taxonomy · v1.0**

Studio → Project → Region → Channel → Asset type

| Measure | Value |
|---|---|
| Naming conventions reconciled | 31 → 1 |
| Duplicate files found | 186,402 |
| Metadata fields written | 9.6M |
| Assets with rights expiring this quarter | 3,914 |

**3D labels**
- Studio 01 · Workplace · 402,118 assets
- Studio 02 · Hospitality · 377,940 assets
- Studio 03 · Cultural · 431,806 assets
- Studio 04 · Residential · 396,215 assets
- Studio 05 · Civic · 409,772 assets
- Studio 06 · Interiors · 395,055 assets

---

## 06. Creative Graph

CHAPTER 04 · THE CREATIVE GRAPH

**Creative Graph**

Studios, projects, campaigns, regions and guidelines become nodes in one connected map of the organisation.

**Step 1, 3D labels:** Design group · 6 studios · 18 campaigns · Studio 01 Workplace · Studio 02 Hospitality · Studio 03 Cultural · Studio 04 Residential · Studio 05 Civic · Studio 06 Interiors · Nordics · DACH · UK & Ireland · France & Benelux · Iberia · CEE · North America · Middle East · APAC

**Step 2**

One launch render traced through nine relationships the system discovered.

01 Image → 02 Project → 03 Brand → 04 Campaign → 05 Region → 06 Market → 07 Style → 08 Guideline → 09 Usage

| Relationship | 3D label |
|---|---|
| Image | Launch render · dusk |
| Project | Harbour Pavilion |
| Brand | Studio 03 |
| Campaign | Pavilion launch |
| Region | Nordics |
| Market | Norway |
| Style | Dusk on water |
| Guideline | Photography · p.05 |
| Usage | Social |

---

## 07. Statement

Structured knowledge

BECOMES

**machine-readable brand intelligence**

---

## 08. Codified Guidelines

CHAPTER 05 · GUIDELINES BECOME INTELLIGENCE

**Codified Guidelines**

The 48-page Studio 03 guideline is translated into rules that software can check and apply.

Five steps, one revealed at a time:

**01 Human guideline**
> "Basalt leads every layout. Copper is an accent and never covers more than 15 per cent of a frame."
>
> Studio 03 guidelines · page 03

**02 Structured rules**
```
rule: colour.accent_coverage
applies_to: [static, motion]
measure: area_ratio(copper)
max: 0.15
severity: block
```

**03 Creative logic**
```
if channel == "ooh" and region == "nordics":
    require(planning_disclaimer)
if photo.people.staged:
    reject("guideline 05")
photo.verticals == "corrected"
```

**04 Machine-readable skills**
```
skill: studio03.colour
version: 2.4
inputs: [layout, palette, channel]
rules: 18    checks: 9
examples: 412 approved assets
```

**05 AI agent**
```
agent.invoke("studio03.colour",
    asset="pavilion_story_v3")
→ pass · accent 11% · contrast 7.2:1
```

**In the imagery:** six Studio 03 guideline pages.

| Page | Rule |
|---|---|
| 02 Logo | Clear space equals the height of the arch. Minimum width 24 px on screen, 12 mm in print. |
| 03 Colour | Basalt leads every layout. Copper is an accent and never covers more than 15 per cent of a frame. Swatches: Basalt, Fjord, Copper, Salt, Stone. |
| 04 Typography | Headlines in Display 600, sentence case, two lines at most. Body copy never below 9 pt. |
| 05 Photography | Natural light and corrected verticals. People appear for scale only and are never staged. |
| 06 Layout | The building sits on the lower third. Copy aligns to the left margin of the 12-column grid. |
| 07 Tone of voice | Precise and calm. We describe space, light and material, and we avoid superlatives. Example: ✓ "A pavilion for the long light." ✕ "The most iconic building ever". |

Skill modules: Typography · Colour · Photography · Layout · Logo · Motion · Tone · Localisation · Campaign

---

## 09. Creative Skills

CHAPTER 06 · SKILLS

**Creative Skills**

A skill packages one part of a brand's behaviour so that any agent can load it and act on it.

**Panel: Skill · studio03.colour · v2.4**

**Colour**

| Field | Value |
|---|---|
| Purpose | Keeps every layout inside the Studio 03 palette and contrast rules. |
| Inputs | layout · channel · region |
| Tokens | Five swatches: #22303a, #5f9cbc, #d39a6a, #eef1f0, #c9c2b6 |
| Constraints | Accent coverage at most 15%. Text contrast at least 4.5:1. |
| Checks | 9 automated checks |
| Examples | 412 approved assets |
| Owner | Studio 03 design director |

---

## 10. Agent Orchestration

CHAPTER 06 · SKILLS

**Agent Orchestration**

Agents load the skills of whichever studio they are working for, and every studio keeps its own set.

**Panel: Agent orchestration · Live**

| Agent | Skills invoked | This week |
|---|---|---|
| Campaign adaptation | Typography, Colour, Layout, Campaign | 1,240 |
| Localisation | Localisation, Tone, Typography | 3,912 |
| Channel resizing | Layout, Logo, Photography | 6,005 |
| Governance | Logo, Colour, Localisation, Campaign | 11,157 |

54 skills across six studios. Each agent works inside one studio at a time.

**3D labels:** Studio 01 skills · Studio 02 skills · Studio 03 skills · Studio 04 skills · Studio 05 skills · Studio 06 skills (9 skills each)

---

## 11. Statement

Executable creative skills

BECOME

**generative creative infrastructure**

---

## 12. Creative Request

CHAPTER 07 · THE CREATIVE AGENT

**Creative Request**

A user describes the creative they need, and the system resolves the brand, region, campaign and permissions behind it.

**Panel: Generative studio · New request**

Regional communications lead · Nordics · Approval level 2 of 3 · Permissions: Studio 03, Nordics, Social, OOH

| Field | Value |
|---|---|
| Company | Design group |
| Brand | Studio 03 |
| Region | Nordics |
| Campaign | Pavilion launch |
| Creative type | Launch visual |
| Channel | Story · OOH 6-sheet |

Placeholder before the brief appears: Describe the creative you need.

**Brief:** Launch visual for the Harbour Pavilion opening in the Nordics. Dusk, seen from the water, with the building on the lower third.

**Resolved:** Typography 2.1 · Colour 2.4 · Photography 2.3 · Layout 2.4 · Logo 2.1 · Localisation 2.2 · Campaign 2.3

214 approved Harbour Pavilion renders, drawings and photographs loaded as references, with the design model.

---

## 13. Generation

CHAPTER 08 · GENERATE WITHIN THE SYSTEM

**Generation**

Each layer is produced by the skill that governs it, so the composition starts inside the brand.

**Panel: Generation log · pavilion_story_v3 · Building**

| Time | Skill | Step |
|---|---|---|
| 00.4 | Photography | Dusk sky and water plate generated from 38 approved project photographs. |
| 01.0 | Layout | Twelve-column grid set with the building on the lower third. |
| 01.5 | Campaign | Pavilion rendered from the approved design model, verticals corrected. |
| 02.1 | Typography | Headline set in Display 600 across two lines. |
| 02.6 | Logo | Studio 03 arch mark placed with clear space of one arch height. |
| 03.0 | Tone | Call to action written in the Studio 03 voice. |
| 03.4 | Localisation | Swedish, Norwegian, Danish and Finnish variants queued. |

**In the imagery (the generated story):** "A pavilion for the long light." · HARBOUR PAVILION · JUNE 2026 · STUDIO 03 · Book a visit · VISUALISATION SUBJECT TO PLANNING CONSENT · SAFE ZONE · STORY 1080×1920

---

## 14. Governance

CHAPTER 09 · GOVERNANCE

**Governance**

The draft is checked against every rule for its brand, region, campaign and channel before anyone reviews it.

**Panel: Brand governance · pavilion_story_v3 · 10 checks**

| Check | Result |
|---|---|
| Brand rules | Within Studio 03 core principles. |
| Typography | Display 600, two lines, minimum size met. |
| Colour | Accent coverage 11%, contrast 7.2:1. |
| Logo usage | Clear space and minimum width met. |
| Composition | Building on the lower third. |
| Photography | Natural light, verticals corrected, no staged people. |
| Regional requirements | First shows "Planning disclaimer missing." Then changes to "'Visualisation subject to planning consent' added by the Localisation skill." |
| Campaign rules | Opening date and project name match the launch plan. |
| Channel requirements | Copy inside the story safe zone. |
| Approval permissions | Story approved at level 2. OOH routed to the Studio 03 approver. |

9 passed · 1 corrected · 0 blocked

**In the imagery:** each check passes through the creative as a labelled frame with the same ten names.

---

## 15. The Loop

CHAPTER 10 · THE LOOP

**The Loop**

Approved creative is filed automatically and becomes reference material for the next request.

**Panel: Asset provenance · MAIS-S03-PAV-0412**

| Field | Value |
|---|---|
| Filed in | Studio 03 / Pavilion launch / Nordics / Social |
| Generated by | Campaign adaptation agent |
| Requested by | Regional communications lead, Nordics |
| Skills | Colour 2.4, Typography 2.1, Layout 2.4, Logo 2.1, +3 |
| References | 38 project photographs and the design model |
| Checks | 10 of 10, one corrected |
| Approved | Level 2 · 8 October 2026 |

**Loop diagram:** Understand → Structure → Codify → Generate → Validate → Organise → Learn

**3D labels:** pavilion_story_v3 · Filed automatically · Pavilion launch · Campaign · Nordics · Region

---

## 16. Intelligent Creative Organisation

CHAPTER 11 · THE INTELLIGENT CREATIVE ORGANISATION

**Intelligent Creative Organisation**

Every studio, region and campaign now works from one shared understanding of the creative the group already owns.

| Figure | Label |
|---|---|
| 2.4M | assets indexed and related |
| 54 | skills across six studios |
| 4 | agent types at work |
| 10 | checks on every output |

---

## 17. Summary

MARKETING ASSETS INTELLIGENCE SYSTEM

**One system for the whole creative estate**

1. It understands the entire creative ecosystem.
2. It encodes each studio brand as executable skills.
3. It gives AI agents the intelligence of each studio.
4. It generates new creative at scale.
5. It governs every output before approval.
6. It keeps every asset organised and traceable.
7. It learns from each asset the organisation adds.
