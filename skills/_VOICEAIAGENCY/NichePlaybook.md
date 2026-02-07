# Niche Playbook

Per-vertical strategies, ICP profiles, pain points, and agent configurations.

---

## Niche Scoring Matrix

Score each niche 1-5 on these factors to prioritize targeting:

| Factor | What It Measures |
|--------|-----------------|
| **Call Volume** | How many inbound calls per day |
| **Ticket Value** | Average revenue per customer interaction |
| **Phone Dependency** | How critical phone is to booking/revenue |
| **Tech Adoption** | Willingness to adopt AI/automation |
| **Competition** | How many agencies serve this niche |
| **Retention** | How long clients typically stay |

### Current Niche Rankings

| Niche | Call Vol | Ticket | Phone Dep | Tech | Comp | Retain | **Total** |
|-------|---------|--------|-----------|------|------|--------|-----------|
| **Dental** | 5 | 4 | 5 | 4 | 3 | 5 | **26** |
| **Med Spa** | 4 | 5 | 4 | 5 | 2 | 4 | **24** |
| **HVAC** | 5 | 3 | 5 | 3 | 2 | 4 | **22** |
| **Legal** | 3 | 5 | 4 | 3 | 3 | 5 | **23** |
| **Real Estate** | 4 | 4 | 4 | 4 | 3 | 3 | **22** |
| **Gym/Fitness** | 4 | 2 | 3 | 4 | 2 | 3 | **18** |
| **Home Services** | 4 | 3 | 5 | 3 | 2 | 4 | **21** |
| **Auto Repair** | 4 | 3 | 4 | 3 | 1 | 4 | **19** |
| **Veterinary** | 4 | 3 | 5 | 3 | 1 | 5 | **21** |
| **Restaurants** | 5 | 2 | 3 | 3 | 2 | 3 | **18** |

---

## Dental

### ICP (Ideal Customer Profile)
- 2-10 dentist practice
- 50-200 calls/day
- Mix of general + specialty (ortho, cosmetic, pediatric)
- Using Dentrix, Eaglesoft, or Open Dental for PMS
- Front desk has 1-3 staff, often overwhelmed

### Pain Points
1. Missed calls during peak hours (morning, lunch, end of day)
2. Hold times frustrating patients → they call competitor
3. New patient intake is repetitive and time-consuming
4. After-hours calls go to voicemail → lost emergencies
5. Staff turnover means constantly retraining front desk

### Agent Configuration
```
Agent Role: Front desk receptionist
Personality: Warm, patient-focused, professional
Key Functions:
  - Book/reschedule/cancel appointments
  - Answer insurance questions
  - Handle new patient intake
  - Route emergencies to on-call
  - Provide directions, hours, parking info
Voice: Female, warm, friendly (ElevenLabs: Matilda or Rachel)
Escalation: Emergency → on-call doctor, Complex insurance → billing dept
```

### Outreach Angle
"I called your office yesterday at 11:47 AM and got voicemail. That probably happens 10-15 times a day. At $350/visit, you're leaving $50K+ on the table every month."

---

## HVAC

### ICP
- Local/regional HVAC company
- 20-100 calls/day (seasonal spikes: summer AC, winter heating)
- 2-20 trucks/technicians
- Uses ServiceTitan, Housecall Pro, or Jobber
- Dispatcher is bottleneck

### Pain Points
1. Summer/winter spikes overwhelm phone lines
2. After-hours emergency calls go unanswered
3. Dispatchers spend 80% of time on phone, not scheduling
4. Simple questions (pricing, availability) don't need humans
5. Competitors answer first → get the job

### Agent Configuration
```
Agent Role: Service coordinator / dispatcher assistant
Personality: Efficient, reassuring, knowledgeable
Key Functions:
  - Schedule service appointments
  - Triage: emergency vs routine
  - Provide rough pricing estimates
  - Dispatch emergency technician
  - Collect property/system details
Voice: Male, calm, authoritative (ElevenLabs: James or Eric)
Escalation: Emergency (no heat/AC) → immediate dispatch, Complex repair → senior tech
```

### Outreach Angle
"Summer's coming. Last July, HVAC companies in [city] missed an average of 30+ calls per day during the heat wave. What's your overflow plan this year?"

---

## Med Spa / Aesthetic Clinics

### ICP
- Boutique med spa or dermatology clinic
- 15-60 calls/day
- Services: Botox, fillers, laser, facials, body contouring
- High ticket ($200-2,000 per treatment)
- Image-conscious clientele expecting premium experience

