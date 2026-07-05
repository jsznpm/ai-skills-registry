# Brand Guidelines Reference

## Brand Personality Archetypes

Pick a primary and optional secondary archetype — this drives word choice, sentence
structure, and tone across all content.

| Archetype | Voice traits | Example brands |
|---|---|---|
| The Sage | Knowledgeable, precise, calm, evidence-driven | Educational platforms, research firms |
| The Hero | Bold, confident, action-oriented, motivational | Sports, fitness, career brands |
| The Rebel | Direct, contrarian, unfiltered, provocative | Disruptor startups, youth brands |
| The Everyman | Relatable, warm, plain-spoken, inclusive | Community platforms, consumer goods |
| The Caregiver | Supportive, reassuring, patient, empathetic | Healthcare, wellness, family products |
| The Creator | Imaginative, expressive, detail-oriented | Design tools, creative software |
| The Ruler | Authoritative, polished, exclusive, precise | Luxury, enterprise, financial services |
| The Jester | Playful, witty, irreverent, light | Entertainment, consumer apps |

## Tone Attribute Checklist

Choose 3-5 attributes that stay constant regardless of channel or topic:

- Formality: formal / conversational / casual
- Energy: high-energy / measured / calm
- Humor: none / dry / playful
- Directness: blunt / diplomatic / soft
- Perspective: first-person "we" / second-person "you" / third-person neutral
- Technicality: expert jargon / plain language / simplified-for-beginners

## Voice Consistency Rules

1. **One perspective per content type.** Blog posts speak "you"-first (audience
   focused); about/mission pages speak "we"-first (brand focused).
2. **Fixed vocabulary list.** Maintain an approved/banned word list (e.g. approved:
   "streamline", banned: "synergy", "leverage" as a verb, "utilize").
3. **Sentence length ceiling.** Cap average sentence length per formality tier:
   formal ≤ 22 words, conversational ≤ 18 words, casual ≤ 14 words.
4. **Contractions rule.** Formal voice avoids contractions; casual/conversational
   voice uses them consistently ("we're" not a mix of "we're"/"we are").
5. **Consistent CTA phrasing.** Reuse the same 2-3 CTA verb patterns across content
   ("Start your trial", "See it in action") rather than inventing new ones per piece.

## Voice Drift Checks

Run before publishing multi-author or multi-piece content:

- Read 3 pieces back-to-back — do they sound like the same speaker?
- Check formality score consistency via `scripts/brand_voice_analyzer.py`.
- Verify banned words did not slip in.
- Confirm perspective (first/second person) matches the content type rule.

## Onboarding a New Writer

1. Share this file plus 3 "gold standard" published examples.
2. Have them write one sample piece in the target voice.
3. Run the sample through `scripts/brand_voice_analyzer.py` and compare formality/
   readability scores against the gold standard examples.
4. Give targeted feedback on any attribute that drifted (too formal, wrong
   perspective, sentences too long).
