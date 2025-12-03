// ============================================================================
// КОПИРОВАНИЕ ПРИ НАЖАТИИ НА ТЕСТОВЫЕ ДАННЫЕ ПРИ ВХОДЕ
// ============================================================================

if (window.location.pathname === '/login.html') {
    const parent = document.querySelector('.for-test');
    if (parent) {
        parent.addEventListener('click', (e) => {
            const clickedElement = e.target;
            const testItem = clickedElement.closest('.test-item');
            if (testItem) {
                const textToCopy = testItem.querySelector('span').innerText;
                navigator.clipboard.writeText(textToCopy)
                    .then(() => {
                        console.log('Текст скопирован: ', textToCopy);
                    })
                    .catch(err => {
                        console.error('Ошибка при копировании: ', err);
                    });
            }
        });
    }
}

// ============================================================================
// ПОДСВЕТКА АКТИВНОЙ СТРАНИЦЫ В НАВИГАЦИИ
// ============================================================================

const checkLocate = () => {
    const currentLocationURL = new URL(location.href);
    const currentPathname = currentLocationURL.pathname;

    const links = document.querySelectorAll("ul li a");
    links.forEach(link => {
        const href = link.getAttribute("href");

        const linkURL = new URL(href, currentLocationURL);
        const linkPathname = linkURL.pathname;

        if (linkPathname === currentPathname) {
            link.classList.add("active");
        }
    });
};

// ============================================================================
// СЛАЙДЕР НА ГЛАВНОЙ СТРАНИЦЕ
// ============================================================================

const sliderList = document.querySelector('.slider-list');
if (sliderList) {
    const sliderList = document.querySelector('.slider-list');
    const sliderItems = document.querySelectorAll('.slider-item');
    const prevBtn = document.querySelector('.pagination-action.prev');
    const nextBtn = document.querySelector('.pagination-action.next');
    const paginationFrom = document.querySelector('.pagination-nums .from');
    const paginationTo = document.querySelector('.pagination-nums .to');
    
    let currentIndex = 0;
    const totalSlides = sliderItems.length;
    
    paginationTo.textContent = totalSlides.toString().padStart(2, '0');
    
    function updateCounter() {
        paginationFrom.textContent = (currentIndex + 1).toString().padStart(2, '0');
    }
    
    function updateSlider() {

        const slideWidth = sliderItems[0].offsetWidth;
        const gap = parseInt(window.getComputedStyle(sliderList).getPropertyValue('gap'));
        const totalOffset = currentIndex * (slideWidth + gap);
        
        sliderList.style.transform = `translateX(-${totalOffset}px)`;
        updateCounter();
    }
    
    prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
        } else {

            currentIndex = totalSlides - 1;
        }
        updateSlider();
    });
    
    nextBtn.addEventListener('click', () => {
        if (currentIndex < totalSlides - 1) {
            currentIndex++;
        } else {

            currentIndex = 0;
        }
        updateSlider();
    });
    
    window.addEventListener('resize', updateSlider);

    updateSlider();
}

// ============================================================================
// МАСКА ДЛЯ ТЕЛЕФОНА
// ============================================================================

function applyPhoneMask(input) {
    input.addEventListener('input', () => {
        let value = input.value.replace(/\D/g, '');

        if (value.startsWith('8')) {
            value = '7' + value.slice(1);  
        }

        let formatted = '+7 ';

        if (value.length > 1) formatted += '(' + value.substring(1, 4);
        if (value.length >= 4) formatted += ') ';
        if (value.length >= 4) formatted += value.substring(4, 7);
        if (value.length >= 7) formatted += '-' + value.substring(7, 9);
        if (value.length >= 9) formatted += '-' + value.substring(9, 11);

        input.value = formatted.trim();
    });
}

// ============================================================================
// ИНИЦИАЛИЗАЦИЯ И ЗАГРУЗКА ДАННЫХ
// ============================================================================

// Загрузка данных из JSON в localStorage при первой загрузке
async function initializeApp() {
    if (!localStorage.getItem('app_initialized')) {
        try {
            const response = await fetch('./data/data.json');
            const data = await response.json();
            localStorage.setItem('data', JSON.stringify(data));
            localStorage.setItem('app_initialized', 'true');
        } catch (error) {
            console.error('Ошибка при загрузке data.json:', error);
        }
    }
    protectPage();
    updateNavigation();
    showPendingNotification();
    // loadPageContent();
}

// ============================================================================
// УВЕДОМЛЕНИЯ И МОДАЛЬНЫЕ ОКНА
// ============================================================================

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    const icon = type === 'success' ? '✓' : '✕';
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `<span class="notification-icon">${icon}</span><span class="notification-text">${message}</span>`;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    const closeNotification = () => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    };

    notification.addEventListener('click', closeNotification);
    setTimeout(closeNotification, 4000);
}

// Сохранение уведомления для показа после редиректа
function saveNotification(message, type = 'success') {
    localStorage.setItem('pendingNotification', JSON.stringify({ message, type, timestamp: Date.now() }));
}

