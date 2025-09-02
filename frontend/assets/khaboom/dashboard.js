// Kha-Boom! Dashboard logic: fetch courses, wire search/sort/filters, update count
document.addEventListener('DOMContentLoaded', () => {
  const courseGrid = document.getElementById('courseGrid');
  const courseCountEl = document.getElementById('courseCount');
  const qInput = document.getElementById('courseSearch');
  const sortSelect = document.getElementById('sortSelect');
  const categorySelect = document.getElementById('categorySelect');
  const levelSelect = document.getElementById('levelSelect');
  const resetBtn = document.getElementById('resetFilters');

  let allCourses = [];
  let filteredCourses = [];

  const setCount = (n) => { if (courseCountEl) courseCountEl.textContent = String(n); };

  const render = (courses) => {
    courseGrid.innerHTML = '';
    courses.forEach(course => {
      const card = document.createElement('div');
      card.className = 'course-card';
      card.innerHTML = `
        <div class="course-image" style="background-image:url(/content/${course.id}/hero.jpg)">
          <div class="course-color-tag" style="background-color:${course.color || '#6B46C1'}"></div>
        </div>
        <div class="course-content">
          <h3>${course.title}</h3>
          <p>${course.description || `Explore the fascinating world of ${course.title} through interactive lessons and engaging exercises.`}</p>
        </div>
        <div class="course-footer">
          <div class="course-level level-${course.level || 'All Levels'}">${course.level || 'All Levels'}</div>
          <a class="course-link" href="/course/${course.id}">Start Learning
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"></path></svg>
          </a>
        </div>`;
      courseGrid.appendChild(card);
    });
    setCount(courses.length);
  };

  const applyFilters = () => {
    const query = (qInput?.value || '').trim().toLowerCase();
    const category = categorySelect?.value || 'all';
    const level = levelSelect?.value || 'all';
    let result = allCourses.slice();

    if (category !== 'all') result = result.filter(c => (c.category || 'mathematics') === category);
    if (level !== 'all') result = result.filter(c => (c.level || 'All Levels') === level);
    if (query) result = result.filter(c => `${c.title} ${c.id}`.toLowerCase().includes(query));

    // sort
    const sort = sortSelect?.value || 'name-asc';
    const collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});
    const byTitle = (a, b) => collator.compare(a.title, b.title);
    const levelRank = {Foundations: 1, Beginner: 1, Intermediate: 2, Advanced: 3, 'All Levels': 0};
    const byLevel = (a, b) => (levelRank[a.level] || 99) - (levelRank[b.level] || 99) || byTitle(a, b);
    if (sort === 'name-asc') result.sort(byTitle);
    else if (sort === 'name-desc') result.sort((a,b)=>byTitle(b,a));
    else if (sort === 'level-asc') result.sort(byLevel);
    else if (sort === 'level-desc') result.sort((a,b)=>byLevel(b,a));

    filteredCourses = result;
    render(filteredCourses);
  };

  const wire = () => {
    qInput?.addEventListener('input', applyFilters);
    sortSelect?.addEventListener('change', applyFilters);
    categorySelect?.addEventListener('change', applyFilters);
    levelSelect?.addEventListener('change', applyFilters);
    // wire category tabs too
    document.querySelectorAll('.category-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const cat = tab.getAttribute('data-category') || 'all';
        document.querySelectorAll('.category-tab').forEach(t=>t.classList.remove('active'));
        tab.classList.add('active');
        if (categorySelect) categorySelect.value = cat;
        applyFilters();
      });
    });
    resetBtn?.addEventListener('click', () => {
      if (qInput) qInput.value = '';
      if (sortSelect) sortSelect.value = 'name-asc';
      if (categorySelect) categorySelect.value = 'all';
      if (levelSelect) levelSelect.value = 'all';
      applyFilters();
    });
  };

  const fallback = [
    {id:'basic-probability', title:'Introduction to Probability', level:'Foundations', color:'#CD0E66', category:'probability'},
    {id:'chaos', title:'Chaos Theory', level:'Advanced', color:'#009EA6', category:'mathematics'},
    {id:'circles', title:'Circles and Pi', level:'Intermediate', color:'#5E31DC', category:'geometry'},
    {id:'codes', title:'Codes and Ciphers', level:'Intermediate', color:'#8D0EB3', category:'computer-science'},
    {id:'combinatorics', title:'Combinatorics', level:'Intermediate', color:'#CA1F7B', category:'mathematics'},
    {id:'complex', title:'Complex Numbers', level:'Advanced', color:'#1F6CA1', category:'mathematics'},
    {id:'data', title:'Data and Statistics', level:'Foundations', color:'#0D923F', category:'probability'},
    {id:'fractals', title:'Fractals', level:'Intermediate', color:'#1A9172', category:'mathematics'}
  ];

  const hydrate = (list) => list.map(c => ({
    id: c.id,
    title: c.title || c.id.split('-').map(w=>w[0].toUpperCase()+w.slice(1)).join(' '),
    level: c.level || 'All Levels',
    color: c.color,
    category: c.category || 'mathematics',
    description: c.description
  }));

  function buildCategoryTabs(courses) {
    const tabsWrap = document.querySelector('.category-tabs');
    if (!tabsWrap) return;
    const cats = new Set(['all']);
    courses.forEach(c => cats.add(c.category || 'mathematics'));
    const order = Array.from(cats);
    // Put 'all' first then alphabetical others
    const sorted = ['all', ...order.filter(c=>c!=='all').sort((a,b)=>a.localeCompare(b))];
    tabsWrap.innerHTML = '';
    sorted.forEach(cat => {
      const div = document.createElement('div');
      div.className = 'category-tab'+(cat==='all'?' active':'');
      div.dataset.category = cat;
      const labelMap = {
        'all':'All Courses',
        'mathematics':'Mathematics',
        'geometry':'Geometry',
        'probability':'Probability & Statistics',
        'computer-science':'Computer Science',
        'physics':'Physics'
      };
      div.textContent = labelMap[cat] || cat.replace(/-/g,' ').replace(/\b\w/g,m=>m.toUpperCase());
      tabsWrap.appendChild(div);
    });
    // rewire after rebuild
    document.querySelectorAll('.category-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const cat = tab.getAttribute('data-category') || 'all';
        document.querySelectorAll('.category-tab').forEach(t=>t.classList.remove('active'));
        tab.classList.add('active');
        if (categorySelect) categorySelect.value = cat;
        applyFilters();
      });
    });
  }

  wire();

  fetch('/khaboom/courses.json')
    .then(r => r.ok ? r.json() : Promise.reject(new Error('no courses')))
  .then(courses => { allCourses = hydrate(courses); buildCategoryTabs(allCourses); applyFilters(); })
  .catch(() => { allCourses = hydrate(fallback); buildCategoryTabs(allCourses); applyFilters(); });
});