### Pain Points
1. Front desk doubles as check-in, phone, and consultation scheduler
2. High-value leads lost to voicemail
3. Clients expect immediate, polished responses
4. Consultation requests need quick follow-up or they book elsewhere
5. Seasonal promotions create call spikes

### Agent Configuration
```
Agent Role: Patient concierge
Personality: Luxurious, warm, knowledgeable, discreet
Key Functions:
  - Book consultations and treatments
  - Describe services and general pricing
  - Handle pre-treatment FAQ (prep instructions, recovery time)
  - Promote current specials
  - Collect new patient information
Voice: Female, confident, premium (ElevenLabs: Alice or Lily)
Escalation: Medical questions → practitioner, Pricing negotiation → manager
```

### Outreach Angle
"Your Instagram has 15K followers driving calls — but I got voicemail at 2 PM on a Tuesday. Every missed call is a $500+ Botox appointment walking to your competitor down the street."

---

## Legal (Personal Injury / Family Law)

### ICP
- 2-20 attorney firm
- Personal injury, family law, immigration, criminal defense
- 10-40 calls/day
- High client value ($2,000-50,000+ per case)
- Intake process is critical for lead qualification

### Pain Points
1. Missing potential client calls = losing cases worth thousands
2. Intake is repetitive but must be done carefully (legal requirements)
3. After-hours calls from distressed people need immediate response
4. Paralegals spend too much time on phone, not on casework
5. Call screening needed — separate prospects from solicitors

### Agent Configuration
```
Agent Role: Legal intake specialist
Personality: Professional, empathetic, thorough, confidential
Key Functions:
  - Initial intake screening (case type, basic facts)
  - Schedule consultation appointments
  - Collect contact + case information
  - Provide general firm information (NOT legal advice)
  - Route urgent matters to attorney
Voice: Female, professional, measured (ElevenLabs: Alice or Dorothy)
Escalation: Urgent legal matter → duty attorney, Existing client → case manager
CRITICAL GUARDRAIL: NEVER provide legal advice. Always say "I can schedule a consultation."
```

### Outreach Angle
"Every missed call to a PI firm is potentially a $50K+ case. I noticed your after-hours calls go to a generic voicemail. What if someone in a car accident called at 9 PM?"

---

## Gym / Fitness Studios

### ICP
- Boutique gym, CrossFit box, yoga studio, or franchise location
- 15-50 calls/day
- Membership-based ($30-200/mo per member)
- High churn, acquisition-focused
- Young/tech-savvy owner

### Pain Points
1. Leads call, don't get immediate response, sign up elsewhere
2. Front desk staff focused on in-person members, not phone
3. Class schedule questions are repetitive
4. Membership cancellation calls are awkward for staff
5. Free trial inquiries need fast response

### Agent Configuration
```
Agent Role: Membership concierge
Personality: Energetic, motivating, friendly
Key Functions:
  - Schedule free trial / first visit
  - Answer class schedule questions
  - Provide membership pricing + options
  - Handle cancellation requests (retention script)
  - Provide facility information (parking, amenities, hours)
Voice: Female, energetic, upbeat (ElevenLabs: Jessica or Aria)
Escalation: Cancellation → retention specialist, Injury/safety → manager
```

### Outreach Angle
"January is your biggest month for new member leads. How many calls went to voicemail last January? Even at $50/month, 20 missed leads is $12,000 in annual revenue gone."

---

## Real Estate

### ICP
- Individual agent or small brokerage (2-15 agents)
- 10-30 calls/day
- Mix of buyer inquiries, listing calls, vendor coordination
- Speed-to-lead is everything
- Uses Zillow, Realtor.com, or direct marketing for leads

### Pain Points
1. Leads call from listings → if no answer in 60 seconds, they call next agent
2. Agent is in showings all day, can't answer phone
3. Lead qualification wastes time on unqualified buyers
4. After-hours and weekend calls are peak lead times
5. Follow-up is inconsistent

### Agent Configuration
```
Agent Role: Real estate assistant / lead qualifier
Personality: Professional, enthusiastic, knowledgeable about area
Key Functions:
  - Qualify buyer leads (budget, timeline, area preference)
  - Schedule showings and consultations
  - Answer listing questions (price, beds/baths, square footage)
  - Collect lead information for CRM
  - Route hot leads to agent immediately
Voice: Male, friendly, professional (ElevenLabs: Eric or Charlie)
Escalation: Hot lead (ready to buy now) → agent cell, Listing questions → agent
```

### Outreach Angle
"Zillow data shows the average lead calls 3 agents. The first one who answers books the showing. When you're in a showing from 2-4 PM, who's answering your leads?"