// Показ сохраненного уведомления
function showPendingNotification() {
    const pending = localStorage.getItem('pendingNotification');
    if (pending) {
        try {
            const { message, type, timestamp } = JSON.parse(pending);
            // Показываем уведомление если оно не старше 2 секунд (обычно редирект быстрый)
            if (Date.now() - timestamp < 2000) {
                showNotification(message, type);
            }
            localStorage.removeItem('pendingNotification');
        } catch (e) {
            console.error('Error showing pending notification:', e);
            localStorage.removeItem('pendingNotification');
        }
    }
}

// Модальное окно подтверждения удаления
function showConfirmModal(message, onConfirm, onCancel = null) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Подтверждение</h2>
            <p>${message}</p>
            <div class="modal-buttons">
                <button class="btn btn-outline" onclick="this.closest('.modal-overlay').remove()">Отмена</button>
                <button class="btn btn-accent" data-confirm>Удалить</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const confirmBtn = modal.querySelector('[data-confirm]');
    confirmBtn.addEventListener('click', () => {
        modal.remove();
        onConfirm();
    });
    
    const cancelBtn = modal.querySelector('.btn-outline');
    cancelBtn.addEventListener('click', () => {
        if (onCancel) onCancel();
    });
}

// ============================================================================
// АВТОРИЗАЦИЯ
// ============================================================================

function getAuthData() {
    return JSON.parse(localStorage.getItem('currentUser') || 'null');
}

function setAuthData(user) {
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
        localStorage.removeItem('currentUser');
    }
}

function isUserLoggedIn() {
    return getAuthData() !== null;
}

function logoutUser() {
    setAuthData(null);
}

function handleLoginSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const login = form.querySelector('#login').value.trim();
    const password = form.querySelector('#password').value.trim();
    const passwordInput = form.querySelector('#password');
    
    clearLoginErrors();

    // Валидация
    let hasError = false;
    if (login.length < 6) {
        showLoginError('#login', 'Минимум 6 символов');
        hasError = true;
    }
    if (password.length < 6) {
        showLoginError('#password', 'Минимум 6 символов');
        passwordInput.value = '';
        hasError = true;
    }

    if (hasError) return;

    const data = JSON.parse(localStorage.getItem('data'));
    const user = data.users.find(u => u.login === login && u.password === password);

    if (user) {
        setAuthData(user);
        saveNotification('Успешная авторизация!', 'success');
        setTimeout(() => {
            window.location.href = './cabinet.html';
        }, 300);
    } else {
        showLoginError('#login', 'Неверный логин или пароль');
        passwordInput.value = '';
    }
}

function showLoginError(selector, message) {
    const input = document.querySelector(selector);
    if (input) {
        input.classList.add('error');
        const label = input.parentElement.querySelector('label');
        if (label) {
            label.classList.add('error');
        }
        const errorText = input.parentElement.querySelector('.invalid-text');
        if (errorText) {
            errorText.textContent = message;
            errorText.style.display = 'block';
        }
    }
}

function clearLoginErrors() {
    document.querySelectorAll('.login-box input').forEach(input => {
        input.classList.remove('error');
        const label = input.parentElement.querySelector('label');
        if (label) {
            label.classList.remove('error');
        }
        const errorText = input.parentElement.querySelector('.invalid-text');
        if (errorText) {
            errorText.style.display = 'none';
            errorText.textContent = '';
        }
    });
}

// ============================================================================
// ОБНОВЛЕНИЕ НАВИГАЦИИ
// ============================================================================

function updateNavigation() {
    const navAction = document.querySelector('.nav-action');
    if (!navAction) return;

    const authData = getAuthData();
    
    // Определяем, находимся ли мы в папке /trainer/ или /admin/
    const isInSubfolder = window.location.pathname.includes('/trainer/') || window.location.pathname.includes('/admin/');
    const basePrefix = isInSubfolder ? '../' : './';

    if (authData) {
        navAction.innerHTML = `
            <div class="nav-buttons" style="display: flex; gap: 10px; align-items: center;">
                ${authData.role === 'admin' ? `<a href="${basePrefix}admin/index.html" class="btn btn-outline">Админ панель</a>` : ''}
                ${authData.role === 'trainer' ? `<a href="${basePrefix}trainer/index.html" class="btn btn-outline">Тренер панель</a>` : ''}
                <a href="${basePrefix}cabinet.html" class="btn btn-accent">Личный кабинет</a>
            </div>
        `;
    } else {
        navAction.innerHTML = `<a href="${basePrefix}login.html" class="btn btn-accent">Войти</a>`;
    }
}

// ============================================================================
// ЗАЩИТА СТРАНИЦ
// ============================================================================

function protectPage(requiredRole = null) {
    const authData = getAuthData();

    // Страница входа
    if (window.location.pathname.includes('login.html')) {
        if (authData) {
            window.location.href = './cabinet.html';
        }
        return;
    }

    // Кабинет пользователя
    if (window.location.pathname.includes('cabinet.html')) {
        if (!authData) {
            window.location.href = './login.html';
        }
        return;
    }

    // Админ панель
    if (window.location.pathname.includes('admin')) {
        if (!authData || authData.role !== 'admin') {
            window.location.href = './';
        }
        return;
    }

    // Тренер панель
    if (window.location.pathname.includes('trainer')) {
        if (window.location.pathname === './trainers.html') {
            return;
        }
            
        if (!authData || authData.role !== 'trainer') {
            window.location.href = './';
        }
        return;
    }
}

