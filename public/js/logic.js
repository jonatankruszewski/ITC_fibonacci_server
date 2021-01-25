class CalculateFibonacci {
  constructor(
    button,
    input,
    cardBody,
    useServer,
    sortBy,
    spinner,
    serverCards
  ) {
    this.button = button;
    this.input = input;
    this.useServer = useServer;
    this.sortBy = sortBy;
    this.cardBody = cardBody;
    this.spinner = spinner;
    this.serverCards = serverCards;
    this.cardText = this.cardBody.firstElementChild.firstElementChild;
    this.fiboResponse;
    this.serverData;
    this.button.addEventListener("click", this.calculateNumber);
    this.input.addEventListener("change", this.checkString);
    this.input.addEventListener("keyup", this.checkString);
    this.sortBy.addEventListener(
      "change",
      function () {
        this.sortDB(), this.createList();
      }.bind(this)
    );
    this.showDBTable();
  }

  showDBTable = async () => {
    const {
      toggleVisible,
      sortDB,
      createList,
      fetchResults,
      serverCards,
    } = this;
    toggleVisible(serverCards.querySelector("#server-items"), false);
    toggleVisible(serverCards.querySelector("#spinner-2"), true);
    await fetchResults();
    sortDB();
    createList();
    toggleVisible(serverCards.querySelector("#spinner-2"), false);
    toggleVisible(serverCards.querySelector("#server-items"), true);
  };

  fetchResults = async () => {
    let url = `${window.location.origin}/getFibonacciResults`;
    try {
      let response = await fetch(url);
      this.serverData = await response.json();
    } catch (error) {
      this.serverData = error.message;
    }
  };

  sortDB = () => {
    const { sortBy, serverData, toggleVisible, spinner } = this;
    let shouldSortBy = sortBy.options[this.sortBy.selectedIndex].text;
    if (!serverData) {
      toggleVisible(spinner, false);
      return;
    }
    console.log(serverData)
    switch (shouldSortBy) {
      case "Asc date":
        serverData.sort((a, b) => {
          return a.createdDate - b.createdDate;
        });
        break;
      case "Desc date":
        serverData.sort((a, b) => {
          return b.createdDate - a.createdDate;
        });
        break;
      case "Higher Value":
        serverData.sort((a, b) => {
          return b.number - a.number;
        });
        break;
      case "Lower Value":
        serverData.sort((a, b) => {
          return a.number - b.number;
        });
        break;
    }
  };

  createList = () => {
    const { serverCards, serverData } = this;
    serverCards.querySelector("#server-items").innerHTML = "";
    if (serverData.length) {
      for (let number of serverData) {
        let date = new Date(number.createdDate).toISOString();
        let formated =
          date.split("T")[0] + " - " + date.split("T")[1].slice(0, 8);
        let newLi = document.createElement("li");
        newLi.className = "list-group-item";
        newLi.innerHTML = `${formated} The Fibonacci Number of <b>${number.number}</b> is <b>${number.result}</b>`;
        serverCards.querySelector("#server-items").append(newLi);
      }
    }
  };

  checkString = () => {
    this.input.value
      ? (this.button.disabled = false)
      : (this.button.disabled = true);
  };

  calculateNumber = async () => {
    const {
      cardBody,
      spinner,
      input,
      toggleVisible,
      shouldUseServer,
      checkInputLessThan50,
      callServer,
      showDBTable,
      uselocal,
      raiseMax50Error,
      checkCardBodyStatus,
      fillText,
    } = this;
    toggleVisible(cardBody, false);
    toggleVisible(spinner, true);
    if (checkInputLessThan50()) {
      if (shouldUseServer()) {
        await callServer(input.value);
        showDBTable();
      } else uselocal();
    } else raiseMax50Error();
    toggleVisible(spinner, false);
    fillText();
    checkCardBodyStatus();
  };

  fillText = () => {
    const { fiboResponse, cardText } = this;
    if (typeof fiboResponse === "string") cardText.innerHTML = fiboResponse;
    else if (fiboResponse.result) {
      cardText.innerHTML = `The Fibonacci number of <strong>${fiboResponse.number}</strong> is:
      <strong>${fiboResponse.result}</strong>`;
    } else cardText.innerHTML = "Please insert an integer number";
  };

  checkCardBodyStatus = () => {
    this.cardBody.classList.contains("d-none") &&
      this.cardBody.classList.remove("d-none");
  };

  checkInputLessThan50 = () => {
    return this.input.value <= 50;
  };

  raiseMax50Error = () => {
    this.fiboResponse = "Max allowed number is: 50";
  };

  toggleVisible = (element, bool) => {
    bool ? element.classList.remove("d-none") : element.classList.add("d-none");
  };

  shouldUseServer = () => {
    return this.useServer.checked;
  };

  uselocal = async () => {
    const { input, calculateFibonacci, fiboResponse } = this;
    if (input.value >= 0) {
      let results = calculateFibonacci(input.value);
      fiboResponse = {
        number: parseInt(input.value),
        result: results,
        createdDate: Date.now(),
      };
    } else fiboResponse = "Number must be equal or higher than 0";
  };

  calculateFibonacci(n, memo) {
    memo = memo || {};
    if (n in memo) return memo[n];
    if (n === 0) return 0;
    if (n <= 1) return 1;
    return (memo[n] = fibonacci(n - 1, memo) + fibonacci(n - 2, memo));
  }

  callServer = async (number) => {

    let url = `${window.location.origin}/fibonacci/${number}`;
    this.fiboResponse = await fetch(url)
      .then(async (response) => {
        if (response.ok) return response.json();
        else return response.text();
      })
      .catch((error) => {
        return "Server not in use";
      });
  };
}

window.onload = (() => {
  const button = document.getElementById("calculate-button");
  const input = document.getElementById("calculate-input");
  const cardBody = document.querySelector(".card-holder");
  const useServer = document.getElementById("use-server");
  const sortBy = document.getElementById("sort-by");
  const spinner = document.getElementById("spinner");
  const serverCards = document.getElementById("server-cards");
  new CalculateFibonacci(
    button,
    input,
    cardBody,
    useServer,
    sortBy,
    spinner,
    serverCards
  );
})();
