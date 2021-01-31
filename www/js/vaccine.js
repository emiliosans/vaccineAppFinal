// otra fuente datos vacunas https://raw.githubusercontent.com/datadista/datasets/master/COVID%2019/ccaa_vacunas.csv

this.onload = carga;

function carga() {

    //muestra spinner 'Cargandoo...' mientras se abre la pagina
    presentLoading();

    //y el URL_COVID_APP que es del josn de la pagina covid-vacunas.app
    parseaJSONVacunas();

    //funcion que recoge los datos de la pagina URL_GIT2 que es del github www.ourworldindata.com
    parseaGraficos();

    //funcion que recoge los datos del github de la web de civio para pintar las graficas de los datos
    //de la comunidad de madrid
    //https://raw.githubusercontent.com/civio/covid-vaccination-spain/main/data.csv
    parseaGraficosCSVMadrid();


}

//necesario para que funcione el menu lateral
async function openMenu() {
    await menuController.open();
}

//necesario para que funcione el spiner de carga de la pagina
async function presentLoading() {
    const loading = await loadingController.create({
        message: 'Cargando...',
        duration: 500
    });

    await loading.present();
}

//XMLHttpRequest que recoge los datos json de covid-vacunas.app
//se ha sustituido por FETCH en parseaJSONVacunas()
//var xhr = new XMLHttpRequest();


//XMLHttpRequest que recoge los datos .csv del github www.ourworldindata.com
var xhrGraficos = new XMLHttpRequest();


// URL del github www.ourworldindata.com se usa para obtener el .csv para pintar las graficas de vacunacion de España
const URL_GIT2 = "https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/vaccinations/country_data/Spain.csv";

// URL del json covid-vacunas.app
const URL_COVID_APP = "https://covid-vacuna.app/data/latest.json";

// URL del csv de la pagina de civio para pintar los graficos de datos de vacunacion de Madrid
const URL_GRAFICOS_MADRID = "https://raw.githubusercontent.com/civio/covid-vaccination-spain/main/data.csv";

//parseo el JSON de covid-vacunas.app
function parseaJSONVacunas() {
    //VERSION OBTENER DATOS DEL JSON DE COVID-VACUNAS.APP CON XMLHttpRequest
    /*console.log("estoy en muestra reviews con el HTTPXMLRequest");
    xhr.open("GET", URL_COVID_APP);
    xhr.onreadystatechange = recibirJSONVacunas;
    xhr.send();*/

    fetch(URL_COVID_APP)
        .then(response => response.json())
        .then(data => {
            muestraDatosVacunaMadrid(data);
            muestraDatosVacunaEspaña(data);

        })
        .catch(function (error) {
            window.alert("HA FALLADO EL JSON DE covid-vacunas.app. Error: " + error.message);
            console.log('HA FALLADO EL JSON DE covid-vacunas.app. Hubo un problema con la petición Fetch:' + error.message);
        });
}


//coge el .csv del github www.ourworldindata.com para pintar las graficas de vacunacion de España
function parseaGraficos() {

    console.log("estoy en muestra reviews con el HTTPXMLRequest");
    xhrGraficos.open("GET", URL_GIT2);
    xhrGraficos.onreadystatechange = recibirGraficos;
    xhrGraficos.send();
}


// coge el csv de la pagina de civio para pintar los graficos de datos de vacunacion de Madrid
function parseaGraficosCSVMadrid() {
    console.log("parseaGraficosCSVMadrid");
    fetch(URL_GRAFICOS_MADRID)
        .then(response => response.text())
        .then(data => {
            //grafico dosis distribuidas Madrid
            dibujarGraficoMadrid(parseCSV(data));
            //grafico dosis administradas Madrid
            dibujarGraficoDosisAdministradasMadrid(parseCSV(data));
            //grafico pauta completada Madrid
            dibujarGraficoDosisPautaCompletaMadrid(parseCSV(data));

        })
        .catch(function (error) {
            window.alert("HA FALLADO EL CSV de las graficas de la pagina de civio Error: " + error.message);
            console.log('HA FALLADO EL CSV de las graficas de la pagina de civio. Hubo un problema con la petición Fetch:' + error.message);
        });

}


