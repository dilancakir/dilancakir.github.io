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
          const text = item.textContent;
          const match = text.match(/(\d{1,2})[-–](\d{1,2}) (\w+) (\d{4})/i);
          if (match) {
            const [ , startDay, endDay, month, year ] = match;
            const date = new Date(`${month} ${startDay}, ${year}`);
            const organisedText = '<p class="organised-note">organised</p>';
            item.innerHTML = organisedText + item.innerHTML;
            eventEntries.push({ date, html: item.innerHTML });
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
          const match = dateText?.match(/(\d{1,2})\s*[-–]\s*(\d{1,2}) (\w+) (\d{4})/i);
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
  const upcoming = eventEntries
    .filter(e => e.date >= today)
    .sort((a, b) => a.date - b.date);

  const container = document.getElementById('upcoming-grid');
  upcoming.forEach(event => {
    const div = document.createElement('div');
    div.classList.add('event-card');
    div.innerHTML = event.html;
    container.appendChild(div);
  });
}

loadEvents();
