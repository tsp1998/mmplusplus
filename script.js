window.onload = () => {
  const ResultStatuses = {
    profit: 'profit',
    loss: 'loss'
  }
  const initialAmountInput = document.querySelector('#initialAmount');
  const tradesTableBodyElement = document.querySelector('#trades-table-body');
  let totalTrades = 0;
  let tradesResults = [];
  let riskPercents = [2];
  rateOfReturnPercents = [80];

  function getCurrentBalance(tradeNumber) {
    return tradeNumber === 1 ?
      parseFloat(initialAmountInput.value) :
      parseFloat(tradesTableBodyElement.children[tradeNumber - 2].children[4].textContent)
  }

  function updateRestTable(tradeNumber = 1) {
    tradeNumber++
    while (tradeNumber <= totalTrades) {
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
    const riskPercent = parseFloat(inputValue) || 0;
    const tradeNumber = parseInt(inputId.split('-')[1]);
    riskPercents[tradeNumber - 1] = riskPercent;
    const tableRow = prepareTableRow(tradeNumber);
    tradesTableBodyElement.children[tradeNumber - 1].replaceWith(tableRow)
    const riskPercentInput = tableRow.querySelector('.risk-percent-input')
    riskPercentInput.focus();
    const val = riskPercentInput.value
    riskPercentInput.value = ''
    riskPercentInput.value = val
    updateRestTable(tradeNumber)
  }

  function rateOfReturnPercentInputChangeHandler(inputId = 'rateOfReturnPercent-1', inputValue) {
    const rateOfReturnPercent = parseFloat(inputValue) || 0;
    const tradeNumber = parseInt(inputId.split('-')[1]);
    rateOfReturnPercents[tradeNumber - 1] = rateOfReturnPercent;
    const tableRow = prepareTableRow(tradeNumber);
    tradesTableBodyElement.children[tradeNumber - 1].replaceWith(tableRow)
    const rateOfReturnPercentInput = tableRow.querySelector('.risk-percent-input')
    rateOfReturnPercentInput.focus();
    const val = rateOfReturnPercentInput.value
    rateOfReturnPercentInput.value = ''
    rateOfReturnPercentInput.value = val
    updateRestTable(tradeNumber)
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

  function prepareTableRow(tradeNumber = 1) {
    const prevTradeRow = tradesTableBodyElement.children[tradeNumber - 2];
    const isLossInPrevTrade = prevTradeRow && prevTradeRow.className.indexOf('trade-row-loss') > -1;
    const prevSuggestionTradeAmountIfLoss = prevTradeRow && parseFloat(prevTradeRow.children[8].textContent);
    const tableRow = document.createElement('tr');
    tableRow.classList.add('trade-row');
    let currentBalance = getCurrentBalance(tradeNumber);
    let riskPercent = parseFloat(riskPercents[tradeNumber - 1]);
    if (!riskPercent) {
      riskPercent = isLossInPrevTrade ? (prevSuggestionTradeAmountIfLoss * 100 / currentBalance).toFixed(2) : 2;
    }
    riskPercents[tradeNumber - 1] = riskPercent
    let newBalance;
    const tradeAmount = currentBalance * riskPercent / 100;
    let rateOfReturnPercent = rateOfReturnPercents[tradeNumber - 1];
    if (!rateOfReturnPercent) {
      if (isLossInPrevTrade) {
        const prevBalanceAfterProfit = parseFloat(prevTradeRow.querySelector('.balance-after-profit').textContent);
        const lossToRecover = prevBalanceAfterProfit - currentBalance;
        rateOfReturnPercent = (lossToRecover * 100 / tradeAmount).toFixed(2);
      } else {
        rateOfReturnPercent = rateOfReturnPercents[tradeNumber - 2] || 80;
      }
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
      <td>${tradeNumber}</td>
      <td>${tradeAmount.toFixed(2)}</td>
      <td>${profitAmount.toFixed(2)}(<span class="balance-after-profit">${balanceAfterProfit.toFixed(2)}</span>)</td>
      <td>${tradeAmount.toFixed(2)}(<span class="balance-after-profit">${balanceAfterLoss.toFixed(2)}</span>)</td>
      <td>${tradesResults[tradeNumber - 1] ? newBalance.toFixed(2) : '-'}</td>
      <td>
        <div class="form-group">
          <div class="form-control">
            <button class="decrement increment-decrement-button-${tradeNumber}" value="-1"><<<</button>
            <button class="decrement increment-decrement-button-${tradeNumber}" value="-0.1"><<</button>
            <button class="decrement increment-decrement-button-${tradeNumber}" value="-0.01"><</button>
            <input type="number" id="riskPercent-${tradeNumber}" class="risk-percent-input" value="${riskPercent}" />
            <button class="increment increment-decrement-button-${tradeNumber}" value="0.01">></button>
            <button class="increment increment-decrement-button-${tradeNumber}" value="0.1">>></button>
            <button class="increment increment-decrement-button-${tradeNumber}" value="1">>>></button>
          </div>
        </div>
      </td>
      <td><button class='profit-button' id="profit-${tradeNumber}">Profit</button></td>
      <td><button class='loss-button' id="loss-${tradeNumber}">Loss</button></td>
      <td>${suggestionTradeAmountIfLoss ? `${suggestionTradeAmountIfLoss}` : '-'}</td>
      <td>
        <div class="form-group">
          <div class="form-control">
            <button class="decrement increment-decrement-button-${tradeNumber}" value="-1"><<<</button>
            <button class="decrement increment-decrement-button-${tradeNumber}" value="-0.1"><<</button>
            <button class="decrement increment-decrement-button-${tradeNumber}" value="-0.01"><</button>
            <input type="number" id="rateOfReturnPercent-${tradeNumber}" class="rate-of-return-percent-input" value="${rateOfReturnPercent}" />
            <button class="increment increment-decrement-button-${tradeNumber}" value="0.01">></button>
            <button class="increment increment-decrement-button-${tradeNumber}" value="0.1">>></button>
            <button class="increment increment-decrement-button-${tradeNumber}" value="1">>>></button>
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
      totalTrades++;
      return true;
    } catch (error) {
      console.log(`error`, error)
    }
    return false
  }

  function initTable() {
    tradesTableBodyElement.innerHTML = ''
    const tradesResultsJSON = localStorage.getItem('tradesResults')
    const riskPercentsJSON = localStorage.getItem('riskPercents')
    const rateOfReturnPercentsJSON = localStorage.getItem('rateOfReturnPercents')
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
    localStorage.removeItem('tradesResults')
    localStorage.removeItem('riskPercents')
    localStorage.removeItem('rateOfReturnPercents')
    initTable()
  }

  function saveHistory(params) {
    localStorage.setItem('tradesResults', JSON.stringify(tradesResults))
    localStorage.setItem('riskPercents', JSON.stringify(riskPercents))
    localStorage.setItem('rateOfReturnPercents', JSON.stringify(rateOfReturnPercents))
  }

  initTable()

  initialAmountInput.addEventListener('keyup', onInputUpdate)

  function inputValueUpdateHandler(updateValueby = 0.01, buttonElement) {
    const inputElement = buttonElement.parentElement.querySelector('input');
    const newValue = +(parseFloat(inputElement.value) + parseFloat(updateValueby)).toFixed(2);
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
    updateRestTable(tradeNumber);
  }

  const saveHistoryButton = document.getElementById('saveHistoryButton')
  const resetButton = document.getElementById('resetButton')
  resetButton.addEventListener('click', reset)
  saveHistoryButton.addEventListener('click', saveHistory)


  window.onbeforeunload = () => {
    initialAmountInput.removeEventListener('keyup', onInputUpdate)
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