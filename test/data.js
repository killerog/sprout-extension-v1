export const budgets = [
  {
    "id": "50d5e6de-5679-444d-beab-2675b65f385d",
    "name": "My budget",
    "last_modified_on": "2021-03-17T12:26:54+00:00",
    "first_month": "2020-03-01",
    "last_month": "2021-03-01",
    "date_format": {
      "format": "MM/DD/YYYY"
    },
    "currency_format": {
      "iso_code": "USD",
      "example_format": "123 456-78",
      "decimal_digits": 2,
      "decimal_separator": "-",
      "symbol_first": false,
      "group_separator": " ",
      "currency_symbol": "$",
      "display_symbol": false
    }
  },
  {
    "id": "7d5981e3-3b48-4623-9a6f-d73d7f0f563b",
    "name": "My other budget",
    "last_modified_on": "2021-03-26T01:53:21+00:00",
    "first_month": "2020-04-01",
    "last_month": "2021-04-01",
    "date_format": {
      "format": "MM/DD/YYYY"
    },
    "currency_format": {
      "iso_code": "CAD",
      "example_format": "123,456.78",
      "decimal_digits": 2,
      "decimal_separator": ".",
      "symbol_first": true,
      "group_separator": ",",
      "currency_symbol": "$",
      "display_symbol": true
    }
  }
];
export const categories = [
  {
    "id": "1b450bbb-22ef-4a85-ae2f-eb30f46a972d",
    "name": "Inflow",
    "hidden": false,
    "deleted": false,
    "categories": [
      {
        "id": "e22f541f-fb49-443e-8ecb-5c50dc7c885d",
        "category_group_id": "1b450bbb-22ef-4a85-ae2f-eb30f46a972d",
        "name": "Ready to Assign",
        "hidden": false,
        "original_category_group_id": null,
        "note": null,
        "budgeted": 0,
        "activity": 55320000,
        "balance": 55320000,
        "goal_type": null,
        "goal_creation_month": null,
        "goal_target": 0,
        "goal_target_month": null,
        "goal_percentage_complete": null,
        "goal_months_to_budget": null,
        "goal_under_funded": null,
        "goal_overall_funded": null,
        "goal_overall_left": null,
        "deleted": false
      }
    ]
  },
  {
    "id": "86786b4e-2642-4909-a574-7ff92364ae66",
    "name": "Immediate Obligations",
    "hidden": false,
    "deleted": false,
    "categories": [
      {
        "id": "bc13b98a-4ef8-4e68-8cf9-fb3890379c49",
        "category_group_id": "86786b4e-2642-4909-a574-7ff92364ae66",
        "name": "Rent/Mortgage",
        "hidden": false,
        "original_category_group_id": null,
        "note": null,
        "budgeted": 0,
        "activity": -125000,
        "balance": -125000,
        "goal_type": null,
        "goal_creation_month": null,
        "goal_target": 0,
        "goal_target_month": null,
        "goal_percentage_complete": null,
        "goal_months_to_budget": null,
        "goal_under_funded": null,
        "goal_overall_funded": null,
        "goal_overall_left": null,
        "deleted": false
      },
      {
        "id": "27292631-eaa9-43a8-a4a2-a5b9915e495c",
        "category_group_id": "86786b4e-2642-4909-a574-7ff92364ae66",
        "name": "Electric",
        "hidden": false,
        "original_category_group_id": null,
        "note": null,
        "budgeted": 0,
        "activity": 789000,
        "balance": 789000,
        "goal_type": null,
        "goal_creation_month": null,
        "goal_target": 0,
        "goal_target_month": null,
        "goal_percentage_complete": null,
        "goal_months_to_budget": null,
        "goal_under_funded": null,
        "goal_overall_funded": null,
        "goal_overall_left": null,
        "deleted": false
      },
    ]
  },
  {
    "id": "dad4031e-ffc7-4f25-857f-74b68f87ba68",
    "name": "Hidden Categories",
    "hidden": false,
    "deleted": false,
    "categories": []
  }
];
export const accounts = [
  {
    "id": "32d13aa5-b7f8-4af6-8945-15ff0c7d4572",
    "name": "Chequing",
    "type": "checking",
    "on_budget": true,
    "closed": false,
    "note": null,
    "balance": 11987520,
    "cleared_balance": 452496000,
    "uncleared_balance": -440508480,
    "transfer_payee_id": "ece36b2e-245f-488f-a65a-8f19e6fb4730",
    "direct_import_linked": false,
    "direct_import_in_error": false,
    "deleted": false
  },
  {
    "id": "8728041b-8c2a-4932-b92c-bdc033709018",
    "name": "Mortgage",
    "type": "otherLiability",
    "on_budget": false,
    "closed": false,
    "note": null,
    "balance": -100000000,
    "cleared_balance": -100000000,
    "uncleared_balance": 0,
    "transfer_payee_id": "631041ff-eae5-4b3f-bf54-e2955c7e63b0",
    "direct_import_linked": false,
    "direct_import_in_error": false,
    "deleted": false
  },
];
export const payees = [
  {
    "id": "b92936ab-7874-484c-b15f-52bc07d54f89",
    "name": "Starting Balance",
    "transfer_account_id": null,
    "deleted": false
  },
  {
    "id": "8f8a89a9-3a69-4517-996b-2d9671f308af",
    "name": "Manual Balance Adjustment",
    "transfer_account_id": null,
    "deleted": false
  },
  {
    "id": "3b479d1c-3fb4-48a0-bf2c-cca829e4fa99",
    "name": "Reconciliation Balance Adjustment",
    "transfer_account_id": null,
    "deleted": false
  },
  {
    "id": "ece36b2e-245f-488f-a65a-8f19e6fb4730",
    "name": "Transfer : Chequing",
    "transfer_account_id": "32d13aa5-b7f8-4af6-8945-15ff0c7d4572",
    "deleted": false
  },
  {
    "id": "631041ff-eae5-4b3f-bf54-e2955c7e63b0",
    "name": "Transfer : Mortgage",
    "transfer_account_id": "8728041b-8c2a-4932-b92c-bdc033709018",
    "deleted": false
  },
  {
    "id": "f5ed544e-9314-4ab8-944b-1e4074e56953",
    "name": "John Doe",
    "transfer_account_id": null,
    "deleted": false
  },
]

