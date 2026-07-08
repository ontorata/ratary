import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();

const files = {
  adr: '.ai/core/architecture/ADR-0009-provider-conformance-harness.md',
  contract: '.ai/governance/provider-conformance/contract.md',
  scenarios: '.ai/governance/provider-conformance/scenarios/README.md',
  acceptance: '.ai/governance/provider-conformance/results/p2-c0-acceptance-record.md',
  openai: '.ai/governance/provider-conformance/results/openai-pass.md',
  stub: '.ai/governance/provider-conformance/results/stub-pass.md',
};

function read(relativePath) {
  return readFileSync(join(root, relativePath), 'utf8');
}

function assertIncludes(name, text, expected) {
  if (!text.includes(expected)) {
    throw new Error(`${name} missing expected text: ${expected}`);
  }
}

const adr = read(files.adr);
const contract = read(files.contract);
const scenarios = read(files.scenarios);
const acceptance = read(files.acceptance);
const openai = read(files.openai);
const stub = read(files.stub);

assertIncludes(files.adr, adr, '| **Status** | **Accepted · Closed**');
assertIncludes(files.adr, adr, 'C-CAN');
assertIncludes(files.adr, adr, 'Status: deferred');
assertIncludes(files.adr, adr, 'npm run test:conformance');
assertIncludes(files.adr, adr, 'C-RES / C-META / C-CFG');

assertIncludes(files.contract, contract, '| **Status** | Accepted');
assertIncludes(files.contract, contract, 'Full cooperative cancellation is **deferred**');

assertIncludes(files.scenarios, scenarios, '| C-RES | Response normalization | MUST | MUST');
assertIncludes(files.scenarios, scenarios, '| C-META | Metadata envelope | MUST | MUST');
assertIncludes(files.scenarios, scenarios, '| C-CFG | Configuration failure | MUST | MUST');
assertIncludes(files.scenarios, scenarios, '| C-CAN | Cancellation | DEFER | DEFER');

assertIncludes(files.acceptance, acceptance, '| Status | CLOSED / PASS |');
assertIncludes(files.acceptance, acceptance, '| Runtime | `org-memory-p2-a-complete` |');
assertIncludes(files.acceptance, acceptance, '| Provider | `org-memory-p2-b-complete` |');
assertIncludes(files.acceptance, acceptance, 'org-memory-p2-c0-complete');
assertIncludes(files.acceptance, acceptance, '8e307ce');
assertIncludes(files.acceptance, acceptance, '12 passed');
assertIncludes(files.acceptance, acceptance, 'No `src/` changes');
assertIncludes(files.acceptance, acceptance, 'P2-C.0 is closed');
assertIncludes(files.acceptance, acceptance, '- Anthropic');
assertIncludes(files.acceptance, acceptance, '- Gemini');
assertIncludes(files.acceptance, acceptance, '- Capability negotiation');
assertIncludes(files.acceptance, acceptance, 'anthropic-pass.md');
assertIncludes(files.acceptance, acceptance, 'not a P2-C.0 revision');

assertIncludes(files.openai, openai, '| Overall | PASS |');
assertIncludes(files.openai, openai, '| C-CAN | SKIPPED | Deferred');
assertIncludes(files.stub, stub, '| Overall | PASS |');
assertIncludes(files.stub, stub, '| C-RES | PASS |');
assertIncludes(files.stub, stub, '| C-META | PASS |');
assertIncludes(files.stub, stub, '| C-CFG | PASS |');

console.log('Provider conformance governance check PASS');
