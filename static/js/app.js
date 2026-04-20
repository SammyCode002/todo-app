document.addEventListener('DOMContentLoaded', () => {

    // ── Toast auto-dismiss ────────────────────────────────────────────────
    document.querySelectorAll('[data-toast]').forEach(el => {
        setTimeout(() => {
            el.style.animation = 'slideOut 0.25s ease forwards';
            setTimeout(() => el.remove(), 250);
        }, 3500);
    });

    // ── Help panel toggle ────────────────────────────────────────────────
    window.toggleHelp = () => {
        const panel  = document.getElementById('helpPanel');
        const bubble = document.getElementById('beaver-bubble');
        const opening = !panel.classList.contains('show');
        panel.classList.toggle('show');
        if (opening && bubble) {
            bubble.classList.add('show');
            if (window.beaverHelp) window.beaverHelp();
            setTimeout(() => bubble.classList.remove('show'), 2800);
        }
    };

    // ── Filter tabs ──────────────────────────────────────────────────────
    const filterBtns = document.querySelectorAll('[data-filter]');
    let currentFilter = 'all';
    let currentSearch = '';

    function applyFilters() {
        const cards = document.querySelectorAll('.task-card');
        let visible = 0;
        cards.forEach(card => {
            const done = card.dataset.done === 'true';
            const text = card.dataset.text || '';
            const matchFilter =
                currentFilter === 'all' ||
                (currentFilter === 'done'    &&  done) ||
                (currentFilter === 'pending' && !done);
            const matchSearch = currentSearch === '' || text.includes(currentSearch);
            const show = matchFilter && matchSearch;
            card.style.display = show ? '' : 'none';
            if (show) visible++;
        });
        const empty = document.getElementById('filtered-empty');
        if (empty) empty.style.display = visible === 0 && cards.length > 0 ? 'flex' : 'none';
    }

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            applyFilters();
        });
    });

    // ── Task search ──────────────────────────────────────────────────────
    const searchInput = document.getElementById('task-search');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            currentSearch = searchInput.value.toLowerCase().trim();
            applyFilters();
        });
    }

    // ── Character counter ────────────────────────────────────────────────
    const taskInput = document.getElementById('task-input');
    const charCount = document.getElementById('char-count');
    if (taskInput && charCount) {
        taskInput.addEventListener('input', () => {
            const len = taskInput.value.length;
            charCount.textContent = len > 0 ? `${len}/100` : '';
            charCount.style.color =
                len > 90 ? '#a05050' :
                len > 70 ? '#a07830' :
                'var(--txt-3)';
        });
    }

    // ── Priority selector color hint ─────────────────────────────────────
    const prioritySelect = document.querySelector('select[name="priority"]');
    if (prioritySelect) {
        const colors = { high: '#a05050', medium: '#8b6040', low: '#6b8060' };
        const update = () => {
            prioritySelect.style.color = colors[prioritySelect.value] || 'var(--txt)';
        };
        prioritySelect.addEventListener('change', update);
        update();
    }

    // ── Two-click delete ─────────────────────────────────────────────────
    document.querySelectorAll('.delete-btn').forEach(btn => {
        let timer;
        btn.addEventListener('click', () => {
            if (btn.classList.contains('confirming')) {
                clearTimeout(timer);
                window.location.href = btn.dataset.href;
            } else {
                btn.classList.add('confirming');
                btn.textContent = 'Confirm?';
                timer = setTimeout(() => {
                    btn.classList.remove('confirming');
                    btn.textContent = 'Delete';
                }, 2500);
            }
        });
    });

    // ── Delete all (two-click confirm) ───────────────────────────────────
    const deleteAllBtn = document.getElementById('delete-all-btn');
    if (deleteAllBtn) {
        let timer;
        deleteAllBtn.addEventListener('click', () => {
            if (deleteAllBtn.classList.contains('confirming')) {
                clearTimeout(timer);
                localStorage.setItem('bb_plant', '0');
                document.getElementById('delete-all-form').submit();
            } else {
                deleteAllBtn.classList.add('confirming');
                deleteAllBtn.textContent = 'Confirm?';
                timer = setTimeout(() => {
                    deleteAllBtn.classList.remove('confirming');
                    deleteAllBtn.textContent = 'Delete All';
                }, 2500);
            }
        });
    }

    // ── Default due date to today ────────────────────────────────────────
    const dateInput = document.querySelector('input[name="due_date"]');
    if (dateInput && !dateInput.value) {
        const today = new Date().toISOString().slice(0, 10);
        dateInput.min = today;
    }

});
