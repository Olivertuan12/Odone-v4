import fs from 'fs';
async function run() {
  const urls = [
    'https://raw.githubusercontent.com/Olivertuan12/Odone-v3/main/src/pages/ProjectDetail.tsx',
    'https://raw.githubusercontent.com/Olivertuan12/Odone-v3/main/src/components/DriveFolderMapper.tsx'
  ];
  for (let url of urls) {
    const res = await fetch(url);
    const text = await res.text();
    fs.writeFileSync(url.split('/').pop() + '.txt', text);
  }
}
run();