export function getSortedAccounts() {
  let budgetAccounts = {name: 'Budget Accounts', accounts: []};
  let trackingAccounts = {name: 'Tracking Accounts', accounts: []};
  let closedAccountsIds = [];
  for (let account of accounts) {
    if (!(account.closed || account.deleted)) {
      account.on_budget ? budgetAccounts.accounts.push(account) : trackingAccounts.accounts.push(account);
    } else {
      closedAccountsIds.push(account.id);
    }
  }
  return [budgetAccounts, trackingAccounts];
}

export function getSortedPayees() {
  const START = 'Starting Balance';
  const MANUAL = 'Manual Balance Adjustment';
  const RECONCILIATION = 'Reconciliation Balance Adjustment'
  let savedPayees = {name: 'Saved Payees', payees: []};
  let transferPayees = {name: 'Payments and Transfers', payees: []};
  for (let payee of payees) {
    let name = payee.name
    if (!(name === START || name === MANUAL || name === RECONCILIATION)) {
      savedPayees.payees.push(payee);
    }
  }
  savedPayees.payees = savedPayees.payees.sort((a, b) => {
    let payeeA = a.name.toUpperCase();
    let payeeB = b.name.toUpperCase();
    if (payeeA < payeeB) {
      return -1;
    }
    if (payeeA > payeeB) {
      return 1;
    }
    return 0;
  });
  transferPayees.payees = transferPayees.payees.sort((a, b) => {
    let payeeA = a.name.toUpperCase();
    let payeeB = b.name.toUpperCase();
    if (payeeA < payeeB) {
      return -1;
    }
    if (payeeA > payeeB) {
      return 1;
    }
    return 0;
  });
  return [savedPayees, transferPayees];
}

export function getSortedCategories() {
  let inflowFound = false;
  let index = 0;
  const INFLOW_NAME = 'Inflow';
  while (!inflowFound && index < categories.length) {
    if (categories[index].name === 'Internal Master Category') {
      categories[index].name = INFLOW_NAME
      let inflowIndex = 0;
      while (inflowIndex < categories[index].categories.length) {
        const inflowCategory = categories[index].categories
        if (inflowCategory[inflowIndex].name !== 'Inflows') {
          inflowCategory.splice(inflowIndex, 1);
        } else {
          inflowCategory[inflowIndex].name = 'Ready to Assign';
          inflowIndex++;
        }
      }
      inflowFound = true;
    } else {
      index++;
    }
  }
  let sortedCategories = categories.sort((a, b) => {
    let categoryGroupA = a.name.toUpperCase();
    let categoryGroupB = b.name.toUpperCase();
    const internal = INFLOW_NAME.toUpperCase();
    if (categoryGroupA === internal) {
      return -1;
    } else if (categoryGroupB === internal) {
      return 1;
    }
    return 0;
  });
  return sortedCategories;
}