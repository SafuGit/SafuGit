const fs = require("fs");
const fetch = require("node-fetch"); // npm install node-fetch@2 if needed

const API_URL = "https://dev-registry.onrender.com/api/skills/user/4";
const README_PATH = "README.md";

// Fetch data from dev-registry
async function fetchSkills() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Failed to fetch skills");
  return await res.json();
}

// Generate Markdown grouped by category
function generateMarkdown(skills) {
  const categories = {};

  skills.forEach((skill) => {
    if (!categories[skill.category]) categories[skill.category] = [];
    const badge = `<div style="display: flex; flex-direction: column; align-items: center; margin: 10px; width: 80px;">
  <img src="${skill.iconUrl}" alt="${skill.name}" width="50" height="50" />
  <p style="margin: 5px 0 0 0; font-size: 12px; text-align: center;">${skill.name}</p>
</div>`;
    categories[skill.category].push(badge);
  });

  let md = `# My Skills\n\n`;
  for (const category of Object.keys(categories)) {
    md += `## ${category}\n`;
    md += `<div style="display: flex; flex-wrap: wrap; justify-content: flex-start;">\n`;
    md += categories[category].join("\n") + "\n";
    md += `</div>\n\n`;
  }

  return md;
}

// Replace README content between markers
function updateReadme(mdContent) {
  const readme = fs.existsSync(README_PATH)
    ? fs.readFileSync(README_PATH, "utf-8")
    : "";

  const startMarker = "<!-- START_SKILLS -->";
  const endMarker = "<!-- END_SKILLS -->";
  const regex = new RegExp(`${startMarker}[\\s\\S]*${endMarker}`, "m");

  const newSection = `${startMarker}\n${mdContent}${endMarker}`;
  const newReadme = readme.match(regex)
    ? readme.replace(regex, newSection)
    : readme + "\n\n" + newSection;

  fs.writeFileSync(README_PATH, newReadme);
  console.log("README.md updated successfully!");
}

// Main
(async () => {
  try {
    const skills = await fetchSkills();
    const md = generateMarkdown(skills);
    updateReadme(md);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
