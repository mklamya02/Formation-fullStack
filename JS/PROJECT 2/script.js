    // l'objet qui contient l'etat initial du calculatrice
    const state = {
        current: '0',      
        previous: null,    
        operator: null,  
        overwrite: false    
    };

    //recuperation des élements avec leurs id pour faciliter la manipulation
    const displayEl = document.getElementById('display');
    const keysEl = document.getElementById('keys');
    const historyEl = document.getElementById('history-list');
    const wrapper = document.getElementById('wrapper');

    
    // attachement de 2 listeners sur le wrapper
    //gerer les clics par le wrapper sans necessite de l'ajout d'un listener à chaque boutton
    wrapper.addEventListener('click', function(e) {
        console.log('capture wrapper');
    }, { capture: true });

    
    wrapper.addEventListener('click', function(e) {
        console.log('bubble wrapper');
    });

    
    
    //delegation d'evenement
    keysEl.addEventListener('click', function(e) {
        console.log('keys clicked');
        
        // le closest button parent de target cliqué
        const button = e.target.closest('button');
        if (!button) return;

        
        if (button.dataset.type === 'op') {
            e.stopPropagation();
            console.log('Propagation stoppée');
        }

        handleClick(button);
    });

    //decision de quoi faire en fonction de type de boutton choisi
    function handleClick(button) {
        const type = button.dataset.type;
        const value = button.dataset.value;
        
        if (type === 'digit') {
            inputDigit(value);
        } else if (type === 'op') {
            chooseOperator(value);
        } else if (type === 'eq') {
            evaluate();
        } else if (type === 'cmd') {
            handleCommand(value);
        }
        
        updateDisplay();
    }

    //rempalcemet ou ajout d'un chiffre 
    function inputDigit(digit) {
        if (state.overwrite || state.current === '0') {
            state.current = digit;
            state.overwrite = false;
        } else {
            if (state.current.length < 12) {
                state.current = state.current + digit;
            }
        }
    }

    //gestion de virgule decimale
    function inputDecimal() {
        if (state.overwrite) {
            state.current = '0.';
            state.overwrite = false;
        } else if (state.current.indexOf('.') === -1) {
            state.current = state.current + '.';
        }
    }

    //gestion du choix
    function chooseOperator(nextOperator) {
        if (state.previous !== null && state.operator && !state.overwrite) {
            const result = calculate(
                parseFloat(state.previous), 
                parseFloat(state.current), 
                state.operator
            );
            
            if (result === 'Error') {
                state.current = 'Error';
                state.previous = null;
                state.operator = null;
                return;
            }
            
            state.current = result.toString();
        }
        
    
        state.previous = state.current;
        state.operator = nextOperator;
        state.overwrite = true;
    }

    function evaluate() {
        if (state.previous !== null && state.operator && !state.overwrite) {
            const prev = parseFloat(state.previous);
            const curr = parseFloat(state.current);
            const result = calculate(prev, curr, state.operator);
            
            if (result === 'Error') {
                state.current = 'Error';
            } else {
                const expression = state.previous + ' ' + state.operator + ' ' + state.current + ' = ' + result;
                addToHistory(expression);
                
                state.current = result.toString();
            }
            
            
            state.previous = null;
            state.operator = null;
            state.overwrite = true;
        }
    }

    
    function calculate(a, b, operator) {
        let result;
        
        if (operator === '+') {
            result = a + b;
        } else if (operator === '−') {
            result = a - b;
        } else if (operator === '×') {
            result = a * b;
        } else if (operator === '÷') {
            if (b === 0) {
                return 'Error'; 
            }
            result = a / b;
        }
        
        return formatNumber(result);
    }

    function formatNumber(num) {
            
            let result = parseFloat(num.toFixed(10));
            
            let str = result.toString();
            if (str.length > 12) {
                
                str = result.toExponential(6);
            }
            
            return parseFloat(str);
        }

    //gestion de commandes speciales
    function handleCommand(cmd) {
        if (cmd === 'AC') {
            state.current = '0';
            state.previous = null;
            state.operator = null;
            state.overwrite = false;
            
        } else if (cmd === 'CE') {
            state.current = '0';
            state.overwrite = false;
            
        } else if (cmd === 'neg') {
            if (state.current !== '0' && state.current !== 'Error') {
                if (state.current.charAt(0) === '-') {
                    state.current = state.current.substring(1);
                } else {
                    state.current = '-' + state.current;
                }
            }
            
        } else if (cmd === 'pct') {
            if (state.current !== 'Error') {
                const value = parseFloat(state.current) / 100;
                state.current = value.toString();
            }
        }
    }

    //l'ajout d'un listener
    document.addEventListener('keydown', handleKeydown);
    //gestion de keyboard
    function handleKeydown(e) {
        const key = e.key;
        
        if (key >= '0' && key <= '9') {
            inputDigit(key);
            updateDisplay();
            
        } else if (key === '.') {
            inputDecimal();
            updateDisplay();
            
        } else if (key === '+') {
            chooseOperator('+');
            updateDisplay();

        } else if (key === '-') {
            chooseOperator('−');
            updateDisplay();

        } else if (key === '*') {
            chooseOperator('×');
            updateDisplay();

        } else if (key === '/') {
            chooseOperator('÷');
            updateDisplay();
            
        } else if (key === 'Enter' || key === '=') {
            evaluate();
            updateDisplay();
            
        } else if (key === 'Backspace') {
            handleCommand('CE');
            updateDisplay();
        } else if (key === 'Escape') {
            handleCommand('AC');
            updateDisplay();
        }
    }


    //l'historique
    let history = [];

    function addToHistory(expression) {
        history.unshift(expression);
        
       
        if (history.length > 5) {
            history.pop();
        }
        
        updateHistory();
    }

    function updateHistory() {
        
        historyEl.innerHTML = '';
        
        if (history.length === 0) {
            const li = document.createElement('li');
            historyEl.appendChild(li);
        } else {
            
            for (let i = 0; i < history.length; i++) {
                const li = document.createElement('li');
                li.textContent = history[i];
                historyEl.appendChild(li);
            }
        }
    }

    //mis à jour la valeur de display 
    function updateDisplay() {
        displayEl.textContent = state.current;
    }


    updateDisplay();
    updateHistory();

    