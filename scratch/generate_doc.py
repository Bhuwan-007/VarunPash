import os
import base64
import subprocess

def img_to_b64(path):
    if os.path.exists(path):
        with open(path, "rb") as f:
            data = base64.b64encode(f.read()).decode("utf-8")
            return f"data:image/webp;base64,{data}"
    return ""

img_p1a = img_to_b64("c:/VarunPash/public/assets/cinematics/intro-p1a.webp")
img_p1c = img_to_b64("c:/VarunPash/public/assets/cinematics/intro-p1c.webp")
img_p1d2 = img_to_b64("c:/VarunPash/public/assets/cinematics/intro-p1d2.webp")
img_p2h = img_to_b64("c:/VarunPash/public/assets/cinematics/intro-p2h.webp")
img_p2i = img_to_b64("c:/VarunPash/public/assets/cinematics/intro-p2i.webp")
img_p2j = img_to_b64("c:/VarunPash/public/assets/cinematics/intro-p2j.webp")

html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>VarunPash - Complete Game Design & Narrative Document</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Inter:wght@400;500;600;700&family=Special+Elite&display=swap');

  @page {{
    size: A4;
    margin: 1.6cm 1.4cm 1.6cm 1.4cm;
    @bottom-right {{
      content: counter(page);
    }}
  }}

  body {{
    font-family: 'Inter', -apple-system, sans-serif;
    color: #1a202c;
    background-color: #ffffff;
    line-height: 1.55;
    font-size: 10.5pt;
    margin: 0;
    padding: 0;
  }}

  .cover-page {{
    background: linear-gradient(135deg, #07090f 0%, #0b1320 60%, #12303d 100%);
    color: #e8dfc8;
    padding: 40px 36px;
    border-radius: 8px;
    margin-bottom: 30px;
    page-break-after: always;
    box-shadow: 0 10px 25px rgba(0,0,0,0.3);
    text-align: center;
    border: 2px solid rgba(242, 165, 65, 0.4);
  }}

  h1.title {{
    font-family: 'Cinzel', serif;
    font-size: 34pt;
    letter-spacing: 6px;
    color: #e8dfc8;
    margin: 10px 0 5px 0;
    text-transform: uppercase;
    text-shadow: 0 0 15px rgba(242, 165, 65, 0.4);
  }}

  .subtitle {{
    font-family: 'Special Elite', monospace;
    color: #f2a541;
    font-size: 14pt;
    letter-spacing: 3px;
    margin-bottom: 25px;
  }}

  .tagline {{
    font-style: italic;
    color: #5fd3c4;
    font-size: 11pt;
    max-width: 580px;
    margin: 0 auto 30px auto;
  }}

  .meta-grid {{
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    max-width: 600px;
    margin: 0 auto;
    font-size: 9pt;
    border-top: 1px solid rgba(232, 223, 200, 0.2);
    padding-top: 15px;
  }}

  .meta-item strong {{
    display: block;
    color: #f2a541;
    font-size: 8.5pt;
    text-transform: uppercase;
    letter-spacing: 1px;
  }}

  h2.section-header {{
    font-family: 'Cinzel', serif;
    font-size: 15pt;
    color: #0b1320;
    border-bottom: 2px solid #f2a541;
    padding-bottom: 5px;
    margin-top: 28px;
    margin-bottom: 12px;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    display: flex;
    align-items: center;
  }}

  h3.subsection-header {{
    font-size: 12pt;
    color: #12303d;
    margin-top: 18px;
    margin-bottom: 8px;
    font-weight: 700;
    border-left: 3px solid #5fd3c4;
    padding-left: 8px;
  }}

  p {{
    margin: 0 0 10px 0;
    text-align: justify;
  }}

  .callout {{
    background-color: #f7f9fa;
    border-left: 4px solid #12303d;
    padding: 10px 14px;
    margin: 12px 0;
    font-size: 9.5pt;
    border-radius: 0 4px 4px 0;
  }}

  .callout-highlight {{
    background-color: rgba(95, 211, 196, 0.08);
    border-left: 4px solid #5fd3c4;
    padding: 10px 14px;
    margin: 12px 0;
    font-size: 9.5pt;
  }}

  .callout-warning {{
    background-color: rgba(178, 58, 58, 0.06);
    border-left: 4px solid #b23a3a;
    padding: 10px 14px;
    margin: 12px 0;
    font-size: 9.5pt;
  }}

  table {{
    width: 100%;
    border-collapse: collapse;
    margin: 14px 0;
    font-size: 9pt;
  }}

  th {{
    background-color: #0b1320;
    color: #e8dfc8;
    text-align: left;
    padding: 8px 10px;
    font-weight: 600;
    font-size: 8.5pt;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }}

  td {{
    padding: 8px 10px;
    border-bottom: 1px solid #e2e8f0;
    vertical-align: top;
  }}

  tr:nth-child(even) td {{
    background-color: #f8fafc;
  }}

  .badge {{
    display: inline-block;
    padding: 2px 7px;
    border-radius: 3px;
    font-size: 7.5pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }}

  .badge-bad {{ background-color: #fee2e2; color: #991b1b; }}
  .badge-neutral {{ background-color: #fef3c7; color: #92400e; }}
  .badge-bitter {{ background-color: #e0e7ff; color: #3730a3; }}
  .badge-golden {{ background-color: #ccfbf1; color: #0f766e; }}
  .badge-hidden {{ background-color: #f3f4f6; color: #374151; }}

  .gallery-grid {{
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin: 16px 0;
  }}

  .gallery-card {{
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    overflow: hidden;
    background: #07090f;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }}

  .gallery-card img {{
    width: 100%;
    height: auto;
    display: block;
  }}

  .gallery-caption {{
    padding: 6px 10px;
    font-size: 8pt;
    color: #e8dfc8;
    background: #0b1320;
    border-top: 1px solid rgba(242, 165, 65, 0.3);
  }}

  .page-break {{
    page-break-before: always;
  }}

  ul, ol {{
    margin: 0 0 10px 0;
    padding-left: 20px;
  }}

  li {{
    margin-bottom: 4px;
  }}

  .key-badge {{
    display: inline-block;
    background-color: #e2e8f0;
    border: 1px solid #cbd5e1;
    border-bottom: 2px solid #94a3b8;
    border-radius: 3px;
    padding: 1px 6px;
    font-family: monospace;
    font-weight: bold;
    font-size: 8.5pt;
    color: #1e293b;
  }}
</style>
</head>
<body>

<!-- COVER / INTRO PAGE -->
<div class="cover-page">
  <div style="font-size: 10pt; letter-spacing: 4px; color: #8a8f98; text-transform: uppercase;">Game Design & Narrative Architecture</div>
  <h1 class="title">VARUNPASH</h1>
  <div class="subtitle">A Tale of Ink &amp; Brine</div>
  <div class="tagline">
    &ldquo;A cursed galleon sinks every 10 minutes. You die, remember, and come back later each time, with less time and more knowledge. Break the loop before the tide runs out.&rdquo;
  </div>

  <div class="meta-grid">
    <div class="meta-item">
      <strong>Theme</strong>
      THE LOOP (Causal Time Loop)
    </div>
    <div class="meta-item">
      <strong>Platform</strong>
      Web Browser / itch.io (HTML5)
    </div>
    <div class="meta-item">
      <strong>Art Style</strong>
      Black-and-White Hand-Inked Manga
    </div>
  </div>
</div>

<!-- SECTION 1: GAME DESCRIPTION -->
<h2 class="section-header">1. Game Description</h2>

<h3 class="subsection-header">1.1 Overview &amp; Concept</h3>
<p>
  <strong>VarunPash</strong> is a narrative time-loop puzzle thriller set aboard the cursed ancient merchant galleon <em>Jal-Doot</em>. Trapped in a supernatural maritime pocket of the Indian Ocean, the ship is doomed to sink into the abyss every 10 minutes (600 seconds). The catalyst is the <strong>Kaal Mani</strong>—an ancient crystalline relic locked in the lower cargo hold that distorts the flow of time and summons the colossal mythical sea creature <strong>Makara</strong>.
</p>
<p>
  Unlike conventional time-loop titles where resets grant full restarts, in <em>VarunPash</em>, <strong>every death moves the respawn point 30 seconds forward into the timeline</strong>. Loop 1 begins at 0 seconds (calm waters); Loop 2 begins at 30 seconds; by Loop 12 (360s), the player spawns mid-mutiny with knives already drawn. At the 20th death (600s), the player respawns as the hull breaches and water swallows the deck. Knowledge—not physical items—is the sole currency that endures between lives.
</p>

<h3 class="subsection-header">1.2 Objectives &amp; Core Gameplay Loop</h3>
<ul>
  <li><strong>Explore &amp; Investigate:</strong> Navigate top-down 2D pixel-art decks and the dark cargo hold, discovering hidden vent shafts, stern hatches, locked armories, and secret safe combinations.</li>
  <li><strong>Die to Learn, Remember to Survive:</strong> Experience death as an investigative tool. Being executed by the paranoid Captain reveals his safe code (<code>7-3-1</code>); drowning near the port rail reveals the Makara's fatal harpoon wound; touching the relic whispers the sealing chant.</li>
  <li><strong>Journal Progression:</strong> All discovered clues, door codes, mutiny cues, and tide schedules automatically document into a weathered first-person ship's log (accessed via <span class="key-badge">J</span>).</li>
  <li><strong>Break the Causal Circle:</strong> Piece together the tragedy to evacuate the crew and break the time curse before the 20-tally death counter runs out.</li>
</ul>

<!-- SECTION 2: GAME CONTROLS -->
<h2 class="section-header">2. Game Controls &amp; Interaction</h2>

<table>
  <thead>
    <tr>
      <th style="width: 22%;">Input / Key</th>
      <th style="width: 38%;">Action</th>
      <th style="width: 40%;">Context / Interaction</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><span class="key-badge">W</span> <span class="key-badge">A</span> <span class="key-badge">S</span> <span class="key-badge">D</span> / <span class="key-badge">&uarr;</span> <span class="key-badge">&larr;</span> <span class="key-badge">&darr;</span> <span class="key-badge">&rarr;</span></td>
      <td>Player Movement</td>
      <td>Top-down 8-directional exploration across main deck, quarters, and hold.</td>
    </tr>
    <tr>
      <td><span class="key-badge">E</span> or <span class="key-badge">SPACE</span> or <span class="key-badge">Left Click</span></td>
      <td>Interact / Advance / Advance Manga</td>
      <td>
        &bull; Talk to NPCs and inspect objects (highlighted with lantern glow).<br>
        &bull; Advance dialogue lines &amp; manga cutscene panels.<br>
        &bull; Hold for 10s on davit winch plates to lower lifeboats.
      </td>
    </tr>
    <tr>
      <td><span class="key-badge">J</span></td>
      <td>Open / Close Journal</td>
      <td>Opens the weathered ship's logbook (Clues, Tide Table, People, Codes). Pauses active ship clock.</td>
    </tr>
    <tr>
      <td><span class="key-badge">ESC</span></td>
      <td>Cancel / Step Away / Skip</td>
      <td>Closes active modals (Keypad, Role Card, Journal) or skips cutscenes.</td>
    </tr>
    <tr>
      <td><span class="key-badge">0</span> &ndash; <span class="key-badge">9</span> + <span class="key-badge">Backspace</span></td>
      <td>Keypad Entry</td>
      <td>Enters 3-digit combination into Captain Nakhuda's strongbox.</td>
    </tr>
  </tbody>
</table>

<div class="callout">
  <strong>Interaction Nuances:</strong> Proximity interactions trigger within a 1.2-tile radius. A brief 0.5s grace period is enforced upon loop respawns to prevent accidental immediate inputs. The timeline automatically pauses whenever the Journal, dialogues, or keypads are open.
</div>

<div class="page-break"></div>

<!-- SECTION 3: THE WHOLE STORY & THE LOOP THEME -->
<h2 class="section-header">3. Complete Story &amp; Narrative Architecture</h2>

<h3 class="subsection-header">3.1 The Story Spine: The Closed Causal Circle</h3>
<p>
  The merchant galleon <em>Jal-Doot</em> departed port with a cargo hold laden with contraband gold and an enigmatic relic: the <strong>Kaal Mani</strong>. Deep in uncharted waters, the sea stopped moving, compasses spun erratically, and the ocean began running backwards.
</p>
<p>
  Three intertwined crises unfold on a single, synchronized timeline:
</p>
<ol>
  <li><strong>The Relic (0s &ndash; 600s):</strong> The Kaal Mani hums in the lower hold, distorting time and tethering the vessel to the ocean floor.</li>
  <li><strong>The Mutiny (360s):</strong> First Mate Kedar Voss leads an armed mutiny against the paranoid Captain Nakhuda Thorne to seize the hold's gold.</li>
  <li><strong>The Beast (480s):</strong> The colossal mythical Makara breaches port side, smashing through bulwarks and devastating the galleon.</li>
  <li><strong>The Sinking (600s):</strong> The hull buckles under abyssal pressure and sinks to the seabed.</li>
</ol>

<h3 class="subsection-header">3.2 The Core Twist</h3>
<div class="callout-highlight">
  <strong>The Great Reveal:</strong> The petrified grey stone statue standing in the hold clutching a brass locket is <em>not an ancient relic</em>—it is <strong>the player from a future loop</strong>. The glowing harpoon already lodged in the Makara's neck and the chant whispered by the relic (in the player's own voice) were left behind by earlier cycles. Chanting directly inside the hold successfully seals the relic and saves the crew, but turns the chanter into stone—and that act of petrification is precisely what initialized the eternal loop. Only by discovering the inscription on the statue's base and chanting from the <strong>upper deck listening grate</strong> can the circle finally be broken.
</div>

<h3 class="subsection-header">3.3 Relevance to "The Loop" Theme</h3>
<ul>
  <li><strong>Temporal Shrinkage:</strong> Unlike standard rogue-lites where time resets to zero, death in <em>VarunPash</em> carries a tangible temporal penalty (+30s start delay). Careless deaths leave the player with insufficient time to resolve complex puzzles.</li>
  <li><strong>Causal Determinism:</strong> The player is both creator and prisoner of the anomaly. The artifacts that aid the player are remnants left behind by their own future choices.</li>
  <li><strong>Information as the Sole Currency:</strong> Physical items vanish on death, but learned safe combinations, mutiny timings, and beast weaknesses persist permanently in the player's mind and journal.</li>
</ul>

<!-- SECTION 4: CHARACTER ROLES & PUZZLE ROUTES -->
<h2 class="section-header">4. Playable Character Roles &amp; Walkthroughs</h2>

<p>Every new game assigns one of three roles, each providing completely distinct routes, social statuses, and puzzle solutions:</p>

<table>
  <thead>
    <tr>
      <th style="width: 22%;">Role</th>
      <th style="width: 25%;">Starting Loadout</th>
      <th style="width: 28%;">Strengths &amp; Route Access</th>
      <th style="width: 25%;">Weaknesses &amp; Limitations</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Navigator</strong></td>
      <td>Maritime Sea Chart (Map)</td>
      <td>Unlocks hidden stern hatch on deck; trusted by Captain Nakhuda; direct access to the ship's wheel.</td>
      <td>Physically fragile; cannot defeat Bosun Hari or First Mate Kedar in combat.</td>
    </tr>
    <tr>
      <td><strong>Quartermaster</strong></td>
      <td>Armory Key, Hold Key, 6 Gold Coins</td>
      <td>Can bribe NPCs with coins; direct physical access to hold and weapons; can overcome Hari and Kedar.</td>
      <td>Distrusted by crew; NPCs demand heavy bribes (1 coin per dialogue/favor).</td>
    </tr>
    <tr>
      <td><strong>Deckhand</strong></td>
      <td>Nothing (Empty Pockets)</td>
      <td>Small stature allows navigating the ventilation duct network to bypass locked doors and eavesdrop.</td>
      <td>Completely ignored by officers; cannot enter captain's cabin without proof of mutiny.</td>
    </tr>
  </tbody>
</table>

<h3 class="subsection-header">4.1 Active Playable Walkthrough: The Hero's Sacrifice (All Characters)</h3>
<p>
  <strong>The Hero's Sacrifice</strong> is the primary canonical ending currently programmed, fully playable, and achievable in the game today. Because this is a time-loop game, completing it relies on a multi-loop strategy: discovering the relic's chant in life, then executing the lifeboat evacuation and self-sacrifice.
</p>

<div class="callout-highlight">
  <strong>The Universal Prerequisite &mdash; The Suicide Knowledge Run:</strong><br>
  In your first loop (or any early cycle), descend to the lower hold and interact with the humming Kaal Mani relic. Hold <span class="key-badge">E</span> for 1.0 second. You will be vaporized by abyssal energy, but you permanently learn <strong>K_CHANT</strong> (<em>"...seven syllables... seven tides..."</em>). This memory flag endures across all subsequent loops and respawns.
</div>

<p><strong>A. Navigator Walkthrough &mdash; The Hero's Sacrifice:</strong></p>
<ol>
  <li><strong>Spawn &amp; Observe:</strong> Spawn at the stern on the main deck with the Maritime Sea Chart.</li>
  <li><strong>Evacuate the Crew (0s &ndash; 350s):</strong> Run directly to the starboard davit winch plates. Press and hold <span class="key-badge">E</span> for 10 continuous seconds without releasing before ship time reaches 360s.</li>
  <li><strong>Crew Boarding:</strong> The progress ring fills (<em>"LOWERING BOATS..."</em>). Because this is completed before 360s, Captain Nakhuda emerges safely from his cabin and boards the lifeboats alongside Cook Bhima, Gunner Isha, and Bosun Hari. The lifeboats lower into the sea and sail away safely.</li>
  <li><strong>Descend to the Hold:</strong> Walk to the central deck hatch and take the ladder down into the cargo hold.</li>
  <li><strong>Perform the Sealing Chant:</strong> Approach the humming Kaal Mani. Because <code>K_CHANT</code> is in your memory, the prompt reads <em>"Hold [E] for 2 seconds to speak the chant"</em>. Hold <span class="key-badge">E</span> for 2 continuous seconds before 590s.</li>
  <li><strong>Ending Resolution:</strong> The chant seals the relic, calming the abyssal waters. Grey stone creeps over your arms, petrifying you into the stone statue. The <em>Hero's Sacrifice</em> ending cutscene plays, saving the crew while trapping your body in stone.</li>
</ol>

<p><strong>B. Quartermaster Walkthrough &mdash; The Hero's Sacrifice:</strong></p>
<ol>
  <li><strong>Spawn with Keys:</strong> Spawn on deck with the Hold Key, Armory Key, and 6 coins in inventory.</li>
  <li><strong>Bribe Hari (Optional Interaction):</strong> Approach Bosun Hari at the starboard lifeboats; you spend 1 coin for his dialogue and secure unrestricted access to the davits.</li>
  <li><strong>Lower the Lifeboats:</strong> Stand on the starboard davit winch plate. Hold <span class="key-badge">E</span> for 10 continuous seconds before 360s. Captain Nakhuda, Bhima, Isha, and Hari board and row away safely.</li>
  <li><strong>Immediate Hold Access:</strong> Use your Hold Key to unlock the main deck cargo hatch directly without needing bypass routes.</li>
  <li><strong>The Sacrifice:</strong> Approach the Kaal Mani in the lower hold and hold <span class="key-badge">E</span> for 2 seconds to speak the chant before 590s, sealing the beast and turning to stone.</li>
</ol>

<p><strong>C. Deckhand Walkthrough &mdash; The Hero's Sacrifice:</strong></p>
<ol>
  <li><strong>Spawn Empty-Handed:</strong> Spawn with empty pockets, but full access to the ship's iron ventilation grates.</li>
  <li><strong>Deck Evacuation:</strong> Head directly to the main deck starboard rail. Hold <span class="key-badge">E</span> for 10 continuous seconds at the davit winch before 360s. The crew evacuates safely into the morning mist.</li>
  <li><strong>Drop into the Hold:</strong> Slip through the open deck hatch or drop down through the hold ventilation grate.</li>
  <li><strong>The Sacrifice:</strong> Approach the humming Kaal Mani, hold <span class="key-badge">E</span> for 2 seconds, and speak the 7 syllables to seal the loop.</li>
</ol>

<h3 class="subsection-header">4.2 Future Planned Milestone: The Golden Path (Design Specification)</h3>
<p>
  <em>Note: The Golden Path represents the complex multi-system puzzle sequence designed in PRD.md and RULES.md &sect;9, planned for full programming in upcoming development milestones:</em>
</p>

<p><strong>A. Navigator Route (The Scholar's Path &mdash; Planned):</strong></p>
<ol>
  <li>Spawn on deck. Consult the Sea Chart to locate the hidden stern hatch leading directly to the upper gallery.</li>
  <li>Knock on Nakhuda's cabin door (240s–270s). Because you are the Navigator, Nakhuda trusts you and will listen without shooting.</li>
  <li>Inform Nakhuda of Kedar's impending mutiny. Nakhuda arms himself, neutralizing the 360s assassination.</li>
  <li>Take the stern stairs to the wheel. Stand on the Helm Plate during 480s–510s to turn the ship and expose the Makara's harpoon wound to Isha's port cannons.</li>
  <li>Bribe Bosun Hari with hold gold or the deck locket to allow the crew to board the lifeboats.</li>
  <li>Ascend to the upper deck listening grate and speak the 7-syllable chant before 570s to achieve the <em>Golden Path</em>.</li>
</ol>

<p><strong>B. Quartermaster Route (The Enforcer's Path &mdash; Planned):</strong></p>
<ol>
  <li>Use your Hold Key to access the lower cargo deck immediately at the start of the loop.</li>
  <li>Collect the contraband gold bars from the cargo crates.</li>
  <li>Pay Bosun Hari 3 coins (or 1 gold bar) to secure unconditional control of the starboard davit lifeboats.</li>
  <li>Approach Kedar Voss before 360s. Offer him a share of the hold gold to buy off his mutiny.</li>
  <li>With both Nakhuda and the crew secure, coordinate with Gunner Isha at the cannons during the beast breach.</li>
  <li>Either sacrifice yourself in the hold (<em>Hero's Sacrifice</em>) or chant through the grate (<em>Golden Path</em>).</li>
</ol>

<p><strong>C. Deckhand Route (The Shadow's Path &mdash; Planned):</strong></p>
<ol>
  <li>Enter the ventilation grates located along the port deck rail. Crawl beneath the captain's quarters and galley.</li>
  <li>Eavesdrop at the galley grate at 300s to record Kedar conspirator dialogue, earning <code>K_MUTINEER</code> without dying.</li>
  <li>Slip through the vent into the Quartermaster's safe room. Input code <code>7-3-1</code> into the strongbox to obtain the Helm Key and Armory Key.</li>
  <li>Rattle the vent near Bosun Hari to lure him away from the lifeboat winch plates.</li>
  <li>Slip into Nakhuda's cabin with stolen proof of the mutiny to rally the captain before 360s.</li>
  <li>Execute the final sequence from the listening grate to shatter the curse.</li>
</ol>

<div class="page-break"></div>

<!-- SECTION 5: ALL 5 ENDINGS IN DETAIL -->
<h2 class="section-header">5. Detailed Endings &amp; Trigger Conditions</h2>

<h3 class="subsection-header">Ending 1: Coward's End <span class="badge badge-bad">Bad Ending</span></h3>
<p>
  <strong>Narrative:</strong> Overwhelmed by paranoia, the player abandons the ship and crew, lowering a lone lifeboat into the glassy black sea before the beast arrives. The galleon sinks behind you in total silence. You survive, but the loop breaks—leaving you adrift and forever alone in an uncharted sea.
</p>
<p>
  <strong>Trigger Conditions:</strong> Board a lifeboat alone before 480 seconds while crew members remain aboard. Requires neutralizing Bosun Hari (bribing with 3 coins/gold, defeating him as Quartermaster, or venting past him as Deckhand).
</p>

<h3 class="subsection-header">Ending 2: Mutineer's Reign <span class="badge badge-neutral">Neutral / Dark</span></h3>
<p>
  <strong>Narrative:</strong> Believing Kedar offers the only pragmatic escape, you betray Captain Nakhuda. Kedar shoots the captain during the 360s mutiny and takes command. When the Makara attacks at 480s, Kedar coordinates a devastating double-broadside that repels the monster. With the ship saved, Kedar reveals his true colors: he smiles with his gold tooth and has you locked in the brig forever to protect his secret.
</p>
<p>
  <strong>Trigger Conditions:</strong> Obtain <code>K_MUTINEER</code>, talk to Kedar before 360s and agree to his alliance, let Nakhuda die in the mutiny, and ensure port cannons repel the Makara.
</p>

<h3 class="subsection-header">Ending 3: The Hero's Sacrifice <span class="badge badge-bitter">Bittersweet Canonical</span></h3>
<p>
  <strong>Narrative:</strong> You hold the davit winch plates for 10 seconds, successfully lowering Captain Nakhuda, Bhima, Isha, and Hari into the lifeboats. As the ship slips beneath the waves, you descend into the flooded hold and chant the 7 ancient syllables directly before the Kaal Mani. The beast recedes and the crew escapes safely to dawn light, but grey stone creeps up your flesh. You petrify into the statue, maintaining the very circle that gave you life.
</p>
<p>
  <strong>Trigger Conditions:</strong> Complete lifeboat launch with crew aboard, acquire <code>K_CHANT</code>, and speak the chant at the relic in the lower hold before 590s.
</p>

<h3 class="subsection-header">Ending 4: The Golden Path <span class="badge badge-golden">True / Perfect Ending</span></h3>
<p>
  <strong>Narrative:</strong> Every loop's lesson converges. You bribe Kedar with hold gold to prevent the mutiny, save Nakhuda, expose the Makara's throat with the helm turn, evacuate the crew, and chant the sacred verses from the <em>upper deck listening grate</em> above the hold. The Kaal Mani shatters. The stone statue in the hold crumbles into harmless sand. The <em>Jal-Doot</em> sails into morning sunlight, finally free of the time loop.
</p>
<p>
  <strong>Trigger Conditions:</strong> Bribe Kedar before 360s, keep Nakhuda alive, hold Helm Plate for 15s during 480–510s while Isha fires, discover <code>K_STATUE_TRUTH</code>, and read chant from the upper deck grate by 570s.
</p>

<h3 class="subsection-header">Ending 5: The Drowned Loop <span class="badge badge-hidden">Hidden Cosmic Ending</span></h3>
<p>
  <strong>Narrative:</strong> You have died 20 times. All tally marks on the rail are scratched out in blood-rust ink. The final loop begins at exactly 600s: you spawn as the ship plunges straight down into the abyssal trench. You are petrified into stone without having made a choice. The timeline fractures and resets to Loop 1.
</p>
<p>
  <strong>Trigger Conditions:</strong> Reach the 20th death. Fires automatically upon respawn.
</p>

<!-- SECTION 6: ASSET CREDITS -->
<h2 class="section-header">6. Asset Credits &amp; Acknowledgements</h2>

<table>
  <thead>
    <tr>
      <th style="width: 25%;">Asset / Library</th>
      <th style="width: 30%;">Creator / Provider</th>
      <th style="width: 20%;">License</th>
      <th style="width: 25%;">Usage in VarunPash</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>IM Fell English SC</strong></td>
      <td>Igino Marini (Google Fonts)</td>
      <td>SIL Open Font License</td>
      <td>Narration boxes, title cards, captions.</td>
    </tr>
    <tr>
      <td><strong>Comic Neue</strong></td>
      <td>Craig Hang (Google Fonts)</td>
      <td>SIL Open Font License</td>
      <td>Manga speech, shout, and whisper bubbles.</td>
    </tr>
    <tr>
      <td><strong>Bangers</strong></td>
      <td>Vernon Adams (Google Fonts)</td>
      <td>SIL Open Font License</td>
      <td>Stylized manga sound effect (SFX) typography.</td>
    </tr>
    <tr>
      <td><strong>Special Elite</strong></td>
      <td>Astigmatic (Google Fonts)</td>
      <td>Apache License 2.0</td>
      <td>Dialogue boxes, NPC text, button typography.</td>
    </tr>
    <tr>
      <td><strong>Pixelify Sans</strong></td>
      <td>Stefie Justprince</td>
      <td>SIL Open Font License</td>
      <td>HUD loop counter, clock timer, system font.</td>
    </tr>
    <tr>
      <td><strong>Caveat</strong></td>
      <td>Impallari Type</td>
      <td>SIL Open Font License</td>
      <td>In-game handwritten ship's logbook entries.</td>
    </tr>
    <tr>
      <td><strong>Audio Synthesizer</strong></td>
      <td>Custom Web Audio API</td>
      <td>MIT / Project Original</td>
      <td>Procedural gunshots, door knocks, waves, page turns.</td>
    </tr>
    <tr>
      <td><strong>Manga Artwork</strong></td>
      <td>Antigravity AI Generation</td>
      <td>Proprietary Project Art</td>
      <td>11 hand-inked manga panels for the intro cutscene.</td>
    </tr>
    <tr>
      <td><strong>Engine &amp; Framework</strong></td>
      <td>React 18, Vite, Zustand</td>
      <td>MIT License</td>
      <td>Application lifecycle, state stores, rendering pipeline.</td>
    </tr>
  </tbody>
</table>

<div class="page-break"></div>

<!-- SECTION 7: MANGA PANELS VISUAL GALLERY -->
<h2 class="section-header">7. Manga Opening Visual Showcase</h2>
<p>The cutscene system utilizes pure black-and-white hand-inked Japanese manga artwork with screentone halftones and zero embedded text, allowing crisp, dynamic typography overlays:</p>

<div class="gallery-grid">
  <div class="gallery-card">
    <img src="{img_p1a}" alt="Hero Ship Panel">
    <div class="gallery-caption"><strong>Page 1 &bull; Panel A:</strong> The <em>Jal-Doot</em> sailing into the moonless sea.</div>
  </div>
  <div class="gallery-card">
    <img src="{img_p1c}" alt="Nakhuda and Bhima">
    <div class="gallery-caption"><strong>Page 1 &bull; Panel C:</strong> Nakhuda &amp; Bhima observing the spinning compass.</div>
  </div>
  <div class="gallery-card">
    <img src="{img_p1d2}" alt="Kedar Voss Close-Up">
    <div class="gallery-caption"><strong>Page 1 &bull; Panel D2:</strong> First Mate Kedar smiling with his gold tooth.</div>
  </div>
  <div class="gallery-card">
    <img src="{img_p2h}" alt="Makara Breach">
    <div class="gallery-caption"><strong>Page 2 &bull; Panel H:</strong> The colossal Makara breaching port side.</div>
  </div>
  <div class="gallery-card">
    <img src="{img_p2i}" alt="Captain Nakhuda Shouting">
    <div class="gallery-caption"><strong>Page 2 &bull; Panel I:</strong> Captain Nakhuda rallying the crew to the port rail.</div>
  </div>
  <div class="gallery-card">
    <img src="{img_p2j}" alt="Pocket Watch &amp; Gull">
    <div class="gallery-caption"><strong>Page 2 &bull; Panel J:</strong> The cracked pocket watch and the cycle renewed.</div>
  </div>
</div>

<!-- SECTION 8: FUTURE SCOPE -->
<h2 class="section-header">8. Future Scope &amp; Roadmap</h2>

<h3 class="subsection-header">8.1 Additional Character Sprite Sheets &amp; Animations</h3>
<p>
  Currently, NPCs and the protagonist utilize high-contrast 2D pixel avatars. The future roadmap includes full 4-directional 12-frame walking sprite sheets for all 5 crew members and distinct role sashes for the protagonist (Blue for Navigator, Red for Quartermaster, Grey for Deckhand).
</p>

<h3 class="subsection-header">8.2 Manga Panels for Special Moments &amp; Endings</h3>
<p>
  The <code>MangaPage</code> engine is built to be reusable across all key dramatic moments:
</p>
<ul>
  <li><strong>Manga Moments (<code>MANGA_MOMENTS.md</code>):</strong> 1–2 panel comic beats for discovering the safe code, examining the statue's clutching hand, and touching the humming Kaal Mani.</li>
  <li><strong>Manga Endings (<code>MANGA_ENDINGS.md</code>):</strong> Fully staged 2-page cutscenes for <em>The Hero's Sacrifice</em> (<code>eh-a</code> through <code>eh-d</code> and <code>m-statue-a</code>), <em>Coward's End</em>, <em>Mutineer's Reign</em>, and <em>The Golden Path</em>.</li>
</ul>

<h3 class="subsection-header">8.3 Ghost Replay Recording Mechanics</h3>
<p>
  Expanding the temporal puzzle system by recording the player's movement trajectory from the immediately preceding loop. The ghost will replay as a translucent figure, allowing solo players to solve two-person pressure plate puzzles (such as holding the Stern Helm plate while simultaneously firing cannons).
</p>

<h3 class="subsection-header">8.4 Extended Dynamic Audio &amp; Voice Lines</h3>
<p>
  Integrating dynamic audio stems that subtly detune and slow down as the 600s timeline expires, paired with full voice-acted opening narration in the salt-stained sailor idiom defined in <code>FEEL.md</code>.
</p>

<div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #cbd5e1; font-size: 8pt; color: #64748b; text-align: center;">
  VarunPash &bull; Built with React, Vite, TypeScript &amp; Zustand &bull; Designed for itch.io HTML5
</div>

</body>
</html>
"""

html_path = "c:/VarunPash/VarunPash_Game_Document.html"
with open(html_path, "w", encoding="utf-8") as f:
    f.write(html_content)

print(f"Wrote HTML document to {html_path}")