// ============================================================================
// ЛИЧНЫЙ КАБИНЕТ
// ============================================================================

function initCabinet() {
    const authData = getAuthData();
    if (!authData) return;

    const tabs = document.querySelectorAll('[data-tab]');
    const contents = document.querySelectorAll('[data-tab-content]');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Проверка на кнопку выхода
            if (tab.dataset.tab === 'logout') {
                showLogoutConfirm();
                return;
            }
            
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.style.display = 'none');
            
            tab.classList.add('active');
            const content = document.querySelector(`[data-tab-content="${tab.dataset.tab}"]`);
            if (content) content.style.display = 'block';
        });
    });

    // Активировать первую вкладку (Записи)
    if (tabs.length > 0 && tabs[0].dataset.tab !== 'logout') {
        tabs[0].click();
    }

    loadCabinetData();
}

function loadCabinetData() {
    const authData = getAuthData();
    if (!authData) return;

    const data = JSON.parse(localStorage.getItem('data'));

    // Загрузка записей
    loadEnrollments(authData, data);

    // Загрузка абонементов
    loadAbonements(authData, data);

    // Загрузка личных данных
    loadPersonalData(authData);
}

function loadEnrollments(authData, data) {
    const container = document.querySelector('[data-enrollments]');
    if (!container) return;

    if (authData.role !== 'client') {
        container.innerHTML = '<p style="padding: 20px; text-align: center; color: #ff6b6b;">Роль не подходит, смените пользователя на клиента</p>';
        return;
    }

    const enrollments = data.enrollments.filter(e => e.user_id === authData.id);
    const schedule = data.schedule;
    const now = new Date();

    const active = [];
    const completed = [];

    enrollments.forEach(enrollment => {
        const session = schedule.find(s => s.id === enrollment.schedule_id);
        if (session) {
            const sessionDate = new Date(session.date);
            if (sessionDate > now) {
                active.push({ ...enrollment, session });
            } else {
                completed.push({ ...enrollment, session });
            }
        }
    });

    let html = '<div class="enrollments-section">';

    if (active.length > 0) {
        html += '<h3>Активные записи</h3>';
        active.forEach(item => {
            const date = new Date(item.session.date).toLocaleString('ru-RU');
            html += `
                <div class="enrollment-card">
                    <div class="enrollment-info">
                        <h4>${item.session.service}</h4>
                        <p>Тренер: ${item.session.instructor}</p>
                        <p>Дата: ${date}</p>
                    </div>
                    <button class="btn btn-outline" onclick="cancelEnrollment(${item.id})">Отменить</button>
                </div>
            `;
        });
    } else {
        html += '<p>Активных записей нет</p>';
    }

    if (completed.length > 0) {
        html += '<h3 style="margin-top: 30px;">Завершённые записи</h3>';
        completed.forEach(item => {
            const date = new Date(item.session.date).toLocaleString('ru-RU');
            html += `
                <div class="enrollment-card completed">
                    <div class="enrollment-info">
                        <h4>${item.session.service}</h4>
                        <p>Тренер: ${item.session.instructor}</p>
                        <p>Дата: ${date}</p>
                    </div>
                </div>
            `;
        });
    }

    html += '</div>';
    container.innerHTML = html;
}

function loadAbonements(authData, data) {
    const container = document.querySelector('[data-abonements]');
    if (!container) return;

    if (authData.role !== 'client') {
        container.innerHTML = '<p style="padding: 20px; text-align: center; color: #ff6b6b;">Роль не подходит, смените пользователя на клиента</p>';
        return;
    }

    const userAbonements = data.abonements.filter(a => a.user_id === authData.id);

    let html = '<div class="abonements-section">';

    if (userAbonements.length > 0) {
        userAbonements.forEach(abo => {
            const expiresDate = abo.expires_at ? new Date(abo.expires_at).toLocaleDateString('ru-RU') : 'Не активирован';
            html += `
                <div class="abonement-card">
                    <h4>${abo.name}</h4>
                    <p>Посещений осталось: ${abo.visits_left}</p>
                    <p>Действует до: ${expiresDate}</p>
                    <button class="btn btn-outline" onclick="deleteAbonement(${abo.id})">Удалить абонемент</button>
                </div>
            `;
        });
    } else {
        html += '<p>Абонементов не найдено</p>';
    }

    html += '</div>';
    container.innerHTML = html;
}

function loadPersonalData(authData) {
    const container = document.querySelector('[data-personal-data]');
    if (!container) return;

    const html = `
        <div class="personal-data-section">
            <div class="personal-data-item">
                <label>ФИО:</label>
                <p>${authData.full_name}</p>
            </div>
            <div class="personal-data-item">
                <label>Логин:</label>
                <p>${authData.login}</p>
            </div>
            <div class="personal-data-item">
                <label>Email:</label>
                <p>${authData.email}</p>
            </div>
            <div class="personal-data-item">
                <label>Телефон:</label>
                <p>${authData.phone}</p>
            </div>
            <div class="personal-data-item">
                <label>Роль:</label>
                <p>${authData.role === 'client' ? 'Клиент' : authData.role === 'trainer' ? 'Тренер' : 'Администратор'}</p>
            </div>
        </div>
    `;

    container.innerHTML = html;
}

