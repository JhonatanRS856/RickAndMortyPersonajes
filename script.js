const spanPaginaActual = document.getElementById('paginaActual');
const spanPaginasTotales = document.getElementById('paginaTotales');

const containerCard = document.querySelector('.containerPelis');
const nextPage = document.getElementById('nextPage');
const prevPage = document.getElementById('prevPage');
const spinner = document.getElementById('spinner');
const modal = document.getElementById('modal');
const containerModal = document.querySelector('.containerModal');
const containerError = document.querySelector('.containerError');
const btnCloseModal = document.getElementById('cerrarModal');
const inputSearch = document.getElementById('inputSearch');

let currentPage = 1;
let totalPages = 1;
let pageSave;


const alive = (status) => {
    switch (status) {
        case "Dead":
            return '#cb3232';
        break;
        case "Alive":
            return '#6ce354';
        break;
        default:
            return '#8a8a8a';
        break;
    }
};

function crearCard({id,name, status, image, species}){

    const card = document.createElement('div');
    card.className = 'box-pelicula';
    card.id = id;

    card.innerHTML = `
        <figure>
            <span class="material-icons-sharp">
                image
            </span>
            <img src="${image}" alt="${name} Imagen">
        </figure>
        <div class="data-peli">
            <h3>${name}</h3>
            <div class="state">
                <div class="circle" style="--state: ${alive(status)}"></div>
                <p>${status} - ${species}</p>
            </div>
        </div>
        <button class="masInfo">
            + Info
        </button>
    `;

    const btn = card.querySelector('.masInfo');

    //Funcion de click al boton de la card, para mostrar informacion extra del personaje en concreto usando el id que se le pasa a esta funcion de crear card

    btn.addEventListener('click', async () => {
        const infoPersonaje = await obtenerPersonaje(id);
        abrirModal(infoPersonaje);
    });

    containerCard.append(card);
}

//Funcion principal para obtener todos los datos de los personajes de la api


async function obtenerData(searchName = '') {
    //A la url le paso dos parametros o filtros uno es la pagina y otro el nombre en caso de que se esté usando el input para buscar
    //Por defecto el parametro searchName es vacio, si no se le pasa nada , me trae todos los personajes
    const urlAPI = `https://rickandmortyapi.com/api/character/?page=${currentPage}&name=${searchName}`;
    
    spinner.style.display = "block";
    containerCard.classList.add('oculto');
    containerError.style.display = "none";

    try {
        const response = await fetch(urlAPI);
        const {info, results} = await response.json();

        //Limpio el contenedor para genrar las nuevas tarjetas siempre
        containerCard.innerHTML = '';

        //Una validacion por si results que debe ser el array con la info de todos los personajes
        //Si esta vacia se sale de la funcion y ademas muestro un div que muestra un mensaje que no se encontro nada
        if (!results || results.length === 0) {
            // Mostrar un mensaje al usuario indicando que no se encontraron resultados
            spinner.style.display = "none";
            containerError.style.display = "flex";
            return;
        }

        //Si se pasa la validacion por cada objeto ejecuto la funcion de crear una card(por cada personaje)
       
        results.forEach(character => {
            crearCard(character);
        });
        

        //La peticion a la api no solo me trae la info de los personajes , tambien la cantidad de paginas que hay ya que solo muestra 20 personajes por pagina
        //Asi que voy actualizando el numero de paginas totales porque necesito ese valor, actualizo una variable y la interfaz
        spanPaginasTotales.textContent = `Paginas Totales : ${info.pages}`;
        totalPages = info.pages;


        //Para que se oculte el spinner cuando ya se trajo toda la info
        spinner.style.display = "none";
        containerCard.classList.remove('oculto');
    } catch (error) {
        console.log(error);
    }
}


obtenerData();

//Funcion para cambiar de pagina


