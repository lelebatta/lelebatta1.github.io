script.js
// Le librerie per il PDF sono incluse nel file HTML
const { jsPDF } = window.jspdf;

document.addEventListener('DOMContentLoaded', () => {

    // Funzioni di utilità per caricare e salvare i dati in localStorage
    const loadData = (key) => {
        const data = localStorage.getItem(key);
        try {
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error("Errore nel parsing dei dati dal localStorage per la chiave:", key, e);
            return [];
        }
    };

    const saveData = (key, data) => {
        localStorage.setItem(key, JSON.stringify(data));
    };

    // Funzioni di autenticazione
    const checkAuth = () => {
        const loggedIn = localStorage.getItem('isLoggedIn');
        const isLoginPage = window.location.pathname.endsWith('login.html');
    
        if (isLoginPage) {
            if (loggedIn) {
                window.location.href = 'index.html';
            }
        } else {
            if (!loggedIn) {
                window.location.href = 'login.html';
            }
        }
    };

    const handleLogin = (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorMsg = document.getElementById('login-error-msg');

        if (username === 'lelebatta' && password === 'Portiere1!') {
            localStorage.setItem('isLoggedIn', 'true');
            window.location.href = 'index.html';
        } else {
            errorMsg.style.display = 'block';
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('isLoggedIn');
        window.location.href = 'login.html';
    };

    // Assegna la logica di login al form e gestisce il logout
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    const logoutBtns = document.querySelectorAll('#logout-btn');
    if (logoutBtns) {
        logoutBtns.forEach(btn => btn.addEventListener('click', handleLogout));
    }

    // Esegue il controllo di autenticazione su ogni pagina
    checkAuth();

    // --- LOGICA PER LA GESTIONE DEI PORTIERI (CON MODIFICA) ---
    const portieriPage = document.querySelector('.portieri-page');
    if (portieriPage) {
        let portieri = loadData('portieri');
        const listaPortieri = document.getElementById('lista-portieri');
        const formGestionePortiere = document.getElementById('form-gestione-portiere');
        const portiereIdInput = document.getElementById('portiere-id');
        const btnSalvaPortiere = document.getElementById('btn-salva-portiere');
        const inputFoto = document.getElementById('foto-portiere');
        const anteprimaFotoDiv = document.getElementById('anteprima-foto');

        let fotoBase64 = null;

        inputFoto.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    fotoBase64 = e.target.result;
                    anteprimaFotoDiv.innerHTML = `<img src="${fotoBase64}" alt="Anteprima">`;
                };
                reader.readAsDataURL(file);
            } else {
                fotoBase64 = null;
                anteprimaFotoDiv.innerHTML = `<span>Nessuna immagine selezionata</span>`;
            }
        });

        const renderPortieri = () => {
            listaPortieri.innerHTML = '';
            if (portieri.length === 0) {
                listaPortieri.innerHTML = '<li>Nessun portiere aggiunto.</li>';
                return;
            }
            portieri.forEach(portiere => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <div class="portiere-info-wrapper">
                        ${portiere.foto ? `<img src="${portiere.foto}" alt="${portiere.nome}" class="portiere-list-item-img">` : ''}
                        <div class="portiere-details">
                            <strong>${portiere.nome} ${portiere.cognome}</strong><br>
                            <span>${portiere.squadra}</span>
                        </div>
                    </div>
                    <div class="actions">
                        <button class="btn-modifica" data-id="${portiere.id}">Modifica</button>
                        <button class="btn-elimina" data-id="${portiere.id}">Elimina</button>
                    </div>
                `;
                listaPortieri.appendChild(li);
            });
        };

        formGestionePortiere.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = portiereIdInput.value;
            const nuovoPortiere = {
                nome: document.getElementById('nome').value,
                cognome: document.getElementById('cognome').value,
                dataNascita: document.getElementById('data-nascita').value,
                squadra: document.getElementById('squadra').value,
                foto: fotoBase64
            };

            if (id) {
                portieri = portieri.map(p => p.id == id ? { ...p, ...nuovoPortiere, id: parseInt(id) } : p);
            } else {
                nuovoPortiere.id = Date.now();
                portieri.push(nuovoPortiere);
            }
            saveData('portieri', portieri);
            renderPortieri();
            formGestionePortiere.reset();
            portiereIdInput.value = '';
            btnSalvaPortiere.textContent = 'Aggiungi';
            fotoBase64 = null;
            anteprimaFotoDiv.innerHTML = `<span>Nessuna immagine selezionata</span>`;
        });

        listaPortieri.addEventListener('click', (e) => {
            const target = e.target;
            const id = parseInt(target.dataset.id);

            if (target.classList.contains('btn-elimina')) {
                if (confirm("Sei sicuro di voler eliminare questo portiere?")) {
                    portieri = portieri.filter(p => p.id !== id);
                    saveData('portieri', portieri);
                    renderPortieri();
                }
            } else if (target.classList.contains('btn-modifica')) {
                const portiereDaModificare = portieri.find(p => p.id === id);
                if (portiereDaModificare) {
                    portiereIdInput.value = portiereDaModificare.id;
                    document.getElementById('nome').value = portiereDaModificare.nome;
                    document.getElementById('cognome').value = portiereDaModificare.cognome;
                    document.getElementById('data-nascita').value = portiereDaModificare.dataNascita;
                    document.getElementById('squadra').value = portiereDaModificare.squadra;
                    btnSalvaPortiere.textContent = 'Modifica';
                    if (portiereDaModificare.foto) {
                        anteprimaFotoDiv.innerHTML = `<img src="${portiereDaModificare.foto}" alt="Anteprima">`;
                        fotoBase64 = portiereDaModificare.foto;
                    } else {
                        anteprimaFotoDiv.innerHTML = `<span>Nessuna immagine selezionata</span>`;
                        fotoBase64 = null;
                    }
                }
            }
        });

        renderPortieri();
    }

    // --- LOGICA PER LA GESTIONE DEGLI ESERCIZI (CON MODIFICA) ---
    const eserciziPage = document.querySelector('.esercizi-page');
    if (eserciziPage) {
        let esercizi = loadData('esercizi');
        const listaEsercizi = document.getElementById('lista-esercizi');
        const formGestioneEsercizio = document.getElementById('form-gestione-esercizio');
        const esercizioIdInput = document.getElementById('esercizio-id');
        const btnSalvaEsercizio = document.getElementById('btn-salva-esercizio');

        const renderEsercizi = () => {
            listaEsercizi.innerHTML = '';
            if (esercizi.length === 0) {
                listaEsercizi.innerHTML = '<li>Nessun esercizio aggiunto.</li>';
                return;
            }
            esercizi.forEach(esercizio => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <div class="esercizio-info">
                        <strong>${esercizio.titolo}</strong><br>
                        <span>Categoria: ${esercizio.categoria}</span>
                    </div>
                    <div class="actions">
                        <button class="btn-modifica" data-id="${esercizio.id}">Modifica</button>
                        <button class="btn-elimina" data-id="${esercizio.id}">Elimina</button>
                    </div>
                `;
                listaEsercizi.appendChild(li);
            });
        };

        formGestioneEsercizio.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = esercizioIdInput.value;
            const nuovoEsercizio = {
                titolo: document.getElementById('titolo-esercizio').value,
                categoria: document.getElementById('categoria-esercizio').value,
                commento: document.getElementById('commento-esercizio').value,
            };

            if (id) {
                esercizi = esercizi.map(ex => ex.id == id ? { ...ex, ...nuovoEsercizio, id: parseInt(id) } : ex);
            } else {
                nuovoEsercizio.id = Date.now();
                esercizi.push(nuovoEsercizio);
            }
            saveData('esercizi', esercizi);
            renderEsercizi();
            formGestioneEsercizio.reset();
            esercizioIdInput.value = '';
            btnSalvaEsercizio.textContent = 'Aggiungi';
        });

        listaEsercizi.addEventListener('click', (e) => {
            const target = e.target;
            const id = parseInt(target.dataset.id);

            if (target.classList.contains('btn-elimina')) {
                if (confirm("Sei sicuro di voler eliminare questo esercizio?")) {
                    esercizi = esercizi.filter(ex => ex.id !== id);
                    saveData('esercizi', esercizi);
                    renderEsercizi();
                }
            } else if (target.classList.contains('btn-modifica')) {
                const esercizioDaModificare = esercizi.find(ex => ex.id === id);
                if (esercizioDaModificare) {
                    esercizioIdInput.value = esercizioDaModificare.id;
                    document.getElementById('titolo-esercizio').value = esercizioDaModificare.titolo;
                    document.getElementById('categoria-esercizio').value = esercizioDaModificare.categoria;
                    document.getElementById('commento-esercizio').value = esercizioDaModificare.commento;
                    btnSalvaEsercizio.textContent = 'Modifica';
                }
            }
        });

        renderEsercizi();
    }
    
    // --- LOGICA PER LA GESTIONE DEGLI ALLENAMENTI (CON MODALE) ---
    const allenamentiPage = document.querySelector('.allenamenti-page');
    if (allenamentiPage) {
        let allenamenti = loadData('allenamenti');
        const portieri = loadData('portieri');
        const esercizi = loadData('esercizi');

        const formNuovoAllenamento = document.getElementById('form-nuovo-allenamento');
        const listaPortieriCheckboxes = document.getElementById('lista-portieri-checkboxes');
        const btnAggiungiEsercizio = document.getElementById('btn-aggiungi-esercizio');
        const listaEserciziSelezionati = document.getElementById('lista-esercizi-selezionati');
        const listaAllenamenti = document.getElementById('lista-allenamenti');

        const modaleEsercizi = document.getElementById('modale-esercizi');
        const listaEserciziModale = document.getElementById('lista-esercizi-modale');
        const chiudiModaleBtn = document.querySelector('.chiudi-modale');
        const msgModaleNessunEsercizio = document.getElementById('msg-modale-nessun-esercizio');

        let eserciziPerAllenamento = [];

        const renderPortieriCheckboxes = () => {
            if (portieri.length === 0) {
                listaPortieriCheckboxes.innerHTML = '<p>Nessun portiere aggiunto. Torna alla sezione "Gestione Portieri".</p>';
                return;
            }
            listaPortieriCheckboxes.innerHTML = '';
            portieri.forEach(p => {
                const label = document.createElement('label');
                label.innerHTML = `<input type="checkbox" name="portieri" value="${p.id}"> ${p.nome} ${p.cognome}`;
                listaPortieriCheckboxes.appendChild(label);
            });
        };

        btnAggiungiEsercizio.addEventListener('click', () => {
            if (esercizi.length === 0) {
                msgModaleNessunEsercizio.style.display = 'block';
                listaEserciziModale.innerHTML = '';
            } else {
                msgModaleNessunEsercizio.style.display = 'none';
                renderListaEserciziModale();
            }
            modaleEsercizi.style.display = 'block';
        });

        chiudiModaleBtn.addEventListener('click', () => {
            modaleEsercizi.style.display = 'none';
        });

        window.addEventListener('click', (event) => {
            if (event.target === modaleEsercizi) {
                modaleEsercizi.style.display = 'none';
            }
        });

        const renderListaEserciziModale = () => {
            listaEserciziModale.innerHTML = '';
            esercizi.forEach(ex => {
                const li = document.createElement('li');
                li.classList.add('lista-esercizi-modale-item');
                li.dataset.id = ex.id;
                li.innerHTML = `<strong>${ex.titolo}</strong> (${ex.categoria})`;
                listaEserciziModale.appendChild(li);
            });
        };
        
        listaEserciziModale.addEventListener('click', (e) => {
            const li = e.target.closest('li');
            if (li) {
                const id = parseInt(li.dataset.id);
                const esercizioSelezionato = esercizi.find(ex => ex.id === id);
                
                const esercizioEsiste = eserciziPerAllenamento.some(ex => ex.id === id);
                if (esercizioEsiste) {
                    alert('Questo esercizio è già stato aggiunto!');
                    return;
                }
                
                const div = document.createElement('div');
                div.classList.add('allenamento-esercizio-item');
                div.dataset.id = id;
                div.innerHTML = `
                    <span>${esercizioSelezionato.titolo} (${esercizioSelezionato.categoria})</span>
                    <label>Minuti: <input type="number" min="1" value="10" class="minutaggio-input"></label>
                    <button class="btn-rimuovi-esercizio">&times;</button>
                `;
                listaEserciziSelezionati.appendChild(div);
                eserciziPerAllenamento.push({
                    id: id,
                    titolo: esercizioSelezionato.titolo,
                    categoria: esercizioSelezionato.categoria,
                    minutaggio: 10
                });
                modaleEsercizi.style.display = 'none';
            }
        });

        listaEserciziSelezionati.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-rimuovi-esercizio')) {
                const itemDiv = e.target.closest('.allenamento-esercizio-item');
                const idDaRimuovere = parseInt(itemDiv.dataset.id);
                eserciziPerAllenamento = eserciziPerAllenamento.filter(ex => ex.id !== idDaRimuovere);
                itemDiv.remove();
            }
        });

        formNuovoAllenamento.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const portieriSelezionati = Array.from(document.querySelectorAll('input[name="portieri"]:checked'))
                                            .map(cb => {
                                                const portiere = portieri.find(p => p.id == cb.value);
                                                return { id: portiere.id, nome: portiere.nome };
                                            });

            if (portieriSelezionati.length === 0 || eserciziPerAllenamento.length === 0) {
                alert('Seleziona almeno un portiere e un esercizio!');
                return;
            }

            const eserciziFinali = eserciziPerAllenamento.map(ex => {
                const input = listaEserciziSelezionati.querySelector(`.allenamento-esercizio-item[data-id="${ex.id}"] .minutaggio-input`);
                return { ...ex, minutaggio: parseInt(input.value) || 0 };
            });

            const nuovoAllenamento = {
                id: Date.now(),
                data: document.getElementById('data-allenamento').value,
                portieri: portieriSelezionati,
                esercizi: eserciziFinali
            };

            allenamenti.push(nuovoAllenamento);
            saveData('allenamenti', allenamenti);
            renderAllenamenti();
            formNuovoAllenamento.reset();
            listaEserciziSelezionati.innerHTML = '';
            eserciziPerAllenamento = [];
        });

        const renderAllenamenti = () => {
            listaAllenamenti.innerHTML = '';
            if (allenamenti.length === 0) {
                listaAllenamenti.innerHTML = '<li>Nessun allenamento salvato.</li>';
                return;
            }
            allenamenti.forEach(a => {
                const li = document.createElement('li');
                li.classList.add('lista-allenamenti-item');
                const portieriNomi = a.portieri.map(p => p.nome).join(', ');
                const eserciziDettagli = a.esercizi.map(ex => `<li>${ex.titolo} (${ex.minutaggio} min)</li>`).join('');

                li.innerHTML = `
                    <h3>Allenamento del ${a.data}</h3>
                    <p><strong>Portieri:</strong> ${portieriNomi}</p>
                    <p><strong>Esercizi:</strong></p>
                    <ul>${eserciziDettagli}</ul>
                    <div class="actions">
                        <button class="btn-elimina" data-id="${a.id}">Elimina</button>
                    </div>
                `;
                listaAllenamenti.appendChild(li);
            });
        };

        listaAllenamenti.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-elimina')) {
                const idDaEliminare = parseInt(e.target.dataset.id);
                if (confirm("Sei sicuro di voler eliminare questo allenamento?")) {
                    allenamenti = allenamenti.filter(a => a.id !== idDaEliminare);
                    saveData('allenamenti', allenamenti);
                    renderAllenamenti();
                }
            }
        });

        // Chiamate iniziali per la pagina Allenamenti
        if (document.getElementById('lista-portieri-checkboxes')) {
            renderPortieriCheckboxes();
        }
        if (document.getElementById('lista-allenamenti')) {
            renderAllenamenti();
        }
    }

    // --- LOGICA PER LA GESTIONE DEI REPORT (CON PDF) ---
    const reportPage = document.querySelector('.report-page');
    if (reportPage) {
        const portieri = loadData('portieri');
        const allenamenti = loadData('allenamenti');
        const formReport = document.getElementById('form-report');
        const selectPortiere = document.getElementById('select-portiere');
        const reportDisplay = document.getElementById('report-display');

        let myChart = null;

        const renderPortieriSelect = () => {
            if (portieri.length === 0) {
                selectPortiere.innerHTML = '<option value="">Nessun portiere</option>';
                return;
            }
            selectPortiere.innerHTML = '<option value="" disabled selected>Seleziona un portiere</option>';
            portieri.forEach(p => {
                const option = document.createElement('option');
                option.value = p.id;
                option.textContent = `${p.nome} ${p.cognome}`;
                selectPortiere.appendChild(option);
            });
        };

        formReport.addEventListener('submit', (e) => {
            e.preventDefault();
            const portiereId = parseInt(selectPortiere.value);
            const dataInizio = document.getElementById('data-inizio').value;
            const dataFine = document.getElementById('data-fine').value;

            const portiereSelezionato = portieri.find(p => p.id === portiereId);
            if (!portiereSelezionato) {
                alert("Seleziona un portiere valido.");
                return;
            }

            const allenamentiFiltrati = allenamenti.filter(a => {
                const dataAllenamento = new Date(a.data + 'T00:00:00');
                const inizio = new Date(dataInizio + 'T00:00:00');
                const fine = new Date(dataFine + 'T00:00:00');
                const haPartecipato = a.portieri.some(p => p.id === portiereId);
                return haPartecipato && dataAllenamento >= inizio && dataAllenamento <= fine;
            });

            const statistichePerCategoria = {};
            allenamentiFiltrati.forEach(a => {
                a.esercizi.forEach(ex => {
                    if (!statistichePerCategoria[ex.categoria]) {
                        statistichePerCategoria[ex.categoria] = 0;
                    }
                    statistichePerCategoria[ex.categoria] += ex.minutaggio;
                });
            });

            renderReport(portiereSelezionato, allenamentiFiltrati, statistichePerCategoria, dataInizio, dataFine);
        });

        const renderReport = (portiere, allenamenti, statistiche, inizio, fine) => {
            const numeroAllenamenti = allenamenti.length;
            const categorie = Object.keys(statistiche);
            const minuti = Object.values(statistiche);
            const totaliMinuti = minuti.reduce((acc, curr) => acc + curr, 0);

            reportDisplay.innerHTML = `
                <div class="report-content-pdf">
                    <div class="report-header">
                        <img src="assets/images/logo-squadra.png" alt="Logo Squadra" class="report-logo">
                        <div class="report-info">
                            <h3>${portiere.nome} ${portiere.cognome}</h3>
                            <p>${portiere.squadra}</p>
                        </div>
                        ${portiere.foto ? `<img src="${portiere.foto}" alt="${portiere.nome}" class="report-photo">` : ''}
                    </div>

                    <div class="report-body">
                        <h4>Periodo: ${inizio} - ${fine}</h4>
                        <p>Numero allenamenti: <strong>${numeroAllenamenti}</strong></p>
                        <p>Minuti totali di lavoro: <strong>${totaliMinuti}</strong></p>
                        <div class="chart-container">
                            <canvas id="grafico-report"></canvas>
                        </div>
                    </div>
                </div>
                <button class="btn-stampa" id="btn-stampa-report">Stampa Report (PDF)</button>
            `;

            if (myChart) {
                myChart.destroy();
            }

            const ctx = document.getElementById('grafico-report').getContext('2d');
            myChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: categorie,
                    datasets: [{
                        data: minuti,
                        backgroundColor: ['#0d6efd', '#dc3545', '#ffc107', '#20c997', '#6f42c4'],
                        hoverOffset: 4
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: true,
                            text: 'Suddivisione minutaggio per categoria'
                        }
                    }
                }
            });

            document.getElementById('btn-stampa-report').addEventListener('click', () => {
                const reportElement = document.querySelector('.report-content-pdf');
                html2canvas(reportElement).then(canvas => {
                    const imgData = canvas.toDataURL('image/png');
                    const pdf = new jsPDF('p', 'mm', 'a4');
                    const imgProps = pdf.getImageProperties(imgData);
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
                    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                    pdf.save(`Report_${portiere.cognome}_${inizio}-${fine}.pdf`);
                });
            });
        };

        renderPortieriSelect();
    }
});