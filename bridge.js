const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// YOUR NEW FILE ADDRESS
const VAULT_PATH = '/Users/satyampanwar/Desktop/Programs/Selahe/v.1.0/Vault';

// Create the Vault folder if it doesn't exist
if (!fs.existsSync(VAULT_PATH)) {
    fs.mkdirSync(VAULT_PATH, { recursive: true });
}

app.post('/save-note', (req, res) => {
    const { title, content, links } = req.body;
    
    // Clean the filename (no spaces, all lowercase)
    const fileName = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    
    // Construct the Obsidian-style Markdown
    // This allows you to open these files in Obsidian and see the graph immediately
    let mdContent = `# ${title}\n\n${content}\n\n## Synaptic Connections\n`;
    links.forEach(link => {
        mdContent += `- [[${link}]]\n`;
    });

    try {
        fs.writeFileSync(path.join(VAULT_PATH, fileName), mdContent);
        console.log(`Saved synaptic note: ${fileName}`);
        res.json({ success: true, path: fileName });
    } catch (err) {
        console.error("Failed to write file:", err);
        res.status(500).json({ error: "Failed to save note" });
    }
});

app.listen(4000, () => console.log('Selahe Bridge is live at http://localhost:4000'));