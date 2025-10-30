let products_info = {}; // Define the global variable

// Function to fetch data
function fitch_values(URL) {
    return fetch(URL, {
        method: 'GET',
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Network response was not ok " + response.statusText);
        }
        return response.json(); // Parse the response as JSON
    })
    .then(data => {
        // console.log(data); // Log the data from the response
        products_info = data; // Store the data in the global products_info variable
        products_values(); // Call UI update function
    })
    .catch(error => {
        console.error("There was a problem with the fetch operation:", error);
    });
}

// Function to update the product values in the UI (no fetching here)
function products_values() {
    let total_amount = 0;
    let total_price = 0;

    for (let i = 0; i < Object.keys(products_info).length; i++) {
        let elementID = "product" + Object.keys(products_info)[i];
        let elementAmount = Object.values(products_info)[i][0];
        let elementPrice = Object.values(products_info)[i][1];

        // console.log("Element ID: " + elementID);
        // console.log("Element amount: " + elementAmount);
        // console.log("Element price: " + elementPrice);

        if (document.getElementById(elementID) != null) {
            document.getElementById(elementID).innerHTML = elementAmount;
        }
        total_amount += elementAmount;
        total_price += (elementAmount * elementPrice);
    }

    document.getElementById("count_total").innerHTML = total_amount;
    document.getElementById("bar-price-value").innerHTML = total_price;
}

// Function to increase quantity
function increase(target) {
    fetch(`http://192.168.1.6:5000/add_value/${target}`, {
        method: 'GET'
    })
    .then(response => response.json())
    .then(() => {
        products_info[target][0] += 1;
        products_values(); // Update the UI after increasing the value
    })
    .catch(error => console.error("Error increasing:", error));
}

// Function to decrease quantity, but don't allow negative values
function decrease(target) {
    if (products_info[target][0] > 0) {
        fetch(`http://192.168.1.6:5000/minus_value/${target}`, {
            method: 'GET'
        })
        .then(response => response.json())
        .then(() => {
            products_info[target][0] -= 1;
            products_values(); // Update the UI after decreasing the value
        })
        .catch(error => console.error("Error decreasing:", error));
    }
}

// Fetch data and update the UI when the page loads
fitch_values('http://192.168.1.6:5000/products');