function cancelEnrollment(enrollmentId) {
    showConfirmModal('Вы уверены, что хотите отменить запись?', () => {
        const data = JSON.parse(localStorage.getItem('data'));
        const enrollment = data.enrollments.find(e => e.id === enrollmentId);
        
        if (enrollment) {
            data.enrollments = data.enrollments.filter(e => e.id !== enrollmentId);
            
            // Вернуть посещение абонемента
            const abonement = data.abonements.find(a => a.user_id === enrollment.user_id);
            if (abonement) {
                abonement.visits_left++;
            }

            localStorage.setItem('data', JSON.stringify(data));
            showNotification('Запись отменена', 'success');
            loadCabinetData();
        }
    });
}

function deleteAbonement(abonementId) {
    showConfirmModal('Удаление абонемента отменит все активные записи. Продолжить?', () => {
        const data = JSON.parse(localStorage.getItem('data'));
        const abonement = data.abonements.find(a => a.id === abonementId);
        const authData = getAuthData();

        if (abonement && abonement.user_id === authData.id) {
            // Удалить все записи этого пользователя
            data.enrollments = data.enrollments.filter(e => e.user_id !== authData.id);
            
            // Удалить абонемент
            const index = data.abonements.findIndex(a => a.id === abonementId);
            if (index > -1) {
                data.abonements.splice(index, 1);
            }

            localStorage.setItem('data', JSON.stringify(data));
            showNotification('Абонемент удален', 'success');
            loadCabinetData();
        }
    });
}

function showLogoutConfirm() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Подтверждение выхода</h2>
            <p>Вы уверены, что хотите выйти из аккаунта?</p>
            <div class="modal-buttons">
                <button class="btn btn-outline" onclick="this.closest('.modal-overlay').remove()">Отмена</button>
                <button class="btn btn-accent" onclick="confirmLogout()">Выход</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function confirmLogout() {
    logoutUser();
    saveNotification('Вы успешно вышли из аккаунта', 'success');
    setTimeout(() => {
        window.location.href = './';
    }, 300);
}

// ============================================================================
// РЕЗЕРВИРОВАНИЕ АБОНЕМЕНТА
// ============================================================================

function initAbonementBooking() {
    const bookingContainer = document.querySelector('[data-booking-container]');
    if (!bookingContainer) return;

    const authData = getAuthData();
    const data = JSON.parse(localStorage.getItem('data'));

    // ❗ Отображаем только свободные абонементы
    const availableAbonements = data.abonements.filter(a => a.user_id === null);

    if (availableAbonements.length === 0) {
        bookingContainer.innerHTML = '<p style="text-align:center; padding:20px;">Свободных абонементов нет</p>';
        return;
    }

    // ❗ Проверяем: есть ли у клиента уже абонемент
    const userHasAbonement = authData
        ? data.abonements.some(a => a.user_id === authData.id)
        : false;

    let html = '<div class="abonements-grid">';

    availableAbonements.forEach(abo => {
        const isLogged = !!authData;
        const isClient = authData?.role === 'client';

        let buttonHtml = '';

        // ——— ЛОГИКА КНОПКИ ———

        if (!isLogged) {
            buttonHtml = `
                <a href="./login.html" class="btn btn-outline">
                    Авторизуйтесь
                </a>
            `;
        }
        else if (!isClient) {
            buttonHtml = `
                <button class="btn btn-outline disabled" disabled>
                    Недостаточно прав
                </button>
            `;
        }
        else if (userHasAbonement) {
            buttonHtml = `
                <button class="btn btn-outline disabled" disabled>
                    У вас уже есть абонемент
                </button>
            `;
        }
        else {
            buttonHtml = `
                <button class="btn btn-accent" onclick="bookAbonement(${abo.id})">
                    Забронировать
                </button>
            `;
        }

        // ——— КАРТОЧКА ———
        html += `
            <div class="abonement-item">
                <h3>${abo.name}</h3>
                <p>${abo.description}</p>
                <p class="price">${abo.price} ₽</p>
                <p>Посещений: ${abo.visits_left}</p>
                ${buttonHtml}
            </div>
        `;
    });

    html += '</div>';
    bookingContainer.innerHTML = html;
}


function bookAbonement(abonementId) {
    const authData = getAuthData();
    const data = JSON.parse(localStorage.getItem('data'));

    const template = data.abonements.find(a => a.id === abonementId && a.user_id === null);
    if (!template) {
        showNotification('Абонемент недоступен', 'error');
        return;
    }

    // Проверяем, нет ли у пользователя уже абонемента
    const userHasAbonement = data.abonements.some(a => a.user_id === authData.id);
    if (userHasAbonement) {
        showNotification('У вас уже есть абонемент', 'error');
        return;
    }

    // Создаём новый персональный абонемент на основе шаблона
    const newAboId = Math.max(...data.abonements.map(a => a.id), 0) + 1;

    const newAbonement = {
        id: newAboId,
        user_id: authData.id,
        name: template.name,
        visits_left: template.visits_left,
        expires_at: null, // активируется администратором
        price: template.price,
        description: template.description
    };

    // Добавляем отдельный персональный абонемент в список
    data.abonements.push(newAbonement);

    // Сохраняем
    localStorage.setItem('data', JSON.stringify(data));

    showNotification('Абонемент забронирован. Ожидайте активации администратором.', 'success');

    initAbonementBooking();
}


