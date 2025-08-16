'use strict';

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Fix 1: Match the ID in your EJS file
  const classificationDropdown = document.getElementById("classificationDropdown");
  
  // Fix 2: Verify element exists
  if (!classificationDropdown) {
    console.error('Could not find classification dropdown element');
    return;
  }

  classificationDropdown.addEventListener("change", function() {
    const classification_id = this.value;
    console.log(`Selected classification_id: ${classification_id}`);
    
    if (!classification_id) {
      document.getElementById("inventoryDisplay").innerHTML = '';
      return;
    }

    fetch(`/inv/getInventory/${classification_id}`)
      .then(function(response) {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(function(data) {
        console.log('Received data:', data);
        buildInventoryList(data);
      })
      .catch(function(error) {
        console.error('Error:', error);
        document.getElementById("inventoryDisplay").innerHTML = 
          '<tbody><tr><td colspan="3">Error loading inventory</td></tr></tbody>';
      });
  });

  // Enhanced table builder function
  function buildInventoryList(data) {
    const inventoryDisplay = document.getElementById("inventoryDisplay");
    
    if (!data || data.length === 0) {
      inventoryDisplay.innerHTML = 
        '<tbody><tr><td colspan="3">No inventory found</td></tr></tbody>';
      return;
    }

    // Build complete table structure
    let html = `
      <thead class="thead-dark">
        <tr>
          <th>Make</th>
          <th>Model</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
    `;

    data.forEach(function(item) {
      html += `
        <tr>
          <td>${item.inv_make}</td>
          <td>${item.inv_model}</td>
          <td>
            <a href="/inv/edit/${item.inv_id}" class="btn btn-sm btn-warning">Modify</a>
            <a href="/inv/delete/${item.inv_id}" class="btn btn-sm btn-danger">Delete</a>
          </td>
        </tr>
      `;
    });

    html += '</tbody>';
    inventoryDisplay.innerHTML = html;
  }
});