//FUNCION SACADA DE STACKOVERFLOW QUE PARSEA UN ARCHIVO .CSV
//TE DA UN ARRAY CON TODOS LOS DATOS DEL CSV SEGUIDOS
// Return array of string values, or NULL if CSV string not well formed.
function CSVToArray2(text) {
    var re_valid = /^\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*(?:,\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*)*$/;
    var re_value = /(?!\s*$)\s*(?:'([^'\\]*(?:\\[\S\s][^'\\]*)*)'|"([^"\\]*(?:\\[\S\s][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/g;

    // Return NULL if input string is not well formed CSV string.
    if (!re_valid.test(text)) return null;

    var a = []; // Initialize array to receive values.
    text.replace(re_value, // "Walk" the string using replace with callback.
        function (m0, m1, m2, m3) {

            // Remove backslash from \' in single quoted values.
            if (m1 !== undefined) a.push(m1.replace(/\\'/g, "'"));

            // Remove backslash from \" in double quoted values.
            else if (m2 !== undefined) a.push(m2.replace(/\\"/g, '"'));
            else if (m3 !== undefined) a.push(m3);
            return ''; // Return empty string.
        });

    // Handle special case of empty last value.
    if (/,\s*$/.test(text)) a.push('');
    return a;
};


//OTRA FUNCION PARA PARSEAR CSV, A DIFERENCIA DE LA ANTERIOR, DEVUELVEUN ARRAY DE ARRAYS EN EL QUE CADA ARRAY
//ES UNA LINEA DEL CSV
function parseCSV(str) {
    var arr = [];
    var quote = false;  // 'true' means we're inside a quoted field

    // Iterate over each character, keep track of current row and column (of the returned array)
    for (var row = 0, col = 0, c = 0; c < str.length; c++) {
        var cc = str[c], nc = str[c + 1];        // Current character, next character
        arr[row] = arr[row] || [];             // Create a new row if necessary
        arr[row][col] = arr[row][col] || '';   // Create a new column (start with empty string) if necessary

        // If the current character is a quotation mark, and we're inside a
        // quoted field, and the next character is also a quotation mark,
        // add a quotation mark to the current column and skip the next character
        if (cc == '"' && quote && nc == '"') { arr[row][col] += cc; ++c; continue; }

        // If it's just one quotation mark, begin/end quoted field
        if (cc == '"') { quote = !quote; continue; }

        // If it's a comma and we're not in a quoted field, move on to the next column
        if (cc == ',' && !quote) { ++col; continue; }

        // If it's a newline (CRLF) and we're not in a quoted field, skip the next character
        // and move on to the next row and move to column 0 of that new row
        if (cc == '\r' && nc == '\n' && !quote) { ++row; col = 0; ++c; continue; }

        // If it's a newline (LF or CR) and we're not in a quoted field,
        // move on to the next row and move to column 0 of that new row
        if (cc == '\n' && !quote) { ++row; col = 0; continue; }
        if (cc == '\r' && !quote) { ++row; col = 0; continue; }

        // Otherwise, append the current character to the current column
        arr[row][col] += cc;
    }
    //console.log(arr);
    return arr;
}



//funcion utilizada en parseaGraficos(), que recoge los estados del XMLHttpRequest xhrGraficos
//para obtener el .csv del github de ourworldindata para pintar las graficas de los datos de España
function recibirGraficos() {
    if (xhrGraficos.readyState == 4) {
        console.log("respuesta rx");
        switch (xhrGraficos.status) {
            case 200:
                console.log("respuesta OK");
                //recoge el csv de la página
                let csv_raw = xhrGraficos.responseText;
                console.log("csv = " + csv_raw);
                //parsea el csv a un array
                let arrayCSV = CSVToArray2(csv_raw);
                console.log("array csv = " + arrayCSV);

                if (arrayCSV.resultCount === null) {
                    window.alert("NO HAY DATOS DE VACUNACIÓN");
                    console.log("NO HAY DATOS DE VACUNACIÓN");
                } else {
                    //si hay datos en el csv
                    console.log(arrayCSV);
                    //dibuja la grafica de dosis administradas España
                    dibujarGrafico(arrayCSV);
                    //grafica dosis administradas España
                    dibujarGraficoDosisAdministradas(arrayCSV);
                    //grafica dosis pauta completada España
                    dibujarGraficoDosisPautaCompleta(arrayCSV);
                }
                break;
            case 400:
                console.log("COd respuesta " + xhrGraficos.status);
                console.log("respuesta INCORRECTA");
                window.alert("respuesta INCORRECTA");

                break;
            case 204:
                console.log("COd respuesta " + xhrGraficos.status);
                console.log("NO EXISTEN PAGINA CSV DE VACUNACION");
                window.alert("NO EXISTE PAGINA CSV DE VACUNACION");
                break;
            case 500:
                console.log("COd respuesta " + xhrGraficos.status);
                console.log("ERROR DEL SERVIDOR");
                window.alert("ERROR DEL SERVIDOR");
                break;
            default:
                console.log("Cod respuesta " + xhrGraficos.status);
        }
    }
}

//dibuja graficos dosis entregadas España
function dibujarGrafico(datos) {
    //recoge las fechas en un array
    let fechas = [];
    let longitudDatos = datos.length;
    console.log = ("longitud datos " + longitudDatos);
    let i = 0;

    while (i < 7) {
        //recoge 7 fechas que en el array del csv se encuentran cada 6 posiciones hacia atras, desde el final del array
        longitudDatos = longitudDatos - 6;
        //se divide la cadena fecha en 3 porque está en formato ingles
        let formatFecha = datos[longitudDatos].split("-", 3);
        //se le da la vuelva a la fecha para ponlera en formato español
        formatFecha = formatFecha[2] + "-" + formatFecha[1] + "-" + formatFecha[0];
        //se añade la fecha al array
        fechas.push(formatFecha);
        i++;
    }
    //le damos la vuelta al array para poner las fechas en orden cronologico
    fechas = fechas.reverse();
    //console.log("array fechas = " + fechas);
    i = 0;
    //se recorre el array de nuevo para recoger los 7 ultimos datos de dosis entregadas
    //que empiezan en la posicion 3 contando desde el final del array
    let longitudDosisEntregadas = datos.length - 3;
    let dosisEntregadas = [];
    dosisEntregadas.push(datos[longitudDosisEntregadas]);
    while (i < 6) {
        longitudDosisEntregadas = longitudDosisEntregadas - 6;

        dosisEntregadas.push(datos[longitudDosisEntregadas]);
        i++;
    }
    //se le da la vuelta al array para que las dosis esten en orden cronologico
    dosisEntregadas.reverse();


    var ctx = document.getElementById('myChart').getContext('2d');
    var chart = new Chart(ctx, {
        // The type of chart we want to create
        type: 'line',

        // The data for our dataset
        data: {
            labels: fechas,
            datasets: [{
                label: 'Vacunas distribuidas',
                backgroundColor: 'rgb(16, 26, 214)',
                //borderColor: 'rgb(255, 99, 132)',
                borderColor: 'rgb(255, 255, 255)',
                data: dosisEntregadas
            }]
        },

        // Configuration options go here
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }

        }
    });
}

//en el csv los datos llegan de la siguiente forma:
//madrid, posicion 14
//desde el final posicion  - 6, despues cada nueva fecha -20
// oden subarray posicion 0 fecha, posicion 5 dosis entregadas, posicion 6 dosis administradas,
//posicion 7 % sobre entregadas, posicion 8 pauta completada

function dibujarGraficoMadrid(datos) {
    //en este caso el csv es un array en el q cada elemento del array es otro array con los datos de cada
    //fila del csv
    let fechas = [];
    let indiceMadridDesdeElFinal = datos.length;
    //madrid esta en la posicion 7 del array de arrays empezando desde el final
    indiceMadridDesdeElFinal = indiceMadridDesdeElFinal - 7;
    console.log = ("longitud datos " + indiceMadridDesdeElFinal);
    let i = 0;

    while (i < 7) {
        //se recoge el array de la posicion 7 desde el final, q es donde esta el primer dato de madrid
        let formatFecha = datos[indiceMadridDesdeElFinal];
        //en el array resultando las fechas estan en la posicion 0 (la primera del array)
        fechas.push(formatFecha[0]);
        //en el array de arrays cada dato de madrid esta cada 20 posiciones empezando por el final
        indiceMadridDesdeElFinal = indiceMadridDesdeElFinal - 20;
        i++;
    }
    //se da la vuelta al array para que las fechas queden en orden cronologico
    fechas = fechas.reverse();
    i = 0;
    let longitudDosisEntregadas = datos.length;
    //se recoge el array de la posicion 7 desde el final, q es donde esta el primer dato de madrid
    longitudDosisEntregadas = longitudDosisEntregadas - 7;
    let dosisEntregadas = [];

    while (i < 7) {

        let dosis = datos[longitudDosisEntregadas];
        //en el array resultante que cogemos del array de arrays, el dato de dosis entregadas
        //de madrid esta en la posicion 4 empezando desde el principio
        dosisEntregadas.push(dosis[4]);
        //en el array de arrays cada dato de madrid esta cada 20 posiciones empezando por el final
        longitudDosisEntregadas = longitudDosisEntregadas - 20;
        i++;
    }
    //se da la vuelta al array para que las dosis entregadas queden en orden cronologico
    dosisEntregadas.reverse();


    var ctx = document.getElementById('myChartMadridEntregadas').getContext('2d');
    var chart = new Chart(ctx, {
        // The type of chart we want to create
        type: 'line',

        // The data for our dataset
        data: {
            labels: fechas,
            datasets: [{
                label: 'Vacunas distribuidas Madrid',
                backgroundColor: 'rgb(16, 26, 214)',
                //borderColor: 'rgb(255, 99, 132)',
                borderColor: 'rgb(255, 255, 255)',
                data: dosisEntregadas
            }]
        },

        // Configuration options go here
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }

        }
    });
}



//grafico de dosis administradas en España
function dibujarGraficoDosisAdministradas(datos) {

    let fechas = [];
    let longitudDatos = datos.length;
    console.log = ("longitud datos " + longitudDatos);
    let i = 0;

    while (i < 7) {
        //los fechas de dosis administradas España están cada 6 posiciones empezando por el final del array
        longitudDatos = longitudDatos - 6;
        //le damos la vuelta a la fecha para ponerla en formato español
        let formatFecha = datos[longitudDatos].split("-", 3);
        formatFecha = formatFecha[2] + "-" + formatFecha[1] + "-" + formatFecha[0];
        fechas.push(formatFecha);
        i++;
    }
    //damos la vuelta al array para poner las fechas en orden cronologico
    fechas = fechas.reverse();

    i = 0;
    //las cifras de dosis administradas empiezan en la posicion 2 empezando por el final del array
    let longitudDosisEntregadas = datos.length - 2;
    //el array es de dosis administradas, aunque en el nombre figure como 'entregadas'
    let dosisEntregadas = [];
    dosisEntregadas.push(datos[longitudDosisEntregadas]);
    while (i < 6) {
        //cada 6 posiciones empezando por el final aparace una nueva cifra de dosis administradas
        longitudDosisEntregadas = longitudDosisEntregadas - 6;

        dosisEntregadas.push(datos[longitudDosisEntregadas]);
        i++;
    }
    //se le da la vuelta al array para que las dosis administradas aparezcan en orden cronologico
    dosisEntregadas.reverse();


    var ctx = document.getElementById('myChartAdministradas').getContext('2d');
    var chart = new Chart(ctx, {
        // The type of chart we want to create
        type: 'line',

        // The data for our dataset
        data: {
            labels: fechas,
            datasets: [{
                label: 'Vacunas administradas',
                backgroundColor: 'rgb(226  , 83, 3)',
                //borderColor: 'rgb(255, 99, 132)',
                borderColor: 'rgb(255, 255, 255)',
                data: dosisEntregadas
            }]
        },

        // Configuration options go here
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }

        }
    });
}

//grafico de dosis administradas Madrid
function dibujarGraficoDosisAdministradasMadrid(datos) {

    let fechas = [];
    let indiceMadridDesdeElFinal = datos.length;
    //el primer dato de madrid empieza en el array de arrays en la posicion 7 empezando por el final
    indiceMadridDesdeElFinal = indiceMadridDesdeElFinal - 7;
    console.log = ("longitud datos " + indiceMadridDesdeElFinal);
    let i = 0;



    while (i < 7) {
        //agregamos las fechas cada 20 posiciones
        let formatFecha = datos[indiceMadridDesdeElFinal];
        //en el array resultante la fecha esta en la posicion 0
        fechas.push(formatFecha[0]);
        //el dato de madrid esta cada 20 posiciones empezando por el final
        indiceMadridDesdeElFinal = indiceMadridDesdeElFinal - 20;
        i++;
    }
    //se le da la vuelta al array para que salga en orden cronologico
    fechas = fechas.reverse();

    i = 0;
    let longitudDosisEntregadas = datos.length;
    //el primer dato de madrid empieza en el array de arrays en la posicion 7 empezando por el final

    longitudDosisEntregadas = longitudDosisEntregadas - 7;
    //el array es de dosis administradas, aunque en el nombre figure 'entregadas'
    let dosisEntregadas = [];

    while (i < 7) {

        let dosis = datos[longitudDosisEntregadas];
        //la cifra con las dosis administradas esta en la posicion 5 del array resultante
        dosisEntregadas.push(dosis[5]);
        //el dato de madrid esta cada 20 posiciones empezando por el final
        longitudDosisEntregadas = longitudDosisEntregadas - 20;
        i++;
    }
    //se le da la vuelta al array para que salga en orden cronologico
    dosisEntregadas.reverse();


    var ctx = document.getElementById('myChartMadridAdministradas').getContext('2d');
    var chart = new Chart(ctx, {
        // The type of chart we want to create
        type: 'line',

        // The data for our dataset
        data: {
            labels: fechas,
            datasets: [{
                label: 'Vacunas administradas Madrid',
                backgroundColor: 'rgb(226  , 83, 3)',
                //borderColor: 'rgb(255, 99, 132)',
                borderColor: 'rgb(255, 255, 255)',
                data: dosisEntregadas
            }]
        },

        // Configuration options go here
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }

        }
    });
}

