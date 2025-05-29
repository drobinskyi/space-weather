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
            const capitalizedDay = capitalizeFirstLetter(formattedGroupHeaderDay);
 
            // Створюємо рядок для заголовка групи
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
                const kpValue = parseFloat(rowData.kp);
                const statusInfo = getKpStatus(kpValue);
 
                const hourInfo = document.createElement('div');
                hourInfo.classList.add('block-hour-info');

                // Перевіряємо поточні спостереження
                const observedInfo = rowData.observed;

                if (observedInfo === 'estimated') {
                    hourInfo.classList.add('estimated');
                }

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
                const infoTime = document.createElement('div');
                infoTime.classList.add('block-time');
                infoTime.textContent = formattedTime;
                hourInfo.appendChild(infoTime);

                // Kp-індекс
                const infoKp = document.createElement('div');
                infoKp.classList.add('block-kp');
                if (Number.isInteger(kpValue)) {
                    infoKp.textContent = kpValue.toString(); // Якщо ціле, виводимо без коми
                } else {
                    infoKp.textContent = kpValue.toFixed(2); // Інакше - форматуємо до 2 знаків після коми
                }
            
                hourInfo.appendChild(infoKp);

                // Статус
                const infoStatus = document.createElement('div');
                infoStatus.classList.add('block-status');
                    // Додаємо текст до статусу
                const infoStatusText = document.createElement('p');
                infoStatusText.classList.add('block-status-text');
                infoStatusText.textContent = statusInfo.text;
                infoStatus.appendChild(infoStatusText);
                    // Додаємо лінію до статусу
                const infoStatusLine = document.createElement('div');
                infoStatusLine.classList.add('block-status-line');
                infoStatus.appendChild(infoStatusLine);

                hourInfo.appendChild(infoStatus);

                // Задаємо кольори індексу і лінії
                if (kpValue >= 7) {
                    infoKp.setAttribute("style", "color: #8e0000");
                    infoStatusLine.setAttribute("style", "background-color: #8e0000");
                } else if (kpValue >= 5) {
                    infoKp.setAttribute("style", "color: #cc0000");
                    infoStatusLine.setAttribute("style", "background-color: #cc0000")
                } else if (kpValue >= 4) {
                    infoKp.setAttribute("style", "color: #cf8232");
                    infoStatusLine.setAttribute("style", "background-color: #cf8232");
                } else {
                    infoKp.setAttribute("style", "color: #84b070");
                    infoStatusLine.setAttribute("style", "background-color: #84b070");
                }

                // Розраховуємо довжину лінії
                const statusLineLength = kpValue * 100 / 9;
                const statusLineLengthRound = Math.round(statusLineLength);
                infoStatusLine.style.width = statusLineLengthRound + '%';

                scheduleBody.appendChild(hourInfo);
                // groupHeaderBlock.appendChild(hourInfo);
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
    const targetElement = document.querySelector('.estimated'); // Знаходить ПЕРШИЙ елемент з класом .estimated

    if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
};

loadData(dataNOAA);