// ============================================================================
// ЗАПИСЬ НА ЗАНЯТИЯ
// ============================================================================

function initScheduleBooking() {
    const scheduleContainer = document.querySelector('#schedule-list');
    if (!scheduleContainer) return;

    const data = JSON.parse(localStorage.getItem('data'));
    renderSchedule(data.schedule);
}

function renderSchedule(schedule) {
    const scheduleContainer = document.querySelector('#schedule-list');
    if (!scheduleContainer) return;

    const authData = getAuthData();
    const data = JSON.parse(localStorage.getItem('data'));

    if (schedule.length === 0) {
        scheduleContainer.innerHTML = '<div class="empty">Расписание отсутствует</div>';
        return;
    }

    let html = '';

    schedule.forEach(session => {
        const date = new Date(session.date);

        const isLogged = !!authData;
        const isClient = authData?.role === 'client';

        const userAbonement = isLogged
            ? data.abonements.find(a => a.user_id === authData.id && a.visits_left > 0)
            : null;

        const isEnrolled =
            isLogged &&
            data.enrollments.some(e => e.user_id === authData.id && e.schedule_id === session.id);

        // --- определяем кнопку ---
        let buttonHtml = '';

        if (!isLogged) {
            buttonHtml = `
                <a href="./login.html" class="btn btn-outline">
                    Авторизуйтесь
                </a>
            `;
        } 
        else if (!isClient) {
            buttonHtml = `
                <button class="btn btn-outline disabled" disabled>
                    Недостаточно прав
                </button>
            `;
        }
        else if (!userAbonement) {
            buttonHtml = `
                <a href="./abonements.html" class="btn btn-outline">
                    Нужен абонемент
                </a>
            `;
        }
        else if (isEnrolled) {
            buttonHtml = `
                <button class="btn btn-outline disabled" disabled>
                    Уже записаны
                </button>
            `;
        } 
        else {
            buttonHtml = `
                <button class="btn btn-accent" onclick="enrollToSession(${session.id})">
                    Записаться
                </button>
            `;
        }

        // --- карточка ---
        html += `
            <div class="schedule-card">
                <div class="schedule-info">
                    <h3>${session.service}</h3>
                    <p>Тренер: ${session.instructor}</p>
                    <p>Дата: ${date.toLocaleString('ru-RU')}</p>
                    <p>Мест: ${session.max_participants}</p>
                </div>
                ${buttonHtml}
            </div>
        `;
    });

    scheduleContainer.innerHTML = html;
}

function enrollToSession(scheduleId) {
    const authData = getAuthData();
    const data = JSON.parse(localStorage.getItem('data'));

    // Проверка абонемента
    const userAbonement = data.abonements.find(a => a.user_id === authData.id && a.visits_left > 0);
    if (!userAbonement) {
        showNotification('Нет активного абонемента', 'error');
        return;
    }

    // Проверка, нет ли уже записи
    const alreadyEnrolled = data.enrollments.some(e => e.user_id === authData.id && e.schedule_id === scheduleId);
    if (alreadyEnrolled) {
        showNotification('Вы уже записаны на это занятие', 'error');
        return;
    }

    // Добавить запись
    const newEnrollment = {
        id: Math.max(...data.enrollments.map(e => e.id), 0) + 1,
        user_id: authData.id,
        schedule_id: scheduleId,
        status: 'registered'
    };

    data.enrollments.push(newEnrollment);
    userAbonement.visits_left--;

    localStorage.setItem('data', JSON.stringify(data));
    showNotification('Вы успешно записались на занятие', 'success');
    
    // Обновить расписание
    const filterForm = document.querySelector('#schedule-filters');
    if (filterForm) {
        filterForm.dispatchEvent(new Event('submit'));
    } else {
        initScheduleBooking();
    }
}

// ============================================================================
// АДМИН ПАНЕЛЬ
// ============================================================================

function initAdminPanel() {
    const authData = getAuthData();
    if (!authData || authData.role !== 'admin') return;

    setupAdminTabs();
    loadAdminUsers();
}

function setupAdminTabs() {
    const tabs = document.querySelectorAll('[data-admin-tab]');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const tabName = tab.dataset.adminTab;
            document.querySelectorAll('[data-admin-content]').forEach(c => c.style.display = 'none');
            document.querySelector(`[data-admin-content="${tabName}"]`).style.display = 'block';

            if (tabName === 'users') loadAdminUsers();
            else if (tabName === 'abonements') loadAdminAbonements();
            else if (tabName === 'schedule') loadAdminSchedule();
        });
    });

    if (tabs.length > 0) tabs[0].click();
}

function loadAdminUsers() {
    const container = document.querySelector('[data-admin-content="users"]');
    if (!container) return;

    const data = JSON.parse(localStorage.getItem('data'));
    
    let html = '<div class="admin-section"><button class="btn btn-accent" onclick="showAddUserModal()">Добавить пользователя</button><table class="admin-table"><thead><tr><th>ФИО</th><th>Логин</th><th>Email</th><th>Роль</th><th>Действия</th></tr></thead><tbody>';
    
    data.users.forEach(user => {
        html += `
            <tr>
                <td>${user.full_name}</td>
                <td>${user.login}</td>
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td>
                    <button class="btn btn-small" onclick="showEditUserModal(${user.id})">Редактировать</button>
                    <button class="btn btn-small btn-danger" onclick="deleteUser(${user.id})">Удалить</button>
                </td>
            </tr>
        `;
    });

    html += '</tbody></table></div>';
    container.innerHTML = html;
}