//grafico pauta completa España
function dibujarGraficoDosisPautaCompleta(datos) {

    let fechas = [];
    let longitudDatos = datos.length;
    console.log = ("longitud datos " + longitudDatos);
    let i = 0;

    while (i < 7) {
        //las fechas estan cada 6 posiciones empezando por el final del array
        longitudDatos = longitudDatos - 6;
        //se da la vuelta la fecha a formato español
        let formatFecha = datos[longitudDatos].split("-", 3);
        formatFecha = formatFecha[2] + "-" + formatFecha[1] + "-" + formatFecha[0];
        fechas.push(formatFecha);
        i++;
    }
    //se da la vuelta a las fechas para que salgan en orden cronologico
    fechas = fechas.reverse();

    i = 0;
    //el dato de pauta completa empieza en la penulima posicion del array
    let longitudDosisEntregadas = datos.length - 1;
    //el array es personas con pauta completada, no 'dosis entregadas' como figura en el nombre del array
    let dosisEntregadas = [];
    dosisEntregadas.push(datos[longitudDosisEntregadas]);
    //cada 6 posiciones hay una cifra de pauta completa nueva
    longitudDosisEntregadas = longitudDosisEntregadas - 6;
    while (i < 6) {
        let comprueba = datos[longitudDosisEntregadas].toLowerCase();
        //el dato figura con la cifra, un salto de linea y la palabra 'spain'
        if (comprueba.includes('spain')) {
            //para quedarnos solo con la cifra
            comprueba = comprueba.match(/[^\r\n]+/g);;
            comprueba = comprueba[0];
            dosisEntregadas.push(comprueba);

        } else {
            //si solo aparece la cifra se agrega directamente al array
            dosisEntregadas.push(datos[longitudDosisEntregadas]);
        }
        //cada 6 posiciones hay una cifra de pauta completa nueva
        longitudDosisEntregadas = longitudDosisEntregadas - 6;


        i++;
    }
    //le damos la vuelta al array para que salga en orden cronologico
    dosisEntregadas.reverse();


    var ctx = document.getElementById('myChartCompletada').getContext('2d');
    var chart = new Chart(ctx, {
        // The type of chart we want to create
        type: 'line',

        // The data for our dataset
        data: {
            labels: fechas,
            datasets: [{
                label: 'Vacunación completada',
                backgroundColor: 'rgb(83  , 225, 162)',
                //borderColor: 'rgb(255, 99, 132)',
                borderColor: 'rgb(255, 255, 255)',
                data: dosisEntregadas
            }]
        },

        // Configuration options go here
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }

        }
    });
}

