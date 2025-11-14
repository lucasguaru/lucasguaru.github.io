const words = {
    "1": "Teia", "2": "Anão", "3": "Mão", "4": "Cão", "5": "Lua", "6": "Osso", "7": "Chá", "8": "Jóia", "9": "Pão", "10": "Torre",
    "11": "Dado", "12": "Tina", "13": "Dama", "14": "Taco", "15": "Telha", "16": "Taça", "17": "Tocha", "18": "Toga", "19": "Tubo", "20": "Nero",
    "21": "Nota", "22": "Ninho", "23": "Inhame", "24": "Nuca", "25": "Anel", "26": "Nasa", "27": "Inox", "28": "Anjo", "29": "Nave", "30": "Muro",
    "31": "Moto", "32": "Mono", "33": "Mamão", "34": "Maca", "35": "Mala", "36": "Mesa", "37": "Máfia", "38": "Mago", "39": "Mapa", "40": "Carro",
    "41": "Cadeia", "42": "Cone", "43": "Cama", "44": "Coco", "45": "Coelho", "46": "Casa", "47": "Café", "48": "Queijo", "49": "Copo", "50": "Lírio",
    "51": "Lata", "52": "Lenha", "53": "Limão", "54": "Leque", "55": "Lula", "56": "Laço", "57": "Lixo", "58": "Lago", "59": "Lupa", "60": "Sereia",
    "61": "Seta", "62": "Sino", "63": "Sumo", "64": "Saco", "65": "Sol", "66": "Saci", "67": "Sofá", "68": "Cego", "69": "Sapo", "70": "Ferro",
    "71": "Fada", "72": "Fone", "73": "Fumo", "74": "Foca", "75": "Folha", "76": "Foice", "77": "Fax", "78": "Fogo", "79": "Chave", "80": "Jarro",
    "81": "Gato", "82": "Gênio", "83": "Gema", "84": "Jaca", "85": "Galo", "86": "Giz", "87": "Guache", "88": "Jegue", "89": "Jipe", "90": "Pera",
    "91": "Pato", "92": "Pneu", "93": "Puma", "94": "Paca", "95": "Bola", "96": "Pizza", "97": "Peixe", "98": "Pajé", "99": "Pipa", "00": "Arara",
    "01": "Rato", "02": "Aranha", "03": "Remo", "04": "Arco", "05": "Rolha", "06": "Rosa", "07": "Rocha", "08": "Régua", "09": "Rubi", "0": "Rei",
};

function processNumber() {
    const input = document.getElementById('numberInput').value;
    const output = document.getElementById('output');

    let result = [];
    for (let i = 0; i < input.length; i += 2) {
        const chunk = input.slice(i, i + 2);
        result.push(words[chunk] || "?");
    }
    output.textContent = result.join(' - ');
}

const consonantWords = {
    "t": "1",
    "d": "1",
    "n": "2",
    "nh": "2",
    "m": "3",
    "c": "4",
    "q": "4",
    "l": "5",
    "lh": "5",
    "s": "6",
    "ç": "6",
    "z": "6",
    "ss": "6",
    "zz": "6",
    "x": "7",
    "f": "7",
    "ch": "7",
    "j": "8",
    "g": "8",
    "p": "9",
    "b": "9",
    "v": "9",
    "r": "0",
    "rr": "0",
};

let latestConsonantString = ''


function processText() {
    const input = document.getElementById('textInput').value.trim();
    if (!input) return;
    const output = document.getElementById('textOutput');

    let result = processTextRaw(input);
    output.textContent = result;
}

function processTextRaw(input) {
    // Remove vowels and spaces
    const consonantsOnly = input.toLowerCase().replace(/[^bcçdfghjklmnpqrstvxz]/gi, '');
    if (consonantsOnly == latestConsonantString) return;
    latestConsonantString = consonantsOnly
    let result = [];
    let currentPos = 0;

    if (consonantsOnly.length > 10) debugger

    while (currentPos < consonantsOnly.length) {
        let priorLetter = consonantsOnly[currentPos - 1] || '';
        let currLetter = consonantsOnly[currentPos];
        let nextLetter = consonantsOnly[currentPos + 1] || '';
        if (nextLetter) {
            let consonantCompoundFound = consonantWords[currLetter + nextLetter];
            if (consonantCompoundFound) {
                if (!!nextLetter) {
                    currentPos += 2;
                } else {
                    currentPos++;
                }
                result.push(consonantCompoundFound);
                continue;
            } else {
                if (consonantWords[currLetter] === undefined) {
                    alert("Not Found: " + currLetter);
                }
                if (priorLetter == 'f' && currLetter == 'c') currLetter = 'ss'
                currentPos++;
                result.push(consonantWords[currLetter]);
                // result.push(consonantWords[currLetter + nextLetter]);
            }
        } else {
            if (consonantWords[currLetter] === undefined) {
                alert("Not Found: " + currLetter);
            }
            if (priorLetter == 'f' && currLetter == 'c') currLetter = 'ss'
            // if (priorLetter == 's' && currLetter == 'c') currLetter = 'ss'
            currentPos++;
            result.push(consonantWords[currLetter]);
        }
    }
    // output.textContent = result.join('');

    return  result.join('');
}

function runTests(filterWord) {
  console.clear();
  console.log("=== Testando palavras do dicionário ===");

  let passed = 0;
  let failed = 0;
  const errors = [];

  const entries = Object.entries(words).filter(([num, word]) =>
    !filterWord ? true : word.toLowerCase() === String(filterWord).toLowerCase()
  );

  for (const [num, word] of entries) {
    // Garante que o cache não atrapalhe os testes
    latestConsonantString = '';

    const result = processTextRaw(word);
    const expected = num; // usa exatamente a chave do dicionário (pode ser "0", "00", "01", etc.)
    const ok = result === expected;

    if (ok) {
      console.log(`✅ ${word.padEnd(12)} => ${result}`);
      passed++;
    } else {
      console.warn(`❌ ${word.padEnd(12)} => ${result} (esperado ${expected})`);
      errors.push({ word, result, expected });
      failed++;
    }
  }

  console.log("\n=== Resultado Final ===");
  console.log(`✅ Sucesso: ${passed}`);
  console.log(`❌ Falhas: ${failed}`);

  if (errors.length) {
    console.table(errors);
  }

  return errors;
}
