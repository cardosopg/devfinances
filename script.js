const Modal = {
  open() {
    document
    .querySelector('.modal-overlay')
    .classList.add("active")
  },
  close() {
    document
    .querySelector('.modal-overlay')
    .classList.remove("active")
  }
}

const Storage = {
  get() {
    return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
  },
  set(transactions) {
    localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
  }
}

const Transactions = {
  all: Storage.get(),

  add(transaction) {
    Transactions.all.push(transaction)
    App.reload()
  },

  remove(index) {
    Transactions.all.splice(index, 1)
    App.reload()
  },

  incomes() {
    let income = 0;
    Transactions.all.forEach(transaction => {
      if(transaction.amount > 0) {
        income += transaction.amount
      }
    })
    return income
  },

  expenses(){
    let expense = 0;
    Transactions.all.forEach(transactions => {
      if(transactions.amount < 0) {
      expense += transactions.amount
      }
    })
    return expense
  },

  total() {
    return Transactions.incomes() + Transactions.expenses()
  },
} 

const DOM = {
  transanctionsContainer: document.querySelector("#data-table tbody"),

  addTransactionInTable(transaction, index) {
    const tr = document.createElement("tr")
    tr.innerHTML = DOM. innerHTMLTransaction(transaction, index)
    tr.dataset.index = index
    DOM.transanctionsContainer.appendChild(tr)    
  },

  innerHTMLTransaction(transaction, index) {
    const CSSclass = transaction.amount > 0 ? "income" : "expense"
    const amount = Utils.formatCurrency(transaction.amount)

    const html = `
      <td class="description">${transaction.description}</td>
      <td class=${CSSclass}>${amount}</td>
      <td class="date">${transaction.date}</td>
      <td>
        <img onclick="Transactions.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
      </td>
    `
    return html
  },

  updateFinancialBalance() {
    document.getElementById("incomeDisplay")
    .innerHTML = Utils.formatCurrency(Transactions.incomes())
    document.getElementById("expensesDisplay")
    .innerHTML = Utils.formatCurrency(Transactions.expenses())
    document.getElementById("totalDisplay")
    .innerHTML = Utils.formatCurrency(Transactions.total())
  },

  clearTransactionsInTable() {
    DOM.transanctionsContainer.innerHTML = ""
  }
}

const Utils = {
  formatAmount(value) {
    value = Number(value) * 100
    return value
  },

  formatDate(date) {
    const splittedDate = date.split("-")
    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
  },

  formatCurrency(value) {
    const signal = Number(value) < 0 ? "-" : ""
    value = String(value).replace(/\D/g,"")
    value = Number(value) / 100
    value = value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    }) 
    
    return signal + value
  } 
}

const Form = {
  description: document.querySelector("input#description"),
  amount: document.querySelector("input#amount"),
  date: document.querySelector("input#date"),

  getValues()  {
     return {
       description: Form.description.value,
       amount: Form.amount.value,
       date: Form.date.value
     }
  } ,

  validateFields() {
    const {description, amount, date} = Form.getValues()

    if( description.trim() === "" || 
        amount.trim() === "" || 
        date.trim() === "") {
      throw new Error("Por favor preencha todos os campos")
    }
  },

  formatValues() {
    let {description, amount, date} = Form.getValues()
    amount = Utils.formatAmount(amount)
    date  = Utils.formatDate(date)
    return {
       description,
       amount,
       date
    }
  },

  clearFields() {
    Form.description.value = ""
    Form.amount.value = ""
    Form.date.value = ""
  },

  submit(event) {
    event.preventDefault()
    try {
      Form.validateFields()
      const transaction = Form.formatValues()
      Transactions.add(transaction)
      Form.clearFields()
      Modal.close()
    } catch (error) {
      alert(error.message)
    }
  }
}

const App = {
  init(){
    Transactions.all.forEach(transaction => {
      DOM.addTransactionInTable(transaction)
    })
    DOM.updateFinancialBalance()
    Storage.set(Transactions.all)
  },

  reload(){
    DOM.clearTransactionsInTable()
    App.init()
  },
}

App.init()