//dibuja grafico personas con las dos dosis administrada Madrid
function dibujarGraficoDosisPautaCompletaMadrid(datos) {

    let fechas = [];
    let indiceMadridDesdeElFinal = datos.length;
    //el primer dato de madrid aparece en la posicion 7 empezando desde el final
    indiceMadridDesdeElFinal = indiceMadridDesdeElFinal - 7;
    console.log = ("longitud datos " + indiceMadridDesdeElFinal);
    let i = 0;

    while (i < 7) {

        let formatFecha = datos[indiceMadridDesdeElFinal];
        //la fecha en el array resultante esta en la posicion 0
        fechas.push(formatFecha[0]);
        //en el array de arrays cada dato de madrid esta cada 20 posiciones empezando desde el final
        indiceMadridDesdeElFinal = indiceMadridDesdeElFinal - 20;
        i++;
    }
    //damos la vuelta al array de fechas para que salga en orden cronologico
    fechas = fechas.reverse();

    i = 0;
    let longitudDosisEntregadas = datos.length;
    //el primer dato de madrid aparece en la posicion 7 empezando desde el final
    longitudDosisEntregadas = longitudDosisEntregadas - 7;
    //el array esde personas con pauta completada, aunque en el nombre aparezca 'dosis entregadas'
    let dosisEntregadas = [];

    while (i < 7) {

        let dosis = datos[longitudDosisEntregadas];
        //el dato de personas con pauta completa aparece en la posicion 7 del array resultante
        dosisEntregadas.push(dosis[7]);
        //en el array de arrays cada dato de madrid esta cada 20 posiciones empezando desde el final
        longitudDosisEntregadas = longitudDosisEntregadas - 20;
        i++;
    }
    //damos la vuelta al array de pauta completada para que salga en orden cronologico
    dosisEntregadas.reverse();


    var ctx = document.getElementById('myChartMadridCompletadas').getContext('2d');
    var chart = new Chart(ctx, {
        // The type of chart we want to create
        type: 'line',

        // The data for our dataset
        data: {
            labels: fechas,
            datasets: [{
                label: 'Vacunas pauta completa Madrid',
                backgroundColor: 'rgb(83  , 225, 162)',
                //borderColor: 'rgb(255, 99, 132)',
                borderColor: 'rgb(255, 255, 255)',
                data: dosisEntregadas
            }]
        },

        // Configuration options go here
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }

        }
    });
}

