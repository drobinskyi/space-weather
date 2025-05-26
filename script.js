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
const pageForecast = document.querySelector('.page-forecast');
const pageError = document.querySelector('.page-404');

// Відображення сторінки помилки
function errorMessage() {
    pageForecast.setAttribute("style", "display: none");
    pageError.setAttribute("style", "display: flex");
}

// Функція для отримання текстового статусу та CSS класу
function getKpStatus(kpValue) {
    if (kpValue >= 9) {
        return { text: "Екстремально сильна буря", class: "status-storm" }; // G5
    } else if (kpValue >= 8) {
        return { text: "Дуже сильна буря", class: "status-storm" }; // G4
    } else if (kpValue >= 7) {
        return { text: "Сильна буря", class: "status-storm" }; // G3
    } else if (kpValue >= 6) {
        return { text: "Помірна буря", class: "status-storm" }; // G2
    } else if (kpValue >= 5) {
        return { text: "Слабка буря", class: "status-minor-storm" }; // G1
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
    const tableBody = document.querySelector('.page-forecast');
    tableBody.innerHTML = '';

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
            const firstRecordDate = new Date(dayKey + 'T00:00:00Z'); // Створюємо дату для заголовка групи

            // Опції форматування для заголовка групи (день тижня, число, місяць)
            const groupHeaderOptions = {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                timeZone: 'UTC'
            };
            let formattedGroupHeader = firstRecordDate.toLocaleDateString('uk-UA', groupHeaderOptions);

            // Розбиваємо рядок, щоб виділити день тижня, число та місяць
            const parts = formattedGroupHeader.split(', ');
                if (parts.length > 0) {
                    const weekdayPart = parts[0];
                    const correctedWeekday = correctWeekdayNominative(weekdayPart);
                    formattedGroupHeader = correctedWeekday + ', ' + parts.slice(1).join(', ');
                }

            // Створюємо рядок для заголовка групи
            const groupHeaderRow = document.createElement('div');
            const groupHeaderCell = document.createElement('span');
            groupHeaderCell.textContent = formattedGroupHeader.toUpperCase(); // Відображаємо заголовки великими літерами
            groupHeaderRow.appendChild(groupHeaderCell);
            tableBody.appendChild(groupHeaderRow);

            // Додаємо рядки з даними для цього дня
            dailyRecords.forEach(rowData => {
                const kpValue = parseFloat(rowData.kp);
                const statusInfo = getKpStatus(kpValue);
                const noaaScale = rowData.noaa_scale || "Немає";

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
                tdKp.textContent = kpValue.toFixed(2);
                tr.appendChild(tdKp);

                // Статус
                const tdStatus = document.createElement('span');
                tdStatus.textContent = statusInfo.text;
                tdStatus.className = statusInfo.class;
                tr.appendChild(tdStatus);

                // Рівень бурі NOAA
                const tdNoaaScale = document.createElement('span');
                tdNoaaScale.textContent = noaaScale;
                tr.appendChild(tdNoaaScale);


                tableBody.appendChild(tr);
            });
        }
    }
};

loadData(dataNOAA);