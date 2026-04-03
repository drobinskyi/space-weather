// Посилання на дані
const dataNOAA = 'https://services.swpc.noaa.gov/products/noaa-planetary-k-index-forecast.json';

// Асинхронна функція
async function loadData(data) {
    try {
        const response = await fetch(data);
        const responseResult = await response.json();
        
        showKpForecast(responseResult);
        
    } catch (error) {
        errorMessage();
        console.log(error);
    }
}

// Основні DOM-елементи
const scheduleBody = document.querySelector('.page-forecast');
const pageError = document.querySelector('.page-404');

// Відображення сторінки помилки
function errorMessage() {
    scheduleBody.setAttribute("style", "display: none");
    pageError.setAttribute("style", "display: flex");
}

// Функція для отримання текстового статусу
function getKpStatus(kpValue) {
    if (kpValue >= 9) {
        return { text: "Екстремально сильна буря" };
    } else if (kpValue >= 8) {
        return { text: "Дуже сильна буря" };
    } else if (kpValue >= 7) {
        return { text: "Сильна буря" };
    } else if (kpValue >= 6) {
        return { text: "Помірна буря" };
    } else if (kpValue >= 5) {
        return { text: "Слабка буря" };
    } else if (kpValue >= 4) {
        return { text: "Незначні збурення" };
    } else {
        return { text: "Спокійно" };
    }
};

// Написання днів тижня з великої літери
function capitalizeFirstLetter(string) {
    if (!string) return ''; // Обробка порожнього рядка
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  }

