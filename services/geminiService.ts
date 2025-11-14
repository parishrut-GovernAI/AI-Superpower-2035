



import { GoogleGenAI, Type } from "@google/genai";
import type { Country, GameHistoryItem, Metrics, Scenario } from '../types/game';
import { FINAL_YEAR } from '../constants/gameConstants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const jargonSchema = {
    type: Type.OBJECT,
    properties: {
        term: { type: Type.STRING },
        definition: { type: Type.STRING }
    },
    required: ['term', 'definition']
};

const scenarioSchema = {
  type: Type.OBJECT,
  properties: {
    scenario_title: { type: Type.STRING },
    scenario_description: { type: Type.STRING },
    choices: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    jargons: {
        type: Type.ARRAY,
        items: jargonSchema,
        description: "A list of 1-3 key technical, economic, or policy jargon terms mentioned or relevant to this specific scenario. Each term should have a concise, one-sentence definition."
    }
  },
  required: ['scenario_title', 'scenario_description', 'choices']
};

const scenariosSchema = {
    type: Type.ARRAY,
    items: scenarioSchema,
};

const curveballEventChoiceSchema = {
    type: Type.OBJECT,
    properties: {
        choice_text: { type: Type.STRING, description: "A short, actionable choice text (under 15 words)." },
        metric_impacts: {
            type: Type.OBJECT,
            properties: {
                gdpContribution: { type: Type.NUMBER, description: "Change in AI GDP Contribution (%). Can be positive or negative." },
                stemWorkforce: { type: Type.NUMBER, description: "Change in STEM Workforce (in millions)." },
                aiStartups: { type: Type.NUMBER, description: "Change in number of AI Startups." },
                governmentAdoption: { type: Type.NUMBER, description: "Change in Government AI Adoption score." },
                defenseSpending: { type: Type.NUMBER, description: "Change in AI Defense Spending (%)." },
                rdSpending: { type: Type.NUMBER, description: "Change in AI R&D Spending (%)." },
            },
            description: "An object representing the immediate, short-term impact on national metrics. Only include keys for metrics that are affected."
        }
    }
};

const curveballEventSchema = {
    type: Type.OBJECT,
    properties: {
        event_title: { type: Type.STRING, description: "A punchy, urgent title for the event." },
        event_description: { type: Type.STRING, description: "A 1-2 sentence description of the immediate challenge or opportunity." },
        choices: {
            type: Type.ARRAY,
            items: curveballEventChoiceSchema,
            description: "An array of 2-3 difficult choices the player must make immediately."
        }
    }
};


const newsItemSchema = {
    type: Type.OBJECT,
    properties: {
        headline: { type: Type.STRING, description: "A concise, newspaper-style headline." },
        summary: { type: Type.STRING, description: "A one-sentence summary of the event." },
        is_curveball: { type: Type.BOOLEAN, description: "Set to true if this is the unexpected 'curveball' event, otherwise false." },
        event: {
            ...curveballEventSchema,
            description: "If 'is_curveball' is true, you MUST generate a corresponding immediate event object here. If 'is_curveball' is false, this field MUST be omitted."
        }
    }
};

const outcomeSchema = {
    type: Type.OBJECT,
    properties: {
        outcome_summary: { type: Type.STRING, description: "A narrative summary of what happened over the 5 years due to the choices." },
        updated_metrics: {
            type: Type.OBJECT,
            properties: {
                gdpContribution: { type: Type.NUMBER, description: "New AI Contribution to GDP (%)" },
                stemWorkforce: { type: Type.NUMBER, description: "New STEM Workforce (in millions)" },
                aiStartups: { type: Type.NUMBER, description: "New total number of AI Startups" },
                governmentAdoption: { type: Type.NUMBER, description: "New Government AI Adoption score (1-10)" },
                defenseSpending: { type: Type.NUMBER, description: "New AI Expenditure in Defense (% of budget)" },
                rdSpending: { type: Type.NUMBER, description: "New R&D Expenditure in AI (% of budget)" },
            },
            required: [
                'gdpContribution',
                'stemWorkforce',
                'aiStartups',
                'governmentAdoption',
                'defenseSpending',
                'rdSpending',
            ],
        },
        news_feed: {
            type: Type.ARRAY,
            items: newsItemSchema,
            description: "A list of 3-4 news headlines summarizing key events over the 5-year period. One of these MUST be a 'curveball' event — an unexpected geopolitical, technological, or domestic event not directly caused by the player's choices but relevant to their situation. Mark it with is_curveball: true. For the curveball event, you MUST also generate a corresponding 'event' object detailing an immediate choice for the player."
        }
    },
};

