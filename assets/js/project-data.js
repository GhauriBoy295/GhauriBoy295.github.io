/* AEGIS NEXUS — mission case-study content.

   Pure data: no DOM access, no imports. Everything here restates work that is
   already described in the portfolio — academic projects, labs and a
   dissertation. Nothing claims a client, an employer, a measured result, a
   published finding or a live system. `artefacts` lists the kinds of working
   material each piece of work involves; it is a description of the evidence
   type, not a claim about volume or outcome. */

export const order = ['randomness', 'ics-ids', 'dfir', 'assessment', 'blood-bank'];

export const projectData = {
  randomness: {
    kicker: 'Research case study',
    meta: 'MSc Dissertation · University of Chester · 2025–2026',
    title: 'Integrated Randomness Testing Suite',
    classification: 'research',
    side: 'blue',
    framework: {
      fn: 'Protect',
      note: 'Cryptographic assurance. Randomness quality underpins the key material that protective controls depend on.'
    },
    summary: 'A research-led project exploring how a consolidated testing workflow can help evaluate PRNG/TRNG output, identify statistical weaknesses and support more informed security assessment of randomness used in cryptographic contexts.',
    stack: ['Python', 'PRNG / TRNG', 'Statistical testing', 'Entropy analysis', 'Security research'],
    panels: [
      {
        id: 'overview',
        label: 'Overview',
        title: 'The challenge',
        body: 'Randomness quality is fundamental to cryptographic reliability. Testing is normally spread across separate tools and reports, which makes it harder to compare results or repeat an assessment consistently. The project focused on bringing multiple testing perspectives into one clearer, repeatable evaluation workflow.'
      },
      {
        id: 'method',
        label: 'Method',
        title: 'The approach',
        body: 'The work was structured around test orchestration, result interpretation and the indicators associated with weak or suspicious generator behaviour.',
        list: [
          'Review the relevant randomness-testing principles and their assumptions',
          'Design an integrated analysis workflow rather than a set of one-off scripts',
          'Assess output quality and interpret the statistical signals it produces'
        ]
      },
      {
        id: 'technical',
        label: 'Technical focus',
        title: 'What was examined',
        body: 'Randomness quality, entropy concerns, statistical behaviour, weak generator patterns and the security implications of unreliable output — including why a generator that looks acceptable under one test can still be unsuitable for cryptographic use.'
      },
      {
        id: 'outcome',
        label: 'Learning',
        title: 'Practical outcome',
        body: 'Strengthened research design, Python-based analysis, technical documentation and the ability to connect statistical results to cyber security risk rather than treating them as isolated numbers.'
      }
    ],
    timeline: [
      { stamp: 'Phase 01', title: 'Scope and literature', body: 'Establish which randomness properties matter for cryptographic assurance.' },
      { stamp: 'Phase 02', title: 'Workflow design', body: 'Define an integrated test orchestration path with repeatable inputs.' },
      { stamp: 'Phase 03', title: 'Analysis', body: 'Run and interpret statistical output across generator behaviours.' },
      { stamp: 'Phase 04', title: 'Write-up', body: 'Document method, interpretation and security implications.' }
    ],
    artefacts: [
      { label: 'Working material', value: 'Python analysis and orchestration code' },
      { label: 'Working material', value: 'Generated bitstream samples for testing' },
      { label: 'Working material', value: 'Statistical result tables and interpretation notes' },
      { label: 'Assessment', value: 'MSc dissertation write-up' }
    ]
  },

  'ics-ids': {
    kicker: 'Defensive security case study',
    meta: 'Final Year Project · Air University · 2023–2024',
    title: 'Intrusion Detection for Industrial Control Systems',
    classification: 'defence',
    side: 'blue',
    framework: {
      fn: 'Detect',
      note: 'Anomaly and event detection in an environment where continuous monitoring must not disturb the process.'
    },
    summary: 'An intrusion-detection concept focused on industrial environments, where availability, safety and legacy technology make monitoring and response fundamentally different from conventional IT networks.',
    stack: ['ICS / OT security', 'Intrusion detection', 'Anomaly awareness', 'Network monitoring', 'Alert logic'],
    panels: [
      {
        id: 'overview',
        label: 'Overview',
        title: 'The challenge',
        body: 'Industrial networks need visibility without disrupting critical processes. A control system cannot simply be patched, rebooted or taken offline to satisfy a security tool, so the project explored detection thinking suited to cyber-physical environments rather than transplanting IT assumptions.'
      },
      {
        id: 'method',
        label: 'Design',
        title: 'The approach',
        body: 'A concept was developed and tested around suspicious activity monitoring, vulnerability awareness and alert generation.',
        list: [
          'Map the security concerns specific to ICS and OT estates',
          'Define detection and alerting logic that respects operational constraints',
          'Consider the defensive controls that a plant can realistically adopt'
        ]
      },
      {
        id: 'constraints',
        label: 'Constraints',
        title: 'Why ICS is different',
        body: 'Safety and availability outrank confidentiality; equipment lifecycles run for decades; protocols often predate authentication. Detection therefore has to be passive where possible, tolerant of legacy traffic, and careful about what it treats as anomalous.'
      },
      {
        id: 'outcome',
        label: 'Recognition',
        title: 'Entrepreneur Gala',
        body: 'The project idea was presented at Air University and achieved 2nd position at the Entrepreneur Gala. The work also built deeper awareness of ICS/OT risk, anomaly detection, industrial network defence and the value of context-aware monitoring.'
      }
    ],
    timeline: [
      { stamp: 'Phase 01', title: 'Environment study', body: 'Understand industrial network layout and operational constraints.' },
      { stamp: 'Phase 02', title: 'Threat mapping', body: 'Identify the activity patterns worth detecting in an OT estate.' },
      { stamp: 'Phase 03', title: 'Detection logic', body: 'Define anomaly and alert rules that avoid disturbing the process.' },
      { stamp: 'Phase 04', title: 'Presentation', body: 'Present the concept; awarded 2nd position at the Entrepreneur Gala.' }
    ],
    artefacts: [
      { label: 'Working material', value: 'Segmented OT network model' },
      { label: 'Working material', value: 'Detection and alerting rule definitions' },
      { label: 'Working material', value: 'Project report and presentation' },
      { label: 'Recognition', value: 'Entrepreneur Gala, 2nd position' }
    ]
  },

  dfir: {
    kicker: 'Investigation case study',
    meta: 'Academic Labs · University of Chester · 2025–2026',
    title: 'Digital Forensics & Incident Response Labs',
    classification: 'defence',
    side: 'blue',
    framework: {
      fn: 'Respond',
      note: 'Analysis, evidence handling and the reasoning that holds an incident response together.'
    },
    summary: 'A collection of structured academic exercises covering evidence acquisition, artefact review, forensic workflow and incident-response reasoning using recognised forensic tools.',
    stack: ['Autopsy', 'FTK Imager', 'OS Forensics', 'Evidence handling', 'Incident response'],
    panels: [
      {
        id: 'overview',
        label: 'Overview',
        title: 'The challenge',
        body: 'Investigations depend on preserving evidence, following repeatable processes and separating observable facts from unsupported assumptions. The labs were about building that discipline, not about producing a dramatic finding.'
      },
      {
        id: 'method',
        label: 'Workflow',
        title: 'The approach',
        body: 'Investigation steps were applied end to end, from acquisition and review through interpretation and reporting.',
        list: [
          'Acquire and preserve the relevant evidence without altering the source',
          'Review forensic artefacts systematically rather than opportunistically',
          'Document findings, gaps and response considerations'
        ]
      },
      {
        id: 'tooling',
        label: 'Tooling',
        title: 'Technical environment',
        body: 'Tools including Autopsy, FTK Imager and OS Forensics were used to practise forensic examination and evidence-led analysis, with attention to how each tool represents and interprets the underlying data.'
      },
      {
        id: 'outcome',
        label: 'Learning',
        title: 'Practical outcome',
        body: 'Improved forensic reasoning, attention to chain-of-custody principles, incident workflow knowledge and technical reporting — particularly the habit of writing down what the evidence supports and what it does not.'
      }
    ],
    timeline: [
      { stamp: 'Step 01', title: 'Acquisition', body: 'Create and verify an image of the lab evidence source.' },
      { stamp: 'Step 02', title: 'Examination', body: 'Work through file system, artefact and timeline data.' },
      { stamp: 'Step 03', title: 'Analysis', body: 'Interpret what the artefacts do and do not establish.' },
      { stamp: 'Step 04', title: 'Reporting', body: 'Record the process, findings and response considerations.' }
    ],
    artefacts: [
      { label: 'Working material', value: 'Lab-provided disk images' },
      { label: 'Working material', value: 'Autopsy case files and artefact exports' },
      { label: 'Working material', value: 'Acquisition hash verification records' },
      { label: 'Working material', value: 'Investigation notes and lab reports' }
    ]
  },

  assessment: {
    kicker: 'Offensive security case study',
    meta: 'Authorised Academic Labs · 2025–2026',
    title: 'Security Assessment & Active Defence Labs',
    classification: 'offensive',
    side: 'red',
    framework: {
      fn: 'Identify',
      note: 'Asset and vulnerability identification, and the judgement about which findings actually carry risk.'
    },
    summary: 'Controlled, authorised lab work covering reconnaissance, vulnerability identification, validation and the translation of technical findings into practical defensive recommendations.',
    stack: ['Nmap', 'Burp Suite', 'Metasploit', 'Nessus', 'OpenVAS', 'Wireshark'],
    panels: [
      {
        id: 'overview',
        label: 'Overview',
        title: 'Scope and authorisation',
        body: 'Security testing must be deliberate, authorised and evidence-based. All of this work took place in isolated academic lab environments with explicit scope. The exercises focused on identifying exposure without losing sight of remediation.'
      },
      {
        id: 'method',
        label: 'Method',
        title: 'The approach',
        body: 'A structured assessment path was followed rather than opportunistic tool-running.',
        list: [
          'Reconnaissance and service discovery',
          'Vulnerability identification and prioritisation',
          'Controlled validation, then defensive recommendations'
        ]
      },
      {
        id: 'tooling',
        label: 'Tooling',
        title: 'Technical environment',
        body: 'Network, web and vulnerability-assessment tools including Nmap, Burp Suite, Nessus, OpenVAS and Wireshark, used with an understanding of what each tool proves and where it only suggests.'
      },
      {
        id: 'outcome',
        label: 'Learning',
        title: 'Practical outcome',
        body: 'Stronger scoping discipline, technical validation skills and the ability to communicate findings in remediation-focused language rather than as a raw scanner dump.'
      }
    ],
    timeline: [
      { stamp: 'Step 01', title: 'Authorisation and scope', body: 'Confirm the boundary of the lab environment before any activity.' },
      { stamp: 'Step 02', title: 'Reconnaissance', body: 'Enumerate hosts, services and exposed surface.' },
      { stamp: 'Step 03', title: 'Validation', body: 'Confirm which identified issues are genuinely exploitable in scope.' },
      { stamp: 'Step 04', title: 'Defensive write-up', body: 'Convert findings into control and remediation recommendations.' }
    ],
    artefacts: [
      { label: 'Working material', value: 'Scope and authorisation record' },
      { label: 'Working material', value: 'Service discovery output' },
      { label: 'Working material', value: 'Vulnerability findings with prioritisation' },
      { label: 'Working material', value: 'Remediation recommendation notes' }
    ]
  },

  'blood-bank': {
    kicker: 'Development case study',
    meta: 'Semester Project · Air University · 2022',
    title: 'Blood Bank Database System',
    classification: 'development',
    side: 'blue',
    summary: 'A relational database project designed to organise donor records, blood inventory and distribution data through a clearer and more maintainable information structure.',
    stack: ['SQL', 'Relational modelling', 'Data integrity', 'System analysis'],
    panels: [
      {
        id: 'overview',
        label: 'Overview',
        title: 'The challenge',
        body: 'Blood-bank information involves multiple connected records that need accuracy, traceability and efficient retrieval. Poor structure in this kind of system is not just untidy — it makes the data untrustworthy.'
      },
      {
        id: 'method',
        label: 'Design',
        title: 'The approach',
        body: 'Core entities and relationships were modelled around donors, inventory and distribution activity.',
        list: [
          'Identify the data entities and the relationships between them',
          'Design a normalised relational structure',
          'Support practical queries and record management'
        ]
      },
      {
        id: 'technical',
        label: 'Technical focus',
        title: 'What was built',
        body: 'A structured SQL database concept supporting organised storage and retrieval of operational information, with constraints expressing the rules the data has to obey.'
      },
      {
        id: 'outcome',
        label: 'Learning',
        title: 'Practical outcome',
        body: 'Strengthened database design, system analysis, data-integrity thinking and SQL fundamentals — and an appreciation that privacy and integrity requirements belong in the schema, not only in the application.'
      }
    ],
    timeline: [
      { stamp: 'Phase 01', title: 'Requirements', body: 'Identify the records a blood bank actually has to hold.' },
      { stamp: 'Phase 02', title: 'Modelling', body: 'Design entities, relationships and normalisation.' },
      { stamp: 'Phase 03', title: 'Implementation', body: 'Build the schema and its integrity constraints.' },
      { stamp: 'Phase 04', title: 'Queries', body: 'Support the retrieval and management operations the system needs.' }
    ],
    artefacts: [
      { label: 'Working material', value: 'Entity-relationship model' },
      { label: 'Working material', value: 'Normalised schema definition' },
      { label: 'Working material', value: 'Integrity constraint set' },
      { label: 'Working material', value: 'Query and reporting examples' }
    ]
  }
};
