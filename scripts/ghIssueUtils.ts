import { execSync } from "child_process";

export const owner = "dp-test-org-1";
export const repo = "beachball-testing";

export function getPrData(prNumber: number) {
  const query = `
    query($owner: String!, $repo: String!, $prNumber: Int!) {
      repository(owner: $owner, name: $repo) {
        pullRequest(number: $prNumber) {
          number
          merged
          closingIssuesReferences(first: 100) {
            nodes {
              id
              number
              repository {
                nameWithOwner
              }
            }
          }
        }
      }
    }
  `;
  const prDataFromAPI = JSON.parse(
    execSync(
      `gh api graphql -F owner='${owner}' -F repo='${repo}' -F prNumber=${prNumber} -F query='${query.replace(/'/g, "'\\''")}'`,
      { encoding: "utf-8" }
    )
  );
  return prDataFromAPI.data.repository.pullRequest;
}

export function getIssueData(issueNumber: number) {
  const query = `
    query ($issueNo: Int!, $owner: String!, $repo: String!) {
      repository(owner: $owner, name: $repo) {
        issue(number: $issueNo) {
          id
          number
          title
          projectItems(first: 20) {
            nodes {
              id
              project {
                id
                title
              }
              fieldValues(first: 50) {
                nodes {
                  ... on ProjectV2ItemFieldSingleSelectValue {
                    name
                    field {
                      ... on ProjectV2SingleSelectField {
                        id
                        name
                        options {
                          id
                          name
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;
  const issueData = JSON.parse(
    execSync(
      `gh api graphql -F owner='${owner}' -F repo='${repo}' -F issueNo=${issueNumber} -F query='${query.replace(/'/g, "'\\''")}'`,
      { encoding: "utf-8" }
    )
  );
  console.log(`Fetched issue data for issue number ${issueNumber}: ${JSON.stringify(issueData, null, 2)}`);
  return issueData.data.repository.issue;
}
