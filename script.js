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

// Функція для отримання текстового статусу та CSS класу
function getKpStatus(kpValue) {
    if (kpValue >= 9) {
        return { text: "Екстремально сильна буря", class: "status-storm" };
    } else if (kpValue >= 8) {
        return { text: "Дуже сильна буря", class: "status-storm" };
    } else if (kpValue >= 7) {
        return { text: "Сильна буря", class: "status-storm" };
    } else if (kpValue >= 6) {
        return { text: "Помірна буря", class: "status-storm" };
    } else if (kpValue >= 5) {
        return { text: "Слабка буря", class: "status-minor-storm" };
    } else if (kpValue >= 4) {
        return { text: "Незначні збурення", class: "status-minor-storm" };
    } else {
        return { text: "Спокійно", class: "status-calm" };
    }
};

// Виправлення відмінка дня тижня
function correctWeekdayNominative(weekdayName) {
    switch (weekdayName.toLowerCase()) {
        case 'понеділок': return 'Понеділок';
        case 'вівторок': return 'Вівторок';
        case 'середу': return 'Середа';
        case 'четвер': return 'Четвер';
        case 'пʼятницю': return 'П’ятниця';
        case 'суботу': return 'Субота';
        case 'неділю': return 'Неділя';
        default: return weekdayName; // Повертаємо як є, якщо не знайдено
    }
}

// Відображення сторінки прогнозу магнітних бур
function showKpForecast(data) {
    const scheduleBody = document.querySelector('.page-forecast');
    scheduleBody.innerHTML = '';

    const headers = data[0];
    const records = data.slice(1);

    // Об'єкт для групування даних по днях
    const groupedData = {};

    records.forEach(row => {
        const rowData = {};
        headers.forEach((header, index) => {
            rowData[header] = row[index];
        });

        const rawDateString = rowData.time_tag;
        const dateUtc = new Date(rawDateString.replace(' ', 'T') + 'Z');

        // Отримуємо "ключ" дня (наприклад, "2025-05-19") для групування
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
            console.log(dailyRecords);
            
            const firstRecordDate = new Date(dayKey + 'T00:00:00Z'); // Створюємо дату для заголовка групи
            const firstRecordDay =  new Date(dayKey + 'T00:00:00Z');

            // Опції форматування для заголовка групи (день тижня, число, місяць)
            const groupHeaderDateOptions = {
                day: 'numeric',
                month: 'long',
                timeZone: 'UTC'
            };

            const groupHeaderDayOptions = {
                weekday: 'long',
                timeZone: 'UTC'
            };

            const formattedGroupHeaderDate = firstRecordDate.toLocaleDateString('uk-UA', groupHeaderDateOptions);
            const formattedGroupHeaderDay = firstRecordDate.toLocaleDateString('uk-UA', groupHeaderDayOptions);
 
            // Створюємо рядок для заголовка групи
            const groupHeaderRow = document.createElement('div');
            const groupHeaderDay = document.createElement('span');
            groupHeaderDay.textContent = formattedGroupHeaderDay.toLowerCase(); // Відображаємо заголовки малими літерами
            groupHeaderRow.appendChild(groupHeaderDay);
            const groupHeaderDate = document.createElement('span');
            groupHeaderDate.textContent = formattedGroupHeaderDate.toLowerCase(); // Відображаємо заголовки малими літерами
            groupHeaderRow.appendChild(groupHeaderDate);
            scheduleBody.appendChild(groupHeaderRow);

            // Додаємо рядки з даними для цього дня
            dailyRecords.forEach(rowData => {
                const kpValue = parseFloat(rowData.kp);
                const statusInfo = getKpStatus(kpValue);

                const tr = document.createElement('div');

                // Форматуємо лише час для кожного запису
                const recordDateUtc = new Date(rowData.time_tag.replace(' ', 'T') + 'Z');
                const timeOptions = {
                    hour: '2-digit',
                    minute: '2-digit',
                    hourCycle: 'h23',
                    timeZone: 'UTC'
                };
                const formattedTime = recordDateUtc.toLocaleTimeString('uk-UA', timeOptions);
                
                // Час
                const tdTime = document.createElement('span');
                tdTime.textContent = formattedTime;
                tr.appendChild(tdTime);

                // Kp-індекс
                const tdKp = document.createElement('span');
                if (Number.isInteger(kpValue)) {
                    tdKp.textContent = kpValue.toString(); // Якщо ціле, виводимо без коми
                } else {
                    tdKp.textContent = kpValue.toFixed(2); // Інакше - форматуємо до 2 знаків після коми
                }
                tr.appendChild(tdKp);

                // Статус
                const tdStatus = document.createElement('span');
                tdStatus.textContent = statusInfo.text;
                tdStatus.className = statusInfo.class;
                tr.appendChild(tdStatus);

                scheduleBody.appendChild(tr);
            });
        }
    }
};

loadData(dataNOAA);