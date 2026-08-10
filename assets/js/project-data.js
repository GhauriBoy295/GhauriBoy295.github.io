/* Case-study content for the project dialogs.

   Pure data: no DOM access and no closure dependencies, so it lifts out
   cleanly and can be edited without touching behaviour. */

export const projectData = {
    randomness: {
      kicker: 'Research case study',
      meta: 'MSc Dissertation · University of Chester · 2025–2026',
      title: 'Integrated Randomness Testing Suite',
      framework: { fn: 'Protect', note: 'Cryptographic assurance. Randomness quality underpins the key material that protective controls depend on.' },
      summary: 'A research-led project exploring how a consolidated testing workflow can help evaluate PRNG/TRNG output, identify statistical weaknesses and support more informed security assessment of randomness used in cryptographic contexts.',
      stack: ['Python', 'PRNG / TRNG', 'Statistical testing', 'Entropy analysis', 'Security research'],
      details: [
        { label: '01 / Context', title: 'The challenge', body: 'Randomness quality is fundamental to cryptographic reliability. The project focused on bringing multiple testing perspectives into a clearer, repeatable evaluation workflow.' },
        { label: '02 / Method', title: 'The approach', body: 'Structured the work around test orchestration, result interpretation and indicators associated with weak or suspicious generator behaviour.', list: ['Review relevant randomness-testing principles', 'Design an integrated analysis workflow', 'Assess output quality and interpret statistical signals'] },
        { label: '03 / Technical focus', title: 'What was examined', body: 'Randomness quality, entropy concerns, statistical behaviour, weak generator patterns and the security implications of unreliable output.' },
        { label: '04 / Learning', title: 'Practical outcome', body: 'Strengthened research design, Python-based analysis, technical documentation and the ability to connect statistical results to cyber security risk.' }
      ]
    },
    'ics-ids': {
      kicker: 'Defensive security case study',
      meta: 'Final Year Project · Air University · 2023–2024',
      title: 'Intrusion Detection for Industrial Control Systems',
      framework: { fn: 'Detect', note: 'Anomaly and event detection in an environment where continuous monitoring must not disturb the process.' },
      summary: 'An intrusion-detection concept focused on industrial environments, where availability, safety and legacy technology make monitoring and response fundamentally different from conventional IT networks.',
      stack: ['ICS / OT security', 'Intrusion detection', 'Anomaly awareness', 'Network monitoring', 'Alert logic'],
      details: [
        { label: '01 / Context', title: 'The challenge', body: 'Industrial networks require visibility without disrupting critical processes. The project explored detection thinking suited to cyber-physical environments.' },
        { label: '02 / Design', title: 'The approach', body: 'Developed and tested a concept centred on suspicious activity monitoring, vulnerability awareness and alert generation.', list: ['Map ICS-specific security concerns', 'Define detection and alerting logic', 'Consider operational constraints and defensive controls'] },
        { label: '03 / Recognition', title: 'Entrepreneur Gala', body: 'The project idea was presented at Air University and achieved 2nd position at the Entrepreneur Gala.' },
        { label: '04 / Learning', title: 'Practical outcome', body: 'Built deeper awareness of ICS/OT risk, anomaly detection, industrial network defence and the importance of context-aware monitoring.' }
      ]
    },
    dfir: {
      kicker: 'Investigation case study',
      meta: 'Academic Labs · University of Chester · 2025–2026',
      title: 'Digital Forensics & Incident Response Labs',
      framework: { fn: 'Respond', note: 'Analysis, evidence handling and the reasoning that holds an incident response together.' },
      summary: 'A collection of structured academic exercises covering evidence acquisition, artefact review, forensic workflow and incident-response reasoning using recognised forensic tools.',
      stack: ['Autopsy', 'FTK Imager', 'OS Forensics', 'Evidence handling', 'Incident response'],
      details: [
        { label: '01 / Objective', title: 'The challenge', body: 'Investigations depend on preserving evidence, following repeatable processes and separating observable facts from unsupported assumptions.' },
        { label: '02 / Workflow', title: 'The approach', body: 'Applied investigation steps from acquisition and review through interpretation and reporting.', list: ['Acquire and preserve relevant evidence', 'Review forensic artefacts systematically', 'Document findings and response considerations'] },
        { label: '03 / Tooling', title: 'Technical environment', body: 'Used tools including Autopsy and FTK Imager to practise forensic examination and evidence-led analysis.' },
        { label: '04 / Learning', title: 'Practical outcome', body: 'Improved forensic reasoning, attention to chain-of-custody principles, incident workflow knowledge and technical reporting.' }
      ]
    },
    assessment: {
      kicker: 'Offensive security case study',
      meta: 'Authorised Academic Labs · 2025–2026',
      title: 'Security Assessment & Active Defence Labs',
      framework: { fn: 'Identify', note: 'Asset and vulnerability identification, and the judgement about which findings actually carry risk.' },
      summary: 'Controlled, authorised lab work covering reconnaissance, vulnerability identification, validation and the translation of technical findings into practical defensive recommendations.',
      stack: ['Nmap', 'Burp Suite', 'Metasploit', 'Nessus', 'OpenVAS', 'Wireshark'],
      details: [
        { label: '01 / Scope', title: 'The challenge', body: 'Security testing must be deliberate, authorised and evidence-based. The exercises focused on identifying exposure without losing sight of remediation.' },
        { label: '02 / Method', title: 'The approach', body: 'Followed a structured assessment path in isolated lab environments.', list: ['Reconnaissance and service discovery', 'Vulnerability identification and prioritisation', 'Controlled validation and defensive recommendations'] },
        { label: '03 / Tooling', title: 'Technical environment', body: 'Worked with network, web and vulnerability-assessment tools including Nmap, Burp Suite, Nessus, OpenVAS and Wireshark.' },
        { label: '04 / Learning', title: 'Practical outcome', body: 'Developed stronger scoping discipline, technical validation skills and the ability to communicate findings in remediation-focused language.' }
      ]
    },
    'blood-bank': {
      kicker: 'Development case study',
      meta: 'Semester Project · Air University · 2022',
      title: 'Blood Bank Database System',
      summary: 'A relational database project designed to organise donor records, blood inventory and distribution data through a clearer and more maintainable information structure.',
      stack: ['SQL', 'Relational modelling', 'Data integrity', 'System analysis'],
      details: [
        { label: '01 / Context', title: 'The challenge', body: 'Blood-bank information involves multiple connected records that need accuracy, traceability and efficient retrieval.' },
        { label: '02 / Design', title: 'The approach', body: 'Modelled core entities and relationships around donors, inventory and distribution activity.', list: ['Identify data entities and relationships', 'Design a normalised relational structure', 'Support practical queries and record management'] },
        { label: '03 / Technical focus', title: 'What was built', body: 'A structured SQL database concept supporting organised storage and retrieval of operational information.' },
        { label: '04 / Learning', title: 'Practical outcome', body: 'Strengthened database design, system analysis, data-integrity thinking and SQL fundamentals.' }
      ]
    }
};