//muestra los datos del texto de Madrid
function muestraDatosVacunaMadrid(dosis) {
    //poblacion total de la comunidad de madrid para calcular los porcentajes
    let poblacionMadrid = 6779888;
    //se formatea el numero para la cifra salga con punto
    let numeroFormateado = new Intl.NumberFormat().format(dosis[13].dosisEntregadas);
    //se calcula el porcentaje de dosis entregadas sobre la poblacion de madrid
    let porcentajeEntregadas = trunc((dosis[13].dosisEntregadas * 100) / poblacionMadrid, 3);
    //se formatea el numero para la cifra salga con punto
    let dosisAdministradas = new Intl.NumberFormat().format(dosis[13].dosisAdministradas);
    //se calcula el porcentaje de dosis administradas sobre la poblacion de madrid
    let porcentPoblacionMadridAdministradas = trunc((dosis[13].dosisAdministradas * 100) / poblacionMadrid, 3);
    //se calcula el porcentaje de adimistradas sobre las entregadas
    let porcentajeAdministradasSobreTotal = (dosis[13].dosisAdministradas * 100) / dosis[13].dosisEntregadas;
    porcentajeAdministradasSobreTotal = trunc(porcentajeAdministradasSobreTotal, 2);

    //se formatea el numero para la cifra salga con punto
    let dosDosis = new Intl.NumberFormat().format(dosis[13].dosisPautaCompletada);
    //porcentaje de dos dosis administradas sobre el total administradas (solo una dosis)
    let porcentajePautaCompletadas = trunc(((dosis[13].dosisPautaCompletada * 100) / dosis[13].dosisAdministradas), 2);
    //porcentaje de gente con la pauta completada sobre la poblacion de madrid
    let porcentajeCompletTotal = trunc(((dosis[13].dosisPautaCompletada * 100) / poblacionMadrid), 2);

    //se recogen los elementos html donde se van a mostrar los datos
    let dosisDistribuidas = document.getElementById("dosisDistribuidas");
    let porcentajeDosisEntregadas = document.getElementById("porcentajeDosisEntregadas");
    let dosisAdministradasTotal = document.getElementById("dosisAdministradas");
    let porcentajeMadridAdministradas = document.getElementById("porcentajePoblacionAdministradas");
    let porcentajeAdministradasTotal = document.getElementById("porcentajeAdministradasTotal");
    let pautaCompleta = document.getElementById("pautaCompleta");
    let porcentajeCompletas = document.getElementById("porcentajeCompletas");
    let porcenSobreTotalCompletas = document.getElementById("porcenSobreTotalCompletas");

    //se muestran los datos
    dosisDistribuidas.innerHTML = numeroFormateado;
    porcentajeDosisEntregadas.innerHTML = porcentajeEntregadas
    dosisAdministradasTotal.innerHTML = dosisAdministradas;
    porcentajeMadridAdministradas.innerHTML = porcentPoblacionMadridAdministradas;
    porcentajeAdministradasTotal.innerHTML = porcentajeAdministradasSobreTotal;
    pautaCompleta.innerHTML = dosDosis
    porcentajeCompletas.innerHTML = porcentajePautaCompletadas;
    porcenSobreTotalCompletas.innerHTML = porcentajeCompletTotal;


}

