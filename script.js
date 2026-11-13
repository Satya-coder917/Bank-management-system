let accounts = JSON.parse(
  localStorage.getItem("accounts")
) || [
  {id: 1001, name: "Aarav Sharma", type: "Savings", balance: 42500},
  {id: 1002, name: "Priya Das", type: "Current", balance: 78200},
  {id: 1003, name: "Rahul Kumar", type: "Savings", balance: 18650}
];

let transactions = JSON.parse(
  localStorage.getItem("transactions")
) || [];

function saveData() {
  localStorage.setItem("accounts", JSON.stringify(accounts));
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

function money(amount) {
  return "₹" + amount.toLocaleString("en-IN");
}

function showPage(page) {
  document.querySelectorAll(".page").forEach(section => {
    section.classList.add("hidden");
  });

  document.getElementById(page).classList.remove("hidden");

  document.getElementById("pageTitle").textContent =
    page.charAt(0).toUpperCase() + page.slice(1);
}

function render() {
  document.getElementById("totalBalance").textContent =
    money(accounts.reduce((sum, a) => sum + a.balance, 0));

  document.getElementById("accountCount").textContent =
    accounts.length;

  document.getElementById("transactionCount").textContent =
    transactions.length;

  document.getElementById("accountSelect").innerHTML =
    accounts.map(a =>
      `<option value="${a.id}">${a.name} - ${a.id}</option>`
    ).join("");

  renderAccounts();
  renderTransactions();
  renderRecent();
}

function renderAccounts() {
  const search = (
    document.getElementById("accountSearch")?.value || ""
  ).toLowerCase();

  const filtered = accounts.filter(a =>
    a.name.toLowerCase().includes(search) ||
    String(a.id).includes(search)
  );

  document.getElementById("accountsTable").innerHTML =
    filtered.map(a => `
      <tr>
        <td>${escapeHTML(a.name)}</td>
        <td>${a.id}</td>
        <td>${a.type}</td>
        <td>${money(a.balance)}</td>
      </tr>
    `).join("");
}

function renderTransactions() {
  const search = (
    document.getElementById("transactionSearch")?.value || ""
  ).toLowerCase();

  const filtered = transactions.filter(t => {
    const account = accounts.find(a => a.id === t.accountId);
    return t.id.toLowerCase().includes(search) ||
      (account?.name || "").toLowerCase().includes(search);
  });

  document.getElementById("transactionsTable").innerHTML =
    filtered.map(t => {
      const account = accounts.find(a => a.id === t.accountId);

      return `
        <tr>
          <td>${t.id}</td>
          <td>${escapeHTML(account?.name || "Unknown")}</td>
          <td>${t.type}</td>
          <td>${money(t.amount)}</td>
          <td>${new Date(t.date).toLocaleString("en-IN")}</td>
        </tr>
      `;
    }).join("");
}

function renderRecent() {
  document.getElementById("recentTransactions").innerHTML =
    transactions.slice(0, 5).map(t => {
      const account = accounts.find(a => a.id === t.accountId);
      return `<p>${escapeHTML(account?.name || "Unknown")} -
        ${t.type} - ${money(t.amount)}</p>`;
    }).join("") || "<p>No transactions yet.</p>";
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

document.getElementById("transactionForm")
.addEventListener("submit", function(event) {
  event.preventDefault();

  const id = Number(
    document.getElementById("accountSelect").value
  );

  const account = accounts.find(a => a.id === id);
  const type = document.getElementById("transactionType").value;
  const amount = Number(document.getElementById("amount").value);

  const message = document.getElementById("formMessage");

  if (!account || !Number.isFinite(amount) || amount <= 0) {
    message.textContent = "Enter a valid amount.";
    return;
  }

  if (type === "withdraw" && amount > account.balance) {
    message.textContent = "Insufficient balance!";
    return;
  }

  account.balance += type === "deposit" ? amount : -amount;

  transactions.unshift({
    id: "TXN" + Date.now(),
    accountId: account.id,
    type: type,
    amount: amount,
    date: new Date().toISOString()
  });

  saveData();
  render();

  document.getElementById("amount").value = "";
  message.textContent = "Transaction successful!";
});

function addAccount() {
  const name = prompt("Enter customer name:");

  if (!name || !name.trim()) return;

  const id = Math.max(1000, ...accounts.map(a => a.id)) + 1;

  accounts.push({
    id: id,
    name: name.trim(),
    type: "Savings",
    balance: 1000
  });

  saveData();
  render();
  alert("Account created successfully!");
}

render();