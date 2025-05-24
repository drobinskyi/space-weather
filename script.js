// Посилання на дані
const dataNOAA = 'https://services.swpc.noaa.gov/products/noaa-planetary-k-index-forecast.json';

// Асинхронна функція
async function loadData(data) {
    try {
        const response = await fetch(data);
        const responseResult = await response.json();
        
        console.log(responseResult);
        
    } catch (error) {
        console.log(error);
    }
}

loadData(dataNOAA);