const languageMap: Record<string, string> = {
    en: 'English',
    zh: 'Mandarin Chinese',
    hi: 'Hindi',
    id: 'Bahasa Indonesia',
    lo: 'Laotian',
    tl: 'Tagalog',
};

export async function generateScenarios(country: Country, year: number, metrics: Metrics, history: GameHistoryItem[], languageCode: string): Promise<{scenarios: Scenario[], sources: any[]}> {
  const language = languageMap[languageCode] || 'English';
  
  const narrativeHistory = history.slice().reverse().map(turn => ({
    year: turn.year,
    decisions: turn.scenarios.map((scenario, index) => ({
      dilemma: scenario.scenario_title,
      decision: scenario.choices[turn.choiceIndices[index]],
    })),
    outcome: turn.outcome,
    resulting_metrics: turn.metrics,
  }));

  const prompt = `
    You are a sophisticated AI policy and geopolitics simulation engine. Your sole purpose is to create challenging, realistic, and deeply contextualized scenarios for a strategy game.

    **CRITICAL REQUIREMENT: UP-TO-DATE KNOWLEDGE**
    You MUST use your most recent internal knowledge (reflecting events up to the last 12-18 months) to ground your scenarios. Use recent AI-related news, technological breakthroughs, major startup funding rounds, and national policy announcements specifically for ${country.name}. The scenarios you create MUST directly reflect these recent, real-world events to be as timely and realistic as possible.

    **Game Context:**
    - Player's Country: ${country.name}
    - Goal: Become the #1 AI Superpower by ${FINAL_YEAR}.
    - Current Year: ${year}
    - Current National Metrics: ${JSON.stringify(metrics)}
    - Output Language: ${language}

    **Historical Context & Narrative So Far:**
    You MUST analyze the player's entire history to understand the narrative arc of their nation, its accumulated strengths, and weaknesses. This context is critical for generating relevant and evolving new scenarios that build upon the player's specific journey. The dilemmas you create should feel like a direct continuation of their story. Do not repeat past dilemmas.
    Here is a summary of past turns, from oldest to most recent:
    ${history.length > 0 ? JSON.stringify(narrativeHistory, null, 2) : "This is the first turn. Create foundational dilemmas."}

    **Your Task:**
    Generate a set of FOUR distinct policy dilemmas for the year ${year}. These scenarios must be varied, high-stakes, force difficult trade-offs, and be NEW and DIFFERENT from previous scenarios. For EACH scenario, you MUST also identify and define 1-3 key jargon terms directly related to it.

    **CRITICAL CONTEXTUALIZATION INSTRUCTIONS:**
    Before creating scenarios, deeply consider the specific context of ${country.name}:
    1.  **Geopolitical Reality:** Reference its key alliances, regional relationships, and specific ongoing conflicts or points of tension. You MUST incorporate the global AI chip rivalry. This includes dilemmas related to supply chain management and AI chip quotas imposed by policies like the US CHIPS and Science Act and other export controls. Scenarios should force the player to make strategic decisions about sourcing advanced hardware and navigate intense pressure from both the US and China regarding technology alliances.
    2.  **National Policies & Laws:** The scenarios should reflect the country's known or plausible national strategies regarding AI, data privacy, and digital transformation. For instance, if generating for Singapore, think about its 'Smart Nation' initiative.
    3.  **Socio-Economic & Geographic Factors:** Incorporate unique national characteristics.
        - If the country is **Laos**: You MUST incorporate its unique position as a developing, landlocked nation strategically positioned in Southeast Asia, with a deep and growing partnership with China in AI.
            - **Deep China Partnership:** A central theme MUST be Laos's strategic partnership with China. Reference the **China-Laos AI Innovation Cooperation Center**. Dilemmas should explore the benefits of this partnership (e.g., rapid technology transfer, funding for infrastructure, talent training) versus the significant trade-offs (e.g., geopolitical alignment heavily towards China, technological dependency, data sovereignty concerns). A scenario could force a choice between fully integrating into China's AI ecosystem for maximum growth or trying to maintain a degree of neutrality to align with broader ASEAN frameworks.
            - **Foundational Development Stage:** Laos is in the process of drafting its very first **national AI strategy**. Scenarios MUST reflect this early, foundational stage. The dilemmas should be about fundamental, high-level choices, not fine-tuning advanced policies. For example: Should the national strategy prioritize AI for a specific sector like agriculture and logistics (leveraging its "land-linked" geography and the China-Laos Railway) or focus first on a massive, nationwide digital literacy program before specialized deployment?
            - **Navigating ASEAN Dynamics:** Scenarios must place Laos within the context of ASEAN. This creates a key tension. Dilemmas should explore how Laos navigates the various collective ASEAN initiatives (like the **ASEAN AI Safety Network** or the **Roadmap on Responsible AI**) which may have different ethical standards or goals compared to its primary partner, China. A choice could be between sending its top talent to be trained exclusively at the China-Laos center versus participating in a new US-ASEAN AI capacity-building program with different allies.
            - **Leapfrogging Opportunity:** Incorporate Laos's ambition to "leapfrog" traditional development stages using AI. Scenarios could involve using Chinese AI to modernize its national power grid, optimize logistics, or revolutionize its education system with AI tutors, each presenting significant trade-offs regarding cost, foreign control, and long-term sustainability.
        - If the country is **Singapore**: You MUST incorporate its dual role as a global finance/tech hub and a small state navigating great power competition. Scenarios should reflect its proactive, yet cautious, approach to AI governance (e.g., AI Verify, regulatory sandboxes, new deepfake laws). You MUST include the intense geopolitical pressure it faces regarding the US-China AI chip rivalry, referencing recent cases of illegal chip diversions through Singaporean entities. Dilemmas could involve strengthening export controls at the risk of losing trade, collaborating with a specific tech bloc on AI safety standards, or investing heavily in its own sovereign AI tools (like MERaLiON) to reduce dependency.
        - If the country is **Indonesia**: You MUST incorporate its identity as a rising regional power and a vast archipelago navigating the complexities of AI development. Scenarios MUST be grounded in its real-world policy initiatives and geopolitical context.
            - **Regulatory Development:** A core theme MUST be the creation of Indonesia's national AI framework. Reference the ongoing development of the **National AI Roadmap** and the upcoming **Presidential Regulation on AI**. Dilemmas should explore the tension between creating adaptive, innovation-friendly rules versus strict ethical guardrails based on the **2023 AI Ethics Circular**. A scenario could force a choice on the final draft of the regulation: prioritize economic growth by giving tech firms more freedom, or enforce strong "trust by design" principles and data sovereignty at the risk of slowing adoption.
            - **Geopolitical Balancing Act:** Scenarios MUST reflect Indonesia's multi-aligned foreign policy. Dilemmas should force strategic choices between collaborating with different global powers. For example, accepting a major investment from China to develop AI for agriculture and fisheries (a stated goal) versus partnering with India and the US on digital public infrastructure and cybersecurity. Reference its participation in **APEC** and the **BRICS+** AI governance declaration.
            - **National Initiatives & Infrastructure:** Incorporate the goals of the new **National AI Centre of Excellence (AICoE)**. A dilemma could involve deciding the AICoE's primary focus: Should it prioritize developing an "indigenous" sovereign LLM, focus on upskilling digital talent for partners like Google, or concentrate on public sector applications like bureaucratic reform and smart cities?
            - **Archipelago Challenges & Social Issues:** You MUST include scenarios unique to its geography. For example, using AI for maritime surveillance in the vast Indonesian seaways, for disaster prediction and response across its thousands of islands, or to tackle logistical challenges. Also, include domestic social issues like the government's push to combat AI-generated hoaxes and deepfakes, and the debate around protecting creators' IP ("bankable IP").
        - If the country is **Philippines**: You MUST incorporate its unique position as a major archipelagic nation, a key player in ASEAN, and a country in the early, active stages of formulating its AI regulations.
            - **Regulatory Crossroads:** A central theme MUST be the current legislative debate with multiple competing proposals. Reference the existence of different bills like **House Bill 252** (proposing an AI Bureau) and Senator **Pia Cayetano's bill** (proposing a more powerful National AI Commission). Dilemmas should force a choice on the direction of national regulation: Should the government consolidate these bills into one strong, EU-inspired law that might be slow to pass, or fast-track a simpler bill to establish a basic framework quickly?
            - **Combating Disinformation:** Scenarios MUST address the severe challenge of AI-generated deepfakes and misinformation, a major political issue. Reference the **Comelec's guidelines** for elections and the national push for tools like "TunAI". A dilemma could be: Impose strict legal liability on social media platforms for hosting deepfakes, risking their withdrawal from the market, versus funding a massive national digital literacy and fact-checking initiative.
            - **National Strategy & Infrastructure:** Incorporate the goals of the new **National AI Strategy Roadmap 2.0** and the **Center for AI Research (CAIR)**. A choice could revolve around CAIR's first major investment: Prioritize developing a sovereign LLM fluent in Filipino and regional dialects, focus on AI for archipelagic challenges like disaster resilience and maritime logistics, or partner with the BPO industry to upskill the workforce and protect the digital services sector from automation.
            - **Geopolitics and ASEAN:** The Philippines' role in ASEAN and its strategic importance is key. Scenarios should reflect its push for a common regional framework for ethical AI, as stated by **President Marcos Jr.** Dilemmas could explore the tension between this collaborative ASEAN approach and national security needs. For instance: Co-develop a shared ASEAN AI maritime surveillance platform for the South China Sea, or accept a bilateral deal with the US for advanced, proprietary AI-powered naval drones and intelligence systems.
        - If the country is **India**: You MUST incorporate its "innovation over restraint" philosophy and its ambition to become a global AI powerhouse for its 1.4 billion citizens. Scenarios MUST reflect the goals of the **IndiaAI Mission**, including the push to deploy tens of thousands of GPUs for domestic use, establish national data labs, and develop sovereign, multi-lingual LLMs to serve its diverse population. Dilemmas should explore the tension between this ambitious national strategy and its cautious regulatory approach, which favors voluntary codes (like Nasscom's playbook) and industry consultation over immediate, strict laws. You MUST also include India's unique geopolitical positioning: its active participation in multiple global forums (BRICS, G20) and bilateral partnerships (with the US, Japan, EU, Singapore) creates complex choices. A scenario could involve choosing between adopting Western AI safety standards versus co-developing a framework with BRICS+ nations, each with different implications for data sovereignty and technological alignment. You must also touch on domestic debates, such as calls for regulating deepfakes (Digital India Act), the new AI governance guidelines ("Seven Sutras"), and sector-specific applications like using AI to regulate airfares or in public health initiatives.
        - If the country is **China**: You MUST incorporate its top-down, state-driven AI strategy ("AI Plus Action"), its goal of technological self-sufficiency, and the escalating tech rivalry with the US. Scenarios MUST reflect the intense pressure from US export controls on advanced chips (e.g., Nvidia) and China's strategic response, such as mandating state-funded data centers to use domestic chips (from SMIC, Huawei) and launching antitrust probes. Dilemmas should force difficult trade-offs: enforce strict new AI regulations (like mandatory content labeling or data security standards from CAC) which could stifle innovation, versus allowing tech giants more freedom to compete globally. You MUST also include China's efforts to establish international influence through initiatives with the Global South, ASEAN, and BRICS+ (e.g., the "Digital Silk Road", proposing global AI governance bodies), creating choices between regional cooperation and direct competition with the West.
        - If the country is **European Union**: You MUST incorporate its identity as a regulatory superpower grappling with the immense challenge of implementing its landmark **EU AI Act**. The central theme MUST be the conflict between its rights-based, risk-based approach (the 'Brussels Effect') and the intense pressure from both internal industry and external powers (especially the US) to water down or delay the rules to foster innovation and avoid trade wars. Scenarios must NOT be about creating the law, but about navigating its difficult and controversial implementation.
            - **AI Act Implementation Crisis:** Scenarios MUST reflect the real-world struggles of rolling out the AI Act. Reference the reported plans to **"pause" or "water down"** parts of the Act due to industry lobbying. A dilemma could force a choice: Postpone the compliance deadline for high-risk systems to help SMEs and prevent companies from leaving the EU (like the case of "Bird"), or strictly enforce the original timeline to maintain regulatory credibility and the "first mover" advantage in global standard-setting.
            - **GPAI Model Regulation:** This is a key flashpoint. Scenarios must address the difficult debate over regulating powerful General-Purpose AI (GPAI) models. Reference the controversial **GPAI Code of Practice** and the formal request from the US government to rewrite it. A dilemma could be: Finalize a more flexible, industry-friendly Code of Practice to appease US-based tech giants and foster transatlantic cooperation, or heed the warnings from EU lawmakers and adopt a much stricter, more prescriptive code that better protects fundamental rights but risks an international backlash.
            - **Enforcement and Resources:** You MUST incorporate the challenges facing the newly established **AI Office**. Reference its reported understaffing and the delays in developing crucial technical standards. A scenario could involve allocating the AI Office's limited budget: fully staff the enforcement division to investigate potential breaches of the AI Act's prohibitions, or prioritize the creation of the **AI Act Service Desk** and guidelines to help businesses comply, thereby risking weak enforcement.
            - **Geopolitical & Economic Strategy:** The EU must navigate its "third way" between the US and China. Reference the push for strategic autonomy through initiatives like the **Chips Act 2.0** and the creation of **AI Factories** and **Gigafactories**. A dilemma could be: Heavily subsidize a pan-European consortium to build a sovereign AI Gigafactory, ensuring data stays within the EU but potentially lagging technologically, versus partnering with a US tech giant to get a state-of-the-art facility built faster but with strings attached regarding data access and alignment with US policy.
            - **Data & GDPR:** The tension between AI development and data protection is critical. Reference the ongoing debate about allowing **"legitimate interest"** as a legal basis for AI training under GDPR. A scenario could force a decision: Propose a formal amendment to GDPR to clarify and allow this, boosting the competitiveness of EU AI companies, or maintain the strict status quo to uphold Europe's world-leading privacy standards, even if it means developers have less data to work with.
        - If the country is **United States**: You MUST incorporate the major policy shift towards deregulation and an "America First" approach to AI, as outlined in the US AI Action Plan (2025). Scenarios must reflect the Trump administration's priorities: revoking previous executive orders to "remove barriers" to innovation, and focusing on economic nationalism and intense competition with China.
            - **Deregulation vs. State Laws:** A core theme MUST be the conflict between the federal push for a "light touch" approach (e.g., SANDBOX Act, warnings from AI Czar David Sacks) and the proliferation of state-level AI regulations. Dilemmas should explore the fierce debate over a federal moratorium on state laws, forcing a choice between a unified but potentially slow federal standard and a chaotic but responsive "patchwork" of state rules.
            - **Tech War with China:** Scenarios MUST be grounded in the escalating tech rivalry. This includes aggressive export controls to prevent advanced chips from reaching China (e.g., 'No Advanced Chips for the CCP Act'), investigating smuggling operations, and banning Chinese AI applications like DeepSeek from government use ('No Adversarial AI Act'). Dilemmas could involve imposing tariffs on foreign-made chips to force reshoring, or using the "American AI Exports Program" to arm allies with US tech stacks while restricting adversaries.
            - **Massive Infrastructure & Investment:** Reflect the huge domestic investments like "Project Stargate" ($500B) and the push for energy infrastructure (e.g., nuclear EOs) to power data centers. Dilemmas should address the consequences, such as the environmental impact or the debate over prioritizing domestic companies for access to new supercomputers (GAIN AI Act).
            - **Domestic & Social Issues:** Incorporate domestic policy debates. This includes legislation on child safety (GUARD Act, CHAT Act), copyright protection for creators (TRAIN Act), liability for AI-caused harm (AI LEAD Act), and the politically charged issue of preventing "woke AI" in government-procured models (Executive Order 14319).
        - For other countries, incorporate their unique factors. For archipelagic nations like the Philippines, a scenario could involve AI for maritime logistics or disaster response. Use the provided metrics to inform the starting point of the dilemmas.

    **Scenario Topics:**
    You MUST generate ONE scenario for EACH of the following four categories, picking a unique sub-topic and tailoring it heavily based on the contextualization instructions above. Do not just pick a generic topic; make it specific to ${country.name}.

    1.  **Economy & Startups:** (Pick one)
        - Venture capital funding for high-risk AI research.
        - Regulating AI-driven high-frequency trading.
        - Establishing international AI startup incubators.
        - National strategy for balancing open-source AI models vs. proprietary tech.
        - Tax incentives for companies automating industries with AI.
        - Creating a sovereign AI development fund.
        - Creating a national AI regulatory and innovation sandbox to allow startups to test novel use cases under temporary, relaxed regulations.
        - Legislation on anti-competition laws for AI monopolies.
        - Policies on Foreign Direct Investment (FDI) in the national AI sector.
        - Implementing major tax breaks to attract foreign AI investment.
        - Establishing rules for foreign AI giants (e.g., OpenAI, DeepSeek) opening local offices, focusing on anti-competition laws and protecting the domestic startup ecosystem.

    2.  **AI Ethics & Society:** (Pick one)
        - Legislation on AI-generated art and copyright law.
        - Funding AI for mental health accessibility and diagnosis.
        - Rules for AI in predictive policing and its potential for bias.
        - Data privacy laws for biometric data collected by AI systems.
        - Combatting AI-generated 'deepfake' misinformation of political figures.
        - Responding to a national tragedy where AI-generated deepfakes of a private citizen led to their death, sparking public outcry for strict laws on personality rights and tech company accountability.
        - Using AI to preserve dying indigenous languages.
        - Implementing mandatory AI auditing for critical systems (e.g., finance, healthcare).
        - Establishing national standards for consumer data privacy in the age of AI.
        - Debating censorship policies for large language models to control information flow.
        - Addressing the misuse of AI tools for revenge crimes and character assassination online.
        - Implementing a national policy that mandates strict data sovereignty, privacy protections, and algorithmic auditing for all foreign AI companies.
        - Establishing ethical guidelines and legal boundaries for AI-driven psychological and medical advisory platforms to prevent misuse.
        - Passing legislation on the use of citizen medical data for AI training, balancing innovation with strict patient privacy rights.
        - Confronting the rise of AI-driven religious cults spreading radical ideologies, hate speech, and exploiting followers through sophisticated digital propaganda.
        - Establishing a national "Digital Age of Consent" for powerful AI models and defining strict content filters to protect minors.
        - Addressing the societal impact of hyper-realistic, AI-generated media simulating heinous acts, prompting a debate on whether to criminalize the creation and distribution of such content.

    3.  **Domestic Policy:** (Pick one)
        - Launching nationwide AI literacy programs in public schools.
        - Piloting Universal Basic Income (UBI) for jobs displaced by AI.
        - Investing in AI-powered public transportation and smart city grids.
        - Bridging the rural-urban digital divide with AI-managed infrastructure.
        - Overhauling the national healthcare system with AI-driven diagnostics.
        - Confronting public backlash over the massive energy consumption of new national data centers, causing soaring electricity bills and energy insecurity for citizens.
        - Regulations for AI tutors and personalized education platforms.
        - Funding partnerships between universities and private tech companies for AI research.
        - Creating frameworks for public-private partnerships on national AI projects.
        - Building a national supercomputing center: focus on public research or lease to private industry?
        - Funding a network of national AI research labs via government budget or public-private partnerships.
        - Massive investment in sovereign data centers to boost national AI capabilities.
        - Mandating a percentage of high-level AI jobs be filled by local talent.
        - National programs to improve AI literacy and usage skills for the aging population.
        - Debating the appointment of an AI-powered 'virtual minister' to oversee a specific public sector (e.g., logistics, urban planning), addressing human oversight.
        - Establishing the level of AI integration in core public services, weighing efficiency against national security and data privacy risks.

    4.  **Geopolitics & Defense:** (Pick one)
        - Signing an international treaty on the use of lethal autonomous weapons (LAWs).
        - Forming a strategic tech alliance with a specific power bloc (e.g., EU, ASEAN).
        - Responding to an AI-driven cyberattack on national energy infrastructure.
        - Investing in AI for satellite reconnaissance and intelligence gathering.
        - Defining rules of engagement for AI-piloted drones in contested airspace.
        - Accepting a massive investment from a US-based AI giant versus a Chinese competitor to build national AI infrastructure, each with different data-sharing and geopolitical alignment clauses.
        - Navigating US-led AI chip quotas and export restrictions (inspired by the CHIPS and Science Act), forcing a choice between compliance, finding alternative suppliers, or a high-risk domestic fabrication strategy.
        - Choosing a strategic AI technology partner: Align with a US-led technology alliance for access to top-tier chips at the cost of severing ties with Chinese tech, or join a China-led initiative with different technological and geopolitical trade-offs.
        - Formulating a national AI hardware supply chain policy: Prioritize stockpiling foreign chips, funding domestic R&D for self-sufficiency, or creating diverse international supplier partnerships.
        - Joining a global alliance to set open standards for AI ethics and interoperability, risking alienating nations with closed ecosystems.
        - Participating in a multi-national 'semiconductor pact' to build next-gen chip foundries, sharing costs but requiring technology transfer.
        - Entering a global 'Data Commonwealth' for sharing anonymized population data for research, weighing scientific breakthroughs against sovereignty risks.
        - Facing pressure to join or sanction a rival's 'Digital Silk Road' initiative, an AI-powered global infrastructure project.
        - Attending a Global AI Summit (e.g., Paris 2025, India 2026) to set the international agenda. Your nation must champion a primary objective: Push for strict global safety and ethics regulations, advocate for open-source and equitable access to AI for developing nations, or prioritize national economic interests and securing favorable tech trade agreements.


    **CRITICAL RULES for EACH scenario:**
    1.  **DEEPLY Country-Specific:** The situation MUST be uniquely tailored to ${country.name}. A scenario about maritime security for Laos would be an error. A scenario about semiconductor supply chains should feel different for the USA vs. Singapore.
    2.  **EXTREMELY CONCISE:**
        -   \`scenario_title\`: Under 8 words. Must be punchy.
        -   \`scenario_description\`: 1-2 sentences ONLY. Simple, direct language. Get straight to the dilemma.
        -   \`choices\`: Each choice must be under 12 words. They should be distinct policy actions.
    3.  **FORCE RESEARCH (No Easy Answers):** For each scenario, the three choices must represent a genuine strategic fork in the road. There should be no "correct" or "evil" choice. Each choice must have plausible positive and negative long-term consequences.
    4.  **DIVERSE & PUNCHY:** Ensure the scenarios feel distinct from typical policy questions. Frame them as urgent, specific events or dilemmas rather than generic policy areas.
    5.  **NO REPETITION:** The four dilemmas for ${year} MUST be distinct from those presented in previous years (see "Previous Scenarios Encountered" above). Do not repeat scenario titles or core conflicts. Introduce new challenges or evolve existing themes in a novel way.
    6.  **IDENTIFY JARGON:** For each scenario, include a \`jargons\` array. Identify 1-3 important technical, policy, or economic terms from your generated scenario text (e.g., 'Regulatory Sandbox', 'Lethal Autonomous Weapons', 'LLM'). Provide a very brief, one-sentence definition for each.

    **JSON Formatting Rules:**
    1. The entire output MUST be a single JSON array \`[]\`.
    2. The array must contain exactly four JSON objects \`{}\`.
    3. Each object must be separated by a comma. Do not forget the comma.
    4. Ensure all string values are enclosed in double quotes.
    5. Escape any double quotes that appear inside a string value with a backslash (e.g., "a value with \\"quotes\\" inside").

    **OUTPUT FORMAT:**
    Your entire output MUST be a single, valid JSON array containing exactly four scenario objects. Do NOT include any text, explanations, or markdown formatting (like \`\`\`json) before or after the JSON array. The entire JSON must be in ${language}.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-pro",
    contents: prompt,
    config: {
      temperature: 0.5,
      responseMimeType: "application/json",
      responseSchema: scenariosSchema,
    },
  });

  const jsonText = response.text.trim();
  const scenarios = JSON.parse(jsonText) as Scenario[];
  // No sources when not using googleSearch tool
  const sources: any[] = [];

  return { scenarios, sources };
}

export async function generateCollectiveOutcome(country: Country, year: number, metrics: Metrics, scenarios: Scenario[], choices: string[], languageCode: string) {
  const language = languageMap[languageCode] || 'English';
  const decisionsText = scenarios.map((scenario, index) => 
    `- For "${scenario.scenario_title}", the decision was: "${choices[index]}"`
  ).join('\n');

  const prompt = `
    You are a geopolitical and technology simulation AI. You will analyze a series of policy decisions made by a national leader and determine the collective outcome over a 5-year period.

    **Context:**
    - Country: ${country.name}
    - Year: ${year}
    - Current National Stats: ${JSON.stringify(metrics)}

    **Decisions Made This Term:**
    ${decisionsText}

    **Your Task:**
    1.  **Synthesize a Narrative:** Write a single, cohesive narrative summary (\`outcome_summary\`) of what happens in ${country.name} over the next 5 years. This narrative should realistically weave together the consequences of ALL FOUR decisions. Do not describe the outcomes one-by-one; create a holistic story of the nation's progress or struggles.
    2.  **Calculate New Metrics:** Based on the combined impact of the choices, calculate the new national stats (\`updated_metrics\`) for the year ${year + 5}. The changes should be logical and moderate, reflecting the combined 5-year impact. Unwise, conflicting decisions might lead to stagnation or decline in some areas, while synergistic choices could lead to greater gains. Avoid unrealistic jumps. A set of decisions should not increase GDP contribution by more than 5-8 percentage points total, for example.
    3.  **Generate a News Feed:** Create a \`news_feed\` array of 3-4 news headlines.
        - One of these headlines MUST be a "curveball" event. Mark this specific item with \`is_curveball: true\`.
        - **DIVERSIFY THE CURVEBALL:** The curveball event must be an unexpected external event, not a direct result of the player's choices. It must fall into one of these categories, and you should vary the category from turn to turn:
            - **Technological Breakthrough:** A rival nation or a private company announces a shocking AI advancement (e.g., "Rival Nation Announces First True AGI," "A new open-source model makes current proprietary systems obsolete," "Breakthrough in quantum computing threatens all current encryption."). The event should force an immediate R&D or policy response.
            - **Geopolitical/Policy Shift:** A sudden change in international relations or global policy (e.g., "Global AI Ethics Treaty Proposed, Demands Limits on Surveillance," "Key Trading Bloc Enforces Strict Data Localization Law," "Major AI Chip Supplier Announces Sudden Export Ban."). The event should present a diplomatic or economic dilemma.
            - **Infrastructure/Natural Disaster:** A major unforeseen event that impacts national infrastructure. This MUST be plausible for the country's geography (e.g., For Indonesia/Philippines: "Massive Undersea Cable Fault Disrupts National Internet," "Super Typhoon Destroys Key Data Center Hub." For other regions, consider other plausible disasters like earthquakes or solar flares.). The event should force a choice about rebuilding and resilience.
        - **EVENT GENERATION:** For the single curveball news item (where \`is_curveball: true\`), you MUST ALSO generate a corresponding \`event\` object. This object represents an immediate, short-term challenge or opportunity that the player must respond to right away.
            - The \`event\` must have a compelling \`event_title\`, a short \`event_description\`, and 2-3 distinct \`choices\`, all directly related to the specific curveball category.
            - Each choice MUST have a \`choice_text\` and a \`metric_impacts\` object.
            - \`metric_impacts\` specifies the *immediate change* (delta) to the national metrics. The impacts should be logical for the event. For example, a data center disaster might immediately reduce 'aiStartups' or 'gdpContribution', while a policy choice might affect 'rdSpending' or 'governmentAdoption'. These are small, immediate effects.
        - **DIVERSIFY NON-CURVEBALL NEWS:** The other 2-3 news items (where \`is_curveball: false\`) must also reflect a dynamic world. They should NOT have an \`event\` object. Choose from the following topics to create a varied and interesting news feed:
            - **Technological Progress:** A headline about a major AI hardware breakthrough (e.g., new chip designs, neuromorphic computing advances) or a significant AI research achievement from another nation that shifts the global landscape.
            - **International Policy Debates:** A headline covering global AI regulation talks, debates at the UN about an "AI arms race", or the formation of a new international AI standards body.
            - **AI's Societal Impact:** A headline about the rising challenge of AI-driven disinformation or propaganda campaigns and international efforts to combat them.
            - **Regional Geopolitics (Contextual):**
                - If the country is **Indonesia**, **Singapore**, or the **Philippines**, ONE headline may relate to rising tensions between Taiwan and China and its strategic impact on the ASEAN alliance and regional supply chains.
                - For other countries, use a relevant regional geopolitical event.
        - All other non-curveball news items should have \`is_curveball: false\` and MUST NOT have an \`event\` object.

    IMPORTANT: The entire JSON output, including all text in the summary, news feed, and event, must be in ${language}.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: outcomeSchema,
      temperature: 0.7,
    },
  });

  const jsonText = response.text.trim();
  return JSON.parse(jsonText);
}


const turnTranslationSchema = {
    type: Type.OBJECT,
    properties: {
        translated_scenarios: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    scenario_title: { type: Type.STRING },
                    scenario_description: { type: Type.STRING },
                    choices: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    jargons: { // Also translate jargons
                        type: Type.ARRAY,
                        items: jargonSchema
                    }
                }
            }
        },
        translated_outcome: {
            type: Type.STRING
        }
    }
};

const historyTranslationSchema = {
    type: Type.ARRAY,
    items: turnTranslationSchema,
};

export async function translateHistoryBatch(history: GameHistoryItem[], languageCode: string): Promise<{ translated_scenarios: Scenario[], translated_outcome: string }[]> {
    const language = languageMap[languageCode] || 'English';
    
    const historyToTranslate = history.map(turn => ({
        scenarios: turn.scenarios.map(s => ({
            scenario_title: s.scenario_title,
            scenario_description: s.scenario_description,
            choices: s.choices,
            jargons: s.jargons,
        })),
        outcome: turn.outcome,
        selected_choice_indices: turn.choiceIndices 
    }));

    const prompt = `
        You are an expert multilingual translator. Your task is to translate an array of JSON objects representing game turns into ${language}. Each object contains scenarios, choices, jargons, and an outcome. I have also included \`selected_choice_indices\` to show you which choice the player selected for each scenario (0-indexed). This context should help you provide a more accurate and coherent translation.

        **CRITICAL INSTRUCTIONS:**
        1.  Translate ALL string values for \`scenario_title\`, \`scenario_description\`, \`choices\`, \`outcome\`, and all \`term\` and \`definition\` fields within the \`jargons\` array.
        2.  The output MUST be a valid JSON array.
        3.  The structure of each object in the output array must match the provided item schema EXACTLY. Do NOT include the \`selected_choice_indices\` in your final output.
        4.  Maintain the same order of objects in the output array as in the input array.

        **Original Array of Objects to Translate:**
        \`\`\`json
        ${JSON.stringify(historyToTranslate, null, 2)}
        \`\`\`

        Translate all text content for each object to ${language} and return it as a JSON array of objects.
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: historyTranslationSchema,
          temperature: 0.2,
        },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
}
