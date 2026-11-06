/* AEGIS NEXUS — project metadata.

   v31: the substantive case-study content now lives once, as static HTML
   articles (#case-<id>) in index.html. This file holds only the short metadata
   the JavaScript enhancements need — the command palette and the documented-work
   coverage table — all of which also appears on the cards and in the articles.
   It is not a second copy of the report bodies and cannot drift from them.

   `framework.fn` restates the NIST CSF function each case study's own write-up
   names; a project with no documented function simply omits it. */

export const order = ['randomness', 'ics-ids', 'dfir', 'assessment', 'blood-bank'];

export const projectData = {
  randomness: {
    title: 'Integrated Randomness Testing Suite',
    kicker: 'Research case study',
    classification: 'research',
    stack: ['Python', 'PRNG / TRNG', 'Statistical testing', 'Entropy analysis', 'Security research'],
    framework: { fn: 'Protect' }
  },
  'ics-ids': {
    title: 'Intrusion Detection for Industrial Control Systems',
    kicker: 'Defensive security case study',
    classification: 'defence',
    stack: ['ICS / OT security', 'Intrusion detection', 'Anomaly awareness', 'Network monitoring', 'Alert logic'],
    framework: { fn: 'Detect' }
  },
  dfir: {
    title: 'Digital Forensics & Incident Response Labs',
    kicker: 'Investigation case study',
    classification: 'defence',
    stack: ['Autopsy', 'FTK Imager', 'OS Forensics', 'Evidence handling', 'Incident response'],
    framework: { fn: 'Respond' }
  },
  assessment: {
    title: 'Security Assessment & Active Defence Labs',
    kicker: 'Offensive security case study',
    classification: 'offensive',
    stack: ['Nmap', 'Burp Suite', 'Metasploit', 'Nessus', 'OpenVAS', 'Wireshark'],
    framework: { fn: 'Identify' }
  },
  'blood-bank': {
    title: 'Blood Bank Database System',
    kicker: 'Development case study',
    classification: 'development',
    stack: ['SQL', 'Relational modelling', 'Data integrity', 'System analysis']
    // No documented NIST CSF function — intentionally omitted.
  }
};
