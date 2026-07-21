import { execSync } from "child_process";
import { exit } from "process";
import { getPrData, getIssueData, owner, repo } from "./ghIssueUtils.js";

const args = process.argv.slice(2);
let prNumber: number | undefined;

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--pr-number" && i + 1 < args.length) {
    prNumber = parseInt(args[i + 1], 10);
  }
}

if (!prNumber) {
  console.error("--pr-number command line argument is required.");
  exit(1);
}

// -----------------------------------------------------------------------
// Step 2 – Collect linked (closing) issues for PR
// -----------------------------------------------------------------------
const issueNodeIds = new Set<number>();
const prData = getPrData(prNumber!);
if (!prData?.merged) {
  console.log(`PR #${prNumber} is not found. Skipping.`);
  exit(1);
}
for (const issue of prData.closingIssuesReferences.nodes) {
  console.log(`PR #${prNumber} closes issue #${issue.number} (${issue.repository.nameWithOwner})`);
  issueNodeIds.add(issue.number);
}

console.log(`Linked issues found: ${issueNodeIds.size}`);
if (issueNodeIds.size === 0) {
  console.log("No linked issues found. Exiting.");
  exit(0);
}
// -----------------------------------------------------------------------
// Step 3 & 4 – For each issue, check its Status in GitHub Projects;
//              if Status is "Done", move it to "Done"
// -----------------------------------------------------------------------
let movedCount = 0;
for (const issueNumber of issueNodeIds) {
  const issue = getIssueData(issueNumber);
  console.log(`Fetched issue ${issue?.number || "N/A"} with ${issue?.projectItems?.nodes?.length || 0} project items.`);
  if (!issue) {
    console.log(`Issue with number ${issueNumber} not found. Skipping.`);
    continue;
  }
  const statusFieldValue = issue.projectItems.nodes[0].fieldValues.nodes.find(
    (field: { field?: { name?: string; id?: string; options?: { id: string; name: string }[] } }) =>
      field.field?.name?.toLowerCase() === "status"
  );

  const options = statusFieldValue?.field?.options;
  const fieldId = statusFieldValue?.field?.id;

  if (!options || !fieldId) {
    console.log(
      `Issue #${issue.number}: project "${issue.projectItems.nodes[0].project.title}" has no Status field/options. Skipping.`
    );
    continue;
  }

  const doneOption = options.find((option: { id: string; name: string }) => option.name.toLowerCase() === "done");
  console.log(
    `Issue #${issue.number}: project "${issue.projectItems.nodes[0].project.title}" has "Done" option: ${doneOption ? "Yes" : "No"}`
  );
  if (!doneOption) {
    console.log(
      `Issue #${issue.number}: project "${issue.projectItems.nodes[0].project.title}" has no "Done" option in Status field. Skipping.`
    );
    continue;
  }
  const mutation = `
    mutation($projectId: ID!, $itemId: ID!, $fieldId: ID!, $optionId: String!) {
      updateProjectV2ItemFieldValue(
        input: {
          projectId: $projectId
          itemId: $itemId
          fieldId: $fieldId
          value: { singleSelectOptionId: $optionId }
        }
      ) {
        projectV2Item {
          id
        }
      }
    }
  `;
  const variables = JSON.stringify({
    projectId: issue.projectItems.nodes[0].project.id,
    itemId: issue.projectItems.nodes[0].id,
    fieldId,
    optionId: doneOption.id
  });
  execSync(
    `gh api graphql -F projectId='${issue.projectItems.nodes[0].project.id}' -F itemId='${issue.projectItems.nodes[0].id}' -F fieldId='${fieldId}' -F optionId='${doneOption.id}' -F query='${mutation.replace(/'/g, "'\\''").replace(/\n/g, " ")}' -F variables='${variables.replace(/"/g, '\\"')}'`,
    { encoding: "utf-8" }
  );
  movedCount += 1;
  console.log(`Moved issue #${issue.number} in project "${issue.projectItems.nodes[0].project.title}" to Done.`);
}
console.log(`Done. Total project items moved: ${movedCount}`);