function cambiarPagina (type){
    //Un switch para evaluar los dos casos del parametro, para ver si quiere pasar a la siguiente pagina o anterior

    switch (type) {
        case 'Siguiente':
          if (currentPage < totalPages) {
            currentPage++;
          }
        break;
        case 'Anterior':
          if (currentPage > 1) {
            currentPage--;
          }
        break;
    }

    //Obtengo el valor del input si es que tiene y se lo paso al obtenerData
    //Actualizo la interfaz luego con la pagina actual

    const value = inputSearch.value.toLowerCase();

    obtenerData(value);
    spanPaginaActual.textContent = `Pagina Actual : ${currentPage}`;
}

//Esta funcion de obtenerPersonaje es una peticion para obtener la info de un solo personaje por medio del id que se pasar como parametro

async function obtenerPersonaje(id) {
    //Establesco la url de la peticion con el parametro de la id que me devolvera un personaje en especifico
    const urlAPI = `https://rickandmortyapi.com/api/character/${id}`;

    try {
        const res = await fetch(urlAPI);
        const data = await res.json();

        //Con la informacion , luego le paso el objeto un funcion que me retorna un string o en este caso en un template que usare para pasarselo a un contenedor para que se actualize su informacion

        const template = templateModal(data);
       
        return template;
    } catch (error) {
        console.log(error.message);
    }
}

//Funcion para abrir el modal agregando una clase a un contenedor para que se muestre

function abrirModal(template){
    modal.classList.add('show');

    containerModal.innerHTML = template;
}

//El template que va a tener el modal con la informacion adecuada de cada personaje

function templateModal({id,name, status, image, gender,species, origin, location}){
    return `
        <figure>
            <img src="${image}" alt="${name} Imagen">
        </figure>
        <div class="info-character">
            <header>
                <h1>${name}</h1>
                <div class="state">
                    <div class="circle" style="--state: ${alive(status)}"></div>
                    <p>${status} - ${species}</p>
                </div>
            </header>
            <div class="bodyCard">
                <div class="row">
                    <h4>ID</h4>
                    <span>${id}</span>
                </div>
                <div class="row">
                    <h4>Gender</h4>
                    <span>${gender}</span>
                </div>
                <div class="row">
                    <h4>Origin</h4>
                    <span>${origin.name}</span>
                </div>
                <div class="row">
                    <h4>Location</h4>
                    <span>${location.name}</span>
                    </div>
            </div>
        </div>
    `;
}

//Funcion debounce para limitar las peticiones a la API
//El primer parametro es la funcion que se va a ejecutar y el segundo parametro es el tiempo de espera para que se ejecute
//Lo voy a utilizar para funcion de busqueda de un personaje por medio del input


function debounce(func, wait = 1000) {
    let timeout;
  
    return function executedFunction(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Agui le paso mi funcion de buscar y el tiempo que se tiene que esperar en este caso 500ms

const debouncedSearch = debounce(searchCharacters, 500);

function searchCharacters() {
    //Tomo el valor del input de busqueda

    const value = inputSearch.value.toLowerCase();

    //En un bloque de tryCatch para el manejo de errores
    try {
        //Cada que se realize una busqueda que la pagina actual tiene que ser uno asi que se lo asigno a la variable y lo muestro en la interfaz
        
        currentPage = 1;
        spanPaginaActual.textContent = `Pagina Actual : ${currentPage}`;

        //Ejecuto la funcion de obtenerData
        obtenerData(value);
    } catch (error) {
        console.error("Error al realizar la búsqueda:", error);
    }
    
}

//Asignacion de algunos eventos

inputSearch.addEventListener('input', ()=> {
    debouncedSearch();
})

nextPage.addEventListener('click', ()=>{
    cambiarPagina('Siguiente');
})

prevPage.addEventListener('click', ()=>{
    cambiarPagina('Anterior');
})

btnCloseModal.addEventListener('click', () => {
    modal.classList.remove('show');
})