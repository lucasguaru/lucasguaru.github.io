#!/usr/bin/env node
/**
 * Copia tarefas/pagamentos-job-recente-visual/ → tarefas/{slug}-visual/
 * Renomeia arquivos e referências pagamentos-job-recente → {slug}.
 *
 * Uso:
 *   node scaffold-flow-visual.js --slug credenciais-job-recente --flow credenciais-job-recente_flow
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '../../../../');
const TEMPLATE = path.join(ROOT, 'tarefas/pagamentos-job-recente-visual');
const TEMPLATE_SLUG = 'pagamentos-job-recente';

function parseArgs() {
    const args = process.argv.slice(2);
    const get = (flag) => {
        const i = args.indexOf(flag);
        return i >= 0 && args[i + 1] ? args[i + 1] : null;
    };
    const slug = get('--slug');
    const flow = get('--flow');
    if (!slug || !flow) {
        console.error('Uso: node scaffold-flow-visual.js --slug <slug> --flow <nome_flow>');
        console.error('  ex.: --slug credenciais-job-recente --flow credenciais-job-recente_flow');
        process.exit(1);
    }
    if (!/^[a-z0-9-]+$/.test(slug)) {
        console.error('slug inválido — use minúsculas, números e hífen');
        process.exit(1);
    }
    return { slug, flow };
}

function copyRecursive(src, dest) {
    const stat = fs.statSync(src);
    if (stat.isDirectory()) {
        fs.mkdirSync(dest, { recursive: true });
        for (const name of fs.readdirSync(src)) {
            copyRecursive(path.join(src, name), path.join(dest, name));
        }
        return;
    }
    fs.copyFileSync(src, dest);
}

function replaceInFile(filePath, from, to) {
    if (!fs.existsSync(filePath)) return;
    const ext = path.extname(filePath).toLowerCase();
    const textExts = new Set(['.md', '.json', '.js', '.html', '.css', '.csv']);
    if (!textExts.has(ext)) return;
    let text = fs.readFileSync(filePath, 'utf8');
    text = text.split(from).join(to);
    fs.writeFileSync(filePath, text, 'utf8');
}

function walkReplace(dir, from, to) {
    for (const name of fs.readdirSync(dir)) {
        const full = path.join(dir, name);
        if (fs.statSync(full).isDirectory()) {
            walkReplace(full, from, to);
        } else {
            replaceInFile(full, from, to);
        }
    }
}

function renameFiles(dir, fromPrefix, toPrefix) {
    for (const name of fs.readdirSync(dir)) {
        const full = path.join(dir, name);
        if (fs.statSync(full).isDirectory()) {
            renameFiles(full, fromPrefix, toPrefix);
            continue;
        }
        if (name.includes(fromPrefix)) {
            const newName = name.split(fromPrefix).join(toPrefix);
            fs.renameSync(full, path.join(dir, newName));
        }
    }
}

function main() {
    const { slug, flow } = parseArgs();
    const dest = path.join(ROOT, 'tarefas', `${slug}-visual`);

    if (!fs.existsSync(TEMPLATE)) {
        console.error('Template não encontrado:', TEMPLATE);
        process.exit(1);
    }
    if (fs.existsSync(dest)) {
        console.error('Destino já existe:', dest);
        console.error('Use modo continuar ou remova a pasta manualmente.');
        process.exit(1);
    }

    copyRecursive(TEMPLATE, dest);

    // Renomear arquivos com slug do template
    renameFiles(dest, TEMPLATE_SLUG, slug);

    // Substituir referências internas
    walkReplace(dest, TEMPLATE_SLUG, slug);

    // Ajustar ZOOM_STORAGE_KEY e paths específicos no JS se ainda restarem
    const jsPath = path.join(dest, 'js/swimlane-app.js');
    replaceInFile(jsPath, 'pagamentos-job-recente-visual:zoom', `${slug}-visual:zoom`);

    // Stub mínimo flow.json — agente preenche a partir do XML
    const flowJsonPath = path.join(dest, 'data', `${slug}_flow.json`);
    const stub = {
        title: `${flow} — diagrama`,
        subtitle: `Preencher app · ${flow}`,
        sourceDoc: '',
        phases: [],
        nodes: [],
        links: []
    };
    fs.writeFileSync(flowJsonPath, JSON.stringify(stub, null, 2) + '\n', 'utf8');

    // CSV vazio a partir do template global
    const csvTemplate = path.join(ROOT, 'tarefas/mapeamento-visual-flows/templates/flow-layout-colunas-template.csv');
    const csvDest = path.join(dest, 'data', `${slug}_flow-layout-comma.csv`);
    if (fs.existsSync(csvTemplate)) {
        fs.copyFileSync(csvTemplate, csvDest);
    }

    // Remover positions gerado do template (regenerar depois)
    const posPath = path.join(dest, 'data', `${slug}_flow-layout-positions.json`);
    if (fs.existsSync(posPath)) fs.unlinkSync(posPath);

    // Aliases limpos
    const aliasPath = path.join(dest, 'scripts/layout-node-aliases.json');
    fs.writeFileSync(aliasPath, JSON.stringify({ labels: {}, byRowCol: {} }, null, 2) + '\n', 'utf8');

    // README local
    replaceInFile(path.join(dest, 'README.md'), flow.replace(slug, TEMPLATE_SLUG), flow);

    console.log('OK', dest);
    console.log('  flow.json stub:', flowJsonPath);
    console.log('  CSV template:', csvDest);
    console.log('Próximo: preencher flow.json + CSV a partir do XML, validar CSV no Excel, apply-layout-from-csv.js');
}

main();