function muestraDatosVacunaEspaña(dosis) {
    //poblacion total España para calcular los porcentajes
    let poblacionEs = 47329000;
    //se formatea el numero para la cifra salga con punto
    let numeroFormateado = new Intl.NumberFormat().format(dosis[19].dosisEntregadas);
    //se calcula el porcentaje de entregadas sobre la poblacion de España
    let porcentajeEntregadas = trunc((dosis[19].dosisEntregadas * 100) / poblacionEs, 3);
    //se formatea el numero para la cifra salga con punto
    let dosisAdministradas = new Intl.NumberFormat().format(dosis[19].dosisAdministradas);
    //porcentaje dosis administradas sobre la poblacion de España
    let porcentPoblacionMadridAdministradas = trunc((dosis[19].dosisAdministradas * 100) / poblacionEs, 3);
    //porcentaje dosis administradas sobre el total entregadas España
    let porcentajeAdministradasSobreTotal = (dosis[19].dosisAdministradas * 100) / dosis[19].dosisEntregadas;
    porcentajeAdministradasSobreTotal = trunc(porcentajeAdministradasSobreTotal, 2);
    //se formatea el numero para la cifra salga con punto
    let dosDosis = new Intl.NumberFormat().format(dosis[19].dosisPautaCompletada);
    //se calcula el porcentaje de gente con pauta completa sobre las dosis administradas España
    let porcentajePautaCompletadas = trunc(((dosis[19].dosisPautaCompletada * 100) / dosis[19].dosisAdministradas), 2);
    //se calcula el porcentaje de gente con pauta completa sobre la poblacion de España
    let porcentajeCompletTotal = trunc(((dosis[19].dosisPautaCompletada * 100) / poblacionEs), 2);

    //se recogen los elementos html
    let dosisDistribuidas = document.getElementById("dosisDistribuidasEs");
    let porcentajeDosisEntregadas = document.getElementById("porcentajeDosisEntregadasEs");
    let dosisAdministradasTotal = document.getElementById("dosisAdministradasEs");
    let porcentajeMadridAdministradas = document.getElementById("porcentajePoblacionAdministradasEs");
    let porcentajeAdministradasTotal = document.getElementById("porcentajeAdministradasTotalEs");
    let pautaCompleta = document.getElementById("pautaCompletaEs");
    let porcentajeCompletas = document.getElementById("porcentajeCompletasEs");
    let porcenSobreTotalCompletas = document.getElementById("porcenSobreTotalCompletasEs");

    //se muestran los datos
    dosisDistribuidas.innerHTML = numeroFormateado;
    porcentajeDosisEntregadas.innerHTML = porcentajeEntregadas
    dosisAdministradasTotal.innerHTML = dosisAdministradas;
    porcentajeMadridAdministradas.innerHTML = porcentPoblacionMadridAdministradas;
    porcentajeAdministradasTotal.innerHTML = porcentajeAdministradasSobreTotal;
    pautaCompleta.innerHTML = dosDosis
    porcentajeCompletas.innerHTML = porcentajePautaCompletadas;
    porcenSobreTotalCompletas.innerHTML = porcentajeCompletTotal;


}

