window.onload = () => {
  const ResultStatuses = {
    profit: 'profit',
    loss: 'loss'
  }
  let maxLoss = 0;
  let lossesMap = {};
  const initialAmountInput = document.querySelector('#initialAmount');
  const tradesTableBodyElement = document.querySelector('#trades-table-body');
  const maxLossElement = document.getElementById('maxLoss');
  const maxLossElement2 = document.getElementById('maxLoss2');
  let tradesResults = [];
  let riskPercents = [2];
  let rateOfReturnPercents = [80];
  let sessions = []
  let currentSession = localStorage.getItem('currentSession') || ''
  const sessionDropdown = document.getElementById('session-dropdown');
  const addSessionButton = document.getElementById('addSessionButton')
  addSessionButton.addEventListener('click', addSession)

  function addSession() {
    const sessionNameInput = document.getElementById('sessionName')
    if (!sessionNameInput.value) {
      return
    }
    if (sessions.indexOf(sessionNameInput.value) > -1) {
      return;
    }
    const optionElement = document.createElement('option')
    optionElement.value = optionElement.textContent = sessionNameInput.value
    sessionDropdown.appendChild(optionElement)
    sessions.push(sessionNameInput.value)
    localStorage.setItem('sessions', JSON.stringify(sessions))
  }

  function handleSessionChange (event) {
    currentSession = event.target.value
    initialAmountInput.value = 10000;
    tradesResults = [];
    riskPercents = [2];
    rateOfReturnPercents = [80];
    initTable()
  }

  sessionDropdown.addEventListener('change', handleSessionChange)

  if (sessions = localStorage.getItem('sessions')) {
    sessions = JSON.parse(sessions);
    if (sessions.length) {
      sessions.forEach(session => {
        const optionElement = document.createElement('option')
        optionElement.value = optionElement.textContent = session
        sessionDropdown.appendChild(optionElement)
      })
    }
  } else {
    sessions = []
  }

  function getCurrentBalance(tradeNumber) {
    return tradeNumber === 1 ?
      parseFloat(initialAmountInput.value) :
      parseFloat(tradesTableBodyElement.children[tradeNumber - 2].children[4].querySelector('.value').textContent)
  }

  function updateRestTable(tradeNumber = 1) {
    tradeNumber++
    while (tradeNumber <= tradesTableBodyElement.children.length) {
      const tableRow = prepareTableRow(tradeNumber)
      tradesTableBodyElement.children[tradeNumber - 1].replaceWith(tableRow)
      tradeNumber++
    }
  }

  function onButtonClick(buttonType, buttonId = 'profit-1') {
    let tradeNumber = parseInt(buttonId.split('-')[1])
    try {
      if (buttonType === ResultStatuses.profit) {
        tradesResults[tradeNumber - 1] = ResultStatuses.profit
      } else {
        tradesResults[tradeNumber - 1] = ResultStatuses.loss
      }
      const tableRow = prepareTableRow(tradeNumber);
      tradesTableBodyElement.children[tradeNumber - 1].replaceWith(tableRow);
      if (tradesTableBodyElement.children.length === tradeNumber) {
        addTradeRow(tradeNumber + 1);
      } else {
        updateRestTable(tradeNumber)
      }
    } catch (error) {
      console.log(`error`, error)
    }
  }

  function riskPercentInputChangeHandler(inputId = 'riskPercent-1', inputValue) {
    let riskPercent = parseFloat(inputValue) || 0;
    if (riskPercent < 0) {
      riskPercent = 0;
      inputValue = 0
    }
    const tradeNumber = parseInt(inputId.split('-')[1]);
    const currentTableRow = tradesTableBodyElement.children[tradeNumber - 1];
    if (riskPercent === riskPercents[tradeNumber - 1]) {
      return;
    }
    riskPercents[tradeNumber - 1] = riskPercent;
    const newTableRow = prepareTableRow(tradeNumber);
    currentTableRow.replaceWith(newTableRow)
    const riskPercentInput = newTableRow.querySelector('.risk-percent-input')
    riskPercentInput.focus();
    riskPercentInput.value = ''
    riskPercentInput.value = inputValue
    if (tradesTableBodyElement.children.length > tradeNumber) {
      updateRestTable(tradeNumber)
    }
  }

  function rateOfReturnPercentInputChangeHandler(inputId = 'rateOfReturnPercent-1', inputValue) {
    let rateOfReturnPercent = parseFloat(inputValue) || 0;
    if (rateOfReturnPercent < 0) {
      rateOfReturnPercent = 0;
      inputValue = 0;
    }
    const tradeNumber = parseInt(inputId.split('-')[1]);
    const currentTableRow = tradesTableBodyElement.children[tradeNumber - 1];
    if (rateOfReturnPercent === rateOfReturnPercents[tradeNumber - 1]) {
      return;
    }
    rateOfReturnPercents[tradeNumber - 1] = rateOfReturnPercent;
    const newTableRow = prepareTableRow(tradeNumber);
    currentTableRow.replaceWith(newTableRow)
    const rateOfReturnPercentInput = newTableRow.querySelector('.rate-of-return-percent-input')
    rateOfReturnPercentInput.focus();
    rateOfReturnPercentInput.value = ''
    rateOfReturnPercentInput.value = inputValue
    if (tradesTableBodyElement.children.length > tradeNumber) {
      updateRestTable(tradeNumber)
    }
  }

  function addListenersToInputAndItsButtons(inputElement, listenerFunction) {
    inputElement.addEventListener('change', () => listenerFunction(inputElement.id, inputElement.value))
    inputElement.addEventListener('keyup', () => listenerFunction(inputElement.id, inputElement.value))
    const decrementButtons = inputElement.parentElement.querySelectorAll('.decrement');
    const incrementButtons = inputElement.parentElement.querySelectorAll('.increment');
    [...decrementButtons, ...incrementButtons].forEach(
      button => button.addEventListener('click', () => inputValueUpdateHandler(button.value, button))
    )
  }

  function setMaxLoss() {
    maxLossElement.textContent = maxLoss.toFixed(2);
    maxLossElement2.textContent = maxLoss.toFixed(2);
  }

  function prepareTableRow(tradeNumber = 1) {
    const prevTradeRow = tradesTableBodyElement.children[tradeNumber - 2];
    const isLossInPrevTrade = prevTradeRow && prevTradeRow.className.indexOf('trade-row-loss') > -1;
    if (isLossInPrevTrade) {
      const prevTradeAmount = parseFloat(prevTradeRow.children[1].querySelector('.value').textContent)
      if (!lossesMap[tradeNumber]) {
        lossesMap[tradeNumber] = prevTradeAmount;
      }
      const totalLoss = Object.values(lossesMap).reduce((acc, loss) => acc + loss, 0)
      if (totalLoss > maxLoss) {
        maxLoss = totalLoss;
        setMaxLoss()
      }
    } else {
      lossesMap = {}
    }
    const prevSuggestionTradeAmountIfLoss = prevTradeRow && parseFloat(prevTradeRow.children[7].querySelector('.value').textContent);
    const tableRow = document.createElement('tr');
    tableRow.classList.add('trade-row');
    let currentBalance = getCurrentBalance(tradeNumber);
    let riskPercent = parseFloat(riskPercents[tradeNumber - 1]);
    if (!riskPercent) {
      riskPercent = isLossInPrevTrade ? +(prevSuggestionTradeAmountIfLoss * 100 / currentBalance).toFixed(2) : 2;
    }
    riskPercents[tradeNumber - 1] = riskPercent
    let newBalance;
    const tradeAmount = currentBalance * riskPercent / 100;
    let rateOfReturnPercent = rateOfReturnPercents[tradeNumber - 1];
    if (!rateOfReturnPercent) {
      rateOfReturnPercent = rateOfReturnPercents[tradeNumber - 2] || 80;
    }
    rateOfReturnPercents[tradeNumber - 1] = rateOfReturnPercent
    const profitAmount = (tradeAmount * rateOfReturnPercent / 100) || 0
    const balanceAfterLoss = currentBalance - tradeAmount
    const balanceAfterProfit = currentBalance + profitAmount;
    let suggestionTradeAmountIfLoss = ((balanceAfterProfit - balanceAfterLoss) * 100 / rateOfReturnPercent).toFixed(2);
    if (tradesResults[tradeNumber - 1]) {
      if (tradesResults[tradeNumber - 1] === ResultStatuses.profit) {
        newBalance = currentBalance + profitAmount
        tableRow.classList.add('trade-row-profit');
      } else {
        newBalance = currentBalance - tradeAmount
        tableRow.classList.add('trade-row-loss');
      }
    }
    tableRow.innerHTML = `
      <td>
        <span class="mobile-text">(No.)</span>
        <span class="value">${tradeNumber}</span>
      </td>
      <td>
        <span class="mobile-text">(Trade)</span>
        <span class="value">${tradeAmount.toFixed(2)}</span>
      </td>
      <td>
        <span class="mobile-text">(Profit)</span>
        <span class="value">${profitAmount.toFixed(2)}</span>
        (<span class="balance-after-profit">${balanceAfterProfit.toFixed(2)}</span>)
      </td>
      <td>
        <span class="mobile-text">(Loss)</span>
        <span class="value">${tradeAmount.toFixed(2)}</span>
        (<span class="balance-after-loss">${balanceAfterLoss.toFixed(2)}</span>)
      </td>
      <td>
        <span class="mobile-text">(Balance)</span>
        <span class="value">
          ${tradesResults[tradeNumber - 1] ? newBalance.toFixed(2) : '-'} 
        </span>
      </td>
      <td>
        <span class="mobile-text">(Risk)</span>
        <div class="form-group">
          <div class="form-control">
            <button class="decrement increment-decrement-button-${tradeNumber}" value="-10">10</button>
            <button class="decrement increment-decrement-button-${tradeNumber}" value="-1">1</button>
            <button class="decrement increment-decrement-button-${tradeNumber}" value="-0.1">.1</button>
            <button class="decrement increment-decrement-button-${tradeNumber}" value="-0.01">.01</button>
            <input type="text" id="riskPercent-${tradeNumber}" class="risk-percent-input" value="${riskPercent}" />
            <button class="increment increment-decrement-button-${tradeNumber}" value="0.01">.01</button>
            <button class="increment increment-decrement-button-${tradeNumber}" value="0.1">.1</button>
            <button class="increment increment-decrement-button-${tradeNumber}" value="1">1</button>
            <button class="increment increment-decrement-button-${tradeNumber}" value="10">10</button>
          </div>
        </div>
      </td>
      <td>
        <span class="mobile-text">(Profit/Loss)</span>
        <button class='profit-button' id="profit-${tradeNumber}">Profit</button>
        <button class='loss-button' id="loss-${tradeNumber}">Loss</button>
      </td>
      <td>
        <span class="mobile-text">(Suggestion)</span>
        <span class="value">
          ${suggestionTradeAmountIfLoss ? `${suggestionTradeAmountIfLoss}` : '-'}
        </span>
      </td>
      <td>
        <div class="form-group">
          <span class="mobile-text">(Return)</span>
          <div class="form-control">
            <button class="decrement increment-decrement-button-${tradeNumber}" value="-10">10</button>
            <button class="decrement increment-decrement-button-${tradeNumber}" value="-1">1</button>
            <button class="decrement increment-decrement-button-${tradeNumber}" value="-0.1">.1</button>
            <button class="decrement increment-decrement-button-${tradeNumber}" value="-0.01">.01</button>
            <input type="text" id="rateOfReturnPercent-${tradeNumber}" class="rate-of-return-percent-input" value="${rateOfReturnPercent}" />
            <button class="increment increment-decrement-button-${tradeNumber}" value="0.01">.01</button>
            <button class="increment increment-decrement-button-${tradeNumber}" value="0.1">.1</button>
            <button class="increment increment-decrement-button-${tradeNumber}" value="1">1</button>
            <button class="increment increment-decrement-button-${tradeNumber}" value="10">10</button>
          </div>
        </div>
      </td>
    `
    const riskPercentInput = tableRow.querySelector(`#riskPercent-${tradeNumber}`);
    const rateOfReturnPercentInput = tableRow.querySelector(`#rateOfReturnPercent-${tradeNumber}`);
    addListenersToInputAndItsButtons(riskPercentInput, riskPercentInputChangeHandler)
    addListenersToInputAndItsButtons(rateOfReturnPercentInput, rateOfReturnPercentInputChangeHandler)
    const profitButton = tableRow.querySelector(`#profit-${tradeNumber}`)
    profitButton.addEventListener('click', () => onButtonClick(ResultStatuses.profit, profitButton.id))
    const lossButton = tableRow.querySelector(`#loss-${tradeNumber}`)
    lossButton.addEventListener('click', () => onButtonClick(ResultStatuses.loss, lossButton.id))
    return tableRow;
  }

  function addTradeRow(tradeNumber = 1) {
    try {
      const tableRow = prepareTableRow(tradeNumber);
      tradesTableBodyElement.append(tableRow);
      return true;
    } catch (error) {
      console.log(`error`, error)
    }
    return false
  }

  function initTable() {
    tradesTableBodyElement.innerHTML = ''
    initialAmountInput.value = localStorage.getItem(`${currentSession}_initialAmount`) || 10000
    const tradesResultsJSON = localStorage.getItem(`${currentSession}_tradesResults`)
    const riskPercentsJSON = localStorage.getItem(`${currentSession}_riskPercents`)
    const rateOfReturnPercentsJSON = localStorage.getItem(`${currentSession}_rateOfReturnPercents`)
    if (riskPercentsJSON) {
      riskPercents = JSON.parse(riskPercentsJSON)
    }
    if (tradesResultsJSON) {
      tradesResults = JSON.parse(tradesResultsJSON)
    }
    if (rateOfReturnPercentsJSON) {
      rateOfReturnPercents = JSON.parse(rateOfReturnPercentsJSON)
    }
    riskPercents.forEach((_, i) => {
      addTradeRow(i + 1);
    })
  }

  function onInputUpdate() {
    initTable();
  }

  function reset() {
    tradesResults = [];
    riskPercents = [2];
    localStorage.removeItem(`${currentSession}_initialAmount`)
    localStorage.removeItem(`${currentSession}_tradesResults`)
    localStorage.removeItem(`${currentSession}_riskPercents`)
    localStorage.removeItem(`${currentSession}_rateOfReturnPercents`)
    tradesTableBodyElement.children.length = 0;
    maxLoss = 0;
    setMaxLoss()
    initTable()
  }

  function saveHistory(params) {
    localStorage.setItem('sessions', JSON.stringify(sessions))
    localStorage.setItem('currentSession', currentSession)
    localStorage.setItem(`${currentSession}_initialAmount`, initialAmountInput.value)
    localStorage.setItem(`${currentSession}_tradesResults`, JSON.stringify(tradesResults))
    localStorage.setItem(`${currentSession}_riskPercents`, JSON.stringify(riskPercents))
    localStorage.setItem(`${currentSession}_rateOfReturnPercents`, JSON.stringify(rateOfReturnPercents))
  }

  setMaxLoss();
  initTable()

  initialAmountInput.addEventListener('keyup', onInputUpdate)

  function inputValueUpdateHandler(updateValueby = 0.01, buttonElement) {
    const inputElement = buttonElement.parentElement.querySelector('input');
    let newValue = +(parseFloat(inputElement.value) + parseFloat(updateValueby)).toFixed(2);
    if (newValue < 0) {
      newValue = 0;
    }
    inputElement.value = newValue;
    const classSplit = buttonElement.className.split('-')
    const tradeNumber = parseInt(classSplit[classSplit.length - 1])
    if (inputElement.className.indexOf('risk-percent') > -1) {
      riskPercents[tradeNumber - 1] = newValue
    } else {
      rateOfReturnPercents[tradeNumber - 1] = newValue
    }
    const tableRow = prepareTableRow(tradeNumber);
    tradesTableBodyElement.children[tradeNumber - 1].replaceWith(tableRow);
    if (tradesTableBodyElement.children.length > tradeNumber) {
      updateRestTable(tradeNumber)
    }
  }

  const saveHistoryButton = document.getElementById('saveHistoryButton')
  const resetButton = document.getElementById('resetButton')
  resetButton.addEventListener('click', reset)
  saveHistoryButton.addEventListener('click', saveHistory)
  
  const importButton = document.getElementById('import')
  const exportButton = document.getElementById('export')
  const dataInput = document.getElementById('data')

  importButton.addEventListener('click', handleImport)
  exportButton.addEventListener('click', handleExport)

  function handleImport() {
    if (dataInput.value) {
      try {
        const data = JSON.parse(dataInput.value)
        Object.keys(data).forEach(key => {
          localStorage.setItem(key, data[key])
        })
      } catch (error) {
        console.log(`error`, error)
      }
    }
  }
  function handleExport() {
    const localStorageJSON = JSON.stringify(localStorage)
    console.log(localStorageJSON)
    dataInput.value = localStorageJSON
  }

  window.onbeforeunload = () => {
    initialAmountInput.removeEventListener('keyup', onInputUpdate)
    addSessionButton.removeEventListener('click', addSession)
    sessionDropdown.removeEventListener('change', handleSessionChange)
    importButton.removeEventListener('click', handleExport)
    exportButton.removeEventListener('click', handleImport)
    const riskPercentInputs = document.querySelectorAll('.risk-percent-input');
    const rateOfReturnPercentInputs = document.querySelectorAll('.rate-of-return-percent-input');
    const profitButtons = document.querySelectorAll('.profit-button');
    const lossButtons = document.querySelectorAll('.loss-button');
    riskPercentInputs.forEach(
      input => {
        input.removeEventListener('keyup', () => riskPercentInputChangeHandler(input.id, input.value))
        input.removeEventListener('change', () => riskPercentInputChangeHandler(input.id, input.value))
      }
    )
    rateOfReturnPercentInputs.forEach(
      input => {
        input.removeEventListener('keyup', () => riskPercentInputChangeHandler(input.id, input.value))
        input.removeEventListener('change', () => riskPercentInputChangeHandler(input.id, input.value))
      }
    )
    profitButtons.forEach(
      button => button.removeEventListener('click', () => onButtonClick(ResultStatuses.profit, button.id))
    )
    lossButtons.forEach(
      button => button.removeEventListener('click', () => onButtonClick(ResultStatuses.loss, button.id))
    );
    [...decrementButtons, ...incrementButtons].forEach(
      button => button.removeEventListener('click', () => inputValueUpdateHandler(button.value, button))
    )
    const restDecrementButtons = document.querySelectorAll('.decrement');
    const restIncrementButtons = document.querySelectorAll('.increment');
    [...restDecrementButtons, ...restIncrementButtons].forEach(
      button => button.removeEventListener('click', () => inputValueUpdateHandler(button.value, button))
    )

    resetButton.removeEventListener('click', reset)
    saveHistoryButton.removeEventListener('click', saveHistory)
  }
}