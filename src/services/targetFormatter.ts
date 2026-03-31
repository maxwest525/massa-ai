import type { BuildPacket, BuildTarget } from '../types';

// ── Formatting helpers ────────────────────────────────────────────────────────

function numbered(items: string[]): string {
  return items.map((item, i) => `${i + 1}. ${item}`).join('\n');
}

function bulleted(items: string[]): string {
  return items.map((item) => `- ${item}`).join('\n');
}

function section(title: string, body: string): string {
  return `## ${title}\n${body}`;
}

// ── Public API ────────────────────────────────────────────────────────────────

export function formatPacketForTarget(packet: BuildPacket, target: BuildTarget): string {
  switch (target) {
    case 'replit':   return formatForReplit(packet);
    case 'lovable':  return formatForLovable(packet);
    case 'github':   return formatForGitHub(packet);
    case 'internal':
    default:         return formatCanonical(packet);
  }
}

export function getTargetLabel(target: BuildTarget): string {
  const labels: Record<BuildTarget, string> = {
    internal: 'Internal',
    replit:   'Replit',
    lovable:  'Lovable',
    github:   'GitHub',
  };
  return labels[target];
}

// ── Canonical (Internal) ──────────────────────────────────────────────────────

export function formatCanonical(packet: BuildPacket): string {
  const parts: string[] = [
    `# Build Packet`,
    `ID: ${packet.packetId}`,
    `Created: ${new Date(packet.createdAt).toLocaleString()}`,
    `Target: ${getTargetLabel(packet.target)}`,
    '',
    section('Objective', packet.objective),
    '',
    section('Summary', packet.summary),
  ];

  if (packet.recommendedStack.length > 0) {
    parts.push('', section('Recommended Stack', bulleted(packet.recommendedStack)));
  }
  if (packet.implementationSteps.length > 0) {
    parts.push('', section('Implementation Steps', numbered(packet.implementationSteps)));
  }
  if (packet.fileSuggestions.length > 0) {
    parts.push('', section('Files / Components', bulleted(packet.fileSuggestions)));
  }
  if (packet.executionNotes) {
    parts.push('', section('Notes', packet.executionNotes));
  }

  return parts.join('\n');
}

// ── Replit ────────────────────────────────────────────────────────────────────

function formatForReplit(packet: BuildPacket): string {
  const parts: string[] = [
    `# Massa AI → Replit Handoff`,
    '',
    section('Project Goal', packet.objective),
    '',
    section('What to Build', packet.summary),
  ];

  if (packet.recommendedStack.length > 0) {
    parts.push('', section('Tech Stack', bulleted(packet.recommendedStack)));
  }
  if (packet.implementationSteps.length > 0) {
    parts.push('', section('Implementation Steps', numbered(packet.implementationSteps)));
  }
  if (packet.fileSuggestions.length > 0) {
    parts.push('', section('File Structure', bulleted(packet.fileSuggestions)));
  }

  parts.push(
    '',
    section(
      'Execution Notes',
      [
        'Create a new Repl and implement the above step by step.',
        'Install all dependencies listed in the stack before running.',
        'Test each feature incrementally as you build.',
        'Use environment variables for any secrets or API keys.',
      ].join('\n'),
    ),
  );

  if (packet.executionNotes) {
    parts.push('', section('Additional Notes', packet.executionNotes));
  }

  return parts.join('\n');
}

// ── Lovable ───────────────────────────────────────────────────────────────────

function formatForLovable(packet: BuildPacket): string {
  const parts: string[] = [
    `# Massa AI → Lovable Build Brief`,
    '',
    section('What to Build', packet.objective),
    '',
    section('Product Summary', packet.summary),
  ];

  if (packet.fileSuggestions.length > 0) {
    parts.push('', section('Pages & Components', bulleted(packet.fileSuggestions)));
  }
  if (packet.recommendedStack.length > 0) {
    parts.push('', section('Recommended Stack', bulleted(packet.recommendedStack)));
  }
  if (packet.implementationSteps.length > 0) {
    parts.push('', section('Build Direction', numbered(packet.implementationSteps)));
  }

  parts.push(
    '',
    section(
      'UX Direction',
      [
        'Build a clean, modern UI with clear visual hierarchy.',
        'Prioritize usability and intuitive navigation.',
        'Use consistent spacing, typography, and color throughout.',
        'Ensure fully responsive design across all screen sizes.',
        'Prioritize accessibility — semantic HTML, focus states, color contrast.',
      ].join('\n'),
    ),
  );

  if (packet.executionNotes) {
    parts.push('', section('Additional Notes', packet.executionNotes));
  }

  return parts.join('\n');
}

// ── GitHub ────────────────────────────────────────────────────────────────────

function formatForGitHub(packet: BuildPacket): string {
  const parts: string[] = [
    `# Massa AI → GitHub Implementation Summary`,
    '',
    section('Commit Scope', packet.objective),
    '',
    section('Summary', packet.summary),
  ];

  if (packet.implementationSteps.length > 0) {
    parts.push('', section('Intended Changes', numbered(packet.implementationSteps)));
  }
  if (packet.fileSuggestions.length > 0) {
    parts.push('', section('Files to Create / Modify', bulleted(packet.fileSuggestions)));
  }
  if (packet.recommendedStack.length > 0) {
    parts.push('', section('Stack / Dependencies', bulleted(packet.recommendedStack)));
  }

  parts.push(
    '',
    section(
      'Suggested Commit Message',
      `feat: ${packet.title}`,
    ),
  );

  if (packet.executionNotes) {
    parts.push('', section('Implementation Notes', packet.executionNotes));
  }

  return parts.join('\n');
}
