# project1

Sample project workspace for the requirements → code → tests → coverage-report pipeline described in [agentic-orchestration-plan.md](../agentic-orchestration-plan.md).

Pipeline artifacts (`requirements.yaml`, `traceability-matrix.json`, `test-results.xml`, `report.html`, etc.) for this project are generated here as the orchestrator and its subagents run.

## cost-ledger.json

Append-only ledger of estimated AI-agent spend for this project, maintained by the **Cost Estimation Agent**. It is only updated right after another agent finishes a unit of real work — never on a plain "what have we spent" query.