function loadAdminAbonements() {
    const container = document.querySelector('[data-admin-content="abonements"]');
    if (!container) return;

    const data = JSON.parse(localStorage.getItem('data'));
    
    let html = '<div class="admin-section"><h3>Заявки на активацию абонементов</h3>';
    
    const pendingAbonements = data.abonements.filter(a => a.user_id && !a.expires_at);
    
    if (pendingAbonements.length === 0) {
        html += '<p>Нет заявок на активацию</p>';
    } else {
        pendingAbonements.forEach(abo => {
            const user = data.users.find(u => u.id === abo.user_id);
            html += `
                <div class="abonement-request">
                    <p><strong>Пользователь:</strong> ${user?.full_name}</p>
                    <p><strong>Абонемент:</strong> ${abo.name}</p>
                    <p><strong>Цена:</strong> ${abo.price} ₽</p>
                    <button class="btn btn-accent" onclick="approveAbonement(${abo.id})">Одобрить</button>
                    <button class="btn btn-outline" onclick="rejectAbonement(${abo.id})">Отклонить</button>
                </div>
            `;
        });
    }

    html += '</div>';
    container.innerHTML = html;
}

function loadAdminSchedule() {
    const container = document.querySelector('[data-admin-content="schedule"]');
    if (!container) return;

    const data = JSON.parse(localStorage.getItem('data'));
    
    let html = '<div class="admin-section"><button class="btn btn-accent" onclick="showAddScheduleModal()">Добавить занятие</button><table class="admin-table"><thead><tr><th>Услуга</th><th>Дата</th><th>Тренер</th><th>Макс. участников</th><th>Действия</th></tr></thead><tbody>';
    
    data.schedule.forEach(session => {
        const date = new Date(session.date).toLocaleString('ru-RU');
        html += `
            <tr>
                <td>${session.service}</td>
                <td>${date}</td>
                <td>${session.instructor}</td>
                <td>${session.max_participants}</td>
                <td>
                    <button class="btn btn-small" onclick="editScheduleSession(${session.id})">Редактировать</button>
                    <button class="btn btn-small btn-danger" onclick="deleteScheduleSession(${session.id})">Удалить</button>
                </td>
            </tr>
        `;
    });

    html += '</tbody></table></div>';
    container.innerHTML = html;
}

function approveAbonement(abonementId) {
    const data = JSON.parse(localStorage.getItem('data'));
    const abonement = data.abonements.find(a => a.id === abonementId);

    if (abonement) {
        abonement.expires_at = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
        localStorage.setItem('data', JSON.stringify(data));
        showNotification('Абонемент активирован', 'success');
        loadAdminAbonements();
    }
}

function rejectAbonement(abonementId) {
    const data = JSON.parse(localStorage.getItem('data'));
    const abonement = data.abonements.find(a => a.id === abonementId);

    if (abonement) {
        abonement.user_id = null;
        localStorage.setItem('data', JSON.stringify(data));
        showNotification('Заявка отклонена', 'success');
        loadAdminAbonements();
    }
}

function deleteUser(userId) {
    const authData = getAuthData();
    const data = JSON.parse(localStorage.getItem('data'));

    const userToDelete = data.users.find(u => u.id === userId);
    if (!userToDelete) return;

    // === Защита от удаления последнего админа ===
    if (userToDelete.role === 'admin') {
        const adminCount = data.users.filter(u => u.role === 'admin').length;

        if (adminCount <= 1) {
            showNotification('Нельзя удалить последнего администратора!', 'error');
            return;
        }
    }

    showConfirmModal(`Удалить пользователя "${userToDelete.full_name}" вместе со всеми связанными данными?`, () => {

        // === Удаление пользователя ===
        data.users = data.users.filter(u => u.id !== userId);

        // === Удаляем его записи ===
        data.enrollments = data.enrollments.filter(e => e.user_id !== userId);

        // === Удаляем его абонементы ===
        data.abonements = data.abonements.filter(a => a.user_id !== userId);

        // === Если удаляем тренера ===
        if (userToDelete.role === 'trainer') {
            // Находим все занятия тренера
            const trainerSessions = data.schedule.filter(s => s.trainer_id === userId).map(s => s.id);

            // Удаляем занятия тренера
            data.schedule = data.schedule.filter(s => s.trainer_id !== userId);

            // Удаляем записи пользователей на эти занятия
            data.enrollments = data.enrollments.filter(e => !trainerSessions.includes(e.schedule_id));
        }

        localStorage.setItem('data', JSON.stringify(data));

        // === Если удаляем себя ===
        if (authData.id === userId) {
            logoutUser();
            saveNotification('Ваш аккаунт был удалён', 'success');
            setTimeout(() => window.location.href = './', 300);
            return;
        }

        showNotification('Пользователь удалён', 'success');
        loadAdminUsers();
    });
}