// Відображення сторінки прогнозу магнітних бур
function showKpForecast(data) {
    const scheduleBody = document.querySelector('.page-forecast');
    scheduleBody.innerHTML = '';

    const records = data; 

    // Об'єкт для групування даних по днях
    const groupedData = {};

    records.forEach(rowData => {
        
        const rawDateString = rowData.time_tag;
        
        // Створюємо дату. NOAA формат "YYYY-MM-DD HH:MM:SS" коректно підхоплюється так:
        const dateUtc = new Date(rawDateString.replace(' ', 'T') + 'Z');

        // Отримуємо "ключ" дня (наприклад, "2026-04-04")
        const dayKey = dateUtc.toISOString().split('T')[0];

        if (!groupedData[dayKey]) {
            groupedData[dayKey] = [];
        }
        groupedData[dayKey].push(rowData);
    });

    // Ітерація по згрупованих даних
    for (const dayKey in groupedData) {
        if (groupedData.hasOwnProperty(dayKey)) {
            const dailyRecords = groupedData[dayKey];
            const firstRecordDate = new Date(dayKey + 'T00:00:00Z');

            // Форматування заголовків
            const groupHeaderDateOptions = { day: 'numeric', month: 'long', timeZone: 'UTC' };
            const groupHeaderDayOptions = { weekday: 'long', timeZone: 'UTC' };

            const formattedGroupHeaderDate = firstRecordDate.toLocaleDateString('uk-UA', groupHeaderDateOptions);
            const formattedGroupHeaderDay = firstRecordDate.toLocaleDateString('uk-UA', groupHeaderDayOptions);
            const capitalizedDay = capitalizeFirstLetter(formattedGroupHeaderDay);

            // Створення DOM для заголовка
            const groupHeaderBlock = document.createElement('div');
            groupHeaderBlock.classList.add('block-header');
            
            const groupHeaderDay = document.createElement('h2');
            groupHeaderDay.classList.add('block-day');
            groupHeaderDay.textContent = capitalizedDay;
            groupHeaderBlock.appendChild(groupHeaderDay);
            
            const groupHeaderDate = document.createElement('h3');
            groupHeaderDate.classList.add('block-date');
            groupHeaderDate.textContent = formattedGroupHeaderDate;
            groupHeaderBlock.appendChild(groupHeaderDate);
            
            scheduleBody.appendChild(groupHeaderBlock);

            // Додаємо рядки з даними для цього дня
            dailyRecords.forEach(rowData => {
                const kpValue = parseFloat(rowData.kp || rowData.kp_index || 0); // На випадок зміни kp на kp_index
                const statusInfo = getKpStatus(kpValue);

                const hourInfo = document.createElement('div');
                hourInfo.classList.add('block-hour-info');

                // Поле "noaa_scale" тепер містить статус (predicted/estimated) або використовуємо логіку за часом
                // NOAA у новому форматі зазвичай пише статус у полі noaa_scale
                if (rowData.observed === 'estimated') {
                    hourInfo.classList.add('estimated');
                } else if (rowData.observed === 'predicted') {
                    hourInfo.classList.add('predicted');
                }

                const recordDateUtc = new Date(rowData.time_tag.replace(' ', 'T') + 'Z');
                const timeOptions = { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'UTC' };
                const formattedTime = recordDateUtc.toLocaleTimeString('uk-UA', timeOptions);
                
                // Час
                const infoTime = document.createElement('div');
                infoTime.classList.add('block-time');
                infoTime.textContent = formattedTime;
                hourInfo.appendChild(infoTime);

                // Kp-індекс
                const infoKp = document.createElement('div');
                infoKp.classList.add('block-kp');
                infoKp.textContent = Number.isInteger(kpValue) ? kpValue.toString() : kpValue.toFixed(2);
                hourInfo.appendChild(infoKp);

                // Статус та лінія
                const infoStatus = document.createElement('div');
                infoStatus.classList.add('block-status');
                
                const infoStatusText = document.createElement('p');
                infoStatusText.classList.add('block-status-text');
                infoStatusText.textContent = statusInfo.text;
                infoStatus.appendChild(infoStatusText);

                const infoStatusLine = document.createElement('div');
                infoStatusLine.classList.add('block-status-line');
                infoStatus.appendChild(infoStatusLine);
                hourInfo.appendChild(infoStatus);

                // Колірна логіка
                if (kpValue >= 7) {
                    infoKp.style.color = "#8e0000";
                    infoStatusLine.style.backgroundColor = "#8e0000";
                } else if (kpValue >= 5) {
                    infoKp.style.color = "#cc0000";
                    infoStatusLine.style.backgroundColor = "#cc0000";
                } else if (kpValue >= 4) {
                    infoKp.style.color = "#cf8232";
                    infoStatusLine.style.backgroundColor = "#cf8232";
                } else {
                    infoKp.style.color = "#84b070";
                    infoStatusLine.style.backgroundColor = "#84b070";
                }

                const statusLineLength = (kpValue * 100) / 9;
                infoStatusLine.style.width = Math.round(statusLineLength) + '%';

                scheduleBody.appendChild(hourInfo);
            });
        }
    }

    // Стилізуємо перший і останній виділені елементи
    const estimatedBlocks = document.querySelectorAll('.estimated');
        
    if (estimatedBlocks.length > 0) {
        // Додаємо клас до першого елемента
        estimatedBlocks[0].classList.add('first-estimated-style');
    
        // Додаємо клас до останнього елемента
        if (estimatedBlocks.length > 1) {
            estimatedBlocks[estimatedBlocks.length - 1].classList.add('last-estimated-style');
        }
    } if (estimatedBlocks.length === 1) {
        estimatedBlocks[0].classList.add('single-estimated-style');
    }

    // Прокручування до поточного часу
    const targetElement = document.querySelector('.estimated'); // Знаходимо ПЕРШИЙ елемент з класом .estimated

    const futureElements = document.querySelectorAll('.predicted'); // Всі елементи з класом .predicted
    const futureElement = futureElements[0];

    if (estimatedBlocks.length === 0) {
        futureElement.classList.add('first-predicted-style'); // Стилізуємо перший елемент з класом .predicted
    }
    
    if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
        futureElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
};

loadData(dataNOAA);

