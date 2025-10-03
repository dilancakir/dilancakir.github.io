const files = ['conferences.html', 'readings.html', 'talks.html'];

async function loadEvents() {
  const eventEntries = [];

  for (const file of files) {
    try {
      const res = await fetch(file);
      const text = await res.text();

      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');

      if (file.includes('conference')) {
        const items = doc.querySelectorAll('.conference');
        items.forEach(item => {
          const text = item.textContent.trim();

          // 1) Variante mit Monatswechsel: "26 February–01 March 2026"
          let match = text.match(/(\d{1,2}) (\w+)[-–](\d{1,2}) (\w+) (\d{4})/i);
          if (match) {
            const [ , startDay, startMonth, endDay, endMonth, year ] = match;
            const startDate = new Date(`${startMonth} ${startDay}, ${year}`);
            const endDate   = new Date(`${endMonth} ${endDay}, ${year}`);
            const organisedText = '<p class="organised-note">organised</p>';
            item.innerHTML = organisedText + item.innerHTML;
            eventEntries.push({ date: startDate, endDate, html: item.innerHTML });
            return;
          }

          // 2) Variante mit gleichem Monat: "12–14 March 2025"
          match = text.match(/(\d{1,2})[-–](\d{1,2}) (\w+) (\d{4})/i);
          if (match) {
            const [ , startDay, endDay, month, year ] = match;
            const startDate = new Date(`${month} ${startDay}, ${year}`);
            const endDate   = new Date(`${month} ${endDay}, ${year}`);
            const organisedText = '<p class="organised-note">organised</p>';
            item.innerHTML = organisedText + item.innerHTML;
            eventEntries.push({ date: startDate, endDate, html: item.innerHTML });
            return;
          }

          // 3) Einzeltag fallback: "14 March 2025"
          match = text.match(/(\d{1,2}) (\w+) (\d{4})/i);
          if (match) {
            const [ , day, month, year ] = match;
            const date = new Date(`${month} ${day}, ${year}`);
            const organisedText = '<p class="organised-note">organised</p>';
            item.innerHTML = organisedText + item.innerHTML;
            eventEntries.push({ date, endDate: date, html: item.innerHTML });
          }
        });
      }

      if (file.includes('readings')) {
        const items = doc.querySelectorAll('.reading');
        items.forEach(item => {
          const dateText = item.querySelector('.reading-details')?.textContent;
          const match = dateText?.match(/(\d{1,2}) (\w+) (\d{4})/);
          if (match) {
            const [ , day, month, year ] = match;
            const date = new Date(`${month} ${day}, ${year}`);
            const moderationText = '<p class="moderation-note">moderation</p>';
            item.innerHTML = moderationText + item.innerHTML;
            eventEntries.push({ date, html: item.innerHTML });
          }
        });
      }

      if (file.includes('talks')) {
        const items = doc.querySelectorAll('.talk');
        items.forEach(item => {
          const dateText = item.querySelector('.talk-date')?.textContent;
          const match = dateText?.match(/(\d{1,2})(?:\s*[-–]\s*(\d{1,2}))? (\w+) (\d{4})/i);
          if (match) {
            const [ , startDay, endDay, month, year ] = match;
            const date = new Date(`${month} ${startDay}, ${year}`);
            const speakerText = '<p class="speaker-note">speaker/talk</p>';
            item.innerHTML = speakerText + item.innerHTML;
            eventEntries.push({ date, html: item.innerHTML });
          }
        });
      }

    } catch (e) {
      console.error(`Fehler beim Laden von ${file}:`, e);
    }
  }

  const today = new Date();

  // 1) Kommende/aktuelle
  const upcoming = eventEntries
    .filter(e => e.date >= today)
    .sort((a, b) => a.date - b.date);

  // 2) Vergangene – jüngste zuerst
  const past = eventEntries
    .filter(e => e.date < today)
    .sort((a, b) => b.date - a.date);

  // 3) Mindestens 6 Events zusammenstellen
  const minCount = 6;
  let toRender = upcoming.length >= minCount
    ? upcoming
    : upcoming.concat(past.slice(0, minCount - upcoming.length));

  // 4) Chronologisch sortieren
  toRender = toRender.sort((a, b) => a.date - b.date);

  // 5) Rendern
  const container = document.getElementById('upcoming-grid');
  toRender.forEach(event => {
    const div = document.createElement('div');
    div.classList.add('event-card');
    div.innerHTML = event.html;
    container.appendChild(div);
  });

}

loadEvents();