//funcion sacada de stackoverflow que trunca un numero con decimales para que saque solamente los 2 primeros decimales
function trunc(x, posiciones = 0) {
    var s = x.toString()
    var l = s.length
    var decimalLength = s.indexOf('.') + 1
    var numStr = s.substr(0, decimalLength + posiciones)
    return Number(numStr)
}


//NO SE USA
//version con XMLHttpRequest para obtener los datos del json de covid-vacunas.app
//ha sido sustituida por fetch en parseaJSONVacunas()

/*function recibirJSONVacunas() {
    if (xhr.readyState == 4) {
        console.log("respuesta rx");
        switch (xhr.status) {
            case 200:
                console.log("respuesta OK");
                let csv_raw = xhr.responseText;
                console.log("csv = " + csv_raw);
                let dosisDistribuidas = JSON.parse(csv_raw);
                //dosisDistribuidas.innerHTML = data[13].dosisEntregadas;
                let arrayCSV = CSVToArray2(csv_raw);
                //console.log("array csv = " + arrayCSV);
                console.log("JSON dosisDistribuidas= " + dosisDistribuidas);


                if (dosisDistribuidas.resultCount === null) {
                    window.alert("NO HAY DATOS DE VACUNACIÓN");
                    console.log("NO HAY DATOS DE VACUNACIÓN");
                } else {

                    console.log(dosisDistribuidas);
                    //muestraDatosVacunas(dosisDistribuidas);
                    muestraDatosVacunaMadrid(dosisDistribuidas);
                    muestraDatosVacunaEspaña(dosisDistribuidas);
                }
                break;
            case 400:
                console.log("COd respuesta " + xhr.status);
                console.log("respuesta INCORRECTA");
                window.alert("respuesta INCORRECTA");

                break;
            case 204:
                console.log("COd respuesta " + xhr.status);
                console.log("NO EXISTEN PAGINA CSV DE VACUNACION");
                window.alert("NO EXISTE PAGINA CSV DE VACUNACION");
                break;
            case 500:
                console.log("COd respuesta " + xhr.status);
                console.log("ERROR DEL SERVIDOR");
                window.alert("ERROR DEL SERVIDOR");
                break;
            default:
                console.log("Cod respuesta " + xhr.status);
        }
    }
}*/
