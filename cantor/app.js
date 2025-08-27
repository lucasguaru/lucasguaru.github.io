// app.js - Letras de Músicas
import { songs } from './songs.js';
import { setupMetronome } from './metronome.js';
import { setupAutoScroll } from './scroll.js';

// --- Preferences ---
const LS_KEY = 'lyricsAppPrefs';
function savePrefs(prefs) {
	localStorage.setItem(LS_KEY, JSON.stringify(prefs));
}
function loadPrefs() {
	try {
		return JSON.parse(localStorage.getItem(LS_KEY)) || {};
	} catch { return {}; }
}
let prefs = loadPrefs();

// --- Font Size Control ---
const fontSizeRange = document.getElementById('fontSizeRange');
const fontSizeValue = document.getElementById('fontSizeValue');
function setFontSize(size) {
	document.body.style.fontSize = size + 'px';
	fontSizeValue.textContent = size + 'px';
	prefs.fontSize = size;
	savePrefs(prefs);
}
fontSizeRange.addEventListener('input', e => setFontSize(e.target.value));
setFontSize(prefs.fontSize || 18);
fontSizeRange.value = prefs.fontSize || 18;

// --- Song Navigation ---
function renderSongNav(navId, currentIdx) {
	const navList = [...document.getElementsByClassName("top-nav")]
	// const nav = document.getElementById(navId);
	// debugger
	navList.forEach(nav => {
		nav.innerHTML = '';
		songs.forEach((_, i) => {
			const btn = document.createElement('button');
			btn.textContent = i + 1;
			btn.className = (i === currentIdx) ? 'active' : '';
			btn.onclick = () => scrollToSong(i);
			nav.appendChild(btn);
		});
	})
}

// --- Songs Render ---
const songsContainer = document.getElementById('songs-container');
function renderSongs() {
	songsContainer.innerHTML = '';
	songs.forEach((song, i) => {
		const section = document.createElement('section');
		section.className = 'song-section';
		section.id = 'song-' + i;
		
		// <nav id="top-nav" class="song-nav"></nav>
		const nav = document.createElement('nav');
		// nav.id = 'top-nav';
		nav.className = 'song-nav top-nav';
		section.appendChild(nav);
		// renderSongNav('top-nav', 0);

		// if (i === 0) renderSongNav('top-nav', 0);
		// Title
		const title = document.createElement('div');
		title.className = 'song-title';
		title.textContent = song.title;
		section.appendChild(title);
		// Artist
		const artist = document.createElement('div');
		artist.className = 'song-artist';
		artist.textContent = song.artist;
		section.appendChild(artist);
		// Lyrics
		const pre = document.createElement('pre');
		pre.className = 'lyrics';
		pre.textContent = song.lyrics;
		section.appendChild(pre);
		songsContainer.appendChild(section);
	});
	renderSongNav('bottom-nav', 0);
}
renderSongs();

// --- Scroll to Song ---
function scrollToSong(idx) {
	const el = document.getElementById('song-' + idx);
	if (el) {
		el.scrollIntoView({ behavior: 'smooth', block: 'start' });
		setCurrentSongNav(idx);
		stopAutoScroll();
		stopMetronome();
	}
}
function setCurrentSongNav(idx) {
	renderSongNav('top-nav', idx);
	renderSongNav('bottom-nav', idx);
}

// --- Auto Scroll ---
const { startAutoScroll, stopAutoScroll } = setupAutoScroll(prefs, savePrefs);

// Controle de BPM agora é feito pelo módulo metronome.js
// --- Metronome ---
const { startMetronome, stopMetronome } = setupMetronome(prefs, savePrefs);

// --- Inicialização: restaurar preferências ---
if (prefs.fontSize) setFontSize(prefs.fontSize);
if (prefs.scrollSpeed) scrollSpeed.value = prefs.scrollSpeed;
if (prefs.bpm) bpmRange.value = prefs.bpm;

// Selecionar elementos dos painéis e botões flutuantes
const scrollPanel = document.getElementById('scrollPanel');
const scrollFab = document.getElementById('scrollFab');
const metronomePanel = document.getElementById('metronomePanel');
const metronomeFab = document.getElementById('metronomeFab');

// Fechar painéis ao clicar fora
window.addEventListener('mousedown', e => {
	if (scrollPanel && scrollFab && !scrollPanel.contains(e.target) && e.target !== scrollFab) showPanel(scrollPanel, false);
	if (metronomePanel && metronomeFab && !metronomePanel.contains(e.target) && e.target !== metronomeFab) showPanel(metronomePanel, false);
});
