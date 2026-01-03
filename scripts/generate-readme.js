const fs = require("fs");
const fetch = require("node-fetch"); // npm install node-fetch@2 if needed

const API_URL = "https://dev-registry.onrender.com/api/skills/user/4?categories=Frontend,Backend,Languages,Databases,Tools,AI%20Tools,Services";
const README_PATH = "README.md";

// Fetch data from dev-registry
async function fetchSkills() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Failed to fetch skills");
  return await res.json();
}

function generateMarkdown(skills) {
  const categories = {};

  // Group skills by category
  skills.forEach((skill) => {
    if (!categories[skill.category]) categories[skill.category] = [];
    categories[skill.category].push(skill);
  });

  let md = ``;

  // Generate a details block for each category
  for (const category of Object.keys(categories)) {
    const categoryLower = category.toLowerCase().replace(/\s+/g, '-');
    md += `<details>\n`;
    md += `<summary><strong>$ ls ${categoryLower}/</strong></summary>\n\n`;
    md += `\`\`\`txt\n`;
    
    // Format skills in rows (approximately 3-4 per line for readability)
    const skillNames = categories[category].map(s => s.name);
    let line = '';
    skillNames.forEach((name, index) => {
      line += name.padEnd(20, ' ');
      if ((index + 1) % 3 === 0 || index === skillNames.length - 1) {
        md += line.trimEnd() + '\n';
        line = '';
      }
    });
    
    md += `\`\`\`\n\n`;
    md += `</details>\n\n`;
  }

  return md.trim();
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