function deleteScheduleSession(sessionId) {
    showConfirmModal('Вы уверены, что хотите удалить это занятие?', () => {
        const data = JSON.parse(localStorage.getItem('data'));
        data.schedule = data.schedule.filter(s => s.id !== sessionId);
        data.enrollments = data.enrollments.filter(e => e.schedule_id !== sessionId);
        localStorage.setItem('data', JSON.stringify(data));
        showNotification('Занятие удалено', 'success');
        loadAdminSchedule();
    });
}

function showAddUserModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Добавить пользователя</h2>
            <form onsubmit="addUser(event)">
                <input type="text" placeholder="ФИО" required class="form-input">
                <input type="text" placeholder="Логин (мин. 6 символов)" required minlength="6" class="form-input">
                <input type="password" placeholder="Пароль (мин. 6 символов)" required minlength="6" class="form-input">
                <input type="email" placeholder="Email" required class="form-input">
                <input type="tel" placeholder="Телефон" required class="form-input">
                <select required class="form-input">
                    <option value="">Выберите роль</option>
                    <option value="client">Клиент</option>
                    <option value="trainer">Тренер</option>
                    <option value="admin">Администратор</option>
                </select>
                <div class="modal-buttons">
                    <button type="button" class="btn btn-outline" onclick="this.closest('.modal-overlay').remove()">Отмена</button>
                    <button type="submit" class="btn btn-accent">Добавить</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    const phoneInput = modal.querySelector('input[type="tel"]');
    applyPhoneMask(phoneInput);
}

function addUser(event) {
    event.preventDefault();
    const form = event.target;
    const inputs = form.querySelectorAll('input, select');
    const data = JSON.parse(localStorage.getItem('data'));

    const newId = Math.max(...data.users.map(u => u.id), 0) + 1;
    const newUser = {
        id: newId,
        full_name: inputs[0].value,
        login: inputs[1].value,
        password: inputs[2].value,
        email: inputs[3].value,
        phone: inputs[4].value,
        role: inputs[5].value
    };

    data.users.push(newUser);
    localStorage.setItem('data', JSON.stringify(data));
    showNotification('Пользователь добавлен', 'success');
    document.querySelector('.modal-overlay').remove();
    loadAdminUsers();
}

function showEditUserModal(userId) {
    const data = JSON.parse(localStorage.getItem('data'));
    const user = data.users.find(u => u.id === userId);
    
    if (!user) return;

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Редактировать пользователя</h2>
            <form onsubmit="updateUser(event, ${userId})">
                <input type="text" placeholder="ФИО" required class="form-input" value="${user.full_name}">
                <input type="text" placeholder="Логин (мин. 6 символов)" required minlength="6" class="form-input" value="${user.login}">
                <input type="password" placeholder="Пароль (мин. 6 символов)" required minlength="6" class="form-input" value="${user.password}">
                <input type="email" placeholder="Email" required class="form-input" value="${user.email}">
                <input type="tel" placeholder="Телефон" required class="form-input" value="${user.phone}">
                <select required class="form-input">
                    <option value="client" ${user.role === 'client' ? 'selected' : ''}>Клиент</option>
                    <option value="trainer" ${user.role === 'trainer' ? 'selected' : ''}>Тренер</option>
                    <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Администратор</option>
                </select>
                <div class="modal-buttons">
                    <button type="button" class="btn btn-outline" onclick="this.closest('.modal-overlay').remove()">Отмена</button>
                    <button type="submit" class="btn btn-accent">Сохранить</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
}

function updateUser(event, userId) {
    event.preventDefault();
    const form = event.target;
    const inputs = form.querySelectorAll('input, select');
    const data = JSON.parse(localStorage.getItem('data'));
    
    const user = data.users.find(u => u.id === userId);
    if (user) {
        user.full_name = inputs[0].value;
        user.login = inputs[1].value;
        user.password = inputs[2].value;
        user.email = inputs[3].value;
        user.phone = inputs[4].value;
        user.role = inputs[5].value;
        
        localStorage.setItem('data', JSON.stringify(data));
        showNotification('Пользователь обновлен', 'success');
        document.querySelector('.modal-overlay').remove();
        loadAdminUsers();
    }
}

function showAddScheduleModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Добавить занятие</h2>
            <form onsubmit="addScheduleSession(event)">
                <input type="text" placeholder="Название услуги" required class="form-input">
                <input type="datetime-local" required class="form-input">
                <input type="text" placeholder="Инструктор" required class="form-input">
                <input type="number" placeholder="Макс. участников" required min="1" class="form-input">
                <div class="modal-buttons">
                    <button type="button" class="btn btn-outline" onclick="this.closest('.modal-overlay').remove()">Отмена</button>
                    <button type="submit" class="btn btn-accent">Добавить</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
}

function addScheduleSession(event) {
    event.preventDefault();
    const form = event.target;
    const inputs = form.querySelectorAll('input');
    const data = JSON.parse(localStorage.getItem('data'));

    const newId = Math.max(...data.schedule.map(s => s.id), 0) + 1;
    const trainer = data.users.find(u => u.full_name === inputs[2].value && u.role === 'trainer');

    const newSession = {
        id: newId,
        service: inputs[0].value,
        date: new Date(inputs[1].value).toISOString(),
        instructor: inputs[2].value,
        trainer_id: trainer?.id || null,
        max_participants: parseInt(inputs[3].value),
        status: 'active'
    };

    data.schedule.push(newSession);
    localStorage.setItem('data', JSON.stringify(data));
    showNotification('Занятие добавлено', 'success');
    document.querySelector('.modal-overlay').remove();
    loadAdminSchedule();
}

