import os

replacements = {
    "CodeGuardian AI": "PRISM-AI",
    "CodeGuardian": "PRISM-AI",
    "Tech_Exchangers": "ZerothLayer",
    "PRISM · GitLab AI Hackathon 2026 · Tech_Exchangers": "PRISM-AI · GitLab AI Hackathon 2026 · ZerothLayer",
    "prism-ai-backend": "prism-ai-backend" 
}

target_files = [
    "c:/Users/ACER/Documents/Gitlab/PRISM-AI/README.md",
    "c:/Users/ACER/Documents/Gitlab/PRISM-AI/ARCHITECTURE.md",
    "c:/Users/ACER/Documents/Gitlab/PRISM-AI/CONTRIBUTING.md",
    "c:/Users/ACER/Documents/Gitlab/PRISM-AI/backend/main.py",
    "c:/Users/ACER/Documents/Gitlab/PRISM-AI/frontend/app/layout.tsx"
]

for fp in target_files:
    if os.path.exists(fp):
        with open(fp, 'r', encoding='utf-8') as f:
            content = f.read()
        
        orig = content
        for k, v in replacements.items():
            content = content.replace(k, v)
            
        if content != orig:
            with open(fp, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"=== FULL MODIFIED FILE: {os.path.basename(fp)} ===")
            print(content)
            print("==================================\\n")