// ============================================================================
// ТРЕНЕР ПАНЕЛЬ
// ============================================================================

function initTrainerPanel() {
    const authData = getAuthData();
    if (!authData || authData.role !== 'trainer') return;

    loadTrainerSessions();
}

function loadTrainerSessions() {
    const container = document.querySelector('[data-trainer-sessions]');
    if (!container) return;

    const authData = getAuthData();
    const data = JSON.parse(localStorage.getItem('data'));

    const trainerSessions = data.schedule.filter(s => s.trainer_id === authData.id);

    if (trainerSessions.length === 0) {
        container.innerHTML = '<p>Нет занятий</p>';
        return;
    }

    let html = '';
    trainerSessions.forEach(session => {
        const enrolledUsers = data.enrollments.filter(e => e.schedule_id === session.id);
        const date = new Date(session.date).toLocaleString('ru-RU');

        html += `
            <div class="trainer-session">
                <h3>${session.service}</h3>
                <p>Дата: ${date}</p>
                <p>Участников: ${enrolledUsers.length}</p>
                <button class="btn btn-accent" onclick="showSessionParticipants(${session.id})">Посмотреть участников</button>
            </div>
        `;
    });

    container.innerHTML = html;
}

function showSessionParticipants(sessionId) {
    const data = JSON.parse(localStorage.getItem('data'));
    const session = data.schedule.find(s => s.id === sessionId);
    const enrolledUsers = data.enrollments.filter(e => e.schedule_id === sessionId);

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    
    let content = `<div class="modal-content"><h2>Участники: ${session.service}</h2>`;
    
    if (enrolledUsers.length === 0) {
        content += '<p>Нет участников</p>';
    } else {
        content += '<ul class="participants-list">';
        enrolledUsers.forEach(enrollment => {
            const user = data.users.find(u => u.id === enrollment.user_id);
            const isPresent = enrollment.status === 'present';
            
            content += `
                <li>
                    <span>${user?.full_name}</span>
                    <button class="btn btn-small ${isPresent ? 'btn-accent' : 'btn-outline'}" 
                            onclick="toggleAttendance(${enrollment.id}, this)">
                        ${isPresent ? 'Присутствовал' : 'Отметить'}
                    </button>
                    <button class="btn btn-small btn-danger" onclick="cancelSessionEnrollment(${enrollment.id})">Отменить запись</button>
                </li>
            `;
        });
        content += '</ul>';
    }

    content += '<button class="btn btn-outline" onclick="this.closest(\'.modal-overlay\').remove()" style="margin-top: 20px;">Закрыть</button></div>';
    
    modal.innerHTML = content;
    document.body.appendChild(modal);
}

function toggleAttendance(enrollmentId, button) {
    const data = JSON.parse(localStorage.getItem('data'));
    const enrollment = data.enrollments.find(e => e.id === enrollmentId);

    if (enrollment) {
        enrollment.status = enrollment.status === 'present' ? 'registered' : 'present';
        localStorage.setItem('data', JSON.stringify(data));
        
        button.textContent = enrollment.status === 'present' ? 'Присутствовал' : 'Отметить';
        button.classList.toggle('btn-accent');
        button.classList.toggle('btn-outline');
    }
}

function cancelSessionEnrollment(enrollmentId) {
    showConfirmModal('Отменить запись?', () => {
        const data = JSON.parse(localStorage.getItem('data'));
        data.enrollments = data.enrollments.filter(e => e.id !== enrollmentId);
        localStorage.setItem('data', JSON.stringify(data));
        showNotification('Запись отменена', 'success');
        document.querySelector('.modal-overlay').remove();
    });
}

// ============================================================================
// ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    updateNavigation();
    protectPage();
    checkLocate();

    // Форма входа
    const loginForm = document.querySelector('#login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }

    // Переключение видимости пароля
    const eyeButton = document.querySelector('.eye-btn');
    if (eyeButton) {
        const passwordInput = eyeButton.parentElement.querySelector('input[type="password"]');
        const openEye = eyeButton.querySelector('.open');
        const closeEye = eyeButton.querySelector('.close');

        eyeButton.addEventListener('click', () => {
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                openEye.style.display = 'none';
                closeEye.style.display = 'block';
            } else {
                passwordInput.type = 'password';
                openEye.style.display = 'block';
                closeEye.style.display = 'none';
            }
        });
    }

    // Кабинет пользователя
    if (window.location.pathname.includes('cabinet.html')) {
        initCabinet();
    }

    // Страница абонементов
    if (window.location.pathname.includes('abonements.html')) {
        initAbonementBooking();
    }

    // Страница расписания
    if (window.location.pathname.includes('schedule.html')) {
        initScheduleBooking();
    }

    // Админ панель
    if (window.location.pathname.includes('admin')) {
        initAdminPanel();
    }

    // Тренер панель
    if (window.location.pathname.includes('trainer')) {
        initTrainerPanel();
    }
});
